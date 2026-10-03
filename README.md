# Новини UA

SEO-орієнтований український новинний агрегатор: лише публічні RSS-джерела,
серверна вибірка даних, мінімум клієнтського JS. Специфікація — у файлі
`project.md`.

## Стек

- Next.js 16 (App Router, RSC), TypeScript, Tailwind CSS 4
- `rss-parser` для розбору стрічок, `unstable_cache` (300 с) для кешу вибірки
- без бази даних, CMS, авторизації та парсингу повних текстів статей

## Команди

```bash
npm run dev        # розробка: http://localhost:3000
npm run build      # продакшен-збірка
npm run start      # запуск зібраного застосунку
npm run lint       # ESLint
npm run test       # Playwright (усі тести + скріншоти)
npm run test:ui    # Playwright UI mode
npm run deploy     # vercel --prod
```

## Структура

- `app/` — маршрути: головна (пагінація), категорії, `/news/[slug]`,
  `/search`, `robots.ts`, `sitemap.ts`
- `lib/` — агрегація RSS (`lib/rss/`), пошук, SEO-хелпери (`lib/seo.ts`),
  константи
- `components/` — UI-компоненти (шапка, картки, пагінація, пошук)
- `tests/` — інтеграційні та скріншот-тести Playwright

## Середовище (env)

| змінна | призначення |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | локальний origin (`http://localhost:3000`) |
| `NEXT_PUBLIC_APP_URL` | production-домен на Vercel |

`getSiteUrl()` обирає змінну за середовищем: локально — `NEXT_PUBLIC_SITE_URL`,
на Vercel — `NEXT_PUBLIC_APP_URL`. Додатковий запасний варіант —
`VERCEL_PROJECT_PRODUCTION_URL` (системна змінна Vercel). Локальний файл
`.env.local` не комітиться (у `.gitignore`), `.env.example` — шаблон.

## Деплой

Проєкт розгорнутий на Vercel: `https://news-next-three.vercel.app`.
Деплой — `npm run deploy` (потрібен `npx vercel login` і лінк проєкту).
