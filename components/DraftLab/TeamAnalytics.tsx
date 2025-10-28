import { useMemo } from 'react';
import type { DraftSlot } from '../../types';
import { Tooltip } from '../common/Tooltip';
import { AlertTriangle } from 'lucide-react';

interface TeamAnalyticsProps {
  picks: DraftSlot[];
}

const scoreMap: Record<string, number> = { Low: 1, Medium: 2, High: 3 };
const scoreToRating = (score: number, max: number): 'Low' | 'Medium' | 'High' => {
    if (max === 0) {return 'Low';}
    const percentage = score / max;
    if (percentage < 0.34) {return 'Low';}
    if (percentage < 0.67) {return 'Medium';}
    return 'High';
}

const RatingIndicator = ({ label, rating }: { label: string, rating: 'Low' | 'Medium' | 'High' }) => {
    const ratingColor = {
        Low: 'text-error',
        Medium: 'text-warning',
        High: 'text-success',
    }[rating];
    return (
        <div className="flex justify-between items-center text-sm">
            <span className="font-medium text-text-secondary">{label}</span>
            <span className={`font-bold ${ratingColor}`}>{rating}</span>
        </div>
    );
}

export const TeamAnalytics = ({ picks }: TeamAnalyticsProps) => {
  const analytics = useMemo(() => {
    const pickedChampions = picks.map(p => p.champion).filter((c): c is NonNullable<typeof c> => !!c);
    if (pickedChampions.length === 0) {
      return { ad: 0, ap: 0, mixed: 0, cc: 0, engage: 0, isUnbalanced: false, total: 0 };
    }

    const damage = pickedChampions.reduce((acc, champ) => {
        if (champ.damageType === 'AD') {acc.ad++;}
        else if (champ.damageType === 'AP') {acc.ap++;}
        else {acc.mixed++;}
        return acc;
    }, { ad: 0, ap: 0, mixed: 0 });

    const cc = pickedChampions.reduce((sum, champ) => sum + (scoreMap[champ.cc] || 0), 0);
    const engage = pickedChampions.reduce((sum, champ) => sum + (scoreMap[champ.engage] || 0), 0);
    
    const isUnbalanced = pickedChampions.length >= 4 && ((damage.ad >= 4 && damage.ap === 0) || (damage.ap >= 4 && damage.ad === 0));
    const total = pickedChampions.length;

    return { ...damage, cc, engage, isUnbalanced, total };
  }, [picks]);

  const maxScore = analytics.total * 3;
  const { ad, ap, mixed, total } = analytics;
  const adPercent = total > 0 ? (ad / total) * 100 : 0;
  const apPercent = total > 0 ? (ap / total) * 100 : 0;
  const mixedPercent = total > 0 ? (mixed / total) * 100 : 0;

  return (
    <div className="bg-surface-tertiary/50 p-3 mb-4 space-y-3">
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <h4 className="text-sm font-bold text-text-secondary">Damage Profile</h4>
                {analytics.isUnbalanced && (
                    <Tooltip content="Your team has a lot of one damage type! Consider adding a different threat to make it harder for the enemy to itemize.">
                         <div className="flex items-center gap-1 text-warning cursor-help">
                            <AlertTriangle className="h-5 w-5" />
                            <span className="text-xs font-semibold">Unbalanced</span>
                         </div>
                    </Tooltip>
                )}
            </div>
            <div className="w-full flex h-2 rounded-full overflow-hidden bg-surface-inset border border-border-secondary/50">
                <Tooltip content={`${ad} AD Champion${ad !== 1 ? 's' : ''} (${adPercent.toFixed(0)}%)`}><div style={{ width: `${adPercent}%` }} className="h-full bg-team-red transition-all duration-300"></div></Tooltip>
                <Tooltip content={`${ap} AP Champion${ap !== 1 ? 's' : ''} (${apPercent.toFixed(0)}%)`}><div style={{ width: `${apPercent}%` }} className="h-full bg-team-blue transition-all duration-300"></div></Tooltip>
                <Tooltip content={`${mixed} Mixed Damage Champion${mixed !== 1 ? 's' : ''} (${mixedPercent.toFixed(0)}%)`}><div style={{ width: `${mixedPercent}%` }} className="h-full bg-purple-500 transition-all duration-300"></div></Tooltip>
            </div>
        </div>
        <div className="pt-3 border-t border-border-secondary/50 space-y-1">
            <RatingIndicator label="Crowd Control" rating={scoreToRating(analytics.cc, maxScore)} />
            <RatingIndicator label="Engage Potential" rating={scoreToRating(analytics.engage, maxScore)} />
        </div>
    </div>
  );
};