type SearchFieldProps = {
  /** Current query, pre-filled into the input when it is known. */
  defaultValue?: string;
};

/**
 * Markup of the header search box (label + input).
 * Deliberately a plain Server Component so it can be reused both as the
 * prerendered fallback and as the resolved content of the search input
 * without duplicating the markup.
 */
export function SearchField({ defaultValue }: SearchFieldProps) {
  return (
    <>
      <label htmlFor="site-search" className="sr-only">
        Пошук новин
      </label>
      <input
        id="site-search"
        type="search"
        name="q"
        defaultValue={defaultValue}
        autoComplete="off"
        placeholder="Пошук новин…"
        className="h-10 w-full min-w-0 rounded-sm border border-zinc-300 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-brand-600 focus:outline-none"
      />
    </>
  );
}
