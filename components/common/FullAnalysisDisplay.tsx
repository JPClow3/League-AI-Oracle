import React, { useState, useMemo } from 'react';
import { AIAnalysis, Role, DDragonData, Champion, DraftState, WinCondition } from '../../types';
import InteractiveText from './InteractiveText';
import { ChampionIcon } from './ChampionIcon';
import { Icon } from './Icon';
import { calculateTeamAnalytics } from '../../data/analyticsHelper';
import { TeamDNARadarChart } from './TeamDNARadarChart';
import { PowerSpikeTimeline } from './PowerSpikeTimeline';
import { MVPCard } from './MVPCard';
import { ThreatCard } from './ThreatCard';

const WinConditionCard: React.FC<{ condition: WinCondition; onKeywordClick: (id: string) => void; }> = ({ condition, onKeywordClick }) => {
    const iconMap: Record<WinCondition['category'], React.ComponentProps<typeof Icon>['name']> = {
        Protect: 'shield', Siege: 'tower', Objective: 'dragon', Pick: 'target', Teamfight: 'sword', Macro: 'map'
    };
    const iconName = iconMap[condition.category] || 'brain';

    return (
        <div className="flex items-start gap-3 p-3 bg-slate-200/50 dark:bg-slate-900/40 rounded-lg border border-slate-300 dark:border-slate-700/50">
            <Icon name={iconName} className="w-6 h-6 text-indigo-500 dark:text-indigo-400 flex-shrink-0 mt-1" />
            <div>
                <h5 className="font-semibold text-slate-800 dark:text-slate-200">{condition.category}</h5>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                    <InteractiveText onKeywordClick={onKeywordClick}>{condition.text}</InteractiveText>
                </p>
            </div>
        </div>
    );
};

interface FullAnalysisDisplayProps {
  analysis: AIAnalysis;
  ddragonData: DDragonData;
  onKeywordClick: (lessonId: string) => void;
  draftState: DraftState;
}

const FullAnalysisDisplay: React.FC<FullAnalysisDisplayProps> = ({ analysis, ddragonData, onKeywordClick, draftState }) => {
  const getChampion = (name: string): Champion | null => {
      return Object.values(ddragonData.champions).find(c => c.name === name) || null;
  };

  const blueChampions = draftState.blueTeam.picks.map(p => p.champion).filter((c): c is Champion => c !== null);
  const redChampions = draftState.redTeam.picks.map(p => p.champion).filter((c): c is Champion => c !== null);

  const blueAnalytics = useMemo(() => calculateTeamAnalytics(blueChampions), [blueChampions]);
  const redAnalytics = useMemo(() => calculateTeamAnalytics(redChampions), [redChampions]);


  return (
    <div className="space-y-4 animate-fade-in text-sm">
      <details className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800/80" open>
        <summary className="font-display text-xl text-slate-800 dark:text-slate-200 cursor-pointer">Power Spike Timeline</summary>
        <div className="pt-2">
            <PowerSpikeTimeline powerSpikes={analysis.powerSpikes} onKeywordClick={onKeywordClick}/>
        </div>
      </details>
      
      <details className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800/80" open>
        <summary className="font-display text-xl text-slate-800 dark:text-slate-200 cursor-pointer">Key Champions & Team DNA</summary>
        <div className="pt-2 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <div className="space-y-4">
                <MVPCard 
                    champion={getChampion(analysis.mvp.championName)}
                    reasoning={analysis.mvp.reasoning}
                    version={ddragonData.version}
                    onKeywordClick={onKeywordClick}
                />
                {analysis.enemyThreats?.map(threat => (
                    <ThreatCard
                        key={threat.championName}
                        champion={getChampion(threat.championName)}
                        threatLevel={threat.threatLevel}
                        counterplay={threat.counterplay}
                        itemSpikeWarning={threat.itemSpikeWarning}
                        version={ddragonData.version}
                        onKeywordClick={onKeywordClick}
                    />
                ))}
            </div>
            <div>
                <div className="flex flex-col sm:flex-row justify-around items-center gap-4">
                    <TeamDNARadarChart dnaData={blueAnalytics.teamDNA} color="blue" title="Blue Team"/>
                    <TeamDNARadarChart dnaData={redAnalytics.teamDNA} color="red" title="Red Team"/>
                </div>
                <div className="mt-4 text-xs text-slate-500 dark:text-slate-400 space-y-1">
                    <p><strong>Team Identity (Blue):</strong> {analysis.teamIdentities.blue}</p>
                    <p><strong>Team Identity (Red):</strong> {analysis.teamIdentities.red}</p>
                </div>
            </div>
        </div>
      </details>

       <details className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800/80" open>
        <summary className="font-display text-xl text-slate-800 dark:text-slate-200 cursor-pointer">Win Conditions & Strategy</summary>
        <div className="pt-2 space-y-4">
          <div className="p-3 bg-slate-200/50 dark:bg-black/20 rounded-lg">
            <h4 className="font-semibold text-slate-700 dark:text-slate-300">Overall Strategic Focus:</h4>
            <InteractiveText onKeywordClick={onKeywordClick}>{analysis.strategicFocus}</InteractiveText>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-blue-500 mb-2">Blue Team Objectives</h4>
              <div className="space-y-2">
                {analysis.winConditions.blue.map((wc, i) => <WinConditionCard key={`b-wc-${i}`} condition={wc} onKeywordClick={onKeywordClick} />)}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-red-500 mb-2">Red Team Objectives</h4>
              <div className="space-y-2">
                {analysis.winConditions.red.map((wc, i) => <WinConditionCard key={`r-wc-${i}`} condition={wc} onKeywordClick={onKeywordClick} />)}
              </div>
            </div>
          </div>
        </div>
      </details>

      <details className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30" open>
        <summary className="font-display text-xl text-amber-600 dark:text-amber-400 cursor-pointer">In-Game Cheat Sheet</summary>
        <div className="pt-2 grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-4">
          <div className="space-y-1">
            <h4 className="font-semibold text-blue-500">Your Team (Blue)</h4>
            <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
              {analysis.inGameCheatSheet.blue.map((tip, i) => <li key={`b-cs-${i}`}><InteractiveText onKeywordClick={onKeywordClick}>{tip}</InteractiveText></li>)}
            </ul>
          </div>
          <div className="space-y-1">
            <h4 className="font-semibold text-red-500">Enemy Team (Red)</h4>
            <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
              {analysis.inGameCheatSheet.red.map((tip, i) => <li key={`r-cs-${i}`}><InteractiveText onKeywordClick={onKeywordClick}>{tip}</InteractiveText></li>)}
            </ul>
          </div>
        </div>
      </details>
    </div>
  );
};

export default FullAnalysisDisplay;