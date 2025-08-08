
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { DraftHistoryEntry, DDragonData, DraftSlot, View, MatchDTO, Role, DraftState, PerformanceAnalysis, PerformanceAnalysisInsight, Champion } from '../types';
import { ChampionIcon } from './common/ChampionIcon';
import AddOutcomeModal from './common/AddOutcomeModal';
import { geminiService } from '../services/geminiService';
import { Spinner } from './common/Spinner';
import InteractiveText from './common/InteractiveText';
import { useProfile } from '../contexts/ProfileContext';
import FullAnalysisDisplay from './common/FullAnalysisDisplay';
import { Icon } from './common/Icon';
import { riotService } from '../services/riotService';

// #region Helper Components

const TeamIcons: React.FC<{ picks: DraftSlot[], version: string }> = ({ picks, version }) => (
    <div className="flex -space-x-5">
        {picks.map((p, i) => (
            p.champion ? <ChampionIcon key={i} champion={p.champion} version={version} isClickable={false} className="w-14 h-14 border-2 border-white dark:border-slate-800 rounded-full"/> : null
        ))}
    </div>
);

const TabButton: React.FC<{ name: string; isActive: boolean; onClick: () => void; }> = ({ name, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-3 text-sm font-semibold transition-colors duration-200 border-b-2
            ${isActive
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-indigo-500'
            }`}
    >
        {name}
    </button>
);

const PerformanceAnalysisDisplay: React.FC<{ analysis: PerformanceAnalysis, onKeywordClick: (id:string) => void }> = ({ analysis, onKeywordClick }) => {
    const getEvaluationClass = (evaluation: PerformanceAnalysisInsight['evaluation']) => {
        switch (evaluation) {
            case 'Excellent': return 'border-teal-500 bg-teal-500/10 text-teal-300';
            case 'Good': return 'border-green-500 bg-green-500/10 text-green-300';
            case 'Average': return 'border-slate-500 bg-slate-500/10 text-slate-300';
            case 'Poor': return 'border-amber-500 bg-amber-500/10 text-amber-400';
            case 'Critical': return 'border-rose-500 bg-rose-500/10 text-rose-400';
            default: return 'border-slate-600';
        }
    };
    
    return (
        <div className="space-y-4 animate-fade-in">
            <div className="p-4 bg-slate-800/50 rounded-lg">
                 <h4 className="font-semibold text-lg text-slate-200 mb-2">Overall Execution Summary</h4>
                <InteractiveText onKeywordClick={onKeywordClick}>{analysis.overallExecutionSummary}</InteractiveText>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysis.insights.map(insight => (
                     <div key={insight.category} className={`p-4 rounded-lg border-l-4 ${getEvaluationClass(insight.evaluation)}`}>
                        <h5 className="font-bold text-slate-200">{insight.category} - <span className="italic">{insight.evaluation}</span></h5>
                        <p className="text-sm mt-2 text-slate-400">
                           <InteractiveText onKeywordClick={onKeywordClick}>{insight.feedback}</InteractiveText>
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const HistoryEntryCard: React.FC<{
    entry: DraftHistoryEntry;
    ddragonData: DDragonData;
    isExpanded: boolean;
    onToggle: () => void;
    onAddOutcome: (entry: DraftHistoryEntry) => void;
    onDelete: (id: string) => void;
    isLoading: boolean;
    onKeywordClick: (lessonId: string) => void;
}> = React.memo(({ entry, ddragonData, isExpanded, onToggle, onAddOutcome, onDelete, isLoading, onKeywordClick }) => {
    const [activeTab, setActiveTab] = useState<'draft' | 'performance'>('draft');

    return (
        <div className="bg-slate-100 dark:bg-slate-800/80 rounded-lg shadow-md transition-all duration-200 border border-slate-200 dark:border-slate-700 overflow-hidden">
            <button
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-900/20 w-full text-left"
                onClick={onToggle}
                aria-expanded={isExpanded}
                aria-controls={`history-details-${entry.id}`}
            >
                <div className="flex items-center gap-4">
                    <TeamIcons picks={entry.draftState.blueTeam.picks} version={ddragonData.version} />
                    <span className="text-xl font-semibold text-slate-500 dark:text-slate-400">VS</span>
                    <TeamIcons picks={entry.draftState.redTeam.picks} version={ddragonData.version} />
                </div>
                <div className="flex items-center gap-4">
                     <div className="text-right">
                        <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">{new Date(entry.date).toLocaleDateString()}</p>
                        {entry.outcome && (
                            <span className={`px-2 py-0.5 text-xs rounded-full font-semibold ${entry.outcome === 'WIN' ? 'bg-teal-600 dark:bg-teal-400 text-white dark:text-teal-950' : 'bg-rose-600 dark:bg-rose-500 text-white'}`}>
                                {entry.outcome}
                            </span>
                        )}
                        {entry.matchId && <span className="px-2 py-0.5 text-xs rounded-full font-semibold bg-indigo-600 text-white mt-1 block">Imported</span>}
                    </div>
                    <Icon name="chevron-down" className={`h-5 w-5 transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} aria-hidden="true"/>
                </div>
            </button>
            <div id={`history-details-${entry.id}`} className={`collapsible ${isExpanded ? 'expanded' : ''}`}>
                <div>
                     {entry.performanceAnalysis && (
                        <div className="flex border-b border-slate-200 dark:border-slate-700 px-2">
                            <TabButton name="Draft Analysis" isActive={activeTab === 'draft'} onClick={() => setActiveTab('draft')} />
                            <TabButton name="Performance Analysis" isActive={activeTab === 'performance'} onClick={() => setActiveTab('performance')} />
                        </div>
                    )}
                    <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-4">
                       {activeTab === 'performance' && entry.performanceAnalysis ? (
                            <PerformanceAnalysisDisplay analysis={entry.performanceAnalysis} onKeywordClick={onKeywordClick}/>
                       ) : (
                           <>
                                {entry.inDraftNotes && (
                                     <div className="p-3 rounded-lg bg-slate-200/50 dark:bg-black/20">
                                        <h4 className="font-display text-lg text-slate-700 dark:text-slate-300 mb-1">In-Draft Notes</h4>
                                        <p className="whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-400">{entry.inDraftNotes}</p>
                                    </div>
                                )}
                                {isLoading ? (
                                    <div className="flex justify-center items-center p-4"><Spinner /><p className="ml-2">AI is generating debrief...</p></div>
                                ) : entry.postGameAnalysis ? (
                                    <div className="p-3 rounded-lg bg-indigo-100/50 dark:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-700">
                                        <h4 className="font-display text-xl text-indigo-600 dark:text-indigo-400 mb-2">AI Debrief</h4>
                                        <InteractiveText onKeywordClick={onKeywordClick}>{entry.postGameAnalysis.reevaluation}</InteractiveText>
                                        {entry.postGameNotes && <p className="text-xs italic mt-2 text-slate-500 dark:text-slate-400">Your notes: "{entry.postGameNotes}"</p>}
                                        {entry.postGameAnalysis.suggestedLessonId && entry.postGameAnalysis.suggestedLessonTitle && (
                                            <div className="mt-4 p-4 bg-teal-600/10 dark:bg-teal-400/10 rounded-lg border border-teal-600/20 dark:border-teal-400/20 text-center">
                                                <h5 className="font-display text-xl text-teal-600 dark:text-teal-300">Learning Opportunity</h5>
                                                <button onClick={() => onKeywordClick(entry.postGameAnalysis!.suggestedLessonId!)} className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-teal-600 dark:bg-teal-500 text-white dark:text-teal-950 rounded-md hover:bg-teal-700 dark:hover:bg-teal-400 font-semibold transition-colors">
                                                    Learn: "{entry.postGameAnalysis.suggestedLessonTitle}"
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ) : !entry.matchId && (
                                    <button onClick={() => onAddOutcome(entry)} className="w-full py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 transition-colors duration-200">Add Outcome & Get AI Debrief</button>
                                )}
                                
                                <div className="pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-display text-xl">Original Draft Analysis</h4>
                                        <button onClick={() => onDelete(entry.id)} className="px-3 py-1.5 text-xs bg-rose-200 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300 rounded-md hover:bg-rose-300 dark:hover:bg-rose-900 font-semibold flex items-center gap-1">
                                            <Icon name="delete" className="w-3 h-3" />
                                            Delete Entry
                                        </button>
                                    </div>
                                    <FullAnalysisDisplay analysis={entry.analysis} onKeywordClick={onKeywordClick} ddragonData={ddragonData} draftState={entry.draftState} />
                                </div>
                           </>
                       )}
                    </div>
                </div>
            </div>
        </div>
    );
});

