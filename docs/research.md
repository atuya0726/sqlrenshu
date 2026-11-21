# 調査ノート

検索語と競合を調べた結果を置く場所。調べ方は `.claude/skills/pdca/deep-dive.md`、運用の状態は `docs/operations.md` にある。

月曜の「調査の回」で更新し、木曜の「実装の回」で「仕様」を上から実装する。

## 仕様（実装待ち）

2026-11-21 の調査で作成。競合ページの論点は、サブエージェントが WebFetch（要約つきの取得）で読んだ結果に基づく。原文との照合はしていないので、実装のときに「競合に無い」と本文で言い切らない。

### 1. `/sql/case/` に「複数条件（AND・OR）」「LIKE」「入れ子」を足す

- 優先度: 高
- 種類: 既存ページの加筆
- 対象の検索語: sql case文（表示15、順位10.3）、sql case 文（3、18.3）、sql case null（3、13.7）。ページ全体は直近28日で表示133、順位8.9、クリック0（サイト内で表示が最多）
- 根拠: サジェスト（sql case文、sql case、sql case when の計28語）のうち、「複数条件」「複数」「複数 カラム」「and」「or」が7語、「入れ子」が2語、「like」が1語。競合9本のうち AND・OR は4本、入れ子は6本、LIKE は4本が扱う。自分のページは description に「複数条件」と書いているが、本文に AND・OR の例が無い
- 足すもの（サンプル表は今の employees をそのまま使う。足りない列があれば表を変えずに書ける例にする）:
  - h2「ANDとORで複数の条件を組み合わせる」: WHEN の中に AND を書く例と OR を書く例を1つずつ。2つの列を見る例（サジェストの「複数カラム」）を含める。AND と OR を混ぜるときの括弧に1文触れる
  - h2「LIKEで文字列の一部が一致する行を分ける」: 検索 CASE の WHEN に LIKE を書く例を1つ。単純 CASE では LIKE を書けないことを1文
  - h2「CASEを入れ子にする」: 入れ子の例を1つ。同じ結果を AND で平らに書いた形を並べ、どちらが読みやすいかを示す
  - FAQ に「CASE WHEN で複数条件を書くには」を1件
- 問題: `case` カテゴリに AND・OR を使う問題が無ければ1問足す（件数が変わるので、テストと `docs/architecture.md` も直す）。今の9問の内容は `src/questions/case.ts` で確かめる
- 確かめること: 検索 CASE の評価順と、条件が真になった時点で残りを評価しないことを、PostgreSQL 公式ドキュメントの条件式の章で確かめる
- 評価: 実施の28日後に、`/sql/case/` の表示回数と順位、「sql case文」の順位を見る。新しく「複数条件」を含む検索語が出るかも見る

### 2. `/sql/union/` に「UNION が遅い理由」「結合後の GROUP BY」「途中に ORDER BY を書いたとき」を足す

- 優先度: 高
- 種類: 既存ページの加筆
- 対象の検索語: union all（表示19、順位8.0）、union union all 違い 系（各2、順位約10）、sql union all order by（2、10.0）、sql union all とは（2、9.0）。ページ全体は直近28日で表示53、順位9.9、クリック0（表示は全部 11/15〜11/18 の4日間）
- 根拠: 競合9本のうち7本が性能差を扱い、自分には無い。サジェストに「union all 遅い」「union union all 違い パフォーマンス」「union all union 違い 速度」「union all group by」「union all order by 結合後」「union all 重複」がある。NULL の扱いは3本、出所の列は2本
- 足すもの:
  - h2「UNIONはなぜUNION ALLより遅くなりうるか」: UNION は重複を除くために全行を比べる処理が入ること。重複が無いと分かっているなら UNION ALL を選ぶ、という判断基準。`EXPLAIN` の出力を載せるなら PGlite で実際に実行したものだけにする。「何倍速い」という数字は書かない
  - h2「つないだ結果をGROUP BYで集計する」: UNION ALL をサブクエリか WITH で包み、外側で GROUP BY する例を1つ。まとめ問題（union-06）へのリンク
  - h2「重複した行を数える」: UNION ALL の結果を GROUP BY して COUNT(*) が2以上の行を出す例（検索語「union all 重複」）
  - 今の「最後のORDER BYで結果全体を並べ替える」の節に、途中の SELECT に ORDER BY を書いたときのエラーと、2つ目の SELECT の列名で並べ替えようとしたときのエラーを、実際のエラー文つきで足す
  - 今の「UNIONは行全体が同じ重複を除く」の節に、NULL どうしは重複として1行にまとまることを、例つきで足す
  - 補足「どちらの表から来た行かを残す」: 定数の列を足す例を1つ
