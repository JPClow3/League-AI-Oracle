import { useMemo, useEffect, useState } from 'react';
import type { Page, UserProfile } from '../../types';
import { usePlaybook } from '../../hooks/usePlaybook';
import { Button } from '../common/Button';
import { Lightbulb } from 'lucide-react';
import { useChampions } from '../../contexts/ChampionContext';
import { useUserProfile } from '../../hooks/useUserProfile';
import { generateDynamicProTip } from '../../services/geminiService';

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

const isTipRecent = (generatedAt?: string): boolean => {
    if (!generatedAt) {return false;}
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return new Date(generatedAt) > sevenDaysAgo;
};

export const ProTipPanel = ({ profile, setCurrentPage, navigateToAcademy }: ProTipPanelProps) => {
    const { entries } = usePlaybook();
    const { championsLite } = useChampions();
    const { setProfile } = useUserProfile();
    const [isLoadingTip, setIsLoadingTip] = useState(false);

    // Effect to generate dynamic tip if needed
    useEffect(() => {
        const shouldGenerateTip = entries.length >= 3 && !isTipRecent(profile.dynamicProTip?.generatedAt);
        
        if (shouldGenerateTip && !isLoadingTip) {
            const controller = new AbortController();
            const fetchTip = async () => {
                setIsLoadingTip(true);
                try {
                    const recentEntries = entries.slice(0, 3);
                    const tipText = await generateDynamicProTip(recentEntries, championsLite, controller.signal);
                    if (controller.signal.aborted) {return;}
                    setProfile({ 
                        dynamicProTip: {
                            tip: tipText,
                            generatedAt: new Date().toISOString()
                        }
                    });
                } catch (err) {
                     if (err instanceof DOMException && err.name === 'AbortError') {return;}
                     console.error("Failed to generate dynamic pro tip:", err);
                } finally {
                    if (!controller.signal.aborted) {
                        setIsLoadingTip(false);
                    }
                }
            };
            fetchTip();
            return () => controller.abort();
        }
        return undefined;
    }, [entries, profile.dynamicProTip, championsLite, setProfile, isLoadingTip]);

    const staticTips: ProTip[] = useMemo(() => {
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
                    const missionsPanel = document.getElementById('missions-panel') || document.getElementById('missions-panel-mobile');
                    missionsPanel?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            },
            {
                id: 'identified-weakness',
                condition: () => Boolean(lastFeedback && lastFeedback.type === 'lesson' && lastFeedback.message.includes('weakness')),
                title: "Address a Weakness",
                description: `The AI noted a potential weakness in a recent draft: "${lastFeedback?.message.split('"')[1]}". Reviewing related lessons can help.`,
                actionText: 'Go to Academy',
                action: () => setCurrentPage('Academy')
            },
            {
                id: 'high-mastery-no-s',
                condition: () => !!highMasteryNoS,
                title: `Reach for the S-Rank!`,
                description: `You have high mastery on ${championsLite.find(c => c.id === highMasteryNoS?.championId)?.name}, but haven't hit an S-rank yet. Review their AI Strategy guide to perfect your drafts.`,
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
    }, [navigateToAcademy, setCurrentPage, profile, championsLite]);

    const tip = useMemo(() => {
        // Prioritize dynamic tip if it exists
        if (profile.dynamicProTip?.tip) {
            return {
                id: 'dynamic-tip',
                title: "Your Personalized Insight",
                description: profile.dynamicProTip.tip,
            };
        }
        // Fallback to static tips
        return staticTips.find(tip => tip.condition(profile, entries.length)) || null;
    }, [profile, entries.length, staticTips]);


    if (!tip && !isLoadingTip) {
        return null; // Don't render if no tips are relevant and not loading
    }

    return (
        <div className="bg-surface-primary p-4 rounded-xl shadow-lg border border-accent/30">
            <div className="flex items-start gap-3">
                 <div className="flex-shrink-0 pt-0.5 text-accent">
                    <Lightbulb className="h-6 w-6" />
                  </div>
                  <div>
                    {isLoadingTip ? (
                        <h3 className="font-semibold text-accent animate-pulse">Generating new Pro Tip...</h3>
                    ) : (
                        <>
                            <h3 className="font-semibold text-accent">Pro Tip: {tip?.title}</h3>
                            <p className="text-sm text-text-secondary mt-1">{tip?.description}</p>
                            {tip && 'action' in tip && tip.action && tip.actionText && (
                                <div className="mt-3">
                                    <Button variant="secondary" onClick={tip.action} className="text-sm">
                                        {tip.actionText}
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                  </div>
            </div>
        </div>
    );
};
