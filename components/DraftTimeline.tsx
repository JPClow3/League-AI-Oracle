
import React from 'react';
import { DraftTurn } from '../data/draftRules';

interface DraftTimelineProps {
  sequence: DraftTurn[];
  currentTurn: number;
}

export const DraftTimeline: React.FC<DraftTimelineProps> = ({ sequence, currentTurn }) => {

  if (sequence.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-800 p-2 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-center space-x-0.5">
        {sequence.map((turn, index) => {
          const isComplete = index < currentTurn;
          const isActive = index === currentTurn;
          const isBan = turn.type === 'BAN';
          const teamColor = turn.team === 'BLUE' ? 'blue' : 'red';
          const phase = turn.phase;
          const prevPhase = index > 0 ? sequence[index - 1].phase : '';
          const showPhaseDivider = phase !== prevPhase;

          return (
            <React.Fragment key={index}>
                {showPhaseDivider && (
                    <div className="flex flex-col items-center h-full self-stretch">
                        <div className="h-4 border-l border-slate-300 dark:border-slate-600 mx-1"></div>
                        <span className="text-xs text-slate-500 dark:text-slate-400" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>{phase}</span>
                    </div>
                )}
              <div
                className="flex-1 h-3 rounded-sm transition-all duration-200 group"
                title={`${turn.team} ${turn.type}`}
              >
                <div
                  className={`h-full w-full rounded-sm relative overflow-hidden transition-all
                    ${isBan ? 'bg-slate-300 dark:bg-slate-700' : `bg-${teamColor}-200/50 dark:bg-${teamColor}-800/20`}
                    ${isActive ? 'ring-2 ring-amber-400' : ''}
                  `}
                >
                  <div className={`absolute top-0 left-0 h-full rounded-sm transition-all duration-300
                      ${isComplete || isActive ? 'w-full' : 'w-0'}
                      ${isBan ? `bg-${teamColor}-500/80` : `bg-${teamColor}-500`}
                      ${isActive ? 'animate-pulse' : ''}
                    `}></div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
