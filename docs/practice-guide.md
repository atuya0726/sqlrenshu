# 演習問題（catalog.ts）作成ルール

## 1. 演習の役割

`/practice/{category}/{id}/`は、SQLガイドを読んだ人が、その場でSQLを書いて採点を受けるページである。問題の公開窓口は`src/questions/catalog.ts`の`questionEntries`。GROUP BY以降の通常演習は`src/questions/advanced.ts`で編集し、`advancedEntries`から取り込む。CASEは`src/questions/case.ts`、NULL・COALESCEは`src/questions/coalesce.ts`で編集し、`advancedEntries`経由で公開する。対応ガイドの公開窓口は`src/data/sqlTopics.ts`で、CASE本文は`src/data/caseSqlTopic.ts`にある。

解説ページ（`docs/sql-guide.md`）と役割を分ける。解説ページは「読んで理解する」、演習は「書いて確認する」。同じ説明文を演習側に複製しない。

## 2. 出題順のデフォルトパターン

1カテゴリ（1構文）につき、次の順番で出題する。これがデフォルトであり、新しいカテゴリを追加するとき・既存カテゴリを見直すときはこの型に従う。

1. **基礎問題**：そのカテゴリの中心となる構文だけを、他の要素と混ぜずに最も単純な形で使う。複数条件やパターンマッチなど、他の要素を持ち込まない。
2. **要素問題**：`sqlTopics.ts`の対応トピック（`sections`）が触れている構文要素を、1問につき1要素、ガイドの解説順に沿って出題する。前の問題の要素を無理に混ぜない。
3. **章末問題**（chapter review）：レベルを1段階上げ、その章で学んだ複数要素を組み合わせた問題を1問出す。`requirements`で採点観点を明示する。`starterSql`に典型的な間違い（例：`manager_id = NULL`）を仕込み、直す過程で学べるようにしてよい。
4. **まとめ問題**（cumulative review）：さらにレベルを上げ、それより前のカテゴリで学んだ構文とこの章の構文を1問に組み合わせる。`requirements`を付ける。**1番目のカテゴリ（SELECT）には作らない**（前の章がないため）。2番目以降のカテゴリで必須。

この型に対応する`tags`をそれぞれ`'chapter review'` / `'cumulative review'`として末尾に付ける。

SELECT以外の章末問題・まとめ問題では、AS別名を要求しない。AS習熟はSELECT章の役割であり、他章の複合問題ではその章の構文（WHEREの条件、ORDER BYの並べ替えなど）を評価することが目的で、AS別名は本質的でないため、列は元の列名のまま（`SELECT name, department, salary`のように）取得させる。

同様に、SELECT以外では列を明示的に指定させることも要求しない。列選択の意図的なテストが必要なとき（GROUP BY・HAVINGの集約式、JOINで複数テーブルの列を組み合わせて名前衝突を避けるとき、window関数のOVER式など）を除き、`SELECT *`で全列を取得させる。設問文（`description`）にも取得する列の名前は書かない。`SELECT *`へ変更したら、`expectedResult`の`columns`と各行をテーブル定義順の全列に展開し、手計算した値を信用せず`pnpm vitest run src/questions/catalog.test.ts`（PGlite実行）で必ず検証する。

## 3. タイトルの付け方

`title`は業務シナリオ（「給与で絞り込む」「担当順の社員一覧」のような物語調）ではなく、機能単位の名前にする。`ASC`、`BETWEEN`、`IN`、`IS NULL`のように、その問題で扱うSQL要素がそのままタイトルになる形を基本とする。

- 複数要素を1問で扱う場合は`LIKEとOR`のように列挙する。
- 章末問題は`章末問題：AND・OR・カッコ`のように、扱う要素を示す。
- まとめ問題は`まとめ問題：SELECT・ORDER BY・WHERE`のように、組み合わせるカテゴリを列挙する。

業務文脈（社員名、給与、顧客など）は`description`（設問文）側に書く。タイトルと設問文の役割を分け、タイトルは一覧・ページtitleタグでの識別に徹する。

