import Dexie, { type Table } from 'dexie';
import type { HistoryEntry } from '../types';

// Use an interface to define the database structure.
// This is a robust pattern for working with Dexie in TypeScript.
export interface IDraftWiseDB extends Dexie {
    history: Table<HistoryEntry, string>;
}

// Create the Dexie instance without casting it yet.
const dexieDb = new Dexie('DraftWiseDB');

// Define the database schema on the untyped instance.
dexieDb.version(1).stores({
    // The 'id' property of HistoryEntry is the primary key.
    // 'createdAt' is an index for efficient sorting.
    history: 'id, createdAt',
});

// Now, cast the configured instance to our interface and export it.
export const db = dexieDb as IDraftWiseDB;
