import type { Champion, ChampionLite } from './types';
import { CHAMPION_DETAILS } from './data/championData';

export interface Blueprint {
  name: string;
  description: string;
  championIds: string[];
}

// Centralize the Data Dragon version for easy updates when a new patch is released.
export const DATA_DRAGON_VERSION = '14.14.1';

// Centralized array of roles for consistency across the application.
export const ROLES = ['Top', 'Jungle', 'Mid', 'ADC', 'Support'];

// Helper to generate Data Dragon champion image URLs
const getChampionImage = (championId: string) => {
    // The champion ID from championData.ts should be the correct key for Data Dragon.
    return `https://ddragon.leagueoflegends.com/cdn/${DATA_DRAGON_VERSION}/img/champion/${championId}.png`;
}

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

// Combine detailed data with image URLs. CHAMPION_DETAILS is now the single source of truth.
export const CHAMPIONS: Champion[] = CHAMPION_DETAILS.map(champion => ({
  ...champion,
  image: getChampionImage(champion.id),
}));

// A lightweight version for performance-critical lists like the champion grid.
export const CHAMPIONS_LITE: ChampionLite[] = CHAMPIONS.map(c => ({
    id: c.id,
    name: c.name,
    image: c.image,
    roles: c.roles,
}));