import { GoogleGenAI, GenerateContentResponse, Chat, Part } from "@google/genai";
import { AIAnalysis, Champion, DraftState, InitialAIAnalysis, Item, Role, UserSettings, ScoreType, AIExplanation, MatchupAnalysis, PostGameAIAnalysis, Trial, TrialFeedback, MetaSnapshot, DraftPuzzle, TrialDraftPick, ChampionVaultData } from "../types";
import * as GameKnowledge from '../data/gameKnowledge';
import { KNOWLEDGE_BASE } from '../data/knowledgeBase';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });
const model = 'gemini-2.5-flash-preview-04-17';

// Schemas for structured JSON responses
const GetDraftSuggestionSchema = {
    type: 'OBJECT',
    properties: {
        suggestions: {
            type: 'ARRAY',
            description: "An array of 1-3 champion suggestions.",
            items: {
                type: 'OBJECT',
                properties: {
                    championName: { type: 'STRING' },
                    reasoning: { type: 'STRING' },
                },
                required: ['championName', 'reasoning'],
            },
        },
    },
    required: ['suggestions'],
};

const GetInitialDraftAnalysisSchema = {
    type: 'OBJECT',
    properties: {
        macroStrategy: {
            type: 'STRING',
            description: "A concise, one-sentence game plan for the blue team."
        },
        keyMicroTips: {
            type: 'ARRAY',
            items: { type: 'STRING' },
            description: "An array of 3 crucial tips for the user's team."
        },
    },
    required: ['macroStrategy', 'keyMicroTips'],
};

const GetFullDraftAnalysisSchema = {
    type: 'OBJECT',
    properties: {
        teamIdentities: { type: 'OBJECT', properties: { blue: { type: 'STRING' }, red: { type: 'STRING' } }, required: ['blue', 'red'] },
        damageProfiles: { type: 'OBJECT', properties: { blue: { type: 'STRING' }, red: { type: 'STRING' } }, required: ['blue', 'red'] },
        keySynergies: { type: 'OBJECT', properties: { blue: { type: 'ARRAY', items: { type: 'STRING' } }, red: { type: 'ARRAY', items: { type: 'STRING' } } }, required: ['blue', 'red'] },
        powerSpikes: {
            type: 'OBJECT',
            description: "Analysis of each team's power levels throughout the game.",
            properties: {
                blue: { type: 'OBJECT', description: "Blue team's power ratings.", properties: { early: { type: 'NUMBER', description: "Power level from 1-10 in early game." }, mid: { type: 'NUMBER', description: "Power level from 1-10 in mid game." }, late: { type: 'NUMBER', description: "Power level from 1-10 in late game." } }, required: ['early', 'mid', 'late'] },
                red: { type: 'OBJECT', description: "Red team's power ratings.", properties: { early: { type: 'NUMBER' }, mid: { type: 'NUMBER' }, late: { type: 'NUMBER' } }, required: ['early', 'mid', 'late'] },
                summary: { type: 'OBJECT', description: "A textual summary of the power spikes.", properties: { blue: { type: 'STRING' }, red: { type: 'STRING' } }, required: ['blue', 'red'] },
                details: { type: 'ARRAY', description: "Specific champion spikes per phase.", items: { type: 'OBJECT', properties: { phase: { type: 'STRING', enum: ['Early', 'Mid', 'Late'] }, championSpikes: { type: 'ARRAY', items: { type: 'OBJECT', properties: { championName: { type: 'STRING' }, reason: { type: 'STRING' } }, required: ['championName', 'reason'] } } }, required: ['phase', 'championSpikes'] } }
            },
            required: ['blue', 'red', 'summary']
        },
        winConditions: {
            type: 'OBJECT',
            description: "Primary objectives and strategies for each team to win.",
            properties: {
                blue: { type: 'ARRAY', items: { type: 'OBJECT', properties: { text: { type: 'STRING' }, category: { type: 'STRING', enum: ['Protect', 'Siege', 'Objective', 'Pick', 'Teamfight', 'Macro'] } }, required: ['text', 'category'] } },
                red: { type: 'ARRAY', items: { type: 'OBJECT', properties: { text: { type: 'STRING' }, category: { type: 'STRING', enum: ['Protect', 'Siege', 'Objective', 'Pick', 'Teamfight', 'Macro'] } }, required: ['text', 'category'] } }
            },
            required: ['blue', 'red']
        },
        strategicFocus: { type: 'STRING', description: "Overall game plan for the blue team, covering game phases." },
        coreItemBuilds: { type: 'OBJECT', properties: { blue: { type: 'ARRAY', items: { type: 'OBJECT', properties: { championName: { type: 'STRING' }, items: { type: 'ARRAY', items: { type: 'STRING' } } }, required: ['championName', 'items'] } }, red: { type: 'ARRAY', items: { type: 'OBJECT', properties: { championName: { type: 'STRING' }, items: { type: 'ARRAY', items: { type: 'STRING' } } }, required: ['championName', 'items'] } } }, required: ['blue', 'red'] },
        mvp: { type: 'OBJECT', properties: { championName: { type: 'STRING' }, reasoning: { type: 'STRING' } }, required: ['championName', 'reasoning'] },
        enemyThreats: { type: 'ARRAY', items: { type: 'OBJECT', properties: { championName: { type: 'STRING' }, threatLevel: { type: 'STRING', enum: ['High', 'Medium', 'Low'] }, counterplay: { type: 'STRING' }, itemSpikeWarning: { type: 'STRING' } }, required: ['championName', 'threatLevel', 'counterplay'] } },
        bansImpact: { type: 'OBJECT', properties: { blue: { type: 'STRING' }, red: { type: 'STRING' } }, required: ['blue', 'red'] },
        inGameCheatSheet: { type: 'OBJECT', properties: { blue: { type: 'ARRAY', items: { type: 'STRING' } }, red: { type: 'ARRAY', items: { type: 'STRING' } } }, required: ['blue', 'red'] },
    },
    required: ['teamIdentities', 'damageProfiles', 'keySynergies', 'powerSpikes', 'winConditions', 'strategicFocus', 'mvp', 'enemyThreats', 'bansImpact', 'inGameCheatSheet', 'coreItemBuilds'],
};

