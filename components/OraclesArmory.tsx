import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { DDragonData, Champion, SynergyAndCounterAnalysis } from '../types';
import { Spinner } from './common/Spinner';
import { useDebounce } from '../../hooks/useDebounce';
import { ChampionIcon } from './common/ChampionIcon';
import { Icon } from './common/Icon';
import { useProfile } from '../contexts/ProfileContext';
import { geminiService } from '../services/geminiService';

interface OraclesArmoryProps {
    ddragonData: DDragonData;
}

const OraclesArmory: React.FC<OraclesArmoryProps> = ({ ddragonData }) => {
    const [selectedChampion, setSelectedChampion] = useState<Champion | null>(null);

    const handleSelectChampion = (champion: Champion) => {
        setSelectedChampion(champion);
        window.scrollTo(0, 0);
    };

    const handleClearChampion = () => {
        setSelectedChampion(null);
    };
    
    return (
        <div className="animate-slide-fade-in">
            {!selectedChampion ? (
                <ChampionGridComponent ddragonData={ddragonData} onChampionSelect={handleSelectChampion} />
            ) : (
                <AnalysisDisplayView champion={selectedChampion} ddragonData={ddragonData} onBack={handleClearChampion} />
            )}
        </div>
    );
};

// #region Champion Grid View
const ChampionGridComponent: React.FC<{
    ddragonData: DDragonData;
    onChampionSelect: (champion: Champion) => void;
}> = ({ ddragonData, onChampionSelect }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 250);

    const allChampions = useMemo(() => Object.values(ddragonData.champions).sort((a,b) => a.name.localeCompare(b.name)), [ddragonData.champions]);

    const filteredChampions = useMemo(() => {
        return allChampions.filter(champ => champ.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()));
    }, [allChampions, debouncedSearchTerm]);

    return (
        <div>
            <div className="text-center mb-12">
                <h1 className="text-6xl font-display font-bold text-gradient-primary">Oracle's Armory</h1>
                <p className="text-xl text-slate-500 dark:text-slate-400 mt-2">Select a champion to analyze their strategic matchups.</p>
            </div>
            <div className="p-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 mb-8 sticky top-20 z-10">
                <input
                    type="text"
                    placeholder="Search by name..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full p-2 rounded bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-4">
                {filteredChampions.map((champ, index) => (
                    <div key={champ.id} className="animate-pop-in" style={{ animationDelay: `${index*15}ms`, opacity: 0, animationFillMode: 'forwards' }}>
                        <ChampionIcon champion={champ} version={ddragonData.version} onClick={onChampionSelect} className="w-full aspect-square"/>
                    </div>
                ))}
            </div>
        </div>
    );
};
// #endregion

// #region Analysis Display View
const AnalysisDisplayView: React.FC<{
    champion: Champion;
    ddragonData: DDragonData;
    onBack: () => void;
}> = ({ champion, ddragonData, onBack }) => {
    const { activeProfile } = useProfile();
    
    const [analysis, setAnalysis] = useState<SynergyAndCounterAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const splashUrl = `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champion.id}_0.jpg`;

    const fetchAnalysis = useCallback(async () => {
        if (!champion || !activeProfile) return;
        setIsLoading(true);
        setError(null);
        setAnalysis(null);

        const cacheKey = `armory_analysis_${champion.id}`;
        try {
            const cachedData = sessionStorage.getItem(cacheKey);
            if (cachedData) {
                setAnalysis(JSON.parse(cachedData));
                setIsLoading(false);
                return;
            }
        } catch (e) { console.error("Failed to read from session storage", e); }

        try {
            const result = await geminiService.getSynergiesAndCounters(champion.name, activeProfile.settings);
            if (result) {
                setAnalysis(result);
                sessionStorage.setItem(cacheKey, JSON.stringify(result));
            } else {
                setError("The Oracle could not provide an analysis for this champion.");
            }
        } catch (e) {
            setError((e as Error).message || "An unexpected error occurred.");
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [champion, activeProfile]);

    useEffect(() => {
        fetchAnalysis();
    }, [fetchAnalysis]);

    return (
        <div className="space-y-6">
            <button onClick={onBack} className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">
                <Icon name="chevron-right" className="w-4 h-4 transform rotate-180"/>
                Back to Armory
            </button>
            
            <div className="relative rounded-lg overflow-hidden shadow-2xl">
                <img src={splashUrl} alt={`${champion.name} Splash Art`} className="w-full h-auto object-cover max-h-[400px]" decoding="async" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6">
                    <h2 className="text-6xl font-display text-white" style={{ textShadow: '2px 2px 4px #000' }}>{champion.name}</h2>
                    <p className="text-2xl text-slate-300" style={{ textShadow: '1px 1px 2px #000' }}>{champion.title}</p>
                </div>
                 <button onClick={fetchAnalysis} disabled={isLoading} className="absolute top-4 right-4 p-2 bg-slate-800/50 rounded-full text-white hover:bg-slate-700 disabled:opacity-50 transition-colors">
                    <Icon name="history" className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnalysisColumn 
                    title="Top Synergies" 
                    data={analysis?.synergies}
                    ddragonData={ddragonData}
                    color="teal"
                    isLoading={isLoading}
                />
                <AnalysisColumn 
                    title="Top Counters" 
                    data={analysis?.counters}
                    ddragonData={ddragonData}
                    color="rose"
                    isLoading={isLoading}
                />
            </div>
            {error && (
                <div className="p-4 text-center text-rose-500 bg-rose-500/10 rounded-lg border border-rose-500/20">
                    <p>{error}</p>
                </div>
            )}
        </div>
    );
};

const AnalysisColumn: React.FC<{
    title: string, 
    data?: {championName: string, reasoning: string}[], 
    ddragonData: DDragonData, 
    color: 'teal' | 'rose',
    isLoading: boolean
}> = ({ title, data, ddragonData, color, isLoading }) => (
    <div className="bg-slate-100/50 dark:bg-slate-900/30 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
        <h4 className={`font-display text-3xl text-${color}-600 dark:text-${color}-400 mb-4`}>{title}</h4>
        <div className="space-y-3">
            {isLoading && Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
            {data?.map(({ championName, reasoning }) => {
                const champion = Object.values(ddragonData.champions).find(c => c.name === championName);
                if (!champion) return null;
                return (
                    <div key={championName} className="flex items-start gap-3 p-3 bg-slate-200/50 dark:bg-black/20 rounded-md animate-fade-in">
                        <ChampionIcon champion={champion} version={ddragonData.version} className="w-16 h-16 flex-shrink-0" isClickable={false} />
                        <div>
                             <p className="font-bold text-lg text-slate-800 dark:text-slate-200">{championName}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{reasoning}</p>
                        </div>
                    </div>
                )
            })}
        </div>
    </div>
);

const SkeletonCard = () => (
    <div className="flex items-start gap-3 p-3 bg-slate-200/50 dark:bg-black/20 rounded-md animate-pulse">
        <div className="w-16 h-16 bg-slate-300 dark:bg-slate-700 rounded-md flex-shrink-0"></div>
        <div className="flex-grow pt-1">
            <div className="h-5 bg-slate-300 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-slate-300 dark:bg-slate-700 rounded w-full"></div>
            <div className="h-3 bg-slate-300 dark:bg-slate-700 rounded w-5/6 mt-1"></div>
        </div>
    </div>
);
// #endregion

export default OraclesArmory;