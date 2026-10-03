/**
 * Centralized application constants.
 * Do not scatter magic numbers throughout the project.
 */

/** Site name used in metadata, titles and the title template. */
export const SITE_NAME = "Новини UA";

/** Default description used when a page does not provide its own. */
export const DEFAULT_DESCRIPTION =
  "Агрегатор останніх новин з публічних RSS-джерел: Україна, світ, технології, бізнес, спорт, здоров'я, наука та розваги.";

/** Articles displayed per page (homepage, category, search). */
export const PAGE_SIZE = 25;

/** How often RSS data is refreshed (seconds). */
export const RSS_REVALIDATE_SECONDS = 300;

/** Number of similar articles shown below an article. */
export const SIMILAR_NEWS_COUNT = 4;

/** Timeout for a single RSS feed request (ms). */
export const RSS_FETCH_TIMEOUT_MS = 10_000;