- 確かめること: 集合演算での NULL の重複判定と ORDER BY の制約を、PostgreSQL 公式ドキュメントの「問い合わせの結合（UNION、INTERSECT、EXCEPT）」と SELECT のリファレンスで確かめる。エラー文は PGlite で実行して写す
- 評価: 実施の28日後に、`/sql/union/` の表示回数と順位、「union all」の順位を見る

### 3. `/sql/case/` に「WHERE と ORDER BY の中で使う」「UPDATE で使う」を足す

- 優先度: 中（仕様1の評価を待たずに実装してよいが、同じ回には出さない。効果を分けて見るため、仕様1の2週間以上あとにする）
- 種類: 既存ページの加筆
- 対象の検索語: 仕様1と同じ。サジェストに「sql case文 where句」
- 根拠: 競合9本のうち UPDATE は6本、WHERE は4本、ORDER BY は1本が扱う。自分のページには3つとも無い
- 足すもの:
  - h2「WHEREの中でCASEを使う」: 例を1つ。多くの場合は AND・OR で書けることも示す
  - h2「ORDER BYの中でCASEを使い、決めた順に並べる」: 例を1つ。章末問題（case-08）へのリンク
  - h2「UPDATEでCASEを使い、行ごとに違う値へ更新する」: 例を1つ。`/sql/update/` へのリンク。WHERE を付けないと全行が対象になることを書く
- 確かめること: UPDATE の例は、実行のたびに表が元に戻る形で動くかを、ガイドの実行の仕組みで確かめる
- 評価: 実施の28日後に、`/sql/case/` の表示回数と順位を見る

### 4. 新しいガイド `/sql/create-table/`（CREATE TABLE と制約）

- 優先度: 高（「競合にあって自分に無いテーマ」の1本目。仕様1の次に実装する）
- 種類: 新しいガイド。問題は採点の方法を確かめてから決める
- 対象の検索語: Search Console には出ていない（受け皿が無いため）。サジェストは「sql create table」9語（書き方、if not exists、primary key、default、データ型、unique、select）、「外部キー」12語、「制約」12語
- 根拠: 目次を読めた競合9サイトのうち6サイトが CREATE TABLE、ALTER、DROP のページを持つ。自分のサイトでは、CREATE TABLE は演習データの準備に出るだけで、教えるページが無い。PGlite で CREATE TABLE、主キー、UNIQUE、NOT NULL、DEFAULT、CHECK、外部キーとその違反エラーが動くことは 2026-11-21 に確かめた
- 足すもの（見出しの案）:
  - h2「CREATE TABLEで表を作る」: 列名と型だけの最小の例。作った表に INSERT して SELECT する
  - h2「主キー（PRIMARY KEY）を付ける」: 重複を入れたときのエラーを実際に出す
  - h2「NOT NULL・UNIQUE・DEFAULT・CHECK」: それぞれ違反したときのエラー文つき
  - h2「外部キー（REFERENCES）で表をつなぐ」: 親に無い値を入れたときのエラー
  - h2「IF NOT EXISTSで、すでにある表を作ろうとしない」
  - h2「CREATE TABLE AS SELECTで結果から表を作る」
  - よくある間違い、FAQ（主キーと UNIQUE の違い、型の選び方は `/sql/cast/` へ）