## 4. 実装の流れ

1. `sqlTopics.ts`の該当トピック（`sections`）を読み、要素を列挙する。
2. `catalog.ts`にある既存の`setupSql`（`employees`、`orderByBasics`など）が使えるか確認し、なければ最小限の新テーブルを追加する。
3. 各要素ごとに`entry()`を1つ追加する。`id`は`{category}-01`から連番、`slug`は説明的なkebab-case。
4. 章末問題とまとめ問題を`requirements`付きで追加する。まとめ問題の`setupSql`は、組み合わせる前の章で使ったテーブルを再利用する。
5. `pnpm vitest run src/questions/catalog.test.ts`で全問の`solutionSql`が`expectedResult`と一致することを確認する（PGliteで実際に実行して採点ロジックを通す）。
6. 問題数が変わったら、`catalog.test.ts`と`docs/architecture.md`の件数を更新する。`src/pages/practice/index.astro`のカテゴリ件数とmeta descriptionはカタログから自動計算される。
7. `pnpm check`で型チェックする。

## 5. 実装例（リファレンス）

### SELECT（1番目のカテゴリ：まとめ問題なし）

`sqlTopics.ts`の`select`トピックは「列の指定・AS・計算式」「DISTINCT」の2セクション。列の明示的な指定・AS別名はSELECT章自体が教える内容なので、この章に限り両方とも出題する。

| id | 種別 | 要素 |
| --- | --- | --- |
| select-01 | 基礎問題 | `SELECT *`（全列取得） |
| select-02 | 要素問題 | 列の指定 |
| select-03 | 要素問題 | `AS` |
| select-04 | 要素問題 | 計算式（`salary * 12`など） |
| select-05 | 要素問題 | `DISTINCT` |
| select-06 | 章末問題 | `DISTINCT` + `AS` + 計算式を組み合わせる |

1番目のカテゴリなので、まとめ問題（前のカテゴリを組み合わせる問題）は作らない。

### ORDER BY（2番目のカテゴリ：まとめ問題あり）

`sqlTopics.ts`の`order-by`トピックは「ASC・DESC」「複数列」「NULLS LAST」「LIMIT」の4セクション。列の選択に意図がないため全問`SELECT *`とし、AS別名も使わない。

| id | 種別 | 要素 |
| --- | --- | --- |
| order-by-01 | 基礎問題 | `ASC` |
| order-by-02 | 要素問題 | 複数列（ASC/DESCの組み合わせ） |
| order-by-03 | 要素問題 | `NULLS LAST` |
| order-by-04 | 要素問題 | `LIMIT` |
| order-by-05 | 章末問題 | 複数列・`NULLS LAST`・`LIMIT`を組み合わせる |
| order-by-06 | まとめ問題 | ORDER BY（複数列・LIMIT）を1問にまとめる。SELECTからの持ち越しは`SELECT *`のみ |

### WHERE（3番目のカテゴリ：まとめ問題あり）

`sqlTopics.ts`の`where`トピックは「比較演算子（BETWEEN・IN・LIKEに言及）」「AND・OR・NOT」「IS NULL」の3セクション。ORDER BYと同様、全問`SELECT *`でAS別名も使わない。

| id | 種別 | 要素 |
| --- | --- | --- |
| where-01 | 基礎問題 | 比較演算子（`=`） |
| where-02 | 要素問題 | `AND` |
| where-03 | 要素問題 | `BETWEEN` |
| where-04 | 要素問題 | `IN` |
| where-05 | 要素問題 | `LIKE` + `OR` |
| where-06 | 要素問題 | `IS NULL`（`= NULL`という誤りを`starterSql`に仕込み、修正させる） |
| where-07 | 章末問題 | `AND` / `OR` / カッコの優先順位を組み合わせる |
| where-08 | まとめ問題 | ORDER BY（複数列・ASC/DESC）・WHERE（IS NOT NULL・AND・比較）を1問に統合 |

### JOIN・GROUP BY・HAVING・window-functionsでの`SELECT *`の扱い

