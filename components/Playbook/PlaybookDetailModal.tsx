
import React, { useState, useEffect, useMemo } from 'react';
import type { HistoryEntry, DraftState } from '../../types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { AdvicePanel } from '../DraftLab/AdvicePanel';
import { fromSavedDraft } from '../../lib/draftUtils';
import toast from 'react-hot-toast';

interface PlaybookDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    entry: HistoryEntry | null;
    onLoad: (draft: DraftState) => void;
    onDelete: (id: string) => void;
    onSaveNotes: (id: string, notes: string) => void;
    navigateToAcademy: (lessonId: string) => void;
}

const DraftDisplay: React.FC<{ draft: DraftState, analysis: HistoryEntry['analysis'] }> = ({ draft, analysis }) => {
    const TeamDisplay: React.FC<{ side: 'blue' | 'red' }> = ({ side }) => {
        const team = draft[side];
        const isBlue = side === 'blue';
        const score = analysis?.teamAnalysis?.[side]?.draftScore;

        return (
            <div>
                 <div className="flex justify-between items-center mb-2">
                    <h4 className={`font-bold text-lg ${isBlue ? 'text-blue-400' : 'text-red-400'}`}>{isBlue ? 'Blue Team' : 'Red Team'}</h4>
                    {score && <span className={`text-2xl font-black ${isBlue ? 'text-blue-300' : 'text-red-300'}`}>{score}</span>}
                </div>
                <div className="flex flex-wrap gap-2">
                    {team.picks.map((p, i) => (
                        <div key={`pick-${side}-${i}`} className="w-12 h-12 bg-slate-900 rounded-md border border-slate-700" title={p.champion?.name}>
                            {p.champion && <img src={p.champion.image} alt={p.champion.name} className="w-full h-full object-cover rounded-md" />}
                        </div>
                    ))}
                </div>
                 <div className="flex flex-wrap gap-1 mt-2">
                    {team.bans.map((b, i) => (
                         <div key={`ban-${side}-${i}`} className="w-8 h-8 bg-slate-900 rounded-md border border-slate-700" title={b.champion?.name}>
                            {b.champion && <img src={b.champion.image} alt={b.champion.name} className="w-full h-full object-cover rounded-md grayscale" />}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="bg-slate-900/50 p-4 rounded-lg space-y-4 border border-slate-700">
            <TeamDisplay side="blue" />
            <TeamDisplay side="red" />
        </div>
    );
};

export const PlaybookDetailModal: React.FC<PlaybookDetailModalProps> = ({ isOpen, onClose, entry, onLoad, onDelete, onSaveNotes, navigateToAcademy }) => {
    const [userNotes, setUserNotes] = useState('');

    useEffect(() => {
        if (entry) {
            setUserNotes(entry.userNotes || '');
        }
    }, [entry]);

    const fullDraft = useMemo(() => entry ? fromSavedDraft(entry.draft) : null, [entry]);

    const handleLoad = () => {
        if (fullDraft) {
            onLoad(fullDraft);
        }
        onClose();
    };
    
    const handleDelete = () => {
        if (entry) {
            onDelete(entry.id);
        }
        onClose();
    };

    const handleSaveNotes = () => {
        if (entry) {
            onSaveNotes(entry.id, userNotes);
            toast.success("Notes saved!");
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={entry ? `Playbook: ${entry.name}` : 'Playbook Entry'}>
            {/* We render content only if entry and fullDraft exist to prevent errors, 
                but we don't return null for the whole component to allow graceful exit animations. 
                The Modal wrapper with its close button will always exist when isOpen is true. */}
            {entry && fullDraft && (
                 <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Side: Draft & Notes */}
                    <div className="space-y-4 flex flex-col">
                        <DraftDisplay draft={fullDraft} analysis={entry.analysis} />
                        <div className="flex-grow flex flex-col">
                            <h3 className="text-xl font-bold text-yellow-300 mb-2">My Notes</h3>
                            <textarea
                                value={userNotes}
                                onChange={(e) => setUserNotes(e.target.value)}
                                rows={5}
                                placeholder="Add your personal notes and reflections on this draft..."
                                className="w-full p-2 bg-slate-900 border border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent-bg))] text-sm flex-grow"
                            />
                             <Button onClick={handleSaveNotes} className="mt-2 w-full sm:w-auto">Save Notes</Button>
                        </div>
                        <div className="pt-4 border-t border-slate-700 flex flex-wrap gap-2">
                            <Button variant="primary" onClick={handleLoad}>Load to Lab</Button>
                            <Button variant="danger" onClick={handleDelete}>Delete Draft</Button>
                        </div>
                    </div>
    
                    {/* Right Side: AI Analysis */}
                    <div className="max-h-[70vh] overflow-y-auto">
                        <AdvicePanel advice={entry.analysis || null} isLoading={false} error={null} navigateToAcademy={navigateToAcademy} />
                    </div>
                </div>
            )}
        </Modal>
    );
};
