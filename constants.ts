
import { OraclePersonality, PuzzleRatingKey, AppTheme } from "./types";

export const MAX_CHAMPIONS_PER_TEAM = 5;
export const MAX_BANS_PER_TEAM = 5;
export const LOL_ROLES = ['Top', 'Jungle', 'Mid', 'ADC', 'Support'];
export const APP_TITLE = "LoL Draft Oracle";
export const GEMINI_MODEL_NAME = 'gemini-2.5-flash-lite-preview-06-17'; 

export const DRAFT_STATE_STORAGE_KEY = 'lolDraftOracleState_v4';
export const DRAFT_HISTORY_STORAGE_KEY = 'lolDraftOracleHistory_v1';
export const APP_SETTINGS_STORAGE_KEY = 'lolDraftOracleAppSettings_v1';
export const PLAYBOOK_STORAGE_KEY = 'lolDraftOraclePlaybook_v1';
export const ONBOARDING_COMPLETED_KEY = 'lolDraftOracleOnboardingCompleted_v1';
export const ORACLE_TRIALS_STORAGE_KEY = 'lolDraftOracleTrialsState_v1';
export const VIEWED_CONCEPTS_STORAGE_KEY = 'lolDraftOracleViewedConcepts_v1';


export const DEFAULT_ORACLE_PERSONALITY: OraclePersonality = 'Default';
export const DEFAULT_THEME: AppTheme = 'dark';

export const ORACLE_TRIAL_RATINGS: Record<PuzzleRatingKey, string> = {
  adept: "An insightful choice. You have the foresight of an Adept.",
  master: "Masterful. Your strategic mind is worthy of a Master Tactician.",
  oracle: "Perfect. You see the threads of fate as clearly as the Oracle itself.",
  plausible: "A plausible path, yet the Oracle perceives a clearer route to victory.",
  consider: "The threads of fate are tangled here. Consider another way.",
};