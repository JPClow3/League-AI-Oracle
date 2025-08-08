import { DDragonData } from '../types';

const DB_NAME = 'DraftWiseDB_v1';
const STORE_NAME = 'DDragonStore';
const DB_VERSION = 1;

let db: IDBDatabase | null = null;

const initDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        if (db) {
            return resolve(db);
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            console.error('IndexedDB error:', request.error);
            reject('Error opening DB');
        };

        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const tempDb = (event.target as IDBOpenDBRequest).result;
            if (!tempDb.objectStoreNames.contains(STORE_NAME)) {
                tempDb.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };
    });
};

const getStore = (mode: IDBTransactionMode) => {
    if (!db) throw new Error("DB not initialized");
    const transaction = db.transaction(STORE_NAME, mode);
    return transaction.objectStore(STORE_NAME);
};

export const dbService = {
    async setDDragonData(version: string, data: DDragonData): Promise<void> {
        await initDB();
        return new Promise((resolve, reject) => {
            const store = getStore('readwrite');
            const request = store.put({ id: 'ddragon', version, data });
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    },

    async getDDragonData(): Promise<{ version: string; data: DDragonData } | null> {
        await initDB();
        return new Promise((resolve, reject) => {
            const store = getStore('readonly');
            const request = store.get('ddragon');
            request.onsuccess = () => {
                resolve(request.result || null);
            };
            request.onerror = () => reject(request.error);
        });
    }
};