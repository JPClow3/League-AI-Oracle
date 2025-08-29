import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { Champion, ChampionLite, Ability } from '../types';
import { safeGetLocalStorage, safeSetLocalStorage, safeRemoveLocalStorage, transformDdragonData } from '../lib/draftUtils';

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
// MOVED TO lib/draftUtils.ts

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