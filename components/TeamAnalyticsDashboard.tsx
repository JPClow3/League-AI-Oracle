
import React, { useState, useEffect, useMemo } from 'react';
import { Champion, Team, TeamAnalytics, ScoreType } from '../types';
import { calculateTeamAnalytics } from '../data/analyticsHelper';
import { OracleEyeButton } from './common/OracleEyeButton';
import { geminiService } from '../services/geminiService';
import { useProfile } from '../contexts/ProfileContext';

interface TeamAnalyticsDashboardProps {
  teamName: Team;
  champions: (Champion | null)[];
}

const TeamAnalyticsDashboard: React.FC<TeamAnalyticsDashboardProps> = ({ teamName, champions }) => {
  const { activeProfile } = useProfile();
  const { settings } = activeProfile!;

  const [analytics, setAnalytics] = useState<TeamAnalytics | null>(null);
  const [explanation, setExplanation] = useState<{type: ScoreType; text: string} | null>(null);
  const [loadingExplanation, setLoadingExplanation] = useState<ScoreType | null>(null);

  const validChampions = useMemo(() => champions.filter((c): c is Champion => c !== null), [champions]);

  useEffect(() => {
    const calculatedAnalytics = calculateTeamAnalytics(validChampions);
    setAnalytics(calculatedAnalytics);
    setExplanation(null); // Reset explanation when team changes
  }, [validChampions]);

  const handleGetExplanation = async (scoreType: ScoreType) => {
    if (validChampions.length === 0) return;

    setLoadingExplanation(scoreType);
    if(explanation?.type === scoreType) {
        setExplanation(null); // Allow toggling off
        setLoadingExplanation(null);
        return;
    }

    const result = await geminiService.getScoreExplanation(validChampions, scoreType, settings);
    if (result) {
        setExplanation({ type: scoreType, text: result.explanation });
    }
    setLoadingExplanation(null);
  }

  if (!analytics) return null;
  
  const teamColor = teamName === 'BLUE' ? 'blue' : 'red';
  const totalDamage = analytics.damageProfile.ad + analytics.damageProfile.ap + analytics.damageProfile.hybrid;
  const maxScore = validChampions.length * 3;
  const maxDnaScore = Math.max(1, validChampions.length); // Avoid division by zero, min score of 1 per champ in a category

  const renderStat = (scoreType: ScoreType, score: {value: number; label: string}) => (
     <div className="animate-fade-in">
        <div className="flex justify-between items-center">
            <span className="text-xs font-semibold">{scoreType}: {score.label}</span>
            <OracleEyeButton onClick={() => handleGetExplanation(scoreType)} isLoading={loadingExplanation === scoreType} title={`Explain ${scoreType} score`} />
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 mt-1">
            <div className="bg-indigo-600 dark:bg-indigo-500 h-2.5 rounded-full transition-all duration-200" style={{ width: `${maxScore > 0 ? (score.value / maxScore) * 100 : 0}%` }}></div>
        </div>
        {explanation?.type === scoreType && <p className="text-xs text-right italic text-indigo-500 dark:text-indigo-400 p-1 bg-slate-100 dark:bg-slate-900/50 rounded mt-1 animate-fade-in">"{explanation.text}"</p>}
    </div>
  );
  
  const DNABar: React.FC<{ label: string; value: number }> = ({ label, value }) => (
    <div>
        <span className="text-xs font-semibold">{label}</span>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 mt-0.5">
            <div className={`bg-${teamColor}-500 h-2.5 rounded-full transition-all duration-300`} style={{ width: `${(value / maxDnaScore) * 100}%` }}></div>
        </div>
    </div>
  );

  return (
    <div className={`p-3 bg-slate-100/50 dark:bg-slate-900/30 rounded-lg space-y-3 text-sm`}>
        <h4 className={`font-display text-xl text-${teamColor}-600 dark:text-${teamColor}-400`}>{teamName} Team Analysis</h4>
        
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold">Damage Profile</span>
                <OracleEyeButton onClick={() => handleGetExplanation('Damage Profile')} isLoading={loadingExplanation === 'Damage Profile'} title="Explain Damage Profile" />
            </div>
            {totalDamage > 0 ? (
                <div className="flex w-full h-3 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700" title={`AD: ${analytics.damageProfile.ad}, AP: ${analytics.damageProfile.ap}, Hybrid: ${analytics.damageProfile.hybrid}`}>
                    <div className="bg-rose-500 hover:opacity-80 transition-all duration-200" style={{ width: `${(analytics.damageProfile.ad / totalDamage) * 100}%` }} title={`AD Damage (${analytics.damageProfile.ad})`}></div>
                    <div className="bg-sky-500 hover:opacity-80 transition-all duration-200" style={{ width: `${(analytics.damageProfile.ap / totalDamage) * 100}%` }} title={`AP Damage (${analytics.damageProfile.ap})`}></div>
                    <div className="bg-purple-500 hover:opacity-80 transition-all duration-200" style={{ width: `${(analytics.damageProfile.hybrid / totalDamage) * 100}%` }} title={`Hybrid Damage (${analytics.damageProfile.hybrid})`}></div>
                </div>
            ) : <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full"></div>}
            {explanation?.type === 'Damage Profile' && <p className="text-xs text-right italic text-indigo-500 dark:text-indigo-400 p-1 bg-slate-100 dark:bg-slate-900/50 rounded mt-1 animate-fade-in">"{explanation.text}"</p>}
        </div>
        
        {renderStat('CC', analytics.ccScore)}
        {renderStat('Engage', analytics.engageScore)}

        {validChampions.length > 0 && (
             <details className="animate-fade-in" open>
                <summary className="text-xs font-semibold cursor-pointer select-none">Team DNA</summary>
                <div className="pt-2 grid grid-cols-2 gap-x-4 gap-y-2">
                   {Object.entries(analytics.teamDNA).map(([key, value]) => (
                      value > 0 && <DNABar key={key} label={key} value={value} />
                   ))}
                </div>
            </details>
        )}
    </div>
  );
};

export default TeamAnalyticsDashboard;
