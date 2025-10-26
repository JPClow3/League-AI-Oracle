import React, { useState, useMemo } from 'react';
import type { HistoryEntry, DraftState, Page, SavedTeamState } from '../../types';
import { Button } from '../common/Button';
import { PlaybookDetailModal } from './PlaybookDetailModal';
import { ConfirmationModal, ConfirmationState } from '../common/ConfirmationModal';
import { usePlaybook } from '../../hooks/usePlaybook';
import { Loader } from '../common/Loader';
import { Library, FolderOpen } from 'lucide-react';
import { PlaybookCompareModal } from './PlaybookCompareModal';
import { PlaybookCard } from './PlaybookCard';
import toast from 'react-hot-toast';
import { StatisticsPanel } from './StatisticsPanel';

interface PlaybookProps {
    onLoadDraft: (draft: DraftState) => void;
    setCurrentPage: (page: Page) => void;
    navigateToAcademy: (lessonId: string) => void;
}

export const Playbook = ({ onLoadDraft, setCurrentPage, navigateToAcademy }: PlaybookProps) => {
    const { entries, deleteEntry, updateEntry, isLoading } = usePlaybook();
    const [viewingEntry, setViewingEntry] = useState<HistoryEntry | null>(null);
    const [confirmationState, setConfirmationState] = useState<ConfirmationState | null>(null);
    const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
    const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
    
    // Filtering state
    const [searchFilter, setSearchFilter] = useState('');
    const [activeTag, setActiveTag] = useState<string | null>(null);

    const allTags = useMemo(() => {
        const tagSet = new Set<string>();
        entries.forEach(e => e.tags?.forEach(t => tagSet.add(t)));
        return Array.from(tagSet).sort();
    }, [entries]);

    const filteredEntries = useMemo(() => {
        return entries.filter(entry => {
            const nameMatch = searchFilter ? entry.name.toLowerCase().includes(searchFilter.toLowerCase()) : true;
            const tagMatch = activeTag ? entry.tags?.includes(activeTag) : true;
            return nameMatch && tagMatch;
        });
    }, [entries, searchFilter, activeTag]);

    const handleDelete = (id: string) => {
        const entryToDelete = entries.find(entry => entry.id === id);
        if (!entryToDelete) {return;}

        setConfirmationState({
            title: "Delete Strategy?",
            message: `Are you sure you want to permanently delete the strategy "${entryToDelete.name}"? This action cannot be undone.`,
            onConfirm: () => {
                deleteEntry(id);
                setSelectedForCompare(prev => prev.filter(selId => selId !== id));
            }
        });
    };
    
    const handleUpdateEntry = (id: string, updates: Partial<Omit<HistoryEntry, 'id'>>) => {
        updateEntry(id, updates);
        // Also update the currently viewed entry to reflect changes immediately
        setViewingEntry(prev => prev && prev.id === id ? { ...prev, ...updates } as HistoryEntry : prev);
        toast.success("Entry updated!");
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
            
            {entries.length > 0 && <StatisticsPanel entries={entries} />}
            
            {entries.length > 0 && (
                 <div className="bg-surface-primary p-4 rounded-lg border border-border flex flex-col md:flex-row gap-4 items-center">
                    <input
                        type="text"
                        placeholder="Search by name..."
                        value={searchFilter}
                        onChange={e => setSearchFilter(e.target.value)}
                        className="w-full md:w-1/3 px-3 py-2 bg-surface-inset border border-border focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    />
                    <div className="flex-grow flex flex-wrap items-center gap-2">
                         <button
                            onClick={() => setActiveTag(null)}
                            className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${!activeTag ? 'bg-accent text-on-accent' : 'bg-surface-secondary text-text-secondary hover:bg-border'}`}
                        >
                            All Tags
                        </button>
                        {allTags.map(tag => (
                            <button
                                key={tag}
                                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                                className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${activeTag === tag ? 'bg-accent text-on-accent' : 'bg-surface-secondary text-text-secondary hover:bg-border'}`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>
            )}


            {isLoading ? (
                <div className="flex justify-center items-center py-16">
                    <Loader messages={['Loading The Archives...']} />
                </div>
            ) : filteredEntries.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEntries.map(entry => (
                        <React.Fragment key={entry.id}>
                          <PlaybookCard 
                              entry={entry} 
                              onViewDetails={setViewingEntry}
                              onSelectForCompare={handleSelectForCompare}
                              isSelected={selectedForCompare.includes(entry.id)}
                          />
                        </React.Fragment>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-surface-primary border border-border-primary">
                    <FolderOpen className="mx-auto h-16 w-16 text-border-primary" strokeWidth={1} />
                    <h3 className="mt-4 text-xl font-semibold text-text-primary">
                        {entries.length > 0 ? 'No Matches Found' : 'The Archives are Empty'}
                    </h3>
                    <p className="mt-2 text-text-secondary max-w-md mx-auto">
                         {entries.length > 0 ? 'Try adjusting your search or filter criteria.' : 'Forge compositions in the Strategy Forge or practice in the Arena, then save them here to build your strategic codex.'}
                    </p>
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
                onUpdateEntry={handleUpdateEntry}
                navigateToAcademy={navigateToAcademy}
            />
        </div>
    );
};