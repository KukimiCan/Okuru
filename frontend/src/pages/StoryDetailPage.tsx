import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { ConfirmDialog } from "../components/feedback/ConfirmDialog";
import { LoadingSpinner } from "../components/feedback/LoadingSpinner";
import { Reveal } from "../components/motion/Reveal";
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
      <div className="split-layout story-layout">
        <div className="split-main">
          <article className="story-article">
            <h1>{story.title}</h1>
            <p className="story-body">{story.body}</p>
          </article>

          {deleteError ? (
            <p className="form-error" role="alert">
              {deleteError}
            </p>
          ) : null}

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
        </div>

        <aside className="split-side">
          <Reveal>
            <section className="management-panel story-meta" aria-label="体験談の情報">
              <h2>この体験談について</h2>
              <dl className="info-list">
                <div>
                  <dt>結果</dt>
                  <dd>{resultLabels[story.result]}</dd>
                </div>
                <div>
                  <dt>贈ったもの</dt>
                  <dd>{story.gift_item}</dd>
                </div>
                <div>
                  <dt>予算帯</dt>
                  <dd>{formatBudgetRange(story.budget_range)}</dd>
                </div>
                <div>
                  <dt>関係性</dt>
                  <dd>{story.relationship}</dd>
                </div>
                <div>
                  <dt>目的</dt>
                  <dd>{story.purpose}</dd>
                </div>
                <div>
                  <dt>投稿日</dt>
                  <dd>{new Date(story.created_at).toLocaleDateString("ja-JP")}</dd>
                </div>
                <div>
                  <dt>キーワード</dt>
                  <dd>
                    {story.keywords.length > 0 ? (
                      <ul className="tag-list">
                        {story.keywords.map((keyword) => (
                          <li className="tag-chip" key={keyword}>
                            {keyword}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      "なし"
                    )}
                  </dd>
                </div>
              </dl>
            </section>
          </Reveal>
        </aside>
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
