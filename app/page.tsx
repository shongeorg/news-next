import { NewsGrid } from "@/components/news/NewsGrid";
import { NewsPagination } from "@/components/news/NewsPagination";
import { paginate, parsePage } from "@/lib/pagination";
import { getAllNews } from "@/lib/rss/aggregator";

type HomeSearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

/**
 * Homepage: aggregated latest news, PAGE_SIZE (25) articles per page,
 * server-rendered with URL-based pagination.
 */
export default async function HomePage({
  searchParams,
}: {
  searchParams: HomeSearchParams;
}) {
  const { page: pageParam } = await searchParams;
  const requestedPage = parsePage(pageParam);

  const news = await getAllNews();
  const { items, page, totalPages, totalItems } = paginate(news, requestedPage);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      <header className="mb-6 border-b border-zinc-200 pb-4">
        <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl">
          Останні новини
        </h1>
        <p className="mt-1 text-sm text-zinc-600">
          Агреговано з публічних RSS-джерел
          {totalItems > 0 ? ` · ${totalItems} матеріалів` : ""}
          {totalPages > 1 ? ` · сторінка ${page} із ${totalPages}` : ""}
        </p>
      </header>

      {totalItems === 0 ? (
        <div className="border border-amber-300 bg-amber-50 p-6 text-zinc-800">
          <h2 className="text-lg font-semibold">Новини зараз недоступні</h2>
          <p className="mt-2 text-sm">
            Не вдалося отримати дані з RSS-джерел. Спробуйте оновити сторінку
            за кілька хвилин.
          </p>
        </div>
      ) : (
        <>
          <NewsGrid articles={items} />
          <NewsPagination pathname="/" page={page} totalPages={totalPages} />
        </>
      )}
    </main>
  );
}
