import React from 'react';
import type { ChampionMastery } from '../../types';
import { Tooltip } from '../common/Tooltip';
import { useChampions } from '../../contexts/ChampionContext';
import { ShieldQuestion } from 'lucide-react';

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
            <p><strong>Highest Grade:</strong> {masteryItem.highestGrade || 'N/A'}</p>
        </div>
    );

    return (
        <Tooltip content={tooltipContent}>
            <div className="flex flex-col items-center group">
                <img
                    src={champion.image}
                    alt={champion.name}
                    className="w-16 h-16 rounded-lg border-2 border-border-primary group-hover:border-accent transition-all transform group-hover:scale-105"
                />
                <span className="mt-1 text-xs text-text-secondary group-hover:text-text-primary">{champion.name}</span>
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
                        <React.Fragment key={item.championId}>
                            <MasteryCard masteryItem={item} />
                        </React.Fragment>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 bg-surface-secondary/50 rounded-lg border border-border-secondary">
                    <ShieldQuestion className="mx-auto h-12 w-12 text-border-secondary" strokeWidth={1.5} />
                    <h3 className="mt-2 text-md font-semibold text-text-primary">No Mastery Yet</h3>
                    <p className="mt-1 text-sm text-text-secondary max-w-sm mx-auto">
                        Gain Champion Mastery by achieving high scores (A- or better) with champions in the Strategy Forge.
                    </p>
                </div>
            )}
        </div>
    );
};