これらのカテゴリは`SELECT *`を使わない。GROUP BY・HAVINGは集約式そのものが選択列の意図であり`*`は構文上使えない。JOINは複数テーブルの列が同名衝突を起こしうるため、明示的な列指定（テーブル別名で修飾）が結果の正しさに必要。window関数はOVER式を明示的にSELECTリストへ書く必要がある。subqueryは単一テーブルに対する条件だけの問題（EXISTS・スカラー比較など）なら`SELECT *`にしてよいが、JOINを伴う問題は列を明示する。

## 6. 公開前チェックリスト

### GROUP BY以降のガイド・演習対応（2026-09-07）

Tipsは発展読み物とし、本文の必修要素を次の順で出題する。GROUP BYのMIN・MAXは各1問に分割。基礎問題では出力順を問わず、ORDER BYを同時に書かせない。結果の列名はPostgreSQLの既定名を使い、複合問題でAS習熟を要求しない。

| カテゴリ | 基礎・要素問題（ガイド順） | 章末 | まとめ | 件数 |
| --- | --- | --- | --- | --- |
| GROUP BY | 01 COUNT、02 SUM、03 AVG、04 MIN、05 MAX、06 複数列、07 COUNT(列)とNULL、08 COUNT DISTINCT、09 FILTER、10 WHERE | 11 複数列と複数集約 | 12 WHERE・GROUP BY・ORDER BY（staff_directory再利用） | 12 |
| HAVING | 01 COUNT条件、02 SUM条件、03 AVG条件、04 WHEREとの併用、05 AND・OR、06 GROUP BYなし | 07 人数と給与差 | 08 WHERE・GROUP BY・HAVING・ORDER BY | 8 |
| JOIN | 01 INNER JOIN、02 1対多、03 LEFT JOIN、04 ON条件、05 未一致検索、06 自己結合 | 07 paidの未一致 | 08 JOIN・WHERE・GROUP BY・HAVING・ORDER BY | 8 |
| サブクエリ | 01 スカラー、02 IN、03 FROM、04 相関、05 EXISTS、06 NOT EXISTS | 07 存在と不在 | 08 JOIN・WHERE・相関・ORDER BY | 8 |
| ウィンドウ関数 | 01 OVER、02 PARTITION BY、03 ROW_NUMBER、04 RANK、05 DENSE_RANK、06 LAG、07 累計、08 移動平均、09 上位N件 | 10 部署内同順位 | 11 WHERE・GROUP BY・HAVING・RANK | 11 |

現在の全体はSELECT 6問、ORDER BY 6問、WHERE 8問、上記47問、LIKE 6問、INSERT 6問、UPDATE 6問、DELETE 6問、CASE 9問、NULL・COALESCE 10問、WITH 6問、UNION 6問、日付で絞り込む6問、月別集計6問、文字列操作6問、EXISTS 6問、INTERSECT・EXCEPT 6問の152問。再編したGROUP BYとウィンドウ関数のIDはカテゴリ名に合わせて`group-by-01`、`window-functions-01`から採番する。旧`group-*`・`window-*`のURL・端末内進捗との互換はないため、公開済み環境へ反映する場合はリダイレクトと進捗移行を別途設計する。その他の再編カテゴリも問題内容が変わるため、既存の解答済み情報を新問題の習得記録として流用しない。

期待結果は固定値として保持し、テスト実行時に模範解答から生成しない。NULLキー・重複給与・在籍者0人の部署・cancelledしかない顧客・同額順位により、よくある誤答と正解の結果が分かれるようにする。

- [ ] 1問目に複数要素を混ぜていない
- [ ] `sqlTopics.ts`のガイドが触れている要素を過不足なく1問ずつ出題している
- [ ] 章末問題が`requirements`付きで、この章の複数要素を組み合わせている
- [ ] 2番目以降のカテゴリは、まとめ問題で前のカテゴリまでの要素を組み合わせている
- [ ] タイトルが業務シナリオではなく機能単位になっている
- [ ] SELECT以外で、列選択に意図がないのに列を明示していない（`SELECT *`にできないか確認した）
- [ ] 全問の`solutionSql`をPGliteで検証した（`pnpm vitest run src/questions/catalog.test.ts`）
- [ ] 問題数の表示・テストの件数がすべて一致している
- [ ] `pnpm check`が通る

