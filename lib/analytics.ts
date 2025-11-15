import posthog from 'posthog-js';

/**
 * Privacy-Respecting Analytics Service
 * Uses PostHog for product analytics with user privacy in mind
 */

interface UserProperties {
  rank?: string;
  mainRole?: string;
  region?: string;
  [key: string]: string | number | boolean | null | undefined;
}

class AnalyticsService {
  private isInitialized = false;
  private userId: string | null = null;

  /**
   * Initialize PostHog analytics
   */
  initialize() {
    const apiKey = import.meta.env.VITE_POSTHOG_API_KEY;
    const host = import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com';

    if (!apiKey) {
      console.warn('PostHog not configured. Analytics disabled.');
      return;
    }

    try {
      posthog.init(apiKey, {
        api_host: host,

        // Privacy settings
        opt_out_capturing_by_default: false,
        respect_dnt: true, // Respect Do Not Track

        // Session recording (disabled by default for privacy)
        disable_session_recording: true,

        // Autocapture settings
        autocapture: {
          dom_event_allowlist: ['click', 'submit'], // Only capture clicks and form submits
          url_allowlist: [], // Don't capture URLs with sensitive data
          element_allowlist: ['button', 'a'], // Only capture button and link interactions
        },

        // Persistence
        persistence: 'localStorage',

        // Advanced privacy
        property_blacklist: ['$ip'], // Don't capture IP addresses
        sanitize_properties: properties => {
          // Remove any API keys or tokens
          const sanitized = { ...properties };
          Object.keys(sanitized).forEach(key => {
            if (
              key.toLowerCase().includes('token') ||
              key.toLowerCase().includes('key') ||
              key.toLowerCase().includes('password')
            ) {
              delete sanitized[key];
            }
          });
          return sanitized;
        },
      });

      this.isInitialized = true;
      console.log('✅ Analytics initialized');
    } catch (error) {
      console.error('Failed to initialize analytics:', error);
    }
  }

  /**
   * Track a page view
   */
  pageView(pageName: string, properties?: Record<string, string | number | boolean | null | undefined>) {
    if (!this.isInitialized) {
      return;
    }

    posthog.capture('$pageview', {
      page: pageName,
      ...properties,
    });
  }

  /**
   * Track a custom event
   */
  track(event: string, properties?: Record<string, string | number | boolean | null | undefined>) {
    if (!this.isInitialized) {
      return;
    }

    posthog.capture(event, properties);

    // Also log in development
    if (import.meta.env.DEV) {
      console.log('[Analytics]', event, properties);
    }
  }

  /**
   * Track feature usage
   */
  trackFeature(
    featureName: string,
    action: string,
    properties?: Record<string, string | number | boolean | null | undefined>
  ) {
    this.track(`feature_${featureName}`, {
      action,
      ...properties,
    });
  }

  /**
   * Track user action
   */
  trackAction(
    action: string,
    category: string,
    properties?: Record<string, string | number | boolean | null | undefined>
  ) {
    this.track(`action_${action}`, {
      category,
      ...properties,
    });
  }

  /**
   * Track draft analysis
   */
  trackDraftAnalysis(draftType: string, championCount: number) {
    this.track('draft_analysis', {
      draft_type: draftType,
      champion_count: championCount,
    });
  }

  /**
   * Track arena match
   */
  trackArenaMatch(duration: number, winner?: 'blue' | 'red') {
    this.track('arena_match_completed', {
      duration_seconds: duration,
      winner,
    });
  }

  /**
   * Track error
   */
  trackError(error: string, context?: Record<string, string | number | boolean | null | undefined>) {
    this.track('error_occurred', {
      error_message: error,
      ...context,
    });
  }

  /**
   * Identify user
   */
  identifyUser(userId: string, properties?: UserProperties) {
    if (!this.isInitialized) {
      return;
    }

    this.userId = userId;

    posthog.identify(userId, properties);
  }

  /**
   * Set user properties
   */
  setUserProperties(properties: UserProperties) {
    if (!this.isInitialized || !this.userId) {
      return;
    }

    posthog.people.set(properties);
  }

  /**
   * Reset user (logout)
   */
  resetUser() {
    if (!this.isInitialized) {
      return;
    }

    posthog.reset();
    this.userId = null;
  }

  /**
   * Opt out of tracking
   */
  optOut() {
    if (!this.isInitialized) {
      return;
    }

    posthog.opt_out_capturing();
    console.log('Analytics opt-out enabled');
  }

  /**
   * Opt in to tracking
   */
  optIn() {
    if (!this.isInitialized) {
      return;
    }

    posthog.opt_in_capturing();
    console.log('Analytics opt-in enabled');
  }

  /**
   * Check if user has opted out
   */
  hasOptedOut(): boolean {
    if (!this.isInitialized) {
      return true;
    }

    return posthog.has_opted_out_capturing();
  }

  /**
   * Enable session recording (with user consent)
   */
  enableSessionRecording() {
    if (!this.isInitialized) {
      return;
    }

    posthog.startSessionRecording();
  }

  /**
   * Disable session recording
   */
  disableSessionRecording() {
    if (!this.isInitialized) {
      return;
    }

    posthog.stopSessionRecording();
  }

  /**
   * Get feature flags (PostHog can also manage feature flags)
   */
  getFeatureFlag(flagName: string): boolean | string | undefined {
    if (!this.isInitialized) {
      return undefined;
    }

    return posthog.getFeatureFlag(flagName);
  }

  /**
   * Check if feature flag is enabled
   */
  isFeatureEnabled(flagName: string): boolean {
    if (!this.isInitialized) {
      return false;
    }

    return posthog.isFeatureEnabled(flagName) || false;
  }

  /**
   * Flush events immediately
   */
  flush() {
    if (!this.isInitialized) {
      return;
    }

    posthog.capture('$flush');
  }

  /**
   * Clean up
   */
  cleanup() {
    if (!this.isInitialized) {
      return;
    }

    this.flush();
  }
}

// Export singleton instance
export const analytics = new AnalyticsService();

// Convenience functions for common events
export const trackEvent = (name: string, properties?: Record<string, string | number | boolean | null | undefined>) =>
  analytics.track(name, properties);

export const trackPageView = (pageName: string) => analytics.pageView(pageName);

export const trackFeature = (featureName: string, action: string) => analytics.trackFeature(featureName, action);
