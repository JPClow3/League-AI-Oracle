import React, { useState, useEffect, useMemo } from 'react';
import type { HistoryEntry, DraftState, PlaybookPlusDossier } from '../../types';
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

const DossierDisplay: React.FC<{ dossier: PlaybookPlusDossier }> = ({ dossier }) => (
    <div className="space-y-4">
        <h3 className="text-xl font-bold text-yellow-300 mb-2">Strategic Dossier</h3>
        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 space-y-3 text-sm">
            <div>
                <h4 className="font-semibold text-cyan-300">Win Condition</h4>
                <p className="text-gray-300">{dossier.winCondition}</p>
            </div>
             <div>
                <h4 className="font-semibold text-cyan-300">Early Game (0-15m)</h4>
                <p className="text-gray-300">{dossier.earlyGame}</p>
            </div>
             <div>
                <h4 className="font-semibold text-cyan-300">Mid Game (15-25m)</h4>
                <p className="text-gray-300">{dossier.midGame}</p>
            </div>
             <div>
                <h4 className="font-semibold text-cyan-300">Teamfighting</h4>
                <p className="text-gray-300">{dossier.teamfighting}</p>
            </div>
        </div>
    </div>
);


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
    const [activeTab, setActiveTab] = useState<'analysis' | 'dossier'>('analysis');

    useEffect(() => {
        if (entry) {
            setUserNotes(entry.userNotes || '');
            // Prioritize dossier view if available
            setActiveTab(entry.dossier ? 'dossier' : 'analysis');
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
    
    const TabButton: React.FC<{ tab: 'analysis' | 'dossier', children: React.ReactNode, disabled?: boolean }> = ({ tab, children, disabled }) => (
        <button onClick={() => !disabled && setActiveTab(tab)} disabled={disabled} className={`px-3 py-1 text-sm font-semibold rounded-md ${activeTab === tab ? 'bg-blue-600 text-white' : 'bg-slate-700 text-gray-300 hover:bg-slate-600'} disabled:opacity-50 disabled:cursor-not-allowed`}>
            {children}
        </button>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={entry ? `Archives: ${entry.name}` : 'Archived Entry'}>
            {entry && fullDraft && (
                 <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                            <Button variant="primary" onClick={handleLoad}>Load to Forge</Button>
                            <Button variant="danger" onClick={handleDelete}>Delete Strategy</Button>
                        </div>
                    </div>
    
                    <div className="max-h-[70vh] overflow-y-auto">
                        <div className="flex gap-2 mb-4 p-1 bg-slate-800 rounded-lg">
                            <TabButton tab="dossier" disabled={!entry.dossier}>Strategic Dossier</TabButton>
                            <TabButton tab="analysis" disabled={!entry.analysis}>Original Analysis</TabButton>
                        </div>
                        
                        {activeTab === 'dossier' && entry.dossier && <DossierDisplay dossier={entry.dossier} />}
                        
                        {activeTab === 'analysis' && <AdvicePanel advice={entry.analysis || null} isLoading={false} error={null} navigateToAcademy={navigateToAcademy} />}
                    </div>
                </div>
            )}
        </Modal>
    );
};