import { LDClient, initialize } from 'launchdarkly-react-client-sdk';

/**
 * Feature Flags Service
 * Enables gradual feature rollouts and A/B testing
 */

export interface FeatureFlags {
  // Core Features
  enableArenaMode: boolean;
  enableAIAnalysis: boolean;
  enableTeamBuilder: boolean;

  // Experimental Features
  enableVoiceCommands: boolean;
  enableAdvancedMetrics: boolean;
  enableCollaboration: boolean;

  // UI Enhancements
  enableNewDashboard: boolean;
  enableAnimations: boolean;

  // Performance
  enableAggressiveCaching: boolean;
  enablePrefetching: boolean;
}

export const DEFAULT_FLAGS: FeatureFlags = {
  enableArenaMode: true,
  enableAIAnalysis: true,
  enableTeamBuilder: true,
  enableVoiceCommands: false,
  enableAdvancedMetrics: false,
  enableCollaboration: false,
  enableNewDashboard: false,
  enableAnimations: true,
  enableAggressiveCaching: true,
  enablePrefetching: false,
};

class FeatureFlagsService {
  private client: LDClient | null = null;
  private flags: FeatureFlags = { ...DEFAULT_FLAGS };
  private listeners: Set<(flags: FeatureFlags) => void> = new Set();
  /**
   * Initialize LaunchDarkly
   */
  async initialize(userId: string = 'anonymous') {
    const clientId = import.meta.env.VITE_LAUNCHDARKLY_CLIENT_ID;

    // If no client ID, use local defaults
    if (!clientId) {
      console.warn('LaunchDarkly not configured. Using local feature flags.');
      this.loadLocalFlags();
      return;
    }

    try {
      this.client = initialize(clientId, {
        key: userId,
        anonymous: userId === 'anonymous',
      });

      await this.client.waitUntilReady();

      // Load initial flags
      await this.refreshFlags();

      // Listen for changes
      this.client.on('change', () => {
        this.refreshFlags();
      });

      console.log('✅ Feature flags initialized');
    } catch (error) {
      console.error('Failed to initialize feature flags:', error);
      this.loadLocalFlags();
    }
  }

  /**
   * Load flags from localStorage (fallback)
   */
  private loadLocalFlags() {
    try {
      const stored = localStorage.getItem('featureFlags');
      if (stored) {
        this.flags = { ...DEFAULT_FLAGS, ...JSON.parse(stored) };
      }
    } catch {
      this.flags = { ...DEFAULT_FLAGS };
    }
  }

  /**
   * Save flags to localStorage
   */
  private saveLocalFlags() {
    try {
      localStorage.setItem('featureFlags', JSON.stringify(this.flags));
    } catch (error) {
      console.warn('Failed to save feature flags:', error);
    }
  }

  /**
   * Refresh flags from LaunchDarkly
   */
  private async refreshFlags() {
    if (!this.client) {return;}

    const newFlags: Partial<FeatureFlags> = {};

    for (const [key, defaultValue] of Object.entries(DEFAULT_FLAGS)) {
      newFlags[key as keyof FeatureFlags] = this.client.variation(
        this.camelToKebab(key),
        defaultValue
      );
    }

    this.flags = { ...DEFAULT_FLAGS, ...newFlags };
    this.saveLocalFlags();
    this.notifyListeners();
  }

  /**
   * Convert camelCase to kebab-case for LaunchDarkly keys
   */
  private camelToKebab(str: string): string {
    return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  }

  /**
   * Get a specific flag value
   */
  getFlag<K extends keyof FeatureFlags>(key: K): FeatureFlags[K] {
    return this.flags[key];
  }

  /**
   * Get all flags
   */
  getAllFlags(): FeatureFlags {
    return { ...this.flags };
  }

  /**
   * Check if a feature is enabled
   */
  isEnabled(key: keyof FeatureFlags): boolean {
    return this.flags[key] === true;
  }

  /**
   * Override a flag locally (for testing)
   */
  setFlag<K extends keyof FeatureFlags>(key: K, value: FeatureFlags[K]) {
    this.flags[key] = value;
    this.saveLocalFlags();
    this.notifyListeners();
  }

  /**
   * Reset all flags to defaults
   */
  resetFlags() {
    this.flags = { ...DEFAULT_FLAGS };
    this.saveLocalFlags();
    this.notifyListeners();
  }

  /**
   * Subscribe to flag changes
   */
  subscribe(listener: (flags: FeatureFlags) => void) {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners
   */
  private notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener(this.getAllFlags());
      } catch (error) {
        console.error('Error in feature flag listener:', error);
      }
    });
  }

  /**
   * Identify user for targeting
   */
  identifyUser(userId: string, attributes?: Record<string, any>) {
    if (this.client) {
      this.client.identify({
        key: userId,
        ...attributes,
      });
    }
  }

  /**
   * Track feature usage
   */
  trackFeatureUsage(featureName: string, metricValue?: number) {
    if (this.client) {
      this.client.track(featureName, undefined, metricValue);
    }
  }

  /**
   * Clean up
   */
  async cleanup() {
    if (this.client) {
      await this.client.close();
    }
  }
}

// Export singleton instance
export const featureFlags = new FeatureFlagsService();

