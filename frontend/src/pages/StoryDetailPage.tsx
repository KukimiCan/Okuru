import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { ConfirmDialog } from "../components/feedback/ConfirmDialog";
import { LoadingSpinner } from "../components/feedback/LoadingSpinner";
import { useAuth } from "../features/auth/AuthContext";
import { formatBudgetRange, resultLabels } from "../lib/giftOptions";
import { deleteStory, getStory } from "../services/storyService";
import type { Story } from "../types/story";

export function StoryDetailPage() {
  const { storyId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [story, setStory] = useState<Story | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!storyId) {
      return;
    }

    getStory(storyId)
      .then((data) => {
        setStory(data);
        setNotFound(false);
      })
      .catch(() => {
        setNotFound(true);
      })
      .finally(() => setIsLoading(false));
  }, [storyId]);

  const canEdit = Boolean(user && story?.user_id && story.user_id === user.id);

  async function handleDelete() {
    if (!storyId || isDeleting) {
      return;
    }

    setShowDeleteConfirm(false);
    setDeleteError("");
    setIsDeleting(true);

    try {
      await deleteStory(storyId);
      navigate("/stories", { replace: true });
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : "体験談の削除に失敗しました。",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return (
      <section className="detail-page">
        <LoadingSpinner fullSection label="体験談を読み込んでいます" />
      </section>
    );
  }

  if (notFound || !story) {
    return (
      <section className="detail-page">
        <div>
          <h1>体験談が見つかりません</h1>
          <p>指定された体験談は存在しないか、非公開に設定されています。</p>
        </div>
        <div className="action-row">
          <Link className="button-primary" to="/stories">
            体験談一覧へ戻る
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="detail-page">
      <div>
        <h1>{story.title}</h1>
        <p>{story.body}</p>
      </div>

      {deleteError ? (
        <p className="form-error" role="alert">
          {deleteError}
        </p>
      ) : null}

      <div className="section-grid">
        <article className="info-panel">
          <h2>結果</h2>
          <p>{resultLabels[story.result]}</p>
        </article>
        <article className="info-panel">
          <h2>贈ったもの</h2>
          <p>{story.gift_item}</p>
        </article>
        <article className="info-panel">
          <h2>予算帯</h2>
          <p>{formatBudgetRange(story.budget_range)}</p>
        </article>
      </div>

      <dl className="detail-list">
        <div>
          <dt>関係性</dt>
          <dd>{story.relationship}</dd>
        </div>
        <div>
          <dt>目的</dt>
          <dd>{story.purpose}</dd>
        </div>
        <div>
          <dt>キーワード</dt>
          <dd>{story.keywords.join(", ") || "なし"}</dd>
        </div>
        <div>
          <dt>投稿日</dt>
          <dd>{new Date(story.created_at).toLocaleDateString("ja-JP")}</dd>
        </div>
      </dl>

      <div className="action-row">
        {canEdit && storyId ? (
          <Link className="button-primary" to={`/stories/${storyId}/edit`}>
            編集する
          </Link>
        ) : null}
        {canEdit ? (
          <button
            className="button-danger"
            disabled={isDeleting}
            onClick={() => setShowDeleteConfirm(true)}
            type="button"
          >
            {isDeleting ? "削除中..." : "削除する"}
          </button>
        ) : null}
        <Link className="button-secondary" to="/stories">
          一覧へ戻る
        </Link>
      </div>

      {showDeleteConfirm ? (
        <ConfirmDialog
          message="この体験談を削除します。削除すると元に戻せません。よろしいですか？"
          onCancel={() => setShowDeleteConfirm(false)}
          onConfirm={() => void handleDelete()}
          title="体験談を削除"
        />
      ) : null}
    </section>
  );
}
