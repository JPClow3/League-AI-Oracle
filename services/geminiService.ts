import { GoogleGenAI, Type } from "@google/genai";
import type { DraftState, AIAdvice, MetaSnapshot, MetaSource, StructuredTierList, StructuredPatchNotes, TrialQuestion, ChampionSuggestion, TeamSide, Lesson, ChampionAnalysis, MatchupAnalysis } from '../types';
import { DATA_DRAGON_VERSION, ROLES } from '../constants';
import toast from 'react-hot-toast';
import { STRATEGIC_PRIMER } from '../data/strategyInsights';

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
function _parseJsonResponse<T>(responseText: string, context: string): T {
    const trimmedText = responseText.trim();
    if (!trimmedText) {
        throw new Error(`AI returned an empty response for ${context}.`);
    }
    try {
        return JSON.parse(trimmedText) as T;
    } catch (parseError) {
        console.error(`Failed to parse JSON response for ${context} from Gemini API:`, parseError, `\nReceived text: ${trimmedText}`);
        throw new Error(`AI returned an invalid response format for ${context}.`);
    }
}

const teamAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
        weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
        winCondition: { type: Type.STRING },
        teamIdentity: { type: Type.STRING },
        powerSpike: { type: Type.STRING },
        keyThreats: { type: Type.STRING },
        draftScore: { type: Type.STRING, description: "An overall letter grade score for the draft (e.g., A+, B, C-)." },
        draftScoreReasoning: { type: Type.STRING, description: "A brief, one-sentence reason for the assigned score." },
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
    return `  ${team.toUpperCase()} Team Picks: [${picks}]\n  ${team.toUpperCase()} Team Bans: [${bans}]`;
  };

  return `
Current Draft State:
${formatTeam('blue')}
${formatTeam('red')}

It is currently ${draftState.turn.toUpperCase()} team's turn to act during the ${draftState.phase} phase.
`;
}


export async function getDraftAdvice(draftState: DraftState, userRole: string, signal?: AbortSignal): Promise<AIAdvice> {
  const roleContext = userRole && userRole !== 'All' 
    ? `The user you are advising is a ${userRole} main. Keep this in mind and slightly prioritize analysis relevant to their role's impact on the game.`
    : '';

  const prompt = `
${STRATEGIC_PRIMER}

Analyze the following draft based *only* on the principles and archetypes defined above. Your entire analysis must be framed using this strategic context.

${roleContext}

${formatDraftStateForPrompt(draftState)}

Provide your response in JSON format. Your analysis must include:
1.  **Team Analysis**: For both teams, identify their core team identity (e.g., Poke, Dive), power spike timing, key threats, strengths, weaknesses, and win conditions.
2.  **Draft Score**: A letter grade (e.g., A+, B, C-) for each team's draft and a one-sentence reason for the score.
3.  **Pick/Ban Suggestions**: Specific, reasoned suggestions for the next action.
4.  **Item Suggestions**: Core and situational items for champions already picked.
`;

  try {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    const ai = getAiInstance();
    if (!ai) throw new Error("DraftWise AI is not configured. API key is missing.");

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: draftAdviceSchema,
        },
      });

    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');

    return _parseJsonResponse<AIAdvice>(response.text, "draft advice");
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
        throw error; // Re-throw AbortError to be caught by the caller
    }
    console.error("Error fetching draft advice from Gemini API:", error);
    // Re-throw a more user-friendly error
    if (error instanceof Error && (error.message.includes("invalid response format") || error.message.includes("not configured"))) {
        throw error;
    }
    throw new Error("Failed to get draft advice. DraftWise AI is currently offline.");
  }
}

const championSuggestionSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            championName: { type: Type.STRING },
            reasoning: { type: Type.STRING },
        },
    },
};

