import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { useAuth } from "../features/auth/AuthContext";
import { mockStories } from "../lib/mockData";
import { deleteStory, getStory } from "../services/storyService";
import type { Story, StoryResult } from "../types/story";

const resultLabels: Record<StoryResult, string> = {
  success: "成功",
  normal: "普通",
  failure: "失敗",
};

export function StoryDetailPage() {
  const { storyId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [story, setStory] = useState<Story | null>(null);
  const [notice, setNotice] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!storyId) {
      return;
    }

    getStory(storyId)
      .then((data) => {
        setStory(data);
        setNotice("");
      })
      .catch(() => {
        setStory(mockStories.find((item) => item.id === storyId) ?? mockStories[0]);
        setNotice("APIから取得できないため、表示例を表示しています。");
      });
  }, [storyId]);

  const displayStory = story ?? mockStories[0];
  const canEdit = Boolean(user && displayStory.user_id && displayStory.user_id === user.id);

  async function handleDelete() {
    if (!storyId || isDeleting) {
      return;
    }

    const confirmed = window.confirm(
      "この体験談を削除します。削除すると元に戻せません。よろしいですか？",
    );

    if (!confirmed) {
      return;
    }

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

  return (
    <section className="detail-page">
      <div>
        <p className="placeholder-label">Gift Story</p>
        <h1>{displayStory.title}</h1>
        <p>{displayStory.body}</p>
      </div>

      {notice ? (
        <div className="notice" role="status">
          {notice}
        </div>
      ) : null}

      {deleteError ? (
        <p className="form-error" role="alert">
          {deleteError}
        </p>
      ) : null}

      <div className="section-grid">
        <article className="info-panel">
          <h2>結果</h2>
          <p>{resultLabels[displayStory.result]}</p>
        </article>
        <article className="info-panel">
          <h2>贈ったもの</h2>
          <p>{displayStory.gift_item}</p>
        </article>
        <article className="info-panel">
          <h2>予算帯</h2>
          <p>{displayStory.budget_range}円</p>
        </article>
      </div>

      <dl className="detail-list">
        <div>
          <dt>関係性</dt>
          <dd>{displayStory.relationship}</dd>
        </div>
        <div>
          <dt>目的</dt>
          <dd>{displayStory.purpose}</dd>
        </div>
        <div>
          <dt>キーワード</dt>
          <dd>{displayStory.keywords.join(", ") || "なし"}</dd>
        </div>
        <div>
          <dt>投稿日</dt>
          <dd>{new Date(displayStory.created_at).toLocaleDateString("ja-JP")}</dd>
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
            onClick={() => void handleDelete()}
            type="button"
          >
            {isDeleting ? "削除中..." : "削除する"}
          </button>
        ) : null}
        <Link className="button-secondary" to="/stories">
          一覧へ戻る
        </Link>
      </div>
    </section>
  );
}
