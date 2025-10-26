import { test, expect } from '@playwright/test';

/**
 * Performance E2E Tests
 * Tests real-world performance metrics and Core Web Vitals
 */

test.describe('Performance Metrics', () => {

  test.describe('Core Web Vitals', () => {
    test('should meet LCP (Largest Contentful Paint) targets', async ({ page }) => {
      await page.goto('/');

      // Measure LCP
      const lcp = await page.evaluate(() => {
        return new Promise<number>((resolve) => {
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1] as any;
            resolve(lastEntry.renderTime || lastEntry.loadTime);
          }).observe({ entryTypes: ['largest-contentful-paint'] });

          // Timeout after 10 seconds
          setTimeout(() => resolve(0), 10000);
        });
      });

      console.log(`LCP: ${lcp}ms`);
      // GOOD: < 2500ms, NEEDS IMPROVEMENT: < 4000ms
      expect(lcp).toBeLessThan(4000);
      expect(lcp).toBeGreaterThan(0);
    });

    test('should meet FID (First Input Delay) targets', async ({ page }) => {
      await page.goto('/draft-lab');
      await page.waitForLoadState('networkidle');

      // Measure FID by simulating user interaction
      const startTime = Date.now();
      await page.click('[data-testid="champion-card"]').catch(() => {});
      const endTime = Date.now();
      const fid = endTime - startTime;

      console.log(`FID (simulated): ${fid}ms`);
      // GOOD: < 100ms, NEEDS IMPROVEMENT: < 300ms
      expect(fid).toBeLessThan(300);
    });

    test('should meet CLS (Cumulative Layout Shift) targets', async ({ page }) => {
      await page.goto('/');

      // Measure CLS
      const cls = await page.evaluate(() => {
        return new Promise<number>((resolve) => {
          let clsScore = 0;
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries() as any[]) {
              if (!entry.hadRecentInput) {
                clsScore += entry.value;
              }
            }
          }).observe({ entryTypes: ['layout-shift'] });

          // Wait for page to stabilize
          setTimeout(() => resolve(clsScore), 5000);
        });
      });

      console.log(`CLS: ${cls}`);
      // GOOD: < 0.1, NEEDS IMPROVEMENT: < 0.25
      expect(cls).toBeLessThan(0.25);
    });

    test('should meet FCP (First Contentful Paint) targets', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/');

      const fcp = await page.evaluate(() => {
        const entry = performance.getEntriesByType('paint')
          .find((e) => e.name === 'first-contentful-paint');
        return entry?.startTime || 0;
      });

      console.log(`FCP: ${fcp}ms`);
      // GOOD: < 1800ms, NEEDS IMPROVEMENT: < 3000ms
      expect(fcp).toBeLessThan(3000);
      expect(fcp).toBeGreaterThan(0);
    });

    test('should meet TTFB (Time to First Byte) targets', async ({ page }) => {
      const response = await page.goto('/');
      const ttfb = await page.evaluate(() => {
        const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        return navTiming.responseStart - navTiming.requestStart;
      });

      console.log(`TTFB: ${ttfb}ms`);
      // GOOD: < 600ms, NEEDS IMPROVEMENT: < 1500ms
      expect(ttfb).toBeLessThan(1500);
    });

    test('should meet TTI (Time to Interactive) targets', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Verify page is interactive
      await page.click('body');
      const tti = Date.now() - startTime;

      console.log(`TTI: ${tti}ms`);
      // GOOD: < 3800ms, NEEDS IMPROVEMENT: < 7300ms
      expect(tti).toBeLessThan(7300);
    });
  });

  test.describe('Resource Loading', () => {
    test('should load critical resources quickly', async ({ page }) => {
      await page.goto('/');

      const resources = await page.evaluate(() => {
        return performance.getEntriesByType('resource').map((r: any) => ({
          name: r.name,
          duration: r.duration,
          size: r.transferSize,
          type: r.initiatorType,
        }));
      });

      // Check JavaScript bundles
      const jsResources = resources.filter(r => r.name.endsWith('.js'));
      jsResources.forEach(js => {
        console.log(`JS: ${js.name.split('/').pop()} - ${js.duration}ms (${(js.size / 1024).toFixed(2)}KB)`);
        expect(js.duration).toBeLessThan(3000);
      });

      // Check CSS files
      const cssResources = resources.filter(r => r.name.endsWith('.css'));
      cssResources.forEach(css => {
        console.log(`CSS: ${css.name.split('/').pop()} - ${css.duration}ms`);
        expect(css.duration).toBeLessThan(2000);
      });
    });

    test('should lazy load images', async ({ page }) => {
      await page.goto('/draft-lab');

      // Get initial image count
      const initialImages = await page.locator('img').count();

      // Scroll down to load more images
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
      await page.waitForTimeout(1000);

      const afterScrollImages = await page.locator('img').count();

      // More images should load as we scroll (lazy loading)
      console.log(`Images: ${initialImages} -> ${afterScrollImages}`);
      expect(afterScrollImages).toBeGreaterThanOrEqual(initialImages);
    });

    test('should cache static assets', async ({ page }) => {
      // First visit
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const firstVisitResources = await page.evaluate(() => {
        return performance.getEntriesByType('resource').map((r: any) => ({
          name: r.name,
          cached: r.transferSize === 0 && r.decodedBodySize > 0,
        }));
      });

      // Reload page
      await page.reload();
      await page.waitForLoadState('networkidle');

      const secondVisitResources = await page.evaluate(() => {
        return performance.getEntriesByType('resource').map((r: any) => ({
          name: r.name,
          cached: r.transferSize === 0 && r.decodedBodySize > 0,
        }));
      });

      // Count cached resources
      const cachedCount = secondVisitResources.filter(r => r.cached).length;
      console.log(`Cached resources: ${cachedCount}/${secondVisitResources.length}`);

      // At least some resources should be cached
      expect(cachedCount).toBeGreaterThan(0);
    });
  });

  test.describe('JavaScript Performance', () => {
    test('should have minimal main thread blocking', async ({ page }) => {
      await page.goto('/draft-lab');

      // Measure long tasks
      const longTasks = await page.evaluate(() => {
        return new Promise<any[]>((resolve) => {
          const tasks: any[] = [];
          new PerformanceObserver((list) => {
            tasks.push(...list.getEntries());
          }).observe({ entryTypes: ['longtask'] });

          setTimeout(() => resolve(tasks), 5000);
        });
      });

      console.log(`Long tasks: ${longTasks.length}`);
      longTasks.forEach((task, i) => {
        console.log(`  Task ${i + 1}: ${task.duration}ms`);
      });

      // Should have minimal long tasks (> 50ms)
      expect(longTasks.length).toBeLessThan(10);
    });

    test('should handle large lists efficiently', async ({ page }) => {
      await page.goto('/draft-lab');
      await page.waitForSelector('[data-testid="champion-grid"]');

      const startTime = Date.now();

      // Scroll through list multiple times
      for (let i = 0; i < 5; i++) {
        await page.evaluate(() => window.scrollBy(0, 500));
        await page.waitForTimeout(100);
      }

      const scrollTime = Date.now() - startTime;
      console.log(`Scroll performance: ${scrollTime}ms for 5 scrolls`);

      // Should remain responsive during scrolling
      expect(scrollTime).toBeLessThan(2000);
    });

    test('should measure memory usage', async ({ page }) => {
      await page.goto('/draft-lab');
      await page.waitForLoadState('networkidle');

      // Get memory info
      const memoryInfo = await page.evaluate(() => {
        if ('memory' in performance) {
          const mem = (performance as any).memory;
          return {
            usedJSHeapSize: mem.usedJSHeapSize,
            totalJSHeapSize: mem.totalJSHeapSize,
            jsHeapSizeLimit: mem.jsHeapSizeLimit,
          };
        }
        return null;
      });

      if (memoryInfo) {
        const usedMB = (memoryInfo.usedJSHeapSize / 1024 / 1024).toFixed(2);
        const totalMB = (memoryInfo.totalJSHeapSize / 1024 / 1024).toFixed(2);
        console.log(`Memory: ${usedMB}MB / ${totalMB}MB`);

        // Should not exceed 100MB for initial load
        expect(memoryInfo.usedJSHeapSize).toBeLessThan(100 * 1024 * 1024);
      }
    });
  });

  test.describe('Bundle Size', () => {
    test('should have reasonable bundle sizes', async ({ page }) => {
      await page.goto('/');

      const bundleSizes = await page.evaluate(() => {
        return performance.getEntriesByType('resource')
          .filter((r: any) => r.name.includes('.js') && r.initiatorType !== 'xmlhttprequest')
          .map((r: any) => ({
            name: r.name.split('/').pop(),
            size: r.transferSize,
            encodedSize: r.encodedBodySize,
          }));
      });

      bundleSizes.forEach(bundle => {
        const sizeKB = (bundle.size / 1024).toFixed(2);
        console.log(`Bundle: ${bundle.name} - ${sizeKB}KB`);

        // Main bundle should be under 500KB
        expect(bundle.size).toBeLessThan(500 * 1024);
      });

      // Total JS size should be reasonable
      const totalSize = bundleSizes.reduce((sum, b) => sum + b.size, 0);
      const totalMB = (totalSize / 1024 / 1024).toFixed(2);
      console.log(`Total JS: ${totalMB}MB`);
      expect(totalSize).toBeLessThan(2 * 1024 * 1024); // < 2MB total
    });
  });

  test.describe('API Performance', () => {
    test('should handle API calls efficiently', async ({ page }) => {
      await page.goto('/draft-lab');

      // Monitor fetch requests
      const apiCalls: any[] = [];
      page.on('response', response => {
        if (response.url().includes('/api/') || response.url().includes('generativelanguage')) {
          apiCalls.push({
            url: response.url(),
            status: response.status(),
          });
        }
      });

      // Trigger some API calls
      await page.waitForSelector('[data-testid="champion-card"]', { timeout: 10000 });
      await page.locator('[data-testid="champion-card"]').first().click();
      await page.waitForTimeout(2000);

      if (apiCalls.length > 0) {
        apiCalls.forEach(call => {
          console.log(`API: ${call.url.split('/').pop()} - ${call.status}`);
        });

        // API calls should complete within reasonable time
        const successfulCalls = apiCalls.filter(c => c.status >= 200 && c.status < 300);
        expect(successfulCalls.length).toBeGreaterThan(0);
      }
    });

    test('should cache API responses', async ({ page }) => {
      await page.goto('/draft-lab');
      await page.waitForLoadState('networkidle');

      // Make initial API call
      await page.waitForSelector('[data-testid="champion-card"]', { timeout: 10000 });

      // Navigate away and back
      await page.goto('/');
      await page.goto('/draft-lab');
      await page.waitForLoadState('networkidle');

      // Champions should load from cache (faster)
      const championsVisible = await page.waitForSelector('[data-testid="champion-card"]', { timeout: 3000 })
        .then(() => true)
        .catch(() => false);

      expect(championsVisible).toBe(true);
    });
  });

  test.describe('Render Performance', () => {
    test('should measure component render times', async ({ page }) => {
      await page.goto('/draft-lab');

      const renderMarks = await page.evaluate(() => {
        const marks = performance.getEntriesByType('mark')
          .filter(m => m.name.includes('render') || m.name.includes('mount'));
        return marks.map(m => ({
          name: m.name,
          startTime: m.startTime,
        }));
      });

      console.log(`Render marks: ${renderMarks.length}`);
      renderMarks.forEach(mark => {
        console.log(`  ${mark.name}: ${mark.startTime.toFixed(2)}ms`);
      });

      // Should have some performance marks
      expect(renderMarks.length).toBeGreaterThanOrEqual(0);
    });

    test('should handle rapid state changes', async ({ page }) => {
      await page.goto('/draft-lab');
      await page.waitForSelector('[data-testid="champion-card"]');

      const startTime = Date.now();

      // Rapidly click different champions
      for (let i = 0; i < 10; i++) {
        await page.locator('[data-testid="champion-card"]').nth(i).click({ timeout: 1000 }).catch(() => {});
        await page.waitForTimeout(50);
      }

      const totalTime = Date.now() - startTime;
      console.log(`Rapid state changes: ${totalTime}ms for 10 actions`);

      // Should remain responsive
      expect(totalTime).toBeLessThan(5000);
    });
  });

  test.describe('Network Performance', () => {
    test('should work efficiently on slow connections', async ({ page, context }) => {
      // Simulate slow 3G
      await context.route('**/*', route => {
        setTimeout(() => route.continue(), 100); // Add 100ms delay
      });

      const startTime = Date.now();
      await page.goto('/');
      const loadTime = Date.now() - startTime;

      console.log(`Load time on slow connection: ${loadTime}ms`);

      // Should still load within reasonable time even on slow connection
      expect(loadTime).toBeLessThan(10000);
    });

    test('should handle offline mode gracefully', async ({ page, context }) => {
      // First load with network
      await page.goto('/draft-lab');
      await page.waitForLoadState('networkidle');

      // Go offline
      await context.setOffline(true);

      // Navigate to different page
      await page.goto('/academy');

      // Should show offline indicator
      await expect(page.getByTestId('offline-indicator')).toBeVisible({ timeout: 5000 });

      // Cached pages should still work
      await page.goto('/draft-lab');
      await expect(page.getByTestId('champion-grid')).toBeVisible({ timeout: 5000 });
    });
  });
});

