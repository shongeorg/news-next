/** Text helpers shared by the RSS layer and the UI. */

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  ndash: "–",
  mdash: "—",
  hellip: "…",
  laquo: "«",
  raquo: "»",
  lsquo: "‘",
  rsquo: "’",
  ldquo: "“",
  rdquo: "”",
  bull: "•",
  middot: "·",
  copy: "©",
  reg: "®",
  trade: "™",
  deg: "°",
  euro: "€",
  pound: "£",
  times: "×",
  divide: "÷",
};

function decodeEntities(value: string): string {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (match, hex: string) => {
      const code = Number.parseInt(hex, 16);
      return Number.isNaN(code) ? match : String.fromCodePoint(code);
    })
    .replace(/&#(\d+);/g, (match, dec: string) => {
      const code = Number.parseInt(dec, 10);
      return Number.isNaN(code) ? match : String.fromCodePoint(code);
    })
    .replace(/&([a-z]+);/gi, (match, name: string) => {
      const replacement = NAMED_ENTITIES[name.toLowerCase()];
      return replacement ?? match;
    });
}

/** Removes HTML markup and returns readable plain text. */
export function stripHtml(input: string): string {
  return decodeEntities(
    input
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|li|h[1-6]|tr|blockquote)>/gi, "\n")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/[ \t ]+/g, " ")
    .replace(/\s*\n\s*/g, "\n")
    .replace(/\n{2,}/g, "\n")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/** Cleans an arbitrary RSS field into a single-line plain text string. */
export function cleanText(input: unknown): string {
  if (typeof input !== "string" || input.length === 0) return "";
  return stripHtml(input).replace(/\s*\n\s*/g, " ").trim();
}

/** Truncates text on a word boundary and appends an ellipsis. */
export function truncateText(input: string, maxLength: number): string {
  const text = input.trim();
  if (text.length <= maxLength) return text;
  const cut = text.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > maxLength * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

/** Extracts the first image URL found in an HTML fragment, if any. */
export function extractFirstImage(html: string | undefined | null): string | null {
  if (!html) return null;
  const match = /<img[^>]+src\s*=\s*["']([^"']+)["']/i.exec(html);
  return match ? match[1] : null;
}

/** True when the value is a normal http(s) URL we are allowed to link to. */
export function isSafeHttpUrl(value: unknown): value is string {
  if (typeof value !== "string" || value.trim().length === 0) return false;
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
