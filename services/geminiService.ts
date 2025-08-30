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
 * Creates a race between a promise and an AbortSignal.
 * @param promise The promise to race.
 * @param signal The AbortSignal.
 * @returns A new promise that resolves/rejects with the original promise, or rejects if the signal is aborted.
 */
const _raceWithAbort = <T>(promise: Promise<T>, signal?: AbortSignal): Promise<T> => {
    if (!signal) return promise;
    return new Promise((resolve, reject) => {
        const abortHandler = () => {
            signal.removeEventListener('abort', abortHandler);
            reject(new DOMException('The user aborted a request.', 'AbortError'));
        };

        signal.addEventListener('abort', abortHandler);

        promise.then(
            (res) => {
                signal.removeEventListener('abort', abortHandler);
                resolve(res);
            },
            (err) => {
                signal.removeEventListener('abort', abortHandler);
                reject(err);
            }
        );
    });
};


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
            return await _raceWithAbort(apiCall(), signal);
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
            
            const isNonRetryableClientError = error instanceof Error && (
                error.message.includes('400') ||
                error.message.includes('401') ||
                error.message.includes('403') ||
                error.message.includes('404')
            );
            
            if (!isRetryable || retries >= maxRetries) {
                 // After final retry, throw a more user-friendly error for network/server issues.
                if (isRetryable) {
                    console.error("API call failed after max retries.", error);
                    throw new Error('SERVICE_UNAVAILABLE: The AI service is currently unavailable. Please try again later.');
                }
                 if (isNonRetryableClientError) {
                    console.error("Non-retryable client error:", error);
                    throw new Error('CLIENT_ERROR: There was a problem with the request to the AI. If this persists, please report it.');
                }
                throw error; // Throw original error for other issues.
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
        throw new Error(`AI_EMPTY_RESPONSE: The AI returned an empty response for ${context}. This might be a temporary issue, please try again.`);
    }

    // Attempt to extract from a markdown block first
    const match = textToParse.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
        textToParse = match[1];
    } else {
        // If no markdown block, find the first '{' and last '}'
        const firstBrace = textToParse.indexOf('{');
        const lastBrace = textToParse.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace > firstBrace) {
            textToParse = textToParse.substring(firstBrace, lastBrace + 1);
        }
    }
    
    try {
        return JSON.parse(textToParse) as T;
    } catch (parseError) {
        console.error(`Failed to parse JSON response for ${context} from Gemini API:`, parseError, `\nReceived text: ${responseText}`);
        throw new Error(`AI_INVALID_FORMAT: The AI's response for ${context} was in an unexpected format. Please try again.`);
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
        },
        keyMatchups: {
            type: Type.ARRAY,
            description: "An analysis of the 2-3 most critical role vs role matchups in the draft.",
            items: {
                type: Type.OBJECT,
                properties: {
                    role: { type: Type.STRING },
                    blueChampion: { type: Type.STRING },
                    redChampion: { type: Type.STRING },
                    analysis: { type: Type.STRING, description: "A one-sentence analysis of who has the advantage and why." }
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
    const picks = draftState[team].picks.map((p, i) => `${ROLES[i]}: ${p.champion?.name || 'None'}`).join(', ');
    const bans = draftState[team].bans.map(b => b.champion?.name || 'None').join(', ');
    return `${team.toUpperCase()} Team:\n- Picks: [${picks}]\n- Bans: [${bans}]`;
  };
  return `${formatTeam('blue')}\n${formatTeam('red')}`;
}

export async function getDraftAdvice(draftState: DraftState, userPrimaryRole: string, userSkillLevel: string, signal?: AbortSignal): Promise<Omit<AIAdvice, 'draftId'>> {
  const ai = getAiInstance();
  if (!ai) throw new Error("AI service not initialized.");

  const currentDraft = formatDraftStateForPrompt(draftState);

  const prompt = `
    You are a world-class League of Legends draft analyst, similar to those on a professional broadcast. Your analysis must be sharp, insightful, and grounded in high-level competitive knowledge (like pro play, LCK, LPL, etc.) and meta data from sites like op.gg. Use the provided STRATEGIC_PRIMER as your foundational knowledge base.

    Analyze the following draft state. Your analysis must be based on the final champion roles as provided (e.g., Top: Garen, Jungle: Lee Sin). These positions are final after any potential swaps.
    ${currentDraft}

    User Profile: Primary Role is ${userPrimaryRole}, Skill Level is ${userSkillLevel}.

    Your Task: Provide a comprehensive, expert-level analysis in the specified JSON format.

    Key Areas of Analysis:
    1.  **Compositional Identity**: Identify each team's archetype (e.g., Poke, Dive, Protect the Carry). Analyze the direct interaction between these identities. Is one a natural counter to the other?
    2.  **Win Conditions**: Clearly state each team's primary path to victory. Be specific (e.g., "Blue wins by using their hard engage to force 5v5s around Dragon Soul, while Red wins by split-pushing with Fiora and avoiding full teamfights.").
    3.  **Power Spikes**: Analyze and compare the teams' power spike timings. Which team is stronger early, mid, and late? The timeline should reflect this.
    4.  **Key Matchups**: Identify the 2-3 most critical lane or role matchups that will heavily influence the game's outcome. Provide a concise analysis for each.
    5.  **Strengths & Weaknesses**: List the core strengths and exploitable weaknesses for each team, referencing concepts from the primer.
    6.  **Draft Score**: Provide an objective grade and a sharp, concise reason that summarizes the draft quality.
    7.  **Highlight**: Identify the single most pivotal champion in this draft and explain why they are so impactful.
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
  return _parseJsonResponse<Omit<AIAdvice, 'draftId'>>(response.text, "Draft Advice");
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


// --- REFACTORED GROUNDED API CALLS ---
/**
 * A generic helper for making grounded API calls using Google Search.
 * @param prompt The prompt to send to the Gemini API.
 * @param signal An optional AbortSignal to cancel the operation.
 * @returns The full GenerateContentResponse object.
 */
async function _makeGroundedApiCall(prompt: string, signal?: AbortSignal): Promise<GenerateContentResponse> {
    const ai = getAiInstance();
    if (!ai) throw new Error("AI service not initialized.");

    const apiCall = () => ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
        }
    });
    return _withRetries(apiCall, signal);
}

/**
 * Extracts and formats web sources from a Gemini API response.
 * @param response The response object from a grounded API call.
 * @returns An array of MetaSource objects.
 */
function _extractSourcesFromResponse(response: GenerateContentResponse): MetaSource[] {
    return response.candidates?.[0]?.groundingMetadata?.groundingChunks
        ?.map((chunk: GroundingChunk) => ({
            title: chunk.web?.title || 'Unknown Source',
            uri: chunk.web?.uri || '',
        }))
        .filter(source => source.uri) || [];
}

export async function getTierList(signal: AbortSignal): Promise<StructuredTierList> {
    const prompt = `Analyze recent high-level League of Legends match data and popular strategy sites to generate a structured S-Tier list for the current patch. For each champion, provide a very brief reason for their S-Tier status. Structure the output as a JSON object. The JSON object must contain a 'summary' (string) and a 'tierList' (array). Each element in the 'tierList' array should be an object with a 'role' (string) and a 'champions' (array of objects, where each object has 'championName' (string) and 'reasoning' (string)). Do not include sources in the JSON response.`;
    
    const response = await _makeGroundedApiCall(prompt, signal);
    const sources = _extractSourcesFromResponse(response);
    const parsed = _parseJsonResponse<Omit<StructuredTierList, 'sources'>>(response.text, "Tier List");
    return { ...parsed, sources };
}

export async function getPatchNotesSummary(signal: AbortSignal): Promise<StructuredPatchNotes> {
    const prompt = `Provide a concise summary of the most recent League of Legends patch notes. Identify the top 3-5 most impactful changes. Format the response as a JSON object. The JSON object must contain a 'summary' (string), and arrays for 'buffs', 'nerfs', and 'systemChanges'. Each element in these arrays should be an object with 'name' (string) and 'change' (string). Do not include sources in the JSON response.`;
    
    const response = await _makeGroundedApiCall(prompt, signal);
    const sources = _extractSourcesFromResponse(response);
    const parsed = _parseJsonResponse<Omit<StructuredPatchNotes, 'sources'>>(response.text, "Patch Notes");
    return { ...parsed, sources };
}

export async function getGroundedAnswer(query: string, signal: AbortSignal): Promise<{ text: string, sources: MetaSource[] }> {
    const prompt = `As a League of Legends expert, answer the following question based on the latest information from the web: "${query}"`;
    const response = await _makeGroundedApiCall(prompt, signal);
    const sources = _extractSourcesFromResponse(response);
    return { text: response.text, sources };
}
// --- END REFACTORED GROUNDED API CALLS ---


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

export async function getBotDraftAction(draftState: DraftState, turn: { team: TeamSide, type: 'pick' | 'ban', index: number }, persona: ArenaBotPersona, availableChampions: ChampionLite[], signal: AbortSignal): Promise<ChampionSuggestion> {
    const ai = getAiInstance();
    if (!ai) throw new Error("AI service not initialized.");

    const currentDraft = formatDraftStateForPrompt(draftState);
    const action = turn.type === 'pick' ? 'pick' : 'ban';
    const roleForTurn = turn.type === 'pick' ? ROLES[turn.index] : 'Ban';
    const availableNames = availableChampions.map(c => c.name).join(', ');

    const prompt = `
        You are a world-class League of Legends AI drafting bot. Your persona dictates your strategy. It is your turn to ${action}. You are filling the slot for **${roleForTurn}**.

        **CRITICAL INSTRUCTION**: Your primary goal is to build the strongest overall team composition. You are **not** restricted to picking a champion for the ${roleForTurn} role. If a high-priority champion for another role is available (e.g., a power pick ADC), you should pick them now to secure them. Assume you can swap champion positions later.

        **Persona: "${persona}"**
        -   **The Strategist**: Your goal is to build the most coherent and synergistic team composition possible, following the STRATEGIC_PRIMER archetypes. You prioritize meta-strong champions, flex picks, and compositional counters.
        -   **The Aggressor**: You prioritize winning lanes. You will look for direct lane counters and aggressive, early-game champions to create a snowball lead. You are not afraid of risky, high-reward picks.
        -   **The Trickster**: You aim to disrupt the enemy's draft. You favor flex picks that hide your strategy, unconventional counters, and champions that punish predictable, meta compositions.

        Current Draft State (champions are in their assigned role slots):
        ${currentDraft}

        Your Task:
        1.  Analyze the draft so far, considering both teams' compositions with their likely roles.
        2.  Based on your persona, select the single best champion to ${action} from this list of available champions: ${availableNames}.
        3.  Provide a concise, sharp reasoning for your choice that clearly reflects your persona's strategy.
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
            thinkingConfig: { thinkingBudget: 0 }
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
