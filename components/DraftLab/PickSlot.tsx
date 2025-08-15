

import React from 'react';
import type { Champion } from '../../types';

interface PickSlotProps {
  champion: Champion | null;
  role: string;
  onClick: () => void;
  isActive?: boolean;
}

export const PickSlot: React.FC<PickSlotProps> = ({ champion, role, onClick, isActive = false }) => {
  const activeClasses = isActive ? 'ring-2 ring-[rgb(var(--color-accent-text))] animate-pulse-glow' : 'ring-1 ring-slate-700';
  
  return (
    <div 
      onClick={onClick}
      className={`relative flex items-center bg-gradient-to-r from-slate-800 to-slate-900 p-2 rounded-lg cursor-pointer group transition-all duration-200 hover:ring-blue-500/70 hover:from-slate-700 ${activeClasses}`}
    >
      <div className="w-14 h-14 flex-shrink-0 bg-slate-900 rounded-md flex items-center justify-center border border-slate-700">
        {champion ? (
          <img src={champion.image} alt={champion.name} className="w-full h-full object-cover rounded-md" />
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        )}
      </div>
      <div className="ml-4 flex-grow">
        <p className="font-bold text-white text-lg">{champion ? champion.name : 'Select Pick'}</p>
        <p className="text-sm text-gray-400">{role}</p>
      </div>
    </div>
  );
};