/** Skeleton shown inside a Suspense boundary while RSS data resolves. */
export function NewsGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div aria-busy="true">
      <div className="mb-4 h-4 w-56 animate-pulse bg-zinc-100" />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="border border-zinc-200 bg-white">
            <div className="aspect-video w-full animate-pulse bg-zinc-200" />
            <div className="space-y-3 p-4">
              <div className="h-3 w-20 animate-pulse bg-zinc-100" />
              <div className="h-4 w-full animate-pulse bg-zinc-200" />
              <div className="h-4 w-3/4 animate-pulse bg-zinc-200" />
              <div className="h-3 w-32 animate-pulse bg-zinc-100" />
            </div>
          </div>
        ))}
      </div>
      <p className="sr-only" role="status">
        Завантаження новин…
      </p>
    </div>
  );
}
