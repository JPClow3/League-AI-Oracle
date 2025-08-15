import React, { useMemo } from 'react';
import type { DraftSlot } from '../../types';
import { Tooltip } from '../common/Tooltip';

interface TeamAnalyticsProps {
  picks: DraftSlot[];
}

const scoreMap: Record<string, number> = { Low: 1, Medium: 2, High: 3 };
const scoreToRating = (score: number, max: number): 'Low' | 'Medium' | 'High' => {
    const percentage = score / max;
    if (percentage < 0.34) return 'Low';
    if (percentage < 0.67) return 'Medium';
    return 'High';
}

const RatingIndicator: React.FC<{ label: string, rating: 'Low' | 'Medium' | 'High' }> = ({ label, rating }) => {
    const ratingColor = {
        Low: 'text-red-400',
        Medium: 'text-yellow-400',
        High: 'text-green-400',
    }[rating];
    return (
        <div className="flex justify-between items-center text-sm">
            <span className="font-semibold text-gray-300">{label}</span>
            <span className={`font-bold ${ratingColor}`}>{rating}</span>
        </div>
    );
}

export const TeamAnalytics: React.FC<TeamAnalyticsProps> = ({ picks }) => {
  const analytics = useMemo(() => {
    const pickedChampions = picks.map(p => p.champion).filter((c): c is NonNullable<typeof c> => !!c);
    if (pickedChampions.length === 0) {
      return { ad: 0, ap: 0, mixed: 0, cc: 0, engage: 0, isUnbalanced: false };
    }

    const damage = pickedChampions.reduce((acc, champ) => {
        if (champ.damageType === 'AD') acc.ad++;
        else if (champ.damageType === 'AP') acc.ap++;
        else acc.mixed++;
        return acc;
    }, { ad: 0, ap: 0, mixed: 0 });

    const cc = pickedChampions.reduce((sum, champ) => sum + (scoreMap[champ.cc] || 0), 0);
    const engage = pickedChampions.reduce((sum, champ) => sum + (scoreMap[champ.engage] || 0), 0);
    
    // Unbalanced if 4+ champs are primarily one damage type (excluding mixed)
    const isUnbalanced = (damage.ad >= 4 && damage.ap === 0) || (damage.ap >= 4 && damage.ad === 0);

    return { ...damage, cc, engage, isUnbalanced };
  }, [picks]);

  const maxScore = 5 * 3; // 5 champions, max score of 3 each

  return (
    <div className="bg-slate-900/50 p-3 rounded-md mb-4 space-y-3">
        <div className="text-center">
            <div className="flex justify-between items-center">
                <h4 className="text-sm font-bold text-gray-300">Damage Profile</h4>
                {analytics.isUnbalanced && (
                    <Tooltip content="Team is heavily skewed towards one damage type, making it easy for opponents to itemize defensively.">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                           <path fillRule="evenodd" d="M8.257 3.099c.636-1.21 2.273-1.21 2.91 0l5.425 10.32c.636 1.21-.273 2.706-1.455 2.706H4.287c-1.182 0-2.091-1.496-1.455-2.706L8.257 3.099zM10 12a1 1 0 100-2 1 1 0 000 2zm0-4a1 1 0 00-1 1v1a1 1 0 102 0V9a1 1 0 00-1-1z" clipRule="evenodd" />
                         </svg>
                    </Tooltip>
                )}
            </div>
            <div className="flex justify-center gap-4 text-xs pt-1">
                <div className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.5 2a.5.5 0 00-.5.5v1.5H4a1 1 0 00-1 1v10a1 1 0 001 1h12a1 1 0 001-1V5a1 1 0 00-1-1h-1.5V2.5a.5.5 0 00-.5-.5h-9zM4.5 5H15v9H4.5V5z" clipRule="evenodd" /><path fillRule="evenodd" d="M6 7a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h4a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                    <span className="font-semibold text-red-400">AD: {analytics.ad}</span>
                </div>
                 <div className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400" viewBox="0 0 20 20" fill="currentColor"><path d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h14a1 1 0 001-1V4a1 1 0 00-1-1H3zm3.707 3.707a1 1 0 011.414 0L10 8.586l1.879-1.88a1 1 0 111.414 1.415L11.414 10l1.879 1.879a1 1 0 01-1.414 1.414L10 11.414l-1.879 1.879a1 1 0 01-1.414-1.414L8.586 10 6.707 8.121a1 1 0 010-1.414z" /></svg>
                    <span className="font-semibold text-blue-400">AP: {analytics.ap}</span>
                </div>
                <div className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 5a1 1 0 000 2h1a1 1 0 000-2H7zM4 9a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm1 3a1 1 0 100 2h1a1 1 0 100-2H5zm3 2a1 1 0 11-2 0 1 1 0 012 0zm2-2a1 1 0 100-2 1 1 0 000 2zm4-3a1 1 0 11-2 0 1 1 0 012 0zm-2 5a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
                    <span className="font-semibold text-purple-400">Mixed: {analytics.mixed}</span>
                </div>
            </div>
        </div>
        <RatingIndicator label="Crowd Control" rating={scoreToRating(analytics.cc, maxScore)} />
        <RatingIndicator label="Engage Potential" rating={scoreToRating(analytics.engage, maxScore)} />
    </div>
  );
};