# SQLガイド 編集ルール

## 1. SQLガイドの役割

`/sql/{slug}/`は、SQL構文を検索してきた人が、短い説明と複数のコード例で使い方を理解するためのページである。

内容の基準はPostgreSQL公式ドキュメントとする。公式ページの章立てや仕様を確認したうえで、初心者向けに次のように編集する。

- 公式ドキュメントの内容を、用途と判断基準が先に伝わる日本語へ簡略化する。
- 公式文の逐語訳や長い転載はせず、自分の言葉で要点をまとめる。
- 説明だけで終わらせず、各解説セクションに対応するSQLコード例を1つ以上置く。
- PostgreSQL固有の挙動は、一般的なSQLの仕様と区別して書く。
- ページ末尾から、参照したPostgreSQL公式ドキュメントへ直接リンクする。

網羅性よりも「この構文をいつ使い、どう書き、何に注意するか」が短時間で分かることを優先する。

## 2. ページ構成

ページは原則として次の順番にする。共通レイアウトは`src/pages/sql/[slug].astro`が生成する。

1. ページタイトルと要約
2. このページで分かること
3. 例で使う表とデータの説明
4. 基本構文
5. 用途別の解説・SQL・実行結果
6. 知っていると便利なTips
7. 本当に必要な場合だけ「よくある間違い」
8. ブラウザ内で解ける1問と本格演習への導線（演習がある構文のみ）
9. 関連構文
10. FAQ
11. PostgreSQL公式の参考文献
12. このページの役割

右サイドバーと書籍紹介は置かない。「このページの役割」は本文の最後に置く。

## 3. 本文とコード例の書き方

- 1セクションでは1つの論点だけを扱う。
- 本文は、結論、使う場面、注意点の順で書く。
- コード例は、その直前の説明を単独で確認できる最小限のSQLにする。
- 基本構文だけでなく、実際のテーブル名と列名を使った例を置く。
- 複数の機能を比較する章では、それぞれの違いがコードから分かるようにする。
- コードの整形は、句ごとの改行と2スペースのインデントを基本とする。
- 本文中のSQL用語は通常の文字で表示する。自動的な緑色の装飾は行わない。コード例はコードブロックで示す。
- 「よくある間違い」は件数合わせで作らない。実際に誤結果、構文エラー、NULLや重複の見落としにつながる項目だけを書く。該当項目がなければ空配列でよい。
- 各ガイドに、本文の流れを邪魔しないTipsを原則1件置く。必ず公式資料で確認し、本文と同じ説明を繰り返さない。

## 4. SEOと正確性

- 1ページ1構文を基本とする。検索意図が独立している構文は別ページにする。たとえば`ORDER BY`は`SELECT`内で詳説せず、専用ページを持つ。
- `title`は「SQLの○○とは？」「使い方」「違い」など、検索者の疑問に直接答える形にする。
- `description`には構文名、主な関連語、PostgreSQL、コード例で学べることを自然な文章で含める。
- `lead`は定義だけでなく、何ができる構文なのかを2〜3文で説明する。
- 見出しには、その節で答える検索語を自然に含める。キーワードの不自然な反復はしない。
- FAQは本文で扱った内容を補足し、実際に迷いやすい比較や制約へ答える。検索語を増やすためだけの質問は作らない。
- 仕様を断定する前にPostgreSQLのcurrent版公式ドキュメントで確認する。
- `references`はトップページではなく、根拠となる節へ直接リンクする。

参考文献は本文の根拠であり、リンクを置くだけでSEO効果が得られるものではない。公式情報に基づく正確な説明、具体的なコード例、適切な内部リンクをセットで用意する。

## 5. 新しいガイドを追加する

公開窓口は`src/data/sqlTopics.ts`の`sqlTopics`。SELECTは同ファイル、INNER JOIN・LEFT JOINは`src/data/joinSqlTopics.ts`、ORDER BY・WHERE・GROUP BY・HAVING・サブクエリ・ウィンドウ関数は`src/data/remainingSqlTopics.ts`で編集する。CASEは`src/data/caseSqlTopic.ts`、NULL・COALESCEは`src/data/coalesceSqlTopic.ts`で編集する。`src/data/advancedSqlTopics.ts`はGROUP BY以降の掲載順を定義する。WITHは`src/data/withSqlTopic.ts`、UNION・UNION ALLは`src/data/unionSqlTopic.ts`で編集する。日付で絞り込むガイドは`src/data/dateFilterSqlTopic.ts`で編集する。月別集計は`src/data/dateTruncSqlTopic.ts`で編集する。文字列操作は`src/data/stringFunctionsSqlTopic.ts`で編集する。EXISTS・NOT EXISTSは`src/data/existsSqlTopic.ts`で編集する。INTERSECT・EXCEPTは`src/data/intersectExceptSqlTopic.ts`で編集する。LIKEは`src/data/likeSqlTopic.ts`、INSERT・UPDATE・DELETEは`src/data/insertSqlTopic.ts`・`updateSqlTopic.ts`・`deleteSqlTopic.ts`で編集する。INSERT・UPDATE・DELETEの各節は、更新文の後に確認用SELECTを続けたコード例にし、ガイドのテストは節ごとにDBを元の状態へ戻して実行する。新規ガイドもこの配列へ取り込む。次の項目をすべて確認する。

