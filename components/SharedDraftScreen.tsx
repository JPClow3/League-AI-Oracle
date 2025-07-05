import React from 'react';
import { SharePayload, DDragonData, Champion, DraftSlot } from '../types';
import FullAnalysisDisplay from './common/FullAnalysisDisplay';
import { ChampionIcon } from './common/ChampionIcon';
import { Icon } from './common/Icon';

interface SharedDraftScreenProps {
  sharedData: SharePayload;
  ddragonData: DDragonData;
}

const TeamDisplay: React.FC<{
    team: 'BLUE' | 'RED';
    picks: DraftSlot[];
    bans: (Champion | null)[];
    version: string;
}> = ({ team, picks, bans, version }) => {
    const teamColor = team === 'BLUE' ? 'blue' : 'red';
    return (
        <div className={`flex-1 space-y-3 p-4 bg-slate-100 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700`}>
            <h2 className={`text-2xl font-display text-center text-${teamColor}-600 dark:text-${teamColor}-400`}>{team} TEAM</h2>
            <div>
                <h3 className="font-semibold text-sm text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 pb-1 mb-2">PICKS</h3>
                <div className="grid grid-cols-5 gap-3">
                    {picks.map((pick, i) => (
                        <div key={i} className="flex flex-col items-center gap-1">
                            <ChampionIcon champion={pick.champion} version={version} isClickable={false} className="w-full aspect-square" />
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wider">{pick.role.substring(0, 3)}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div>
                <h3 className="font-semibold text-sm text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 pb-1 mb-2">BANS</h3>
                <div className="flex justify-center gap-2">
                    {bans.map((ban, i) => (
                        <div key={i} className="w-16 h-16 bg-slate-200 dark:bg-slate-900/50 rounded-md">
                            <ChampionIcon champion={ban} version={version} isClickable={false} className="grayscale w-16 h-16" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const SharedDraftScreen: React.FC<SharedDraftScreenProps> = ({ sharedData, ddragonData }) => {
  const { draftState, analysis } = sharedData;

  const handleReturnHome = () => {
    window.location.href = window.location.origin;
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6 md:p-8 animate-fade-in">
        <header className="w-full max-w-7xl mb-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl sm:text-4xl font-display text-indigo-600 dark:text-indigo-400">
                    DraftWise AI <span className="text-slate-500 dark:text-slate-400 font-sans text-xl sm:text-2xl">| Shared Analysis</span>
                </h1>
                <button 
                    onClick={handleReturnHome}
                    className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors"
                >
                    <Icon name="home" className="w-5 h-5 inline-block mr-2" />
                    Go to App
                </button>
            </div>
        </header>

      <div className="w-full max-w-7xl space-y-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <TeamDisplay
            team="BLUE"
            picks={draftState.blueTeam.picks}
            bans={draftState.blueTeam.bans}
            version={ddragonData.version}
          />
          <TeamDisplay
            team="RED"
            picks={draftState.redTeam.picks}
            bans={draftState.redTeam.bans}
            version={ddragonData.version}
          />
        </div>

        <div className="p-4 sm:p-6 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
            <h2 className="text-3xl font-display text-teal-600 dark:text-teal-400 mb-4">In-Depth AI Analysis</h2>
            <FullAnalysisDisplay analysis={analysis} onKeywordClick={() => { /* No-op for shared view */ }} ddragonData={ddragonData} />
        </div>
      </div>
    </div>
  );
};

export default SharedDraftScreen;