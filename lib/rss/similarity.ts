import type { NewsArticle } from "@/types/news";
import { SIMILAR_NEWS_COUNT } from "@/lib/constants";

/**
 * Local, deterministic similarity scoring — no AI API is used (project.md §33).
 *
 * same category +5 | matching title keyword +2 | matching description keyword +1
 * same source -1    | recent publication +1     | current article excluded
 */

const STOP_WORDS = new Set([
  // Ukrainian
  "і", "й", "та", "до", "з", "із", "у", "в", "на", "по", "зі", "за", "для",
  "про", "що", "як", "але", "це", "цей", "ця", "ці", "не", "є", "від", "до",
  "ми", "ви", "вони", "він", "вона", "їх", "наш", "ваш", "який", "яка", "які",
  "хто", "коли", "де", "чому", "якщо", "або", "проти", "між", "під", "над",
  "перед", "після", "без", "про", "при", "ще", "уже", "так", "ні", "весь",
  "все", "свій", "сам", "нові", "новий", "нова", "про", "після",
  // English
  "the", "a", "an", "and", "or", "but", "of", "to", "in", "on", "for", "with",
  "as", "at", "by", "from", "is", "are", "was", "were", "be", "been", "being",
  "it", "its", "this", "that", "these", "those", "he", "she", "they", "we",
  "you", "his", "her", "their", "our", "your", "not", "no", "will", "can",
  "has", "have", "had", "do", "does", "did", "more", "about", "after",
  "before", "over", "under", "into", "than", "then", "who", "what", "when",
  "where", "how", "why", "all", "any", "some", "new", "says", "said", "sunday",
]);

/** Splits text into normalized, meaningful words. */
export function tokenize(text: string): string[] {
  if (!text) return [];
  const words = text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((word) => word.length >= 3 && !STOP_WORDS.has(word));
  return [...new Set(words)];
}

const RECENT_WINDOW_MS = 24 * 60 * 60 * 1000;

function scoreCandidate(
  current: NewsArticle,
  candidate: NewsArticle,
  currentTitleWords: Set<string>,
  currentDescriptionWords: Set<string>,
  now: number,
): number {
  let score = 0;

  if (candidate.category === current.category) score += 5;

  let titleMatches = 0;
  for (const word of tokenize(candidate.title)) {
    if (currentTitleWords.has(word)) titleMatches += 1;
  }
  score += Math.min(titleMatches, 4) * 2;

  let descriptionMatches = 0;
  for (const word of tokenize(candidate.description)) {
    if (currentDescriptionWords.has(word)) descriptionMatches += 1;
  }
  score += Math.min(descriptionMatches, 3);

  if (candidate.source.id === current.source.id) score -= 1;

  const published = candidate.publishedAt ? Date.parse(candidate.publishedAt) : NaN;
  if (!Number.isNaN(published) && now - published <= RECENT_WINDOW_MS) score += 1;

  return score;
}

/**
 * Returns up to `count` similar articles for the given one.
 * The current article is never included in the result.
 */
export function getSimilarArticles(
  current: NewsArticle,
  candidates: NewsArticle[],
  count: number = SIMILAR_NEWS_COUNT,
): NewsArticle[] {
  const currentTitleWords = new Set(tokenize(current.title));
  const currentDescriptionWords = new Set(tokenize(current.description));
  const now = Date.now();

  return candidates
    .filter((candidate) => candidate.id !== current.id && candidate.slug !== current.slug)
    .map((candidate) => ({
      candidate,
      score: scoreCandidate(
        current,
        candidate,
        currentTitleWords,
        currentDescriptionWords,
        now,
      ),
    }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const aTime = a.candidate.publishedAt ? Date.parse(a.candidate.publishedAt) : 0;
      const bTime = b.candidate.publishedAt ? Date.parse(b.candidate.publishedAt) : 0;
      return bTime - aTime;
    })
    .slice(0, count)
    .map((entry) => entry.candidate);
}
