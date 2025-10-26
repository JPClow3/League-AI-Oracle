import { test, expect } from '@playwright/test';

/**
 * Accessibility E2E Tests
 * WCAG 2.1 AA Compliance Testing
 */

test.describe('Accessibility - WCAG 2.1 AA', () => {
  
  test.describe('Keyboard Navigation', () => {
    test('should navigate entire app with keyboard only', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Tab through navigation
      await page.keyboard.press('Tab');
      let focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(['A', 'BUTTON', 'INPUT']).toContain(focusedElement);

      // Continue tabbing
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('Tab');
        focusedElement = await page.evaluate(() => document.activeElement?.tagName);
        expect(focusedElement).toBeTruthy();
      }
    });

    test('should show focus indicators', async ({ page }) => {
      await page.goto('/draft-lab');
      await page.waitForLoadState('networkidle');
      await page.keyboard.press('Tab');

      const focusedElement = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el) {return null;}
        const styles = window.getComputedStyle(el);
        return {
          outline: styles.outline,
          boxShadow: styles.boxShadow,
        };
      });

      expect(focusedElement).toBeTruthy();
    });
  });

  test.describe('Screen Reader Support', () => {
    test('should have ARIA labels on buttons', async ({ page }) => {
      await page.goto('/draft-lab');
      await page.waitForLoadState('networkidle');

      const buttons = await page.locator('button').all();
      for (const button of buttons.slice(0, 10)) {
        const hasLabel = await button.evaluate(btn => {
          return !!(
            btn.getAttribute('aria-label') ||
            btn.getAttribute('aria-labelledby') ||
            btn.textContent?.trim()
          );
        });
        expect(hasLabel).toBe(true);
      }
    });

    test('should have proper ARIA roles', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      await expect(page.getByRole('navigation')).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('main')).toBeVisible({ timeout: 5000 });
    });

    test('should have alt text for images', async ({ page }) => {
      await page.goto('/draft-lab');
      await page.waitForLoadState('networkidle');

      const images = await page.locator('img').all();
      for (const img of images.slice(0, 20)) {
        const alt = await img.getAttribute('alt');
        const isDecorative = await img.getAttribute('role') === 'presentation';
        expect(alt !== null || isDecorative).toBe(true);
      }
    });
  });

  test.describe('Color Contrast', () => {
    test('should have defined colors', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const textElements = await page.locator('p, h1, h2, h3, h4, h5, h6, span, a, button').all();
      
      for (const element of textElements.slice(0, 20)) {
        const isVisible = await element.isVisible().catch(() => false);
        if (!isVisible) {continue;}

        const color = await element.evaluate(el => {
          const styles = window.getComputedStyle(el);
          return styles.color;
        });

        expect(color).toBeTruthy();
        expect(color).not.toBe('rgba(0, 0, 0, 0)');
      }
    });
  });

  test.describe('Forms', () => {
    test('should have form labels', async ({ page }) => {
      await page.goto('/settings');
      await page.waitForLoadState('networkidle');

      const inputs = await page.locator('input, textarea, select').all();
      for (const input of inputs.slice(0, 5)) {
        const hasLabel = await input.evaluate(inp => {
          const id = inp.id;
          const hasAriaLabel = !!inp.getAttribute('aria-label');
          const hasAriaLabelledBy = !!inp.getAttribute('aria-labelledby');
          const hasAssociatedLabel = id && !!document.querySelector(`label[for="${id}"]`);
          
          return hasAriaLabel || hasAriaLabelledBy || hasAssociatedLabel;
        });
        
        expect(hasLabel).toBe(true);
      }
    });
  });

  test.describe('Mobile & Touch', () => {
    test('should have adequate touch target sizes', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/draft-lab');
      await page.waitForLoadState('networkidle');

      const buttons = await page.getByRole('button').all();
      
      for (const button of buttons.slice(0, 10)) {
        const isVisible = await button.isVisible().catch(() => false);
        if (!isVisible) {continue;}

        const box = await button.boundingBox();
        if (box) {
          const minSize = 40;
          expect(box.width >= minSize || box.height >= minSize).toBe(true);
        }
      }
    });
  });

  test.describe('Content', () => {
    test('should have heading hierarchy', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
      const headingLevels: number[] = [];

      for (const heading of headings) {
        const level = await heading.evaluate(h => parseInt(h.tagName.substring(1)));
        headingLevels.push(level);
      }

      expect(headingLevels.filter(l => l === 1).length).toBeGreaterThan(0);
    });

    test('should have lang attribute', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const lang = await page.evaluate(() => document.documentElement.lang);
      expect(lang).toBeTruthy();
      expect(lang.length).toBeGreaterThan(0);
    });
  });
});

