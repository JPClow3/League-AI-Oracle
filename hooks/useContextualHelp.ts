import { useState, useCallback } from 'react';
import { safeGetLocalStorage, safeSetLocalStorage } from '../lib/draftUtils';

const SHOWN_TOOLTIPS_KEY = 'contextualHelp_shownTooltips';

interface ShownTooltips {
  [key: string]: boolean;
}

/**
 * Hook to track shown tooltips in localStorage
 * Prevents showing the same tooltip multiple times
 */
export const useContextualHelp = () => {
  // Use lazy initialization to avoid setState in effect
  const [shownTooltips, setShownTooltips] = useState<ShownTooltips>(() => {
    try {
      const stored = safeGetLocalStorage(SHOWN_TOOLTIPS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as ShownTooltips;
        return parsed || {};
      }
    } catch (error) {
      console.error('Failed to load shown tooltips:', error);
    }
    return {};
  });

  /**
   * Check if a tooltip has been shown
   */
  const hasBeenShown = useCallback(
    (tooltipId: string): boolean => {
      return shownTooltips[tooltipId] === true;
    },
    [shownTooltips]
  );

  /**
   * Mark a tooltip as shown
   */
  const markAsShown = useCallback((tooltipId: string) => {
    setShownTooltips(prev => {
      const updated = { ...prev, [tooltipId]: true };
      // Save to localStorage
      try {
        safeSetLocalStorage(SHOWN_TOOLTIPS_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to save shown tooltips:', error);
      }
      return updated;
    });
  }, []);

  /**
   * Reset all shown tooltips (for testing/debugging)
   */
  const resetShownTooltips = useCallback(() => {
    setShownTooltips({});
    try {
      safeSetLocalStorage(SHOWN_TOOLTIPS_KEY, JSON.stringify({}));
    } catch (error) {
      console.error('Failed to reset shown tooltips:', error);
    }
  }, []);

  return {
    hasBeenShown,
    markAsShown,
    resetShownTooltips,
  };
};
