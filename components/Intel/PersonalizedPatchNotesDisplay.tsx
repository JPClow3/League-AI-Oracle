import React from 'react';
import type { PersonalizedPatchSummary } from '../../types';
import { Loader } from '../common/Loader';
import { Button } from '../common/Button';
import { User, ThumbsUp, ThumbsDown } from 'lucide-react';

interface PersonalizedPatchNotesDisplayProps {
  summary: PersonalizedPatchSummary | null;
  isLoading: boolean;
  error: string | null;
  onLoadChampionInLab: (championId: string, role?: string) => void;
  onRetry?: () => void;
}

const ChangeItem = ({ change }: { change: PersonalizedPatchSummary['relevantBuffs'][0] }) => (
  <div className="bg-secondary p-3 rounded-md border border-border">
    <p className="font-bold text-text-primary">{change.name}</p>
    <p className="text-sm text-text-secondary my-1">{change.change}</p>
    <p className="text-xs text-accent italic">&quot;{change.reasoning}&quot;</p>
  </div>
);

export const PersonalizedPatchNotesDisplay = ({
  summary,
  isLoading,
  error,
  onRetry,
}: PersonalizedPatchNotesDisplayProps) => {
  return (
    <div className="bg-gradient-to-br from-accent/5 to-surface/50 p-6 rounded-lg border-2 border-accent/20 shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <User size={24} className="text-accent" />
        <h2 className="font-display text-2xl font-bold text-text-primary tracking-wide">
          Your Personalized Patch Briefing
        </h2>
      </div>

      {isLoading && (
        <div className="min-h-[150px]">
          <Loader messages={['Crafting your personal briefing...']} />
        </div>
      )}

      {error && !isLoading && (
        <div className="text-center text-error p-4">
          <p>{error}</p>
          {onRetry && (
            <Button onClick={onRetry} variant="secondary" className="mt-2">
              Retry
            </Button>
          )}
        </div>
      )}

      {summary && !isLoading && !error && (
        <div className="space-y-4">
          <p className="text-base text-text-secondary italic leading-relaxed">{summary.summary}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
            <div>
              <h3 className="font-bold text-lg text-success mb-2 flex items-center gap-2">
                <ThumbsUp size={18} />
                Relevant Buffs
              </h3>
              {summary.relevantBuffs.length > 0 ? (
                <div className="space-y-2">
                  {summary.relevantBuffs.map(change => (
                    <React.Fragment key={change.name}>
                      <ChangeItem change={change} />
                    </React.Fragment>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-muted">No major buffs affecting your champion pool this patch.</p>
              )}
            </div>
            <div>
              <h3 className="font-bold text-lg text-error mb-2 flex items-center gap-2">
                <ThumbsDown size={18} />
                Relevant Nerfs
              </h3>
              {summary.relevantNerfs.length > 0 ? (
                <div className="space-y-2">
                  {summary.relevantNerfs.map(change => (
                    <React.Fragment key={change.name}>
                      <ChangeItem change={change} />
                    </React.Fragment>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-muted">None of your primary champions were nerfed this patch.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
