import type { NewsArticle } from "@/types/news";

/** Longest query we accept — longer input is truncated, never rejected. */
const MAX_QUERY_LENGTH = 120;

/**
 * Relevance weights (project.md §83): title match > description match >
 * source match. They are integers so the field ordering stays strict.
 */
const TITLE_WEIGHT = 3;
const DESCRIPTION_WEIGHT = 2;
const SOURCE_WEIGHT = 1;

/**
 * "Slight" recency boost (project.md §83). Kept below the gap between two
 * field weights, so recency can only break ties — never demote a title hit.
 */
const RECENCY_BOOST_FRESH = 0.5;
const RECENCY_BOOST_WARM = 0.25;
const RECENCY_FRESH_MS = 24 * 60 * 60 * 1000;
const RECENCY_WARM_MS = 72 * 60 * 60 * 1000;

/** Trims, collapses whitespace and bounds the raw `q` parameter. */
export function normalizeQuery(raw: string | undefined | null): string {
  if (typeof raw !== "string") return "";
  return raw.replace(/\s+/g, " ").trim().slice(0, MAX_QUERY_LENGTH);
}

/** Slight relevance boost for freshly published articles (§83), 0 otherwise. */
function recencyBoost(publishedAt: string | null): number {
  if (!publishedAt) return 0;
  const published = Date.parse(publishedAt);
  if (Number.isNaN(published)) return 0;

  const age = Date.now() - published;
  if (age >= 0 && age < RECENCY_FRESH_MS) return RECENCY_BOOST_FRESH;
  if (age >= 0 && age < RECENCY_WARM_MS) return RECENCY_BOOST_WARM;
  return 0;
}

/**
 * In-memory server-side search over the aggregated, normalized set —
 * no database, no external search API (project.md §35, §82).
 *
 * Search fields (§35): title, description and source name. Every word of the
 * query must match at least one field. Ranking (§83): title over description
 * over source, a slight boost for fresh articles, publication date as the
 * final tie-breaker. Normalization is lowercase + trimmed + collapsed
 * whitespace only — deliberately no fuzzy matching (§82).
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
    const source = article.source.name.toLocaleLowerCase("uk");

    let score = 0;
    for (const term of terms) {
      if (title.includes(term)) score += TITLE_WEIGHT;
      else if (description.includes(term)) score += DESCRIPTION_WEIGHT;
      else if (source.includes(term)) score += SOURCE_WEIGHT;
      else return [];
    }

    return [{ article, score: score + recencyBoost(article.publishedAt) }];
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
