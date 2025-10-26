

import React from 'react';
import type { DraftTurn } from './arenaConstants';
import { Ban, Plus, CheckCircle2 } from 'lucide-react';
import type { TeamSide } from '../../types';

interface TurnIndicatorProps {
  turn: DraftTurn | null;
  isBotThinking: boolean;
  userSide: TeamSide;
  context: 'arena' | 'live';
}

const ActionIcon = ({ type }: { type: 'ban' | 'pick' }) => {
    if (type === 'ban') {
        return <Ban className="h-6 w-6" />;
    }
    return <Plus className="h-6 w-6" />;
}

export const TurnIndicator = ({ turn, isBotThinking, userSide, context }: TurnIndicatorProps) => {
  if (!turn) {
    return (
      <div aria-live="polite" className="bg-gradient-to-r from-success/20 to-surface-primary/20 border border-success/50 p-4 rounded-lg text-center shadow-lg flex items-center justify-center gap-4">
        <CheckCircle2 className="h-8 w-8 text-success" />
        <h2 className="text-2xl font-bold text-success">Draft Complete!</h2>
      </div>
    );
  }

  const { team, type } = turn;
  const isUserTurn = team === userSide;
  const teamColorClass = isUserTurn ? 'text-accent' : 'text-error';
  const teamBg = isUserTurn ? 'bg-accent/10' : 'bg-error/10';
  const typeText = type.charAt(0).toUpperCase() + type.slice(1);
  const borderClass = isUserTurn ? 'border-accent' : 'border-error';

  const getTurnText = () => {
    if (context === 'arena') {
      return isUserTurn ? 'Your Turn' : "Opponent's Turn";
    }
    // Live context
    return isUserTurn ? "Your Team's Turn" : "Enemy Team's Turn";
  };


  return (
    <div aria-live="polite" className={`bg-surface-primary p-4 rounded-lg shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 border-t-4 ${borderClass}`}>
        <div className={`flex items-center gap-3 px-4 py-2 rounded-md ${teamBg} text-text-primary`}>
            <ActionIcon type={type} />
            <span className="font-bold text-lg">{typeText} Phase</span>
        </div>
        <div className="text-center">
            <h2 className="text-xl md:text-2xl font-bold text-text-primary">
                <span className={teamColorClass}>{getTurnText()}</span>
            </h2>
        </div>
        <div className="w-48 text-right">
            {isBotThinking && <p className="text-sm text-text-secondary animate-pulse">Opponent is thinking...</p>}
        </div>
    </div>
  );
};