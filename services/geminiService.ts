import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
// FIX: Added missing type imports for new service functions
import type { DraftState, AIAdvice, MetaSnapshot, MetaSource, StructuredTierList, StructuredPatchNotes, TrialQuestion, ChampionSuggestion, TeamSide, Lesson, ChampionAnalysis, PlaybookPlusDossier, ArenaBotPersona, ChampionLite, UserProfile, MatchupAnalysis, Champion } from '../types';
import { ROLES } from '../constants';
import toast from 'react-hot-toast';
import { STRATEGIC_PRIMER } from '../data/strategyInsights';
import { safeGetLocalStorage, safeRemoveLocalStorage, safeSetLocalStorage } from "../lib/draftUtils";

let ai: GoogleGenAI | null = null;

function getAiInstance(): GoogleGenAI | null {
    if (ai) return ai;

    if (!process.env.API_KEY) {
        console.error("FATAL: API_KEY environment variable not set. AI features will be disabled.");
        return null;
    }
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return ai;
}

/**
 * A generic retry wrapper for API calls to handle transient errors.
 * Implements exponential backoff with jitter and respects AbortSignal.
 * @param apiCall The async function to call.
 * @param signal An optional AbortSignal to cancel the operation.
 * @param maxRetries The maximum number of retries.
 * @param initialDelay The initial delay in milliseconds before the first retry.
 * @returns A promise that resolves with the result of the API call.
 */
async function _withRetries<T>(
    apiCall: () => Promise<T>,
    signal?: AbortSignal,
    maxRetries = 2,
    initialDelay = 1000
): Promise<T> {
    let retries = 0;
    while (true) {
        signal?.throwIfAborted();
        try {
            return await apiCall();
        } catch (error) {
            // Do not retry if the request was aborted by the client.
            if (error instanceof DOMException && error.name === 'AbortError') {
                throw error;
            }

            const isRetryable = error instanceof Error && (
                error.message.includes('429') || // Rate limit
                error.message.includes('500') || // Server errors
                error.message.includes('503') ||
                error.message.includes('offline') ||
                error.message.includes('unavailable')
            );
            
            if (!isRetryable || retries >= maxRetries) {
                throw error;
            }
            
            retries++;
            const delay = initialDelay * Math.pow(2, retries - 1) + Math.random() * 1000; // Add jitter
            console.warn(`API call failed, retrying in ${Math.round(delay)}ms... (Attempt ${retries}/${maxRetries})`);
            
            signal?.throwIfAborted();
            await new Promise(resolve => setTimeout(resolve, delay));
            signal?.throwIfAborted(); // Check again after delay, before next attempt
        }
    }
}


interface GroundingChunk {
    web?: {
        title?: string;
        uri?: string;
    }
}

/**
 * A generic helper to parse JSON responses from the Gemini API with robust error handling.
 * @param responseText The raw text response from the API.
 * @param context A string describing the context of the call for better error messages.
 * @returns The parsed JSON object of type T.
 * @throws An error if parsing fails or the response is empty.
 */
function _parseJsonResponse<T>(responseText: string | undefined, context: string): T {
    let textToParse = responseText?.trim();
    if (!textToParse) {
        throw new Error(`AI returned an empty response for ${context}.`);
    }

    // More robustly find and extract the JSON block
    const match = textToParse.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
        textToParse = match[1];
    }
    
    try {
        return JSON.parse(textToParse) as T;
    } catch (parseError) {
        console.error(`Failed to parse JSON response for ${context} from Gemini API:`, parseError, `\nReceived text: ${textToParse}`);
        throw new Error(`AI returned an invalid response format for ${context}.`);
    }
}

// Client-side Caching Utility
interface CacheEntry<T> {
    timestamp: number;
    version: string;
    data: T;
}
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

