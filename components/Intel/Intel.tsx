import React, { useState, useEffect, useCallback } from 'react';
import { getTierList, getPatchNotesSummary } from '../../services/geminiService';
import type { StructuredTierList, StructuredPatchNotes } from '../../types';
import { Loader } from '../common/Loader';
import { Button } from '../common/Button';
import { SourceList } from '../common/SourceList';
import { MISSION_IDS } from '../../constants';
import toast from 'react-hot-toast';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useChampions } from '../../contexts/ChampionContext';

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
    const [tierList, setTierList] = useState<StructuredTierList | null>(null);
    const [patchNotes, setPatchNotes] = useState<StructuredPatchNotes | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { completeMission } = useUserProfile();
    const { championsLite } = useChampions();

    const fetchData = useCallback(async (signal: AbortSignal) => {
        setIsLoading(true);
        setError(null);
        try {
            const [tierListData, patchNotesData] = await Promise.all([
                getTierList(signal),
                getPatchNotesSummary(signal)
            ]);
            if (!signal.aborted) {
                setTierList(tierListData);
                setPatchNotes(patchNotesData);
                completeMission(MISSION_IDS.GETTING_STARTED.CHECK_META);
            }
        } catch (err) {
            if (err instanceof DOMException && err.name === 'AbortError') {
                return;
            }
            setError('Failed to fetch meta intelligence. The Oracle may be busy.');
        } finally {
            if (!signal.aborted) {
                setIsLoading(false);
            }
        }
    }, [completeMission]);

    useEffect(() => {
        const controller = new AbortController();
        fetchData(controller.signal);
        return () => {
            controller.abort();
            // Per code review: reset state on unmount to prevent stale UI on navigation.
            setIsLoading(false);
            setError(null);
        };
    }, [fetchData]);

    const handleLoadChampion = (championName: string, role: string) => {
        const champion = championsLite.find(c => c.name.toLowerCase() === championName.toLowerCase());
        if (champion) {
            onLoadChampionInLab(champion.id, role);
        }
    };
    
    if (isLoading) {
        return <div className="flex justify-center items-center h-full py-16"><Loader messages={["Analyzing meta trends...", "Summarizing patch notes..."]} /></div>;
    }

    if (error) {
        return (
            <div className="text-center p-8 bg-surface rounded-lg border border-border">
                <p className="text-error mb-4">{error}</p>
                <Button onClick={() => {
                    const controller = new AbortController();
                    fetchData(controller.signal);
                }}>Retry</Button>
            </div>
        );
    }

    return (
         <div className="space-y-6">
            {tierList && <TierListDisplay tierList={tierList} onLoadChampion={handleLoadChampion} />}
            {patchNotes && <PatchNotesDisplay patchNotes={patchNotes} />}
        </div>
    );
};
