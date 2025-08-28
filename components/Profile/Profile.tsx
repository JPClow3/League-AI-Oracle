import React, { useState } from 'react';
import { useUserProfile } from '../../hooks/useUserProfile';
import { StrategistJourneyPanel } from './StrategistJourneyPanel';
import { ChampionMasteryPanel } from './ChampionMasteryPanel';
import { MissionsPanel } from './MissionsPanel';
import { ArenaOverviewPanel } from './ArenaOverviewPanel';
import { FeedbackPanel } from './FeedbackPanel';
import { ProTipPanel } from './ProTipPanel';
import type { Page } from '../../types';
import { User } from 'lucide-react';

interface ProfileProps {
    setCurrentPage: (page: Page) => void;
    navigateToAcademy: (lessonId: string) => void;
}

export const Profile = ({ setCurrentPage, navigateToAcademy }: ProfileProps) => {
    const { profile, spForNextLevel } = useUserProfile();
    const [mobileTab, setMobileTab] = useState<'missions' | 'mastery'>('missions');

    const MobileTabButton = ({ tab, target, children, onClick }: { tab: typeof mobileTab, target: typeof mobileTab, children: React.ReactNode, onClick: () => void }) => (
        <button onClick={onClick} className={`px-4 py-2 rounded-md w-full text-center font-semibold transition-colors ${tab === target ? 'bg-accent text-on-accent' : 'bg-surface-secondary text-text-secondary'}`}>
            {children}
        </button>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 bg-surface-primary border border-border-primary p-4 rounded-xl shadow-lg">
                <div className="bg-surface-secondary text-accent w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                    <User size={32} strokeWidth={1.5} />
                </div>
                <div>
                    <h1 className="font-display text-3xl font-bold text-text-primary">{profile.username}'s Strategist Profile</h1>
                    <p className="text-sm text-text-secondary">Track your progress, complete missions, and master the draft.</p>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column (always visible) */}
                <div className="lg:col-span-1 space-y-6">
                    <StrategistJourneyPanel profile={profile} spForNextLevel={spForNextLevel} />
                    <ProTipPanel profile={profile} setCurrentPage={setCurrentPage} navigateToAcademy={navigateToAcademy} />
                    <ArenaOverviewPanel stats={profile.arenaStats} />
                    <FeedbackPanel feedback={profile.recentFeedback} />
                </div>

                {/* Right Column (Desktop) */}
                <div className="hidden lg:block lg:col-span-2 space-y-6">
                    <div id="missions-panel">
                        <MissionsPanel missions={profile.missions} />
                    </div>
                    <ChampionMasteryPanel mastery={profile.championMastery} />
                </div>
                
                 {/* Right Column (Mobile Tabs) */}
                <div className="lg:hidden flex flex-col gap-4">
                    <div className="flex items-center gap-2 bg-surface-primary p-1 rounded-lg">
                        <MobileTabButton tab={mobileTab} target="missions" onClick={() => setMobileTab('missions')}>Missions</MobileTabButton>
                        <MobileTabButton tab={mobileTab} target="mastery" onClick={() => setMobileTab('mastery')}>Mastery</MobileTabButton>
                    </div>

                    <div>
                        {mobileTab === 'missions' && (
                             <div id="missions-panel-mobile">
                                <MissionsPanel missions={profile.missions} />
                            </div>
                        )}
                        {mobileTab === 'mastery' && <ChampionMasteryPanel mastery={profile.championMastery} />}
                    </div>
                </div>
            </div>
        </div>
    );
};