// #endregion

const HistoryScreen: React.FC<{
  ddragonData: DDragonData;
  setView: (view: View) => void;
  onNavigateToLesson: (lessonId: string) => void;
}> = ({ ddragonData, setView, onNavigateToLesson }) => {
    const { activeProfile, updateHistory } = useProfile();
    const { draftHistory = [] } = activeProfile!;
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [modalEntry, setModalEntry] = useState<DraftHistoryEntry | null>(null);
    const [loadingAnalysisId, setLoadingAnalysisId] = useState<string | null>(null);
    const [isImportModalOpen, setImportModalOpen] = useState(false);
    
    const handleToggle = (id: string) => {
        setExpandedId(prev => (prev === id ? null : id));
    };

    const handleAddOutcomeClick = (entry: DraftHistoryEntry) => {
        setModalEntry(entry);
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Are you sure you want to delete this history entry?")) {
            const newHistory = draftHistory.filter(entry => entry.id !== id);
            updateHistory(newHistory);
        }
    };
    
    const processAndSaveImportedMatch = useCallback(async (matchData: MatchDTO) => {
        if (!activeProfile) return;
        setLoadingAnalysisId(matchData.metadata.matchId);

        try {
            const getChampionByName = (name: string) => Object.values(ddragonData.champions).find(c => c.name.toLowerCase() === name.toLowerCase());
            const roleOrder: Role[] = ['TOP', 'JUNGLE', 'MIDDLE', 'BOTTOM', 'SUPPORT'];

            const bluePicks: DraftSlot[] = [];
            const redPicks: DraftSlot[] = [];

            matchData.info.participants.forEach(p => {
                const champ = getChampionByName(p.championName);
                if (!champ) return;
                const slot: DraftSlot = { champion: champ, role: 'TOP' }; // Role will be inferred from DDragon data soon
                if (p.teamId === 100) bluePicks.push(slot);
                else redPicks.push(slot);
            });
            
            const constructedDraftState: DraftState = {
                mode: 'SOLO_QUEUE',
                blueTeam: { picks: bluePicks, bans: [] }, // Bans not available in this match DTO, would need another source or leave empty
                redTeam: { picks: redPicks, bans: [] },
                currentTurn: 20,
                pickedChampions: new Set(matchData.info.participants.map(p => getChampionByName(p.championName)?.id).filter(Boolean) as string[]),
                history: [],
            };

            const draftAnalysis = await geminiService.getFullDraftAnalysis(constructedDraftState, activeProfile.settings);
            if (!draftAnalysis) throw new Error("Failed to generate initial draft analysis.");
            
            const performanceAnalysis = await geminiService.getPerformanceAnalysis(draftAnalysis, matchData, activeProfile.riotData!.puuid, ddragonData.items, activeProfile.settings);
            if (!performanceAnalysis) throw new Error("Failed to generate performance analysis.");

            const newHistoryEntry: DraftHistoryEntry = {
                id: matchData.metadata.matchId,
                matchId: matchData.metadata.matchId,
                date: new Date(matchData.info.gameCreation).toISOString(),
                outcome: matchData.info.teams.find(t => t.teamId === 100)?.win ? 'WIN' : 'LOSS',
                draftState: constructedDraftState,
                analysis: draftAnalysis,
                performanceAnalysis: performanceAnalysis
            };

            updateHistory([newHistoryEntry, ...draftHistory.filter(h => h.id !== newHistoryEntry.id)].slice(0, 50));

        } catch (err) {
            console.error("Failed to import match:", err);
            alert(`Error importing match: ${(err as Error).message}`);
        } finally {
            setLoadingAnalysisId(null);
            setImportModalOpen(false);
        }

    }, [activeProfile, ddragonData.champions, ddragonData.items, draftHistory, updateHistory]);


    const handleModalSubmit = useCallback(async (outcome: 'WIN' | 'LOSS', notes: string) => {
        if (!modalEntry || !activeProfile) return;

        setLoadingAnalysisId(modalEntry.id);
        setModalEntry(null);

        try {
            const postGameAnalysis = await geminiService.getPostGameAnalysis(
                modalEntry.draftState,
                modalEntry.analysis,
                outcome,
                notes,
                activeProfile.settings
            );

            const newHistory = draftHistory.map(h =>
                h.id === modalEntry.id
                    ? { ...h, outcome, postGameNotes: notes, postGameAnalysis: postGameAnalysis || undefined }
                    : h
            );
            updateHistory(newHistory);
        } catch (error) {
            console.error("Failed to get post-game analysis:", error);
            const newHistory = draftHistory.map(h =>
                h.id === modalEntry.id
                    ? { ...h, outcome, postGameNotes: notes }
                    : h
            );
            updateHistory(newHistory);
        } finally {
            setLoadingAnalysisId(null);
        }
    }, [modalEntry, activeProfile, draftHistory, updateHistory]);

    return (
        <div className="animate-fade-in">
            <div className="text-center mb-12">
                <h1 className="text-6xl font-display font-bold text-gradient-primary">Game History</h1>
                <p className="text-xl text-slate-500 dark:text-slate-400 mt-2">Review your past drafts, add outcomes, and get post-game AI debriefs.</p>
                 {activeProfile?.riotData?.puuid && riotService.isConfigured() && (
                    <button onClick={() => setImportModalOpen(true)} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-2 mx-auto">
                        <Icon name="plus" className="w-5 h-5"/>
                        Import Recent Match
                    </button>
                )}
            </div>
            {draftHistory.length > 0 ? (
                <div className="max-w-4xl mx-auto space-y-4">
                    {draftHistory.map((entry, index) => (
                        <div key={entry.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms`}}>
                            <HistoryEntryCard
                                entry={entry}
                                ddragonData={ddragonData}
                                isExpanded={expandedId === entry.id}
                                onToggle={() => handleToggle(entry.id)}
                                onAddOutcome={handleAddOutcomeClick}
                                onDelete={handleDelete}
                                isLoading={loadingAnalysisId === entry.id}
                                onKeywordClick={onNavigateToLesson}
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 px-6 bg-slate-100 dark:bg-slate-800/50 rounded-xl">
                    <Icon name="history" className="mx-auto h-16 w-16 text-slate-400 dark:text-slate-500" />
                    <h3 className="mt-4 text-2xl font-display font-semibold text-slate-800 dark:text-slate-200">Your History Awaits</h3>
                    <p className="mt-2 text-md text-slate-500 dark:text-slate-400 max-w-md mx-auto">Complete a live draft session and save it, or import a recent match to see your first AI-powered analysis.</p>
                </div>
            )}
            <AddOutcomeModal
                isOpen={!!modalEntry}
                onClose={() => setModalEntry(null)}
                onSubmit={handleModalSubmit}
            />
             <ImportMatchModal 
                isOpen={isImportModalOpen}
                onClose={() => setImportModalOpen(false)}
                onImport={processAndSaveImportedMatch}
                ddragonData={ddragonData}
                loadingId={loadingAnalysisId}
            />
        </div>
    );
};


const ImportMatchModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onImport: (match: MatchDTO) => void;
    ddragonData: DDragonData;
    loadingId: string | null;
}> = ({ isOpen, onClose, onImport, ddragonData, loadingId }) => {
    const { activeProfile } = useProfile();
    const [recentMatches, setRecentMatches] = useState<MatchDTO[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchMatches = useCallback(async () => {
        if (!activeProfile?.riotData) return;
        setIsLoading(true);
        setError(null);
        setRecentMatches([]);
        try {
            const matchIds = await riotService.getMatchIdsByPuuid(activeProfile.riotData.puuid, activeProfile.riotData.region, 10);
            const matchPromises = matchIds.map(id => riotService.getMatchData(id, activeProfile.riotData!.region));
            const matches = await Promise.all(matchPromises);
            setRecentMatches(matches);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setIsLoading(false);
        }
    }, [activeProfile]);
    
    useEffect(() => {
        if (isOpen) {
            fetchMatches();
        }
    }, [isOpen, fetchMatches]);

    if (!isOpen) return null;

    const getChampionByName = (name: string): Champion | null => {
        return Object.values(ddragonData.champions).find(c => c.name.toLowerCase() === name.toLowerCase()) || null;
    }

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in" onClick={onClose}>
            <div className="glass-effect rounded-lg shadow-2xl p-6 w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-display mb-4 text-slate-800 dark:text-slate-200">Import Recent Match</h2>
                {isLoading && <div className="flex justify-center p-8"><Spinner /></div>}
                {error && <p className="text-center text-rose-400 p-4">{error}</p>}
                <div className="space-y-3 max-h-[70vh] overflow-y-auto">
                    {recentMatches.map(match => {
                        const userParticipant = match.info.participants.find(p => p.puuid === activeProfile?.riotData?.puuid);
                        const userChampion = userParticipant ? getChampionByName(userParticipant.championName) : null;
                        const isImportingThis = loadingId === match.metadata.matchId;

                        return (
                            <div key={match.metadata.matchId} className="flex items-center gap-4 p-3 bg-slate-800/50 rounded-lg">
                                {userChampion && <ChampionIcon champion={userChampion} version={ddragonData.version} isClickable={false} className="w-12 h-12 flex-shrink-0" />}
                                <div className="flex-grow">
                                    <p className={`font-bold ${userParticipant?.win ? 'text-teal-400' : 'text-rose-400'}`}>{userParticipant?.win ? 'Victory' : 'Defeat'}</p>
                                    <p className="text-xs text-slate-400">{match.info.gameMode.replace(/_/g, ' ')} - {new Date(match.info.gameCreation).toLocaleString()}</p>
                                </div>
                                <button onClick={() => onImport(match)} disabled={isImportingThis} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50">
                                    {isImportingThis ? <Spinner size="h-4 w-4"/> : 'Import'}
                                </button>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};


export default HistoryScreen;
