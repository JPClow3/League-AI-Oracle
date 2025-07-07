import React from 'react';

interface HoverDnaTooltipProps {
    dnaChanges: Record<string, number>;
    position: { x: number; y: number };
}

export const HoverDnaTooltip: React.FC<HoverDnaTooltipProps> = ({ dnaChanges, position }) => {
    const changes = Object.entries(dnaChanges).filter(([, value]) => value !== 0);
    if (changes.length === 0) return null;

    return (
        <div
            className="fixed z-50 pointer-events-none p-2 bg-slate-900/90 border border-indigo-500/70 rounded-md shadow-lg transition-transform duration-100"
            style={{
                left: `${position.x + 15}px`,
                top: `${position.y + 15}px`,
            }}
        >
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                {changes.map(([key, value]) => (
                    <React.Fragment key={key}>
                        <span className="text-slate-400">{key}</span>
                        <span className={value > 0 ? 'text-teal-400' : 'text-rose-400'}>
                            {value > 0 ? '+' : ''}{value}
                        </span>
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};