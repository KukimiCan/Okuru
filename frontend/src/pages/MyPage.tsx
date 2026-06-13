import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { ConfirmDialog } from "../components/feedback/ConfirmDialog";
import { LoadingSpinner } from "../components/feedback/LoadingSpinner";
import { useAuth } from "../features/auth/AuthContext";
import {
  formatBudgetRange,
  resultBadgeClasses,
  resultLabels,
  visibilityBadgeClasses,
  visibilityLabels,
} from "../lib/giftOptions";
import { deleteStory, getMyStories } from "../services/storyService";
import type { MyStoryListItem } from "../types/story";

export function MyPage() {
  const { user } = useAuth();
  const [stories, setStories] = useState<MyStoryListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [deletingStoryId, setDeletingStoryId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MyStoryListItem | null>(null);

  function loadStories() {
    setIsLoading(true);
    setMessage("");

    getMyStories({ page: 1, limit: 20 })
      .then((data) => {
        setStories(data.items);
        setTotal(data.total);
      })
      .catch((error) => {
        setMessage(error instanceof Error ? error.message : "自分の体験談を取得できませんでした。");
      })
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    loadStories();
  }, []);

  async function confirmDelete() {
    if (!deleteTarget) {
      return;
    }

    const story = deleteTarget;
    setDeleteTarget(null);
    setDeletingStoryId(story.id);
    setMessage("");

    try {
      await deleteStory(story.id);
      setStories((current) => current.filter((item) => item.id !== story.id));
      setTotal((current) => Math.max(0, current - 1));
      setMessage("体験談を削除しました。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "体験談の削除に失敗しました。");
    } finally {
      setDeletingStoryId(null);
    }
  }

  return (
    <section className="detail-page list-page">
      <div className="list-page-header">
        <div>
          <h1>マイページ</h1>
          <p>{user?.email} の投稿した体験談を管理できます。</p>
        </div>

        {message ? (
          <div className="notice" role="status">
            {message}
          </div>
        ) : null}

        <div className="action-row">
          <Link className="button-primary" to="/stories/new">
            体験談を投稿する
          </Link>
          <Link className="button-secondary" to="/consultations">
            相談履歴を見る
          </Link>
        </div>
      </div>

      <div className="list-panel">
        <div className="summary-row">
          <h2 className="section-title">自分の体験談</h2>
          <p className="count-label">{total}件</p>
        </div>

        {isLoading ? <LoadingSpinner label="読み込んでいます。" /> : null}

        {!isLoading && stories.length === 0 ? (
          <div className="notice" role="status">
            まだ投稿した体験談はありません。
          </div>
        ) : null}

        {!isLoading && stories.length > 0 ? (
          <div className="card-grid">
            {stories.map((story) => (
              <article className="result-card" key={story.id}>
                <div>
                  <div className="meta-row">
                    <p
                      className={`placeholder-label ${visibilityBadgeClasses[story.visibility]}`}
                    >
                      {visibilityLabels[story.visibility]}
                    </p>
                    <p className={`placeholder-label ${resultBadgeClasses[story.result]}`}>
                      {resultLabels[story.result]}
                    </p>
                  </div>
                  <h2>{story.title}</h2>
                  <p className="card-meta">
                    {formatBudgetRange(story.budget_range)} ・{" "}
                    {new Date(story.created_at).toLocaleDateString("ja-JP")} 作成
                  </p>
                </div>
                <div className="action-row">
                  {story.visibility !== "private" ? (
                    <Link className="button-secondary" to={`/stories/${story.id}`}>
                      詳細を見る
                    </Link>
                  ) : null}
                  <Link className="button-primary" to={`/stories/${story.id}/edit`}>
                    編集する
                  </Link>
                  <button
                    className="button-danger"
                    disabled={deletingStoryId === story.id}
                    onClick={() => setDeleteTarget(story)}
                    type="button"
                  >
                    {deletingStoryId === story.id ? "削除中..." : "削除する"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </div>

      {deleteTarget ? (
        <ConfirmDialog
          message={`「${deleteTarget.title}」を削除します。削除すると元に戻せません。よろしいですか？`}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => void confirmDelete()}
          title="体験談を削除"
        />
      ) : null}
    </section>
  );
}
