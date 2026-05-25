# Frontend Guide

このドキュメントは、フロントエンド担当向けの実装方針をまとめたものです。React と TypeScript に慣れていない人でも、どこを触ればよいか分かるようにしています。

## 基本方針

- 画面は `pages` に置く
- 共通部品は `components` に置く
- API 呼び出しは `services` にまとめる
- 型は `types` に置く
- 認証状態はアプリ全体で共有する

## ページ追加の方針

1. `frontend/src/pages` に新しいページを作る
2. `frontend/src/app` でルーティングを追加する
3. 必要な共通UIがあれば `components` に置く
4. API が必要なら `services` を追加する

## API 呼び出しの方針

- 直接ページの中に fetch を大量に書かない
- `services` にまとめて再利用しやすくする
- request と response の形は `types` でそろえる

例:

- `consultationService.ts`
- `storyService.ts`
- `authService.ts`

## 型定義の方針

TypeScript の型は、API と画面の両方で使えるようにします。

例:

- `ConsultationInput`
- `ConsultationResult`
- `Story`
- `StoryListItem`
- `UserProfile`

## 共通コンポーネントの方針

以下のような部品は共通化します。

- ボタン
- テキスト入力
- セलेकト
- テキストエリア
- カード
- モーダル
- ローディング表示
- エラー表示

共通部品にすると、見た目と操作感を揃えやすくなります。

## 認証状態管理の方針

Supabase Auth を使います。

考え方:

- ログインしているかどうかをアプリ全体で持つ
- ログインが必要なページは保護する
- 401 が返ったら再ログインを促す

実装のイメージ:

- `AuthContext` などでログイン状態を管理する
- `ProtectedRoute` のような仕組みで認証必須ページを守る
- ログイン後はユーザー情報を再取得する

## 画面実装のコツ

- まずは表示だけ作る
- 次に API をつなぐ
- 最後にバリデーションやエラー表示を足す

## 初心者向けの注意

- 1つの画面に全部詰め込まない
- 迷ったら `pages` と `components` の役割を分ける
- API で受け取る形を先に `types` に書くと実装しやすい