```ts
type GuideTable = { headers: string[]; rows: string[][] };

type SqlTopic = {
  slug: string;              // URL: /sql/{slug}/
  label: string;             // 一覧や関連構文に表示する短い名前
  title: string;             // h1、title、TechArticle headline
  description: string;       // meta description、構造化データ
  lead: string;              // ページ冒頭の要約
  sampleIntro?: string;      // 元の表、列の意味、行順などの前提
  sampleTables?: (GuideTable & { caption: string })[]; // 基本構文より前に表示
  syntax: string;            // サンプルの表で実行できる最小の基本構文
  sections: {
    heading: string;         // 用途や違いが分かる見出し
    body: string;            // 公式仕様を簡略化した説明
    code: string;            // bodyと一対一になるコード例
    table?: GuideTable;      // 演算子一覧など、SQLより前に置く説明用の表
    resultTable?: GuideTable; // SQLの直後に表示する実行結果
  }[];
  mistakes: { title: string; body: string; code?: string }[]; // 実害のある間違いだけ
  notes: {
    title: string;
    body: string;
    code?: string;           // コードが理解を助ける場合だけ
  }[];
  faqs: {
    question: string;
    answer: string;
  }[];
  references: {
    label: string;           // 「PostgreSQL公式：○○」
    url: string;             // 根拠となる公式ページの直接URL
    description: string;     // 何を参照したか
  }[];
  related: string[];         // 既存sqlTopicsのslug
  practiceCategory?: string; // 対応演習が存在する場合だけ指定
};
```

SELECTを参考にした最小形は次のとおり。

```ts
{
  slug: 'example',
  label: 'EXAMPLE',
  title: 'SQLのEXAMPLEとは？基本構文と使い方を解説',
  description: 'SQLのEXAMPLEの使い方を、PostgreSQLのコード例で解説します。',
  lead: 'EXAMPLEが何をする構文で、どの場面で使うかを説明します。',
  syntax: 'SELECT ...;',
  sections: [
    {
      heading: 'EXAMPLEの基本的な使い方',
      body: '動作、使う場面、注意点を簡潔に説明します。',
      code: 'SELECT ...\nFROM ...;',
    },
  ],
  mistakes: [],
  notes: [
    {
      title: '知っていると便利な補足',
      body: '公式仕様で確認した、本文を補う短い説明を書きます。',
    },
  ],
  faqs: [
    {
      question: '実際に迷いやすい質問は？',
      answer: '本文と矛盾しない、直接的な回答を書きます。',
    },
  ],
  references: [
    {
      label: 'PostgreSQL公式：該当する章名',
      url: 'https://www.postgresql.org/docs/current/...',
      description: '参照した仕様',
    },
  ],
  related: ['select'],
  // 対応する演習カテゴリがある場合だけ指定する
  practiceCategory: 'example',
}
```

2026-11-13以降に追加する構文は、1構文1ファイルで置く。`src/data/topics/{slug}.ts`が`topic`（SqlTopic）と`fixture`（元の表を作るSQLと表示確認用のSELECT）を、`src/questions/topics/{slug}.ts`が`entries`（`buildExerciseEntries`の結果）をexportすれば、ガイド・演習・テストへ自動で登録される。掲載順とカテゴリ名は`src/lib/categories.ts`の`categoryLabels`・`practiceOrder`・`extraTopicSlugs`に追加し、`src/lib/types.ts`の`QuestionCategory`にもslugを足す。更新系の構文は`extraDmlSlugs`にも加える。

`sqlTopics`へ追加すると、詳細ページ、SQLガイド一覧、トップページ、サイトマップ、パンくず、TechArticle・FAQ構造化データへ自動的に反映される。

## 6. 追加時の確認手順

