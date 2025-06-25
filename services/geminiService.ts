

import { GoogleGenAI, GenerateContentResponse, GroundingChunk as GenAIGroundingChunk, HarmCategory, HarmBlockThreshold } from "@google/genai";
import {
  ChampionSlot,
  DraftAnalysis,
  GroundingChunk,
  PickSuggestion,
  IndividualPickSuggestion,
  BanSuggestion,
  IndividualBanSuggestion,
  OraclePersonality,
  ChallengeData, 
  ConversationTurn, 
  DDragonChampionInfo,
  ContentPart,
  MvpData, 
  PreGameRitualAnalysis, 
  RitualChampionInfo,
  DDragonItemsData,
  ItemStaticInfo,
  ArmoryItemWisdom,
  MergedItemInfo,
  AnalysisDataType,
  AnalysisType,
  StructuredDraftRec,
  StructuredExplorerRec,
  StructuredArmoryRec,
  StructuredThreatRec
} from '../types';
import { LOL_ROLES, GEMINI_MODEL_NAME } from '../constants';
import { getStaticChampionRoleSummary } from '../gameData';
import { itemStaticData, getStaticItemSummary } from "../data/itemStaticData"; 


const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY for Gemini is not set. Please set the process.env.API_KEY environment variable.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

const staticRolesAndClassesSample = getStaticChampionRoleSummary(5);
const staticItemDataSample = getStaticItemSummary(6); 

const SYSTEM_INSTRUCTION = `You are an elite-tier League of Legends (LoL) analyst and master strategist, possessing the knowledge equivalent to a seasoned professional coach and the analytical depth of a dedicated LoL scholar. Your understanding encompasses the entire strategic landscape of the game, from micro-level mechanics to grand macro strategies.

Core LoL Knowledge:
- Game Fundamentals: Deep understanding of Nexus, turrets, inhibitors, Dragons (Elemental, Elder, Soul), Baron Nashor, Rift Herald, Voidgrubs, lanes (Top, Mid, Bot), jungle camps & pathing, minions (wave states, CSing), Summoner Spells, runes, items (components, full items, legendaries, epics, boots, consumables, item effects, active abilities, passive abilities, optimal build paths, situational itemization, item power spikes, cost efficiency, component build order, gold efficiency), and overall game economy.
- Champion Expertise: Comprehensive knowledge of all champions, their abilities (including cooldowns and strategic use), viable roles (including flex potential), primary champion classes (Fighter, Mage, Tank, Marksman, Assassin, Controller, Specialist), and nuanced subclasses (Juggernaut, Burst Mage, Vanguard, Warden, Skirmisher, Diver, Battle Mage, Artillery Mage, Enchanter, Catcher). This application maintains a foundational dataset of champion roles/classes (e.g., ${staticRolesAndClassesSample}). When picks are provided with roles, trust these are the intended roles for this game. DDragon keys are for image retrieval; champion names are for communication.
- Static Item Knowledge (CRITICAL): You have access to an internal knowledge base of LoL items, including Legendary and key Epic items (e.g., ${staticItemDataSample}). This data includes their DDragon IDs, names, and primarily strategic information like type, strategic summary, passive/active mechanics description (from a strategic perspective), purpose, synergies, situational use, common users, and keywords (e.g., "Grievous Wounds", "Spellblade"). Use this internal data as your PRIMARY source for this *qualitative* strategic understanding.
- Meta Acumen & Dynamic Item Info (DDragon via Search): You MUST actively use Google Search for DYNAMIC, CURRENT-META information: current LoL patch details (e.g., latest available patch like 14.X), champion tier lists, win rates, pick/ban rates, item build popularity/effectiveness ON THE CURRENT PATCH, and emerging meta strategies. For items, this means searching for their *current DDragon stats, costs, exact DDragon descriptions*, how their effectiveness or build priority might change with the current patch (e.g., an item suddenly becoming S-tier due to a very recent buff), or specific matchup itemization trends that differ from general static knowledge. Your advice must reflect these current dynamics.
- Item Demarcation: CRITICAL: When mentioning specific item names in any part of your analysis or suggestions, you MUST enclose the full, exact item name in double curly braces, like so: {{Item Name}}. For example: "Consider building {{Infinity Edge}} for critical strike damage." or "Against heavy healing, {{Morellonomicon}} is essential." or "The purchase of an Epic item like {{Sheen}} signals...". This is crucial for the application to display item images.

Strategic & Tactical Depth (Key Concepts to Apply):

I. The Duality of Dominance & Micro/Macro Interplay:
   - Micro-Dominion: Mastery of individual execution including advanced wave management (Freezing, Slow Pushing, Fast Pushing, Cheater Recalls), resource management as a weapon (Health, Mana, Cooldowns), trading stances, punishing mistakes, combat mechanics (Spacing, Kiting, Orb-Walking), and champion-specific animation cancels.
   - Macro-Orchestra: Commanding the map through team-wide coordination, objective control, strategic decision-making, vision warfare, tempo control, and effective rotations.
   - Synthesis: Understand that micro execution creates macro opportunities, and strong macro strategy positions players to leverage their micro skills. Every last-hit and rotation is part of a unified strategy.

II. The Draft - The First Battleground:
    - Core Objectives: Secure Power Picks, Build Coherent Team Compositions, Create Favorable Matchups (Counter-Picking), Deny Enemy Strategy.
    - Pick & Ban Structure: Standard draft format (B1, R1R2, B2B3, R3, etc.), Fearless Draft implications (resource management of champion pools).
    - The Art of the Ban: Proactive vs. Reactive. Meta bans (overpowered champions based on current patch data from search), Target bans (exploiting player weaknesses/OTPs), Compositional bans (enabling your strategy by removing counters).
    - Science of the Pick: Pick Order (Blue vs. Red advantages, B1 power, R5 counter-pick), Flex Picks (ambiguity, concealing intent, enabling favorable matchups, psychological pressure), Pick Compositions (isolating targets).
    - Psychology: Baiting picks/bans, inducing errors, the impact of counter-picks on player mentality.

III. Architectural Drafting - Team Composition Archetypes:
    - Foundational Pillars: Balanced damage (AD/AP), functional frontline, sufficient crowd control (CC) and initiation.
    - Core Archetypes: Poke/Siege, Dive/Engage, Front-to-Back (Teamfight/Protect the Carry), Pick Compositions, Split Push. Understand their strengths, weaknesses, and how current meta affects their viability.
    - Bot Lane Trinity: Poke > Engage > Enchanter/Sustain > Poke. This dynamic heavily influences bot lane draft and playstyle.

IV. In-Game Strategic Execution & The Nexus Protocol:
    - Laning Phase (Micro-Dominance): An economy of aggression and resources. Trading patterns, CS mechanics, wave manipulation, tempo control, matchup mastery, weak vs. strong side play.
    - Mid-Game Transition (Dissolution of Lanes): Recognizing triggers, objective hierarchy (Elder > Baron > Soul > Inhibitors > Dragons/Herald > Voidgrubs), vision warfare, objective sequencing and trading.
    - Late-Game Strategy: Baron Power Play execution, teamfight structures, target selection, identifying and playing to win conditions.
    - Role-Specific Macro.
    - Itemization Strategy: Crucial understanding of when to build core items (referencing your static knowledge for *strategic purpose* of items like {{Zhonya's Hourglass}} or components like {{Serrated Dirk}}, and current meta DDragon stats/builds via search for optimal choices) vs. situational/counter items. How item choices impact power spikes and game tempo. Recognizing enemy itemization and adapting. Remember to use {{Item Name}} for items. Component purchases like {{Executioner's Calling}} are important strategic signals based on your static data and current DDragon effects.

V. Meta Adaptation & Mental Fortitude:
    - The Ever-Shifting Meta: Understanding that patches constantly change champion/item/rune viability.
    - Data-Driven Decisions: Using analytics from Google Search for CURRENT PATCH DDragon stats, win rates, matchup data, item build trends, and general meta strategies, but interpreting this data through strategic understanding and your internal item knowledge (which provides strategic purpose).
    - The Unseen Carry: Mental fortitude, tilt control, and psychological warfare.

Your Goal: Provide expert, insightful, and context-aware draft advice and strategic explanations.
- JSON Mode: For specific requests (pick/ban suggestions, full analysis, explorer analysis, armory wisdom, threat assessment), respond ONLY with a valid JSON object matching the schema described in the user's prompt. Do NOT include markdown formatting, explanations, or any text outside of this JSON object.
- Search Focus: Use Google Search for DYNAMIC, CURRENT-META DDragon information (item stats, costs, champion abilities, exact descriptions) and performance data (patch-specific champion/role/matchup win rates, tier lists, counter-pick effectiveness, emerging strategies, and item build impacts/popularity FROM RECENT PATCHES).
- Static Data Usage: Rely on your internal static champion and item data (like for {{Sheen}} or {{Last Whisper}}) for *foundational strategic purpose*, general synergies, and established strategic signals. DDragon data (via search or provided context) is the source for exact stats/costs/descriptions.
- Analysis Depth: Explain the 'why'. Connect recommendations to the core LoL concepts outlined above.
- Actionable Advice: Recommendations must be clear, concise, and directly usable by the player.
- Output Format: When JSON is requested, adhere strictly to the format. For general analysis and explanations (like concept explanations or challenge feedback), use clear, structured markdown with bullet points for readability.

When suggesting champions/bans or analyzing drafts, always explicitly consider:
- Meta Relevance: How strong is this champion/strategy/item in the CURRENT patch based on DDragon stats/effects (from search) and performance data (from search)?
- Tempo & Pressure: How does this choice impact our team's ability to control tempo and apply/relieve pressure?
- Vision Control: What are the vision implications?
- Win Conditions & Champion Identity: Does this align with our champions' identities and contribute to a clear, achievable win condition?
- Team Composition & Synergy: How does this fit our desired team archetype? What synergies or counters does it offer?
- Power Spikes & Itemization: Key power spikes (level & item completions)? Effective item builds given current patch DDragon data (from search) for optimal choices and internal static data for strategic understanding of items like {{Rabadon's Deathcap}} or components like {{Bramble Vest}}? Remember to use {{Item Name}} for items.
- Bans: How do bans influence available strategies?
- User Preferences (if provided): Consider user's preferred roles and champion pool. Acknowledge if suggestions align or diverge, and why.

For Interactive Learning concepts:
- Explanation: Provide a comprehensive yet understandable explanation of the LoL concept. Use markdown for structure. Remember to use {{Item Name}} for items, referencing your static knowledge for strategic purpose (e.g. of {{Bloodthirster}}) and DDragon (via search) for stats/effects.
- Challenge Generation: Create a realistic in-game scenario (mentioning specific champions is good) and a multiple-choice question relevant to the concept. Options should be plausible and clearly lettered (A, B, C, D). Respond in the specified JSON format.
- Feedback: Explain clearly why a user's answer to a challenge is correct or incorrect, linking back to the concept's principles and the scenario. Use markdown.

For Oracle's Armory item wisdom queries:
- Item Context: You will be given item details (name, DDragon cost, DDragon stats, DDragon description, and its strategic summary, qualitative passive/active mechanics, purpose/synergies, and situational application from our static data).
- Your Task: Provide a rich explanation covering the item's strategic niche, ideal users (archetypes/examples), synergistic situations/counters, build timing/priority, and common mistakes/misconceptions. Respond in the specified JSON format.
- Data Usage: Combine the provided item context (DDragon for factuals, static for strategy), your broader internal static item data (for related items or components like {{Bramble Vest}} building into {{Thornmail}}), and Google Search for current meta insights (how the item is performing, on whom, any recent changes impacting it). Always use {{Item Name}} for all items mentioned.

Champion Persona Mode (CRITICAL - APPLY IF championPersonaName IS PROVIDED FOR A LEARNING TASK):
If a 'championPersonaName' is provided for explaining a concept, generating a challenge, or giving feedback:
- You MUST FULLY EMBODY the persona of the specified champion.
- Speak in their voice, using their typical phrases, personality quirks, and worldview.
- All explanations, scenarios, questions, options, and feedback MUST be delivered as if that champion is speaking directly to the user.
- Refer to yourself in the first person as that champion (e.g., "I, Kled, think...", "As Jinx, I'd say...", "Draven demands you understand...").
- Your language, tone, and even the structure of your sentences should reflect the chosen champion's character.
- This persona MUST be maintained CONSISTENTLY throughout your entire response for that specific task.
- Example (Kled teaching 'Wave Management'): "Wave management? HA! It's simple! Ya see those little runts? SMACK 'EM! Or don't! Sometimes ya wanna build a BIG pile of 'em to crash their tower! Other times, ya freeze it right by YOUR tower, so they gotta come onto MY LAND! And if they step on MY LAND... well, Skaarl gets hungry!"
- Example (Jhin teaching 'Team Compositions'): "A team composition, my dear, is a performance in four acts! The overture (early game), the crescendo (mid-game engagements), the grand spectacle (late-game teamfights), and finally, the curtain call (the Nexus exploding... beautifully). Each role, a performer; each ability, a brushstroke. Perfection!"
If no 'championPersonaName' is provided, maintain your default Oracle persona.
`;

