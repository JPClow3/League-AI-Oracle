/**
 * Safe localStorage utilities with quota handling
 * Prevents app crashes when storage is full
 */

import toast from 'react-hot-toast';

/**
 * Safely set item in localStorage with automatic quota management
 * @param key - Storage key
 * @param value - Value to store (will be stringified if object)
 * @param showToast - Whether to show toast notifications (default: true)
 * @returns boolean - true if successful, false if failed
 */
export const safeSetLocalStorage = (
    key: string,
    value: string | object,
    showToast: boolean = true
): boolean => {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);

    try {
        localStorage.setItem(key, stringValue);
        return true;
    } catch (error) {
        // Handle quota exceeded error
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
            console.warn('[Storage] Quota exceeded, attempting to free space...');

            // Try to free space by removing cache and temp entries
            const keysToRemove: string[] = [];
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (k && (k.startsWith('cache_') || k.startsWith('temp_') || k.startsWith('old_'))) {
                    keysToRemove.push(k);
                }
            }

            // Remove up to 10 old entries
            keysToRemove.slice(0, 10).forEach(k => {
                try {
                    localStorage.removeItem(k);
                } catch (e) {
                    console.error('Failed to remove key:', k, e);
                }
            });

            // Try again after cleanup
            try {
                localStorage.setItem(key, stringValue);
                if (showToast) {
                    toast.success('Storage was full. Cleared old data and saved successfully.');
                }
                return true;
            } catch (retryError) {
                console.error('[Storage] Failed even after cleanup:', retryError);
                if (showToast) {
                    toast.error('Storage is full. Please clear some data in your browser settings.');
                }
                return false;
            }
        }

        // Other errors
        console.error('[Storage] Error setting localStorage:', error);
        if (showToast) {
            toast.error('Failed to save data');
        }
        return false;
    }
};

/**
 * Safely get item from localStorage with error handling
 * @param key - Storage key
 * @returns string | null - The stored value or null if not found/error
 */
export const safeGetLocalStorage = (key: string): string | null => {
    try {
        return localStorage.getItem(key);
    } catch (error) {
        console.error('[Storage] Error reading localStorage:', error);
        return null;
    }
};

/**
 * Safely get and parse JSON from localStorage
 * @param key - Storage key
 * @returns T | null - Parsed object or null if not found/invalid
 */
export const safeGetLocalStorageJSON = <T = any>(key: string): T | null => {
    try {
        const value = localStorage.getItem(key);
        if (!value) return null;
        return JSON.parse(value) as T;
    } catch (error) {
        console.error('[Storage] Error parsing localStorage JSON:', error);
        return null;
    }
};

/**
 * Safely remove item from localStorage
 * @param key - Storage key
 * @returns boolean - true if successful
 */
export const safeRemoveLocalStorage = (key: string): boolean => {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error('[Storage] Error removing from localStorage:', error);
        return false;
    }
};

/**
 * Get localStorage usage statistics
 * @returns Object with size info
 */
export const getStorageStats = (): {
    used: number;
    total: number;
    percentUsed: number;
    itemCount: number;
} => {
    let used = 0;
    let itemCount = 0;

    try {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key) {
                const value = localStorage.getItem(key);
                if (value) {
                    used += key.length + value.length;
                    itemCount++;
                }
            }
        }
    } catch (error) {
        console.error('[Storage] Error calculating storage stats:', error);
    }

    // Most browsers have 5-10MB limit, we'll estimate 5MB
    const total = 5 * 1024 * 1024; // 5MB in bytes
    const percentUsed = (used / total) * 100;

    return {
        used,
        total,
        percentUsed: Math.round(percentUsed * 100) / 100,
        itemCount
    };
};

/**
 * Clear old cache entries to free space
 * @param maxAge - Maximum age in milliseconds (default: 7 days)
 * @returns number - Count of items removed
 */
export const clearOldCache = (maxAge: number = 7 * 24 * 60 * 60 * 1000): number => {
    let removed = 0;
    const now = Date.now();
    const keysToRemove: string[] = [];

    try {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('cache_')) {
                try {
                    const value = localStorage.getItem(key);
                    if (value) {
                        const data = JSON.parse(value);
                        if (data.timestamp && (now - data.timestamp > maxAge)) {
                            keysToRemove.push(key);
                        }
                    }
                } catch (e) {
                    // Corrupted entry, mark for removal
                    keysToRemove.push(key);
                }
            }
        }

        keysToRemove.forEach(key => {
            localStorage.removeItem(key);
            removed++;
        });

        if (removed > 0) {
            console.log(`[Storage] Cleared ${removed} old cache entries`);
        }
    } catch (error) {
        console.error('[Storage] Error clearing old cache:', error);
    }

    return removed;
};

