

import React from 'react';
// import { IconProps } from './components/icons/IconProps'; // This line was problematic, IconProps should be defined here or imported correctly.

// Define and export IconProps here
export interface IconProps {
  className?: string;
  title?: string; 
}


export enum Team {
  YourTeam = 'YourTeam',
  EnemyTeam = 'EnemyTeam',
}

export type TeamSide = 'BLUE' | 'RED';

export interface ChampionSlot {
  champion: string;
  role: string;
  ddragonKey?: string;
}

export interface GroundingChunk {
  web?: {
    uri?: string;
    title?: string;
  };
  retrievedContext?: {
    uri?: string;
    title?: string;
  };
}

// --- Structured JSON Response Types ---
export interface StructuredDraftRecItemAdvice {
  name: string; // Item Name
  reason: string; // Why this item
}

export interface StructuredDraftRecChampionArmory {
  champion: string;
  coreItems: StructuredDraftRecItemAdvice[];
  situationalItems: {
    condition: string;
    items: StructuredDraftRecItemAdvice[];
  }[];
}

export interface StructuredDraftRec {
  overallSynopsis: {
    yourTeamIdentity: string;
    enemyTeamIdentity: string;
    expectedTempo: string;
  };
  teamCompositionSnapshot: {
    yourTeamDamageProfile: string;
    enemyTeamDamageProfile: string;
  };
  oracleArmoryRecommendations: StructuredDraftRecChampionArmory[];
  strategicFocus: {
    laningPhase: string;
    keyPowerSpikes: string;
    midGameObjectivePriority: string;
    teamfightExecution: string;
  };
  enemyTeamThreats: {
    primaryThreats: string; // Could be array of objects if more detail needed
    counterplayStrategy: string;
  };
  impactOfBans: string;
  userPreferenceAlignment?: string; // Optional
  keyInGameReminders: {
    ourTopWinCondition: string;
    enemyTopWinCondition: string;
    keyThreatsSummary: string; // Simplified
    targetPriorityInFights: string;
    crucialItemizationNote: string;
  };
}

export interface StructuredExplorerRecChampionDetail {
  counters?: string[];
  synergies?: string[];
  strategicUse?: string;
  itemBuilds?: string; // Could be more structured if needed
  strengths?: string;
  weaknesses?: string;
}
export interface StructuredExplorerRec {
  directAnswer: string; // Direct answer to the user's query
  championInsights?: Record<string, StructuredExplorerRecChampionDetail>; // Keyed by champion name
  generalStrategicPoints?: string[];
  keyTakeaways?: string[];
}

export interface StructuredArmoryRec {
  strategicNiche: string;
  idealUsers: string; // Could be array of strings or objects
  keyScenarios: string;
  buildTiming: string;
  commonMistakes: string;
  goldEfficiencySummary: string;
  synergisticItems?: string[]; // New field
  counterItems?: string[];    // New field
}

export interface StructuredThreatRecItem {
  champion: string;
  items: StructuredDraftRecItemAdvice[];
}

export interface StructuredThreatRec {
  threatProfile: {
    keyStrengths: string;
    typicalBuildPath: string; // Could be array of item names
    primaryThreatVectors: string;
  };
  counterStrategy: {
    itemizationChoices: StructuredThreatRecItem[];
    strategicAdjustments: {
      laningPhase: string;
      teamfights: string;
      objectiveControl: string;
      visionAndGanking: string;
    };
  };
}

export type AnalysisDataType = 
  | StructuredDraftRec 
  | StructuredExplorerRec 
  | StructuredArmoryRec 
  | StructuredThreatRec 
  | string; // Fallback for text-only or errors

export type AnalysisType = 'draft' | 'explorer' | 'armory' | 'threat' | 'text_direct' | 'error';


export interface DraftAnalysis {
  analysisData: AnalysisDataType;
  analysisType: AnalysisType;
  sources: GroundingChunk[];
  originalPrompt?: string; 
  overallSentiment?: 'positive' | 'critical_flaw' | 'neutral'; 
  auraSentiment?: 'pleased' | 'concerned' | 'neutral'; 
}
// --- End Structured JSON Response Types ---


export interface EnemyItemSpikeWarning {
  enemyChampionName: string;
  predictedCoreItems: string[]; // Array of item names, e.g., ["{{ItemX}}", "{{ItemY}}"]
  threatDescription: string;
  strategicConsideration: string;
}

