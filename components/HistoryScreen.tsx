
import React, { useState, useEffect, useCallback } from 'react';
import { ArchivedDraft, HistoryScreenProps, DDragonChampionInfo, ChampionSlot, DDragonItemsData } from '../types';
import { ClearIcon, StrategyTomeIcon, ArrowUturnLeftIcon, OracleEyeIcon } from './icons/index';
import { LoadingSpinner } from './LoadingSpinner';
import { ReviewDraftModal } from './ReviewDraftModal';
import { getChampionImageURL } from '../services/ddragonService';

const DRAFT_HISTORY_STORAGE_KEY = 'lolDraftOracleHistory_v1';

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ 
    onGoHome, 
    ddragonVersion, 
    allChampionsData, 
    allItemsData 
}) => {
  const [archivedDrafts, setArchivedDrafts] = useState<ArchivedDraft[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedDraftForReview, setSelectedDraftForReview] = useState<ArchivedDraft | null>(null);

  const loadDrafts = useCallback(() => {
    setIsLoading(true);
    try {
      const storedDrafts = localStorage.getItem(DRAFT_HISTORY_STORAGE_KEY);
      if (storedDrafts) {
        setArchivedDrafts(JSON.parse(storedDrafts));
      } else {
        setArchivedDrafts([]);
      }
    } catch (error) {
      console.error("Error loading draft history:", error);
      setArchivedDrafts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDrafts();
  }, [loadDrafts]);

  const handleDeleteDraft = (draftId: string) => {
    if (window.confirm("Are you sure you want to delete this draft from history?")) {
      const updatedDrafts = archivedDrafts.filter(draft => draft.id !== draftId);
      localStorage.setItem(DRAFT_HISTORY_STORAGE_KEY, JSON.stringify(updatedDrafts));
      setArchivedDrafts(updatedDrafts);
    }
  };

  const handleReviewDraft = (draft: ArchivedDraft) => {
    setSelectedDraftForReview(draft);
  };
  
  const getChampionByKeyOrName = (identifier: string): DDragonChampionInfo | undefined => {
    if (!allChampionsData || !identifier) return undefined;
    const lowerIdentifier = identifier.toLowerCase();
    return allChampionsData.find(c => c.id.toLowerCase() === lowerIdentifier) || 
           allChampionsData.find(c => c.name.toLowerCase() === lowerIdentifier);
  };

  const renderTeamPicksSummary = (picks: ChampionSlot[]) => {
    if (!picks || picks.length === 0) return <span className="italic text-slate-500 font-['Inter']">No champions picked</span>;
    return (
      <div className="flex flex-wrap gap-1.5 items-center">
        {picks.map((pick, index) => {
          const champInfo = getChampionByKeyOrName(pick.ddragonKey || pick.champion);
          return champInfo && ddragonVersion ? (
            <img 
              key={`${pick.champion}-${index}`}
              src={getChampionImageURL(ddragonVersion, champInfo.id)}
              alt={pick.champion}
              title={`${pick.champion} (${pick.role})`}
              className="w-7 h-7 rounded-lg border border-slate-600"
            />
          ) : (
            <span key={`${pick.champion}-${index}`} className="text-xs px-1.5 py-0.5 bg-slate-700 rounded-lg font-['Inter']" title={`${pick.champion} (${pick.role})`}>
              {pick.champion.substring(0,3)}
            </span>
          );
        })}
      </div>
    );
  };


  if (isLoading) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center p-4">
        <LoadingSpinner />
        <p className="mt-3 text-slate-400 font-['Inter']">Loading Draft History...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl sm:text-4xl font-['Playfair_Display'] text-sky-400 flex items-center">
          <StrategyTomeIcon className="w-8 h-8 mr-3" />
          Draft History
        </h2>
        <button
          onClick={onGoHome}
          className="lol-button lol-button-secondary text-sm px-4 py-2 flex items-center"
        >
          <ArrowUturnLeftIcon className="w-4 h-4 mr-1.5" />
          Return Home
        </button>
      </div>

      {archivedDrafts.length === 0 ? (
        <div className="text-center py-10 lol-panel animate-popIn">
          <p className="text-xl text-slate-400 font-['Inter']">No past drafts recorded.</p>
          <p className="text-sm text-slate-500 mt-2 font-['Inter'] leading-relaxed">Complete a draft and save it to history to see it here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {archivedDrafts.map((draft, idx) => (
            <div 
              key={draft.id} 
              className="lol-panel p-4 sm:p-5 animate-popIn"
              style={{ animationDelay: `${idx * 75}ms` }}
            >
              <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-3">
                <h3 className="text-lg font-semibold text-sky-300 mb-2 sm:mb-0 font-['Inter']">
                  Draft from: {new Date(draft.timestamp).toLocaleString()}
                </h3>
                <div className="flex space-x-2 flex-shrink-0">
                  <button
                    onClick={() => handleReviewDraft(draft)}
                    className="lol-button lol-button-primary text-xs px-3 py-1.5 flex items-center"
                    aria-label={`Review draft from ${new Date(draft.timestamp).toLocaleString()}`}
                  >
                    <OracleEyeIcon className="w-4 h-4 mr-1"/> Review Draft
                  </button>
                  <button
                    onClick={() => handleDeleteDraft(draft.id)}
                    className="lol-button bg-red-600 hover:bg-red-700 border-red-700 text-white text-xs px-3 py-1.5 flex items-center"
                    aria-label={`Delete draft from ${new Date(draft.timestamp).toLocaleString()}`}
                  >
                    <ClearIcon className="w-4 h-4 mr-1" /> Delete
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-slate-400 font-medium mb-1 font-['Inter']">Your Team Picks:</p>
                  {renderTeamPicksSummary(draft.yourTeamPicks)}
                </div>
                <div>
                  <p className="text-slate-400 font-medium mb-1 font-['Inter']">Enemy Team Picks:</p>
                  {renderTeamPicksSummary(draft.enemyTeamPicks)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <ReviewDraftModal
        isOpen={!!selectedDraftForReview}
        onClose={() => setSelectedDraftForReview(null)}
        archivedDraft={selectedDraftForReview}
        ddragonVersion={ddragonVersion}
        allChampionsData={allChampionsData}
        allItemsData={allItemsData}
      />
    </div>
  );
};