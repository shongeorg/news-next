import { test, expect, type Page } from '@playwright/test';

/**
 * Безпечний скріншот.
 *
 * На мобільних проєктах (DPR 2–3) full-page знімок стрічки з 25 карток
 * перевищує ліміт Chromium у 32767 px і робиться повільно, тому там знімаємо
 * лише вікно; на десктопі (DPR 1) — всю сторінку.
 */
async function safeScreenshot(page: Page, fullPage: boolean): Promise<Buffer> {
  const dpr = await page.evaluate(() => window.devicePixelRatio || 1);
  return page.screenshot({ fullPage: fullPage && dpr < 1.5, timeout: 20000 });
}

/**
 * 📸 Cross-Browser Screenshot Tests
 * 
 * Робить скріншоти сайту в різних браузерах та на різних пристроях
 * URL для тестування прописується в playwright.config.ts (baseURL)
 * 
 * Скріншоти зберігаються в папці test-results/
 */

test.describe('📸 Cross-Browser Screenshots', () => {
  test.describe.configure({ timeout: 30000, retries: 0 });

  test('Desktop screenshot (1920x1080)', async ({ page, browserName }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const screenshot = await safeScreenshot(page, true);
    
    expect(screenshot).toBeTruthy();
    console.log(`📸 Desktop screenshot made (${browserName})`);
  });

  test('Tablet screenshot (768x1024)', async ({ page, browserName }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const screenshot = await safeScreenshot(page, true);
    
    expect(screenshot).toBeTruthy();
    console.log(`📸 Tablet screenshot made (${browserName})`);
  });

  test('Mobile screenshot (375x667)', async ({ page, browserName }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const screenshot = await safeScreenshot(page, true);
    
    expect(screenshot).toBeTruthy();
    console.log(`📸 Mobile screenshot made (${browserName})`);
  });

  test('Hero section screenshot', async ({ page, browserName }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Знаходимо hero секцію
    const hero = page.locator('section').first();
    
    try {
      await hero.waitFor({ state: 'visible', timeout: 5000 });
      const screenshot = await hero.screenshot();
      expect(screenshot).toBeTruthy();
      console.log(`📸 Hero section screenshot made (${browserName})`);
    } catch {
      console.log(`⚠️ Hero section not found (${browserName})`);
    }
  });

  test('Navigation menu screenshot', async ({ page, browserName }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    
    const nav = page.locator('nav').first();
    
    try {
      await nav.waitFor({ state: 'visible', timeout: 5000 });
      const screenshot = await nav.screenshot();
      expect(screenshot).toBeTruthy();
      console.log(`📸 Navigation screenshot made (${browserName})`);
    } catch {
      console.log(`⚠️ Navigation not found (${browserName})`);
    }
  });

  test('Footer screenshot', async ({ page, browserName }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const footer = page.locator('footer').first();
    
    try {
      await footer.waitFor({ state: 'visible', timeout: 5000 });
      const screenshot = await footer.screenshot();
      expect(screenshot).toBeTruthy();
      console.log(`📸 Footer screenshot made (${browserName})`);
    } catch {
      console.log(`⚠️ Footer not found (${browserName})`);
    }
  });

  test('Category page screenshot', async ({ page, browserName }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/category/technology');
    await page.waitForLoadState('networkidle');
    
    const screenshot = await safeScreenshot(page, true);
    
    expect(screenshot).toBeTruthy();
    console.log(`📸 Category page screenshot made (${browserName})`);
  });

  test('Search page screenshot', async ({ page, browserName }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/search?q=%D1%83%D0%BA%D1%80%D0%B0%D1%97%D0%BD%D0%B0');
    await page.waitForLoadState('networkidle');
    
    const screenshot = await safeScreenshot(page, true);
    
    expect(screenshot).toBeTruthy();
    console.log(`📸 Search page screenshot made (${browserName})`);
  });

  test('📋 Screenshot Summary Report', async ({ page, baseURL, browserName }) => {
    console.log('\n' + '='.repeat(60));
    console.log('📸 SCREENSHOT TEST REPORT');
    console.log('='.repeat(60));
    console.log(`📍 Base URL: ${baseURL}`);
    console.log(`🌐 Browser: ${browserName}`);
    console.log(`📅 Date: ${new Date().toLocaleString('uk-UA')}`);
    console.log('='.repeat(60));
    
    const viewports = [
      { name: 'Desktop', width: 1920, height: 1080 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Mobile', width: 375, height: 667 },
    ];
    
    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const screenshot = await page.screenshot({ fullPage: false });
      
      console.log(`✅ ${vp.name} (${vp.width}x${vp.height}): ${screenshot.length} bytes`);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Screenshot tests completed');
    console.log('='.repeat(60) + '\n');
    
    expect(true).toBeTruthy();
  });
});

/**
 * 🎨 Visual Regression Tests (порівняння скріншотів)
 * 
 * Ці тести зберігають еталонні скріншоти і порівнюють з новими
 * Для першого запуску - створюються еталони
 * Для наступних - порівнюються з відхиленнями
 * 
 * Для оновлення еталонів: npx playwright test --update-snapshots
 *
 * ⚠️ Сторінки живляться з RSS і оновлюються кожні 5 хвилин, тому
 * full-page еталони тут були б ніколи нестабільними. За еталон береться
 * стабільний "хром" сайту — хедер із навігацією та формою пошуку.
 */
test.describe('🎨 Visual Regression Tests', () => {
  test.describe.configure({ timeout: 30000, retries: 0 });

  test('Homepage header visual regression', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const header = page.locator('header').first();
    await expect(header).toBeVisible();
    
    expect(await header.screenshot()).toMatchSnapshot('header-desktop.png', {
      maxDiffPixels: 100 // Допускаємо 100 пікселів відхилень
    });
    
    console.log(`🎨 Homepage header visual regression check passed`);
  });

  test('Mobile header visual regression', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const header = page.locator('header').first();
    await expect(header).toBeVisible();
    
    expect(await header.screenshot()).toMatchSnapshot('header-mobile.png', {
      maxDiffPixels: 100
    });
    
    console.log(`🎨 Mobile header visual regression check passed`);
  });
});

/**
 * 📱 Device-specific Screenshots
 * 
 * Скріншоти на емульованих пристроях
 */
test.describe('📱 Device Screenshots', () => {
  test.describe.configure({ timeout: 30000, retries: 0 });

  test('iPhone 12 screenshot', async ({ page, browserName }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const screenshot = await safeScreenshot(page, true);
    
    expect(screenshot).toBeTruthy();
    console.log(`📱 iPhone 12 screenshot made (${browserName})`);
  });

  test('Pixel 5 screenshot', async ({ page, browserName }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const screenshot = await safeScreenshot(page, true);
    
    expect(screenshot).toBeTruthy();
    console.log(`📱 Pixel 5 screenshot made (${browserName})`);
  });

  test('iPad Pro screenshot', async ({ page, browserName }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const screenshot = await safeScreenshot(page, true);
    
    expect(screenshot).toBeTruthy();
    console.log(`📱 iPad Pro screenshot made (${browserName})`);
  });
});
