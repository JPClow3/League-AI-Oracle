import type { ChampionLite, ChampionSuggestion } from '../../types';
import { Loader } from '../common/Loader';
import { ROLES } from '../../constants';
import { Check, Swords } from 'lucide-react';
import { Button } from '../common/Button';

interface TeamBuilderAssistantProps {
  step: number;
  coreConcept: string;
  suggestions: (ChampionSuggestion & { champion: ChampionLite })[];
  isLoading: boolean;
  onSelect: (champion: ChampionLite) => void;
  onGenerateOpponent: () => void;
  isOpponentLoading: boolean;
}

export const TeamBuilderAssistant = ({
  step,
  coreConcept,
  suggestions,
  isLoading,
  onSelect,
  onGenerateOpponent,
  isOpponentLoading,
}: TeamBuilderAssistantProps) => {
  if (step >= 5) {
    return (
      <div className="bg-surface-secondary border border-border-primary p-6 h-full flex flex-col items-center justify-center text-center">
        <Check size={48} className="text-success mb-4" />
        <h2 className="text-2xl font-bold font-display text-text-primary">Your Team is Ready!</h2>
        <p className="text-text-secondary mb-6">
          You&apos;ve built a &quot;{coreConcept}&quot; composition. Now, generate an opponent team to analyze the
          matchup.
        </p>
        <Button
          onClick={onGenerateOpponent}
          disabled={isOpponentLoading}
          variant="primary"
          className="text-lg py-3 px-6"
        >
          {isOpponentLoading ? (
            'Generating...'
          ) : (
            <>
              <Swords size={20} className="mr-2" /> Generate Opponent
            </>
          )}
        </Button>
      </div>
    );
  }

  const currentRole = ROLES[step];

  return (
    <div className="bg-surface-secondary border border-border-primary p-4 h-full flex flex-col">
      <div className="text-center pb-3 border-b border-border mb-3">
        <h2 className="text-2xl font-bold font-display text-text-primary">Team Builder Assistant</h2>
        <p className="text-sm text-accent font-semibold">
          Step {step + 1}/5: Selecting {currentRole}
        </p>
        <p className="text-xs text-text-secondary mt-1">
          Core Concept: <span className="font-bold">&quot;{coreConcept}&quot;</span>
        </p>
      </div>
      <div className="flex-grow overflow-y-auto">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <Loader messages={[`Finding the best ${currentRole}...`]} />
          </div>
        ) : (
          <div className="space-y-2">
            {suggestions.map(rec => (
              <button
                key={rec.champion.id}
                onClick={() => onSelect(rec.champion)}
                className="w-full text-left p-2 bg-surface rounded-lg hover:bg-border transition-colors flex items-center gap-3 border border-border-secondary"
              >
                <img src={rec.champion.image} alt={rec.champion.name} className="w-12 h-12 rounded-md flex-shrink-0" />
                <div>
                  <p className="font-bold text-text-primary">{rec.championName}</p>
                  <p className="text-xs text-text-secondary italic">&quot;{rec.reasoning}&quot;</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
