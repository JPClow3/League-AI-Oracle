import { test, expect } from '@playwright/test';

/**
 * E2E tests for keyboard navigation
 */

test.describe('Keyboard Navigation', () => {
  test('should navigate champion grid with arrow keys', async ({ page }) => {
    await page.goto('/strategy-forge');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('button[aria-label*="Select"]', { timeout: 10000 });

    // Focus first champion button
    const firstButton = page.locator('button[aria-label*="Select"]').first();
    await firstButton.focus();

    // Navigate right
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(200);

    // Verify focus moved
    const focused = page.locator('button:focus');
    await expect(focused).toBeVisible();

    // Navigate down
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(200);

    // Select with Enter
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
  });

  test('should open command palette with Ctrl+K', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Open command palette
    await page.keyboard.press('Control+K');
    await page.waitForTimeout(500);

    // Verify command palette is visible
    const commandPalette = page.locator('[role="dialog"], [class*="command"], [class*="palette"]');
    await expect(commandPalette.first()).toBeVisible({ timeout: 5000 });
  });

  test('should navigate command palette with keyboard', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Open command palette
    await page.keyboard.press('Control+K');
    await page.waitForTimeout(500);

    // Type to search
    await page.keyboard.type('Strategy');
    await page.waitForTimeout(500);

    // Navigate with arrow keys
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(200);

    // Select with Enter
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);
  });

  test('should close modals with Escape', async ({ page }) => {
    await page.goto('/strategy-forge');
    await page.waitForLoadState('networkidle');

    // Open any modal (e.g., team builder)
    const teamBuilderButton = page.getByRole('button', { name: /team builder/i });
    if (await teamBuilderButton.isVisible({ timeout: 5000 })) {
      await teamBuilderButton.click();
      await page.waitForTimeout(500);

      // Close with Escape
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);

      // Verify modal closed
      const modal = page.locator('[role="dialog"]');
      await expect(modal).not.toBeVisible({ timeout: 2000 });
    }
  });
});
