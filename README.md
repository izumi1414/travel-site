# Travel Site

## プロジェクト概要

ホテルを検索し、部屋の空き状況や料金を確認して宿泊予約ができる旅行予約サイトです。ユーザー登録・ログイン機能を備え、ログイン後は予約の確認や予約履歴の管理を行えます。

## 使用技術

- Next.js 16（Pages Router）
- React 19
- TypeScript 5
- PostgreSQL（`pg`）
- bcrypt（パスワードのハッシュ化）
- Tailwind CSS 4 / PostCSS
- ESLint 9
- Node.js 20.20.0（Voltaで指定）

## 主な機能

- 目的地（エリア）によるホテル検索
- ホテル一覧・ホテル詳細の表示
- 部屋、宿泊日、宿泊人数を指定した予約
- ユーザー登録、ログイン、ログアウト
- ログインユーザー情報の取得
- 予約完了画面、予約履歴の確認
- 予約のキャンセル
- HTTP Only Cookieを利用したログイン状態の保持

## 使い方

1. トップページで目的地を入力し、「検索する」を選択します。
2. ホテル一覧からホテルを選び、詳細ページで部屋と宿泊条件を指定します。
3. 未ログインの場合はログインまたは新規登録を行います。
4. 予約内容を確認し、「予約を確定する」を選択します。
5. マイページから予約履歴の確認や予約のキャンセルを行えます。

## セットアップ手順

### 前提条件

- Node.js 20.x
- npm
- PostgreSQL

### インストール

```bash
npm install
```

### 環境変数の設定

プロジェクト直下に `.env.local` を作成し、PostgreSQLへの接続文字列を設定します。

```env
DATABASE_URL=postgresql://ユーザー名:パスワード@localhost:5432/データベース名
```

データベースには、アプリケーションが使用する `users`、`hotels`、`rooms`、`bookings` などのテーブルを用意してください。

### 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

### 本番用コマンド

```bash
npm run build
npm run start
```

コード品質を確認する場合は、次のコマンドを実行します。

```bash
npm run lint
```

## ディレクトリ構成

```text
travel-site/
├── public/                    # 画像などの静的ファイル
├── src/
│   ├── components/            # 共通コンポーネント
│   │   └── Header.tsx
│   ├── lib/                   # DB接続・認証処理
│   │   ├── auth.ts
│   │   └── db.ts
│   ├── pages/                 # Pages RouterのページとAPI
│   │   ├── _app.tsx
│   │   ├── index.tsx          # トップページ
│   │   ├── login.tsx          # ログイン
│   │   ├── signup.tsx         # 新規登録
│   │   ├── api/               # API Routes
│   │   ├── booking/           # 予約フロー
│   │   ├── hotels/            # ホテル一覧・詳細
│   │   └── mypage/            # マイページ
│   └── styles/
│       └── globals.css        # グローバルスタイル
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tsconfig.json
└── eslint.config.mjs
```
