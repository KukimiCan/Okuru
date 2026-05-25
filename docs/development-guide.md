# Development Guide

このドキュメントは、開発を始めるときの流れをまとめたものです。初心者メンバーは、まずこの手順に沿って進めると迷いにくくなります。

## 開発開始の手順

### 1. main を最新にする

まず main ブランチの最新状態を取り込みます。

```bash
git checkout main
git pull origin main
```

### 2. feature ブランチを作る

作業用のブランチを作ります。Okuru では Issue ごとにブランチを切ると分かりやすくなります。

例:

```bash
git checkout -b feature/1-project-structure
```

Issue 番号や内容がブランチ名に入っていると、あとで追いやすくなります。

### 3. 必要なファイルを確認する

- 実装の内容は `docs/tasks.md`
- 画面や API の設計は `docs/spec.md` と `docs/api.md`
- DB は `docs/db.md`

### 4. 環境変数を準備する

`frontend/.env.example` と `backend/.env.example` を参考にして、`.env` を作成します。

## 起動方法

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
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
uvicorn app.main:app --reload --port 8000
```

## 実装後の確認項目

- 画面が表示されるか
- API に接続できるか
- 認証が必要な画面はログイン後に開けるか
- 入力フォームでエラーが出ないか
- `docs/api.md` の request / response と実装が一致しているか
- `docs/db.md` のカラム名と一致しているか

## commit, push, Pull Request の流れ

### 1. 変更を確認する

```bash
git status
```

### 2. commit する

例:

```bash
git add .
git commit -m "feat: add consultation form"
```

### 3. push する

```bash
git push origin feature/consultation-form
```

### 4. Pull Request を作る

GitHub 上で main 向けの Pull Request を作成します。Issue を起点に作業した場合は、PR の本文に Issue 番号を入れると追跡しやすくなります。

書く内容:

- 何を実装したか
- どの Issue に対応しているか
- 動作確認の方法
- 未完了の項目

PR を作ったら、必要に応じて Issue 側にもリンクを貼ります。

## 進め方のコツ

- 1回の作業は小さくする
- 画面だけ、APIだけ、DBだけを同時に大きく変えない
- わからないときは `docs/spec.md` を先に読む
