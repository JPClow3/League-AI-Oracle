/**
 * Hook for haptic feedback on mobile devices
 * Uses the Vibration API when available, no-op otherwise
 */

/**
 * Trigger haptic feedback
 * @param pattern - Vibration pattern (default: light tap - 10ms)
 */
export const triggerHaptic = (pattern: number | number[] = 10): void => {
  if (typeof navigator === 'undefined' || !navigator.vibrate) {
    return; // Not supported or not available
  }

  try {
    navigator.vibrate(pattern);
  } catch {
    // Silently fail if vibration fails (e.g., user denied permission)
    // Error is intentionally ignored for graceful degradation
  }
};

/**
 * Light haptic feedback (tap)
 */
export const hapticLight = () => triggerHaptic(10);

/**
 * Medium haptic feedback (double tap)
 */
export const hapticMedium = () => triggerHaptic([10, 20, 10]);

/**
 * Strong haptic feedback (triple tap)
 */
export const hapticStrong = () => triggerHaptic([20, 30, 20, 30, 20]);

/**
 * Hook to use haptic feedback in components
 */
export const useHapticFeedback = () => {
  return {
    trigger: triggerHaptic,
    light: hapticLight,
    medium: hapticMedium,
    strong: hapticStrong,
  };
};
