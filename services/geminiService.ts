// filepath: C:\Github\League-AI-Oracle\services\geminiService.ts
import type {
  DraftState,
  TeamSide,
  DraftTurn,
  ChampionLite,
  ChampionMatchup,
  AIAdvice,
  TrialQuestion,
  StructuredTierList,
  StructuredPatchNotes,
  PersonalizedPatchSummary,
  UserProfile,
  Settings,
  ChampionAnalysis,
  MatchupAnalysis,
  PlaybookPlusDossier,
  HistoryEntry,
  ChampionSuggestion,
  MetaSource,
} from '../types';
import { STRATEGIC_PRIMER } from '../data/strategyInsights';
import { cacheService } from './cacheService';

// Determine proxy URL based on environment
// In production (Vercel), API routes are at /api
// In development, use local proxy server
const PROXY_URL = import.meta.env.VITE_PROXY_URL || (import.meta.env.PROD ? '' : 'http://localhost:3001');

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ============================================================================
// REQUEST QUEUE MANAGEMENT
// ============================================================================

interface QueuedRequest {
  execute: () => Promise<any>;
  resolve: (value: any) => void;
  reject: (error: Error) => void;
  priority: number;
}

class RequestQueue {
  private queue: QueuedRequest[] = [];
  private processing = false;
  private readonly MAX_CONCURRENT = 3;
  private activeRequests = 0;
  private readonly MIN_DELAY_MS = 200; // Minimum delay between requests
  private lastRequestTime = 0;

  async enqueue<T>(execute: () => Promise<T>, priority: number = 0): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({ execute, resolve, reject, priority });
      // Sort by priority (higher first)
      this.queue.sort((a, b) => b.priority - a.priority);
      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    // ✅ BUG FIX: Set processing flag BEFORE any operation to prevent race condition
    if (this.processing || this.activeRequests >= this.MAX_CONCURRENT) {
      return;
    }

    this.processing = true; // Set immediately to prevent concurrent access

    const request = this.queue.shift();
    if (!request) {
      this.processing = false; // Reset if no work
      return;
    }

    this.activeRequests++;

    try {
      // Enforce minimum delay between requests
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;
      if (timeSinceLastRequest < this.MIN_DELAY_MS) {
        await delay(this.MIN_DELAY_MS - timeSinceLastRequest);
      }
      this.lastRequestTime = Date.now();

      const result = await request.execute();
      request.resolve(result);
    } catch (error) {
      request.reject(error instanceof Error ? error : new Error(String(error)));
    } finally {
      this.activeRequests--;
      this.processing = false;
      // Process next request - use queueMicrotask for better performance
      if (this.queue.length > 0) {
        // Use setTimeout as fallback for older browsers
        (typeof queueMicrotask !== 'undefined' ? queueMicrotask : setTimeout)(() => this.processQueue());
      }
    }
  }

  getQueueSize(): number {
    return this.queue.length;
  }

  clearQueue(): void {
    this.queue.forEach(req => req.reject(new Error('Queue cleared')));
    this.queue = [];
  }
}

const requestQueue = new RequestQueue();

// ============================================================================
// RETRY STRATEGIES BY ERROR TYPE
// ============================================================================

enum ErrorType {
  RATE_LIMIT = 'rate_limit',
  QUOTA_EXCEEDED = 'quota_exceeded',
  NETWORK = 'network',
  TIMEOUT = 'timeout',
  SERVER_ERROR = 'server_error',
  CLIENT_ERROR = 'client_error',
  UNKNOWN = 'unknown',
}

interface RetryStrategy {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  exponential: boolean;
  shouldRetry: boolean;
}

const RETRY_STRATEGIES: Record<ErrorType, RetryStrategy> = {
  [ErrorType.RATE_LIMIT]: {
    maxRetries: 3,
    baseDelay: 2000,
    maxDelay: 10000,
    exponential: true,
    shouldRetry: true,
  },
  [ErrorType.QUOTA_EXCEEDED]: {
    maxRetries: 1,
    baseDelay: 5000,
    maxDelay: 5000,
    exponential: false,
    shouldRetry: true,
  },
  [ErrorType.NETWORK]: {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 5000,
    exponential: true,
    shouldRetry: true,
  },
  [ErrorType.TIMEOUT]: {
    maxRetries: 2,
    baseDelay: 1500,
    maxDelay: 3000,
    exponential: false,
    shouldRetry: true,
  },
  [ErrorType.SERVER_ERROR]: {
    maxRetries: 2,
    baseDelay: 2000,
    maxDelay: 6000,
    exponential: true,
    shouldRetry: true,
  },
  [ErrorType.CLIENT_ERROR]: {
    maxRetries: 0,
    baseDelay: 0,
    maxDelay: 0,
    exponential: false,
    shouldRetry: false,
  },
  [ErrorType.UNKNOWN]: {
    maxRetries: 1,
    baseDelay: 1000,
    maxDelay: 2000,
    exponential: false,
    shouldRetry: true,
  },
};

