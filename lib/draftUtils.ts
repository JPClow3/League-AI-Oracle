import type { DraftState, SavedDraft, Champion, DraftSlot, SavedTeamState } from '../types';
import { CHAMPIONS } from '../constants';

/**
 * Converts a full DraftState object into a lightweight SavedDraft object containing only champion IDs.
 * @param draftState The full DraftState object.
 * @returns A SavedDraft object for safe storage.
 */
export const toSavedDraft = (draftState: DraftState): SavedDraft => {
    const mapSlots = (slots: DraftSlot[]): (string | null)[] => slots.map(s => s.champion?.id || null);
    
    return {
        blue: {
            picks: mapSlots(draftState.blue.picks),
            bans: mapSlots(draftState.blue.bans),
        },
        red: {
            picks: mapSlots(draftState.red.picks),
            bans: mapSlots(draftState.red.bans),
        },
        turn: draftState.turn,
        phase: draftState.phase,
    };
};

/**
 * Re-hydrates a lightweight SavedDraft object back into a full DraftState object
 * by looking up champion details from the central CHAMPIONS constant.
 * @param savedDraft The lightweight SavedDraft object from storage.
 * @returns A full, up-to-date DraftState object.
 */
export const fromSavedDraft = (savedDraft: SavedDraft): DraftState => {
    const findChamp = (id: string | null): Champion | null => id ? CHAMPIONS.find(c => c.id === id) || null : null;
    const mapSlots = (ids: (string | null)[]): DraftSlot[] => ids.map(id => ({ champion: findChamp(id), isActive: false }));
    
    return {
        blue: {
            picks: mapSlots(savedDraft.blue.picks),
            bans: mapSlots(savedDraft.blue.bans),
        },
        red: {
            picks: mapSlots(savedDraft.red.picks),
            bans: mapSlots(savedDraft.red.bans),
        },
        turn: savedDraft.turn,
        phase: savedDraft.phase,
    };
};