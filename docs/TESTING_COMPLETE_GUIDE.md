# Complete Testing Guide

## Overview

This guide covers all testing strategies implemented in the League AI Oracle project, including unit tests, integration tests, E2E tests, accessibility tests, performance tests, and visual regression tests.

## Table of Contents

1. [Test Structure](#test-structure)
2. [Running Tests](#running-tests)
3. [E2E Tests](#e2e-tests)
4. [Accessibility Testing](#accessibility-testing)
5. [Performance Testing](#performance-testing)
6. [Visual Regression Testing](#visual-regression-testing)
7. [Cross-Browser Testing](#cross-browser-testing)
8. [Best Practices](#best-practices)

## Test Structure

```
tests/
├── unit/              # Unit tests for individual functions/components
├── integration/       # Integration tests for feature workflows
└── e2e/              # End-to-end tests
    ├── critical-flows.spec.ts      # Critical user journeys
    ├── accessibility.spec.ts       # WCAG 2.1 AA compliance
    ├── performance.spec.ts         # Performance & Core Web Vitals
    ├── visual-regression.spec.ts   # Visual consistency
    ├── homepage.spec.ts           # Homepage tests
    ├── draftlab.spec.ts           # Draft Lab tests
    └── general.spec.ts            # General tests
```

## Running Tests

### All Tests
```bash
npm run test:all          # Run all tests (unit + E2E)
```

### Unit & Integration Tests
```bash
npm test                  # Run unit tests in watch mode
npm run test:unit         # Run unit tests once
npm run test:integration  # Run integration tests
npm run test:coverage     # Run with coverage report
npm run test:ui          # Open Vitest UI
```

### E2E Tests
```bash
npm run test:e2e         # Run all E2E tests
npm run test:e2e:ui      # Open Playwright UI mode
npm run test:e2e:headed  # Run with visible browser
npm run test:e2e:debug   # Debug mode
npm run test:report      # View last test report
```

### Specific Test Suites
```bash
npm run test:e2e:critical      # Critical user flows only
npm run test:e2e:accessibility # Accessibility tests only
npm run test:e2e:performance   # Performance tests only
npm run test:e2e:visual        # Visual regression tests only
```

### Cross-Browser Testing
```bash
npm run test:e2e:chromium  # Chrome/Edge tests
npm run test:e2e:firefox   # Firefox tests
npm run test:e2e:webkit    # Safari tests
npm run test:e2e:edge      # Edge browser tests
npm run test:e2e:mobile    # Mobile browsers (Chrome & Safari)
```

## E2E Tests

### Critical User Flows (`critical-flows.spec.ts`)

Tests the most important user journeys:

- **Complete Draft Flow**: Full draft simulation from start to finish
- **Live Draft Mode**: Real-time drafting experience
- **Learning Path**: Academy lesson progression
- **Arena Mode**: Draft challenges and competitions
- **Strategy Hub**: Browsing and filtering team compositions
- **User Profile**: Settings and statistics
- **Offline Mode**: Cached data and offline functionality
- **Search & Navigation**: Command palette and keyboard shortcuts
- **Error Handling**: Graceful error recovery

### Running Critical Flow Tests
```bash
npm run test:e2e:critical
```

### Writing New Critical Flow Tests

```typescript
test('should complete important user action', async ({ page }) => {
  await page.goto('/feature');
  await page.waitForLoadState('networkidle');
  
  // Interact with the page
  await page.click('[data-testid="action-button"]');
  
  // Verify outcome
  await expect(page.getByTestId('success-message')).toBeVisible();
});
```

## Accessibility Testing

### WCAG 2.1 AA Compliance (`accessibility.spec.ts`)

Comprehensive accessibility tests covering:

- **Keyboard Navigation**: Tab order, focus indicators, keyboard shortcuts
- **Screen Reader Support**: ARIA labels, roles, live regions
- **Color Contrast**: WCAG AA contrast ratios (4.5:1 for text, 3:1 for large text)
- **Text & Content**: Heading hierarchy, link descriptions, text zoom
- **Forms**: Label associations, validation messages
- **Media**: Reduced motion, no auto-play videos
- **Touch Targets**: Minimum 44x44px for mobile
- **Localization**: Language attributes, RTL support

### Running Accessibility Tests
```bash
npm run test:e2e:accessibility
```

### Accessibility Utilities

The project includes accessibility utilities in `lib/accessibility.ts`:

```typescript
import { getContrastRatio, meetsContrastRequirement, announceToScreenReader } from './lib/accessibility';

// Check color contrast
const ratio = getContrastRatio('#ffffff', '#000000'); // 21:1
const meetsAA = meetsContrastRequirement('#ffffff', '#000000'); // true

// Screen reader announcement
announceToScreenReader('Draft saved successfully', 'polite');

// Audit entire page
import { logAccessibilityAudit } from './lib/accessibility';
logAccessibilityAudit(); // Logs issues to console in dev mode
```

### Manual Accessibility Testing

1. **Keyboard Navigation**: Navigate entire app using only Tab, Enter, Escape, and arrow keys
2. **Screen Reader**: Test with NVDA (Windows), JAWS (Windows), or VoiceOver (Mac)
3. **High Contrast**: Enable Windows High Contrast mode
4. **Zoom**: Test at 200% browser zoom
5. **Mobile**: Test touch targets on actual mobile devices

## Performance Testing

### Core Web Vitals (`performance.spec.ts`)

Tests real-world performance metrics:

- **LCP (Largest Contentful Paint)**: Target < 2.5s (acceptable < 4s)
- **FID (First Input Delay)**: Target < 100ms (acceptable < 300ms)
- **CLS (Cumulative Layout Shift)**: Target < 0.1 (acceptable < 0.25)
- **FCP (First Contentful Paint)**: Target < 1.8s (acceptable < 3s)
- **TTFB (Time to First Byte)**: Target < 600ms (acceptable < 1.5s)
- **TTI (Time to Interactive)**: Target < 3.8s (acceptable < 7.3s)

### Running Performance Tests
```bash
npm run test:e2e:performance
```

### Performance Monitoring

The app includes real-world performance monitoring:

```typescript
import { performanceMonitor } from './lib/performanceMonitor';

// Initialize monitoring (done automatically in App.tsx)
performanceMonitor.initializeMonitoring();

// Track custom metrics
const endMeasure = performanceMonitor.startMeasure('ComponentName');
// ... component logic ...
endMeasure();

// Track API calls
await performanceMonitor.measureAPI('endpoint', async () => {
  return await fetch('/api/endpoint');
});

// Get performance summary
const summary = performanceMonitor.getSummary();
console.log(summary);

// Check if metrics meet budgets
const { passed, violations } = performanceMonitor.checkBudgets();
```

### Lighthouse Audits

Run Lighthouse for detailed performance analysis:

```bash
npm run lighthouse
```

## Visual Regression Testing

### Screenshot Comparison (`visual-regression.spec.ts`)

Captures and compares screenshots to detect visual changes:

- **Pages**: All major pages (homepage, draft lab, academy, etc.)
- **Components**: Individual components (champion grid, navigation, modals)
- **Responsive Design**: Mobile, tablet, and desktop viewports
- **States**: Hover, focus, selected, error, empty states
- **Themes**: Dark mode and light mode
- **Cross-Browser**: Consistency across browsers

### Running Visual Tests
```bash
npm run test:e2e:visual
```

### Updating Snapshots

When intentional visual changes are made:

```bash
npm run test:e2e:update-snapshots
```

Or update specific tests:

```bash
npx playwright test visual-regression.spec.ts --update-snapshots
```

### Screenshot Storage

Screenshots are stored in:
- `tests/e2e/__screenshots__/` - Reference screenshots
- `test-results/` - Failed test screenshots and diffs

## Cross-Browser Testing

### Supported Browsers

The project tests on:
- **Desktop**: Chrome, Firefox, Safari (WebKit), Edge
- **Mobile**: Chrome on Pixel 5, Safari on iPhone 13
- **Tablet**: iPad Pro
- **Accessibility**: Chromium with reduced motion

### Browser-Specific Tests

```typescript
test('should work in all browsers', async ({ page, browserName }) => {
  // Test runs in all configured browsers
  await page.goto('/');
  await expect(page).toHaveTitle(/League AI Oracle/);
  
  // Browser-specific logic if needed
  if (browserName === 'webkit') {
    // Safari-specific testing
  }
});
```

### Running on Specific Browsers

```bash
npm run test:e2e:chromium  # Chrome only
npm run test:e2e:firefox   # Firefox only
npm run test:e2e:webkit    # Safari only
npm run test:e2e:mobile    # Mobile browsers only
```

## Web Workers

### Draft Analysis Worker

Heavy computations are offloaded to a Web Worker:

```typescript
import { useDraftAnalysisWorker } from './hooks/useDraftAnalysisWorker';

function MyComponent() {
  const { 
    isReady, 
    isProcessing, 
    analyzeTeam, 
    calculateSynergy 
  } = useDraftAnalysisWorker();

  const handleAnalyze = async () => {
    const analysis = await analyzeTeam(selectedChampions);
    console.log(analysis);
  };

  return (
    <button 
      onClick={handleAnalyze} 
      disabled={!isReady || isProcessing}
    >
      Analyze Team
    </button>
  );
}
```

## Skeleton Screens

### Loading States

Use skeleton screens for better perceived performance:

```typescript
import { 
  ChampionGridSkeleton,
  DraftPanelSkeleton,
  AdvicePanelSkeleton,
  PageSkeleton 
} from './components/common/Skeleton';

function MyComponent() {
  const { data, isLoading } = useData();

  if (isLoading) {
    return <ChampionGridSkeleton count={12} />;
  }

  return <ChampionGrid champions={data} />;
}
```

Available skeletons:
- `Skeleton` - Base skeleton with variants
- `ChampionCardSkeleton` - Individual champion card
- `ChampionGridSkeleton` - Grid of champion cards
- `DraftPanelSkeleton` - Draft panel
- `AdvicePanelSkeleton` - AI advice panel
- `LessonCardSkeleton` - Academy lesson
- `StrategyCardSkeleton` - Strategy composition
- `PageSkeleton` - Full page layout
- And many more...

## Best Practices

### Writing Tests

1. **Use data-testid**: Add `data-testid` attributes for reliable selectors
   ```tsx
   <button data-testid="submit-button">Submit</button>
   ```

2. **Wait for elements**: Always wait for elements to be visible/stable
   ```typescript
   await page.waitForSelector('[data-testid="element"]');
   await expect(page.getByTestId('element')).toBeVisible();
   ```

3. **Test user behavior**: Test what users see and do, not implementation details
   ```typescript
   // ✅ Good
   await page.getByRole('button', { name: 'Save Draft' }).click();
   
   // ❌ Avoid
   await page.click('.css-class-name > div:nth-child(3)');
   ```

4. **Clean up**: Reset state between tests
   ```typescript
   test.beforeEach(async ({ page }) => {
     await page.goto('/');
     // Clear local storage, reset state, etc.
   });
   ```

### Performance

1. **Use waitForLoadState**: Wait for network to stabilize
   ```typescript
   await page.goto('/');
   await page.waitForLoadState('networkidle');
   ```

2. **Measure real interactions**: Track actual user experience
   ```typescript
   const startTime = Date.now();
   await page.click('[data-testid="button"]');
   const responseTime = Date.now() - startTime;
   expect(responseTime).toBeLessThan(300);
   ```

3. **Monitor long tasks**: Check for main thread blocking
   ```typescript
   const longTasks = await page.evaluate(() => {
     return new Promise(resolve => {
       new PerformanceObserver(list => {
         resolve(list.getEntries());
       }).observe({ entryTypes: ['longtask'] });
     });
   });
   ```

### Accessibility

1. **Use semantic HTML**: Proper elements with roles
2. **Add ARIA attributes**: labels, descriptions, live regions
3. **Support keyboard**: All interactions keyboard-accessible
4. **Test with tools**: Use screen readers and audit tools
5. **Check contrast**: Meet WCAG AA standards

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:unit
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Troubleshooting

### Tests Timing Out

Increase timeout in `playwright.config.ts`:
```typescript
export default defineConfig({
  timeout: 30000, // 30 seconds
  expect: {
    timeout: 10000, // 10 seconds
  },
});
```

### Flaky Tests

1. Add proper waits: `waitForLoadState`, `waitForSelector`
2. Disable animations: Set `animations: 'disabled'` in config
3. Use `toPass` for retries:
   ```typescript
   await expect(async () => {
     const text = await page.textContent('.element');
     expect(text).toBe('expected');
   }).toPass({ timeout: 5000 });
   ```

### Visual Regression Failures

- Review diffs in `test-results/`
- Update snapshots if changes are intentional
- Check for timing issues (animations, loading states)
- Ensure consistent viewport sizes

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Web Vitals](https://web.dev/vitals/)
- [Testing Library](https://testing-library.com/)

## Support

For questions or issues with testing:
1. Check this guide and existing tests
2. Review Playwright documentation
3. Open an issue in the repository

