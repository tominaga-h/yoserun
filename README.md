# 寄せるん

オンライン寄せ書きサイト。部屋の名前を決めてボタンを押すだけで、寄せ書きを集めるお部屋ができます。

## 画面

| URL | 内容 |
| --- | --- |
| `/` | トップ。部屋の名前を入れて「部屋をつくる」 |
| `/room/[adminKey]` | ダッシュボード（管理用）。書く/見るURLのコピー・QRコード、人数、最新メッセージ、色紙の進み具合 |
| `/write/[id]` | メッセージを書くフォーム（名前・メッセージ・文字の色・スタンプ） |
| `/view/[id]` | みんなの寄せ書き。「一覧」と「色紙」を切り替え、色紙は PNG で保存できる |
| `/sample` | 見本 |

ダッシュボードのURLは推測されにくい長いキー（`adminKey`）で、書く・見るURLの `id` とは別です。書く人にはダッシュボードのURLは伝わりません。

## 開発

```bash
npm install
npm run dev
```

`DATABASE_URL` がなければ、データは `.data/yoserun.json` に保存されます（ローカル開発用）。

スマホから QR コードで試すときは、PC の LAN の IP（例: `http://192.168.0.10:3000`）でダッシュボードを開くと、その IP で URL と QR コードが作られます。

## データベース（Supabase）

本番では Supabase の Postgres を使います。サーバーからは Supabase の API キーではなく、Postgres に直接つなぎます。

1. Supabase でプロジェクトを作る
2. Project Settings → Database → Connection string で **Transaction pooler**（ポート 6543）の接続文字列をコピーする
3. `.env.local`（本番ではホスティングの環境変数）に `DATABASE_URL` として設定する（`.env.example` を参照）

テーブル（`rooms` / `messages`）は初回アクセス時に自動で作られます。どちらも RLS を有効にしてあり、ポリシーは作っていません。このため Supabase の公開 API（anon キー）からは読み書きできず、このアプリのサーバーだけがアクセスできます。

| 環境変数 | 内容 |
| --- | --- |
| `DATABASE_URL` | Supabase（Postgres）の接続文字列 |
| `SITE_URL` | （任意）共有URLの起点。未設定ならリクエストのホストから作る |
