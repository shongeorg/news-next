import type { Metadata } from "next";
import { DEFAULT_DESCRIPTION, SITE_NAME } from "@/lib/constants";

/**
 * Canonical origin of the site.
 * Coming from NEXT_PUBLIC_SITE_URL, never hardcoded (project.md §39–41).
 */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  try {
    return new URL(raw).origin;
  } catch {
    return "http://localhost:3000";
  }
}

/** Absolute URL for an internal path (used by canonicals, OG and JSON-LD). */
export function absoluteUrl(path: string = "/"): string {
  const origin = getSiteUrl();
  if (!path || path === "/") return `${origin}/`;
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}

export const SITE_TITLE: Metadata["title"] = {
  default: SITE_NAME,
  template: `%s | ${SITE_NAME}`,
};

export const DEFAULT_METADATA: Metadata = {
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    siteName: SITE_NAME,
    locale: "uk_UA",
    type: "website" as const,
  },
  twitter: {
    card: "summary" as const,
  },
};