function classifyError(error: any, response?: Response): ErrorType {
  // Check abort first
  if (error instanceof DOMException && error.name === 'AbortError') {
    return ErrorType.CLIENT_ERROR;
  }

  // Check response status
  if (response) {
    if (response.status === 429) {
      return ErrorType.RATE_LIMIT;
    }
    if (response.status === 503) {
      return ErrorType.QUOTA_EXCEEDED;
    }
    if (response.status >= 500) {
      return ErrorType.SERVER_ERROR;
    }
    if (response.status >= 400) {
      return ErrorType.CLIENT_ERROR;
    }
  }

  // Check error type from response data
  if (error?.type === 'rate_limit') {
    return ErrorType.RATE_LIMIT;
  }
  if (error?.type === 'quota_exceeded') {
    return ErrorType.QUOTA_EXCEEDED;
  }

  // Check network errors
  if (error instanceof TypeError || error?.message?.includes('fetch') || error?.message?.includes('network')) {
    return ErrorType.NETWORK;
  }

  // Check timeout
  if (error?.name === 'TimeoutError' || error?.message?.includes('timeout')) {
    return ErrorType.TIMEOUT;
  }

  return ErrorType.UNKNOWN;
}

function getRetryDelay(errorType: ErrorType, retryCount: number): number {
  const strategy = RETRY_STRATEGIES[errorType];
  if (!strategy.exponential) {
    return strategy.baseDelay;
  }
  const delay = strategy.baseDelay * Math.pow(2, retryCount);
  return Math.min(delay, strategy.maxDelay);
}

// ============================================================================
// CACHING CONFIGURATION
// ============================================================================

const CACHE_CONFIG = {
  TIER_LIST: {
    namespace: 'gemini_tierlist',
    ttl: 30 * 60 * 1000, // 30 minutes
    version: '1.0',
  },
  PATCH_NOTES: {
    namespace: 'gemini_patch',
    ttl: 60 * 60 * 1000, // 1 hour
    version: '1.0',
  },
  CHAMPION_ANALYSIS: {
    namespace: 'gemini_champion',
    ttl: 24 * 60 * 60 * 1000, // 24 hours
    version: '1.0',
  },
  GROUNDED_ANSWER: {
    namespace: 'gemini_grounded',
    ttl: 15 * 60 * 1000, // 15 minutes
    version: '1.0',
  },
};

// ============================================================================
// ENHANCED GEMINI API CALLER
// ============================================================================

/**
 * Secure call to Gemini API through backend proxy with advanced retry strategies
 * and request queuing to prevent rate limit issues
 */
const callGemini = async (
  prompt: string,
  signal: AbortSignal,
  model: string = 'gemini-2.5-flash',
  isJson = true,
  retryCount = 0,
  useSearch = false,
  priority = 0
): Promise<any> => {
  if (signal.aborted) {
    throw new DOMException('Aborted', 'AbortError');
  }

  // Use request queue to prevent overwhelming the API
  return requestQueue.enqueue(async () => {
    if (signal.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }

    let response: Response | undefined;
    let data: any;

    try {
      response = await fetch(`${PROXY_URL}/api/gemini`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, model, isJson, useSearch }),
        signal,
      });

      if (signal.aborted) {
        throw new DOMException('Aborted', 'AbortError');
      }

      data = await response.json();

      if (!response.ok) {
        const errorType = classifyError(data, response);
        const strategy = RETRY_STRATEGIES[errorType];

        // Check if we should retry
        if (strategy.shouldRetry && retryCount < strategy.maxRetries) {
          const retryDelay = getRetryDelay(errorType, retryCount);
          console.debug(
            `[Gemini] Retrying after ${retryDelay}ms (attempt ${retryCount + 1}/${strategy.maxRetries}) - Error: ${errorType}`
          );
          await delay(retryDelay);
          return callGemini(prompt, signal, model, isJson, retryCount + 1, useSearch, priority);
        }

        // Handle specific error types with user-friendly messages
        if (data.type === 'quota_exceeded') {
          throw new Error('AI service temporarily unavailable. Please try again in a few minutes.');
        }

        if (data.type === 'rate_limit') {
          throw new Error('Too many requests. Please wait a moment and try again.');
        }

        throw new Error(data.error || 'AI service error');
      }

      const text = data.text ?? '';

      if (!text) {
        throw new Error('The AI returned an empty response. Please try again.');
      }

      if (isJson) {
        // Clean the response to ensure it's valid JSON
        const jsonString = text
          .replace(/^```json/, '')
          .replace(/```$/, '')
          .trim();
        try {
          return JSON.parse(jsonString);
        } catch (e) {
          console.error('Failed to parse JSON from Gemini:', jsonString);
          throw new Error('The AI returned an invalid response. Please try again.');
        }
      }

      return text;
    } catch (error) {
      // Don't retry on abort
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw error;
      }

      // Classify error and determine retry strategy
      const errorType = classifyError(error, response);
      const strategy = RETRY_STRATEGIES[errorType];

      // Retry if appropriate
      if (strategy.shouldRetry && retryCount < strategy.maxRetries) {
        const retryDelay = getRetryDelay(errorType, retryCount);
        console.debug(
          `[Gemini] Retrying after ${retryDelay}ms (attempt ${retryCount + 1}/${strategy.maxRetries}) - Error: ${errorType}`
        );
        await delay(retryDelay);
        return callGemini(prompt, signal, model, isJson, retryCount + 1, useSearch, priority);
      }

      throw error;
    }
  }, priority);
};

