import React from 'react';
import type { ArenaStats } from '../../types';

interface ArenaOverviewPanelProps {
    stats: ArenaStats;
}

const difficultyInfo = {
    Beginner: 'The bot makes generally good picks.',
    Intermediate: 'The bot is now trying to counter-pick your strategy!',
    Advanced: 'The bot uses advanced AI to build strong, synergistic counters.',
};

export const ArenaOverviewPanel = ({ stats }: ArenaOverviewPanelProps) => {
    return (
        <div className="bg-surface-primary p-6 rounded-xl shadow-lg border border-border-primary">
            <h2 className="text-xl font-bold text-text-primary mb-4">Adaptive Arena Overview</h2>
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <span className="font-semibold text-text-secondary">Average Draft Score</span>
                    <span className="font-bold text-2xl text-accent">{stats.averageScore.toFixed(1)}%</span>
                </div>
                 <div className="bg-surface-secondary p-3 rounded-lg border border-border-primary">
                    <div className="font-semibold text-text-secondary">Current Bot Difficulty</div>
                    <div className="font-bold text-lg text-text-primary">{stats.difficulty}</div>
                    <p className="text-xs text-text-secondary mt-1">{difficultyInfo[stats.difficulty]}</p>
                </div>
            </div>
        </div>
    );
};
