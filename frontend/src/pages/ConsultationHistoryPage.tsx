import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { ConfirmDialog } from "../components/feedback/ConfirmDialog";
import { LoadingSpinner } from "../components/feedback/LoadingSpinner";
import { Reveal } from "../components/motion/Reveal";
import { visibilityBadgeClasses, visibilityLabels } from "../lib/giftOptions";
import {
  deleteConsultation,
  getConsultations,
  updateConsultation,
} from "../services/consultationService";
import type { ConsultationListItem } from "../types/consultation";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function ConsultationHistoryPage() {
  const [consultations, setConsultations] = useState<ConsultationListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ConsultationListItem | null>(null);

  useEffect(() => {
    let isMounted = true;

    getConsultations()
      .then((data) => {
        if (!isMounted) {
          return;
        }

        setConsultations(data.items);
        setErrorMessage("");
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }

        setErrorMessage(
          error instanceof Error ? error.message : "相談履歴の取得に失敗しました。",
        );
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const favoriteCount = useMemo(
    () => consultations.filter((consultation) => consultation.is_favorite).length,
    [consultations],
  );

  async function handleFavoriteToggle(consultation: ConsultationListItem) {
    setPendingId(consultation.id);
    setErrorMessage("");

    try {
      const updated = await updateConsultation(consultation.id, {
        is_favorite: !consultation.is_favorite,
      });
      setConsultations((current) =>
        current.map((item) =>
          item.id === consultation.id
            ? { ...item, is_favorite: updated.is_favorite }
            : item,
        ),
      );
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "お気に入り更新に失敗しました。");
    } finally {
      setPendingId(null);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) {
      return;
    }

    const consultation = deleteTarget;
    setDeleteTarget(null);
    setPendingId(consultation.id);
    setErrorMessage("");

    try {
      await deleteConsultation(consultation.id);
      setConsultations((current) => current.filter((item) => item.id !== consultation.id));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "相談履歴の削除に失敗しました。");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <section className="detail-page list-page">
      <div className="list-page-header">
        <div>
          <h1>相談履歴</h1>
          <p>保存したAI相談を確認し、気になる結果をもう一度開けます。</p>
        </div>

        <div className="summary-row">
          <span className="count-label">全{consultations.length}件</span>
          <span className="count-label">お気に入り{favoriteCount}件</span>
        </div>
      </div>

      <div className="list-panel">
        {errorMessage ? (
          <div className="notice" role="alert">
            {errorMessage}
          </div>
        ) : null}

        {isLoading ? <LoadingSpinner label="相談履歴を読み込んでいます。" /> : null}

        {!isLoading && !errorMessage && consultations.length === 0 ? (
          <div className="empty-state">
            <h2>まだ相談履歴がありません</h2>
            <p>条件を入力して、最初のギフト相談を作成しましょう。</p>
            <Link className="button-primary" to="/consultations/new">
              AIに相談する
            </Link>
          </div>
        ) : null}

        {!isLoading && consultations.length > 0 ? (
          <div className="history-list">
            {consultations.map((consultation, index) => (
              <Reveal delay={Math.min(index, 4) * 0.05} key={consultation.id}>
                <article className="history-item">
                  <div>
                    <div className="meta-row">
                      <span
                        className={`status-badge ${visibilityBadgeClasses[consultation.visibility]}`}
                      >
                        {visibilityLabels[consultation.visibility]}
                      </span>
                      {consultation.is_favorite ? (
                        <span className="status-badge status-badge-accent">お気に入り</span>
                      ) : null}
                    </div>
                    <h2>{consultation.title}</h2>
                    <p>{formatDate(consultation.created_at)}</p>
                  </div>

                  <div className="action-row">
                    <Link className="button-secondary" to={`/consultations/${consultation.id}`}>
                      詳細を見る
                    </Link>
                    <button
                      className="button-secondary"
                      disabled={pendingId === consultation.id}
                      onClick={() => void handleFavoriteToggle(consultation)}
                      type="button"
                    >
                      {consultation.is_favorite ? "お気に入り解除" : "お気に入り"}
                    </button>
                    <button
                      className="button-danger"
                      disabled={pendingId === consultation.id}
                      onClick={() => setDeleteTarget(consultation)}
                      type="button"
                    >
                      削除する
                    </button>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        ) : null}
      </div>

      {deleteTarget ? (
        <ConfirmDialog
          message={`「${deleteTarget.title}」を削除します。削除すると元に戻せません。よろしいですか？`}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => void confirmDelete()}
          title="相談履歴を削除"
        />
      ) : null}
    </section>
  );
}
