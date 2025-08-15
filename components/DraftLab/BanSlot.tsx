

import React from 'react';
import type { Champion } from '../../types';

interface BanSlotProps {
  champion: Champion | null;
  onClick: () => void;
  isActive?: boolean;
}

export const BanSlot: React.FC<BanSlotProps> = ({ champion, onClick, isActive = false }) => {
  const activeClasses = isActive ? 'ring-2 ring-[rgb(var(--color-accent-text))] animate-pulse-glow' : 'ring-1 ring-slate-700';
  
  return (
    <div 
      onClick={onClick}
      className={`w-14 h-14 bg-gradient-to-br from-slate-800 to-slate-900 rounded-md cursor-pointer hover:ring-blue-500/70 transition-all duration-200 flex items-center justify-center relative group ${activeClasses}`}
    >
      {champion ? (
        <>
          <img src={champion.image} alt={champion.name} className="w-full h-full object-cover rounded-md grayscale" />
          <div className="absolute inset-0 bg-red-800/80 flex items-center justify-center rounded-md">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
        </>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      )}
    </div>
  );
};