/**
 * Example: Integrating All Advanced Features
 *
 * This file demonstrates how to use all advanced features together
 * in a real component.
 */

import React, { useEffect, useState } from 'react';
import { logger } from './lib/logger';
import { analytics } from './lib/analytics';
import { useFeatureFlag } from './hooks/useFeatureFlags';
import { offlineService } from './lib/offlineService';
import { SEO } from './components/common/SEO';

interface ExampleComponentProps {
  championId: string;
}

export const ExampleComponent: React.FC<ExampleComponentProps> = ({ championId }) => {
  // 1. FEATURE FLAGS - Control feature availability
  const enableAdvancedAnalysis = useFeatureFlag('enableAdvancedMetrics');
  const enableAIRecommendations = useFeatureFlag('enableAIAnalysis');

  // 2. STATE MANAGEMENT
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // 3. ANALYTICS - Track page view
    analytics.pageView('Example Component');
    analytics.track('component_mounted', {
      championId,
      timestamp: Date.now(),
    });

    // 4. LOGGING - Add breadcrumb for debugging
    logger.breadcrumb('Component mounted', 'lifecycle', {
      championId,
      features: {
        advancedAnalysis: enableAdvancedAnalysis,
        aiRecommendations: enableAIRecommendations,
      },
    });
  }, [championId, enableAdvancedAnalysis, enableAIRecommendations]);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    // 5. PERFORMANCE MONITORING - Track API call performance
    try {
      const result = await logger.measurePerformance(
        'fetch-champion-data',
        'http',
        async () => {
          const response = await fetch(`/api/champions/${championId}`);
          if (!response.ok) throw new Error('Failed to fetch');
          return response.json();
        }
      );

      setData(result);

      // 6. ANALYTICS - Track success
      analytics.track('data_fetched', {
        championId,
        duration: 'tracked_by_logger',
      });

      // 7. LOGGING - Breadcrumb for debugging
      logger.breadcrumb('Data fetched successfully', 'api', {
        championId,
        dataSize: JSON.stringify(result).length,
      });

    } catch (err) {
      const error = err as Error;
      setError(error);

      // 8. ERROR LOGGING - Capture error with context
      logger.error(error, {
        component: 'ExampleComponent',
        championId,
        action: 'fetch_data',
        online: offlineService.isConnected(),
      });

      // 9. ANALYTICS - Track error
      analytics.trackError('data_fetch_failed', {
        championId,
        error: error.message,
      });

      // 10. OFFLINE HANDLING - Queue request if offline
      if (!offlineService.isConnected()) {
        offlineService.queueRequest(
          `/api/champions/${championId}`,
          'GET'
        );

        logger.info('Request queued for offline sync', {
          championId,
          queueSize: offlineService.getQueuedCount(),
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserAction = (action: string) => {
    // 11. ANALYTICS - Track user action
    analytics.trackAction(action, 'user-interaction', {
      championId,
      component: 'ExampleComponent',
    });

    // 12. FEATURE FLAGS - Conditional logic
    if (enableAdvancedAnalysis) {
      performAdvancedAnalysis();
    } else {
      performBasicAnalysis();
    }
  };

  const performAdvancedAnalysis = () => {
    logger.info('Performing advanced analysis', { championId });
    // Advanced analysis logic...
  };

  const performBasicAnalysis = () => {
    logger.info('Performing basic analysis', { championId });
    // Basic analysis logic...
  };

  // 13. ERROR BOUNDARY FALLBACK
  if (error) {
    return (
      <div className="error-container">
        <h3>Something went wrong</h3>
        <p>{error.message}</p>
        {!offlineService.isConnected() && (
          <p className="text-warning">
            You're offline. Request will sync when connection is restored.
            ({offlineService.getQueuedCount()} queued)
          </p>
        )}
        <button onClick={fetchData}>Retry</button>
      </div>
    );
  }

  return (
    <>
      {/* 14. SEO - Dynamic meta tags */}
      <SEO
        title={`Champion ${championId}`}
        description={`Detailed analysis and statistics for ${championId}`}
        keywords={['league of legends', championId, 'stats', 'analysis']}
      />

      <div className="example-component">
        <h2>Champion Analysis</h2>

        {/* 15. FEATURE FLAG - Conditional rendering */}
        {enableAIRecommendations && (
          <div className="ai-recommendations">
            <h3>AI Recommendations</h3>
            {/* AI content... */}
          </div>
        )}

        {/* Loading state */}
        {isLoading && <div>Loading...</div>}

        {/* Data display */}
        {data && (
          <div className="data-display">
            <pre>{JSON.stringify(data, null, 2)}</pre>
          </div>
        )}

        {/* Actions */}
        <div className="actions">
          <button onClick={fetchData}>Fetch Data</button>
          <button onClick={() => handleUserAction('analyze')}>
            Analyze
          </button>

          {/* Conditional feature */}
          {enableAdvancedAnalysis && (
            <button onClick={() => handleUserAction('advanced-analyze')}>
              Advanced Analysis
            </button>
          )}
        </div>

        {/* Offline indicator */}
        {!offlineService.isConnected() && (
          <div className="offline-notice">
            ⚠️ You're offline. Some features may be limited.
          </div>
        )}
      </div>
    </>
  );
};

/**
 * Example: Using in Parent Component
 */
export const ParentExample: React.FC = () => {
  useEffect(() => {
    // Set user context for logging and analytics
    const userId = 'user123';

    // Set user in logger
    logger.setUser({
      id: userId,
      username: 'ExampleUser',
    });

    // Identify user in analytics
    analytics.identifyUser(userId, {
      rank: 'Diamond',
      mainRole: 'Mid',
      region: 'NA',
    });

    // Cleanup on unmount
    return () => {
      logger.clearUser();
      analytics.resetUser();
    };
  }, []);

  return (
    <div>
      <h1>Example Application</h1>
      <ExampleComponent championId="ahri" />
    </div>
  );
};

/**
 * Example: Testing Component with Feature Flags
 */
export const TestFeatureFlags: React.FC = () => {
  const [isAdvancedEnabled, setIsAdvancedEnabled] = useState(false);

  const toggleFeature = () => {
    const newState = !isAdvancedEnabled;
    setIsAdvancedEnabled(newState);

      // Override feature flag locally for testing
      import('./lib/featureFlags').then(({ featureFlags }) => {
        featureFlags.setFlag('enableAdvancedMetrics', newState);
      });

    // Track feature usage
    analytics.track('feature_toggled', {
      feature: 'enableAdvancedMetrics',
      enabled: newState,
    });

    logger.info('Feature flag toggled', {
      feature: 'enableAdvancedMetrics',
      enabled: newState,
    });
  };

  return (
    <div>
      <h2>Feature Flag Testing</h2>
      <button onClick={toggleFeature}>
        Toggle Advanced Metrics: {isAdvancedEnabled ? 'ON' : 'OFF'}
      </button>
      <ExampleComponent championId="ahri" />
    </div>
  );
};

/**
 * Example: Error Handling Pattern
 */
export const withErrorHandling = <P extends object>(
  Component: React.ComponentType<P>
) => {
  return (props: P) => {
    const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
      // Log to Sentry
      logger.error(error, {
        component: Component.name,
        errorInfo: errorInfo.componentStack,
      });

      // Track in analytics
      analytics.trackError('component_error', {
        component: Component.name,
        error: error.message,
      });
    };

    return (
      <ErrorBoundary onError={handleError}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
};

/**
 * Usage Examples in Different Scenarios
 */

// Example 1: Draft Lab with all features
export const DraftLabExample = () => {
  const enableTeamBuilder = useFeatureFlag('enableTeamBuilder');

  useEffect(() => {
    analytics.pageView('Draft Lab');
    logger.breadcrumb('Draft Lab opened', 'navigation');
  }, []);

  const handleAnalyzeDraft = async () => {
    analytics.track('draft_analyzed', { type: 'manual' });

    try {
      await logger.measurePerformance('analyze-draft', 'ai', async () => {
        // AI analysis logic
      });
    } catch (error) {
      logger.error(error as Error, { feature: 'draft-analysis' });
    }
  };

  return (
    <>
      <SEO title="Draft Lab" />
      <div>
        {/* Draft Lab UI */}
        {enableTeamBuilder && <TeamBuilder />}
      </div>
    </>
  );
};

// Example 2: Arena with offline support
export const ArenaExample = () => {
  useEffect(() => {
    // Subscribe to online/offline status
    const unsubscribe = offlineService.subscribe((isOnline) => {
      if (isOnline) {
        logger.info('Arena: Connection restored');
        analytics.track('arena_connection_restored');
      } else {
        logger.warn('Arena: Connection lost');
        analytics.track('arena_connection_lost');
      }
    });

    return unsubscribe;
  }, []);

  const saveArenaMatch = async (matchData: Record<string, unknown>) => {
    if (!offlineService.isConnected()) {
      // Queue for later
      const requestId = offlineService.queueRequest(
        '/api/arena/save',
        'POST',
        matchData as any // Type assertion for offline service compatibility
      );

      logger.info('Arena match queued', { requestId });
      return;
    }

    // Save immediately
    await fetch('/api/arena/save', {
      method: 'POST',
      body: JSON.stringify(matchData),
    });

    // Type-safe analytics tracking
    const duration = typeof matchData.duration === 'number' ? matchData.duration : 0;
    const winner = (matchData.winner === 'blue' || matchData.winner === 'red') ? matchData.winner : undefined;
    if (winner) {
      analytics.trackArenaMatch(duration, winner);
    }
  };

  return <div>{/* Arena UI */}</div>;
};

// Example 3: Settings with analytics opt-out
export const SettingsExample = () => {
  const [hasOptedOut, setHasOptedOut] = useState(
    analytics.hasOptedOut()
  );

  const toggleAnalytics = () => {
    if (hasOptedOut) {
      analytics.optIn();
      setHasOptedOut(false);
      logger.info('User opted in to analytics');
    } else {
      analytics.optOut();
      setHasOptedOut(true);
      logger.info('User opted out of analytics');
    }
  };

  return (
    <div>
      <h2>Privacy Settings</h2>
      <label>
        <input
          type="checkbox"
          checked={!hasOptedOut}
          onChange={toggleAnalytics}
        />
        Enable Analytics
      </label>
    </div>
  );
};

// Helper Components (referenced above)
const TeamBuilder = () => <div>Team Builder Component</div>;
const ErrorBoundary: React.FC<{
  children: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}> = ({ children }) => <>{children}</>;

