# News Aggregator — Next.js + RSS

## 1. Project Overview

Build a modern SEO-first news aggregation website using the existing Next.js project.

The project is already initialized with:

- Next.js 16.3.8
- React
- TypeScript
- App Router
- Tailwind CSS
- ESLint
- npm

Do not recreate the project.

Do not migrate to another framework.

Do not replace the existing Next.js setup.

The website must aggregate news from public RSS feeds.

Do not use paid news APIs.

Do not require API keys.

Do not use GNews, NewsAPI, or similar paid/API-key news services.

The primary priorities are:

1. SEO
2. Fast server-side rendering
3. Free RSS-based news aggregation
4. 25 news articles per page
5. Individual article pages
6. Four similar articles below each article
7. Clean semantic HTML
8. Good Core Web Vitals
9. Mobile-first responsive design

---

# 2. Core Concept

The website is an RSS aggregator.

RSS feeds are the source of news.

The application must:

```text
RSS feeds
    ↓
RSS parser
    ↓
Normalization
    ↓
Deduplication
    ↓
Categorization
    ↓
Sorting
    ↓
Caching
    ↓
Pagination
    ↓
Next.js pages
```

The UI must never depend directly on the structure of an individual RSS feed.

Different RSS sources have different XML structures.

All feeds must be normalized into one internal `NewsArticle` model.

---

# 3. No External News API

Do not implement a paid news API.

Do not create:

```text
GNEWS_API_KEY
NEWS_API_KEY
API_KEY
```

for the news aggregation system.

There must be no API key requirement for obtaining news.

The application must work using public RSS feeds.

---

# 4. RSS Sources

Create a centralized RSS source configuration.

Recommended structure:

```text
lib/
└── rss/
    ├── feeds.ts
    ├── parser.ts
    ├── aggregator.ts
    ├── normalize.ts
    ├── deduplicate.ts
    ├── similarity.ts
    └── types.ts
```

The RSS feed list must be defined in one place.

Example:

```ts
type RssSource = {
  id: string;
  name: string;
  url: string;
  category: NewsCategory;
  language: string;
  enabled: boolean;
};
```

Example configuration:

```ts
const rssSources: RssSource[] = [
  {
    id: "source-1",
    name: "Source Name",
    url: "https://example.com/rss",
    category: "general",
    language: "uk",
    enabled: true,
  },
];
```

Do not scatter RSS URLs throughout the application.

---

# 5. RSS Source Requirements

Use public RSS feeds that allow aggregation according to their published terms.

The source configuration must support:

- adding a source
- removing a source
- disabling a source
- changing its category
- changing its language

without modifying the aggregation logic.

Do not hardcode source-specific logic inside React components.

---

# 6. Recommended Initial Sources

The project should be prepared for Ukrainian news sources.

Use configurable RSS URLs.

Do not invent RSS URLs.

Before adding a source, verify that the URL is an actual working RSS/Atom feed.

If a source does not provide a stable RSS feed, do not implement scraping of its HTML as a replacement.

The initial implementation may contain a small set of verified feeds.

The architecture must allow adding more sources later.

---

# 7. RSS and Atom Support

The parser should support both:

- RSS 2.0
- Atom

Normalize both formats into the same internal structure.

The parser must handle common fields:

- title
- description
- link
- guid/id
- pubDate/published
- updated
- author
- creator
- category
- enclosure
- media content
- media thumbnail

Not every feed provides every field.

Missing fields must be handled safely.

---

# 8. RSS Parser

Use a lightweight server-side RSS/Atom parser.

The parser must run only on the server.

Do not parse RSS in the browser.

Recommended package:

```text
rss-parser
```

Install only if necessary.

The parser must be isolated from the UI.

---

# 9. News Data Model

Normalize every RSS item into:

```ts
type NewsArticle = {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string | null;
  url: string;
  imageUrl: string | null;
  publishedAt: string;
  updatedAt: string | null;
  source: {
    id: string;
    name: string;
    url: string;
  };
  author: string | null;
  category: NewsCategory;
  language: string;
};
```

Use ISO timestamps internally.

Do not use provider-specific structures in the UI.

---

# 10. Categories

Initial categories:

```text
general
ukraine
world
technology
business
sports
health
science
entertainment
```

Use a type:

```ts
type NewsCategory =
  | "general"
  | "ukraine"
  | "world"
  | "technology"
  | "business"
  | "sports"
  | "health"
  | "science"
  | "entertainment";
```

The category system must be easy to extend.

---

# 11. RSS Feed Configuration

Each feed must specify its category.

Example:

```ts
{
  id: "example-tech",
  name: "Example Tech",
  url: "https://example.com/feed.xml",
  category: "technology",
  language: "uk",
  enabled: true
}
```

The aggregator must trust the configured category rather than attempting unreliable automatic classification for the MVP.

---

# 12. Aggregation Pipeline

Implement:

