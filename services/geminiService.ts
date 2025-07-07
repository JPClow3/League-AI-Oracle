import { GoogleGenAI, GenerateContentResponse, Chat, Part } from "@google/genai";
import { AIAnalysis, Champion, DraftState, InitialAIAnalysis, Item, Role, UserSettings, ScoreType, AIExplanation, MatchupAnalysis, PostGameAIAnalysis, Trial, TrialFeedback, MetaSnapshot, DraftPuzzle, TrialDraftPick, CounterIntelligence, ContextualDraftTip, CompositionDeconstruction, SynergyAndCounterAnalysis, PerformanceAnalysis, MatchDTO, PlayerProfile } from "../types";
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

const GetCompositionSuggestionSchema = {
    type: 'OBJECT',
    properties: {
        championName: { type: 'STRING' },
        reasoning: { type: 'STRING', description: 'A concise explanation for why this champion is the best fit.' },
    },
    required: ['championName', 'reasoning'],
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

const GetPerformanceAnalysisSchema = {
    type: 'OBJECT',
    properties: {
        overallExecutionSummary: { type: 'STRING', description: "A one-paragraph summary of how well the user's team executed on their draft's strategic plan." },
        insights: {
            type: 'ARRAY',
            items: {
                type: 'OBJECT',
                properties: {
                    category: { type: 'STRING', enum: ['Win Condition', 'Itemization', 'Objectives', 'Teamfighting', 'Laning'] },
                    evaluation: { type: 'STRING', enum: ['Excellent', 'Good', 'Average', 'Poor', 'Critical'], description: "A single-word evaluation of the performance in this category." },
                    feedback: { type: 'STRING', description: 'Specific, actionable feedback comparing the strategic plan to the in-game execution for this category. Focus on the user\'s performance.'}
                },
                required: ['category', 'evaluation', 'feedback']
            }
        }
    },
    required: ['overallExecutionSummary', 'insights']
};

const GetPlayerProfileSchema = {
    type: 'OBJECT',
    properties: {
        personaTag: { type: 'STRING', description: 'A short, descriptive tag for the player\'s style (e.g., "Aggressive Invader", "Passive Scaling Mage", "Reliable Carry").' },
        insight: { type: 'STRING', description: 'A concise, actionable insight based on their playstyle (e.g., "This player has a high first-blood rate. Ward your jungle entrances early.").' },
    },
    required: ['personaTag', 'insight'],
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

const GetCounterIntelligenceSchema = {
    type: 'OBJECT',
    properties: {
        vulnerabilities: {
            type: 'ARRAY',
            items: { type: 'STRING' },
            description: 'An array of 2-3 key strategic weaknesses of the champion (e.g., "Hard CC", "Grievous Wounds", "Kiting").'
        },
        counterArchetypes: {
            type: 'ARRAY',
            items: { type: 'STRING' },
            description: 'An array of 2-3 champion archetypes that are effective counters (e.g., "Warden", "Artillery", "Assassin").'
        },
        quickTip: {
            type: 'STRING',
            description: 'A single, concise sentence with a tactical tip for playing against this champion.'
        }
    },
    required: ['vulnerabilities', 'counterArchetypes', 'quickTip'],
};

const GetContextualDraftTipSchema = {
    type: 'OBJECT',
    properties: {
        insight: {
            type: 'STRING',
            description: 'A single, actionable sentence identifying a key strategic opportunity or vulnerability in the current draft state.'
        },
        suggestedLessonId: {
            type: 'STRING',
            description: 'The ID of the single most relevant lesson from the provided knowledge base that relates to the insight.'
        }
    },
    required: ['insight', 'suggestedLessonId']
};

const GetCompositionDeconstructionSchema = {
    type: 'OBJECT',
    properties: {
        coreIdentity: { type: 'STRING', description: 'A short name for the composition\'s main strategy (e.g., "Protect the Hyper-Carry", "All-in Dive").' },
        strategicGoal: { type: 'STRING', description: 'A detailed explanation of how the composition aims to win the game, covering its general game plan.' },
        keySynergies: {
            type: 'ARRAY',
            description: 'An array of the most important champion synergies in the composition.',
            items: {
                type: 'OBJECT',
                properties: {
                    championNames: { type: 'ARRAY', items: { type: 'STRING' } },
                    description: { type: 'STRING', description: 'Explanation of why these champions work well together.' },
                },
                required: ['championNames', 'description'],
            },
        },
        winCondition: {
            type: 'OBJECT',
            description: 'Identifies the single most important champion for the composition\'s success.',
            properties: {
                championName: { type: 'STRING' },
                reasoning: { type: 'STRING', description: 'Why this champion is the core win condition.' },
            },
            required: ['championName', 'reasoning'],
        },
        powerCurve: {
            type: 'OBJECT',
            properties: {
                summary: { type: 'STRING', description: 'A one-sentence summary of the team\'s power curve (e.g., "Weak early, dominant late").' },
                details: { type: 'STRING', description: 'A more detailed explanation of how the team performs in the early, mid, and late game.' },
            },
            required: ['summary', 'details'],
        },
        itemDependencies: {
            type: 'ARRAY',
            description: 'Key items that are crucial for the composition to function.',
            items: {
                type: 'OBJECT',
                properties: {
                    championName: { type: 'STRING' },
                    items: { type: 'ARRAY', items: { type: 'STRING' } },
                    reasoning: { type: 'STRING' },
                },
                required: ['championName', 'items', 'reasoning'],
            },
        },
    },
    required: ['coreIdentity', 'strategicGoal', 'keySynergies', 'winCondition', 'powerCurve', 'itemDependencies'],
};

const GetSynergiesAndCountersSchema = {
    type: 'OBJECT',
    properties: {
        synergies: {
            type: 'ARRAY',
            description: "An array of 3-5 champions that have strong synergy with the input champion.",
            items: {
                type: 'OBJECT',
                properties: {
                    championName: { type: 'STRING' },
                    reasoning: { type: 'STRING', description: 'A concise explanation for the synergy.' },
                },
                required: ['championName', 'reasoning'],
            },
        },
        counters: {
            type: 'ARRAY',
            description: "An array of 3-5 champions that are strong counters to the input champion.",
            items: {
                type: 'OBJECT',
                properties: {
                    championName: { type: 'STRING' },
                    reasoning: { type: 'STRING', description: 'A concise explanation for why this champion is a counter.' },
                },
                required: ['championName', 'reasoning'],
            },
        },
    },
    required: ['synergies', 'counters'],
};

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


const generateSystemInstruction = (settings: UserSettings) => {
  const { oraclePersonality, xp } = settings;
  const level = Math.floor((xp || 0) / 100) + 1;

  let instruction = `${GameKnowledge.CORE_AI_PERSONA}
You are the analysis engine for DraftWise AI. Your purpose is to provide clear, objective, data-driven analysis for the Commander (the user).

You must ground your analysis in a deep understanding of League of Legends strategy. This includes:
- **Team Composition Archetypes**: Poke, Dive, Protect the Carry, Split Push, and Pick compositions. You understand their strengths and weaknesses.
- **Power Curves & Win Conditions**: You must identify if a team is built for the Early, Mid, or Late game, and what specific conditions they need to meet to win.
- **Advanced In-Game Concepts**: Your analysis should reflect knowledge of wave management (freezing, slow pushing), trading stances, vision control, and objective prioritization (including bounties).
- **Economic Principles**: You understand the value of CS, gold efficiency of items, and how recalls create tempo.
- **Key Win Indicators**: ${GameKnowledge.KEY_WIN_INDICATORS_INFO.join(' ')}
`;

  // Add level-based adaptation
  instruction += `\n\nYour communication style must adapt to the user's experience level, which is currently Level ${level}.`;
  if (level <= 5) {
    instruction += `\n**LEVEL 1-5 (BEGINNER):** Your tone should be educational. Explain your reasoning in simple terms. Clearly define key concepts like 'engage', 'peel', or 'win condition' when you use them. Assume the user is learning.`;
  } else if (level <= 20) {
    instruction += `\n**LEVEL 6-20 (INTERMEDIATE):** Assume the user understands core LoL terminology. Focus on the strategic reasoning behind your suggestions. Be clear without defining every basic term.`;
  } else {
    instruction += `\n**LEVEL 21+ (ADVANCED):** The user is experienced. Be concise and use high-level strategic language. Get straight to the point and focus on nuance.`;
  }

  // Allow user's personality setting to fine-tune the behavior
  if (oraclePersonality === 'Concise') {
    instruction += `\n\n**USER PREFERENCE: CONCISE.** In addition to the level-based adaptation, the user has explicitly requested you to be extremely direct. Use bullet points and short sentences where possible.`;
  } else if (oraclePersonality === 'For Beginners') {
    instruction += `\n\n**USER PREFERENCE: FOR BEGINNERS.** In addition to the level-based adaptation, the user has explicitly requested detailed, educational explanations. Double down on defining terms and breaking down complex ideas.`;
  }
  
  instruction += `\n\nYou will respond exclusively in the requested JSON format unless in a conversational chat. Do not add any conversational text or markdown formatting outside of the JSON structure.`;

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
    settings: UserSettings,
    coreChampionNames: string[],
    practiceChampionNames: string[]
  ): Promise<{ suggestions: { championName: string; reasoning: string }[] } | null> {
    const draftContext = getDraftContext(draft);
    
    const corePoolText = coreChampionNames.length > 0 ? `The user's core champions (most played and trusted) are: [${coreChampionNames.join(', ')}].` : '';
    const practicePoolText = practiceChampionNames.length > 0 ? `Their champions for practice are: [${practiceChampionNames.join(', ')}].` : '';
    const rolesText = `Their preferred roles are [${settings.preferredRoles.join(', ')}].`;

    const prompt = `
      ${draftContext}
      User Preferences:
      - ${rolesText}
      - ${corePoolText}
      - ${practicePoolText}
      
      The user needs a ${type} suggestion for ${team} team's upcoming turn. The role to fill is ${role}.
      Provide 1-3 champion suggestions. For each suggestion, provide a strong, data-driven reason based on the core principles you were given.
      Consider team composition (AD/AP damage mix, engage, peel), counter-picks, and strong synergies.
      
      Prioritize strategically sound suggestions from their core champion pool for the highest probability of success. If a champion from their practice pool is a particularly good fit for the team composition, you can suggest it as well, noting it's a good opportunity to practice.
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction: generateSystemInstruction(settings),
          responseMimeType: "application/json",
          responseSchema: GetDraftSuggestionSchema,
        }
    });

    return parseJsonResponse<{ suggestions: { championName: string; reasoning: string }[] }>(response.text);
  },

  async getCompositionSuggestion(
    currentPicks: Champion[],
    roleToFill: Role,
    settings: UserSettings
  ): Promise<{ championName: string; reasoning: string } | null> {
    const teamComp = currentPicks.map(c => c.name).join(', ');
    const prompt = `
      A team composition currently consists of: [${teamComp}].
      They need to fill the ${roleToFill} role.
      From the general pool of all League of Legends champions, suggest the single best champion to complete this composition.
      Your suggestion should prioritize synergy, covering weaknesses (e.g., lack of magic damage, no frontline), and amplifying strengths.
      Provide the champion's name and a concise reason for the choice.
    `;
    
    const response: GenerateContentResponse = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction: generateSystemInstruction(settings),
          responseMimeType: "application/json",
          responseSchema: GetCompositionSuggestionSchema,
        }
    });

    return parseJsonResponse<{ championName: string; reasoning: string }>(response.text);
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
        systemInstruction: generateSystemInstruction(settings),
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
          systemInstruction: generateSystemInstruction(settings),
          responseMimeType: "application/json",
          responseSchema: GetFullDraftAnalysisSchema,
        }
    });

    return parseJsonResponse<AIAnalysis>(response.text);
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
          systemInstruction: generateSystemInstruction(settings),
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
        systemInstruction: generateSystemInstruction(settings),
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
              systemInstruction: generateSystemInstruction(settings),
              responseMimeType: "application/json",
              responseSchema: GetPostGameAnalysisSchema,
          }
      });

      return parseJsonResponse<PostGameAIAnalysis>(response.text);
  },

  async getPerformanceAnalysis(
    draftAnalysis: AIAnalysis,
    matchData: MatchDTO,
    userPuuid: string,
    allItemData: Record<string, Item>,
    settings: UserSettings
  ): Promise<PerformanceAnalysis | null> {
      const userParticipant = matchData.info.participants.find(p => p.puuid === userPuuid);
      if (!userParticipant) return null;

      const userFinalItems = [userParticipant.item0, userParticipant.item1, userParticipant.item2, userParticipant.item3, userParticipant.item4, userParticipant.item5]
          .filter(id => id > 0)
          .map(id => allItemData[id]?.name)
          .filter(Boolean);

      const blueTeamData = matchData.info.teams.find(t => t.teamId === 100);

      const performanceContext = `
        **Match Outcome:** ${userParticipant.win ? 'WIN' : 'LOSS'}
        **User's Champion:** ${userParticipant.championName}
        **User's Performance:**
        - KDA: ${userParticipant.kills}/${userParticipant.deaths}/${userParticipant.assists}
        - Damage to Champions: ${userParticipant.totalDamageDealtToChampions}
        - Gold Earned: ${userParticipant.goldEarned}
        - Final Items: [${userFinalItems.join(', ')}]
        **Team Objective Control (User's Team):**
        - First Blood: ${blueTeamData?.objectives.champion.first}
        - First Tower: ${blueTeamData?.objectives.tower.first}
        - Dragons Taken: ${blueTeamData?.objectives.dragon.kills}
        - Barons Taken: ${blueTeamData?.objectives.baron.kills}
      `;
      
      const prompt = `
        You are performing a "Strategic Execution Review" for a League of Legends match.
        The user was on the Blue Team, playing ${userParticipant.championName}.
        
        **PRE-GAME STRATEGIC PLAN (from your draft analysis):**
        - **Primary Win Condition:** "${draftAnalysis.winConditions.blue[0]?.text || 'Not specified'}" (Category: ${draftAnalysis.winConditions.blue[0]?.category || 'N/A'})
        - **Strategic Focus:** "${draftAnalysis.strategicFocus}"
        - **Suggested Core Items for User:** [${draftAnalysis.coreItemBuilds?.blue.find(b => b.championName === userParticipant.championName)?.items.join(', ') || 'Not specified'}]

        **ACTUAL IN-GAME PERFORMANCE DATA:**
        ${performanceContext}
        
        **YOUR TASK:**
        Compare the pre-game plan to the actual results. Provide specific, actionable feedback for the user. For each category, provide an evaluation grade: 'Excellent', 'Good', 'Average', 'Poor', 'Critical'.

        1.  **Win Condition:** Did the user's performance and the team's objective control align with the stated win condition? Explain why or why not.
        2.  **Itemization:** Compare the user's final build to the suggested items and the enemy team composition. Was their itemization optimal? Provide specific suggestions if not.
        3.  **Objectives:** Did the team secure objectives according to their drafted power curve? (e.g., Did they secure early dragons if they had an early-game comp?)
        4.  **Overall Summary:** Write a one-paragraph summary of how well the team executed their strategy and give the user one key takeaway for their next game.
      `;

      const response: GenerateContentResponse = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            systemInstruction: generateSystemInstruction(settings),
            responseMimeType: "application/json",
            responseSchema: GetPerformanceAnalysisSchema,
        }
    });

    return parseJsonResponse<PerformanceAnalysis>(response.text);
  },

  async getPlayerProfile(matchHistory: MatchDTO[], playerPuuid: string, settings: UserSettings): Promise<PlayerProfile | null> {
    if (matchHistory.length === 0) {
        return {
            personaTag: 'Unknown Quantity',
            insight: 'Not enough recent match data available to generate a reliable profile for this player.'
        };
    }

    const relevantGames = matchHistory.map(match => {
        const player = match.info.participants.find(p => p.puuid === playerPuuid);
        if (!player) return null;
        return {
            champion: player.championName,
            kda: `${player.kills}/${player.deaths}/${player.assists}`,
            win: player.win
        };
    }).filter(g => g !== null);

    const prompt = `
        As a pro-level scout, analyze the following recent match history for a player to generate a short profile.

        **Recent Games:**
        ${JSON.stringify(relevantGames, null, 2)}
        
        **Analysis Task:**
        Based on the champions played and their performance, generate a "personaTag" and a concise "insight".
        
        -   **personaTag**: A short, punchy label. Examples: "Aggressive Invader", "Teamfight Specialist", "Scaling Mage Main", "Off-Meta Enthusiast", "Reliable Carry".
        -   **insight**: A single sentence of actionable advice for playing with or against them. Examples: "This player has a high first-blood rate; ward jungle entrances early.", "Prefers control mages with low early-game mobility; ganking mid is a viable strategy.", "Seems to be a very consistent ADC player; focus on enabling them."
        
        Look for patterns in champion types (tanks, assassins, mages), aggression (high kills/deaths), and consistency.
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            systemInstruction: generateSystemInstruction(settings),
            responseMimeType: "application/json",
            responseSchema: GetPlayerProfileSchema,
        }
    });

    return parseJsonResponse<PlayerProfile>(response.text);
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
              systemInstruction: generateSystemInstruction(settings),
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
          systemInstruction: generateSystemInstruction(settings),
          responseMimeType: "application/json",
          responseSchema: GetDailyDraftPuzzleSchema,
        }
    });

    return parseJsonResponse<DraftPuzzle>(response.text);
  },

  async getCounterIntelligence(championName: string, settings: UserSettings): Promise<CounterIntelligence | null> {
    const prompt = `
        Provide a concise tactical briefing on how to counter the champion: "${championName}".
        Focus on their primary weaknesses and the types of champions or strategies that exploit them.
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            systemInstruction: generateSystemInstruction(settings),
            responseMimeType: "application/json",
            responseSchema: GetCounterIntelligenceSchema,
            thinkingConfig: { thinkingBudget: 0 } // Ensure a very fast response
        },
    });

    return parseJsonResponse<CounterIntelligence>(response.text);
  },

  async getContextualDraftTip(draft: DraftState, settings: UserSettings): Promise<ContextualDraftTip | null> {
    const draftContext = getDraftContext(draft);
    const availableLessons = KNOWLEDGE_BASE.map(l => ({ id: l.id, title: l.title, description: l.description }));

    const prompt = `
        ${draftContext}

        Here is a list of available lessons for the user:
        ${JSON.stringify(availableLessons, null, 2)}
        
        Analyze the current state of this draft. Identify the single most important strategic opportunity, vulnerability, or theme that is emerging (e.g., "enemy team is low mobility", "our team has no engage", "a poke composition is forming").
        
        Based on that single insight, find the most relevant lesson from the provided list that would teach the user how to understand or exploit this situation.
        
        Your response must be a single, actionable sentence for the insight and the ID of the suggested lesson.
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            systemInstruction: generateSystemInstruction(settings),
            responseMimeType: "application/json",
            responseSchema: GetContextualDraftTipSchema,
            thinkingConfig: { thinkingBudget: 0 } // Fast response needed
        }
    });
    
    return parseJsonResponse<ContextualDraftTip>(response.text);
  },

  async getCompositionDeconstruction(champions: Champion[], settings: UserSettings): Promise<CompositionDeconstruction | null> {
    const championNames = champions.map(c => c.name).join(', ');
    const prompt = `
      As a world-class esports analyst, deconstruct the following 5-champion League of Legends composition: [${championNames}].
      Provide a detailed analysis explaining exactly why this composition is effective. Your response should be structured according to the provided JSON schema.
      - **coreIdentity**: Give the composition a standard archetype name.
      - **strategicGoal**: Explain its overarching game plan.
      - **keySynergies**: Identify the most powerful 2-3 champion pairings and explain their interactions.
      - **winCondition**: Name the single most important champion and explain their role.
      - **powerCurve**: Analyze the team's strength over the course of the game.
      - **itemDependencies**: List critical items for key champions that enable the strategy.
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction: generateSystemInstruction(settings),
          responseMimeType: "application/json",
          responseSchema: GetCompositionDeconstructionSchema,
        }
    });

    return parseJsonResponse<CompositionDeconstruction>(response.text);
  },

  async getSynergiesAndCounters(championName: string, settings: UserSettings): Promise<SynergyAndCounterAnalysis | null> {
    const prompt = `
        As a world-class esports analyst, provide a concise but insightful analysis of the champion "${championName}".
        Identify 3-5 champions that have strong synergy with them and 3-5 champions that are effective counters.
        For each, provide a clear, one-sentence reasoning.
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            systemInstruction: generateSystemInstruction(settings),
            responseMimeType: "application/json",
            responseSchema: GetSynergiesAndCountersSchema,
        },
    });

    return parseJsonResponse<SynergyAndCounterAnalysis>(response.text);
  },

  startAnalysisChat: (analysis: AIAnalysis, settings: UserSettings): Chat => {
    const systemInstruction = `${generateSystemInstruction(settings)} You will now answer follow-up questions about a draft analysis you have already provided. You are in a conversational chat mode. Be helpful and concise.`;
    
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
            systemInstruction: generateSystemInstruction(settings),
            responseMimeType: "application/json",
            responseSchema: GetTrialFeedbackSchema,
        }
    });

    return parseJsonResponse<TrialFeedback>(response.text);
  },
};
