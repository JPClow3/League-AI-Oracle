
import React from 'react';
import { useUserProfile } from '../../hooks/useUserProfile';
import { StrategistJourneyPanel } from './StrategistJourneyPanel';
import { ChampionMasteryPanel } from './ChampionMasteryPanel';
import { MissionsPanel } from './MissionsPanel';
import { ArenaOverviewPanel } from './ArenaOverviewPanel';
import { FeedbackPanel } from './FeedbackPanel';
import { ProTipPanel } from './ProTipPanel';
import type { Page } from '../../types';

interface ProfileProps {
    setCurrentPage: (page: Page) => void;
    navigateToAcademy: (lessonId: string) => void;
}

export const Profile: React.FC<ProfileProps> = ({ setCurrentPage, navigateToAcademy }) => {
    const { profile, spForNextLevel } = useUserProfile();

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-4 rounded-xl shadow-lg">
                <div className="bg-slate-700/50 text-[rgb(var(--color-accent-text))] w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                </div>
                <div>
                    <h1 className="font-display text-3xl font-bold text-white">{profile.username}'s Strategist Profile</h1>
                    <p className="text-sm text-gray-400">Track your progress, complete missions, and master the draft.</p>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-1 space-y-6">
                    <StrategistJourneyPanel profile={profile} spForNextLevel={spForNextLevel} />
                    <ProTipPanel profile={profile} setCurrentPage={setCurrentPage} navigateToAcademy={navigateToAcademy} />
                    <ArenaOverviewPanel stats={profile.arenaStats} />
                    <FeedbackPanel feedback={profile.recentFeedback} />
                </div>

                {/* Right Column */}
                <div className="lg:col-span-2 space-y-6">
                    <div id="missions-panel">
                        <MissionsPanel missions={profile.missions} />
                    </div>
                    <ChampionMasteryPanel mastery={profile.championMastery} />
                </div>
            </div>
        </div>
    );
};
