import type { DraftState, SavedDraft, Champion, DraftSlot, SavedTeamState, ChampionLite, TeamSide } from '../types';
import toast from 'react-hot-toast';

// --- Hardened LocalStorage Utilities ---
const QUOTA_EXCEEDED_MESSAGE = "Could not save data. Your browser's storage may be full or disabled. Please clear some space and try again.";

export const safeSetLocalStorage = (key: string, value: string): boolean => {
    try {
        localStorage.setItem(key, value);
        return true;
    } catch (e) {
        if (e instanceof DOMException && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
            console.error(`LocalStorage quota exceeded for key: ${key}`, e);
            toast.error(QUOTA_EXCEEDED_MESSAGE);
        } else {
            console.error(`Failed to set localStorage for key: ${key}`, e);
            toast.error("An unexpected error occurred while saving data.");
        }
        return false;
    }
};

export const safeGetLocalStorage = (key: string): string | null => {
    try {
        return localStorage.getItem(key);
    } catch (e) {
        console.error(`Failed to get localStorage for key: ${key}`, e);
        return null;
    }
};

export const safeRemoveLocalStorage = (key: string) => {
    try {
        localStorage.removeItem(key);
    } catch (e) {
        console.error(`Failed to remove localStorage for key: ${key}`, e);
    }
};
// --- End Hardened LocalStorage Utilities ---

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
 * by looking up champion details from the provided champion list.
 * @param savedDraft The lightweight SavedDraft object from storage.
 * @param champions The full list of champion data.
 * @returns A full, up-to-date DraftState object.
 */
export const fromSavedDraft = (savedDraft: SavedDraft, champions: Champion[]): DraftState => {
    const findChamp = (id: string | null): Champion | null => id ? champions.find(c => c.id === id) || null : null;
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
 * @param championsLite The lightweight list of all champions.
 * @returns An array of ChampionLite objects that have not been picked or banned.
 */
export const getAvailableChampions = (draftState: DraftState, championsLite: ChampionLite[]): ChampionLite[] => {
    const allPicksAndBans = [
        ...draftState.blue.picks, ...draftState.red.picks, ...draftState.blue.bans, ...draftState.red.bans
    ];
    const pickedIds = new Set(allPicksAndBans.filter(s => s.champion).map(s => s.champion!.id));
    return championsLite.filter(c => !pickedIds.has(c.id));
};

/**
 * Returns a new DraftState with an updated champion in a specific slot.
 * This is a pure function that does not mutate the original state.
 * @param draftState The current draft state.
 * @param team The team side ('blue' or 'red').
 * @param type The slot type ('pick' or 'ban').
 * @param index The index of the slot to update.
 * @param champion The champion to place in the slot (or null to clear).
 * @returns A new, updated DraftState object.
 */
export const updateSlotInDraft = (
    draftState: DraftState, 
    team: TeamSide, 
    type: 'pick' | 'ban', 
    index: number, 
    champion: Champion | null
): DraftState => {
    const isPick = type === 'pick';
    const teamState = draftState[team];
    const targetArray = isPick ? teamState.picks : teamState.bans;

    // Create a new array with the updated slot
    const newArray = targetArray.map((slot, i) =>
        i === index ? { ...slot, champion } : slot
    );

    // Return a new state object with the changes applied
    return {
        ...draftState,
        [team]: {
          ...teamState,
          [isPick ? 'picks' : 'bans']: newArray,
        },
    };
};