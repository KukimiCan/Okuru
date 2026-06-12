# Backend Deploy Guide

Okuru の backend を Render に置くための手順です。

## 1. 使う設定ファイル

このリポジトリの root に `render.yaml` を置いています。

Render では次の設定で FastAPI を起動します。

```text
Root Directory: backend
Build Command: pip install -r requirements.txt
Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
Health Check Path: /api/health
```

`$PORT` は Render が自動で渡す値です。
ローカルのように `--port 8000` 固定にはしません。

## 2. Render に登録する環境変数

Render の Environment には以下を設定します。

```env
APP_ENV=production
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<supabase-service-role-key>
SUPABASE_JWKS_URL=https://<project-ref>.supabase.co/auth/v1/.well-known/jwks.json
GEMINI_API_KEY=<gemini-api-key>
GEMINI_MODEL=<gemini-model-name>
CORS_ORIGINS=https://<frontend-app>.vercel.app
FRONTEND_URL=https://<frontend-app>.vercel.app
```

### 秘密情報として扱うもの

以下は PR やチャットに貼らないでください。

- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`

## 3. Supabase 認証の設定

backend は Supabase Auth の JWT を JWKS で検証します。

`SUPABASE_JWKS_URL` には次の形式の URL を入れます。

```text
https://<project-ref>.supabase.co/auth/v1/.well-known/jwks.json
```

古い `.env` に `SUPABASE_JWT_SECRET` がある場合も一応読み取りますが、
今後は `SUPABASE_JWKS_URL` を使ってください。

## 4. CORS の設定

frontend から backend にアクセスするには、frontend の URL を backend の `CORS_ORIGINS` に入れます。

例:

```env
CORS_ORIGINS=https://okuru.vercel.app,https://okuru-git-main-team.vercel.app
```

複数ある場合はカンマ区切りです。
末尾の `/` は付けないでください。

## 5. デプロイ後の確認

Render のデプロイが完了したら、次を開きます。

```text
https://<backend-app>.onrender.com/api/health
```

以下が返れば backend は起動しています。

```json
{
  "data": {
    "status": "ok"
  },
  "message": "success"
}
```

## 6. frontend 側の設定

Vercel の frontend には backend の URL を設定します。

```env
VITE_API_BASE_URL=https://<backend-app>.onrender.com
```

`/api` は付けません。
frontend の API client が `/api/...` を足します。

## 7. よくある失敗

### Failed to fetch

frontend の URL が backend の `CORS_ORIGINS` に入っていない可能性があります。

確認するもの:

- Render の `CORS_ORIGINS`
- Vercel の実際の URL
- `http` と `https` の違い
- 末尾 `/` の有無

### 401 Unauthorized

Supabase Auth の JWT 検証に失敗しています。

確認するもの:

- `SUPABASE_JWKS_URL`
- frontend の `VITE_SUPABASE_URL`
- frontend の `VITE_SUPABASE_ANON_KEY`

### 500 Internal Server Error

backend の秘密情報が足りない可能性があります。

確認するもの:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`
- `GEMINI_MODEL`
