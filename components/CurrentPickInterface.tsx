
import React, { useState, useEffect } from 'react';
import { PickSuggestion, IndividualPickSuggestion, DDragonChampionInfo } from '../types';
import { AISparkleIcon, SourceLinkIcon, GridIcon } from './icons/index';
import { LoadingSpinner } from './LoadingSpinner';

interface CurrentPickInterfaceProps {
  currentRole: string;
  isYourTeamTurn: boolean;
  onSuggestPick: () => Promise<void>;
  isSuggestingPick: boolean;
  pickSuggestions: PickSuggestion | null;
  isDisabled?: boolean;
  onOpenChampionGrid: () => void; 
  onSelectSuggestedChampion: (championName: string) => void; 
}

const CurrentPickInterfaceComponent: React.FC<CurrentPickInterfaceProps> = ({
  currentRole,
  isYourTeamTurn,
  onSuggestPick,
  isSuggestingPick,
  pickSuggestions,
  isDisabled,
  onOpenChampionGrid,
  onSelectSuggestedChampion,
}) => {
  
  const handleSuggest = async () => {
    await onSuggestPick();
  };
  
  const handleUseSuggestion = (championName: string) => {
    onSelectSuggestedChampion(championName);
  };

  const renderSource = (sourceUri: string, sourceTitle?: string ): React.ReactNode => {
    if (!sourceUri) return null;
    return (
        <a
          href={sourceUri}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center text-xs text-sky-500 hover:text-sky-400 hover:underline transition-colors"
          title={sourceTitle || sourceUri}
        >
          <SourceLinkIcon className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" /> {/* Increased icon size */}
          <span className="truncate">{sourceTitle || sourceUri}</span>
        </a>
    );
  };


  return (
    <div className="space-y-4 w-full animate-fadeIn">
      <button
        onClick={onOpenChampionGrid}
        className="w-full lol-button lol-button-primary py-3.5 text-lg flex items-center justify-center" /* Increased padding and text size */
        disabled={isSuggestingPick || isDisabled}
        aria-label={`Select ${currentRole} champion from grid`}
      >
        <GridIcon className="w-6 h-6 mr-2.5" /> {/* Increased icon size */}
        Select {currentRole} Pick
      </button>

      <div className="flex flex-col sm:flex-row gap-3.5"> {/* Increased gap */}
        {isYourTeamTurn && (
          <button
            onClick={handleSuggest}
            disabled={isSuggestingPick || isDisabled}
            className="w-full sm:flex-1 flex items-center justify-center lol-button bg-yellow-500 hover:bg-yellow-600 text-slate-900 border-yellow-600 text-lg py-3" /* Increased text size and padding */
            aria-label={`Suggest pick for ${currentRole}`}
          >
            <AISparkleIcon className="w-6 h-6 mr-2.5" />  {/* Increased icon size */}
            {isSuggestingPick ? 'Suggesting...' : `Suggest ${currentRole} Pick`}
          </button>
        )}
      </div>

      {isSuggestingPick && <div className="animate-fadeIn text-center"><LoadingSpinner /><p className="text-base text-slate-400">Suggesting Pick...</p></div>} {/* Increased font size */}
      
      {pickSuggestions && pickSuggestions.suggestions.length > 0 && !isSuggestingPick && (
        <div className="mt-5 space-y-3.5 p-4 bg-slate-800 bg-opacity-70 rounded-xl shadow-inner border border-slate-700 animate-popIn"> {/* Increased mt, spacing, padding */}
          <h4 className="text-lg font-semibold text-sky-300 mb-2.5 flex items-center"> {/* Increased font size and mb */}
            <AISparkleIcon className="w-6 h-6 mr-2.5 text-yellow-400" />  {/* Increased icon size */}
            Oracle's Suggestions for {currentRole}:
          </h4>
          {pickSuggestions.explanation && (
            <p className="text-base text-slate-300 mb-3.5 italic p-2.5 bg-slate-700 bg-opacity-50 rounded-xl">{pickSuggestions.explanation}</p> {/* Increased font size, mb, padding */}
          )}
          <ul className="space-y-3"> {/* Increased spacing */}
            {pickSuggestions.suggestions.map((suggestion, index) => (
              <li key={index} className="p-3 bg-slate-700 hover:bg-slate-600 rounded-xl transition-colors duration-150 group champion-card"> {/* Increased padding */}
                <div className="flex justify-between items-start">
                  <div>
                    <strong className="text-sky-400 text-base">{suggestion.champion}</strong> {/* Increased font size */}
                    <p className="text-sm text-slate-300 mt-1">{suggestion.reason}</p> {/* Increased font size and mt */}
                  </div>
                  <button
                    onClick={() => handleUseSuggestion(suggestion.champion)}
                    className="ml-2.5 px-3 py-1.5 text-sm lol-button lol-button-secondary opacity-80 group-hover:opacity-100 focus:opacity-100" /* Increased padding and font size */
                    aria-label={`Use suggestion for ${suggestion.champion}`}
                  >
                    Use
                  </button>
                </div>
              </li>
            ))}
          </ul>
           {pickSuggestions.sources && pickSuggestions.sources.length > 0 && (
            <div className="mt-3.5 pt-2.5 border-t border-slate-600"> {/* Increased mt and pt */}
              <h5 className="text-sm font-semibold text-slate-400 mb-1.5">Sources:</h5> {/* Increased font size and mb */}
              <ul className="list-none space-y-1 pl-0"> {/* Increased spacing */}
                {pickSuggestions.sources.map((s, idx) => (
                  <li key={`sugg-src-${idx}`}>{renderSource(s.web?.uri || s.retrievedContext?.uri || '', s.web?.title || s.retrievedContext?.title)}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const CurrentPickInterface = React.memo(CurrentPickInterfaceComponent);