import { unstable_cache } from "next/cache";
import { RSS_REVALIDATE_SECONDS, SIMILAR_NEWS_COUNT } from "@/lib/constants";
import { getEnabledSources } from "@/lib/rss/feeds";
import { parseFeed } from "@/lib/rss/parser";
import {
  deduplicateItems,
  sortByPublicationDate,
  type FeedCandidate,
} from "@/lib/rss/deduplicate";
import { createArticleId, createArticleSlug } from "@/lib/rss/slug";
import { getSimilarArticles } from "@/lib/rss/similarity";
import type { NewsArticle, NewsCategory } from "@/types/news";

/**
 * Last successfully aggregated set of the current (warm) server instance.
 * A transient, total feed outage then serves this snapshot instead of an
 * empty page — the site never goes blank because of a network blip.
 */
let lastGoodSnapshot: NewsArticle[] | null = null;

function describeError(reason: unknown): string {
  if (reason instanceof Error) {
    const cause = reason.cause as { code?: string; message?: string } | undefined;
    const causeInfo = cause
      ? ` cause=${cause.code ?? cause.message ?? "?"}`
      : "";
    return `${reason.message}${causeInfo}`;
  }
  if (typeof reason === "string") return reason;
  return "unknown error";
}

function toArticle(candidate: FeedCandidate): NewsArticle {
  return {
    id: createArticleId(candidate.url),
    slug: createArticleSlug(candidate.title, candidate.url),
    title: candidate.title,
    description: candidate.description,
    content: candidate.content,
    url: candidate.url,
    imageUrl: candidate.imageUrl,
    publishedAt: candidate.publishedAt,
    updatedAt: candidate.updatedAt,
    source: {
      id: candidate.source.id,
      name: candidate.source.name,
      url: candidate.source.siteUrl,
    },
    author: candidate.author,
    category: candidate.source.category,
    language: candidate.source.language,
  };
}

/**
 * Full aggregation pipeline:
 * fetch → parse → normalize → validate → deduplicate → sort → id → slug.
 *
 * Sources are fetched concurrently and a single failing source is logged and
 * skipped — it never breaks the rest of the aggregation (project.md §12).
 */
async function collectNews(): Promise<NewsArticle[]> {
  const sources = getEnabledSources();
  const timestamp = new Date().toISOString();

  const settled = await Promise.allSettled(
    sources.map(async (source) => ({
      source,
      items: await parseFeed(source),
    })),
  );

  const candidates: FeedCandidate[] = [];

  settled.forEach((result, index) => {
    const source = sources[index];

    if (result.status === "rejected") {
      console.warn(
        `[rss] source failed id=${source.id} name="${source.name}" error=${describeError(result.reason)} at=${timestamp}`,
      );
      return;
    }

    for (const item of result.value.items) {
      candidates.push({ ...item, source });
    }
  });

  if (candidates.length === 0) {
    console.error(`[rss] no sources returned data at=${timestamp}`);

    // Prefer stale-but-real content over an empty page.
    if (lastGoodSnapshot && lastGoodSnapshot.length > 0) {
      console.warn(
        `[rss] total outage — serving last good snapshot (${lastGoodSnapshot.length} articles) at=${timestamp}`,
      );
      return lastGoodSnapshot;
    }

    // Nothing to show: throw so `unstable_cache` does NOT cache an empty
    // result for the whole revalidate window — the next request retries.
    throw new Error("all RSS sources failed");
  }

  // Sorting first keeps the newest copy when two sources report the same story.
  const articles = sortByPublicationDate(deduplicateItems(candidates)).map(
    toArticle,
  );
  lastGoodSnapshot = articles;
  return articles;
}

const getAggregatedNews = unstable_cache(
  async () => collectNews(),
  ["aggregated-news"],
  {
    revalidate: RSS_REVALIDATE_SECONDS,
    tags: ["news"],
  },
);

/** All aggregated articles, newest first, cached for RSS_REVALIDATE_SECONDS. */
export async function getAllNews(): Promise<NewsArticle[]> {
  try {
    const news = await getAggregatedNews();
    if (news.length > 0) return [...news];

    // The current code never stores an empty array, so an empty cached value
    // is a leftover from an older build. Bypass it and aggregate right now —
    // a poisoned cache entry must not keep the site blank.
    console.warn("[rss] cached aggregation is empty — fetching fresh");
    return [...(await collectNews())];
  } catch (error) {
    console.error(`[rss] aggregation failed: ${describeError(error)}`);

    if (lastGoodSnapshot && lastGoodSnapshot.length > 0) {
      return [...lastGoodSnapshot];
    }
    throw error;
  }
}

/** Aggregated articles of one category, newest first. */
export async function getNewsByCategory(
  category: NewsCategory,
): Promise<NewsArticle[]> {
  const news = await getAllNews();
  return news.filter((article) => article.category === category);
}

/** Single article lookup by its stable slug. */
export async function getNewsBySlug(slug: string): Promise<NewsArticle | null> {
  if (!slug) return null;
  const news = await getAllNews();
  return news.find((article) => article.slug === slug) ?? null;
}

/** Deterministic set of similar articles for the article page (project.md §32–33). */
export async function getSimilarNews(
  article: NewsArticle,
  count: number = SIMILAR_NEWS_COUNT,
): Promise<NewsArticle[]> {
  const news = await getAllNews();
  return getSimilarArticles(article, news, count);
}
