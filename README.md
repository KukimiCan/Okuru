# Okuru

贈る相手の特徴や関係性、予算を入力すると、AIがギフト候補を提案し、ほかのユーザーの体験談も参考にできるプレゼント選び支援Webアプリです。

## アプリ概要

Okuru は、AIの提案と人間のリアルな経験談を組み合わせて、プレゼント選びを助けるWebアプリです。ユーザーは相談フォームに入力するだけで、候補のギフト、選び方のコツ、注意点をまとめて確認できます。さらに、実際に贈った人の成功談・失敗談を閲覧できるため、机上の提案だけでは拾いにくい判断材料も得られます。

## 主な機能

- AIギフト相談機能
- AI相談結果の保存とお気に入り管理
- 体験談の投稿と公開設定
- 公開体験談の一覧・詳細閲覧
- 関係性、目的、予算帯、結果、キーワードによる絞り込み
- Supabase Auth によるログイン機能
- 自分の相談履歴・体験談の閲覧
- マイページ、いいね機能などは余裕があれば追加

## ドキュメント一覧

- [docs/spec.md](docs/spec.md): アプリ全体の仕様
- [docs/api.md](docs/api.md): API仕様
- [docs/db.md](docs/db.md): DB設計
- [docs/tasks.md](docs/tasks.md): タスク一覧
- [docs/project-structure.md](docs/project-structure.md): フォルダ・ファイル構成の説明
- [docs/development-guide.md](docs/development-guide.md): 開発の進め方
- [docs/git-workflow.md](docs/git-workflow.md): Git / GitHub の運用ルール
- [docs/troubleshooting.md](docs/troubleshooting.md): よくあるエラーと対処法

## 開発の流れ

1. `docs/tasks.md` から担当する Issue を選ぶ
2. Issue 名に合わせて feature ブランチを切る
3. 実装後に PR を作成して main へ戻す

Issue 起点でブランチと PR を作ると、誰が何を進めているか分かりやすくなります。
PR 作成時には GitHub Actions で frontend build と backend test の簡易チェックが実行されます。

## 技術スタック

- Frontend: React, Vite, TypeScript, Tailwind CSS, shadcn/ui, React Router
- Backend: FastAPI, Python
- Database / Auth: Supabase, PostgreSQL, Supabase Auth
- AI: Gemini API
- Deploy: Vercel, Render または Railway

## プロジェクト構成

### 主要フォルダ

- [docs/](docs/): 仕様書と開発ガイド
- [frontend/](frontend/): React + Vite のフロントエンド
- [frontend/src/pages/](frontend/src/pages/): 各画面
- [frontend/src/components/](frontend/src/components/): 共通UI部品
- [frontend/src/features/](frontend/src/features/): 機能ごとのまとまり
- [frontend/src/services/](frontend/src/services/): API 呼び出し
- [frontend/src/types/](frontend/src/types/): 型定義
- [backend/](backend/): FastAPI のバックエンド
- [backend/app/api/routes/](backend/app/api/routes/): API ルート
- [backend/app/schemas/](backend/app/schemas/): request / response 型
- [backend/app/services/](backend/app/services/): Gemini や認証などの処理
- [backend/app/crud/](backend/app/crud/): DB 操作
- [backend/tests/](backend/tests/): テスト

```text
Okuru/
├─ README.md
├─ docs/
│  ├─ api.md
│  ├─ db.md
│  ├─ spec.md
│  └─ tasks.md
├─ frontend/
│  └─ src/
│     ├─ app/
│     ├─ components/
│     ├─ features/
│     ├─ hooks/
│     ├─ lib/
│     ├─ pages/
│     ├─ services/
│     ├─ styles/
│     └─ types/
└─ backend/
	├─ app/
	│  ├─ api/routes/
	│  ├─ core/
	│  ├─ crud/
	│  ├─ db/
	│  ├─ models/
	│  ├─ schemas/
	│  └─ services/
	└─ tests/
```

## .env.example の配置

- `frontend/.env.example`
- `backend/.env.example`

### frontend/.env.example

