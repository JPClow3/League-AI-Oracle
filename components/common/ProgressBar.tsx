import React from 'react';

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  colorClass?: string;
}

export const ProgressBar = ({ value, max, label, colorClass = 'bg-gold-bright' }: ProgressBarProps) => {
  const percentage = max > 0 ? (value / max) * 100 : 0;

  return (
    <div>
      {label && (
        <div className="flex justify-between items-center mb-1 text-sm font-medium">
          <span className="text-text-secondary">{label}</span>
          <span className="text-text-muted">{value} / {max}</span>
        </div>
      )}
      <div className="w-full bg-surface-inset rounded-full h-2.5">
        <div
          className={`${colorClass} h-2.5 rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};
