"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";
import { SearchField } from "@/components/layout/SearchField";
import { SearchInput } from "@/components/layout/SearchInput";
import { NEWS_CATEGORIES } from "@/types/news";

/**
 * Scroll distance (px) after which the header switches to the compact look.
 */
const COMPACT_AFTER = 48;

/**
 * Site header: brand, crawlable search form and the category rail.
 *
 * On scroll the header shrinks to roughly half of its height and stays pinned
 * over the content (project.md — "sticky header"). The brand text gives way to
 * a single compact row with the search box and the category rail, so the
 * navigation is always reachable.
 *
 * Implementation notes:
 * - SSR renders the header as `sticky` (in flow), so the first paint and the
 *   hydration markup stay identical and CLS stays at 0.
 * - After hydration the header becomes `fixed` and a spacer with the measured
 *   natural height takes over its place in the flow. The height change on
 *   scroll therefore never moves the content below (no scroll jump).
 * - The header is the only layout Client Component: the shrink-on-scroll
 *   behaviour is an actual browser interaction (project.md §55).
 */
export function SiteHeader() {
  const headerRef = useRef<HTMLElement>(null);
  /** True once the natural height is known and the header left the flow. */
  const [pinned, setPinned] = useState(false);
  /** Natural (expanded) header height, kept in the flow as a spacer. */
  const [expandedHeight, setExpandedHeight] = useState(0);
  const [compact, setCompact] = useState(false);
  /** Bumped by the resize handler to force a re-measure. */
  const [resizeTick, setResizeTick] = useState(0);
  const pendingResize = useRef(false);

  // Take the header out of the flow only after its natural height is known —
  // spacer and header switch in a single render, so the layout never shifts.
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    setExpandedHeight(header.offsetHeight);
    setPinned(true);
    setCompact(window.scrollY > COMPACT_AFTER);
  }, []);

  // Re-measure whenever the header is in its expanded state: after a resize
  // (breakpoint change) and after scrolling back to the top.
  useEffect(() => {
    if (!pinned) return;
    if (!compact) {
      const header = headerRef.current;
      if (header) setExpandedHeight(header.offsetHeight);
    }
    if (pendingResize.current && !compact) {
      pendingResize.current = false;
      setCompact(window.scrollY > COMPACT_AFTER);
    }
  }, [pinned, compact, resizeTick]);

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > COMPACT_AFTER);
    const onResize = () => {
      pendingResize.current = true;
      // Expand first so the natural height can be measured at the new width,
      // then the effect above restores the compact state.
      setCompact(false);
      setResizeTick((tick) => tick + 1);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const position = pinned ? "fixed inset-x-0 top-0" : "sticky top-0";
  const surface =
    "z-40 border-b border-zinc-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80";

  return (
    <>
      {/* Flow placeholder: keeps the exact height of the expanded header. */}
      {pinned ? (
        <div aria-hidden="true" className="shrink-0" style={{ height: expandedHeight }} />
      ) : null}

      <header
        ref={headerRef}
        className={
          compact
            ? `${position} ${surface} flex items-center gap-2 px-3 py-1.5`
            : `${position} ${surface}`
        }
      >
        <div
          className={
            compact
              ? "flex shrink-0 flex-row items-center"
              : "mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          }
        >
          <Link
            href="/"
            className={
              compact
                ? "hidden"
                : "text-2xl font-black tracking-tight text-zinc-900 hover:text-brand-700"
            }
          >
            {SITE_NAME}
          </Link>

          <form
            role="search"
            action="/search"
            method="get"
            className={
              compact
                ? "flex w-56 shrink-0 items-center gap-2 sm:w-72"
                : "flex w-full items-center gap-2 sm:max-w-sm"
            }
          >
            <Suspense fallback={<SearchField />}>
              <SearchInput />
            </Suspense>
            <button
              type="submit"
              className="h-10 shrink-0 rounded-sm bg-zinc-900 px-4 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Знайти
            </button>
          </form>
        </div>

        <nav
          aria-label="Категорії"
          className={compact ? "min-w-0 flex-1" : "border-t border-zinc-100"}
        >
          <ul
            className={
              compact
                ? "no-scrollbar flex gap-1 overflow-x-auto py-1"
                : "no-scrollbar mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2"
            }
          >
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
    </>
  );
}
