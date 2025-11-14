export type Page =
  | 'Home'
  | 'Strategy Forge'
  | 'Archives'
  | 'Academy'
  | 'Draft Arena'
  | 'Armory'
  | 'Daily Challenge'
  | 'Profile'
  | 'Oracle'
  | 'Live Co-Pilot'
  | 'Draft Scenarios';
export type DraftMode = 'competitive' | 'soloq';

export interface DashboardCardSetting {
  id: 'trial' | 'playbook' | 'draft-lab';
  enabled: boolean;
}

export interface Settings {
  theme: 'light' | 'dark';
  primaryRole: string;
  secondaryRole: string;
  favoriteChampions: string[]; // Champion IDs
  language: 'en' | 'pt';
  enableSound: boolean;
  dashboardCards: DashboardCardSetting[];
}

export interface Ability {
  name: string;
  description: string;
  key: 'Passive' | 'Q' | 'W' | 'E' | 'R';
}

export interface Champion {
  id: string;
  name: string;
  image: string;
  splashUrl: string;
  loadingScreenUrl: string;
  title: string;
  lore: string;
  playstyle: string;
  roles: string[];
  class: string[];
  subclass: string[];
  damageType: 'AD' | 'AP' | 'Mixed';
  cc: 'Low' | 'Medium' | 'High';
  engage: 'Low' | 'Medium' | 'High';
  abilities: Ability[];
}

export interface ChampionLite {
  id: string;
  name: string;
  image: string;
  roles: string[];
  damageType: 'AD' | 'AP' | 'Mixed';
}

export type TeamSide = 'blue' | 'red';

export interface DraftTurn {
  team: TeamSide;
  type: 'ban' | 'pick';
  index: number;
}

export interface ChampionMatchup {
  championName: string;
  tip?: string;
  reasoning?: string;
}

export interface GroundingChunk {
  web?: {
    title?: string;
    uri?: string;
  };
}

export interface DraftSlot {
  champion: Champion | null;
  isActive: boolean;
}

export interface TeamState {
  picks: DraftSlot[];
  bans: DraftSlot[];
}

export interface DraftState {
  blue: TeamState;
  red: TeamState;
  turn: 'blue' | 'red';
  phase: 'ban1' | 'pick1' | 'ban2' | 'pick2';
}

export interface DraftWeakness {
  description: string;
  keyword?: string;
}

export interface SynergyDetail {
  championNames: string[];
  reasoning: string;
}

export interface TeamAnalysis {
  strengths: string[];
  weaknesses: DraftWeakness[];
  winCondition: string;
  teamIdentity: string;
  powerSpike: string;
  keyThreats: string;
  draftScore?: string; // e.g., "A-", "B+"
  draftScoreReasoning?: string;
  draftHighlight?: { championName: string; reasoning: string };
  powerSpikeTimeline?: { time: string; bluePower: number; redPower: number; event: string }[];
  keyMatchups?: { role: string; blueChampion: string; redChampion: string; analysis: string }[];
  synergies?: SynergyDetail[];
  antiSynergies?: SynergyDetail[];
}

export interface PickSuggestion {
  championName: string;
  role: string;
  reasoning: string;
  synergy: string;

  counter: string;
}

export interface BanSuggestion {
  championName: string;
  reasoning: string;
}

export interface RuneSuggestion {
  primaryPath: string;
  keystone: string;
  secondaryPath: string;
}

export interface ItemAndRuneSuggestion {
  championName: string;
  role: string;
  coreItems: string[];
  situationalItems: { item: string; reason: string }[];
  runes: RuneSuggestion;
  reasoning: string;
}

export interface AIAdvice {
  draftId?: string; // ID of the draft state this advice was generated for
  teamAnalysis: {
    blue: TeamAnalysis;
    red: TeamAnalysis;
  };
  pickSuggestions: PickSuggestion[];
  banSuggestions: BanSuggestion[];
  buildSuggestions?: ItemAndRuneSuggestion[];
}

// New type for contextual champion suggestions
export interface ChampionSuggestion {
  championName: string;
  reasoning: string;
}

// New types for lightweight draft storage to prevent stale data
export interface SavedTeamState {
  picks: (string | null)[]; // Champion IDs
  bans: (string | null)[]; // Champion IDs
}
export interface SavedDraft {
  blue: SavedTeamState;
  red: SavedTeamState;
  turn: 'blue' | 'red';
  phase: 'ban1' | 'pick1' | 'ban2' | 'pick2';
}

export interface PlaybookPlusDossier {
  winCondition: string;
  earlyGame: string;
  midGame: string;
  teamfighting: string;
}

export interface HistoryEntry {
  id: string;
  name: string;
  draft: SavedDraft; // Use the lightweight draft structure
  userSide: TeamSide; // Track which side the user played for stats
  analysis?: AIAdvice | null;
  userNotes?: string; // For Playbook+
  dossier?: PlaybookPlusDossier;
  createdAt: string;
  status?: 'pending' | 'saved' | 'error';
  tags?: string[]; // New field for user-defined tags
  result?: 'win' | 'loss' | 'remake'; // New field for win/loss tracking
}

export interface MetaSource {
  title: string;
  uri: string;
}

