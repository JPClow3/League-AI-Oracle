import React, { memo } from 'react';
import { X } from 'lucide-react';

export interface FilterChip {
  label: string;
  value: string;
  onRemove: () => void;
}

interface FilterChipsProps {
  chips: FilterChip[];
  className?: string;
}

/**
 * Display active filters as removable chips
 */
export const FilterChips = memo(({ chips, className = '' }: FilterChipsProps) => {
  if (chips.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap gap-2 mb-3 ${className}`} role="list" aria-label="Active filters">
      {chips.map(chip => (
        <button
          key={chip.value}
          onClick={chip.onRemove}
          className="inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium bg-[hsl(var(--accent)_/_0.1)] text-[hsl(var(--accent))] border border-[hsl(var(--accent)_/_0.3)] rounded-full hover:bg-[hsl(var(--accent)_/_0.2)] transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 min-h-[32px]"
          aria-label={`Remove ${chip.label} filter`}
        >
          <span>{chip.label}</span>
          <X className="h-3 w-3" strokeWidth={2.5} />
        </button>
      ))}
    </div>
  );
});

FilterChips.displayName = 'FilterChips';
