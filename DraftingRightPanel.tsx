
import React, { useState, useEffect } from 'react';
import { Champion, DDragonData } from '../types';
import TeamAnalyticsDashboard from './TeamAnalyticsDashboard';
import { Icon } from './common/Icon';
import { ChampionIcon } from './common/ChampionIcon';
import { Spinner } from './common/Spinner';

interface DraftingRightPanelProps {
    isAiLoading: boolean;
    bluePicks: (Champion | null)[];
    redPicks: (Champion | null)[];
    handleGetSuggestion: () => void;
    aiSuggestions: { championName: string; reasoning: string }[] | null;
    ddragonData: DDragonData;
    handleUseSuggestion: (championName: string) => void;
}

const TabButton: React.FC<{ name: string; isActive: boolean; onClick: () => void; }> = ({ name, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex-1 py-3 text-sm font-semibold transition-colors duration-200 border-b-2
            ${isActive
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-indigo-500'
            }`}
    >
        {name}
    </button>
);

const DraftingRightPanel: React.FC<DraftingRightPanelProps> = ({
    isAiLoading, bluePicks, redPicks, handleGetSuggestion, aiSuggestions, ddragonData, handleUseSuggestion
}) => {
    const [activeTab, setActiveTab] = useState<'analysis' | 'suggestions'>('analysis');
    const champions = Object.values(ddragonData.champions);

    useEffect(() => {
        if (aiSuggestions && aiSuggestions.length > 0) {
            setActiveTab('suggestions');
        }
    }, [aiSuggestions]);

    const validBluePicks = bluePicks.filter((c): c is Champion => c !== null);
    const validRedPicks = redPicks.filter((c): c is Champion => c !== null);

    return (
        <div className="bg-white dark:bg-slate-800/80 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 flex flex-col h-full lg:h-[calc(100vh-7.5rem)]">
            <div className="flex border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
                <TabButton name="Team Analysis" isActive={activeTab === 'analysis'} onClick={() => setActiveTab('analysis')} />
                <TabButton name="AI Suggestions" isActive={activeTab === 'suggestions'} onClick={() => setActiveTab('suggestions')} />
            </div>

            <div className="p-4 flex-grow overflow-y-auto">
                {activeTab === 'analysis' && (
                    <div className="space-y-4 animate-fade-in">
                        <TeamAnalyticsDashboard teamName="BLUE" champions={validBluePicks} />
                        <TeamAnalyticsDashboard teamName="RED" champions={validRedPicks} />
                    </div>
                )}
                {activeTab === 'suggestions' && (
                     <div className="space-y-4 animate-fade-in">
                         <button onClick={handleGetSuggestion} disabled={isAiLoading} className="w-full px-4 py-3 bg-amber-500 text-slate-900 rounded-md hover:bg-amber-600 dark:bg-amber-400 dark:hover:bg-amber-500 transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold active:scale-95 transform shadow-md hover:shadow-lg">
                            {isAiLoading ? <Spinner size="h-5 w-5 mr-2" /> : <Icon name="brain" className="w-5 h-5 mr-2" /> }
                            {isAiLoading ? 'Oracle is Contemplating...' : 'Get AI Suggestion' }
                        </button>
                         {aiSuggestions && aiSuggestions.length > 0 ? (
                             <div className="space-y-3">
                                <h3 className="font-display text-xl text-slate-700 dark:text-slate-300">Oracle's Suggestions:</h3>
                                {aiSuggestions.map((s, i) => {
                                    const champion = champions.find(c => c.name === s.championName);
                                    return (
                                    <div key={i} className="flex items-start gap-3 p-3 rounded-md bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
                                        {champion && <ChampionIcon champion={champion} version={ddragonData.version} isClickable={false} className="w-16 h-16 flex-shrink-0" />}
                                        <div className="flex-grow">
                                            <strong className="font-semibold text-lg text-slate-800 dark:text-slate-200">{s.championName}</strong>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">{s.reasoning}</p>
                                        </div>
                                        <button onClick={() => handleUseSuggestion(s.championName)} className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-semibold self-center">Use</button>
                                    </div>
                                )})}
                            </div>
                         ) : !isAiLoading && (
                             <div className="text-center p-8 text-slate-500">
                                <Icon name="brain" className="w-12 h-12 mx-auto mb-2"/>
                                <p>Ask the Oracle for a draft suggestion.</p>
                            </div>
                         )}
                     </div>
                )}
            </div>
        </div>
    );
};

export default DraftingRightPanel;
