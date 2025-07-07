import React from 'react';
import { Champion } from '../../types';
import StatBars from './StatBars';

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
