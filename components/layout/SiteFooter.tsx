import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";
import { getAllSources } from "@/lib/rss/feeds";
import { NEWS_CATEGORIES } from "@/types/news";

/** Server-rendered footer: navigation, attribution and legal wording. */
export function SiteFooter() {
  const sourceCount = getAllSources().filter((source) => source.enabled).length;
  const year = new Date().getFullYear();

  return (
    <footer className="mt-12 border-t border-zinc-200 bg-zinc-50">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <p className="text-lg font-black text-zinc-900">{SITE_NAME}</p>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600">
            Агрегатор останніх новин: заголовки, описи та посилання на
            першоджерела з {sourceCount} публічних RSS-стрічок.
          </p>
        </div>

        <nav aria-label="Розділи сайту">
          <h2 className="text-sm font-semibold text-zinc-900">Розділи</h2>
          <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <li>
              <Link href="/" className="text-zinc-600 hover:text-brand-700">
                Головна
              </Link>
            </li>
            {NEWS_CATEGORIES.filter((c) => c.slug !== "general").map((category) => (
              <li key={category.slug}>
                <Link
                  href={`/category/${category.slug}`}
                  className="text-zinc-600 hover:text-brand-700"
                >
                  {category.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="text-sm text-zinc-600">
          <h2 className="font-semibold text-zinc-900">Про сайт</h2>
          <p className="mt-3 leading-relaxed">
            Ми не є автором новин. Зображення, тексти та права належать
            відповідним виданням — на сайті публікуються лише заголовки, описи
            та посилання на оригінальні матеріали.
          </p>
          <p className="mt-3 text-zinc-500">© {year} {SITE_NAME}</p>
        </div>
      </div>
    </footer>
  );
}
