# Okuru 仕様書

## 1. サービス概要

Okuru は、贈る相手の情報をもとに AI がギフト候補を提案し、さらに他ユーザーの体験談からも判断材料を得られるプレゼント選び支援アプリである。AI の提案だけでなく、成功談・失敗談といった実体験を参照できることを強みとする。

## 2. 目的

- プレゼント選びの迷いを減らす
- 予算や関係性に応じた候補を短時間で比較できるようにする
- 実体験ベースの情報を蓄積し、提案の納得感を高める

## 3. 想定ユーザー

- 誕生日や記念日のプレゼントを探している人
- 相手に合うギフトを短時間で絞り込みたい人
- 実際に贈った人の経験談を参考にしたい人

## 4. MVPの範囲

### 実装する機能

- AIギフト相談フォーム
- AI相談結果表示
- AI相談結果の保存
- 体験談投稿
- 体験談一覧表示
- 体験談詳細表示
- 検索・フィルタ
- Supabase Auth を使った基本認証連携

### 余裕があれば実装する機能

- 相談履歴の編集・削除
- 体験談の編集・削除
- 自分の相談履歴一覧
- 相談履歴のお気に入り更新
- マイページ
- いいね機能
- お気に入り機能

## 5. 今回実装しない機能

- Amazon や楽天などのECサイト連携
- 決済機能
- コメント機能
- フォロー機能
- 画像アップロード
- 管理者画面
- 高度な推薦アルゴリズム

## 6. 画面一覧

- トップページ
- AIギフト相談ページ
- AI相談結果ページ
- 相談履歴一覧ページ
- 体験談一覧ページ
- 体験談詳細ページ
- 体験談投稿ページ
- ログインページ
- マイページ

## 7. 画面とAPIの対応

- トップページ
  - GET /api/stories

- AIギフト相談ページ
  - POST /api/consultations

- AI相談結果ページ
  - GET /api/consultations/{consultation_id}
  - PATCH /api/consultations/{consultation_id}

- 相談履歴一覧ページ
  - GET /api/consultations

- 体験談一覧ページ
  - GET /api/stories

- 体験談詳細ページ
  - GET /api/stories/{story_id}

- 体験談投稿ページ
  - POST /api/stories

- 体験談編集ページ
  - PATCH /api/stories/{story_id}

- ログインページ
  - Supabase Auth によるサインイン

- マイページ
  - GET /api/me/stories

## 8. 機能一覧

### 8.1 AIギフト相談機能

入力項目:

- 贈る相手の年齢層
- 性別、または指定なし
- 自分との関係性
- 贈る目的
- 予算
- 相手の趣味・特徴
- 避けたいもの
- 希望する雰囲気
- 補足メモ

出力項目:

- おすすめギフト候補
- それぞれの理由
- 予算感
- 注意点
- 向いている相手
- 渡すときの一言
- 選び方のコツ
- 避けた方がよいこと

### 8.2 AI相談結果の保存

- 入力条件を保存する
- AI回答を保存する
- 作成日時を保存する
- お気に入りフラグを持つ
- 公開設定を持つ

### 8.3 体験談の投稿

- タイトル
- 贈った相手
- 目的
- 予算帯
- 贈ったもの
- 成功 / 普通 / 失敗
- 本文
- 公開設定

### 8.4 体験談一覧の閲覧

- 公開体験談をカード形式で表示
- 関係性、目的、予算帯、成功/失敗、キーワードで絞り込み

### 8.5 体験談詳細表示

- 投稿内容の詳細を表示
- 関連する条件や評価をまとめて見られるようにする

## 9. 画面ごとの役割

- トップページ: サービス説明、主要導線、人気体験談の導入
- AIギフト相談ページ: 入力フォームの主画面
- AI相談結果ページ: 候補、理由、注意点の表示
- 相談履歴一覧ページ: 保存済み相談の一覧
- 体験談一覧ページ: フィルタ付き一覧
- 体験談詳細ページ: 1件の体験談を詳しく読む
- 体験談投稿ページ: 新規体験談の投稿
- ログインページ: Supabase Auth 連携
- マイページ: 自分の履歴、保存データの管理

## 10. API設計の方針

- フロントエンドは FastAPI を通してデータを取得する
- AI相談は JSON スキーマを固定して返却する
- 一覧系 API はページングとフィルタを標準対応にする
- 認証が必要な操作は Supabase の JWT を検証する
- エラー形式はフロントで扱いやすい共通形式に統一する

### .env.example の配置

- `frontend/.env.example`
- `backend/.env.example`

`frontend/.env.example` には `VITE_API_BASE_URL=http://localhost:8000`、`VITE_SUPABASE_URL`、`VITE_SUPABASE_ANON_KEY` を置く。

`backend/.env.example` には `APP_ENV=development`、`SUPABASE_URL`、`SUPABASE_SERVICE_ROLE_KEY`、`SUPABASE_JWT_SECRET`、`GEMINI_API_KEY`、`GEMINI_MODEL`、`CORS_ORIGINS=http://localhost:5173` を置く。

`DATABASE_URL` は必要に応じて追加する任意項目として扱う。

### 認証要件

- `GET /api/health`: 認証不要
- `GET /api/stories`: 認証不要
- `GET /api/stories/{story_id}`: 認証不要
- `POST /api/consultations`: 認証必須
- `GET /api/consultations`: 認証必須
- `GET /api/consultations/{consultation_id}`: 認証必須
- `PATCH /api/consultations/{consultation_id}`: 認証必須
- `DELETE /api/consultations/{consultation_id}`: 認証必須
- `POST /api/stories`: 認証必須
- `PATCH /api/stories/{story_id}`: 認証必須
- `DELETE /api/stories/{story_id}`: 認証必須
- `GET /api/me/stories`: 認証必須