async function _fetchAndCache<T>(
    cacheKey: string,
    fetcher: () => Promise<T>,
    version: string,
    signal?: AbortSignal
): Promise<T> {
    const cachedItem = safeGetLocalStorage(cacheKey);
    if (cachedItem) {
        try {
            const entry = JSON.parse(cachedItem) as CacheEntry<T>;
            const isCacheValid = (Date.now() - entry.timestamp < CACHE_TTL_MS) && entry.version === version;
            if (isCacheValid) {
                console.log(`[Cache] HIT for ${cacheKey}`);
                return entry.data;
            }
        } catch (e) {
            console.warn(`[Cache] Failed to parse cache for ${cacheKey}. Refetching.`, e);
            safeRemoveLocalStorage(cacheKey);
        }
    }

    console.log(`[Cache] MISS for ${cacheKey}. Fetching from API.`);
    signal?.throwIfAborted();
    const data = await fetcher();
    signal?.throwIfAborted();

    const newEntry: CacheEntry<T> = {
        timestamp: Date.now(),
        version: version,
        data,
    };
    safeSetLocalStorage(cacheKey, JSON.stringify(newEntry));

    return data;
}

const teamAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
        weaknesses: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    description: { type: Type.STRING, description: "A sentence describing the weakness." },
                    keyword: { type: Type.STRING, description: "The core strategic term from the primer (e.g., 'Engage', 'Poke'), if directly applicable. Otherwise, omit." },
                },
                required: ['description']
            }
        },
        winCondition: { type: Type.STRING },
        teamIdentity: { type: Type.STRING },
        powerSpike: { type: Type.STRING },
        keyThreats: { type: Type.STRING },
        draftScore: { type: Type.STRING, description: "An overall letter grade score for the draft (e.g., A+, B, C-)." },
        draftScoreReasoning: { type: Type.STRING, description: "A brief, one-sentence reason for the assigned score." },
        draftHighlight: {
            type: Type.OBJECT,
            properties: {
                championName: { type: Type.STRING },
                reasoning: { type: Type.STRING, description: "A one-sentence justification for why this champion is the highlight." }
            },
            description: "The single most important champion in the draft and why."
        },
        powerSpikeTimeline: {
            type: Type.ARRAY,
            description: "A timeline of projected power levels for both teams at key stages of the game.",
            items: {
                type: Type.OBJECT,
                properties: {
                    time: { type: Type.STRING, description: "Game phase, e.g., 'Early Game', 'Mid Game', '25 mins'." },
                    bluePower: { type: Type.INTEGER, description: "Blue team's relative power on a scale of 1-10." },
                    redPower: { type: Type.INTEGER, description: "Red team's relative power on a scale of 1-10." },
                    event: { type: Type.STRING, description: "The key event happening at this time, e.g., 'Blue team hits 2-item spike'." }
                }
            }
        }
    }
};

const draftAdviceSchema = {
  type: Type.OBJECT,
  properties: {
    teamAnalysis: {
      type: Type.OBJECT,
      properties: {
        blue: teamAnalysisSchema,
        red: teamAnalysisSchema,
      }
    },
    pickSuggestions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          championName: { type: Type.STRING },
          role: { type: Type.STRING },
          reasoning: { type: Type.STRING },
          synergy: { type: Type.STRING },
          counter: { type: Type.STRING }
        }
      }
    },
    banSuggestions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            championName: { type: Type.STRING },
            reasoning: { type: Type.STRING }
          }
        }
      },
    itemSuggestions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          championName: { type: Type.STRING },
          coreItems: { type: Type.ARRAY, items: { type: Type.STRING } },
          situationalItems: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    }
  }
};

function formatDraftStateForPrompt(draftState: DraftState): string {
  const formatTeam = (team: 'blue' | 'red') => {
    const picks = draftState[team].picks.map(p => p.champion?.name || 'None').join(', ');
    const bans = draftState[team].bans.map(b => b.champion?.name || 'None').join(', ');
    return `${team.toUpperCase()} Team:\n- Picks: ${picks}\n- Bans: ${bans}`;
  };
  return `${formatTeam('blue')}\n${formatTeam('red')}`;
}

