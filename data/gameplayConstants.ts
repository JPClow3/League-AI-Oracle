import { Team, DraftActionType, MetaComposition } from '../types';

// --- From draftRules.ts ---
export interface DraftTurn {
  team: Team;
  type: DraftActionType;
  phase: string;
}

const SOLO_QUEUE_SEQUENCE: DraftTurn[] = [
  // Ban Phase
  { team: 'BLUE', type: 'BAN', phase: 'Ban Phase' }, { team: 'RED', type: 'BAN', phase: 'Ban Phase' },
  { team: 'BLUE', type: 'BAN', phase: 'Ban Phase' }, { team: 'RED', type: 'BAN', phase: 'Ban Phase' },
  { team: 'BLUE', type: 'BAN', phase: 'Ban Phase' }, { team: 'RED', type: 'BAN', phase: 'Ban Phase' },
  { team: 'BLUE', type: 'BAN', phase: 'Ban Phase' }, { team: 'RED', type: 'BAN', phase: 'Ban Phase' },
  { team: 'BLUE', type: 'BAN', phase: 'Ban Phase' }, { team: 'RED', type: 'BAN', phase: 'Ban Phase' },
  // Pick Phase
  { team: 'BLUE', type: 'PICK', phase: 'Pick Phase' }, { team: 'RED', type: 'PICK', phase: 'Pick Phase' },
  { team: 'RED', type: 'PICK', phase: 'Pick Phase' }, { team: 'BLUE', type: 'PICK', phase: 'Pick Phase' },
  { team: 'BLUE', type: 'PICK', phase: 'Pick Phase' }, { team: 'RED', type: 'PICK', phase: 'Pick Phase' },
  { team: 'RED', type: 'PICK', phase: 'Pick Phase' }, { team: 'BLUE', type: 'PICK', phase: 'Pick Phase' },
  { team: 'BLUE', type: 'PICK', phase: 'Pick Phase' }, { team: 'RED', type: 'PICK', phase: 'Pick Phase' },
];

const COMPETITIVE_SEQUENCE: DraftTurn[] = [
  // Ban Phase 1
  { team: 'BLUE', type: 'BAN', phase: 'Ban Phase 1' }, { team: 'RED', type: 'BAN', phase: 'Ban Phase 1' },
  { team: 'BLUE', type: 'BAN', phase: 'Ban Phase 1' }, { team: 'RED', type: 'BAN', phase: 'Ban Phase 1' },
  { team: 'BLUE', type: 'BAN', phase: 'Ban Phase 1' }, { team: 'RED', type: 'BAN', phase: 'Ban Phase 1' },
  // Pick Phase 1
  { team: 'BLUE', type: 'PICK', phase: 'Pick Phase 1' },
  { team: 'RED', type: 'PICK', phase: 'Pick Phase 1' }, { team: 'RED', type: 'PICK', phase: 'Pick Phase 1' },
  { team: 'BLUE', type: 'PICK', phase: 'Pick Phase 1' }, { team: 'BLUE', type: 'PICK', phase: 'Pick Phase 1' },
  { team: 'RED', type: 'PICK', phase: 'Pick Phase 1' },
  // Ban Phase 2
  { team: 'RED', type: 'BAN', phase: 'Ban Phase 2' }, { team: 'BLUE', type: 'BAN', phase: 'Ban Phase 2' },
  { team: 'RED', type: 'BAN', phase: 'Ban Phase 2' }, { team: 'BLUE', type: 'BAN', phase: 'Ban Phase 2' },
  // Pick Phase 2
  { team: 'RED', type: 'PICK', phase: 'Pick Phase 2' }, { team: 'BLUE', type: 'PICK', phase: 'Pick Phase 2' },
  { team: 'BLUE', type: 'PICK', phase: 'Pick Phase 2' }, { team: 'RED', type: 'PICK', phase: 'Pick Phase 2' },
];

export const getDraftSequence = (mode: 'SOLO_QUEUE' | 'COMPETITIVE'): DraftTurn[] => {
  return mode === 'SOLO_QUEUE' ? SOLO_QUEUE_SEQUENCE : COMPETITIVE_SEQUENCE;
};

// --- From metaComps.ts ---
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

// --- From synergyData.ts ---
export interface Synergy {
  champions: string[]; // Champion names
  name: string;
  description: string;
}

export const SYNERGY_DATA: Synergy[] = [
  { 
    champions: ['Malphite', 'Yasuo'], 
    name: 'Unstoppable Force + Last Breath', 
    description: 'Yasuo can instantly cast his ultimate on all enemies knocked up by Malphite\'s ultimate, creating a devastating teamfight combo.' 
  },
  { 
    champions: ['Lucian', 'Braum'], 
    name: 'Lightslinger & Unbreakable', 
    description: 'Braum\'s passive, Concussive Blows, can be proced almost instantly by Lucian\'s double-shot passive, allowing for rapid stuns in lane.' 
  },
   { 
    champions: ['Xayah', 'Rakan'], 
    name: 'The Lovers\' Duo', 
    description: 'Xayah and Rakan have unique, enhanced interactions with each other\'s abilities, including a longer range on Rakan\'s dash to Xayah and a shared recall.' 
  },
  { 
    champions: ['Amumu', 'Miss Fortune'], 
    name: 'Curse of the Sad Bullet Time', 
    description: 'Amumu\'s AoE ultimate holds enemies in place, guaranteeing Miss Fortune can land a full-duration, maximum damage Bullet Time.' 
  },
  {
    champions: ['Orianna', 'Rengar'],
    name: 'The Ball Delivery System',
    description: 'Rengar can carry Orianna\'s ball into the enemy team while stealthed, setting up a surprise multi-person Shockwave.'
  },
  {
    champions: ['Katarina', 'Galio'],
    name: 'Hero\'s Death Lotus',
    description: 'Galio\'s wide area taunt from his ultimate forces enemies to stand still, allowing Katarina to deal massive damage with her Death Lotus.'
  }
];