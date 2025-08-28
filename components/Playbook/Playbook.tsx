import React, { useState } from 'react';
import type { HistoryEntry, DraftState, Page, SavedTeamState } from '../../types';
import { Button } from '../common/Button';
import { PlaybookDetailModal } from './PlaybookDetailModal';
import { ConfirmationModal, ConfirmationState } from '../common/ConfirmationModal';
import { usePlaybook } from '../../hooks/usePlaybook';
import { Loader } from '../common/Loader';
import { Tooltip } from '../common/Tooltip';
import { Library, FolderOpen, AlertTriangle } from 'lucide-react';
import { Modal } from '../common/Modal';
import toast from 'react-hot-toast';
import { useChampions } from '../../contexts/ChampionContext';

// --- Comparison Modal ---
interface PlaybookCompareModalProps {
    isOpen: boolean;
    onClose: () => void;
    drafts: HistoryEntry[];
}

const CompareChampionSlot = ({ champId, isDifferent }: { champId: string | null; isDifferent: boolean }) => {
    const { champions } = useChampions();
    const champ = champId ? champions.find(c => c.id === champId) : null;
    const borderClass = isDifferent ? 'border-accent ring-2 ring-accent' : 'border-border';

    return (
        <div className={`w-12 h-12 bg-surface rounded-md border ${borderClass} relative`} title={champ?.name}>
            {champ && <img src={champ.image} alt={champ.name} className="w-full h-full object-cover rounded-md" />}
        </div>
    );
};

const CompareTeamDisplay = ({ team, opposingPicks, opposingBans }: { team: SavedTeamState; opposingPicks: Set<string | null>; opposingBans: Set<string | null> }) => (
    <div className="space-y-3">
        <div>
            <h5 className="text-sm font-semibold text-text-secondary mb-1">Picks</h5>
            <div className="flex flex-wrap gap-2">
                {team.picks.map((id, i) => <CompareChampionSlot key={`p-${i}`} champId={id} isDifferent={!opposingPicks.has(id)} />)}
            </div>
        </div>
        <div>
            <h5 className="text-sm font-semibold text-text-secondary mb-1">Bans</h5>
            <div className="flex flex-wrap gap-1">
                {team.bans.map((id, i) => <CompareChampionSlot key={`b-${i}`} champId={id} isDifferent={!opposingBans.has(id)} />)}
            </div>
        </div>
    </div>
);

