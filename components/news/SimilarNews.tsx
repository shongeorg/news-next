import { NewsCard } from "@/components/news/NewsCard";
import type { NewsArticle } from "@/types/news";

type SimilarNewsProps = {
  articles: NewsArticle[];
};

/**
 * "Схожі новини" block: exactly four deterministic recommendations when four
 * valid candidates exist, otherwise whatever is available (project.md §32).
 */
export function SimilarNews({ articles }: SimilarNewsProps) {
  if (articles.length === 0) return null;

  return (
    <section aria-labelledby="similar-news" className="mt-12 border-t border-zinc-200 pt-8">
      <h2 id="similar-news" className="mb-5 text-xl font-bold text-zinc-900">
        Схожі новини
      </h2>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {articles.map((article) => (
          <NewsCard key={article.id} article={article} headingLevel="h3" />
        ))}
      </div>
    </section>
  );
}