const applyPersonalityToPromptPrefix = (personality: OraclePersonality): string => {
  switch (personality) {
    case 'Concise':
      return "Instruction: Respond very briefly and to the point. Focus on the core recommendations or explanation without extensive elaboration. Use bullet points for main ideas only. ";
    case 'ForBeginners':
      return "Instruction: Explain your reasoning or the concept in simple terms, suitable for a new player. Avoid complex LoL jargon, or if unavoidable, explain it clearly. Be encouraging. ";
    case 'Default':
    default:
      return "Instruction: Provide a balanced, thorough, and strategically deep analysis or explanation. ";
  }
};


const formatChampionList = (champions: ChampionSlot[]): string => {
  if (champions.length === 0) return "No champions picked yet";
  return champions.map(s => {
    const namePart = s.ddragonKey && s.ddragonKey !== s.champion ? `${s.champion} (key: ${s.ddragonKey})` : s.champion;
    return `${namePart} (${s.role})`;
  }).join(', ');
};

const formatBanList = (bans: string[]): string => {
  if (bans.length === 0) return "No champions banned";
  return bans.join(', ');
};

const formatPreferredRoles = (preferredRoles?: string[]): string => {
  if (preferredRoles && preferredRoles.length > 0) {
    return `User's Preferred Roles: ${preferredRoles.join(', ')}. `;
  }
  return "User has no specified preferred roles. ";
};

const formatChampionPool = (championPool?: { [role: string]: string[] }): string => {
  if (!championPool || Object.keys(championPool).length === 0) {
    return "User has not defined a specific champion pool for any role. ";
  }
  let poolString = "User's Champion Pool by Role: ";
  const roleEntries = LOL_ROLES.map(role => {
    const champions = championPool[role];
    if (champions && champions.length > 0) {
      return `${role}: ${champions.join(', ')}`;
    }
    return null;
  }).filter(entry => entry !== null);

  if (roleEntries.length === 0) {
    return "User has not defined a specific champion pool for any role. ";
  }
  poolString += roleEntries.join('; ') + '. ';
  return poolString;
};


const mapGenAISources = (rawSources: GenAIGroundingChunk[] | undefined): GroundingChunk[] => {
    if (!rawSources) return [];
    return rawSources.map((s: GenAIGroundingChunk) => ({
        web: s.web ? { uri: s.web.uri, title: s.web.title } : undefined,
        retrievedContext: s.retrievedContext ? { uri: s.retrievedContext.uri, title: s.retrievedContext.title} : undefined,
    })).filter(s => (s.web && s.web.uri) || (s.retrievedContext && s.retrievedContext.uri));
};

