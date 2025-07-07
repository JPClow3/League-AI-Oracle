import React, { useState, useMemo, useCallback } from 'react';
import { Champion, DDragonData, SynergyAndCounterAnalysis } from '../types';
import { useDebounce } from '../hooks/useDebounce';
import { ChampionIcon } from './common/ChampionIcon';
import { Icon } from './common/Icon';
import { Spinner } from './common/Spinner';
import { useProfile } from '../contexts/ProfileContext';
import { geminiService } from '../services/geminiService';

const OraclesArmory: React.FC<{ ddragonData: DDragonData }> = ({ ddragonData }) => {
    const [selectedChampion, setSelectedChampion] = useState<Champion | null>(null);
    const [analysis, setAnalysis] = useState<SynergyAndCounterAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { activeProfile } = useProfile();

    const handleSelectChampion = useCallback(async (champion: Champion) => {
        setSelectedChampion(champion);
        setIsLoading(true);
        setError(null);
        setAnalysis(null);
        try {
            const result = await geminiService.getSynergiesAndCounters(champion.name, activeProfile!.settings);
            if (result) {
                setAnalysis(result);
            } else {
                setError("The Oracle could not provide an analysis for this champion at this time.");
            }
        } catch (e: any) {
            setError(e.message || "An unexpected error occurred.");
            console.error(e);
        } finally {
            setIsLoading(false);
        }
        window.scrollTo(0, 0);
    }, [activeProfile]);

    const handleClearChampion = () => {
        setSelectedChampion(null);
        setAnalysis(null);
        setError(null);
    };

    return (
        <div className="animate-slide-fade-in">
            {!selectedChampion ? (
                <ChampionGridComponent ddragonData={ddragonData} onChampionSelect={handleSelectChampion} />
            ) : (
                <AnalysisView
                    champion={selectedChampion}
                    analysis={analysis}
                    isLoading={isLoading}
                    error={error}
                    onBack={handleClearChampion}
                    ddragonData={ddragonData}
                />
            )}
        </div>
    );
};

const ChampionGridComponent: React.FC<{
    ddragonData: DDragonData;
    onChampionSelect: (champion: Champion) => void;
}> = ({ ddragonData, onChampionSelect }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 250);

    const champions = useMemo(() => {
        return Object.values(ddragonData.champions)
            .filter(c => c.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [ddragonData.champions, debouncedSearchTerm]);

    return (
        <div>
            <div className="text-center mb-12">
                <h1 className="text-6xl font-display font-bold text-gradient-primary">Oracle's Armory</h1>
                <p className="text-xl text-slate-500 dark:text-slate-400 mt-2">Explore champion synergies and counters.</p>
            </div>
            <div className="p-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 mb-8 sticky top-20 z-10">
                <input
                    type="text"
                    placeholder="Select a champion to analyze..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full p-2 rounded bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-4">
                {champions.map((champ, index) => (
                    <div key={champ.id} className="animate-pop-in" style={{ animationDelay: `${index * 15}ms`, opacity: 0, animationFillMode: 'forwards' }}>
                        <ChampionIcon champion={champ} version={ddragonData.version} onClick={onChampionSelect} className="w-full aspect-square" />
                    </div>
                ))}
            </div>
        </div>
    );
};

const AnalysisView: React.FC<{
    champion: Champion;
    analysis: SynergyAndCounterAnalysis | null;
    isLoading: boolean;
    error: string | null;
    onBack: () => void;
    ddragonData: DDragonData;
}> = ({ champion, analysis, isLoading, error, onBack, ddragonData }) => {
    return (
        <div>
             <button onClick={onBack} className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-semibold mb-4">
                <Icon name="chevron-right" className="w-4 h-4 transform rotate-180"/>
                Back to Armory
            </button>
            <div className="flex flex-col items-center gap-4 p-6 bg-white dark:bg-slate-800/80 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 mb-8">
                <ChampionIcon champion={champion} version={ddragonData.version} isClickable={false} className="w-24 h-24" />
                <h2 className="text-4xl font-display text-slate-800 dark:text-slate-100">Analysis for {champion.name}</h2>
            </div>

            {isLoading && <div className="flex justify-center p-8"><Spinner size="h-10 w-10"/></div>}
            {error && <div className="p-4 bg-rose-500/10 text-rose-500 text-center rounded-lg">{error}</div>}

            {analysis && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
                    <AnalysisColumn title="Top Synergies" icon="plus" champions={analysis.synergies} ddragonData={ddragonData} color="teal" />
                    <AnalysisColumn title="Top Counters" icon="x" champions={analysis.counters} ddragonData={ddragonData} color="rose" />
                </div>
            )}
        </div>
    );
};

const AnalysisColumn: React.FC<{
    title: string;
    icon: React.ComponentProps<typeof Icon>['name'];
    champions: { championName: string; reasoning: string }[];
    ddragonData: DDragonData;
    color: 'teal' | 'rose';
}> = ({ title, icon, champions, ddragonData, color }) => {
    const getChampion = (name: string) => Object.values(ddragonData.champions).find(c => c.name === name);

    return (
        <div className="space-y-4">
            <h3 className={`font-display text-3xl flex items-center gap-3 text-${color}-600 dark:text-${color}-400`}>
                <Icon name={icon} className="w-8 h-8"/>
                {title}
            </h3>
            <div className="space-y-3">
                {champions.map(item => {
                    const champData = getChampion(item.championName);
                    return (
                         <div key={item.championName} className={`p-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg border-l-4 border-${color}-500`}>
                             <div className="flex items-start gap-4">
                                 {champData && <ChampionIcon champion={champData} version={ddragonData.version} className="w-16 h-16 flex-shrink-0" isClickable={false} />}
                                 <div className="flex-grow">
                                     <h4 className="font-bold text-lg text-slate-800 dark:text-slate-200">{item.championName}</h4>
                                     <p className="text-sm text-slate-600 dark:text-slate-400">{item.reasoning}</p>
                                 </div>
                             </div>
                         </div>
                    );
                })}
            </div>
        </div>
    );
};

export default OraclesArmory;
