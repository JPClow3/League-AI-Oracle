import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Champion, ChampionLite } from '../types';
import { transformDdragonData } from '../lib/draftUtils';
import CacheManager from '../lib/cache';

const CACHE_KEY = 'championDataCache';

interface ChampionState {
    champions: Champion[];
    championsLite: ChampionLite[];
    isLoading: boolean;
    error: string | null;
    latestVersion: string | null;
}

interface ChampionContextType extends ChampionState {
    refetch: () => Promise<void>;
}

const ChampionStateContext = createContext<ChampionState | undefined>(undefined);
const ChampionDispatchContext = createContext<(() => Promise<void>) | undefined>(undefined);

export const ChampionProvider = ({ children }: { children: React.ReactNode }) => {
    const [state, setState] = useState<ChampionState>({
        champions: [],
        championsLite: [],
        isLoading: true,
        error: null,
        latestVersion: null,
    });

    const fetchChampions = useCallback(async () => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            // 1. Fetch latest version number
            console.log('Fetching latest Data Dragon version...');
            const versionsResponse = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
            if (!versionsResponse.ok) {
                throw new Error('Failed to fetch DDragon versions list.');
            }
            const versions = await versionsResponse.json();
            const currentVersion = versions[0];
            setState(prev => ({ ...prev, latestVersion: currentVersion }));
            console.log(`Latest DDragon version is: ${currentVersion}`);

            // 2. Check cache with the fresh version number
            const cached = CacheManager.get<Champion[]>(CACHE_KEY);
            if (cached) {
                console.log('Loaded champions from cache.');
                const liteList = cached.map(c => ({
                    id: c.id,
                    name: c.name,
                    image: c.image,
                    roles: c.roles,
                    damageType: c.damageType,
                }));
                setState(prev => ({
                    ...prev,
                    champions: cached,
                    championsLite: liteList,
                    isLoading: false
                }));
                return;
            }

            // 3. Fetch from API if cache is invalid or missing
            console.log(`Fetching champions for version ${currentVersion}...`);
            const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/${currentVersion}/data/en_US/championFull.json`);
            if (!response.ok) {
                throw new Error(`Failed to fetch champion data (status: ${response.status})`);
            }
            const rawData = await response.json();
            const transformedData = transformDdragonData(rawData, currentVersion);

            const liteList = transformedData.map(c => ({
                id: c.id,
                name: c.name,
                image: c.image,
                roles: c.roles,
                damageType: c.damageType,
            }));

            // 4. Cache the new data
            CacheManager.set(CACHE_KEY, transformedData);
            console.log('Successfully fetched and cached new champion data.');

            setState(prev => ({
                ...prev,
                champions: transformedData,
                championsLite: liteList,
                isLoading: false
            }));

        } catch (err) {
            console.error("Fatal error fetching champion data:", err);
            setState(prev => ({
                ...prev,
                error: err instanceof Error
                    ? `Could not connect to Riot's Data Dragon API. Please check your internet connection and try again. Details: ${err.message}`
                    : 'An unknown error occurred while fetching champion data.',
                isLoading: false
            }));
        }
    }, []);

    useEffect(() => {
        fetchChampions();
    }, [fetchChampions]);

    return (
        <ChampionStateContext.Provider value={state}>
            <ChampionDispatchContext.Provider value={fetchChampions}>
                {children}
            </ChampionDispatchContext.Provider>
        </ChampionStateContext.Provider>
    );
};

export const useChampions = (): ChampionContextType => {
    const state = useContext(ChampionStateContext);
    const refetch = useContext(ChampionDispatchContext);

    if (state === undefined || refetch === undefined) {
        throw new Error('useChampions must be used within a ChampionProvider');
    }

    return { ...state, refetch };
};

