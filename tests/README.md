# E2E Tests

This directory contains end-to-end tests for League AI Oracle using Playwright.

## Running Tests

```bash
# Run all tests
npm run test:e2e

# Run tests with UI mode (recommended for development)
npm run test:e2e:ui

# Run tests in headed mode (see the browser)
npm run test:e2e:headed

# Debug tests step by step
npm run test:e2e:debug

# View HTML report
npm run test:report
```

## Test Structure

- `homepage.spec.ts` - Homepage and navigation tests
- `draftlab.spec.ts` - Draft Lab feature tests
- `general.spec.ts` - Settings, accessibility, and general functionality

## Writing Tests

### Best Practices

1. **Use semantic selectors** - Prefer roles and labels over CSS selectors
2. **Add test IDs** - Use `data-testid` for complex elements
3. **Test user flows** - Focus on what users do, not implementation
4. **Keep tests isolated** - Each test should be independent
5. **Use Page Objects** - For complex pages, create page object models

### Example Test

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/feature');
  });

  test('should perform action', async ({ page }) => {
    // Arrange
    const button = page.getByRole('button', { name: /submit/i });
    
    // Act
    await button.click();
    
    // Assert
    await expect(page.getByText(/success/i)).toBeVisible();
  });
});
```

## Adding Test IDs

When you need precise selectors, add `data-testid` attributes:

```tsx
<div data-testid="champion-grid">
  <div data-testid="champion-card" data-selected="true">
    {/* ... */}
  </div>
</div>
```

Then use in tests:

```typescript
await page.getByTestId('champion-grid').click();
```

## Debugging

### Visual Debugging

```bash
# Open test in UI mode
npm run test:e2e:ui

# Step through test
npm run test:e2e:debug
```

### Screenshots and Videos

Playwright automatically captures:
- Screenshots on failure
- Videos on retry
- Traces for debugging

View in the HTML report: `npm run test:report`

### Console Logs

```typescript
// Listen to console
page.on('console', msg => console.log(msg.text()));

// Log page errors
page.on('pageerror', error => console.log(error));
```

## CI/CD Integration

Tests run automatically in CI with:
- 2 retries on failure
- Single worker (no parallelization)
- HTML report artifacts

## Troubleshooting

### Tests Timing Out

Increase timeout in test:

```typescript
test('slow test', async ({ page }) => {
  test.setTimeout(60000); // 60 seconds
  // ...
});
```

### Element Not Found

1. Check if element loads asynchronously
2. Add explicit waits: `await page.waitForSelector(...)`
3. Use `toBeVisible({ timeout: 10000 })` for longer waits

### Flaky Tests

1. Avoid hard-coded waits (`page.waitForTimeout`)
2. Wait for network idle: `await page.waitForLoadState('networkidle')`
3. Use `toHaveText` instead of `toContainText` for exact matches
4. Add retries for known flaky tests

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)