export interface IndividualPickSuggestion {
  champion: string;
  reason:string;
}

export interface PickSuggestion {
  suggestions: IndividualPickSuggestion[];
  explanation?: string;
  enemyItemSpikeWarnings?: EnemyItemSpikeWarning[];
  sources: GroundingChunk[];
}

export interface IndividualBanSuggestion {
  champion: string;
  reason: string;
}

export interface BanSuggestion {
  suggestions: IndividualBanSuggestion[];
  explanation?: string;
  enemyItemSpikeWarnings?: EnemyItemSpikeWarning[];
  sources: GroundingChunk[];
}


export type OraclePersonality = 'Default' | 'Concise' | 'ForBeginners';
export type AppTheme = 'light' | 'dark';

export interface AppSettings {
  oraclePersonality: OraclePersonality;
  enableAnimations?: boolean; 
  isFocusModeActive?: boolean; 
  theme?: AppTheme;
}


export interface ChampionStaticInfo {
  name: string;
  primaryRole: string;
  championClass?: string;
  championSubclass?: string;
  ddragonKey?: string;
  damageType?: 'Physical' | 'Magic' | 'Mixed' | 'True';
  ccTypes?: string[];
  engagePotential?: 'Low' | 'Medium' | 'High';
  teamArchetypes?: string[];
  metaTier?: 'S' | 'A' | 'B' | 'C' | 'D';
  currentPatchWinRate?: number;
  notesOnMeta?: string;
}

export interface ItemStaticInfo {
  id: string; // DDragon item NUMERICAL ID (e.g., "3031" for Infinity Edge)
  name: string; 
  cost?: number; 
  stats?: string[]; // Descriptive stats from documents
  type: 'Legendary' | 'Epic' | 'Basic' | 'Boot' | 'SupportUpgrade' | 'Consumable' | 'Starter';
  strategicSummary?: string; 
  passiveName?: string; 
  passiveDescription?: string;
  activeName?: string;
  activeDescription?: string;
  purposeAndSynergies?: string;
  situationalApplication?: string;
  primaryUsers?: string[]; 
  countersInfo?: string; 
  buildPathNotes?: string; 
  goldEfficiencyNotes?: string; 
  keywords?: string[]; 
}


export type AppView = 'HOME' | 'DRAFT' | 'EXPLORER' | 'HISTORY' | 'SETTINGS' | 'PLAYBOOK' | 'DRAFT_LAB' | 'INTERACTIVE_LESSON' | 'ORACLE_TRIALS' | 'ARMORY';
export type DraftMode = 'SOLO_QUEUE' | 'COMPETITIVE';


// --- Data Dragon Types ---
export interface DDragonImage {
  full: string; 
  sprite: string;
  group: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface DDragonChampionInfo {
  id: string; 
  key: string; 
  name: string;
  title: string;
  blurb: string;
  info: any;
  image: DDragonImage;
  tags: string[];
  partype: string;
  stats: any;
}

export interface DDragonChampionsData {
  type: string;
  format: string;
  version: string;
  data: {
    [championId: string]: DDragonChampionInfo; 
  };
}

export interface DDragonItemInfo {
  name: string;
  description: string; 
  colloq: string; 
  plaintext: string; 
  into?: string[]; 
  from?: string[]; 
  image: DDragonImage; 
  gold: {
    base: number;
    purchasable: boolean;
    total: number;
    sell: number;
  };
  tags: string[];
  maps: { [mapId: string]: boolean };
  stats: { [statName: string]: number }; // DDragon stats: object mapping stat name to numerical value
  depth?: number; 
  id?: string; // This is DDragon's string key, like "InfinityEdge". We use numerical ID "3031" as primary.
}

export interface DDragonItemsData {
  type: string;
  version: string;
  basic: DDragonItemInfo; 
  data: {
    [itemId: string]: DDragonItemInfo; // Keyed by DDragon numerical ID string
  };
  groups: any[];
  tree: any[];
}


// --- DraftingScreen Reducer State & Actions ---

export interface UserPreferencesPayload {
  preferredRoles: string[];
  championPool: { [role: string]: string[] };
}

// --- New Draft Flow Types ---
export interface DraftStep {
  type: 'PICK' | 'BAN';
  team: Team; 
  phase: string; 
}

// --- MVP Analysis Type ---
export interface MvpData {
  championName: string;
  reason: string;
  ddragonKey?: string; 
}

export interface SavedDraftState {
  yourTeamPicks: ChampionSlot[];
  enemyTeamPicks: ChampionSlot[];
  yourTeamBans: string[];
  enemyTeamBans: string[];
  currentDraftMode: DraftMode; 
  userStartingSide: TeamSide; 
  currentStepIndex: number; 
  isYourTeamTurn: boolean; 

