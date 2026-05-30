import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

import { FormErrorList } from "../components/forms/FormErrorList";
import {
  hasValidationErrors,
  validateConsultationInput,
  type ValidationErrors,
} from "../lib/validation";
import { createConsultation } from "../services/consultationService";
import type { ConsultationInput } from "../types/consultation";

const initialForm = {
  recipient_age_group: "20s",
  recipient_gender: "unspecified",
  relationship: "",
  purpose: "",
  budget_min: "3000",
  budget_max: "5000",
  hobbies: "",
  avoid_items: "",
  desired_mood: "",
  note: "",
};

export function ConsultationFormPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(name: keyof typeof initialForm, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function toList(value: string) {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function buildInput(): ConsultationInput {
    return {
      recipient_age_group: form.recipient_age_group,
      recipient_gender: form.recipient_gender,
      relationship: form.relationship.trim(),
      purpose: form.purpose.trim(),
      budget_min: Number(form.budget_min),
      budget_max: Number(form.budget_max),
      hobbies: toList(form.hobbies),
      avoid_items: toList(form.avoid_items),
      desired_mood: form.desired_mood.trim(),
      note: form.note.trim(),
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setValidationErrors({});

    const input = buildInput();
    const errors = validateConsultationInput(input);
    if (hasValidationErrors(errors)) {
      setValidationErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createConsultation(input);
      navigate(`/consultations/${result.consultation_id}`, {
        state: { consultation: result },
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "AI相談の送信に失敗しました。",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="form-page">
      <div>
        <p className="placeholder-label">AI Consultation</p>
        <h1>AIギフト相談</h1>
        <p>贈る相手の条件を入力して、候補・理由・注意点をまとめて相談します。</p>
      </div>

      <form className="form-stack wide-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label className="field">
            <span>年齢層</span>
            <select
              onChange={(event) => updateField("recipient_age_group", event.target.value)}
              value={form.recipient_age_group}
            >
              <option value="teens">10代</option>
              <option value="20s">20代</option>
              <option value="30s">30代</option>
              <option value="40s">40代</option>
              <option value="50s">50代</option>
              <option value="60s+">60代以上</option>
            </select>
          </label>

          <label className="field">
            <span>性別</span>
            <select
              onChange={(event) => updateField("recipient_gender", event.target.value)}
              value={form.recipient_gender}
            >
              <option value="unspecified">指定なし</option>
              <option value="female">女性</option>
              <option value="male">男性</option>
              <option value="other">その他</option>
            </select>
          </label>

          <label className="field">
            <span>関係性</span>
            <input
              onChange={(event) => updateField("relationship", event.target.value)}
              placeholder="友人、恋人、家族、同僚など"
              required
              value={form.relationship}
            />
          </label>

          <label className="field">
            <span>目的</span>
            <input
              onChange={(event) => updateField("purpose", event.target.value)}
              placeholder="誕生日、記念日、お礼など"
              required
              value={form.purpose}
            />
          </label>

          <label className="field">
            <span>予算下限</span>
            <input
              min="0"
              onChange={(event) => updateField("budget_min", event.target.value)}
              required
              type="number"
              value={form.budget_min}
            />
          </label>

          <label className="field">
            <span>予算上限</span>
            <input
              min="0"
              onChange={(event) => updateField("budget_max", event.target.value)}
              required
              type="number"
              value={form.budget_max}
            />
          </label>
        </div>

        <label className="field">
          <span>趣味・特徴</span>
          <input
            onChange={(event) => updateField("hobbies", event.target.value)}
            placeholder="コーヒー, 読書, 料理"
            value={form.hobbies}
          />
        </label>

        <label className="field">
          <span>避けたいもの</span>
          <input
            onChange={(event) => updateField("avoid_items", event.target.value)}
            placeholder="香りが強いもの, 大きいもの"
            value={form.avoid_items}
          />
        </label>

        <label className="field">
          <span>希望する雰囲気</span>
          <input
            onChange={(event) => updateField("desired_mood", event.target.value)}
            placeholder="実用的、特別感、気軽など"
            required
            value={form.desired_mood}
          />
        </label>

        <label className="field">
          <span>補足メモ</span>
          <textarea
            onChange={(event) => updateField("note", event.target.value)}
            placeholder="相手の生活スタイルや最近の様子など"
            value={form.note}
          />
        </label>

        <FormErrorList errors={validationErrors} />

        {errorMessage ? (
          <p className="form-error" role="alert">
            {errorMessage}
          </p>
        ) : null}

        <button className="button-primary" disabled={isSubmitting} type="submit">
          {isSubmitting ? "相談中..." : "AIに相談する"}
        </button>
      </form>
    </section>
  );
}