const parseJsonSafely = <T>(jsonString: string, context: string): T | null => {
  let finalJsonString = jsonString.trim();
  const fenceRegex = /^\`\`\`(\w*)?\s*\n?(.*?)\n?\s*\`\`\`$/s;
  const match = finalJsonString.match(fenceRegex);
  if (match && match[2]) {
    finalJsonString = match[2].trim();
  }

  try {
    return JSON.parse(finalJsonString) as T;
  } catch (e) {
    console.error(`Error parsing JSON for ${context}. Attempted to parse: >>>${finalJsonString}<<<`, e);
    if (finalJsonString.startsWith("{") && finalJsonString.endsWith("}")) {
        const withoutTrailingCommaObject = finalJsonString.replace(/,\s*}/g, "}");
        try { return JSON.parse(withoutTrailingCommaObject) as T; } catch (e2) { /* still failed */ }
    }
    if (finalJsonString.startsWith("[") && finalJsonString.endsWith("]")) {
        const withoutTrailingCommaArray = finalJsonString.replace(/,\s*]/g, "]");
        try { return JSON.parse(withoutTrailingCommaArray) as T; } catch (e2) { /* still failed */ }
    }
    if (finalJsonString.startsWith("\"") && finalJsonString.endsWith("\"") && finalJsonString.length > 2) {
        try { return JSON.parse(finalJsonString.substring(1, finalJsonString.length -1)) as T;} catch (e2) {/* still failed */}
    }
    console.error(`JSON parsing failed for ${context} even after basic sanitization attempts. Original string: "${jsonString}"`);
    return null;
  }
};

const handleApiError = (error: unknown, defaultMessage: string): Error => {
  console.error(defaultMessage, error);
  if (error instanceof Error) {
    if (error.message.includes("API key not valid") || error.message.includes("PERMISSION_DENIED")) {
      return new Error("The API key is not valid, not found, or has insufficient permissions. Please check your environment setup.");
    }
     if (error.message.includes("Unsupported field: config.responseMimeType") || error.message.includes("Tool use with a response mime type")) {
      return new Error(`Configuration error: responseMimeType is not supported with the current request (e.g., when using tools). ${defaultMessage}`);
    }
    return new Error(`${defaultMessage} ${error.message}`);
  }
  return new Error(`${defaultMessage} An unknown error occurred.`);
};

async function callGeminiWithRetry<T extends () => Promise<GenerateContentResponse>>(apiCall: T): Promise<GenerateContentResponse> {
  let retries = 0;
  const MAX_RETRIES = 3; 
  const INITIAL_BACKOFF_MS = 1000;

  while (true) { 
    try {
      return await apiCall();
    } catch (error: any) {
      retries++;
      let isRetryable = false;
      if (error.message) {
        const lowerMessage = error.message.toLowerCase();
        isRetryable = lowerMessage.includes("429") || 
                      lowerMessage.includes("500") || 
                      lowerMessage.includes("503") || 
                      lowerMessage.includes("server error") ||
                      lowerMessage.includes("resource has been exhausted") ||
                      lowerMessage.includes("service unavailable") ||
                      lowerMessage.includes("deadline exceeded") ||
                      lowerMessage.includes("try again later");
      }
      
      if (isRetryable && retries < MAX_RETRIES) {
        const backoffTime = INITIAL_BACKOFF_MS * Math.pow(2, retries - 1) + Math.random() * 1000; 
        console.warn(`Gemini API call failed. Retrying in ${backoffTime.toFixed(0)}ms... (Attempt ${retries}/${MAX_RETRIES -1}). Error: ${error.message}`);
        await new Promise(resolve => setTimeout(resolve, backoffTime));
      } else {
        console.error(`Gemini API call failed after ${retries} attempt(s) or error not retryable. Error: ${error.message}`);
        throw error; 
      }
    }
  }
}


export const getSinglePickSuggestion = async (
  yourTeamPicks: ChampionSlot[],
  enemyTeamPicks: ChampionSlot[],
  roleToSuggest: string,
  yourTeamBans: string[],
  enemyTeamBans: string[],
  oraclePersonality: OraclePersonality,
  preferredRoles?: string[],
  championPool?: { [role: string]: string[] }
): Promise<PickSuggestion> => {
  const yourTeamString = formatChampionList(yourTeamPicks);
  const enemyTeamString = formatChampionList(enemyTeamPicks);
  const yourBansString = formatBanList(yourTeamBans);
  const enemyBansString = formatBanList(enemyTeamBans);
  const userPreferredRolesString = formatPreferredRoles(preferredRoles);
  const userChampionPoolString = formatChampionPool(championPool);
  const personalityPrefix = applyPersonalityToPromptPrefix(oraclePersonality);

  let roleSpecificPoolPrompt = "";
  if (championPool && championPool[roleToSuggest] && championPool[roleToSuggest].length > 0) {
    roleSpecificPoolPrompt = `The user has a defined champion pool for the role of '${roleToSuggest}': ${championPool[roleToSuggest].join(', ')}. Please heavily consider these champions. If one of them is a strong strategic fit for the current draft, prioritize suggesting it and explain why. If you recommend a champion outside this pool, clearly explain why it's a better choice than their preferred options in this specific draft situation, considering team synergy, counters, and meta-relevance.`;
  } else {
    roleSpecificPoolPrompt = `The user has not specified a champion pool for the '${roleToSuggest}' role.`;
  }

  const prompt = `
${personalityPrefix}
Current Draft State:
Your Team Picks: ${yourTeamString}
Enemy Team Picks: ${enemyTeamString}
Your Team Bans: ${yourBansString}
Enemy Team Bans: ${enemyBansString}
Role to suggest for Your Team: ${roleToSuggest}

User Preferences:
${userPreferredRolesString}
${userChampionPoolString}
Role-Specific Pool Guidance: ${roleSpecificPoolPrompt}

Task: Based on the current draft, your expert LoL knowledge (including internal static item data for strategic purpose of items like {{Sheen}} or {{Abyssal Mask}}), relevant Google Search data (current DDragon stats/costs/effects for champions and items, current patch champion strength, tier lists, win rates for role=${roleToSuggest}, and common item builds for suggested champions in this role/matchup ON THE CURRENT PATCH), and the provided User Preferences:
Suggest 1 to 3 distinct champion picks for the "${roleToSuggest}" role for "Your Team".
**Ensure suggested champions are NOT present in any ban list or already picked by either team.**

For each champion suggestion, provide:
1.  "champion": The name of the champion (e.g., "Orianna", "Fiora").
2.  "reason": A detailed explanation (2-4 sentences, adjust detail based on personality prefix) for this pick. Analyze its:
    *   Strategic Fit & Win Condition
    *   Matchup Potential (reference current patch strength if possible from search)
    *   Meta Relevance (Is it currently strong/weak based on search?)
    *   Tempo/Pressure/Vision Impact
    *   Synergies & Counters
    *   Key Power Spikes (level & core items - e.g., "spikes with {{Luden's Tempest}} and {{Shadowflame}}"). Remember to use {{Item Name}} format for items, referencing static item data for their strategic purpose and search for current DDragon stats/patch popularity/effectiveness.

Provide an "explanation" field summarizing the overarching strategic thinking behind these suggestions. Adjust detail based on personality prefix.

Also, provide "enemyItemSpikeWarnings": An array of objects, where each object details a potential item power spike for a significant enemy champion on the current enemy team. For each warning:
1. "enemyChampionName": Name of the enemy champion.
2. "predictedCoreItems": An array of 1-2 string item names (using {{Item Name}} format like {{Blade of The Ruined King}} or {{Liandry's Anguish}}) they are likely to build, based on their champion type and current meta (use DDragon data via search for items).
3. "threatDescription": A brief description of the threat this champion poses with these items.
4. "strategicConsideration": A brief strategic consideration for "Your Team" regarding this enemy spike.

Return your response ONLY as a valid JSON object matching this schema:
{
  "suggestions": [
    { "champion": "string", "reason": "string" }
  ],
  "explanation": "string",
  "enemyItemSpikeWarnings": [
    { "enemyChampionName": "string", "predictedCoreItems": ["string"], "threatDescription": "string", "strategicConsideration": "string"}
  ]
}
Do not include any markdown formatting, explanations, or text outside of this JSON object.
Prioritize Google Search for current patch DDragon data on champion performance, meta relevance, and item build effectiveness. Refer to internal static item data for general strategic item properties. Remember {{Item Name}} for items.
`;

  try {
    const response: GenerateContentResponse = await callGeminiWithRetry(() => 
      ai.models.generateContent({
        model: GEMINI_MODEL_NAME,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: [{ googleSearch: {} }],
          safetySettings,
          // responseMimeType: "application/json", // Removed
          thinkingConfig: { thinkingBudget: 0 }
        },
      })
    );

    const parsedJson = parseJsonSafely<PickSuggestion>(response.text, "pick suggestion");

    if (!parsedJson || !Array.isArray(parsedJson.suggestions)) {
        throw new Error("Received invalid format for pick suggestions from API.");
    }

    const sources = mapGenAISources(response.candidates?.[0]?.groundingMetadata?.groundingChunks);

    return {
        suggestions: parsedJson.suggestions.filter(s => s.champion && s.reason),
        explanation: parsedJson.explanation,
        enemyItemSpikeWarnings: parsedJson.enemyItemSpikeWarnings || [],
        sources
    };

  } catch (error) {
    throw handleApiError(error, 'Failed to get pick suggestions.');
  }
};


