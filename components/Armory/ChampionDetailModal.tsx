import React, { useState, useEffect, useRef } from 'react';
import type { Champion, Ability, ChampionAnalysis, MatchupAnalysis } from '../../types';
import { getChampionAnalysis, getMatchupAnalysis } from '../../services/geminiService';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

// --- Helper & Display Components ---

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode, disabled?: boolean }> = ({ active, onClick, children, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`px-4 py-2 font-semibold text-sm rounded-t-lg border-b-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            active
                ? 'text-white border-[rgb(var(--color-accent-bg))]'
                : 'text-gray-400 border-transparent hover:text-white hover:border-slate-500'
        }`}
    >
        {children}
    </button>
);

const Section: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div>
        <h3 className="text-xl font-bold text-yellow-300 mb-3">{title}</h3>
        {children}
    </div>
);

const SkeletonBlock: React.FC<{ className?: string }> = ({ className = 'h-24' }) => (
    <div className={`bg-slate-700/50 rounded-md animate-pulse w-full ${className}`}></div>
);

const SkeletonLoader: React.FC = () => (
    <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SkeletonBlock />
            <SkeletonBlock />
        </div>
        <SkeletonBlock className="h-32" />
        <SkeletonBlock className="h-48" />
    </div>
);

const ErrorDisplay: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
    <div className="text-center p-8">
        <p className="text-red-400 mb-4">{message}</p>
        <Button onClick={onRetry}>Retry</Button>
    </div>
);

// --- Tab Content Components ---

const OverviewDisplay: React.FC<{ champion: Champion }> = ({ champion }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
            <img src={champion.image} alt={champion.name} className="w-full rounded-lg border-2 border-slate-600" />
            <div className="space-y-2 bg-slate-900/50 p-3 rounded-md text-sm text-gray-300">
                <p><strong>Roles:</strong> {champion.roles.join(', ')}</p>
                <p><strong>Damage Type:</strong> {champion.damageType}</p>
                <p><strong>Crowd Control:</strong> {champion.cc}</p>
                <p><strong>Engage:</strong> {champion.engage}</p>
            </div>
        </div>
        <div className="md:col-span-2 space-y-6">
            <Section title="Lore">
                <p className="text-sm text-gray-300 italic">{champion.lore || "No lore available."}</p>
            </Section>
        </div>
    </div>
);

const AbilitiesDisplay: React.FC<{ abilities: Ability[] }> = ({ abilities }) => (
    <Section title="Abilities">
        <div className="space-y-4">
            {abilities.length > 0 ? (
                abilities.map(ability => (
                    <div key={ability.key} className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-slate-900 rounded-md flex items-center justify-center font-bold text-[rgb(var(--color-accent-text))] flex-shrink-0 border border-slate-700">
                            {ability.key[0]}
                        </div>
                        <div>
                            <h4 className="font-bold text-white">{ability.name}</h4>
                            <p className="text-sm text-gray-400">{ability.description}</p>
                        </div>
                    </div>
                ))
            ) : (
                <p className="text-gray-400">No ability data available.</p>
            )}
        </div>
    </Section>
);