## 7. CASEのガイド・演習対応

CASEはHAVINGの後に配置する。本文の7要素に対応する7問と、章末・まとめ各1問の計9問。ガイドと演習で月給35万円・40万円ちょうどとNULLを含む5人のデータを使い、境界条件・判定順・未入力の扱いを結果で区別できるようにする。

| id | 種別 | 要素 |
| --- | --- | --- |
| case-01 | 基礎 | WHEN・THEN・ELSE・ENDの最小の分岐 |
| case-02 | 要素 | 複数WHENと条件の優先順 |
| case-03 | 要素 | ELSE省略時のNULL |
| case-04 | 要素 | CASEとIS NULL |
| case-05 | 要素 | 単純CASE |
| case-06 | 要素 | 数値の1・0を返す |
| case-07 | 要素 | SUM・CASE・GROUP BYで0人の部署も集計 |
| case-08 | 章末 | NULL判定と複数条件の順序。初期SQLの誤りを修正 |
| case-09 | まとめ | WHERE・CASE・GROUP BY・HAVING・ORDER BY。既存employeesを再利用 |

CASEの結果そのものが選択列の学習対象なので、明示的なCASE式は列指定の例外に該当する。個別行の問題は`SELECT *, CASE ... END`、集計問題は`department, SUM(CASE ... END)`とし、AS別名は要求しない。PostgreSQLの既定列名`case`・`sum`を期待結果に使う。行順の採点はORDER BYを要求するまとめ問題だけにする。

まとめ問題は既存employeesに非在籍の高給与社員を加え、WHEREを忘れると合計が変わるようにする。期待結果は固定値で保持し、全模範解答をPGliteと採点ロジックで検証する。境界値の除外、WHENの逆順、`= NULL`、1・0のCOUNT、0人部署の除外、非在籍者の混入が不正解になることもテストする。構文を文字列で強制する採点は追加せず、既存どおり結果が一致する別解を受け入れる。

## 8. NULL・COALESCEのガイド・演習対応

CASEの次に配置する。ガイド8要素と章末・まとめ各1問で計10問。

| id | 種別 | 要素 |
| --- | --- | --- |
| coalesce-01 | 基礎 | IS NULLで未入力を選ぶ（0を混ぜない） |
| coalesce-02 | 要素 | IS NOT NULLで入力済みを選ぶ（0を含める） |
| coalesce-03 | 要素 | 空文字とNULLを区別する |
| coalesce-04 | 要素 | COALESCEの既定値 |
| coalesce-05 | 要素 | 複数候補の優先順位。空文字は採用、すべてNULLなら既定値 |
| coalesce-06 | 要素 | AVGでNULLを除外した平均120 |
| coalesce-07 | 要素 | AVGの内側でNULLを0にした平均72 |
| coalesce-08 | 要素 | AVGの外側で集計結果のNULLだけを補う |
| coalesce-09 | 章末 | IS NOT NULLと複数候補のCOALESCE。初期SQLを修正 |
| coalesce-10 | まとめ | WHERE・COALESCE・GROUP BY・ORDER BY。CASE章のemployeesを再利用 |

基本・要素は名前と賞与の5人を使う。条件選択はSELECT *、補完は全列の末尾へCOALESCE式を追加、平均は集約式のみとし、別名を要求しない。結果列の既定名はcoalesceまたはavg。まとめはCASE章の給与データに営業の給与NULL行を1件追加し、平均前の補完と平均後の補完で結果が分かれるようにする。行順はまとめ問題のみ採点する。

期待結果の空文字は空文字、NULLはnullのまま保持する。NULLと0の混同、0の除外、空文字とNULLの混同、候補の逆順、空文字の置換、AVGの内外の取り違え、集計前のNULL除外を誤答テストで確認する。表示上の「''（空文字）」をSQLの文字列リテラルとして入力させない。

