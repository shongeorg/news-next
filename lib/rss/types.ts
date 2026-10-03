import type { NewsCategory } from "@/types/news";

/** A single configured RSS/Atom source. All sources live in one place. */
export type RssSource = {
  id: string;
  name: string;
  url: string;
  category: NewsCategory;
  language: string;
  enabled: boolean;
  /** Homepage of the publication, used for attribution. */
  siteUrl: string;
};

/** Normalized shape of one raw feed item before it becomes a NewsArticle. */
export type NormalizedItem = {
  title: string;
  url: string;
  guid: string | null;
  description: string;
  content: string | null;
  imageUrl: string | null;
  publishedAt: string | null;
  updatedAt: string | null;
  author: string | null;
};

/** Result of fetching + parsing a single source. */
export type FeedResult =
  | { source: RssSource; ok: true; items: NormalizedItem[] }
  | {
      source: RssSource;
      ok: false;
      error: string;
      timestamp: string;
    };
