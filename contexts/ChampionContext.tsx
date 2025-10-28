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

    // ✅ IMPROVEMENT: Retry logic with exponential backoff
    const maxRetries = 3;
    const baseDelay = 1000; // 1 second

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // 1. Fetch latest version number
        console.log(`Fetching latest Data Dragon version... (attempt ${attempt + 1}/${maxRetries + 1})`);
        const versionsResponse = await fetch('https://ddragon.leagueoflegends.com/api/versions.json', {
          signal: AbortSignal.timeout(10000), // 10 second timeout
        });

        if (!versionsResponse.ok) {
          throw new Error('Failed to fetch DDragon versions list.');
        }

        const versions = await versionsResponse.json();
        const currentVersion = versions[0];
        setState(prev => ({ ...prev, latestVersion: currentVersion }));
        console.log(`Latest DDragon version is: ${currentVersion}`);

        // 2. Check cache with the fresh version number
        const cached = CacheManager.get<Champion[]>(CACHE_KEY);
        if (cached && cached.length > 0) {
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
            isLoading: false,
          }));
          return; // Success, exit function
        }

        // 3. Fetch from API if cache is invalid or missing
        console.log(`Fetching champions for version ${currentVersion}...`);
        const response = await fetch(
          `https://ddragon.leagueoflegends.com/cdn/${currentVersion}/data/en_US/championFull.json`,
          { signal: AbortSignal.timeout(15000) } // 15 second timeout
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch champion data (status: ${response.status})`);
        }

        const rawData = await response.json();
        const transformedData = transformDdragonData(rawData, currentVersion);

        if (!transformedData || transformedData.length === 0) {
          throw new Error('Received empty champion data from API');
        }

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
          isLoading: false,
        }));

        return; // Success, exit function
      } catch (err) {
        console.error(`Error fetching champion data (attempt ${attempt + 1}/${maxRetries + 1}):`, err);

        // If this isn't the last attempt, wait before retrying
        if (attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt); // Exponential backoff
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        // ✅ IMPROVEMENT: Last attempt failed - try to use old cached data as fallback
        console.warn('All retry attempts failed. Attempting to use old cached data...');
        const oldCached = CacheManager.get<Champion[]>(CACHE_KEY);

        if (oldCached && oldCached.length > 0) {
          console.warn('Using stale cached data as fallback');
          const liteList = oldCached.map(c => ({
            id: c.id,
            name: c.name,
            image: c.image,
            roles: c.roles,
            damageType: c.damageType,
          }));

          setState(prev => ({
            ...prev,
            champions: oldCached,
            championsLite: liteList,
            isLoading: false,
            error: 'Using cached data. Internet connection may be unstable.',
          }));
          return;
        }

        // ✅ IMPROVEMENT: No cached data available - show comprehensive error
        setState(prev => ({
          ...prev,
          error:
            err instanceof Error
              ? `Unable to load champion data after ${maxRetries + 1} attempts. Please check your internet connection and try again. Error: ${err.message}`
              : 'Failed to load champion data. The application requires champion data to function properly.',
          isLoading: false,
        }));
      }
    }
  }, []);

  useEffect(() => {
    fetchChampions();
  }, [fetchChampions]);

  return (
    <ChampionStateContext.Provider value={state}>
      <ChampionDispatchContext.Provider value={fetchChampions}>{children}</ChampionDispatchContext.Provider>
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
