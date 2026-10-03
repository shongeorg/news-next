import { createHash } from "node:crypto";

/**
 * Deterministic identifiers and readable slugs.
 *
 * Both are derived from stable article data (the canonical URL), so the same
 * article always gets the same id and the same slug after every refresh
 * (project.md §19–20).
 */

/** Short deterministic hash of an input string (hex). */
export function hashHex(input: string, length: number): string {
  const digest = createHash("sha256").update(input).digest("hex");
  return digest.slice(0, length);
}

/** Deterministic article id: hash of the canonical URL. */
export function createArticleId(canonicalUrl: string): string {
  return hashHex(canonicalUrl, 16);
}

const TRANSLITERATION: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "h", ґ: "g", д: "d", е: "e", є: "ie",
  ж: "zh", з: "z", и: "y", і: "i", ї: "i", й: "i", к: "k", л: "l",
  м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u",
  ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh", щ: "shch", ь: "",
  ю: "iu", я: "ia", ё: "e", ъ: "", ы: "y",
};

/** Lowercases, transliterates (Ukrainian supported) and makes a string URL-safe. */
export function slugify(input: string): string {
  const lowered = input
    .toLowerCase()
    .replace(/['’`״"«»()\[\]{}]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();

  let slug = "";
  for (const char of lowered) {
    const mapped = TRANSLITERATION[char];
    if (mapped !== undefined) {
      slug += mapped;
      continue;
    }
    slug += /[\p{L}\p{N}]/u.test(char) ? char : "-";
  }

  return slug
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

const MAX_BASE_SLUG_LENGTH = 72;

/**
 * Stable, readable slug: transliterated title + short URL hash.
 * The hash guarantees uniqueness (two articles can share a title) and keeps
 * the slug identical between refreshes.
 */
export function createArticleSlug(title: string, canonicalUrl: string): string {
  const base = slugify(title).slice(0, MAX_BASE_SLUG_LENGTH).replace(/-+$/g, "");
  const suffix = hashHex(canonicalUrl, 6);
  return base.length > 0 ? `${base}-${suffix}` : `novyna-${suffix}`;
}
