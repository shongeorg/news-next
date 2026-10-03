import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { JsonLd } from "@/components/seo/JsonLd";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import {
  DEFAULT_METADATA,
  SITE_TITLE,
  getOrganizationJsonLd,
  getSiteUrl,
  getWebsiteJsonLd,
} from "@/lib/seo";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: SITE_TITLE,
  ...DEFAULT_METADATA,
  icons: { icon: "/icon.png" },
};

/**
 * RSS aggregation may take two timed attempts per feed (project.md §13–15);
 * the platform budget must cover it so a slow source never turns into a 504.
 */
export const maxDuration = 30;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="uk">
      <body className={`${inter.variable} flex min-h-screen flex-col antialiased`}>
        <JsonLd data={getOrganizationJsonLd()} />
        <JsonLd data={getWebsiteJsonLd()} />
        <a href="#main" className="skip-link">
          Перейти до вмісту
        </a>
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
