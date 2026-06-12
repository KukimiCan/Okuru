import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { FormErrorList } from "../components/forms/FormErrorList";
import { useAuth } from "../features/auth/AuthContext";
import { hasValidationErrors, validateStoryInput, type ValidationErrors } from "../lib/validation";
import { getStory, updateStory } from "../services/storyService";
import type { StoryInput, StoryResult } from "../types/story";

const initialForm = {
  title: "",
  relationship: "",
  purpose: "",
  budget_range: "3000-5000",
  gift_item: "",
  result: "success" as StoryResult,
  body: "",
  visibility: "public" as StoryInput["visibility"],
  keywords: "",
};

export function StoryEditPage() {
  const { storyId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [blockingError, setBlockingError] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!storyId) {
      setBlockingError("編集する体験談が指定されていません。");
      setIsLoading(false);
      return;
    }

    getStory(storyId)
      .then((story) => {
        if (story.user_id && user?.id && story.user_id !== user.id) {
          setBlockingError("自分が投稿した体験談だけ編集できます。");
          return;
        }

        setForm({
          title: story.title,
          relationship: story.relationship,
          purpose: story.purpose,
          budget_range: story.budget_range,
          gift_item: story.gift_item,
          result: story.result,
          body: story.body,
          visibility: story.visibility,
          keywords: story.keywords.join(", "),
        });
      })
      .catch((error) => {
        setBlockingError(
          error instanceof Error
            ? error.message
            : "体験談の取得に失敗しました。",
        );
      })
      .finally(() => setIsLoading(false));
  }, [storyId, user?.id]);

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
    if (!storyId) {
      return;
    }

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
      const updated = await updateStory(storyId, input);
      navigate(`/stories/${updated.story_id}`);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "体験談の更新に失敗しました。",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <section className="placeholder">
        <p className="placeholder-label">Loading</p>
        <h1>体験談を読み込んでいます</h1>
      </section>
    );
  }

  return (
    <section className="form-page">
      <div>
        <p className="placeholder-label">Edit Story</p>
        <h1>体験談を編集</h1>
        <p>投稿済みの体験談を見直し、贈ったものや結果、本文を更新できます。</p>
      </div>

      {blockingError ? (
        <div className="notice" role="alert">
          {blockingError}
        </div>
      ) : null}

      <form className="form-stack wide-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>タイトル</span>
          <input
            onChange={(event) => updateField("title", event.target.value)}
            required
            value={form.title}
          />
        </label>

        <div className="form-grid">
          <label className="field">
            <span>関係性</span>
            <input
              onChange={(event) => updateField("relationship", event.target.value)}
              required
              value={form.relationship}
            />
          </label>
          <label className="field">
            <span>目的</span>
            <input
              onChange={(event) => updateField("purpose", event.target.value)}
              required
              value={form.purpose}
            />
          </label>
          <label className="field">
            <span>予算帯</span>
            <select
              onChange={(event) => updateField("budget_range", event.target.value)}
              value={form.budget_range}
            >
              <option value="1000-3000">1,000-3,000円</option>
              <option value="3000-5000">3,000-5,000円</option>
              <option value="5000-10000">5,000-10,000円</option>
              <option value="10000+">10,000円以上</option>
            </select>
          </label>
          <label className="field">
            <span>結果</span>
            <select
              onChange={(event) => updateField("result", event.target.value as StoryResult)}
              value={form.result}
            >
              <option value="success">成功</option>
              <option value="normal">普通</option>
              <option value="failure">失敗</option>
            </select>
          </label>
        </div>

        <label className="field">
          <span>贈ったもの</span>
          <input
            onChange={(event) => updateField("gift_item", event.target.value)}
            required
            value={form.gift_item}
          />
        </label>

        <label className="field">
          <span>本文</span>
          <textarea
            onChange={(event) => updateField("body", event.target.value)}
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
              <option value="public">公開</option>
              <option value="unlisted">限定公開</option>
              <option value="private">非公開</option>
            </select>
          </label>
          <label className="field">
            <span>キーワード</span>
            <input
              onChange={(event) => updateField("keywords", event.target.value)}
              placeholder="coffee, practical"
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

        <div className="action-row">
          <button className="button-primary" disabled={isSubmitting || Boolean(blockingError)} type="submit">
            {isSubmitting ? "更新中..." : "更新する"}
          </button>
          <Link className="button-secondary" to={storyId ? `/stories/${storyId}` : "/stories"}>
            キャンセル
          </Link>
        </div>
      </form>
    </section>
  );
}
