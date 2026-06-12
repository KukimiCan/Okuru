export type Visibility = "private" | "public" | "unlisted";

export type ConsultationInput = {
  recipient_age_group: string;
  recipient_gender: string;
  relationship: string;
  purpose: string;
  budget_min: number;
  budget_max: number;
  hobbies: string[];
  avoid_items: string[];
  desired_mood: string;
  note: string;
};

export type GiftCandidate = {
  name: string;
  reason: string;
  budget_range: string;
  caution: string;
  suitable_for: string;
  message: string;
};

export type ConsultationResult = {
  summary: string;
  gift_candidates: GiftCandidate[];
  tips: string[];
  avoid: string[];
};

export type ConsultationCreateResponse = {
  consultation_id: string;
  input: ConsultationInput;
  result: ConsultationResult;
  created_at: string;
};

export type ConsultationListItem = {
  id: string;
  title: string;
  is_favorite: boolean;
  visibility: Visibility;
  created_at: string;
};

export type ConsultationDetail = {
  id: string;
  title: string;
  input: ConsultationInput;
  result: ConsultationResult;
  is_favorite: boolean;
  visibility: Visibility;
  created_at: string;
};

export type ConsultationUpdateInput = {
  is_favorite?: boolean;
  visibility?: Visibility;
  title?: string;
};

export type ConsultationUpdateResponse = {
  consultation_id: string;
  is_favorite: boolean;
  visibility: Visibility;
  title: string;
  updated_at?: string;
};

export type ConsultationDeleteResponse = {
  consultation_id: string;
};
