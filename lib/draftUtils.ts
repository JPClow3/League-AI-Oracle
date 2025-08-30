import type { DraftState, SavedDraft, Champion, DraftSlot, SavedTeamState, ChampionLite, TeamSide, Ability } from '../types';
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

/**
 * Swaps two champions within a team's pick order.
 * This is a pure function that does not mutate the original state.
 * @param draftState The current draft state.
 * @param team The team side ('blue' or 'red').
 * @param sourceIndex The index of the first champion to swap.
 * @param destinationIndex The index of the second champion to swap.
 * @returns A new, updated DraftState object with the champions swapped.
 */
export const swapChampionsInDraft = (
    draftState: DraftState,
    team: TeamSide,
    sourceIndex: number,
    destinationIndex: number
): DraftState => {
    const teamState = draftState[team];
    const newPicks = [...teamState.picks];
    
    // Simple array swap
    [newPicks[sourceIndex], newPicks[destinationIndex]] = [newPicks[destinationIndex], newPicks[sourceIndex]];

    return {
        ...draftState,
        [team]: {
            ...teamState,
            picks: newPicks,
        },
    };
};


// --- Data Dragon Transformation Helpers ---

const deriveDamageType = (info: { attack: number; magic: number }): 'AD' | 'AP' | 'Mixed' => {
    const total = info.attack + info.magic;
    if (total === 0) return 'Mixed';
    const adRatio = info.attack / total;

    if (adRatio > 0.7) return 'AD';
    if (adRatio < 0.3) return 'AP';
    return 'Mixed';
};

const deriveStatLevel = (text: string, heavyKeywords: string[], mediumKeywords: string[]): 'Low' | 'Medium' | 'High' => {
    let score = 0;
    const lowerText = text.toLowerCase();

    heavyKeywords.forEach(kw => {
        if (lowerText.includes(kw)) score += 2;
    });
    mediumKeywords.forEach(kw => {
        if (lowerText.includes(kw)) score += 1;
    });

    if (score >= 3) return 'High';
    if (score >= 1) return 'Medium';
    return 'Low';
};

const ROLE_OVERRIDES: Record<string, string[]> = {
    'Graves': ['Jungle'],
    'Kindred': ['Jungle'],
    'Quinn': ['Top'],
    'Vayne': ['ADC'],
    'TwistedFate': ['Mid'],
    'Pyke': ['Support'],
    'Senna': ['Support', 'ADC'],
    'TahmKench': ['Support', 'Top'],
    'Pantheon': ['Jungle', 'Mid', 'Support'],
    'Sett': ['Top', 'Support'],
};

const deriveRoles = (tags: string[], id: string): string[] => {
    if (ROLE_OVERRIDES[id]) {
        return ROLE_OVERRIDES[id];
    }
    const roles = new Set<string>();
    if (tags.includes('Support')) roles.add('Support');
    if (tags.includes('Marksman')) roles.add('ADC');
    if (tags.includes('Mage')) { roles.add('Mid'); roles.add('Support'); }
    if (tags.includes('Assassin')) { roles.add('Mid'); roles.add('Jungle'); }
    if (tags.includes('Tank')) { roles.add('Top'); roles.add('Support'); }
    if (tags.includes('Fighter')) { roles.add('Top'); roles.add('Jungle'); }

    // Fallback for champs with no clear role tags (unlikely)
    if (roles.size === 0) return ['Fighter'];
    return Array.from(roles);
};

export const transformDdragonData = (ddragonData: any, version: string): Champion[] => {
    const championData = ddragonData.data;
    const champions: Champion[] = [];

    for (const key in championData) {
        const champ = championData[key];
        const allAbilitiesText = [champ.passive.description, ...champ.spells.map((s: any) => s.description)].join(' ').toLowerCase();

        const transformed: Champion = {
            id: champ.id,
            name: champ.name,
            title: champ.title,
            lore: champ.lore,
            image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champ.image.full}`,
            splashUrl: `https://ddragon.leagueoflegends.com/cdn/img/splash/${champ.id}_0.jpg`,
            loadingScreenUrl: `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champ.id}_0.jpg`,
            playstyle: champ.blurb, // Use blurb as a proxy for playstyle
            roles: deriveRoles(champ.tags, champ.id),
            class: champ.tags,
            subclass: [], // Subclass is too specific to derive accurately
            damageType: deriveDamageType(champ.info),
            cc: deriveStatLevel(allAbilitiesText, ['stun', 'knockup', 'knock up', 'root', 'suppress', 'fear', 'charm', 'taunt'], ['slow', 'silence', 'blind']),
            engage: deriveStatLevel(allAbilitiesText, ['dash', 'leap', 'charge', 'unstoppable'], ['speed']),
            abilities: [
                { key: 'Passive', name: champ.passive.name, description: champ.passive.description },
                { key: 'Q', name: champ.spells[0].name, description: champ.spells[0].description },
                { key: 'W', name: champ.spells[1].name, description: champ.spells[1].description },
                { key: 'E', name: champ.spells[2].name, description: champ.spells[2].description },
                { key: 'R', name: champ.spells[3].name, description: champ.spells[3].description },
            ],
        };
        champions.push(transformed);
    }
    return champions.sort((a, b) => a.name.localeCompare(b.name));
};
