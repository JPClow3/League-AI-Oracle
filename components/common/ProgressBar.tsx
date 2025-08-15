import React from 'react';

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  colorClass?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ value, max, label, colorClass = 'bg-[rgb(var(--color-accent-bg))]' }) => {
  const percentage = max > 0 ? (value / max) * 100 : 0;

  return (
    <div>
      {label && (
        <div className="flex justify-between items-center mb-1 text-sm font-medium">
          <span className="text-gray-300">{label}</span>
          <span className="text-gray-400">{value} / {max}</span>
        </div>
      )}
      <div className="w-full bg-slate-700 rounded-full h-2.5">
        <div
          className={`${colorClass} h-2.5 rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};