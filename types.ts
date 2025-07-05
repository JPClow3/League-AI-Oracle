import { Chat } from '@google/genai';

export interface ChampionStaticInfo {
  name: string;
  primaryRole: string;
  championClass?: string;
  championSubclass?: string;
  ddragonKey: string;
  damageType?: 'Physical' | 'Magic' | 'Mixed';
  ccTypes?: string[];
  engagePotential?: 'Low' | 'Medium' | 'High';
  teamArchetypes?: string[];
}

export interface Champion {
  id: string;
  key: string;
  name: string;
  title: string;
  blurb: string;
  info: {
    attack: number;
    defense: number;
    magic: number;
    difficulty: number;
  };
  image: {
    full: string;
    sprite: string;
    group: string;
    x: number;
    y: number;
    w: number;
    h: number;
  };
  tags: string[];
  partype: string;
  stats: Record<string, number>;
  // Custom static data
  primaryRole?: Role;
  championClass?: string;
  championSubclass?: string;
  damageType?: 'AD' | 'AP' | 'Hybrid' | 'True';
  ccTypes?: string[];
  engagePotential?: 'Low' | 'Medium' | 'High';
  teamArchetypes?: string[];
}

export interface Item {
  name: string;
  description: string;
  colloq: string;
  plaintext: string;
  into?: string[];
  image: {
    full: string;
    sprite: string;
    group: string;
    x: number;
    y: number;
    w: number;
    h: number;
  };
  gold: {
    base: number;
    purchasable: boolean;
    total: number;
    sell: number;
  };
  tags: string[];
  maps: Record<string, boolean>;
  stats: Record<string, number>;
  depth?: number;
}

export interface DDragonData {
  version: string;
  champions: Record<string, Champion>;
  items: Record<string, Item>;
}

export enum View {
  HOME = 'HOME',
  PROFILE = 'PROFILE',
  DRAFTING = 'DRAFTING',
  DRAFT_LAB = 'DRAFT_LAB',
  VAULT = 'VAULT',
  LESSONS = 'LESSONS',
  TRIALS = 'TRIALS',
  HISTORY = 'HISTORY',
  PLAYBOOK = 'PLAYBOOK',
  SETTINGS = 'SETTINGS',
}

export type Role = 'TOP' | 'JUNGLE' | 'MIDDLE' | 'BOTTOM' | 'SUPPORT';

export interface UserSettings {
  oraclePersonality: 'Default' | 'Concise' | 'For Beginners';
  preferredRoles: Role[];
  championPool: string[]; // Champion IDs
  xp: number;
  completedLessons: string[]; // array of lesson IDs
  completedTrials: string[]; // array of trial IDs
}

export interface PlaybookEntry {
  id: string;
  name: string;
  description: string;
  draftState: DraftState;
  analysis: AIAnalysis;
}

export interface Profile {
  id: string;
  name: string;
  avatar: string;
  settings: UserSettings;
  draftHistory: DraftHistoryEntry[];
  playbook: PlaybookEntry[];
  isNew?: boolean; // Flag for first-time profile creation
  isOnboarded?: boolean; // Flag for completing the guided setup
}

export type Team = 'BLUE' | 'RED';
export type DraftActionType = 'PICK' | 'BAN';

export interface DraftSlot {
  champion: Champion | null;
  role: Role;
}

export interface DraftState {
  mode: 'SOLO_QUEUE' | 'COMPETITIVE';
  blueTeam: {
    picks: DraftSlot[];
    bans: (Champion | null)[];
  };
  redTeam: {
    picks: DraftSlot[];
    bans: (Champion | null)[];
  };
  currentTurn: number;
  pickedChampions: Set<string>; // To prevent duplicate picks
  history: DraftState[]; // For undo
  analysis?: AIAnalysis; // Allow analysis to be attached to a state
}

export type DraftReducerAction =
  | { type: 'SET_CHAMPION'; payload: { champion: Champion } }
  | { type: 'SWAP_ROLES'; payload: { team: Team; index1: number; index2: number } }
  | { type: 'UNDO_LAST_ACTION' }
  | { type: 'RESET_DRAFT'; payload: { mode: 'SOLO_QUEUE' | 'COMPETITIVE' } };

export interface WinCondition {
    text: string;
    category: 'Protect' | 'Siege' | 'Objective' | 'Pick' | 'Teamfight' | 'Macro';
}

export interface PowerSpikeData {
    early: number; // 1-10 scale
    mid: number; // 1-10 scale
    late: number; // 1-10 scale
}

export interface PowerSpikeDetails {
    phase: 'Early' | 'Mid' | 'Late';
    championSpikes: { championName: string; reason: string; }[];
}

