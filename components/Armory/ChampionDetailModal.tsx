import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import type { Champion, Ability, ChampionAnalysis, MatchupAnalysis, DraftState } from '../../types';
import { getChampionAnalysis, getMatchupAnalysis } from '../../services/geminiService';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { ROLES } from '../../constants';
import { useDraft } from '../../contexts/DraftContext';
import { useChampions } from '../../contexts/ChampionContext';

// --- Helper & Display Components ---

const TabButton = ({ active, onClick, children, disabled }: { active: boolean; onClick: () => void; children: React.ReactNode, disabled?: boolean }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`px-4 py-2 font-semibold text-sm rounded-t-lg border-b-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            active
                ? 'text-text-primary border-accent'
                : 'text-text-secondary border-transparent hover:text-text-primary hover:border-border'
        }`}
    >
        {children}
    </button>
);

const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div>
        <h3 className="text-xl font-bold text-accent mb-3">{title}</h3>
        {children}
    </div>
);

const SkeletonBlock = ({ className = 'h-24' }: { className?: string }) => (
    <div className={`bg-secondary/50 rounded-md animate-pulse w-full ${className}`}></div>
);

const SkeletonLoader = () => (
    <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SkeletonBlock />
            <SkeletonBlock />
        </div>
        <SkeletonBlock className="h-32" />
        <SkeletonBlock className="h-48" />
    </div>
);

const ErrorDisplay = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
    <div className="text-center p-8">
        <p className="text-error mb-4">{message}</p>
        <Button onClick={onRetry}>Retry</Button>
    </div>
);

// --- Tab Content Components ---

const OverviewDisplay = ({ champion }: { champion: Champion }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
            <img src={champion.image} alt={champion.name} className="w-full rounded-lg border-2 border-border" />
            <div className="space-y-2 bg-secondary p-3 rounded-md text-sm text-text-secondary">
                <p><strong>Roles:</strong> {champion.roles.join(', ')}</p>
                <p><strong>Damage Type:</strong> {champion.damageType}</p>
                <p><strong>Crowd Control:</strong> {champion.cc}</p>
                <p><strong>Engage:</strong> {champion.engage}</p>
            </div>
        </div>
        <div className="md:col-span-2 space-y-6">
            <Section title="Lore">
                <p className="text-sm text-text-secondary italic">{champion.lore || "No lore available."}</p>
            </Section>
        </div>
    </div>
);

const AbilitiesDisplay = ({ abilities }: { abilities: Ability[] }) => (
    <Section title="Abilities">
        <div className="space-y-4">
            {abilities.length > 0 ? (
                abilities.map(ability => (
                    <div key={ability.key} className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-background rounded-md flex items-center justify-center font-bold text-accent flex-shrink-0 border border-border">
                            {ability.key[0]}
                        </div>
                        <div>
                            <h4 className="font-bold text-text-primary">{ability.name}</h4>
                            <p className="text-sm text-text-secondary">{ability.description}</p>
                        </div>
                    </div>
                ))
            ) : (
                <p className="text-text-secondary">No ability data available.</p>
            )}
        </div>
    </Section>
);

