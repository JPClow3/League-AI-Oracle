import React from 'react';

interface StatBarsProps {
    stats: {
        attack: number;
        defense: number;
        magic: number;
    }
}

const StatBar: React.FC<{ value: number; color: string; label: string }> = ({ value, color, label }) => {
    const width = (value / 10) * 100; // DDragon stats are 0-10
    return (
        <div className="flex items-center gap-2">
            <span className="w-2 text-xs font-mono text-slate-500 dark:text-slate-400">{label}</span>
            <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2" title={`${value}/10`}>
                <div className={`h-2 rounded-full transition-all duration-300 ${color}`} style={{ width: `${width}%` }}></div>
            </div>
        </div>
    );
};


const StatBars: React.FC<StatBarsProps> = ({ stats }) => {
    return (
        <div className="space-y-1">
            <StatBar value={stats.attack} color="bg-rose-500" label="A" />
            <StatBar value={stats.defense} color="bg-green-500" label="D" />
            <StatBar value={stats.magic} color="bg-blue-500" label="M" />
        </div>
    );
};

export default StatBars;