export async function getDraftAdvice(draftState: DraftState, userPrimaryRole: string, userSkillLevel: string, signal?: AbortSignal): Promise<AIAdvice> {
  const ai = getAiInstance();
  if (!ai) throw new Error("AI service not initialized.");

  const currentDraft = formatDraftStateForPrompt(draftState);

  const prompt = `
    Analyze the following League of Legends draft state.
    Current Draft:
    ${currentDraft}

    Your Role: World-class LoL Analyst and Coach.
    My primary role is ${userPrimaryRole}. My skill level is ${userSkillLevel}.
    Use the provided STRATEGIC_PRIMER to analyze the draft based on win conditions, power spikes, and team composition archetypes.
    Provide a concise, expert-level analysis in the specified JSON format.
    Give actionable advice, especially for my role.
    The draft highlight should be the single most impactful champion in the draft.
    Weakness keywords must be one of these, if applicable: Poke, Dive, Split Push, Engage, Disengage, Peel, Wave Management, Power Spike, Vision Control, Objective Control, Tempo.
    The timeline must have exactly 4 points: Early Game (0-15m), Mid Game (15-25m), Late Game (25m+), and a key item spike event (e.g., '1-Item Spike'). Power levels are on a scale of 1-10.
  `;
  
  const apiCall = () => ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }, { text: STRATEGIC_PRIMER }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: draftAdviceSchema,
      }
  });

  const response: GenerateContentResponse = await _withRetries(() => apiCall(), signal);
  return _parseJsonResponse<AIAdvice>(response.text, "Draft Advice");
}

// Additional AI service functions would go here...
// e.g., getChampionSuggestions, generateDraftName, getTierList, etc.
// For brevity, only the modified and newly added functions are shown.

const championAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        build: {
            type: Type.OBJECT,
            properties: {
                startingItems: { type: Type.ARRAY, items: { type: Type.STRING } },
                coreItems: { type: Type.ARRAY, items: { type: Type.STRING }, description: "The 2-3 essential items for this champion." },
                situationalItems: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { item: { type: Type.STRING }, reason: { type: Type.STRING } } } }
            }
        },
        runes: {
            type: Type.OBJECT,
            properties: {
                primaryPath: { type: Type.STRING },
                primaryKeystone: { type: Type.STRING },
                primaryRunes: { type: Type.ARRAY, items: { type: Type.STRING } },
                secondaryPath: { type: Type.STRING },
                secondaryRunes: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
        },
        skillOrder: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Array of 3 letters for the first 3 levels, e.g., ['Q', 'E', 'W']" },
        composition: {
            type: Type.OBJECT,
            properties: {
                idealArchetypes: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of archetypes from the primer this champion fits into (e.g., 'Poke', 'Dive')." },
                synergisticChampions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of 3-5 champions that have strong synergy." }
            }
        },
        counters: {
            type: Type.OBJECT,
            properties: {
                strongAgainst: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { championName: { type: Type.STRING }, reasoning: { type: Type.STRING, description: "Concise tip explaining why this is a favorable matchup, focusing on key ability interactions." } } } },
                weakAgainst: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { championName: { type: Type.STRING }, reasoning: { type: Type.STRING, description: "Concise tip explaining why this is an unfavorable matchup and how to play around it." } } } }
            }
        },
        playstyle: {
            type: Type.OBJECT,
            properties: {
                earlyGame: { type: Type.STRING, description: "One sentence describing their goal in the early game (0-15 mins)." },
                midGame: { type: Type.STRING, description: "One sentence describing their goal in the mid game (15-25 mins)." },
                lateGame: { type: Type.STRING, description: "One sentence describing their role in the late game (25+ mins)." }
            }
        }
    }
};

export async function getChampionAnalysis(championName: string, version: string, signal?: AbortSignal): Promise<ChampionAnalysis> {
    const ai = getAiInstance();
    if (!ai) throw new Error("AI service not initialized.");

    const cacheKey = `championAnalysis_${championName}`;
    
    const apiCall = async () => {
        const prompt = `
            Generate a complete strategic analysis for the League of Legends champion: ${championName}.
            Your analysis must be based *exclusively* on the provided STRATEGIC_PRIMER.
            Provide a standard, high-quality build and strategy.
            For counters, provide 3 "strong against" and 3 "weak against" matchups. The reasoning for each should be a concise, actionable tip that explains the key interaction.
            For situational items, provide a clear reason for when to build each item.
            The skill order should be the first 3 levels.
            Adhere strictly to the JSON schema.
        `;
        
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ role: 'user', parts: [{ text: prompt }, { text: STRATEGIC_PRIMER }] }],
            config: {
                responseMimeType: "application/json",
                responseSchema: championAnalysisSchema,
            }
        });
        return _parseJsonResponse<ChampionAnalysis>(response.text, `Champion Analysis for ${championName}`);
    };

    return _fetchAndCache(cacheKey, apiCall, version, signal);
}

