
import React, { useState, useMemo } from 'react';
import { AIAnalysis } from '../../types';
import InteractiveText from './InteractiveText';

interface PowerSpikeTimelineProps {
  powerSpikes: AIAnalysis['powerSpikes'];
  onKeywordClick: (lessonId: string) => void;
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

const generateSmoothPath = (coords: { x: number; y: number }[]): string => {
    if (coords.length < 2) return '';
    let path = `M ${coords[0].x} ${coords[0].y}`;
    if (coords.length === 2) {
        path += ` L ${coords[1].x} ${coords[1].y}`;
        return path;
    }
    for (let i = 0; i < coords.length - 1; i++) {
        const p0 = i > 0 ? coords[i - 1] : coords[i];
        const p1 = coords[i];
        const p2 = coords[i + 1];
        const p3 = i < coords.length - 2 ? coords[i + 2] : p2;
        
        const tension = 0.5;
        const cp1x = p1.x + (p2.x - p0.x) / 6 * tension;
        const cp1y = p1.y + (p2.y - p0.y) / 6 * tension;
        const cp2x = p2.x - (p3.x - p1.x) / 6 * tension;
        const cp2y = p2.y - (p3.y - p1.y) / 6 * tension;

        path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }
    return path;
};

export const PowerSpikeTimeline: React.FC<PowerSpikeTimelineProps> = ({ powerSpikes, onKeywordClick }) => {
  const [tooltip, setTooltip] = useState<{ content: React.ReactNode, position: { x: number, y: number } } | null>(null);
  const [hoveredLine, setHoveredLine] = useState<'blue' | 'red' | null>(null);

  const handleMouseEnter = (e: React.MouseEvent, content: React.ReactNode) => {
    setTooltip({ content, position: { x: e.clientX, y: e.clientY } });
  };
  
  const handleMouseLeave = () => {
    setTooltip(null);
  };

  const { width, height, padding, blueCoords, redCoords, bluePath, redPath, phases } = useMemo(() => {
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

    const blueCoords = getCoords(powerSpikes.blue);
    const redCoords = getCoords(powerSpikes.red);
    const bluePath = generateSmoothPath(blueCoords);
    const redPath = generateSmoothPath(redCoords);
    const phases: ('Early' | 'Mid' | 'Late')[] = ['Early', 'Mid', 'Late'];

    return { width, height, padding, blueCoords, redCoords, bluePath, redPath, phases };
  }, [powerSpikes]);
  

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        <defs>
          <filter id="glow-blue" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" in="SourceGraphic" />
            <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
           <filter id="glow-red" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" in="SourceGraphic" />
            <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        {[...Array(5)].map((_, i) => (
          <line key={i} x1={padding.left} y1={padding.top + i * ((height - padding.top - padding.bottom) / 4)} x2={width - padding.right} y2={padding.top + i * ((height - padding.top - padding.bottom) / 4)} className="stroke-slate-200 dark:stroke-slate-700" strokeWidth="0.5" />
        ))}
        
        <path d={bluePath} stroke="#60a5fa" strokeWidth="2.5" fill="none" onMouseEnter={() => setHoveredLine('blue')} onMouseLeave={() => setHoveredLine(null)} className={`transition-all duration-300 ${hoveredLine && hoveredLine !== 'blue' ? 'opacity-30' : ''}`} style={hoveredLine === 'blue' ? { filter: 'url(#glow-blue)' } : {}}/>
        <path d={redPath} stroke="#f87171" strokeWidth="2.5" fill="none" onMouseEnter={() => setHoveredLine('red')} onMouseLeave={() => setHoveredLine(null)} className={`transition-all duration-300 ${hoveredLine && hoveredLine !== 'red' ? 'opacity-30' : ''}`} style={hoveredLine === 'red' ? { filter: 'url(#glow-red)' } : {}}/>

        {blueCoords.map((c, i) => (
            <circle key={`b-${i}`} cx={c.x} cy={c.y} r="6" fill="rgba(255,255,255,0.1)" stroke="#60a5fa" strokeWidth="1.5" className="cursor-pointer" onMouseEnter={(e) => handleMouseEnter(e, <TooltipContent details={powerSpikes.details} phase={phases[i]} />)} onMouseLeave={handleMouseLeave} />
        ))}
        {redCoords.map((c, i) => (
            <circle key={`r-${i}`} cx={c.x} cy={c.y} r="6" fill="rgba(255,255,255,0.1)" stroke="#f87171" strokeWidth="1.5" className="cursor-pointer" onMouseEnter={(e) => handleMouseEnter(e, <TooltipContent details={powerSpikes.details} phase={phases[i]} />)} onMouseLeave={handleMouseLeave} />
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
      <div className="text-xs text-slate-500 dark:text-slate-400 mt-4 p-3 bg-slate-200/50 dark:bg-black/20 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-x-4">
        <div>
            <strong className="text-blue-500">Blue Team Summary:</strong>
            <p className="mt-1"><InteractiveText onKeywordClick={onKeywordClick}>{powerSpikes.summary.blue}</InteractiveText></p>
        </div>
        <div className="mt-2 md:mt-0">
            <strong className="text-red-500">Red Team Summary:</strong>
            <p className="mt-1"><InteractiveText onKeywordClick={onKeywordClick}>{powerSpikes.summary.red}</InteractiveText></p>
        </div>
      </div>
    </div>
  );
};