```text
fetch feeds
↓
parse RSS/Atom
↓
normalize items
↓
validate items
↓
deduplicate
↓
sort by publication date
↓
assign stable IDs
↓
generate slugs
↓
cache result
↓
serve pages
```

A failed feed must not break the entire aggregation.

If one source is unavailable:

- log the failure server-side
- ignore that source for the current aggregation
- continue processing other sources

Do not expose raw RSS errors to users.

---

# 13. RSS Fetching

All RSS requests must happen server-side.

Use native `fetch` where possible.

Set a reasonable timeout.

Do not allow one broken RSS server to block the entire request indefinitely.

Use concurrent fetching for multiple feeds.

Do not fetch feeds sequentially unless technically necessary.

Conceptually:

```text
Feed A ─┐
Feed B ─┤
Feed C ─┼──→ normalize → aggregate
Feed D ─┤
Feed E ─┘
```

Use `Promise.allSettled()` or equivalent fault-tolerant logic.

---

# 14. RSS Caching

Do not fetch every RSS feed on every visitor request.

Use Next.js server-side caching/revalidation.

Initial recommended revalidation:

```text
300 seconds
```

RSS data should be refreshed approximately every 5 minutes.

The exact value must be centralized so it can easily be changed.

Do not implement browser-side caching as the primary caching strategy.

---

# 15. Cache Architecture

Create an aggregation function:

```ts
getAllNews();
```

It should return normalized aggregated articles.

Category-specific filtering should happen after normalization where appropriate.

The cache must prevent unnecessary repeated requests to the same RSS feeds.

---

# 16. Deduplication

Different RSS sources may publish the same news story.

Implement deduplication.

Use, in order of preference:

1. normalized GUID
2. canonical article URL
3. normalized source URL
4. normalized title comparison

Do not rely only on title matching.

Two different articles may have similar titles.

---

# 17. Duplicate URL Normalization

Normalize URLs before comparing them.

Handle:

- trailing slash
- URL fragments
- obvious tracking parameters

Do not blindly remove all query parameters because some websites use query parameters as part of the article URL.

At minimum remove common tracking parameters such as:

```text
utm_source
utm_medium
utm_campaign
utm_term
utm_content
```

---

# 18. Duplicate Title Detection

Normalize titles before comparison.

Normalization should:

- lowercase
- trim whitespace
- normalize repeated whitespace
- remove insignificant punctuation

Do not remove meaningful words.

Use title matching only as a secondary deduplication mechanism.

---

# 19. Article IDs

Generate a deterministic ID.

Prefer:

```text
hash(canonical URL)
```

or another deterministic identifier derived from stable article data.

The same article from the same source must produce the same ID after every refresh.

Do not generate random IDs every time RSS is fetched.

---

# 20. Slugs

Every article must have a readable slug.

Example:

```text
/news/apple-predstavyla-novyi-iphone
```

Slug requirements:

- lowercase
- URL-safe
- readable
- Ukrainian text supported
- stable between refreshes

The slug must not randomly change on every request.

Use the article title as the primary slug source.

If the same title appears multiple times, append a stable identifier.

Example:

```text
/news/novyi-smartfon-xiaomi-2026-a82f31
```

---

# 21. URL Structure

Homepage:

```text
/
```

Categories:

```text
/category/ukraine
/category/world
/category/technology
/category/business
/category/sports
/category/health
/category/science
/category/entertainment
```

Article:

```text
/news/[slug]
```

Search:

```text
/search?q=keyword
```

Pagination:

```text
/?page=2
/category/technology?page=2
/search?q=iphone&page=2
```

---

# 22. Homepage

The homepage displays the aggregated latest news.

Display exactly:

```text
25 articles per page
```

when at least 25 articles are available.

If fewer than 25 valid articles are available, display all available articles.

Do not create fake placeholder articles.

---

# 23. Homepage Layout

Desktop:

```text
3 columns
```

Tablet:

```text
2 columns
```

Mobile:

```text
1 column
```

The first article may be visually featured.

However, it remains part of the same 25-item result set.

Do not fetch a separate featured-news dataset.

---

# 24. Pagination

Pagination is mandatory.

Default page size:

```text
25
```

Pagination must use URL query parameters.

Examples:

```text
/?page=1
/?page=2
/?page=3
```

Pagination must work after:

- refresh
- direct navigation
- browser back
- browser forward
- sharing URL

Do not implement primary pagination only through React state.

---

# 25. Pagination Component

Create:

```text
components/news/NewsPagination.tsx
```

It must provide:

- Previous
- page numbers where appropriate
- Next

Previous must be disabled on page 1.

Next must be disabled on the final available page.

Preserve query parameters when navigating.

Example:

```text
/search?q=iphone&page=2
```

---

# 26. Page Parameter Validation

Validate `page`.

Handle:

```text
?page=abc
?page=-1
?page=0
?page=999999999
```

