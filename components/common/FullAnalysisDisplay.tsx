
import React from 'react';
import { AIAnalysis, Role, DDragonData, Champion, DraftState } from '../../types';
import InteractiveText from './InteractiveText';
import { WinConditionCard } from './WinConditionCard';
import { PowerSpikeTimeline } from './PowerSpikeTimeline';
import { MVPCard } from './MVPCard';
import { ThreatCard } from './ThreatCard';
import { calculateTeamAnalytics } from '../../data/analyticsHelper';
import { TeamDNARadarChart } from './TeamDNARadarChart';

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

  const blueAnalytics = calculateTeamAnalytics(blueChampions);
  const redAnalytics = calculateTeamAnalytics(redChampions);


  return (
    <div className="space-y-6 animate-fade-in text-sm">
      {/* Power Spike Timeline - Hero Element */}
      <details className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800/80" open>
        <summary className="cursor-pointer font-bold text-lg text-slate-800 dark:text-slate-200">Power Spike Timeline</summary>
        <div className="pt-2">
            <PowerSpikeTimeline powerSpikes={analysis.powerSpikes} onKeywordClick={onKeywordClick}/>
        </div>
      </details>
      
      {/* Primary Insights - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: Champion-specific analysis */}
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
        
        {/* Right Column: Team DNA Comparison */}
        <details className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800/80 h-full" open>
            <summary className="cursor-pointer font-bold text-lg text-slate-800 dark:text-slate-200">Team DNA Comparison</summary>
            <div className="pt-2 flex flex-col sm:flex-row justify-around items-center gap-4">
                <TeamDNARadarChart dnaData={blueAnalytics.teamDNA} color="blue" title="Blue Team"/>
                <TeamDNARadarChart dnaData={redAnalytics.teamDNA} color="red" title="Red Team"/>
            </div>
            <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">
                <p><strong>Team Identity (Blue):</strong> {analysis.teamIdentities.blue}</p>
                <p><strong>Team Identity (Red):</strong> {analysis.teamIdentities.red}</p>
            </div>
        </details>
      </div>

      {/* Secondary Insights - Full Width Cards */}
       <details className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800/80" open>
        <summary className="cursor-pointer font-bold text-lg text-slate-800 dark:text-slate-200">Win Conditions & Strategy</summary>
        <div className="pt-2 space-y-4">
          <div className="p-3 bg-slate-200/50 dark:bg-black/20 rounded-lg">
            <h4 className="font-semibold text-slate-700 dark:text-slate-300">Overall Strategic Focus:</h4>
            <InteractiveText onKeywordClick={onKeywordClick}>{analysis.strategicFocus}</InteractiveText>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
          </div>
        </div>
      </details>

      <details className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30" open>
        <summary className="cursor-pointer font-bold text-lg text-amber-600 dark:text-amber-400">In-Game Cheat Sheet</summary>
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