export async function getChampionSuggestions(draftState: DraftState, context: { team: TeamSide; type: 'pick' | 'ban'; index: number }, userRole: string, masteryChampions: string[], signal?: AbortSignal): Promise<ChampionSuggestion[]> {
    const roleContext = userRole && userRole !== 'All' 
        ? `The player you are advising is a ${userRole} main. If the current pick is for their role, weigh their comfort and proficiency heavily. Otherwise, suggest champions that have strong synergy with the ${userRole} role.`
        : '';
    
    const masteryContext = masteryChampions.length > 0
        ? `The player has high mastery on these champions: [${masteryChampions.join(', ')}]. Consider suggesting one of these if they are a good fit for the composition.`
        : '';
        
    const currentActionRole = context.type === 'pick' ? `for the ${ROLES[context.index]} role` : '';

    const prompt = `
    You are a world-class League of Legends draft coach. Your advice should be based on established strategic archetypes: Poke, Dive, Protect the Carry, Split Push, and Pick.
    
    ${roleContext}
    ${masteryContext}

    Current Draft:
    ${formatDraftStateForPrompt(draftState)}

    The current action is for the **${context.team.toUpperCase()} TEAM** to **${context.type.toUpperCase()}** their champion #${context.index + 1} ${currentActionRole}.
    
    Provide a list of 3-5 champion suggestions. For each, give a concise (one sentence) reason why it's a strong choice. **Frame your reasoning in terms of strategic archetypes**, for example: "provides the hard engage this Dive comp needs" or "counters their Poke champions".
    
    Return your response ONLY as a JSON array.
    `;

    try {
        if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
        const ai = getAiInstance();
        if (!ai) throw new Error("DraftWise AI is not configured. API key is missing.");
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: championSuggestionSchema,
                thinkingConfig: { thinkingBudget: 0 },
            },
        });

        if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');

        return _parseJsonResponse<ChampionSuggestion[]>(response.text, "champion suggestions");
    } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
            throw error;
        }
        console.error("Error fetching champion suggestions from Gemini API:", error);
        if (error instanceof Error && (error.message.includes("invalid response format") || error.message.includes("not configured"))) {
            throw error;
        }
        throw new Error("Failed to get champion suggestions.");
    }
}


async function _fetchAndCache<T>(cacheKey: string, fetcher: () => Promise<T>): Promise<T> {
    try {
        const cachedData = localStorage.getItem(cacheKey);
        if (cachedData) {
            const { version, data } = JSON.parse(cachedData);
            if (version === DATA_DRAGON_VERSION) {
                return data; // Return cached data if version matches
            }
        }
    } catch (error) {
        console.error(`Failed to read ${cacheKey} from cache:`, error);
        toast.error(`Could not load cached data for ${cacheKey}. It may be corrupted.`);
        localStorage.removeItem(cacheKey); // Clear corrupted cache
    }

    const data = await fetcher();

    try {
        const cachePayload = { version: DATA_DRAGON_VERSION, data };
        localStorage.setItem(cacheKey, JSON.stringify(cachePayload));
    } catch (error) {
        console.error(`Failed to save ${cacheKey} to cache:`, error);
        toast.error("Could not save data to cache. Your browser's storage may be full.");
    }

    return data;
}

export async function getMetaSnapshot(signal?: AbortSignal): Promise<MetaSnapshot> {
    const fetcher = async (): Promise<MetaSnapshot> => {
        const prompt = `
        Based on the latest information from Google Search, provide a structured summary of the current League of Legends meta for the most recent patch.
        Your response must adhere to the following JSON structure:
        {
          "summary": "A brief, 1-2 sentence summary of the current meta.",
          "trendingChampions": [
            {
              "role": "Top",
              "champions": [
                { "championName": "string", "reasoning": "A concise, one-sentence reason." },
                { "championName": "string", "reasoning": "A concise, one-sentence reason." }
              ]
            }
          ]
        }
        
        Instructions:
        1.  Provide a brief, 1-2 sentence summary of the meta's overall theme.
        2.  For each role (Top, Jungle, Mid, ADC, Support), identify exactly 2 trending or powerful champions.
        3.  For each champion, provide a concise one-sentence reason for their strength.

        Return ONLY the raw JSON object string, without any markdown formatting, backticks, or explanations.
        `;

        try {
            if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
            const ai = getAiInstance();
            if (!ai) throw new Error("DraftWise AI is not configured. API key is missing.");

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    tools: [{googleSearch: {}}],
                },
            });
            if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');

            const rawSources: GroundingChunk[] = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
            const sources: MetaSource[] = rawSources
                .map((s: GroundingChunk) => ({ title: s.web?.title || 'Unknown Source', uri: s.web?.uri || '' }))
                .filter(s => s.uri);
            
            const parsed = _parseJsonResponse<Omit<MetaSnapshot, 'sources'>>(response.text, "meta snapshot");
            return { ...parsed, sources };
        } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') throw error;
            console.error("Error fetching meta snapshot from Gemini API:", error);
            throw new Error("Failed to fetch meta snapshot. The AI may be temporarily unavailable.");
        }
    };
    return _fetchAndCache('metaSnapshotCache_structured', fetcher);
}