// --- NEWLY ADDED FUNCTIONS ---

export async function getChampionSuggestions(draftState: DraftState, context: { team: TeamSide, type: 'pick' | 'ban', index: number }, primaryRole: string, skillLevel: string, favoriteChamps: string[], mode: 'standard' | 'counter-meta', signal: AbortSignal): Promise<ChampionSuggestion[]> {
    const ai = getAiInstance();
    if (!ai) throw new Error("AI service not initialized.");

    const currentDraft = formatDraftStateForPrompt(draftState);
    const action = context.type === 'pick' ? `picking for the ${ROLES[context.index]} role` : 'banning a champion';
    const modeDescription = mode === 'counter-meta' ? 'Suggest strong counter-meta or unexpected picks that can disrupt the enemy team.' : 'Suggest standard, strong, and synergistic picks.';

    const prompt = `
        Context: I am in a League of Legends draft. It is the ${context.team} team's turn, and I am ${action}.
        My primary role: ${primaryRole}. My skill level: ${skillLevel}. My favorite champions are: ${favoriteChamps.join(', ') || 'None'}.
        Current Draft State:
        ${currentDraft}

        Your Task: Provide 3 champion suggestions. The reasoning should be concise and actionable. ${modeDescription}
        Base your analysis on the provided STRATEGIC_PRIMER.
    `;

    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                championName: { type: Type.STRING },
                reasoning: { type: Type.STRING }
            },
            required: ['championName', 'reasoning']
        }
    };

    const apiCall = () => ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }, { text: STRATEGIC_PRIMER }] }],
        config: {
            responseMimeType: "application/json",
            responseSchema: schema,
        }
    });
    
    const response: GenerateContentResponse = await _withRetries(apiCall, signal);
    return _parseJsonResponse<ChampionSuggestion[]>(response.text, "Champion Suggestions");
}

export async function generateDraftName(draftState: DraftState, signal?: AbortSignal): Promise<string> {
    const ai = getAiInstance();
    if (!ai) throw new Error("AI service not initialized.");

    const bluePicks = draftState.blue.picks.map(p => p.champion?.name).filter(Boolean).join(', ');
    if (!bluePicks) return '';

    const prompt = `Based on the following team of League of Legends champions for the Blue Team, generate a short, creative, and evocative name for their strategy (e.g., "The Juggernaut Juggle", "Protect the President", "Five-Man Dive Crew"). Return ONLY the name itself, without any extra text or quotation marks.
    
    Champions:
    ${bluePicks}`;

    const apiCall = () => ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    const response: GenerateContentResponse = await _withRetries(apiCall, signal);
    return response.text.replace(/["']/g, "").trim();
}

export async function getTierList(signal: AbortSignal): Promise<StructuredTierList> {
    const ai = getAiInstance();
    if (!ai) throw new Error("AI service not initialized.");

    const prompt = `Analyze recent high-level League of Legends match data and popular strategy sites to generate a structured S-Tier list for the current patch. For each champion, provide a very brief reason for their S-Tier status. Structure the output as a JSON object. The JSON object must contain a 'summary' (string) and a 'tierList' (array). Each element in the 'tierList' array should be an object with a 'role' (string) and a 'champions' (array of objects, where each object has 'championName' (string) and 'reasoning' (string)). Do not include sources in the JSON response.`;

    const apiCall = async () => {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            }
        });
        const sources: MetaSource[] = response.candidates?.[0]?.groundingMetadata?.groundingChunks
            ?.map((chunk: GroundingChunk) => ({
                title: chunk.web?.title || 'Unknown Source',
                uri: chunk.web?.uri || '',
            }))
            .filter(source => source.uri) || [];

        const parsed = _parseJsonResponse<Omit<StructuredTierList, 'sources'>>(response.text, "Tier List");
        return { ...parsed, sources };
    };
    return _withRetries(apiCall, signal);
}

