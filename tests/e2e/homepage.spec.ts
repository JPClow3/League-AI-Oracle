import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/League AI Oracle/i);
  });

  test('should display navigation menu', async ({ page }) => {
    await page.goto('/');

    // Check for main navigation items
    await expect(page.getByRole('navigation')).toBeVisible();
    await expect(page.getByRole('link', { name: /home/i })).toBeVisible();
  });

  test('should navigate to Draft Lab', async ({ page }) => {
    await page.goto('/');

    const draftLabLink = page.getByRole('link', { name: /draft lab/i });
    await draftLabLink.click();

    await expect(page).toHaveURL(/.*draft-lab/);
  });
});

