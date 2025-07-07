
import React, { useMemo } from 'react';

interface TeamDNARadarChartProps {
  dnaData: Record<string, number>;
  color: 'blue' | 'red';
  title: string;
  size?: number;
}

export const TeamDNARadarChart: React.FC<TeamDNARadarChartProps> = ({ dnaData, color, title, size = 200 }) => {
  const { points, labels, axisLines, gridLines } = useMemo(() => {
    const keys = Object.keys(dnaData);
    const count = keys.length;
    if (count === 0) return { points: '', labels: [], axisLines: [], gridLines: [] };

    const center = size / 2;
    const radius = size / 2 * 0.7;
    
    const dataMax = Math.max(...Object.values(dnaData), 3);

    const getPoint = (value: number, angle: number) => {
      const x = center + (value / dataMax) * radius * Math.cos(angle - Math.PI / 2);
      const y = center + (value / dataMax) * radius * Math.sin(angle - Math.PI / 2);
      return { x, y };
    };

    const points = keys.map((key, i) => {
      const angle = (i / count) * 2 * Math.PI;
      const point = getPoint(dnaData[key], angle);
      return `${point.x},${point.y}`;
    }).join(' ');

    const labels = keys.map((key, i) => {
      const angle = (i / count) * 2 * Math.PI;
      const labelRadius = radius * 1.25;
      const x = center + labelRadius * Math.cos(angle - Math.PI / 2);
      const y = center + labelRadius * Math.sin(angle - Math.PI / 2);
      return { x, y, text: key };
    });

    const axisLines = keys.map((_, i) => {
      const angle = (i / count) * 2 * Math.PI;
      const point = getPoint(dataMax, angle);
      return { x1: center, y1: center, x2: point.x, y2: point.y };
    });

    const gridLevels = 3;
    const gridLines = Array.from({ length: gridLevels }).map((_, levelIndex) => {
        const levelValue = ((levelIndex + 1) / gridLevels) * dataMax;
        return keys.map((_, i) => {
            const angle = (i / count) * 2 * Math.PI;
            const p = getPoint(levelValue, angle);
            return `${p.x},${p.y}`;
        }).join(' ');
    });

    return { points, labels, axisLines, gridLines };
  }, [dnaData, size]);

  const colorMap = {
      blue: { fill: 'rgba(96, 165, 250, 0.3)', stroke: '#60a5fa' }, // blue-400
      red: { fill: 'rgba(248, 113, 113, 0.3)', stroke: '#f87171' },  // red-400
  };
  const colors = colorMap[color];

  return (
    <div className="flex flex-col items-center">
      <h4 className={`font-semibold mb-1 text-lg text-${color}-500`}>{title}</h4>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <g>
          {gridLines.map((line, i) => (
            <polygon key={`grid-${i}`} points={line} className="fill-none stroke-slate-200/50 dark:stroke-slate-700/50" strokeWidth="1" />
          ))}
          {axisLines.map((line, i) => (
            <line key={`axis-${i}`} {...line} className="stroke-slate-200/50 dark:stroke-slate-700/50" strokeWidth="1" />
          ))}
          <polygon points={points} fill={colors.fill} stroke={colors.stroke} strokeWidth="2" />
          {labels.map(label => (
            <text key={label.text} x={label.x} y={label.y} textAnchor="middle" dy="0.3em" className="text-[10px] fill-slate-500 dark:fill-slate-400 font-semibold">
              {label.text}
            </text>
          ))}
        </g>
      </svg>
    </div>
  );
};