  preferredRoles?: string[];
  championPool?: { [role: string]: string[] };
  mvpAnalysis?: MvpData | null; 
}


export interface ContentPart {
  text: string;
}
export interface ConversationTurn {
  role: 'user' | 'model';
  parts: ContentPart[];
}

export interface DraftState { 
  draftMode: DraftMode; 
  userStartingSide: TeamSide; 

  draftFlow: DraftStep[]; 
  currentStepIndex: number; 

  yourTeamPicks: ChampionSlot[];
  enemyTeamPicks: ChampionSlot[];
  yourTeamBans: string[];
  enemyTeamBans: string[];
  
  analysis: DraftAnalysis | null;
  pickSuggestions: PickSuggestion | null;
  banSuggestions: BanSuggestion | null;
  mvpAnalysis: MvpData | null; 

  isLoadingFullAnalysis: boolean;
  isSuggestingPick: boolean;
  isLoadingBanSuggestions: boolean;
  isProcessingAction: boolean;
  isLoadingMvpAnalysis: boolean; 

  error: string | null;
  banSuggestionError: string | null;
  mvpAnalysisError: string | null; 

  isChampionGridOpen: boolean;
  championGridCallback: ((champion: DDragonChampionInfo) => void) | null;
  championGridTitle: string;

  isStateLoadedFromStorage: boolean;

  roleSwapState: {
    team: Team;
    originChampionName: string;
    originRole: string;
  } | null;

  preferredRoles: string[];
  championPool: { [role: string]: string[] };
  isPreferencesModalOpen: boolean;
  history: SavedDraftState[]; 
  isDraftSavedToHistory: boolean;
  isCheatSheetModalOpen: boolean;
  isSavePlaybookModalOpen: boolean; 

