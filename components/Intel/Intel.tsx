import React, { useState, useCallback, useRef, useEffect } from 'react';
import { getTierList, getPatchNotesSummary } from '../../services/geminiService';
import type { StructuredTierList, StructuredPatchNotes, MetaSource, TieredChampion, PatchChange } from '../../types';
import { Button } from '../common/Button';
import { Loader } from '../common/Loader';
import { CHAMPIONS_LITE } from '../../constants';
import { Tooltip } from '../common/Tooltip';
import { SourceList } from '../common/SourceList';

interface IntelProps {
    onLoadChampionInLab: (championId: string) => void;
}

const TierListDisplay: React.FC<{ onLoadChampionInLab: (championId: string) => void; }> = ({ onLoadChampionInLab }) => {
    const [data, setData] = useState<StructuredTierList | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    
    useEffect(() => {
        return () => {
            abortControllerRef.current?.abort();
        };
    }, []);

    const handleFetch = useCallback(async () => {
        abortControllerRef.current?.abort();
        const controller = new AbortController();
        abortControllerRef.current = controller;
        
        setIsLoading(true);
        setError(null);
        setData(null);
        try {
            const result = await getTierList(controller.signal);
            if (!controller.signal.aborted) {
                setData(result);
            }
        } catch (err) {
            if (err instanceof DOMException && err.name === 'AbortError') {
              console.log("Tier list fetch aborted.");
              return;
            }
            if (!controller.signal.aborted) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            }
        } finally {
            if (!controller.signal.aborted) {
                setIsLoading(false);
            }
        }
    }, []);

    const findChampion = (name: string) => {
        return CHAMPIONS_LITE.find(c => c.name.toLowerCase() === name.toLowerCase());
    };

    return (
        <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700/50">
            <h2 className="font-display text-2xl font-bold text-white">AI S-Tier List</h2>
            <p className="text-sm text-gray-400 mt-1 mb-4">A concise summary of the strongest champions in the current meta, powered by real-time data.</p>
            <Button onClick={handleFetch} disabled={isLoading} variant="secondary">
                {isLoading ? 'Fetching Tiers...' : 'Get Latest Tier List'}
            </Button>
            <div className="mt-4 p-4 bg-slate-900/70 rounded-md min-h-[200px] border border-slate-700/50">
                {isLoading && <Loader messages={["Analyzing Meta..."]} />}
                {error && <p className="text-red-400 p-4 text-center">{error}</p>}
                {!isLoading && !error && !data && (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <p>Click the button to generate the latest tier list.</p>
                    </div>
                )}
                {data && (
                    <div className="space-y-6">
                         <p className="text-gray-300 italic text-center border-b border-slate-700 pb-4">{data.summary}</p>
                        {data.tierList.map(roleTier => (
                            <div key={roleTier.role}>
                                <h3 className="font-bold text-xl text-yellow-300">{roleTier.role}</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-2">
                                    {roleTier.champions.map(champ => {
                                        const champion = findChampion(champ.championName);
                                        return (
                                            <div key={champ.championName} className="relative group">
                                                <Tooltip content={<p><strong className="text-yellow-300">Reasoning:</strong> {champ.reasoning}</p>}>
                                                    <div className="bg-slate-800/50 rounded-lg p-2 flex flex-col items-center border border-transparent hover:border-cyan-400/50 transition-colors">
                                                        {champion ? (
                                                            <img 
                                                                src={champion.image} 
                                                                alt={champ.championName} 
                                                                className="w-20 h-20 rounded-lg border-2 border-slate-600"
                                                            />
                                                        ) : (
                                                            <div className="w-20 h-20 rounded-lg bg-slate-700 flex items-center justify-center text-gray-500">?</div>
                                                        )}
                                                        <span className="text-sm mt-2 text-center font-semibold text-white">{champ.championName}</span>
                                                         {champion && (
                                                            <button 
                                                                onClick={() => onLoadChampionInLab(champion.id)}
                                                                className="absolute top-0 right-0 bg-blue-600/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-1/4 -translate-y-1/4 hover:bg-blue-500 focus:opacity-100"
                                                                aria-label={`Load ${champ.championName} in Lab`}
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
                                                            </button>
                                                        )}
                                                    </div>
                                                </Tooltip>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                        {data.sources.length > 0 && <SourceList sources={data.sources} />}
                    </div>
                )}
            </div>
        </div>
    );
};

const PatchNotesDisplay: React.FC = () => {
    const [data, setData] = useState<StructuredPatchNotes | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        return () => {
            abortControllerRef.current?.abort();
        };
    }, []);

     const handleFetch = useCallback(async () => {
        abortControllerRef.current?.abort();
        const controller = new AbortController();
        abortControllerRef.current = controller;
        
        setIsLoading(true);
        setError(null);
        setData(null);
        try {
            const result = await getPatchNotesSummary(controller.signal);
            if (!controller.signal.aborted) {
                setData(result);
            }
        } catch (err) {
            if (err instanceof DOMException && err.name === 'AbortError') {
              console.log("Patch notes fetch aborted.");
              return;
            }
            if (!controller.signal.aborted) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            }
        } finally {
             if (!controller.signal.aborted) {
                setIsLoading(false);
            }
        }
    }, []);

    const ChangeCard: React.FC<{ item: PatchChange, icon: React.ReactNode }> = ({ item, icon }) => (
        <div className="p-3 bg-slate-800/60 rounded-md border border-slate-700 flex gap-3 items-start">
            <div className="flex-shrink-0 mt-1">{icon}</div>
            <div>
                <h4 className="font-bold text-white">{item.name}</h4>
                <p className="text-sm text-gray-300">{item.change}</p>
            </div>
        </div>
    );

    const ICONS = {
        BUFF: <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-400"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" /></svg></div>,
        NERF: <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center text-red-400"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg></div>,
        SYSTEM: <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg></div>,
    }

    return (
        <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700/50">
            <h2 className="font-display text-2xl font-bold text-white">Patch Notes Summary</h2>
            <p className="text-sm text-gray-400 mt-1 mb-4">Receive an AI-generated summary of the most impactful changes from the latest patch notes.</p>
            <Button onClick={handleFetch} disabled={isLoading} variant="secondary">
                {isLoading ? 'Summarizing...' : `Get Patch Summary`}
            </Button>
            <div className="mt-4 p-4 bg-slate-900/70 rounded-md min-h-[200px] border border-slate-700/50">
                {isLoading && <Loader messages={["Reading Patch Notes..."]} />}
                {error && <p className="text-red-400 p-4 text-center">{error}</p>}
                {!isLoading && !error && !data && (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <p>Click the button to summarize the latest patch.</p>
                    </div>
                )}
                {data && (
                    <div className="space-y-6">
                        <p className="text-gray-300 italic text-center border-b border-slate-700 pb-4">{data.summary}</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-3">
                                <h3 className="font-bold text-lg text-green-400">Buffs</h3>
                                {data.buffs.map(b => <ChangeCard key={b.name} item={b} icon={ICONS.BUFF} />)}
                            </div>
                            <div className="space-y-3">
                                <h3 className="font-bold text-lg text-red-400">Nerfs</h3>
                                {data.nerfs.map(n => <ChangeCard key={n.name} item={n} icon={ICONS.NERF}/>)}
                            </div>
                             <div className="space-y-3">
                                <h3 className="font-bold text-lg text-blue-400">System</h3>
                                {data.systemChanges.map(s => <ChangeCard key={s.name} item={s} icon={ICONS.SYSTEM}/>)}
                            </div>
                        </div>
                        {data.sources.length > 0 && <SourceList sources={data.sources} />}
                    </div>
                )}
            </div>
        </div>
    );
};

export const Intel: React.FC<IntelProps> = ({ onLoadChampionInLab }) => {
    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-4 rounded-xl shadow-lg">
                <div className="bg-slate-700/50 text-blue-300 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <div>
                    <h1 className="font-display text-3xl font-bold text-white">AI Intel Hub</h1>
                    <p className="text-md text-gray-400">Your source for AI-powered meta analysis and patch insights.</p>
                </div>
            </div>

            <div className="space-y-6">
                <TierListDisplay onLoadChampionInLab={onLoadChampionInLab} />
                <PatchNotesDisplay />
            </div>
        </div>
    );
};