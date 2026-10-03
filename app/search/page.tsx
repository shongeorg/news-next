import type { Metadata } from "next";
import { NewsGrid } from "@/components/news/NewsGrid";
import { NewsPagination } from "@/components/news/NewsPagination";
import { paginate, parsePage } from "@/lib/pagination";
import { normalizeQuery, searchNews } from "@/lib/search";
import { getAllNews } from "@/lib/rss/aggregator";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const { q } = await searchParams;
  const query = normalizeQuery(typeof q === "string" ? q : "");

  return {
    title: query ? `Пошук: ${query}` : "Пошук",
    robots: { index: false, follow: true },
  };
}

/**
 * Search results: /search?q=...
 * Server-side filtering of the aggregated set, noindex, paginated by URL.
 */
export default async function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const query = normalizeQuery(typeof params.q === "string" ? params.q : "");
  const requestedPage = parsePage(params.page);

  const results = query ? searchNews(await getAllNews(), query) : [];
  const { items, page, totalPages, totalItems } = paginate(results, requestedPage);

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-8">
      <header className="mb-6 border-b border-zinc-200 pb-4">
        <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl">Пошук</h1>
        {query ? (
          <p className="mt-1 text-sm text-zinc-600">
            Результати за запитом «{query}»:{" "}
            {totalItems > 0 ? `${totalItems} знайдено` : "нічого не знайдено"}
            {totalPages > 1 ? ` · сторінка ${page} із ${totalPages}` : ""}
          </p>
        ) : (
          <p className="mt-1 text-sm text-zinc-600">
            Введіть запит у полі пошуку вгорі сторінки.
          </p>
        )}
      </header>

      {query && totalItems === 0 ? (
        <div className="border border-amber-300 bg-amber-50 p-6 text-zinc-800">
          <h2 className="text-lg font-semibold">На жаль, нічого не знайдено</h2>
          <p className="mt-2 text-sm">
            Спробуйте коротший запит, перевірте написання або шукайте за
            одним словом — наприклад, «економіка» чи «Київ».
          </p>
        </div>
      ) : query ? (
        <>
          <NewsGrid articles={items} />
          <NewsPagination
            pathname="/search"
            page={page}
            totalPages={totalPages}
            params={{ q: query }}
          />
        </>
      ) : null}
    </main>
  );
}
