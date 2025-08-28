
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { Settings } from '../types';
import { ROLES } from '../constants';
import toast from 'react-hot-toast';
import { safeGetLocalStorage, safeRemoveLocalStorage, safeSetLocalStorage } from '../lib/draftUtils';

const defaultSettings: Settings = {
    theme: 'dark',
    primaryRole: 'All',
    secondaryRole: 'All',
    favoriteChampions: [],
    language: 'en',
    enableSound: false,
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
            const storedSettings = safeGetLocalStorage(SETTINGS_STORAGE_KEY);
            if (storedSettings) {
                setSettingsState({ ...defaultSettings, ...JSON.parse(storedSettings) });
            } else {
                setSettingsState(defaultSettings);
            }
        } catch (error) {
            console.error('Failed to parse settings from localStorage', error);
            toast.error('Your settings were corrupted and have been reset.');
            safeRemoveLocalStorage(SETTINGS_STORAGE_KEY);
            setSettingsState(defaultSettings);
        }
    }, []);

    // Load settings on initial mount and listen for cross-tab changes
    useEffect(() => {
        loadSettings();
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === SETTINGS_STORAGE_KEY) {
                loadSettings();
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [loadSettings]);

    // Save settings whenever they change
    useEffect(() => {
        safeSetLocalStorage(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    }, [settings]);

    const setSettings = (newSettings: Partial<Settings>) => {
        setSettingsState(prev => ({ ...prev, ...newSettings }));
    };

    const contextValue = useMemo(() => ({ settings, setSettings }), [settings]);

    return React.createElement(
        SettingsContext.Provider,
        { value: contextValue },
        children
    );
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