const GetChampionVaultDataSchema = {
    type: 'OBJECT',
    properties: {
        playstyleSummary: { type: 'STRING', description: "A paragraph summarizing the champion's core identity, strengths, and weaknesses." },
        abilities: {
            type: 'ARRAY',
            description: "The champion's 5 abilities (Passive, Q, W, E, R).",
            items: {
                type: 'OBJECT',
                properties: {
                    key: { type: 'STRING', enum: ['Passive', 'Q', 'W', 'E', 'R'] },
                    name: { type: 'STRING', description: "The ability's official name." },
                    description: { type: 'STRING', description: "A concise, one-sentence summary of what the ability does." }
                },
                required: ["key", "name", "description"]
            }
        },
        coreItems: {
            type: 'ARRAY',
            description: "An array of exactly 3 core item names for this champion.",
            items: { type: 'STRING' }
        },
        whenToPick: {
            type: 'ARRAY',
            description: "An array of 2-3 bullet points describing ideal situations or team compositions to pick this champion into.",
            items: { "type": "STRING" }
        },
        counters: {
            type: 'ARRAY',
            description: "An array of 3-5 champion names that are strong counters to this champion.",
            items: { "type": "STRING" }
        },
        counteredBy: {
            type: 'ARRAY',
            description: "An array of 3-5 champion names that this champion is strong against.",
            items: { "type": "STRING" }
        },
        synergies: {
            type: 'OBJECT',
            properties: {
                lanePartner: {
                    type: 'ARRAY',
                    description: "For ADCs/Supports, list 3 ideal lane partners. For other roles, this can be empty.",
                    items: { "type": "STRING" }
                },
                jungler: {
                    type: 'ARRAY',
                    description: "For laners (Top/Mid), list 3 junglers who synergize well. For junglers or supports, this can be empty.",
                    items: { "type": "STRING" }
                }
            },
            required: ["lanePartner", "jungler"]
        }
    },
    required: ["playstyleSummary", "abilities", "coreItems", "whenToPick", "counters", "counteredBy", "synergies"]
};


