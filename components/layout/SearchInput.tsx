"use client";

import { useSearchParams } from "next/navigation";
import { SearchField } from "@/components/layout/SearchField";

/**
 * Header search input that keeps the current query visible, so the user can
 * edit their search instead of retyping it. The only Client Component in the
 * layout (project.md §55) — it exists solely for this browser interaction.
 *
 * `useSearchParams` suspends while prerendering, therefore `SiteHeader`
 * renders it inside a `<Suspense>` boundary with a `SearchField` fallback.
 */
export function SearchInput() {
  const searchParams = useSearchParams();
  const query = searchParams?.get("q");

  return <SearchField defaultValue={query ?? undefined} />;
}
