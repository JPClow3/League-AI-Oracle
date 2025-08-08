import { Champion, DDragonData, Item } from '../types';
import { STATIC_CHAMPION_DATA } from '../data/gameData';
import { dbService } from './dbService';

const DDRAGON_BASE_URL = 'https://ddragon.leagueoflegends.com';

class DDragonService {
  private async getLatestVersion(): Promise<string> {
    try {
      const response = await fetch(`${DDRAGON_BASE_URL}/api/versions.json`);
      if (!response.ok) throw new Error('Failed to fetch DDragon versions');
      const versions = await response.json();
      return versions[0];
    } catch (error) {
      console.error('Error fetching latest version, falling back to a recent one.', error);
      return '14.14.1'; // Fallback version
    }
  }

  private async fetchDataFile<T>(version: string, file: 'champion.json' | 'item.json'): Promise<T> {
    const response = await fetch(`${DDRAGON_BASE_URL}/cdn/${version}/data/en_US/${file}`);
    if (!response.ok) throw new Error(`Failed to fetch ${file}`);
    const data = await response.json();
    return data.data;
  }

  public async getAllData(): Promise<DDragonData> {
    const version = await this.getLatestVersion();
    
    try {
        const cached = await dbService.getDDragonData();
        if (cached && cached.version === version) {
            console.log('Using cached DDragon data.');
            return cached.data;
        }
    } catch (e) {
        console.error("Cache read failed, fetching from network.", e);
    }
    
    console.log('Fetching new DDragon data from network.');
    const [rawChampions, items] = await Promise.all([
      this.fetchDataFile<Record<string, Champion>>(version, 'champion.json'),
      this.fetchDataFile<Record<string, Item>>(version, 'item.json')
    ]);

    // Combine DDragon data with our custom static data
    const champions: Record<string, Champion> = {};
    for (const key in rawChampions) {
      const champ = rawChampions[key];
      champions[key] = {
        ...champ,
        ...STATIC_CHAMPION_DATA[key],
      };
    }
    
    // Filter out tutorial/arena items
    const filteredItems: Record<string, Item> = {};
    for(const key in items) {
        const item = items[key];
        if (item.maps['11'] && item.gold.purchasable && !item.tags.includes('Trinket') && item.depth && item.depth > 1) {
            filteredItems[key] = item;
        }
    }

    const processedData = { version, champions, items: filteredItems };
    try {
        await dbService.setDDragonData(version, processedData);
        console.log('DDragon data cached successfully.');
    } catch(e) {
        console.error("Failed to cache DDragon data.", e);
    }

    return processedData;
  }
}

export const ddragonService = new DDragonService();