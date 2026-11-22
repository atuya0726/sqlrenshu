# 調査ノート

検索語と競合を調べた結果を置く場所。調べ方は `.claude/skills/pdca/deep-dive.md`、運用の状態は `docs/operations.md` にある。

月曜の「調査の回」で更新し、木曜の「実装の回」で「仕様」を上から実装する。

## 仕様（実装待ち）

2026-11-23 の調査の回で2件を作った。木曜（11/26）は仕様1を実装する。

### 仕様1: `/sql/alter-table/`（新しいガイド）と演習

- 優先度: 高
- 種類: 新しいガイド1本と、対応する問題（`/practice/alter-table/`、8問を目安）
- 対象の検索語: sql alter table、alter table カラム追加、alter table add column、postgresql alter table 型変更、alter table drop column、alter table not null（サジェストは「sql alter table」9語、「alter table」10語、「postgresql alter table」9語。Search Console にはまだ出ていない。自分にページが無いため）
- 根拠: 「サイト全体の品ぞろえの差」で9サイト中6サイトが DDL を持つ。`/sql/create-table/` の FAQ が ALTER TABLE に触れているが、リンク先が無い。11/23 に読んだ競合9本のうち、変更後の結果を本文で見せるのは1本（RJC）、既存行がどうなるかまで説明するのは3本、制約に反する既存データのエラー例は3本、PostgreSQL で列の位置を指定できないと明記するのは1本、その場で実行できる環境と練習問題は0本。PostgreSQL 専用の5本は古い（2016〜2023年）か浅い
- 足すもの（h2 の順）:
  - 例で使う表／ALTER TABLE の基本構文
  - ADD COLUMN で列を追加する（既存行は NULL になる。結果表を見せる）
  - DEFAULT を付けて列を追加する（既存行に既定値が入る）
  - NOT NULL の列を既存行のある表に足す（DEFAULT なしだとエラー、DEFAULT ありなら通る。`failing` でエラー例）
  - 列を足す位置は指定できない（常に末尾。MySQL の AFTER に当たるものは無い。サジェスト「add column 位置」）
  - DROP COLUMN で列を削除する（IF EXISTS、CASCADE は Tips）
  - ALTER COLUMN ... TYPE で型や桁数を変える（varchar の桁数変更、text から integer は USING が要る。USING なしのエラー例と、USING ありの成功例）
  - RENAME COLUMN と RENAME TO で名前を変える
  - SET NOT NULL、DROP NOT NULL（既存の NULL があると失敗するエラー例）、SET DEFAULT、DROP DEFAULT
  - ADD CONSTRAINT で制約を足す（UNIQUE、CHECK、外部キー、主キー。既存行が反するとエラーになる例）、DROP CONSTRAINT
  - 1つの ALTER TABLE に複数の変更をカンマで並べる
  - よくある間違い（MySQL の MODIFY、CHANGE、AFTER は PostgreSQL では使えない）／FAQ（Oracle、MySQL との違いを1件、ロックの注意を1件）
- 入れないもの: ロックの実測、NOT VALID、オンライン DDL（RJC が詳しく、ブラウザ内の実行環境では示せない。FAQ で触れるだけ）
- 確かめること: 公式の ALTER TABLE のページで確認済みの点（11/23、英語の current 版）: DEFAULT 付きの ADD COLUMN は表を書き換えない、USING は暗黙か代入のキャストが無いとき必須、SET NOT NULL は NULL があると使えない、ADD CONSTRAINT は既存行を検査する、DROP COLUMN の CASCADE、RENAME 以外は1文に並べられる、位置指定の構文は無い。公式に載っていないエラー文（NOT NULL 列の追加、制約違反、USING なしの型変更）は PGlite で実行して確かめ、テストで照合する。演習の採点は `/practice/create-table/` と同じく表の定義で行う
- 仕上げ: `/sql/create-table/` の FAQ と関連構文から `/sql/alter-table/` へリンクする。件数（ガイド、問題）をテストと `docs/architecture.md` で直す
- 評価: 実施の28日後に、インデックスされたか、表示回数、出る検索語を見る

### 仕様2: `/sql/insert/` に5節を足す