## 9. WITH（CTE）のガイド・演習対応

WITHはサブクエリの後、ウィンドウ関数の前に配置する。社員5人の同じデータで4つの本文要素を学び、章末・まとめ各1問で計6問とする。再帰CTEは本文の必修要素に含めない。

| id | 種別 | 要素 |
| --- | --- | --- |
| with-01 | 基礎 | WITH・ASで名前を付け、本体SELECTから参照 |
| with-02 | 要素 | 部署集計CTEを外側のWHEREで絞る |
| with-03 | 要素 | 複数の独立したCTEをカンマで区切る |
| with-04 | 要素 | 前のCTEを次のCTEから参照 |
| with-05 | 章末 | 給与入力済みの選択・部署集計・合計条件 |
| with-06 | まとめ | 既存employeesで在籍者選択・部署集計・条件・並べ替え |

行の選択はSELECT *、集計列はPostgreSQL既定名を使い、AS別名を要求しない。WITH内のASはCTE定義の構文として学ぶ。採点は既存どおり結果の一致で行い、WITHを使わない同じ結果の別解も受け入れる。期待値は固定値で保持し、ガイド例と全模範解答をPGliteで検証する。

## 10. UNION・UNION ALLのガイド・演習対応

WITHの後、ウィンドウ関数の前に配置する。午前・午後の測定記録を各3件用意し、同じ表内と表をまたぐ重複、同名で点数が違う記録を含める。4つの本文要素と章末・まとめ各1問で計6問。JOINとの違いはFAQで補足する。

| id | 種別 | 要素 |
| --- | --- | --- |
| union-01 | 基礎 | UNION ALLで全記録を残す |
| union-02 | 要素 | UNIONで行全体の重複を除く |
| union-03 | 要素 | 同じ列数・互換性のある型・列の位置をそろえる |
| union-04 | 要素 | 結果全体のORDER BY |
| union-05 | 章末 | 列の対応・重複除去・全体の並べ替え |
| union-06 | まとめ | 既存employeesとcontractorsの在籍者をWITH内でつなぎ、部署別集計・HAVING・ORDER BY |

基本はSELECT *。列の対応を学ぶ問題とまとめの集計入力では、必要な列を明示する。AS別名は要求しない。固定期待値で重複件数も検証し、UNIONとUNION ALLの取り違え、列の取り違え、在籍条件の漏れ、並び順の逆転を誤答テストで確認する。採点は結果の一致で行い、同じ結果の別解を受け入れる。

## 11. 日付で絞り込むガイド・演習対応

UNIONの後、ウィンドウ関数の前に配置する。DATEの配送予定日とtimestamp without time zoneの注文日時を持つ注文6件で学ぶ。全日時は同じ店舗の現地時刻とし、タイムゾーン変換・DATE_TRUNCは必修要素に含めない。

| id | 種別 | 要素 |
| --- | --- | --- |
| date-filter-01 | 基礎 | DATEリテラルと等値比較 |
| date-filter-02 | 要素 | 日付の以降・以前（両端を含む） |
| date-filter-03 | 要素 | 当日0時以上・翌日0時未満 |
| date-filter-04 | 要素 | 月初以上・翌月初未満 |
| date-filter-05 | 章末 | 注文日時の月範囲・配送日条件 |
| date-filter-06 | まとめ | 既存commerceに期間境界注文を加え、支払済み期間・WITH・JOIN・集計・HAVING・ORDER BY |

基本・要素・章末はSELECT *とし、別名を要求しない。月初ちょうど、月末23:59:59.999999、翌月0時、日時NULLを含む固定期待値を使う。PGliteのDATE・TIMESTAMPは共通パーサーで文字列として受け取り、時刻と秒以下を表示・採点で保つ。翌日・翌月の混入、月末の取りこぼし、未入力の混入、支払状態の条件漏れを誤答テストで検証する。