  conversationHistory: ConversationTurn[]; 
  currentFollowUpQuery: string;
  isProcessingFollowUp: boolean;
}

export type DraftAction =
  | { type: 'LOAD_STATE_FROM_STORAGE'; payload: Partial<SavedDraftState> & { draftMode: DraftMode; userStartingSide: TeamSide } }
  | { type: 'SET_DRAFT_FLOW'; payload: { draftFlow: DraftStep[], draftMode: DraftMode, userStartingSide: TeamSide, preferredRoles: string[], championPool: { [role: string]: string[] } } }
  | { type: 'CONFIRM_ACTION'; payload: { championName: string; championKey?: string } } 
  | { type: 'REQUEST_PICK_SUGGESTIONS_START' }
  | { type: 'REQUEST_PICK_SUGGESTIONS_SUCCESS'; payload: PickSuggestion }
  | { type: 'REQUEST_PICK_SUGGESTIONS_ERROR'; payload: string }
  | { type: 'REQUEST_BAN_SUGGESTIONS_START' }
  | { type: 'REQUEST_BAN_SUGGESTIONS_SUCCESS'; payload: BanSuggestion }
  | { type: 'REQUEST_BAN_SUGGESTIONS_ERROR'; payload: string }
  | { type: 'REQUEST_FULL_ANALYSIS_START' }
  | { type: 'REQUEST_FULL_ANALYSIS_SUCCESS'; payload: DraftAnalysis } 
  | { type: 'REQUEST_FULL_ANALYSIS_ERROR'; payload: string }
  | { type: 'RESET_DRAFT_STATE' }
  | { type: 'OPEN_CHAMPION_GRID'; payload: { callback: (champion: DDragonChampionInfo) => void; title: string } }
  | { type: 'CLOSE_CHAMPION_GRID' }
  | { type: 'SET_PROCESSING_ACTION'; payload: boolean }
  | { type: 'CLEAR_SUGGESTIONS_AND_ANALYSIS' }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_BAN_SUGGESTION_ERROR'; payload: string | null }
  | { type: 'INITIATE_ROLE_SWAP'; payload: RoleSwapPayload }
  | { type: 'COMPLETE_ROLE_SWAP'; payload: RoleSwapPayload }
  | { type: 'CANCEL_ROLE_SWAP' }
  | { type: 'SET_USER_PREFERENCES'; payload: UserPreferencesPayload }
  | { type: 'OPEN_PREFERENCES_MODAL' }
  | { type: 'CLOSE_PREFERENCES_MODAL' }
  | { type: 'UNDO_LAST_ACTION' }
  | { type: 'MARK_DRAFT_AS_SAVED' }
  | { type: 'OPEN_CHEAT_SHEET_MODAL' }
  | { type: 'CLOSE_CHEAT_SHEET_MODAL' }
  | { type: 'OPEN_SAVE_PLAYBOOK_MODAL' } 
  | { type: 'CLOSE_SAVE_PLAYBOOK_MODAL' } 
  | { type: 'SET_FOLLOW_UP_QUERY'; payload: string } 
  | { type: 'SEND_FOLLOW_UP_START' }
  | { type: 'SEND_FOLLOW_UP_SUCCESS'; payload: DraftAnalysis }
  | { type: 'SEND_FOLLOW_UP_ERROR'; payload: string }
  | { type: 'REQUEST_MVP_ANALYSIS_START' }
  | { type: 'REQUEST_MVP_ANALYSIS_SUCCESS'; payload: MvpData }
  | { type: 'REQUEST_MVP_ANALYSIS_ERROR'; payload: string };


export interface ArchivedDraft extends SavedDraftState { 
  id: string;
  timestamp: number;
  analysis: DraftAnalysis | null;
  name?: string; 
  mvpAnalysis?: MvpData | null; 
}

export interface PlaybookEntry extends ArchivedDraft { 
  name: string;
}


export interface ChampionGridModalProps {
  isOpen: boolean;
  onClose: () => void;
  champions: DDragonChampionInfo[];
  ddragonVersion: string;
  onChampionSelect: (champion: DDragonChampionInfo) => void;
  disabledChampionIds?: string[];
  modalTitle?: string;
  championStaticData: ChampionStaticInfo[];
  explorerMode?: boolean;
  explorerSelectedChampionIds?: string[];
  filterAvailableChampions?: string[]; 
}

export interface RecommendationDisplayProps {
  analysis: DraftAnalysis; // This will now contain analysisData and analysisType
  title?: string;
  ddragonVersion: string;
  allChampionsData: DDragonChampionInfo[];
  allItemsData: DDragonItemsData | null; 
  mvpAnalysis?: MvpData | null;
  isLoadingMvp?: boolean;
  overallSentiment?: 'positive' | 'critical_flaw' | 'neutral'; // This might be derived from analysis.overallSentiment now
}

export interface ChampionGridProps {
  champions: DDragonChampionInfo[];
  ddragonVersion: string;
  championStaticData: ChampionStaticInfo[];
  disabledChampionIds?: string[];
  onDragStartChampion: (event: React.DragEvent<HTMLButtonElement>, champion: DDragonChampionInfo) => void;
  getChampionStaticInfoById: (id: string) => ChampionStaticInfo | undefined;
}


export interface ExplorerScreenProps {
  onGoHome: () => void;
  ddragonVersion: string;
  allChampionsData: DDragonChampionInfo[];
  allItemsData: DDragonItemsData | null; 
  staticChampionData: ChampionStaticInfo[];
  oraclePersonality: OraclePersonality;
}


export interface HistoryScreenProps {
  onGoHome: () => void;
  ddragonVersion: string;
  allChampionsData: DDragonChampionInfo[];
  allItemsData: DDragonItemsData | null; 
}


export interface ReviewDraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  archivedDraft: ArchivedDraft | null;
  ddragonVersion: string;
  allChampionsData: DDragonChampionInfo[];
  allItemsData: DDragonItemsData | null; 
}


export interface Concept {
  id: string;
  title: string;
  description: string; 
  icon: React.FC<IconProps>;
  onClick?: () => void; // Added for special cases like Oracle Trials
}