export const getBanSuggestions = async (
  yourTeamPicks: ChampionSlot[],
  enemyTeamPicks: ChampionSlot[],
  yourTeamBans: string[],
  enemyTeamBans: string[],
  currentBanTurnForTeam: 'YourTeam' | 'EnemyTeam',
  oraclePersonality: OraclePersonality,
  preferredRoles?: string[],
  championPool?: { [role: string]: string[] }
): Promise<BanSuggestion> => {
  const yourTeamString = formatChampionList(yourTeamPicks);
  const enemyTeamString = formatChampionList(enemyTeamPicks);
  const yourBansString = formatBanList(yourTeamBans);
  const enemyBansString = formatBanList(enemyTeamBans);
  const userPreferredRolesString = formatPreferredRoles(preferredRoles);
  const userChampionPoolString = formatChampionPool(championPool);
  const personalityPrefix = applyPersonalityToPromptPrefix(oraclePersonality);

  const prompt = `
${personalityPrefix}
Current Draft State:
Your Team Picks: ${yourTeamString}
Enemy Team Picks: ${enemyTeamString}
Your Team Bans: ${yourBansString}
Enemy Team Bans: ${enemyBansString}
It is currently "${currentBanTurnForTeam}"'s turn to ban.

User Preferences:
${userPreferredRolesString}
${userChampionPoolString}

Task: Based on the current draft state, expert LoL knowledge (including internal static item data for strategic purpose), Google Search data (current DDragon stats/effects for champions and items, current patch champion strength, ban rates, tier lists), and User Preferences:
Suggest 1 to 3 distinct champions for "${currentBanTurnForTeam}" to ban.
**Ensure suggested champions are NOT present in any existing pick or ban list.**

For each suggested ban, provide:
1.  "champion": The name of the champion to ban.
2.  "reason": A concise, strategic explanation (1-3 sentences, adjust detail based on personality prefix). Focus on:
    *   Meta Relevance/Power Level (current patch strength from search).
    *   Threat to Potential Compositions.
    *   Protecting Your Team (if ban is for 'YourTeam', consider their champion pool).
    *   Disrupting Enemy Strategy.

Provide an "explanation" field summarizing the strategic thinking. Adjust detail based on personality prefix.

Also, provide "enemyItemSpikeWarnings": An array of objects, where each object details a potential item power spike for a significant enemy champion on the current enemy team (if any are picked). For each warning:
1. "enemyChampionName": Name of the enemy champion.
2. "predictedCoreItems": An array of 1-2 string item names (using {{Item Name}} format like {{Blade of The Ruined King}}) they are likely to build based on their champion type and current DDragon data/meta (use search).
3. "threatDescription": A brief description of the threat this champion poses with these items.
4. "strategicConsideration": A brief strategic consideration for "Your Team" regarding this enemy spike.

Return your response ONLY as a valid JSON object matching this schema:
{
  "suggestions": [
    { "champion": "string", "reason": "string" }
  ],
  "explanation": "string",
  "enemyItemSpikeWarnings": [
    { "enemyChampionName": "string", "predictedCoreItems": ["string"], "threatDescription": "string", "strategicConsideration": "string"}
  ]
}
Do not include any markdown formatting, explanations, or text outside of this JSON object.
Prioritize Google Search for current patch DDragon data on champion strength and ban priority. Refer to internal static item data for general strategic item properties and use {{Item Name}} for items.
`;
  try {
    const response: GenerateContentResponse = await callGeminiWithRetry(() =>
      ai.models.generateContent({
        model: GEMINI_MODEL_NAME,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: [{ googleSearch: {} }],
          safetySettings,
          // responseMimeType: "application/json", // Removed
          thinkingConfig: { thinkingBudget: 0 }
        },
      })
    );

    const parsedJson = parseJsonSafely<BanSuggestion>(response.text, "ban suggestion");


    if (!parsedJson || !Array.isArray(parsedJson.suggestions)) {
      throw new Error("Received invalid format for ban suggestions from API.");
    }

    const sources = mapGenAISources(response.candidates?.[0]?.groundingMetadata?.groundingChunks);

    return {
      suggestions: parsedJson.suggestions.filter(s => s.champion && s.reason),
      explanation: parsedJson.explanation,
      enemyItemSpikeWarnings: parsedJson.enemyItemSpikeWarnings || [],
      sources
    };

  } catch (error) {
    throw handleApiError(error, 'Failed to get ban suggestions.');
  }
};


export const getDraftRecommendations = async (
  yourTeamPicks: ChampionSlot[],
  enemyTeamPicks: ChampionSlot[],
  yourTeamBans: string[],
  enemyTeamBans: string[],
  oraclePersonality: OraclePersonality,
  preferredRoles?: string[],
  championPool?: { [role: string]: string[] }
): Promise<DraftAnalysis> => {
  const yourTeamString = formatChampionList(yourTeamPicks);
  const enemyTeamString = formatChampionList(enemyTeamPicks);
  const yourBansString = formatBanList(yourTeamBans);
  const enemyBansString = formatBanList(enemyTeamBans);
  const userPreferredRolesString = formatPreferredRoles(preferredRoles);
  const userChampionPoolString = formatChampionPool(championPool);
  const personalityPrefix = applyPersonalityToPromptPrefix(oraclePersonality);

  const originalPrompt = `
${personalityPrefix}
Task: Analyze the provided League of Legends draft. Provide detailed, actionable recommendations and strategic insights for "Your Team".
**CRITICAL: When mentioning specific item names, you MUST enclose the full, exact item name in double curly braces, like so: {{Item Name}}. For example: 'Build {{Infinity Edge}} for critical strike scaling.'**

Draft State:
Your Team Picks: ${yourTeamString}
Enemy Team Picks: ${enemyTeamString}
Your Team Bans: ${yourBansString}
Enemy Team Bans: ${enemyBansString}

User Preferences:
${userPreferredRolesString}
${userChampionPoolString}

Instructions:
Integrate expert LoL knowledge. This includes your internal static champion and item data (primarily for strategic purpose and established synergies, like {{Sheen}}, {{Bami's Cinder}}, {{Zhonya's Hourglass}}, {{Rabadon's Deathcap}}, {{Morellonomicon}}, {{Bloodthirster}}, {{Blade of The Ruined King}} and Epic components like {{Serrated Dirk}} or {{Last Whisper}}).
Crucially, use Google Search data for current DDragon stats/costs/effects of champions and items, and for current patch stats, matchups, meta trends for relevant champions, and popular/effective item builds for these champions ON THE CURRENT PATCH.

Return your response ONLY as a valid JSON object matching this schema:
{
  "overallSynopsis": {
    "yourTeamIdentity": "string (e.g., Poke/Siege, Dive/Engage, Teamfight/Protect the Carry)",
    "enemyTeamIdentity": "string",
    "expectedTempo": "string (e.g., Early aggression, Mid-game scaling, Late-game dominance)"
  },
  "teamCompositionSnapshot": {
    "yourTeamDamageProfile": "string (e.g., Balanced AD/AP, Heavy AP, Primarily Physical)",
    "enemyTeamDamageProfile": "string"
  },
  "oracleArmoryRecommendations": [
    {
      "champion": "string (Your Team's Champion Name)",
      "coreItems": [ 
        { "name": "{{Item Name}}", "reason": "string (Why it's vital for this champion in THIS game context)" }
      ],
      "situationalItems": [
        { 
          "condition": "string (e.g., Against Heavy Magic Burst from {{EnemySyndra}})",
          "items": [ { "name": "{{Item Name}}", "reason": "string (Why effective against this threat)" } ]
        }
      ]
    }
  ],
  "strategicFocus": {
    "laningPhase": "string (Imperative for ~0-10 mins)",
    "keyPowerSpikes": "string (Consider item completions, level spikes)",
    "midGameObjectivePriority": "string (10-25 mins)",
    "teamfightExecution": "string (Tips)"
  },
  "enemyTeamThreats": {
    "primaryThreats": "string (Identify 1-2 key threats, e.g., 'The enemy {{Irelia}} with {{Blade of The Ruined King}}')",
    "counterplayStrategy": "string (How to counter, including itemization like {{Frozen Heart}} or {{Executioner's Calling}})"
  },
  "impactOfBans": "string (Summary of how bans shaped strategies)",
  "userPreferenceAlignment": "string (Optional: Note alignment with user's roles/pool)",
  "keyInGameReminders": {
    "ourTopWinCondition": "string",
    "enemyTopWinCondition": "string",
    "keyThreatsSummary": "string (Top 1-2 enemy threats and why)",
    "targetPriorityInFights": "string",
    "crucialItemizationNote": "string (e.g., Anti-heal like {{Chempunk Chainsword}} or specific resistances like {{Force of Nature}})"
  }
}
Do not include any markdown formatting, explanations, or text outside of this JSON object.
Ensure all item names are correctly enclosed in {{Item Name}}.
`;

  try {
    const response: GenerateContentResponse = await callGeminiWithRetry(() =>
      ai.models.generateContent({
        model: GEMINI_MODEL_NAME,
        contents: [{ role: "user", parts: [{ text: originalPrompt }] }],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: [{ googleSearch: {} }],
          safetySettings,
          // responseMimeType: "application/json", // Removed
          thinkingConfig: { thinkingBudget: 0 }
        },
      })
    );

    const parsedJson = parseJsonSafely<StructuredDraftRec>(response.text, "full draft recommendations");
    if (!parsedJson || !parsedJson.overallSynopsis) {
      console.error("Invalid full draft analysis JSON received:", response.text);
      throw new Error("Received invalid format for full draft analysis from API.");
    }

    const sources = mapGenAISources(response.candidates?.[0]?.groundingMetadata?.groundingChunks);
    
    let overallSentiment: DraftAnalysis['overallSentiment'] = 'neutral';
    const synopsisText = JSON.stringify(parsedJson.overallSynopsis).toLowerCase(); // Crude sentiment check
    if (synopsisText.includes("strong") || synopsisText.includes("excellent") || synopsisText.includes("favorable")) {
        overallSentiment = 'positive';
    } else if (synopsisText.includes("weakness") || synopsisText.includes("flaw") || synopsisText.includes("vulnerability") || synopsisText.includes("lack of") || synopsisText.includes("no reliable")) {
        overallSentiment = 'critical_flaw';
    }
    
    let auraSentiment: DraftAnalysis['auraSentiment'] = 'neutral';
    if (overallSentiment === 'positive') auraSentiment = 'pleased';
    else if (overallSentiment === 'critical_flaw') auraSentiment = 'concerned';

    return { analysisData: parsedJson, analysisType: 'draft', sources, originalPrompt, overallSentiment, auraSentiment }; 

  } catch (error) {
    throw handleApiError(error, 'Failed to get draft recommendations.');
  }
};


