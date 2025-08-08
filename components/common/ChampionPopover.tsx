import React from 'react';
import { Champion } from '../../types';

// -- Inlined StatBars component --
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
// -- End of inlined component --

interface ChampionPopoverProps {
  champion: Champion;
  style: React.CSSProperties;
}

const ChampionPopover = React.forwardRef<HTMLDivElement, ChampionPopoverProps>(({ champion, style }, ref) => {
  return (
    <div
      ref={ref}
      className="fixed z-50 w-64 p-3 bg-slate-800 border border-indigo-500 rounded-lg shadow-2xl text-sm text-slate-200 animate-pop-in"
      style={style}
    >
        <h4 className="font-bold text-lg text-white">{champion.name}</h4>
        <p className="text-xs text-slate-400 mb-2 italic">{champion.title}</p>
        
        <div className="flex flex-wrap gap-1.5 mb-3">
            {champion.tags.map(tag => (
                <span key={tag} className="px-2 py-0.5 text-xs bg-slate-700 text-slate-300 rounded-full">{tag}</span>
            ))}
        </div>
        
        <StatBars stats={champion.info} />
    </div>
  );
});

export default ChampionPopover;