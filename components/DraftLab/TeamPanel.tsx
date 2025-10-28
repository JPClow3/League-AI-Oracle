import React from 'react';
import type { TeamState, TeamSide } from '../../types';
import { PickSlot } from './PickSlot';
import { BanSlot } from './BanSlot';
import { ROLES } from '../../constants';
import { TeamAnalytics } from './TeamAnalytics';

interface TeamPanelProps {
  id?: string;
  side: TeamSide;
  state: TeamState;
  onSlotClick: (team: TeamSide, type: 'pick' | 'ban', index: number) => void;
  activeSlot?: { type: 'pick' | 'ban'; index: number } | null;
  
  onClearSlot?: (team: TeamSide, type: 'pick' | 'ban', index: number) => void;
  onDrop?: (event: React.DragEvent, team: TeamSide, type: 'pick' | 'ban', index: number) => void;
  onDragStart?: (event: React.DragEvent, team: TeamSide, type: 'pick' | 'ban', index: number) => void;
  onDragOver?: (event: React.DragEvent) => void;
  onDragEnter?: (event: React.DragEvent, team: TeamSide, type: 'pick' | 'ban', index: number) => void;
  onDragLeave?: () => void;
  draggedOverSlot?: { team: TeamSide; type: 'pick' | 'ban'; index: number } | null;
  isTurnActive?: boolean;
  isAnalyzing?: boolean;
  analysisCompleted?: boolean;
}

export const TeamPanel = ({ id, side, state, onSlotClick, onClearSlot, onDrop, onDragStart, onDragOver, onDragEnter, onDragLeave, activeSlot, draggedOverSlot, isTurnActive = false, isAnalyzing = false, analysisCompleted = false }: TeamPanelProps) => {
  const isBlue = side === 'blue';
  const teamColorClass = isBlue ? 'border-team-blue' : 'border-team-red';
  const teamName = isBlue ? 'Blue Team' : 'Red Team';
  const gradientClass = isBlue ? 'from-team-blue/5 to-bg-secondary' : 'from-team-red/5 to-bg-secondary';
  const turnGlowClass = isTurnActive ? (isBlue ? 'shadow-glow-accent' : 'shadow-lg shadow-error/30') : '';
  const analyzingClass = isAnalyzing ? 'analyzing-glow' : '';
  const analysisCompleteClass = analysisCompleted ? 'animate-pulse-once' : '';
  const isAnySlotActive = !!activeSlot;

  return (
    <div id={id} className={`bg-bg-secondary p-4 shadow-sm border ${teamColorClass} border-t-4 bg-gradient-to-b ${gradientClass} transition-shadow duration-300 ${turnGlowClass} ${analyzingClass} ${analysisCompleteClass}`}>
        <h2 className={`text-2xl font-bold font-display mb-4 text-center text-text-primary`}>{teamName}</h2>
        
        <TeamAnalytics picks={state.picks} />

        <div className="space-y-4">
          {/* Picks Section */}
          <div>
            <div className="space-y-2">
              {state.picks.map((pick, index) => {
                const isThisSlotActive = activeSlot?.type === 'pick' && activeSlot?.index === index;
                return (
                  <React.Fragment key={index}>
                    <PickSlot
                      side={side}
                      champion={pick.champion}
                      role={ROLES[index] || 'Unknown'}
                      onClick={() => onSlotClick(side, 'pick', index)}
                      onClear={onClearSlot ? () => onClearSlot(side, 'pick', index) : undefined}
                      onDrop={onDrop ? (e) => onDrop(e, side, 'pick', index) : undefined}
                      onDragStart={onDragStart ? (e) => onDragStart(e, side, 'pick', index) : undefined}
                      onDragOver={onDragOver}
                      onDragEnter={onDragEnter ? (e) => onDragEnter(e, side, 'pick', index) : undefined}
                      onDragLeave={onDragLeave}
                      isActive={isThisSlotActive}
                      isDimmed={isAnySlotActive && !isThisSlotActive}
                      isDraggedOver={draggedOverSlot?.team === side && draggedOverSlot?.type === 'pick' && draggedOverSlot?.index === index}
                    />
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Bans Section */}
          <div className="pt-3 border-t-2 border-border-primary/50">
            <h3 className="text-xs font-semibold text-text-secondary mb-2 text-center uppercase tracking-wider">Bans</h3>
            <div className="flex justify-center items-center gap-2 flex-wrap">
              {state.bans.map((ban, index) => {
                const isThisSlotActive = activeSlot?.type === 'ban' && activeSlot?.index === index;
                return (
                  <React.Fragment key={index}>
                    <BanSlot
                      side={side}
                      index={index}
                      champion={ban.champion} 
                      onClick={() => onSlotClick(side, 'ban', index)}
                      onClear={onClearSlot ? () => onClearSlot(side, 'ban', index) : undefined}
                      onDrop={onDrop ? (e) => onDrop(e, side, 'ban', index) : undefined}
                      onDragOver={onDragOver}
                      onDragEnter={onDragEnter ? (e) => onDragEnter(e, side, 'ban', index) : undefined}
                      onDragLeave={onDragLeave}
                      isActive={isThisSlotActive}
                      isDimmed={isAnySlotActive && !isThisSlotActive}
                      isDraggedOver={draggedOverSlot?.team === side && draggedOverSlot?.type === 'ban' && draggedOverSlot?.index === index}
                    />
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
    </div>
  );
};