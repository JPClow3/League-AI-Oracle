import React from 'react';
import type { Page, UserProfile, HistoryEntry, DashboardCardSetting } from '../../types';
import { Button } from '../common/Button';
import { Sun, Library, FlaskConical } from 'lucide-react';
import { useSettings } from '../../hooks/useSettings';

interface SmartDashboardProps {
    profile: UserProfile;
    latestPlaybookEntry?: HistoryEntry;
    setCurrentPage: (page: Page) => void;
}

const SmartCard = ({
    title,
    description,
    actionText,
    onClick,
    icon,
}: {
    title: string;
    description: string;
    actionText: string;
    onClick: () => void;
    icon: React.ReactNode;
}) => (
    <div className="bg-bg-secondary p-4 rounded-lg border border-border-primary flex items-center gap-4 w-full sm:w-auto flex-1 basis-full sm:basis-1/3 shadow-sm">
        <div className="flex-shrink-0 bg-accent-light text-accent w-12 h-12 rounded-md flex items-center justify-center">
            {icon}
        </div>
        <div className="flex-grow">
            <h3 className="font-semibold text-text-primary">{title}</h3>
            <p className="text-sm text-text-secondary">{description}</p>
        </div>
        <Button onClick={onClick} variant="secondary" className="flex-shrink-0">{actionText}</Button>
    </div>
);

export const SmartDashboard = ({ profile, latestPlaybookEntry, setCurrentPage }: SmartDashboardProps) => {
    const { settings } = useSettings();
    const isTrialCompleted = profile.missions.daily.find(m => m.id === 'd2')?.completed ?? false;

    const potentialCards: { id: DashboardCardSetting['id']; condition: boolean; component: React.ReactNode }[] = [
        {
            id: 'trial',
            condition: !isTrialCompleted,
            component: (
                <SmartCard
                    title="Daily Trial"
                    description="Your daily strategic challenge is ready."
                    actionText="Begin Trial"
                    onClick={() => setCurrentPage('Daily Challenge')}
                    icon={<Sun size={28} strokeWidth={1.5} />}
                />
            ),
        },
        {
            id: 'playbook',
            condition: !!latestPlaybookEntry,
            component: (
                <SmartCard
                    title="Latest Playbook Entry"
                    description={`Review your "${latestPlaybookEntry?.name}" strategy.`}
                    actionText="View"
                    onClick={() => setCurrentPage('The Archives')}
                    icon={<Library size={28} strokeWidth={1.5} />}
                />
            ),
        },
    ];
    
    const enabledCardIds = new Set(settings.dashboardCards?.filter(c => c.enabled).map(c => c.id) || []);
    
    const cards = potentialCards
        .filter(card => enabledCardIds.has(card.id))
        .filter(card => card.condition)
        .map(c => <React.Fragment key={c.id}>{c.component}</React.Fragment>);

    // Fallback card if no other smart actions are available
    if (cards.length === 0 && enabledCardIds.has('draft-lab')) {
        cards.push(
            <React.Fragment key="draft-lab">
                <SmartCard
                    title="Start a New Draft"
                    description="Theory-craft your next masterpiece in the Lab."
                    actionText="Enter Lab"
                    onClick={() => setCurrentPage('Strategy Forge')}
                    icon={<FlaskConical size={28} strokeWidth={1.5} />}
                />
            </React.Fragment>
        );
    }

    if (cards.length === 0) {
        return null;
    }

    return (
        <div>
            <h2 className="font-display text-2xl font-semibold text-text-primary mb-4 tracking-wide">Your Dashboard</h2>
            <div className="flex flex-col sm:flex-row gap-4">
                {cards}
            </div>
        </div>
    );
};