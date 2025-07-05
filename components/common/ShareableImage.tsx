import React from 'react';
import { AIAnalysis, DDragonData, DraftState, Champion, DraftSlot, WinCondition } from '../../types';
import { ChampionIcon } from './ChampionIcon';
import { Icon } from './Icon';
import { MVPCard } from './MVPCard';
import { ThreatCard } from './ThreatCard';

interface ShareableImageProps {
    draftState: DraftState;
    analysis: AIAnalysis;
    ddragonData: DDragonData;
}

const ShareableTeamDisplay: React.FC<{
    team: 'BLUE' | 'RED';
    picks: DraftSlot[];
    bans: (Champion | null)[];
    version: string;
}> = ({ team, picks, bans, version }) => {
    const teamColor = team === 'BLUE' ? 'text-blue-400' : 'text-red-400';
    return (
        <div className="flex-1 space-y-4 rounded-lg p-4 bg-slate-800/50 border border-slate-700">
            <h3 className={`font-display text-3xl text-center ${teamColor}`}>{team} TEAM</h3>
            <div>
                <h4 className="font-semibold text-sm text-slate-400 border-b border-slate-700 pb-1 mb-2">PICKS</h4>
                <div className="flex justify-center gap-3">
                    {picks.map((pick, i) => (
                        <div key={i} className="flex flex-col items-center gap-1 w-24">
                            <ChampionIcon champion={pick.champion} version={version} isClickable={false} className="w-24 h-24" />
                            <span className="text-xs font-semibold text-slate-400 tracking-wider">{pick.role.substring(0, 3)}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div>
                <h4 className="font-semibold text-sm text-slate-400 border-b border-slate-700 pb-1 mb-2">BANS</h4>
                <div className="flex justify-center gap-2">
                    {bans.map((ban, i) => (
                        <div key={i} className="w-16 h-16 bg-slate-900/50 rounded-md">
                            <ChampionIcon champion={ban} version={version} isClickable={false} className="grayscale w-16 h-16" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const StaticWinConditionCard: React.FC<{condition: WinCondition}> = ({ condition }) => {
    const iconMap: Record<WinCondition['category'], React.ComponentProps<typeof Icon>['name']> = {
        Protect: 'shield', Siege: 'tower', Objective: 'dragon', Pick: 'target', Teamfight: 'sword', Macro: 'map'
    };
    return (
        <div className="flex items-start gap-2 p-2 bg-slate-900/50 rounded-md">
            <Icon name={iconMap[condition.category] || 'brain'} className="w-5 h-5 flex-shrink-0 mt-0.5 text-indigo-400" />
            <p className="text-slate-300 text-xs">{condition.text}</p>
        </div>
    );
};

const StaticPowerSpikeTimeline: React.FC<{ powerSpikes: AIAnalysis['powerSpikes'] }> = ({ powerSpikes }) => {
    const height = 80, width = 280, padding = 10;
    const getPath = (data: { early: number, mid: number, late: number }) => {
        const points = [data.early, data.mid, data.late];
        const y = (val: number) => height - padding - ((val - 1) / 9) * (height - padding * 2);
        const x = (i: number) => padding + i * ((width - padding * 2) / 2);
        const coords = points.map((p,i) => ({x: x(i), y: y(p)}));
        if (coords.length === 0) return '';
        let path = `M ${coords[0].x} ${coords[0].y}`;
        for (let i = 0; i < coords.length - 1; i++) {
            const x_mid = (coords[i].x + coords[i + 1].x) / 2;
            path += ` C ${x_mid} ${coords[i].y}, ${x_mid} ${coords[i+1].y}, ${coords[i+1].x} ${coords[i+1].y}`;
        }
        return path;
    };
    return (
        <div className="w-full">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
                {[...Array(5)].map((_, i) => <line key={i} x1={padding} y1={padding + i * ((height - padding * 2) / 4)} x2={width - padding} y2={padding + i * ((height - padding * 2) / 4)} stroke="rgba(71, 85, 105, 0.5)" strokeWidth="0.5" />)}
                <path d={getPath(powerSpikes.blue)} stroke="#60a5fa" strokeWidth="2" fill="none" />
                <path d={getPath(powerSpikes.red)} stroke="#f87171" strokeWidth="2" fill="none" />
            </svg>
             <div className="flex justify-between text-xs text-slate-500 mt-1 px-2">
                <span>Early</span><span>Mid</span><span>Late</span>
            </div>
        </div>
    );
};

const ShareableImage: React.FC<ShareableImageProps> = ({ draftState, analysis, ddragonData }) => {
    const getChampion = (name: string): Champion | null => Object.values(ddragonData.champions).find(c => c.name === name) || null;

    return (
        <div className="dark font-sans" style={{ width: '1200px', height: 'auto' }}>
            <div className="bg-slate-900 text-slate-200 p-8 flex flex-col gap-6">
                <header className="text-center">
                    <h1 className="text-5xl font-display font-bold text-gradient-primary">DraftWise AI Analysis</h1>
                </header>

                <section className="flex gap-6">
                    <ShareableTeamDisplay team="BLUE" picks={draftState.blueTeam.picks} bans={draftState.blueTeam.bans} version={ddragonData.version} />
                    <ShareableTeamDisplay team="RED" picks={draftState.redTeam.picks} bans={draftState.redTeam.bans} version={ddragonData.version} />
                </section>
                
                <section className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-4">
                    <h2 className="font-display text-3xl text-center text-teal-400">AI Insights</h2>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="p-3 bg-slate-900/50 rounded-md flex flex-col gap-2">
                           <h4 className="font-semibold text-blue-400">Blue Team Objectives</h4>
                           {analysis.winConditions.blue.map((wc, i) => <StaticWinConditionCard key={`wc-b-${i}`} condition={wc} />)}
                        </div>
                         <div className="p-3 bg-slate-900/50 rounded-md flex flex-col gap-2">
                           <h4 className="font-semibold text-red-400">Red Team Objectives</h4>
                           {analysis.winConditions.red.map((wc, i) => <StaticWinConditionCard key={`wc-r-${i}`} condition={wc} />)}
                        </div>
                    </div>
                    <div className="p-3 bg-slate-900/50 rounded-md">
                        <h4 className="font-semibold text-amber-400">Overall Strategic Focus</h4>
                        <p className="text-sm text-slate-300">{analysis.strategicFocus}</p>
                    </div>

                     <div className="grid grid-cols-2 gap-4 items-start">
                        <div className="p-3 bg-slate-900/50 rounded-md">
                            <h4 className="font-semibold text-indigo-400 mb-2">Power Spike Timeline</h4>
                            <StaticPowerSpikeTimeline powerSpikes={analysis.powerSpikes} />
                            <div className="text-xs space-y-1 mt-2">
                                <p><strong className="text-blue-400">Blue:</strong> {analysis.powerSpikes.summary.blue}</p>
                                <p><strong className="text-red-400">Red:</strong> {analysis.powerSpikes.summary.red}</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <MVPCard champion={getChampion(analysis.mvp.championName)} reasoning={analysis.mvp.reasoning} version={ddragonData.version} onKeywordClick={() => {}}/>
                            {analysis.enemyThreats.map(threat => <ThreatCard key={threat.championName} champion={getChampion(threat.championName)} threatLevel={threat.threatLevel} counterplay={threat.counterplay} itemSpikeWarning={threat.itemSpikeWarning} version={ddragonData.version} onKeywordClick={() => {}}/>)}
                        </div>
                    </div>
                </section>

                <footer className="text-center text-xs text-slate-500">
                    Generated by DraftWise AI - {new Date().toLocaleDateString()}
                </footer>
            </div>
        </div>
    );
};

export default ShareableImage;
