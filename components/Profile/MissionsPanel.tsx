import React, { useState, useEffect } from 'react';
import type { Mission, UserProfile } from '../../types';
import { ProgressBar } from '../common/ProgressBar';
import { useUserProfile } from '../../hooks/useUserProfile';

interface MissionsPanelProps {
  missions: UserProfile['missions'];
}

const MissionItem = ({
  mission,
  isNewlyCompleted,
  onAnimationEnd,
}: {
  mission: Mission;
  isNewlyCompleted: boolean;
  onAnimationEnd: () => void;
}) => {
  // Initialize to false so the effect can trigger the animation
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isNewlyCompleted) {
      // Use setTimeout to avoid setState in effect
      const timer = setTimeout(() => {
        setIsAnimating(true);
      }, 0);
      const endTimer = setTimeout(() => {
        setIsAnimating(false);
        onAnimationEnd();
      }, 1500); // Duration of the animation
      return () => {
        clearTimeout(timer);
        clearTimeout(endTimer);
      };
    }
    return undefined;
  }, [isNewlyCompleted, onAnimationEnd]);

  return (
    <div
      className={`bg-surface-secondary/50 p-4 rounded-lg transition-opacity border border-border-primary ${mission.completed ? 'opacity-50' : ''} ${isAnimating ? 'animate-mission-complete' : ''}`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h4 className={`font-bold text-text-primary ${mission.completed ? 'line-through' : ''}`}>{mission.title}</h4>
          <p className="text-xs text-text-secondary">{mission.description}</p>
        </div>
        <div className="text-sm font-bold text-accent whitespace-nowrap">+ {mission.rewardSP} SP</div>
      </div>
      <div className="mt-3">
        <ProgressBar value={mission.progress} max={mission.target} />
      </div>
    </div>
  );
};

export const MissionsPanel = ({ missions }: MissionsPanelProps) => {
  const { lastCompletedMissionId, clearLastCompletedMissionId } = useUserProfile();
  const areGettingStartedDone = missions.gettingStarted.every(m => m.completed);

  return (
    <div className="bg-surface p-6 rounded-xl shadow-lg border border-border-primary">
      <h2 className="text-xl font-bold text-text-primary mb-4">Missions & Objectives</h2>

      {!areGettingStartedDone && (
        <div className="mb-6 space-y-4 p-4 bg-surface-secondary rounded-lg border border-accent/20">
          <h3 className="text-lg font-semibold text-accent">Getting Started</h3>
          {missions.gettingStarted.map(mission => (
            <React.Fragment key={mission.id}>
              <MissionItem
                mission={mission}
                isNewlyCompleted={mission.id === lastCompletedMissionId}
                onAnimationEnd={clearLastCompletedMissionId}
              />
            </React.Fragment>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-info">Daily Missions</h3>
          {missions.daily.map(mission => (
            <React.Fragment key={mission.id}>
              <MissionItem
                mission={mission}
                isNewlyCompleted={mission.id === lastCompletedMissionId}
                onAnimationEnd={clearLastCompletedMissionId}
              />
            </React.Fragment>
          ))}
        </div>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-accent">Weekly Missions</h3>
          {missions.weekly.map(mission => (
            <React.Fragment key={mission.id}>
              <MissionItem
                mission={mission}
                isNewlyCompleted={mission.id === lastCompletedMissionId}
                onAnimationEnd={clearLastCompletedMissionId}
              />
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