const GetMatchupAnalysisSchema = {
    type: 'OBJECT',
    properties: {
        powerSpikes: { type: 'ARRAY', items: { type: 'OBJECT', properties: { champion: { type: 'STRING' }, details: { type: 'STRING' } }, required: ['champion', 'details'] } },
        tradingPatterns: { type: 'STRING' },
        waveManagement: { type: 'STRING' },
        jungleImpact: { type: 'STRING' },
    },
    required: ['powerSpikes', 'tradingPatterns', 'waveManagement', 'jungleImpact'],
};

const GetScoreExplanationSchema = {
    type: 'OBJECT',
    properties: {
        explanation: { type: 'STRING', description: "A concise, one-sentence explanation for the team's score in the specified area." },
    },
    required: ['explanation'],
};

const GetPostGameAnalysisSchema = {
    type: 'OBJECT',
    properties: {
        reevaluation: { type: 'STRING', description: "A multi-paragraph string containing the critical re-evaluation and lessons learned." },
        suggestedLessonId: { type: 'STRING', description: 'The ID of the most relevant lesson from the provided list, if any.' },
        suggestedLessonTitle: { type: 'STRING', description: 'The title of the suggested lesson, if any.' },
    },
    required: ['reevaluation'],
};

const GetTrialFeedbackSchema = {
    type: 'OBJECT',
    properties: {
        feedback: { type: 'STRING', description: "Detailed explanation and feedback for the user's answer." },
        isCorrect: { type: 'BOOLEAN' },
    },
    required: ['feedback', 'isCorrect'],
};

const GetMetaSnapshotSchema = {
    type: 'OBJECT',
    properties: {
        trendingUp: { type: 'ARRAY', items: { type: 'OBJECT', properties: { championName: { type: 'STRING' }, reason: { type: 'STRING' } }, required: ['championName', 'reason']}},
        trendingDown: { type: 'ARRAY', items: { type: 'OBJECT', properties: { championName: { type: 'STRING' }, reason: { type: 'STRING' } }, required: ['championName', 'reason']}},
        patchSummary: { type: 'STRING' },
    },
    required: ['trendingUp', 'trendingDown', 'patchSummary'],
}

const GetDailyDraftPuzzleSchema = {
    type: 'OBJECT',
    properties: {
        id: { type: 'STRING', description: "A unique ID for the puzzle, e.g., 'puzzle-20240729'" },
        scenario: { type: 'STRING', description: "A brief, narrative description of the draft situation." },
        problem: { type: 'STRING', description: "A clear, one-sentence description of the strategic problem the user needs to solve." },
        bluePicks: { type: 'ARRAY', items: { type: 'STRING' }, description: "An array of 2-4 champion names for the Blue team." },
        redPicks: { type: 'ARRAY', items: { type: 'STRING' }, description: "An array of 2-4 champion names for the Red team." },
        options: {
            type: 'ARRAY',
            description: "An array of 3-4 champion options for the user to choose from.",
            items: {
                type: 'OBJECT',
                properties: {
                    championName: { type: 'STRING' },
                    isCorrect: { type: 'BOOLEAN' },
                    reasoning: { type: 'STRING', description: "A detailed explanation for why this champion is a good or bad choice in this specific context." },
                },
                required: ['championName', 'isCorrect', 'reasoning'],
            },
        },
    },
    required: ['id', 'scenario', 'problem', 'bluePicks', 'redPicks', 'options'],
}


