import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import * as React from 'react';
import type { Settings } from '../types';
import toast from 'react-hot-toast';
import * as storageService from '../services/storageService';

const defaultSettings: Settings = {
  theme: 'dark',
  primaryRole: 'All',
  secondaryRole: 'All',
  favoriteChampions: [],
  language: 'en',
  enableSound: false,
  dashboardCards: [
    { id: 'trial', enabled: true },
    { id: 'playbook', enabled: true },
    { id: 'draft-lab', enabled: true },
  ],
};

const SETTINGS_STORAGE_KEY = 'userSettings';

interface SettingsContextType {
  settings: Settings;
  setSettings: (settings: Partial<Settings>) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

/**
 * Provides application settings to its children components.
 * Manages state for user preferences like theme, language, and gameplay roles.
 * Persists settings to localStorage and syncs across tabs.
 */
export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [settings, setSettingsState] = useState<Settings>(defaultSettings);

  const loadSettings = useCallback(() => {
    try {
      const storedSettings = storageService.getSettings();
      if (storedSettings) {
        // Merge dashboard cards to handle new additions in updates
        const defaultCards = defaultSettings.dashboardCards;
        const storedCards = storedSettings.dashboardCards || [];
        const mergedCards = defaultCards.map(defaultCard => {
          const storedCard = storedCards.find(c => c.id === defaultCard.id);
          return storedCard !== undefined ? storedCard : defaultCard;
        });

        setSettingsState({ ...defaultSettings, ...storedSettings, dashboardCards: mergedCards });
      } else {
        setSettingsState(defaultSettings);
      }
    } catch (error) {
      console.error('Failed to parse settings from storage', error);
      toast.error('Your settings were corrupted and have been reset.');
      storageService.saveSettings(defaultSettings); // Reset to default
      setSettingsState(defaultSettings);
    }
  }, []);

  // Load settings on initial mount and listen for cross-tab changes
  useEffect(() => {
    // Use setTimeout to avoid setState in effect
    const timeoutId = setTimeout(() => {
      loadSettings();
    }, 0);

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === SETTINGS_STORAGE_KEY && event.newValue) {
        try {
          const newSettings = JSON.parse(event.newValue);
          setSettingsState(prev => ({ ...prev, ...newSettings }));
          console.log('[Settings] Synced from another tab');
        } catch (error) {
          console.error('[Settings] Failed to parse cross-tab settings:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadSettings]);

  // Save settings whenever they change
  useEffect(() => {
    storageService.saveSettings(settings);
  }, [settings]);

  const setSettings = (newSettings: Partial<Settings>) => {
    setSettingsState(prev => ({ ...prev, ...newSettings }));
  };

  const contextValue = useMemo(() => ({ settings, setSettings }), [settings]);

  // FIX: Replaced JSX with React.createElement because this is a .ts file, not a .tsx file.
  return React.createElement(SettingsContext.Provider, { value: contextValue }, children);
};

/**
 * Custom hook to access and manage application settings.
 * Must be used within a SettingsProvider.
 * @returns The settings context, including the current settings object and a function to update them.
 */
export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
