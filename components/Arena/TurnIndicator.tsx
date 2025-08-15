
import React from 'react';
import type { DraftTurn } from './arenaConstants';

interface TurnIndicatorProps {
  turn: DraftTurn | null;
  isBotThinking: boolean;
}

const ActionIcon: React.FC<{ type: 'ban' | 'pick' }> = ({ type }) => {
    if (type === 'ban') {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
        )
    }
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
    )
}

export const TurnIndicator: React.FC<TurnIndicatorProps> = ({ turn, isBotThinking }) => {
  if (!turn) {
    return (
      <div aria-live="polite" className="bg-gradient-to-r from-green-500/20 to-slate-800/20 border border-green-500/50 p-4 rounded-lg text-center shadow-lg flex items-center justify-center gap-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="text-2xl font-bold text-green-400">Draft Complete!</h2>
      </div>
    );
  }

  const { team, type } = turn;
  const isBlue = team === 'blue';
  const teamColor = isBlue ? 'text-blue-400' : 'text-red-400';
  const teamBg = isBlue ? 'bg-blue-500/20' : 'bg-red-500/20';
  const typeText = type.charAt(0).toUpperCase() + type.slice(1);

  return (
    <div aria-live="polite" className={`bg-slate-800 p-4 rounded-lg shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 border-t-4 ${isBlue ? 'border-blue-500' : 'border-red-500'}`}>
        <div className={`flex items-center gap-3 px-4 py-2 rounded-md ${teamBg}`}>
            <ActionIcon type={type} />
            <span className="font-bold text-lg">{typeText} Phase</span>
        </div>
        <div className="text-center">
            <h2 className="text-xl md:text-2xl font-bold text-white">
                <span className={teamColor}>{isBlue ? "Your Turn" : "Opponent's Turn"}</span>
            </h2>
        </div>
        <div className="w-48 text-right">
            {isBotThinking && <p className="text-sm text-gray-400 animate-pulse">Opponent is thinking...</p>}
        </div>
    </div>
  );
};