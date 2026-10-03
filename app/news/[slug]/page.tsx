import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { SimilarNews } from "@/components/news/SimilarNews";
import { SITE_NAME } from "@/lib/constants";
import { formatDateTime, formatDate } from "@/lib/format";
import { getCategoryMeta } from "@/types/news";
import { getNewsBySlug, getSimilarNews } from "@/lib/rss/aggregator";
import {
  absoluteUrl,
  defaultOgImage,
  getNewsArticleJsonLd,
} from "@/lib/seo";

type ArticleParams = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: ArticleParams;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getNewsBySlug(slug);
  if (!article) {
    // Throwing before the shell streams guarantees a real HTTP 404 status.
    notFound();
  }

  const category = getCategoryMeta(article.category);
  // og:image is required for every article; fall back to the generic site
  // image when the feed has no picture (project.md §48).
  const image = article.imageUrl ?? absoluteUrl("/og-default.png");
  const description = article.description || undefined;

  return {
    title: article.title,
    description,
    alternates: { canonical: `/news/${article.slug}` },
    robots: { index: true, follow: true },
    openGraph: {
      title: article.title,
      description,
      url: absoluteUrl(`/news/${article.slug}`),
      siteName: SITE_NAME,
      locale: "uk_UA",
      type: "article",
      section: category.label,
      publishedTime: article.publishedAt ?? undefined,
      modifiedTime: article.updatedAt ?? undefined,
      images: [
        article.imageUrl
          ? { url: article.imageUrl, alt: article.title }
          : defaultOgImage(),
      ],
    },
    twitter: {
      card: article.imageUrl ? "summary_large_image" : "summary",
      title: article.title,
      description,
      images: [image],
    },
  };
}

function toParagraphs(text: string | null): string[] {
  if (!text) return [];
  return text
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

/**
 * Internal article page /news/[slug]: title, lead image, description,
 * excerpt, visible original-source link and exactly four similar articles.
 */
export default async function NewsArticlePage({
  params,
}: {
  params: ArticleParams;
}) {
  const { slug } = await params;
  const article = await getNewsBySlug(slug);

  if (!article) {
    notFound();
  }

  const similar = await getSimilarNews(article);
  const category = getCategoryMeta(article.category);
  const published = formatDateTime(article.publishedAt);
  const publishedDate = formatDate(article.publishedAt);
  const updated = formatDateTime(article.updatedAt);
  const paragraphs = toParagraphs(article.content);

  return (
    <main id="main" className="mx-auto w-full max-w-4xl px-4 py-8">
      <nav aria-label="Хлібні крихти" className="mb-5 text-sm text-zinc-500">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link href="/" className="hover:text-brand-700">
              Головна
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href={`/category/${category.slug}`} className="hover:text-brand-700">
              {category.label}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-zinc-700" aria-current="page">
            {article.title}
          </li>
        </ol>
      </nav>

      <article>
        <JsonLd data={getNewsArticleJsonLd(article)} />
        <header className="mb-6">
          <p className="text-xs font-semibold tracking-wide text-red-700 uppercase">
            <Link href={`/category/${category.slug}`} className="hover:text-brand-800">
              {category.label}
            </Link>
          </p>

          <h1 className="mt-2 text-2xl leading-tight font-bold text-zinc-900 sm:text-4xl">
            {article.title}
          </h1>

          {article.description ? (
            <p className="mt-3 text-lg leading-relaxed text-zinc-600">
              {article.description}
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-500">
            {published ? (
              <time dateTime={article.publishedAt ?? undefined}>{published}</time>
            ) : (
              <span>Дата публікації невідома</span>
            )}
            {article.author ? (
              <>
                <span aria-hidden="true">·</span>
                <span>{article.author}</span>
              </>
            ) : null}
            <span aria-hidden="true">·</span>
            <span>
              Джерело:{" "}
              <a
                href={article.url}
                className="font-medium text-brand-700 underline underline-offset-2 hover:text-brand-800"
              >
                {article.source.name}
              </a>
            </span>
            {updated ? (
              <>
                <span aria-hidden="true">·</span>
                <span>Оновлено: {updated}</span>
              </>
            ) : null}
          </div>
        </header>

        {article.imageUrl ? (
          <figure className="mb-6 overflow-hidden border border-zinc-200 bg-zinc-100">
            <div className="relative aspect-video w-full">
              <Image
                src={article.imageUrl}
                alt={article.title}
                fill
                priority
                sizes="(min-width: 896px) 896px, 100vw"
                className="object-cover"
              />
            </div>
          </figure>
        ) : null}

        <div className="space-y-4 text-base leading-relaxed text-zinc-800">
          {paragraphs.length > 0 ? (
            paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)
          ) : (
            <p className="text-zinc-600">
              Повний текст доступний на сайті першоджерела.
            </p>
          )}
        </div>

        <p className="mt-6 border-t border-zinc-200 pt-4 text-sm text-zinc-600">
          Повна версія матеріалу — на сайті видання:{" "}
          <a
            href={article.url}
            className="font-medium text-brand-700 underline underline-offset-2 hover:text-brand-800"
          >
            {article.source.name}
          </a>
          {publishedDate ? ` (${publishedDate})` : ""}.
        </p>
      </article>

      <SimilarNews articles={similar} />
    </main>
  );
}