const formatDraftStateForPrompt = (draftState: DraftState, userSide: TeamSide, userRole: string): string => {
  const { blue, red } = draftState;
  const formatTeam = (team: 'blue' | 'red') => {
    const picks = team === 'blue' ? blue.picks : red.picks;
    const bans = team === 'blue' ? blue.bans : red.bans;
    return `
- ${team.toUpperCase()} TEAM PICKS: [${picks.map(p => p.champion?.name || 'NONE').join(', ')}]
- ${team.toUpperCase()} TEAM BANS: [${bans.map(b => b.champion?.name || 'NONE').join(', ')}]`;
  };
  return `
CURRENT DRAFT STATE:
${formatTeam('blue')}
${formatTeam('red')}

CONTEXT:
- The user is on the ${userSide.toUpperCase()} TEAM.
- The user's primary role is ${userRole}.
`;
};

export const getDraftAdvice = async (
  draftState: DraftState,
  userSide: TeamSide,
  userRole: string,
  _skillLevel: UserProfile['skillLevel'],
  model: 'gemini-2.5-flash' | 'gemini-2.5-pro',
  signal: AbortSignal
): Promise<AIAdvice> => {
  const draftString = formatDraftStateForPrompt(draftState, userSide, userRole);
  const prompt = `
${STRATEGIC_PRIMER}

Analyze the provided draft state. Provide a comprehensive analysis for BOTH teams, pick/ban suggestions for the USER'S TEAM, and generate a power spike timeline and key matchups.

${draftString}

Your response MUST be a single, valid JSON object following this exact structure, with no extra text or markdown:
\`\`\`json
{
  "teamAnalysis": {
    "blue": {
      "strengths": ["string"],
      "weaknesses": [{ "description": "string", "keyword": "string" }],
      "winCondition": "string",
      "teamIdentity": "string",
      "powerSpike": "string",
      "keyThreats": ["string"],
      "draftScore": "string (e.g., A-, B+)",
      "draftScoreReasoning": "string",
      "powerSpikeTimeline": [{ "time": "string (e.g., Lvl 6, 1 Item)", "bluePower": "number (1-10)", "redPower": "number (1-10)", "event": "string" }],
      "keyMatchups": [{ "role": "string", "blueChampion": "string", "redChampion": "string", "analysis": "string" }],
      "synergies": [{ "championNames": ["string"], "reasoning": "string" }],
      "antiSynergies": [{ "championNames": ["string"], "reasoning": "string" }]
    },
    "red": {
      "strengths": ["string"],
      "weaknesses": [{ "description": "string", "keyword": "string" }],
      "winCondition": "string",
      "teamIdentity": "string",
      "powerSpike": "string",
      "keyThreats": ["string"],
      "draftScore": "string",
      "draftScoreReasoning": "string",
      "synergies": [{ "championNames": ["string"], "reasoning": "string" }],
      "antiSynergies": [{ "championNames": ["string"], "reasoning": "string" }]
    }
  },
  "pickSuggestions": [{ "championName": "string", "role": "string", "reasoning": "string", "synergy": "string", "counter": "string" }],
  "banSuggestions": [{ "championName": "string", "reasoning": "string" }],
  "buildSuggestions": [{ "championName": "string", "role": "string", "coreItems": ["string"], "situationalItems": [{ "item": "string", "reason": "string" }], "runes": { "primaryPath": "string", "keystone": "string", "secondaryPath": "string" }, "reasoning": "string" }]
}
\`\`\`
`;
  return callGemini(prompt, signal, model);
};

