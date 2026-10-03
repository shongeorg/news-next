# 🎭 Playwright Test Suite

Комплексний набір тестів для веб-сайтів на базі **Playwright** (TypeScript).

## 📋 Можливості

| Категорія | Тестів | Опис |
|-----------|--------|------|
| 📊 **Performance** | 15 | TTFB, Core Web Vitals, compression, cache, cookies |
| 📱 **Lighthouse** | 5 | Mobile/Desktop performance audit |
| 🔍 **SEO Audit** | 14 | Meta tags, headings, canonical, robots.txt, sitemap |
| 📸 **Screenshots** | 14 | Cross-browser скріншоти, visual regression |
| ♿ **Accessibility** | 15 | a11y перевірки (alt, labels, ARIA, keyboard) |
| **Разом** | **63** | |

---

## 🚀 Швидкий старт

### 1. Встановлення залежностей

```bash
npm install
```

### 2. Встановлення браузерів

```bash
npx playwright install chromium
```

### 3. Налаштування URL

Відредагуйте **`playwright.config.ts`** (рядок 7):

```typescript
const BASE_URL = 'https://your-site.com';  // Ваш сайт
```

### 4. Запуск тестів

```bash
# Всі тести на Chromium
npm run test

# UI режим (інтерактивний)
npm run test:ui

# Показати HTML звіт
npm run test:report
```

---

## 📁 Структура проекту

```
base-template/
├── playwright.config.ts      # ⚙️ Конфігурація (BASE_URL тут!)
├── package.json              # Залежності та скрипти
├── tsconfig.json             # TypeScript конфіг
├── tests/
│   ├── helpers/
│   │   └── perf.ts           # Performance helpers
│   ├── performance.spec.ts   # Performance тести
│   ├── lighthouse.spec.ts    # Lighthouse Mobile/Desktop
│   ├── seo.spec.ts           # SEO аудит
│   ├── screenshots.spec.ts   # Скріншоти та visual regression
│   └── accessibility.spec.ts # Accessibility (a11y)
├── test-results/             # Результати тестів (ігнорується)
├── playwright-report/        # HTML звіт (ігнорується)
└── .gitignore
```

---

## 📜 Доступні команди

| Команда | Опис |
|---------|------|
| `npm run test` | Запустити всі тести |
| `npm run test:ui` | UI режим (інтерактивний) |
| `npm run test:report` | Відкрити HTML звіт |
| `npx playwright test --project=chromium` | Тільки Chromium |
| `npx playwright test --project=firefox` | Тільки Firefox |
| `npx playwright test --project=webkit` | Тільки WebKit (Safari) |
| `npx playwright test performance.spec.ts` | Тільки performance тести |
| `npx playwright test seo.spec.ts` | Тільки SEO тести |
| `npx playwright test --update-snapshots` | Оновити еталони скріншотів |

---

## 🎯 Приклади використання

### Тестування локального сайту

```typescript
// playwright.config.ts
const BASE_URL = 'http://localhost:3333';
```

### Тестування продакшн сайту

```typescript
// playwright.config.ts
const BASE_URL = 'https://example.com';
```

### Запуск окремої категорії тестів

```bash
# Тільки accessibility
npx playwright test accessibility.spec.ts

# Тільки скріншоти
npx playwright test screenshots.spec.ts

# Тільки Lighthouse
npx playwright test lighthouse.spec.ts
```

### Запуск на всіх браузерах

```bash
npx playwright test --project=chromium --project=firefox --project=webkit
```

---

## 📊 Звітність

Після запуску тестів HTML звіт доступний за командою:

```bash
npm run test:report
```

Звіт відкривається у браузері за адресою `http://localhost:9323`.

---

## 🔧 Конфігурація

Основні налаштування в **`playwright.config.ts`**:

```typescript
export default defineConfig({
  testDir: './tests',
  timeout: 30 * 1000,      // Таймаут тесту
  retries: 1,              // Кількість спроб
  workers: undefined,      // Паралельні воркери
  
  use: {
    baseURL: BASE_URL,     // ✅ Базовий URL (з конфігурації)
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    trace: 'on-first-retry',
  },
  
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
  ],
});
```

---

## 📦 Залежності

```json
{
  "devDependencies": {
    "@playwright/test": "^1.58.2",
    "@types/node": "^25.4.0",
    "typescript": "^5.9.3"
  }
}
```

---

## 🎨 Visual Regression

Для порівняння скріншотів використовується вбудована система Playwright.

**Перший запуск** — створює еталонні скріншоти в `tests/__snapshots__/`

**Наступні запуски** — порівнюють з еталонами

**Оновити еталони:**
```bash
npx playwright test --update-snapshots
```

---

## 📝 Вимоги до сайту

Для коректної роботи тестів сайт повинен:

- ✅ Мати HTTPS (для деяких тестів)
- ✅ Відповідати на запити протягом 30 секунд
- ✅ Мати коректну HTML структуру
- ✅ Не блокувати Playwright user-agent

---

## 🐛 Вирішення проблем

### Тести фейляться з таймаутом
```typescript
// Збільште таймаут в playwright.config.ts
timeout: 60 * 1000,
```

### Браузер не встановлено
```bash
npx playwright install chromium
```

### Помилка "No tests found"
Перевірте що `testDir` вказує на правильну папку з тестами.

---

## 📄 Ліцензія

MIT

---

## 🤝 Внесок

1. Fork репозиторій
2. Створіть feature branch (`git checkout -b feature/amazing`)
3. Commit зміни (`git commit -m 'Add amazing feature'`)
4. Push (`git push origin feature/amazing`)
5. Відкрийте Pull Request

---

**Створено з ❤️ для тестування веб-сайтів**