export interface InGameCheatSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: DraftAnalysis | null;
  ddragonVersion: string;
  allChampionsData: DDragonChampionInfo[];
  allItemsData: DDragonItemsData | null; 
}

export interface SettingsScreenProps {
  onGoHome: () => void;
  currentSettings: AppSettings;
  onSaveSettings: (newSettings: Partial<AppSettings>) => void; 
}

export interface DraftingScreenProps {
  onGoHome: () => void;
  ddragonVersion: string;
  allChampionsData: DDragonChampionInfo[];
  allItemsData: DDragonItemsData | null; 
  oraclePersonality: OraclePersonality;
  draftMode: DraftMode;
  userStartingSide: TeamSide; 
  onUpdateDraftAura: (aura: DraftAnalysis['auraSentiment']) => void; 
}

export interface HomeScreenProps {
  onStartDraft: (mode: DraftMode, side: TeamSide) => void; 
  onResumeLastDraft: () => void;
  onGoToExplorer: () => void;
  onGoToHistory: () => void;
  onGoToPlaybook: () => void;        
  onGoToDraftLab: () => void;
  onGoToArmory: () => void; 
  onInitiateLessonWithPersona: (concept: Concept) => void; 
  onGoToOracleTrials: () => void; 
  ddragonVersion: string;
  allChampionsData: DDragonChampionInfo[];
  allItemsData: DDragonItemsData | null; 
  staticChampionData: ChampionStaticInfo[];
  oraclePersonality: OraclePersonality;
  greetingMessage: string | null; 
  greetingVisible: boolean; 
  viewedConceptIds: string[]; 
  concepts: Concept[]; // Added for Concept Spotlight and progress
}

export interface ChooseDraftModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectModeAndSide: (mode: DraftMode, side: TeamSide) => void; 
}

// --- Interactive Learning Journey Types ---
export interface ChallengeOption {
  letter: string; 
  text: string;
}
export interface ChallengeData {
  scenario: string;
  question: string;
  options: ChallengeOption[];
  correctAnswerLetter?: string; 
}
export interface InteractiveLessonScreenProps {
  selectedConcept: Concept | null;
  championPersona: DDragonChampionInfo | null; 
  onCompleteLesson: () => void;
  oraclePersonality: OraclePersonality;
  allChampionsData: DDragonChampionInfo[]; 
  allItemsData: DDragonItemsData | null; 
  ddragonVersion: string; 
  staticChampionData: ChampionStaticInfo[];
}

// --- Draft Lab Types ---
export interface DraftLabScreenProps {
  onGoHome: () => void;
  ddragonVersion: string;
  allChampionsData: DDragonChampionInfo[];
  allItemsData: DDragonItemsData | null; 
  staticChampionData: ChampionStaticInfo[];
  oraclePersonality: OraclePersonality;
  initialPlaybookEntryToLoad?: PlaybookEntry | null; 
  onInitialPlaybookEntryLoaded?: () => void;
  onUpdateDraftAura: (aura: DraftAnalysis['auraSentiment']) => void;      
}
export interface TeamDisplayProps {
  title: string;
  teamPicks: ChampionSlot[];
  teamBans: string[];
  icon: React.ReactElement<IconProps>;
  ddragonVersion: string;
  allChampionsData: DDragonChampionInfo[];
  activeRoleForPick?: string; 
  isTeamTurnForPick?: boolean; 
  roleSwapState: { team: Team; originChampionName: string; originRole: string; } | null;
  onInitiateRoleSwap: (payload: RoleSwapPayload) => void;
  onCompleteRoleSwap: (payload: RoleSwapPayload) => void;
  onCancelRoleSwap: () => void;
  anyLoading: boolean;
  isTeamTurnForBan?: boolean;
  activeBanSlotIndex?: number; 
  mode: 'draft' | 'lab' | 'review' | 'puzzle'; 
  draftPhaseForDisplay?: string; 
  onLabPickSlotClick?: (team: Team, role: string) => void;
  onLabBanSlotClick?: (team: Team, banIndex: number) => void;
  onLabFilledPickClick?: (team: Team, role: string, championName: string) => void;
  onLabFilledBanClick?: (team: Team, banIndex: number, championName: string) => void;
  onLabChampionDropOnPick?: (team: Team, role: string, champion: DDragonChampionInfo) => void;
  onLabChampionDropOnBan?: (team: Team, banIndex: number, champion: DDragonChampionInfo) => void;
  getChampionStaticInfoById: (id: string) => ChampionStaticInfo | undefined;
  isPuzzleRoleActive?: boolean;
  onPuzzleChampionSlotClick?: (championSlot: ChampionSlot) => void;

