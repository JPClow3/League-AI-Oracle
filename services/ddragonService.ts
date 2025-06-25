
import { DDragonChampionsData, DDragonChampionInfo, DDragonItemsData } from '../types';

const DDRAGON_BASE_URL = 'https://ddragon.leagueoflegends.com';

let latestVersionCache: string | null = null;

/**
 * Fetches the latest version string from Data Dragon.
 * Caches the version to avoid redundant API calls.
 * @returns {Promise<string>} The latest DDragon version string.
 * @throws {Error} If fetching versions fails or no versions are found.
 */
export async function getLatestDDragonVersion(): Promise<string> {
  if (latestVersionCache) {
    return latestVersionCache;
  }
  try {
    const response = await fetch(`${DDRAGON_BASE_URL}/api/versions.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch DDragon versions: ${response.statusText}`);
    }
    const versions: string[] = await response.json();
    if (versions.length > 0) {
      latestVersionCache = versions[0];
      return latestVersionCache!;
    } else {
      throw new Error('No versions found in DDragon API');
    }
  } catch (error) {
    console.error("Error getting latest DDragon version:", error);
    // Fallback to a known recent version if API fails
    latestVersionCache = "14.5.1"; // Example fallback
    return latestVersionCache; 
  }
}

/**
 * Fetches all champion data for a specific DDragon version.
 * @param {string} version - The DDragon version string (e.g., "14.5.1").
 * @returns {Promise<DDragonChampionsData['data']>} A promise that resolves to an object containing all champion data.
 * @throws {Error} If fetching champion data fails.
 */
export async function getAllChampionsData(version: string): Promise<DDragonChampionsData['data']> {
  try {
    const response = await fetch(`${DDRAGON_BASE_URL}/cdn/${version}/data/en_US/champion.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch champion data for version ${version}: ${response.statusText}`);
    }
    const championsData: DDragonChampionsData = await response.json();
    return championsData.data;
  } catch (error) {
    console.error("Error fetching DDragon champion data:", error);
    throw error; // Re-throw to be handled by the caller
  }
}

/**
 * Fetches all item data for a specific DDragon version.
 * @param {string} version - The DDragon version string (e.g., "14.5.1").
 * @returns {Promise<DDragonItemsData>} A promise that resolves to the full item data object.
 * @throws {Error} If fetching item data fails.
 */
export async function getAllItemsData(version: string): Promise<DDragonItemsData> {
  try {
    const response = await fetch(`${DDRAGON_BASE_URL}/cdn/${version}/data/en_US/item.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch item data for version ${version}: ${response.statusText}`);
    }
    const itemsData: DDragonItemsData = await response.json();
    return itemsData;
  } catch (error) {
    console.error("Error fetching DDragon item data:", error);
    throw error; // Re-throw to be handled by the caller
  }
}


/**
 * Constructs the URL for a champion's image from DDragon.
 * @param {string} version - The DDragon version string.
 * @param {string} championId - The champion's DDragon ID (e.g., "Aatrox"). This corresponds to DDragonChampionInfo.id.
 * @param {'tile' | 'splash' | 'loading'} [type='tile'] - The type of image to retrieve.
 *        'tile' for square champion icon, 'splash' for splash art, 'loading' for loading screen art.
 * @returns {string} The full URL to the champion image.
 */
export function getChampionImageURL(version: string, championId: string, type: 'tile' | 'splash' | 'loading' = 'tile'): string {
  if (type === 'tile') {
    return `${DDRAGON_BASE_URL}/cdn/${version}/img/champion/${championId}.png`;
  } else if (type === 'splash') {
    return `${DDRAGON_BASE_URL}/cdn/img/champion/splash/${championId}_0.jpg`;
  } else if (type === 'loading') {
     return `${DDRAGON_BASE_URL}/cdn/img/champion/loading/${championId}_0.jpg`;
  }
  return `${DDRAGON_BASE_URL}/cdn/${version}/img/champion/${championId}.png`; // Default to tile
}

/**
 * Constructs the URL for an item's image from DDragon.
 * @param {string} version - The DDragon version string.
 * @param {string} itemIdFilename - The item's image filename (e.g., "3031.png"). This is DDragonItemInfo.image.full.
 * @returns {string} The full URL to the item image.
 */
export function getItemImageURL(version: string, itemIdFilename: string): string {
  return `${DDRAGON_BASE_URL}/cdn/${version}/img/item/${itemIdFilename}`;
}


/**
 * Constructs the URL for a champion's passive ability image from DDragon.
 * @param {string} version - The DDragon version string.
 * @param {string} passiveImageFull - The full filename of the passive image (e.g., "Anivia_P.png").
 * @returns {string} The full URL to the passive image.
 */
export function getPassiveImageURL(version: string, passiveImageFull: string): string {
    return `${DDRAGON_BASE_URL}/cdn/${version}/img/passive/${passiveImageFull}`;
}

/**
 * Constructs the URL for a champion's spell image from DDragon.
 * @param {string} version - The DDragon version string.
 * @param {string} spellImageFull - The full filename of the spell image (e.g., "FlashFrost.png").
 * @returns {string} The full URL to the spell image.
 */
export function getSpellImageURL(version: string, spellImageFull: string): string {
    return `${DDRAGON_BASE_URL}/cdn/${version}/img/spell/${spellImageFull}`;
}
