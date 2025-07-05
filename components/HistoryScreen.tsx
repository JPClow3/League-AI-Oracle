import React, { useState, useCallback } from 'react';
import { DraftHistoryEntry, DDragonData, DraftSlot, View } from '../types';
import { ChampionIcon } from './common/ChampionIcon';
import AddOutcomeModal from './common/AddOutcomeModal';
import { geminiService } from '../services/geminiService';
import { Spinner } from './common/Spinner';
import InteractiveText from './common/InteractiveText';
import { useProfile } from '../contexts/ProfileContext';
import FullAnalysisDisplay from './common/FullAnalysisDisplay';
import { Icon } from './common/Icon';

interface HistoryScreenProps {
  ddragonData: DDragonData;
  setView: (view: View) => void;
  onNavigateToLesson: (lessonId: string) => void;
}

const TeamIcons: React.FC<{ picks: DraftSlot[], version: string }> = ({ picks, version }) => (
    <div className="flex -space-x-6">
        {picks.map((p, i) => (
            p.champion ? <ChampionIcon key={i} champion={p.champion} version={version} isClickable={false} className="w-16 h-16 border-2 border-white dark:border-slate-800 rounded-full"/> : null
        ))}
    </div>
);

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
                    </div>
                    <Icon name="chevron-down" className={`h-5 w-5 transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} aria-hidden="true"/>
                </div>
            </button>

            {/* Expanded View */}
            <div id={`history-details-${entry.id}`} className={`collapsible ${isExpanded ? 'expanded' : ''}`}>
                <div>
                    <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-4">
                        {entry.inDraftNotes && (
                             <div className="p-3 rounded-lg bg-slate-200/50 dark:bg-black/20">
                                <h4 className="font-display text-lg text-slate-700 dark:text-slate-300 mb-1">In-Draft Notes</h4>
                                <p className="whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-400">{entry.inDraftNotes}</p>
                            </div>
                        )}

                        {/* Post-Game Debrief */}
                        {isLoading ? (
                            <div className="flex justify-center items-center p-4"><Spinner /><p className="ml-2">AI is generating debrief...</p></div>
                        ) : entry.postGameAnalysis ? (
                            <div className="p-3 rounded-lg bg-indigo-100/50 dark:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-700">
                                <h4 className="font-display text-xl text-indigo-600 dark:text-indigo-400 mb-2">AI Debrief</h4>
                                <InteractiveText onKeywordClick={onKeywordClick}>{entry.postGameAnalysis.reevaluation}</InteractiveText>
                                {entry.postGameNotes && <p className="text-xs italic mt-2 text-slate-500 dark:text-slate-400">Your notes: "{entry.postGameNotes}"</p>}
                                {entry.postGameAnalysis.suggestedLessonId && entry.postGameAnalysis.suggestedLessonTitle && (
                                    <div className="mt-4 p-4 bg-teal-600/10 dark:bg-teal-400/10 rounded-lg border border-teal-600/20 dark:border-teal-400/20 text-center">
                                        <div className="flex justify-center items-center gap-2">
                                            <Icon name="info" className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                                            <h5 className="font-display text-xl text-teal-600 dark:text-teal-300">Learning Opportunity</h5>
                                        </div>
                                        <p className="text-sm text-slate-800 dark:text-slate-300 my-2">Based on this game, the Oracle recommends reviewing this lesson:</p>
                                        <button 
                                            onClick={() => onKeywordClick(entry.postGameAnalysis!.suggestedLessonId!)}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 dark:bg-teal-500 text-white dark:text-teal-950 rounded-md hover:bg-teal-700 dark:hover:bg-teal-400 font-semibold transition-colors transform hover:scale-105"
                                        >
                                            <Icon name="lessons" className="w-4 h-4" />
                                            Learn: "{entry.postGameAnalysis.suggestedLessonTitle}"
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button onClick={() => onAddOutcome(entry)} className="w-full py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 transition-colors duration-200">Add Outcome & Get AI Debrief</button>
                        )}
                        
                        <div className="pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-display text-xl">Original Analysis</h4>
                                <button onClick={() => onDelete(entry.id)} className="text-xs text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 font-semibold flex items-center gap-1">
                                    <Icon name="delete" className="w-3 h-3" />
                                    Delete Entry
                                </button>
                            </div>
                            <FullAnalysisDisplay analysis={entry.analysis} onKeywordClick={onKeywordClick} ddragonData={ddragonData} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

const HistoryScreen: React.FC<HistoryScreenProps> = ({ ddragonData, setView, onNavigateToLesson }) => {
    const { activeProfile, updateHistory } = useProfile();
    const { draftHistory = [] } = activeProfile!;
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [modalEntry, setModalEntry] = useState<DraftHistoryEntry | null>(null);
    const [loadingAnalysisId, setLoadingAnalysisId] = useState<string | null>(null);

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
            // Still update history with outcome and notes even if AI fails
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
                    <p className="mt-2 text-md text-slate-500 dark:text-slate-400 max-w-md mx-auto">Complete a live draft session and save it to see your first AI-powered analysis right here.</p>
                    <button
                      onClick={() => setView(View.DRAFTING)}
                      className="mt-6 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105"
                    >
                      Start a Live Draft
                    </button>
                </div>
            )}
            <AddOutcomeModal
                isOpen={!!modalEntry}
                onClose={() => setModalEntry(null)}
                onSubmit={handleModalSubmit}
            />
        </div>
    );
};

export default HistoryScreen;