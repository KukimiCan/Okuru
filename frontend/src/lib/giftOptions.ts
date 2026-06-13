import type { Visibility } from "../types/consultation";
import type { StoryResult } from "../types/story";

export const RELATIONSHIP_OPTIONS = [
  "友人",
  "恋人・パートナー",
  "家族",
  "同僚・上司",
  "その他",
] as const;

export const PURPOSE_OPTIONS = [
  "誕生日",
  "記念日",
  "お礼",
  "退職・送別",
  "季節の贈り物",
  "その他",
] as const;

export const BUDGET_RANGE_OPTIONS = [
  { value: "1000-3000", label: "1,000〜3,000円" },
  { value: "3000-5000", label: "3,000〜5,000円" },
  { value: "5000-10000", label: "5,000〜10,000円" },
  { value: "10000+", label: "10,000円以上" },
] as const;

export const resultLabels: Record<StoryResult, string> = {
  success: "成功",
  normal: "普通",
  failure: "失敗",
};

export const visibilityLabels: Record<Visibility, string> = {
  private: "非公開",
  public: "公開",
  unlisted: "限定公開",
};

export const resultBadgeClasses: Record<StoryResult, string> = {
  success: "placeholder-label-success",
  normal: "placeholder-label-neutral",
  failure: "placeholder-label-danger",
};

export const visibilityBadgeClasses: Record<Visibility, string> = {
  public: "placeholder-label-success",
  unlisted: "placeholder-label-warning",
  private: "placeholder-label-neutral",
};

const budgetRangeLabels = new Map<string, string>(
  BUDGET_RANGE_OPTIONS.map((option) => [option.value, option.label]),
);

export function formatBudgetRange(value: string) {
  return budgetRangeLabels.get(value) ?? `${value}円`;
}

export function estimateBudgetRange(min: number, max: number): string {
  const reference = max > 0 ? max : min;

  if (reference <= 3000) {
    return "1000-3000";
  }
  if (reference <= 5000) {
    return "3000-5000";
  }
  if (reference <= 10000) {
    return "5000-10000";
  }
  return "10000+";
}
