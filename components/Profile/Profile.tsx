import React from 'react';
import type { Page } from '../../types';
import { useUserProfile } from '../../hooks/useUserProfile';
import { StrategistJourneyPanel } from './StrategistJourneyPanel';
import { MissionsPanel } from './MissionsPanel';
import { ChampionMasteryPanel } from './ChampionMasteryPanel';
import { ArenaOverviewPanel } from './ArenaOverviewPanel';
import { FeedbackPanel } from './FeedbackPanel';
import { PlaybookAnalysisPanel } from './PlaybookAnalysisPanel';
import { ProTipPanel } from './ProTipPanel';
import { User } from 'lucide-react';

interface ProfileProps {
    setCurrentPage: (page: Page) => void;
    navigateToAcademy: (lessonId: string) => void;
}

export const Profile = ({ setCurrentPage, navigateToAcademy }: ProfileProps) => {
    const { profile, spForNextLevel } = useUserProfile();

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 bg-surface-primary border border-border-primary p-4 shadow-sm">
                <div className="bg-surface-secondary text-info w-12 h-12 flex items-center justify-center flex-shrink-0">
                    <User size={32} />
                </div>
                <div>
                    <h1 className="font-display text-3xl font-bold text-text-primary tracking-wide">Your Profile</h1>
                    <p className="text-sm text-text-secondary">Track your progress, view achievements, and get personalized insights.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <StrategistJourneyPanel profile={profile} spForNextLevel={spForNextLevel} />
                    <ProTipPanel profile={profile} setCurrentPage={setCurrentPage} navigateToAcademy={navigateToAcademy} />
                    <ArenaOverviewPanel stats={profile.arenaStats} />
                </div>
                <div className="lg:col-span-2 space-y-6">
                    <MissionsPanel missions={profile.missions} />
                    <ChampionMasteryPanel mastery={profile.championMastery} />
                    <PlaybookAnalysisPanel />
                    <FeedbackPanel feedback={profile.recentFeedback} />
                </div>
            </div>
        </div>
    );
};