export const getExplorerAnalysis = async (
  userQuery: string,
  oraclePersonality: OraclePersonality,
  champion1Name?: string,
  champion2Name?: string
): Promise<DraftAnalysis> => {
  let championsInFocus = "None selected.";
  if (champion1Name && champion2Name) {
    championsInFocus = `${champion1Name} and ${champion2Name}`;
  } else if (champion1Name) {
    championsInFocus = champion1Name;
  } else if (champion2Name) {
    championsInFocus = champion2Name;
  }
  const personalityPrefix = applyPersonalityToPromptPrefix(oraclePersonality);

  const prompt = `
${personalityPrefix}
Task: Provide strategic LoL insights based on the user's query and selected champion(s).
**CRITICAL: When mentioning specific item names, you MUST enclose the full, exact item name in double curly braces, like so: {{Item Name}}. For example: 'Consider building {{Infinity Edge}}.'**


Champion(s) in Focus: ${championsInFocus}
User's Question/Focus: "${userQuery}"

Instructions:
1.  Address the User's Question directly and comprehensively in the "directAnswer" field.
2.  If champion(s) are specified, provide detailed insights for each in the "championInsights" object.
3.  If no champions are specified, provide general strategic advice in "generalStrategicPoints".
4.  Leverage deep LoL knowledge. This includes your internal static champion and item data (for strategic purposes, e.g., {{Sunfire Aegis}} or {{Bramble Vest}}).
5.  **Prioritize Google Search for current DDragon data (item stats/costs/effects, champion abilities) and current meta information related to the champions or query (e.g., patch performance, common item builds like {{Guardian Angel}}, counter advice, item synergies in the current patch).**
6. Include "keyTakeaways" as an array of short, impactful bullet points.

Return your response ONLY as a valid JSON object matching this schema:
{
  "directAnswer": "string (Comprehensive answer to the user's query)",
  "championInsights": { 
    "ChampionName1": { 
      "counters": ["string"], 
      "synergies": ["string"], 
      "strategicUse": "string", 
      "itemBuilds": "string (e.g., Core: {{Item1}}, {{Item2}}. Situational: {{Item3}} for X.)",
      "strengths": "string",
      "weaknesses": "string"
    } 
  },
  "generalStrategicPoints": ["string"],
  "keyTakeaways": ["string"]
}
Do not include any markdown formatting, explanations, or text outside of this JSON object.
Ensure all item names are correctly enclosed in {{Item Name}}.
If a champion is not specified for a section (e.g., only one champion provided), omit the corresponding "ChampionName2" key or provide null/empty insights for it.
`;

  try {
    const response: GenerateContentResponse = await callGeminiWithRetry(() =>
      ai.models.generateContent({
        model: GEMINI_MODEL_NAME,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: [{ googleSearch: {} }],
          safetySettings,
          // responseMimeType: "application/json", // Removed
          thinkingConfig: { thinkingBudget: 0 }
        },
      })
    );

    const parsedJson = parseJsonSafely<StructuredExplorerRec>(response.text, "explorer analysis");
     if (!parsedJson || !parsedJson.directAnswer) {
      console.error("Invalid explorer analysis JSON received:", response.text);
      throw new Error("Received invalid format for explorer analysis from API.");
    }
    const sources = mapGenAISources(response.candidates?.[0]?.groundingMetadata?.groundingChunks);

    return { analysisData: parsedJson, analysisType: 'explorer', sources, originalPrompt: prompt };

  } catch (error) {
    throw handleApiError(error, 'Failed to get explorer analysis.');
  }
};


export const getFollowUpAnalysis = async (
  conversationHistory: ConversationTurn[],
  newQuery: string,
  oraclePersonality: OraclePersonality
): Promise<DraftAnalysis> => {
  const personalityPrefix = applyPersonalityToPromptPrefix(oraclePersonality);
  const currentPrompt = `
${personalityPrefix}
Task: This is a follow-up question to a previous LoL draft analysis or explorer query. Consider the entire conversation history provided.
Your new task is to answer the user's latest question: "${newQuery}"
Provide your answer in clear, structured markdown. Use Google Search if needed for current meta or specifics, especially if it pertains to item builds (e.g., viability of {{Titanic Hydra}} and its DDragon stats) or champion performance. Refer to your internal static item data for general strategic item properties.
Remember the overall context of the draft being discussed in the history.
**CRITICAL: When mentioning specific item names, you MUST enclose the full, exact item name in double curly braces, like so: {{Item Name}}. For example: 'Consider building {{Infinity Edge}}.'**
`;

  try {
    const chat = ai.chats.create({ 
        model: GEMINI_MODEL_NAME, 
        config: {
            systemInstruction: SYSTEM_INSTRUCTION, 
            tools: [{ googleSearch: {} }],
            safetySettings,
            thinkingConfig: { thinkingBudget: 0 } 
        },
        history: conversationHistory 
    });

    const response: GenerateContentResponse = await callGeminiWithRetry(() =>
      chat.sendMessage({ message: currentPrompt }) 
    );

    const recommendationText = response.text;
    const sources = mapGenAISources(response.candidates?.[0]?.groundingMetadata?.groundingChunks);

    return { analysisData: recommendationText, analysisType: 'text_direct', sources, originalPrompt: currentPrompt };

  } catch (error) {
    throw handleApiError(error, 'Failed to get follow-up analysis.');
  }
};