export const getBotDraftAction = async ({
  draftState,
  turn,
  persona,
  availableChampions,
  signal,
  sTierChampions,
  oneTrickChampion,
}: {
  draftState: DraftState;
  turn: DraftTurn;
  persona: string;
  availableChampions: ChampionLite[];
  signal: AbortSignal;
  sTierChampions?: string[];
  oneTrickChampion?: string;
}): Promise<ChampionSuggestion> => {
  const draftString = formatDraftStateForPrompt(draftState, turn.team, 'N/A');
  const availableString = availableChampions.map(c => c.name).join(', ');

  const prompt = `
${STRATEGIC_PRIMER}

You are an AI opponent in a draft simulation. Your persona is "${persona}".
The current turn is: ${turn.team.toUpperCase()} ${turn.type.toUpperCase()} (index ${turn.index}).

${draftString}

Based on your persona and the current draft, select the BEST champion from the available list below.
Your response MUST be a single, valid JSON object with your chosen champion and a brief reasoning from your persona's perspective.

AVAILABLE CHAMPIONS: [${availableString}]
${sTierChampions ? `S-TIER CHAMPIONS (for Meta Slave persona): [${sTierChampions.join(', ')}]` : ''}
${oneTrickChampion ? `ONE-TRICK CHAMPION (must be picked if available): ${oneTrickChampion}` : ''}

JSON response format:
\`\`\`json
{
  "championName": "string",
  "reasoning": "string (max 15 words)"
}
\`\`\`
`;
  return callGemini(prompt, signal);
};

export const getTeambuilderSuggestion = async ({
  coreConcept,
  currentPicks,
  roleToPick,
  availableChampions,
  signal,
}: {
  coreConcept: string;
  currentPicks: string[];
  roleToPick: string;
  availableChampions: ChampionLite[];
  signal: AbortSignal;
}): Promise<ChampionSuggestion[]> => {
  const availableString = availableChampions.map(c => c.name).join(', ');
  const prompt = `
You are a League of Legends Team Builder AI.
Your goal is to build a synergistic team composition based on a core concept.

- Core Concept: "${coreConcept}"
- Current Picks: [${currentPicks.join(', ') || 'None'}]
- Role to Pick: ${roleToPick}

From the list of available champions, suggest the top 3 best champions for the ${roleToPick} role that fit the core concept and synergize with the current picks. Provide a brief reasoning for each suggestion.

Available Champions: [${availableString}]

Your response MUST be a single, valid JSON array following this exact structure:
\`\`\`json
[
  { "championName": "string", "reasoning": "string (max 20 words)" },
  { "championName": "string", "reasoning": "string (max 20 words)" },
  { "championName": "string", "reasoning": "string (max 20 words)" }
]
\`\`\`
`;
  return callGemini(prompt, signal);
};

export const getTrialQuestion = async (signal: AbortSignal): Promise<TrialQuestion> => {
  const prompt = `
${STRATEGIC_PRIMER}
Generate a single, unique, multiple-choice trivia question about League of Legends draft strategy based on the provided primer. The question should be challenging and test a nuanced concept.
The response must be a single valid JSON object with no extra text or markdown.

JSON Format:
\`\`\`json
{
  "question": "string",
  "options": ["string", "string", "string"],
  "correctAnswer": "string",
  "explanation": "string"
}
\`\`\`
`;
  return callGemini(prompt, signal);
};

