# Backend Guide

このドキュメントは、バックエンド担当向けの実装ガイドです。FastAPI を使って API を作るときの基本方針をまとめています。

## 基本方針

- `routes` は入口
- `schemas` は入出力の型
- `services` は処理の組み立て
- `crud` は DB 操作
- Gemini API や Supabase の認証は `services` で扱う

## 各フォルダの役割

### routes

HTTP エンドポイントを定義します。URL、HTTP メソッド、認証の有無などをここで決めます。

### schemas

リクエストとレスポンスの形を定義します。FastAPI では Pydantic モデルを使います。

### services

複数の処理をまとめます。たとえば、ユーザー入力を整える、Gemini API に投げる、レスポンスを JSON に整形する、認証情報を確認する、などです。

### crud

データベースの読み書きをまとめます。`create`, `read`, `update`, `delete` の処理をここに置きます。

## API 追加手順

1. `schemas` に request / response を追加する
2. 必要なら `services` に処理を追加する
3. `crud` に DB 操作を追加する
4. `routes` にエンドポイントを追加する
5. `docs/api.md` を更新する

## Gemini API 連携

Okuru では Gemini API を使ってギフト提案を作ります。

方針:

- ユーザー入力をそのまま投げず、必要な項目を整理して送る
- 回答は JSON 形式にそろえる
- JSON に変換できないときは再試行する
- 再試行でも失敗したら、安全なフォールバック結果を返す
- 禁止事項や不適切表現が含まれる場合はフィルタリングして安全な案に整える

実装時の注意:

- モデル名は固定しすぎず、`GEMINI_MODEL` で切り替えられるようにする
- 無料枠や制限は実装時に確認する

## Supabase JWT 検証

認証が必要な API では、`Authorization: Bearer <supabase_jwt>` を受け取ります。

環境変数 `SUPABASE_JWKS_URL` に Supabase の JWKS URL を設定します。

```text
https://<project-ref>.supabase.co/auth/v1/.well-known/jwks.json
```

流れ:

1. ヘッダーから JWT を取り出す
2. Supabase の JWT として検証する
3. 検証できたら user_id を取り出す
4. user_id を使って自分のデータだけ操作できるようにする

## エラー処理方針

- 入力エラーは 400 系にする
- 認証エラーは 401 にする
- データがない場合は 404 にする
- 想定外のエラーは 500 にする

返却の考え方:

- フロントが読みやすい JSON にする
- エラーコードを付ける
- エラーメッセージは短く分かりやすくする

## 初心者向けのコツ

- 最初は 1 エンドポイントずつ作る
- `schemas` と `routes` を先に作ると迷いにくい
- Gemini と DB を同時に大きく変えない
