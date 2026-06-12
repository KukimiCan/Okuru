import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { useAuth } from "../features/auth/AuthContext";
import { mockStories } from "../lib/mockData";
import { getStory } from "../services/storyService";
import type { Story, StoryResult } from "../types/story";

const resultLabels: Record<StoryResult, string> = {
  success: "成功",
  normal: "普通",
  failure: "失敗",
};

export function StoryDetailPage() {
  const { storyId } = useParams();
  const { user } = useAuth();
  const [story, setStory] = useState<Story | null>(null);
  const [notice, setNotice] = useState("");

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
        <Link className="button-secondary" to="/stories">
          一覧へ戻る
        </Link>
      </div>
    </section>
  );
}
