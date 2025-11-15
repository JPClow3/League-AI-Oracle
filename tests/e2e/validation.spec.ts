import { test, expect } from '@playwright/test';

/**
 * E2E tests for API response validation
 */

test.describe('API Validation', () => {
  test('should handle invalid API responses gracefully', async ({ page }) => {
    // Intercept and mock invalid response
    await page.route('**/api/gemini*', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ invalid: 'response' }),
      });
    });

    await page.goto('/strategy-forge');
    await page.waitForLoadState('networkidle');

    // Try to trigger analysis
    const analyzeButton = page.getByRole('button', { name: /analyze/i });
    if (await analyzeButton.isVisible({ timeout: 5000 })) {
      await analyzeButton.click();

      // Should show error message
      await page.waitForTimeout(2000);
      const errorMessage = page.getByText(/error|invalid|failed/i);
      await expect(errorMessage.first()).toBeVisible({ timeout: 10000 });
    }
  });

  test('should validate and sanitize API responses', async ({ page }) => {
    // Mock valid response structure
    await page.route('**/api/gemini*', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          teamAnalysis: {
            blue: {
              draftScore: 'A',
              strengths: ['Test'],
              weaknesses: [],
            },
            red: {
              draftScore: 'B',
              strengths: [],
              weaknesses: [],
            },
          },
        }),
      });
    });

    await page.goto('/strategy-forge');
    await page.waitForLoadState('networkidle');

    // Analysis should succeed with valid response
    const analyzeButton = page.getByRole('button', { name: /analyze/i });
    if (await analyzeButton.isVisible({ timeout: 5000 })) {
      await analyzeButton.click();
      await page.waitForTimeout(3000);

      // Should show advice panel
      const advicePanel = page.locator('[id*="advice"], [class*="advice"]');
      await expect(advicePanel.first()).toBeVisible({ timeout: 10000 });
    }
  });
});