Do not throw unhandled exceptions.

Use page `1` as the safe fallback for invalid values where appropriate.

---

# 27. Category Pages

Route:

```text
/category/[category]
```

Each category page must display:

```text
25 articles per page
```

Example:

```text
/category/technology
/category/technology?page=2
```

Filter normalized articles by category.

Do not create a separate RSS architecture for every category.

---

# 28. Category SEO

Every category page must have unique metadata.

Example:

```text
Технології — Останні новини | Site Name
```

Description must be generated from the category.

Each category page must have:

- title
- description
- canonical
- Open Graph metadata
- one H1

---

# 29. News Article Page

Route:

```text
/news/[slug]
```

Article page must contain:

- category
- title
- publication date
- source
- author if available
- main image if available
- description
- available RSS content/excerpt
- original source link
- four similar articles

Use semantic:

```html
<article></article>
```

The title must be:

```html
<h1></h1>
```

Only one primary H1 is allowed.

---

# 30. Important Copyright Rule

The website is an RSS aggregator.

Do not scrape and reproduce the full original article from the source website.

Use the content provided by the RSS feed according to the source's terms.

Prefer displaying:

- title
- description/excerpt
- metadata
- image when provided/allowed
- link to original article

Always provide a prominent link to the original source.

Do not bypass paywalls.

Do not scrape article pages merely to reconstruct content missing from RSS.

---

# 31. Original Source

Every article must show the original source.

Example:

```text
Джерело: Source Name
```

The source name must link to the original article.

Open external links safely.

Use appropriate:

```text
rel
```

attributes when necessary.

---

# 32. Similar News

Below every article display:

```text
4 similar news
```

Exactly four when four valid candidates exist.

If fewer than four valid candidates exist, display the available candidates.

Never display the current article.

---

# 33. Similar News Algorithm

Similarity must be calculated locally.

No AI API is required.

Recommended scoring:

```text
same category: +5
matching title keyword: +2
matching description keyword: +1
same source: -1
recent publication: +1
current article: excluded
```

Normalize words before comparison.

Remove common stop words.

Prioritize meaningful words.

Sort candidates by score.

Return the first four.

---

# 34. Similar News Component

Create:

```text
components/news/SimilarNews.tsx
```

Each item must display:

- image
- title
- source
- publication date

Each item links to:

```text
/news/[slug]
```

Use normal crawlable `<a>` links.

---

# 35. Search

Create:

```text
/search?q=
```

Search through normalized aggregated RSS data.

Search fields:

- title
- description
- source name

Do not search arbitrary raw XML.

Example:

```text
/search?q=iphone
```

Pagination:

```text
/search?q=iphone&page=2
```

---

# 36. Search Pagination

Search results use the same:

```text
25 articles per page
```

system.

Search query must remain in the URL.

Pagination must preserve:

```text
q
```

Example:

```text
/search?q=iphone&page=2
```

---

# 37. Search SEO

Search result pages should have a deliberate indexing policy.

Do not allow unlimited search combinations to become indexable.

By default, search pages should use:

```text
noindex
```

while remaining crawlable if appropriate.

The exact metadata configuration must prevent search-result URL explosion.

---

# 38. SEO Priority

SEO is the highest priority.

The implementation must use Next.js Metadata API.

Use:

```text
generateMetadata()
```

for dynamic article and category pages.

---

# 39. Root Metadata

Root layout must define:

- site name
- title
- title template
- default description
- metadataBase
- Open Graph defaults
- Twitter/X metadata
- favicon
- language

Example title template:

```text
%s | Site Name
```

Do not hardcode the actual production domain.

Use:

```env
NEXT_PUBLIC_SITE_URL=
```

---

# 40. Article Metadata

Each article must generate unique metadata.

Required:

```text
title
description
canonical
og:title
og:description
og:url
og:type
og:image
twitter:card
```

If available:

```text
article:published_time
article:modified_time
article:section
```

The title must be derived from the actual article.

Do not use the same metadata for every article.

---

# 41. Canonical URLs

Every indexable page must have a canonical URL.

Use:

```env
NEXT_PUBLIC_SITE_URL=
```

Example:

```text
https://example.com/news/article-slug
```

Do not rely on arbitrary request host headers.

---

# 42. Pagination SEO

Pagination pages must have crawlable URLs.

Use actual anchor elements.

Do not implement pagination through only:

```text
onClick()
```

Search engines must be able to discover paginated content.

Canonical strategy must be consistent.

Do not canonicalize every pagination page to the homepage.

---

# 43. Robots

Create:

```text
app/robots.ts
```

Allow public content:

```text
/
 /category/*
 /news/*
```

Disallow internal/non-public routes as appropriate.

Search pages should follow the chosen noindex policy.

Reference:

```text
/sitemap.xml
```

---

# 44. Sitemap

Create:

```text
app/sitemap.ts
```

Include:

- homepage
- category pages
- article pages

