import type { NormalizedItem, RssSource } from "@/lib/rss/types";
import { canonicalizeUrl } from "@/lib/rss/deduplicate";
import {
  cleanText,
  extractFirstImage,
  isSafeHttpUrl,
  truncateText,
} from "@/lib/utils";

/** Description shown in cards and meta tags. */
const DESCRIPTION_LIMIT = 400;
/** Excerpt kept for the article page — an excerpt, never the full original text. */
const CONTENT_LIMIT = 2000;
const AUTHOR_LIMIT = 120;

/**
 * Structural view of a raw `rss-parser` item.
 * Both RSS 2.0 and Atom entries are mapped onto this shape.
 */
export type RawFeedItem = {
  title?: unknown;
  link?: unknown;
  guid?: unknown;
  id?: unknown;
  pubDate?: unknown;
  isoDate?: unknown;
  published?: unknown;
  date?: unknown;
  updated?: unknown;
  creator?: unknown;
  dcCreator?: unknown;
  author?: unknown;
  content?: unknown;
  contentSnippet?: unknown;
  description?: unknown;
  enclosure?: unknown;
  image?: unknown;
  thumbnail?: unknown;
  "media:content"?: unknown;
  "media:thumbnail"?: unknown;
  "media:group"?: unknown;
  contentEncoded?: unknown;
  "content:encoded"?: unknown;
};

function asString(value: unknown): string {
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  if (value && typeof value === "object") {
    const object = value as Record<string, unknown>;
    if (typeof object["#"] === "string") return object["#"];
    if (typeof object.href === "string") return object.href;
    if (typeof object.name === "string") return object.name;
    if (typeof object._ === "string") return object._;
  }
  return "";
}

function firstString(...values: unknown[]): string {
  for (const value of values) {
    const text = asString(value).trim();
    if (text) return text;
  }
  return "";
}

function parseDate(value: unknown): string | null {
  const text = asString(value).trim();
  if (!text) return null;
  const time = Date.parse(text);
  if (Number.isNaN(time)) return null;
  return new Date(time).toISOString();
}

/** Pulls an http(s) URL out of enclosure / media:content / media:thumbnail shapes. */
function pickMediaUrl(value: unknown, depth = 0): string | null {
  if (!value || depth > 4) return null;

  if (Array.isArray(value)) {
    for (const entry of value) {
      const found = pickMediaUrl(entry, depth + 1);
      if (found) return found;
    }
    return null;
  }

  if (typeof value === "string") {
    return isSafeHttpUrl(value) ? value : null;
  }

  if (typeof value === "object") {
    const object = value as Record<string, unknown>;
    const attributes =
      object["$"] && typeof object["$"] === "object"
        ? (object["$"] as Record<string, unknown>)
        : object;
    for (const key of ["url", "href", "src"]) {
      const candidate = attributes[key];
      if (isSafeHttpUrl(candidate)) return candidate;
    }
    for (const key of ["media:content", "media:thumbnail", "media:group", "link"]) {
      const found = pickMediaUrl(object[key], depth + 1);
      if (found) return found;
    }
  }

  return null;
}

function resolveLink(item: RawFeedItem): string | null {
  const link = firstString(item.link, item.guid, item.id);
  return isSafeHttpUrl(link) ? link : null;
}

function resolveImage(item: RawFeedItem): string | null {
  const candidates: unknown[] = [];

  if (item.enclosure) {
    const enclosure = item.enclosure as Record<string, unknown>;
    const type = typeof enclosure.type === "string" ? enclosure.type : "";
    const url = typeof enclosure.url === "string" ? enclosure.url : "";
    // Skip audio/video enclosures so we do not link a media file as an image.
    if (!type || type.startsWith("image") || url.match(/\.(jpe?g|png|webp|gif|avif)(\?|$)/i)) {
      candidates.push(item.enclosure);
    }
  }

  candidates.push(
    item["media:thumbnail"],
    item.image,
    item.thumbnail,
    item["media:content"],
    item["media:group"],
  );

  for (const candidate of candidates) {
    const url = pickMediaUrl(candidate);
    if (url) return url;
  }

  const html = firstString(
    item.contentEncoded,
    item["content:encoded"],
    item.content,
    item.description,
  );
  return extractFirstImage(html);
}

function resolveAuthor(item: RawFeedItem): string | null {
  const author = cleanText(firstString(item.creator, item.dcCreator, item.author));
  if (!author) return null;
  return truncateText(author, AUTHOR_LIMIT);
}

/**
 * Converts one raw feed item into the normalized model.
 * Returns `null` when the item lacks the minimum required data
 * (title + valid URL, project.md §96).
 */
export function normalizeItem(
  item: RawFeedItem,
  source: RssSource,
): NormalizedItem | null {
  void source;
  const title = cleanText(firstString(item.title));
  const url = resolveLink(item);
  if (!title || !url) return null;

  const description = cleanText(
    firstString(item.contentSnippet, item.description, item.content),
  );
  const fullText = cleanText(
    firstString(item.contentEncoded, item["content:encoded"], item.content),
  );

  const excerpt =
    fullText && fullText !== description ? truncateText(fullText, CONTENT_LIMIT) : null;

  const publishedAt =
    parseDate(item.pubDate) ??
    parseDate(item.published) ??
    parseDate(item.isoDate) ??
    parseDate(item.date);

  let updatedAt = parseDate(item.updated);
  if (updatedAt && updatedAt === publishedAt) updatedAt = null;

  const guid = asString(item.guid ?? item.id).trim();

  return {
    title: truncateText(title, 300),
    url: canonicalizeUrl(url),
    guid: guid || null,
    description: truncateText(description, DESCRIPTION_LIMIT),
    content: excerpt && excerpt !== description ? excerpt : null,
    imageUrl: resolveImage(item),
    publishedAt,
    updatedAt,
    author: resolveAuthor(item),
  };
}