すべての入門ガイドで、基本 → 単独要素 → 比較・判断基準の順に本文を構成する。上級者向けの発展内容はTipsへ分け、本文の必修要素と混ぜない。各節には結果の具体的な読み方や、誤りによって何が変わるかも添える。タイトル・見出し・FAQは実際の疑問に答えるものであり、検索順位の上昇を保証するものではない。

SELECTは`src/data/selectSqlTopic.test.ts`、それ以外の全SQLガイドは`src/data/advancedSqlTopics.test.ts`でSQLをPGlite実行する。後者の元データは`src/data/__fixtures__/sqlGuideData.ts`に定義する。掲載する元の表とテスト用データを一致させ、結果の列名・列順・値・行数も確認する。

1. PostgreSQL公式ドキュメントの該当ページを読み、仕様と注意点を確認する。
2. SELECTのデータ構造を複製し、全フィールドを新しい構文向けに書き換える。
3. 各`sections.body`に対応する`sections.code`を用意する。
4. 公式仕様から、本文を補うTipsを選ぶ。
5. `related`に存在するslugだけを指定する。
6. 演習カテゴリと問題が存在するときだけ`practiceCategory`を指定する。
7. タイトル、description、見出し、FAQの内容が重複していないか確認する。
8. 参考リンクがPostgreSQL公式の該当箇所へ到達するか確認する。
9. `pnpm test`と`pnpm build`（型チェックを含む）を実行する。
10. 一覧、詳細、モバイル幅、コードの横スクロール、内部リンクを確認する。

公開前チェックリスト：

- [ ] 公式ドキュメントの説明と矛盾していない
- [ ] 初心者向けに簡略化され、逐語訳になっていない
- [ ] 各解説セクションにコード例がある
- [ ] コードだけを読んでも説明内容を確認できる
- [ ] 不要な「よくある間違い」を水増ししていない
- [ ] 本文と重複しないTipsがある
- [ ] 対応しない演習への導線を置いていない
- [ ] 関連構文への内部リンクがある
- [ ] 公式参考文献の直接リンクがある
- [ ] 型チェックと静的ビルドが成功する

## 7. 元の表と実行結果で理解できる入門にする

SELECT・INNER JOINで採用した次の方針を、新規作成と既存ガイドの改訂に適用する。構文の網羅よりも、読者が元のデータと結果の対応を自分で追えることを優先する。

- 基本構文の前に、3〜5行程度の小さな元テーブルを見せる。表名、列名、金額の単位、1行が何を表すかを説明する。
- 「元の表 → やりたいこと → SQL → 実行結果 → 何が変わったかの理解」の流れを作る。各節に1つのSQLと対応する結果表を置き、説明には具体的な名前・値・行数を使う。
- ページ内では同じ題材・データ・視点を使い続ける。説明していない列やテーブルへ途中で切り替えない。
- 1節で増やす知識は1つを基本にする。SELECTでは列の指定、複数列、全列、AS、計算、重複の確認、DISTINCTの順に進める。ASを学ぶ前に計算と別名を同時に出さない。
- 結合では、表名を省略せずにONの対応を理解してから別名を導入する。INNER JOINとLEFT JOINは別ページにし、自己結合や複雑な集計を基本の説明へ詰め込まない。
- 注意点は、結果を見て疑問が生まれる段階で説明する。未習のCTEやEXISTSなどを対策として先回りして並べない。発展的な仕様は別ガイドへ移すか、必要なものだけTips・FAQへ置く。
- 本文のSQL用語は通常の文字で表示する。キーワードを自動検出して緑色にする装飾は使わない。SQL全文はコードブロック、データは表で見せる。

実装には`sampleIntro`・`sampleTables`・`sections.resultTable`を使う。共通レイアウトは元の表を基本構文の前、結果表を各SQLの直後に表示する。元の表が1つでも複数でも、見出しは「例で使う表」とする。`table`は説明用、`resultTable`は実行結果用として使い分ける。

結果表は想像で埋めず、掲載SQLをPGliteで実行して確認する。列名・列順・値・行数を検証し、サンプルデータも表示した元の表と一致させる。ORDER BYなしの結果は行順が保証されないため、記事で「行の並びは一例」と説明し、テストでも順序を無視して重複件数を含めて比較する。順番そのものを教える例ではORDER BYを明示し、順序も検証する。

改訂時の確認項目：

