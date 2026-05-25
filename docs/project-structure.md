# Project Structure

このドキュメントは、Okuru のフォルダ構成を初心者向けに説明するためのものです。まずは「どこに何を書くか」を理解できれば十分です。

## 全体像

```text
Okuru/
├─ README.md
├─ docs/
│  ├─ api.md
│  ├─ backend-guide.md
│  ├─ db.md
│  ├─ development-guide.md
│  ├─ env-guide.md
│  ├─ frontend-guide.md
│  ├─ git-workflow.md
│  ├─ project-structure.md
│  ├─ spec.md
│  ├─ troubleshooting.md
│  └─ tasks.md
├─ frontend/
│  └─ src/
│     ├─ components/
│     ├─ features/
│     ├─ hooks/
│     ├─ lib/
│     ├─ pages/
│     ├─ services/
│     ├─ types/
│     └─ app/
└─ backend/
   ├─ app/
   │  ├─ api/
   │  │  └─ routes/
   │  ├─ core/
   │  ├─ crud/
   │  ├─ db/
   │  ├─ models/
   │  ├─ schemas/
   │  └─ services/
   └─ tests/
```

## frontend/src の役割

### pages

各画面の入口を置く場所です。たとえばトップページ、相談フォーム、体験談一覧など、ルーティングで表示する単位を置きます。

### components

複数の画面で使い回す部品を置きます。ボタン、カード、入力欄、モーダルなどの共通UIが該当します。

### features

機能ごとのまとまりを置きます。たとえば `consultation` や `story` のように、関連する画面、API呼び出し、型、処理をまとめます。

### hooks

React のカスタムフックを置きます。認証状態の取得、フォーム状態の共有、API呼び出しの再利用などに使います。

### lib

共通の便利関数を置きます。日付の整形、文字列の加工、バリデーション補助など、画面に依存しない処理を入れます。

### services

API を呼び出す処理を置きます。フロントエンドから FastAPI を呼ぶための関数をまとめる場所です。

### types

TypeScript の型定義を置きます。API のリクエストやレスポンス、画面で使うデータの形をここで揃えます。

### app

アプリ全体の設定を置きます。ルーティング設定、プロバイダ設定、グローバルな初期化処理などが入ります。

## backend/app の役割

### api/routes

HTTP エンドポイントを置きます。`GET /api/stories` や `POST /api/consultations` のようなルーティング定義をここで書きます。

### core

アプリ全体の設定を置きます。環境変数の読み込み、CORS 設定、認証の共通処理などを入れます。

### crud

CRUD は Create, Read, Update, Delete の略です。データベースに対する追加、取得、更新、削除の処理をまとめます。

### db

DB 接続やセッション管理など、データベースに関する土台を置きます。Supabase を使う場合でも、共通の DB ユーティリティをここにまとめます。

### models

テーブルに対応するデータ構造を置きます。SQLAlchemy を使う場合は ORM モデル、もしくはアプリ内部用のモデルを置きます。

### schemas

API の入出力の型を置きます。FastAPI では Pydantic のモデルとして、リクエストとレスポンスの形を定義します。

### services

Gemini API 呼び出しや Supabase JWT の検証など、複数の処理を組み合わせるロジックを置きます。

## 新しい画面を追加するとき

1. `frontend/src/pages` に画面コンポーネントを追加します。
2. 必要なら `frontend/src/features` に機能ごとの処理を追加します。
3. 共通部品が必要なら `frontend/src/components` に追加します。
4. API を使うなら `frontend/src/services` に呼び出し関数を追加します。
5. データの形が変わるなら `frontend/src/types` に型を追加します。
6. ルーティング設定を `frontend/src/app` で更新します。

## 新しいAPIを追加するとき

1. `backend/app/schemas` に request / response の型を追加します。
2. `backend/app/services` に処理が必要なら追加します。
3. `backend/app/crud` に DB 操作を追加します。
4. `backend/app/api/routes` にエンドポイントを追加します。
5. 必要なら `backend/app/core` で認証や設定を調整します。
6. データ構造が変わるなら `backend/app/models` を更新します。

## 迷ったときの考え方

- 画面の見た目や操作に関するものは frontend に置く
- API の入力・出力の形は schemas に置く
- Gemini API や認証のような共通処理は services に置く
- DB を直接触る処理は crud に置く
