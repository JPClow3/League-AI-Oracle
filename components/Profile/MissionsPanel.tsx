import React from 'react';
import type { Mission, UserProfile } from '../../types';
import { ProgressBar } from '../common/ProgressBar';

interface MissionsPanelProps {
    missions: UserProfile['missions'];
}

const MissionItem: React.FC<{ mission: Mission }> = ({ mission }) => (
    <div className={`bg-slate-900/50 p-4 rounded-lg transition-opacity ${mission.completed ? 'opacity-50' : ''}`}>
        <div className="flex justify-between items-start">
            <div>
                <h4 className={`font-bold text-white ${mission.completed ? 'line-through' : ''}`}>{mission.title}</h4>
                <p className="text-xs text-gray-400">{mission.description}</p>
            </div>
            <div className="text-sm font-bold text-yellow-300 whitespace-nowrap">
                + {mission.rewardSP} SP
            </div>
        </div>
        <div className="mt-3">
            <ProgressBar value={mission.progress} max={mission.target} />
        </div>
    </div>
);

export const MissionsPanel: React.FC<MissionsPanelProps> = ({ missions }) => {
    const areGettingStartedDone = missions.gettingStarted.every(m => m.completed);

    return (
        <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700/50">
            <h2 className="text-xl font-bold text-white mb-4">Missions & Objectives</h2>
            
            {!areGettingStartedDone && (
                <div className="mb-6 space-y-4 p-4 bg-slate-700/50 rounded-lg border border-blue-500/30">
                     <h3 className="text-lg font-semibold text-blue-300">Getting Started</h3>
                     {missions.gettingStarted.map(mission => (
                        <MissionItem key={mission.id} mission={mission} />
                    ))}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-cyan-300">Daily Missions</h3>
                    {missions.daily.map(mission => (
                        <MissionItem key={mission.id} mission={mission} />
                    ))}
                </div>
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-yellow-300">Weekly Missions</h3>
                     {missions.weekly.map(mission => (
                        <MissionItem key={mission.id} mission={mission} />
                    ))}
                </div>
            </div>
        </div>
    );
};