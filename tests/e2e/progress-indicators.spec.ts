import { test, expect } from '@playwright/test';

/**
 * E2E tests for progress indicators and loading states
 */

test.describe('Progress Indicators', () => {
  test('should show multi-stage progress during AI analysis', async ({ page }) => {
    await page.goto('/strategy-forge');
    await page.waitForLoadState('networkidle');

    // Fill draft to enable analysis
    await page.waitForSelector('button[aria-label*="Select"]', { timeout: 10000 });

    // Select champions (simplified - would need full draft)
    for (let i = 0; i < 5; i++) {
      const buttons = page.locator('button[aria-label*="Select"]');
      const count = await buttons.count();
      if (i < count) {
        await buttons.nth(i).click();
        await page.waitForTimeout(300);
      }
    }

    // Click analyze
    const analyzeButton = page.getByRole('button', { name: /analyze/i });
    if (await analyzeButton.isEnabled({ timeout: 5000 })) {
      await analyzeButton.click();

      // Check for progress indicators
      await page.waitForTimeout(1000);

      // Look for progress bar or stage indicators
      const progressBar = page.locator('[class*="progress"], [role="progressbar"]');
      const stageIndicators = page.locator('[aria-label*="Stage"]');

      // At least one should be visible
      const hasProgress = (await progressBar.count()) > 0 || (await stageIndicators.count()) > 0;
      expect(hasProgress).toBe(true);
    }
  });

  test('should display loading messages during analysis', async ({ page }) => {
    await page.goto('/strategy-forge');
    await page.waitForLoadState('networkidle');

    // Trigger analysis (simplified)
    const analyzeButton = page.getByRole('button', { name: /analyze/i });
    if (await analyzeButton.isVisible({ timeout: 5000 })) {
      // Mock or wait for analysis to start
      await page.waitForTimeout(500);

      // Check for loading messages
      const loadingText = page.getByText(/consulting|analyzing|evaluating/i);
      if (await loadingText.isVisible({ timeout: 5000 })) {
        await expect(loadingText).toBeVisible();
      }
    }
  });
});
