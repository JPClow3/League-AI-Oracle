
import React, { useCallback, useMemo, useEffect, useReducer, useState }
from 'react';
import { RecommendationDisplay } from './RecommendationDisplay';
import { LoadingSpinner } from './LoadingSpinner';
import { getDraftRecommendations, getSinglePickSuggestion, getBanSuggestions, getFollowUpAnalysis, getMvpAnalysis } from '../services/geminiService';
import {
  DraftAnalysis, ChampionSlot, PickSuggestion, BanSuggestion, Team, TeamSide,
  DDragonChampionInfo, DraftState, DraftAction, SavedDraftState, RoleSwapPayload,
  UserPreferencesPayload, ChampionStaticInfo, ArchivedDraft, PlaybookEntry,
  OraclePersonality, DraftingScreenProps, DraftMode, ConversationTurn,
  DraftStep, MvpData, DDragonItemsData, StructuredDraftRec
} from '../types';
import { LOL_ROLES, MAX_BANS_PER_TEAM, DRAFT_STATE_STORAGE_KEY, DRAFT_HISTORY_STORAGE_KEY, PLAYBOOK_STORAGE_KEY } from '../constants';
import { createSoloQueueFlow, createProfessionalFlow } from '../draftRules'; 
import {
  ClearIcon, Cog6ToothIcon, ArrowUturnLeftIcon, OracleEyeIcon, SwordIcon, 
  ArchiveBoxIcon, ConfirmIcon, ClipboardDocumentIcon, StrategyTomeIcon, PaperAirplaneIcon, TrophyIcon, WarningIcon
} from './icons/index';
import { CurrentPickInterface } from './CurrentPickInterface';
import { BanInputInterface } from './BanInputInterface';
import { TeamDisplay } from './TeamDisplay';
import { ChampionGridModal } from './ChampionGridModal';
import { ErrorDisplay } from './ErrorDisplay';
import { PreferencesModal } from './PreferencesModal';
import { staticChampionData, getChampionStaticInfoById } from '../gameData';
import { TeamAnalyticsDashboard } from './TeamAnalyticsDashboard';
import { InGameCheatSheetModal } from './InGameCheatSheetModal';
import { SaveToPlaybookModal } from './SaveToPlaybookModal';
import { DraftTimeline } from './DraftTimeline'; // Added import
// import { AnimatedNumber } from './AnimatedNumber'; // Potential import

const getInitialDraftState = (
    mode: DraftMode, 
    side: TeamSide,
    prefs: UserPreferencesPayload,
    flow: DraftStep[]
): DraftState => {
  return {
    draftMode: mode,
    userStartingSide: side,
    draftFlow: flow,
    currentStepIndex: 0,
    yourTeamPicks: [],
    enemyTeamPicks: [],
    yourTeamBans: [],
    enemyTeamBans: [],
    analysis: null, pickSuggestions: null, banSuggestions: null, mvpAnalysis: null,
    isLoadingFullAnalysis: false, isSuggestingPick: false, isLoadingBanSuggestions: false, isProcessingAction: false, isLoadingMvpAnalysis: false,
    error: null, banSuggestionError: null, mvpAnalysisError: null,
    isChampionGridOpen: false, championGridCallback: null, championGridTitle: "Select Champion",
    isStateLoadedFromStorage: false, roleSwapState: null,
    preferredRoles: prefs.preferredRoles, championPool: prefs.championPool,
    isPreferencesModalOpen: false, history: [], isDraftSavedToHistory: false, isCheatSheetModalOpen: false,
    isSavePlaybookModalOpen: false, conversationHistory: [], currentFollowUpQuery: '', isProcessingFollowUp: false,

  };
};


const MAX_HISTORY_LENGTH = 20;


const extractSavableState = (state: DraftState): SavedDraftState => {
  const {
    yourTeamPicks, enemyTeamPicks, yourTeamBans, enemyTeamBans,
    draftMode, userStartingSide, currentStepIndex, mvpAnalysis
  } = state;
  
  const isYourTeamTurn = state.draftFlow[state.currentStepIndex]?.team === Team.YourTeam;

  return {
    yourTeamPicks, enemyTeamPicks, yourTeamBans, enemyTeamBans,
    currentDraftMode: draftMode, 
    userStartingSide: userStartingSide,
    currentStepIndex: currentStepIndex,
    isYourTeamTurn: isYourTeamTurn,
    preferredRoles: state.preferredRoles, 
    championPool: state.championPool,
    mvpAnalysis: mvpAnalysis,
  };
};