- 確かめること: 構文と制約の説明は PostgreSQL 公式ドキュメントの CREATE TABLE と「制約」の章。ガイドの実行欄で DDL を流したあと、表が元に戻るか（`src/lib/pglite.ts` はスキーマを作り直している）。問題にする場合、DDL の答えをどう採点するか（結果の表ではなく、`information_schema` か、後続の INSERT の成否で比べる形が要る）。採点の仕組みに手を入れる必要があれば、最初はガイドだけ出す
- 件数: ガイドが増えるので、テストと `docs/architecture.md` の件数、sitemap、ガイド一覧を直す
- 評価: 実施の28日後に、`/sql/create-table/` がインデックスされたか、表示回数、出た検索語を見る。表示が出れば、ALTER TABLE、インデックスと EXPLAIN、ビュー、トランザクションへ続ける

### 5. 新しいガイド `/sql/distinct/`（DISTINCT の専用ページ）

- 優先度: 中
- 種類: 新しいガイド（今は他のガイドの節としてだけ扱っている）
- 対象の検索語: サジェスト「sql distinct」11語（使い方、とは、複数カラム、count）
- 根拠: 競合9サイトのうち5サイト前後が DISTINCT の専用ページを持つ。自分は専用ページが無く、検索語に合う title のページが無い。`/postgresql/distinct-on/` は表示20、順位8.1で出始めており、相互にリンクできる
- 足すもの（見出しの案）: DISTINCT で重複を除く／複数の列に付けたとき（組み合わせで判定）／COUNT(DISTINCT 列)／DISTINCT と GROUP BY の違い／NULL は1つにまとまる／DISTINCT ON との違い（`/postgresql/distinct-on/` へ）
- 問題: 既存の問題で DISTINCT を使うものを探してリンクする。足りなければ2〜3問足す
- 確かめること: 既存のガイドのどこに DISTINCT の節があるかを調べ、内容が重ならないようにして、節から新しいページへリンクする
- 評価: 実施の28日後に、表示回数と出た検索語を見る。効けば、同じ型で COUNT、BETWEEN の専用ページを作る

## 検索語の機会

Search Console の直近28日（2026-10-22〜11-18）のページ別と検索語別から。表示は 11/15 から1日50〜100に増えており（それまでは10前後）、多くのページは4日分の数字である。

