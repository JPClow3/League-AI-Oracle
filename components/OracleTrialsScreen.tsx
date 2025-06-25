
import React, { useState, useEffect, useCallback } from 'react';
import {
  OracleTrialsScreenProps,
  DailyPuzzle,
  ChampionSlot,
  DDragonChampionInfo,
  Team,
  ChampionStaticInfo,
  ItemPuzzleOption,
  ChallengeOption,
  PuzzleType
} from '../types';
import {
  getCurrentDailyPuzzle,
  isPuzzleCompletedToday,
  markPuzzleAsCompleted,
  validatePuzzlePick,
} from '../services/puzzleService';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorDisplay } from './ErrorDisplay';
import { ChampionGridModal } from './ChampionGridModal';
import { TeamDisplay } from './TeamDisplay';
import { formatMarkdownString } from '../utils/textFormatting';
import { ArrowUturnLeftIcon, PuzzlePieceIcon, AISparkleIcon, ConfirmIcon, SwordIcon, BrokenShieldIcon, BanIcon } from './icons/index';
import { LOL_ROLES } from '../constants';
import { getChampionStaticInfoById as getStaticInfoUtil } from '../gameData';
import { getItemImageURL } from '../services/ddragonService';


const TrialsSkeletonLoader: React.FC = () => (
  <div className="w-full max-w-5xl mx-auto p-2 sm:p-4">
    <div className="flex justify-between items-center mb-4 sm:mb-6">
      <div className="h-10 bg-slate-700 rounded-md w-3/4 animate-pulse"></div>
      <div className="h-10 bg-slate-700 rounded-md w-1/4 ml-4 animate-pulse"></div>
    </div>
    <div className="lol-panel p-4 sm:p-6 mb-6 animate-pulse">
      <div className="h-6 bg-slate-700 rounded w-1/3 mb-3"></div>
      <div className="space-y-2">
        <div className="h-4 bg-slate-700 rounded w-full"></div>
        <div className="h-4 bg-slate-700 rounded w-5/6"></div>
        <div className="h-4 bg-slate-700 rounded w-3/4"></div>
      </div>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
      <div className="lol-panel p-3 sm:p-4 h-60 animate-pulse"></div>
      <div className="lol-panel p-3 sm:p-4 h-60 animate-pulse"></div>
    </div>
    <div className="text-center mt-6">
      <div className="h-12 w-48 bg-slate-700 rounded-lg mx-auto animate-pulse"></div>
    </div>
  </div>
);


