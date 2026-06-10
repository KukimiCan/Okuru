import type { ConsultationInput } from "../types/consultation";
import type { StoryInput } from "../types/story";

export type ValidationErrors = Record<string, string>;

function required(value: string) {
  return value.trim().length > 0;
}

export function validateConsultationInput(input: ConsultationInput): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!required(input.relationship)) {
    errors.relationship = "関係性を入力してください。";
  }

  if (!required(input.purpose)) {
    errors.purpose = "目的を入力してください。";
  }

  if (!Number.isFinite(input.budget_min) || input.budget_min < 0) {
    errors.budget_min = "予算下限は0円以上で入力してください。";
  }

  if (!Number.isFinite(input.budget_max) || input.budget_max < 0) {
    errors.budget_max = "予算上限は0円以上で入力してください。";
  }

  if (input.budget_min > input.budget_max) {
    errors.budget = "予算下限は上限以下にしてください。";
  }

  if (!required(input.desired_mood)) {
    errors.desired_mood = "希望する雰囲気を入力してください。";
  }

  if (input.note.length > 500) {
    errors.note = "補足メモは500文字以内で入力してください。";
  }

  return errors;
}

export function validateStoryInput(input: StoryInput): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!required(input.title)) {
    errors.title = "タイトルを入力してください。";
  } else if (input.title.length > 80) {
    errors.title = "タイトルは80文字以内で入力してください。";
  }

  if (!required(input.relationship)) {
    errors.relationship = "関係性を入力してください。";
  }

  if (!required(input.purpose)) {
    errors.purpose = "目的を入力してください。";
  }

  if (!required(input.gift_item)) {
    errors.gift_item = "贈ったものを入力してください。";
  }

  if (!required(input.body)) {
    errors.body = "本文を入力してください。";
  } else if (input.body.length > 2000) {
    errors.body = "本文は2000文字以内で入力してください。";
  }

  return errors;
}

export function hasValidationErrors(errors: ValidationErrors) {
  return Object.keys(errors).length > 0;
}
