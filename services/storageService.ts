import { db, SafeStorage } from '../lib/indexedDb';
import { safeGetLocalStorage, safeSetLocalStorage, safeRemoveLocalStorage } from '../lib/draftUtils';
import type { UserProfile, Settings } from '../types';

const SETTINGS_STORAGE_KEY = 'userSettings';
const USER_PROFILE_ID = 'currentUser';
const CACHE_PREFIX = 'cache_';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

// --- User Profile (IndexedDB with fallback) ---

export const getUserProfile = async (): Promise<UserProfile | undefined> => {
    try {
        if (db) {
            return await db.userProfile.get(USER_PROFILE_ID);
        } else {
            // Fallback to SafeStorage
            return await SafeStorage.get(USER_PROFILE_ID);
        }
    } catch (error) {
        console.error('Failed to get user profile:', error instanceof Error ? error.message : 'Unknown error');
        return undefined;
    }
};

export const saveUserProfile = async (profile: UserProfile): Promise<void> => {
    try {
        if (db) {
            await db.userProfile.put(profile);
        } else {
            // Fallback to SafeStorage
            await SafeStorage.set(USER_PROFILE_ID, profile);
        }
    } catch (error) {
        console.error('Failed to save user profile:', error instanceof Error ? error.message : 'Unknown error');
        throw error;
    }
};

// --- Settings (LocalStorage) ---

export const getSettings = (): Settings | null => {
    const stored = safeGetLocalStorage(SETTINGS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
};

export const saveSettings = (settings: Settings): void => {
    safeSetLocalStorage(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
};


// --- Caching (LocalStorage) ---

interface CacheEntry<T> {
    timestamp: number;
    version: string;
    data: T;
}

export const getCache = <T>(key: string, version: string): T | null => {
    const cachedItem = safeGetLocalStorage(`${CACHE_PREFIX}${key}`);
    if (cachedItem) {
        try {
            const entry = JSON.parse(cachedItem) as CacheEntry<T>;
            const isCacheValid = (Date.now() - entry.timestamp < CACHE_TTL_MS) && entry.version === version;
            if (isCacheValid) {
                console.log(`[Cache] HIT for ${key}`);
                return entry.data;
            }
        } catch (e) {
            console.warn(`[Cache] Failed to parse cache for ${key}. Refetching.`, e);
            safeRemoveLocalStorage(`${CACHE_PREFIX}${key}`);
        }
    }
    console.log(`[Cache] MISS for ${key}.`);
    return null;
};

export const setCache = <T>(key: string, data: T, version: string): void => {
    const newEntry: CacheEntry<T> = {
        timestamp: Date.now(),
        version: version,
        data,
    };
    safeSetLocalStorage(`${CACHE_PREFIX}${key}`, JSON.stringify(newEntry));
};

export const evictExpiredCache = (): void => {
    console.log('[Cache] Running eviction check...');
    let evictedCount = 0;
    try {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.startsWith(CACHE_PREFIX) || key.startsWith('championAnalysis_'))) { // Also clean up old cache
                try {
                    const item = safeGetLocalStorage(key);
                    if (item) {
                        const entry = JSON.parse(item) as CacheEntry<unknown>;
                        if (!entry.timestamp || (Date.now() - entry.timestamp >= CACHE_TTL_MS)) {
                            safeRemoveLocalStorage(key);
                            evictedCount++;
                        }
                    }
                } catch (e) {
                    console.warn(`[Cache] Error processing key ${key} for eviction. Removing.`, e);
                    safeRemoveLocalStorage(key); // Remove corrupted entries
                    evictedCount++;
                }
            }
        }
    } catch (e) {
        console.error("Could not iterate localStorage for cache eviction.", e);
    }

    if (evictedCount > 0) {
        console.log(`[Cache] Evicted ${evictedCount} expired or invalid items.`);
    }
};

// Generic Fetch with Cache wrapper using the service
export async function fetchWithCache<T>(
    cacheKey: string,
    fetcher: () => Promise<T>,
    version: string,
    signal?: AbortSignal
): Promise<T> {
    const cachedData = getCache<T>(cacheKey, version);
    if (cachedData) {
        return cachedData;
    }

    signal?.throwIfAborted();
    const data = await fetcher();
    signal?.throwIfAborted();
    
    setCache(cacheKey, data, version);

    return data;
}