import React, { useState } from 'react';
import { AIAnalysis } from '../../types';

interface PowerSpikeTimelineProps {
  powerSpikes: AIAnalysis['powerSpikes'];
}

const TooltipContent: React.FC<{ details?: AIAnalysis['powerSpikes']['details'], phase: 'Early' | 'Mid' | 'Late' }> = ({ details, phase }) => {
    if (!details) return null;
    const phaseDetails = details.find(d => d.phase === phase);
    if (!phaseDetails || phaseDetails.championSpikes.length === 0) return null;

    return (
        <>
            <h5 className="font-bold text-indigo-400 mb-1">{phase} Game Spikes</h5>
            <ul className="space-y-1">
                {phaseDetails.championSpikes.map(spike => (
                    <li key={spike.championName}>
                        <strong className="font-semibold">{spike.championName}:</strong> {spike.reason}
                    </li>
                ))}
            </ul>
        </>
    );
};

export const PowerSpikeTimeline: React.FC<PowerSpikeTimelineProps> = ({ powerSpikes }) => {
  const [tooltip, setTooltip] = useState<{ content: React.ReactNode, position: { x: number, y: number } } | null>(null);

  const handleMouseEnter = (e: React.MouseEvent, content: React.ReactNode) => {
    setTooltip({ content, position: { x: e.clientX, y: e.clientY } });
  };
  
  const handleMouseLeave = () => {
    setTooltip(null);
  };

  const width = 300;
  const height = 120;
  const padding = { top: 15, bottom: 25, left: 10, right: 10 };

  const getCoords = (data: { early: number, mid: number, late: number }) => {
    const points = [data.early, data.mid, data.late];
    return points.map((p, i) => {
        const y = height - padding.bottom - ((p - 1) / 9) * (height - padding.top - padding.bottom);
        const x = padding.left + i * ((width - padding.left - padding.right) / 2);
        return { x, y };
    });
  };

  const generatePath = (coords: { x: number, y: number }[]) => {
      if (coords.length === 0) return '';
      let path = `M ${coords[0].x} ${coords[0].y}`;
      for (let i = 0; i < coords.length - 1; i++) {
        const x_mid = (coords[i].x + coords[i + 1].x) / 2;
        const y_mid = (coords[i].y + coords[i + 1].y) / 2;
        path += ` Q ${coords[i].x} ${coords[i].y} ${x_mid} ${y_mid}`;
      }
      path += ` T ${coords[coords.length-1].x} ${coords[coords.length-1].y}`;
      return path;
  };

  const blueCoords = getCoords(powerSpikes.blue);
  const redCoords = getCoords(powerSpikes.red);
  const bluePath = generatePath(blueCoords);
  const redPath = generatePath(redCoords);
  const phases: ('Early' | 'Mid' | 'Late')[] = ['Early', 'Mid', 'Late'];

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        {[...Array(5)].map((_, i) => (
          <line key={i} x1={padding.left} y1={padding.top + i * ((height - padding.top - padding.bottom) / 4)} x2={width - padding.right} y2={padding.top + i * ((height - padding.top - padding.bottom) / 4)} className="stroke-slate-200 dark:stroke-slate-700" strokeWidth="0.5" />
        ))}
        
        <path d={bluePath} stroke="#60a5fa" strokeWidth="2.5" fill="none" className="transition-all duration-300" />
        <path d={redPath} stroke="#f87171" strokeWidth="2.5" fill="none" className="transition-all duration-300" />

        {blueCoords.map((c, i) => (
            <circle key={`b-${i}`} cx={c.x} cy={c.y} r="6" fill="#60a5fa" className="cursor-pointer opacity-0 hover:opacity-100 transition-opacity" onMouseEnter={(e) => handleMouseEnter(e, <TooltipContent details={powerSpikes.details} phase={phases[i]} />)} onMouseLeave={handleMouseLeave} />
        ))}
        {redCoords.map((c, i) => (
            <circle key={`r-${i}`} cx={c.x} cy={c.y} r="6" fill="#f87171" className="cursor-pointer opacity-0 hover:opacity-100 transition-opacity" onMouseEnter={(e) => handleMouseEnter(e, <TooltipContent details={powerSpikes.details} phase={phases[i]} />)} onMouseLeave={handleMouseLeave} />
        ))}
        
        {phases.map((phase, i) => (
             <text key={phase} x={padding.left + i * ((width - padding.left - padding.right) / 2)} y={height - 5} textAnchor="middle" className="text-xs fill-slate-500 dark:fill-slate-400 font-semibold">{phase}</text>
        ))}
      </svg>
      {tooltip && (
          <div
            className="fixed z-50 p-2 text-xs text-white bg-slate-900 border border-indigo-400 rounded-lg shadow-lg w-48 pointer-events-none animate-fade-in"
            style={{ top: tooltip.position.y, left: tooltip.position.x, transform: 'translate(-50%, -110%)' }}
          >
            {tooltip.content}
          </div>
      )}
      <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 space-y-1">
        <p><strong className="text-blue-500">Blue Team:</strong> {powerSpikes.summary.blue}</p>
        <p><strong className="text-red-500">Red Team:</strong> {powerSpikes.summary.red}</p>
      </div>
    </div>
  );
};