| テーマ | ページ | 28日の表示、順位 | 主な検索語（表示、順位） | 型 | 見立て | 状態 |
|---|---|---|---|---|---|---|
| CASE | `/sql/case/` | 133、8.9 | sql case文（15、10.3）、sql case 文（3、18.3）、sql case null（3、13.7）、oracle sql case（3、23.0） | 伸ばせる、派生の検索語 | 11/21 に競合調査。複数条件、入れ子、LIKE、WHERE、UPDATE が無い | 仕様1、3 |
| UNION ALL | `/sql/union/` | 53、9.9 | union all（19、8.0）、union union all 違い 系（各2、約10）、sql union all order by（2、10.0） | 伸ばせる、派生の検索語 | 11/21 に競合調査。性能差、GROUP BY、エラー例が無い | 仕様2 |
| INNER JOIN | `/sql/inner-join/` | 53、6.8 | inner join（19、9.3） | 伸ばせる | 11/13 に LEFT JOIN との比較を足した。12/11 の評価まで触らない | 評価待ち |
| SELECT | `/sql/select/` | 35、6.8 | 検索語は匿名化されていて見えない | 伸ばせる | 前回は順位50より下で見送りにしたが、ページの平均順位は6.8に上がった。どの語で出ているかを次回確かめる | 未調査 |
| ON CONFLICT | `/postgresql/on-conflict/` | 28、6.0 | on conflict do nothing（4、7.2） | 伸ばせる | DO NOTHING、DO UPDATE、MERGE を扱い済み。内容の不足は見当たらない。順位の推移を見る | 様子見 |
| RETURNING | `/postgresql/returning/` | 28、7.1 | postgresql returning（4、7.5）、returning postgres（3、6.0）、postgresql update returning（2、8.0） | 伸ばせる | INSERT、UPDATE、DELETE の例を扱い済み。同上 | 様子見 |
| DISTINCT ON | `/postgresql/distinct-on/` | 20、8.1 | sql distinct on（2、9.5） | 伸ばせる | 表示は 11/15 以降に出た。競合調査の候補 | 未調査 |
| NOT EXISTS | `/sql/exists/` | 16、9.2 | not exists（6、9.8） | 伸ばせる | NOT EXISTS の節と NOT IN との違いは扱い済み。内容の不足は見当たらない | 様子見 |
| INSERT | `/sql/insert/` | 16、8.8 | sql insert文（4、10.0）、insert into values（3、7.3） | 伸ばせる | 基礎の語で検索量が大きいはず。次の競合調査の候補 | 未調査 |
| LATERAL、FILTER | `/postgresql/lateral/`、`/postgresql/filter/` | 14、7.3／10、6.8 | postgresql join lateral（1、4.0）、sql count filter（1、9〜10） | 伸ばせる | PostgreSQL 固有機能は順位6〜8にそろっている | 未調査 |
| 文字列関数 | `/sql/string-functions/` | 11、14.2 | postgresql substring（1、89） | 意図に合っていない | 関数ごとのページを求められている可能性がある | 未調査 |
| NULL と空文字 | 該当ページは未確認 | — | postgresql null 空文字（2、12.5） | 受け皿が無い（未確認） | `/sql/coalesce/` か NULL のガイドに節があるかを確かめる | 未調査 |
| DELETE USING、IS DISTINCT FROM | 問題ページのみ（ガイドの有無は未確認） | — | delete using 系（各1、6〜11）、is distinct from（1、9） | 受け皿が無い（未確認） | 問題ページが検索に出ている。ガイドがあるかを確かめる | 未調査 |
| ウィンドウ関数 | `/sql/window-functions/` | 11、4.7 | 検索語は見えない | 伸ばせる | 前回の順位55〜65から上がった。表示が少ないので様子を見る | 様子見 |
| SQL の練習（サイト全体） | `/`、`/practice/` | 31、1.7／22、5.4 | 見えない（トップのクリック25は指名検索と思われるが未確認） | 受け皿が無い | サジェストに「sql 練習サイト」「sql 練習問題 初心者／上級」「sql 練習 ブラウザ」がある。`/practice/` が順位5.4で出始めた | 未調査 |

気づいたこと。

- クリック29のうち25はトップページ。ガイドは表示が付き始めた段階で、クリックはほぼ0。順位6〜10に固まっているので、1ページ目の上半分に上げることが当面の課題。
- 表示の件数が少なく（多くのページは4日分）、CTR の低さから title の良し悪しは判断できない。title と description は今回変えない。
- EXISTS、RETURNING、ON CONFLICT は、検索語に出ている論点をすでに扱っている。足すものが無いページは、インデックスが進むのを待つ。
- `http://` の URL が検索結果に約9件出ている。`http://sqlrenshu.com/` が 200 を返し、`https://` へ転送されていない（canonical は `https://`）。Cloudflare の設定変更をユーザーに依頼した。
- 直近7日の訪問は Bing 37、直接32、Google 10。Bing の検索語は見えていない。

次の競合調査の候補（上から）: INSERT、DISTINCT ON、SQL の練習（トップと `/practice/`）。

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

読んだ18ページのどれにも、その場で実行できる環境と練習問題は無かった。

