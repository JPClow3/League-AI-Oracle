
import React from 'react';
import { ChampionStaticInfo } from '../types';

interface MetaTierBadgeProps {
  tier?: ChampionStaticInfo['metaTier'];
  className?: string;
}

const MetaTierBadgeComponent: React.FC<MetaTierBadgeProps> = ({ tier, className = "" }) => {
  if (!tier) return null;

  let bgColorClass = 'bg-slate-500';
  let textColorClass = 'text-slate-100';

  switch (tier) {
    case 'S':
      bgColorClass = 'bg-gradient-to-br from-amber-500 to-orange-600';
      textColorClass = 'text-white';
      break;
    case 'A':
      bgColorClass = 'bg-gradient-to-br from-sky-500 to-blue-600';
      textColorClass = 'text-white';
      break;
    case 'B':
      bgColorClass = 'bg-gradient-to-br from-emerald-500 to-green-600';
      textColorClass = 'text-white';
      break;
    case 'C':
      bgColorClass = 'bg-slate-600';
      textColorClass = 'text-slate-200';
      break;
    case 'D':
      bgColorClass = 'bg-neutral-700';
      textColorClass = 'text-neutral-300';
      break;
  }

  return (
    <div 
      className={`px-1.5 py-0.5 rounded-sm text-[9px] sm:text-[10px] font-bold leading-none shadow-md ${bgColorClass} ${textColorClass} ${className}`}
      title={`Meta Tier: ${tier}`}
    >
      {tier}-Tier
    </div>
  );
};

export const MetaTierBadge = React.memo(MetaTierBadgeComponent);