const parseJsonResponse = <T,>(responseText: string): T | null => {
  let jsonStr = responseText.trim();
  const fenceRegex = /^```(?:json)?\s*\n?(.*?)\n?\s*```$/s;
  const match = jsonStr.match(fenceRegex);
  if (match && match[1]) {
    jsonStr = match[1].trim();
  }

  try {
    return JSON.parse(jsonStr) as T;
  } catch (e) {
    console.error("Failed to parse JSON response:", e, "\nRaw response:", responseText);
    return null;
  }
};


const generateSystemInstruction = (oraclePersonality: UserSettings['oraclePersonality']) => {
  let instruction = `${GameKnowledge.CORE_AI_PERSONA}
You are the analysis engine for DraftWise AI. Your purpose is to provide clear, objective, data-driven analysis for the user.

You must ground your analysis in a deep understanding of League of Legends strategy. This includes:
- **Team Composition Archetypes**: Poke, Dive, Protect the Carry, Split Push, and Pick compositions. You understand their strengths and weaknesses.
- **Power Curves & Win Conditions**: You must identify if a team is built for the Early, Mid, or Late game, and what specific conditions they need to meet to win.
- **Advanced In-Game Concepts**: Your analysis should reflect knowledge of wave management (freezing, slow pushing), trading stances, vision control, and objective prioritization (including bounties).
- **Economic Principles**: You understand the value of CS, gold efficiency of items, and how recalls create tempo.
- **Key Win Indicators**: ${GameKnowledge.KEY_WIN_INDICATORS_INFO.join(' ')}

You will respond exclusively in the requested JSON format unless in a conversational chat. Do not add any conversational text or markdown formatting outside of the JSON structure.`;

  switch (oraclePersonality) {
    case 'Concise':
      instruction += ` Be extremely direct and to the point. Use bullet points and short sentences.`;
      break;
    case 'For Beginners':
      instruction += ` Explain your reasoning in simple terms, defining key concepts like 'AP damage', 'engage', or 'peel' when you use them. Assume the user is new to drafting.`;
      break;
  }
  return instruction;
};

const getDraftContext = (draft: DraftState): string => {
  const formatTeam = (team: { picks: { champion: Champion | null, role?: Role }[], bans: (Champion | null)[] }) => {
    const picks = team.picks.filter(p => p.champion).map(p => `${p.champion!.name} (${p.role || '??'})`).join(', ');
    const bans = team.bans.filter(b => b).map(b => b!.name).join(', ');
    return `Picks: [${picks || 'None'}]. Bans: [${bans || 'None'}]`;
  };
  return `Current Draft State:\n- Blue Team: ${formatTeam(draft.blueTeam)}\n- Red Team: ${formatTeam(draft.redTeam)}`;
};