export async function getTierList(signal?: AbortSignal): Promise<StructuredTierList> {
    const fetcher = async (): Promise<StructuredTierList> => {
        const prompt = `
        Based on the latest information from Google Search, provide a structured S-Tier list for the current League of Legends meta.
        Your response must adhere to the following JSON structure:
        {
          "summary": "A brief, 1-2 sentence summary of the current meta.",
          "tierList": [
            {
              "role": "Top",
              "champions": [
                { "championName": "string", "reasoning": "A concise, one-sentence justification." },
                { "championName": "string", "reasoning": "A concise, one-sentence justification." },
                { "championName": "string", "reasoning": "A concise, one-sentence justification." }
              ]
            }
          ]
        }
        
        Instructions:
        1.  Provide a brief, 1-2 sentence overall summary of the current meta.
        2.  For each role (Top, Jungle, Mid, ADC, Support), identify exactly 3 S-Tier champions.
        3.  For each champion, provide a concise, one-sentence justification for their S-Tier status.
        Return ONLY the raw JSON object string, without any markdown formatting, backticks, or explanations.
        `;
        try {
            if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
            const ai = getAiInstance();
            if (!ai) throw new Error("DraftWise AI is not configured. API key is missing.");

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    tools: [{ googleSearch: {} }],
                },
            });
            if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');

            const rawSources: GroundingChunk[] = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
            const sources: MetaSource[] = rawSources
                .map((s: GroundingChunk) => ({ title: s.web?.title || 'Unknown Source', uri: s.web?.uri || '' }))
                .filter(s => s.uri);
            
            const parsed = _parseJsonResponse<Omit<StructuredTierList, 'sources'>>(response.text, "tier list");
            return { ...parsed, sources };
        } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') throw error;
            console.error("Error fetching tier list from Gemini API:", error);
            throw new Error("Failed to fetch tier list. The AI may be temporarily unavailable.");
        }
    };
    return _fetchAndCache('structuredTierListCache', fetcher);
}

export async function getPatchNotesSummary(signal?: AbortSignal): Promise<StructuredPatchNotes> {
    const fetcher = async (): Promise<StructuredPatchNotes> => {
        const prompt = `
        Based on the latest information from Google Search regarding the most recent League of Legends patch notes, provide a structured summary.
        Your response must adhere to the following JSON structure:
        {
            "summary": "A brief, 1-2 sentence overview of the patch's main goal.",
            "buffs": [ { "name": "string", "change": "string" } ],
            "nerfs": [ { "name": "string", "change": "string" } ],
            "systemChanges": [ { "name": "string", "change": "string" } ]
        }

        Instructions:
        1.  Write a brief, 1-2 sentence overview of the patch's main goal.
        2.  List the top 3 most impactful champion buffs.
        3.  List the top 3 most impactful champion nerfs.
        4.  List any major system or item changes.
        Return ONLY the raw JSON object string, without any markdown formatting, backticks, or explanations.
        `;
        try {
            if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
            const ai = getAiInstance();
            if (!ai) throw new Error("DraftWise AI is not configured. API key is missing.");

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    tools: [{ googleSearch: {} }],
                },
            });
            if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
            
            const rawSources: GroundingChunk[] = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
            const sources: MetaSource[] = rawSources
                .map((s: GroundingChunk) => ({ title: s.web?.title || 'Unknown Source', uri: s.web?.uri || '' }))
                .filter(s => s.uri);
            
            const parsed = _parseJsonResponse<Omit<StructuredPatchNotes, 'sources'>>(response.text, "patch notes");
            return { ...parsed, sources };
        } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') throw error;
            console.error("Error fetching patch notes from Gemini API:", error);
            throw new Error("Failed to fetch patch notes. The AI may be temporarily unavailable.");
        }
    };
    return _fetchAndCache('structuredPatchNotesCache', fetcher);
}

