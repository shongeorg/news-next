import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

/**
 * robots.txt (project.md §43).
 *
 * Public content is crawlable; framework internals are not. Search result
 * pages are intentionally NOT disallowed here — they carry a meta noindex,
 * and blocking them in robots.txt would hide that signal from crawlers.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/_next/", "/api/"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