## 12. 月別集計・DATE_TRUNCのガイド・演習対応

日付で絞り込むの後、ウィンドウ関数の前に配置する。異なる年の9月、月初0時、月末の秒以下、注文のない10月を含む6件で説明する。日時はtimestamp without time zoneとし、基本は月単位、日単位はTipsで補足する。

| id | 種別 | 要素 |
| --- | --- | --- |
| date-trunc-01 | 基礎 | 全列の末尾にDATE_TRUNCで月初を追加 |
| date-trunc-02 | 要素 | 月別件数（GROUP BY・COUNT） |
| date-trunc-03 | 要素 | 月別金額合計（SUM） |
| date-trunc-04 | 要素 | 元の日時で期間指定し、月順に並べる |
| date-trunc-05 | 章末 | 件数・合計・HAVING・月順。誤ったGROUP BYを修正 |
| date-trunc-06 | まとめ | 前章の注文データに支払状態と期間境界を加え、WHERE・WITH・月別集計・HAVING・ORDER BY |

集計列は学習対象なので明示的に選び、PostgreSQL既定のdate_trunc・count・sumを使う。AS別名は要求しない。年をまたぐ同じ月の混同、日単位との取り違え、日時単位のグループ化、期間境界の混入、取消注文の集計、月順の逆転を固定期待値の誤答テストで確認する。注文のない月はGROUP BYだけでは行が作られないことをガイドで説明する。

## 13. 文字列の連結・切り出しのガイド・演習対応

月別集計の後、ウィンドウ関数の前に配置する。姓・名・商品コードの5件で、NULL・空文字・前後の半角スペース・連続ハイフン・日本語を確認する。

| id | 種別 | 要素 |
| --- | --- | --- |
| string-functions-01 | 基礎 | ||とCONCATのNULLの扱い |
| string-functions-02 | 要素 | SUBSTRINGの1始まりの位置と文字数 |
| string-functions-03 | 要素 | TRIMで前後の半角スペースを取り除く |
| string-functions-04 | 要素 | REPLACEでハイフンをすべて置換 |
| string-functions-05 | 章末 | 名前連結・コードの空白除去・置換・切り出し |
| string-functions-06 | まとめ | 既存commerceに表記違いの顧客を加え、名前を加工してJOIN・WHERE・GROUP BY・HAVING・ORDER BY |

基本・要素・章末はSELECT *の末尾に加工値を追加する。加工式の結果が学習対象なので、AS別名は要求せずPostgreSQL既定の列名を使う。元の値・期待値に含む空白を削除せず、表示でも保持する。NULLと空文字、切り出し位置、連続ハイフン、内部空白、加工前の名前での集計、取消注文の混入を誤答テストで確認する。

## 14. EXISTS・NOT EXISTSのガイド・演習対応

専用章は文字列操作の後に配置し、日付条件のまとめ問題へつなぐ。サブクエリガイドは相関の導入を残し、条件付き存在判定・NOT INのNULL・JOINの行数の詳説は専用ガイドへまとめる。既存subquery-05〜07はURL・保存済み進捗を保つため変更せず、入門の確認問題として残す。

| id | 種別 | 要素 |
| --- | --- | --- |
| exists-01 | 基礎 | EXISTSが真偽値を返すことを単独で確認 |
| exists-02 | 要素 | 外側の顧客との相関条件を初期SQLへ追加 |
| exists-03 | 要素 | 支払済みの存在確認 |
| exists-04 | 要素 | 対応注文の不在確認 |
| exists-05 | 章末 | paidの存在とcancelledの不在を独立に判定 |
| exists-06 | まとめ | 既存commerceで地域・支払済み1月・取消1〜2月・ID順 |

通常は顧客のSELECT *、基礎のみSELECT EXISTSの真偽値1列とし、AS別名は要求しない。顧客4件と注文6件で、支払済み複数・取消のみ・未注文・支払済みと取消両方・顧客ID NULLを区別する。相関漏れ、集約COUNTによる誤った存在確認、NOT INのNULL、別注文の取消の見落とし、日付境界を固定期待値と誤答テストで確認する。

