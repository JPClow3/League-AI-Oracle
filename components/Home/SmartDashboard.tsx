
import React from 'react';
import type { Page, UserProfile, HistoryEntry } from '../../types';
import { Button } from '../common/Button';

interface SmartDashboardProps {
    profile: UserProfile;
    latestPlaybookEntry?: HistoryEntry;
    setCurrentPage: (page: Page) => void;
}

const SmartCard: React.FC<{
    title: string;
    description: string;
    actionText: string;
    onClick: () => void;
    icon: React.ReactNode;
}> = ({ title, description, actionText, onClick, icon }) => (
    <div className="bg-slate-800/70 p-4 rounded-xl border border-slate-700/80 flex items-center gap-4 w-full sm:w-auto flex-1 basis-full sm:basis-1/3">
        <div className="flex-shrink-0 bg-slate-700/50 text-[rgb(var(--color-accent-text))] w-12 h-12 rounded-lg flex items-center justify-center">
            {icon}
        </div>
        <div className="flex-grow">
            <h3 className="font-bold text-white">{title}</h3>
            <p className="text-sm text-gray-300">{description}</p>
        </div>
        <Button onClick={onClick} variant="secondary" className="flex-shrink-0">{actionText}</Button>
    </div>
);

export const SmartDashboard: React.FC<SmartDashboardProps> = ({ profile, latestPlaybookEntry, setCurrentPage }) => {
    const isTrialCompleted = profile.missions.daily.find(m => m.id === 'd2')?.completed ?? false;

    const cards = [];

    if (!isTrialCompleted) {
        cards.push(
            <SmartCard
                key="trial"
                title="Daily Trial"
                description="Your daily strategic challenge is ready."
                actionText="Begin Trial"
                onClick={() => setCurrentPage('Daily Challenge')}
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>}
            />
        );
    }
    
    if (latestPlaybookEntry) {
         cards.push(
            <SmartCard
                key="playbook"
                title="Latest Playbook Entry"
                description={`Review your "${latestPlaybookEntry.name}" strategy.`}
                actionText="View"
                onClick={() => setCurrentPage('The Archives')}
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>}
            />
        );
    }
    
    // Fallback card if no other smart actions are available
    if (cards.length === 0) {
        cards.push(
            <SmartCard
                key="draft-lab"
                title="Start a New Draft"
                description="Theory-craft your next masterpiece in the Lab."
                actionText="Enter Lab"
                onClick={() => setCurrentPage('Strategy Forge')}
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" /></svg>}
            />
        );
    }

    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-4">Your Dashboard</h2>
            <div className="flex flex-col sm:flex-row gap-4">
                {cards}
            </div>
        </div>
    );
};