export async function getPatchNotesSummary(signal: AbortSignal): Promise<StructuredPatchNotes> {
    const ai = getAiInstance();
    if (!ai) throw new Error("AI service not initialized.");

    const prompt = `Provide a concise summary of the most recent League of Legends patch notes. Identify the top 3-5 most impactful changes. Format the response as a JSON object. The JSON object must contain a 'summary' (string), and arrays for 'buffs', 'nerfs', and 'systemChanges'. Each element in these arrays should be an object with 'name' (string) and 'change' (string). Do not include sources in the JSON response.`;

    const apiCall = async () => {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            }
        });
        const sources: MetaSource[] = response.candidates?.[0]?.groundingMetadata?.groundingChunks
            ?.map((chunk: GroundingChunk) => ({
                title: chunk.web?.title || 'Unknown Source',
                uri: chunk.web?.uri || '',
            }))
            .filter(source => source.uri) || [];

        const parsed = _parseJsonResponse<Omit<StructuredPatchNotes, 'sources'>>(response.text, "Patch Notes");
        return { ...parsed, sources };
    };
    return _withRetries(apiCall, signal);
}

export async function getTrialQuestion(signal: AbortSignal): Promise<TrialQuestion> {
    const ai = getAiInstance();
    if (!ai) throw new Error("AI service not initialized.");
    
    const prompt = `Create a challenging, multiple-choice question about advanced League of Legends draft strategy, based on the STRATEGIC_PRIMER. The question should test understanding of concepts like win conditions, team archetypes, or power spikes. Provide 4 options (one correct) and a clear explanation for the correct answer.`;
    
    const schema = {
        type: Type.OBJECT,
        properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswer: { type: Type.STRING },
            explanation: { type: Type.STRING }
        },
        required: ['question', 'options', 'correctAnswer', 'explanation']
    };

    const apiCall = () => ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }, { text: STRATEGIC_PRIMER }] }],
        config: {
            responseMimeType: "application/json",
            responseSchema: schema,
        }
    });

    const response: GenerateContentResponse = await _withRetries(apiCall, signal);
    return _parseJsonResponse<TrialQuestion>(response.text, "Trial Question");
}

export async function getBotDraftAction(draftState: DraftState, turn: { team: TeamSide, type: 'pick' | 'ban' }, persona: ArenaBotPersona, availableChampions: ChampionLite[], signal: AbortSignal): Promise<ChampionSuggestion> {
    const ai = getAiInstance();
    if (!ai) throw new Error("AI service not initialized.");

    const currentDraft = formatDraftStateForPrompt(draftState);
    const action = turn.type === 'pick' ? 'pick' : 'ban';
    const availableNames = availableChampions.map(c => c.name).join(', ');

    const prompt = `
        You are a League of Legends AI drafting bot. Your persona is "${persona}".
        It is your turn to ${action}. The current draft is:
        ${currentDraft}

        Choose one champion from this available list: ${availableNames}
        Provide a concise reason for your choice based on your persona and the STRATEGIC_PRIMER.
    `;
    
    const schema = {
        type: Type.OBJECT,
        properties: {
            championName: { type: Type.STRING },
            reasoning: { type: Type.STRING }
        },
        required: ['championName', 'reasoning']
    };

    const apiCall = () => ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }, { text: STRATEGIC_PRIMER }] }],
        config: {
            responseMimeType: "application/json",
            responseSchema: schema,
        }
    });

    const response: GenerateContentResponse = await _withRetries(apiCall, signal);
    return _parseJsonResponse<ChampionSuggestion>(response.text, "Bot Draft Action");
}

export async function* generateLessonStream(topic: string, signal: AbortSignal): AsyncGenerator<string> {
    const ai = getAiInstance();
    if (!ai) throw new Error("AI service not initialized.");

    const prompt = `Generate a detailed lesson on the League of Legends strategic topic: "${topic}". Structure the lesson with clear headings (using **bold**), bullet points (*), and explanations. Base the content on the provided STRATEGIC_PRIMER. The tone should be educational and insightful.`;

    const response = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }, { text: STRATEGIC_PRIMER }] }],
    });

    signal.throwIfAborted();
    for await (const chunk of response) {
        signal.throwIfAborted();
        yield chunk.text;
    }
}

