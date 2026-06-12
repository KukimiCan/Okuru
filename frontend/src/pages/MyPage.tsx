import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../features/auth/AuthContext";
import { deleteStory, getMyStories } from "../services/storyService";
import type { MyStoryListItem, StoryResult } from "../types/story";

const resultLabels: Record<StoryResult, string> = {
  success: "成功",
  normal: "普通",
  failure: "失敗",
};

const visibilityLabels: Record<MyStoryListItem["visibility"], string> = {
  public: "公開",
  unlisted: "限定公開",
  private: "非公開",
};

export function MyPage() {
  const { user } = useAuth();
  const [stories, setStories] = useState<MyStoryListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [deletingStoryId, setDeletingStoryId] = useState<string | null>(null);

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

  async function handleDelete(story: MyStoryListItem) {
    const confirmed = window.confirm(
      `「${story.title}」を削除します。削除すると元に戻せません。よろしいですか？`,
    );

    if (!confirmed) {
      return;
    }

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
    <section className="detail-page">
      <div>
        <p className="placeholder-label">My Page</p>
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

      <section className="detail-page" aria-label="自分の体験談">
        <div>
          <p className="placeholder-label">My Stories</p>
          <h2 className="section-title">自分の体験談</h2>
          <p className="count-label">{total}件</p>
        </div>

        {isLoading ? (
          <div className="notice" role="status">
            読み込んでいます。
          </div>
        ) : null}

        {!isLoading && stories.length === 0 ? (
          <div className="notice" role="status">
            まだ投稿した体験談はありません。
          </div>
        ) : null}

        <div className="card-grid">
          {stories.map((story) => (
            <article className="result-card" key={story.id}>
              <div>
                <p className="placeholder-label">
                  {visibilityLabels[story.visibility]} / {resultLabels[story.result]}
                </p>
                <h2>{story.title}</h2>
              </div>
              <dl className="info-list">
                <div>
                  <dt>予算帯</dt>
                  <dd>{story.budget_range}円</dd>
                </div>
                <div>
                  <dt>作成日</dt>
                  <dd>{new Date(story.created_at).toLocaleString("ja-JP")}</dd>
                </div>
                <div>
                  <dt>更新日</dt>
                  <dd>{new Date(story.updated_at).toLocaleString("ja-JP")}</dd>
                </div>
              </dl>
              <div className="action-row">
                {story.visibility === "public" ? (
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
                  onClick={() => void handleDelete(story)}
                  type="button"
                >
                  {deletingStoryId === story.id ? "削除中..." : "削除する"}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
