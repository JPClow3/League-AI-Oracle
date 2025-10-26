import React from 'react';
import type { Champion, TeamSide } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Ban, X } from 'lucide-react';

interface BanSlotProps {
  champion: Champion | null;
  onClick: () => void;
  onClear?: () => void;
  onDrop?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragEnter?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  isActive?: boolean;
  isDraggedOver?: boolean;
  side: TeamSide;
  index: number;
  isDimmed?: boolean;
}

export const BanSlot = ({ champion, onClick, onClear, onDrop, onDragOver, onDragEnter, onDragLeave, isActive = false, isDraggedOver = false, side, index, isDimmed = false }: BanSlotProps) => {
  const activeClasses = isActive ? 'ring-2 ring-accent shadow-glow-accent' :
                      isDraggedOver ? 'ring-2 ring-info' :
                      'ring-1 ring-border-primary';
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
    if (clearingRef.current || !onClear) return;
    clearingRef.current = true;
    onClear();
    setTimeout(() => {
      clearingRef.current = false;
    }, 200);
  };

  const teamName = side.charAt(0).toUpperCase() + side.slice(1);
  const ariaLabel = champion
    ? `${teamName} Team Ban ${index + 1}: ${champion.name}. Press Enter or Space to change.`
    : `${teamName} Team Ban ${index + 1}: Empty. Press Enter or Space to select a champion.`;
  
  return (
    <div 
      onClick={onClick}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      className={`w-12 h-12 bg-surface-tertiary cursor-pointer hover:ring-accent/70 transition-all duration-200 flex items-center justify-center relative group focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-secondary focus-visible:ring-accent transform hover:-translate-y-0.5 active:translate-y-0 ${activeClasses} ${dimmedClasses}`}
    >
       {champion && onClear && (
          <button 
            onClick={handleClear}
            className="absolute top-0 right-0 z-20 w-4 h-4 bg-black/60 rounded-full flex items-center justify-center text-white/70 hover:bg-error hover:text-white transition-all opacity-0 group-hover:opacity-100"
            aria-label={`Clear ban ${champion.name}`}
          >
            <X size={12} />
          </button>
        )}
      <AnimatePresence>
        {champion ? (
          <motion.div
            {...{
              initial: { scale: 0.5, opacity: 0 },
              animate: { scale: 1, opacity: 1 },
              exit: { scale: 0.5, opacity: 0 },
              transition: { duration: 0.2, ease: 'easeOut' },
            }}
            className="absolute inset-0"
          >
            <img src={champion.image} alt={champion.name} className="w-full h-full object-cover grayscale" />
            <div className="absolute inset-0 bg-error/80 flex items-center justify-center">
              <Ban className="h-8 w-8 text-white" />
            </div>
          </motion.div>
        ) : (
          <Ban className="h-6 w-6 text-text-muted" />
        )}
      </AnimatePresence>
    </div>
  );
};