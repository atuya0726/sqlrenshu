# SQL練習室

登録不要・ログイン不要で、PGliteのPostgreSQLをブラウザ内実行する日本語SQL学習サイトのMVPです。

## 開発

```sh
pnpm install
pnpm dev
```

## 検証

```sh
pnpm test
pnpm build
```

## Cloudflare Workers Static Assets

正式ドメインは`https://sqlrenshu.com`です。canonical・サイトマップ・robots.txtもこのURLを使用します。独自ドメインをCloudflareへ追加するまではworkers.devのURLで公開されます。

```sh
pnpm deploy
```

Workerコード、API、D1、KV、R2は使用しません。構成と編集方針は[docs/architecture.md](docs/architecture.md)を参照してください。
