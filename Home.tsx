
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, DDragonData, KnowledgeConcept, MetaSnapshot, GroundingSource, Champion, DraftPuzzle, PuzzleOption } from './types';
import { KNOWLEDGE_BASE } from './data/knowledgeBase';
import { useProfile } from './contexts/ProfileContext';
import { ChampionIcon } from './components/common/ChampionIcon';
import { Icon } from './components/common/Icon';
import { geminiService } from './services/geminiService';
import { Spinner } from './components/common/Spinner';
import { getChampionStaticInfoById } from './data/gameData';

const PrimaryActions: React.FC<{ setView: (view: View) => void }> = ({ setView }) => {
    const secondaryActions = [
        { view: View.DRAFT_LAB, icon: 'lab' as const, title: 'The Forge', description: 'Experiment with compositions.' },
        { view: View.HISTORY, icon: 'history' as const, title: 'Review History', description: 'Analyze past games.' },
        { view: View.PLAYBOOK, icon: 'playbook' as const, title: 'Playbook', description: 'Access saved strategies.' },
    ];

    return (
        <section aria-labelledby="primary-actions-title">
            <h2 id="primary-actions-title" className="sr-only">Primary Actions</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <button 
                    onClick={() => setView(View.DRAFTING)}
                    className="group p-8 text-left bg-primary-gradient text-white rounded-2xl shadow-2xl shadow-indigo-500/20 transition-all duration-300 transform hover:-translate-y-1 flex flex-col"
                >
                    <Icon name="draft" className="w-12 h-12 mb-4 text-indigo-300 transition-transform duration-300 group-hover:scale-110" />
                    <h3 className="font-display text-4xl font-semibold">Live Draft Arena</h3>
                    <p className="text-indigo-200 mt-1 flex-grow">Enter a live draft for real-time AI suggestions and analysis.</p>
                </button>
                <div className="space-y-4">
                    {secondaryActions.map(action => (
                         <button 
                            key={action.view}
                            onClick={() => setView(action.view)}
                            className="w-full group p-6 text-left bg-slate-100 dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-600 dark:hover:border-indigo-500 transition-all duration-300 transform hover:-translate-y-1"
                        >
                            <div className="flex items-center gap-4">
                                <Icon name={action.icon} className="w-8 h-8 text-indigo-500"/>
                                <div>
                                    <h3 className="font-display text-2xl font-semibold text-slate-800 dark:text-slate-200">{action.title}</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">{action.description}</p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
};

const DailyPuzzleWidget: React.FC<{ ddragonData: DDragonData }> = ({ ddragonData }) => {
    const { activeProfile, onProgressUpdate } = useProfile();
    const [puzzle, setPuzzle] = useState<DraftPuzzle | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedOption, setSelectedOption] = useState<PuzzleOption | null>(null);
    
    const fetchPuzzle = useCallback(async () => {
        if (!activeProfile) return;
        setIsLoading(true);
        setError(null);
        setSelectedOption(null);
        try {
            const today = new Date().toISOString().split('T')[0];
            const cachedPuzzleRaw = localStorage.getItem(`draftwise_puzzle_${today}`);
            if (cachedPuzzleRaw) {
                setPuzzle(JSON.parse(cachedPuzzleRaw));
            } else {
                const newPuzzle = await geminiService.getDailyDraftPuzzle(activeProfile.settings);
                if (newPuzzle) {
                    setPuzzle(newPuzzle);
                    localStorage.setItem(`draftwise_puzzle_${today}`, JSON.stringify(newPuzzle));
                } else {
                    setError("Could not retrieve today's puzzle. The Oracle is resting.");
                }
            }
        } catch (err) {
            console.error(err);
            setError("An error occurred while fetching the puzzle.");
        } finally {
            setIsLoading(false);
        }
    }, [activeProfile]);

    useEffect(() => {
        fetchPuzzle();
    }, [fetchPuzzle]);

    const handleSelectOption = (option: PuzzleOption) => {
        setSelectedOption(option);
        if (option.isCorrect) {
            onProgressUpdate('trial', puzzle!.id, 75);
        }
    };

    if (isLoading) {
        return <div className="flex items-center justify-center p-8 h-full bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700"><Spinner /> <span className="ml-4 text-slate-500 dark:text-slate-400">Forging Daily Puzzle...</span></div>
    }

    if (error || !puzzle) {
        return <div className="p-8 h-full bg-rose-600/10 text-rose-600 dark:bg-rose-500/10 dark:text-rose-500 rounded-2xl border border-rose-500/20 text-center">{error || "No puzzle available."}</div>
    }
    
    const getChampion = (name: string) => Object.values(ddragonData.champions).find(c => c.name === name);

    return (
        <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col h-full">
             <h3 className="font-display text-2xl text-amber-500 dark:text-amber-400">Daily Puzzle</h3>
             <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">{puzzle.scenario}</p>
             <p className="p-3 mb-4 text-center font-semibold bg-slate-200 dark:bg-slate-900/70 rounded-md border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200">"{puzzle.problem}"</p>
             
             <div className="flex-grow space-y-2">
                 {puzzle.options.map(option => {
                     const champion = getChampion(option.championName);
                     const isSelected = selectedOption?.championName === option.championName;
                     const isCorrect = option.isCorrect;

                     return (
                         <div key={option.championName}>
                             <button
                                 onClick={() => handleSelectOption(option)}
                                 disabled={!!selectedOption}
                                 className={`w-full flex items-center gap-3 p-2 rounded-md transition-all duration-200 border-2 disabled:cursor-not-allowed
                                     ${!selectedOption ? 'bg-slate-200/50 dark:bg-slate-700/50 border-transparent hover:bg-slate-200 dark:hover:bg-slate-600/50 hover:border-indigo-500 dark:hover:border-indigo-400' : 'border-transparent'}
                                     ${isSelected && isCorrect ? 'bg-teal-600/20 dark:bg-teal-400/20 border-teal-600 dark:border-teal-400' : ''}
                                     ${isSelected && !isCorrect ? 'bg-rose-600/20 dark:bg-rose-500/20 border-rose-600 dark:border-rose-500' : ''}
                                     ${selectedOption && !isSelected ? 'opacity-50' : ''}
                                 `}
                            >
                                 {champion && <ChampionIcon champion={champion} version={ddragonData.version} isClickable={false} className="w-10 h-10 flex-shrink-0" />}
                                 <span className="font-semibold">{option.championName}</span>
                             </button>
                             {isSelected && (
                                <div className="text-xs p-2 mt-1 rounded-md bg-slate-200 dark:bg-black/30 animate-pop-in">
                                    <p>{option.reasoning}</p>
                                </div>
                             )}
                         </div>
                     )
                 })}
             </div>
             
             {selectedOption && (
                <button onClick={fetchPuzzle} className="w-full mt-4 text-center text-sm p-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-md">
                    Another Puzzle
                </button>
             )}
        </div>
    );
};

const LearningPathWidget: React.FC<{ setView: (view: View) => void }> = ({ setView }) => {
    const { activeProfile } = useProfile();
    const { settings } = activeProfile!;

    const nextLesson = useMemo(() => {
        return KNOWLEDGE_BASE.find(lesson => !settings.completedLessons.includes(lesson.id))
    }, [settings.completedLessons]);

    return (
        <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col h-full">
            <h3 className="font-display text-2xl text-slate-800 dark:text-slate-200">Your Learning Path</h3>
            <div className="flex-grow flex flex-col items-center justify-center text-center">
                 <Icon name="lessons" className="w-16 h-16 text-indigo-600 dark:text-indigo-500 mb-2" />
                {nextLesson ? (
                    <>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Next Tome of Knowledge:</p>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{nextLesson.title}</p>
                    </>
                ) : (
                    <p className="text-teal-600 dark:text-teal-400 font-semibold">All tomes read!</p>
                )}
            </div>
            <button onClick={() => setView(View.LESSONS)} className="w-full mt-4 p-2 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-400 text-white font-semibold rounded-md">
                Go to The Academy
            </button>
        </div>
    )
};

const MetaSnapshotWidget: React.FC<{ ddragonData: DDragonData }> = ({ ddragonData }) => {
    const { activeProfile } = useProfile();
    const [snapshot, setSnapshot] = useState<MetaSnapshot | null>(null);
    const [sources, setSources] = useState<GroundingSource[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMeta = async () => {
            if (!activeProfile) return;

            const CACHE_KEY = 'draftwise_meta_snapshot';
            const CACHE_DURATION_MS = 4 * 60 * 60 * 1000; // 4 hours

            try {
                const cachedDataRaw = localStorage.getItem(CACHE_KEY);
                if (cachedDataRaw) {
                    const cachedData = JSON.parse(cachedDataRaw);
                    if (Date.now() - cachedData.timestamp < CACHE_DURATION_MS) {
                        setSnapshot(cachedData.data);
                        setSources(cachedData.sources);
                        setIsLoading(false);
                        return;
                    }
                }
            } catch (e) {
                console.error("Failed to read meta snapshot from cache", e);
            }

            try {
                const result = await geminiService.getMetaSnapshot(activeProfile.settings);
                if (result?.data) {
                    const snapshotData = result.data;
                    const snapshotSources = (result.sources as GroundingSource[]) || [];
                    setSnapshot(snapshotData);
                    setSources(snapshotSources);
                    
                    const cachePayload = {
                        data: snapshotData,
                        sources: snapshotSources,
                        timestamp: Date.now()
                    };
                    localStorage.setItem(CACHE_KEY, JSON.stringify(cachePayload));

                } else {
                    setError("Could not retrieve meta snapshot.");
                }
            } catch (err) {
                console.error(err);
                setError("An error occurred while fetching meta data.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchMeta();
    }, [activeProfile]);
    
    const ChampionTrend: React.FC<{name: string, reason: string}> = ({ name, reason }) => {
        const champion = Object.values(ddragonData.champions).find(c => c.name === name);
        if (!champion) return <div className="text-sm text-slate-500 dark:text-slate-400">Could not find {name}</div>;

        return (
            <div className="flex items-center gap-3">
                <ChampionIcon champion={champion} version={ddragonData.version} isClickable={false} className="w-10 h-10 flex-shrink-0"/>
                <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{reason}</p>
                </div>
            </div>
        );
    }
    
    if (isLoading) {
        return <div className="flex items-center justify-center p-8 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700"><Spinner /> <span className="ml-4 text-slate-500 dark:text-slate-400">Loading Meta Snapshot...</span></div>
    }
    
    if (error || !snapshot) {
        return <div className="p-8 bg-rose-600/10 text-rose-600 dark:bg-rose-500/10 dark:text-rose-500 rounded-2xl border border-rose-600/20 dark:border-rose-500/20 text-center">{error || "No data available."}</div>
    }

    return (
        <section aria-labelledby="meta-snapshot-title" className="bg-slate-100 dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
            <h2 id="meta-snapshot-title" className="font-display text-3xl mb-4 text-slate-800 dark:text-slate-200">Live Meta Snapshot</h2>
            <div className="mb-4">
                <p className="text-sm text-slate-800 dark:text-slate-300 font-semibold mb-2">Patch Summary:</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{snapshot.patchSummary}</p>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-3">
                     <h4 className="font-semibold text-teal-600 dark:text-teal-400">📈 Trending Up</h4>
                     {snapshot.trendingUp.map(c => <ChampionTrend key={c.championName} name={c.championName} reason={c.reason} />)}
                 </div>
                 <div className="space-y-3">
                    <h4 className="font-semibold text-rose-600 dark:text-rose-500">📉 Trending Down</h4>
                     {snapshot.trendingDown.map(c => <ChampionTrend key={c.championName} name={c.championName} reason={c.reason} />)}
                 </div>
             </div>
             {sources.length > 0 && (
                <div className="mt-4 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-500 dark:text-slate-500">
                        Data sourced from: {sources.map((s, i) => <a key={i} href={s.web.uri} target="_blank" rel="noopener noreferrer" className="underline hover:text-indigo-500 dark:hover:text-indigo-400">{s.web.title || new URL(s.web.uri).hostname}</a>).reduce((prev, curr) => <>{prev}, {curr}</>)}
                    </p>
                </div>
             )}
        </section>
    );
};


const Home: React.FC<{ setView: (view: View) => void, ddragonData: DDragonData }> = ({ setView, ddragonData }) => {
  const { activeProfile } = useProfile();

  return (
    <div className="space-y-8">
        <div className="text-left pt-4 pb-2">
            <h1 className="text-5xl md:text-6xl font-display tracking-tight text-gradient-primary">
                Dashboard
            </h1>
            <p className="mt-2 text-lg md:text-xl text-slate-500 dark:text-slate-400">
                Welcome back, {activeProfile?.name}. Let's get started.
            </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
            {/* Main content column */}
            <div className="lg:col-span-3 space-y-8">
                <PrimaryActions setView={setView} />
                <MetaSnapshotWidget ddragonData={ddragonData} />
            </div>

            {/* Sidebar column */}
            <div className="lg:col-span-2 space-y-8">
                <DailyPuzzleWidget ddragonData={ddragonData} />
                <LearningPathWidget setView={setView} />
            </div>
        </div>
    </div>
  );
};

export default Home;