// --- MVP Analysis ---
export const getMvpAnalysis = async (
  mainAnalysisTextOrData: string | StructuredDraftRec, 
  yourTeamPicks: ChampionSlot[],
  oraclePersonality: OraclePersonality
): Promise<MvpData> => {
  const personalityPrefix = applyPersonalityToPromptPrefix(oraclePersonality);
  const teamPicksString = formatChampionList(yourTeamPicks);

  const analysisContext = typeof mainAnalysisTextOrData === 'string' 
    ? mainAnalysisTextOrData 
    : JSON.stringify(mainAnalysisTextOrData, null, 2); 

  const prompt = `
${personalityPrefix}
Context: The following is a detailed League of Legends draft analysis previously generated for "Your Team":
--- START OF PREVIOUS ANALYSIS ---
${analysisContext}
--- END OF PREVIOUS ANALYSIS ---

Your Team Picks: ${teamPicksString}

Task: Based *solely* on the detailed analysis provided above, identify the single Most Valuable Player (MVP) champion from "Your Team".
This champion should be the one whose contributions, synergies, or counter-pick potential are most critical for achieving "Your Team's" win condition, as highlighted in the analysis. Consider itemization impact (e.g., mentions of {{Key Item}} or an item's strategic role from the 'Oracle's Armory' or 'oracleArmoryRecommendations' section) if mentioned as crucial.

Provide:
1.  "championName": The name of the MVP champion from "Your Team". This MUST be one of the champions listed in "Your Team Picks".
2.  "reason": A concise, one-sentence explanation of why this champion is the MVP, directly referencing insights from the provided analysis.

Return your response ONLY as a valid JSON object matching this schema:
{
  "championName": "string",
  "reason": "string"
}
Do not include any markdown formatting, explanations, or text outside of this JSON object.
Do not introduce new information or use external search. Your decision must be grounded in the provided analysis text.
If multiple champions seem equally valuable, pick the one whose role or impact (including itemization strategy mentioned with {{Item Name}} in the 'Oracle's Armory' section or 'oracleArmoryRecommendations') is most emphasized as key to victory in the analysis.
If "Your Team" has no picks, return an empty string for championName and a reason like "No champions picked for Your Team."
`;

  try {
    const response: GenerateContentResponse = await callGeminiWithRetry(() =>
      ai.models.generateContent({
        model: GEMINI_MODEL_NAME,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          safetySettings,
          responseMimeType: "application/json", 
          thinkingConfig: { thinkingBudget: 0 }
        },
      })
    );

    const parsedJson = parseJsonSafely<MvpData>(response.text, "MVP analysis");

    if (!parsedJson || typeof parsedJson.championName !== 'string' || typeof parsedJson.reason !== 'string') {
      console.error("Invalid MVP data received:", response.text);
      throw new Error("Received invalid format for MVP analysis from API.");
    }
    
    const mvpChampInfo = yourTeamPicks.find(p => p.champion === parsedJson.championName);
    if (mvpChampInfo && mvpChampInfo.ddragonKey) {
        parsedJson.ddragonKey = mvpChampInfo.ddragonKey;
    }


    return parsedJson;
  } catch (error) {
    throw handleApiError(error, 'Failed to get MVP analysis.');
  }
};


// --- Interactive Learning Journey Functions ---

const generatePersonaInstruction = (championPersonaName: string | undefined, taskForPersona: string): string => {
  if (!championPersonaName) return "";
  return `
CRITICAL INSTRUCTION: You are now embodying the champion ${championPersonaName}.
Speak in their distinct voice, personality, common phrases, and from their perspective.
Your ${taskForPersona} MUST be delivered as if ${championPersonaName} is speaking directly to the user.
Refer to yourself as ${championPersonaName} (e.g., "I, Kled, think..." or "As Jinx, I'd say...").
For example, if Kled: 'You wanna know 'bout this stuff? It's simple! First, you find the nearest trespasser...'
If Jhin: 'To understand this, is to understand artistry in four acts. First...'
Maintain this persona CONSISTENTLY throughout your entire response.
Your language should be thematic to ${championPersonaName}.
**CRITICAL: When mentioning specific item names, you MUST enclose the full, exact item name in double curly braces, like so: {{Item Name}}. For example: 'Consider building {{Infinity Edge}}.'**
---
`;
};

export const getConceptExplanation = async (
  conceptTitle: string,
  oraclePersonality: OraclePersonality,
  championPersonaName?: string
): Promise<string> => {
  const personalityPrefix = applyPersonalityToPromptPrefix(oraclePersonality);
  const personaInstruction = generatePersonaInstruction(championPersonaName, `explanation of "${conceptTitle}"`);
  
  const prompt = `
${personalityPrefix}
${personaInstruction}
Task: Explain the League of Legends concept: "${conceptTitle}".
Output Style: Detailed, clear markdown. Adjust explanation complexity based on personality.
Use headings (e.g., ### Key Aspects) and bullet points for readability.
Ensure the explanation is comprehensive and accurate, using Google Search for nuances if necessary (e.g., how current DDragon stats/effects of meta items like {{Locket of the Iron Solari}} affect the concept). Refer to internal static item data for core item strategic functionalities like for {{Bramble Vest}} or {{Zhonya's Hourglass}}.
Focus on explaining the concept itself.
${championPersonaName ? `Remember, you are ${championPersonaName}!` : ''}
And always remember to use {{Item Name}} when discussing items.
`;
  try {
    const response: GenerateContentResponse = await callGeminiWithRetry(() =>
      ai.models.generateContent({
        model: GEMINI_MODEL_NAME,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: { 
          systemInstruction: SYSTEM_INSTRUCTION, 
          tools: [{ googleSearch: {} }], 
          safetySettings,
          thinkingConfig: { thinkingBudget: -1 } 
        },
      })
    );
    return response.text;
  } catch (error) {
    throw handleApiError(error, `Error fetching explanation for ${conceptTitle}:`);
  }
};

export const generateConceptChallenge = async (
  conceptTitle: string,
  oraclePersonality: OraclePersonality,
  championDataSummary: string,
  championPersonaName?: string
): Promise<ChallengeData> => {
  const personalityPrefix = applyPersonalityToPromptPrefix(oraclePersonality);
  const personaInstruction = generatePersonaInstruction(championPersonaName, `challenge regarding "${conceptTitle}" (scenario, question, and options)`);

  const prompt = `
${personalityPrefix}
${personaInstruction}
Task: Create an interactive challenge for the League of Legends concept: "${conceptTitle}".
You have access to a summary of some champion data like: "${championDataSummary}". You can use these champion names or others if relevant for the scenario.
Output Format: Strict JSON. No markdown fences around the JSON block. The model's text response should be ONLY the JSON string.
Schema:
{
  "scenario": "string (A brief, realistic in-game LoL scenario (2-4 sentences). This scenario should set the stage for the question. Mention specific champions to make it concrete. For example: 'Your team consists of Malphite, Yasuo, and Leona. The enemy team has a very mobile ADC like Ezreal.' If the concept involves itemization, ensure the scenario provides enough context for item choices, mentioning items with {{Item Name}} format like {{Sheen}} or {{Last Whisper}}. Use your static item knowledge for general strategic item properties and search DDragon for current stats/effects.)",
  "question": "string (A multiple-choice question directly related to the scenario and the concept '${conceptTitle}'. For example: 'Given your team composition, what is your primary win condition?' or 'Against Ezreal, what early item component like {{Sheen}} or {{Caulfield's Warhammer}} is most crucial for Malphite (check current DDragon stats for these)?')",
  "options": [
    { "letter": "A", "text": "string (Plausible option 1 text. May include item names like {{Sunfire Aegis}}.)" },
    { "letter": "B", "text": "string (Plausible option 2 text. May include item names like {{Spirit Visage}}.)" },
    { "letter": "C", "text": "string (Plausible option 3 text. May include item names like {{Randuin's Omen}}.)" },
    { "letter": "D", "text": "string (Plausible option 4 text. May include item names like {{Thornmail}}.)" }
  ]
}
Ensure options are distinct, clearly lettered (A, B, C, D), and plausible.
The question should test understanding of '${conceptTitle}' within the context of the scenario.
One option should be demonstrably more correct than the others based on LoL strategy and the given concept.
Adjust scenario complexity based on personality. Use Google Search for current meta context if relevant to the scenario (e.g. if a champion's current strength or a common item build path based on DDragon is part of the scenario).
${championPersonaName ? `Remember, you are ${championPersonaName}! The scenario, question, and options should reflect your personality and way of speaking.` : ''}
Always use {{Item Name}} for items in scenario, question, and options.
`;
  try {
    const response: GenerateContentResponse = await callGeminiWithRetry(() =>
      ai.models.generateContent({
        model: GEMINI_MODEL_NAME,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: { 
          systemInstruction: SYSTEM_INSTRUCTION, 
          tools: [{ googleSearch: {} }], 
          safetySettings, 
          // responseMimeType: "application/json", // Removed
          thinkingConfig: { thinkingBudget: -1 } 
        },
      })
    );
    
    const parsedJson = parseJsonSafely<ChallengeData>(response.text, `challenge for ${conceptTitle}`);
    if (!parsedJson || !parsedJson.scenario || !parsedJson.question || !Array.isArray(parsedJson.options) || parsedJson.options.length < 2 || !parsedJson.options.every(opt => opt.letter && opt.text)) {
      console.error("Invalid challenge data received:", response.text);
      throw new Error("Received invalid format for challenge data from API. Ensure all fields are present and options have letter and text.");
    }
    return parsedJson;
  } catch (error) {
    throw handleApiError(error, `Error generating challenge for ${conceptTitle}:`);
  }
};

