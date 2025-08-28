import React from 'react';
import type { Champion } from '../../types';
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
}

export const BanSlot = ({ champion, onClick, onClear, onDrop, onDragOver, onDragEnter, onDragLeave, isActive = false, isDraggedOver = false }: BanSlotProps) => {
  const activeClasses = isActive ? 'ring-2 ring-accent shadow-glow-accent' :
                      isDraggedOver ? 'ring-2 ring-info' :
                      'ring-1 ring-border-primary';
  
  return (
    <div 
      onClick={onClick}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      className={`w-12 h-12 bg-surface-tertiary cursor-pointer hover:ring-accent/70 transition-all duration-200 flex items-center justify-center relative group ${activeClasses}`}
    >
       {champion && onClear && (
          <button 
            onClick={(e) => { e.stopPropagation(); onClear(); }}
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