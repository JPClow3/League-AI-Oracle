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