Do not include:

- API routes
- internal routes
- search query URLs
- duplicate URLs
- non-indexable pages

Use absolute URLs.

---

# 45. Large Sitemap Support

The architecture must be capable of handling many articles.

If the number of articles becomes large enough to exceed normal sitemap limits, split the sitemap into multiple sitemap files.

Do not implement a solution that assumes an unlimited single sitemap.

For the MVP, `app/sitemap.ts` is sufficient if the article count remains small.

---

# 46. JSON-LD

Article pages must include:

```text
NewsArticle
```

structured data.

Include when available:

- headline
- description
- image
- datePublished
- dateModified
- author
- publisher
- mainEntityOfPage

The structured data must match visible page content.

Do not invent:

- authors
- dates
- publishers
- images
- ratings

---

# 47. Publisher Schema

Create a consistent publisher definition.

Example:

```text
Organization
```

or:

```text
NewsMediaOrganization
```

where appropriate.

Use real site information.

Do not invent company registration details.

---

# 48. Open Graph

Article pages must have:

```text
og:title
og:description
og:url
og:type
og:image
```

Article type:

```text
article
```

Use article image where available.

If no image exists, use a generic site image.

---

# 49. Twitter/X

Use:

```text
summary_large_image
```

when an article image is available.

Metadata should be generated from the article.

---

# 50. HTML Semantics

Use semantic HTML.

Required where appropriate:

```html
<header>
  <nav>
    <main>
      <section>
        <article>
          <aside>
            <footer></footer>
          </aside>
        </article>
      </section>
    </main>
  </nav>
</header>
```

News items should be represented as articles.

Do not use clickable `<div>` elements instead of links.

---

# 51. Heading Hierarchy

Use:

```text
h1
  h2
    h3
```

Homepage:

```text
h1 = latest news / site topic
h2 = article/card headings where appropriate
```

Article:

```text
h1 = article title
h2 = article subsections if available
```

Do not use headings solely for styling.

---

# 52. Images

Use:

```text
next/image
```

for local/remote images.

Configure remote image patterns correctly.

Images must have:

```text
alt
```

text.

Use meaningful alt text derived from the article title when no better information exists.

Prevent layout shifts.

Use a stable aspect ratio.

Recommended news-card ratio:

```text
16 / 9
```

---

# 53. Image Sources

RSS feeds may expose images through:

- enclosure
- media:content
- media:thumbnail
- image tags
- feed-specific fields

The parser must attempt common formats.

If no image exists:

- do not invent one
- use a generic local fallback image

---

# 54. Performance

Prioritize:

```text
LCP
CLS
INP
```

Use Server Components by default.

Do not fetch primary news data from the browser.

Avoid unnecessary client-side JavaScript.

Avoid unnecessary hydration.

Do not install a global client state manager.

---

# 55. Client Components

The application should primarily use Server Components.

Client Components are allowed only for actual browser interaction.

Potential client components:

```text
MobileMenu
SearchInput
```

Do not turn:

```text
NewsGrid
NewsCard
ArticlePage
CategoryPage
```

into Client Components without a concrete reason.

---

# 56. Loading States

Create:

```text
app/loading.tsx
```

Use skeleton loaders for news lists.

Do not display an empty white screen while server data is loading.

Article pages may use route-level loading UI if necessary.

---

# 57. Error Handling

Create:

```text
app/error.tsx
app/not-found.tsx
```

RSS source failure must not crash the entire site.

Example:

```text
Source A failed
Source B succeeded
Source C succeeded
```

The site must still display news from B and C.

---

# 58. Empty States

Handle:

- no news
- no category results
- no search results
- unavailable image
- unavailable description
- unavailable author
- unavailable publication date

Never render broken UI because one RSS field is missing.

---

# 59. Article Not Found

If the requested slug does not correspond to an available article:

```ts
notFound();
```

must be used.

Return the proper Next.js 404 page.

Do not render a fake article.

---

# 60. RSS Failure Strategy

If all RSS feeds fail:

Display a useful error state.

Do not show fake news.

Do not expose stack traces.

Do not expose internal URLs.

Server logs may contain technical information for debugging.

---

# 61. Feed Failure Logging

Log enough information to identify:

- source ID
- source name
- error type
- timestamp

Do not log secrets.

Do not flood logs with the same error indefinitely.

---

# 62. Security

All RSS parsing happens server-side.

Never expose feed aggregation internals to the browser unnecessarily.

Validate URLs from the static configuration.

Do not allow users to submit arbitrary RSS URLs in the MVP.

This avoids turning the application into an SSRF proxy.

---

# 63. SSRF Protection

RSS URLs must come only from trusted static configuration.

Do not create an endpoint like:

```text
/api/rss?url=https://anything.com
```

for arbitrary user-controlled URLs.

The server must never fetch arbitrary URLs supplied by users.

---

# 64. Environment Variables

Only use public site configuration if required.