// --- New Meta Snapshot Types ---
export interface TrendingChampion {
  championName: string;
  reasoning: string;
}
export interface TrendingChampionsByRole {
  role: string;
  champions: TrendingChampion[];
}
export interface MetaSnapshot {
  summary: string;
  trendingChampions: TrendingChampionsByRole[];
  sources: MetaSource[];
}
// --- End Meta Snapshot Types ---

// --- New Intel Hub Types ---
export interface TieredChampion {
  championName: string;
  reasoning: string;
}
export interface RoleTierList {
  role: string;
  champions: TieredChampion[];
}
export interface StructuredTierList {
  summary: string;
  tierList: RoleTierList[];
  sources: MetaSource[];
}

export interface PatchChange {
  name: string;
  change: string;
}
export interface StructuredPatchNotes {
  summary: string;
  buffs: PatchChange[];
  nerfs: PatchChange[];
  systemChanges: PatchChange[];
  sources: MetaSource[];
}
// --- End Intel Hub Types ---
// --- New Personalized Patch Notes Types ---
export interface PersonalizedPatchChange {
  name: string; // Champion or item name
  change: string; // Description of the change
  reasoning: string; // Why this is relevant to the user
}
export interface PersonalizedPatchSummary {
  summary: string; // Personalized high-level summary
  relevantBuffs: PersonalizedPatchChange[];
  relevantNerfs: PersonalizedPatchChange[];
}
// --- End Personalized Patch Notes Types ---

export interface TierList {
  summary: string;
  sources: MetaSource[];
}

// Trials Types
export interface TrialQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

// Academy Types
export interface KeywordDefinition {
  term: string;
  definition: string;
  lessonId: string;
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  practiceChampionIds?: string[];
}

export interface LessonCategory {
  name: string;
  lessons: Lesson[];
}

// --- Gamification & Profile Types ---

export interface Mission {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  rewardSP: number;
  completed: boolean;
}

export interface ChampionMastery {
  championId: string;
  points: number;
  highestGrade: string; // e.g., "S+", "A-"
}

export type ArenaBotPersona =
  | 'The Aggressor'
  | 'The Strategist'
  | 'The Trickster'
  | 'The Meta Slave'
  | 'The One-Trick'
  | 'The Chaos Draft'
  | 'The Guardian'
  | 'The Split Pusher';
export interface ArenaStats {
  averageScore: number; // Stored as a percentile, e.g., 85.5
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  preferredPersona?: ArenaBotPersona;
  winRateVsBot: number; // Win rate as a percentage, e.g., 55.5
  totalArenaGames: number;
}

export interface RecentFeedback {
  id: string;
  type: 'adjustment' | 'lesson';
  message: string;
  timestamp: string;
}

export type TeamfightRole = 'Engage' | 'Disengage' | 'Peel' | 'Damage Dealer' | 'Utility';

export interface UserProfile {
  id: string; // Primary key for IndexedDB
  username: string;
  avatar: string; // Champion ID
  skillLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  goals: string[];
  sp: number; // Strategic Points
  level: number;
  rank: string; // e.g., 'Iron Analyst'
  badges: string[]; // e.g., ['Rookie Strategist']
  streak: number;
  lastActiveDate: string; // ISO date string 'YYYY-MM-DD'
  lastLabAnalysisDate: string; // 'YYYY-MM-DD'
  missions: {
    daily: Mission[];
    weekly: Mission[];
    gettingStarted: Mission[];
  };
  championMastery: ChampionMastery[];
  arenaStats: ArenaStats;
  recentFeedback: RecentFeedback[];
  teamfightRole?: TeamfightRole;
  dynamicProTip?: {
    tip: string;
    generatedAt: string; // ISO date string
  };
}
// --- End Gamification Types ---

// --- Feedback System Types ---
export type FeedbackCategory = 'AI Suggestion Quality' | 'Bug Report' | 'Feature Request' | 'UI/UX Feedback' | 'Other';
// --- End Feedback System Types ---

// --- New Champion Analysis Type ---
export interface ChampionAnalysis {
  build: {
    startingItems: string[];
    coreItems: string[];
    situationalItems: { item: string; reason: string }[];
  };
  runes: {
    primaryPath: string;
    primaryKeystone: string;
    primaryRunes: string[];
    secondaryPath: string;
    secondaryRunes: string[];
  };
  skillOrder: string[];
  composition: {
    idealArchetypes: string[];
    synergisticChampions: string[];
  };
  counters: {
    strongAgainst: { championName: string; reasoning: string }[];
    weakAgainst: { championName: string; reasoning: string }[];
  };
  playstyle: {
    earlyGame: string;
    midGame: string;
    lateGame: string;
  };
}
// --- End Champion Analysis Type ---

// --- New Matchup Analysis Type ---
export interface MatchupAnalysis {
  strongAgainstTips: { championName: string; tip: string }[];
  weakAgainstTips: { championName: string; tip: string }[];
}
// --- End Matchup Analysis Type ---

// --- New Draft Scenarios Type ---
export interface DraftScenario {
  id: string;
  title: string;
  description: string;
  draft: SavedDraft;
  userContext: {
    side: TeamSide;
    type: 'pick'; // For now, only support pick scenarios
    index: number;
  };
  options: {
    championId: string;
    isCorrect: boolean;
    explanation: string; // Explanation for this specific choice
  }[];
  correctChoiceExplanation: string; // Overall explanation for the correct answer
}
// --- End Draft Scenarios Type ---
