import React, { useState } from 'react';
import { PlaybookEntry, DDragonData, View, DraftState, CompositionDeconstruction } from '../types';
import { ChampionIcon } from './common/ChampionIcon';
import { useProfile } from '../contexts/ProfileContext';
import { Icon } from './common/Icon';
import FullAnalysisDisplay from './common/FullAnalysisDisplay';
import CompositionDeconstructionDisplay from './common/CompositionDeconstructionDisplay';
import { geminiService } from '../services/geminiService';
import { isChampion } from '../utils/typeGuards';
import { Spinner } from './common/Spinner';

const PlaybookScreen: React.FC<{
  ddragonData: DDragonData;
  setView: (view: View) => void;
  loadDraftInLab: (draftState: DraftState) => void;
}> = ({ ddragonData, setView, loadDraftInLab }) => {
    const { activeProfile, deleteFromPlaybook, updatePlaybookEntry } = useProfile();
    const { playbook = [] } = activeProfile!;
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [loadingDeconstructionId, setLoadingDeconstructionId] = useState<string | null>(null);

    const handleDelete = (id: string) => {
        if (window.confirm("Are you sure you want to delete this playbook entry?")) {
            deleteFromPlaybook(id);
        }
    };

    const handleToggle = (id: string) => {
        setExpandedId(prev => (prev === id ? null : id));
    };
    
    const handleDeconstruct = async (entry: PlaybookEntry) => {
        if (!activeProfile) return;
        setLoadingDeconstructionId(entry.id);
        const blueTeamChamps = entry.draftState.blueTeam.picks.map(p => p.champion).filter(isChampion);
        
        if (blueTeamChamps.length < 5) {
            alert("Blue team must have 5 champions to deconstruct this strategy.");
            setLoadingDeconstructionId(null);
            return;
        }

        try {
            const result = await geminiService.getCompositionDeconstruction(blueTeamChamps, activeProfile.settings);
            if (result) {
                updatePlaybookEntry(entry.id, { deconstruction: result });
            } else {
                throw new Error("Received no result from the AI.");
            }
        } catch (error) {
            console.error("Failed to get deconstruction:", error);
            alert("The Oracle could not deconstruct this composition at this time.");
        } finally {
            setLoadingDeconstructionId(null);
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="text-center mb-12">
                <h1 className="text-6xl font-display font-bold text-gradient-primary">Commander's Playbook</h1>
                <p className="text-xl text-slate-500 dark:text-slate-400 mt-2">Your saved collection of powerful strategies and compositions.</p>
            </div>
            {playbook.length > 0 ? (
                <div className="max-w-4xl mx-auto space-y-4">
                    {playbook.map((entry) => (
                         <div key={entry.id} className="bg-white dark:bg-slate-800/80 rounded-lg shadow-md transition-all duration-200 border border-slate-200 dark:border-slate-700 overflow-hidden">
                            {/* Card Header */}
                            <div
                                className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-900/20"
                                onClick={() => handleToggle(entry.id)}
                            >
                                <div className="flex-1">
                                    <h3 className="font-display text-2xl font-semibold text-slate-800 dark:text-slate-200">{entry.name}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{entry.description || 'No description provided.'}</p>
                                </div>
                                <div className="flex -space-x-4 ml-4">
                                     {entry.draftState.blueTeam.picks.slice(0, 5).map((p, i) => (p.champion ? <ChampionIcon key={`b-${i}`} champion={p.champion} version={ddragonData.version} isClickable={false} className="w-12 h-12 border-2 border-white dark:border-slate-800 rounded-full" /> : null))}
                                </div>
                                <Icon name="chevron-down" className={`h-5 w-5 ml-4 transform transition-transform duration-200 ${expandedId === entry.id ? 'rotate-180' : ''}`} aria-hidden="true"/>
                            </div>
                            
                            {/* Collapsible Body */}
                             <div className={`collapsible ${expandedId === entry.id ? 'expanded' : ''}`}>
                                 <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-4">
                                     
                                     {/* Deconstruction Section */}
                                     <div>
                                         <h4 className="font-display text-2xl mb-2 text-slate-800 dark:text-slate-200">Blue Team Deconstruction</h4>
                                         {entry.deconstruction ? (
                                             <CompositionDeconstructionDisplay deconstruction={entry.deconstruction} ddragonData={ddragonData} onKeywordClick={() => {}} />
                                         ) : (
                                             <button onClick={() => handleDeconstruct(entry)} disabled={loadingDeconstructionId === entry.id} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors disabled:opacity-60">
                                                 {loadingDeconstructionId === entry.id ? (
                                                     <> <Spinner size="h-5 w-5"/> Deconstructing... </>
                                                 ) : (
                                                     <> <Icon name="brain" className="w-5 h-5"/> Generate AI Strategy Breakdown </>
                                                 )}
                                             </button>
                                         )}
                                     </div>

                                     {/* Original Analysis Section */}
                                     <details className="pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                                         <summary className="font-display text-xl cursor-pointer text-slate-800 dark:text-slate-200">Original 10-Player Draft Analysis</summary>
                                         <div className="mt-2">
                                            <FullAnalysisDisplay analysis={entry.analysis} onKeywordClick={() => {}} ddragonData={ddragonData} draftState={entry.draftState} />
                                         </div>
                                     </details>
                                     
                                     {/* Actions */}
                                     <div className="flex gap-2 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                                        <button onClick={() => loadDraftInLab(entry.draftState)} className="flex-1 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-semibold">Load in Forge</button>
                                        <button onClick={() => handleDelete(entry.id)} className="px-3 py-1.5 text-sm bg-rose-200 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300 rounded-md hover:bg-rose-300 dark:hover:bg-rose-900">Delete</button>
                                     </div>
                                 </div>
                             </div>
                         </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 px-6 bg-slate-100 dark:bg-slate-800/50 rounded-xl">
                    <Icon name="target" className="mx-auto h-16 w-16 text-slate-400 dark:text-slate-500" />
                    <h3 className="mt-4 text-2xl font-display font-semibold text-slate-800 dark:text-slate-200">Create Your First Strategy</h3>
                    <p className="mt-2 text-md text-slate-500 dark:text-slate-400 max-w-md mx-auto">Use The Forge to build powerful compositions and save your best ideas to the playbook.</p>
                    <button
                        onClick={() => setView(View.DRAFT_LAB)}
                        className="mt-6 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105"
                    >
                        Open The Forge
                    </button>
                </div>
            )}
        </div>
    );
};

export default PlaybookScreen;