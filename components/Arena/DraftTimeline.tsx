import React from 'react';
import { COMPETITIVE_SEQUENCE, DraftTurn } from './arenaConstants';
import type { DraftState, Champion } from '../../types';

interface TimelineSlotProps {
  turn: DraftTurn;
  champion: Champion | null;
  isCurrent: boolean;
  isLastUpdated: boolean;
}

const TimelineSlot: React.FC<TimelineSlotProps> = ({ turn, champion, isCurrent, isLastUpdated }) => {
  const isBlue = turn.team === 'blue';
  const isBan = turn.type === 'ban';
  
  const baseClasses = "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 flex-shrink-0";
  const colorClasses = isBlue ? "bg-blue-900/50 border-blue-500/50" : "bg-red-900/50 border-red-500/50";
  const currentClasses = isCurrent ? (isBlue ? "ring-2 ring-blue-400 shadow-lg shadow-blue-500/30" : "ring-2 ring-red-400 shadow-lg shadow-red-500/30") : "border";
  const animationClass = isLastUpdated ? 'animate-pulse-once' : '';

  if (champion) {
    return (
      <div className={`${baseClasses} ${currentClasses} ${animationClass} relative`} title={champion.name}>
        <img src={champion.image} alt={champion.name} className={`w-full h-full object-cover rounded-full ${isBan ? 'grayscale' : ''}`} />
        {isBan && (
           <div className="absolute inset-0 bg-red-800/70 flex items-center justify-center rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
           </div>
        )}
      </div>
    );
  }

  return (
    <div className={`${baseClasses} ${colorClasses} ${currentClasses}`}>
      <span className="font-bold text-gray-500 text-sm">{isBan ? 'B' : 'P'}</span>
    </div>
  );
};

interface DraftTimelineProps {
  draftState: DraftState;
  currentTurnIndex: number;
  lastUpdatedIndex: number;
}

export const DraftTimeline: React.FC<DraftTimelineProps> = ({ draftState, currentTurnIndex, lastUpdatedIndex }) => {
  const getChampionForTurn = (turn: DraftTurn): Champion | null => {
    const { team, type, index } = turn;
    const slot = type === 'pick' ? draftState[team].picks[index] : draftState[team].bans[index];
    return slot?.champion || null;
  };

  return (
    <div className="bg-slate-800/50 p-3 rounded-lg shadow-inner">
      <div className="flex justify-between items-center space-x-1 overflow-x-auto pb-2">
        {COMPETITIVE_SEQUENCE.map((turn, index) => (
          <React.Fragment key={index}>
            <TimelineSlot
              turn={turn}
              champion={getChampionForTurn(turn)}
              isCurrent={index === currentTurnIndex}
              isLastUpdated={index === lastUpdatedIndex}
            />
            {/* Add dividers for clarity */}
            {(index === 5 || index === 11 || index === 15) && <div className="w-px h-8 bg-slate-600 mx-1"></div>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};