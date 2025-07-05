import React from 'react';
import { AIAnalysis, Role, DDragonData, Champion } from '../../types';
import InteractiveText from './InteractiveText';
import { WinConditionCard } from './WinConditionCard';
import { PowerSpikeTimeline } from './PowerSpikeTimeline';
import { MVPCard } from './MVPCard';
import { ThreatCard } from './ThreatCard';

interface FullAnalysisDisplayProps {
  analysis: AIAnalysis;
  ddragonData: DDragonData;
  onKeywordClick: (lessonId: string) => void;
}

const ROLES: Role[] = ['TOP', 'JUNGLE', 'MIDDLE', 'BOTTOM', 'SUPPORT'];

const FullAnalysisDisplay: React.FC<FullAnalysisDisplayProps> = ({ analysis, ddragonData, onKeywordClick }) => {
  const getChampion = (name: string): Champion | null => {
      return Object.values(ddragonData.champions).find(c => c.name === name) || null;
  };

  return (
    <div className="space-y-4 animate-fade-in text-sm">
      <details className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30" open>
        <summary className="cursor-pointer font-bold text-lg text-amber-600 dark:text-amber-400">In-Game Cheat Sheet</summary>
        <div className="pt-2 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div className="space-y-1">
            <h4 className="font-semibold text-blue-500">Your Team (Blue)</h4>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-400">
              {analysis.inGameCheatSheet.blue.map((tip, i) => <li key={`b-cs-${i}`}><InteractiveText onKeywordClick={onKeywordClick}>{tip}</InteractiveText></li>)}
            </ul>
          </div>
          <div className="space-y-1">
            <h4 className="font-semibold text-red-500">Enemy Team (Red)</h4>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-400">
              {analysis.inGameCheatSheet.red.map((tip, i) => <li key={`r-cs-${i}`}><InteractiveText onKeywordClick={onKeywordClick}>{tip}</InteractiveText></li>)}
            </ul>
          </div>
        </div>
      </details>

      <details className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800/80" open>
        <summary className="cursor-pointer font-semibold text-slate-800 dark:text-slate-200">Win Conditions & Strategy</summary>
        <div className="pt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-blue-500 mb-2">Blue Team Objectives</h4>
            <div className="space-y-2">
              {analysis.winConditions.blue.map((wc, i) => <WinConditionCard key={`b-wc-${i}`} condition={wc} />)}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-red-500 mb-2">Red Team Objectives</h4>
            <div className="space-y-2">
              {analysis.winConditions.red.map((wc, i) => <WinConditionCard key={`r-wc-${i}`} condition={wc} />)}
            </div>
          </div>
          <div className="md:col-span-2 pt-4 mt-4 border-t border-slate-200 dark:border-slate-700">
            <p className="font-semibold text-slate-700 dark:text-slate-300">Overall Strategic Focus:</p>
            <InteractiveText onKeywordClick={onKeywordClick}>{analysis.strategicFocus}</InteractiveText>
          </div>
        </div>
      </details>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        <details className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800/80 h-full" open>
          <summary className="cursor-pointer font-semibold text-slate-800 dark:text-slate-200">Power Spike Timeline</summary>
          <PowerSpikeTimeline powerSpikes={analysis.powerSpikes} />
        </details>
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
      </div>
      
    </div>
  );
};

export default FullAnalysisDisplay;