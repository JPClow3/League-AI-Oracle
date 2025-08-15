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

export const ArenaOverviewPanel: React.FC<ArenaOverviewPanelProps> = ({ stats }) => {
    return (
        <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700/50">
            <h2 className="text-xl font-bold text-white mb-4">Adaptive Arena Overview</h2>
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-300">Average Draft Score</span>
                    <span className="font-bold text-2xl text-[rgb(var(--color-accent-text))]">{stats.averageScore.toFixed(1)}%</span>
                </div>
                 <div className="bg-slate-900/50 p-3 rounded-lg">
                    <div className="font-semibold text-gray-300">Current Bot Difficulty</div>
                    <div className="font-bold text-lg text-white">{stats.difficulty}</div>
                    <p className="text-xs text-gray-400 mt-1">{difficultyInfo[stats.difficulty]}</p>
                </div>
            </div>
        </div>
    );
};