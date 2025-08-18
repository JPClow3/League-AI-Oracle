import type { DraftState, SavedDraft, Champion, DraftSlot, SavedTeamState, ChampionLite } from '../types';
import { CHAMPIONS, CHAMPIONS_LITE } from '../constants';

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

/**
 * Calculates the list of available champions based on the current draft state.
 * @param draftState The current DraftState object.
 * @returns An array of ChampionLite objects that have not been picked or banned.
 */
export const getAvailableChampions = (draftState: DraftState): ChampionLite[] => {
    const allPicksAndBans = [
        ...draftState.blue.picks, ...draftState.red.picks, ...draftState.blue.bans, ...draftState.red.bans
    ];
    const pickedIds = new Set(allPicksAndBans.filter(s => s.champion).map(s => s.champion!.id));
    return CHAMPIONS_LITE.filter(c => !pickedIds.has(c.id));
};