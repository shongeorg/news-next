import { unstable_cache } from "next/cache";
import { RSS_REVALIDATE_SECONDS } from "@/lib/constants";
import { getEnabledSources } from "@/lib/rss/feeds";
import { parseFeed } from "@/lib/rss/parser";
import {
  deduplicateItems,
  sortByPublicationDate,
  type FeedCandidate,
} from "@/lib/rss/deduplicate";
import { createArticleId, createArticleSlug } from "@/lib/rss/slug";
import type { NewsArticle, NewsCategory } from "@/types/news";

function describeError(reason: unknown): string {
  if (reason instanceof Error) return reason.message;
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
    return [];
  }

  // Sorting first keeps the newest copy when two sources report the same story.
  return sortByPublicationDate(deduplicateItems(candidates)).map(toArticle);
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
  const news = await getAggregatedNews();
  return [...news];
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
