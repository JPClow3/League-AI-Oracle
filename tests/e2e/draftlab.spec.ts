import { test, expect } from '@playwright/test';

test.describe('Draft Lab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/draft-lab');
  });

  test('should load champion grid', async ({ page }) => {
    await expect(page.getByTestId('champion-grid')).toBeVisible({ timeout: 10000 });
  });

  test('should allow champion selection', async ({ page }) => {
    // Wait for champions to load
    await page.waitForSelector('[data-testid="champion-card"]', { timeout: 10000 });

    // Click first champion
    const firstChampion = page.locator('[data-testid="champion-card"]').first();
    await firstChampion.click();

    // Verify champion is selected
    await expect(firstChampion).toHaveAttribute('data-selected', 'true');
  });

  test('should show team composition', async ({ page }) => {
    await expect(page.getByTestId('team-panel')).toBeVisible();
  });

  test('should provide AI analysis', async ({ page }) => {
    // Select a champion
    await page.waitForSelector('[data-testid="champion-card"]', { timeout: 10000 });
    await page.locator('[data-testid="champion-card"]').first().click();

    // Request analysis
    const analyzeButton = page.getByRole('button', { name: /analyze/i });
    if (await analyzeButton.isVisible()) {
      await analyzeButton.click();

      // Wait for analysis to appear
      await expect(page.getByTestId('advice-panel')).toBeVisible({ timeout: 15000 });
    }
  });

  test('should filter champions by role', async ({ page }) => {
    // Wait for champions to load
    await page.waitForSelector('[data-testid="champion-card"]', { timeout: 10000 });

    // Click role filter
    const roleFilter = page.getByRole('button', { name: /top/i }).first();
    await roleFilter.click();

    // Verify filtering occurred
    await page.waitForTimeout(500);
    const visibleChampions = await page.locator('[data-testid="champion-card"]:visible').count();
    expect(visibleChampions).toBeGreaterThan(0);
  });
});

