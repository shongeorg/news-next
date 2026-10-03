/**
 * Application-wide news types.
 * The UI depends only on these types — never on raw RSS parser output.
 */

export type NewsCategory =
  | "general"
  | "ukraine"
  | "world"
  | "technology"
  | "business"
  | "sports"
  | "health"
  | "science"
  | "entertainment";

export type CategoryMeta = {
  slug: NewsCategory;
  /** Ukrainian navigation label. */
  label: string;
  /** Unique SEO description for the category page. */
  description: string;
};

/**
 * Initial category list. Order matters: it drives navigation and the sitemap.
 * Adding a category = adding an entry here plus (optionally) RSS sources.
 */
export const NEWS_CATEGORIES: readonly CategoryMeta[] = [
  {
    slug: "general",
    label: "Головне",
    description: "Останні головні новини з українських та світових ЗМІ.",
  },
  {
    slug: "ukraine",
    label: "Україна",
    description: "Новини України: політика, суспільство, регіони та події країни.",
  },
  {
    slug: "world",
    label: "Світ",
    description: "Міжнародні новини: світові події, політика та економіка світу.",
  },
  {
    slug: "technology",
    label: "Технології",
    description: "Новини технологій, гаджетів, штучного інтелекту та інтернету.",
  },
  {
    slug: "business",
    label: "Бізнес",
    description: "Економічні новини, ринки, фінанси та бізнес-події.",
  },
  {
    slug: "sports",
    label: "Спорт",
    description: "Спортивні новини: футбол, матчі, турніри та результати.",
  },
  {
    slug: "health",
    label: "Здоров'я",
    description: "Новини здоров'я, медицини, поради та дослідження.",
  },
  {
    slug: "science",
    label: "Наука",
    description: "Наукові новини, відкриття, дослідження та космос.",
  },
  {
    slug: "entertainment",
    label: "Розваги",
    description: "Новини культури, кіно, музики та розваг.",
  },
];

export type NewsArticle = {
  /** Deterministic id derived from the canonical article URL. */
  id: string;
  /** Stable, readable, URL-safe slug used by /news/[slug]. */
  slug: string;
  title: string;
  description: string;
  /** Plain-text excerpt taken from the feed (never scraped HTML). */
  content: string | null;
  /** Original article URL as published by the source. */
  url: string;
  imageUrl: string | null;
  /**
   * ISO timestamp of publication.
   * `null` when the feed did not provide a reliable date — such articles are
   * sorted after dated ones instead of receiving an invented date (project.md §97).
   */
  publishedAt: string | null;
  updatedAt: string | null;
  source: {
    id: string;
    name: string;
    url: string;
  };
  author: string | null;
  category: NewsCategory;
  language: string;
};

export function isNewsCategory(value: string): value is NewsCategory {
  return NEWS_CATEGORIES.some((category) => category.slug === value);
}

export function getCategoryMeta(slug: NewsCategory): CategoryMeta {
  const found = NEWS_CATEGORIES.find((category) => category.slug === slug);
  if (!found) {
    throw new Error(`Unknown news category: ${slug}`);
  }
  return found;
}
