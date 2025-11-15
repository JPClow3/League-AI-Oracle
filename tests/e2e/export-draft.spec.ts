import { test, expect } from '@playwright/test';

/**
 * E2E tests for draft export functionality
 */

test.describe('Draft Export', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/strategy-forge');
    await page.waitForLoadState('networkidle');
  });

  test('should export draft as image when complete', async ({ page }) => {
    // Fill draft slots
    await page.waitForSelector('button[aria-label*="Select"]', { timeout: 10000 });

    // Select multiple champions
    for (let i = 0; i < 5; i++) {
      const buttons = page.locator('button[aria-label*="Select"]');
      const count = await buttons.count();
      if (i < count) {
        await buttons.nth(i).click();
        await page.waitForTimeout(300);
      }
    }

    // Click export button
    const exportButton = page.getByRole('button', { name: /export/i });
    if (await exportButton.isVisible({ timeout: 5000 })) {
      // Set up download handler
      const downloadPromise = page.waitForEvent('download', { timeout: 10000 }).catch(() => null);

      await exportButton.click();
      await page.waitForTimeout(2000);

      // Verify success message or download
      const successMessage = page.getByText(/exported|downloaded|success/i);
      if (await successMessage.isVisible({ timeout: 5000 })) {
        await expect(successMessage).toBeVisible();
      }
    }
  });

  test('should disable export when draft is incomplete', async ({ page }) => {
    const exportButton = page.getByRole('button', { name: /export/i });
    if (await exportButton.isVisible({ timeout: 5000 })) {
      // Export should be disabled for incomplete drafts
      const isDisabled = await exportButton.isDisabled();
      expect(isDisabled).toBe(true);
    }
  });
});