const trialQuestionSchema = {
    type: Type.OBJECT,
    properties: {
        question: { type: Type.STRING, description: "The strategic question for the user." },
        options: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "An array of 4 possible answers." 
        },
        correctAnswer: { type: Type.STRING, description: "The correct option from the 'options' array." },
        explanation: { type: Type.STRING, description: "A brief explanation of why the correct answer is right. It should include keywords that exist in the academy lessons." },
    },
    required: ['question', 'options', 'correctAnswer', 'explanation'],
};

export async function getTrialQuestion(signal?: AbortSignal): Promise<TrialQuestion> {
    const prompt = `
    You are a master League of Legends coach. Generate a challenging, scenario-based multiple-choice question to test a player's strategic knowledge.
    The question should be about in-game strategy, macro-play, or draft knowledge.
    
    - The question must be concise and clear.
    - There must be exactly 4 options.
    - One option must be clearly correct.
    - The other three options should be plausible but incorrect.
    - The correct answer must be one of the provided options.
    - Provide a concise explanation (1-2 sentences) for why the correct answer is the best choice. **Crucially, the explanation MUST naturally include keywords like 'Poke', 'Dive', 'Split Push', 'Engage', or 'Peel' so it can be linked to lessons.**

    Format your response as JSON.
    `;

    try {
        if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
        const ai = getAiInstance();
        if (!ai) throw new Error("DraftWise AI is not configured. API key is missing.");
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              responseSchema: trialQuestionSchema,
            },
        });
        if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
        
        const parsed = _parseJsonResponse<TrialQuestion>(response.text, "trial question");

        // Validate the response structure for robustness
        if (!parsed.options || parsed.options.length !== 4 || !parsed.options.includes(parsed.correctAnswer)) {
            console.error("AI returned a malformed trial question:", parsed);
            throw new Error("AI returned a malformed trial question.");
        }
        
        return parsed;

    } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') throw error;
        console.error("Error fetching trial question from Gemini API:", error);
        if (error instanceof Error && (error.message.includes("invalid response format") || error.message.includes("malformed") || error.message.includes("not configured"))) {
            throw error;
        }
        throw new Error("Failed to generate a new trial. The AI may be temporarily unavailable.");
    }
}

export async function* generateLessonStream(topic: string, signal?: AbortSignal): AsyncGenerator<string, void, undefined> {
    const prompt = `
    You are a master League of Legends coach writing a lesson for an in-app 'Academy'.
    The requested topic is: "${topic}".

    Write a comprehensive but easy-to-understand lesson on this topic.
    - Start with a simple introduction.
    - Use clear headings and paragraphs.
    - Use markdown for formatting, especially **bolding** for important keywords.
    - Keep the tone educational and encouraging.

    Return ONLY the raw markdown content for the lesson. Do not wrap it in JSON.
    `;

    try {
        if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
        const ai = getAiInstance();
        if (!ai) throw new Error("DraftWise AI is not configured. API key is missing.");

        const response = await ai.models.generateContentStream({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        for await (const chunk of response) {
            if (signal?.aborted) {
                console.log("Lesson generation was aborted.");
                return; // Exit the generator
            }
            yield chunk.text;
        }

    } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        console.error("Error generating lesson stream from Gemini API:", error);
        throw new Error(`Failed to generate a lesson on "${topic}". The AI may be temporarily unavailable.`);
    }
}

const championAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        build: {
            type: Type.OBJECT,
            properties: {
                startingItems: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List 2-3 starting items." },
                coreItems: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List 3 core items for a standard build." },
                situationalItems: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            item: { type: Type.STRING },
                            reason: { type: Type.STRING, description: "A brief reason for when to build this item." }
                        }
                    },
                    description: "List 3-4 situational items with reasons."
                },
            },
        },
        runes: {
            type: Type.OBJECT,
            properties: {
                primaryPath: { type: Type.STRING, description: "e.g., Precision" },
                primaryKeystone: { type: Type.STRING, description: "e.g., Conqueror" },
                primaryRunes: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List the 3 other runes in the primary path." },
                secondaryPath: { type: Type.STRING, description: "e.g., Resolve" },
                secondaryRunes: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List the 2 runes in the secondary path." },
            },
        },
        skillOrder: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of 3 ability keys (Q, W, E) in maxing order. e.g., ['Q', 'E', 'W']" },
        composition: {
            type: Type.OBJECT,
            properties: {
                idealArchetypes: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List 2-3 team composition archetypes this champion fits into (e.g., Poke, Dive, Split Push)." },
                synergisticChampions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List 3 champions that have strong synergy." },
            },
        },
        counters: {
            type: Type.OBJECT,
            properties: {
                strongAgainst: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List 3 champions this champion is strong against." },
                weakAgainst: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List 3 champions this champion is weak against." },
            },
        },
        playstyle: {
            type: Type.OBJECT,
            properties: {
                earlyGame: { type: Type.STRING, description: "A one-sentence summary of their early game plan." },
                midGame: { type: Type.STRING, description: "A one-sentence summary of their mid game plan." },
                lateGame: { type: Type.STRING, description: "A one-sentence summary of their late game plan." },
            },
        },
    },
};