- 優先度: 中
- 種類: 既存ページの加筆。title と description は変えない
- 対象の検索語: sql insert文（表示5、順位9.6）、insert into values（4、8.0）、sql insert into values（1、10.0）、insert into 書き方（1、17.0）。ページ全体は表示20、順位9.0（10/24〜11/20）
- 根拠: 11/23 に読んだ競合9本のうち、列名省略の危険は4本、NULL は3本が明確に扱う。エラーを実際の文面で見せるのは3本、自動採番を詳しく扱うのは1本、引用符のエスケープは2本、日付の書き方は0本。自分のページは「よくある間違い」が文章だけで、エラーの実物が無い。サジェストに「sql insert文 null」「nullを入れる」「省略」「自動採番」がある。複数行、INSERT ... SELECT、RETURNING、DEFAULT は扱い済み
- 足すもの:
  - h2「列名のリストを省略する書き方と、その危険」: 全列を定義順に書けば通る例。値が足りないとき PostgreSQL がどう扱うかを実行で確かめて書く（競合の RJC の記述に食い違いがあるという報告があり、ここは正確に書けば差になる）
  - h2「NULL を入れる」: VALUES に NULL と書く形と、列を省略する形。NOT NULL の列に入れたときのエラー例
  - h2「連番の列（SERIAL、GENERATED ... AS IDENTITY）は省略して自動で振る」: 例で使う表に連番の列が無ければ、節の中で小さな表を作る。DEFAULT キーワードを書く形も
  - h2「文字列と日付の書き方」: 単引用符、文字列の中の単引用符は2つ重ねる、日付は 'YYYY-MM-DD'
  - 「よくある間違い」を `failing` のエラー例に置き換える: 主キーの重複、列数と値の数の不一致、型の不一致（文面は PGlite の実物）
  - FAQ 1件: 複数行の INSERT は1行でも失敗すると全行が入らない（本文にあるが FAQ に無ければ）
- 入れないもの: 速度の実測、COPY、他製品の UPSERT（ON CONFLICT は `/postgresql/on-conflict/` へのリンクで足りる）
- 確かめること: 公式の INSERT のページで、列リストを省略したときの値の対応（「先頭から N 列」）と DEFAULT VALUES、IDENTITY 列への明示的な値（OVERRIDING）を確かめる。PGlite で SERIAL と IDENTITY が動くこと
- 評価: 実施の28日後に、`/sql/insert/` の表示と「sql insert文」の順位、「null」「自動採番」「省略」を含む検索語が出るかを見る

次に仕様にする候補（上から）。

- インデックスと EXPLAIN（新しいガイド）: サジェストは「インデックス」12語、「実行計画」7語。EXPLAIN は `/sql/union/` で初めて使った
- ビュー（新しいガイド）: 競合9サイト中6サイトが持つ。サジェスト6語
- NULL と空文字: 「postgresql null 空文字」（表示4、順位11.2）が問題ページ coalesce-03 に出ている。`/sql/coalesce/` に「空文字はNULLではない」の節はあるが、サジェストの「判定」「変換」「置き換え」（NULLIF と COALESCE の組み合わせ）を扱っているかは未確認。`/sql/nullif/` と合わせて読む
- COUNT、BETWEEN の専用ページ: `/sql/distinct/` の評価（2026-12-19）を見てから
- CASE の演習に AND・OR の問題を足す: `case` カテゴリは問題の ID が並び順で決まるため、途中に足すと章末問題の URL が変わる。足すなら採番の仕組みを先に直す

## 検索語の機会

Search Console の直近28日（2026-10-22〜11-18）のページ別と検索語別から。11/23 に 10/24〜11/20 の数字で見直した行は「状態」に日付を入れた。表示は 11/15 から1日50〜100に増えており（それまでは10前後）、多くのページは4日分の数字である。

