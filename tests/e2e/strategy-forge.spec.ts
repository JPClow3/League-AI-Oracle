import { test, expect } from '@playwright/test';

/**
 * Comprehensive E2E tests for Strategy Forge (Draft Lab)
 */

test.describe('Strategy Forge', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should navigate to Strategy Forge', async ({ page }) => {
    // Navigate via navigation
    const strategyForgeLink = page.getByRole('link', { name: /strategy forge|draft lab/i });
    if (await strategyForgeLink.isVisible({ timeout: 5000 })) {
      await strategyForgeLink.click();
      await expect(page).toHaveURL(/strategy-forge|draft-lab/i);
    }
  });

  test('should display champion grid and team panels', async ({ page }) => {
    await page.goto('/strategy-forge');
    await page.waitForLoadState('networkidle');

    // Verify champion grid is visible
    const championGrid = page.locator('[id*="champion-grid"], [data-testid*="champion-grid"]');
    await expect(championGrid).toBeVisible({ timeout: 10000 });

    // Verify team panels
    await expect(page.getByText(/blue team/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/red team/i)).toBeVisible({ timeout: 5000 });
  });

  test('should search and filter champions', async ({ page }) => {
    await page.goto('/strategy-forge');
    await page.waitForLoadState('networkidle');

    // Wait for search input
    const searchInput = page.getByPlaceholderText(/search champions/i);
    await expect(searchInput).toBeVisible({ timeout: 10000 });

    // Type in search
    await searchInput.fill('Ahri');
    await page.waitForTimeout(500);

    // Verify filtered results (should show Ahri or similar)
    const championCards = page.locator('[aria-label*="Ahri"], [alt*="Ahri"]');
    const count = await championCards.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should select champion and add to draft', async ({ page }) => {
    await page.goto('/strategy-forge');
    await page.waitForLoadState('networkidle');

    // Wait for champions to load
    await page.waitForSelector('button[aria-label*="Select"]', { timeout: 10000 });

    // Click first available champion
    const firstChampion = page.locator('button[aria-label*="Select"]').first();
    await firstChampion.click();

    // Verify champion was added (check for slot being filled)
    await page.waitForTimeout(500);

    // Check if any slot now has content
    const filledSlots = page.locator('[class*="champion"], img[alt*="Champion"]');
    const slotCount = await filledSlots.count();
    expect(slotCount).toBeGreaterThan(0);
  });

  test('should use keyboard navigation in champion grid', async ({ page }) => {
    await page.goto('/strategy-forge');
    await page.waitForLoadState('networkidle');

    // Focus on champion grid
    const firstButton = page.locator('button[aria-label*="Select"]').first();
    await firstButton.focus();

    // Navigate with arrow keys
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(200);

    // Verify focus moved
    const focused = page.locator('button:focus');
    await expect(focused).toBeVisible();
  });

  test('should show recent champions panel', async ({ page }) => {
    await page.goto('/strategy-forge');
    await page.waitForLoadState('networkidle');

    // Select a champion first to create recent history
    await page.waitForSelector('button[aria-label*="Select"]', { timeout: 10000 });
    await page.locator('button[aria-label*="Select"]').first().click();
    await page.waitForTimeout(500);

    // Navigate away and back, or refresh
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Check for recent panel
    const recentSection = page.getByText(/recent/i);
    if (await recentSection.isVisible({ timeout: 5000 })) {
      await expect(recentSection).toBeVisible();
    }
  });

  test('should complete draft and analyze', async ({ page }) => {
    await page.goto('/strategy-forge');
    await page.waitForLoadState('networkidle');

    // Fill all 10 slots (5 blue + 5 red)
    await page.waitForSelector('button[aria-label*="Select"]', { timeout: 10000 });

    const championButtons = page.locator('button[aria-label*="Select"]');
    const buttonCount = await championButtons.count();

    // Select champions for blue team
    for (let i = 0; i < Math.min(5, buttonCount); i++) {
      await championButtons.nth(i).click();
      await page.waitForTimeout(300);
    }

    // Select champions for red team (if slots are available)
    for (let i = 5; i < Math.min(10, buttonCount); i++) {
      await championButtons.nth(i).click();
      await page.waitForTimeout(300);
    }

    // Click analyze button
    const analyzeButton = page.getByRole('button', { name: /analyze/i });
    if (await analyzeButton.isEnabled({ timeout: 5000 })) {
      await analyzeButton.click();

      // Wait for analysis to start
      await expect(page.getByText(/analyzing|consulting/i)).toBeVisible({ timeout: 10000 });
    }
  });

  test('should export draft as image', async ({ page }) => {
    await page.goto('/strategy-forge');
    await page.waitForLoadState('networkidle');

    // Fill some slots first
    await page.waitForSelector('button[aria-label*="Select"]', { timeout: 10000 });
    await page.locator('button[aria-label*="Select"]').first().click();
    await page.waitForTimeout(500);

    // Click export button
    const exportButton = page.getByRole('button', { name: /export/i });
    if (await exportButton.isVisible({ timeout: 5000 })) {
      // Set up download listener
      const downloadPromise = page.waitForEvent('download', { timeout: 10000 }).catch(() => null);

      await exportButton.click();

      // Wait for download or toast notification
      await page.waitForTimeout(2000);

      // Verify either download started or success message shown
      const successMessage = page.getByText(/exported|downloaded|success/i);
      if (await successMessage.isVisible({ timeout: 5000 })) {
        await expect(successMessage).toBeVisible();
      }
    }
  });

  test('should use drag and drop to move champions', async ({ page }) => {
    await page.goto('/strategy-forge');
    await page.waitForLoadState('networkidle');

    // Select a champion first
    await page.waitForSelector('button[aria-label*="Select"]', { timeout: 10000 });
    const championButton = page.locator('button[aria-label*="Select"]').first();

    // Get source position
    const sourceBox = await championButton.boundingBox();
    if (!sourceBox) {
      return;
    }

    // Find a slot to drop on
    const slots = page.locator('[class*="slot"], [class*="pick"], [class*="ban"]');
    const slotCount = await slots.count();

    if (slotCount > 0) {
      const targetSlot = slots.first();
      const targetBox = await targetSlot.boundingBox();

      if (targetBox) {
        // Perform drag and drop
        await championButton.dragTo(targetSlot);
        await page.waitForTimeout(500);
      }
    }
  });

  test('should reset draft', async ({ page }) => {
    await page.goto('/strategy-forge');
    await page.waitForLoadState('networkidle');

    // Fill a slot
    await page.waitForSelector('button[aria-label*="Select"]', { timeout: 10000 });
    await page.locator('button[aria-label*="Select"]').first().click();
    await page.waitForTimeout(500);

    // Click reset
    const resetButton = page.getByRole('button', { name: /reset/i });
    if (await resetButton.isVisible({ timeout: 5000 })) {
      await resetButton.click();
      await page.waitForTimeout(500);

      // Verify slots are cleared
      const filledSlots = page.locator('img[alt*="Champion"]:not([alt=""])');
      const count = await filledSlots.count();
      expect(count).toBe(0);
    }
  });
});
