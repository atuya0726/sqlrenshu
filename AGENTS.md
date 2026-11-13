# SQL練習室（sqlrenshu）

ブラウザだけでSQLを書いて試せる、日本語の無料SQL学習サイト。本番は https://sqlrenshu.com/ 。

このファイルは、このリポジトリで作業するエージェント向けの入口である。詳しい内容は各ドキュメントにあり、ここには場所と決まりだけを書く。

## 目的

月1万円の収益。そのためにまずPVを増やす。運用はエージェントに一任されており、週2回のPDCAで進める。

## 構成

- Astro 5 の静的サイト。SQL は PGlite（WASM 版 PostgreSQL）をブラウザ内で実行する。サーバー側の API や DB は無い。
- Cloudflare Workers Static Assets で配信する。
- 設計の詳細は `docs/architecture.md`。

| 場所 | 中身 |
|---|---|
| `src/questions/` | 練習問題。窓口は `catalog.ts` |
| `src/data/` | ガイド。窓口は `sqlTopics.ts` |
| `src/lib/categories.ts` | カテゴリと一覧ページの見出し |
| `src/pages/` | ページ。`/sql/{slug}/`、`/practice/{category}/{id}/`、`/postgresql/{slug}/` |
| `src/layouts/BaseLayout.astro` | head、フッター、解析タグ |
| `public/` | `robots.txt`、`ads.txt`、`_headers`、`_redirects` |
| `docs/operations.md` | 運用の状態、数字、バックログ、ログ |

## コマンド

```sh
pnpm dev      # 開発サーバー
pnpm test     # 全テスト。模範解答を PGlite で実際に実行する
pnpm build    # 型チェックとビルド
pnpm deploy   # ビルドして本番へデプロイ
```

## 内容を変えるときの決まり

- ガイドは `docs/sql-guide.md`、問題は `docs/practice-guide.md` の編集ルールに従う。
- SQL と実行結果は、必ずテストか実行で確かめる。確かめていない結果表を載せない。
- 内容の基準は PostgreSQL 公式ドキュメント。記憶だけで仕様を書かない。
- 問題数やガイド数が変わったら、テストと `docs/architecture.md` の件数も直す。
- 公開済みの URL は変えない。やむを得ず変えるときは `public/_redirects` に 301 を足す。

## 本番に出すまで

1. `pnpm test` と `pnpm build` を通す。
2. コミットして `origin main` へプッシュする。
3. `pnpm deploy` を実行する。
4. 本番 URL で変更を確かめる。

デプロイはユーザーから一任されている（2026-11-13）。テストかビルドが落ちた状態ではデプロイしない。

## 数字の見方

| 数字 | スキル | 引数 |
|---|---|---|
| 検索での表示、クリック、順位 | `search-console` | キー `gsc-sqlrenshu`、サイト `sc-domain:sqlrenshu.com` |
| PV、訪問、流入元 | `cloudflare-web-analytics` | キー `cf-analytics-sqlrenshu`、ホスト `sqlrenshu.com` |

キーは macOS キーチェーンにある。中身を直接読むコマンドは使わず、スキルのスクリプト経由で使う。

## 定期の運用

手順は `pdca` スキル（`.claude/skills/pdca/SKILL.md`）にある。ユーザーが「今日の分」と言ったとき、または無人のスケジュール実行で起動されたときは、このスキルに従う。

- 無人実行は launchd が月曜と木曜の朝7時に `scripts/pdca.py` を呼ぶ。毎日は回さない。評価は週1回で足り、施策の効果が出るまで2〜4週間かかるため。設定は `~/Library/LaunchAgents/com.sqlrenshu.pdca.plist`、ログは `~/Library/Logs/sqlrenshu-pdca/`。
- 結果は `discord-notify` スキルで Discord に送る。

## やらないこと

- リポジトリは公開されている。秘密の値（API トークン、キー、`.env` の中身）をコミットしない。
- 外部サービスへの投稿、アカウントの登録、申請、課金はしない。必要なときは `docs/operations.md` の「ユーザーに依頼中」に書いて知らせる。
- 広告やアフィリエイトのリンクを、広告である旨の表記なしに載せない。
