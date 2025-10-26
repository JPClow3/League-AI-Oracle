import React from 'react';
import type { Champion, TeamSide } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';

interface PickSlotProps {
  champion: Champion | null;
  role: string;
  onClick: () => void;
  onClear?: () => void;
  onDrop?: (e: React.DragEvent) => void;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragEnter?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  isActive?: boolean;
  isDraggedOver?: boolean;
  side: TeamSide;
  isDimmed?: boolean;
}

export const PickSlot = ({ champion, role, onClick, onClear, onDrop, onDragStart, onDragOver, onDragEnter, onDragLeave, isActive = false, isDraggedOver = false, side, isDimmed = false }: PickSlotProps) => {
  const activeClasses = isActive ? 'ring-2 ring-offset-2 ring-offset-bg-secondary ring-accent shadow-glow-accent' :
                      isDraggedOver ? 'ring-2 ring-offset-2 ring-offset-bg-secondary ring-info' : 
                      'ring-1 ring-border-primary/50';
  const dimmedClasses = isDimmed ? 'opacity-50 pointer-events-none' : '';
  const clearingRef = React.useRef(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (clearingRef.current || !onClear) {return;}
    clearingRef.current = true;
    onClear();
    setTimeout(() => {
      clearingRef.current = false;
    }, 200);
  };

  const teamName = side.charAt(0).toUpperCase() + side.slice(1);
  const ariaLabel = champion 
    ? `${teamName} Team ${role} pick: ${champion.name}. Press Enter or Space to change. Draggable to swap position.`
    : `${teamName} Team ${role} pick: Empty. Press Enter or Space to select a champion.`;

  return (
    <div 
      onClick={onClick}
      onDrop={onDrop}
      onDragStart={champion ? onDragStart : undefined}
      draggable={!!champion}
      onDragOver={onDragOver}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      className={`relative flex items-center bg-surface p-2 cursor-pointer group transition-all duration-200 hover:ring-accent/70 overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-secondary focus-visible:ring-accent transform hover:-translate-y-0.5 active:translate-y-0 ${activeClasses} ${dimmedClasses}`}
    >
       {champion && onClear && (
          <button 
            onClick={handleClear}
            className="absolute top-1 right-1 z-20 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center text-white/70 hover:bg-error hover:text-white transition-all opacity-0 group-hover:opacity-100"
            aria-label={`Clear ${champion.name}`}
          >
            <X size={14} />
          </button>
        )}
      <AnimatePresence>
        {champion && (
          <motion.div
            {...{
              initial: { opacity: 0 },
              animate: { opacity: 1 },
              exit: { opacity: 0 },
            }}
            className="absolute inset-0 z-0"
          >
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
              style={{ backgroundImage: `url(${champion.loadingScreenUrl})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/70 to-transparent group-hover:from-surface/80" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 w-14 h-14 flex-shrink-0 bg-surface-inset flex items-center justify-center border-2 border-border-secondary">
        <AnimatePresence>
          {champion ? (
            <motion.img
              {...{
                initial: { scale: 0.5, opacity: 0 },
                animate: { scale: 1, opacity: 1 },
                exit: { scale: 0.5, opacity: 0 },
                transition: { duration: 0.2, ease: 'easeOut' },
              }}
              src={champion.image}
              alt={champion.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <Plus className="h-6 w-6 text-text-muted" />
          )}
        </AnimatePresence>
      </div>
      <div className="relative z-10 ml-4 flex-grow">
        <p className="font-semibold text-text-primary text-lg truncate" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}>
            {champion ? champion.name : 'Select Pick'}
        </p>
        <p className="text-xs uppercase font-medium tracking-wider text-text-secondary">{role}</p>
      </div>
    </div>
  );
};