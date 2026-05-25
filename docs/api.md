# Okuru API 仕様書

## 1. 共通仕様

- Base URL: `/api`
- データ形式: `application/json`
- 認証: Supabase JWT を `Authorization: Bearer <token>` で送信する想定
- 日付形式: ISO 8601

## 2. 共通レスポンス例

### 成功

```json
{
  "data": {},
  "message": "success"
}
```

### エラー

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "入力内容を確認してください",
    "details": []
  }
}
```

## 3. エンドポイント一覧

### 3.1 ヘルスチェック

- 認証不要
- `GET /api/health`

#### Response

```json
{
  "data": {
    "status": "ok"
  },
  "message": "success"
}
```

### 3.2 AI相談の作成と保存

- 認証必須
- `POST /api/consultations`

#### Request Body

```json
{
  "recipient_age_group": "20s",
  "recipient_gender": "unspecified",
  "relationship": "friend",
  "purpose": "birthday",
  "budget_min": 3000,
  "budget_max": 5000,
  "hobbies": ["coffee", "reading"],
  "avoid_items": ["香りが強いもの", "大きくて置き場所に困るもの"],
  "desired_mood": "practical",
  "note": "仕事が忙しい人です"
}
```

#### Response Example

```json
{
  "data": {
    "consultation_id": "consultation_123",
    "input": {
      "recipient_age_group": "20s",
      "recipient_gender": "unspecified",
      "relationship": "friend",
      "purpose": "birthday",
      "budget_min": 3000,
      "budget_max": 5000,
      "hobbies": ["coffee", "reading"],
      "avoid_items": ["香りが強いもの", "大きくて置き場所に困るもの"],
      "desired_mood": "practical",
      "note": "仕事が忙しい人です"
    },
    "result": {
      "summary": "実用性を重視した提案です",
      "gift_candidates": [
        {
          "name": "ギフト候補A",
          "reason": "相手の趣味に合うため",
          "budget_range": "3000-5000円",
          "caution": "サイズ確認が必要",
          "suitable_for": "忙しい社会人",
          "message": "お仕事の合間に使ってね"
        }
      ],
      "tips": ["実用性を優先する"],
      "avoid": ["好みが強く分かれるもの"]
    },
    "created_at": "2026-05-25T12:00:00Z"
  },
  "message": "success"
}
```

#### Error Examples

```json
{
  "error": {
    "code": "AI_PROVIDER_ERROR",
    "message": "AIの応答取得に失敗しました",
    "details": []
  }
}
```

### 3.3 AI相談履歴一覧取得

- 認証必須
- `GET /api/consultations`

#### Query Parameters

- `page`: ページ番号
- `limit`: 取得件数
- `favorite`: `true` / `false`
- `visibility`: `public` / `private` / `unlisted`

#### Response Example

```json
{
  "data": {
    "items": [
      {
        "id": "consultation_123",
        "title": "友人への誕生日ギフト相談",
        "is_favorite": true,
        "visibility": "private",
        "created_at": "2026-05-25T12:00:00Z"
      }
    ],
    "page": 1,
    "limit": 10,
    "total": 1
  },
  "message": "success"
}
```

### 3.4 AI相談履歴詳細取得

- 認証必須
- `GET /api/consultations/{consultation_id}`

#### Response Example

```json
{
  "data": {
    "id": "consultation_123",
    "input": {},
    "result": {},
    "is_favorite": true,
    "visibility": "private",
    "created_at": "2026-05-25T12:00:00Z"
  },
  "message": "success"
}
```

### 3.5 AI相談履歴更新

- 認証必須
- `PATCH /api/consultations/{consultation_id}`

#### Request Body

```json
{
  "is_favorite": true,
  "visibility": "private",
  "title": "友人への誕生日ギフト相談"
}
```

#### Response Example

```json
{
  "data": {
    "consultation_id": "consultation_123",
    "is_favorite": true,
    "visibility": "private",
    "title": "友人への誕生日ギフト相談",
    "updated_at": "2026-05-25T12:20:00Z"
  },
  "message": "success"
}
```

### 3.6 AI相談履歴削除

- 認証必須
- `DELETE /api/consultations/{consultation_id}`

#### Response Example

```json
{
  "data": {
    "consultation_id": "consultation_123"
  },
  "message": "success"
}
```

### 3.7 体験談投稿

- 認証必須
- `POST /api/stories`

#### Request Body

```json
{
  "title": "友人の誕生日に実用品を贈って喜ばれた話",
  "relationship": "friend",
  "purpose": "birthday",
  "budget_range": "3000-5000",
  "gift_item": "コーヒー関連グッズ",
  "result": "success",
  "body": "相手の趣味に合わせたらかなり喜ばれた。",
  "visibility": "public",
  "keywords": ["coffee", "practical"]
}
```

#### Response Example

```json
{
  "data": {
    "id": "story_123",
    "created_at": "2026-05-25T12:10:00Z"
  },
  "message": "success"
}
```

### 3.8 体験談一覧取得

- 認証不要
- `GET /api/stories`

#### Query Parameters

- `page`: ページ番号
- `limit`: 取得件数
- `relationship`: 関係性
- `purpose`: 目的
- `budget_range`: 予算帯
- `result`: `success` / `normal` / `failure`
- `keyword`: キーワード検索

`keyword` はまず以下の部分一致検索を行う。

- `title`
- `gift_item`
- `body`

`keywords` 配列検索は将来的な拡張として扱う。

#### Response Example

```json
{
  "data": {
    "items": [
      {
        "id": "story_123",
        "title": "友人の誕生日に実用品を贈って喜ばれた話",
        "result": "success",
        "budget_range": "3000-5000",
        "created_at": "2026-05-25T12:10:00Z"
      }
    ],
    "page": 1,
    "limit": 12,
    "total": 1
  },
  "message": "success"
}
```

### 3.9 体験談詳細取得

- 認証不要
- `GET /api/stories/{story_id}`

#### Response Example

```json
{
  "data": {
    "id": "story_123",
    "title": "友人の誕生日に実用品を贈って喜ばれた話",
    "relationship": "friend",
    "purpose": "birthday",
    "budget_range": "3000-5000",
    "gift_item": "コーヒー関連グッズ",
    "result": "success",
    "body": "相手の趣味に合わせたらかなり喜ばれた。",
    "visibility": "public",
    "keywords": ["coffee", "practical"],
    "created_at": "2026-05-25T12:10:00Z"
  },
  "message": "success"
}
```

### 3.10 体験談編集

- 認証必須
- `PATCH /api/stories/{story_id}`

#### Request Body

```json
{
  "title": "友人の誕生日に実用品を贈って喜ばれた話",
  "relationship": "friend",
  "purpose": "birthday",
  "budget_range": "3000-5000",
  "gift_item": "コーヒー関連グッズ",
  "result": "success",
  "body": "相手の趣味に合わせたらかなり喜ばれた。",
  "visibility": "public",
  "keywords": ["coffee", "practical"]
}
```

#### Response Example

```json
{
  "data": {
    "story_id": "story_123",
    "updated_at": "2026-05-25T12:30:00Z"
  },
  "message": "success"
}
```

### 3.11 体験談削除

- 認証必須
- `DELETE /api/stories/{story_id}`

#### Response Example

```json
{
  "data": {
    "story_id": "story_123"
  },
  "message": "success"
}
```

### 3.12 自分の相談履歴取得

- `GET /api/me/consultations`

このエンドポイントは MVP では使用しない。自分の相談履歴一覧は `GET /api/consultations` に統一する。

#### Response Example

```json
{
  "data": {
    "items": [],
    "page": 1,
    "limit": 10,
    "total": 0
  },
  "message": "success"
}
```

### 3.13 自分の体験談一覧取得

- 認証必須
- `GET /api/me/stories`

#### Response Example

```json
{
  "data": {
    "items": [],
    "page": 1,
    "limit": 10,
    "total": 0
  },
  "message": "success"
}
```

`GET /api/me/stories` は自分の投稿一覧を返す補助APIとして残し、体験談の公開一覧は `GET /api/stories` に統一する。

## 4. 共通エラー例

### 400 Bad Request

```json
{
  "error": {
    "code": "BAD_REQUEST",
    "message": "リクエスト形式が不正です",
    "details": []
  }
}
```

### 401 Unauthorized

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "認証が必要です",
    "details": []
  }
}
```

### 404 Not Found

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "対象データが見つかりません",
    "details": []
  }
}
```

### 500 Internal Server Error

```json
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "サーバーエラーが発生しました",
    "details": []
  }
}
```

## 5. 実装メモ

- フロント側では `data` のみを参照して描画する
- AI返却値は `gift_candidates` を中心に表示する
- 一覧系は page/limit に加え、後から cursor 方式に変更しやすい形にする
- 認証が必要なAPIでは FastAPI 側で Supabase JWT を検証する
