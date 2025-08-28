

import React from 'react';
import type { DraftTurn } from './arenaConstants';
import { Ban, Plus, CheckCircle2 } from 'lucide-react';

interface TurnIndicatorProps {
  turn: DraftTurn | null;
  isBotThinking: boolean;
}

const ActionIcon = ({ type }: { type: 'ban' | 'pick' }) => {
    if (type === 'ban') {
        return <Ban className="h-6 w-6" />;
    }
    return <Plus className="h-6 w-6" />;
}

export const TurnIndicator = ({ turn, isBotThinking }: TurnIndicatorProps) => {
  if (!turn) {
    return (
      <div aria-live="polite" className="bg-gradient-to-r from-success/20 to-surface-primary/20 border border-success/50 p-4 rounded-lg text-center shadow-lg flex items-center justify-center gap-4">
        <CheckCircle2 className="h-8 w-8 text-success" />
        <h2 className="text-2xl font-bold text-success">Draft Complete!</h2>
      </div>
    );
  }

  const { team, type } = turn;
  const isBlue = team === 'blue';
  const teamColorClass = isBlue ? 'text-team-blue' : 'text-team-red';
  const teamBg = isBlue ? 'bg-team-blue/10' : 'bg-team-red/10';
  const typeText = type.charAt(0).toUpperCase() + type.slice(1);

  return (
    <div aria-live="polite" className={`bg-surface-primary p-4 rounded-lg shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 border-t-4 ${isBlue ? 'border-accent' : 'border-error'}`}>
        <div className={`flex items-center gap-3 px-4 py-2 rounded-md ${teamBg} text-text-primary`}>
            <ActionIcon type={type} />
            <span className="font-bold text-lg">{typeText} Phase</span>
        </div>
        <div className="text-center">
            <h2 className="text-xl md:text-2xl font-bold text-text-primary">
                <span className={teamColorClass}>{isBlue ? "Your Turn" : "Opponent's Turn"}</span>
            </h2>
        </div>
        <div className="w-48 text-right">
            {isBotThinking && <p className="text-sm text-text-secondary animate-pulse">Opponent is thinking...</p>}
        </div>
    </div>
  );
};
