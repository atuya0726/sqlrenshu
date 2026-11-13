# SQL練習 初期設計

## 1. 全体アーキテクチャ

Astroの静的HTMLをCloudflare Workers Static Assetsから配信し、SQL実行だけをブラウザ側へ分離する。

```text
Astro SSG (build time)
  ├─ SQL解説HTML / JSON-LD / 内部リンク
  ├─ 演習一覧・問題HTML
  └─ 問題データをページ単位でJSへ埋め込む
             │
Cloudflare Workers Static Assets（API Workerなし）
             │
Browser
  ├─ CodeMirror 6
  ├─ Grid.js（テーブルスキーマ表示）
  ├─ Web Worker上のPGlite（問題ごとのin-memory DB）
  ├─ 実行結果ベースのgrader
  └─ localStorage（この端末の進捗・下書きだけ）
```

サーバーに認証・API・DBを置かない。PGliteのWASM処理はWeb Workerへ隔離し、UIスレッドをSQL実行で塞がない。初期段階ではDB自体を永続化せず、ページを離れた後に残るのはlocalStorageの問題IDとSQLだけとする。

ページの責務は次のように分ける。

- `/sql/{syntax}/`: 検索流入と理解。PostgreSQL公式資料を簡略化した解説、節ごとのコード例、対応カテゴリがある場合はその場で動く1エディタと本格演習リンク。
- `/practice/{category}/`: 問題選択。長文SEO解説を置かない。
- `/practice/{category}/{id}/`: SQLを書くプロダクト本体。
- `/postgresql/{feature}/`: PostgreSQL固有構文。一般SQLと分類を混ぜない。

## 2. ディレクトリ構成

```text
src/
  components/                 # Astro UI。エディタ、出典、広告、書籍、進捗
  questions/
    catalog.ts                # 全問題の公開窓口、初歩20問（追加構文は questions/topics/ から自動登録）
    advanced.ts               # GROUP BY以降の要素別・復習47問とCASEの取り込み
    case.ts                   # CASEの基礎・要素・章末・まとめ9問
    coalesce.ts               # NULL・COALESCEの10問
    with.ts                   # WITH（CTE）の6問
    union.ts                  # UNION・UNION ALLの6問
    dateFilter.ts             # 日付で絞り込む6問
    dateTrunc.ts              # 月別集計・DATE_TRUNCの6問
    stringFunctions.ts        # 文字列の連結・切り出し6問
    exists.ts                 # EXISTS・NOT EXISTSの6問
    intersectExcept.ts        # INTERSECT・EXCEPTの6問
    like.ts                   # LIKE（あいまい検索）の6問
    insert.ts                 # INSERT（table-state採点）の6問
    update.ts                 # UPDATE（table-state採点）の6問
    delete.ts                 # DELETE（table-state採点）の6問
    exerciseEntries.ts        # like・insert・update・deleteが共有するエントリ生成
  data/
    sqlTopics.ts              # 解説ページの静的コンテンツ・SEO情報
    advancedSqlTopics.ts      # GROUP BY以降のガイド掲載順
    caseSqlTopic.ts           # CASEの元の表・SQL・結果表
    coalesceSqlTopic.ts       # NULL・COALESCEの元の表・SQL・結果表
    withSqlTopic.ts           # WITH（CTE）の元の表・SQL・結果表
    unionSqlTopic.ts          # UNION・UNION ALLの元の表・SQL・結果表
    dateFilterSqlTopic.ts     # 日付で絞り込む元の表・SQL・結果表
    dateTruncSqlTopic.ts      # 月別集計・DATE_TRUNCの元の表・SQL・結果表
    stringFunctionsSqlTopic.ts # 文字列操作の元の表・SQL・結果表
    existsSqlTopic.ts         # EXISTS・NOT EXISTSの元の表・SQL・結果表
    intersectExceptSqlTopic.ts # INTERSECT・EXCEPTの元の表・SQL・結果表
    likeSqlTopic.ts           # LIKEの元の表・SQL・結果表
    insertSqlTopic.ts         # INSERTの元の表・SQL・結果表
    updateSqlTopic.ts         # UPDATEの元の表・SQL・結果表
    deleteSqlTopic.ts         # DELETEの元の表・SQL・結果表
  layouts/
    BaseLayout.astro          # canonical / OGP / JSON-LD
  lib/
    types.ts                  # 言語共通coreと翻訳可能copy
    pglite.ts                 # 問題DB lifecycle
    grader.ts                 # 結果・将来の状態採点
    progress.ts               # localStorage唯一の窓口
    affiliateOffers.ts        # 商品情報の一元管理
  pages/
    sql/[slug].astro
    practice/[category].astro
    practice/[category]/[id].astro
    postgresql/[slug].astro
  workers/pglite.worker.ts
docs/
  architecture.md
```

