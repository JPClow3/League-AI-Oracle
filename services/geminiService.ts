import { GoogleGenAI, Type } from '@google/genai';
import type {
  DraftState,
  TeamSide,
  DraftTurn,
  ChampionLite,
  ChampionMatchup,
  GroundingChunk,
  AIAdvice,
  TrialQuestion,
  MetaSnapshot,
  StructuredTierList,
  StructuredPatchNotes,
  PersonalizedPatchSummary,
  UserProfile,
  Settings,
  Champion,
  ChampionAnalysis,
  MatchupAnalysis,
  PlaybookPlusDossier,
  HistoryEntry,
  ChampionSuggestion,
  MetaSource,
} from '../types';
import { STRATEGIC_PRIMER } from '../data/strategyInsights';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const callGemini = async (
    prompt: string, 
    signal: AbortSignal, 
    model: string = 'gemini-2.5-flash',
    isJson = true
) => {
    if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
    
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: isJson ? { responseMimeType: 'application/json' } : {},
    });

    if (signal.aborted) throw new DOMException('Aborted', 'AbortError');

    // The .text property is the recommended way to get the string output.
    // Added optional chaining and fallback to empty string to prevent errors if text is not present.
    const text = response.text ?? '';
    
    if (!text) {
        throw new Error("The AI returned an empty response. Please try again.");
    }

    if (isJson) {
        // Clean the response to ensure it's valid JSON
        const jsonString = text.replace(/^```json/, '').replace(/```$/, '').trim();
        try {
            return JSON.parse(jsonString);
        } catch (e) {
            console.error("Failed to parse JSON from Gemini:", jsonString);
            throw new Error("The AI returned an invalid response. Please try again.");
        }
    }
    return text;
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
    skillLevel: UserProfile['skillLevel'],
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

export const getBotDraftAction = async (
    { draftState, turn, persona, availableChampions, signal, sTierChampions, oneTrickChampion }:
    { draftState: DraftState, turn: DraftTurn, persona: string, availableChampions: ChampionLite[], signal: AbortSignal, sTierChampions?: string[], oneTrickChampion?: string }
): Promise<ChampionSuggestion> => {
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

export const getTeambuilderSuggestion = async (
    { coreConcept, currentPicks, roleToPick, availableChampions, signal }:
    { coreConcept: string, currentPicks: string[], roleToPick: string, availableChampions: ChampionLite[], signal: AbortSignal }
): Promise<ChampionSuggestion[]> => {
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

export const getGroundedAnswer = async (query: string, signal: AbortSignal): Promise<{ text: string, sources: MetaSource[] }> => {
    if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: query,
        config: {
            tools: [{ googleSearch: {} }],
        },
    });
    if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
    
    // FIX: Added optional chaining and fallback to empty string to prevent errors if text is not present.
    const text = response.text ?? '';
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: MetaSource[] = chunks.map((chunk: GroundingChunk) => ({
        title: chunk.web?.title || 'Untitled Source',
        uri: chunk.web?.uri || '#',
    }));

    return { text, sources };
};

export const getTierList = async (signal: AbortSignal): Promise<StructuredTierList> => {
    const prompt = `
Analyze the current League of Legends meta using Google Search and create an S-Tier list for each role (Top, Jungle, Mid, ADC, Support). 
For each champion, provide a very brief (5-10 words) reasoning for why they are S-Tier.
Provide a 1-2 sentence overall summary of the current meta.
Your response must be a single, valid JSON object with no extra text or markdown.

JSON Format:
\`\`\`json
{
  "summary": "string",
  "tierList": [
    { "role": "Top", "champions": [{ "championName": "string", "reasoning": "string" }] },
    { "role": "Jungle", "champions": [{ "championName": "string", "reasoning": "string" }] },
    { "role": "Mid", "champions": [{ "championName": "string", "reasoning": "string" }] },
    { "role": "ADC", "champions": [{ "championName": "string", "reasoning": "string" }] },
    { "role": "Support", "champions": [{ "championName": "string", "reasoning": "string" }] }
  ]
}
\`\`\`
`;
    // This function requires search grounding, so we call generateContent directly
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
        },
    });

    if (signal.aborted) throw new DOMException('Aborted', 'AbortError');

    // FIX: Added optional chaining and fallback to empty string to prevent errors if text is not present.
    const text = (response.text ?? '').trim().replace(/^```json/, '').replace(/```$/, '').trim();
    let data;
    try {
        data = JSON.parse(text);
    } catch (e) {
        console.error("Failed to parse JSON from getTierList:", text);
        throw new Error("The AI returned an invalid response for the Tier List. Please try again.");
    }

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: MetaSource[] = chunks.map((chunk: GroundingChunk) => ({
        title: chunk.web?.title || 'Untitled Source',
        uri: chunk.web?.uri || '#',
    }));
    data.sources = sources;
    return data;
};