const PlaybookCompareModal = ({ isOpen, onClose, drafts }: PlaybookCompareModalProps) => {
    if (drafts.length !== 2) return null;

    const [d1, d2] = drafts;
    const d1BluePicks = new Set(d1.draft.blue.picks);
    const d1BlueBans = new Set(d1.draft.blue.bans);
    const d1RedPicks = new Set(d1.draft.red.picks);
    const d1RedBans = new Set(d1.draft.red.bans);

    const d2BluePicks = new Set(d2.draft.blue.picks);
    const d2BlueBans = new Set(d2.draft.blue.bans);
    const d2RedPicks = new Set(d2.draft.red.picks);
    const d2RedBans = new Set(d2.draft.red.bans);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Compare Drafts">
            <div className="p-6 grid grid-cols-2 gap-6">
                {[d1, d2].map((draft, index) => (
                    <div key={draft.id} className="space-y-4">
                        <div className="bg-surface p-3 rounded-lg border border-border">
                            <h3 className="font-bold text-lg text-text-primary truncate">{draft.name}</h3>
                            {draft.analysis?.teamAnalysis.blue.draftScore && (
                                <p className="text-sm font-display">Score: <span className="font-black text-accent">{draft.analysis.teamAnalysis.blue.draftScore}</span></p>
                            )}
                        </div>
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-bold text-team-blue mb-2">Blue Team</h4>
                                <CompareTeamDisplay
                                    team={draft.draft.blue}
                                    opposingPicks={index === 0 ? d2BluePicks : d1BluePicks}
                                    opposingBans={index === 0 ? d2BlueBans : d1BlueBans}
                                />
                            </div>
                            <div>
                                <h4 className="font-bold text-team-red mb-2">Red Team</h4>
                                <CompareTeamDisplay
                                    team={draft.draft.red}
                                    opposingPicks={index === 0 ? d2RedPicks : d1RedPicks}
                                    opposingBans={index === 0 ? d2RedBans : d1RedBans}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </Modal>
    );
};


// --- Playbook Component ---
interface PlaybookCardProps {
    entry: HistoryEntry;
    onViewDetails: (entry: HistoryEntry) => void;
    onSelectForCompare: (id: string) => void;
    isSelected: boolean;
}

const PlaybookCard = ({ entry, onViewDetails, onSelectForCompare, isSelected }: PlaybookCardProps) => {
    const { champions } = useChampions();
    const isPending = entry.status === 'pending';
    const isError = entry.status === 'error';

    const getChampImages = (ids: (string | null)[]) => {
        return ids.slice(0, 5).map((id, index) => {
            if (!id) return <div key={index} style={{ zIndex: 5 - index, marginLeft: index === 0 ? '0' : '-0.75rem' }} className="w-8 h-8 bg-surface-inset border-2 border-border-primary rounded-full"></div>;
            const champ = champions.find(c => c.id === id);
            return (
                <img 
                    key={index} 
                    src={champ?.image} 
                    alt={champ?.name} 
                    className="w-8 h-8 bg-surface-secondary border-2 border-border-primary rounded-full transition-transform duration-300 group-hover:translate-x-1"
                    style={{ zIndex: 5 - index, marginLeft: index === 0 ? '0' : '-0.75rem' }}
                    title={champ?.name}
                />
            );
        });
    };
    
    const borderClass = isSelected ? 'border-accent shadow-glow-accent' : 'border-border-primary hover:border-info';
    
    return (
        <div 
            onClick={() => onSelectForCompare(entry.id)}
            className={`group relative bg-surface-primary border ${borderClass} shadow-md p-4 flex flex-col justify-between transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl hover:shadow-info/10 overflow-hidden cursor-pointer`}
        >
             <div className="absolute top-4 -left-px w-1 h-8 bg-info rounded-r-md transition-all duration-300 group-hover:h-16 group-hover:shadow-glow-info" />
            <div className="relative z-10 pl-4">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-display text-lg font-bold text-text-primary tracking-wide pr-4">{entry.name}</h3>
                    {isPending && (
                        <div className="flex items-center gap-1 text-xs text-gold">
                            <span>Generating...</span>
                        </div>
                    )}
                     {isError && (
                        <Tooltip content="AI dossier generation failed. You can delete this entry and save it again from the lab to retry.">
                            <div className="flex items-center gap-1 text-xs text-error cursor-help">
                                 <AlertTriangle className="h-4 w-4" />
                                <span>Error</span>
                            </div>
                        </Tooltip>
                    )}
                </div>
                <p className="text-xs text-text-secondary mb-3">Saved on {new Date(entry.createdAt).toLocaleDateString()}</p>
                <div className="space-y-2">
                    <div className="flex items-center">
                        <span className="text-sm font-semibold text-team-blue w-12">Blue:</span>
                        <div className="flex pl-3">{getChampImages(entry.draft.blue.picks)}</div>
                    </div>
                     <div className="flex items-center">
                        <span className="text-sm font-semibold text-team-red w-12">Red:</span>
                        <div className="flex pl-3">{getChampImages(entry.draft.red.picks)}</div>
                    </div>
                </div>
            </div>
            <div className="relative z-10 mt-4 pl-4 flex gap-2">
                <Button variant="primary" onClick={(e) => { e.stopPropagation(); onViewDetails(entry); }} disabled={isPending}>View Details</Button>
            </div>
            {isPending && <div className="absolute inset-0 bg-surface-primary/50 scanner-effect" />}
        </div>
    );
};

interface PlaybookProps {
    onLoadDraft: (draft: DraftState) => void;
    setCurrentPage: (page: Page) => void;
    navigateToAcademy: (lessonId: string) => void;
}

export const Playbook = ({ onLoadDraft, setCurrentPage, navigateToAcademy }: PlaybookProps) => {
    const { entries, deleteEntry, updateNotes, isLoading } = usePlaybook();
    const [viewingEntry, setViewingEntry] = useState<HistoryEntry | null>(null);
    const [confirmationState, setConfirmationState] = useState<ConfirmationState | null>(null);
    const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
    const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

    const handleDelete = (id: string) => {
        const entryToDelete = entries.find(entry => entry.id === id);
        if (!entryToDelete) return;

        setConfirmationState({
            title: "Delete Strategy?",
            message: `Are you sure you want to permanently delete the strategy "${entryToDelete.name}"? This action cannot be undone.`,
            onConfirm: () => {
                deleteEntry(id);
                setSelectedForCompare(prev => prev.filter(selId => selId !== id));
            }
        });
    };
    
    const handleSaveNotes = (id: string, notes: string) => {
        updateNotes(id, notes);
        // Also update the currently viewed entry to reflect changes immediately
        setViewingEntry(prev => prev && prev.id === id ? { ...prev, userNotes: notes } : prev);
    };

    const handleSelectForCompare = (id: string) => {
        setSelectedForCompare(prev => {
            if (prev.includes(id)) {
                return prev.filter(selectedId => selectedId !== id);
            }
            if (prev.length < 2) {
                return [...prev, id];
            }
            toast.error('You can only select two drafts to compare at a time.', { id: 'compare-limit-toast' });
            return prev;
        });
    };

    return (
        <div className="space-y-6">
            <ConfirmationModal 
                isOpen={!!confirmationState}
                onClose={() => setConfirmationState(null)}
                state={confirmationState}
            />
             <PlaybookCompareModal
                isOpen={isCompareModalOpen}
                onClose={() => setIsCompareModalOpen(false)}
                drafts={entries.filter(e => selectedForCompare.includes(e.id))}
            />
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface-primary border border-border-primary p-4 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="bg-surface-secondary text-info w-12 h-12 flex items-center justify-center flex-shrink-0">
                        <Library size={32} />
                    </div>
                    <div>
                        <h1 className="font-display text-3xl font-bold text-text-primary tracking-wide">The Archives</h1>
                        <p className="text-sm text-text-secondary">Your saved strategies. Review drafts, analyze AI dossiers, and refine your master plans.</p>
                    </div>
                </div>
                <Button 
                    variant="secondary"
                    onClick={() => setIsCompareModalOpen(true)}
                    disabled={selectedForCompare.length !== 2}
                >
                    Compare Selections ({selectedForCompare.length}/2)
                </Button>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center py-16">
                    <Loader messages={['Loading The Archives...']} />
                </div>
            ) : entries.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {entries.map(entry => (
                        <PlaybookCard 
                            key={entry.id} 
                            entry={entry} 
                            onViewDetails={setViewingEntry}
                            onSelectForCompare={handleSelectForCompare}
                            isSelected={selectedForCompare.includes(entry.id)}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-surface-primary border border-border-primary">
                    <FolderOpen className="mx-auto h-16 w-16 text-border-primary" strokeWidth={1} />
                    <h3 className="mt-4 text-xl font-semibold text-text-primary">The Archives are Empty</h3>
                    <p className="mt-2 text-text-secondary max-w-md mx-auto">Forge compositions in the Strategy Forge or practice in the Arena, then save them here to build your strategic codex.</p>
                    <div className="mt-6 flex justify-center gap-4">
                        <Button variant="primary" onClick={() => setCurrentPage('Strategy Forge')}>
                            Go to Strategy Forge
                        </Button>
                        <Button variant="secondary" onClick={() => setCurrentPage('Draft Arena')}>
                            Go to Draft Arena
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