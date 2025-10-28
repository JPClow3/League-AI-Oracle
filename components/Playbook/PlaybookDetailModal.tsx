import React, { useState, useEffect, useMemo } from 'react';
import type { HistoryEntry, DraftState, PlaybookPlusDossier } from '../../types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { AdvicePanel } from '../DraftLab/AdvicePanel';
import { fromSavedDraft } from '../../lib/draftUtils';
import toast from 'react-hot-toast';
import { useChampions } from '../../contexts/ChampionContext';
import { TagInput } from '../common/TagInput';
import { Check, X, Minus } from 'lucide-react';

interface PlaybookDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    entry: HistoryEntry | null;
    onLoad: (draft: DraftState) => void;
    onDelete: (id: string) => void;
    onUpdateEntry: (id: string, updates: Partial<Omit<HistoryEntry, 'id'>>) => void;
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

// Helper component for displaying team picks and bans (moved outside to avoid creating during render)
const TeamDisplay = ({
    draft,
    side,
    analysis
}: {
    draft: DraftState;
    side: 'blue' | 'red';
    analysis: HistoryEntry['analysis']
}) => {
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

const DraftDisplay = ({ draft, analysis }: { draft: DraftState, analysis: HistoryEntry['analysis'] }) => {
    return (
        <div className="bg-secondary p-4 rounded-lg space-y-4 border border-border">
            <TeamDisplay draft={draft} side="blue" analysis={analysis} />
            <TeamDisplay draft={draft} side="red" analysis={analysis} />
        </div>
    );
};

const TabButton = ({
    tab,
    children,
    disabled,
    activeTab,
    setActiveTab
}: {
    tab: 'analysis' | 'dossier';
    children: React.ReactNode;
    disabled?: boolean;
    activeTab: 'analysis' | 'dossier';
    setActiveTab: (tab: 'analysis' | 'dossier') => void;
}) => (
    <button
        onClick={() => !disabled && setActiveTab(tab)}
        disabled={disabled}
        className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${
            activeTab === tab ? 'bg-accent text-on-accent' : 'bg-secondary text-text-secondary hover:bg-border'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
        {children}
    </button>
);

const ResultButton = ({
    value,
    children,
    result,
    setResult
}: {
    value: NonNullable<HistoryEntry['result']>;
    children: React.ReactNode;
    result: HistoryEntry['result'];
    setResult: (result: HistoryEntry['result']) => void;
}) => {
    const isActive = result === value;
    const color = value === 'win' ? 'border-success hover:bg-success/10' : value === 'loss' ? 'border-error hover:bg-error/10' : 'border-border hover:bg-border/10';
    const activeColor = value === 'win' ? 'bg-success/20 border-success' : value === 'loss' ? 'bg-error/20 border-error' : 'bg-border/20 border-border';
    return (
        <Button
            variant="secondary"
            onClick={() => setResult(result === value ? undefined : value)}
            className={`!border-2 ${isActive ? activeColor : color}`}
        >
            {children}
        </Button>
    );
};

export const PlaybookDetailModal = ({ isOpen, onClose, entry, onLoad, onDelete, onUpdateEntry, navigateToAcademy }: PlaybookDetailModalProps) => {
    const [userNotes, setUserNotes] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [result, setResult] = useState<HistoryEntry['result']>(undefined);
    const [activeTab, setActiveTab] = useState<'analysis' | 'dossier'>('analysis');
    const { champions } = useChampions();

    useEffect(() => {
        if (entry) {
            setTimeout(() => {
                setUserNotes(entry.userNotes || '');
                setTags(entry.tags || []);
                setResult(entry.result);
                setActiveTab(entry.dossier ? 'dossier' : 'analysis');
            }, 0);
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

    const handleSaveChanges = () => {
        if (entry) {
            onUpdateEntry(entry.id, { userNotes, tags, result });
        }
    };
    
    const getFormattedDraftText = () => {
        if (!fullDraft || !entry) {return '';}

        const formatTeam = (side: 'blue' | 'red') => {
            const team = fullDraft[side];
            const picks = team.picks.map(p => p.champion?.name || 'N/A').join(', ');
            const bans = team.bans.map(b => b.champion?.name || 'N/A').join(', ');
            return `${side.toUpperCase()} PICKS: ${picks}\n${side.toUpperCase()} BANS: ${bans}`;
        };
        
        let text = `Draft: ${entry.name}\n\n`;
        text += `${formatTeam('blue')}\n\n`;
        text += `${formatTeam('red')}\n\n`;

        if (entry.userNotes) {
            text += `--- MY NOTES ---\n${entry.userNotes}\n\n`;
        }
        if(entry.analysis) {
             text += `--- AI ANALYSIS ---\n`;
             text += `Blue Score: ${entry.analysis.teamAnalysis.blue.draftScore}\n`;
             text += `Red Score: ${entry.analysis.teamAnalysis.red.draftScore}\n`;
        }

        return text;
    };

    const handleCopyToClipboard = () => {
        const text = getFormattedDraftText();
        navigator.clipboard.writeText(text)
            .then(() => toast.success("Draft copied to clipboard!"))
            .catch(() => toast.error("Failed to copy draft."));
    };

    const handleExportAsText = () => {
        if (!entry) {return;}
        const text = getFormattedDraftText();
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${entry.name.replace(/\s+/g, '_')}_draft.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };


    return (
        <Modal isOpen={isOpen} onClose={onClose} title={entry ? `Archives: ${entry.name}` : 'Archived Entry'} size="6xl">
            {entry && fullDraft && (
                 <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4 flex flex-col">
                        <DraftDisplay draft={fullDraft} analysis={entry.analysis} />
                        <div className="space-y-2">
                             <h3 className="font-display text-xl font-bold text-accent tracking-wide">Record Outcome</h3>
                             <div className="flex gap-2">
                                <ResultButton value="win" result={result} setResult={setResult}><Check className="h-4 w-4 mr-1"/> Win</ResultButton>
                                <ResultButton value="loss" result={result} setResult={setResult}><X className="h-4 w-4 mr-1"/> Loss</ResultButton>
                                <ResultButton value="remake" result={result} setResult={setResult}><Minus className="h-4 w-4 mr-1"/> Remake</ResultButton>
                             </div>
                        </div>
                        <div className="space-y-2">
                             <h3 className="font-display text-xl font-bold text-accent tracking-wide">Tags</h3>
                             <TagInput tags={tags} onTagsChange={setTags} />
                        </div>
                        <div className="flex-grow flex flex-col">
                            <h3 className="font-display text-xl font-bold text-accent tracking-wide mb-2">My Notes</h3>
                            <textarea
                                value={userNotes}
                                onChange={(e) => setUserNotes(e.target.value)}
                                rows={5}
                                placeholder="Add your personal notes and reflections on this draft..."
                                className="w-full p-2 bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent text-sm flex-grow"
                            />
                        </div>
                        <div className="pt-4 border-t border-border flex flex-wrap gap-2 justify-between">
                            <div className="flex flex-wrap gap-2">
                                <Button variant="primary" onClick={handleLoad}>Load to Forge</Button>
                                <Button variant="secondary" onClick={handleCopyToClipboard}>Copy</Button>
                                <Button variant="secondary" onClick={handleExportAsText}>Export</Button>
                                <Button variant="danger" onClick={handleDelete}>Delete</Button>
                            </div>
                            <Button onClick={handleSaveChanges} className="w-full sm:w-auto">Save Changes</Button>
                        </div>
                    </div>
    
                    <div className="max-h-[70vh] overflow-y-auto">
                        <div className="flex gap-2 mb-4 p-1 bg-secondary rounded-lg">
                            <TabButton tab="dossier" disabled={!entry.dossier} activeTab={activeTab} setActiveTab={setActiveTab}>Strategic Dossier</TabButton>
                            <TabButton tab="analysis" disabled={!entry.analysis} activeTab={activeTab} setActiveTab={setActiveTab}>Original Analysis</TabButton>
                        </div>
                        
                        {activeTab === 'dossier' && entry.dossier && <DossierDisplay dossier={entry.dossier} />}
                        
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