| テーマ | ページ | 28日の表示、順位 | 主な検索語（表示、順位） | 型 | 見立て | 状態 |
|---|---|---|---|---|---|---|
| CASE | `/sql/case/` | 133、8.9 | sql case文（15、10.3）、sql case 文（3、18.3）、sql case null（3、13.7）、oracle sql case（3、23.0） | 伸ばせる、派生の検索語 | 11/21 に競合調査し、複数条件、LIKE、入れ子、WHERE、ORDER BY、UPDATE の7節を足した | 評価待ち（12/19） |
| UNION ALL | `/sql/union/` | 53、9.9 | union all（19、8.0）、union union all 違い 系（各2、約10）、sql union all order by（2、10.0） | 伸ばせる、派生の検索語 | 11/21 に競合調査し、出所の列、GROUP BY、重複の件数、実行計画の4節とエラー例を足した | 評価待ち（12/19） |
| INNER JOIN | `/sql/inner-join/` | 53、6.8 | inner join（19、9.3） | 伸ばせる | 11/13 に LEFT JOIN との比較を足した。12/11 の評価まで触らない | 評価待ち |
| SELECT | `/sql/select/` | 35、6.8 | 検索語は匿名化されていて見えない | 伸ばせる | 前回は順位50より下で見送りにしたが、ページの平均順位は6.8に上がった。どの語で出ているかを次回確かめる | 未調査 |
| ON CONFLICT | `/postgresql/on-conflict/` | 28、6.0 | on conflict do nothing（4、7.2） | 伸ばせる | DO NOTHING、DO UPDATE、MERGE を扱い済み。内容の不足は見当たらない。順位の推移を見る | 様子見 |
| RETURNING | `/postgresql/returning/` | 28、7.1 | postgresql returning（4、7.5）、returning postgres（3、6.0）、postgresql update returning（2、8.0） | 伸ばせる | INSERT、UPDATE、DELETE の例を扱い済み。同上 | 様子見 |
| DISTINCT ON | `/postgresql/distinct-on/` | 20、8.1 | sql distinct on（2、9.5） | 伸ばせる | 表示は 11/15 以降に出た。競合調査の候補 | 未調査 |
| NOT EXISTS | `/sql/exists/` | 16、9.2 | not exists（6、9.8） | 伸ばせる | NOT EXISTS の節と NOT IN との違いは扱い済み。内容の不足は見当たらない | 様子見 |
| INSERT | `/sql/insert/` | 20、9.0 | sql insert文（5、9.6）、insert into values（4、8.0） | 伸ばせる、派生の検索語 | 11/23 に競合9本を読んだ。列名省略の危険、NULL、連番、リテラル、エラーの実物が無い | 仕様2（11/23） |
| LATERAL、FILTER | `/postgresql/lateral/`、`/postgresql/filter/` | 14、7.3／10、6.8 | postgresql join lateral（1、4.0）、sql count filter（1、9〜10） | 伸ばせる | PostgreSQL 固有機能は順位6〜8にそろっている | 未調査 |
| 文字列関数 | `/sql/string-functions/` | 11、14.2 | postgresql substring（1、89） | 意図に合っていない | 関数ごとのページを求められている可能性がある | 未調査 |
| NULL と空文字 | `/sql/coalesce/`（出ているのは問題 coalesce-03） | — | postgresql null 空文字（4、11.2） | 派生の検索語 | `/sql/coalesce/` に「空文字はNULLではない」の節がある（11/23 に見出しで確認）。判定、変換、置き換えまで扱うかは未確認 | 候補（11/23） |
| DELETE USING、IS DISTINCT FROM | `/sql/delete-using/`、`/sql/is-distinct-from/` | — | is distinct from（6、8.5）、sql delete using（2、3.5） | 伸ばせる | ガイドは両方ある（11/23 に確認）。検索に出ているのは一覧と問題ページで、ガイドはまだ出ていない。インデックス待ち | 様子見（11/23） |
| ウィンドウ関数 | `/sql/window-functions/` | 11、4.7 | 検索語は見えない | 伸ばせる | 前回の順位55〜65から上がった。表示が少ないので様子を見る | 様子見 |
| SQL の練習（サイト全体） | `/`、`/practice/` | 31、1.7／22、5.4 | 見えない（トップのクリック25は指名検索と思われるが未確認） | 受け皿が無い | サジェストに「sql 練習サイト」「sql 練習問題 初心者／上級」「sql 練習 ブラウザ」がある。`/practice/` が順位5.4で出始めた | 未調査 |

気づいたこと。

- クリック29のうち25はトップページ。ガイドは表示が付き始めた段階で、クリックはほぼ0。順位6〜10に固まっているので、1ページ目の上半分に上げることが当面の課題。
- 表示の件数が少なく（多くのページは4日分）、CTR の低さから title の良し悪しは判断できない。title と description は今回変えない。
- EXISTS、RETURNING、ON CONFLICT は、検索語に出ている論点をすでに扱っている。足すものが無いページは、インデックスが進むのを待つ。
- `http://` の URL が検索結果に約9件出ている。`http://sqlrenshu.com/` が 200 を返し、`https://` へ転送されていない（canonical は `https://`）。Cloudflare の設定変更をユーザーに依頼した。
- 直近7日の訪問は Bing 37、直接32、Google 10。Bing の検索語は見えていない。

