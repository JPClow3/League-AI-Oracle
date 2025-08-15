
import React, { useState } from 'react';
import type { HistoryEntry, DraftState, Page } from '../../types';
import { CHAMPIONS } from '../../constants';
import { Button } from '../common/Button';
import { PlaybookDetailModal } from './PlaybookDetailModal';
import { ConfirmationModal, ConfirmationState } from '../common/ConfirmationModal';
import { usePlaybook } from '../../hooks/usePlaybook';
import { Loader } from '../common/Loader';

// --- Playbook Component ---

interface PlaybookCardProps {
    entry: HistoryEntry;
    onViewDetails: (entry: HistoryEntry) => void;
}

const PlaybookCard: React.FC<PlaybookCardProps> = ({ entry, onViewDetails }) => {
    const getChampNames = (ids: (string | null)[]) => {
        return ids.map(id => {
            if (!id) return '?';
            const champ = CHAMPIONS.find(c => c.id === id);
            return champ?.name || '?';
        }).join(', ');
    };
    
    return (
        <div className="group relative bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl shadow-lg p-6 flex flex-col justify-between hover:border-cyan-500/80 transition-all duration-300 transform hover:-translate-y-1">
             {/* Subtle glow effect on hover */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top,_rgba(29,78,216,0.15),_transparent_40%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
            <div className="relative z-10">
                <h3 className="text-xl font-bold text-cyan-300">{entry.name}</h3>
                <p className="text-xs text-gray-400 mb-4">Saved on {new Date(entry.createdAt).toLocaleDateString()}</p>
                <div className="text-sm space-y-2 border-l-2 border-slate-700 pl-3">
                    <div>
                        <strong className="text-blue-400">Blue:</strong> {getChampNames(entry.draft.blue.picks)}
                    </div>
                    <div>
                        <strong className="text-red-400">Red:</strong> {getChampNames(entry.draft.red.picks)}
                    </div>
                </div>
            </div>
            <div className="relative z-10 mt-6 flex gap-2">
                <Button variant="primary" onClick={() => onViewDetails(entry)}>View Details</Button>
            </div>
        </div>
    );
};

interface PlaybookProps {
    onLoadDraft: (draft: DraftState) => void;
    setCurrentPage: (page: Page) => void;
    navigateToAcademy: (lessonId: string) => void;
}

export const Playbook: React.FC<PlaybookProps> = ({ onLoadDraft, setCurrentPage, navigateToAcademy }) => {
    const { entries, deleteEntry, updateNotes, isLoading } = usePlaybook();
    const [viewingEntry, setViewingEntry] = useState<HistoryEntry | null>(null);
    const [confirmationState, setConfirmationState] = useState<ConfirmationState | null>(null);

    const handleDelete = (id: string) => {
        const entryToDelete = entries.find(entry => entry.id === id);
        if (!entryToDelete) return;

        setConfirmationState({
            title: "Delete Draft?",
            message: `Are you sure you want to permanently delete the draft "${entryToDelete.name}"? This action cannot be undone.`,
            onConfirm: () => deleteEntry(id)
        });
    };
    
    const handleSaveNotes = (id: string, notes: string) => {
        updateNotes(id, notes);
        // Also update the currently viewed entry to reflect changes immediately
        setViewingEntry(prev => prev && prev.id === id ? { ...prev, userNotes: notes } : prev);
    };

    return (
        <div className="space-y-6">
            <ConfirmationModal 
                isOpen={!!confirmationState}
                onClose={() => setConfirmationState(null)}
                state={confirmationState}
            />
            <div className="flex items-center gap-4 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-4 rounded-xl shadow-lg">
                <div className="bg-slate-700/50 text-blue-300 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
                </div>
                <div>
                    <h1 className="font-display text-3xl font-bold text-white">Playbook</h1>
                    <p className="text-sm text-gray-400">Your saved draft strategies and team compositions.</p>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center py-16">
                    <Loader messages={['Loading Playbook...']} />
                </div>
            ) : entries.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {entries.map(entry => (
                        <PlaybookCard key={entry.id} entry={entry} onViewDetails={setViewingEntry} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-slate-800 rounded-lg border border-slate-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-slate-600" fill="none" viewBox="0 0 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    <h3 className="mt-4 text-xl font-semibold text-white">Your Playbook is Empty</h3>
                    <p className="mt-2 text-gray-400 max-w-md mx-auto">Create compositions in the Draft Lab or practice in the Arena, then save them here to build your strategic library.</p>
                    <div className="mt-6 flex justify-center gap-4">
                        <Button variant="primary-glow" onClick={() => setCurrentPage('Draft Lab')}>
                            Go to Draft Lab
                        </Button>
                        <Button variant="secondary" onClick={() => setCurrentPage('Arena')}>
                            Go to Arena
                        </Button>
                    </div>
                </div>
            )}
             <PlaybookDetailModal
                isOpen={!!viewingEntry}
                onClose={() => setViewingEntry(null)}
                entry={viewingEntry}
                onLoad={onLoadDraft}
                onDelete={handleDelete}
                onSaveNotes={handleSaveNotes}
                navigateToAcademy={navigateToAcademy}
            />
        </div>
    );
};
