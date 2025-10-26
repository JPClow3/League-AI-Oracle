import { useState, useEffect } from 'react';
import { featureFlags, FeatureFlags } from '../lib/featureFlags';

/**
 * Hook to access feature flags in components
 */
export function useFeatureFlags() {
  const [flags, setFlags] = useState<FeatureFlags>(featureFlags.getAllFlags());

  useEffect(() => {
    // Subscribe to flag changes
    const unsubscribe = featureFlags.subscribe((newFlags) => {
      setFlags(newFlags);
    });

    return unsubscribe;
  }, []);

  return {
    flags,
    isEnabled: (key: keyof FeatureFlags) => featureFlags.isEnabled(key),
    setFlag: (key: keyof FeatureFlags, value: boolean) => featureFlags.setFlag(key, value),
    resetFlags: () => featureFlags.resetFlags(),
  };
}

/**
 * Hook to check a single feature flag
 */
export function useFeatureFlag(key: keyof FeatureFlags): boolean {
  const { flags } = useFeatureFlags();
  return flags[key] === true;
}

