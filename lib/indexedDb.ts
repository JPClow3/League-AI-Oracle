import Dexie, { type Table } from 'dexie';
import type { HistoryEntry, UserProfile } from '../types';

// Use an interface to define the database structure.
// This is a robust pattern for working with Dexie in TypeScript.
export interface IDraftWiseDB extends Dexie {
    history: Table<HistoryEntry, string>;
    userProfile: Table<UserProfile, string>;
}

/**
 * Checks if IndexedDB is supported in the current browser.
 * @returns True if IndexedDB is available
 */
export function isIndexedDBSupported(): boolean {
    if (typeof window === 'undefined') {return false;}

    try {
        return 'indexedDB' in window && window.indexedDB !== null;
    } catch (e) {
        return false;
    }
}

/**
 * Initializes the IndexedDB connection with feature detection.
 * Falls back gracefully if IndexedDB is not supported.
 */
function initializeDB(): IDraftWiseDB | null {
    if (!isIndexedDBSupported()) {
        console.warn('IndexedDB is not supported in this browser. Data persistence will be limited.');
        return null;
    }

    try {
        // Create the Dexie instance without casting it yet.
        const dexieDb = new Dexie('DraftWiseDB');

        // Define the database schema on the untyped instance.
        // Bumping version to 3 to introduce the tags index.
        dexieDb.version(3).stores({
            // The 'id' property of HistoryEntry is the primary key.
            // 'createdAt' is an index for efficient sorting.
            // '*tags' is a multi-entry index for tag-based filtering.
            history: 'id, createdAt, *tags',
            // '&id' specifies that 'id' is the primary key for the userProfile table.
            userProfile: '&id',
        });

        // Now, cast the configured instance to our interface and export it.
        return dexieDb as IDraftWiseDB;
    } catch (error) {
        console.error('Failed to initialize IndexedDB:', error instanceof Error ? error.message : 'Unknown error');
        return null;
    }
}

export const db = initializeDB();

/**
 * Provides a safe wrapper for IndexedDB operations with fallback to localStorage.
 */
export class SafeStorage {
    /**
     * Stores data in IndexedDB if available, otherwise falls back to localStorage.
     */
    static async set(key: string, value: any): Promise<void> {
        if (db) {
            try {
                // Use IndexedDB
                await db.userProfile.put({ id: key, ...value });
            } catch (error) {
                console.warn('IndexedDB write failed, falling back to localStorage:', error instanceof Error ? error.message : 'Unknown error');
                this.setLocalStorage(key, value);
            }
        } else {
            this.setLocalStorage(key, value);
        }
    }

    /**
     * Retrieves data from IndexedDB if available, otherwise falls back to localStorage.
     */
    static async get(key: string): Promise<any> {
        if (db) {
            try {
                return await db.userProfile.get(key);
            } catch (error) {
                console.warn('IndexedDB read failed, falling back to localStorage:', error instanceof Error ? error.message : 'Unknown error');
                return this.getLocalStorage(key);
            }
        } else {
            return this.getLocalStorage(key);
        }
    }

    private static setLocalStorage(key: string, value: any): void {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('localStorage write failed:', error);
        }
    }

    private static getLocalStorage(key: string): any {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('localStorage read failed:', error);
            return null;
        }
    }
}

