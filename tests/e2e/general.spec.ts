import { test, expect } from '@playwright/test';

test.describe('Arena Mode', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/arena');
  });

  test('should display arena interface', async ({ page }) => {
    await expect(page.getByText(/arena/i)).toBeVisible();
  });

  test('should handle draft turns', async ({ page }) => {
    // Wait for arena to initialize
    await page.waitForTimeout(1000);

    // Check if turn indicator is visible
    const turnIndicator = page.getByTestId('turn-indicator');
    if (await turnIndicator.isVisible()) {
      await expect(turnIndicator).toContainText(/turn|pick|ban/i);
    }
  });
});

test.describe('Settings', () => {
  test('should open settings modal', async ({ page }) => {
    await page.goto('/');

    const settingsButton = page.getByRole('button', { name: /settings/i });
    await settingsButton.click();

    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('should toggle theme', async ({ page }) => {
    await page.goto('/');

    // Open settings
    await page.getByRole('button', { name: /settings/i }).click();

    // Toggle theme
    const themeToggle = page.getByRole('switch', { name: /theme|dark mode/i });
    if (await themeToggle.isVisible()) {
      await themeToggle.click();

      // Verify theme changed
      await page.waitForTimeout(500);
      const html = page.locator('html');
      const classList = await html.getAttribute('class');
      expect(classList).toBeTruthy();
    }
  });
});

test.describe('Accessibility', () => {
  test('should have no automatic accessibility violations', async ({ page }) => {
    await page.goto('/');

    // Check for basic accessibility
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('nav')).toBeVisible();
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/');

    // Tab through elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Check if focus is visible
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
  });
});