  // Props for Threat Assessment Mode in Draft Lab
  isThreatAssessmentModeActive?: boolean;
  targetedThreatChampionName?: string;
  onSelectTargetThreat?: (championName: string, championKey?: string) => void;
  analysisSentiment?: DraftAnalysis['overallSentiment']; // Use the type from DraftAnalysis
}


// --- My Playbook Types ---
export interface PlaybookScreenProps {
  onGoHome: () => void;
  ddragonVersion: string;
  allChampionsData: DDragonChampionInfo[];
  allItemsData: DDragonItemsData | null; 
  onLoadPlaybookEntryToLab: (entry: PlaybookEntry) => void;
}

export interface ReviewPlaybookEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  playbookEntry: PlaybookEntry | null;
  ddragonVersion: string;
  allChampionsData: DDragonChampionInfo[];
  allItemsData: DDragonItemsData | null; 
}

export interface SaveToPlaybookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  currentName?: string;
}

export interface RoleSwapPayload {
  team: Team;
  championName: string;
  role: string;
}

// --- Pre-Game Ritual Types ---
export interface RitualChampionInfo {
  champion: string; 
  reason: string;   
  ddragonKey?: string; 
}

export interface PreGameRitualAnalysis {
  identitySummary: string;
  fatedAllies: RitualChampionInfo[];
  graveThreats: RitualChampionInfo[];
  sources?: GroundingChunk[];
}

// --- Oracle's Trials (Daily Puzzle) Types ---
export type PuzzleRatingKey = 'adept' | 'master' | 'oracle' | 'plausible' | 'consider';

export interface DailyPuzzleIdealPick {
  choiceName: string; // Can be champion name, item name, or MCQ letter
  ratingKey: PuzzleRatingKey;
  explanation: string;
}

export interface ItemPuzzleOption {
  itemId: string; // DDragon numerical ID from item.json or itemStaticData
  itemName: string; // Expected to be in {{Item Name}} format for display
}

export type PuzzleType = 
  | 'championPick'       // Existing: Pick the next champion for a role
  | 'itemPick'           // Existing: Pick the best item in a scenario
  | 'crucialBan'         // New: Pick the most critical ban
  | 'weakLinkAnalysis';  // New: Multi-stage - 1. Identify weak champion, 2. Explain why

export interface DailyPuzzle {
  id: string;
  title: string;
  scenarioDescription: string;
  yourTeamInitialPicks: ChampionSlot[];
  yourTeamInitialBans: string[];
  enemyTeamInitialPicks: ChampionSlot[];
  enemyTeamInitialBans: string[];
  
  puzzleType: PuzzleType;
  choiceContextLabel?: string; 

  availableChampionChoices?: string[]; // For 'championPick'
  itemChoiceOptions?: ItemPuzzleOption[]; // For 'itemPick'
  banChoiceOptions?: string[]; // For 'crucialBan'

  flawedTeamComposition?: ChampionSlot[]; // For 'weakLinkAnalysis' (stage 1 display)
  weakLinkCorrectChampionName?: string;  // For 'weakLinkAnalysis' (stage 1 validation)
  weakLinkExplanationOptions?: ChallengeOption[]; // For 'weakLinkAnalysis' (stage 2 options)
  weakLinkCorrectExplanationLetter?: string; // For 'weakLinkAnalysis' (stage 2 validation)
  
  idealPicks: DailyPuzzleIdealPick[]; 
  defaultPlausibleRatingKey?: PuzzleRatingKey;
  defaultPlausibleExplanation?: string;
}

export interface OracleTrialsLocalStorageState {
  lastShownPuzzleId: string | null;
  lastShownPuzzleDate: string | null; 
  completedPuzzles: {
    [puzzleId: string]: string; 
  };
}

