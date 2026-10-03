import type { Metadata } from "next";
import Link from "next/link";
import { NEWS_CATEGORIES } from "@/types/news";

export const metadata: Metadata = {
  title: "Сторінку не знайдено",
};

/** 404 page: explains the problem and gives crawlable ways back into the site. */
export default function NotFound() {
  return (
    <main id="main" className="mx-auto w-full max-w-3xl px-4 py-16 text-center">
      <p className="text-sm font-semibold tracking-wide text-red-700 uppercase">
        Помилка 404
      </p>
      <h1 className="mt-2 text-2xl font-bold text-zinc-900 sm:text-3xl">
        Сторінку не знайдено
      </h1>
      <p className="mt-3 text-zinc-600">
        Можливо, новину видалено або адресу набрано з помилкою. Скористайтеся
        розділами нижче.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="h-10 rounded-sm bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          На головну
        </Link>
        <Link
          href="/search"
          className="h-10 rounded-sm border border-zinc-300 px-5 py-2.5 text-sm font-semibold text-zinc-800 hover:border-zinc-500"
        >
          Пошук новин
        </Link>
      </div>

      <nav aria-label="Розділи сайту" className="mt-8">
        <ul className="flex flex-wrap justify-center gap-2 text-sm">
          {NEWS_CATEGORIES.map((category) => (
            <li key={category.slug}>
              <Link
                href={
                  category.slug === "general"
                    ? "/"
                    : `/category/${category.slug}`
                }
                className="inline-block border border-zinc-200 px-3 py-1.5 text-zinc-700 hover:border-zinc-400 hover:text-brand-700"
              >
                {category.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </main>
  );
}
