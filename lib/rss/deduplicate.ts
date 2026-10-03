import { cleanText } from "@/lib/utils";
import type { NormalizedItem, RssSource } from "@/lib/rss/types";

/** Query parameters that only carry tracking noise and never identify content. */
const TRACKING_PARAMS = new Set([
  "gclid",
  "dclid",
  "yclid",
  "fbclid",
  "igshid",
  "mc_cid",
  "mc_eid",
  "_hsenc",
  "_hsmi",
  "ref_src",
  "ref_url",
  "cmpid",
  "spm",
  "fb_action_ids",
  "fb_action_types",
  "fb_source",
]);

/**
 * Normalizes a URL before comparison: enforces https, lowercases the host,
 * drops the fragment, removes known tracking parameters and the trailing
 * slash. Non-tracking query parameters are preserved — some sites use them as
 * part of the article URL (project.md §17).
 */
export function canonicalizeUrl(rawUrl: string): string {
  let url: URL;
  try {
    url = new URL(rawUrl.trim());
  } catch {
    return rawUrl.trim();
  }

  url.hash = "";
  url.hostname = url.hostname.toLowerCase();
  if (url.protocol === "http:") url.protocol = "https:";

  const params = url.searchParams;
  for (const key of [...params.keys()]) {
    const lower = key.toLowerCase();
    if (lower.startsWith("utm_") || TRACKING_PARAMS.has(lower)) {
      params.delete(key);
    }
  }
  const query = params.toString();
  url.search = query ? `?${query}` : "";
  if (url.pathname.length > 1) {
    url.pathname = url.pathname.replace(/\/+$/, "") || "/";
  }

  return url.toString();
}

/** Lowercased, punctuation-free title used only as a fallback dedupe key. */
export function normalizeTitleForComparison(title: string): string {
  return cleanText(title)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/** A normalized item together with the source it came from. */
export type FeedCandidate = NormalizedItem & { source: RssSource };

function publicationDay(candidate: FeedCandidate): string | null {
  if (!candidate.publishedAt) return null;
  const time = Date.parse(candidate.publishedAt);
  if (Number.isNaN(time)) return null;
  return new Date(time).toISOString().slice(0, 10);
}

/**
 * Removes the same story reported by several sources.
 * Keys are checked in the order required by project.md §16:
 * normalized GUID → canonical URL → normalized title (secondary only).
 *
 * Title matching additionally requires the same publication day (or the same
 * source when the date is unknown), which keeps unrelated articles that happen
 * to share wording from being merged.
 */
export function deduplicateItems<T extends FeedCandidate>(candidates: T[]): T[] {
  const seenGuids = new Set<string>();
  const seenUrls = new Set<string>();
  const seenTitles = new Set<string>();
  const result: T[] = [];

  for (const candidate of candidates) {
    const guid = candidate.guid?.trim().toLowerCase();
    const urlKey = canonicalizeUrl(candidate.url);
    const titleBase = normalizeTitleForComparison(candidate.title);
    const day = publicationDay(candidate);
    const titleKey = titleBase ? `${titleBase}|${day ?? candidate.source.id}` : null;

    if (guid && seenGuids.has(guid)) continue;
    if (seenUrls.has(urlKey)) continue;
    if (titleKey && seenTitles.has(titleKey)) continue;

    if (guid) seenGuids.add(guid);
    seenUrls.add(urlKey);
    if (titleKey) seenTitles.add(titleKey);
    result.push(candidate);
  }

  return result;
}

/** Newest first; items without a reliable date are sorted last (project.md §97–98). */
export function sortByPublicationDate<T extends { publishedAt: string | null }>(
  items: T[],
): T[] {
  return [...items].sort((a, b) => {
    const aTime = a.publishedAt ? Date.parse(a.publishedAt) : Number.NEGATIVE_INFINITY;
    const bTime = b.publishedAt ? Date.parse(b.publishedAt) : Number.NEGATIVE_INFINITY;
    if (aTime === bTime) return 0;
    return bTime - aTime;
  });
}
