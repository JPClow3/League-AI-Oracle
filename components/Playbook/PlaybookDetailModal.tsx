

import React, { useState, useEffect, useMemo } from 'react';
import type { HistoryEntry, DraftState, PlaybookPlusDossier } from '../../types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { AdvicePanel } from '../DraftLab/AdvicePanel';
import { fromSavedDraft } from '../../lib/draftUtils';
import toast from 'react-hot-toast';
import { useChampions } from '../../contexts/ChampionContext';

interface PlaybookDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    entry: HistoryEntry | null;
    onLoad: (draft: DraftState) => void;
    onDelete: (id: string) => void;
    onSaveNotes: (id: string, notes: string) => void;
    navigateToAcademy: (lessonId: string) => void;
}

const DossierDisplay = ({ dossier }: { dossier: PlaybookPlusDossier }) => (
    <div className="space-y-4">
        <h3 className="font-display text-xl font-bold text-accent tracking-wide mb-2">Strategic Dossier</h3>
        <div className="bg-secondary p-4 rounded-lg border border-border space-y-3 text-sm">
            <div>
                <h4 className="font-semibold text-accent">Win Condition</h4>
                <p className="text-text-secondary">{dossier.winCondition}</p>
            </div>
             <div>
                <h4 className="font-semibold text-accent">Early Game (0-15m)</h4>
                <p className="text-text-secondary">{dossier.earlyGame}</p>
            </div>
             <div>
                <h4 className="font-semibold text-accent">Mid Game (15-25m)</h4>
                <p className="text-text-secondary">{dossier.midGame}</p>
            </div>
             <div>
                <h4 className="font-semibold text-accent">Teamfighting</h4>
                <p className="text-text-secondary">{dossier.teamfighting}</p>
            </div>
        </div>
    </div>
);


const DraftDisplay = ({ draft, analysis }: { draft: DraftState, analysis: HistoryEntry['analysis'] }) => {
    const TeamDisplay = ({ side }: { side: 'blue' | 'red' }) => {
        const team = draft[side];
        const isBlue = side === 'blue';
        const score = analysis?.teamAnalysis?.[side]?.draftScore;

        return (
            <div>
                 <div className="flex justify-between items-center mb-2">
                    <h4 className={`font-bold text-lg ${isBlue ? 'text-blue-500' : 'text-red-500'}`}>{isBlue ? 'Blue Team' : 'Red Team'}</h4>
                    {score && <span className={`font-display text-2xl font-black ${isBlue ? 'text-blue-400' : 'text-red-400'}`}>{score}</span>}
                </div>
                <div className="flex flex-wrap gap-2">
                    {team.picks.map((p, i) => (
                        <div key={`pick-${side}-${i}`} className="w-12 h-12 bg-background rounded-md border border-border" title={p.champion?.name}>
                            {p.champion && <img src={p.champion.image} alt={p.champion.name} className="w-full h-full object-cover rounded-md" />}
                        </div>
                    ))}
                </div>
                 <div className="flex flex-wrap gap-1 mt-2">
                    {team.bans.map((b, i) => (
                         <div key={`ban-${side}-${i}`} className="w-8 h-8 bg-background rounded-md border border-border" title={b.champion?.name}>
                            {b.champion && <img src={b.champion.image} alt={b.champion.name} className="w-full h-full object-cover rounded-md grayscale" />}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="bg-secondary p-4 rounded-lg space-y-4 border border-border">
            <TeamDisplay side="blue" />
            <TeamDisplay side="red" />
        </div>
    );
};

export const PlaybookDetailModal = ({ isOpen, onClose, entry, onLoad, onDelete, onSaveNotes, navigateToAcademy }: PlaybookDetailModalProps) => {
    const [userNotes, setUserNotes] = useState('');
    const [activeTab, setActiveTab] = useState<'analysis' | 'dossier'>('analysis');
    const { champions } = useChampions();

    useEffect(() => {
        if (entry) {
            setUserNotes(entry.userNotes || '');
            // Prioritize dossier view if available
            setActiveTab(entry.dossier ? 'dossier' : 'analysis');
        }
    }, [entry]);

    const fullDraft = useMemo(() => entry ? fromSavedDraft(entry.draft, champions) : null, [entry, champions]);

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
    
    const TabButton = ({ tab, children, disabled }: { tab: 'analysis' | 'dossier', children: React.ReactNode, disabled?: boolean }) => (
        <button onClick={() => !disabled && setActiveTab(tab)} disabled={disabled} className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${activeTab === tab ? 'bg-accent text-on-accent' : 'bg-secondary text-text-secondary hover:bg-border'} disabled:opacity-50 disabled:cursor-not-allowed`}>
            {children}
        </button>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={entry ? `Archives: ${entry.name}` : 'Archived Entry'} size="6xl">
            {entry && fullDraft && (
                 <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4 flex flex-col">
                        <DraftDisplay draft={fullDraft} analysis={entry.analysis} />
                        <div className="flex-grow flex flex-col">
                            <h3 className="font-display text-xl font-bold text-accent tracking-wide mb-2">My Notes</h3>
                            <textarea
                                value={userNotes}
                                onChange={(e) => setUserNotes(e.target.value)}
                                rows={5}
                                placeholder="Add your personal notes and reflections on this draft..."
                                className="w-full p-2 bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent text-sm flex-grow"
                            />
                             <Button onClick={handleSaveNotes} className="mt-2 w-full sm:w-auto">Save Notes</Button>
                        </div>
                        <div className="pt-4 border-t border-border flex flex-wrap gap-2">
                            <Button variant="primary" onClick={handleLoad}>Load to Forge</Button>
                            <Button variant="danger" onClick={handleDelete}>Delete Strategy</Button>
                        </div>
                    </div>
    
                    <div className="max-h-[70vh] overflow-y-auto">
                        <div className="flex gap-2 mb-4 p-1 bg-secondary rounded-lg">
                            <TabButton tab="dossier" disabled={!entry.dossier}>Strategic Dossier</TabButton>
                            <TabButton tab="analysis" disabled={!entry.analysis}>Original Analysis</TabButton>
                        </div>
                        
                        {activeTab === 'dossier' && entry.dossier && <DossierDisplay dossier={entry.dossier} />}
                        
                        {/* FIX: Added the required 'isStale' prop. For a saved entry, the analysis is never stale. */}
                        {activeTab === 'analysis' && <AdvicePanel advice={entry.analysis || null} isLoading={false} error={null} navigateToAcademy={navigateToAcademy} analysisCompleted={false} onAnimationEnd={() => {}} isStale={false} />}

                        {activeTab === 'dossier' && !entry.dossier && (
                            <div className="text-center p-8 text-text-secondary">
                                <p>No AI Strategic Dossier was generated for this entry.</p>
                                <p className="text-xs">Dossiers are generated for drafts saved from the Strategy Forge.</p>
                            </div>
                        )}

                        {activeTab === 'analysis' && !entry.analysis && (
                             <div className="text-center p-8 text-text-secondary">
                                <p>No AI analysis was saved with this entry.</p>
                                <p className="text-xs">Analysis is generated in the Strategy Forge before saving.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </Modal>
    );
};