Create:

```text
.env.example
```

with:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

No news API key is required.

Do not place RSS URLs into environment variables unless there is a specific reason.

RSS source configuration should live in code.

---

# 65. TypeScript

Use strict TypeScript.

Avoid:

```ts
any;
```

unless absolutely unavoidable.

Define explicit types for:

- RSS sources
- RSS items
- normalized articles
- categories
- pagination
- similarity results

---

# 66. RSS Types

Create:

```text
lib/rss/types.ts
```

containing the RSS-specific types.

Keep RSS parser types separate from application types.

The application should depend on:

```text
NewsArticle
```

rather than raw parser objects.

---

# 67. Recommended File Structure

Use approximately:

```text
app/
├── layout.tsx
├── page.tsx
├── globals.css
├── loading.tsx
├── error.tsx
├── not-found.tsx
├── robots.ts
├── sitemap.ts
├── news/
│   └── [slug]/
│       └── page.tsx
├── category/
│   └── [category]/
│       └── page.tsx
└── search/
    └── page.tsx

components/
├── layout/
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── Container.tsx
│   └── MobileMenu.tsx
├── news/
│   ├── NewsCard.tsx
│   ├── NewsGrid.tsx
│   ├── NewsArticle.tsx
│   ├── SimilarNews.tsx
│   ├── NewsPagination.tsx
│   └── CategoryNav.tsx
└── ui/

lib/
├── rss/
│   ├── feeds.ts
│   ├── parser.ts
│   ├── aggregator.ts
│   ├── normalize.ts
│   ├── deduplicate.ts
│   ├── similarity.ts
│   └── types.ts
├── seo.ts
├── pagination.ts
└── utils.ts

types/
└── news.ts

public/
└── ...
```

The exact structure may be adjusted if the agent has a demonstrably cleaner implementation.

---

# 68. Header

Header must contain:

- site logo/name
- primary navigation
- categories
- search

Desktop:

```text
logo | categories | search
```

Mobile:

```text
logo | menu | search
```

Only interactive controls should require client-side JavaScript.

---

# 69. Navigation

Main categories:

```text
Україна
Світ
Технології
Бізнес
Спорт
Здоров'я
Наука
Розваги
```

All links must use real URLs.

Example:

```text
/category/technology
```

Do not use JavaScript navigation where normal links are sufficient.

---

# 70. Footer

Footer should contain:

- site name
- category links
- basic navigation
- source/aggregation information
- copyright

Do not invent legal/company information.

---

# 71. News Card

Each card should show:

- image
- category
- title
- description
- source
- publication date

The card should have a clean editorial layout.

Use a semantic link.

Avoid nested interactive elements.

---

# 72. News Card URL

Each card must link to:

```text
/news/[slug]
```

Do not expose raw RSS URLs as the primary internal URL.

The article page contains the original source link.

---

# 73. Article Layout

Recommended desktop layout:

```text
┌────────────────────────────────────────────┐
│ Category                                   │
│ H1 Article title                           │
│ Date · Source                              │
│                                            │
│              Main Image                   │
│                                            │
│ Article description/content                │
│                                            │
│ Original source                            │
├────────────────────────────────────────────┤
│ Similar News                               │
│ [1] [2] [3] [4]                            │
└────────────────────────────────────────────┘
```

Article text must have a comfortable reading width.

Recommended:

```text
65–75ch
```

---

# 74. Similar News Placement

The four similar articles must be directly below the main article content.

They must not replace the original source link.

The original source remains clearly accessible.

---

# 75. Mobile Article

On mobile:

- single column
- readable font size
- comfortable line height
- responsive image
- no horizontal overflow
- source link remains accessible
- similar news becomes one-column or two-column depending on width

---

# 76. Styling

Use the existing Tailwind CSS setup.

Do not install another CSS framework.

Design direction:

- modern editorial/news website
- high readability
- strong typography
- restrained visual decoration
- clear hierarchy
- high contrast
- responsive layout

Avoid:

- SaaS dashboard appearance
- excessive gradients
- glassmorphism
- excessive animations
- huge decorative elements
- unnecessary rounded cards

Content must dominate the design.

---

# 77. Accessibility

Target WCAG 2.2 AA principles.

Implement:

- semantic HTML
- keyboard navigation
- visible focus
- accessible mobile menu
- meaningful link text
- meaningful image alt text
- sufficient contrast
- proper heading hierarchy
- accessible form controls

Do not rely on color alone to communicate information.

---

# 78. Responsive Design

Support:

```text
Mobile: < 640px
Tablet: 640px–1023px
Desktop: >= 1024px
```

The site must also work correctly at intermediate widths.

Do not optimize only for exact breakpoint values.

---

# 79. Ukrainian Language

Initial website language:

```text
uk
```

Set:

```html
<html lang="uk"></html>
```

All interface text must be Ukrainian.

Examples:

