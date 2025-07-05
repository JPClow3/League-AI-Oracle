import React from 'react';
import { PlaybookEntry, DDragonData, View, DraftState } from '../types';
import { ChampionIcon } from './common/ChampionIcon';
import { useProfile } from '../contexts/ProfileContext';
import { Icon } from './common/Icon';

interface PlaybookScreenProps {
  ddragonData: DDragonData;
  setView: (view: View) => void;
  loadDraftInLab: (draftState: DraftState) => void;
}

const PlaybookEntryCard: React.FC<{
    entry: PlaybookEntry;
    ddragonData: DDragonData;
    onLoad: (draftState: DraftState) => void;
    onDelete: (id: string) => void;
}> = ({ entry, ddragonData, onLoad, onDelete }) => {
    return (
        <div className="bg-white dark:bg-slate-800/80 rounded-lg shadow-md transition-all duration-200 border border-slate-200 dark:border-slate-700 flex flex-col">
            <div className="p-4 flex-grow">
                <h3 className="font-display text-2xl font-semibold text-slate-800 dark:text-slate-200">{entry.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 h-10 overflow-hidden">{entry.description || 'No description provided.'}</p>
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-blue-500 w-10">BLUE</span>
                        <div className="flex -space-x-5">
                            {entry.draftState.blueTeam.picks.map((p, i) => (p.champion ? <ChampionIcon key={`b-${i}`} champion={p.champion} version={ddragonData.version} isClickable={false} className="w-16 h-16 border-2 border-white dark:border-slate-800 rounded-full" /> : null))}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-red-500 w-10">RED</span>
                        <div className="flex -space-x-5">
                             {entry.draftState.redTeam.picks.map((p, i) => (p.champion ? <ChampionIcon key={`r-${i}`} champion={p.champion} version={ddragonData.version} isClickable={false} className="w-16 h-16 border-2 border-white dark:border-slate-800 rounded-full" /> : null))}
                        </div>
                    </div>
                </div>
            </div>
            <div className="p-2 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex gap-2">
                <button onClick={() => onLoad(entry.draftState)} className="flex-1 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-semibold">Load in Lab</button>
                <button onClick={() => onDelete(entry.id)} className="px-3 py-1.5 text-sm bg-rose-200 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300 rounded-md hover:bg-rose-300 dark:hover:bg-rose-900">Delete</button>
            </div>
        </div>
    );
};


const PlaybookScreen: React.FC<PlaybookScreenProps> = ({ ddragonData, setView, loadDraftInLab }) => {
    const { activeProfile, deleteFromPlaybook } = useProfile();
    const { playbook = [] } = activeProfile!;

    const handleDelete = (id: string) => {
        if (window.confirm("Are you sure you want to delete this playbook entry?")) {
            deleteFromPlaybook(id);
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="text-center mb-12">
                <h1 className="text-6xl font-display font-bold">Commander's Playbook</h1>
                <p className="text-xl text-slate-500 mt-2">Your saved collection of powerful strategies and compositions.</p>
            </div>
            {playbook.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {playbook.map((entry, index) => (
                        <div key={entry.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms`}}>
                            <PlaybookEntryCard
                                entry={entry}
                                ddragonData={ddragonData}
                                onLoad={loadDraftInLab}
                                onDelete={handleDelete}
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 px-6 bg-slate-100 dark:bg-slate-800/50 rounded-xl">
                    <Icon name="playbook" className="mx-auto h-16 w-16 text-slate-400 dark:text-slate-500" />
                    <h3 className="mt-4 text-2xl font-display font-semibold text-slate-800 dark:text-slate-200">Create Your First Strategy</h3>
                    <p className="mt-2 text-md text-slate-500 dark:text-slate-400 max-w-md mx-auto">Use the Draft Lab to build powerful compositions and save your best ideas to the playbook.</p>
                    <button
                        onClick={() => setView(View.DRAFT_LAB)}
                        className="mt-6 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105"
                    >
                        Open the Lab
                    </button>
                </div>
            )}
        </div>
    );
};

export default PlaybookScreen;