const AIStrategyDisplay = ({ analysis }: { analysis: ChampionAnalysis }) => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
            <Section title="Runes">
                <div className="bg-secondary p-4 rounded-lg border border-border">
                    <h4 className="font-bold text-text-primary">{analysis.runes.primaryPath}: <span className="text-accent">{analysis.runes.primaryKeystone}</span></h4>
                    <ul className="list-disc list-inside text-sm text-text-secondary">
                        {analysis.runes.primaryRunes.map(r => <li key={r}>{r}</li>)}
                    </ul>
                    <h4 className="font-bold text-text-primary mt-2">{analysis.runes.secondaryPath}</h4>
                    <ul className="list-disc list-inside text-sm text-text-secondary">
                         {analysis.runes.secondaryRunes.map(r => <li key={r}>{r}</li>)}
                    </ul>
                </div>
            </Section>
            <Section title="Skill Order">
                <div className="flex items-center gap-2">
                    {analysis.skillOrder.map((skill, i) => (
                        <React.Fragment key={i}>
                             <div className="w-10 h-10 bg-secondary rounded-md flex items-center justify-center font-bold text-accent text-lg border border-border">
                                {skill}
                            </div>
                            {i < analysis.skillOrder.length - 1 && <span className="text-text-secondary font-bold">&rarr;</span>}
                        </React.Fragment>
                    ))}
                </div>
            </Section>
            <Section title="Playstyle">
                <div className="space-y-2 text-sm">
                    <p><strong className="font-semibold text-text-primary">Early Game:</strong> {analysis.playstyle.earlyGame}</p>
                    <p><strong className="font-semibold text-text-primary">Mid Game:</strong> {analysis.playstyle.midGame}</p>
                    <p><strong className="font-semibold text-text-primary">Late Game:</strong> {analysis.playstyle.lateGame}</p>
                </div>
            </Section>
        </div>
        <div className="space-y-6">
            <Section title="Build Path">
                <div className="space-y-3">
                    <div>
                        <h4 className="font-semibold text-text-secondary mb-1">Starting Items</h4>
                        <div className="flex flex-wrap gap-2 text-sm text-text-secondary">{analysis.build.startingItems.join(', ')}</div>
                    </div>
                     <div>
                        <h4 className="font-semibold text-text-secondary mb-1">Core Items</h4>
                        <div className="flex flex-wrap gap-2 text-sm text-accent font-bold">{analysis.build.coreItems.join(', ')}</div>
                    </div>
                     <div>
                        <h4 className="font-semibold text-text-secondary mb-1">Situational Items</h4>
                        <ul className="space-y-1 list-disc list-inside text-sm">
                            {analysis.build.situationalItems.map(item => (
                                <li key={item.item}><strong className="text-text-primary">{item.item}:</strong> <span className="text-text-secondary">{item.reason}</span></li>
                            ))}
                        </ul>
                    </div>
                </div>
            </Section>
            <Section title="Composition">
                 <div className="space-y-2 text-sm">
                     <p><strong className="font-semibold text-text-primary">Ideal Archetypes:</strong> {analysis.composition.idealArchetypes.join(', ')}</p>
                     <p><strong className="font-semibold text-text-primary">Synergies:</strong> {analysis.composition.synergisticChampions.join(', ')}</p>
                 </div>
            </Section>
        </div>
    </div>
);

const MatchupsDisplay = ({ analysis, matchupAnalysis, onRetry }: { analysis: ChampionAnalysis, matchupAnalysis: MatchupAnalysis | null, onRetry: () => void }) => {
    if (!matchupAnalysis) return (
        <div className="flex flex-col items-center justify-center min-h-[200px]">
            <Button onClick={onRetry}>Generate Matchup Tips</Button>
        </div>
    );
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Section title="Strong Against">
                 <ul className="space-y-3">
                    {matchupAnalysis.strongAgainstTips.map(tip => (
                        <li key={tip.championName} className="text-sm">
                            <strong className="text-text-primary">{tip.championName}:</strong> <span className="text-text-secondary">{tip.tip}</span>
                        </li>
                    ))}
                 </ul>
            </Section>
             <Section title="Weak Against">
                 <ul className="space-y-3">
                    {matchupAnalysis.weakAgainstTips.map(tip => (
                        <li key={tip.championName} className="text-sm">
                            <strong className="text-text-primary">{tip.championName}:</strong> <span className="text-text-secondary">{tip.tip}</span>
                        </li>
                    ))}
                 </ul>
            </Section>
        </div>
    );
};

// --- Main Component ---

interface ChampionDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    champion: Champion;
    onLoadInLab: (championId: string, role?: string) => void;
}

