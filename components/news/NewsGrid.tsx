import { NewsCard } from "@/components/news/NewsCard";
import type { NewsArticle } from "@/types/news";

type NewsGridProps = {
  articles: NewsArticle[];
  /** How many leading images are preloaded to protect LCP. */
  priorityCount?: number;
};

/**
 * Responsive news grid: 3 columns on desktop, 2 on tablet, 1 on mobile.
 * All articles come from one server-side result set — no extra dataset is
 * fetched for the featured item (project.md §23).
 */
export function NewsGrid({ articles, priorityCount = 2 }: NewsGridProps) {
  if (articles.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {articles.map((article, index) => (
        <div
          key={article.id}
          className={index === 0 ? "sm:col-span-2 lg:col-span-2" : undefined}
        >
          <NewsCard
            article={article}
            headingLevel="h2"
            priority={index < priorityCount}
          />
        </div>
      ))}
    </div>
  );
}
