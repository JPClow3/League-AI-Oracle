import React from 'react';
import type { ChampionMastery } from '../../types';
import { Tooltip } from '../common/Tooltip';
import { useChampions } from '../../contexts/ChampionContext';

interface ChampionMasteryPanelProps {
    mastery: ChampionMastery[];
}

const MasteryCard = ({ masteryItem }: { masteryItem: ChampionMastery }) => {
    const { championsLite } = useChampions();
    const champion = championsLite.find(c => c.id === masteryItem.championId);
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
                    className="w-16 h-16 rounded-lg border-2 border-border-primary group-hover:border-accent transition-all"
                />
                <span className="mt-1 text-xs text-text-secondary">{champion.name}</span>
            </div>
        </Tooltip>
    );
};

export const ChampionMasteryPanel = ({ mastery }: ChampionMasteryPanelProps) => {
    const sortedMastery = [...mastery].sort((a, b) => b.points - a.points);

    return (
        <div className="bg-surface-primary p-6 rounded-xl shadow-lg border border-border-primary">
            <h2 className="text-xl font-bold text-text-primary mb-4">Champion Draft Mastery</h2>
            {sortedMastery.length > 0 ? (
                <div className="flex flex-wrap gap-4">
                    {sortedMastery.map(item => (
                        <MasteryCard key={item.championId} masteryItem={item} />
                    ))}
                </div>
            ) : (
                <p className="text-text-secondary text-sm">
                    Gain Champion Mastery by achieving high scores (A- or better) with champions in the Draft Lab.
                </p>
            )}
        </div>
    );
};
