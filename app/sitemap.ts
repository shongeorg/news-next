import type { MetadataRoute } from "next";
import { getAllNews } from "@/lib/rss/aggregator";
import { absoluteUrl } from "@/lib/seo";
import { NEWS_CATEGORIES } from "@/types/news";

/**
 * Sitemap (project.md §44): homepage + category pages + article pages,
 * absolute URLs only — no search URLs, no internal routes, no noindex pages.
 *
 * Regenerated on the same 300s window as the news cache, so fresh articles
 * show up without a redeploy.
 *
 * §45 — a single sitemap file must never be assumed to grow forever: a file
 * is limited to 50 000 URLs / 50 MB, so the article list is capped well below
 * that (newest first — recency is what a news sitemap is for). If the corpus
 * outgrows the cap, split the file (e.g. `generateSitemaps` or a nested
 * `app/<segment>/sitemap.ts`) and reference the extra files from robots.txt.
 */
export const revalidate = 300;

const SITEMAP_MAX_URLS = 45_000;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1,
    },
    ...NEWS_CATEGORIES.map<MetadataRoute.Sitemap[number]>((category) => ({
      url: absoluteUrl(
        category.slug === "general"
          ? "/category/general"
          : `/category/${category.slug}`,
      ),
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.8,
    })),
  ];

  const news = await getAllNews();
  const articleBudget = Math.max(0, SITEMAP_MAX_URLS - pages.length);

  const articles: MetadataRoute.Sitemap = news
    .slice(0, articleBudget)
    .map<MetadataRoute.Sitemap[number]>((article) => {
      const modified = article.updatedAt ?? article.publishedAt;
      return {
        url: absoluteUrl(`/news/${article.slug}`),
        lastModified: modified ? new Date(modified) : undefined,
        changeFrequency: "daily",
        priority: 0.7,
      };
    });

  return [...pages, ...articles];
}
