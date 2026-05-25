# Troubleshooting

このドキュメントは、よくあるトラブルの簡単な対処法をまとめたものです。

## npm install で失敗したとき

確認すること:

- Node.js が入っているか
- ネットワーク接続があるか
- 依存関係が壊れていないか

試すこと:

```bash
rm -rf node_modules
rm -f package-lock.json
npm install
```

Windows では `rm` の代わりにエクスプローラーで `node_modules` を削除してから再実行してもよいです。

## npm run dev で vite が見つからないとき

原因の多くは、依存関係がまだ入っていないことです。

試すこと:

```bash
cd frontend
npm install
npm run dev
```

それでもだめなら、`package.json` に `vite` が入っているか確認します。

## FastAPI が起動しないとき

確認すること:

- 仮想環境が有効か
- 必要なパッケージが入っているか
- `app.main:app` が存在するか

試すこと:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate  # Windows
# source .venv/bin/activate  # macOS / Linux
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## ModuleNotFoundError が出たとき

これは、Python がモジュールを見つけられないエラーです。

確認すること:

- 仮想環境が有効か
- import 文の書き方が合っているか
- 実行している場所が `backend` かどうか

試すこと:

- 仮想環境を有効にし直す
- `pip install -r requirements.txt` を再実行する
- `python -m ...` の形で実行する

## CORS エラーが出たとき

CORS は、ブラウザが別のドメインの API を呼ぶときの制限です。

確認すること:

- backend の `CORS_ORIGINS` が frontend の URL を含んでいるか
- frontend の `VITE_API_BASE_URL` が正しいか
- backend が `http://localhost:8000` で動いているか

## 401 Unauthorized が出たとき

これは認証が必要な API に、認証情報が付いていないときによく出ます。

確認すること:

- `Authorization: Bearer <supabase_jwt>` を送っているか
- Supabase Auth でログインしているか
- トークンの期限が切れていないか

## .env を間違えて commit したとき

すぐに対応します。

対応方針:

1. `git status` で確認する
2. `.env` を git の管理対象から外す
3. すでに push した場合は、秘密情報を無効化する
4. `.env.example` に必要な値の名前だけ残す

重要:

- API key や service role key は絶対に公開しない
- 間違えて公開したら、すぐにキーを再発行する

## 迷ったら

- まずエラーメッセージをそのまま読む
- 次に README と `docs/env-guide.md` を確認する
- 最後に `docs/spec.md` と `docs/api.md` を見る
