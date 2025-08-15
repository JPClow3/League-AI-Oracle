import { useState, useEffect, useCallback } from 'react';
import type { HistoryEntry, DraftState, AIAdvice } from '../types';
import { toSavedDraft } from '../lib/draftUtils';
import toast from 'react-hot-toast';

// Type guard to ensure data from localStorage is valid.
const isHistoryEntry = (obj: any): obj is HistoryEntry => {
    return (
        typeof obj === 'object' && obj !== null && typeof obj.id === 'string' &&
        typeof obj.name === 'string' && typeof obj.createdAt === 'string' &&
        typeof obj.draft === 'object' && obj.draft.blue?.picks && Array.isArray(obj.draft.blue.picks)
    );
};

const PLAYBOOK_STORAGE_KEY = 'history';

export const usePlaybook = () => {
    const [entries, setEntries] = useState<HistoryEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadEntries = useCallback(() => {
        setIsLoading(true);
        try {
            const savedData = JSON.parse(localStorage.getItem(PLAYBOOK_STORAGE_KEY) || '[]');
            if (Array.isArray(savedData)) {
                const validEntries = savedData.filter(isHistoryEntry);
                validEntries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                setEntries(validEntries);
            } else {
                setEntries([]);
            }
        } catch (error) {
            console.error("Failed to parse playbook from localStorage:", error);
            toast.error("Could not load playbook data. It may be corrupted.");
            localStorage.removeItem(PLAYBOOK_STORAGE_KEY);
            setEntries([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadEntries();
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === PLAYBOOK_STORAGE_KEY) {
                loadEntries();
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [loadEntries]);

    const addEntry = (name: string, draftState: DraftState, analysis: AIAdvice | null, userNotes?: string): boolean => {
        const newEntry: HistoryEntry = {
            id: new Date().toISOString(),
            name,
            draft: toSavedDraft(draftState),
            analysis: analysis,
            userNotes: userNotes || '',
            createdAt: new Date().toISOString(),
        };
        try {
            const updatedEntries = [newEntry, ...entries];
            localStorage.setItem(PLAYBOOK_STORAGE_KEY, JSON.stringify(updatedEntries));
            setEntries(updatedEntries);
            toast.success(`Draft "${name}" saved to Playbook!`);
            return true;
        } catch (err) {
            console.error("Failed to save draft to localStorage:", err);
            toast.error("Could not save draft. Your browser's storage may be full.");
            return false;
        }
    };
    
    const deleteEntry = (id: string): void => {
        const entryToDelete = entries.find(e => e.id === id);
        if (!entryToDelete) return;
        
        const updatedEntries = entries.filter(entry => entry.id !== id);
        try {
            localStorage.setItem(PLAYBOOK_STORAGE_KEY, JSON.stringify(updatedEntries));
            setEntries(updatedEntries);
            toast.success(`Draft "${entryToDelete.name}" deleted.`);
        } catch(err) {
            console.error("Failed to update playbook in localStorage:", err);
            toast.error("Could not delete draft. Your browser's storage may be full or disabled.");
        }
    };
    
    const updateNotes = (id: string, notes: string): void => {
        const updatedEntries = entries.map(entry => 
            entry.id === id ? { ...entry, userNotes: notes } : entry
        );
        try {
            localStorage.setItem(PLAYBOOK_STORAGE_KEY, JSON.stringify(updatedEntries));
            setEntries(updatedEntries);
            // Don't toast here to avoid being too noisy, as it might be auto-saved.
        } catch(err) {
            console.error("Failed to update playbook notes in localStorage:", err);
            toast.error("Could not save notes. Your browser's storage may be full or disabled.");
        }
    };

    return { entries, isLoading, addEntry, deleteEntry, updateNotes, latestEntry: entries[0] };
};
