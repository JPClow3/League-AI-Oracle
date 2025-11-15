import { useState, useCallback } from 'react';
import { safeGetLocalStorage, safeSetLocalStorage } from '../lib/draftUtils';

const SEARCH_HISTORY_KEY = 'searchHistory';
const MAX_HISTORY_LENGTH = 10;

/**
 * Hook to manage search history (last 10 searches)
 * Stores search terms in localStorage
 */
export const useSearchHistory = () => {
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      const stored = safeGetLocalStorage(SEARCH_HISTORY_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as string[];
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch (error) {
      console.error('Failed to load search history:', error);
    }
    return [];
  });

  /**
   * Add a search term to history
   * Removes duplicates and keeps only last 10
   */
  const addToHistory = useCallback((searchTerm: string) => {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return;
    }

    const trimmed = searchTerm.trim();
    setSearchHistory(prev => {
      const updated = [trimmed, ...prev.filter(term => term.toLowerCase() !== trimmed.toLowerCase())].slice(
        0,
        MAX_HISTORY_LENGTH
      );
      try {
        safeSetLocalStorage(SEARCH_HISTORY_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to save search history:', error);
      }
      return updated;
    });
  }, []);

  /**
   * Clear search history
   */
  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    try {
      safeSetLocalStorage(SEARCH_HISTORY_KEY, JSON.stringify([]));
    } catch (error) {
      console.error('Failed to clear search history:', error);
    }
  }, []);

  /**
   * Get recent searches (limited to count)
   */
  const getRecentSearches = useCallback(
    (limit: number = MAX_HISTORY_LENGTH): string[] => {
      return searchHistory.slice(0, limit);
    },
    [searchHistory]
  );

  return {
    searchHistory,
    addToHistory,
    clearHistory,
    getRecentSearches,
  };
};
