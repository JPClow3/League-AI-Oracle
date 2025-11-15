import { useCallback } from 'react';
import { useSettings } from './useSettings';

/**
 * Hook to manage champion selection history
 * Enhances the existing recentChampions in settings with additional functionality
 */
export const useChampionHistory = () => {
  const { settings, setSettings } = useSettings();

  /**
   * Add a champion to history
   * Keeps the last 10 champions, removes duplicates
   */
  const addToHistory = useCallback(
    (championId: string) => {
      setSettings({
        recentChampions: [championId, ...settings.recentChampions.filter(id => id !== championId)].slice(0, 10),
      });
    },
    [settings.recentChampions, setSettings]
  );

  /**
   * Clear champion history
   */
  const clearHistory = useCallback(() => {
    setSettings({
      recentChampions: [],
    });
  }, [setSettings]);

  /**
   * Get recent champions (limited to provided count)
   */
  const getRecentChampions = useCallback(
    (limit: number = 10): string[] => {
      return settings.recentChampions.slice(0, limit);
    },
    [settings.recentChampions]
  );

  /**
   * Check if champion is in recent history
   */
  const isRecent = useCallback(
    (championId: string): boolean => {
      return settings.recentChampions.includes(championId);
    },
    [settings.recentChampions]
  );

  return {
    recentChampions: settings.recentChampions,
    addToHistory,
    clearHistory,
    getRecentChampions,
    isRecent,
  };
};
