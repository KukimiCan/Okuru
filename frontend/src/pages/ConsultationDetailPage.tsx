import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

import { ConfirmDialog } from "../components/feedback/ConfirmDialog";
import { LoadingSpinner } from "../components/feedback/LoadingSpinner";
import { Modal } from "../components/feedback/Modal";
import { estimateBudgetRange, visibilityLabels } from "../lib/giftOptions";
import {
  deleteConsultation,
  getConsultation,
  updateConsultation,
} from "../services/consultationService";
import type {
  ConsultationCreateResponse,
  ConsultationDetail,
  ConsultationInput,
  ConsultationResult,
  Visibility,
} from "../types/consultation";
import type { StoryDraftSeed } from "../types/story";

export function ConsultationDetailPage() {
  const { consultationId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const stateConsultation = (location.state as { consultation?: ConsultationCreateResponse })
    ?.consultation;
  const [result, setResult] = useState<ConsultationResult | null>(
    stateConsultation?.result ?? null,
  );
  const [input, setInput] = useState<ConsultationInput | null>(
    stateConsultation?.input ?? null,
  );
  const [title, setTitle] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("private");
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedCandidateIndex, setSelectedCandidateIndex] = useState(0);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [notFound, setNotFound] = useState(false);
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
        setInput(data.input);
        setTitle(data.title);
        setVisibility(data.visibility);
        setIsFavorite(data.is_favorite);
        setSelectedCandidateIndex(0);
      })
      .catch(() => {
        if (!stateConsultation) {
          setNotFound(true);
        }
      });
  }, [consultationId, stateConsultation]);

  if (notFound) {
    return (
      <section className="detail-page">
        <div>
          <h1>相談結果が見つかりません</h1>
          <p>指定された相談履歴は存在しないか、アクセスできない可能性があります。</p>
        </div>
        <div className="action-row">
          <Link className="button-primary" to="/consultations">
            相談履歴へ戻る
          </Link>
          <Link className="button-secondary" to="/consultations/new">
            もう一度相談する
          </Link>
        </div>
      </section>
    );
  }

  if (!result) {
    return (
      <section className="detail-page">
        <LoadingSpinner fullSection label="相談結果を読み込んでいます" />
      </section>
    );
  }

  const displayResult = result;
  const selectedCandidate =
    displayResult.gift_candidates[selectedCandidateIndex] ?? displayResult.gift_candidates[0];
  const storyDraft: StoryDraftSeed | undefined = input
    ? {
        title: selectedCandidate ? `${selectedCandidate.name}を贈った話` : undefined,
        relationship: input.relationship,
        purpose: input.purpose,
        budget_range: estimateBudgetRange(input.budget_min, input.budget_max),
        gift_item: selectedCandidate?.name,
        keywords: input.hobbies.join(", "),
      }
    : undefined;

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

    setShowDeleteConfirm(false);
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

      <div className="split-layout">
        <div className="split-main">
          <div>
            <h2 className="section-title">候補一覧</h2>
            <p>気になる候補をクリックすると、詳しい理由や注意点をポップアップで確認できます。</p>
          </div>

          <div className="card-grid">
            {displayResult.gift_candidates.map((candidate, index) => {
              const isSelected = index === selectedCandidateIndex;

              return (
                <article
                  aria-pressed={isSelected}
                  className={isSelected ? "result-card result-card-selected" : "result-card"}
                  key={candidate.name}
                  onClick={() => {
                    setSelectedCandidateIndex(index);
                    setIsDetailOpen(true);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedCandidateIndex(index);
                      setIsDetailOpen(true);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div>
                    <p className="placeholder-label">{candidate.budget_range}</p>
                    <h2>{candidate.name}</h2>
                  </div>
                  <p>{candidate.reason}</p>
                </article>
              );
            })}
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
        </div>

        <aside className="split-side">
          <section className="management-panel" aria-label="相談履歴の管理">
            <h2>相談履歴を管理</h2>
            <label className="field">
              <span>タイトル</span>
              <input
                onChange={(event) => setTitle(event.target.value)}
                placeholder="ギフト相談"
                value={title}
              />
            </label>

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
                onClick={() => setShowDeleteConfirm(true)}
                type="button"
              >
                削除する
              </button>
            </div>
          </section>

          <section className="management-panel" aria-label="次のアクション">
            <h2>次のアクション</h2>
            <div className="action-stack">
              <Link
                className="button-primary"
                to="/stories/new"
                state={storyDraft ? { storyDraft } : undefined}
              >
                この相談を体験談として投稿する
              </Link>
              <Link className="button-secondary" to="/consultations/new">
                もう一度相談する
              </Link>
              <Link className="button-secondary" to="/consultations">
                相談履歴へ戻る
              </Link>
            </div>
          </section>
        </aside>
      </div>

      {isDetailOpen ? (
        <Modal onClose={() => setIsDetailOpen(false)} title={selectedCandidate.name}>
          <p className="placeholder-label">{selectedCandidate.budget_range}</p>
          <dl className="info-list">
            <div>
              <dt>理由</dt>
              <dd>{selectedCandidate.reason}</dd>
            </div>
            <div>
              <dt>注意点</dt>
              <dd>{selectedCandidate.caution}</dd>
            </div>
            <div>
              <dt>向いている相手</dt>
              <dd>{selectedCandidate.suitable_for}</dd>
            </div>
            <div>
              <dt>渡すときの一言</dt>
              <dd>{selectedCandidate.message}</dd>
            </div>
          </dl>
        </Modal>
      ) : null}

      {showDeleteConfirm ? (
        <ConfirmDialog
          message={`「${title || "この相談履歴"}」を削除します。削除すると元に戻せません。よろしいですか？`}
          onCancel={() => setShowDeleteConfirm(false)}
          onConfirm={() => void handleDelete()}
          title="相談履歴を削除"
        />
      ) : null}
    </section>
  );
}