```env
# Local FastAPI URL. In Vercel, set this to the deployed backend URL.
VITE_API_BASE_URL=http://localhost:8000

# Supabase browser-safe project settings.
# These values are public in the built frontend. Do not put service role keys here.
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

### backend/.env.example

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

`DATABASE_URL` は、Supabase の Python クライアント中心で実装する場合は必須ではありません。必要になった場合のみ追加します。

## セットアップ方法

### 1. リポジトリを開く

```bash
git clone <repository-url>
cd Okuru
```

### 2. フロントエンドの準備

```bash
cd frontend
npm install
```

### 3. バックエンドの準備

```bash
cd ../backend
python -m venv .venv
```

Windows:

```powershell
.venv\Scripts\activate
```

macOS / Linux:

```bash
source .venv/bin/activate
```

```bash
pip install -r requirements.txt
```

### 4. 環境変数を設定

`.env.example` を参考に、フロントエンドとバックエンドの環境変数を設定します。

## 環境変数

### Frontend

- `VITE_API_BASE_URL`: FastAPI のベースURL
- `VITE_SUPABASE_URL`: Supabase プロジェクトURL
- `VITE_SUPABASE_ANON_KEY`: Supabase の anon key

Frontend deployment notes:

- Local `VITE_API_BASE_URL` is usually `http://localhost:8000`.
- Vercel `VITE_API_BASE_URL` must be the deployed backend origin, for example `https://<backend-app>.onrender.com`.
- Do not include `/api` at the end of `VITE_API_BASE_URL`; frontend services add `/api/...`.
- `VITE_SUPABASE_ANON_KEY` is public by design. Never put `SUPABASE_SERVICE_ROLE_KEY` in frontend env values.

### Backend

- `APP_ENV`: `development` / `production`
- `SUPABASE_URL`: Supabase プロジェクトURL
- `SUPABASE_SERVICE_ROLE_KEY`: サーバー側で利用する管理キー
- `SUPABASE_JWT_SECRET`: Supabase JWT 検証用シークレット
- `GEMINI_API_KEY`: Gemini API キー
- `GEMINI_MODEL`: Gemini のモデル名。実装時点で利用可能な無料枠や制限を確認して決定する
- `CORS_ORIGINS`: 許可するフロントエンドURLのカンマ区切り
- `FRONTEND_URL`: 本番フロントエンドURL
- `VERCEL_URL`: Vercel が自動で設定するURL。スキームなしの場合は `https://` として扱う

## Frontend Deploy: Vercel

Vercel project settings:

- Root Directory: `frontend`
- Framework Preset: Vite
- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: `dist`

Frontend environment variables:

```env
VITE_API_BASE_URL=https://<backend-app>.onrender.com
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<supabase-anon-key>
```

`frontend/vercel.json` rewrites every route to `index.html`, so React Router pages such as `/consultations/new` and `/stories/:storyId` keep working after refresh or direct access.

## 開発メンバーの役割分担

- Frontend: 画面作成、フォーム、API接続、結果表示、一覧・詳細画面、レスポンシブ対応
- Backend A: FastAPIセットアップ、AI相談API、プロンプト設計、JSON整形、エラー処理
- Backend B: Supabase DB設計、体験談API、相談履歴API、認証連携、検索・フィルタ機能

## 起動方法

### Frontend

```bash
cd frontend
npm run dev
```

### Backend

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

## API概要

- `GET /api/health`: ヘルスチェック
- `POST /api/consultations`: AI相談の作成と保存
- `GET /api/consultations`: 相談履歴一覧の取得
- `GET /api/consultations/{consultation_id}`: 相談履歴詳細の取得
- `PATCH /api/consultations/{consultation_id}`: 相談履歴の更新
- `DELETE /api/consultations/{consultation_id}`: 相談履歴の削除
- `POST /api/stories`: 体験談の投稿
- `GET /api/stories`: 体験談一覧の取得
- `GET /api/stories/{story_id}`: 体験談詳細の取得
- `PATCH /api/stories/{story_id}`: 体験談の更新
- `DELETE /api/stories/{story_id}`: 体験談の削除
- `GET /api/me/stories`: 自分の体験談一覧の取得

認証が必要なAPIでは、`Authorization: Bearer <supabase_jwt>` を付与します。

## 補足

- ハッカソン向けに、まずは認証ありの最小構成で作り、余裕があればマイページやいいね機能を追加します。
- AI返却値は必ずJSON形式で受け取り、フロント側で表示しやすい形に整えます。
