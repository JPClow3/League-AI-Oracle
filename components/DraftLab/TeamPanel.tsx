import React from 'react';
import type { TeamState, TeamSide } from '../../types';
import { PickSlot } from './PickSlot';
import { BanSlot } from './BanSlot';
import { ROLES } from '../../constants';
import { TeamAnalytics } from './TeamAnalytics';

interface TeamPanelProps {
  side: TeamSide;
  state: TeamState;
  onSlotClick: (team: TeamSide, type: 'pick' | 'ban', index: number) => void;
  activeSlot?: { type: 'pick' | 'ban'; index: number } | null;
  
  onClearSlot?: (team: TeamSide, type: 'pick' | 'ban', index: number) => void;
  onDrop?: (event: React.DragEvent, team: TeamSide, type: 'pick' | 'ban', index: number) => void;
  onDragOver?: (event: React.DragEvent) => void;
  onDragEnter?: (event: React.DragEvent, team: TeamSide, type: 'pick' | 'ban', index: number) => void;
  onDragLeave?: () => void;
  draggedOverSlot?: { team: TeamSide; type: 'pick' | 'ban'; index: number } | null;
}

export const TeamPanel = ({ side, state, onSlotClick, onClearSlot, onDrop, onDragOver, onDragEnter, onDragLeave, activeSlot, draggedOverSlot }: TeamPanelProps) => {
  const isBlue = side === 'blue';
  const teamColorClass = isBlue ? 'border-team-blue' : 'border-team-red';
  const teamName = isBlue ? 'Blue Team' : 'Red Team';
  const gradientClass = isBlue ? 'from-team-blue/5 to-bg-secondary' : 'from-team-red/5 to-bg-secondary';

  return (
    <div className={`bg-bg-secondary p-4 shadow-sm border ${teamColorClass} border-t-4 bg-gradient-to-b ${gradientClass}`}>
        <h2 className={`text-2xl font-bold font-display mb-4 text-center text-text-primary`}>{teamName}</h2>
        
        <TeamAnalytics picks={state.picks} />

        <div className="space-y-4">
          {/* Picks Section */}
          <div>
            <div className="space-y-2">
              {state.picks.map((pick, index) => (
                <PickSlot 
                  key={index} 
                  champion={pick.champion}
                  role={ROLES[index]}
                  onClick={() => onSlotClick(side, 'pick', index)}
                  onClear={onClearSlot ? () => onClearSlot(side, 'pick', index) : undefined}
                  onDrop={onDrop ? (e) => onDrop(e, side, 'pick', index) : undefined}
                  onDragOver={onDragOver}
                  onDragEnter={onDragEnter ? (e) => onDragEnter(e, side, 'pick', index) : undefined}
                  onDragLeave={onDragLeave}
                  isActive={activeSlot?.type === 'pick' && activeSlot?.index === index}
                  isDraggedOver={draggedOverSlot?.team === side && draggedOverSlot?.type === 'pick' && draggedOverSlot?.index === index}
                />
              ))}
            </div>
          </div>

          {/* Bans Section */}
          <div className="pt-3 border-t-2 border-border-primary/50">
            <h3 className="text-xs font-semibold text-text-secondary mb-2 text-center uppercase tracking-wider">Bans</h3>
            <div className="flex justify-center items-center gap-2 flex-wrap">
              {state.bans.map((ban, index) => (
                <BanSlot 
                  key={index} 
                  champion={ban.champion} 
                  onClick={() => onSlotClick(side, 'ban', index)}
                  onClear={onClearSlot ? () => onClearSlot(side, 'ban', index) : undefined}
                  onDrop={onDrop ? (e) => onDrop(e, side, 'ban', index) : undefined}
                  onDragOver={onDragOver}
                  onDragEnter={onDragEnter ? (e) => onDragEnter(e, side, 'ban', index) : undefined}
                  onDragLeave={onDragLeave}
                  isActive={activeSlot?.type === 'ban' && activeSlot?.index === index}
                  isDraggedOver={draggedOverSlot?.team === side && draggedOverSlot?.type === 'ban' && draggedOverSlot?.index === index}
                />
              ))}
            </div>
          </div>
        </div>
    </div>
  );
};