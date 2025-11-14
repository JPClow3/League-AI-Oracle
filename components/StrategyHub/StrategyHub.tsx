import React, { useState, useEffect } from 'react';
import { Armory } from '../Armory/Armory';
import { Intel } from '../Intel/Intel';

type StrategyTab = 'champions' | 'intel';

interface StrategyHubProps {
  initialTab?: StrategyTab;
  initialSearchTerm?: string | null;
  onLoadChampionInLab: (championId: string, role?: string) => void;
  onHandled?: () => void;
}

const TabButton = ({
  tabName,
  currentTab,
  children,
  setActiveTab,
}: {
  tabName: StrategyTab;
  currentTab: StrategyTab;
  children: React.ReactNode;
  setActiveTab: (tab: StrategyTab) => void;
}) => (
  <button
    onClick={() => setActiveTab(tabName)}
    className={`relative font-display px-4 py-3 text-lg font-bold transition-colors ${
      currentTab === tabName ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'
    }`}
  >
    {children}
    {currentTab === tabName && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-accent rounded-full" />}
  </button>
);

export const StrategyHub = ({
  initialTab = 'champions',
  initialSearchTerm,
  onLoadChampionInLab,
  onHandled,
}: StrategyHubProps) => {
  const [activeTab, setActiveTab] = useState<StrategyTab>(initialTab);

  useEffect(() => {
    // Only sync when initialTab prop changes, not when activeTab state changes
    // Using functional setState to avoid needing activeTab in dependency array
    if (initialTab) {
      // Use setTimeout to avoid setState in effect
      const timeoutId = setTimeout(() => {
        setActiveTab(prevTab => (prevTab !== initialTab ? initialTab : prevTab));
      }, 0);
      return () => {
        clearTimeout(timeoutId);
      };
    }
    return undefined;
  }, [initialTab]);

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-border flex items-center gap-4">
        <TabButton tabName="champions" currentTab={activeTab} setActiveTab={setActiveTab}>
          Champion Dossiers
        </TabButton>
        <TabButton tabName="intel" currentTab={activeTab} setActiveTab={setActiveTab}>
          Meta Intelligence
        </TabButton>
      </div>

      <div className="flex-grow pt-6">
        {activeTab === 'champions' && (
          <Armory
            initialSearchTerm={initialSearchTerm}
            onSearchHandled={onHandled}
            onLoadChampionInLab={onLoadChampionInLab}
          />
        )}
        {activeTab === 'intel' && <Intel onLoadChampionInLab={onLoadChampionInLab} />}
      </div>
    </div>
  );
};
