import React, { useMemo } from 'react';
import { Champion, DDragonData } from '../../types';
import { Spinner } from './common/Spinner';
import InteractiveText from './common/InteractiveText';
import { ChampionIcon } from './common/ChampionIcon';
import { Icon } from './common/Icon';
import { calculateTeamAnalytics } from '../data/analyticsHelper';
import { isChampion } from '../utils/typeGuards';
import TeamAnalyticsDashboard from './TeamAnalyticsDashboard';

interface MidDraftAnalysisPanelProps {
    isAiLoading: boolean;
    bluePicks: Champion[];
    redPicks: Champion[];
    handleGetSuggestion: () => void;
    aiSuggestions: { championName: string; reasoning: string }[] | null;
    ddragonData: DDragonData;
    onKeywordClick: (lessonId: string) => void;
    handleUseSuggestion: (championName: string) => void;
}


const ComparativeAnalytics: React.FC<{ bluePicks: Champion[], redPicks: Champion[] }> = ({ bluePicks, redPicks }) => {
    const blueAnalytics = useMemo(() => calculateTeamAnalytics(bluePicks), [bluePicks]);
    const redAnalytics = useMemo(() => calculateTeamAnalytics(redPicks), [redPicks]);

    const totalDamageBlue = blueAnalytics.damageProfile.ad + blueAnalytics.damageProfile.ap + 0.001;
    const totalDamageRed = redAnalytics.damageProfile.ad + redAnalytics.damageProfile.ap + 0.001;

    const StatComparison: React.FC<{ label: string, blueValue: number, redValue: number, max: number }> = ({ label, blueValue, redValue, max }) => (
        <div>
            <div className="text-center text-xs font-semibold mb-1 text-slate-500 dark:text-slate-400">{label}</div>
            <div className="flex items-center gap-2">
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5" title={`Blue: ${blueValue.toFixed(1)}`}>
                    <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${Math.min(100, (blueValue / max) * 100)}%` }} />
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5" title={`Red: ${redValue.toFixed(1)}`}>
                    <div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${Math.min(100, (redValue / max) * 100)}%` }} />
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-3 p-3 bg-slate-100 dark:bg-slate-900/50 rounded-lg">
            <div>
                <div className="text-center text-xs font-semibold mb-1 text-slate-500 dark:text-slate-400">Damage Profiles</div>
                <div className="flex w-full h-3 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 relative">
                     <div className="absolute inset-0 flex justify-center items-center">
                        <div className="w-px h-full bg-slate-400 dark:bg-slate-600"></div>
                    </div>
                    <div className="flex w-1/2">
                        <div className="bg-sky-500 h-full" style={{ width: `${(blueAnalytics.damageProfile.ap / totalDamageBlue) * 100}%` }} title={`Blue AP: ${blueAnalytics.damageProfile.ap}`} />
                        <div className="bg-rose-500 h-full" style={{ width: `${(blueAnalytics.damageProfile.ad / totalDamageBlue) * 100}%` }} title={`Blue AD: ${blueAnalytics.damageProfile.ad}`} />
                    </div>
                    <div className="flex w-1/2">
                        <div className="bg-rose-500 h-full" style={{ width: `${(redAnalytics.damageProfile.ad / totalDamageRed) * 100}%` }} title={`Red AD: ${redAnalytics.damageProfile.ad}`} />
                        <div className="bg-sky-500 h-full" style={{ width: `${(redAnalytics.damageProfile.ap / totalDamageRed) * 100}%` }} title={`Red AP: ${redAnalytics.damageProfile.ap}`} />
                    </div>
                </div>
                 <div className="flex justify-between text-xs mt-1 text-slate-500"><span className="text-blue-400">Blue Team</span> <span className="text-red-400">Red Team</span></div>
            </div>
            <StatComparison label="Crowd Control" blueValue={blueAnalytics.ccScore.value} redValue={redAnalytics.ccScore.value} max={15} />
            <StatComparison label="Engage Potential" blueValue={blueAnalytics.engageScore.value} redValue={redAnalytics.engageScore.value} max={15} />
        </div>
    );
};


export const MidDraftAnalysisPanel: React.FC<MidDraftAnalysisPanelProps> = ({
    isAiLoading, bluePicks, redPicks, handleGetSuggestion, aiSuggestions, ddragonData, onKeywordClick, handleUseSuggestion
}) => {
    const champions = Object.values(ddragonData.champions);

    return (
        <div className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 space-y-4">
            <h3 className="font-display text-2xl text-slate-700 dark:text-slate-300">Live Analysis & Suggestions</h3>
            
            <ComparativeAnalytics bluePicks={bluePicks} redPicks={redPicks} />
            
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