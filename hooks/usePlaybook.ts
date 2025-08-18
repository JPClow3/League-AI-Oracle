import { useState, useEffect, useCallback, useRef } from 'react';
import type { HistoryEntry, DraftState, AIAdvice } from '../types';
import { toSavedDraft } from '../lib/draftUtils';
import { generatePlaybookPlusDossier, generateDraftName } from '../services/geminiService';
import toast from 'react-hot-toast';
import { useUserProfile } from './useUserProfile';

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
    const [isAdding, setIsAdding] = useState(false); // State lock to prevent race conditions
    const abortControllerRef = useRef<AbortController | null>(null);
    const { completeMission, addSP } = useUserProfile();

    const loadEntries = useCallback(() => {
        setIsLoading(true);
        try {
            const savedData = JSON.parse(localStorage.getItem(PLAYBOOK_STORAGE_KEY) || '[]');
            if (Array.isArray(savedData)) {
                // Clean up any stale pending entries from previous sessions
                const validEntries = savedData.filter(isHistoryEntry).filter(e => e.status !== 'pending');
                validEntries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                setEntries(validEntries);
            } else {
                setEntries([]);
            }
        } catch (error) {
            console.error("Failed to parse playbook from localStorage:", error);
            toast.error("Could not load The Archives data. It may be corrupted.");
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
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            abortControllerRef.current?.abort();
        };
    }, [loadEntries]);

    const addEntry = async (name: string, draftState: DraftState, analysis: AIAdvice | null, userNotes?: string): Promise<boolean> => {
        if (isAdding) {
            toast.error("Please wait for the current save to complete.");
            return false;
        }
        setIsAdding(true);

        const tempId = `temp-${Date.now()}`;
        const newEntry: HistoryEntry = {
            id: tempId,
            name,
            draft: toSavedDraft(draftState),
            analysis: analysis,
            userNotes: userNotes || '',
            createdAt: new Date().toISOString(),
            status: 'pending',
        };

        // Optimistically update UI and save pending state
        setEntries(prevEntries => {
            const updatedEntries = [newEntry, ...prevEntries];
            try {
                localStorage.setItem(PLAYBOOK_STORAGE_KEY, JSON.stringify(updatedEntries));
            } catch (e) { console.error(e); }
            return updatedEntries;
        });
        toast.success(`Archiving "${name}"...`);
        
        // Generate dossier in the background
        const controller = new AbortController();
        abortControllerRef.current = controller;

        try {
            const dossier = await generatePlaybookPlusDossier(draftState, controller.signal);
            if (controller.signal.aborted) {
                setIsAdding(false);
                return false;
            }
            
            const finalEntry: HistoryEntry = {
                ...newEntry,
                id: new Date().toISOString(), // Use final timestamp as ID
                dossier,
                status: 'saved',
            };

            setEntries(prev => {
                const updated = prev.map(e => e.id === tempId ? finalEntry : e);
                try {
                    localStorage.setItem(PLAYBOOK_STORAGE_KEY, JSON.stringify(updated));
                } catch (e) { console.error(e); }
                return updated;
            });
            
            toast.success('Strategic Dossier generated!');
            completeMission('gs3');
            completeMission('w2');
            
            if (analysis) { // It's a Draft Lab save
                 // No SP reward here, it's tied to analysis
            } else { // It's an Arena save
                addSP(25, "Saved Arena Draft");
            }
            return true;
        } catch (err) {
            if (err instanceof DOMException && err.name === 'AbortError') {
                console.log("Dossier generation aborted.");
                // Clean up the pending entry
                setEntries(prev => prev.filter(e => e.id !== tempId));
                return false;
            }
            console.error("Failed to generate dossier:", err);
            toast.error("Failed to generate AI dossier for the draft.");
            setEntries(prev => {
                const updated = prev.map((e): HistoryEntry => e.id === tempId ? { ...e, status: 'error' } : e);
                 try {
                    localStorage.setItem(PLAYBOOK_STORAGE_KEY, JSON.stringify(updated));
                } catch (e) { console.error(e); }
                return updated;
            });
            return false;
        } finally {
            setIsAdding(false);
        }
    };
    
    const deleteEntry = (id: string): void => {
        const entryToDelete = entries.find(e => e.id === id);
        if (!entryToDelete) return;
        
        const updatedEntries = entries.filter(entry => entry.id !== id);
        try {
            localStorage.setItem(PLAYBOOK_STORAGE_KEY, JSON.stringify(updatedEntries));
            setEntries(updatedEntries);
            toast.success(`Strategy "${entryToDelete.name}" deleted.`);
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
        } catch(err) {
            console.error("Failed to update playbook notes in localStorage:", err);
            toast.error("Could not save notes. Your browser's storage may be full or disabled.");
        }
    };

    return { entries, isLoading, addEntry, deleteEntry, updateNotes, latestEntry: entries[0] };
};