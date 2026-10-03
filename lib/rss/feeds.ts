import type { RssSource } from "@/lib/rss/types";

/**
 * Single, centralized RSS source configuration.
 *
 * Every URL below was verified to return a working RSS 2.0 / Atom feed with
 * at least 5 items before being added (project.md §6). Adding, removing or
 * disabling a source never requires touching the aggregation logic.
 */
const rssSources: readonly RssSource[] = [
  // ── general ────────────────────────────────────────────────────────────
  {
    id: "pravda-main",
    name: "Українська правда",
    url: "https://www.pravda.com.ua/rss/",
    siteUrl: "https://www.pravda.com.ua",
    category: "general",
    language: "uk",
    enabled: true,
  },
  {
    id: "suspilne",
    name: "Суспільне",
    url: "https://suspilne.media/rss/all.rss",
    siteUrl: "https://suspilne.media",
    category: "general",
    language: "uk",
    enabled: true,
  },
  {
    id: "tsn",
    name: "ТСН",
    url: "https://tsn.ua/rss",
    siteUrl: "https://tsn.ua",
    category: "general",
    language: "uk",
    enabled: true,
  },
  {
    id: "liga-news",
    name: "LIGA.net",
    url: "https://news.liga.net/ua/all/rss.xml",
    siteUrl: "https://liga.net",
    category: "general",
    language: "uk",
    enabled: true,
  },
  {
    id: "nv",
    name: "NV",
    url: "https://nv.ua/ukr/rss/all.xml",
    siteUrl: "https://nv.ua",
    category: "general",
    language: "uk",
    enabled: true,
  },
  {
    id: "interfax-ua",
    name: "Інтерфакс-Україна",
    url: "https://interfax.com.ua/news/last.rss",
    siteUrl: "https://interfax.com.ua",
    category: "general",
    language: "uk",
    enabled: true,
  },

  // ── ukraine ────────────────────────────────────────────────────────────
  {
    id: "ukrinform",
    name: "Укрінформ",
    url: "https://www.ukrinform.ua/rss/block-lastnews",
    siteUrl: "https://www.ukrinform.ua",
    category: "ukraine",
    language: "uk",
    enabled: true,
  },
  {
    id: "unian",
    name: "УНІАН",
    url: "https://rss.unian.net/site/news_ukr.rss",
    siteUrl: "https://www.unian.net",
    category: "ukraine",
    language: "uk",
    enabled: true,
  },
  {
    id: "lb-politics",
    name: "LB.ua",
    url: "https://lb.ua/rss/ukr/politics.xml",
    siteUrl: "https://lb.ua",
    category: "ukraine",
    language: "uk",
    enabled: true,
  },
  {
    id: "censor",
    name: "Censor.net",
    url: "https://assets.censor.net/rss/censor.net/rss_uk_feed.xml",
    siteUrl: "https://censor.net",
    category: "ukraine",
    language: "uk",
    enabled: true,
  },
  {
    id: "gordon",
    name: "Гордон",
    url: "https://gordonua.com/ukr/api/media/out/rss/lastnews.xml",
    siteUrl: "https://gordonua.com",
    category: "ukraine",
    language: "uk",
    enabled: true,
  },

  // ── world ──────────────────────────────────────────────────────────────
  {
    id: "bbc-world",
    name: "BBC News",
    url: "https://feeds.bbci.co.uk/news/world/rss.xml",
    siteUrl: "https://www.bbc.co.uk/news/world",
    category: "world",
    language: "en",
    enabled: true,
  },
  {
    id: "guardian-world",
    name: "The Guardian",
    url: "https://www.theguardian.com/world/rss",
    siteUrl: "https://www.theguardian.com",
    category: "world",
    language: "en",
    enabled: true,
  },
  {
    id: "eurointegration",
    name: "Європейська правда",
    url: "https://www.eurointegration.com.ua/rss/",
    siteUrl: "https://www.eurointegration.com.ua",
    category: "world",
    language: "uk",
    enabled: true,
  },

  // ── technology ─────────────────────────────────────────────────────────
  {
    id: "liga-tech",
    name: "LIGA.net Технології",
    url: "https://tech.liga.net/ua/all/rss.xml",
    siteUrl: "https://tech.liga.net",
    category: "technology",
    language: "uk",
    enabled: true,
  },
  {
    id: "the-verge",
    name: "The Verge",
    url: "https://www.theverge.com/rss/index.xml",
    siteUrl: "https://www.theverge.com",
    category: "technology",
    language: "en",
    enabled: true,
  },
  {
    id: "ars-technica",
    name: "Ars Technica",
    url: "https://arstechnica.com/feed/",
    siteUrl: "https://arstechnica.com",
    category: "technology",
    language: "en",
    enabled: true,
  },
  {
    id: "bbc-technology",
    name: "BBC Technology",
    url: "https://feeds.bbci.co.uk/news/technology/rss.xml",
    siteUrl: "https://www.bbc.co.uk/news/technology",
    category: "technology",
    language: "en",
    enabled: true,
  },

  // ── business ───────────────────────────────────────────────────────────
  {
    id: "liga-business",
    name: "LIGA.net Бізнес",
    url: "https://biz.liga.net/ua/all/rss.xml",
    siteUrl: "https://biz.liga.net",
    category: "business",
    language: "uk",
    enabled: true,
  },
  {
    id: "mind",
    name: "Mind",
    url: "https://mind.ua/feed/google_follow",
    siteUrl: "https://mind.ua",
    category: "business",
    language: "uk",
    enabled: true,
  },
  {
    id: "bbc-business",
    name: "BBC Business",
    url: "https://feeds.bbci.co.uk/news/business/rss.xml",
    siteUrl: "https://www.bbc.co.uk/news/business",
    category: "business",
    language: "en",
    enabled: true,
  },

  // ── sports ─────────────────────────────────────────────────────────────
  {
    id: "sport-ua",
    name: "Sport.ua",
    url: "https://sport.ua/rss/all",
    siteUrl: "https://sport.ua",
    category: "sports",
    language: "uk",
    enabled: true,
  },
  {
    id: "pravda-sport",
    name: "Українська правда Спорт",
    url: "https://www.pravda.com.ua/rss/sport/",
    siteUrl: "https://www.pravda.com.ua",
    category: "sports",
    language: "uk",
    enabled: true,
  },
  {
    id: "bbc-sport",
    name: "BBC Sport",
    url: "https://feeds.bbci.co.uk/sport/rss.xml",
    siteUrl: "https://www.bbc.co.uk/sport",
    category: "sports",
    language: "en",
    enabled: true,
  },
  {
    id: "guardian-football",
    name: "The Guardian Football",
    url: "https://www.theguardian.com/football/rss",
    siteUrl: "https://www.theguardian.com/football",
    category: "sports",
    language: "en",
    enabled: true,
  },

  // ── health ─────────────────────────────────────────────────────────────
  {
    id: "pravda-life",
    name: "Українська правда Життя",
    url: "https://www.pravda.com.ua/rss/life/",
    siteUrl: "https://www.pravda.com.ua",
    category: "health",
    language: "uk",
    enabled: true,
  },
  {
    id: "bbc-health",
    name: "BBC Health",
    url: "https://feeds.bbci.co.uk/news/health/rss.xml",
    siteUrl: "https://www.bbc.co.uk/news/health",
    category: "health",
    language: "en",
    enabled: true,
  },

  // ── science ────────────────────────────────────────────────────────────
  {
    id: "bbc-science",
    name: "BBC Science",
    url: "https://feeds.bbci.co.uk/news/science_and_environment/rss.xml",
    siteUrl: "https://www.bbc.co.uk/news/science_and_environment",
    category: "science",
    language: "en",
    enabled: true,
  },
  {
    id: "science-daily",
    name: "ScienceDaily",
    url: "https://www.sciencedaily.com/rss/all.xml",
    siteUrl: "https://www.sciencedaily.com",
    category: "science",
    language: "en",
    enabled: true,
  },

  // ── entertainment ──────────────────────────────────────────────────────
  {
    id: "guardian-culture",
    name: "The Guardian Culture",
    url: "https://www.theguardian.com/culture/rss",
    siteUrl: "https://www.theguardian.com/culture",
    category: "entertainment",
    language: "en",
    enabled: true,
  },
  {
    id: "variety",
    name: "Variety",
    url: "https://variety.com/feed/",
    siteUrl: "https://variety.com",
    category: "entertainment",
    language: "en",
    enabled: true,
  },
  {
    id: "liga-life",
    name: "LIGA.net Життя",
    url: "https://life.liga.net/all/rss.xml",
    siteUrl: "https://life.liga.net",
    category: "entertainment",
    language: "uk",
    enabled: true,
  },
];

/** All configured sources (including disabled ones). */
export function getAllSources(): readonly RssSource[] {
  return rssSources;
}

/** Sources that should be fetched during aggregation. */
export function getEnabledSources(): RssSource[] {
  return rssSources.filter((source) => source.enabled);
}

export function getSourceById(id: string): RssSource | null {
  return rssSources.find((source) => source.id === id) ?? null;
}
