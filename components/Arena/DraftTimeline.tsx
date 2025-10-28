
import React from 'react';
import { DraftTurn } from './arenaConstants';
import type { DraftState, Champion } from '../../types';
import { Ban } from 'lucide-react';

interface TimelineSlotProps {
  turn: DraftTurn;
  champion: Champion | null;
  isCurrent: boolean;
  isLastUpdated: boolean;
}

const TimelineSlot = ({ turn, champion, isCurrent, isLastUpdated }: TimelineSlotProps) => {
  const isBlue = turn.team === 'blue';
  const isBan = turn.type === 'ban';
  
  const baseClasses = "w-10 h-10 flex items-center justify-center transition-all duration-300 flex-shrink-0";
  const colorClasses = isBlue ? "bg-blue-500/10 border-blue-500/20" : "bg-red-500/10 border-red-500/20";
  const currentClasses = isCurrent ? (isBlue ? "ring-2 ring-accent shadow-lg shadow-accent/30" : "ring-2 ring-error shadow-lg shadow-error/30") : "border";
  const animationClass = isLastUpdated ? 'animate-pulse-once' : '';

  if (champion) {
    return (
      <div className={`${baseClasses} ${currentClasses} ${animationClass} relative`} title={champion.name}>
        <img src={champion.image} alt={champion.name} className={`w-full h-full object-cover ${isBan ? 'grayscale' : ''}`} />
        {isBan && (
           <div className="absolute inset-0 bg-error/70 flex items-center justify-center">
            <Ban className="h-5 w-5 text-white" />
           </div>
        )}
      </div>
    );
  }

  return (
    <div className={`${baseClasses} ${colorClasses} ${currentClasses}`}>
      <span className="font-bold text-text-secondary/50 text-sm">{isBan ? 'B' : 'P'}</span>
    </div>
  );
};

interface DraftTimelineProps {
  sequence: DraftTurn[];
  draftState: DraftState;
  currentTurnIndex: number;
  lastUpdatedIndex: number;
}

export const DraftTimeline = ({ sequence, draftState, currentTurnIndex, lastUpdatedIndex }: DraftTimelineProps) => {
  const getChampionForTurn = (turn: DraftTurn): Champion | null => {
    const { team, type, index } = turn;
    const slot = type === 'pick' ? draftState[team].picks[index] : draftState[team].bans[index];
    return slot?.champion || null;
  };

  return (
    <div className="bg-surface p-3 shadow-inner border border-border">
      <div className="flex justify-between items-center space-x-1 overflow-x-auto pb-2">
        {sequence.map((turn, index) => (
          <React.Fragment key={index}>
            <TimelineSlot
              turn={turn}
              champion={getChampionForTurn(turn)}
              isCurrent={index === currentTurnIndex}
              isLastUpdated={index === lastUpdatedIndex}
            />
            {/* Add dividers for phase clarity */}
            {(index < sequence.length - 1 && turn.type !== sequence[index + 1]?.type) && <div className="w-px h-8 bg-border mx-1"></div>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