- （11/23）表示は 11/16〜17 の1日約105を山に、11/18 が76、11/19 が54に下がった（11/20 の16は集計途中の可能性）。順位は8〜9で変わらない。新版のインデックス直後の一時的な山か、定着するかは次週に見る。
- （11/23）検索語は73行に増えた（11/13 は90日で約50行）。上位は union all（27、8.0）、inner join（23、9.5）、sql case文（20、10.2）、not exists（8、10.0）。どれも順位8〜10で、クリックは0。
- （11/23）直近7日でよく読まれたのは `/practice/`（111 PV、訪問42）と select、order-by、like、group-by の問題。訪問の入口は `/practice/` がトップページ（21）の2倍。

次の競合調査の候補（上から）: DISTINCT ON、SQL の練習（トップと `/practice/`）、インデックスと EXPLAIN。

## 競合

2026-11-21 に CASE と UNION の2テーマで、計18ページを読んだ。WebSearch は日本での Google の順位を返さないので、順位は記録していない。

| サイト | 種類 | 強いテーマ | 弱いところ | 最後に見た日 |
|---|---|---|---|---|
| RJC（r-jc.jp） | 企業ブログ | CASE、UNION の両方で最も深い。PostgreSQL と MySQL で実行した結果、エラー文、落とし穴、早見表、FAQ | 長い。実行環境と練習問題が無い。採用の案内が入る | 2026-11-21 |
| 覚え書き.com（write-remember.com） | 個人ブログ | CASE の複数条件、UNION の判断基準。Q&A 形式 | 表も実行結果も無い。Oracle 表記 | 2026-11-21 |
| 侍エンジニアブログ（sejuku.net） | スクールのメディア | CASE、UNION の入門。知名度がある | 浅い（NULL、集計が無い）。2024年から更新なし。誘導が多い | 2026-11-21 |
| CodingLS（codingls.com） | 個人ブログ | UNION の論点が広い（性能、NULL、JOIN、製品別の表） | 結果表がほぼ無い。記述に食い違いがある | 2026-11-21 |
| ぽこの日常（poko-everyday.com） | 個人ブログ | UNION の性能差を EXPLAIN で説明。更新が新しい | MySQL だけ。論点が狭い | 2026-11-21 |
| TECH PLAY、ENGINEER.CLUB、SE学院、ITSakura | メディア、個人サイト | CASE の入門。UPDATE、入れ子、LIKE を扱う | 結果表が無い、または例に誤りがある。古い | 2026-11-21 |

| アナリティクス沖縄、JavaDrive（PostgreSQL 講座）、Kemmy's Blog、smpl-rfrns、Qiita の2本 | 個人、企業ブログ | ALTER TABLE の構文の一覧 | 結果もエラー文もほぼ無い。誤りがある（smpl-rfrns は「PostgreSQL は型を変更できない」と書く）。2016〜2023年のものが多い | 2026-11-23 |
| SINT、@IT、sql-reference、Qiita のドリル | 企業ブログ、メディア | INSERT の入門。Qiita のドリルだけ練習10問つき | 基本形だけ、または古い（2010、2012年） | 2026-11-23 |

11/21 に読んだ18ページのどれにも、その場で実行できる環境と練習問題は無かった。11/23 に INSERT と ALTER TABLE で各9本を読んだ（RJC と CodingLS は両方で最も広い）。実行環境は0本、練習問題は Qiita のドリル1本だけ。読み取りは Sonnet に任せ、WebFetch の要約越しなので、見出しの階層と「載っていない」という判定には漏れがありうる。

### サイト全体の品ぞろえの差（2026-11-21）

目次か sitemap を読めた日本語の9サイト（javadrive の MySQL 講座、sql-reference.com、guru99 日本語版、ITSakura、Wikibooks、侍エンジニアブログ、SQL攻略、sql-learning.net、sql-quest.com）と比べた。目次の見出しの有無で数えており、各ページの深さは見ていない。WebSearch は日本語の結果が弱く、Progate、paiza、SQLab は取得できていない。