export interface AIAnalysis {
    teamIdentities: { blue: string; red: string };
    damageProfiles: { blue: string; red: string };
    keySynergies: { blue: string[]; red: string[] };
    powerSpikes: {
        blue: PowerSpikeData;
        red: PowerSpikeData;
        summary: { blue: string; red: string; };
        details?: PowerSpikeDetails[];
    };
    winConditions: { blue: WinCondition[]; red: WinCondition[] };
    strategicFocus: string;
    coreItemBuilds?: {
      blue: { championName: string; items: string[] }[];
      red: { championName: string; items: string[] }[];
    };
    mvp: { championName: string; reasoning: string; };
    enemyThreats: { 
        championName: string; 
        threatLevel: 'High' | 'Medium' | 'Low'; 
        counterplay: string; 
        itemSpikeWarning?: string;
    }[];
    bansImpact: { blue: string; red: string; };
    inGameCheatSheet: {
        blue: string[];
        red: string[];
    };
}

export interface InitialAIAnalysis {
  macroStrategy: string;
  keyMicroTips: string[];
}

export interface MatchupAnalysis {
  powerSpikes: { champion: string; details: string }[];
  tradingPatterns: string;
  waveManagement: string;
  jungleImpact: string;
}

export type ScoreType = 'CC' | 'Engage' | 'Damage Profile';

export interface TeamAnalytics {
  damageProfile: { ad: number; ap: number; hybrid: number };
  ccScore: { value: number; label: string };
  engageScore: { value: number; label: string };
  teamDNA: Record<string, number>;
}

export interface AIExplanation {
  explanation: string;
}

export type Aura = 'neutral' | 'positive' | 'negative' | 'thinking' | 'ad-focused' | 'ap-focused';

export interface PostGameAIAnalysis {
  reevaluation: string;
  suggestedLessonId?: string;
  suggestedLessonTitle?: string;
}

export interface KnowledgeConcept {
  id: string;
  category: string;
  title: string;
  description: string;
  content: string | RichLessonContent;
  icon: string;
}

export interface LessonSection {
    title: string;
    champions: string[];
    text: string;
}

export interface PowerCurveSection extends LessonSection {
    id: 'early' | 'mid' | 'late';
}

export interface CaseStudy {
    title: string;
    description: string;
    teamA: { name: string; champions: string[] };
    teamB: { name: string; champions: string[] };
    solution: {
        champions: string[];
        text: string;
    };
}

export interface RichLessonContent {
    intro: {
        title: string;
        summary: string;
    };
    powerCurves: {
        title: string;
        description: string;
        curves: PowerCurveSection[];
    };
    caseStudy: CaseStudy;
    miniChallenge: {
        question: string;
        options: { championName: string; isCorrect: boolean; }[];
        feedback: {
            correct: string;
            incorrect: string;
        };
    };
}

export interface TrialDraftPick {
    championName: string;
    role: Role;
}

export interface TrialDraftState {
    blueTeam: { picks: TrialDraftPick[] };
    redTeam: { picks: TrialDraftPick[] };
}

export interface Trial {
  id: string;
  lessonId: string; // The lesson that unlocks this trial
  title: string;
  scenario: string;
  question: string;
  draftState?: TrialDraftState;
  options: {
    text: string;
    isCorrect: boolean;
  }[];
}

export interface TrialFeedback {
    feedback: string;
    isCorrect: boolean;
}

export interface DraftHistoryEntry {
  id: string;
  date: string;
  outcome?: 'WIN' | 'LOSS';
  analysis: AIAnalysis;
  draftState: DraftState;
  inDraftNotes?: string;
  postGameNotes?: string;
  postGameAnalysis?: PostGameAIAnalysis;
}

export interface AIChat {
    session: Chat;
    history: {
        isUser: boolean;
        text: string;
    }[];
}


export type ContextMenuItemAction = 'ADD_TO_POOL' | 'REMOVE_FROM_POOL';

export interface ContextMenuItem {
    label: string;
    action: ContextMenuItemAction;
    icon: React.ReactNode;
}

export interface MetaSnapshot {
    trendingUp: { championName: string; reason: string; }[];
    trendingDown: { championName: string; reason: string; }[];
    patchSummary: string;
}

export interface GroundingSource {
    web: {
        uri: string;
        title: string;
    }
}

export interface PuzzleOption {
    championName: string;
    isCorrect: boolean;
    reasoning: string;
}

export interface DraftPuzzle {
    id: string;
    scenario: string;
    problem: string;
    bluePicks: string[];
    redPicks: string[];
    options: PuzzleOption[];
}

export interface SharePayload {
    draftState: DraftState;
    analysis: AIAnalysis;
}

// Data for Champion Vault
export interface ChampionAbilityInfo {
  key: 'Passive' | 'Q' | 'W' | 'E' | 'R';
  name: string;
  description: string;
}

export interface ChampionVaultData {
    playstyleSummary: string;
    abilities: ChampionAbilityInfo[];
    coreItems: string[];
    whenToPick: string[];
    counters: string[];
    counteredBy: string[];
    synergies: {
        lanePartner: string[];
        jungler: string[];
    };
}