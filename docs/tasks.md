# Okuru タスク一覧

GitHub Issues にそのまま分けやすいよう、担当領域と優先度で整理している。

## Frontend

- Must - FE-01: ルーティング構成を作成する
- Must - FE-02: トップページを作成する
- Must - FE-03: AIギフト相談フォームを作成する
- Must - FE-04: AI相談結果表示画面を作成する
- Must - FE-05: 体験談一覧画面を作成する
- Must - FE-06: 体験談詳細画面を作成する
- Must - FE-07: 体験談投稿画面を作成する
- Must - FE-08: APIクライアントを作成する
- Must - FE-09: 入力バリデーションを実装する
- Should - FE-10: レスポンシブ対応を整える
- Should - FE-11: ローディングとエラー表示を統一する
- Should - FE-12: 相談履歴一覧画面を作成する
- Could - FE-13: マイページ画面を作成する
- Could - FE-14: お気に入り一覧画面を作成する
- Could - FE-15: UIアニメーションを追加する
- Should - FE-16: 自分の体験談を編集できるUIを作成する
- Should - FE-17: 自分の体験談を削除できるUIを作成する
- Must - FE-18: Supabase Auth を使ったログイン画面を作成する
- Must - FE-19: 認証状態を管理し、認証必須ページを保護する

## Backend AI

- Must - AI-01: FastAPI のプロジェクト初期化を行う
- Must - AI-02: AI相談リクエストのスキーマを定義する
- Must - AI-03: Gemini API 連携を実装する
- Must - AI-04: プロンプトテンプレートを作成する
- Must - AI-05: JSONレスポンス整形を実装する
- Must - AI-06: AI応答の再試行とフォールバックを実装する
- Should - AI-07: 入力条件をログ保存できるようにする
- Should - AI-08: APIのテストコードを追加する
- Could - AI-09: プロンプトのバージョン管理を導入する

## Backend DB

- Must - DB-01: Supabase PostgreSQL のテーブル設計を確定する
- Must - DB-02: profiles テーブルを作成する
- Must - DB-03: gift_consultations テーブルを作成する
- Must - DB-04: gift_stories テーブルを作成する
- Must - DB-05: RLS 方針を決める
- Must - DB-06: 体験談一覧取得APIを実装する
- Must - DB-07: 体験談詳細取得APIを実装する
- Must - DB-08: 体験談投稿APIを実装する
- Must - DB-09: 相談履歴一覧APIを実装する
- Must - DB-10: 相談履歴詳細APIを実装する
- Should - DB-11: 関係性、目的、予算帯、結果で検索できるようにする
- Should - DB-12: キーワード検索を実装する
- Must - DB-13: Supabase Auth のJWT検証を実装する
- Could - DB-14: 相談結果のお気に入り更新APIを追加する
- Could - DB-15: 公開プロフィール取得APIを追加する
- Should - DB-16: 体験談編集APIを実装する
- Should - DB-17: 体験談削除APIを実装する

## Deploy

- Must - DEP-01: Frontend の環境変数を整理する
- Must - DEP-02: Backend の環境変数を整理する
- Must - DEP-03: Vercel 用のデプロイ設定を確認する
- Must - DEP-04: Render または Railway 用のデプロイ設定を確認する
- Should - DEP-05: CORS 設定を本番向けに調整する
- Should - DEP-06: 本番環境の接続確認手順をまとめる
- Could - DEP-07: GitHub Actions の簡易チェックを追加する
- Could - DEP-08: リリース前チェックリストを作成する

## 進め方の提案

1. Must を最優先で実装する
2. Should は時間があれば追加する
3. Could はデモの見栄えや余力で判断する

## Issue化しやすい単位

- 1 Issue = 1画面、1API、または1テーマの設定変更
- Frontend と Backend は並行で進める
- AI と DB は先に契約を固めると実装が早い
