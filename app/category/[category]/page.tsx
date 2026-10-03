import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NewsGrid } from "@/components/news/NewsGrid";
import { NewsPagination } from "@/components/news/NewsPagination";
import { paginate, parsePage } from "@/lib/pagination";
import { getNewsByCategory } from "@/lib/rss/aggregator";
import { getCategoryMeta, isNewsCategory } from "@/types/news";

type CategoryParams = Promise<{ category: string }>;
type CategorySearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export async function generateMetadata({
  params,
}: {
  params: CategoryParams;
}): Promise<Metadata> {
  const { category } = await params;
  if (!isNewsCategory(category)) return {};
  const meta = getCategoryMeta(category);
  return {
    title: meta.label,
    description: meta.description,
  };
}

/**
 * Category listing: /category/[category]
 * 25 articles per page, URL-based pagination, invalid slugs → 404.
 */
export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: CategoryParams;
  searchParams: CategorySearchParams;
}) {
  const { category } = await params;

  if (!isNewsCategory(category)) {
    notFound();
  }

  const meta = getCategoryMeta(category);
  const { page: pageParam } = await searchParams;
  const requestedPage = parsePage(pageParam);

  const news = await getNewsByCategory(category);
  const { items, page, totalPages, totalItems } = paginate(news, requestedPage);

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-8">
      <header className="mb-6 border-b border-zinc-200 pb-4">
        <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl">
          {meta.label}
        </h1>
        <p className="mt-1 text-sm text-zinc-600">{meta.description}</p>
        <p className="mt-1 text-sm text-zinc-500">
          {totalItems > 0 ? `${totalItems} матеріалів` : "Немає матеріалів"}
          {totalPages > 1 ? ` · сторінка ${page} із ${totalPages}` : ""}
        </p>
      </header>

      {totalItems === 0 ? (
        <div className="border border-amber-300 bg-amber-50 p-6 text-zinc-800">
          <h2 className="text-lg font-semibold">У цьому розділі поки порожньо</h2>
          <p className="mt-2 text-sm">
            Дані з RSS-джерел цього розділу зараз недоступні. Спробуйте
            оновити сторінку за кілька хвилин.
          </p>
        </div>
      ) : (
        <>
          <NewsGrid articles={items} />
          <NewsPagination
            pathname={`/category/${category}`}
            page={page}
            totalPages={totalPages}
          />
        </>
      )}
    </main>
  );
}
