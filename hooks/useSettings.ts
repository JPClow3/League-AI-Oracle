import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { Settings, Theme } from '../types';
import { ROLES } from '../constants';
import toast from 'react-hot-toast';

const defaultSettings: Settings = {
    primaryRole: 'All',
    secondaryRole: 'All',
    favoriteChampions: [],
    theme: 'cyan',
};

const SETTINGS_STORAGE_KEY = 'userSettings';

interface SettingsContextType {
    settings: Settings;
    setSettings: (settings: Partial<Settings>) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [settings, setSettingsState] = useState<Settings>(defaultSettings);

    const loadSettings = useCallback(() => {
        try {
            const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
            if (storedSettings) {
                setSettingsState({ ...defaultSettings, ...JSON.parse(storedSettings) });
            } else {
                setSettingsState(defaultSettings);
            }
        } catch (error) {
            console.error('Failed to parse settings from localStorage', error);
            toast.error('Your settings were corrupted and have been reset.');
            localStorage.removeItem(SETTINGS_STORAGE_KEY);
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
        try {
            localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
        } catch (error) {
            console.error('Failed to save settings to localStorage', error);
            toast.error("Could not save settings. Your browser's storage may be full.");
        }
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

export const useSettings = (): SettingsContextType => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};