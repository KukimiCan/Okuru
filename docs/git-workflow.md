# Git Workflow

このドキュメントは、Okuru での Git の使い方をまとめたものです。初心者メンバーが事故を減らすためのルールとして使います。

## 基本ルール

- main に直接 push しない
- `.env` は commit しない
- 1機能ごとに branch を分ける
- Pull Request を通して main に入れる

## ブランチ命名ルール

以下のような名前にします。

- `feature/consultation-form`
- `feature/story-list`
- `fix/cors-error`
- `chore/update-docs`

ルール:

- `feature/` は新機能
- `fix/` は不具合修正
- `chore/` は設定やドキュメントの更新

## commit message のルール

短く、何をしたかが分かるように書きます。

例:

- `feat: add consultation form`
- `fix: handle gemini response error`
- `docs: update api spec`
- `chore: add env example`

基本ルール:

- 1 commit には 1つの意味のある変更だけ入れる
- できれば `feat`, `fix`, `docs`, `chore` のような prefix を付ける

## Pull Request の書き方

Pull Request には次の内容を書くと分かりやすいです。

- 何を追加したか
- どこを変更したか
- 動作確認の方法
- 残っている課題

テンプレート例:

```markdown
## 概要

相談フォームと Gemini API 呼び出しを追加しました。

## 変更内容

- フロントの相談フォームを追加
- バックエンドの相談 API を追加
- 相談結果の保存処理を追加

## 確認方法

- frontend を起動してフォームを開く
- backend を起動して相談を送信する

## 補足

- 体験談編集は未対応
```

## コンフリクトが起きたときの方針

コンフリクトは、同じ行を複数人が変更したときに起きます。

対応方針:

1. まず相手の変更内容を確認する
2. どちらを残すかではなく、意図を比較する
3. 迷ったら実装した人に確認する
4. 解消後は必ず再度テストする

## .env の扱い

- `.env` と `.env.local` は commit しない
- 共有したい設定は `.env.example` に書く
- 本番用の秘密情報は PR に書かない

## 事故を防ぐための小ルール

- いきなり main で作業しない
- 大きな変更は小さく分ける
- PR を作る前に `git status` を見る
- 不要なファイルを一緒に commit しない