export interface PuzzleFeedbackDimension {
  dimensionName: string; 
  assessment: 'Excellent' | 'Good' | 'Fair' | 'Needs Improvement' | 'Neutral';
  commentary: string;
}
export interface PuzzleValidationResult {
  userChoiceInitialAssessmentText: string; 
  userChoiceDetailedCommentary: string; 
  assessmentDimensions?: PuzzleFeedbackDimension[];
  oracleOptimalChoice?: {
    choiceName: string; 
    explanation: string;
    isUserChoiceOptimal?: boolean;
  };
  isCorrectStage1?: boolean; // For multi-stage puzzles
}


export interface OracleTrialsScreenProps {
  onGoHome: () => void;
  ddragonVersion: string;
  allChampionsData: DDragonChampionInfo[];
  allItemsData: DDragonItemsData | null; 
  staticChampionData: ChampionStaticInfo[]; 
}

// --- Oracle's Armory (Item Encyclopedia) ---
// MergedItemInfo combines DDragonItemInfo with our strategic ItemStaticInfo
export interface MergedItemInfo extends
  Omit<DDragonItemInfo, 'id' | 'name' | 'stats' | 'tags'>, // Omit conflicting/redundant fields from DDragon
  Omit<ItemStaticInfo, 'stats' | 'type' | 'id' | 'name'> // Omit conflicting/redundant & specific handled fields from ItemStaticInfo
{
  id: string; // DDragon numerical ID from ItemStaticInfo (primary key)
  name: string; // From DDragonItemInfo (primary display name)
  ddragonStats: DDragonItemInfo['stats']; // Numerical stats from DDragon
  ddragonTags: DDragonItemInfo['tags']; // Tags from DDragon (e.g., "Boots", "Damage")

  // Explicitly defined static properties (optional because staticData might not exist for all items)
  staticCost?: ItemStaticInfo['cost'];
  staticStats?: ItemStaticInfo['stats']; // Descriptive stats from our static data
  staticStrategicSummary?: ItemStaticInfo['strategicSummary'];
  staticPassiveName?: ItemStaticInfo['passiveName'];
  staticPassiveDescription?: ItemStaticInfo['passiveDescription'];
  staticActiveName?: ItemStaticInfo['activeName'];
  staticActiveDescription?: ItemStaticInfo['activeDescription'];
  staticPurposeAndSynergies?: ItemStaticInfo['purposeAndSynergies'];
  staticSituationalApplication?: ItemStaticInfo['situationalApplication'];
  staticPrimaryUsers?: ItemStaticInfo['primaryUsers'];
  staticCountersInfo?: ItemStaticInfo['countersInfo'];
  staticBuildPathNotes?: ItemStaticInfo['buildPathNotes'];
  staticGoldEfficiencyNotes?: ItemStaticInfo['goldEfficiencyNotes'];
  staticKeywords?: ItemStaticInfo['keywords']; // Keywords from our static data for filtering
  
  itemType?: ItemStaticInfo['type']; // Type from our static data, made optional here
}


export interface ArmoryScreenProps {
  onGoHome: () => void;
  ddragonVersion: string;
  allItemsData: DDragonItemsData | null; // Full DDragon item list
  itemStaticData: ItemStaticInfo[];    // Our curated strategic data
  oraclePersonality: OraclePersonality;
}

export interface ArmoryItemWisdom extends DraftAnalysis {} // ArmoryItemWisdom will now use the new DraftAnalysis structure.

// Command Palette Types
export interface Command {
  id: string;
  type: 'navigation' | 'action' | 'search_champions_link' | 'search_items_link' | 'search_concepts_link' | 'search_result_champion' | 'search_result_item' | 'search_result_concept';
  label: string;
  action: () => void;
  keywords?: string[];
  icon?: React.FC<IconProps>;
  data?: DDragonChampionInfo | DDragonItemInfo | Concept; // For search results
}

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  commands: Command[];
  champions: DDragonChampionInfo[];
  items: DDragonItemInfo[];
  concepts: Concept[];
  ddragonVersion: string;
  navigateTo: (view: AppView, params?: any) => void;
}

// Draft Timeline Types
export interface DraftTimelineProps {
  draftFlow: DraftStep[];
  currentStepIndex: number;
  theme?: AppTheme; // Optional, for accent colors
}

// Animated Number Types
export interface AnimatedNumberProps {
  targetValue: number;
  duration?: number; // in milliseconds
  className?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}