export const getPatchNotesSummary = async (signal: AbortSignal): Promise<StructuredPatchNotes> => {
    const prompt = `
Using Google Search, find the latest League of Legends patch notes. Provide a concise summary of the overall changes.
Then, list the top 3 most impactful champion buffs, top 3 nerfs, and top 2 system/item changes.
Your response must be a single, valid JSON object with no extra text or markdown.

JSON Format:
\`\`\`json
{
  "summary": "string",
  "buffs": [{ "name": "string", "change": "string" }],
  "nerfs": [{ "name": "string", "change": "string" }],
  "systemChanges": [{ "name": "string", "change": "string" }]
}
\`\`\`
`;
    // This function requires search grounding
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
        },
    });
    if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
    
    // FIX: Added optional chaining and fallback to empty string to prevent errors if text is not present.
    const text = (response.text ?? '').trim().replace(/^```json/, '').replace(/```$/, '').trim();
    let data;
    try {
        data = JSON.parse(text);
    } catch (e) {
        console.error("Failed to parse JSON from getPatchNotesSummary:", text);
        throw new Error("The AI returned an invalid response for the Patch Notes. Please try again.");
    }
    
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: MetaSource[] = chunks.map((chunk: GroundingChunk) => ({
        title: chunk.web?.title || 'Untitled Source',
        uri: chunk.web?.uri || '#',
    }));
    data.sources = sources;
    return data;
};

export const getPersonalizedPatchSummary = async (profile: UserProfile, settings: Settings, patchNotes: StructuredPatchNotes, champions: ChampionLite[], signal: AbortSignal): Promise<PersonalizedPatchSummary> => {
    const userContext = `
User Profile:
- Skill Level: ${profile.skillLevel}
- Favorite Champions: ${settings.favoriteChampions.join(', ')}
- Primary Role: ${settings.primaryRole}
`;
    const prompt = `
Given the following user profile and patch notes summary, generate a personalized briefing.
The summary should be 1-2 sentences highlighting what's most important *for this specific user*.
Identify the most relevant buffs and nerfs from the patch notes that affect their roles and favorite champions.
For each change, provide a 'reasoning' explaining why it's relevant to them.

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
`;
    return callGemini(prompt, signal);
};

export const getChampionAnalysis = async (championName: string, version: string, signal: AbortSignal): Promise<ChampionAnalysis> => {
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
    return callGemini(prompt, signal);
};

export const getMatchupAnalysis = async (championName: string, weakAgainst: ChampionMatchup[], strongAgainst: ChampionMatchup[], signal: AbortSignal): Promise<MatchupAnalysis> => {
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

export const generateLessonStream = async function* (topic: string, signal: AbortSignal): AsyncGenerator<string> {
    const prompt = `
${STRATEGIC_PRIMER}
You are an expert League of Legends coach. Write a detailed, educational lesson on the topic: "${topic}".
The lesson should be formatted with basic markdown (paragraphs, **bold**, and unordered lists using '*').
Explain the concept, why it's important, and provide actionable examples.
Start the lesson immediately without any introductory phrases like "Here is the lesson".
`;
    const response = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    for await (const chunk of response) {
        if (signal.aborted) return;
        // FIX: Added optional chaining and fallback to empty string to prevent errors if text is not present.
        yield chunk.text ?? '';
    }
};

export const generatePlaybookPlusDossier = async (draftState: DraftState, userSide: TeamSide, signal: AbortSignal): Promise<PlaybookPlusDossier> => {
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

export const getDraftComparisonAnalysis = async (draft1: HistoryEntry, draft2: HistoryEntry, champions: ChampionLite[], signal: AbortSignal): Promise<string> => {
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
    return callGemini(prompt, signal, undefined, false);
};

export const generateDynamicProTip = async (recentEntries: HistoryEntry[], champions: ChampionLite[], signal: AbortSignal): Promise<string> => {
    const prompt = `
${STRATEGIC_PRIMER}
Analyze the user's last 3 saved drafts. Identify a recurring pattern, strength, or weakness in their drafting style.
Provide a single, actionable "Pro Tip" (2-3 sentences) to help them improve. Be specific and encouraging.

Example: "I see you often draft strong poke compositions, but sometimes lack disengage. Consider pairing your next poke draft with a champion like Janna or Gragas to ensure you can safely execute your win condition."

RECENT DRAFTS:
${recentEntries.map((e, i) => `Draft ${i+1} (${e.name}): Blue=[${e.draft.blue.picks.join(', ')}], Red=[${e.draft.red.picks.join(', ')}]`).join('\n')}
`;
    return callGemini(prompt, signal, undefined, false);
};