// Meta Oracle - Grounded Answer (uses Google Search with caching)
export const getGroundedAnswer = async (
  query: string,
  signal: AbortSignal
): Promise<{ text: string; sources: MetaSource[] }> => {
  // Generate cache key from query
  const cacheKey = `grounded_${query.toLowerCase().replace(/\s+/g, '_').substring(0, 50)}`;

  // Check cache first
  const cached = cacheService.get<{ text: string; sources: MetaSource[] }>(cacheKey, CACHE_CONFIG.GROUNDED_ANSWER);
  if (cached) {
    console.debug('[Gemini] Cache HIT for grounded answer:', query);
    return cached;
  }

  console.debug('[Gemini] Cache MISS for grounded answer, fetching with search:', query);

  const prompt = `
${STRATEGIC_PRIMER}
You are a League of Legends expert. Answer the following question using current knowledge of League meta, patch notes, and competitive play.
Use search results to provide accurate, up-to-date information with specific details.

Question: ${query}

Instructions:
1. Provide a comprehensive answer with specific details, champion names, patch numbers, and strategic insights
2. Reference current meta trends and recent patches
3. Include competitive play examples if relevant
4. Structure your answer with clear sections
5. If citing specific data (win rates, pick rates), mention the approximate timeframe

Format your answer in markdown with clear explanations and bullet points where appropriate.
`;

  try {
    // Call with useSearch = true to enable Google Search grounding
    const text = await callGemini(prompt, signal, 'gemini-2.5-flash', false, 0, true, 5); // High priority

    // Extract potential sources from the response
    // The Gemini API with grounding may include inline citations
    const sources: MetaSource[] = [];

    // Parse common citation patterns [text](url)
    const urlPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;

    while ((match = urlPattern.exec(text)) !== null && sources.length < 5) {
      const title = match[1];
      const uri = match[2];
      if (title && uri) {
        sources.push({ title, uri });
      }
    }

    // If no markdown links found, create generic sources indicating grounding was used
    if (sources.length === 0 && text.length > 100) {
      sources.push({
        title: 'Google Search Results - League of Legends ' + query,
        uri: 'https://www.google.com/search?q=' + encodeURIComponent(`League of Legends ${query}`),
      });
    }

    const result = { text, sources };

    // Cache the result
    cacheService.set(cacheKey, result, CACHE_CONFIG.GROUNDED_ANSWER);

    return result;
  } catch (error) {
    // If grounded search fails, try without search as fallback
    console.warn('[Gemini] Grounded search failed, falling back to non-grounded:', error);

    const fallbackPrompt = `
${STRATEGIC_PRIMER}
You are a League of Legends expert. Answer the following question using your knowledge of League meta and strategy.

Question: ${query}

Provide a comprehensive answer with specific details and strategic insights in markdown format.
`;

    const text = await callGemini(fallbackPrompt, signal, 'gemini-2.5-flash', false, 0, false, 5);

    return {
      text,
      sources: [
        {
          title: 'AI Knowledge Base (Search unavailable)',
          uri: '',
        },
      ],
    };
  }
};

// Intel Hub - Tier List (with caching)
export const getTierList = async (signal: AbortSignal): Promise<StructuredTierList> => {
  const cacheKey = 'current_tierlist';

  // Check cache first
  const cached = cacheService.get<StructuredTierList>(cacheKey, CACHE_CONFIG.TIER_LIST);
  if (cached) {
    console.debug('[Gemini] Cache HIT for tier list');
    return cached;
  }

  console.debug('[Gemini] Cache MISS for tier list, fetching fresh data');

  const prompt = `
${STRATEGIC_PRIMER}
Analyze the current League of Legends meta (Patch 14.21+) and create an S-Tier list for each role (Top, Jungle, Mid, ADC, Support).
For each champion, provide a very brief (5-10 words) reasoning for why they are S-Tier in the current meta.
Provide a 1-2 sentence overall summary of the current meta trends.

Your response MUST be a single, valid JSON object with no extra text or markdown.

JSON Format:
\`\`\`json
{
  "summary": "string - overall meta summary",
  "tierList": [
    { "role": "Top", "champions": [{ "championName": "string", "reasoning": "string" }] },
    { "role": "Jungle", "champions": [{ "championName": "string", "reasoning": "string" }] },
    { "role": "Mid", "champions": [{ "championName": "string", "reasoning": "string" }] },
    { "role": "ADC", "champions": [{ "championName": "string", "reasoning": "string" }] },
    { "role": "Support", "champions": [{ "championName": "string", "reasoning": "string" }] }
  ]
}
\`\`\`

Respond ONLY with the JSON object, no markdown formatting.
`;

  const result = await callGemini(prompt, signal, 'gemini-2.5-flash', true, 0, false, 3); // Medium-high priority

  // Cache the result
  cacheService.set(cacheKey, result, CACHE_CONFIG.TIER_LIST);

  return result;
};

// Intel Hub - Patch Notes Summary (with caching)
export const getPatchNotesSummary = async (signal: AbortSignal): Promise<StructuredPatchNotes> => {
  const cacheKey = 'current_patch_notes';

  // Check cache first
  const cached = cacheService.get<StructuredPatchNotes>(cacheKey, CACHE_CONFIG.PATCH_NOTES);
  if (cached) {
    console.debug('[Gemini] Cache HIT for patch notes');
    return cached;
  }

  console.debug('[Gemini] Cache MISS for patch notes, fetching fresh data');

  const prompt = `
${STRATEGIC_PRIMER}
Based on your knowledge of recent League of Legends patches (14.21+), provide a summary of the latest significant changes.
List the top 3 most impactful champion buffs, top 3 nerfs, and top 2 system/item changes.

Your response MUST be a single, valid JSON object with no extra text or markdown.

JSON Format:
\`\`\`json
{
  "summary": "string - 2-3 sentence overview of the patch",
  "buffs": [
    { "name": "Champion Name", "change": "Brief description of buff" },
    { "name": "Champion Name", "change": "Brief description of buff" },
    { "name": "Champion Name", "change": "Brief description of buff" }
  ],
  "nerfs": [
    { "name": "Champion Name", "change": "Brief description of nerf" },
    { "name": "Champion Name", "change": "Brief description of nerf" },
    { "name": "Champion Name", "change": "Brief description of nerf" }
  ],
  "systemChanges": [
    { "name": "System/Item Name", "change": "Brief description of change" },
    { "name": "System/Item Name", "change": "Brief description of change" }
  ]
}
\`\`\`

Respond ONLY with the JSON object, no markdown formatting.
`;

  const result = await callGemini(prompt, signal, 'gemini-2.5-flash', true, 0, false, 3); // Medium-high priority

  // Cache the result
  cacheService.set(cacheKey, result, CACHE_CONFIG.PATCH_NOTES);

  return result;
};

