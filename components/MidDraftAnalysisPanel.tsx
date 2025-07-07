
import React from 'react';
import { Champion, DDragonData } from '../types';
import TeamAnalyticsDashboard from './TeamAnalyticsDashboard';
import { Spinner } from './common/Spinner';
import InteractiveText from './common/InteractiveText';
import { ChampionIcon } from './common/ChampionIcon';
import { Icon } from './common/Icon';

interface MidDraftAnalysisPanelProps {
    isAiLoading: boolean;
    bluePicks: (Champion | null)[];
    redPicks: (Champion | null)[];
    handleGetSuggestion: () => void;
    aiSuggestions: { championName: string; reasoning: string }[] | null;
    ddragonData: DDragonData;
    onKeywordClick: (lessonId: string) => void;
    handleUseSuggestion: (championName: string) => void;
}

export const MidDraftAnalysisPanel: React.FC<MidDraftAnalysisPanelProps> = ({
    isAiLoading, bluePicks, redPicks, handleGetSuggestion, aiSuggestions, ddragonData, onKeywordClick, handleUseSuggestion
}) => {
    const champions = Object.values(ddragonData.champions);

    return (
        <div className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 space-y-4">
            <h3 className="font-display text-2xl text-slate-700 dark:text-slate-300">Live Analysis & Suggestions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TeamAnalyticsDashboard teamName="BLUE" champions={bluePicks} />
                <TeamAnalyticsDashboard teamName="RED" champions={redPicks} />
            </div>
            <button onClick={handleGetSuggestion} disabled={isAiLoading} className="w-full px-4 py-3 bg-amber-500 text-slate-900 rounded-md hover:bg-amber-600 dark:bg-amber-400 dark:hover:bg-amber-500 transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold active:scale-95 transform shadow-md hover:shadow-lg">
                {isAiLoading && !aiSuggestions ? <Spinner size="h-5 w-5 mr-2" /> : <Icon name="brain" className="w-5 h-5 mr-2" /> }
                {isAiLoading && !aiSuggestions ? 'Oracle is Contemplating...' : 'Get AI Suggestion' }
            </button>
            
            {aiSuggestions && (
                <div className="space-y-3 animate-slide-fade-in">
                    <h3 className="font-display text-xl text-slate-700 dark:text-slate-300">Oracle's Suggestions:</h3>
                    {aiSuggestions.map((s, i) => {
                        const champion = champions.find(c => c.name === s.championName);
                        return (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-md bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
                            {champion && <ChampionIcon champion={champion} version={ddragonData.version} isClickable={false} className="w-16 h-16 flex-shrink-0" />}
                            <div className="flex-grow">
                                <strong className="font-semibold text-lg text-slate-800 dark:text-slate-200">{s.championName}</strong>
                                <p className="text-sm text-slate-600 dark:text-slate-400"><InteractiveText onKeywordClick={onKeywordClick}>{s.reasoning}</InteractiveText></p>
                            </div>
                            <button onClick={() => handleUseSuggestion(s.championName)} className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-semibold self-center">Use</button>
                        </div>
                    )})}
                </div>
            )}
        </div>
    );
};
