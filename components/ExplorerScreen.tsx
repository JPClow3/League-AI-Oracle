
import React, { useState, useCallback, useMemo } from 'react';
import { 
    DDragonChampionInfo, 
    DraftAnalysis, 
    ExplorerScreenProps,
    ChampionStaticInfo, 
    OraclePersonality,
    DDragonItemsData
} from '../types';
import { getChampionImageURL } from '../services/ddragonService';
import { getExplorerAnalysis } from '../services/geminiService';
import { RecommendationDisplay } from './RecommendationDisplay';
import { ChampionGridModal } from './ChampionGridModal';
import { LoadingSpinner } from './LoadingSpinner';
import { ArrowUturnLeftIcon, AISparkleIcon, ClearIcon, DocumentMagnifyingGlassIcon } from './icons/index'; 
import { ErrorDisplay } from './ErrorDisplay';

export const ExplorerScreen: React.FC<ExplorerScreenProps> = ({ 
    onGoHome, 
    ddragonVersion, 
    allChampionsData,
    allItemsData, 
    staticChampionData,
    oraclePersonality
}) => {
  const [selectedChampions, setSelectedChampions] = useState<(DDragonChampionInfo | null)[]>([null, null]);
  const [query, setQuery] = useState<string>('');
  const [analysis, setAnalysis] = useState<DraftAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isChampionGridOpen, setIsChampionGridOpen] = useState<boolean>(false);
  const [championSelectIndex, setChampionSelectIndex] = useState<number | null>(null);

  const handleOpenChampionGrid = (index: number) => {
    setChampionSelectIndex(index);
    setIsChampionGridOpen(true);
  };

  const handleChampionSelectFromGrid = (champion: DDragonChampionInfo) => {
    if (championSelectIndex !== null) {
      const newSelectedChampions = [...selectedChampions];
      const otherIndex = championSelectIndex === 0 ? 1 : 0;
      // Prevent selecting the same champion in both slots
      if (newSelectedChampions[otherIndex]?.id === champion.id) {
          console.warn("Champion already selected in the other slot.");
          // Optionally, show a user-facing error/message here
          setIsChampionGridOpen(false);
          return;
      }
      newSelectedChampions[championSelectIndex] = champion;
      setSelectedChampions(newSelectedChampions);
    }
    setIsChampionGridOpen(false);
  };

  const handleClearChampion = (index: number) => {
    const newSelectedChampions = [...selectedChampions];
    newSelectedChampions[index] = null;
    setSelectedChampions(newSelectedChampions);
    setAnalysis(null); // Clear analysis if champion selection changes
    setError(null);
  };

  const handleGetAnalysis = useCallback(async () => {
    if (selectedChampions.every(c => c === null) && !query.trim()) {
      setError("Please select at least one champion or enter a query.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    try {
      const championNames = selectedChampions.map(c => c?.name).filter(Boolean) as string[];
      const result = await getExplorerAnalysis(query, oraclePersonality, championNames[0], championNames[1]);
      setAnalysis(result);
    } catch (err) {
      console.error("Error fetching explorer analysis:", err);
      setError(err instanceof Error ? err.message : "An error occurred during analysis.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedChampions, query, oraclePersonality]);

  const disabledChampionIdsForGrid = useMemo(() => {
    if (championSelectIndex === null) return [];
    const otherIndex = championSelectIndex === 0 ? 1 : 0;
    return selectedChampions[otherIndex] ? [selectedChampions[otherIndex]!.id] : [];
  }, [selectedChampions, championSelectIndex]);

  const renderChampionSlot = (index: number) => {
    const champion = selectedChampions[index];
    return (
      <div className="lol-panel bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
        <label className="block text-xs font-medium text-slate-400 mb-1.5">Champion {index + 1} (Optional)</label>
        {champion ? (
          <div className="flex items-center space-x-2">
            <img 
              src={getChampionImageURL(ddragonVersion, champion.id)} 
              alt={champion.name} 
              className="w-10 h-10 rounded-lg border border-slate-600"
            />
            <span className="text-slate-200 font-medium text-sm flex-grow truncate">{champion.name}</span>
            <button 
              onClick={() => handleOpenChampionGrid(index)} 
              className="lol-button lol-button-secondary text-[10px] px-2 py-1"
              aria-label={`Change Champion ${index + 1}`}
            >
              Chg
            </button>
            <button 
              onClick={() => handleClearChampion(index)} 
              className="text-red-500 hover:text-red-400 p-1" 
              title={`Clear Champion ${index + 1}`}
              aria-label={`Clear Champion ${index + 1}`}
            >
              <ClearIcon className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button 
            onClick={() => handleOpenChampionGrid(index)} 
            className="w-full lol-button lol-button-secondary py-2 text-sm"
            aria-label={`Select Champion ${index + 1}`}
          >
            Select Champion {index + 1}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col p-2 sm:p-4">
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <h2 className="text-3xl sm:text-4xl font-['Playfair_Display'] text-sky-300 flex items-center">
          <DocumentMagnifyingGlassIcon className="w-7 h-7 sm:w-8 sm:h-8 mr-2 sm:mr-3 text-sky-400" />
          Strategy Explorer
        </h2>
        <button onClick={onGoHome} className="lol-button lol-button-secondary text-sm px-3 py-1.5 sm:px-4 sm:py-2">
          <ArrowUturnLeftIcon className="w-4 h-4 mr-1.5" /> Home
        </button>
      </div>

      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {renderChampionSlot(0)}
          {renderChampionSlot(1)}
        </div>
        <div>
          <label htmlFor="explorerQueryInput" className="block text-sm font-medium text-slate-300 mb-1.5">
            Your Question / Focus Area:
          </label>
          <textarea
            id="explorerQueryInput"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., How do these champions synergize? What are common counters? Best items for X against Y?"
            className="w-full lol-input h-24 resize-y text-sm"
            rows={3}
            aria-label="Enter your strategic question"
          />
        </div>
        <button 
          onClick={handleGetAnalysis} 
          disabled={isLoading} 
          className="w-full lol-button lol-button-primary py-2.5 text-base flex items-center justify-center"
        >
          <AISparkleIcon className="w-5 h-5 mr-2" /> {isLoading ? 'Consulting Oracle...' : 'Ask the Oracle'}
        </button>
      </div>

      {isLoading && <div className="text-center py-6"><LoadingSpinner /></div>}
      {error && <ErrorDisplay errorMessage={error} onClear={() => setError(null)} title="Oracle Consultation Error" />}
      
      {analysis && !isLoading && (
        <div className="mt-4 animate-fadeInUp flex-grow overflow-y-auto">
          <RecommendationDisplay 
            analysis={analysis} 
            title="Oracle's Insight" 
            ddragonVersion={ddragonVersion} 
            allChampionsData={allChampionsData}
            allItemsData={allItemsData}
          />
        </div>
      )}

      {ddragonVersion && (
        <ChampionGridModal
          isOpen={isChampionGridOpen}
          onClose={() => setIsChampionGridOpen(false)}
          champions={allChampionsData}
          ddragonVersion={ddragonVersion}
          onChampionSelect={handleChampionSelectFromGrid}
          modalTitle={`Select Champion ${championSelectIndex !== null ? championSelectIndex + 1 : ''}`}
          championStaticData={staticChampionData as ChampionStaticInfo[]}
          disabledChampionIds={disabledChampionIdsForGrid}
          explorerMode={true}
          explorerSelectedChampionIds={selectedChampions.map(c => c?.id).filter(Boolean) as string[]}
        />
      )}
    </div>
  );
};