const createDraftReducer = () => { 
  return (state: DraftState, action: DraftAction): DraftState => {
    const newHistory = (currentState: DraftState): SavedDraftState[] => {
      const historyEntry = extractSavableState(currentState); 
      const updatedHistory = [historyEntry, ...currentState.history];
      if (updatedHistory.length > MAX_HISTORY_LENGTH) {
        return updatedHistory.slice(0, MAX_HISTORY_LENGTH);
      }
      return updatedHistory;
    };

    switch (action.type) {
      case 'LOAD_STATE_FROM_STORAGE': {
        const loadedDraftMode = action.payload.draftMode || state.draftMode;
        const loadedUserStartingSide = action.payload.userStartingSide || state.userStartingSide;
        
        const flowGenerator = loadedDraftMode === 'COMPETITIVE' ? createProfessionalFlow : createSoloQueueFlow;
        const generatedFlow = flowGenerator(loadedUserStartingSide);
        const currentStepIndex = action.payload.currentStepIndex || 0;

        return {
          ...state, 
          draftMode: loadedDraftMode,
          userStartingSide: loadedUserStartingSide,
          draftFlow: generatedFlow,
          currentStepIndex: currentStepIndex,
          yourTeamPicks: action.payload.yourTeamPicks || [],
          enemyTeamPicks: action.payload.enemyTeamPicks || [],
          yourTeamBans: action.payload.yourTeamBans || [],
          enemyTeamBans: action.payload.enemyTeamBans || [],
          preferredRoles: action.payload.preferredRoles || state.preferredRoles,
          championPool: action.payload.championPool || state.championPool,
          mvpAnalysis: action.payload.mvpAnalysis || null, 
          
          roleSwapState: null, isPreferencesModalOpen: false, isChampionGridOpen: false, championGridCallback: null,
          error: null, banSuggestionError: null, isLoadingFullAnalysis: false, isSuggestingPick: false,
          isLoadingBanSuggestions: false, isProcessingAction: false, isLoadingMvpAnalysis: false, mvpAnalysisError: null,
          isStateLoadedFromStorage: true, history: [], isDraftSavedToHistory: false,
          isCheatSheetModalOpen: false, isSavePlaybookModalOpen: false,
          conversationHistory: [], currentFollowUpQuery: '', isProcessingFollowUp: false,
          analysis: null, pickSuggestions: null, banSuggestions: null,
        };
      }
       case 'SET_DRAFT_FLOW': {
        return {
          ...state,
          draftMode: action.payload.draftMode,
          userStartingSide: action.payload.userStartingSide,
          draftFlow: action.payload.draftFlow,
          currentStepIndex: 0,
          yourTeamPicks: [],
          enemyTeamPicks: [],
          yourTeamBans: [],
          enemyTeamBans: [],
          preferredRoles: action.payload.preferredRoles,
          championPool: action.payload.championPool,
          isStateLoadedFromStorage: true, 
          analysis: null, pickSuggestions: null, banSuggestions: null, mvpAnalysis: null,
          error: null, banSuggestionError: null, mvpAnalysisError: null, roleSwapState: null,
          history: [], isDraftSavedToHistory: false,
          conversationHistory: [], currentFollowUpQuery: '',
        };
      }
      case 'CONFIRM_ACTION': {
        const history = newHistory(state);
        const { championName, championKey } = action.payload;
        const actionValue = championKey || championName;

        if (state.currentStepIndex >= state.draftFlow.length) return state; 

        const currentActionDetails = state.draftFlow[state.currentStepIndex];
        const teamMakingAction = currentActionDetails.team;

        let nextYourTeamPicks = state.yourTeamPicks;
        let nextEnemyTeamPicks = state.enemyTeamPicks;
        let nextYourTeamBans = state.yourTeamBans;
        let nextEnemyTeamBans = state.enemyTeamBans;
        
        if (currentActionDetails.type === 'BAN') {
          if (teamMakingAction === Team.YourTeam) {
            nextYourTeamBans = [...state.yourTeamBans, actionValue];
          } else {
            nextEnemyTeamBans = [...state.enemyTeamBans, actionValue];
          }
        } else if (currentActionDetails.type === 'PICK') {
          const teamPicksArray = teamMakingAction === Team.YourTeam ? state.yourTeamPicks : state.enemyTeamPicks;
          const roleForPick = LOL_ROLES[teamPicksArray.length] || LOL_ROLES[LOL_ROLES.length -1]; 
          
          const newPick: ChampionSlot = { champion: championName, role: roleForPick, ddragonKey: championKey };
          if (teamMakingAction === Team.YourTeam) {
            nextYourTeamPicks = [...state.yourTeamPicks, newPick];
          } else {
            nextEnemyTeamPicks = [...state.enemyTeamPicks, newPick];
          }
        }

        const nextStepIndex = state.currentStepIndex + 1;
        const draftIsNowComplete = nextStepIndex >= state.draftFlow.length;

        return {
          ...state,
          yourTeamPicks: nextYourTeamPicks, enemyTeamPicks: nextEnemyTeamPicks,
          yourTeamBans: nextYourTeamBans, enemyTeamBans: nextEnemyTeamBans,
          currentStepIndex: nextStepIndex,
          isProcessingAction: false, pickSuggestions: null, banSuggestions: null, error: null,
          banSuggestionError: null, roleSwapState: null, isDraftSavedToHistory: false,
          analysis: draftIsNowComplete ? state.analysis : null, 
          mvpAnalysis: draftIsNowComplete ? state.mvpAnalysis : null,
          conversationHistory: draftIsNowComplete ? state.conversationHistory : [], 
          history,
        };
      }
      case 'INITIATE_ROLE_SWAP': {
        const payload = action.payload as RoleSwapPayload;
        const { team, championName, role } = payload;
        if (state.roleSwapState && state.roleSwapState.team === team && state.roleSwapState.originChampionName === championName && state.roleSwapState.originRole === role) {
          return { ...state, roleSwapState: null };
        }
        return { ...state, roleSwapState: { team, originChampionName: championName, originRole: role } };
      }
      case 'COMPLETE_ROLE_SWAP': {
        if (!state.roleSwapState) return state;
        const history = newHistory(state);

        const { team: targetTeam, championName: targetChampionName, role: targetRole } = action.payload;
        const { team: originTeam, originChampionName, originRole } = state.roleSwapState;

        if (originTeam !== targetTeam) return { ...state, roleSwapState: null };

        let updatedPicks: ChampionSlot[] = [];
        if (originTeam === Team.YourTeam) {
          updatedPicks = state.yourTeamPicks.map(p => {
            if (p.champion === originChampionName && p.role === originRole) {
              return { ...p, role: targetRole };
            }
            if (p.champion === targetChampionName && p.role === targetRole) {
              return { ...p, role: originRole };
            }
            return p;
          });
          return {
            ...state, yourTeamPicks: updatedPicks, roleSwapState: null,
            analysis: null, pickSuggestions: null, banSuggestions: null, error: null, banSuggestionError: null, mvpAnalysis: null, mvpAnalysisError: null,
            isDraftSavedToHistory: false, conversationHistory: [], history,
          };
        } else if (originTeam === Team.EnemyTeam) {
          updatedPicks = state.enemyTeamPicks.map(p => {
            if (p.champion === originChampionName && p.role === originRole) {
              return { ...p, role: targetRole };
            }
            if (p.champion === targetChampionName && p.role === targetRole) {
              return { ...p, role: originRole };
            }
            return p;
          });
          return {
            ...state, enemyTeamPicks: updatedPicks, roleSwapState: null,
            analysis: null, pickSuggestions: null, banSuggestions: null, error: null, banSuggestionError: null, mvpAnalysis: null, mvpAnalysisError: null,
            isDraftSavedToHistory: false, conversationHistory: [], history,
          };
        }
        return state;
      }
      case 'CANCEL_ROLE_SWAP':
        return { ...state, roleSwapState: null };
      case 'REQUEST_PICK_SUGGESTIONS_START':
        return { ...state, isSuggestingPick: true, pickSuggestions: null, error: null, roleSwapState: null };
      case 'REQUEST_PICK_SUGGESTIONS_SUCCESS':
        return { ...state, isSuggestingPick: false, pickSuggestions: action.payload };
      case 'REQUEST_PICK_SUGGESTIONS_ERROR':
        return { ...state, isSuggestingPick: false, error: action.payload };
      case 'REQUEST_BAN_SUGGESTIONS_START':
        return { ...state, isLoadingBanSuggestions: true, banSuggestions: null, banSuggestionError: null, roleSwapState: null };
      case 'REQUEST_BAN_SUGGESTIONS_SUCCESS':
        return { ...state, isLoadingBanSuggestions: false, banSuggestions: action.payload };
      case 'REQUEST_BAN_SUGGESTIONS_ERROR':
        return { ...state, isLoadingBanSuggestions: false, banSuggestionError: action.payload };
      case 'REQUEST_FULL_ANALYSIS_START':
        return { ...state, isLoadingFullAnalysis: true, analysis: null, error: null, pickSuggestions: null, banSuggestions: null, roleSwapState: null, conversationHistory: [], mvpAnalysis: null, mvpAnalysisError: null };
      case 'REQUEST_FULL_ANALYSIS_SUCCESS': { // action.payload is DraftAnalysis
        let overallSentiment: DraftAnalysis['overallSentiment'] = 'neutral';
        // Create a summarized text for sentiment check if data is structured
        let analysisTextForSentimentCheck = "";
        if (typeof action.payload.analysisData === 'string') {
            analysisTextForSentimentCheck = action.payload.analysisData.toLowerCase();
        } else if (action.payload.analysisType === 'draft') {
            const structuredData = action.payload.analysisData as StructuredDraftRec;
            analysisTextForSentimentCheck = JSON.stringify(structuredData.overallSynopsis || {}).toLowerCase();
        }

        if (analysisTextForSentimentCheck.includes("strong synergy") || analysisTextForSentimentCheck.includes("excellent composition") || analysisTextForSentimentCheck.includes("highly favorable")) {
            overallSentiment = 'positive';
        } else if (analysisTextForSentimentCheck.includes("major weakness") || analysisTextForSentimentCheck.includes("critical flaw") || analysisTextForSentimentCheck.includes("significant vulnerability") || analysisTextForSentimentCheck.includes("lack of") || analysisTextForSentimentCheck.includes("no reliable")) {
            overallSentiment = 'critical_flaw';
        }
        
        let auraSentiment: DraftAnalysis['auraSentiment'] = 'neutral';
        if (overallSentiment === 'positive') auraSentiment = 'pleased';
        else if (overallSentiment === 'critical_flaw') auraSentiment = 'concerned';

        // For conversation history, the model's part should be a string.
        let modelResponseTextForHistory = "Oracle provided structured draft analysis.";
        if (action.payload.analysisType === 'draft' && typeof action.payload.analysisData === 'object') {
            const structuredData = action.payload.analysisData as StructuredDraftRec;
            if (structuredData.overallSynopsis?.yourTeamIdentity) {
                modelResponseTextForHistory = `Draft analysis summary: Your team identity - ${structuredData.overallSynopsis.yourTeamIdentity}. Enemy: ${structuredData.overallSynopsis.enemyTeamIdentity}.`;
            }
        } else if (typeof action.payload.analysisData === 'string') {
            modelResponseTextForHistory = action.payload.analysisData;
        }
        
        return { 
          ...state, isLoadingFullAnalysis: false, 
          analysis: {...action.payload, overallSentiment, auraSentiment }, 
          isDraftSavedToHistory: false,
          conversationHistory: action.payload.originalPrompt ? [
            { role: 'user', parts: [{ text: action.payload.originalPrompt }] },
            { role: 'model', parts: [{ text: modelResponseTextForHistory }] }
          ] : [],
        };
      }
      case 'REQUEST_FULL_ANALYSIS_ERROR':
        return { ...state, isLoadingFullAnalysis: false, error: action.payload };
      case 'RESET_DRAFT_STATE': {
         const flowGenerator = state.draftMode === 'COMPETITIVE' ? createProfessionalFlow : createSoloQueueFlow;
         const newFlow = flowGenerator(state.userStartingSide);
        return getInitialDraftState(state.draftMode, state.userStartingSide, {
          preferredRoles: state.preferredRoles,
          championPool: state.championPool,
        }, newFlow);
      }
      case 'OPEN_CHAMPION_GRID':
        return { ...state, isChampionGridOpen: true, championGridCallback: action.payload.callback, championGridTitle: action.payload.title, roleSwapState: null };
      case 'CLOSE_CHAMPION_GRID':
        return { ...state, isChampionGridOpen: false, championGridCallback: null };
      case 'SET_PROCESSING_ACTION':
        return { ...state, isProcessingAction: action.payload };
      case 'CLEAR_SUGGESTIONS_AND_ANALYSIS':
          return { ...state, pickSuggestions: null, banSuggestions: null, analysis: null, error: null, banSuggestionError: null, conversationHistory: [], mvpAnalysis: null, mvpAnalysisError: null };
      case 'SET_ERROR':
        return { ...state, error: action.payload };
      case 'SET_BAN_SUGGESTION_ERROR':
        return { ...state, banSuggestionError: action.payload };
      case 'SET_USER_PREFERENCES':
        return { ...state, preferredRoles: action.payload.preferredRoles, championPool: action.payload.championPool, isDraftSavedToHistory: false };
      case 'OPEN_PREFERENCES_MODAL':
        return { ...state, isPreferencesModalOpen: true, roleSwapState: null };
      case 'CLOSE_PREFERENCES_MODAL':
        return { ...state, isPreferencesModalOpen: false };
      case 'UNDO_LAST_ACTION': {
        if (state.history.length === 0) return state;
        
        const previousSavedState = state.history[0];
        const newHistorySlice = state.history.slice(1);
        
        const flowGenerator = previousSavedState.currentDraftMode === 'COMPETITIVE' ? createProfessionalFlow : createSoloQueueFlow;
        const regeneratedFlow = flowGenerator(previousSavedState.userStartingSide);

        return {
          ...state,
          draftMode: previousSavedState.currentDraftMode,
          userStartingSide: previousSavedState.userStartingSide,
          draftFlow: regeneratedFlow,
          currentStepIndex: previousSavedState.currentStepIndex,
          yourTeamPicks: previousSavedState.yourTeamPicks,
          enemyTeamPicks: previousSavedState.enemyTeamPicks,
          yourTeamBans: previousSavedState.yourTeamBans,
          enemyTeamBans: previousSavedState.enemyTeamBans,
          preferredRoles: previousSavedState.preferredRoles || state.preferredRoles,
          championPool: previousSavedState.championPool || state.championPool,
          analysis: null, pickSuggestions: null, banSuggestions: null, error: null, banSuggestionError: null, mvpAnalysis: null, mvpAnalysisError: null,
          roleSwapState: null, isProcessingAction: false, isDraftSavedToHistory: false,
          conversationHistory: [], 
          history: newHistorySlice,
        };
      }
      case 'MARK_DRAFT_AS_SAVED':
        return { ...state, isDraftSavedToHistory: true };
      case 'OPEN_CHEAT_SHEET_MODAL':
        return { ...state, isCheatSheetModalOpen: true, roleSwapState: null };
      case 'CLOSE_CHEAT_SHEET_MODAL':
        return { ...state, isCheatSheetModalOpen: false };
      case 'OPEN_SAVE_PLAYBOOK_MODAL':
        return { ...state, isSavePlaybookModalOpen: true, roleSwapState: null };
      case 'CLOSE_SAVE_PLAYBOOK_MODAL':
        return { ...state, isSavePlaybookModalOpen: false };
      case 'SET_FOLLOW_UP_QUERY':
        return { ...state, currentFollowUpQuery: action.payload };
      case 'SEND_FOLLOW_UP_START':
        return { ...state, isProcessingFollowUp: true, error: null };
      case 'SEND_FOLLOW_UP_SUCCESS': // action.payload is DraftAnalysis (type: 'text_direct', data: string)
        return {
          ...state,
          isProcessingFollowUp: false,
          analysis: action.payload, // The entire analysis is now the text response from follow-up
          conversationHistory: [
            ...state.conversationHistory,
            { role: 'user', parts: [{text: state.currentFollowUpQuery}] },
            { role: 'model', parts: [{text: action.payload.analysisData as string }] }
          ],
          currentFollowUpQuery: '',
        };
      case 'SEND_FOLLOW_UP_ERROR':
        return { ...state, isProcessingFollowUp: false, error: action.payload };
      
      case 'REQUEST_MVP_ANALYSIS_START':
        return { ...state, isLoadingMvpAnalysis: true, mvpAnalysis: null, mvpAnalysisError: null };
      case 'REQUEST_MVP_ANALYSIS_SUCCESS':
        return { ...state, isLoadingMvpAnalysis: false, mvpAnalysis: action.payload };
      case 'REQUEST_MVP_ANALYSIS_ERROR':
        return { ...state, isLoadingMvpAnalysis: false, mvpAnalysisError: action.payload };
      default:
        return state;
    }
  }
};


