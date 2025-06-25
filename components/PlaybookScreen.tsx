
import React, { useState, useEffect, useCallback } from 'react';
import { PlaybookEntry, PlaybookScreenProps, DDragonChampionInfo, ChampionSlot, DDragonItemsData } from '../types';
import { ClearIcon, StrategyTomeIcon, ArrowUturnLeftIcon, FlaskConicalIcon } from './icons/index';
import { LoadingSpinner } from './LoadingSpinner';
import { ReviewPlaybookEntryModal } from './ReviewPlaybookEntryModal';
import { getChampionImageURL } from '../services/ddragonService';
import { PLAYBOOK_STORAGE_KEY } from '../constants';

export const PlaybookScreen: React.FC<PlaybookScreenProps> = ({ 
    onGoHome, 
    ddragonVersion, 
    allChampionsData,
    allItemsData, // Added prop
    onLoadPlaybookEntryToLab
}) => {
  const [playbookEntries, setPlaybookEntries] = useState<PlaybookEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedEntryForReview, setSelectedEntryForReview] = useState<PlaybookEntry | null>(null);

  const loadPlaybook = useCallback(() => {
    setIsLoading(true);
    try {
      const storedEntries = localStorage.getItem(PLAYBOOK_STORAGE_KEY);
      if (storedEntries) {
        setPlaybookEntries(JSON.parse(storedEntries));
      } else {
        setPlaybookEntries([]);
      }
    } catch (error) {
      console.error("Error loading playbook:", error);
      setPlaybookEntries([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlaybook();
  }, [loadPlaybook]);

  const handleDeleteEntry = (entryId: string) => {
    if (window.confirm("Are you sure you want to delete this strategy from your playbook?")) {
      const updatedEntries = playbookEntries.filter(entry => entry.id !== entryId);
      localStorage.setItem(PLAYBOOK_STORAGE_KEY, JSON.stringify(updatedEntries));
      setPlaybookEntries(updatedEntries);
    }
  };

  const handleReviewEntry = (entry: PlaybookEntry) => {
    setSelectedEntryForReview(entry);
  };
  
  const getChampionDDragonInfo = (identifier: string): DDragonChampionInfo | undefined => {
    if (!allChampionsData || !identifier) return undefined;
    const lowerIdentifier = identifier.toLowerCase().trim();
    return allChampionsData.find(c => c.id.toLowerCase() === lowerIdentifier) || 
           allChampionsData.find(c => c.name.toLowerCase() === lowerIdentifier);
  };

  const renderTeamPicksSummary = (picks: ChampionSlot[]) => {
    if (!picks || picks.length === 0) return <span className="italic text-slate-500 text-xs font-['Inter']">No champions selected</span>;
    const displayPicks = picks.slice(0, 5); 

    return (
      <div className="flex flex-wrap gap-1 items-center">
        {displayPicks.map((pick, index) => {
          const champInfo = getChampionDDragonInfo(pick.ddragonKey || pick.champion);
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
        <p className="mt-3 text-slate-400 font-['Inter']">Loading Playbook...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6">
      <div className="flex justify-between items-center mb-6 sm:mb-8">
        <h2 className="text-3xl sm:text-4xl font-['Playfair_Display'] text-sky-300 flex items-center">
          <StrategyTomeIcon className="w-8 h-8 mr-3" />
          My Playbook
        </h2>
        <button
          onClick={onGoHome}
          className="lol-button lol-button-secondary text-sm px-4 py-2 flex items-center"
        >
          <ArrowUturnLeftIcon className="w-4 h-4 mr-1.5" />
          Return Home
        </button>
      </div>

      {playbookEntries.length === 0 ? (
        <div className="text-center py-12 lol-panel animate-popIn">
          <p className="text-xl text-slate-400 font-['Inter']">Your Playbook is empty.</p>
          <p className="text-sm text-slate-500 mt-2 font-['Inter'] leading-relaxed">Save strategies from the Drafting Screen or Draft Lab to build your collection.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {playbookEntries.map((entry, idx) => (
            <div 
              key={entry.id} 
              className="lol-panel p-4 flex flex-col justify-between animate-popIn"
              style={{ animationDelay: `${idx * 75}ms` }}
            >
              <div>
                <h3 className="text-lg font-semibold text-sky-300 mb-2 truncate font-['Inter'] leading-tight" title={entry.name}>
                  {entry.name}
                </h3>
                <p className="text-xs text-slate-500 mb-3 font-['Inter']">
                  Saved: {new Date(entry.timestamp).toLocaleDateString()}
                </p>
                <div className="mb-3">
                  <p className="text-xs text-slate-400 font-medium mb-1 font-['Inter']">Your Team Picks:</p>
                  {renderTeamPicksSummary(entry.yourTeamPicks)}
                </div>
              </div>
              <div className="mt-auto pt-3 border-t border-slate-700/50 space-y-2">
                <button
                    onClick={() => onLoadPlaybookEntryToLab(entry)}
                    className="w-full lol-button lol-button-secondary text-xs py-1.5 px-3 flex items-center justify-center"
                    aria-label={`Load ${entry.name} into Draft Lab`}
                >
                    <FlaskConicalIcon className="w-4 h-4 mr-1.5" /> Load in Draft Lab
                </button>
                <div className="flex space-x-2">
                    <button
                        onClick={() => handleReviewEntry(entry)}
                        className="w-full lol-button lol-button-secondary text-xs py-1.5 px-3 flex items-center justify-center"
                        aria-label={`Review Strategy: ${entry.name}`}
                    >
                        <StrategyTomeIcon className="w-4 h-4 mr-1.5"/> Review Strategy
                    </button>
                    <button
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="w-auto lol-button bg-red-700/50 hover:bg-red-600/70 border-red-600/50 text-red-300 hover:text-red-200 text-xs p-2"
                        aria-label={`Delete Strategy: ${entry.name}`}
                    >
                        <ClearIcon className="w-4 h-4" />
                    </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <ReviewPlaybookEntryModal
        isOpen={!!selectedEntryForReview}
        onClose={() => setSelectedEntryForReview(null)}
        playbookEntry={selectedEntryForReview}
        ddragonVersion={ddragonVersion}
        allChampionsData={allChampionsData}
        allItemsData={allItemsData}
      />
    </div>
  );
};