export const getChallengeFeedback = async (
  conceptTitle: string,
  challenge: ChallengeData, 
  userAnswerLetter: string, 
  oraclePersonality: OraclePersonality,
  championPersonaName?: string
): Promise<string> => {
  const personalityPrefix = applyPersonalityToPromptPrefix(oraclePersonality);
  const userAnswerText = challenge.options.find(opt => opt.letter === userAnswerLetter)?.text || "Invalid option selected by user.";
  const personaInstruction = generatePersonaInstruction(championPersonaName, `feedback on the user's answer`);

  const prompt = `
${personalityPrefix}
${personaInstruction}
Task: Provide feedback on the user's answer to a League of Legends concept challenge.
Concept Being Tested: "${conceptTitle}"
Scenario Presented to User: "${challenge.scenario}"
Question Asked: "${challenge.question}"
Full List of Options User Saw:
${challenge.options.map(opt => `${opt.letter}) ${opt.text}`).join('\n')}

User's Chosen Answer: "${userAnswerLetter}) ${userAnswerText}"

Instructions for Feedback:
1.  State if the user's answer ("${userAnswerLetter}) ${userAnswerText}") was correct or incorrect in relation to the question and scenario.
2.  Provide a clear, step-by-step explanation for *why* the user's chosen answer is correct or incorrect.
3.  If incorrect, gently guide the user towards the correct reasoning and implicitly or explicitly state which option would have been better and why.
4.  If correct, reinforce the understanding by explaining the strategic principles that make it correct.
5.  Relate all feedback directly to the principles of "${conceptTitle}" as applied to the specific scenario and champion interactions if mentioned.
6.  Use Google Search if specific champion interactions, item synergies (e.g., interaction between {{Black Cleaver}} and an ability using current DDragon stats), or current meta details (like item effectiveness on certain champions this patch when discussing items like {{Hexdrinker}}) are relevant to validating the answer or explaining the feedback. Use internal static item data for general item strategic functionality.
Output Style: Clear markdown. Adjust explanation complexity based on personality. Be encouraging, especially for 'ForBeginners'.
${championPersonaName ? `Remember, you are ${championPersonaName}! Your feedback should reflect your personality and way of speaking.` : ''}
Always use {{Item Name}} for items.
`;
  try {
    const response: GenerateContentResponse = await callGeminiWithRetry(() =>
      ai.models.generateContent({
        model: GEMINI_MODEL_NAME,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: { 
            systemInstruction: SYSTEM_INSTRUCTION, 
            tools: [{ googleSearch: {} }], 
            safetySettings,
            thinkingConfig: { thinkingBudget: -1 } 
        },
      })
    );
    return response.text;
  } catch (error) {
    throw handleApiError(error, `Error fetching feedback for ${conceptTitle} challenge:`);
  }
};

// --- Pre-Game Ritual Analysis ---
export const getPreGameRitualAnalysis = async (
  championName: string,
  oraclePersonality: OraclePersonality,
  allChampions: DDragonChampionInfo[] 
): Promise<PreGameRitualAnalysis> => {
  const personalityPrefix = applyPersonalityToPromptPrefix(oraclePersonality);
  const prompt = `
${personalityPrefix}
Task: Analyze the champion "${championName}" for a pre-game ritual.
**CRITICAL: When mentioning specific item names, you MUST enclose the full, exact item name in double curly braces, like so: {{Item Name}}. For example: 'Consider building {{Infinity Edge}}.'**

Provide the following based on expert LoL knowledge (including internal static champion data and item data for strategic purposes like {{Abyssal Mask}} or {{Tiamat}}) and Google Search data for the current DDragon stats/effects/costs and meta (latest patch, champion strength, common synergies, counters, and relevant item builds like {{Sunfire Aegis}} or {{Cosmic Drive}} for "${championName}" ON THE CURRENT PATCH):
1.  "identitySummary": A concise summary (2-3 sentences) of "${championName}"'s current identity, core playstyle, and key power spikes (mention common core items using {{Item Name}} format, referencing static item data for their strategic purpose and DDragon via search for current stats/popularity). Reference current meta strength/role viability from search.
2.  "fatedAllies": An array of 2-3 champions that have excellent synergy with "${championName}" in the current meta. For each, provide:
    *   "champion": Name of the allied champion.
    *   "reason": A brief (1-2 sentences) explanation of why they synergize well, considering current meta if possible.
3.  "graveThreats": An array of 2-3 champions that are significant counters to "${championName}" in the current meta. For each, provide:
    *   "champion": Name of the counter champion.
    *   "reason": A brief (1-2 sentences) explanation of why they are a threat, considering current meta if possible.

Return your response ONLY as a valid JSON object matching this schema:
{
  "identitySummary": "string",
  "fatedAllies": [
    { "champion": "string", "reason": "string" }
  ],
  "graveThreats": [
    { "champion": "string", "reason": "string" }
  ]
}
Do not include any markdown formatting, explanations, or text outside of this JSON object.
Prioritize Google Search for current patch DDragon data on champion performance, common synergies, effective counters, and optimal item builds. Refer to internal static data for core item strategic properties. Remember {{Item Name}} for items.
`;

  try {
    const response: GenerateContentResponse = await callGeminiWithRetry(() =>
      ai.models.generateContent({
        model: GEMINI_MODEL_NAME,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: [{ googleSearch: {} }], 
          safetySettings,
          // responseMimeType: "application/json", // Removed
          thinkingConfig: { thinkingBudget: 0 }
        },
      })
    );

    const parsedJson = parseJsonSafely<PreGameRitualAnalysis>(response.text, `pre-game ritual analysis for ${championName}`);

    if (!parsedJson || !parsedJson.identitySummary || !Array.isArray(parsedJson.fatedAllies) || !Array.isArray(parsedJson.graveThreats)) {
      console.error("Invalid Pre-Game Ritual data received or parsed:", response.text, parsedJson);
      throw new Error("Received invalid format for Pre-Game Ritual analysis from API.");
    }

    const augmentWithKey = (ritualChamps: RitualChampionInfo[]): RitualChampionInfo[] => {
      return ritualChamps.map(rc => {
        const foundChamp = allChampions.find(ac => ac.name.toLowerCase() === rc.champion.toLowerCase());
        return { ...rc, ddragonKey: foundChamp?.id };
      });
    };

    parsedJson.fatedAllies = augmentWithKey(parsedJson.fatedAllies);
    parsedJson.graveThreats = augmentWithKey(parsedJson.graveThreats);
    
    const sources = mapGenAISources(response.candidates?.[0]?.groundingMetadata?.groundingChunks);
    parsedJson.sources = sources;

    return parsedJson;

  } catch (error) {
    throw handleApiError(error, `Failed to get Pre-Game Ritual analysis for ${championName}.`);
  }
};

// --- Oracle's Armory (Item Encyclopedia) ---

// Helper to map DDragon stat keys to readable names (moved here for getArmoryItemWisdom)
const mapStatName = (statKey: string): string => {
  const nameMap: Record<string, string> = {
    FlatHPPoolMod: "Health",
    FlatMPPoolMod: "Mana",
    FlatArmorMod: "Armor",
    FlatSpellBlockMod: "Magic Resist",
    FlatCritChanceMod: "Critical Strike Chance",
    FlatMagicDamageMod: "Ability Power",
    FlatPhysicalDamageMod: "Attack Damage",
    PercentAttackSpeedMod: "Attack Speed (%)",
    PercentLifeStealMod: "Life Steal (%)",
    FlatMoveSpeedMod: "Movement Speed",
    PercentCooldownMod: "Ability Haste (CDR %)",
    FlatHPPoolRegenMod: "Health Regen",
    FlatMPPoolRegenMod: "Mana Regen",
    PercentMovementSpeedMod: "Movement Speed (%)",
  };
  return nameMap[statKey] || statKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
};