### サイト全体の品ぞろえの差（2026-11-21）

目次か sitemap を読めた日本語の9サイト（javadrive の MySQL 講座、sql-reference.com、guru99 日本語版、ITSakura、Wikibooks、侍エンジニアブログ、SQL攻略、sql-learning.net、sql-quest.com）と比べた。目次の見出しの有無で数えており、各ページの深さは見ていない。WebSearch は日本語の結果が弱く、Progate、paiza、SQLab は取得できていない。

| テーマ | 持つ競合（9のうち） | サジェスト | 自分 | PGlite で動くか（11/21 に確認） | 扱い |
|---|---|---|---|---|---|
| CREATE TABLE、ALTER、DROP、制約 | 6 | create table 9、alter table 9、外部キー 12、制約 12 | 無い | 動く（制約違反のエラーも出る） | 仕様4。続けて ALTER TABLE |
| ビュー | 6 | 6 | 無い | 動く | 候補 |
| インデックス | 5 | 12 | 無い | 動く（EXPLAIN で Index Scan が出る） | 候補。EXPLAIN と組にする |
| 実行計画（EXPLAIN） | 1 | 7 | 無い | 動く（EXPLAIN ANALYZE も） | 候補。競合が少ない |
| 正規化、DB 設計、ER | 5 | 6（「練習問題」を含む） | 無い | — | 候補。実行環境が生きにくい |
| ストアド、トリガー | 5 | 各10 | 無い | PL/pgSQL の関数とトリガーは動く | 見送り寄り。検索する人の多くは Oracle や MySQL の構文を探していると見る（未確認） |
| DISTINCT の専用ページ | 5前後 | 11 | 節のみ | 動く | 仕様5 |
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
| UPDATE での利用 | 6本 | 無い → 仕様3 |
| 入れ子 | 6本 | 無い → 仕様1 |
| ELSE を省いたとき | 5本 | あり |
| 評価順 | 5本 | あり |
| AND・OR の複数条件 | 4本 | 無い → 仕様1 |
| WHERE の中 | 4本 | 無い → 仕様3 |
| LIKE | 4本 | 無い → 仕様1 |
| AS 別名 | 4本 | あり |
| ORDER BY の中 | 1本 | 無い → 仕様3 |
| 条件付き集計（SUM と CASE） | 1本 | あり |
| その場で実行、練習問題 | 0本 | あり（問題9本） |

サジェスト: 「sql case文」複数条件、where句、elseなし、null、like、書き方。「sql case」when、複数条件、when 複数、入れ子、null、or、null判定。「sql case when」複数、複数 カラム、複数条件、入れ子、and、or。

### UNION（2026-11-21、競合9本）

| 論点 | 競合 | 自分 |
|---|---|---|
| UNION と UNION ALL の違い | 9本 | あり |
| 列数と型をそろえる | 8本 | あり |
| ORDER BY は最後に1つ | 8本 | あり |
| 性能差 | 7本 | 無い → 仕様2 |
| LIMIT、括弧 | 4本、3本 | あり |
| ORDER BY の列名のエラー例 | 3本 | 無い → 仕様2 |
| NULL の扱い | 3本 | 無い → 仕様2 |
| WHERE、GROUP BY との組み合わせ | 3本 | ガイドに無い（問題 union-06 にはある）→ 仕様2 |
| 列名は最初の SELECT で決まる | 3本 | あり（FAQ） |
| 出所を示す列 | 2本 | 無い → 仕様2 |
| JOIN との違い | 2本 | あり（FAQ） |
| INTERSECT、EXCEPT | 2本 | 関連リンクのみ |
| その場で実行、練習問題 | 0本 | あり（問題6本） |

サジェスト: 「union all」union 違い、とは、使い方、order by、order by 結合後、重複、group by、遅い。「union union all 違い」パフォーマンス、速度、製品名（sqlserver、oracle、postgresql、mysql、access）。
