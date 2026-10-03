import { PAGE_SIZE } from "@/lib/constants";

export { PAGE_SIZE };

export type PaginatedResult<T> = {
  items: T[];
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
};

/**
 * Parses the `page` query parameter.
 * `?page=abc`, `?page=-1`, `?page=0` and arrays fall back to page 1 and never
 * throw (project.md §26).
 */
export function parsePage(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  if (typeof raw !== "string") return 1;
  const parsed = Number.parseInt(raw.trim(), 10);
  if (!Number.isFinite(parsed)) return 1;
  return parsed;
}

/** Total number of pages for a given item count (at least 1). */
export function getTotalPages(
  totalItems: number,
  pageSize: number = PAGE_SIZE,
): number {
  if (totalItems <= 0) return 1;
  return Math.max(1, Math.ceil(totalItems / pageSize));
}

/** Keeps a page number inside the valid range. */
export function clampPage(page: number, totalPages: number): number {
  if (!Number.isFinite(page) || page < 1) return 1;
  if (totalPages < 1) return 1;
  return Math.min(Math.trunc(page), totalPages);
}

/**
 * Page numbers to render: always the first and last page, the current page
 * plus `siblings` on each side, `null` marks an ellipsis.
 */
export function getPageList(
  page: number,
  totalPages: number,
  siblings: number = 1,
): Array<number | null> {
  const pages = new Set<number>([1, totalPages, page]);
  for (let offset = 1; offset <= siblings; offset += 1) {
    pages.add(page - offset);
    pages.add(page + offset);
  }

  const sorted = [...pages]
    .filter((value) => value >= 1 && value <= totalPages)
    .sort((a, b) => a - b);

  const result: Array<number | null> = [];
  let previous = 0;
  for (const value of sorted) {
    if (previous && value - previous > 1) result.push(null);
    result.push(value);
    previous = value;
  }
  return result;
}

/** Slices a list into the requested page. */
export function paginate<T>(
  items: T[],
  page: number,
  pageSize: number = PAGE_SIZE,
): PaginatedResult<T> {
  const totalPages = getTotalPages(items.length, pageSize);
  const safePage = clampPage(page, totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    page: safePage,
    totalPages,
    totalItems: items.length,
    pageSize,
  };
}

/**
 * Builds a crawlable URL for a page of a paginated listing while preserving
 * the existing query parameters (e.g. `q` for search).
 */
export function buildPageUrl(
  pathname: string,
  params: Record<string, string | undefined>,
  page: number,
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  if (page > 1) {
    search.set("page", String(page));
  } else {
    search.delete("page");
  }
  const query = search.toString();
  return query ? `${pathname}?${query}` : pathname;
}