export const geminiService = {
  async getDraftSuggestion(
    draft: DraftState,
    team: 'BLUE' | 'RED',
    type: 'PICK' | 'BAN',
    role: Role | 'ANY',
    settings: UserSettings
  ): Promise<{ suggestions: { championName: string; reasoning: string }[] } | null> {
    const draftContext = getDraftContext(draft);
    const userPrefs = `User preferences: Favorite Roles: [${settings.preferredRoles.join(', ')}], Champion Pool: [${settings.championPool.join(', ')}].`;

    const prompt = `
      ${draftContext}
      ${userPrefs}
      The user needs a ${type} suggestion for ${team} team's upcoming turn. The role to fill is ${role}.
      Provide 1-3 champion suggestions. For each suggestion, provide a strong, data-driven reason based on the core principles you were given.
      Consider team composition (AD/AP damage mix, engage, peel), counter-picks, and strong synergies.
      Prioritize champions that fit the user's preferences if they are strategically sound.
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction: generateSystemInstruction(settings.oraclePersonality),
          responseMimeType: "application/json",
          responseSchema: GetDraftSuggestionSchema,
        }
    });

    return parseJsonResponse<{ suggestions: { championName: string; reasoning: string }[] }>(response.text);
  },

  async getInitialDraftAnalysis(draft: DraftState, settings: UserSettings): Promise<InitialAIAnalysis | null> {
    const draftContext = getDraftContext(draft);
    const prompt = `
      ${draftContext}
      The draft is complete. Provide a quick, high-level analysis for the user's team (Blue Team).
      This analysis should be extremely fast to generate and focus on the most immediate, actionable advice.
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: generateSystemInstruction(settings.oraclePersonality),
        responseMimeType: "application/json",
        responseSchema: GetInitialDraftAnalysisSchema,
        thinkingConfig: { thinkingBudget: 0 }
      },
    });
    
    return parseJsonResponse<InitialAIAnalysis>(response.text);
  },

  async getFullDraftAnalysis(draft: DraftState, settings: UserSettings): Promise<AIAnalysis | null> {
    const draftContext = getDraftContext(draft);
    const prompt = `
      ${draftContext}
      Provide a complete, in-depth analysis of this finished draft, basing your evaluation on the core strategic principles you were given.
      
      For the 'winConditions' field, for each condition, provide the text and a 'category' from this list: ['Protect', 'Siege', 'Objective', 'Pick', 'Teamfight', 'Macro'].
      
      For the 'powerSpikes' field, provide 'blue' and 'red' team data. Each team's data should include 'early', 'mid', and 'late' properties with a numerical power rating from 1 to 10, where 1 is very weak and 10 is extremely dominant for that game phase. Also provide a 'summary' string for each team's power curve.
    `;

     const response: GenerateContentResponse = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction: generateSystemInstruction(settings.oraclePersonality),
          responseMimeType: "application/json",
          responseSchema: GetFullDraftAnalysisSchema,
        }
    });

    return parseJsonResponse<AIAnalysis>(response.text);
  },

  async getChampionVaultData(champion: Champion, settings: UserSettings): Promise<ChampionVaultData | null> {
    const prompt = `
      Analyze the League of Legends champion: "${champion.name}".
      Provide a comprehensive encyclopedia entry covering all aspects of the champion for a strategy tool.
      - playstyleSummary: A detailed paragraph on their core identity, strengths, and weaknesses.
      - abilities: List all 5 abilities (Passive, Q, W, E, R) with their official names and a one-sentence description.
      - coreItems: List exactly 3 essential items for a standard build.
      - whenToPick: List 2-3 bullet points on ideal scenarios to pick them.
      - counters: List 3-5 champions they are weak against.
      - counteredBy: List 3-5 champions they are strong against.
      - synergies: List ideal lane partners (for bot/support) and/or junglers (for laners).
    `;
    const response: GenerateContentResponse = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction: generateSystemInstruction(settings.oraclePersonality),
          responseMimeType: "application/json",
          responseSchema: GetChampionVaultDataSchema,
        }
    });
    return parseJsonResponse<ChampionVaultData>(response.text);
  },
  
   async getMatchupAnalysis(yourChampion: Champion, enemyChampion: Champion, settings: UserSettings): Promise<MatchupAnalysis | null> {
    const prompt = `
      Analyze the specific 1v1 lane matchup between "${yourChampion.name}" (Your Champion) and "${enemyChampion.name}" (Enemy Laner).
      Provide a detailed tactical briefing for the "${yourChampion.name}" player.
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction: generateSystemInstruction(settings.oraclePersonality),
          responseMimeType: "application/json",
          responseSchema: GetMatchupAnalysisSchema,
        }
    });

    return parseJsonResponse<MatchupAnalysis>(response.text);
  },

  async getScoreExplanation(
    champions: Champion[],
    scoreType: ScoreType,
    settings: UserSettings
  ): Promise<AIExplanation | null> {
    const championNames = champions.map(c => c.name).join(', ');
    const prompt = `
      A team consists of: [${championNames}].
      Analyze their "${scoreType}".
      Provide a concise, one-sentence explanation for why their combined score in this area is effective or lacking.
      Focus on 1-2 key champion abilities or synergies that define this characteristic for the team.
      
      Example for 'CC': "High CC due to the long-range initiation from Ashe's Arrow combined with Leona's lockdown potential."
      Example for 'Damage Profile': "Well-balanced damage, with sustained physical from Jinx and burst magic from Syndra, making them hard to itemize against."
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: generateSystemInstruction(settings.oraclePersonality),
        responseMimeType: "application/json",
        responseSchema: GetScoreExplanationSchema,
        thinkingConfig: { thinkingBudget: 0 }
      },
    });

    return parseJsonResponse<AIExplanation>(response.text);
  },

  async getPostGameAnalysis(
      draft: DraftState,
      originalAnalysis: AIAnalysis,
      outcome: 'WIN' | 'LOSS',
      postGameNotes: string,
      settings: UserSettings
  ): Promise<PostGameAIAnalysis | null> {
      const draftContext = getDraftContext(draft);
      const availableLessons = KNOWLEDGE_BASE.map(l => ({ id: l.id, title: l.title, category: l.category })).filter(l => l.category.includes('Fundamentals') || l.category.includes('Concepts'));
      const lessonsContext = `
        Here is a list of available lessons for the user:
        ${JSON.stringify(availableLessons, null, 2)}
      `;
      const prompt = `
          ${draftContext}

          You previously provided this in-depth analysis for the Blue Team:
          - Team Identity: ${originalAnalysis.teamIdentities.blue}
          - Win Conditions: ${originalAnalysis.winConditions.blue.map(wc => wc.text).join(', ')}
          - Strategic Focus: ${originalAnalysis.strategicFocus}

          The user has now reported the game outcome: **${outcome}**.
          They also provided these notes on what happened: "${postGameNotes || 'No notes provided.'}"

          Critically re-evaluate your initial analysis based on this new information. Your task is to provide a "lessons learned" debrief for the user.
          1. Was your initial strategy flawed given the user's report, or was the loss more likely due to in-game execution?
          2. Specifically, how did the events described by the user (${postGameNotes}) align with or deviate from your predicted win conditions?
          3. What could have been drafted differently to better mitigate the risk of what the user described happening? Suggest 1-2 alternative champion picks or bans and explain why.
          4. Based on your analysis of the strategic failure, review the provided list of lessons and identify the single most relevant lesson that would help the user understand and avoid this mistake in the future. If a relevant lesson is found, include its 'id' and 'title' in your response as 'suggestedLessonId' and 'suggestedLessonTitle'. If no lesson is directly applicable, omit these fields.

          Be analytical and constructive. Help the user learn from this game.
          ${lessonsContext}
      `;

      const response: GenerateContentResponse = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
              systemInstruction: generateSystemInstruction(settings.oraclePersonality),
              responseMimeType: "application/json",
              responseSchema: GetPostGameAnalysisSchema,
          }
      });

      return parseJsonResponse<PostGameAIAnalysis>(response.text);
  },

  async getMetaSnapshot(settings: UserSettings): Promise<{ data: MetaSnapshot | null, sources: any[] | undefined } | null> {
      const prompt = `Analyze the current League of Legends meta using Google Search for the latest patch.
      Identify 3 champions that are trending up and 3 that are trending down in popularity or win rate. Provide a one-sentence reason for each trend.
      Also provide a 1-2 sentence summary of the latest game patch's impact on the meta.
      
      Respond ONLY with a JSON object matching this schema:
      {
        "trendingUp": [{ "championName": "string", "reason": "string" }],
        "trendingDown": [{ "championName": "string", "reason": "string" }],
        "patchSummary": "string"
      }`;
      
      const response: GenerateContentResponse = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
              systemInstruction: generateSystemInstruction(settings.oraclePersonality),
              tools: [{ googleSearch: {} }],
          }
      });
      
      const data = parseJsonResponse<MetaSnapshot>(response.text);
      const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks;

      return { data, sources };
  },

  async getDailyDraftPuzzle(settings: UserSettings): Promise<DraftPuzzle | null> {
    const prompt = `
      Act as a "Puzzle Master" for a League of Legends draft training tool.
      Your task is to create a unique and interesting daily draft puzzle.
      
      1.  **Create a partial draft scenario**: Create an incomplete draft with 2-4 champions on each team.
      2.  **Define a clear problem**: Based on the champions picked, identify a critical weakness in the user's team (always assume user is Blue team). Examples: "no frontline," "lacks reliable engage," "has no magic damage," "is vulnerable to assassins."
      3.  **Provide options**: Offer 3-4 champion choices for the user's next pick. ONE of these must be the "correct" or "optimal" choice that solves the defined problem. The others should be plausible but flawed choices.
      4.  **Provide reasoning**: For EACH option, provide a clear, educational explanation for why it is a good or bad choice in this specific context.

      Ensure the puzzle is non-trivial and teaches a valuable drafting concept.
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction: generateSystemInstruction(settings.oraclePersonality),
          responseMimeType: "application/json",
          responseSchema: GetDailyDraftPuzzleSchema,
        }
    });

    return parseJsonResponse<DraftPuzzle>(response.text);
  },

  startAnalysisChat: (analysis: AIAnalysis, settings: UserSettings): Chat => {
    const systemInstruction = `${generateSystemInstruction(settings.oraclePersonality)} You will now answer follow-up questions about a draft analysis you have already provided. You are in a conversational chat mode. Be helpful and concise.`;
    
    const contextPrompt = `I have received your draft analysis. Here it is for your reference:
    
    ${JSON.stringify(analysis, null, 2)}
    
    I will now ask questions about it.`;
    
    const chat = ai.chats.create({
        model,
        config: { systemInstruction },
        history: [
            { role: "user", parts: [{ text: contextPrompt }] },
            { role: "model", parts: [{ text: "I have reviewed the analysis and am ready for your questions." }] }
        ]
    });
    return chat;
  },

  continueChat: async (chat: Chat, message: string): Promise<GenerateContentResponse> => {
      const response = await chat.sendMessage({ message });
      return response;
  },

  async getTrialFeedback(
    trial: Trial,
    userAnswer: string,
    settings: UserSettings
  ): Promise<TrialFeedback | null> {
    const correctAnswer = trial.options.find(o => o.isCorrect)?.text;
    const isUserCorrect = userAnswer === correctAnswer;

    let draftContext = '';
    if (trial.draftState) {
        const formatTeam = (team: { picks: TrialDraftPick[] }) => {
            const picks = team.picks.map(p => `${p.championName} (${p.role})`).join(', ');
            return `Picks: [${picks || 'None'}]`;
        };
        draftContext = `The draft for this scenario is as follows:\n- Blue Team: ${formatTeam(trial.draftState.blueTeam)}\n- Red Team: ${formatTeam(trial.draftState.redTeam)}\n\n`;
    }

    const prompt = `
      A user is being tested on a strategic concept from a lesson titled "${trial.title}".
      ${draftContext}
      Scenario: "${trial.scenario}"
      Question: "${trial.question}"
      The user chose: "${userAnswer}".
      The correct answer is: "${correctAnswer}".

      Your task is to provide constructive feedback.
      1. State whether the user's answer was correct or incorrect.
      2. If correct, briefly affirm why it's the best choice, reinforcing the lesson concept.
      3. If incorrect, explain why their choice is suboptimal and why the correct answer is better. Be encouraging and educational, not critical. Reference the core concept of the trial and the provided draft if available.

      Keep the feedback concise, around 2-3 sentences.
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            systemInstruction: generateSystemInstruction(settings.oraclePersonality),
            responseMimeType: "application/json",
            responseSchema: GetTrialFeedbackSchema,
        }
    });

    return parseJsonResponse<TrialFeedback>(response.text);
  },
};