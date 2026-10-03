import type { Metadata } from "next";
import { DEFAULT_DESCRIPTION, SITE_NAME } from "@/lib/constants";
import { getCategoryMeta, type NewsArticle } from "@/types/news";

/**
 * Canonical origin of the site.
 * Coming from env, never hardcoded (project.md §39–41).
 *
 * Order: explicit NEXT_PUBLIC_SITE_URL → the configured app URL → Vercel's
 * own production-domain variable → localhost (local development).
 */
export function getSiteUrl(): string {
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : undefined,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    try {
      return new URL(candidate).origin;
    } catch {
      // keep looking
    }
  }

  return "http://localhost:3000";
}

/** Absolute URL for an internal path (used by canonicals, OG and JSON-LD). */
export function absoluteUrl(path: string = "/"): string {
  const origin = getSiteUrl();
  if (!path || path === "/") return `${origin}/`;
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}

export const SITE_TITLE: Metadata["title"] = {
  default: SITE_NAME,
  template: `%s | ${SITE_NAME}`,
};

export const DEFAULT_METADATA: Metadata = {
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    siteName: SITE_NAME,
    locale: "uk_UA",
    type: "website" as const,
  },
  twitter: {
    card: "summary" as const,
  },
};

/**
 * Generic site image (project.md §48): used as og:image/twitter:image whenever
 * an article has no image of its own, and as the fallback share preview.
 * Stored in /public, so the path is stable and origin-independent.
 */
export const DEFAULT_OG_IMAGE_PATH = "/og-default.png";

export function defaultOgImage(width = 1200, height = 630) {
  return {
    url: absoluteUrl(DEFAULT_OG_IMAGE_PATH),
    width,
    height,
    alt: SITE_NAME,
  };
}

/** Publisher definition (project.md §47) — one stable @id reused everywhere. */
export function getOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${absoluteUrl("/")}#organization`,
    name: SITE_NAME,
    url: absoluteUrl("/"),
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/icon.png"),
      width: 512,
      height: 512,
    },
  };
}

/** Site-level WebSite schema with the site search action. */
export function getWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${absoluteUrl("/")}#website`,
    name: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    inLanguage: "uk",
    url: absoluteUrl("/"),
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${absoluteUrl("/search")}?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    publisher: { "@id": `${absoluteUrl("/")}#organization` },
  };
}

/**
 * NewsArticle JSON-LD for the article page (project.md §46).
 * Only real, visible values are emitted — no invented authors, dates or media.
 */
export function getNewsArticleJsonLd(article: NewsArticle) {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.description || undefined,
    image: article.imageUrl
      ? [article.imageUrl]
      : [absoluteUrl(DEFAULT_OG_IMAGE_PATH)],
    datePublished: article.publishedAt ?? undefined,
    dateModified: article.updatedAt ?? article.publishedAt ?? undefined,
    ...(article.author ? { author: { "@type": "Person", name: article.author } } : {}),
    publisher: { "@id": `${absoluteUrl("/")}#organization` },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": absoluteUrl(`/news/${article.slug}`),
    },
    articleSection: getCategoryMeta(article.category).label,
    inLanguage: "uk",
  };
}
