# Environment Guide

このドキュメントは、環境変数の意味を初心者向けに説明するものです。`.env` は、コードに直接書きたくない設定を入れるファイルです。

## frontend/.env と backend/.env の違い

### frontend/.env

フロントエンドで使う設定です。ブラウザから見えてもよい値だけを書きます。

### backend/.env

バックエンドで使う設定です。秘密情報を含めてもよいのは、こちらだけです。ただし、Git に commit しないことが重要です。

## .env.example の役割

`.env.example` は、必要な環境変数の名前と例を示すテンプレートです。

使い方:

1. `.env.example` を見る
2. 同じ名前で `.env` を作る
3. 自分の値を入れる
4. `.env` は commit しない

## frontend/.env.example

```env
# Local FastAPI URL. In Vercel, set this to the deployed backend URL.
VITE_API_BASE_URL=http://localhost:8000

# Supabase browser-safe project settings.
# These values are public in the built frontend. Do not put service role keys here.
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

### 各項目の意味

- `VITE_API_BASE_URL`: FastAPI の URL
- `VITE_SUPABASE_URL`: Supabase のプロジェクト URL
- `VITE_SUPABASE_ANON_KEY`: フロントから使う公開用のキー

## Frontend values for each environment

Local development:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<supabase-anon-key>
```

Vercel production:

```env
VITE_API_BASE_URL=https://<backend-app>.onrender.com
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<supabase-anon-key>
```

Notes:

- `VITE_API_BASE_URL` is the backend origin only. Do not include `/api` at the end.
- `VITE_SUPABASE_ANON_KEY` is safe to expose to the browser, but `SUPABASE_SERVICE_ROLE_KEY` is not.
- After changing Vercel environment variables, redeploy the frontend.
- Keep real values in `frontend/.env` or Vercel project settings. Do not commit them.

## backend/.env.example

```env
APP_ENV=development
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_JWT_SECRET=
GEMINI_API_KEY=
GEMINI_MODEL=
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
FRONTEND_URL=
VERCEL_URL=
```

### 各項目の意味

- `APP_ENV`: 開発用か本番用かを切り替える
- `SUPABASE_URL`: Supabase のプロジェクト URL
- `SUPABASE_SERVICE_ROLE_KEY`: バックエンドだけで使う強い権限のキー
- `SUPABASE_JWT_SECRET`: Supabase Auth の JWT を検証するための情報
- `GEMINI_API_KEY`: Gemini API を使うためのキー
- `GEMINI_MODEL`: 使う Gemini モデル名
- `CORS_ORIGINS`: フロントエンドからのアクセスを許可する URL。複数ある場合はカンマ区切り
- `FRONTEND_URL`: 本番フロントエンド URL。`CORS_ORIGINS` に含めてもよい
- `VERCEL_URL`: Vercel が自動で設定する URL。スキームなしの場合は `https://` として扱う

## 公開してよいキーと公開してはいけないキー

### 公開してよいもの

- `VITE_` で始まるフロントエンド用の値
- Supabase の anon key

### 絶対に公開してはいけないもの

- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`
- 本番用の秘密情報全般

## よくある注意点

- `VITE_` が付いている変数は、フロントから見える前提で扱う
- バックエンドの秘密情報をフロントに置かない
- 本番環境とローカル環境で値を分ける

## 迷ったら

- その値がブラウザに見えても困らないかを考える
- 困るなら backend/.env に置く
- 共有するのは `.env.example` の名前までにする
