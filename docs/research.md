# 調査ノート

検索語と競合を調べた結果を置く場所。調べ方は `.claude/skills/pdca/deep-dive.md`、運用の状態は `docs/operations.md` にある。

月曜の「調査の回」で更新し、木曜の「実装の回」で「仕様」を上から実装する。

## 仕様（実装待ち）

2026-11-21 に作った仕様1〜5は、同じ日にすべて実装した（ユーザーの指示で前倒し）。今は空。次の調査の回で2件以上を作る。

次に仕様にする候補（上から）。

- `/sql/alter-table/`（新しいガイド）: 「サイト全体の品ぞろえの差」の続き。サジェストは「sql alter table」9語（カラム追加、add column、桁数変更、drop column、add constraint）。CREATE TABLE のガイドの FAQ で ALTER TABLE に触れており、リンク先が無い
- インデックスと EXPLAIN（新しいガイド）: サジェストは「インデックス」12語、「実行計画」7語。EXPLAIN は `/sql/union/` で初めて使った
- `/sql/insert/` の競合調査: 表示16、順位8.8。基礎の語で検索量が大きいはず
- COUNT、BETWEEN の専用ページ: `/sql/distinct/` の評価（2026-12-19）を見てから
- CASE の演習に AND・OR の問題を足す: `case` カテゴリは問題の ID が並び順で決まるため、途中に足すと章末問題の URL が変わる。足すなら採番の仕組みを先に直す

## 検索語の機会

Search Console の直近28日（2026-10-22〜11-18）のページ別と検索語別から。表示は 11/15 から1日50〜100に増えており（それまでは10前後）、多くのページは4日分の数字である。

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