// Personalized Patch Summary
export const getPersonalizedPatchSummary = async (
  profile: UserProfile,
  settings: Settings,
  patchNotes: StructuredPatchNotes,
  _champions: ChampionLite[],
  signal: AbortSignal
): Promise<PersonalizedPatchSummary> => {
  const userContext = `
User Profile:
- Skill Level: ${profile.skillLevel}
- Favorite Champions: ${settings.favoriteChampions.join(', ')}
- Primary Role: ${settings.primaryRole}
`;
  const prompt = `
${STRATEGIC_PRIMER}
Given the following user profile and patch notes summary, generate a personalized briefing.
The summary should be 1-2 sentences highlighting what's most important *for this specific user*.
Identify the most relevant buffs and nerfs from the patch notes that affect their roles and favorite champions.

${userContext}

Patch Notes:
${JSON.stringify(patchNotes, null, 2)}

Your response MUST be a single, valid JSON object with no extra text or markdown.

JSON Format:
\`\`\`json
{
    "summary": "string",
    "relevantBuffs": [{ "name": "string", "change": "string", "reasoning": "string" }],
    "relevantNerfs": [{ "name": "string", "change": "string", "reasoning": "string" }]
}
\`\`\`

Respond ONLY with the JSON object, no markdown formatting.
`;
  return callGemini(prompt, signal, 'gemini-2.5-flash');
};

// Academy - Generate Lesson (non-streaming fallback)
export const generateLesson = async (topic: string, signal: AbortSignal): Promise<string> => {
  const prompt = `
${STRATEGIC_PRIMER}
You are an expert League of Legends coach. Write a detailed, educational lesson on the topic: "${topic}".
The lesson should be formatted with basic markdown (paragraphs, **bold**, and unordered lists using '*').
Explain the concept, why it's important, and provide actionable examples.
Start the lesson immediately without any introductory phrases like "Here is the lesson".

Provide a comprehensive lesson that covers:
1. Definition and explanation of the concept
2. Why it's important in League of Legends
3. Practical examples and scenarios
4. Tips for improvement
5. Common mistakes to avoid

Format your response in markdown with proper structure.
`;

  return callGemini(prompt, signal, 'gemini-2.5-flash', false);
};

