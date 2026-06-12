import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

import { mockConsultationResult } from "../lib/mockData";
import {
  deleteConsultation,
  getConsultation,
  updateConsultation,
} from "../services/consultationService";
import type {
  ConsultationCreateResponse,
  ConsultationDetail,
  ConsultationResult,
  Visibility,
} from "../types/consultation";

const visibilityLabels: Record<Visibility, string> = {
  private: "非公開",
  public: "公開",
  unlisted: "限定公開",
};

export function ConsultationDetailPage() {
  const { consultationId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const stateConsultation = (location.state as { consultation?: ConsultationCreateResponse })
    ?.consultation;
  const [result, setResult] = useState<ConsultationResult | null>(
    stateConsultation?.result ?? null,
  );
  const [title, setTitle] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("private");
  const [isFavorite, setIsFavorite] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!consultationId) {
      return;
    }

    getConsultation(consultationId)
      .then((data: ConsultationDetail) => {
        setResult(data.result);
        setTitle(data.title);
        setVisibility(data.visibility);
        setIsFavorite(data.is_favorite);
      })
      .catch(() => {
        if (!stateConsultation) {
          setResult(mockConsultationResult);
          setErrorMessage("APIから取得できないため、表示例を表示しています。");
        }
      });
  }, [consultationId, stateConsultation]);

  const displayResult = result ?? mockConsultationResult;

  async function handleUpdate() {
    if (!consultationId) {
      return;
    }

    setIsSaving(true);
    setErrorMessage("");
    setStatusMessage("");

    try {
      const updated = await updateConsultation(consultationId, {
        title: title.trim() || "ギフト相談",
        visibility,
        is_favorite: isFavorite,
      });
      setTitle(updated.title);
      setVisibility(updated.visibility);
      setIsFavorite(updated.is_favorite);
      setStatusMessage("相談履歴を更新しました。");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "相談履歴の更新に失敗しました。");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!consultationId) {
      return;
    }

    const confirmed = window.confirm(
      `「${title || "この相談履歴"}」を削除します。削除すると元に戻せません。よろしいですか？`,
    );

    if (!confirmed) {
      return;
    }

    setIsSaving(true);
    setErrorMessage("");
    setStatusMessage("");

    try {
      await deleteConsultation(consultationId);
      navigate("/consultations", { replace: true });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "相談履歴の削除に失敗しました。");
      setIsSaving(false);
    }
  }

  return (
    <section className="detail-page">
      <div>
        <p className="placeholder-label">Consultation Result</p>
        <h1>AI相談結果</h1>
        <p>{displayResult.summary}</p>
      </div>

      {errorMessage ? (
        <div className="notice" role="status">
          {errorMessage}
        </div>
      ) : null}

      {statusMessage ? (
        <div className="notice" role="status">
          {statusMessage}
        </div>
      ) : null}

      <section className="management-panel" aria-label="相談履歴の管理">
        <label className="field">
          <span>タイトル</span>
          <input
            onChange={(event) => setTitle(event.target.value)}
            placeholder="ギフト相談"
            value={title}
          />
        </label>

        <div className="form-grid">
          <label className="field">
            <span>公開設定</span>
            <select
              onChange={(event) => setVisibility(event.target.value as Visibility)}
              value={visibility}
            >
              {Object.entries(visibilityLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="checkbox-field">
            <input
              checked={isFavorite}
              onChange={(event) => setIsFavorite(event.target.checked)}
              type="checkbox"
            />
            <span>お気に入りにする</span>
          </label>
        </div>

        <div className="action-row">
          <button
            className="button-primary"
            disabled={isSaving || !consultationId}
            onClick={() => void handleUpdate()}
            type="button"
          >
            {isSaving ? "保存中..." : "保存する"}
          </button>
          <button
            className="button-danger"
            disabled={isSaving || !consultationId}
            onClick={() => void handleDelete()}
            type="button"
          >
            削除する
          </button>
        </div>
      </section>

      <div className="card-grid">
        {displayResult.gift_candidates.map((candidate) => (
          <article className="result-card" key={candidate.name}>
            <div>
              <p className="placeholder-label">{candidate.budget_range}</p>
              <h2>{candidate.name}</h2>
            </div>
            <dl className="info-list">
              <div>
                <dt>理由</dt>
                <dd>{candidate.reason}</dd>
              </div>
              <div>
                <dt>注意点</dt>
                <dd>{candidate.caution}</dd>
              </div>
              <div>
                <dt>向いている相手</dt>
                <dd>{candidate.suitable_for}</dd>
              </div>
              <div>
                <dt>渡すときの一言</dt>
                <dd>{candidate.message}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>

      <div className="section-grid">
        <article className="info-panel">
          <h2>選び方のコツ</h2>
          <ul>
            {displayResult.tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </article>
        <article className="info-panel">
          <h2>避けた方がよいこと</h2>
          <ul>
            {displayResult.avoid.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </div>

      <div className="action-row">
        <Link className="button-primary" to="/consultations/new">
          もう一度相談する
        </Link>
        <Link className="button-secondary" to="/stories">
          体験談を見る
        </Link>
        <Link className="button-secondary" to="/consultations">
          相談履歴へ戻る
        </Link>
      </div>
    </section>
  );
}