認証が必要なAPIでは、`Authorization: Bearer <supabase_jwt>` を送信する。

## 11. DB設計の方針

- ユーザー情報は Supabase Auth を正とする
- アプリ独自の表示名などは profiles に保持する
- AI相談結果は入力条件とAI回答を分けず、1レコードにまとめて保存する
- 体験談は検索しやすいように主要な条件を個別カラムで持つ
- 公開範囲は private / public / unlisted の3段階を基本とする

### visibility の意味

- private: 自分だけが閲覧できる
- public: 一覧や検索に表示される
- unlisted: URL を知っている人だけ閲覧できる。一覧や検索には表示されない

MVPでは主に `private` と `public` を使い、`unlisted` は DB 上に用意するが積極利用しない。

## 12. AIプロンプト設計

### 12.1 設計方針

- 回答は必ず JSON で返す
- 余計な説明や会話文を含めない
- トップレベルは `output` に統一する
- 候補数は 3 件前後を基本とする
- 予算超過を避ける
- 相手の年齢層や関係性に合わない提案を減らす
- 抽象的な表現だけで終わらず、渡し方や注意点まで返す

### 12.2 system prompt の整理

- AI はギフト提案アシスタントとして振る舞う
- 必ず JSON のみを出力する
- `output` に指定した構造を厳密に守る
- 余計な説明や会話文を含めない
- 例外があっても JSON で返す

### 12.3 入力の考え方

システム側で以下を整理して AI に渡す。リクエストは `input` オブジェクトとして構造化し、フロントと同じ名称を使う。

- `recipient_age_group`: リストから選択した文字列
- `recipient_gender`: 性別または `unspecified` を表す文字列
- `relationship`: 自分との関係性を表す文字列
- `purpose`: 贈る目的を表す文字列
- `budget_min`: 数値。`budget_max` と合わせて予算範囲を表す。どちらか一方は必須。
- `budget_max`: 数値。`budget_min` と合わせて予算範囲を表す。どちらか一方は必須。
- `hobbies`: 文字列配列。空の場合は `[]` とする。
- `avoid_items`: 文字列配列。空の場合は `[]` とする。
- `desired_mood`: 希望する雰囲気を表す文字列
- `note`: 補足メモを表す文字列

`budget_min` または `budget_max` が未指定の場合は `null` を送信し、両方未指定は許容しない。

```json
{
  "input": {
    "recipient_age_group": "中学2年生",
    "recipient_gender": "unspecified",
    "relationship": "friend",
    "purpose": "birthday",
    "budget_min": 3000,
    "budget_max": 5000,
    "hobbies": ["coffee", "reading"],
    "avoid_items": ["香りが強いもの", "大きくて置き場所に困るもの"],
    "desired_mood": "practical",
    "note": "部活が忙しいひとです"
  }
}
```

### 12.4 出力 JSON の想定形

AI は以下の構造を返す。トップレベルは `output` で、JSON 形式のみを出力する。

```json
{
  "output": {
    "summary": "",
    "gift_candidates": [
      {
        "name": "",
        "reason": "",
        "budget_range": "",
        "caution": "",
        "suitable_for": "",
        "message": ""
      }
    ],
    "tips": [""],
    "avoid": [""]
  }
}
```

- `summary`: 提案全体の要約
- `gift_candidates`: ギフト候補の配列
- `tips`: 選び方や渡し方のコツ
- `avoid`: 避けるべきポイント

### 12.5 禁止事項 / 注意事項

- `output` 以外のトップレベルキーを追加しない
- 会話形式や説明文を混ぜない
- 特定のブランドや販売サイトを推奨しない
- 個人情報やプライバシーに関する質問を含めない
- 予算や条件に合わない候補を提案しない

### 12.6 実装上の補足

- バックエンドでは AI 応答を JSON パースし、形式が崩れていれば再試行またはフォールバックする
- レスポンスの安定性を高めるため、プロンプトは `system` と `user` の役割を分けて構築する
- AI からの結果は `result` などの別名ではなく、明示的に `output` で受け取る

### 12.7 エラー時の扱い

- JSON パース失敗時は再試行する
- 再試行でも失敗した場合は安全なフォールバック文言を返す
- 禁止事項や不適切表現が含まれる場合はフィルタリングし、制限付きの安全な結果に整える

## 13. 開発スケジュール

### Day 1

- 要件確定
- 画面遷移の整理
- DB設計
- API設計
- フロントとバックの骨組み作成

### Day 2

- AI相談API実装
- 体験談API実装
- フロントの主要画面実装
- Supabase 接続確認

### Day 3

- 検索・フィルタ実装
- UI調整
- 動作確認
- 発表資料作成

## 14. タスク分担

### Frontend

- 相談フォーム
- 結果表示画面
- 体験談一覧
- 体験談投稿画面
- レスポンシブ対応

### Backend A

- FastAPI セットアップ
- AI相談API
- プロンプト設計
- JSON整形とエラー処理

### Backend B

- Supabase DB設計
- 体験談API
- 相談履歴API
- 認証連携
- 検索・フィルタ機能

## 15. 成功条件

### 最小成功条件

- ログインできる
- AI相談フォームから Gemini API の結果が返る
- AI相談結果が保存される
- 体験談を投稿できる
- 公開体験談の一覧と詳細が見られる

### 時間があれば

- 体験談の編集・削除
- 相談履歴のお気に入り
- 検索・フィルタの強化
- マイページ