- [ ] 元の表がSQLより先に見える
- [ ] 各SQLの直後に対応する結果がある
- [ ] 結果の値や行数を、元のデータから説明できる
- [ ] 別名・計算・例外を一度に導入していない
- [ ] ページの主題と独立した構文が混ざっていない
- [ ] SQL実行結果と掲載表の一致を確認した

### 既存ガイドへの適用例

SQL入門の全18記事に元の表と結果表を配置済み。PostgreSQL固有機能の`/postgresql/`は別のページ群で、この改訂の対象に含めない。

| 記事 | 使うデータと説明順 |
| --- | --- |
| SELECT | 社員3人。1列 → 複数列 → 全列 → 別名 → 計算 → 重複の確認 → DISTINCT |
| ORDER BY | 社員5人。昇順 → 降順 → 同額の順序 → NULLの位置 → 上位件数 |
| WHERE | 社員5人。等値 → 大小比較 → AND → OR → IN → 範囲 → 部分一致 → NULL判定 |
| GROUP BY | 社員5人。部署別人数 → 合計 → 平均 → 最小・最大 → NULLの件数 → 種類数 → 複数列 → 集計前の絞り込み |
| HAVING | 社員5人。絞る前の集計 → 人数条件 → 合計条件 → WHEREだけの結果 → HAVINGを追加 → 複数条件 |
| CASE | 社員5人。基本の分岐 → 複数WHENと判定順 → ELSE省略 → NULL判定 → 単純CASE → 数値の1・0 → 条件付き集計 |
| NULL・COALESCE | 名前と賞与の5人。NULL判定 → 入力済み → 空文字 → 既定値 → 複数候補 → AVGのNULL除外 → 平均前・平均後の補完 |
| INNER JOIN・LEFT JOIN | 顧客3件・注文3件。行の対応を先に理解し、内部結合と外部結合は別ページで学ぶ |
| サブクエリ | 顧客3件・注文3件。内側の平均 → 数値を直接使う条件 → SELECTで置き換え → IN → 集計表 → EXISTS → NOT EXISTS |
| WITH（CTE） | 社員5人。基本の命名 → 集計結果の絞り込み → 複数CTE → 前のCTEの参照 |
| UNION・UNION ALL | 午前・午後の測定各3件。全記録 → 重複除去 → 列の対応 → 全体の並べ替え |
| 日付で絞り込む | 注文6件。DATEの等値 → 日付の以降・以前 → 1日 → 1か月。月末の秒以下と翌月0時を比較 |
| 月別集計・DATE_TRUNC | 注文6件。月初への変換 → 月別件数 → 月別合計 → 期間指定と月順。年をまたぐ同月と注文なしの月も確認 |
| 文字列の連結・切り出し | 名前と商品コード5件。連結とNULL → SUBSTRING → TRIM → REPLACE。加工前後を並べる |
| EXISTS・NOT EXISTS | 顧客4件・注文6件。真偽値 → 相関条件 → 支払済み条件 → 不在。NOT INのNULLとJOINの行数も補足 |
| INTERSECT・EXCEPT | 店舗6件・通販5件。共通行 → 左だけの行 → 共通件数 → 残数。NULLの行と比較方向も確認 |
| ウィンドウ関数 | 担当者別の月間売上5行。全体合計 → 担当者別合計 → 連番 → 同順位 → 前の行 → 累計 → 移動平均 → 順位の絞り込み |

GROUP BYのROLLUPやFILTER、HAVINGのBOOL_ANDなど、基本の理解を妨げる発展要素は本文に詰め込まない。ウィンドウ関数では途中で社員給与へ題材を切り替えず、順位も累計も同じ売上データで示す。サブクエリとHAVINGでは、構文全体を一度に説明する前に、基準となる値や絞る前の集計を独立した節として確認する。

CASEは「CASE文」という検索語をタイトルに含め、SELECT内で値を返すCASE式であることを冒頭で説明する。35万円・40万円の境界値とNULLを含む5人で分岐を確認し、SUMの前に1・0を返す結果表を見せる。対応演習は`case-01`〜`case-09`。ガイド・演習一覧ではHAVINGの後に置き、条件付き集計に必要なGROUP BYを先に学べる順にする。

NULL・COALESCEはCASEの後に配置する。0・空文字・NULL、候補が両方NULLの行を含める。空文字のデータは空文字のまま保持し、`GuideTable`と演習の結果表示だけで「''（空文字）」と示す。NULLとの区別を表示上も保ち、期待結果や採点用の値を表示用文字列へ置き換えない。AVGは同じ5人の賞与で120万円と72万円を比較し、元データの補完と集計結果の補完を別の節で説明する。