export const OracleTrialsScreen: React.FC<OracleTrialsScreenProps> = ({
  onGoHome,
  ddragonVersion,
  allChampionsData,
  allItemsData,
  staticChampionData,
}) => {
  const [currentPuzzle, setCurrentPuzzle] = useState<DailyPuzzle | null>(null);
  const [isLoadingPuzzle, setIsLoadingPuzzle] = useState<boolean>(true);
  const [userSelection, setUserSelection] = useState<DDragonChampionInfo | ItemPuzzleOption | string | null>(null); // string for MCQ letter or weakLink champ name
  const [validationResult, setValidationResult] = useState<{ ratingText: string; explanationText: string; isCorrectStage1?: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isChampionGridOpen, setIsChampionGridOpen] = useState<boolean>(false);
  const [currentWeakLinkStage, setCurrentWeakLinkStage] = useState<'identify' | 'explain' | null>(null);
  
  const getChampionStaticInfoById = useCallback((id: string) => {
    return getStaticInfoUtil(id);
  }, []);

  useEffect(() => {
    setIsLoadingPuzzle(true);
    const puzzle = getCurrentDailyPuzzle();
    if (puzzle) {
      setCurrentPuzzle(puzzle);
      setIsCompleted(isPuzzleCompletedToday(puzzle.id));
      if (puzzle.puzzleType === 'weakLinkAnalysis' && !isPuzzleCompletedToday(puzzle.id)) {
        setCurrentWeakLinkStage('identify');
      } else {
        setCurrentWeakLinkStage(null);
      }
    } else {
      setError("No puzzles are available at this moment.");
    }
    setIsLoadingPuzzle(false);
  }, []);

  const processPuzzleCompletion = (puzzleId: string) => {
    markPuzzleAsCompleted(puzzleId);
    setIsCompleted(true); 
  };

  const handleChampionPickSelect = (champion: DDragonChampionInfo) => {
    if (!currentPuzzle || isCompleted) return;
    setUserSelection(champion);
    const result = validatePuzzlePick(currentPuzzle, champion.name);
    setValidationResult(result);
    processPuzzleCompletion(currentPuzzle.id);
    setIsChampionGridOpen(false);
  };
  
  const handleItemSelect = (itemOption: ItemPuzzleOption) => {
    if (!currentPuzzle || isCompleted) return;
    setUserSelection(itemOption);
    const result = validatePuzzlePick(currentPuzzle, itemOption.itemName);
    setValidationResult(result);
    processPuzzleCompletion(currentPuzzle.id);
  };

  const handleWeakLinkChampionIdentify = (championSlot: ChampionSlot) => {
    if (!currentPuzzle || currentPuzzle.puzzleType !== 'weakLinkAnalysis' || currentWeakLinkStage !== 'identify' || isCompleted) return;
    
    const championInfo = allChampionsData.find(c => c.id === championSlot.ddragonKey || c.name === championSlot.champion);
    setUserSelection(championInfo || championSlot.champion); // Store DDragonInfo if found, else name

    const result = validatePuzzlePick(currentPuzzle, championSlot.champion, 'identify');
    setValidationResult(result);

    if (result.isCorrectStage1) {
      setCurrentWeakLinkStage('explain');
      // Don't mark as fully completed yet
    } else {
      processPuzzleCompletion(currentPuzzle.id); // Incorrect identification completes the attempt
    }
  };

  const handleWeakLinkExplanationSelect = (optionLetter: string) => {
    if (!currentPuzzle || currentPuzzle.puzzleType !== 'weakLinkAnalysis' || currentWeakLinkStage !== 'explain' || isCompleted) return;
    setUserSelection(optionLetter);
    const result = validatePuzzlePick(currentPuzzle, optionLetter, 'explain');
    setValidationResult(result);
    processPuzzleCompletion(currentPuzzle.id);
  };

  const openGridForPuzzle = () => {
    if (currentPuzzle && (currentPuzzle.puzzleType === 'championPick' || currentPuzzle.puzzleType === 'crucialBan') && !isCompleted) {
      setIsChampionGridOpen(true);
    }
  };


  if (isLoadingPuzzle) {
    return <TrialsSkeletonLoader />;
  }
  if (error) {
    return <div className="flex-grow flex flex-col items-center justify-center p-4"><ErrorDisplay errorMessage={error} onClear={onGoHome} /><button onClick={onGoHome} className="lol-button lol-button-secondary mt-4">Return Home</button></div>;
  }
  if (!currentPuzzle) {
     return <div className="flex-grow flex flex-col items-center justify-center p-4 text-center"><PuzzlePieceIcon className="w-16 h-16 text-sky-500 mb-4" /><p className="text-xl text-slate-300 mb-2 font-['Playfair_Display']">No Puzzles Available</p><p className="text-slate-400 mb-6 font-['Inter'] leading-relaxed">Please check back later for new challenges.</p><button onClick={onGoHome} className="lol-button lol-button-secondary">Return Home</button></div>;
  }

  const getDisabledIdsForGrid = (): string[] => {
    if (!currentPuzzle) return [];
    return [
      ...currentPuzzle.yourTeamInitialPicks.map(p => p.ddragonKey || p.champion),
      ...currentPuzzle.enemyTeamInitialPicks.map(p => p.ddragonKey || p.champion),
      ...currentPuzzle.yourTeamInitialBans,
      ...currentPuzzle.enemyTeamInitialBans,
    ].filter(Boolean);
  };
  
  const getButtonText = () => {
    if (isCompleted || validationResult) return "Puzzle Attempted";
    if (!currentPuzzle) return "Make Your Choice"; // Should not happen if currentPuzzle is checked before call

    switch(currentPuzzle.puzzleType) {
      case 'championPick': return `Choose ${currentPuzzle.choiceContextLabel || 'Champion'}`;
      case 'itemPick': return `Select ${currentPuzzle.choiceContextLabel || 'Item'}`;
      case 'crucialBan': return `Select ${currentPuzzle.choiceContextLabel || 'Ban'}`;
      case 'weakLinkAnalysis':
        const championDisplayNameForExplain = userSelection
          ? (typeof userSelection === 'string'
            ? userSelection
            : (userSelection as DDragonChampionInfo).name) // If not string, it's DDragonChampionInfo in this context
          : 'Selected Champion'; // Fallback if userSelection is null
        return currentWeakLinkStage === 'identify' ? "Identify Weak Link" : `Explain Flaw for ${championDisplayNameForExplain}`;
      default: return "Make Your Choice";
    }
  };

  const renderPuzzleInteractionArea = () => {
    if (isCompleted || validationResult) return null;
    if (!currentPuzzle) return null;


    switch (currentPuzzle.puzzleType) {
      case 'itemPick':
        return (
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {currentPuzzle.itemChoiceOptions?.map(opt => {
              const itemInfo = allItemsData?.data[opt.itemId];
              return (
                <button key={opt.itemId} onClick={() => handleItemSelect(opt)} className="lol-panel p-3 rounded-xl flex flex-col items-center hover:bg-slate-700/70 transition-colors champion-card">
                  {itemInfo && ddragonVersion && <img src={getItemImageURL(ddragonVersion, itemInfo.image.full)} alt={opt.itemName.replace(/\{\{|\}\}/g, '')} className="w-12 h-12 rounded-lg mb-1 border border-slate-600"/>}
                  <span className="text-xs text-center text-yellow-300 font-['Inter']">{opt.itemName.replace(/\{\{|\}\}/g, '')}</span>
                </button>
              );
            })}
          </div>
        );
      case 'weakLinkAnalysis':
        if (currentWeakLinkStage === 'explain' && currentPuzzle.weakLinkExplanationOptions) { 
           // Determine display name for the champion identified in the previous stage
           const identifiedChampionName = userSelection
             ? (typeof userSelection === 'string'
               ? userSelection
               : (userSelection as DDragonChampionInfo).name)
             : 'the selected champion';

           return (
            <div className="mt-6 space-y-3">
              <h3 className="text-md font-semibold text-sky-300 text-center mb-2 font-['Inter']">
                Why is <span className="text-yellow-400">{identifiedChampionName}</span> the weak link here?
              </h3>
              {currentPuzzle.weakLinkExplanationOptions.map(opt => (
                <button key={opt.letter} onClick={() => handleWeakLinkExplanationSelect(opt.letter)} className="w-full lol-button lol-button-secondary text-left px-4 py-3">
                  <span className="font-bold mr-2 text-sky-400 font-['Inter']">{opt.letter}.</span> <span className="font-['Inter']">{opt.text}</span>
                </button>
              ))}
            </div>
           );
        }
        // For 'identify' stage of weakLink, or other types that need a button to open grid:
        return (
          <div className="text-center mt-6">
            <button
              onClick={currentPuzzle.puzzleType === 'weakLinkAnalysis' ? undefined : openGridForPuzzle} // No grid for identify stage
              disabled={currentPuzzle.puzzleType === 'weakLinkAnalysis' && currentWeakLinkStage === 'identify'} // Disable button for identify
              className={`lol-button lol-button-primary px-8 py-3 text-lg ${currentPuzzle.puzzleType === 'weakLinkAnalysis' && currentWeakLinkStage === 'identify' ? 'opacity-50 cursor-default' : ''}`}
              aria-label={getButtonText()}
            >
              {getButtonText()}
            </button>
            {currentPuzzle.puzzleType === 'weakLinkAnalysis' && currentWeakLinkStage === 'identify' && 
              <p className="text-xs text-slate-400 mt-2 font-['Inter'] leading-relaxed">Click on a champion in "Your Team" panel above to identify the weak link.</p>
            }
          </div>
        );
      default: // 'championPick', 'crucialBan'
        return (
          <div className="text-center mt-6">
            <button onClick={openGridForPuzzle} className="lol-button lol-button-primary px-8 py-3 text-lg" aria-label={getButtonText()}>
              {getButtonText()}
            </button>
          </div>
        );
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-2 sm:p-4">
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <h2 className="text-3xl sm:text-4xl font-['Playfair_Display'] text-sky-300 flex items-center">
          <PuzzlePieceIcon className="w-7 h-7 sm:w-8 sm:h-8 mr-2 sm:mr-3 text-yellow-400" />
          Daily Puzzle: <span className="ml-2">{currentPuzzle.title}</span>
        </h2>
        <button onClick={onGoHome} className="lol-button lol-button-secondary text-sm px-3 py-1.5 sm:px-4 sm:py-2">
          <ArrowUturnLeftIcon className="w-4 h-4 mr-1.5" /> Home
        </button>
      </div>

      {isCompleted && !validationResult && (
        <div className="lol-panel p-6 sm:p-8 text-center animate-popIn">
          <ConfirmIcon className="w-12 h-12 text-green-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-green-300 mb-2 font-['Inter']">Puzzle Completed Today!</h3>
          <p className="text-slate-300 font-['Inter'] leading-relaxed">You have already solved this puzzle. Check back tomorrow for a new one.</p>
        </div>
      )}

      <div className="lol-panel p-4 sm:p-6 mb-6 animate-popIn">
        <h3 className="text-lg sm:text-xl font-semibold text-sky-200 mb-3 font-['Inter']">Scenario:</h3>
        <div className="prose prose-sm sm:prose-base prose-invert max-w-none text-slate-300 leading-relaxed">
          {formatMarkdownString(currentPuzzle.scenarioDescription)}
        </div>
      </div>
      
      <div className={`grid grid-cols-1 ${validationResult ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-4 sm:gap-6 mb-6`}>
        <div className="lol-panel p-3 sm:p-4 h-full animate-popIn" style={{animationDelay: '100ms'}}>
           <TeamDisplay
            title="Your Team"
            teamPicks={currentPuzzle.puzzleType === 'weakLinkAnalysis' && currentPuzzle.flawedTeamComposition ? currentPuzzle.flawedTeamComposition : currentPuzzle.yourTeamInitialPicks}
            teamBans={currentPuzzle.yourTeamInitialBans}
            icon={<SwordIcon />}
            ddragonVersion={ddragonVersion}
            allChampionsData={allChampionsData}
            mode="puzzle"
            activeRoleForPick={currentPuzzle.choiceContextLabel}
            roleSwapState={null}
            onInitiateRoleSwap={() => {}} onCompleteRoleSwap={() => {}} onCancelRoleSwap={() => {}}
            anyLoading={false}
            isPuzzleRoleActive={!isCompleted && !validationResult && (currentPuzzle.puzzleType === 'championPick' || (currentPuzzle.puzzleType === 'weakLinkAnalysis' && currentWeakLinkStage === 'identify'))}
            onPuzzleChampionSlotClick={currentPuzzle.puzzleType === 'weakLinkAnalysis' && currentWeakLinkStage === 'identify' ? handleWeakLinkChampionIdentify : undefined}
            getChampionStaticInfoById={getChampionStaticInfoById}
          />
        </div>
         <div className="lol-panel p-3 sm:p-4 h-full animate-popIn" style={{animationDelay: '200ms'}}>
          <TeamDisplay
            title="Enemy Team"
            teamPicks={currentPuzzle.enemyTeamInitialPicks}
            teamBans={currentPuzzle.enemyTeamInitialBans}
            icon={<BrokenShieldIcon />} // Use BrokenShieldIcon as a thematic enemy icon
            ddragonVersion={ddragonVersion}
            allChampionsData={allChampionsData}
            mode="puzzle"
            roleSwapState={null}
            onInitiateRoleSwap={() => {}} onCompleteRoleSwap={() => {}} onCancelRoleSwap={() => {}}
            anyLoading={false}
            getChampionStaticInfoById={getChampionStaticInfoById}
          />
        </div>

        {validationResult && (
          <div className="lg:col-span-1 lol-panel p-4 sm:p-6 animate-popIn h-full flex flex-col" style={{animationDelay: '300ms'}}>
            <h3 className="text-xl font-semibold text-yellow-300 mb-3 flex items-center font-['Inter']">
              <AISparkleIcon className="w-6 h-6 mr-2"/> Puzzle Feedback
            </h3>
            {userSelection && (
                <div className="mb-3 pb-3 border-b border-slate-700">
                    <p className="text-sm text-slate-400 font-['Inter']">Your choice for "{currentPuzzle.choiceContextLabel || (currentWeakLinkStage === 'explain' ? 'the explanation' : 'the puzzle')}":</p>
                    <p className="text-lg font-semibold text-sky-300 font-['Inter']">
                      {
                        userSelection === null 
                            ? 'Nothing selected' 
                            : typeof userSelection === 'string' 
                                ? userSelection 
                                : ('name' in userSelection ? (userSelection as DDragonChampionInfo).name : (userSelection as ItemPuzzleOption).itemName.replace(/\{\{|\}\}/g, ''))
                      }
                    </p>
                </div>
            )}
            <p className="text-md font-medium text-amber-300 mb-2 font-['Inter']">{validationResult.ratingText}</p>
            <div className="prose prose-sm prose-invert max-w-none text-slate-300 leading-relaxed flex-grow">
              {formatMarkdownString(validationResult.explanationText)}
            </div>
             <button onClick={onGoHome} className="lol-button lol-button-primary mt-auto w-full">Return Home</button>
          </div>
        )}
      </div>
      
      {renderPuzzleInteractionArea()}
      
      {ddragonVersion && allChampionsData.length > 0 && staticChampionData.length > 0 && (
         <ChampionGridModal
            isOpen={isChampionGridOpen && !isCompleted && (currentPuzzle.puzzleType === 'championPick' || currentPuzzle.puzzleType === 'crucialBan')}
            onClose={() => setIsChampionGridOpen(false)}
            champions={allChampionsData}
            ddragonVersion={ddragonVersion}
            onChampionSelect={handleChampionPickSelect}
            modalTitle={`Select ${currentPuzzle.choiceContextLabel || 'Champion'}`}
            championStaticData={staticChampionData}
            filterAvailableChampions={currentPuzzle.puzzleType === 'championPick' ? currentPuzzle.availableChampionChoices : currentPuzzle.banChoiceOptions}
            disabledChampionIds={getDisabledIdsForGrid()}
        />
      )}
    </div>
  );
};