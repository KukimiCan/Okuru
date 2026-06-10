import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { mockStories } from "../lib/mockData";
import { getStories } from "../services/storyService";
import type { Story, StoryListQuery, StoryResult } from "../types/story";

const resultLabels: Record<StoryResult, string> = {
  success: "成功",
  normal: "普通",
  failure: "失敗",
};

export function StoryListPage() {
  const [stories, setStories] = useState<Story[]>(mockStories);
  const [filters, setFilters] = useState<StoryListQuery>({ page: 1, limit: 12 });
  const [notice, setNotice] = useState("");

  useEffect(() => {
    getStories(filters)
      .then((data) => {
        setStories(
          data.items.map((item) => ({
            ...mockStories[0],
            id: item.id,
            title: item.title,
            result: item.result,
            budget_range: item.budget_range,
            created_at: item.created_at,
          })),
        );
        setNotice("");
      })
      .catch(() => {
        setStories(mockStories);
        setNotice("APIから取得できないため、表示例を表示しています。");
      });
  }, [filters]);

  const filteredStories = useMemo(() => {
    return stories.filter((story) => {
      const keyword = filters.keyword?.toLowerCase().trim();

      return (
        (!filters.relationship || story.relationship === filters.relationship) &&
        (!filters.purpose || story.purpose === filters.purpose) &&
        (!filters.budget_range || story.budget_range === filters.budget_range) &&
        (!filters.result || story.result === filters.result) &&
        (!keyword ||
          story.title.toLowerCase().includes(keyword) ||
          story.gift_item.toLowerCase().includes(keyword) ||
          story.body.toLowerCase().includes(keyword))
      );
    });
  }, [filters, stories]);

  function updateFilter(name: keyof StoryListQuery, value: string) {
    setFilters((current) => ({
      ...current,
      [name]: value || undefined,
      page: 1,
    }));
  }

  return (
    <section className="detail-page">
      <div>
        <p className="placeholder-label">Gift Stories</p>
        <h1>体験談一覧</h1>
        <p>公開されているプレゼント体験談を条件で探せます。</p>
      </div>

      {notice ? (
        <div className="notice" role="status">
          {notice}
        </div>
      ) : null}

      <div className="filter-bar">
        <label className="field">
          <span>キーワード</span>
          <input
            onChange={(event) => updateFilter("keyword", event.target.value)}
            placeholder="タイトル、贈ったもの、本文"
            value={filters.keyword ?? ""}
          />
        </label>
        <label className="field">
          <span>関係性</span>
          <select
            onChange={(event) => updateFilter("relationship", event.target.value)}
            value={filters.relationship ?? ""}
          >
            <option value="">すべて</option>
            <option value="friend">友人</option>
            <option value="coworker">同僚</option>
          </select>
        </label>
        <label className="field">
          <span>目的</span>
          <select
            onChange={(event) => updateFilter("purpose", event.target.value)}
            value={filters.purpose ?? ""}
          >
            <option value="">すべて</option>
            <option value="birthday">誕生日</option>
            <option value="thanks">お礼</option>
          </select>
        </label>
        <label className="field">
          <span>予算帯</span>
          <select
            onChange={(event) => updateFilter("budget_range", event.target.value)}
            value={filters.budget_range ?? ""}
          >
            <option value="">すべて</option>
            <option value="1000-3000">1,000-3,000円</option>
            <option value="3000-5000">3,000-5,000円</option>
          </select>
        </label>
        <label className="field">
          <span>結果</span>
          <select
            onChange={(event) => updateFilter("result", event.target.value)}
            value={filters.result ?? ""}
          >
            <option value="">すべて</option>
            <option value="success">成功</option>
            <option value="normal">普通</option>
            <option value="failure">失敗</option>
          </select>
        </label>
      </div>

      <p className="count-label">{filteredStories.length}件の体験談</p>

      <div className="card-grid">
        {filteredStories.map((story) => (
          <article className="result-card" key={story.id}>
            <div>
              <p className="placeholder-label">{resultLabels[story.result]}</p>
              <h2>{story.title}</h2>
            </div>
            <dl className="info-list">
              <div>
                <dt>贈ったもの</dt>
                <dd>{story.gift_item}</dd>
              </div>
              <div>
                <dt>予算帯</dt>
                <dd>{story.budget_range}円</dd>
              </div>
            </dl>
            <Link className="button-secondary" to={`/stories/${story.id}`}>
              詳細を見る
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