const AIStrategyDisplay: React.FC<{ analysis: ChampionAnalysis }> = ({ analysis }) => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
            <Section title="Runes">
                <div className="bg-slate-900/50 p-4 rounded-lg">
                    <h4 className="font-bold text-white">{analysis.runes.primaryPath}: <span className="text-yellow-300">{analysis.runes.primaryKeystone}</span></h4>
                    <ul className="list-disc list-inside text-sm text-gray-300">
                        {analysis.runes.primaryRunes.map(r => <li key={r}>{r}</li>)}
                    </ul>
                    <h4 className="font-bold text-white mt-2">{analysis.runes.secondaryPath}</h4>
                    <ul className="list-disc list-inside text-sm text-gray-300">
                         {analysis.runes.secondaryRunes.map(r => <li key={r}>{r}</li>)}
                    </ul>
                </div>
            </Section>
            <Section title="Skill Order">
                <div className="flex items-center gap-2">
                    {analysis.skillOrder.map((skill, i) => (
                        <React.Fragment key={i}>
                             <div className="w-10 h-10 bg-slate-900 rounded-md flex items-center justify-center font-bold text-[rgb(var(--color-accent-text))] text-lg border border-slate-700">
                                {skill}
                            </div>
                            {i < analysis.skillOrder.length - 1 && <span className="text-gray-400 font-bold">&rarr;</span>}
                        </React.Fragment>
                    ))}
                </div>
            </Section>
            <Section title="Playstyle">
                <div className="space-y-2 text-sm">
                    <p><strong className="font-semibold text-gray-200">Early Game:</strong> {analysis.playstyle.earlyGame}</p>
                    <p><strong className="font-semibold text-gray-200">Mid Game:</strong> {analysis.playstyle.midGame}</p>
                    <p><strong className="font-semibold text-gray-200">Late Game:</strong> {analysis.playstyle.lateGame}</p>
                </div>
            </Section>
        </div>
        <div className="space-y-6">
            <Section title="Build Path">
                <div className="space-y-3">
                    <div>
                        <h4 className="font-semibold text-gray-200 mb-1">Starting Items</h4>
                        <div className="flex flex-wrap gap-2 text-sm text-gray-300">{analysis.build.startingItems.join(', ')}</div>
                    </div>
                     <div>
                        <h4 className="font-semibold text-gray-200 mb-1">Core Items</h4>
                        <div className="flex flex-wrap gap-2 text-sm text-yellow-300 font-bold">{analysis.build.coreItems.join(', ')}</div>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-200 mb-1">Situational Options</h4>
                        <ul className="space-y-2">
                            {analysis.build.situationalItems.map(item => (
                                <li key={item.item} className="text-sm bg-slate-900/50 p-2 rounded-md">
                                    <strong className="text-gray-100">{item.item}:</strong> <span className="text-gray-400">{item.reason}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </Section>
        </div>
    </div>
);

const MatchupsDisplay: React.FC<{ analysis: MatchupAnalysis, championName: string }> = ({ analysis, championName }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Section title="Tough Matchups">
            <div className="space-y-3">
                {analysis.weakAgainstTips.map(matchup => (
                    <div key={matchup.championName} className="bg-red-900/20 p-3 rounded-lg border border-red-500/30">
                        <h4 className="font-bold text-red-300">vs. {matchup.championName}</h4>
                        <p className="text-sm text-gray-300">{matchup.tip}</p>
                    </div>
                ))}
            </div>
        </Section>
        <Section title="Favorable Matchups">
             <div className="space-y-3">
                {analysis.strongAgainstTips.map(matchup => (
                    <div key={matchup.championName} className="bg-green-900/20 p-3 rounded-lg border border-green-500/30">
                        <h4 className="font-bold text-green-300">vs. {matchup.championName}</h4>
                        <p className="text-sm text-gray-300">{matchup.tip}</p>
                    </div>
                ))}
            </div>
        </Section>
    </div>
);

// --- Main Modal Component ---

export const ChampionDetailModal: React.FC<{ champion: Champion; isOpen: boolean; onClose: () => void; onLoadInLab: (championId: string) => void; }> = ({ champion, isOpen, onClose, onLoadInLab }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'abilities' | 'strategy' | 'matchups'>('overview');
  
  const [aiAnalysis, setAiAnalysis] = useState<ChampionAnalysis | null>(null);
  const [isStrategyLoading, setIsStrategyLoading] = useState(false);
  const [strategyError, setStrategyError] = useState<string | null>(null);

  const [matchupAnalysis, setMatchupAnalysis] = useState<MatchupAnalysis | null>(null);
  const [isMatchupsLoading, setIsMatchupsLoading] = useState(false);
  const [matchupsError, setMatchupsError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setActiveTab('overview');
    setAiAnalysis(null);
    setStrategyError(null);
    setMatchupAnalysis(null);
    setMatchupsError(null);
    return () => abortControllerRef.current?.abort();
  }, [champion, isOpen]);

  const handleFetchStrategy = () => {
    if (aiAnalysis) return; // Don't refetch
    
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsStrategyLoading(true);
    setStrategyError(null);

    getChampionAnalysis(champion.name, controller.signal)
        .then(analysis => { if (!controller.signal.aborted) setAiAnalysis(analysis); })
        .catch(err => { if (!(err instanceof DOMException && err.name === 'AbortError')) setStrategyError(err.message || 'Failed to fetch analysis.'); })
        .finally(() => { if (!controller.signal.aborted) setIsStrategyLoading(false); });
  };

  const handleFetchMatchups = () => {
    if (matchupAnalysis || !aiAnalysis) return;
    
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsMatchupsLoading(true);
    setMatchupsError(null);

    getMatchupAnalysis(champion.name, aiAnalysis.counters.weakAgainst, aiAnalysis.counters.strongAgainst, controller.signal)
        .then(analysis => { if (!controller.signal.aborted) setMatchupAnalysis(analysis); })
        .catch(err => { if (!(err instanceof DOMException && err.name === 'AbortError')) setMatchupsError(err.message || 'Failed to fetch matchup tips.'); })
        .finally(() => { if (!controller.signal.aborted) setIsMatchupsLoading(false); });
  };

  const changeTab = (tab: typeof activeTab) => {
    setActiveTab(tab);
    if (tab === 'strategy') handleFetchStrategy();
    if (tab === 'matchups' && aiAnalysis) handleFetchMatchups();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${champion.name} - ${champion.title}`}>
      <div className="p-4 md:p-0">
        <div className="px-4 border-b border-slate-700 flex items-center flex-wrap">
          <TabButton active={activeTab === 'overview'} onClick={() => changeTab('overview')}>Overview</TabButton>
          <TabButton active={activeTab === 'abilities'} onClick={() => changeTab('abilities')}>Abilities</TabButton>
          <TabButton active={activeTab === 'strategy'} onClick={() => changeTab('strategy')}>AI Strategy</TabButton>
          <TabButton active={activeTab === 'matchups'} onClick={() => changeTab('matchups')} disabled={!aiAnalysis}>Matchups</TabButton>
        </div>
        
        <div className="p-4 min-h-[400px]">
          {activeTab === 'overview' && <OverviewDisplay champion={champion} />}
          {activeTab === 'abilities' && <AbilitiesDisplay abilities={champion.abilities} />}
          {activeTab === 'strategy' && (
            isStrategyLoading ? <SkeletonLoader /> :
            strategyError ? <ErrorDisplay message={strategyError} onRetry={handleFetchStrategy} /> :
            aiAnalysis && <AIStrategyDisplay analysis={aiAnalysis} />
          )}
          {activeTab === 'matchups' && (
            isMatchupsLoading ? <SkeletonLoader /> :
            matchupsError ? <ErrorDisplay message={matchupsError} onRetry={handleFetchMatchups} /> :
            matchupAnalysis && <MatchupsDisplay analysis={matchupAnalysis} championName={champion.name} />
          )}
        </div>

        <div className="p-4 mt-4 border-t border-slate-700 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Close</Button>
          <Button variant="primary" onClick={() => onLoadInLab(champion.id)}>Try in Lab</Button>
        </div>
      </div>
    </Modal>
  );
};