// Streaming lesson generation using SSE
export const generateLessonStream = async function* (
  topic: string,
  signal: AbortSignal,
  useSearch: boolean = false
): AsyncGenerator<string> {
  const prompt = `
${STRATEGIC_PRIMER}
You are an expert League of Legends coach. Write a detailed, educational lesson on the topic: "${topic}".
The lesson should be formatted with basic markdown (paragraphs, **bold**, and unordered lists using '*').
Explain the concept, why it's important, and provide actionable examples.
Start the lesson immediately without any introductory phrases like "Here is the lesson".

Provide a comprehensive lesson that covers:
1. Definition and explanation of the concept
2. Why it's important in League of Legends
3. Practical examples and scenarios
4. Tips for improvement
5. Common mistakes to avoid

Format your response in markdown with proper structure.
`;

  if (signal.aborted) {
    throw new DOMException('Aborted', 'AbortError');
  }

  try {
    const response = await fetch(`${PROXY_URL}/api/gemini-stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, model: 'gemini-2.5-flash', useSearch }),
      signal,
    });

    if (signal.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || 'AI service error');
    }

    // Parse SSE stream
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Stream not available');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);

          if (data === '[DONE]') {
            return;
          }

          try {
            const parsed = JSON.parse(data);
            if (parsed.error) {
              throw new Error(parsed.error);
            }
            if (parsed.text) {
              yield parsed.text;
            }
          } catch (e) {
            if (e instanceof Error && e.message !== data) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error;
    }
    throw error;
  }
};

// Playbook Plus - Generate Strategic Dossier
export const generatePlaybookPlusDossier = async (
  draftState: DraftState,
  userSide: TeamSide,
  signal: AbortSignal
): Promise<PlaybookPlusDossier> => {
  const draftString = formatDraftStateForPrompt(draftState, userSide, 'N/A');
  const prompt = `
${STRATEGIC_PRIMER}
Analyze the user's team composition (${userSide.toUpperCase()} TEAM) from the draft below.
Create a "Strategic Dossier" for them. This is a concise, actionable game plan.
Focus on a clear win condition, and simple instructions for early game, mid game, and teamfighting.
The response must be a single, valid JSON object with no extra text or markdown.

${draftString}

JSON Format:
\`\`\`json
{
    "winCondition": "string",
    "earlyGame": "string",
    "midGame": "string",
    "teamfighting": "string"
}
\`\`\`
`;
  return callGemini(prompt, signal);
};

// Champion Analysis - Get comprehensive analysis for a champion (with caching)
export const getChampionAnalysis = async (
  championName: string,
  version: string,
  signal: AbortSignal
): Promise<ChampionAnalysis> => {
  const cacheKey = `champion_${championName.toLowerCase()}_${version}`;

  // Check cache first
  const cached = cacheService.get<ChampionAnalysis>(cacheKey, CACHE_CONFIG.CHAMPION_ANALYSIS);
  if (cached) {
    console.debug('[Gemini] Cache HIT for champion analysis:', championName);
    return cached;
  }

  console.debug('[Gemini] Cache MISS for champion analysis, fetching:', championName);

  const prompt = `
${STRATEGIC_PRIMER}
Generate a detailed strategic analysis for the champion "${championName}" for patch ${version}.
The response must be a single, valid JSON object with no extra text or markdown.

JSON Format:
\`\`\`json
{
    "build": {
        "startingItems": ["string"],
        "coreItems": ["string"],
        "situationalItems": [{ "item": "string", "reason": "string" }]
    },
    "runes": {
        "primaryPath": "string",
        "primaryKeystone": "string",
        "primaryRunes": ["string"],
        "secondaryPath": "string",
        "secondaryRunes": ["string"]
    },
    "skillOrder": ["string (Q, W, E)"],
    "composition": {
        "idealArchetypes": ["string"],
        "synergisticChampions": ["string"]
    },
    "counters": {
        "strongAgainst": [{ "championName": "string", "reasoning": "string" }],
        "weakAgainst": [{ "championName": "string", "reasoning": "string" }]
    },
    "playstyle": {
        "earlyGame": "string",
        "midGame": "string",
        "lateGame": "string"
    }
}
\`\`\`
`;
  const result = await callGemini(prompt, signal, 'gemini-2.5-flash', true, 0, false, 2); // Medium priority

  // Cache the result
  cacheService.set(cacheKey, result, CACHE_CONFIG.CHAMPION_ANALYSIS);

  return result;
};

// Matchup Analysis
export const getMatchupAnalysis = async (
  championName: string,
  weakAgainst: ChampionMatchup[],
  strongAgainst: ChampionMatchup[],
  signal: AbortSignal
): Promise<MatchupAnalysis> => {
  const prompt = `
Generate specific, actionable gameplay tips for ${championName} for a few key matchups.
Provide one tip for each matchup.
Weak against: ${weakAgainst.map(c => c.championName).join(', ')}
Strong against: ${strongAgainst.map(c => c.championName).join(', ')}
The response must be a single, valid JSON object with no extra text or markdown.

JSON Format:
\`\`\`json
{
    "strongAgainstTips": [{ "championName": "string", "tip": "string" }],
    "weakAgainstTips": [{ "championName": "string", "tip": "string" }]
}
\`\`\`
`;
  return callGemini(prompt, signal);
};

// Draft Comparison Analysis
export const getDraftComparisonAnalysis = async (
  draft1: HistoryEntry,
  draft2: HistoryEntry,
  champions: ChampionLite[],
  signal: AbortSignal
): Promise<string> => {
  const formatEntry = (entry: HistoryEntry) => {
    const bluePicks = entry.draft.blue.picks.map(id => champions.find(c => c.id === id)?.name || 'NONE').join(', ');
    const redPicks = entry.draft.red.picks.map(id => champions.find(c => c.id === id)?.name || 'NONE').join(', ');
    return `Draft "${entry.name}":\n- Blue: [${bluePicks}]\n- Red: [${redPicks}]`;
  };
  const prompt = `
${STRATEGIC_PRIMER}
Compare the two following drafts. Identify the key strategic differences in their compositions, win conditions, and power spikes.
Provide a concise, one-paragraph summary of your findings.

DRAFT 1:
${formatEntry(draft1)}

DRAFT 2:
${formatEntry(draft2)}
`;
  return callGemini(prompt, signal, 'gemini-2.5-flash', false);
};

// Dynamic Pro Tip Generation
export const generateDynamicProTip = async (
  recentEntries: HistoryEntry[],
  champions: ChampionLite[],
  signal: AbortSignal
): Promise<string> => {
  const formatEntry = (entry: HistoryEntry) => {
    const bluePicks = entry.draft.blue.picks.map(id => champions.find(c => c.id === id)?.name || 'Unknown').join(', ');
    const redPicks = entry.draft.red.picks.map(id => champions.find(c => c.id === id)?.name || 'Unknown').join(', ');
    return `${entry.name}: Blue=[${bluePicks}], Red=[${redPicks}]`;
  };

  const prompt = `
${STRATEGIC_PRIMER}
Analyze the user's last 3 saved drafts. Identify a recurring pattern, strength, or weakness in their drafting style.
Provide a single, actionable "Pro Tip" (2-3 sentences) to help them improve. Be specific and encouraging.

Example: "I see you often draft strong poke compositions, but sometimes lack disengage. Consider pairing your next poke draft with a champion like Janna or Gragas to ensure you can safely execute your win condition."

RECENT DRAFTS:
${recentEntries.map((e, i) => `Draft ${i + 1} (${formatEntry(e)})`).join('\n')}
`;
  return callGemini(prompt, signal, 'gemini-2.5-flash', false);
};

// ============================================================================
// UTILITY FUNCTIONS FOR CACHE AND QUEUE MANAGEMENT
// ============================================================================

/**
 * Clear all cached Gemini responses
 */
export const clearAllGeminiCaches = (): void => {
  console.debug('[Gemini] Clearing all caches...');
  cacheService.clearNamespace(CACHE_CONFIG.TIER_LIST.namespace);
  cacheService.clearNamespace(CACHE_CONFIG.PATCH_NOTES.namespace);
  cacheService.clearNamespace(CACHE_CONFIG.CHAMPION_ANALYSIS.namespace);
  cacheService.clearNamespace(CACHE_CONFIG.GROUNDED_ANSWER.namespace);
  console.debug('[Gemini] All caches cleared');
};

/**
 * Clear specific cache namespace
 */
export const clearGeminiCache = (type: 'tierlist' | 'patch' | 'champion' | 'grounded'): void => {
  const namespaceMap = {
    tierlist: CACHE_CONFIG.TIER_LIST.namespace,
    patch: CACHE_CONFIG.PATCH_NOTES.namespace,
    champion: CACHE_CONFIG.CHAMPION_ANALYSIS.namespace,
    grounded: CACHE_CONFIG.GROUNDED_ANSWER.namespace,
  };

  const namespace = namespaceMap[type];
  console.debug(`[Gemini] Clearing ${type} cache...`);
  cacheService.clearNamespace(namespace);
};

/**
 * Get request queue statistics
 */
export const getQueueStats = (): { queueSize: number; isProcessing: boolean } => {
  return {
    queueSize: requestQueue.getQueueSize(),
    isProcessing: requestQueue.getQueueSize() > 0,
  };
};

/**
 * Clear the request queue (useful for cleanup or cancellation)
 */
export const clearRequestQueue = (): void => {
  console.debug('[Gemini] Clearing request queue...');
  requestQueue.clearQueue();
};

/**
 * Preload frequently accessed data into cache
 */
export const preloadFrequentData = async (signal: AbortSignal): Promise<void> => {
  console.debug('[Gemini] Preloading frequent data...');

  try {
    // Preload tier list and patch notes in parallel
    await Promise.all([
      getTierList(signal).catch(err => console.error('[Gemini] Failed to preload tier list:', err)),
      getPatchNotesSummary(signal).catch(err => console.error('[Gemini] Failed to preload patch notes:', err)),
    ]);

    console.debug('[Gemini] Preload complete');
  } catch (error) {
    console.error('[Gemini] Preload failed:', error);
  }
};

/**
 * Get cache statistics
 */
export const getCacheStats = (): {
  tierList: boolean;
  patchNotes: boolean;
  totalEntries: number;
} => {
  const hasTierList = !!cacheService.get('current_tierlist', CACHE_CONFIG.TIER_LIST);
  const hasPatchNotes = !!cacheService.get('current_patch_notes', CACHE_CONFIG.PATCH_NOTES);

  // Count total cache entries
  let totalEntries = 0;
  const namespaces = [
    CACHE_CONFIG.TIER_LIST.namespace,
    CACHE_CONFIG.PATCH_NOTES.namespace,
    CACHE_CONFIG.CHAMPION_ANALYSIS.namespace,
    CACHE_CONFIG.GROUNDED_ANSWER.namespace,
  ];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && namespaces.some(ns => key.includes(ns))) {
      totalEntries++;
    }
  }

  return {
    tierList: hasTierList,
    patchNotes: hasPatchNotes,
    totalEntries,
  };
};
