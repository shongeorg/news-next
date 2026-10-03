import { buildPageUrl, getPageList } from "@/lib/pagination";

type NewsPaginationProps = {
  pathname: string;
  page: number;
  totalPages: number;
  /** Query parameters preserved while paginating (e.g. `q` for search). */
  params?: Record<string, string | undefined>;
};

/**
 * Server-rendered pagination built from real anchor elements so search
 * engines can discover every page (project.md §42).
 *
 * "Назад" is not a link on page 1 and "Далі" is not a link on the last page.
 */
export function NewsPagination({
  pathname,
  page,
  totalPages,
  params = {},
}: NewsPaginationProps) {
  if (totalPages <= 1) return null;

  const hrefFor = (target: number) => buildPageUrl(pathname, params, target);
  const pageItems = getPageList(page, totalPages, 1);

  const linkClass =
    "inline-flex h-10 min-w-10 items-center justify-center border border-zinc-300 bg-white px-3 text-sm text-zinc-700 hover:border-zinc-500 focus-visible:rounded-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700";
  const activeClass =
    "inline-flex h-10 min-w-10 items-center justify-center border border-zinc-900 bg-zinc-900 px-3 text-sm font-semibold text-white";
  const disabledClass =
    "inline-flex h-10 min-w-10 items-center justify-center border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-400";

  return (
    <nav aria-label="Пагінація" className="mt-8">
      <ul className="flex flex-wrap items-center gap-2">
        <li>
          {page > 1 ? (
            <a rel="prev" href={hrefFor(page - 1)} className={linkClass}>
              Назад
            </a>
          ) : (
            <span className={disabledClass} aria-disabled="true">
              Назад
            </span>
          )}
        </li>

        {pageItems.map((item, index) =>
          item === null ? (
            <li key={`gap-${index}`} aria-hidden="true" className="px-1 text-zinc-400">
              …
            </li>
          ) : item === page ? (
            <li key={item}>
              <span className={activeClass} aria-current="page">
                {item}
              </span>
            </li>
          ) : (
            <li key={item}>
              <a href={hrefFor(item)} className={linkClass} aria-label={`Сторінка ${item}`}>
                {item}
              </a>
            </li>
          ),
        )}

        <li>
          {page < totalPages ? (
            <a rel="next" href={hrefFor(page + 1)} className={linkClass}>
              Далі
            </a>
          ) : (
            <span className={disabledClass} aria-disabled="true">
              Далі
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
}
