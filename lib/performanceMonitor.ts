/**
 * Performance Monitoring Service
 *
 * Tracks real-world performance metrics including:
 * - Page load times
 * - Component render times
 * - API response times
 * - User interactions
 * - Core Web Vitals
 */

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private readonly maxMetrics = 1000;

  /**
   * Record a performance metric
   */
  record(name: string, value: number, metadata?: Record<string, any>) {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      metadata
    };

    this.metrics.push(metric);

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    // Log to console in development
    if (import.meta.env.DEV) {
      console.log(`[Performance] ${name}: ${value}ms`, metadata);
    }

    // Send to analytics in production
    if (import.meta.env.PROD && typeof window !== 'undefined') {
      this.sendToAnalytics(metric);
    }
  }

  /**
   * Measure Core Web Vitals
   */
  measureWebVitals() {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    // Largest Contentful Paint (LCP)
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        this.record('LCP', lastEntry.renderTime || lastEntry.loadTime, {
          type: 'web-vital'
        });
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      console.warn('LCP observation failed:', e);
    }

    // First Input Delay (FID)
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          this.record('FID', entry.processingStart - entry.startTime, {
            type: 'web-vital'
          });
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      console.warn('FID observation failed:', e);
    }

    // Cumulative Layout Shift (CLS)
    try {
      let clsScore = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsScore += entry.value;
          }
        });
        this.record('CLS', clsScore, { type: 'web-vital' });
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      console.warn('CLS observation failed:', e);
    }
  }

  /**
   * Measure page load performance
   */
  measurePageLoad() {
    if (typeof window === 'undefined') {return;}

    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        const domReadyTime = perfData.domContentLoadedEventEnd - perfData.navigationStart;
        const timeToFirstByte = perfData.responseStart - perfData.navigationStart;

        this.record('Page Load Time', pageLoadTime);
        this.record('DOM Ready Time', domReadyTime);
        this.record('Time to First Byte', timeToFirstByte);
      }, 0);
    });
  }

  /**
   * Measure React component render time
   */
  startMeasure(componentName: string): () => void {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      this.record(`Component Render: ${componentName}`, duration, {
        type: 'component-render'
      });
    };
  }

  /**
   * Measure API call duration
   */
  async measureAPI<T>(
    endpoint: string,
    apiCall: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now();

    try {
      const result = await apiCall();
      const duration = performance.now() - startTime;

      this.record(`API Call: ${endpoint}`, duration, {
        type: 'api-call',
        status: 'success'
      });

      return result;
    } catch (error) {
      const duration = performance.now() - startTime;

      this.record(`API Call: ${endpoint}`, duration, {
        type: 'api-call',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      throw error;
    }
  }

  /**
   * Get all metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Get metrics by name
   */
  getMetricsByName(name: string): PerformanceMetric[] {
    return this.metrics.filter(m => m.name === name);
  }

  /**
   * Get average for a metric
   */
  getAverage(name: string): number {
    const metrics = this.getMetricsByName(name);
    if (metrics.length === 0) {return 0;}

    const sum = metrics.reduce((acc, m) => acc + m.value, 0);
    return sum / metrics.length;
  }

  /**
   * Measure Interaction to Next Paint (INP) - Core Web Vital
   */
  measureINP() {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    try {
      const inpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          // INP measures responsiveness to user interactions
          const duration = entry.processingStart - entry.startTime;
          this.record('INP', duration, {
            type: 'web-vital',
            interaction: entry.name
          });
        });
      });
      inpObserver.observe({ type: 'event', buffered: true } as PerformanceObserverInit);
    } catch (e) {
      console.warn('INP observation failed:', e);
    }
  }

  /**
   * Monitor resource loading performance
   */
  measureResourcePerformance() {
    if (typeof window === 'undefined') {return;}

    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry: any) => {
        if (entry.initiatorType) {
          this.record(`Resource: ${entry.initiatorType}`, entry.duration, {
            type: 'resource',
            name: entry.name.split('/').pop(),
            size: entry.transferSize,
            cached: entry.transferSize === 0 && entry.decodedBodySize > 0
          });
        }
      });
    });

    try {
      observer.observe({ entryTypes: ['resource'] });
    } catch (e) {
      console.warn('Resource observation failed:', e);
    }
  }

  /**
   * Monitor long tasks (blocking main thread)
   */
  measureLongTasks() {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    try {
      const longTaskObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          this.record('Long Task', entry.duration, {
            type: 'long-task',
            startTime: entry.startTime
          });
        });
      });
      longTaskObserver.observe({ entryTypes: ['longtask'] });
    } catch (e) {
      console.warn('Long task observation failed:', e);
    }
  }

  /**
   * Monitor memory usage (Chrome only)
   */
  measureMemory() {
    if (typeof window === 'undefined') {return;}

    // Check if memory API is available (Chrome/Edge)
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.record('Memory Usage', memory.usedJSHeapSize / (1024 * 1024), {
        type: 'memory',
        totalHeapSize: memory.totalJSHeapSize / (1024 * 1024),
        heapLimit: memory.jsHeapSizeLimit / (1024 * 1024),
        unit: 'MB'
      });
    }
  }

  /**
   * Measure First Contentful Paint (FCP)
   */
  measureFCP() {
    if (typeof window === 'undefined') {return;}

    try {
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            this.record('FCP', entry.startTime, {
              type: 'web-vital'
            });
          }
        });
      });
      fcpObserver.observe({ entryTypes: ['paint'] });
    } catch (e) {
      console.warn('FCP observation failed:', e);
    }
  }

  /**
   * Measure Time to Interactive (TTI) approximation
   */
  measureTTI() {
    if (typeof window === 'undefined') {return;}

    window.addEventListener('load', () => {
      // Wait for network to be idle
      setTimeout(() => {
        const perfData = window.performance.timing;
        const tti = perfData.domInteractive - perfData.navigationStart;
        this.record('TTI', tti, {
          type: 'web-vital'
        });
      }, 0);
    });
  }

  /**
   * Track user interactions
   */
  trackInteraction(interactionName: string) {
    const startTime = performance.now();

    return () => {
      const duration = performance.now() - startTime;
      this.record(`Interaction: ${interactionName}`, duration, {
        type: 'user-interaction'
      });
    };
  }

  /**
   * Monitor route changes in SPA
   */
  measureRouteChange(from: string, to: string) {
    const startTime = performance.now();

    return () => {
      const duration = performance.now() - startTime;
      this.record('Route Change', duration, {
        type: 'navigation',
        from,
        to
      });
    };
  }

  /**
   * Get performance summary
   */
  getSummary() {
    const summary: Record<string, any> = {};

    // Group metrics by type
    const metricsByType = this.metrics.reduce((acc, metric) => {
      const type = metric.metadata?.type || 'other';
      if (!acc[type]) {acc[type] = [];}
      acc[type].push(metric);
      return acc;
    }, {} as Record<string, PerformanceMetric[]>);

    // Calculate averages for each type
    Object.keys(metricsByType).forEach(type => {
      const metrics = metricsByType[type];
      if (!metrics || metrics.length === 0) return;

      const values = metrics.map(m => m.value);
      summary[type] = {
        count: metrics.length,
        average: values.reduce((a, b) => a + b, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        latest: metrics[metrics.length - 1]
      };
    });

    return summary;
  }

  /**
   * Check if metrics meet performance budgets
   */
  checkBudgets(): { passed: boolean; violations: string[] } {
    const budgets = {
      LCP: 2500, // Good: < 2.5s
      FID: 100,  // Good: < 100ms
      CLS: 0.1,  // Good: < 0.1
      FCP: 1800, // Good: < 1.8s
      TTI: 3800, // Good: < 3.8s
    };

    const violations: string[] = [];

    Object.entries(budgets).forEach(([metric, budget]) => {
      const average = this.getAverage(metric);
      if (average > budget) {
        violations.push(`${metric}: ${average.toFixed(2)} exceeds budget of ${budget}`);
      }
    });

    return {
      passed: violations.length === 0,
      violations
    };
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics(): string {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      summary: this.getSummary(),
      budgets: this.checkBudgets()
    }, null, 2);
  }

  /**
   * Initialize all monitoring
   */
  initializeMonitoring() {
    if (typeof window === 'undefined') {return;}

    this.measureWebVitals();
    this.measurePageLoad();
    this.measureFCP();
    this.measureINP();
    this.measureTTI();
    this.measureResourcePerformance();
    this.measureLongTasks();

    // Monitor memory every 30 seconds
    setInterval(() => {
      this.measureMemory();
    }, 30000);

    // Log summary every 5 minutes in dev mode
    if (import.meta.env.DEV) {
      setInterval(() => {
        console.log('[Performance Summary]', this.getSummary());
      }, 300000);
    }
  }

  /**
   * Clear all metrics
   */
  clearMetrics() {
    this.metrics = [];
  }

  /**
   * Send metrics to analytics service
   */
  private sendToAnalytics(metric: PerformanceMetric) {
    // Integration with analytics service (PostHog, Sentry, etc.)
    if (typeof window !== 'undefined' && (window as any).posthog) {
      (window as any).posthog.capture('performance_metric', {
        name: metric.name,
        value: metric.value,
        metadata: metric.metadata,
      });
    }
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Initialize monitoring
if (typeof window !== 'undefined') {
  performanceMonitor.measureWebVitals();
  performanceMonitor.measurePageLoad();
}

// Export hook for React components
export function usePerformanceMonitor(componentName: string) {
  if (typeof window === 'undefined') {
    return { renderTime: null };
  }

  // Note: This should only be used in React components
  // Import React in the component that uses this hook
  const startTime = performance.now();

  // Clean up function
  const cleanup = () => {
    const duration = performance.now() - startTime;
    performanceMonitor.record(`Component: ${componentName}`, duration, {
      type: 'component-render'
    });
  };

  return { renderTime: null, cleanup };
}

export default performanceMonitor;

