import Parser from "rss-parser";
import { RSS_FETCH_TIMEOUT_MS } from "@/lib/constants";
import type { NormalizedItem, RssSource } from "@/lib/rss/types";
import { normalizeItem, type RawFeedItem } from "@/lib/rss/normalize";

/** Kept identical to the browser UA used when the feed list was verified. */
const REQUEST_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept:
    "application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
};

const parser = new Parser({
  timeout: RSS_FETCH_TIMEOUT_MS,
  headers: REQUEST_HEADERS,
  customFields: {
    item: [
      ["media:content", "media:content", { keepArray: true }],
      ["media:thumbnail", "media:thumbnail", { keepArray: true }],
      ["media:group", "media:group", { keepArray: true }],
      ["published", "published"],
      ["updated", "updated"],
      ["dc:language", "dc:language"],
    ],
  },
});

/** Maximum number of items kept per source so one huge feed cannot dominate. */
const MAX_ITEMS_PER_SOURCE = 50;

/** One retry absorbs a transient reset/hang without unbounded blocking. */
const MAX_ATTEMPTS = 2;
const RETRY_DELAY_MS = 400;

/** Single attempt: hard timeout, status check, non-empty body check. */
async function downloadFeedXml(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: REQUEST_HEADERS,
    cache: "no-store",
    signal: AbortSignal.timeout(RSS_FETCH_TIMEOUT_MS),
    redirect: "follow",
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const xml = await response.text();
  if (!xml.trim()) {
    throw new Error("empty response body");
  }
  return xml;
}

/** Compact error report including the transport-level cause, if any. */
function errorDetails(reason: unknown): string {
  if (!(reason instanceof Error)) return String(reason);
  const cause = reason.cause as { code?: string; message?: string } | undefined;
  const causeInfo = cause ? ` cause=${cause.code ?? cause.message ?? "?"}` : "";
  return `${reason.name}: ${reason.message}${causeInfo}`;
}

/**
 * Downloads a feed server-side with a hard timeout and one immediate retry.
 * A slow or broken RSS server can never block aggregation indefinitely
 * (worst case ≈ 2 × RSS_FETCH_TIMEOUT_MS + delay, inside `maxDuration`),
 * while a single dropped connection no longer removes a working source.
 */
export async function fetchFeedXml(url: string): Promise<string> {
  let lastError: unknown;
  let attempts = 0;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    attempts = attempt;
    try {
      return await downloadFeedXml(url);
    } catch (error) {
      lastError = error;

      // An HTTP status answer is definitive — retrying it is pointless.
      if (error instanceof Error && error.message.startsWith("HTTP ")) {
        throw error;
      }
      if (attempt === MAX_ATTEMPTS) break;
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }

  throw new Error(
    `fetch failed after ${attempts} attempt(s): ${errorDetails(lastError)}`,
  );
}

/**
 * Fetches, parses and normalizes one source.
 * Throws on transport/parse errors — the caller decides how to log and skip it.
 */
export async function parseFeed(
  source: RssSource,
  maxItems: number = MAX_ITEMS_PER_SOURCE,
): Promise<NormalizedItem[]> {
  const xml = await fetchFeedXml(source.url);
  const feed = await parser.parseString(xml);

  const items: NormalizedItem[] = [];
  for (const raw of feed.items ?? []) {
    const normalized = normalizeItem(raw as RawFeedItem, source);
    if (normalized) {
      items.push(normalized);
      if (items.length >= maxItems) break;
    }
  }

  return items;
}
