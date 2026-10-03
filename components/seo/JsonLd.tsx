/**
 * Renders a JSON-LD block.
 *
 * The payload is always built by us from structured data (never raw HTML from
 * an RSS feed); `<` is escaped so the JSON can never break out of <script>.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
