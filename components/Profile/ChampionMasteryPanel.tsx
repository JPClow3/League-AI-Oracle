import React from 'react';
import type { ChampionMastery } from '../../types';
import { CHAMPIONS_LITE } from '../../constants';
import { Tooltip } from '../common/Tooltip';

interface ChampionMasteryPanelProps {
    mastery: ChampionMastery[];
}

const MasteryCard: React.FC<{ masteryItem: ChampionMastery }> = ({ masteryItem }) => {
    const champion = CHAMPIONS_LITE.find(c => c.id === masteryItem.championId);
    if (!champion) return null;

    const tooltipContent = (
        <div>
            <p><strong>Mastery Points:</strong> {masteryItem.points}</p>
            <p><strong>Highest Grade:</strong> {masteryItem.highestGrade}</p>
        </div>
    );

    return (
        <Tooltip content={tooltipContent}>
            <div className="flex flex-col items-center">
                <img
                    src={champion.image}
                    alt={champion.name}
                    className="w-16 h-16 rounded-lg border-2 border-slate-600 group-hover:border-yellow-400 transition-all"
                />
                <span className="mt-1 text-xs text-gray-300">{champion.name}</span>
            </div>
        </Tooltip>
    );
};

export const ChampionMasteryPanel: React.FC<ChampionMasteryPanelProps> = ({ mastery }) => {
    const sortedMastery = [...mastery].sort((a, b) => b.points - a.points);

    return (
        <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700/50">
            <h2 className="text-xl font-bold text-white mb-4">Champion Draft Mastery</h2>
            {sortedMastery.length > 0 ? (
                <div className="flex flex-wrap gap-4">
                    {sortedMastery.map(item => (
                        <MasteryCard key={item.championId} masteryItem={item} />
                    ))}
                </div>
            ) : (
                <p className="text-gray-400 text-sm">
                    Gain Champion Mastery by achieving high scores (A- or better) with champions in the Draft Lab.
                </p>
            )}
        </div>
    );
};