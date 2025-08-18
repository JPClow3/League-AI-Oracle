import React, { useMemo } from 'react';
import type { Page, UserProfile } from '../../types';
import { usePlaybook } from '../../hooks/usePlaybook';
import { Button } from '../common/Button';
import { CHAMPIONS_LITE } from '../../constants';

interface ProTipPanelProps {
    profile: UserProfile;
    setCurrentPage: (page: Page) => void;
    navigateToAcademy: (lessonId: string) => void;
}

interface ProTip {
    id: string;
    condition: (profile: UserProfile, playbookSize: number) => boolean;
    title: string;
    description: string;
    actionText?: string;
    action?: () => void;
}

export const ProTipPanel: React.FC<ProTipPanelProps> = ({ profile, setCurrentPage, navigateToAcademy }) => {
    const { entries } = usePlaybook();

    const tips: ProTip[] = useMemo(() => {
        const lastFeedback = profile.recentFeedback[0];
        const highMasteryNoS = profile.championMastery
            .sort((a,b) => b.points - a.points)
            .find(m => m.points > 200 && !m.highestGrade.startsWith('S'));
            
        return [
            {
                id: 'getting-started-missions',
                condition: (p) => p.missions.gettingStarted.some(m => !m.completed),
                title: "Complete Your First Missions",
                description: "Your 'Getting Started' missions are a great way to learn the ropes and earn a big SP bonus.",
                actionText: 'View Missions',
                action: () => {
                    document.getElementById('missions-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            },
            {
                id: 'identified-weakness',
                condition: () => lastFeedback && lastFeedback.type === 'lesson' && lastFeedback.message.includes('weakness'),
                title: "Address a Weakness",
                description: `The AI noted a potential weakness in a recent draft: "${lastFeedback?.message.split('"')[1]}". Reviewing related lessons can help.`,
                actionText: 'Go to Academy',
                action: () => setCurrentPage('Academy')
            },
            {
                id: 'high-mastery-no-s',
                condition: () => !!highMasteryNoS,
                title: `Reach for the S-Rank!`,
                description: `You have high mastery on ${CHAMPIONS_LITE.find(c => c.id === highMasteryNoS?.championId)?.name}, but haven't hit an S-rank yet. Review their AI Strategy guide to perfect your drafts.`,
                actionText: 'Go to The Armory',
                action: () => setCurrentPage('The Armory')
            },
            {
                id: 'low-arena-score',
                condition: (p) => p.level > 3 && p.arenaStats.averageScore > 0 && p.arenaStats.averageScore < 60,
                title: "Improve Your Fundamentals",
                description: "Your Arena scores suggest there's room to grow! Mastering team composition archetypes is a great place to start.",
                actionText: 'Go to Academy',
                action: () => navigateToAcademy('team-comp-archetypes')
            },
            {
                id: 'empty-playbook',
                condition: (p, playbookSize) => p.level > 2 && playbookSize === 0,
                title: "Build Your Playbook",
                description: "Saving successful drafts to your Playbook is key to building a strategic library you can rely on.",
                actionText: 'Go to Forge',
                action: () => setCurrentPage('Strategy Forge')
            },
            {
                id: 'low-mastery-diversity',
                condition: (p) => p.level > 5 && p.championMastery.length > 0 && p.championMastery.length < 5,
                title: "Expand Your Champion Pool",
                description: "Try analyzing drafts with different champions in the Strategy Forge to increase your mastery and strategic flexibility.",
                actionText: 'Go to Forge',
                action: () => setCurrentPage('Strategy Forge')
            }
        ];
    }, [navigateToAcademy, setCurrentPage, profile]);

    const tip = useMemo(() => {
        return tips.find(tip => tip.condition(profile, entries.length)) || null;
    }, [profile, entries.length, tips]);


    if (!tip) {
        return null; // Don't render if no tips are relevant
    }

    return (
        <div className="bg-slate-800 p-4 rounded-xl shadow-lg border border-yellow-500/30">
            <div className="flex items-start gap-3">
                 <div className="flex-shrink-0 pt-0.5 text-yellow-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-yellow-300">Pro Tip: {tip.title}</h3>
                    <p className="text-sm text-gray-300 mt-1">{tip.description}</p>
                     {tip.action && tip.actionText && (
                        <div className="mt-3">
                            <Button variant="secondary" onClick={tip.action} className="text-sm">
                                {tip.actionText}
                            </Button>
                        </div>
                    )}
                  </div>
            </div>
        </div>
    );
};