```text
Останні новини
Далі
Назад
Пошук
Категорії
Джерело
Схожі новини
```

Do not use Russian interface text.

---

# 80. Date Formatting

Use Ukrainian locale:

```text
uk-UA
```

Example:

```text
3 жовтня 2026
```

Keep ISO timestamps internally.

Use semantic `<time>` elements where appropriate.

Example:

```html
<time datetime="2026-10-03T15:30:00Z"> 3 жовтня 2026 </time>
```

---

# 81. Timezone

Store/handle timestamps as ISO values.

Display dates according to the website's intended locale.

Do not manipulate timestamps as plain strings.

Use standard JavaScript date APIs or a lightweight date library only if actually required.

---

# 82. Search Implementation

Search should operate over the normalized aggregated dataset.

Search normalization:

- lowercase
- trim whitespace
- normalize repeated whitespace

Search should support Ukrainian text.

Do not implement fuzzy search with a large dependency for the MVP.

A simple normalized text search is sufficient.

---

# 83. Search Result Ranking

Rank matching results approximately:

```text
title match
>
description match
>
source match
```

More recent articles should receive a slight relevance boost.

Do not use an external AI service.

---

# 84. Feed Refresh

RSS aggregation must automatically refresh through Next.js revalidation.

Do not require a user to manually refresh the browser to update the feed.

Do not implement a permanent in-memory cache that disappears unpredictably between server instances.

Use Next.js-compatible caching.

---

# 85. Server Rendering

The following must be server-rendered:

- homepage news
- category news
- article content
- similar news
- search results

Do not fetch these datasets from the browser after page load.

This is important for SEO.

---

# 86. Client JavaScript

Keep client JavaScript minimal.

Do not add:

```text
Redux
Zustand
TanStack Query
SWR
```

for the main news feed.

There is no need for client-side data synchronization in the MVP.

---

# 87. No Database for MVP

Do not add PostgreSQL, MongoDB, SQLite or another database for the initial implementation.

The RSS feeds are the source of truth.

Use Next.js caching for the MVP.

The architecture should remain extensible so a database can be introduced later without rewriting the UI.

---

# 88. Future Database Compatibility

Keep the aggregation layer separated:

```text
RSS
↓
NewsArticle
↓
UI
```

A future database could replace:

```text
RSS → NewsArticle
```

with:

```text
Database → NewsArticle
```

without changing the React UI.

---

# 89. No CMS for MVP

Do not add WordPress, Strapi, Sanity, Payload or another CMS.

The MVP is an automated RSS aggregator.

---

# 90. No Authentication

Do not implement authentication in the MVP.

There is no admin panel.

There is no user account system.

There is no commenting system.

Focus only on the public news site.

---

# 91. No Artificial News

Never generate fake news.

Do not use an LLM to invent:

- titles
- facts
- descriptions
- quotes
- dates
- authors

The content comes from RSS feeds.

---

# 92. Content Normalization

Clean RSS fields carefully.

Normalize:

- whitespace
- HTML entities
- unnecessary markup
- empty strings

If descriptions contain HTML, sanitize them before rendering.

Prefer plain text if rich content is not necessary.

---

# 93. HTML Sanitization

Never blindly render RSS HTML with:

```text
dangerouslySetInnerHTML
```

If HTML from RSS must be rendered:

1. sanitize it
2. remove scripts
3. remove dangerous attributes
4. remove unsafe URLs
5. render only allowed markup

For the MVP, plain-text description rendering is preferred.

---

# 94. External Links

Original article links are external.

Ensure:

- valid URL
- `https`/safe protocol where applicable
- no `javascript:` URLs
- appropriate `rel` attributes

Never trust arbitrary HTML URLs from RSS.

---

# 95. Feed Source Health

The RSS aggregator should tolerate:

- HTTP 404
- HTTP 500
- timeout
- malformed XML
- empty feed
- missing title
- missing publication date
- missing image
- invalid URL

One broken feed must not break the application.

---

# 96. Invalid RSS Items

Skip items that do not contain enough information.

Minimum required:

```text
title
url
```

If those are missing, ignore the item.

Do not create broken article pages.

---

# 97. Publication Date

If publication date is missing:

- use updated date if available
- otherwise use a safe fallback
- do not invent a fake historical date

Articles without reliable dates may be sorted after dated articles.

---

# 98. Sorting

Default ordering:

```text
publishedAt DESC
```

Newest articles first.

Do not sort alphabetically.

Do not sort by source.

---

# 99. Source Attribution

Each article must clearly identify its source.

Example:

```text
Джерело: Українська Правда
```

with a link to the original article.

The aggregator must not visually imply that the source article was written by the aggregator.

---

# 100. SEO Content Principle

Do not create thin duplicate pages for every RSS source.

Every article page must contain meaningful information:

- title
- source
- date
- description/excerpt
- image when available
- original source

Avoid generating hundreds of useless pages from malformed RSS items.

