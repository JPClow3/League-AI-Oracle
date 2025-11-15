/**
 * Meta Champions List
 * Top 20 most commonly picked/strong champions in current meta
 * These are popular picks across all roles that players frequently select
 */

export const META_CHAMPIONS: string[] = [
  // Top Lane
  'Aatrox',
  'Jax',
  'KSante',
  'Garen',

  // Jungle
  'LeeSin',
  'Graves',
  'Diana',
  'Vi',

  // Mid Lane
  'Yasuo',
  'Zed',
  'Ahri',
  'Akali',

  // ADC
  'Ezreal',
  'Jinx',
  'Kaisa',
  'Vayne',

  // Support
  'Thresh',
  'Leona',
  'Lux',
  'Nautilus',
];

/**
 * Check if a champion ID is in the meta champions list
 */
export const isMetaChampion = (championId: string): boolean => {
  return META_CHAMPIONS.includes(championId);
};

/**
 * Get meta champions from a list of champions
 */
export const getMetaChampions = <T extends { id: string }>(champions: T[]): T[] => {
  return champions.filter(champ => isMetaChampion(champ.id));
};
