import { NewsGridSkeleton } from "@/components/news/NewsGridSkeleton";

/** Loading UI for the search segment (search never renders a 404). */
export default function Loading() {
  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-8">
      <NewsGridSkeleton />
    </main>
  );
}