---

# 101. SEO URL Principle

Do not use:

```text
/news?id=123
```

as the primary article URL.

Use:

```text
/news/readable-article-slug
```

The URL must remain stable.

---

# 102. Metadata Utility

Create a reusable SEO utility:

```text
lib/seo.ts
```

It may provide:

```text
getSiteUrl()
getCanonicalUrl()
createArticleMetadata()
createCategoryMetadata()
```

Do not duplicate URL construction throughout the application.

---

# 103. Pagination Utility

Create:

```text
lib/pagination.ts
```

It should handle:

- page parsing
- page size
- slicing
- total pages
- pagination URL generation

Default:

```text
PAGE_SIZE = 25
```

Do not duplicate pagination calculations in multiple pages.

---

# 104. Constants

Centralize important constants:

```text
PAGE_SIZE = 25
RSS_REVALIDATE_SECONDS = 300
SIMILAR_NEWS_COUNT = 4
```

Do not scatter magic numbers throughout the project.

---

# 105. Error Boundaries

Use Next.js error boundaries appropriately.

At minimum:

```text
app/error.tsx
app/not-found.tsx
```

If route-specific errors require separate handling, add route-level error boundaries.

---

# 106. Build Requirements

The project must successfully run:

```bash
npm run dev
```

and:

```bash
npm run build
```

and:

```bash
npm run lint
```

No TypeScript errors.

No ESLint errors that indicate broken functionality.

---

# 107. Manual SEO Verification

After implementation verify:

```text
/
```

contains:

- title
- description
- canonical
- H1
- news links

Verify:

```text
/news/example-slug
```

contains:

- unique title
- description
- canonical
- Open Graph
- Twitter metadata
- NewsArticle JSON-LD
- H1
- source link
- four similar news

---

# 108. Manual Pagination Verification

Verify:

```text
/?page=2
```

and:

```text
/category/technology?page=2
```

and:

```text
/search?q=iphone&page=2
```

All must:

- render correctly
- preserve URL parameters
- display the correct 25-item slice
- provide crawlable links
- survive page refresh

---

# 109. Manual RSS Verification

Verify:

- multiple RSS sources are loaded
- one failed source does not break the page
- duplicate articles are removed
- articles are sorted newest first
- missing images do not break cards
- malformed items are skipped
- feed data is cached
- repeated page loads do not cause unnecessary RSS requests

---

# 110. Manual Article Verification

Open an article directly by its URL.

Verify:

- page renders without visiting homepage first
- title is correct
- metadata is correct
- source link works
- image works
- similar news contains four different articles
- current article is not among similar articles
- page returns 404 for an unknown slug

---

# 111. Performance Verification

Check with Lighthouse.

Priority:

```text
Performance
SEO
Accessibility
Best Practices
```

The implementation should avoid obvious problems such as:

- render-blocking unnecessary JavaScript
- oversized images
- layout shifts
- missing metadata
- missing alt text
- broken links
- excessive client JavaScript

---

# 112. Final Project Requirements

The final project must provide:

```text
RSS aggregation
25 news per page
pagination
categories
search
article pages
4 similar articles
source attribution
responsive design
SSR
Server Components
RSS caching
deduplication
stable slugs
SEO metadata
canonical URLs
Open Graph
Twitter/X metadata
NewsArticle JSON-LD
robots.txt
sitemap.xml
semantic HTML
optimized images
loading states
error states
404 handling
Ukrainian UI
```

---

# 113. Implementation Order

Implement in this exact order:

1. Inspect the existing project.
2. Preserve Next.js 16.3.8 App Router setup.
3. Install only the required RSS parsing dependency.
4. Create RSS types.
5. Create RSS source configuration.
6. Implement RSS parser.
7. Implement RSS normalization.
8. Implement deduplication.
9. Implement stable IDs.
10. Implement stable slugs.
11. Implement aggregation.
12. Implement Next.js caching/revalidation.
13. Implement homepage.
14. Implement 25-item pagination.
15. Implement category pages.
16. Implement article pages.
17. Implement similar-news algorithm.
18. Implement search.
19. Implement Header/Footer.
20. Implement responsive UI.
21. Implement Metadata API.
22. Implement canonical URLs.
23. Implement Open Graph.
24. Implement Twitter/X metadata.
25. Implement NewsArticle JSON-LD.
26. Implement robots.ts.
27. Implement sitemap.ts.
28. Implement loading/error/not-found states.
29. Optimize images.
30. Run lint.
31. Run TypeScript checks.
32. Run production build.
33. Perform manual SEO verification.
34. Perform manual responsive verification.

---

# 114. Agent Rules

Do not:

- recreate the project
- replace Next.js
- add a database
- add a CMS
- add authentication
- add paid news APIs
- require API keys for news
- scrape article HTML
- invent news
- invent metadata
- expose RSS fetching to arbitrary user URLs
- fetch primary news from the browser
- use a client state manager unnecessarily
- create fake production data
- duplicate API/RSS logic
- use `any` unnecessarily
- use `dangerouslySetInnerHTML` for unsanitized RSS content

