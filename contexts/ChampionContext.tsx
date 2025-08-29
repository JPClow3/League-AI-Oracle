import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { Champion, ChampionLite, Ability } from '../types';
import { safeGetLocalStorage, safeSetLocalStorage, safeRemoveLocalStorage } from '../lib/draftUtils';

interface ChampionContextType {
    champions: Champion[];
    championsLite: ChampionLite[];
    isLoading: boolean;
    error: string | null;
    latestVersion: string | null;
}

const ChampionContext = createContext<ChampionContextType | undefined>(undefined);

const CACHE_KEY = 'championDataCache';

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

const transformDdragonData = (ddragonData: any, version: string): Champion[] => {
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

export const ChampionProvider = ({ children }: { children: React.ReactNode }) => {
    const [champions, setChampions] = useState<Champion[]>([]);
    const [championsLite, setChampionsLite] = useState<ChampionLite[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [latestVersion, setLatestVersion] = useState<string | null>(null);

    useEffect(() => {
        const fetchChampions = async () => {
            setIsLoading(true);
            setError(null);

            try {
                // 1. Fetch latest version number
                console.log('Fetching latest Data Dragon version...');
                const versionsResponse = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
                if (!versionsResponse.ok) {
                    throw new Error('Failed to fetch DDragon versions list.');
                }
                const versions = await versionsResponse.json();
                const currentVersion = versions[0];
                setLatestVersion(currentVersion);
                console.log(`Latest DDragon version is: ${currentVersion}`);


                // 2. Check cache with the fresh version number
                try {
                    const cached = safeGetLocalStorage(CACHE_KEY);
                    if (cached) {
                        const { version, data } = JSON.parse(cached);
                        if (version === currentVersion) {
                            setChampions(data);
                            console.log('Loaded champions from cache.');
                            return; // Exit if cache is valid
                        }
                    }
                } catch (e) {
                    console.warn('Could not load champion cache, refetching.', e);
                    safeRemoveLocalStorage(CACHE_KEY);
                }

                // 3. Fetch from API if cache is invalid or missing
                console.log(`Fetching champions for version ${currentVersion}...`);
                const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/${currentVersion}/data/en_US/championFull.json`);
                if (!response.ok) {
                    throw new Error(`Failed to fetch champion data (status: ${response.status})`);
                }
                const rawData = await response.json();
                const transformedData = transformDdragonData(rawData, currentVersion);
                setChampions(transformedData);
                
                // 4. Cache the new data
                const cachePayload = { version: currentVersion, data: transformedData };
                safeSetLocalStorage(CACHE_KEY, JSON.stringify(cachePayload));
                console.log('Successfully fetched and cached new champion data.');

            } catch (err) {
                console.error("Fatal error fetching champion data:", err);
                setError(err instanceof Error ? `Could not connect to Riot's Data Dragon API. Please check your internet connection and try again. Details: ${err.message}` : 'An unknown error occurred while fetching champion data.');
            } finally {
                // Ensure loading is always set to false after an attempt.
                setIsLoading(false);
            }
        };

        fetchChampions();
    }, []);

    useEffect(() => {
        if (champions.length > 0) {
            const liteList = champions.map(c => ({
                id: c.id,
                name: c.name,
                image: c.image,
                roles: c.roles,
                damageType: c.damageType,
            }));
            setChampionsLite(liteList);
        }
    }, [champions]);

    const value = useMemo(() => ({
        champions,
        championsLite,
        isLoading,
        error,
        latestVersion,
    }), [champions, championsLite, isLoading, error, latestVersion]);

    return (
        <ChampionContext.Provider value={value}>
            {children}
        </ChampionContext.Provider>
    );
};

export const useChampions = (): ChampionContextType => {
    const context = useContext(ChampionContext);
    if (context === undefined) {
        throw new Error('useChampions must be used within a ChampionProvider');
    }
    return context;
};