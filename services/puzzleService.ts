import { DailyPuzzle, OracleTrialsLocalStorageState, DailyPuzzleIdealPick, PuzzleRatingKey, ChampionSlot } from '../types';
import { dailyPuzzles } from '../constants/dailyPuzzles'; 
import { ORACLE_TRIALS_STORAGE_KEY, ORACLE_TRIAL_RATINGS } from '../constants';

const getTodayISO = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0]; // YYYY-MM-DD
};

const getInitialStorageState = (): OracleTrialsLocalStorageState => ({
  lastShownPuzzleId: null,
  lastShownPuzzleDate: null,
  completedPuzzles: {},
});

const getStorageState = (): OracleTrialsLocalStorageState => {
  const stored = localStorage.getItem(ORACLE_TRIALS_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored) as OracleTrialsLocalStorageState;
    } catch (e) {
      console.error("Error parsing Oracle Trials storage state:", e);
    }
  }
  return getInitialStorageState();
};

const saveStorageState = (state: OracleTrialsLocalStorageState): void => {
  localStorage.setItem(ORACLE_TRIALS_STORAGE_KEY, JSON.stringify(state));
};

export const getCurrentDailyPuzzle = (): DailyPuzzle | null => {
  if (dailyPuzzles.length === 0) return null;

  const storage = getStorageState();
  const todayISO = getTodayISO();

  if (storage.lastShownPuzzleId && storage.lastShownPuzzleDate === todayISO) {
    const lastPuzzle = dailyPuzzles.find(p => p.id === storage.lastShownPuzzleId);
    if (lastPuzzle) return lastPuzzle;
  }

  let nextPuzzleIndex = 0;
  if (storage.lastShownPuzzleId) {
    const lastIndex = dailyPuzzles.findIndex(p => p.id === storage.lastShownPuzzleId);
    if (lastIndex !== -1) {
      nextPuzzleIndex = (lastIndex + 1) % dailyPuzzles.length;
    }
  }
  
  const nextPuzzle = dailyPuzzles[nextPuzzleIndex];
  
  storage.lastShownPuzzleId = nextPuzzle.id;
  storage.lastShownPuzzleDate = todayISO;
  saveStorageState(storage);
  
  return nextPuzzle;
};

export const isPuzzleCompletedToday = (puzzleId: string): boolean => {
  const storage = getStorageState();
  const todayISO = getTodayISO();
  return storage.completedPuzzles[puzzleId] === todayISO;
};

export const markPuzzleAsCompleted = (puzzleId: string): void => {
  const storage = getStorageState();
  const todayISO = getTodayISO();
  storage.completedPuzzles[puzzleId] = todayISO;
  saveStorageState(storage);
};

export const validatePuzzlePick = (
  puzzle: DailyPuzzle,
  userPickedChoiceName: string, // Can be champion name, item name, or MCQ letter
  currentStage?: 'identify' | 'explain' // For multi-stage puzzles like weakLinkAnalysis
): { ratingText: string; explanationText: string; isCorrectStage1?: boolean } => {
  
  let idealMatch: DailyPuzzleIdealPick | undefined;

  switch (puzzle.puzzleType) {
    case 'championPick':
    case 'itemPick':
    case 'crucialBan':
      idealMatch = puzzle.idealPicks.find(
        ip => ip.choiceName.toLowerCase() === userPickedChoiceName.toLowerCase()
      );
      break;
    case 'weakLinkAnalysis':
      if (currentStage === 'identify') {
        const isCorrectChampion = puzzle.weakLinkCorrectChampionName?.toLowerCase() === userPickedChoiceName.toLowerCase();
        idealMatch = puzzle.idealPicks.find(ip => ip.choiceName.toLowerCase() === userPickedChoiceName.toLowerCase());
        // For identify stage, we need specific feedback if they identified the *correct* weak link
        if (isCorrectChampion) {
          const correctPickData = puzzle.idealPicks.find(ip => ip.choiceName.toLowerCase() === puzzle.weakLinkCorrectChampionName?.toLowerCase());
          return {
            ratingText: ORACLE_TRIAL_RATINGS[correctPickData?.ratingKey || 'adept'] || "Insightful observation!",
            explanationText: correctPickData?.explanation || "You've pinpointed a key area. Now, let's analyze why.",
            isCorrectStage1: true, // Signal to UI to move to next stage
          };
        } else {
          // User picked the wrong champion as weak link
          return {
            ratingText: ORACLE_TRIAL_RATINGS[puzzle.defaultPlausibleRatingKey || 'consider'] || "Not quite the critical flaw.",
            explanationText: puzzle.defaultPlausibleExplanation || `While that champion might present challenges, the Oracle believes the primary vulnerability in the composition "${puzzle.title}" lies elsewhere. Consider the team's overall synergy and objectives.`,
            isCorrectStage1: false,
          };
        }
      } else if (currentStage === 'explain') {
        // User picked an explanation letter
        idealMatch = puzzle.idealPicks.find(
          ip => ip.choiceName.toUpperCase() === userPickedChoiceName.toUpperCase() && 
                ip.choiceName === puzzle.weakLinkCorrectExplanationLetter?.toUpperCase()
        );
        // If no exact match for the correct explanation letter in idealPicks, try to find if the chosen letter itself is correct.
        if (!idealMatch && userPickedChoiceName.toUpperCase() === puzzle.weakLinkCorrectExplanationLetter?.toUpperCase()) {
            // This case implies the idealPicks might not be set up for the explanation stage, or we want a generic success for correct letter
            const correctExplanationPick = puzzle.idealPicks.find(ip => ip.choiceName === puzzle.weakLinkCorrectExplanationLetter);
             return {
                ratingText: ORACLE_TRIAL_RATINGS[correctExplanationPick?.ratingKey || 'oracle'] || "Excellent reasoning!",
                explanationText: correctExplanationPick?.explanation || "Your analysis of the strategic flaw is spot on.",
             };
        }
      }
      break;
    default:
      // Should not happen with defined puzzle types
      return {
        ratingText: ORACLE_TRIAL_RATINGS['consider'],
        explanationText: "The Oracle is unsure how to judge this type of choice."
      };
  }

  if (idealMatch) {
    return {
      ratingText: ORACLE_TRIAL_RATINGS[idealMatch.ratingKey] || "A wise choice!",
      explanationText: idealMatch.explanation,
    };
  }

  // Default fallback for plausible but not ideal answers for single-stage puzzles
  const defaultRatingKey = puzzle.defaultPlausibleRatingKey || 'consider';
  return {
    ratingText: ORACLE_TRIAL_RATINGS[defaultRatingKey] || "An interesting approach.",
    explanationText: puzzle.defaultPlausibleExplanation || "The Oracle suggests exploring other paths for optimal results in this specific scenario.",
  };
};
