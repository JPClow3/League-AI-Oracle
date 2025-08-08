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

export interface DetailedItemAnalysis {
    name: string;
    cost: string;
    stats: string[];
    mechanics: string;
    strategicPurpose: string;
    situationalApplication: string;
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
  SCOUT = 'SCOUT',
  ARMORY = 'ARMORY',
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
  championPool: string[]; // Champion IDs for "Favorites to Practice"
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
  deconstruction?: CompositionDeconstruction;
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

  // Unified Riot Data object
  riotData?: {
      puuid: string;
      gameName: string;
      tagLine: string;
      region: string;
      summoner?: SummonerDTO;
      mastery?: ChampionMasteryDTO[];
      league?: LeagueEntryDTO[];
  }
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
  performanceAnalysis?: PerformanceAnalysis;
  matchId?: string;
}

export interface PerformanceAnalysisInsight {
    category: 'Win Condition' | 'Itemization' | 'Objectives' | 'Teamfighting' | 'Laning';
    evaluation: 'Excellent' | 'Good' | 'Average' | 'Poor' | 'Critical';
    feedback: string;
}

export interface PerformanceAnalysis {
    overallExecutionSummary: string;
    insights: PerformanceAnalysisInsight[];
}

export interface AIChat {
    session: Chat;
    history: {
        isUser: boolean;
        text: string;
        isStreaming?: boolean;
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

export interface CounterIntelligence {
    vulnerabilities: string[];
    counterArchetypes: string[];
    quickTip: string;
}

export interface ContextualDraftTip {
    insight: string;
    suggestedLessonId: string;
}

export interface StrategicBlindSpot {
  blindSpotKey: string;
  winRate: number;
  gamesAnalyzed: number;
  suggestedLessonId: string;
  suggestedLessonTitle: string;
  insight: string;
}

export interface ChampionPerformance {
    championId: string;
    games: number;
    wins: number;
    losses: number;
    winRate: number;
}

export interface MetaComposition {
  id: string;
  name: string;
  description: string;
  champions: { name: string; role: Role }[];
}

export interface CompositionDeconstruction {
    coreIdentity: string;
    strategicGoal: string;
    keySynergies: {
        championNames: string[];
        description: string;
    }[];
    winCondition: {
        championName: string;
        reasoning: string;
    };
    powerCurve: {
        summary: string;
        details: string;
    };
    itemDependencies: {
        championName:string;
        items: string[];
        reasoning: string;
    }[];
}

export interface ChampionAbilityAnalysis {
    key: 'P' | 'Q' | 'W' | 'E' | 'R';
    name: string;
    proTip: string;
}

// Data for Champion Vault
export interface ChampionVaultEntry {
    championId: string; // e.g., 'Aatrox'
    overview: string;
    playstyle: string;
    strengths: string[];
    weaknesses: string[];
    abilities: ChampionAbilityAnalysis[];
    build: {
        coreItems: { name: string, description: string }[];
        explanation: string;
    };
}

export interface SynergyAndCounterAnalysis {
    synergies: { championName: string; reasoning: string; }[];
    counters: { championName:string; reasoning: string; }[];
}

export interface PlayerProfile {
    personaTag: string;
    insight: string;
    error?: string; // To handle cases where analysis fails for one player
}

export interface LiveGameParticipant {
    puuid: string;
    champion: Champion | null;
    summonerName: string;
    teamId: 100 | 200;
    profile?: PlayerProfile;
    isLoadingProfile: boolean;
}


// Riot API Types
export interface RiotAccount {
    puuid: string;
    gameName: string;
    tagLine: string;
}

export interface SummonerDTO {
    id: string;
    accountId: string;
    puuid: string;
    name: string;
    profileIconId: number;
    revisionDate: number;
    summonerLevel: number;
}

export interface ChampionMasteryDTO {
    championId: number;
    championLevel: number;
    championPoints: number;
    lastPlayTime: number;
    championPointsSinceLastLevel: number;
    championPointsUntilNextLevel: number;
    chestGranted: boolean;
    tokensEarned: number;
    summonerId: string;
}

export interface LeagueEntryDTO {
  leagueId: string;
  summonerId: string;
  summonerName: string;
  queueType: 'RANKED_SOLO_5x5' | 'RANKED_FLEX_SR' | string;
  tier: 'IRON' | 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'EMERALD' | 'DIAMOND' | 'MASTER' | 'GRANDMASTER' | 'CHALLENGER' | string;
  rank: 'I' | 'II' | 'III' | 'IV';
  leaguePoints: number;
  wins: number;
  losses: number;
}

export interface LiveGameDTO {
    gameId: number;
    mapId: number;
    gameMode: string;
    gameType: string;
    gameQueueConfigId: number;
    participants: {
        puuid: string;
        championId: number;
        summonerName: string;
        teamId: 100 | 200;
        summonerId: string;
    }[];
    gameStartTime: number;
    gameLength: number;
}

export interface MatchDTO {
    metadata: {
        matchId: string;
        participants: string[]; // List of puuids
    };
    info: {
        gameCreation: number;
        gameDuration: number;
        gameMode: string;
        participants: ParticipantDTO[];
        teams: TeamDTO[];
    };
}

export interface ParticipantDTO {
    puuid: string;
    summonerName: string;
    championName: string;
    teamId: 100 | 200; // 100 for blue, 200 for red
    win: boolean;
    kills: number;
    deaths: number;
    assists: number;
    totalDamageDealtToChampions: number;
    goldEarned: number;
    visionScore: number;
    item0: number;
    item1: number;
    item2: number;
    item3: number;
    item4: number;
    item5: number;
    item6: number; // trinket
}

export interface TeamDTO {
    teamId: 100 | 200;
    win: boolean;
    objectives: {
        baron: { first: boolean; kills: number };
        champion: { first: boolean; kills: number };
        dragon: { first: boolean; kills: number };
        inhibitor: { first: boolean; kills: number };
        riftHerald: { first: boolean; kills: number };
        tower: { first: boolean; kills: number };
    }
}