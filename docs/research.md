# 調査ノート

検索語と競合を調べた結果を置く場所。調べ方は `.claude/skills/pdca/deep-dive.md`、運用の状態は `docs/operations.md` にある。

月曜の「調査の回」で更新し、木曜の「実装の回」で「仕様」を上から実装する。

## 仕様（実装待ち）

まだ無い。最初の調査の回（2026-11-23）で2件以上を書く。

## 検索語の機会

Search Console の検索語とページの組（2026-08-19〜11-16 の90日、全51行）から。表示回数は90日の合計。競合調査はまだしていないので、「見立て」は検索語だけからの仮説である。

| テーマ | ページ | 主な検索語（表示、順位） | 型 | 見立て | 状態 |
|---|---|---|---|---|---|
| CASE | `/sql/case/` | sql case文（16、11.1）、sql case（6、22.2）、case sql（5、19.8）、sql case 文（5、17.0）、sql case null（3、22.0）、oracle sql case（3、23.0） | 伸ばせる、派生の検索語 | サイト内で表示が最も多い。順位11〜22で1ページ目に届いていない。サジェストに「複数条件」「where句」「elseなし」「null」「like」がある | 未調査 |
| UNION ALL | `/sql/union/` | union all（8、7.4）、union union all 違い（計2、10.0）、sql union all order by（1、10.0）、union all 重複（1、10.0） | 伸ばせる、派生の検索語 | 順位7〜10。「違い」「order by」「重複」の節があるかを確かめる | 未調査 |
| INNER JOIN | `/sql/inner-join/` | inner join（7、7.9）、sql left join vs inner join（3、11.0） | 伸ばせる | 11/13 に LEFT JOIN との比較を足した。12/11 の評価まで触らない | 評価待ち |
| NOT EXISTS | `/sql/exists/` | not exists（5、9.4） | 伸ばせる | NOT EXISTS を主題にした節か、NOT IN との違いがあるかを確かめる | 未調査 |
| RETURNING | `/postgresql/returning/` | postgresql returning（4、7.5）、update returning 系（計4、7〜8）、delete returning（1、8.0） | 伸ばせる | PostgreSQL 固有機能は競合が少なく、順位7〜8にいる。UPDATE、DELETE それぞれの例があるかを確かめる | 未調査 |
| ON CONFLICT | `/postgresql/on-conflict/` | on conflict do nothing（2、7.5）、on conflict（1、7.0） | 伸ばせる | 同上 | 未調査 |
| SELECT | `/sql/select/` | sql select文（1、92.0）、sql select 文（1、76.0）、postgresql select（1、52.0） | 意図に合っていない | 順位50より下。競合が強い一般語で、当面は追わない | 見送り |
| ウィンドウ関数 | `/sql/window-functions/` | ウィンドウ関数（1、55.0）、window関数（1、65.0） | 意図に合っていない | 順位55〜65。上位のページとの差を調べる価値がある | 未調査 |
| SQL の練習（サイト全体） | `/` | Search Console の行には出ていない | 受け皿が無い | サジェストに「sql 練習サイト」「sql 練習問題 初心者／上級」「sql 練習 ブラウザ」「sql サブクエリ 練習問題」がある。サイトの主題そのものなので、トップと一覧ページがこれらの語に応えているかを調べる | 未調査 |

気づいたこと。

- `http://sqlrenshu.com/sql/with-recursive/` のように、`http://` の URL で出ている行が3つある。`https://` への転送と canonical を確かめる。
- 90日で51行しかなく、Search Console だけでは需要が見えない。当面はサジェストと競合調査を主な根拠にする。

## 競合

常連の競合サイト。まだ調べていない。最初の調査の回で、検索結果に繰り返し出るサイトを書く。

| サイト | 種類 | 強いテーマ | 弱いところ | 最後に見た日 |
|---|---|---|---|---|

## テーマごとの差

競合調査をしたテーマごとに、論点の比較表を置く。実装して評価が済んだものは消す。
