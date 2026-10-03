import Image from "next/image";
import { formatDate, formatTime } from "@/lib/format";
import { getCategoryMeta, type NewsArticle } from "@/types/news";

type NewsCardProps = {
  article: NewsArticle;
  /** Cards live under the page H1, so H2 by default (project.md §51). */
  headingLevel?: "h2" | "h3";
  priority?: boolean;
};

const IMAGE_SIZES = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw";

/**
 * Editorial news card: image, category, title, description, source, date.
 * A single crawlable `<a>` leads to the internal article page; the whole card
 * is clickable through a stretched-link overlay, so there are no nested
 * interactive elements.
 */
export function NewsCard({
  article,
  headingLevel = "h2",
  priority = false,
}: NewsCardProps) {
  const href = `/news/${article.slug}`;
  const category = getCategoryMeta(article.category);
  const Heading = headingLevel;
  const date = formatDate(article.publishedAt);
  const time = formatTime(article.publishedAt);

  return (
    <article className="group relative flex flex-col border border-zinc-200 bg-white transition-colors hover:border-zinc-400">
      <div className="relative aspect-video w-full overflow-hidden bg-zinc-100">
        <Image
          src={article.imageUrl ?? "/news-placeholder.svg"}
          alt={article.title}
          fill
          priority={priority}
          sizes={IMAGE_SIZES}
          className="object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs font-semibold tracking-wide text-red-700 uppercase">
          {category.label}
        </p>

        <Heading className="text-base leading-snug font-semibold text-zinc-900">
          <a
            href={href}
            className="focus-visible:rounded-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 after:absolute after:inset-0 after:content-['']"
          >
            {article.title}
          </a>
        </Heading>

        {article.description ? (
          <p className="line-clamp-3 text-sm leading-relaxed text-zinc-600">
            {article.description}
          </p>
        ) : null}

        <p className="mt-auto pt-2 text-xs text-zinc-500">
          <span className="font-medium text-zinc-700">{article.source.name}</span>
          {date ? (
            <>
              <span aria-hidden="true"> · </span>
              <time dateTime={article.publishedAt ?? undefined}>
                {date}
                {time ? `, ${time}` : ""}
              </time>
            </>
          ) : null}
        </p>
      </div>
    </article>
  );
}
