import type { Champion, ChampionLite } from './types';

export interface Blueprint {
  name: string;
  description: string;
  championIds: string[];
}

// NOTE: The data dragon version is now fetched dynamically at app startup in ChampionContext.

// Centralized array of roles for consistency across the application.
export const ROLES = ['Top', 'Jungle', 'Mid', 'ADC', 'Support'];
export const DAMAGE_TYPES = ['All', 'AD', 'AP', 'Mixed'];

export const BLUEPRINTS: Blueprint[] = [
    {
        name: 'Teamfight Wombo',
        description: 'Hard engage and massive area-of-effect damage.',
        championIds: ['Malphite', 'Yasuo', 'Orianna', 'Kaisa', 'Leona'],
    },
    {
        name: 'Poke & Siege',
        description: 'Wear down opponents from a distance and take objectives.',
        championIds: ['Aatrox', 'XinZhao', 'Zoe', 'Ezreal', 'Lulu'],
    },
    {
        name: 'Full Dive',
        description: 'All-in on a single target with multiple threats.',
        championIds: ['Irelia', 'LeeSin', 'Akali', 'Lucian', 'Nautilus'],
    },
    {
        name: 'Protect the Carry',
        description: 'Funnel resources and peel for a hyper-carry ADC.',
        championIds: ['Sett', 'Warwick', 'Lulu', 'Vayne', 'Alistar'],
    }
];

export const MISSION_IDS = {
    GETTING_STARTED: {
        FIRST_ANALYSIS: 'gs1',
        PRACTICE_MAKES_PERFECT: 'gs2',
        SAVE_STRATEGY: 'gs3',
        CHECK_META: 'gs4',
    },
    DAILY: {
        FIRST_DRAFT_OF_DAY: 'd1',
        KNOWLEDGE_CHECK: 'd2',
    },
    WEEKLY: {
        ARENA_CONTENDER: 'w1',
        EXPAND_PLAYBOOK: 'w2',
        PERFECT_COMP: 'w3',
    },
};