## 15. INTERSECT・EXCEPTのガイド・演習対応

EXISTSの後に配置する。店舗6件・通販5件で共通行・左側だけの行・重複件数を比較する。NULLの記録も含めるが、同じ顧客であると確認できたことにはしない。

| id | 種別 | 要素 |
| --- | --- | --- |
| intersect-except-01 | 基礎 | INTERSECTの共通行と重複除去 |
| intersect-except-02 | 要素 | EXCEPTの左から右への差分 |
| intersect-except-03 | 要素 | INTERSECT ALLの最小件数 |
| intersect-except-04 | 要素 | EXCEPT ALLの正の残数 |
| intersect-except-05 | 章末 | EXCEPT ALL・比較方向・全体のORDER BY |
| intersect-except-06 | まとめ | 既存commerceで1月・2月の支払済み顧客IDを比較し、WITH・JOIN・ORDER BY |

基礎・要素・章末はSELECT *。まとめの集合演算は比較対象の顧客IDだけを選び、顧客表を結合後にcustomers.*で取得する。AS別名は要求しない。期待値は固定し、重複件数も採点する。ALLの取り違え、左右逆転、NULL除外、支払条件漏れ、月境界の混入を誤答テストで確認する。

## 16. LIKEのガイド・演習対応

WHEREの次に位置づけるガイド（`/sql/like/`）で、演習はカテゴリ`like`。商品7件（ペン3種、ノート2種、割引券2種）で、小文字のコード・記号違いのコード・日本語名を使い分ける。ガイドは前方一致・部分一致・_・NOT LIKE・ILIKE・エスケープの6節で、演習は基礎・要素・章末・まとめの6問に絞る（NOT LIKE・ILIKEは章末で扱う）。

| id | 種別 | 要素 |
| --- | --- | --- |
| like-01 | 基礎 | `%`の前方一致 |
| like-02 | 要素 | `%...%`の部分一致（末尾が一致する行を含む） |
| like-03 | 要素 | `_`で文字数を固定 |
| like-04 | 要素 | `\_`のエスケープ（記号違いの行を除く） |
| like-05 | 章末 | ILIKEとNOT LIKEをANDでつなぐ |
| like-06 | まとめ | LIKEのOR・WHERE・ORDER BY（カッコの有無で結果が変わる） |

## 17. INSERT・UPDATE・DELETEのガイド・演習対応（table-state採点）

3つのガイド（`/sql/insert/`・`/sql/update/`・`/sql/delete/`）は、`products`表を共通の題材にする。各節は「更新文＋確認用の`SELECT * FROM products ORDER BY id;`」を1つのコード例にし、結果表は確認用SELECTの結果を示す。RETURNINGの節だけは更新文の戻り値を示す。ガイドのテストは節ごとにDBを元の状態へ戻して実行する。

演習は`grading.mode: 'table-state'`、`stateQuery: 'SELECT * FROM products ORDER BY id'`、`compareRowOrder: true`。`expectedResult`は更新後の表を固定値で持ち、ユーザーSQLの実行結果（結果セットなし）は採点しない。AS別名・列選択は要求しない。誤答が不正解になることは`catalog.test.ts`の誤答テストと「変更しないSQLは不正解」のテストで確認する。

| カテゴリ | 基礎・要素 | 章末 | まとめ |
| --- | --- | --- | --- |
| insert | 01 VALUESで1行、02 列の省略とDEFAULT、03 複数行、04 INSERT SELECT | 05 INSERT SELECT・列の省略・WHERE | 06 NOT EXISTS・WHERE |
| update | 01 SET・WHERE、02 複数列、03 現在の値から計算、04 複数行 | 05 複数列・計算・OR | 06 CASE・WHERE |
| delete | 01 id指定、02 複数行、03 OR、04 サブクエリ（IN） | 05 AND・サブクエリ | 06 NOT EXISTS |

RETURNINGはガイドで扱うが、状態採点の対象にならないため演習には出さない。
