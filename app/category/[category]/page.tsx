import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { NewsGrid } from "@/components/news/NewsGrid";
import { NewsGridSkeleton } from "@/components/news/NewsGridSkeleton";
import { NewsPagination } from "@/components/news/NewsPagination";
import { SITE_NAME } from "@/lib/constants";
import { paginate, parsePage } from "@/lib/pagination";
import { getNewsByCategory } from "@/lib/rss/aggregator";
import {
  DEFAULT_OG_IMAGE_PATH,
  absoluteUrl,
  defaultOgImage,
} from "@/lib/seo";
import { getCategoryMeta, isNewsCategory, type NewsCategory } from "@/types/news";

type CategoryParams = Promise<{ category: string }>;
type CategorySearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: CategoryParams;
  searchParams: CategorySearchParams;
}): Promise<Metadata> {
  const { category } = await params;
  if (!isNewsCategory(category)) {
    // Throwing before the shell streams guarantees a real HTTP 404 status.
    notFound();
  }

  const meta = getCategoryMeta(category);
  const { page: pageParam } = await searchParams;
  const page = parsePage(pageParam);
  const base = `/category/${category}`;
  const path = page > 1 ? `${base}?page=${page}` : base;
  const title = `${meta.label} — Останні новини`;

  return {
    title,
    description: meta.description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description: meta.description,
      url: absoluteUrl(path),
      siteName: SITE_NAME,
      locale: "uk_UA",
      type: "website",
      images: [defaultOgImage()],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: meta.description,
      images: [absoluteUrl(DEFAULT_OG_IMAGE_PATH)],
    },
  };
}

/**
 * Category listing: /category/[category]
 * 25 articles per page, URL-based pagination, invalid slugs → 404.
 *
 * `notFound()` runs in the shell (before anything streams), so unknown
 * categories return a real 404; the data-heavy part streams behind Suspense.
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

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-8">
      <header className="mb-6 border-b border-zinc-200 pb-4">
        <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl">
          {meta.label}
        </h1>
        <p className="mt-1 text-sm text-zinc-600">{meta.description}</p>
      </header>

      <Suspense
        key={`category-${category}-${requestedPage}`}
        fallback={<NewsGridSkeleton />}
      >
        <CategoryResults category={category} requestedPage={requestedPage} />
      </Suspense>
    </main>
  );
}

async function CategoryResults({
  category,
  requestedPage,
}: {
  category: NewsCategory;
  requestedPage: number;
}) {
  const news = await getNewsByCategory(category);
  const { items, page, totalPages, totalItems } = paginate(news, requestedPage);

  return (
    <>
      <p className="mb-4 text-sm text-zinc-500">
        {totalItems > 0 ? `${totalItems} матеріалів` : "Немає матеріалів"}
        {totalPages > 1 ? ` · сторінка ${page} із ${totalPages}` : ""}
      </p>

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
    </>
  );
}
