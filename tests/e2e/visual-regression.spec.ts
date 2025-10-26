import { test, expect } from '@playwright/test';

/**
 * Visual Regression Tests
 * Captures screenshots and compares them to detect unintended visual changes
 */

test.describe('Visual Regression', () => {

  test.describe('Pages', () => {
    test('homepage should match snapshot', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Wait for animations to complete
      await page.waitForTimeout(1000);

      await expect(page).toHaveScreenshot('homepage.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test('draft lab should match snapshot', async ({ page }) => {
      await page.goto('/draft-lab');
      await page.waitForLoadState('networkidle');
      await page.waitForSelector('[data-testid="champion-grid"]', { timeout: 10000 });
      await page.waitForTimeout(1000);

      await expect(page).toHaveScreenshot('draft-lab.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test('academy should match snapshot', async ({ page }) => {
      await page.goto('/academy');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      await expect(page).toHaveScreenshot('academy.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test('arena should match snapshot', async ({ page }) => {
      await page.goto('/arena');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      await expect(page).toHaveScreenshot('arena.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test('strategy hub should match snapshot', async ({ page }) => {
      await page.goto('/strategy-hub');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      await expect(page).toHaveScreenshot('strategy-hub.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test('settings should match snapshot', async ({ page }) => {
      await page.goto('/settings');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot('settings.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });
  });

  test.describe('Components', () => {
    test('champion grid should match snapshot', async ({ page }) => {
      await page.goto('/draft-lab');
      await page.waitForSelector('[data-testid="champion-grid"]', { timeout: 10000 });

      const championGrid = page.getByTestId('champion-grid');
      await expect(championGrid).toHaveScreenshot('champion-grid.png', {
        animations: 'disabled',
      });
    });

    test('navigation menu should match snapshot', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const nav = page.getByRole('navigation').first();
      await expect(nav).toHaveScreenshot('navigation.png', {
        animations: 'disabled',
      });
    });

    test('champion card should match snapshot', async ({ page }) => {
      await page.goto('/draft-lab');
      await page.waitForSelector('[data-testid="champion-card"]', { timeout: 10000 });

      const championCard = page.locator('[data-testid="champion-card"]').first();
      await expect(championCard).toHaveScreenshot('champion-card.png', {
        animations: 'disabled',
      });
    });

    test('modal should match snapshot', async ({ page }) => {
      await page.goto('/draft-lab');
      await page.waitForSelector('[data-testid="champion-card"]', { timeout: 10000 });

      // Open modal
      await page.locator('[data-testid="champion-card"]').first().click();
      await page.waitForTimeout(500);

      const modal = page.getByRole('dialog').first();
      if (await modal.isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(modal).toHaveScreenshot('modal.png', {
          animations: 'disabled',
        });
      }
    });

    test('loading spinner should match snapshot', async ({ page }) => {
      await page.goto('/draft-lab');

      // Try to capture loading state
      const loader = page.getByTestId('loading-spinner').first();
      if (await loader.isVisible({ timeout: 1000 }).catch(() => false)) {
        await expect(loader).toHaveScreenshot('loading-spinner.png', {
          animations: 'disabled',
        });
      }
    });
  });

  test.describe('Responsive Design', () => {
    test('mobile homepage should match snapshot', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      await expect(page).toHaveScreenshot('mobile-homepage.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test('tablet draft lab should match snapshot', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/draft-lab');
      await page.waitForLoadState('networkidle');
      await page.waitForSelector('[data-testid="champion-grid"]', { timeout: 10000 });
      await page.waitForTimeout(1000);

      await expect(page).toHaveScreenshot('tablet-draft-lab.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test('desktop wide should match snapshot', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto('/draft-lab');
      await page.waitForLoadState('networkidle');
      await page.waitForSelector('[data-testid="champion-grid"]', { timeout: 10000 });
      await page.waitForTimeout(1000);

      await expect(page).toHaveScreenshot('desktop-wide-draft-lab.png', {
        fullPage: false, // Just visible area for wide screens
        animations: 'disabled',
      });
    });
  });

  test.describe('States', () => {
    test('champion selected state should match snapshot', async ({ page }) => {
      await page.goto('/draft-lab');
      await page.waitForSelector('[data-testid="champion-card"]', { timeout: 10000 });

      const championCard = page.locator('[data-testid="champion-card"]').first();
      await championCard.click();
      await page.waitForTimeout(500);

      await expect(championCard).toHaveScreenshot('champion-selected.png', {
        animations: 'disabled',
      });
    });

    test('error state should match snapshot', async ({ page }) => {
      // Trigger error by going to non-existent page
      await page.goto('/non-existent-page');
      await page.waitForTimeout(1000);

      const errorBoundary = page.getByTestId('error-boundary');
      if (await errorBoundary.isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(errorBoundary).toHaveScreenshot('error-state.png', {
          animations: 'disabled',
        });
      }
    });

    test('empty state should match snapshot', async ({ page }) => {
      await page.goto('/profile');
      await page.waitForLoadState('networkidle');

      const emptyState = page.getByText(/no data|empty|get started/i).first();
      if (await emptyState.isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(page).toHaveScreenshot('empty-state.png', {
          animations: 'disabled',
        });
      }
    });
  });

  test.describe('Themes', () => {
    test('dark mode should match snapshot', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Ensure dark mode is active
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot('dark-mode.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test('light mode should match snapshot', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Ensure light mode is active
      await page.emulateMedia({ colorScheme: 'light' });
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot('light-mode.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });
  });

  test.describe('Interactive States', () => {
    test('hover state should match snapshot', async ({ page }) => {
      await page.goto('/draft-lab');
      await page.waitForSelector('[data-testid="champion-card"]', { timeout: 10000 });

      const championCard = page.locator('[data-testid="champion-card"]').first();
      await championCard.hover();
      await page.waitForTimeout(300);

      await expect(championCard).toHaveScreenshot('champion-hover.png', {
        animations: 'disabled',
      });
    });

    test('focus state should match snapshot', async ({ page }) => {
      await page.goto('/draft-lab');
      await page.waitForLoadState('networkidle');

      // Tab to first focusable element
      await page.keyboard.press('Tab');
      await page.waitForTimeout(200);

      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      if (focusedElement) {
        await expect(page.locator(':focus')).toHaveScreenshot('focus-state.png', {
          animations: 'disabled',
        });
      }
    });

    test('disabled state should match snapshot', async ({ page }) => {
      await page.goto('/draft-lab');
      await page.waitForLoadState('networkidle');

      const disabledButton = page.locator('button:disabled').first();
      if (await disabledButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(disabledButton).toHaveScreenshot('disabled-button.png', {
          animations: 'disabled',
        });
      }
    });
  });

  test.describe('Cross-Browser Consistency', () => {
    test('should look consistent across browsers', async ({ page, browserName }) => {
      await page.goto('/draft-lab');
      await page.waitForLoadState('networkidle');
      await page.waitForSelector('[data-testid="champion-grid"]', { timeout: 10000 });
      await page.waitForTimeout(1000);

      await expect(page).toHaveScreenshot(`draft-lab-${browserName}.png`, {
        fullPage: true,
        animations: 'disabled',
        maxDiffPixels: 100, // Allow small rendering differences between browsers
      });
    });
  });
});

/**
 * To update snapshots, run:
 * npm run test:e2e -- --update-snapshots
 *
 * To compare specific snapshot:
 * npm run test:e2e -- visual-regression.spec.ts --update-snapshots
 */

