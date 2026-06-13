import { FormEvent, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { FormErrorList } from "../components/forms/FormErrorList";
import {
  BUDGET_RANGE_OPTIONS,
  PURPOSE_OPTIONS,
  RELATIONSHIP_OPTIONS,
  resultLabels,
  visibilityLabels,
} from "../lib/giftOptions";
import { hasValidationErrors, validateStoryInput, type ValidationErrors } from "../lib/validation";
import { createStory } from "../services/storyService";
import type { StoryDraftSeed, StoryInput, StoryResult } from "../types/story";

const initialForm = {
  title: "",
  relationship: RELATIONSHIP_OPTIONS[0] as string,
  purpose: PURPOSE_OPTIONS[0] as string,
  budget_range: "3000-5000",
  gift_item: "",
  result: "success" as StoryResult,
  body: "",
  visibility: "public" as StoryInput["visibility"],
  keywords: "",
};

export function StoryNewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const draft = (location.state as { storyDraft?: StoryDraftSeed } | null)?.storyDraft;
  const [form, setForm] = useState(() => ({
    ...initialForm,
    ...(draft?.title ? { title: draft.title } : {}),
    ...(draft?.relationship ? { relationship: draft.relationship } : {}),
    ...(draft?.purpose ? { purpose: draft.purpose } : {}),
    ...(draft?.budget_range ? { budget_range: draft.budget_range } : {}),
    ...(draft?.gift_item ? { gift_item: draft.gift_item } : {}),
    ...(draft?.keywords ? { keywords: draft.keywords } : {}),
  }));
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField<T extends keyof typeof initialForm>(
    name: T,
    value: (typeof initialForm)[T],
  ) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function buildInput(): StoryInput {
    return {
      title: form.title.trim(),
      relationship: form.relationship.trim(),
      purpose: form.purpose.trim(),
      budget_range: form.budget_range,
      gift_item: form.gift_item.trim(),
      result: form.result,
      body: form.body.trim(),
      visibility: form.visibility,
      keywords: form.keywords
        .split(",")
        .map((keyword) => keyword.trim())
        .filter(Boolean),
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setValidationErrors({});

    const input = buildInput();
    const errors = validateStoryInput(input);
    if (hasValidationErrors(errors)) {
      setValidationErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const created = await createStory(input);
      navigate(input.visibility === "private" ? "/mypage" : `/stories/${created.id}`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "体験談の投稿に失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="form-page">
      <div>
        <h1>体験談投稿</h1>
        <p>実際に贈ったもの、結果、学びを共有できます。</p>
      </div>

      {draft ? (
        <div className="notice" role="status">
          AI相談の内容を入力欄に反映しました。実際に贈った結果や感想に書き換えて投稿してください。
        </div>
      ) : null}

      <form className="form-stack wide-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>タイトル</span>
          <input
            onChange={(event) => updateField("title", event.target.value)}
            placeholder="友人の誕生日に実用品を贈って喜ばれた話"
            required
            value={form.title}
          />
        </label>

        <div className="form-grid">
          <label className="field">
            <span>関係性</span>
            <select
              onChange={(event) => updateField("relationship", event.target.value)}
              value={form.relationship}
            >
              {RELATIONSHIP_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>目的</span>
            <select
              onChange={(event) => updateField("purpose", event.target.value)}
              value={form.purpose}
            >
              {PURPOSE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>予算帯</span>
            <select
              onChange={(event) => updateField("budget_range", event.target.value)}
              value={form.budget_range}
            >
              {BUDGET_RANGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>結果</span>
            <select
              onChange={(event) => updateField("result", event.target.value as StoryResult)}
              value={form.result}
            >
              {Object.entries(resultLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="field">
          <span>贈ったもの</span>
          <input
            onChange={(event) => updateField("gift_item", event.target.value)}
            placeholder="コーヒー関連グッズ"
            required
            value={form.gift_item}
          />
        </label>

        <label className="field">
          <span>本文</span>
          <textarea
            onChange={(event) => updateField("body", event.target.value)}
            placeholder="選んだ理由、相手の反応、次に活かしたいことなど"
            required
            value={form.body}
          />
        </label>

        <div className="form-grid">
          <label className="field">
            <span>公開設定</span>
            <select
              onChange={(event) =>
                updateField("visibility", event.target.value as StoryInput["visibility"])
              }
              value={form.visibility}
            >
              {Object.entries(visibilityLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>キーワード</span>
            <input
              onChange={(event) => updateField("keywords", event.target.value)}
              placeholder="コーヒー, 実用的"
              value={form.keywords}
            />
          </label>
        </div>

        <FormErrorList errors={validationErrors} />

        {errorMessage ? (
          <p className="form-error" role="alert">
            {errorMessage}
          </p>
        ) : null}

        <button className="button-primary" disabled={isSubmitting} type="submit">
          {isSubmitting ? "投稿中..." : "投稿する"}
        </button>
      </form>
    </section>
  );
}