ガイドと演習の公開窓口はそれぞれ`sqlTopics.ts`と`catalog.ts`に保ち、GROUP BY以降のコンテンツは別ファイルから取り込む。CMSや独自ローダーは導入しない。演習一覧の件数とmeta descriptionの合計はカタログから算出する。

## 3. 主要な型

`QuestionCore`は言語共通で、`QuestionTranslation`は翻訳対象である。ビルド時にロケールを解決し、UIが使う`Question`へ平坦化する。

```ts
type QuestionCore = {
  id: string;
  slug: string;
  category: QuestionCategory;
  level: 1 | 2 | 3 | 4 | 5;
  setupSql: string;
  starterSql?: string;
  expectedResult: { columns: string[]; rows: Record<string, unknown>[] };
  grading: Grading;
  tags: string[];
  compatibility: SqlCompatibility;
  source: QuestionSource;
};

type QuestionTranslation = {
  title: string;
  description: string;
  requirements?: string[];
  hints: string[];
  explanation: string;
  solutionSql: string;
};
```

`setupSql`、期待結果、採点、互換性、出典は翻訳に重複させない。英語展開時は`translations.en`を増やし、`/en/`用ページ生成に渡す。

## 4. PGlite初期化方針

- 問題画面に入ったときにWeb Workerと`memory://` PGliteを作る。
- `DROP SCHEMA public CASCADE; CREATE SCHEMA public;`の後に`setupSql`を実行する。
- ユーザーSQLの実行直前にも必ず同じリセットを行う。連続試行やDMLの副作用を持ち越さない。
- 「DBをリセット」でも同じ処理を呼ぶ。
- ページ離脱時にPGlite接続を閉じる。
- IndexedDB / OPFSは使わない。PGlite DBは一時データ、SQL下書きはlocalStorageという境界を維持する。

MVPでは1問題画面に1エディタ・1 Worker。複数ミニ問題の同時表示でWASMインスタンスを増やさない。

## 5. SQL採点ロジック

1. 初期DBへ戻す。
2. ユーザーSQLをPGliteで実行する。
3. `mode: result`は最終結果セット、`mode: table-state`はユーザーSQLの実行後に`stateQuery`（例：`SELECT * FROM products ORDER BY id`）を実行した結果を採点対象にする。`SqlPlayground.astro`は同じ結果を実行結果欄に「更新後：N行」として表示し、`catalog.test.ts`も同じ手順で全模範解答と誤答を検証する。
4. 列、行数、各値を比較する。
5. 設定に応じて行順・列順を無視し、数値許容誤差を適用する。
6. `acceptableResults`のいずれかに一致すれば正解とする。

文字列として返るPostgreSQLの`numeric`や`bigint`と期待値のnumberは、比較時だけ正規化する。表示値やDB値は変更しない。順序が問題の要件なら`compareRowOrder: true`にし、ORDER BYを書かない偶然の並びを正解にしない。

SQL文字列解析による構文強制はMVPではしない。同じ結果を返す妥当な別解を受け入れる。特定構文の利用を学習上必須にしたい場合は、将来`constraints`を別軸で追加し、結果採点と混ぜない。

