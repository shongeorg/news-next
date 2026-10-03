import type { NewsArticle } from "@/types/news";

/** Longest query we accept — longer input is truncated, never rejected. */
const MAX_QUERY_LENGTH = 120;

/** Trims, collapses whitespace and bounds the raw `q` parameter. */
export function normalizeQuery(raw: string | undefined | null): string {
  if (typeof raw !== "string") return "";
  return raw.replace(/\s+/g, " ").trim().slice(0, MAX_QUERY_LENGTH);
}

/**
 * In-memory server-side search over the aggregated, normalized set —
 * no database, no external search API (project.md §36).
 *
 * All words of the query must match (title counts more than description),
 * relevance first, publication date as the tie-breaker.
 */
export function searchNews(
  articles: NewsArticle[],
  rawQuery: string,
): NewsArticle[] {
  const query = normalizeQuery(rawQuery);
  if (!query) return [];

  const terms = query
    .toLocaleLowerCase("uk")
    .split(" ")
    .filter((term) => term.length > 0);

  if (terms.length === 0) return [];

  const matches = articles.flatMap((article) => {
    const title = article.title.toLocaleLowerCase("uk");
    const description = article.description.toLocaleLowerCase("uk");

    let score = 0;
    for (const term of terms) {
      if (title.includes(term)) score += 3;
      else if (description.includes(term)) score += 1;
      else return [];
    }

    return [{ article, score }];
  });

  return matches
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const aTime = a.article.publishedAt ? Date.parse(a.article.publishedAt) : 0;
      const bTime = b.article.publishedAt ? Date.parse(b.article.publishedAt) : 0;
      return bTime - aTime;
    })
    .map((entry) => entry.article);
}