export const DraftingScreen: React.FC<DraftingScreenProps> = ({
  onGoHome,
  ddragonVersion,
  allChampionsData,
  allItemsData, 
  oraclePersonality,
  draftMode, 
  userStartingSide,
  onUpdateDraftAura,
}) => {
  const reducer = useMemo(() => createDraftReducer(), []);
  
  const [state, dispatch] = useReducer(
    reducer,
    { 
      draftMode, 
      userStartingSide, 
      draftFlow: [], currentStepIndex: 0, 
      yourTeamPicks: [], enemyTeamPicks: [], yourTeamBans: [], enemyTeamBans: [],
      preferredRoles: [], championPool: {}, 
      analysis: null, pickSuggestions: null, banSuggestions: null, mvpAnalysis: null,
      isLoadingFullAnalysis: false, isSuggestingPick: false, isLoadingBanSuggestions: false, isProcessingAction: false, isLoadingMvpAnalysis: false,
      error: null, banSuggestionError: null, mvpAnalysisError: null,
      isChampionGridOpen: false, championGridCallback: null, championGridTitle: "Select Champion",
      isStateLoadedFromStorage: false, roleSwapState: null,
      isPreferencesModalOpen: false, history: [], isDraftSavedToHistory: false, isCheatSheetModalOpen: false,
      isSavePlaybookModalOpen: false, conversationHistory: [], currentFollowUpQuery: '', isProcessingFollowUp: false,

    },
    (args) => {
        const flowGenerator = args.draftMode === 'COMPETITIVE' ? createProfessionalFlow : createSoloQueueFlow;
        const initialFlow = flowGenerator(args.userStartingSide);
        return getInitialDraftState(
            args.draftMode, 
            args.userStartingSide, 
            {preferredRoles: [], championPool: {}},
            initialFlow
        );
    }
  );

  useEffect(() => {
    const savedStateRaw = localStorage.getItem(DRAFT_STATE_STORAGE_KEY);
    let savedPrefs: UserPreferencesPayload = { preferredRoles: [], championPool: {} };
    
    if (savedStateRaw) {
      try {
        const savedState = JSON.parse(savedStateRaw) as Partial<SavedDraftState>;
        savedPrefs = {
          preferredRoles: savedState.preferredRoles || [],
          championPool: savedState.championPool || {},
        };
         // Dispatch to fully load the state, including draftMode and userStartingSide which might be from storage
        dispatch({ 
          type: 'LOAD_STATE_FROM_STORAGE', 
          payload: {
            ...savedState, 
            draftMode: savedState.currentDraftMode || draftMode, // Prioritize saved, then prop
            userStartingSide: savedState.userStartingSide || userStartingSide, // Prioritize saved, then prop
          }
        });
        onUpdateDraftAura('neutral');

      } catch (e) {
        console.error("Error parsing saved state:", e);
        const flowGenerator = draftMode === 'COMPETITIVE' ? createProfessionalFlow : createSoloQueueFlow;
        dispatch({ type: 'SET_DRAFT_FLOW', payload: { draftFlow: flowGenerator(userStartingSide), draftMode, userStartingSide, ...savedPrefs } });
        onUpdateDraftAura('neutral');
      }
    } else {
        const flowGenerator = draftMode === 'COMPETITIVE' ? createProfessionalFlow : createSoloQueueFlow;
        dispatch({ type: 'SET_DRAFT_FLOW', payload: { draftFlow: flowGenerator(userStartingSide), draftMode, userStartingSide, ...savedPrefs } });
        onUpdateDraftAura('neutral');
    }
  }, [draftMode, userStartingSide, onUpdateDraftAura]); // Add onUpdateDraftAura to deps


  useEffect(() => {
    if (state.isStateLoadedFromStorage) {
      localStorage.setItem(DRAFT_STATE_STORAGE_KEY, JSON.stringify(extractSavableState(state)));
    }
  }, [state]);

  useEffect(() => {
    return () => { // Cleanup on unmount
      onUpdateDraftAura('neutral');
    };
  }, [onUpdateDraftAura]);

  const handleConfirmAction = useCallback((champion: DDragonChampionInfo) => {
    dispatch({ type: 'SET_PROCESSING_ACTION', payload: true });
    dispatch({ type: 'CONFIRM_ACTION', payload: { championName: champion.name, championKey: champion.id } });
    onUpdateDraftAura('neutral');
  }, [onUpdateDraftAura]);

  const handleOpenChampionGridForPick = useCallback(() => {
    const currentActionDetails = state.draftFlow[state.currentStepIndex];
    if (!currentActionDetails) return;
    const roleForPick = LOL_ROLES[currentActionDetails.team === Team.YourTeam ? state.yourTeamPicks.length : state.enemyTeamPicks.length];
    dispatch({ 
      type: 'OPEN_CHAMPION_GRID', 
      payload: { 
        callback: handleConfirmAction, 
        title: `Select ${roleForPick} for ${currentActionDetails.team === Team.YourTeam ? 'Your Team' : 'Enemy Team'}` 
      }
    });
  }, [state.draftFlow, state.currentStepIndex, state.yourTeamPicks.length, state.enemyTeamPicks.length, handleConfirmAction]);

  const handleOpenChampionGridForBan = useCallback(() => {
    const currentActionDetails = state.draftFlow[state.currentStepIndex];
    if (!currentActionDetails) return;
     const teamName = currentActionDetails.team === Team.YourTeam ? "Your Team" : "Enemy Team";
     const banNumber = (currentActionDetails.team === Team.YourTeam ? state.yourTeamBans.length : state.enemyTeamBans.length) + 1;
    dispatch({ 
      type: 'OPEN_CHAMPION_GRID', 
      payload: { 
        callback: handleConfirmAction, 
        title: `Select Ban #${banNumber} for ${teamName}` 
      }
    });
  }, [state.draftFlow, state.currentStepIndex, state.yourTeamBans.length, state.enemyTeamBans.length, handleConfirmAction]);

  const handleSuggestPick = useCallback(async () => {
    if (state.isSuggestingPick) return;
    const currentActionDetails = state.draftFlow[state.currentStepIndex];
    if (!currentActionDetails || currentActionDetails.type !== 'PICK') return;
    const roleToSuggest = LOL_ROLES[currentActionDetails.team === Team.YourTeam ? state.yourTeamPicks.length : state.enemyTeamPicks.length];
    if (!roleToSuggest) return;

    dispatch({ type: 'REQUEST_PICK_SUGGESTIONS_START' });
    try {
      const suggestions = await getSinglePickSuggestion(
        state.yourTeamPicks, state.enemyTeamPicks, roleToSuggest,
        state.yourTeamBans, state.enemyTeamBans, oraclePersonality,
        state.preferredRoles, state.championPool
      );
      dispatch({ type: 'REQUEST_PICK_SUGGESTIONS_SUCCESS', payload: suggestions });
    } catch (err) {
      console.error("Error getting pick suggestions:", err);
      dispatch({ type: 'REQUEST_PICK_SUGGESTIONS_ERROR', payload: err instanceof Error ? err.message : "Failed to get suggestions." });
    }
  }, [state.yourTeamPicks, state.enemyTeamPicks, state.yourTeamBans, state.enemyTeamBans, state.draftFlow, state.currentStepIndex, oraclePersonality, state.preferredRoles, state.championPool, state.isSuggestingPick]);

  const handleSelectSuggestedChampion = useCallback((championName: string) => {
    const champion = allChampionsData.find(c => c.name === championName);
    if (champion) {
      handleConfirmAction(champion);
    }
  }, [allChampionsData, handleConfirmAction]);

  const handleSuggestBan = useCallback(async () => {
    if (state.isLoadingBanSuggestions) return;
    const currentActionDetails = state.draftFlow[state.currentStepIndex];
    if (!currentActionDetails || currentActionDetails.type !== 'BAN') return;

    dispatch({ type: 'REQUEST_BAN_SUGGESTIONS_START' });
    try {
      const suggestions = await getBanSuggestions(
        state.yourTeamPicks, state.enemyTeamPicks,
        state.yourTeamBans, state.enemyTeamBans,
        currentActionDetails.team, oraclePersonality,
        state.preferredRoles, state.championPool
      );
      dispatch({ type: 'REQUEST_BAN_SUGGESTIONS_SUCCESS', payload: suggestions });
    } catch (err) {
      console.error("Error getting ban suggestions:", err);
      dispatch({ type: 'REQUEST_BAN_SUGGESTIONS_ERROR', payload: err instanceof Error ? err.message : "Failed to get ban suggestions." });
    }
  }, [state.yourTeamPicks, state.enemyTeamPicks, state.yourTeamBans, state.enemyTeamBans, state.draftFlow, state.currentStepIndex, oraclePersonality, state.preferredRoles, state.championPool, state.isLoadingBanSuggestions]);

  const handleGetFullAnalysis = useCallback(async () => {
    if (state.isLoadingFullAnalysis) return;
    dispatch({ type: 'REQUEST_FULL_ANALYSIS_START' });
    try {
      const analysisResult = await getDraftRecommendations(
        state.yourTeamPicks, state.enemyTeamPicks,
        state.yourTeamBans, state.enemyTeamBans,
        oraclePersonality,
        state.preferredRoles, state.championPool
      );
      dispatch({ type: 'REQUEST_FULL_ANALYSIS_SUCCESS', payload: analysisResult });
      if (analysisResult.auraSentiment) onUpdateDraftAura(analysisResult.auraSentiment);

    } catch (err) {
      console.error("Error getting full draft analysis:", err);
      dispatch({ type: 'REQUEST_FULL_ANALYSIS_ERROR', payload: err instanceof Error ? err.message : "Failed to get full analysis." });
      onUpdateDraftAura('neutral');
    }
  }, [state.yourTeamPicks, state.enemyTeamPicks, state.yourTeamBans, state.enemyTeamBans, oraclePersonality, state.preferredRoles, state.championPool, state.isLoadingFullAnalysis, onUpdateDraftAura]);

  const handleResetDraft = () => {
    if (window.confirm("Are you sure you want to reset the current draft? This cannot be undone.")) {
      dispatch({ type: 'RESET_DRAFT_STATE' });
      localStorage.removeItem(DRAFT_STATE_STORAGE_KEY);
      onUpdateDraftAura('neutral');
    }
  };

  const handleSavePreferences = (newPreferences: UserPreferencesPayload) => {
    dispatch({ type: 'SET_USER_PREFERENCES', payload: newPreferences });
  };

  const handleUndoAction = () => {
    if (state.history.length > 0) {
      dispatch({ type: 'UNDO_LAST_ACTION' });
      onUpdateDraftAura('neutral');
    } else {
      alert("No actions to undo.");
    }
  };

  const handleSaveToHistory = useCallback(() => {
    if (!state.analysis) {
      alert("Please generate an analysis before saving to history.");
      return;
    }
    const currentDraft: ArchivedDraft = {
      ...extractSavableState(state),
      id: new Date().toISOString(),
      timestamp: Date.now(),
      analysis: state.analysis,
      mvpAnalysis: state.mvpAnalysis,
    };

    try {
      const historyRaw = localStorage.getItem(DRAFT_HISTORY_STORAGE_KEY);
      const history: ArchivedDraft[] = historyRaw ? JSON.parse(historyRaw) : [];
      const updatedHistory = [currentDraft, ...history].slice(0, 20); // Keep last 20
      localStorage.setItem(DRAFT_HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
      dispatch({ type: 'MARK_DRAFT_AS_SAVED' });
      alert("Draft saved to history!");
    } catch (error) {
      console.error("Error saving draft to history:", error);
      alert("Failed to save draft to history.");
    }
  }, [state]);

  const handleSaveToPlaybook = (name: string) => {
    if (!state.analysis) {
        alert("Please generate an analysis before saving to playbook.");
        return;
    }
    const playbookEntry: PlaybookEntry = {
        ...extractSavableState(state),
        id: new Date().toISOString() + `-${name.replace(/\s+/g, '-')}`,
        timestamp: Date.now(),
        analysis: state.analysis,
        name: name,
        mvpAnalysis: state.mvpAnalysis,
    };
    try {
        const playbookRaw = localStorage.getItem(PLAYBOOK_STORAGE_KEY);
        const playbook: PlaybookEntry[] = playbookRaw ? JSON.parse(playbookRaw) : [];
        const updatedPlaybook = [playbookEntry, ...playbook];
        localStorage.setItem(PLAYBOOK_STORAGE_KEY, JSON.stringify(updatedPlaybook));
        dispatch({ type: 'MARK_DRAFT_AS_SAVED' }); // Could use a specific playbook saved flag if needed
        alert(`Strategy "${name}" saved to Playbook!`);
    } catch (error) {
        console.error("Error saving to playbook:", error);
        alert("Failed to save strategy to Playbook.");
    }
  };
  
  const handleSendFollowUp = async () => {
    if (!state.currentFollowUpQuery.trim() || !state.analysis) {
      dispatch({ type: 'SEND_FOLLOW_UP_ERROR', payload: 'Cannot send empty query or if no initial analysis exists.' });
      return;
    }
    dispatch({ type: 'SEND_FOLLOW_UP_START' });
    try {
      const followUpResult = await getFollowUpAnalysis(state.conversationHistory, state.currentFollowUpQuery, oraclePersonality);
      dispatch({ type: 'SEND_FOLLOW_UP_SUCCESS', payload: followUpResult });
      if (followUpResult.auraSentiment) onUpdateDraftAura(followUpResult.auraSentiment);

    } catch (err) {
      console.error("Error sending follow-up query:", err);
      dispatch({ type: 'SEND_FOLLOW_UP_ERROR', payload: err instanceof Error ? err.message : "Failed to get follow-up response." });
    }
  };

  const handleGetMvpAnalysis = useCallback(async () => {
    if (!state.analysis || !state.analysis.analysisData || state.isLoadingMvpAnalysis) return;

    let analysisInputForMvp: string | StructuredDraftRec;
    if (typeof state.analysis.analysisData === 'string') {
        analysisInputForMvp = state.analysis.analysisData;
    } else if (state.analysis.analysisType === 'draft') {
        analysisInputForMvp = state.analysis.analysisData as StructuredDraftRec;
    } else {
        console.warn(`MVP analysis requested for unsuitable analysis type: ${state.analysis.analysisType}`);
        dispatch({ type: 'REQUEST_MVP_ANALYSIS_ERROR', payload: `MVP analysis not applicable for this content type.`});
        return;
    }

    dispatch({ type: 'REQUEST_MVP_ANALYSIS_START' });
    try {
      const mvpResult = await getMvpAnalysis(analysisInputForMvp, state.yourTeamPicks, oraclePersonality);
      dispatch({ type: 'REQUEST_MVP_ANALYSIS_SUCCESS', payload: mvpResult });
    } catch (err) {
      console.error("Error fetching MVP analysis:", err);
      dispatch({ type: 'REQUEST_MVP_ANALYSIS_ERROR', payload: err instanceof Error ? err.message : "Failed to analyze MVP."});
    }
  }, [state.analysis, state.yourTeamPicks, oraclePersonality, state.isLoadingMvpAnalysis]);

  const currentActionDetails = state.draftFlow[state.currentStepIndex];
  const isDraftComplete = state.currentStepIndex >= state.draftFlow.length;
  const canUndo = state.history.length > 0 && !isDraftComplete;

  const disabledChampionIds = useMemo(() => {
    const allSelected = new Set<string>();
    const addChampionToSet = (champIdentifier: string) => {
        if (!champIdentifier) return;
        const champById = allChampionsData.find(c => c.id.toLowerCase() === champIdentifier.toLowerCase());
        if (champById) {
            allSelected.add(champById.id);
            return;
        }
        const champByName = allChampionsData.find(c => c.name.toLowerCase() === champIdentifier.toLowerCase());
        if (champByName) {
            allSelected.add(champByName.id);
        }
         // If not found by ID or exact name, add the identifier itself (could be a key for an unmapped champ)
         // This handles cases where DDragonKey might be used as the identifier in bans/picks.
        else if (!allChampionsData.some(c => c.name.toLowerCase() === champIdentifier.toLowerCase())) {
             allSelected.add(champIdentifier); // Add the raw identifier if it's not a known champion name or ID
        }
    };

    state.yourTeamPicks.forEach(p => addChampionToSet(p.ddragonKey || p.champion));
    state.enemyTeamPicks.forEach(p => addChampionToSet(p.ddragonKey || p.champion));
    state.yourTeamBans.forEach(b => addChampionToSet(b));
    state.enemyTeamBans.forEach(b => addChampionToSet(b));
    
    return Array.from(allSelected);
  }, [state.yourTeamPicks, state.enemyTeamPicks, state.yourTeamBans, state.enemyTeamBans, allChampionsData]);
  
  
  const draftPhaseForDisplay = useMemo(() => {
    if (isDraftComplete) return "COMPLETE";
    if (!currentActionDetails) return "Waiting...";
    
    const { type, phase } = currentActionDetails;
    const teamName = currentActionDetails.team === Team.YourTeam ? "Your Team" : "Enemy Team";
    const actionNumber = currentActionDetails.type === 'PICK' 
      ? (currentActionDetails.team === Team.YourTeam ? state.yourTeamPicks.length : state.enemyTeamPicks.length) + 1
      : (currentActionDetails.team === Team.YourTeam ? state.yourTeamBans.length : state.enemyTeamBans.length) + 1;

    return `${phase}: ${teamName} ${type} #${actionNumber}`;
  }, [isDraftComplete, currentActionDetails, state.yourTeamPicks.length, state.enemyTeamPicks.length, state.yourTeamBans.length, state.enemyTeamBans.length]);


  return (
    <div className="w-full h-full flex flex-col p-2 sm:p-4">
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-3xl sm:text-4xl font-['Playfair_Display'] text-sky-300 flex items-center">
            <SwordIcon className="w-7 h-7 sm:w-8 sm:h-8 mr-2 sm:mr-3"/>
            Drafting Chamber
        </h2>
        <div className="flex items-center space-x-2">
            <button onClick={() => dispatch({ type: 'OPEN_PREFERENCES_MODAL' })} className="lol-button lol-button-secondary p-2 text-sm" title="Draft Preferences">
                <Cog6ToothIcon className="w-5 h-5" />
            </button>
            <button onClick={onGoHome} className="lol-button lol-button-secondary text-sm px-3 py-1.5 sm:px-4 sm:py-2">
                <ArrowUturnLeftIcon className="w-4 h-4 mr-1.5" /> Home
            </button>
        </div>
      </div>
      
      {state.draftMode === 'COMPETITIVE' && (
        <DraftTimeline draftFlow={state.draftFlow} currentStepIndex={state.currentStepIndex} />
      )}

      <p className={`text-center text-slate-400 text-sm font-['Inter'] ${state.draftMode === 'COMPETITIVE' ? 'mb-1' : 'mb-4'}`}>
        Phase: <span className="text-yellow-300 font-semibold">{draftPhaseForDisplay}</span>
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 flex-grow min-h-0">
        {/* Your Team Display */}
        <div className="lg:col-span-1">
          <TeamDisplay
            title="Your Forces"
            teamPicks={state.yourTeamPicks}
            teamBans={state.yourTeamBans}
            icon={<SwordIcon />} 
            ddragonVersion={ddragonVersion}
            allChampionsData={allChampionsData}
            activeRoleForPick={currentActionDetails?.type === 'PICK' && currentActionDetails.team === Team.YourTeam ? LOL_ROLES[state.yourTeamPicks.length] : undefined}
            isTeamTurnForPick={currentActionDetails?.type === 'PICK' && currentActionDetails.team === Team.YourTeam}
            isTeamTurnForBan={currentActionDetails?.type === 'BAN' && currentActionDetails.team === Team.YourTeam}
            activeBanSlotIndex={currentActionDetails?.type === 'BAN' && currentActionDetails.team === Team.YourTeam ? state.yourTeamBans.length : undefined}
            roleSwapState={state.roleSwapState}
            onInitiateRoleSwap={(payload) => dispatch({ type: 'INITIATE_ROLE_SWAP', payload })}
            onCompleteRoleSwap={(payload) => dispatch({ type: 'COMPLETE_ROLE_SWAP', payload })}
            onCancelRoleSwap={() => dispatch({ type: 'CANCEL_ROLE_SWAP' })}
            anyLoading={state.isLoadingFullAnalysis || state.isSuggestingPick || state.isLoadingBanSuggestions || state.isProcessingAction || state.isProcessingFollowUp || state.isLoadingMvpAnalysis}
            mode="draft"
            draftPhaseForDisplay={draftPhaseForDisplay}
            getChampionStaticInfoById={getChampionStaticInfoById}
            analysisSentiment={state.analysis?.overallSentiment}
          />
        </div>

        {/* Action Panel */}
        <div className="lg:col-span-1 flex flex-col space-y-4 items-center justify-center p-2 sm:p-4 lol-panel bg-opacity-50 border-slate-700/70 order-first lg:order-none">
          {!isDraftComplete && currentActionDetails ? (
            currentActionDetails.type === 'PICK' ? (
              <CurrentPickInterface
                currentRole={LOL_ROLES[currentActionDetails.team === Team.YourTeam ? state.yourTeamPicks.length : state.enemyTeamPicks.length] || 'Pick'}
                isYourTeamTurn={currentActionDetails.team === Team.YourTeam}
                onSuggestPick={handleSuggestPick}
                isSuggestingPick={state.isSuggestingPick}
                pickSuggestions={state.pickSuggestions}
                isDisabled={state.isProcessingAction || state.isLoadingFullAnalysis || state.roleSwapState !== null}
                onOpenChampionGrid={handleOpenChampionGridForPick}
                onSelectSuggestedChampion={handleSelectSuggestedChampion}
              />
            ) : ( // BAN
              <BanInputInterface
                onSuggestBan={handleSuggestBan}
                isLoadingBanSuggestions={state.isLoadingBanSuggestions}
                banSuggestions={state.banSuggestions}
                banSuggestionError={state.banSuggestionError}
                currentBanNumberHuman={(currentActionDetails.team === Team.YourTeam ? state.yourTeamBans.length : state.enemyTeamBans.length) + 1}
                teamName={currentActionDetails.team === Team.YourTeam ? "Your Team" : "Enemy Team"}
                isDisabled={state.isProcessingAction || state.isLoadingFullAnalysis || state.roleSwapState !== null}
                isYourTeamTurn={currentActionDetails.team === Team.YourTeam}
                onOpenChampionGrid={handleOpenChampionGridForBan}
                onSelectSuggestedChampion={handleSelectSuggestedChampion}
              />
            )
          ) : isDraftComplete ? (
            <div className="text-center">
              <h3 className="text-xl font-semibold text-green-400 mb-3 font-['Inter']">Draft Complete!</h3>
              <p className="text-sm text-slate-300 mb-4 font-['Inter'] leading-relaxed">
                The Oracle has guided your selections. Now, seek deeper insights into the completed draft.
              </p>
            </div>
          ) : (
            <LoadingSpinner />
          )}
          {isDraftComplete && !state.analysis && !state.isLoadingFullAnalysis && (
             <button onClick={handleGetFullAnalysis} disabled={state.isLoadingFullAnalysis} className="lol-button lol-button-primary w-full text-sm sm:text-base py-2.5 flex items-center justify-center">
              <OracleEyeIcon className="w-5 h-5 mr-2"/> Full Draft Analysis
            </button>
          )}
          {state.isLoadingFullAnalysis && (
            <div className="text-center animate-fadeIn">
              <LoadingSpinner />
              <p className="text-sm text-slate-400 mt-1 font-['Inter']">Oracle is analyzing the full draft...</p>
            </div>
          )}
          {state.error && <ErrorDisplay errorMessage={state.error} onClear={() => dispatch({ type: 'SET_ERROR', payload: null})} title="Analysis Error"/>}
          {state.banSuggestionError && <ErrorDisplay errorMessage={state.banSuggestionError} onClear={() => dispatch({ type: 'SET_BAN_SUGGESTION_ERROR', payload: null})} title="Ban Suggestion Error" />}
          {/* Potential AnimatedNumber integration point if scores are extracted from analysis
            {state.analysis && state.analysis.synergyScore && (
              <div className="mt-2 text-center">
                Synergy Score: <AnimatedNumber targetValue={state.analysis.synergyScore} />
              </div>
            )}
          */}
        </div>

        {/* Enemy Team Display */}
        <div className="lg:col-span-1">
           <TeamDisplay
            title="Enemy Forces"
            teamPicks={state.enemyTeamPicks}
            teamBans={state.enemyTeamBans}
            icon={<WarningIcon />} 
            ddragonVersion={ddragonVersion}
            allChampionsData={allChampionsData}
            activeRoleForPick={currentActionDetails?.type === 'PICK' && currentActionDetails.team === Team.EnemyTeam ? LOL_ROLES[state.enemyTeamPicks.length] : undefined}
            isTeamTurnForPick={currentActionDetails?.type === 'PICK' && currentActionDetails.team === Team.EnemyTeam}
            isTeamTurnForBan={currentActionDetails?.type === 'BAN' && currentActionDetails.team === Team.EnemyTeam}
            activeBanSlotIndex={currentActionDetails?.type === 'BAN' && currentActionDetails.team === Team.EnemyTeam ? state.enemyTeamBans.length : undefined}
            roleSwapState={state.roleSwapState}
            onInitiateRoleSwap={(payload) => dispatch({ type: 'INITIATE_ROLE_SWAP', payload })}
            onCompleteRoleSwap={(payload) => dispatch({ type: 'COMPLETE_ROLE_SWAP', payload })}
            onCancelRoleSwap={() => dispatch({ type: 'CANCEL_ROLE_SWAP' })}
            anyLoading={state.isLoadingFullAnalysis || state.isSuggestingPick || state.isLoadingBanSuggestions || state.isProcessingAction || state.isProcessingFollowUp || state.isLoadingMvpAnalysis}
            mode="draft"
            draftPhaseForDisplay={draftPhaseForDisplay}
            getChampionStaticInfoById={getChampionStaticInfoById}
          />
        </div>
      </div>

      {state.analysis && !state.isLoadingFullAnalysis && (
        <div className="mt-4">
           <TeamAnalyticsDashboard teamPicks={state.yourTeamPicks} allChampionsStaticData={staticChampionData as ChampionStaticInfo[]} teamTitle="Your Team Analytics" />
           <TeamAnalyticsDashboard teamPicks={state.enemyTeamPicks} allChampionsStaticData={staticChampionData as ChampionStaticInfo[]} teamTitle="Enemy Team Analytics" />
          <RecommendationDisplay 
            analysis={state.analysis}
            title="Oracle's Full Draft Analysis"
            ddragonVersion={ddragonVersion}
            allChampionsData={allChampionsData}
            allItemsData={allItemsData}
            mvpAnalysis={state.mvpAnalysis}
            isLoadingMvp={state.isLoadingMvpAnalysis}
            overallSentiment={state.analysis.overallSentiment}
          />
          <div className="mt-3 space-y-2 sm:space-y-0 sm:flex sm:space-x-3">
            <button onClick={() => dispatch({type: 'OPEN_CHEAT_SHEET_MODAL'})} className="lol-button lol-button-secondary w-full sm:w-auto text-sm py-2 px-3 flex items-center justify-center">
                <ClipboardDocumentIcon className="w-4 h-4 mr-1.5"/> In-Game Cheat Sheet
            </button>
            {!state.mvpAnalysis && !state.isLoadingMvpAnalysis && (
              <button onClick={handleGetMvpAnalysis} className="lol-button lol-button-secondary w-full sm:w-auto text-sm py-2 px-3 flex items-center justify-center">
                  <TrophyIcon className="w-4 h-4 mr-1.5 text-yellow-400"/> Identify Oracle's MVP
              </button>
            )}
            {state.isLoadingMvpAnalysis && <div className="text-center flex items-center justify-center text-sm text-slate-400"><LoadingSpinner/> <span className="ml-2">Identifying MVP...</span></div> }
            {state.mvpAnalysisError && <ErrorDisplay errorMessage={state.mvpAnalysisError} onClear={() => dispatch({ type: 'REQUEST_MVP_ANALYSIS_ERROR', payload: ''})} />}
            
            <button onClick={() => dispatch({type: 'OPEN_SAVE_PLAYBOOK_MODAL'})} className="lol-button lol-button-secondary w-full sm:w-auto text-sm py-2 px-3 flex items-center justify-center">
              <StrategyTomeIcon className="w-4 h-4 mr-1.5"/> Save to Playbook
            </button>
            <button onClick={handleSaveToHistory} disabled={state.isDraftSavedToHistory} className={`lol-button w-full sm:w-auto text-sm py-2 px-3 flex items-center justify-center ${state.isDraftSavedToHistory ? 'bg-green-700 border-green-600 text-green-200 cursor-not-allowed' : 'lol-button-secondary'}`}>
              <ArchiveBoxIcon className="w-4 h-4 mr-1.5"/> {state.isDraftSavedToHistory ? 'Saved to History' : 'Save to History'}
            </button>
          </div>
          <div className="mt-4">
            <textarea 
              value={state.currentFollowUpQuery}
              onChange={(e) => dispatch({ type: 'SET_FOLLOW_UP_QUERY', payload: e.target.value })}
              placeholder="Ask a follow-up question about this analysis..."
              className="w-full lol-input h-16 text-sm resize-y"
            />
            <button onClick={handleSendFollowUp} disabled={state.isProcessingFollowUp || !state.currentFollowUpQuery.trim()} className="lol-button lol-button-primary mt-2 text-sm py-2 px-3 flex items-center justify-center">
              <PaperAirplaneIcon className="w-4 h-4 mr-1.5"/> Send Follow-Up
            </button>
            {state.isProcessingFollowUp && <div className="text-sm text-slate-400 mt-1"><LoadingSpinner/> Processing...</div>}
          </div>
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-slate-700/50 flex flex-wrap justify-center gap-3">
        <button onClick={handleUndoAction} disabled={!canUndo} className="lol-button lol-button-secondary text-sm py-2 px-3">
          <ArrowUturnLeftIcon className="w-4 h-4 mr-1.5"/> Undo Last
        </button>
        <button onClick={handleGetFullAnalysis} disabled={!isDraftComplete || state.isLoadingFullAnalysis} className="lol-button lol-button-primary text-sm py-2 px-3">
          <OracleEyeIcon className="w-4 h-4 mr-1.5"/> {state.analysis ? 'Re-Analyze Full Draft' : 'Full Draft Analysis'}
        </button>
        <button onClick={handleResetDraft} className="lol-button bg-red-700 hover:bg-red-600 border-red-600 text-sm py-2 px-3">
          <ClearIcon className="w-4 h-4 mr-1.5"/> Reset Draft
        </button>
      </div>

      {isDraftComplete && state.analysis && !state.isDraftSavedToHistory && (
        <div className="mt-4 text-center text-yellow-400 text-xs animate-fadeIn">
          <p>Consider saving this completed draft to your History or Playbook!</p>
        </div>
      )}

      {ddragonVersion && (
        <ChampionGridModal
          isOpen={state.isChampionGridOpen}
          onClose={() => dispatch({ type: 'CLOSE_CHAMPION_GRID' })}
          champions={allChampionsData}
          ddragonVersion={ddragonVersion}
          onChampionSelect={(champion) => {
            if (state.championGridCallback) state.championGridCallback(champion);
            dispatch({ type: 'CLOSE_CHAMPION_GRID' });
          }}
          disabledChampionIds={disabledChampionIds}
          modalTitle={state.championGridTitle}
          championStaticData={staticChampionData as ChampionStaticInfo[]}
        />
      )}
      <PreferencesModal
        isOpen={state.isPreferencesModalOpen}
        onClose={() => dispatch({ type: 'CLOSE_PREFERENCES_MODAL' })}
        currentPreferences={{ preferredRoles: state.preferredRoles, championPool: state.championPool }}
        onSavePreferences={handleSavePreferences}
      />
      {state.analysis && (
        <InGameCheatSheetModal 
            isOpen={state.isCheatSheetModalOpen}
            onClose={() => dispatch({type: 'CLOSE_CHEAT_SHEET_MODAL'})}
            analysis={state.analysis}
            ddragonVersion={ddragonVersion}
            allChampionsData={allChampionsData}
            allItemsData={allItemsData}
        />
      )}
      <SaveToPlaybookModal
        isOpen={state.isSavePlaybookModalOpen}
        onClose={() => dispatch({type: 'CLOSE_SAVE_PLAYBOOK_MODAL'})}
        onSave={handleSaveToPlaybook}
        currentName={isDraftComplete && state.yourTeamPicks.length > 0 ? `Draft vs ${state.enemyTeamPicks[0]?.champion || 'Enemy'} - ${new Date().toLocaleDateString()}` : undefined}
      />
    </div>
  );
};
