# Okuru DB 設計

Supabase PostgreSQL を前提とした最小構成のテーブル設計である。ユーザー認証は Supabase Auth を使い、アプリ固有の情報は独自テーブルで管理する。

## 1. 設計方針

- ユーザーの正本は `auth.users`
- アプリ側の表示名やプロフィールは `profiles`
- AI相談は入力内容とAI回答を同一レコードで保持する
- 体験談は一覧検索しやすいように主要条件を個別カラムで持つ
- 公開範囲は `private` / `public` / `unlisted` を基本とする
- いいね機能は MVP では実装しない。将来的に実装する場合は `story_likes` テーブルを追加する

## 2. テーブル一覧

- `profiles`
- `gift_consultations`
- `gift_stories`

## 3. SQL

```sql
create extension if not exists pgcrypto;

do $$ begin
  create type public.content_visibility as enum ('private', 'public', 'unlisted');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.story_result as enum ('success', 'normal', 'failure');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gift_consultations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  input_conditions jsonb not null,
  ai_response jsonb not null,
  is_favorite boolean not null default false,
  visibility public.content_visibility not null default 'private',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_gift_consultations_user_id on public.gift_consultations(user_id);
create index if not exists idx_gift_consultations_visibility on public.gift_consultations(visibility);
create index if not exists idx_gift_consultations_favorite on public.gift_consultations(is_favorite);

create table if not exists public.gift_stories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  relationship text not null,
  purpose text not null,
  budget_range text not null,
  gift_item text not null,
  result public.story_result not null,
  body text not null,
  keywords text[] not null default '{}',
  visibility public.content_visibility not null default 'public',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_gift_stories_visibility on public.gift_stories(visibility);
create index if not exists idx_gift_stories_relation on public.gift_stories(relationship);
create index if not exists idx_gift_stories_purpose on public.gift_stories(purpose);
create index if not exists idx_gift_stories_budget_range on public.gift_stories(budget_range);
create index if not exists idx_gift_stories_result on public.gift_stories(result);
create index if not exists idx_gift_stories_keywords on public.gift_stories using gin(keywords);
```

## 4. カラム説明

### 4.1 profiles

- `id`: auth.users と一致するユーザーID
- `display_name`: 表示名
- `avatar_url`: アイコンURL
- `bio`: 自己紹介
- `created_at`: 作成日時
- `updated_at`: 更新日時

### 4.2 gift_consultations

- `id`: 相談レコードのID
- `user_id`: 作成者ID
- `title`: 相談タイトル
- `input_conditions`: 入力条件をまとめた JSON
- `ai_response`: AIの返答JSON
- `is_favorite`: お気に入りフラグ
- `visibility`: 公開範囲
- `created_at`: 作成日時
- `updated_at`: 更新日時

### 4.3 gift_stories

- `id`: 体験談レコードのID
- `user_id`: 作成者ID
- `title`: タイトル
- `relationship`: 贈った相手との関係性
- `purpose`: 贈る目的
- `budget_range`: 予算帯
- `gift_item`: 実際に贈ったもの
- `result`: 成功 / 普通 / 失敗
- `body`: 本文
- `keywords`: 検索用キーワード配列
- `visibility`: 公開範囲
- `created_at`: 作成日時
- `updated_at`: 更新日時

## 5. 想定するRLS方針

### profiles

- select: 自分のプロフィール、または公開プロフィールのみ
- insert: 自分の `user_id` のみ
- update: 自分のプロフィールのみ
- delete: 原則なし

### gift_consultations

- select: 自分の相談、または `public` の相談
- insert: 認証済みユーザーのみ、自分の `user_id` で作成
- update: 自分の相談のみ
- delete: 自分の相談のみ

### gift_stories

- select: `public` の体験談、または自分の体験談
- insert: 認証済みユーザーのみ、自分の `user_id` で作成
- update: 自分の体験談のみ
- delete: 自分の体験談のみ

## 6. 補足

- `input_conditions` と `ai_response` は柔軟性を重視して JSONB にしている
- 体験談の検索条件が増えた場合は、必要に応じて正規化テーブルを追加する
- ハッカソン段階ではこの構成で十分実装可能である
- `visibility` は `private`=自分だけ、`public`=一覧や検索に表示、`unlisted`=URL を知っている人のみ閲覧可
- MVP では主に `private` と `public` を使用し、`unlisted` は DB 上に用意するが積極利用しない
- `updated_at` は MVP ではアプリケーション側で更新する。余裕があれば PostgreSQL の trigger で自動更新する
