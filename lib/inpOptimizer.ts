/**
 * INP Optimization Utilities
 *
 * Helps reduce Interaction to Next Paint (INP) by:
 * - Batching DOM updates
 * - Deferring non-critical work
 * - Using scheduler API when available
 */

/**
 * Yield to main thread to allow browser to render
 */
export async function yieldToMain() {
  if ('scheduler' in window && 'yield' in (window as any).scheduler) {
    return (window as any).scheduler.yield();
  }

  return new Promise(resolve => {
    setTimeout(resolve, 0);
  });
}

/**
 * Break up long tasks into smaller chunks
 */
export async function* chunkArray<T>(array: T[], chunkSize: number = 50) {
  for (let i = 0; i < array.length; i += chunkSize) {
    yield array.slice(i, i + chunkSize);
    await yieldToMain();
  }
}

/**
 * Batch DOM reads and writes to prevent layout thrashing
 */
export class DOMBatcher {
  private readQueue: Array<() => void> = [];
  private writeQueue: Array<() => void> = [];
  private scheduled = false;

  read(callback: () => void) {
    this.readQueue.push(callback);
    this.schedule();
  }

  write(callback: () => void) {
    this.writeQueue.push(callback);
    this.schedule();
  }

  private schedule() {
    if (this.scheduled) return;
    this.scheduled = true;

    requestAnimationFrame(() => {
      // Execute all reads first
      while (this.readQueue.length > 0) {
        const read = this.readQueue.shift();
        read?.();
      }

      // Then execute all writes
      while (this.writeQueue.length > 0) {
        const write = this.writeQueue.shift();
        write?.();
      }

      this.scheduled = false;
    });
  }

  flush() {
    if (!this.scheduled) return;

    // Force immediate execution
    while (this.readQueue.length > 0) {
      const read = this.readQueue.shift();
      read?.();
    }
    while (this.writeQueue.length > 0) {
      const write = this.writeQueue.shift();
      write?.();
    }
    this.scheduled = false;
  }
}

export const domBatcher = new DOMBatcher();

/**
 * Defer non-critical work using requestIdleCallback
 */
export function runWhenIdle(callback: () => void, options?: IdleRequestOptions) {
  if ('requestIdleCallback' in window) {
    return requestIdleCallback(callback, options);
  }

  // Fallback for browsers without requestIdleCallback
  return setTimeout(callback, 1) as unknown as number;
}

/**
 * Debounce with immediate execution on first call
 */
export function debounceWithImmediate<TArgs extends unknown[], TReturn>(
  func: (...args: TArgs) => TReturn,
  wait: number
): (...args: TArgs) => void {
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };

    const callNow = immediate && !timeout;

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);

    if (callNow) func(...args);
  };
}

/**
 * Optimize event handlers to reduce INP
 */
export function optimizeEventHandler<T extends Event>(
  handler: (event: T) => void | Promise<void>,
  options: {
    debounce?: number;
    throttle?: number;
    immediate?: boolean;
  } = {}
): (event: T) => void {
  if (options.debounce) {
    return debounceWithImmediate(handler, options.debounce, options.immediate);
  }

  if (options.throttle) {
    let lastRun = 0;
    return (event: T) => {
      const now = Date.now();
      if (now - lastRun >= options.throttle!) {
        lastRun = now;
        handler(event);
      }
    };
  }

  return handler;
}

/**
 * Use content-visibility for off-screen content
 */
export function enableContentVisibility(element: HTMLElement) {
  if ('contentVisibility' in element.style) {
    (element.style as any).contentVisibility = 'auto';
    element.style.containIntrinsicSize = '1px 500px';
  }
}

/**
 * Measure and log INP-critical interactions
 */
export function measureInteraction(name: string, callback: () => void | Promise<void>) {
  return async (event: Event) => {
    const startTime = performance.now();

    try {
      await callback();
    } finally {
      const duration = performance.now() - startTime;

      if (duration > 200) {
        console.warn(`[INP] Slow interaction "${name}": ${duration.toFixed(2)}ms`);
      }

      // Report to performance monitor
      if (typeof window !== 'undefined' && (window as any).performanceMonitor) {
        (window as any).performanceMonitor.record(`INP: ${name}`, duration, {
          type: 'interaction',
          slow: duration > 200
        });
      }
    }
  };
}