Do:

- use the existing Next.js project
- use RSS
- keep RSS logic server-side
- cache RSS data
- normalize all sources
- deduplicate articles
- keep URLs stable
- render news server-side
- prioritize SEO
- use semantic HTML
- keep client JavaScript minimal
- make pagination crawlable
- generate dynamic metadata
- generate structured data
- handle failed feeds gracefully
- keep the implementation extensible

---

# 115. Definition of Done

The project is complete only when all of the following are true:

- Next.js 16.3.8 project remains intact.
- RSS feeds are working.
- Multiple RSS sources can be configured.
- No news API key is required.
- RSS data is fetched server-side.
- RSS data is cached.
- Failed feeds do not break the site.
- Duplicate articles are removed.
- News is sorted by publication date.
- Homepage displays up to 25 articles.
- Pagination works.
- Category pages work.
- Search works.
- Article pages work.
- Article URLs use stable readable slugs.
- Four similar articles are displayed below articles when available.
- Current article is excluded from similar articles.
- Original source is clearly displayed.
- Original article link works.
- No full article scraping is implemented.
- Images are optimized.
- Mobile layout works.
- Desktop layout works.
- Metadata is unique.
- Canonical URLs are correct.
- Open Graph metadata exists.
- Twitter metadata exists.
- NewsArticle JSON-LD exists.
- robots.txt works.
- sitemap.xml works.
- Search pages have the intended noindex behavior.
- Loading states exist.
- Error states exist.
- 404 pages work.
- Ukrainian UI is used.
- `npm run lint` succeeds.
- `npm run build` succeeds.
- No secrets are required.
- No unnecessary client-side data fetching exists.

---

# 116. Implementation Log: Features and Production Bugs

Record of the notable work delivered after the base build: what was built,
what broke in production, why, and how it was fixed and verified.

## 116.1 Compact shrinking header (feature)

- Requirement: the header shrinks about 2× on scroll and stays pinned above
  the content without shifting the page.
- SSR renders the header as `sticky`; after hydration it switches to `fixed`
  and a `shrink-0` spacer keeps the measured expanded height, so there is no
  scroll jump and no layout shift (CLS stays 0).
- Collapsed state: search box plus a horizontally scrollable category rail,
  the brand text is hidden — 113px → 53px on desktop, 157px → 53px on mobile.
- Verified in Chrome: reload at `scrollY=500` paints the compact header
  immediately, content offset stays unchanged, search submits while compact.

## 116.2 Production canonical pointed to localhost (bug)

- Symptom: on production `canonical`, `og:url`, `robots.txt → Sitemap:` and
  every `sitemap.xml` loc contained `http://localhost:3000`.
- Cause: `getSiteUrl()` preferred `NEXT_PUBLIC_SITE_URL` (the local URL) over
  `NEXT_PUBLIC_APP_URL` (the production domain), and both variables exist in
  the environment — so the local one always won on Vercel.
- Fix (`lib/seo.ts`): environment-aware selection — on Vercel the production
  URL always wins (`NEXT_PUBLIC_APP_URL`, then the system
  `VERCEL_PROJECT_PRODUCTION_URL`), locally `NEXT_PUBLIC_SITE_URL` wins.
  Preview deployment URLs are never used for canonicals.
- Verified: `/`, `/?page=2`, category and article pages, `robots.txt` and
  `sitemap.xml` all emit `https://news-next-three.vercel.app`.

## 116.3 Empty homepage during a total RSS outage (bug)

- Symptom: the production homepage showed the «Новини зараз недоступні»
  empty state for minutes at a time even though the feeds answered fine from
  other networks.
- Cause (from the function logs): every RSS source failed inside the same
  invocation — `The operation was aborted due to timeout`, plus
  `fetch failed` and one `HTTP 403`. `collectNews()` then returned `[]`, and
  `unstable_cache` cached that empty array for the whole 300-second window,
  so the site stayed blank even after the feeds recovered.
- Fixes:
  - `lib/rss/parser.ts` — one immediate retry per feed; transport-level
    `cause` codes are written into the logs; definitive HTTP status errors
    are not retried.
  - `app/layout.tsx` — `export const maxDuration = 30` so two timed attempts
    fit inside the function budget.
  - `lib/rss/aggregator.ts` — an empty cached value is never trusted:
    `getAllNews()` bypasses it and aggregates immediately (heals a poisoned
    cache entry); on a total outage a warm instance serves its last good
    snapshot; without a snapshot the error is thrown instead of cached, so
    the very next request retries.
- Verified after deploy: all pages render 25 articles, zero `[rss]` errors in
  the logs, and every source except `suspilne` (origin-side `HTTP 403`)
  loads during the Vercel build.
