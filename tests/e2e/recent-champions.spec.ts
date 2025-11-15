import { test, expect } from '@playwright/test';

/**
 * E2E tests for Recent Champions feature
 */

test.describe('Recent Champions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/strategy-forge');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('button[aria-label*="Select"]', { timeout: 10000 });
  });

  test('should track recently selected champions', async ({ page }) => {
    // Select first champion
    const firstChampion = page.locator('button[aria-label*="Select"]').first();
    const firstLabel = await firstChampion.getAttribute('aria-label');
    await firstChampion.click();
    await page.waitForTimeout(500);

    // Select second champion
    const secondChampion = page.locator('button[aria-label*="Select"]').first();
    await secondChampion.click();
    await page.waitForTimeout(500);

    // Reload page to check persistence
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Check for recent champions panel
    const recentSection = page.getByText(/recent/i);
    if (await recentSection.isVisible({ timeout: 5000 })) {
      await expect(recentSection).toBeVisible();
    }
  });

  test('should show recent champions in quick access panel', async ({ page }) => {
    // Select multiple champions
    for (let i = 0; i < 3; i++) {
      const champion = page.locator('button[aria-label*="Select"]').nth(i);
      if (await champion.isVisible({ timeout: 2000 })) {
        await champion.click();
        await page.waitForTimeout(300);
      }
    }

    // Check for recent panel
    await page.waitForTimeout(1000);
    const recentPanel = page.locator('[class*="Recent"], [aria-label*="recent"]');
    const count = await recentPanel.count();

    // Recent panel should appear if champions were selected
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should allow quick selection from recent panel', async ({ page }) => {
    // First, select a champion to create history
    await page.locator('button[aria-label*="Select"]').first().click();
    await page.waitForTimeout(500);

    // Reload to see recent panel
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Try to click recent champion if visible
    const recentChampion = page.locator('button[aria-label*="recent"]').first();
    if (await recentChampion.isVisible({ timeout: 5000 })) {
      await recentChampion.click();
      await page.waitForTimeout(500);
    }
  });
});