export const ChampionDetailModal = ({ isOpen, onClose, champion, onLoadInLab }: ChampionDetailModalProps) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'abilities' | 'strategy' | 'matchups'>('overview');
    const [analysis, setAnalysis] = useState<ChampionAnalysis | null>(null);
    const [matchupAnalysis, setMatchupAnalysis] = useState<MatchupAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState<Record<string, boolean>>({ analysis: false, matchups: false });
    const [error, setError] = useState<Record<string, string | null>>({ analysis: null, matchups: null });
    
    const abortControllerRef = useRef<AbortController | null>(null);
    const { setDraftState } = useDraft();
    const { champions, latestVersion } = useChampions();

    const fetchAnalysis = useCallback(async (signal: AbortSignal) => {
        if (!latestVersion) return;
        setIsLoading(prev => ({ ...prev, analysis: true }));
        setError(prev => ({ ...prev, analysis: null }));
        try {
            const result = await getChampionAnalysis(champion.name, latestVersion, signal);
            if (!signal.aborted) {
                setAnalysis(result);
            }
        } catch (err) {
            if (err instanceof DOMException && err.name === 'AbortError') return;
            setError(prev => ({ ...prev, analysis: err instanceof Error ? err.message : 'Failed to load AI analysis.' }));
        } finally {
            if (!signal.aborted) {
                 setIsLoading(prev => ({ ...prev, analysis: false }));
            }
        }
    }, [champion.name, latestVersion]);

    const fetchMatchups = useCallback(async (signal: AbortSignal) => {
        if (!analysis) return;
        setIsLoading(prev => ({ ...prev, matchups: true }));
        setError(prev => ({ ...prev, matchups: null }));
        try {
            const result = await getMatchupAnalysis(champion.name, analysis.counters.weakAgainst, analysis.counters.strongAgainst, signal);
            if (!signal.aborted) {
                setMatchupAnalysis(result);
            }
        } catch (err) {
             if (err instanceof DOMException && err.name === 'AbortError') return;
            setError(prev => ({ ...prev, matchups: err instanceof Error ? err.message : 'Failed to load matchup tips.' }));
        } finally {
            if (!signal.aborted) {
                 setIsLoading(prev => ({ ...prev, matchups: false }));
            }
        }
    }, [champion.name, analysis]);

    // Reset state when champion changes or modal opens/closes
    useEffect(() => {
        const resetAllState = () => {
            setActiveTab('overview');
            setAnalysis(null);
            setMatchupAnalysis(null);
            setError({ analysis: null, matchups: null });
            setIsLoading({ analysis: false, matchups: false });
        };
        
        if (isOpen) {
            resetAllState();
        }

        // Cleanup on modal close or champion change
        return () => {
            abortControllerRef.current?.abort();
            resetAllState();
        };
    }, [isOpen, champion]);

    // Fetch data when switching to a tab
    useEffect(() => {
        if (!isOpen) return;

        abortControllerRef.current?.abort();
        const controller = new AbortController();
        abortControllerRef.current = controller;

        if (activeTab === 'strategy' && !analysis && !isLoading.analysis) {
            fetchAnalysis(controller.signal);
        }
        if (activeTab === 'matchups' && analysis && !matchupAnalysis && !isLoading.matchups) {
            fetchMatchups(controller.signal);
        }
        
        // Abort fetch if tab changes mid-request
        return () => controller.abort();
    }, [isOpen, activeTab, analysis, matchupAnalysis, isLoading, fetchAnalysis, fetchMatchups]);

    const handleTabChange = (tab: 'overview' | 'abilities' | 'strategy' | 'matchups') => {
        if (tab === 'matchups' && !analysis) {
             setActiveTab('strategy'); // Force user to load strategy first
        } else {
            setActiveTab(tab);
        }
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`${champion.name}, ${champion.title}`}>
            <div className="flex flex-col">
                <div className="p-4 border-b border-border flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <TabButton active={activeTab === 'overview'} onClick={() => handleTabChange('overview')}>Overview</TabButton>
                        <TabButton active={activeTab === 'abilities'} onClick={() => handleTabChange('abilities')}>Abilities</TabButton>
                        <TabButton active={activeTab === 'strategy'} onClick={() => handleTabChange('strategy')}>AI Strategy</TabButton>
                        <TabButton active={activeTab === 'matchups'} onClick={() => handleTabChange('matchups')} disabled={!analysis}>Matchups</TabButton>
                    </div>
                     <Button variant="secondary" onClick={() => { onLoadInLab(champion.id); onClose(); }}>
                        Load in Forge
                    </Button>
                </div>

                <div className="p-6 overflow-y-auto">
                    {activeTab === 'overview' && <OverviewDisplay champion={champion} />}
                    {activeTab === 'abilities' && <AbilitiesDisplay abilities={champion.abilities} />}
                    {activeTab === 'strategy' && (
                        isLoading.analysis ? <SkeletonLoader /> :
                        error.analysis ? <ErrorDisplay message={error.analysis} onRetry={() => fetchAnalysis(new AbortController().signal)} /> :
                        analysis && <AIStrategyDisplay analysis={analysis} />
                    )}
                    {activeTab === 'matchups' && analysis && (
                         isLoading.matchups ? <SkeletonLoader /> :
                         error.matchups ? <ErrorDisplay message={error.matchups} onRetry={() => fetchMatchups(new AbortController().signal)} /> :
                         <MatchupsDisplay analysis={analysis} matchupAnalysis={matchupAnalysis} onRetry={() => fetchMatchups(new AbortController().signal)} />
                    )}
                </div>
            </div>
        </Modal>
    );
};