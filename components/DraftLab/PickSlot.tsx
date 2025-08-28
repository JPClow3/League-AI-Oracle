import React from 'react';
import type { Champion } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';

interface PickSlotProps {
  champion: Champion | null;
  role: string;
  onClick: () => void;
  onClear?: () => void;
  onDrop?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragEnter?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  isActive?: boolean;
  isDraggedOver?: boolean;
}

export const PickSlot = ({ champion, role, onClick, onClear, onDrop, onDragOver, onDragEnter, onDragLeave, isActive = false, isDraggedOver = false }: PickSlotProps) => {
  const activeClasses = isActive ? 'ring-2 ring-offset-2 ring-offset-bg-secondary ring-accent shadow-glow-accent' :
                      isDraggedOver ? 'ring-2 ring-offset-2 ring-offset-bg-secondary ring-info' : 
                      'ring-1 ring-border-primary/50';
  const splashUrl = champion ? champion.splashUrl : '';

  return (
    <div 
      onClick={onClick}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      className={`relative flex items-center bg-surface p-2 cursor-pointer group transition-all duration-200 hover:ring-accent/70 overflow-hidden ${activeClasses}`}
    >
       {champion && onClear && (
          <button 
            onClick={(e) => { e.stopPropagation(); onClear(); }}
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
              style={{ backgroundImage: `url(${splashUrl})` }}
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