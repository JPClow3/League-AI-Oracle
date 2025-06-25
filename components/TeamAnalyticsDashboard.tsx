
import React from 'react';
import { ChampionSlot, ChampionStaticInfo } from '../types';
import { getChampionStaticInfoById } from '../gameData';

interface TeamAnalyticsDashboardProps {
  teamPicks: ChampionSlot[];
  allChampionsStaticData: ChampionStaticInfo[]; 
  teamTitle: string;
}

const GaugeBar: React.FC<{ value: number; maxValue: number; segments?: number; colorClass?: string }> = 
({ value, maxValue, segments = 3, colorClass = 'bg-sky-500' }) => {
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
  const activeSegments = Math.ceil((value / maxValue) * segments);

  if (segments > 1) { 
    return (
      <div className="flex h-3.5 rounded-full bg-slate-700 w-24">
        {Array.from({ length: segments }).map((_, i) => (
          <div
            key={i}
            className={`h-full first:rounded-l-full last:rounded-r-full 
                        ${i < activeSegments ? colorClass : 'bg-slate-600'}
                        ${i > 0 ? 'border-l-2 border-slate-700' : ''}
                      `}
            style={{ width: `${100 / segments}%` }}
          ></div>
        ))}
      </div>
    );
  }

  return (
    <div className="h-3.5 rounded-full bg-slate-700 w-24 overflow-hidden">
      <div
        className={`h-full rounded-full ${colorClass} transition-all duration-300 ease-in-out`}
        style={{ width: `${Math.min(100, percentage)}%` }}
      ></div>
    </div>
  );
};


const TeamAnalyticsDashboardComponent: React.FC<TeamAnalyticsDashboardProps> = ({
  teamPicks,
  allChampionsStaticData, 
  teamTitle,
}) => {
  if (teamPicks.length === 0) {
    return (
      <div className="p-3 bg-slate-800 rounded-lg border border-slate-700 shadow-inner">
        <h4 className="text-sm font-semibold text-slate-300 mb-2 truncate">{teamTitle}</h4>
        <p className="text-xs text-slate-500 italic">No champions picked yet.</p>
      </div>
    );
  }

  let physicalDamageSources = 0;
  let magicDamageSources = 0;
  let ccScore = 0;
  let engageScore = 0;
  const archetypeCounts: Record<string, number> = {};

  teamPicks.forEach(pick => {
    const staticInfo = getChampionStaticInfoById(pick.ddragonKey || pick.champion);
    if (staticInfo) {
      if (staticInfo.damageType === 'Physical') physicalDamageSources += 1;
      else if (staticInfo.damageType === 'Magic') magicDamageSources += 1;
      else if (staticInfo.damageType === 'Mixed') {
        physicalDamageSources += 0.7; 
        magicDamageSources += 0.7;
      }

      (staticInfo.ccTypes || []).forEach(cc => {
        if (['Stun', 'Knockup', 'Charm', 'Taunt', 'Suppression', 'Displacement', 'Sleep', 'Berserk'].includes(cc)) ccScore += 2;
        else if (['Root', 'Silence', 'Polymorph', 'Grounding'].includes(cc)) ccScore += 1.5;
        else if (['Slow', 'Blind', 'Cripple'].includes(cc)) ccScore += 1; 
      });

      if (staticInfo.engagePotential === 'High') engageScore += 3;
      else if (staticInfo.engagePotential === 'Medium') engageScore += 2;
      else if (staticInfo.engagePotential === 'Low') engageScore += 1;
      
      (staticInfo.teamArchetypes || []).forEach(type => {
        archetypeCounts[type] = (archetypeCounts[type] || 0) + 1;
      });
    }
  });

  const totalDamageSources = physicalDamageSources + magicDamageSources;
  const physicalPercent = totalDamageSources > 0 ? (physicalDamageSources / totalDamageSources) * 100 : 0;
  const magicPercent = totalDamageSources > 0 ? (magicDamageSources / totalDamageSources) * 100 : 0;

  const getQualitativeScore = (score: number, lowThreshold: number, midThreshold: number): string => {
    if (score === 0 && teamPicks.length > 0) return 'Very Low';
    if (score < lowThreshold) return 'Low';
    if (score < midThreshold) return 'Medium';
    return 'High';
  };
  
  const ccQuality = getQualitativeScore(ccScore, 4, 8); 
  const engageQuality = getQualitativeScore(engageScore, 5, 10); 

  const topArchetypes = Object.entries(archetypeCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([type]) => type);

  const metricItemClass = "flex justify-between items-center text-xs mb-1.5";
  const metricLabelClass = "text-slate-400 mr-2";
  const metricValueClass = "font-semibold text-slate-200";

  return (
    <div className="p-3 bg-slate-800/70 rounded-lg border border-slate-700 shadow-inner">
      <h4 className="text-sm font-semibold text-slate-300 mb-2 truncate" title={teamTitle}>{teamTitle}</h4>
      
      <div className={metricItemClass}>
        <span className={metricLabelClass}>Damage Profile:</span>
        <div className="flex items-center">
            <div className="w-16 sm:w-20 h-3.5 bg-slate-700 rounded-full flex overflow-hidden mr-1.5">
            <div className="bg-orange-500 h-full" style={{ width: `${physicalPercent}%` }} title={`Physical: ${physicalPercent.toFixed(0)}%`}></div>
            <div className="bg-sky-500 h-full" style={{ width: `${magicPercent}%` }} title={`Magic: ${magicPercent.toFixed(0)}%`}></div>
            </div>
            <span className={`${metricValueClass} text-[10px]`}>{physicalPercent.toFixed(0)}% AD / {magicPercent.toFixed(0)}% AP</span>
        </div>
      </div>

      <div className={metricItemClass}>
        <span className={metricLabelClass}>CC Score:</span>
        <div className="flex items-center">
          <GaugeBar value={ccScore} maxValue={12} colorClass="bg-purple-500" />
          <span className={`${metricValueClass} ml-1.5`}>{ccQuality}</span>
        </div>
      </div>

      <div className={metricItemClass}>
        <span className={metricLabelClass}>Engage:</span>
         <div className="flex items-center">
          <GaugeBar value={engageScore} maxValue={15} colorClass="bg-red-500" />
          <span className={`${metricValueClass} ml-1.5`}>{engageQuality}</span>
        </div>
      </div>
      
      {topArchetypes.length > 0 && (
        <div className="mt-2 pt-1.5 border-t border-slate-700/50">
          <span className={`${metricLabelClass} block mb-1`}>Archetypes:</span>
          <div className="flex flex-wrap gap-1">
            {topArchetypes.map(type => (
              <span key={type} className="px-1.5 py-0.5 text-[9px] bg-slate-600 text-slate-300 rounded-full">
                {type}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const TeamAnalyticsDashboard = React.memo(TeamAnalyticsDashboardComponent);