export async function getChampionAnalysis(championName: string, signal?: AbortSignal): Promise<ChampionAnalysis> {
    const prompt = `
    Analyze the League of Legends champion "${championName}" for the current meta, providing a detailed, structured breakdown for a player learning them.

    Your analysis must cover these specific areas:
    1.  **Build Path**: Suggest 2 starting items, 3 core items, and 3-4 situational items with brief reasons.
    2.  **Runes**: Provide a standard rune page, including Primary Path, Keystone, 3 primary runes, Secondary Path, and 2 secondary runes.
    3.  **Skill Order**: Provide the ability maxing order (e.g., Q, E, W).
    4.  **Composition**: Identify 2-3 ideal team archetypes and 3 synergistic champions.
    5.  **Counters**: List 3 champions they are strong against and 3 they are weak against.
    6.  **Playstyle**: Briefly describe their game plan for early, mid, and late game in one sentence each.

    Return the response ONLY in JSON format.
    `;

    try {
        if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
        const ai = getAiInstance();
        if (!ai) throw new Error("DraftWise AI is not configured. API key is missing.");

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: championAnalysisSchema,
            },
        });

        if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');

        return _parseJsonResponse<ChampionAnalysis>(response.text, `champion analysis for ${championName}`);
    } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
            throw error;
        }
        console.error(`Error fetching champion analysis for ${championName} from Gemini API:`, error);
        if (error instanceof Error && error.message.includes("invalid response format")) {
            throw error;
        }
        throw new Error(`Failed to get analysis for ${championName}.`);
    }
}

const matchupAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        strongAgainstTips: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    championName: { type: Type.STRING },
                    tip: { type: Type.STRING, description: "A concise tip on how to leverage the advantage against this champion." }
                }
            }
        },
        weakAgainstTips: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    championName: { type: Type.STRING },
                    tip: { type: Type.STRING, description: "A concise tip on how to play and survive against this counter." }
                }
            }
        }
    }
};

export async function getMatchupAnalysis(championName: string, weakAgainst: string[], strongAgainst: string[], signal?: AbortSignal): Promise<MatchupAnalysis> {
    const prompt = `
    Provide specific, actionable gameplay tips for the League of Legends champion "${championName}".

    1.  For each champion in the "Weak Against" list [${weakAgainst.join(', ')}], provide one concise tip on how to play the matchup, survive the lane, or what to do in teamfights.
    2.  For each champion in the "Strong Against" list [${strongAgainst.join(', ')}], provide one concise tip on how to press the advantage in the matchup.
    
    Return the response ONLY in JSON format.
    `;

    try {
        if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
        const ai = getAiInstance();
        if (!ai) throw new Error("DraftWise AI is not configured. API key is missing.");

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: matchupAnalysisSchema,
            },
        });

        if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');

        return _parseJsonResponse<MatchupAnalysis>(response.text, `matchup analysis for ${championName}`);
    } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
            throw error;
        }
        console.error(`Error fetching matchup analysis for ${championName} from Gemini API:`, error);
        if (error instanceof Error && error.message.includes("invalid response format")) {
            throw error;
        }
        throw new Error(`Failed to get matchup tips for ${championName}.`);
    }
}