| テーマ | 持つ競合（9のうち） | サジェスト | 自分 | PGlite で動くか（11/21 に確認） | 扱い |
|---|---|---|---|---|---|
| CREATE TABLE、ALTER、DROP、制約 | 6 | create table 9、alter table 9、外部キー 12、制約 12 | 無い | 動く（制約違反のエラーも出る） | 2026-11-21 に `/sql/create-table/` と演習8問を公開。表示が出れば ALTER TABLE へ続ける |
| ビュー | 6 | 6 | 無い | 動く | 候補 |
| インデックス | 5 | 12 | 無い | 動く（EXPLAIN で Index Scan が出る） | 候補。EXPLAIN と組にする |
| 実行計画（EXPLAIN） | 1 | 7 | 無い | 動く（EXPLAIN ANALYZE も） | 候補。競合が少ない |
| 正規化、DB 設計、ER | 5 | 6（「練習問題」を含む） | 無い | — | 候補。実行環境が生きにくい |
| ストアド、トリガー | 5 | 各10 | 無い | PL/pgSQL の関数とトリガーは動く | 見送り寄り。検索する人の多くは Oracle や MySQL の構文を探していると見る（未確認） |
| DISTINCT の専用ページ | 5前後 | 11 | 節のみ | 動く | 2026-11-21 に `/sql/distinct/` と演習8問を公開 |
| COUNT など集計関数の専用ページ | 5前後 | 11 | 節のみ | 動く | 仕様5の結果を見て |
| BETWEEN、IN の専用ページ | 4前後 | between 10 | 節のみ | 動く | 同上 |
| 数値関数（ROUND など） | 5 | 未取得 | 専用ページ無し | 動く | 候補 |
| トランザクション | 3 | 3 | 無い | 動く（BEGIN、ROLLBACK、SAVEPOINT） | 候補 |
| データ型 | 1〜2 | 10 | cast のみ | 動く | 候補 |
| 権限（GRANT） | 3 | 2 | 無い | 動く（ロールを切り替えて拒否される） | 見送り。需要が小さい |
| 製品別の違い、環境構築 | 4、3 | 環境構築 8 | 無い | — | 見送り。強みが生きない |
| エラーメッセージの解説 | 0 | 11（他製品の語が混じる可能性） | 無い | 実際のエラー文を出せる | 候補。競合が無く、需要は未確認 |
| チートシート、用語集、資格、面接 | 各1〜2 | 0〜5 | 無い | — | 見送り |

自分のほうが広いところ: ウィンドウ関数の細目（LAG／LEAD、フレーム、NTILE）、ROLLUP、JSONB、配列、MERGE、generate_series、PERCENTILE_CONT、PostgreSQL 固有機能。問題数353は、見た練習サイトの中で上位（sql-quest.com は sitemap 上で数百、sql-learning.net は132問でうち無料27問）。

見立て: 競合に多くて自分に無いのは「表を作る側」（DDL、制約、インデックス、ビュー、トランザクション）と、基礎の語の専用ページ（DISTINCT、COUNT、BETWEEN）。今のサイトは「SELECT を書く側」に偏っている。DDL はブラウザで表を作って壊せるので、実行環境と相性が良い。

## テーマごとの差

競合調査をしたテーマごとに、論点の比較表を置く。実装して評価が済んだものは消す。

### CASE（2026-11-21、競合9本）

| 論点 | 競合 | 自分 |
|---|---|---|
| 単純 CASE、検索 CASE | 8本、9本 | あり |
| NULL の扱い | 7本 | あり（IS NULL、IS NOT NULL の節） |
| UPDATE での利用 | 6本 | 無い → 11/21 に追加 |
| 入れ子 | 6本 | 無い → 11/21 に追加 |
| ELSE を省いたとき | 5本 | あり |
| 評価順 | 5本 | あり |
| AND・OR の複数条件 | 4本 | 無い → 11/21 に追加 |
| WHERE の中 | 4本 | 無い → 11/21 に追加 |
| LIKE | 4本 | 無い → 11/21 に追加 |
| AS 別名 | 4本 | あり |
| ORDER BY の中 | 1本 | 無い → 11/21 に追加 |
| 条件付き集計（SUM と CASE） | 1本 | あり |
| その場で実行、練習問題 | 0本 | あり（問題9本） |

