import type { Visibility } from "./consultation";

export type StoryResult = "success" | "normal" | "failure";

export type StoryInput = {
  title: string;
  relationship: string;
  purpose: string;
  budget_range: string;
  gift_item: string;
  result: StoryResult;
  body: string;
  visibility: Visibility;
  keywords: string[];
};

export type StoryUpdateResponse = {
  story_id: string;
  updated_at: string;
};

export type StoryDeleteResponse = {
  story_id: string;
};

export type StoryListItem = {
  id: string;
  title: string;
  result: StoryResult;
  budget_range: string;
  created_at: string;
};

export type MyStoryListItem = StoryListItem & {
  visibility: Visibility;
  updated_at: string;
};

export type Story = StoryInput & {
  id: string;
  user_id?: string;
  created_at: string;
  updated_at?: string;
};

export type StoryListQuery = {
  page?: number;
  limit?: number;
  relationship?: string;
  purpose?: string;
  budget_range?: string;
  result?: StoryResult;
  keyword?: string;
};
