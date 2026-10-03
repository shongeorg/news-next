import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";
import { NEWS_CATEGORIES } from "@/types/news";

/**
 * Site header: brand, crawlable search form and the category rail.
 * Pure Server Component — no client JavaScript is shipped for the header.
 * The search form is a plain GET form, so it works without JavaScript too.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/"
          className="text-2xl font-black tracking-tight text-zinc-900 hover:text-brand-700"
        >
          {SITE_NAME}
        </Link>

        <form
          role="search"
          action="/search"
          method="get"
          className="flex w-full items-center gap-2 sm:max-w-sm"
        >
          <label htmlFor="site-search" className="sr-only">
            Пошук новин
          </label>
          <input
            id="site-search"
            type="search"
            name="q"
            autoComplete="off"
            placeholder="Пошук новин…"
            className="h-10 w-full min-w-0 rounded-sm border border-zinc-300 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-brand-600 focus:outline-none"
          />
          <button
            type="submit"
            className="h-10 shrink-0 rounded-sm bg-zinc-900 px-4 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Знайти
          </button>
        </form>
      </div>

      <nav aria-label="Категорії" className="border-t border-zinc-100">
        <ul className="no-scrollbar mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2">
          <li>
            <Link
              href="/"
              className="inline-block rounded-sm px-3 py-1.5 text-sm font-medium whitespace-nowrap text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
            >
              Головна
            </Link>
          </li>
          {NEWS_CATEGORIES.filter((category) => category.slug !== "general").map(
            (category) => (
              <li key={category.slug}>
                <Link
                  href={`/category/${category.slug}`}
                  className="inline-block rounded-sm px-3 py-1.5 text-sm font-medium whitespace-nowrap text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
                >
                  {category.label}
                </Link>
              </li>
            ),
          )}
        </ul>
      </nav>
    </header>
  );
}
