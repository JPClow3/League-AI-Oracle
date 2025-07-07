import { MetaComposition } from '../types';

export const META_COMPOSITIONS: MetaComposition[] = [
    {
        id: 'protect-the-kog',
        name: 'Classic "Protect the Carry"',
        description: 'A traditional front-to-back composition focused on enabling a single hyper-carry.',
        champions: [
            { name: 'Ornn', role: 'TOP' },
            { name: 'Sejuani', role: 'JUNGLE' },
            { name: 'Orianna', role: 'MIDDLE' },
            { name: 'Kog\'Maw', role: 'BOTTOM' },
            { name: 'Lulu', role: 'SUPPORT' },
        ],
    },
    {
        id: 'jarvan-dive',
        name: 'The "Wombo-Combo" Dive',
        description: 'An all-in composition designed to lock down and eliminate enemies in a single, decisive teamfight.',
        champions: [
            { name: 'Kennen', role: 'TOP' },
            { name: 'Jarvan IV', role: 'JUNGLE' },
            { name: 'Galio', role: 'MIDDLE' },
            { name: 'Miss Fortune', role: 'BOTTOM' },
            { name: 'Leona', role: 'SUPPORT' },
        ],
    },
    {
        id: 'poke-siege',
        name: 'Poke & Siege',
        description: 'A composition that leverages superior range to choke enemies out of objectives.',
        champions: [
            { name: 'Jayce', role: 'TOP' },
            { name: 'Nidalee', role: 'JUNGLE' },
            { name: 'Zoe', role: 'MIDDLE' },
            { name: 'Caitlyn', role: 'BOTTOM' },
            { name: 'Lux', role: 'SUPPORT' },
        ],
    },
];