## 6. AstroでのSEOページ生成

`sqlTopics`を`getStaticPaths()`に渡し、1構文1静的ページを生成する。`BaseLayout`へページ別title、description、canonical、OGP、ArticleとBreadcrumbListのJSON-LDを渡す。

解説ページは基本構文、具体例、節ごとのコード例、必要な場合だけ間違い、関連構文、FAQ、公式参考文献を持つ。本格演習と同じ文章を複製せず、演習側は問題文と作業UIに絞る。詳細な編集ルールと追加手順は`docs/sql-guide.md`を参照する。canonicalの本番originは公開ドメイン確定時に`astro.config.mjs`の`site`を変更する。

## 7. 演習ページ

カテゴリ一覧 → 問題一覧 → 個別問題の3層。個別画面は、PCでは左にコンパクトなCodeMirrorと実行結果、右にテーブルスキーマを並べ、ヒント・解説・次問題をその下へ置く。スマートフォンでは縦に積む。スキーマはPGliteの`information_schema`から取得し、Grid.jsで全テーブル・全列を常時表示するため、問題データと表示内容がずれない。サンプル行は表示せず、SQLを書く領域を主役にする。

URLクエリで問題を切り替えず、`/{id}/`をSSGする。これによりリロード、履歴、静的配信が単純になる。個別問題は当初`noindex,follow`としていたが、検索の入口を増やすため2026-11-13にインデックス対象へ変更し、sitemapにも含めた。同名の問題があるため、titleはカテゴリ名と問題番号を含めて一意にする（表示名は`src/lib/categories.ts`で一元管理）。

出題順・難易度構成・タイトルの付け方の編集ルールは`docs/practice-guide.md`を参照する。

## 8. localStorage

キーは`sqlrenshu:progress:v1`の1個に限定する。

```ts
type ProgressState = {
  version: 1;
  solvedIds: string[];
  lastSqlByQuestion: Record<string, string>;
  lastQuestionId?: string;
  theme?: 'light' | 'dark' | 'system';
};
```

CodeMirrorの変更は500ms debounceで保存する。メール、氏名、IPなどの個人情報は保存しない。UI文言は常に「この端末での進捗」とし、同期を期待させない。スキーマ変更時はversionを上げ、明示的な移行関数を追加する。

## 9. Cloudflare Workers Static Assets

Astroは`output: static`、Cloudflare adapterなし。`pnpm build`の`dist/`を`wrangler.jsonc`のassets.directoryへ指定し、Worker entrypointやbindingsは置かない。D1、KV、R2は使わない。

```jsonc
{
  "name": "sqlrenshu",
  "compatibility_date": "2026-09-04",
  "assets": {
    "directory": "./dist",
    "not_found_handling": "404-page"
  }
}
```

デプロイは`pnpm deploy`。本番前にWorker名、`site`、robots.txtのoriginを実ドメインへ置換する。ハッシュ付き`/_astro/*`は`_headers`でimmutable cacheにする。

## 10. MVP実装順序

1. 型、共通fixture、PGlite Worker、DBリセット。
2. CodeMirror、実行結果表、PostgreSQLエラー、キーボード実行。
3. grader単体テスト、結果順序あり・なし、numeric正規化。
4. SELECT・ORDER BY各5問で問題追加フローを確定。
5. 全29通常問題。
6. 7つの解説SSGとカテゴリ・個別演習導線。
7. localStorage進捗、下書き、トップの即時演習。
9. AdSlot、BookRecommendation、BookListと商品一元管理。
10. モバイル、アクセシビリティ、全静的ルート、Cloudflare previewを確認して公開。

初期実装は上記1〜9の薄い縦切りを含む。現在は全353問の模範解答をPGliteで検証する（INSERT・UPDATE・DELETEは実行後の`stateQuery`の結果で採点）。GROUP BY以降のガイドも基本構文・本文・Tips・間違いの各SQLを実行検証する。実ブラウザでの編集・採点操作のE2Eと正式ドメイン設定は公開前の確認事項である。
