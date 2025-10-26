import React, { useState, useEffect, useCallback } from 'react';
import { getTierList, getPatchNotesSummary, getPersonalizedPatchSummary } from '../../services/geminiService';
import type { StructuredTierList, StructuredPatchNotes, PersonalizedPatchSummary } from '../../types';
import { Loader } from '../common/Loader';
import { Button } from '../common/Button';
import { SourceList } from '../common/SourceList';
import { MISSION_IDS } from '../../constants';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useChampions } from '../../contexts/ChampionContext';
import { useGeminiData } from '../../hooks/useGemini';
import { PersonalizedPatchNotesDisplay } from './PersonalizedPatchNotesDisplay';
import { useSettings } from '../../hooks/useSettings';
import * as storageService from '../../services/storageService';

interface IntelProps {
    onLoadChampionInLab: (championId: string, role?: string) => void;
}

const TierListDisplay = ({ tierList, onLoadChampion }: { tierList: StructuredTierList, onLoadChampion: (championName: string, role: string) => void }) => (
    <div className="bg-surface p-6 rounded-lg border border-border shadow-lg">
        <h2 className="font-display text-2xl font-bold text-text-primary mb-2">S-Tier List</h2>
        <p className="text-sm text-text-secondary mb-4 italic">{tierList.summary}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {tierList.tierList.map(roleData => (
                <div key={roleData.role}>
                    <h3 className="font-bold text-lg text-accent mb-2">{roleData.role}</h3>
                    <div className="space-y-2">
                        {roleData.champions.map(champ => (
                            <button key={champ.championName} onClick={() => onLoadChampion(champ.championName, roleData.role)} className="w-full text-left p-2 bg-secondary rounded-md hover:bg-border transition-colors group">
                                <p className="font-semibold text-text-primary group-hover:text-accent">{champ.championName}</p>
                                <p className="text-xs text-text-secondary">{champ.reasoning}</p>
                            </button>
                        ))}
                    </div>
                </div>
            ))}
        </div>
        {tierList.sources && tierList.sources.length > 0 && <SourceList sources={tierList.sources} />}
    </div>
);

const PatchNotesDisplay = ({ patchNotes }: { patchNotes: StructuredPatchNotes }) => (
    <div className="bg-surface p-6 rounded-lg border border-border shadow-lg">
        <h2 className="font-display text-2xl font-bold text-text-primary mb-2">Latest Patch Summary</h2>
        <p className="text-sm text-text-secondary mb-4 italic">{patchNotes.summary}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
                <h3 className="font-bold text-lg text-success mb-2">Top Buffs</h3>
                <ul className="space-y-2">
                    {patchNotes.buffs.map(change => <li key={change.name} className="text-sm"><strong className="text-text-primary">{change.name}:</strong> <span className="text-text-secondary">{change.change}</span></li>)}
                </ul>
            </div>
             <div>
                <h3 className="font-bold text-lg text-error mb-2">Top Nerfs</h3>
                <ul className="space-y-2">
                    {patchNotes.nerfs.map(change => <li key={change.name} className="text-sm"><strong className="text-text-primary">{change.name}:</strong> <span className="text-text-secondary">{change.change}</span></li>)}
                </ul>
            </div>
             <div>
                <h3 className="font-bold text-lg text-accent mb-2">System Changes</h3>
                <ul className="space-y-2">
                    {patchNotes.systemChanges.map(change => <li key={change.name} className="text-sm"><strong className="text-text-primary">{change.name}:</strong> <span className="text-text-secondary">{change.change}</span></li>)}
                </ul>
            </div>
        </div>
        {patchNotes.sources && patchNotes.sources.length > 0 && <SourceList sources={patchNotes.sources} />}
    </div>
);


export const Intel = ({ onLoadChampionInLab }: IntelProps) => {
    const { profile, completeMission } = useUserProfile();
    const { championsLite, latestVersion } = useChampions();
    const { settings } = useSettings();

    // Fetch Tier List with cache
    const memoizedTierListFetcher = useCallback(async (signal: AbortSignal) => {
        if (!latestVersion) throw new Error("DDragon version not available to validate cache.");
        const fetcher = () => getTierList(signal);
        return storageService.fetchWithCache('tierList', fetcher, latestVersion, signal);
    }, [latestVersion]);
    const { data: tierList, isLoading: isTierListLoading, error: tierListError, execute: refetchTierList } = useGeminiData(memoizedTierListFetcher);

    // Fetch General Patch Notes with cache
    const memoizedPatchNotesFetcher = useCallback(async (signal: AbortSignal) => {
        if (!latestVersion) throw new Error("DDragon version not available to validate cache.");
        
        // Check cache manually to handle side-effect correctly.
        // fetchWithCache isn't used here because the side-effect (completeMission) should ONLY run on a fresh fetch.
        const cached = storageService.getCache<StructuredPatchNotes>('patchNotes', latestVersion);
        if (cached) {
            return cached;
        }

        const notes = await getPatchNotesSummary(signal);
        if (!signal.aborted) {
            // This is a fresh fetch, so we run the side-effect and cache the result.
            completeMission(MISSION_IDS.GETTING_STARTED.CHECK_META);
            storageService.setCache('patchNotes', notes, latestVersion);
        }
        return notes;
    }, [completeMission, latestVersion]);
    const { data: patchNotes, isLoading: isPatchLoading, error: patchError, execute: refetchPatchNotes } = useGeminiData(memoizedPatchNotesFetcher);


    // Fetch Personalized Patch Notes (lazy, dependent on general notes)
    const fetchPersonalizedSummary = useCallback(async (signal: AbortSignal, notes: StructuredPatchNotes) => {
        return getPersonalizedPatchSummary(profile, settings, notes, championsLite, signal);
    }, [profile, settings, championsLite]);
    const { data: personalizedSummary, isLoading: isPersonalizedLoading, error: personalizedError, execute: fetchPersonalized } = useGeminiData(fetchPersonalizedSummary, true);

    // Chain the personalized fetch to run after the general patch notes are loaded
    useEffect(() => {
        if (patchNotes) {
            fetchPersonalized(patchNotes);
        }
    }, [patchNotes, fetchPersonalized]);

    const handleLoadChampion = (championName: string, role: string) => {
        const champion = championsLite.find(c => c.name.toLowerCase() === championName.toLowerCase());
        if (champion) {
            onLoadChampionInLab(champion.id, role);
        }
    };
    
    const isLoading = isTierListLoading || isPatchLoading;
    const error = tierListError || patchError;

    if (isLoading) {
        return <div className="flex justify-center items-center h-full py-16"><Loader messages={["Analyzing meta trends...", "Summarizing patch notes..."]} /></div>;
    }

    if (error) {
        return (
            <div className="text-center p-8 bg-surface rounded-lg border border-border">
                <p className="text-error mb-4">{error}</p>
                <Button onClick={() => { refetchTierList(); refetchPatchNotes(); }}>Retry</Button>
            </div>
        );
    }

    return (
         <div className="space-y-8">
            <PersonalizedPatchNotesDisplay
                summary={personalizedSummary}
                isLoading={isPersonalizedLoading}
                error={personalizedError}
                onLoadChampionInLab={onLoadChampionInLab}
                onRetry={patchNotes ? () => fetchPersonalized(patchNotes) : undefined}
            />
            {tierList && <TierListDisplay tierList={tierList} onLoadChampion={handleLoadChampion} />}
            {patchNotes && <PatchNotesDisplay patchNotes={patchNotes} />}
        </div>
    );
};