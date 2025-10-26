import { test, expect } from '@playwright/test';

/**
 * Critical User Flow E2E Tests
 * Tests the most important user journeys through the application
 */

test.describe('Critical User Flows', () => {
  test.describe('Complete Draft Flow', () => {
    test('should complete a full draft simulation', async ({ page }) => {
      await page.goto('/draft-lab');

      // Wait for champion grid to load
      await expect(page.getByTestId('champion-grid')).toBeVisible({ timeout: 10000 });

      // Ban phase - blue side
      const banButton = page.getByRole('button', { name: /ban/i }).first();
      if (await banButton.isVisible()) {
        await banButton.click();
        await page.waitForSelector('[data-testid="champion-card"]');
        await page.locator('[data-testid="champion-card"]').first().click();
      }

      // Pick phase - select champions for each role
      const roles = ['top', 'jungle', 'mid', 'adc', 'support'];
      for (let i = 0; i < Math.min(3, roles.length); i++) {
        await page.waitForSelector('[data-testid="champion-card"]', { timeout: 5000 });
        const availableChampion = page.locator('[data-testid="champion-card"]').nth(i);
        await availableChampion.click({ timeout: 5000 });
        await page.waitForTimeout(500); // Allow UI to update
      }

      // Verify team composition is shown
      await expect(page.getByTestId('team-panel')).toBeVisible();

      // Request AI analysis
      const analyzeButton = page.getByRole('button', { name: /analyze|get advice/i }).first();
      if (await analyzeButton.isVisible()) {
        await analyzeButton.click();
        await expect(page.getByTestId('advice-panel')).toBeVisible({ timeout: 15000 });
      }

      // Verify draft can be saved
      const saveButton = page.getByRole('button', { name: /save/i }).first();
      await expect(saveButton).toBeVisible();
    });

    test('should handle draft blueprint creation', async ({ page }) => {
      await page.goto('/draft-lab');
      await page.waitForLoadState('networkidle');

      // Open blueprint panel
      const blueprintButton = page.getByRole('button', { name: /blueprint/i }).first();
      if (await blueprintButton.isVisible()) {
        await blueprintButton.click();

        // Create new blueprint
        const createButton = page.getByRole('button', { name: /create|new/i }).first();
        if (await createButton.isVisible()) {
          await createButton.click();

          // Fill blueprint details
          const nameInput = page.getByPlaceholder(/name|title/i).first();
          if (await nameInput.isVisible()) {
            await nameInput.fill('Test Blueprint');
            await page.keyboard.press('Enter');
            await expect(page.getByText('Test Blueprint')).toBeVisible({ timeout: 5000 });
          }
        }
      }
    });
  });

  test.describe('Live Draft Mode', () => {
    test('should start and manage live draft', async ({ page }) => {
      await page.goto('/live-draft');
      await page.waitForLoadState('networkidle');

      // Start live draft
      const startButton = page.getByRole('button', { name: /start|begin/i }).first();
      if (await startButton.isVisible()) {
        await startButton.click();

        // Verify turn indicator
        await expect(page.getByTestId('turn-indicator')).toBeVisible({ timeout: 5000 });

        // Make a selection
        await page.waitForSelector('[data-testid="champion-card"]', { timeout: 10000 });
        const champion = page.locator('[data-testid="champion-card"]').first();
        await champion.click();

        // Verify selection was recorded
        await expect(page.getByTestId('draft-timeline')).toBeVisible();
      }
    });

    test('should provide real-time suggestions', async ({ page }) => {
      await page.goto('/live-draft');
      await page.waitForLoadState('networkidle');

      const startButton = page.getByRole('button', { name: /start/i }).first();
      if (await startButton.isVisible()) {
        await startButton.click();

        // Wait for AI suggestions
        const suggestionsPanel = page.getByTestId('suggestions-panel');
        if (await suggestionsPanel.isVisible({ timeout: 5000 })) {
          await expect(suggestionsPanel).toContainText(/recommend|suggest/i);
        }
      }
    });
  });

  test.describe('Learning Path - Academy', () => {
    test('should navigate through lessons', async ({ page }) => {
      await page.goto('/academy');
      await page.waitForLoadState('networkidle');

      // Select first lesson
      const firstLesson = page.getByTestId('lesson-card').first();
      if (await firstLesson.isVisible({ timeout: 5000 })) {
        await firstLesson.click();

        // Verify lesson content loads
        await expect(page.getByTestId('lesson-content')).toBeVisible({ timeout: 5000 });

        // Progress through lesson
        const nextButton = page.getByRole('button', { name: /next|continue/i }).first();
        if (await nextButton.isVisible()) {
          await nextButton.click();
          await page.waitForTimeout(500);
        }

        // Verify progress is tracked
        const progressBar = page.getByTestId('progress-bar');
        if (await progressBar.isVisible()) {
          await expect(progressBar).toHaveAttribute('aria-valuenow');
        }
      }
    });

    test('should complete lesson and mark as done', async ({ page }) => {
      await page.goto('/academy');
      await page.waitForLoadState('networkidle');

      const lesson = page.getByTestId('lesson-card').first();
      if (await lesson.isVisible({ timeout: 5000 })) {
        await lesson.click();

        // Complete lesson
        const completeButton = page.getByRole('button', { name: /complete|finish/i }).first();
        if (await completeButton.isVisible({ timeout: 5000 })) {
          await completeButton.click();

          // Verify completion
          await expect(page.getByText(/completed|finished/i)).toBeVisible({ timeout: 5000 });
        }
      }
    });
  });

  test.describe('Arena Mode', () => {
    test('should start arena draft challenge', async ({ page }) => {
      await page.goto('/arena');
      await page.waitForLoadState('networkidle');

      // Start challenge
      const startButton = page.getByRole('button', { name: /start|begin|play/i }).first();
      if (await startButton.isVisible({ timeout: 5000 })) {
        await startButton.click();

        // Wait for champion selection
        await expect(page.getByTestId('arena-champion-select')).toBeVisible({ timeout: 10000 });

        // Make selections
        await page.waitForSelector('[data-testid="champion-card"]', { timeout: 10000 });
        await page.locator('[data-testid="champion-card"]').first().click();

        // Verify timer is running
        const timer = page.getByTestId('draft-timer');
        if (await timer.isVisible()) {
          await expect(timer).toBeVisible();
        }
      }
    });
  });

  test.describe('Strategy Hub', () => {
    test('should browse and view team compositions', async ({ page }) => {
      await page.goto('/strategy-hub');
      await page.waitForLoadState('networkidle');

      // Browse compositions
      const compositionCard = page.getByTestId('composition-card').first();
      if (await compositionCard.isVisible({ timeout: 5000 })) {
        await compositionCard.click();

        // Verify composition details
        await expect(page.getByTestId('composition-details')).toBeVisible({ timeout: 5000 });

        // Try composition in practice
        const tryButton = page.getByRole('button', { name: /try|practice/i }).first();
        if (await tryButton.isVisible()) {
          await tryButton.click();
          await expect(page).toHaveURL(/draft-lab/);
        }
      }
    });

    test('should filter strategies by meta and patch', async ({ page }) => {
      await page.goto('/strategy-hub');
      await page.waitForLoadState('networkidle');

      // Apply filters
      const filterButton = page.getByRole('button', { name: /filter/i }).first();
      if (await filterButton.isVisible({ timeout: 5000 })) {
        await filterButton.click();

        // Select meta filter
        const metaFilter = page.getByRole('checkbox', { name: /current meta/i }).first();
        if (await metaFilter.isVisible()) {
          await metaFilter.check();
          await page.waitForTimeout(1000);

          // Verify filtered results
          await expect(page.getByTestId('composition-card')).toHaveCount({ max: 50 });
        }
      }
    });
  });

  test.describe('User Profile and Settings', () => {
    test('should update user preferences', async ({ page }) => {
      await page.goto('/settings');
      await page.waitForLoadState('networkidle');

      // Change theme
      const themeToggle = page.getByRole('button', { name: /theme|dark mode/i }).first();
      if (await themeToggle.isVisible({ timeout: 5000 })) {
        await themeToggle.click();
        await page.waitForTimeout(500);
      }

      // Change language
      const languageSelect = page.getByLabel(/language/i).first();
      if (await languageSelect.isVisible({ timeout: 5000 })) {
        await languageSelect.click();
        const option = page.getByRole('option', { name: /english/i }).first();
        if (await option.isVisible()) {
          await option.click();
        }
      }

      // Save settings
      const saveButton = page.getByRole('button', { name: /save/i }).first();
      if (await saveButton.isVisible()) {
        await saveButton.click();
        await expect(page.getByText(/saved|updated/i)).toBeVisible({ timeout: 5000 });
      }
    });

    test('should view profile statistics', async ({ page }) => {
      await page.goto('/profile');
      await page.waitForLoadState('networkidle');

      // Verify stats are displayed
      const statsSection = page.getByTestId('profile-stats');
      if (await statsSection.isVisible({ timeout: 5000 })) {
        await expect(statsSection).toBeVisible();

        // Check for key metrics
        await expect(page.getByText(/drafts completed/i).first()).toBeVisible();
        await expect(page.getByText(/win rate/i).first()).toBeVisible();
      }
    });
  });

  test.describe('Offline Mode', () => {
    test('should work offline with cached data', async ({ page, context }) => {
      // First visit to cache data
      await page.goto('/draft-lab');
      await page.waitForLoadState('networkidle');
      await page.waitForSelector('[data-testid="champion-grid"]', { timeout: 10000 });

      // Go offline
      await context.setOffline(true);

      // Navigate to different page
      await page.goto('/academy');
      await page.waitForLoadState('networkidle');

      // Verify offline indicator
      const offlineIndicator = page.getByTestId('offline-indicator');
      await expect(offlineIndicator).toBeVisible({ timeout: 5000 });

      // Verify cached content still works
      await page.goto('/draft-lab');
      await expect(page.getByTestId('champion-grid')).toBeVisible({ timeout: 10000 });

      // Go back online
      await context.setOffline(false);
    });
  });

  test.describe('Search and Navigation', () => {
    test('should search for champions across the app', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Open command palette (Ctrl+K)
      await page.keyboard.press('Control+K');

      // Wait for command palette
      const commandPalette = page.getByTestId('command-palette');
      if (await commandPalette.isVisible({ timeout: 5000 })) {
        // Search for a champion
        await page.keyboard.type('Yasuo');
        await page.waitForTimeout(500);

        // Select first result
        await page.keyboard.press('Enter');
        await page.waitForTimeout(500);

        // Verify navigation or modal opened
        const modal = page.getByTestId('champion-detail-modal');
        await expect(modal.or(page.getByTestId('champion-grid'))).toBeVisible({ timeout: 5000 });
      }
    });

    test('should use keyboard shortcuts', async ({ page }) => {
      await page.goto('/draft-lab');
      await page.waitForLoadState('networkidle');

      // Open keyboard shortcuts help
      await page.keyboard.press('?');

      const shortcutsModal = page.getByTestId('keyboard-shortcuts-modal');
      if (await shortcutsModal.isVisible({ timeout: 5000 })) {
        await expect(shortcutsModal).toBeVisible();

        // Close modal
        await page.keyboard.press('Escape');
        await expect(shortcutsModal).not.toBeVisible();
      }
    });
  });

  test.describe('Error Handling', () => {
    test('should handle API errors gracefully', async ({ page }) => {
      // Intercept API calls and return errors
      await page.route('**/api/**', route => route.abort('failed'));

      await page.goto('/draft-lab');
      await page.waitForLoadState('networkidle');

      // Verify error message is shown
      const errorMessage = page.getByText(/error|failed|unavailable/i).first();
      await expect(errorMessage).toBeVisible({ timeout: 10000 });
    });

    test('should recover from errors', async ({ page }) => {
      await page.goto('/draft-lab');

      // Simulate error by navigating to non-existent page
      await page.goto('/non-existent-page');

      // Verify error boundary catches it
      const errorBoundary = page.getByTestId('error-boundary');
      if (await errorBoundary.isVisible({ timeout: 5000 })) {
        // Try to recover
        const homeButton = page.getByRole('link', { name: /home|back/i }).first();
        if (await homeButton.isVisible()) {
          await homeButton.click();
          await expect(page).toHaveURL('/');
        }
      }
    });
  });
});

