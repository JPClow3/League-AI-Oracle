import { useState, useEffect, useRef } from 'react';
import type { HistoryEntry, DraftState, AIAdvice, TeamSide } from '../types';
import { toSavedDraft } from '../lib/draftUtils';
import { generatePlaybookPlusDossier } from '../services/geminiService';
import toast from 'react-hot-toast';
import { useUserProfile } from './useUserProfile';
import { MISSION_IDS } from '../constants';
import { db } from '../lib/indexedDb';
import type Dexie from 'dexie';

/**
 * Custom hook for managing the user's Playbook (saved draft history).
 * Handles loading, adding, deleting, and updating entries in IndexedDB.
 * Includes logic for generating AI-powered "dossiers" for new entries.
 * @returns An object containing the playbook entries, loading state, and methods to interact with the playbook.
 */
export const usePlaybook = () => {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const { completeMission, addSP } = useUserProfile();

  useEffect(() => {
    let isMounted = true; // ✅ BUG FIX: Track if component is mounted

    const loadEntries = async () => {
      if (!db) {
        console.warn('IndexedDB not available');
        return;
      }
      if (!isMounted) {
        return;
      } // Check before state update

      setIsLoading(true);
      try {
        const allEntries = await db.history.orderBy('createdAt').reverse().toArray();
        if (isMounted) {
          // ✅ Only update state if still mounted
          setEntries(allEntries);
        }
      } catch (error) {
        console.error('Failed to load playbook from IndexedDB:', error);
        if (isMounted) {
          toast.error('Could not load Archives data.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadEntries();

    // Cleanup ongoing dossier generation on component unmount
    return () => {
      isMounted = false; // ✅ Mark as unmounted
      try {
        abortControllerRef.current?.abort();
      } catch (error) {
        // Ignore abort errors during cleanup
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          console.error('Abort error during cleanup:', error);
        }
      }
    };
  }, []);

  /**
   * Adds a new entry to the playbook.
   * @param name The name for the new playbook entry.
   * @param draftState The full draft state to be saved.
   * @param analysis The AI analysis associated with the draft (if any).
   * @param userNotes Optional user-provided notes.
   * @param userSide The team the user played on.
   * @param tags Optional array of user-defined tags.
   * @returns A promise that resolves to true if the entry was successfully saved.
   */
  const addEntry = async (
    name: string,
    draftState: DraftState,
    analysis: AIAdvice | null,
    userNotes: string | undefined,
    userSide: TeamSide,
    tags: string[] = []
  ): Promise<boolean> => {
    if (!db) {
      toast.error('Storage not available');
      return false;
    }

    const tempId = `temp-${Date.now()}`;
    const newEntry: HistoryEntry = {
      id: tempId,
      name,
      draft: toSavedDraft(draftState),
      userSide,
      analysis: analysis,
      userNotes: userNotes || '',
      createdAt: new Date().toISOString(),
      status: 'pending',
      tags,
    };

    // Optimistically update UI
    setEntries(prevEntries => [newEntry, ...prevEntries]);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const dossier = analysis ? await generatePlaybookPlusDossier(draftState, userSide, controller.signal) : null;
      if (controller.signal.aborted) {
        return false;
      }

      const finalId = new Date().toISOString(); // Use final timestamp as permanent ID
      const finalEntry: HistoryEntry = {
        ...newEntry,
        id: finalId,
        dossier: dossier || undefined,
        status: 'saved',
      };
      // Replace temp with final entry atomically
      await (db as Dexie).transaction('rw', db!.history, async () => {
        await db!.history.delete(tempId);
        await db!.history.add(finalEntry);
      });

      setEntries(prev => [finalEntry, ...prev.filter(e => e.id !== tempId)]);

      if (dossier) {
        toast.success('Strategic Dossier generated!');
        addSP(50, 'Archived Lab Strategy'); // Award SP for successful lab save + dossier
      } else {
        toast.success(`Strategy "${name}" saved to Archives.`);
        addSP(25, 'Saved Arena Draft');
      }

      completeMission(MISSION_IDS.GETTING_STARTED.SAVE_STRATEGY);
      completeMission(MISSION_IDS.WEEKLY.EXPAND_PLAYBOOK);

      return true;
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        console.log('Dossier generation aborted.');
        // Clean up the optimistic entry from UI and DB
        setEntries(prev => prev.filter(e => e.id !== tempId));
        if (db) {
          await db.history.delete(tempId);
        }
        return false;
      }
      console.error('Failed to generate dossier:', err);
      toast.error('Failed to generate AI dossier for the draft.');

      // Mark the entry as failed but keep it for user to retry/delete
      const errorEntry: HistoryEntry = { ...newEntry, status: 'error' };
      if (db) {
        await db.history.put(errorEntry);
      }
      setEntries(prev => prev.map(e => (e.id === tempId ? errorEntry : e)));
      return false;
    }
  };

  /**
   * Deletes an entry from the playbook by its ID.
   * @param id The ID of the entry to delete.
   */
  const deleteEntry = async (id: string): Promise<void> => {
    if (!db) {
      toast.error('Storage not available');
      return;
    }

    const entryToDelete = entries.find(e => e.id === id);
    if (!entryToDelete) {
      return;
    }

    await db.history.delete(id);
    setEntries(prev => prev.filter(entry => entry.id !== id));
    toast.success(`Strategy "${entryToDelete.name}" deleted.`);
  };

  /**
   * Updates a specific playbook entry with new data.
   * @param id The ID of the entry to update.
   * @param updates A partial HistoryEntry object with the fields to update.
   */
  const updateEntry = async (id: string, updates: Partial<Omit<HistoryEntry, 'id'>>): Promise<void> => {
    if (!db) {
      toast.error('Storage not available');
      return;
    }

    await db.history.update(id, updates);
    setEntries(prev => prev.map(entry => (entry.id === id ? { ...entry, ...updates } : entry)));
  };

  return { entries, isLoading, addEntry, deleteEntry, updateEntry, latestEntry: entries[0] };
};
