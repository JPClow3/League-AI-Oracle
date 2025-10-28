import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Loader } from '../common/Loader';
import { getDraftComparisonAnalysis } from '../../services/geminiService';
import { useChampions } from '../../contexts/ChampionContext';
import type { HistoryEntry, SavedTeamState } from '../../types';
import { Sparkles } from 'lucide-react';

interface PlaybookCompareModalProps {
    isOpen: boolean;
    onClose: () => void;
    drafts: HistoryEntry[];
}

const CompareChampionSlot = ({ champId, isDifferent }: { champId: string | null; isDifferent: boolean }) => {
    const { championsLite } = useChampions();
    const champ = champId ? championsLite.find(c => c.id === champId) : null;
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
                {team.picks.map((id, i) => <React.Fragment key={`p-${i}`}><CompareChampionSlot champId={id} isDifferent={!opposingPicks.has(id)} /></React.Fragment>)}
            </div>
        </div>
        <div>
            <h5 className="text-sm font-semibold text-text-secondary mb-1">Bans</h5>
            <div className="flex flex-wrap gap-1">
                {team.bans.map((id, i) => <React.Fragment key={`b-${i}`}><CompareChampionSlot champId={id} isDifferent={!opposingBans.has(id)} /></React.Fragment>)}
            </div>
        </div>
    </div>
);

export const PlaybookCompareModal = ({ isOpen, onClose, drafts }: PlaybookCompareModalProps) => {
    const [analysis, setAnalysis] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { championsLite } = useChampions();

    useEffect(() => {
        if (isOpen && drafts.length === 2 && drafts[0] && drafts[1]) {
            const controller = new AbortController();
            const fetchAnalysis = async () => {
                setIsLoading(true);
                setAnalysis(null);
                try {
                    const result = await getDraftComparisonAnalysis(drafts[0]!, drafts[1]!, championsLite, controller.signal);
                    if (!controller.signal.aborted) {
                        setAnalysis(result);
                    }
                } catch (err) {
                    if (!(err instanceof DOMException && err.name === 'AbortError')) {
                        console.error("Failed to get comparison analysis", err);
                        setAnalysis("Could not generate AI comparison analysis.");
                    }
                } finally {
                    if (!controller.signal.aborted) {
                        setIsLoading(false);
                    }
                }
            };
            fetchAnalysis();
            return () => controller.abort();
        }
        return undefined;
    }, [isOpen, drafts, championsLite]);

    if (drafts.length !== 2 || !drafts[0] || !drafts[1]) {return null;}

    const [d1, d2] = drafts;
    const d1BluePicks = new Set(d1!.draft.blue.picks);
    const d1BlueBans = new Set(d1!.draft.blue.bans);
    const d1RedPicks = new Set(d1!.draft.red.picks);
    const d1RedBans = new Set(d1!.draft.red.bans);

    const d2BluePicks = new Set(d2!.draft.blue.picks);
    const d2BlueBans = new Set(d2!.draft.blue.bans);
    const d2RedPicks = new Set(d2!.draft.red.picks);
    const d2RedBans = new Set(d2!.draft.red.bans);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Compare Drafts" size="4xl">
            <div className="p-6">
                <div className="grid grid-cols-2 gap-6">
                    {drafts.map((draft, index) => (
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

                <div className="mt-6 pt-4 border-t border-border">
                     <h3 className="font-display text-xl font-bold text-accent tracking-wide mb-2 flex items-center gap-2"><Sparkles size={20} /> AI Comparison Analysis</h3>
                     {isLoading && <div className="min-h-[50px]"><Loader messages={["Analyzing differences..."]} /></div>}
                     {analysis && !isLoading && <p className="text-text-secondary italic">&quot;{analysis}&quot;</p>}
                </div>
            </div>
        </Modal>
    );
};