export const getArmoryItemWisdom = async (
  item: MergedItemInfo, 
  oraclePersonality: OraclePersonality
): Promise<ArmoryItemWisdom> => {
  const personalityPrefix = applyPersonalityToPromptPrefix(oraclePersonality);
  
  const itemDDragonContextParts: string[] = [
    `Item Name: ${item.name}`,
    `Cost: ${item.gold.total}g`,
    `DDragon Stats: ${Object.entries(item.ddragonStats).map(([key, val]) => `${mapStatName(key)}: ${val % 1 !== 0 ? (val * 100).toFixed(0) + '%' : val}`).join(', ') || 'None'}`,
    `DDragon Description (HTML): ${item.description}`,
    `DDragon Plaintext: ${item.plaintext || 'None'}`,
    `DDragon Tags: ${item.ddragonTags.join(', ') || 'None'}`
  ];
  if (item.from && item.from.length > 0) itemDDragonContextParts.push(`Builds From (IDs): ${item.from.join(', ')}`);
  if (item.into && item.into.length > 0) itemDDragonContextParts.push(`Builds Into (IDs): ${item.into.join(', ')}`);
  
  const itemStaticContextParts: string[] = [];
  if(item.itemType) itemStaticContextParts.push(`Category (from static data): ${item.itemType}`);
  if(item.staticStrategicSummary) itemStaticContextParts.push(`Strategic Summary (from static data): ${item.staticStrategicSummary}`);
  if(item.staticPassiveName) itemStaticContextParts.push(`Passive - ${item.staticPassiveName} (from static data): ${item.staticPassiveDescription || 'No description.'}`);
  if(item.staticActiveName) itemStaticContextParts.push(`Active - ${item.staticActiveName} (from static data): ${item.staticActiveDescription || 'No description.'}`);
  if(item.staticPurposeAndSynergies) itemStaticContextParts.push(`Purpose & Synergies (from static data): ${item.staticPurposeAndSynergies}`);
  if(item.staticSituationalApplication) itemStaticContextParts.push(`Situational Use (from static data): ${item.staticSituationalApplication}`);
  if(item.staticPrimaryUsers?.length) itemStaticContextParts.push(`Primary Users (general from static data): ${item.staticPrimaryUsers.join(', ')}`);
  if(item.staticKeywords?.length) itemStaticContextParts.push(`Keywords (from static data): ${item.staticKeywords.join(', ')}`);
  if(item.staticGoldEfficiencyNotes) itemStaticContextParts.push(`Gold Efficiency Notes (from static data): ${item.staticGoldEfficiencyNotes}`);
  if(item.staticBuildPathNotes) itemStaticContextParts.push(`Build Path Notes (from static data): ${item.staticBuildPathNotes}`);
  
  const itemDDragonContext = itemDDragonContextParts.join('\n    ');
  const itemStaticContext = itemStaticContextParts.length > 0 ? itemStaticContextParts.join('\n    ') : 'No additional qualitative strategic context available from static data.';

  const prompt = `
    ${personalityPrefix}
    You are the LoL Draft Oracle, an expert strategist.
    **CRITICAL: When mentioning specific item names in your response, you MUST enclose the full, exact item name in double curly braces, like so: {{Item Name}}. This is crucial for image display.**

    The user is seeking wisdom on the following League of Legends item, with its DDragon properties and some strategic notes from your internal knowledge base provided:
    
    --- DDragon Core Item Data ---
    ${itemDDragonContext}
    
    --- Additional Strategic Context from Your Internal Knowledge Base (Static Data) ---
    ${itemStaticContext}

    Task: Provide a rich explanation.
    Return your response ONLY as a valid JSON object matching this schema:
    {
      "strategicNiche": "string (Unique role/purpose, elaborate on mechanics using DDragon and static data)",
      "idealUsers": "string (Champion archetypes/examples, explain why based on kits and DDragon effects/stats, use search for meta users)",
      "keyScenarios": "string (When is it powerful? Against what? Use DDragon stats/effects and static situational use)",
      "buildTiming": "string (When is it built? Core/situational? Use static build path notes and DDragon from/into)",
      "commonMistakes": "string (Common errors in building/using it)",
      "goldEfficiencySummary": "string (Briefly on gold efficiency from static notes and DDragon cost/stats)",
      "synergisticItems": ["string (e.g., {{ItemX}} because...)"],
      "counterItems": ["string (e.g., {{ItemY}} to counter its effect...)"]
    }
    Do not include any markdown formatting, explanations, or text outside of this JSON object.
    Ensure all item names are correctly enclosed in {{Item Name}}.
    Use your comprehensive LoL knowledge. Heavily leverage the provided item context from DDragon (for factuals like stats, cost, official description) AND your internal static knowledge base (for strategic purpose, keywords, etc.). 
    Use Google Search *selectively* for CURRENT META insights (how the item is performing on specific champions THIS PATCH, significant changes to its build path popularity, or new unconventional synergies that aren't in the static data).
  `;

  try {
    const response: GenerateContentResponse = await callGeminiWithRetry(() =>
      ai.models.generateContent({
        model: GEMINI_MODEL_NAME,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: [{ googleSearch: {} }],
          safetySettings,
          // responseMimeType: "application/json", // Removed
          thinkingConfig: { thinkingBudget: 0 }
        },
      })
    );
    const parsedJson = parseJsonSafely<StructuredArmoryRec>(response.text, `armory wisdom for ${item.name}`);
    if (!parsedJson || !parsedJson.strategicNiche) {
      console.error("Invalid armory wisdom JSON received:", response.text);
      throw new Error("Received invalid format for armory wisdom from API.");
    }
    const sources = mapGenAISources(response.candidates?.[0]?.groundingMetadata?.groundingChunks);
    return { analysisData: parsedJson, analysisType: 'armory', sources, originalPrompt: prompt };
  } catch (error) {
    throw handleApiError(error, `Failed to get wisdom for ${item.name}.`);
  }
};

// --- Threat Assessment for Draft Lab ---
export const getThreatAssessmentAnalysis = async (
  yourTeamPicks: ChampionSlot[],
  enemyTeamPicks: ChampionSlot[],
  targetedThreatChampionName: string,
  oraclePersonality: OraclePersonality
): Promise<DraftAnalysis> => {
  const yourTeamString = formatChampionList(yourTeamPicks);
  const enemyTeamString = formatChampionList(enemyTeamPicks.filter(c => c.champion !== targetedThreatChampionName));
  const personalityPrefix = applyPersonalityToPromptPrefix(oraclePersonality);

  const originalPrompt = `
${personalityPrefix}
Task: Provide a focused threat assessment for the enemy champion **${targetedThreatChampionName}**.
**CRITICAL: When mentioning specific item names, you MUST enclose the full, exact item name in double curly braces, like so: {{Item Name}}.**

Your Team: ${yourTeamString}
Enemy Team (excluding target for clarity, but consider their presence): ${enemyTeamString}
Targeted Threat: **${targetedThreatChampionName}**

Instructions:
Focus your analysis on **${targetedThreatChampionName}**. Use expert LoL knowledge, including internal static data (for item strategic purposes like {{Thornmail}} or champion classes) and Google Search for current DDragon stats/effects of items/champions, meta relevance, common builds for ${targetedThreatChampionName}, and effective counter-strategies THIS PATCH.

Return your response ONLY as a valid JSON object matching this schema:
{
  "threatProfile": {
    "keyStrengths": "string (How ${targetedThreatChampionName} wins/dominates their role against Your Team)",
    "typicalBuildPath": "string (1-3 common core items like {{Blade of The Ruined King}} for ${targetedThreatChampionName} in current meta, with power spike timing)",
    "primaryThreatVectors": "string (Specific abilities/mechanics of ${targetedThreatChampionName} dangerous to Your Team)"
  },
  "counterStrategy": {
    "itemizationChoices": [ 
      { 
        "champion": "string (Your Team champion name)", 
        "items": [ { "name": "{{Item Name}}", "reason": "string (Why effective against ${targetedThreatChampionName})" } ] 
      }
    ],
    "strategicAdjustments": {
      "laningPhase": "string (How Your Team should lane against ${targetedThreatChampionName} or their lane opponent)",
      "teamfights": "string (Optimal target focus/positioning when ${targetedThreatChampionName} is present)",
      "objectiveControl": "string (How ${targetedThreatChampionName}'s presence affects objectives)",
      "visionAndGanking": "string (Key vision/gank timings to exploit/mitigate ${targetedThreatChampionName})"
    }
  }
}
Do not include any markdown formatting, explanations, or text outside of this JSON object.
Ensure all item names are correctly enclosed in {{Item Name}}.
`;

  try {
    const response: GenerateContentResponse = await callGeminiWithRetry(() =>
      ai.models.generateContent({
        model: GEMINI_MODEL_NAME,
        contents: [{ role: "user", parts: [{ text: originalPrompt }] }],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: [{ googleSearch: {} }],
          safetySettings,
          // responseMimeType: "application/json", // Removed
          thinkingConfig: { thinkingBudget: 0 }
        },
      })
    );

    const parsedJson = parseJsonSafely<StructuredThreatRec>(response.text, `threat assessment for ${targetedThreatChampionName}`);
    if (!parsedJson || !parsedJson.threatProfile || !parsedJson.counterStrategy) {
      console.error("Invalid threat assessment JSON received:", response.text);
      throw new Error("Received invalid format for threat assessment from API.");
    }
    const sources = mapGenAISources(response.candidates?.[0]?.groundingMetadata?.groundingChunks);

    return { analysisData: parsedJson, analysisType: 'threat', sources, originalPrompt };
  } catch (error) {
    throw handleApiError(error, `Failed to get threat assessment for ${targetedThreatChampionName}.`);
  }
};
