
import React from 'react';
import { DraftStep, DraftTimelineProps, Team } from '../types';

interface GroupedPhase {
  name: string;
  steps: DraftStep[];
  isBanPhase: boolean;
}

export const DraftTimeline: React.FC<DraftTimelineProps> = React.memo(({
  draftFlow,
  currentStepIndex,
  theme = 'dark', // Default to dark theme for accent colors
}) => {
  if (!draftFlow || draftFlow.length === 0) {
    return null;
  }

  // Group consecutive steps by phase name
  const groupedPhases: GroupedPhase[] = [];
  let currentGroup: GroupedPhase | null = null;

  draftFlow.forEach(step => {
    if (!currentGroup || currentGroup.name !== step.phase) {
      if (currentGroup) {
        groupedPhases.push(currentGroup);
      }
      currentGroup = { name: step.phase, steps: [step], isBanPhase: step.type === 'BAN' };
    } else {
      currentGroup.steps.push(step);
    }
  });
  if (currentGroup) {
    groupedPhases.push(currentGroup);
  }

  const currentPhaseName = draftFlow[currentStepIndex]?.phase;

  return (
    <div className="draft-timeline-container animate-fadeIn" aria-label="Draft Timeline">
      {groupedPhases.map((group, index) => {
        const isActivePhase = group.name === currentPhaseName;
        let teamShortName = "";
        // Try to determine if it's "Your Team" or "Enemy Team" turn within this phase
        const firstStepInGroup = group.steps[0];
        if (firstStepInGroup) {
            teamShortName = firstStepInGroup.team === Team.YourTeam ? " (Your)" : " (Enemy)";
        }


        return (
          <div
            key={`${group.name}-${index}`}
            className={`draft-timeline-segment ${isActivePhase ? 'active-phase' : ''}`}
            title={`${group.name} - ${group.steps.length} action${group.steps.length > 1 ? 's' : ''}`}
            aria-current={isActivePhase ? "step" : undefined}
          >
            <span className="truncate">
                {group.name}
                {isActivePhase && <span className="hidden sm:inline">{teamShortName}</span>}
            </span>
          </div>
        );
      })}
    </div>
  );
});
