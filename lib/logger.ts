import * as Sentry from '@sentry/react';

/**
 * Logging Service with Sentry Integration
 * Provides centralized error tracking and performance monitoring
 */

interface LogContext {
  [key: string]: any;
}

class LoggingService {
  private isInitialized = false;

  /**
   * Initialize Sentry logging
   * Call this once at app startup
   */
  initialize() {
    // Only initialize in production or if explicitly enabled
    if (import.meta.env.PROD || import.meta.env.VITE_ENABLE_LOGGING === 'true') {
      const dsn = import.meta.env.VITE_SENTRY_DSN;

      if (!dsn) {
        console.warn('Sentry DSN not configured. Logging disabled.');
        return;
      }

      Sentry.init({
        dsn,
        environment: import.meta.env.MODE,

        // Performance Monitoring
        tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,

        // Session Replay (privacy-respecting)
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,

        integrations: [
          Sentry.browserTracingIntegration(),
          Sentry.replayIntegration({
            maskAllText: true,
            blockAllMedia: true,
          }),
        ],

        // Filter out sensitive data
        beforeSend(event) {
          // Remove API keys from error messages
          if (event.message) {
            event.message = event.message.replace(/api[_-]?key[=:]\s*[\w-]+/gi, 'api_key=***');
          }

          // Remove sensitive headers
          if (event.request?.headers) {
            delete event.request.headers['Authorization'];
            delete event.request.headers['X-API-Key'];
          }

          return event;
        },

        // Ignore common errors
        ignoreErrors: [
          'ResizeObserver loop limit exceeded',
          'Non-Error promise rejection captured',
          'Network request failed',
        ],
      });

      this.isInitialized = true;
      console.log('✅ Logging service initialized');
    }
  }

  /**
   * Log an error with context
   */
  error(error: Error | string, context?: LogContext) {
    if (this.isInitialized) {
      if (typeof error === 'string') {
        Sentry.captureMessage(error, {
          level: 'error',
          contexts: context ? { custom: context } : undefined,
        });
      } else {
        Sentry.captureException(error, {
          contexts: context ? { custom: context } : undefined,
        });
      }
    }

    // Always log to console in development
    if (import.meta.env.DEV) {
      console.error('[Error]', error, context);
    }
  }

  /**
   * Log a warning
   */
  warn(message: string, context?: LogContext) {
    if (this.isInitialized) {
      Sentry.captureMessage(message, {
        level: 'warning',
        contexts: context ? { custom: context } : undefined,
      });
    }

    if (import.meta.env.DEV) {
      console.warn('[Warning]', message, context);
    }
  }

  /**
   * Log an info message
   */
  info(message: string, context?: LogContext) {
    if (this.isInitialized) {
      Sentry.captureMessage(message, {
        level: 'info',
        contexts: context ? { custom: context } : undefined,
      });
    }

    if (import.meta.env.DEV) {
      console.info('[Info]', message, context);
    }
  }

  /**
   * Add breadcrumb for debugging
   */
  breadcrumb(message: string, category: string = 'user-action', data?: LogContext) {
    if (this.isInitialized) {
      Sentry.addBreadcrumb({
        message,
        category,
        data,
        level: 'info',
      });
    }
  }

  /**
   * Set user context
   */
  setUser(user: { id?: string; username?: string; email?: string }) {
    if (this.isInitialized) {
      Sentry.setUser(user);
    }
  }

  /**
   * Clear user context
   */
  clearUser() {
    if (this.isInitialized) {
      Sentry.setUser(null);
    }
  }

  /**
   * Start a performance span
   */
  startSpan(name: string, operation: string) {
    if (this.isInitialized) {
      return Sentry.startSpan({ name, op: operation }, span => span);
    }
    return null;
  }

  /**
   * Measure performance of a function
   */
  async measurePerformance<T>(name: string, operation: string, fn: () => Promise<T>): Promise<T> {
    if (!this.isInitialized) {
      return await fn();
    }

    return await Sentry.startSpan({ name, op: operation }, fn);
  }
}

// Export singleton instance
export const logger = new LoggingService();
