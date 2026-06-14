import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { LoadingSpinner } from "../components/feedback/LoadingSpinner";
import { Reveal } from "../components/motion/Reveal";
import {
  BUDGET_RANGE_OPTIONS,
  PURPOSE_OPTIONS,
  RELATIONSHIP_OPTIONS,
  formatBudgetRange,
  resultBadgeClasses,
  resultLabels,
} from "../lib/giftOptions";
import { getStories } from "../services/storyService";
import type { StoryListItem, StoryListQuery } from "../types/story";

const PAGE_SIZE = 12;

export function StoryListPage() {
  const [stories, setStories] = useState<StoryListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<StoryListQuery>({ page: 1, limit: PAGE_SIZE });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    getStories(filters)
      .then((data) => {
        if (!isMounted) {
          return;
        }

        setStories(data.items);
        setTotal(data.total);
        setErrorMessage("");
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }

        setStories([]);
        setTotal(0);
        setErrorMessage(
          error instanceof Error ? error.message : "体験談の取得に失敗しました。",
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
  }, [filters]);

  function updateFilter(name: keyof StoryListQuery, value: string) {
    setFilters((current) => ({
      ...current,
      [name]: value || undefined,
      page: 1,
    }));
  }

  const page = filters.page ?? 1;
  const limit = filters.limit ?? PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  function goToPage(nextPage: number) {
    setFilters((current) => ({ ...current, page: nextPage }));
  }

  return (
    <section className="detail-page list-page">
      <div className="list-page-header">
        <div>
          <h1>体験談一覧</h1>
          <p>公開されているプレゼント体験談を条件で探せます。</p>
        </div>

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
              {RELATIONSHIP_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>目的</span>
            <select
              onChange={(event) => updateFilter("purpose", event.target.value)}
              value={filters.purpose ?? ""}
            >
              <option value="">すべて</option>
              {PURPOSE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>予算帯</span>
            <select
              onChange={(event) => updateFilter("budget_range", event.target.value)}
              value={filters.budget_range ?? ""}
            >
              <option value="">すべて</option>
              {BUDGET_RANGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>結果</span>
            <select
              onChange={(event) => updateFilter("result", event.target.value)}
              value={filters.result ?? ""}
            >
              <option value="">すべて</option>
              {Object.entries(resultLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="list-panel">
        {errorMessage ? (
          <div className="notice" role="alert">
            {errorMessage}
          </div>
        ) : null}

        {isLoading ? <LoadingSpinner label="体験談を読み込んでいます。" /> : null}

        {!isLoading && !errorMessage && stories.length === 0 ? (
          <div className="empty-state">
            <h2>条件に合う体験談が見つかりませんでした</h2>
            <p>条件を変更して、もう一度お試しください。</p>
          </div>
        ) : null}

        {!isLoading && stories.length > 0 ? (
          <>
            <p className="count-label">{total}件の体験談</p>
            <div className="card-grid">
              {stories.map((story, index) => (
                <Reveal delay={Math.min(index, 4) * 0.05} key={story.id}>
                  <article className="result-card">
                    <div>
                      <div className="meta-row">
                        <p className={`placeholder-label ${resultBadgeClasses[story.result]}`}>
                          {resultLabels[story.result]}
                        </p>
                        <p className="placeholder-label placeholder-label-neutral">
                          {formatBudgetRange(story.budget_range)}
                        </p>
                      </div>
                      <h2>{story.title}</h2>
                      <p className="card-meta">
                        {new Date(story.created_at).toLocaleDateString("ja-JP")} 投稿
                      </p>
                    </div>
                    <Link className="button-secondary" to={`/stories/${story.id}`}>
                      詳細を見る
                    </Link>
                  </article>
                </Reveal>
              ))}
            </div>
          </>
        ) : null}
      </div>

      {!isLoading && stories.length > 0 && totalPages > 1 ? (
        <div className="action-row list-page-footer">
          <button
            className="button-secondary"
            disabled={page <= 1}
            onClick={() => goToPage(page - 1)}
            type="button"
          >
            前のページ
          </button>
          <span className="count-label">
            {page} / {totalPages}ページ
          </span>
          <button
            className="button-secondary"
            disabled={page >= totalPages}
            onClick={() => goToPage(page + 1)}
            type="button"
          >
            次のページ
          </button>
        </div>
      ) : null}
    </section>
  );
}