export async function getMatchupAnalysis(championName: string, weakAgainst: { championName: string; reasoning: string; }[], strongAgainst: { championName: string; reasoning: string; }[], signal: AbortSignal): Promise<MatchupAnalysis> {
    const ai = getAiInstance();
    if (!ai) throw new Error("AI service not initialized.");

    const weakNames = weakAgainst.map(c => c.championName).join(', ');
    const strongNames = strongAgainst.map(c => c.championName).join(', ');

    const prompt = `
        For League of Legends champion ${championName}, provide one concise, actionable gameplay tip for each of the following matchups.
        - Weak Against (how to play safely or mitigate the disadvantage): ${weakNames}
        - Strong Against (how to press the advantage): ${strongNames}
        Use the STRATEGIC_PRIMER for context on champion interactions. Format as JSON.
    `;
    
    const tipSchema = {
        type: Type.OBJECT,
        properties: {
            championName: { type: Type.STRING },
            tip: { type: Type.STRING, description: "A single, actionable sentence." }
        },
        required: ['championName', 'tip']
    };

    const schema = {
        type: Type.OBJECT,
        properties: {
            strongAgainstTips: { type: Type.ARRAY, items: tipSchema },
            weakAgainstTips: { type: Type.ARRAY, items: tipSchema },
        },
        required: ['strongAgainstTips', 'weakAgainstTips']
    };

    const apiCall = () => ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }, { text: STRATEGIC_PRIMER }] }],
        config: {
            responseMimeType: "application/json",
            responseSchema: schema,
        }
    });

    const response: GenerateContentResponse = await _withRetries(apiCall, signal);
    return _parseJsonResponse<MatchupAnalysis>(response.text, "Matchup Analysis");
}

export async function generatePlaybookPlusDossier(draftState: DraftState, signal: AbortSignal): Promise<PlaybookPlusDossier> {
    const ai = getAiInstance();
    if (!ai) throw new Error("AI service not initialized.");

    const currentDraft = formatDraftStateForPrompt(draftState);
    const prompt = `
        Analyze the Blue Team's composition in the provided draft. Based on the STRATEGIC_PRIMER, generate a concise, actionable "Strategic Dossier".
        This should include a clear win condition, and one-sentence plans for the early game (0-15m), mid game (15-25m), and teamfighting.
        
        Draft:
        ${currentDraft}
    `;

    const schema = {
        type: Type.OBJECT,
        properties: {
            winCondition: { type: Type.STRING },
            earlyGame: { type: Type.STRING },
            midGame: { type: Type.STRING },
            teamfighting: { type: Type.STRING }
        },
        required: ['winCondition', 'earlyGame', 'midGame', 'teamfighting']
    };

    const apiCall = () => ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }, { text: STRATEGIC_PRIMER }] }],
        config: {
            responseMimeType: "application/json",
            responseSchema: schema,
        }
    });

    const response: GenerateContentResponse = await _withRetries(apiCall, signal);
    return _parseJsonResponse<PlaybookPlusDossier>(response.text, "Playbook Dossier");
}

export async function getGroundedAnswer(query: string, signal: AbortSignal): Promise<{ text: string, sources: MetaSource[] }> {
    const ai = getAiInstance();
    if (!ai) throw new Error("AI service not initialized.");

    const apiCall = async () => {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `As a League of Legends expert, answer the following question based on the latest information from the web: "${query}"`,
            config: {
                tools: [{ googleSearch: {} }],
            }
        });
        const sources: MetaSource[] = response.candidates?.[0]?.groundingMetadata?.groundingChunks
            ?.map((chunk: GroundingChunk) => ({
                title: chunk.web?.title || 'Unknown Source',
                uri: chunk.web?.uri || '',
            }))
            .filter(source => source.uri) || [];
        
        return { text: response.text, sources };
    };

    return _withRetries(apiCall, signal);
}