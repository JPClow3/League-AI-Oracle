import React, { memo } from 'react';
import type { DraftState, TeamSide } from '../../types';
import { TeamPanel } from './TeamPanel';

interface MobileTeamViewProps {
  draftState: DraftState;
  onSlotClick: (team: TeamSide, type: 'pick' | 'ban', index: number) => void;
  onClearSlot?: (team: TeamSide, type: 'pick' | 'ban', index: number) => void;
  activeSlot: { team: TeamSide; type: 'pick' | 'ban'; index: number } | null;
  onDrop?: (event: React.DragEvent, team: TeamSide, type: 'pick' | 'ban', index: number) => void;
  onDragStart?: (event: React.DragEvent, team: TeamSide, type: 'pick' | 'ban', index: number) => void;
  onDragOver?: (event: React.DragEvent) => void;
  onDragEnter?: (event: React.DragEvent, team: TeamSide, type: 'pick' | 'ban', index: number) => void;
  onDragLeave?: () => void;
  draggedOverSlot: { team: TeamSide; type: 'pick' | 'ban'; index: number } | null;
}

/**
 * Combined mobile view showing both blue and red teams in a compact layout
 */
export const MobileTeamView = memo(
  ({
    draftState,
    onSlotClick,
    onClearSlot,
    activeSlot,
    onDrop,
    onDragStart,
    onDragOver,
    onDragEnter,
    onDragLeave,
    draggedOverSlot,
  }: MobileTeamViewProps) => {
    return (
      <div className="space-y-6">
        {/* Blue Team */}
        <TeamPanel
          id="draftlab-blue-team"
          side="blue"
          state={draftState.blue}
          onSlotClick={onSlotClick}
          onClearSlot={onClearSlot}
          activeSlot={activeSlot?.team === 'blue' ? activeSlot : null}
          onDrop={onDrop}
          onDragStart={
            onDragStart
              ? (e, t, y, i) => {
                  const champ = y === 'pick' ? draftState.blue.picks[i]?.champion : draftState.blue.bans[i]?.champion;
                  if (champ && onDragStart) {
                    onDragStart(e, t, y, i);
                  }
                }
              : undefined
          }
          onDragOver={onDragOver}
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          draggedOverSlot={draggedOverSlot}
        />

        {/* Red Team */}
        <TeamPanel
          id="draftlab-red-team"
          side="red"
          state={draftState.red}
          onSlotClick={onSlotClick}
          onClearSlot={onClearSlot}
          activeSlot={activeSlot?.team === 'red' ? activeSlot : null}
          onDrop={onDrop}
          onDragStart={
            onDragStart
              ? (e, t, y, i) => {
                  const champ = y === 'pick' ? draftState.red.picks[i]?.champion : draftState.red.bans[i]?.champion;
                  if (champ && onDragStart) {
                    onDragStart(e, t, y, i);
                  }
                }
              : undefined
          }
          onDragOver={onDragOver}
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          draggedOverSlot={draggedOverSlot}
        />
      </div>
    );
  }
);

MobileTeamView.displayName = 'MobileTeamView';
