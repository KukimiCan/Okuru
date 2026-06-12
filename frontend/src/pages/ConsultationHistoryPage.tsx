import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  deleteConsultation,
  getConsultations,
  updateConsultation,
} from "../services/consultationService";
import type { ConsultationListItem, Visibility } from "../types/consultation";

const visibilityLabels: Record<Visibility, string> = {
  private: "Private",
  public: "Public",
  unlisted: "Unlisted",
};

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

  async function handleDelete(consultation: ConsultationListItem) {
    const confirmed = window.confirm(
      `「${consultation.title}」を削除します。削除すると元に戻せません。よろしいですか？`,
    );

    if (!confirmed) {
      return;
    }

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
    <section className="detail-page">
      <div>
        <p className="placeholder-label">Consultation History</p>
        <h1>相談履歴</h1>
        <p>保存したAI相談を確認し、気になる結果をもう一度開けます。</p>
      </div>

      <div className="summary-row">
        <span className="count-label">全{consultations.length}件</span>
        <span className="count-label">お気に入り{favoriteCount}件</span>
      </div>

      {errorMessage ? (
        <div className="notice" role="alert">
          {errorMessage}
        </div>
      ) : null}

      {isLoading ? (
        <div className="notice" role="status">
          相談履歴を読み込んでいます。
        </div>
      ) : null}

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
          {consultations.map((consultation) => (
            <article className="history-item" key={consultation.id}>
              <div>
                <div className="meta-row">
                  <span className="status-badge">
                    {visibilityLabels[consultation.visibility]}
                  </span>
                  {consultation.is_favorite ? (
                    <span className="status-badge status-badge-accent">Favorite</span>
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
                  onClick={() => void handleDelete(consultation)}
                  type="button"
                >
                  削除する
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
