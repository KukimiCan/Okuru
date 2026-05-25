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

- `docs/spec.md`: アプリ全体の仕様
- `docs/api.md`: API仕様
- `docs/db.md`: DB設計
- `docs/tasks.md`: タスク一覧
- `docs/project-structure.md`: フォルダ・ファイル構成の説明
- `docs/development-guide.md`: 開発の進め方
- `docs/git-workflow.md`: Git / GitHub の運用ルール
- `docs/troubleshooting.md`: よくあるエラーと対処法


## 技術スタック

- Frontend: React, Vite, TypeScript, Tailwind CSS, shadcn/ui, React Router
- Backend: FastAPI, Python
- Database / Auth: Supabase, PostgreSQL, Supabase Auth
- AI: Gemini API
- Deploy: Vercel, Render または Railway

## プロジェクト構成

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
VITE_API_BASE_URL=http://localhost:8000
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
CORS_ORIGINS=http://localhost:5173
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

### Backend

- `APP_ENV`: `development` / `production`
- `SUPABASE_URL`: Supabase プロジェクトURL
- `SUPABASE_SERVICE_ROLE_KEY`: サーバー側で利用する管理キー
- `SUPABASE_JWT_SECRET`: Supabase JWT 検証用シークレット
- `GEMINI_API_KEY`: Gemini API キー
- `GEMINI_MODEL`: Gemini のモデル名。実装時点で利用可能な無料枠や制限を確認して決定する
- `CORS_ORIGINS`: 許可するフロントエンドURLのカンマ区切り

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
