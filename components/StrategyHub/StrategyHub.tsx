import React, { useState, useEffect } from 'react';
import { Armory } from '../Armory/Armory';
import { Intel } from '../Intel/Intel';
import type { DraftState } from '../../types';

type StrategyTab = 'champions' | 'intel';

interface StrategyHubProps {
    initialTab?: StrategyTab;
    initialSearchTerm?: string | null;
    onLoadChampionInLab: (championId: string, role?: string) => void;
    onHandled?: () => void;
    draftState: DraftState;
}

export const StrategyHub: React.FC<StrategyHubProps> = ({ initialTab = 'champions', initialSearchTerm, onLoadChampionInLab, onHandled, draftState }) => {
    const [activeTab, setActiveTab] = useState<StrategyTab>(initialTab);

    useEffect(() => {
        if (initialTab) {
            setActiveTab(initialTab);
        }
    }, [initialTab]);

    const TabButton: React.FC<{ tabName: StrategyTab; currentTab: StrategyTab; children: React.ReactNode }> = ({ tabName, currentTab, children }) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`font-display px-4 py-2 text-xl font-bold rounded-t-lg transition-colors ${
                currentTab === tabName
                ? 'text-[rgb(var(--color-accent-text))] border-b-2 border-[rgb(var(--color-accent-bg))]'
                : 'text-gray-400 hover:text-gray-200'
            }`}
        >
            {children}
        </button>
    );

    return (
        <div className="flex flex-col h-full">
            <div className="border-b border-slate-700 flex items-center gap-4">
                 <TabButton tabName="champions" currentTab={activeTab}>Champion Dossiers</TabButton>
                 <TabButton tabName="intel" currentTab={activeTab}>Meta Intelligence</TabButton>
            </div>

            <div className="flex-grow pt-6">
                {activeTab === 'champions' && <Armory initialSearchTerm={initialSearchTerm} onSearchHandled={onHandled} onLoadChampionInLab={onLoadChampionInLab} draftState={draftState} />}
                {activeTab === 'intel' && <Intel onLoadChampionInLab={onLoadChampionInLab} />}
            </div>
        </div>
    );
};