サジェスト: 「sql case文」複数条件、where句、elseなし、null、like、書き方。「sql case」when、複数条件、when 複数、入れ子、null、or、null判定。「sql case when」複数、複数 カラム、複数条件、入れ子、and、or。

### UNION（2026-11-21、競合9本）

| 論点 | 競合 | 自分 |
|---|---|---|
| UNION と UNION ALL の違い | 9本 | あり |
| 列数と型をそろえる | 8本 | あり |
| ORDER BY は最後に1つ | 8本 | あり |
| 性能差 | 7本 | 無い → 11/21 に追加 |
| LIMIT、括弧 | 4本、3本 | あり |
| ORDER BY の列名のエラー例 | 3本 | 無い → 11/21 に追加 |
| NULL の扱い | 3本 | 無い → 11/21 に追加 |
| WHERE、GROUP BY との組み合わせ | 3本 | ガイドに無い（問題 union-06 にはある）→ 11/21 に追加 |
| 列名は最初の SELECT で決まる | 3本 | あり（FAQ） |
| 出所を示す列 | 2本 | 無い → 11/21 に追加 |
| JOIN との違い | 2本 | あり（FAQ） |
| INTERSECT、EXCEPT | 2本 | 関連リンクのみ |
| その場で実行、練習問題 | 0本 | あり（問題6本） |

サジェスト: 「union all」union 違い、とは、使い方、order by、order by 結合後、重複、group by、遅い。「union union all 違い」パフォーマンス、速度、製品名（sqlserver、oracle、postgresql、mysql、access）。

### INSERT（2026-11-23、競合9本）

| 論点 | 競合 | 自分 |
|---|---|---|
| 基本構文（列名あり） | 9本 | あり |
| 複数行の VALUES | 5本 | あり |
| INSERT ... SELECT | 4本 | あり |
| 列名の省略とその危険 | 4本（書き方だけは別に2本） | 無い → 仕様2 |
| NULL を入れる | 3本（部分的に5本） | 列の省略で NULL になる説明だけ → 仕様2 |
| DEFAULT | 3本 | あり |
| エラーの実物 | 3本 | 文章だけ → 仕様2 |
| 製品ごとの違い | 3本 | 無い（入れない） |
| 重複時の処理 | 2本 | あり（ON CONFLICT、別ガイドへリンク） |
| RETURNING | 2本 | あり |
| 性能、バルク、COPY | 2本 | 無い（入れない） |
| 引用符のエスケープ | 2本 | 無い → 仕様2 |
| 自動採番 | 1本（一言は3本） | 無い → 仕様2 |
| 日付の書き方 | 0本 | 無い → 仕様2 |
| その場で実行、練習問題 | 0本、1本 | あり |

サジェスト: 「sql insert」複数、select、書き方、複数行、into values、update、nullを入れる。「sql insert文」複数、書き方、select、null、省略、自動採番。「insert into」select、values、複数行、構文、意味。

### ALTER TABLE（2026-11-23、競合9本）

| 論点 | 競合 | 自分 |
|---|---|---|
| 列の追加、列の削除 | 9本、9本 | ページが無い → 仕様1 |
| 型や桁数の変更 | 8本（エラー文まで3本） | 同上 |
| 列名の変更、表名の変更 | 7本、7本 | 同上 |
| DEFAULT の設定と削除 | 7本 | 同上 |
| NOT NULL の追加と削除 | 5本 | 同上 |
| 追加位置の指定 | 5本（PostgreSQL では不可と明記は1本） | 同上 |
| 変更後の定義の確認 | 5本（結果を本文で見せるのは1本） | 同上 |
| 制約の追加と削除 | 4本（主キーは2本） | 同上 |
| 製品ごとの構文の違い | 4本 | 同上（FAQ で触れる） |
| DEFAULT や NOT NULL 付きの追加と既存行 | 3本 | 同上 |
| 既存データが制約に反するエラー例 | 3本 | 同上 |
| ロック、本番での注意 | 3本 | 入れない（FAQ のみ） |
| 複数の変更を1文で | 2本 | 仕様1 |
| その場で実行、練習問題 | 0本 | 仕様1 |

サジェスト: 「sql alter table」とは、カラム追加、add column、桁数変更、alter column、add constraint、drop column、primary key。「postgresql alter table」add column、型変更、add column 複数、drop column、not null、add column 位置。
