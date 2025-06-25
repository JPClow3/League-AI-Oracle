import { DailyPuzzle, Team } from '../types';
import { LOL_ROLES } from '../constants';

export const dailyPuzzles: DailyPuzzle[] = [
  {
    id: "puzzle_20240726_counter_poke",
    title: "The Poke Conundrum",
    scenarioDescription: "The enemy weaves a web of ranged harassment, having secured Lux (Mid), Ezreal (ADC), and Jayce (Top). Your forces have already chosen Morgana (Support) and Jarvan IV (Jungle). The final thread of your destiny lies in the Top lane. From the champions below, which warrior is destined to break their siege and lead your dive composition to glory?",
    yourTeamInitialPicks: [
      { champion: "Morgana", role: "Support", ddragonKey: "Morgana" },
      { champion: "Jarvan IV", role: "Jungle", ddragonKey: "JarvanIV" },
    ],
    yourTeamInitialBans: ["Caitlyn", "Zoe"],
    enemyTeamInitialPicks: [
      { champion: "Lux", role: "Mid", ddragonKey: "Lux" },
      { champion: "Ezreal", role: "ADC", ddragonKey: "Ezreal" },
      { champion: "Jayce", role: "Top", ddragonKey: "Jayce" },
    ],
    enemyTeamInitialBans: ["Malphite", "Leona"],
    choiceContextLabel: "Top Lane Pick",
    puzzleType: "championPick",
    availableChampionChoices: ["Aatrox", "Camille", "Gnar", "Irelia", "Kled", "Ornn", "Sett"],
    idealPicks: [
      { choiceName: "Camille", ratingKey: "oracle", explanation: "Camille's Hextech Ultimatum isolates a key poke champion, enabling Jarvan IV and your team to dive and eliminate the threat before significant poke damage accumulates. Her mobility and true damage are exceptional against squishy targets." },
      { choiceName: "Irelia", ratingKey: "master", explanation: "Irelia excels at diving backlines with Bladesurge resets, especially against compositions with multiple skillshot-reliant champions. She can quickly disrupt their formation and create chaos for your team to follow up." },
      { choiceName: "Kled", ratingKey: "adept", explanation: "Kled's Chaaaaaaaarge!!! provides a powerful team-wide engage to quickly close the distance on the poke champions. His resilience with Skaarl makes him a durable front-line diver." },
    ],
    defaultPlausibleRatingKey: 'plausible',
    defaultPlausibleExplanation: "While this champion has merit, their ability to consistently break a siege or initiate a dive against the enemy's poke setup might be less reliable than other options."
  },
  {
    id: "puzzle_item_ornn_upgrade_vs_fiora",
    title: "Ornn's Forge: Countering Fiora",
    scenarioDescription: "You are Ornn mid-game. Your Vayne (ADC) is doing okay. The enemy team's fed carry is a Fiora (Top) who is split-pushing relentlessly and becoming a major duel threat. Which of your Masterwork (Mythic) item upgrades should you bestow upon Vayne right now to best handle the Fiora threat in upcoming skirmishes or potential duels? Assume Vayne is considering these Mythics.",
    yourTeamInitialPicks: [ {champion: "Ornn", role:"Top"}, {champion: "Vayne", role:"ADC"}, {champion: "Lux", role:"Support"} ],
    yourTeamInitialBans: ["Malphite"],
    enemyTeamInitialPicks: [ {champion: "Fiora", role:"Top"}, {champion: "Lee Sin", role:"Jungle"}, {champion: "Ahri", role:"Mid"} ],
    enemyTeamInitialBans: ["Caitlyn"],
    puzzleType: 'itemPick',
    choiceContextLabel: "Masterwork Upgrade for Vayne",
    itemChoiceOptions: [
      { itemId: "3031", itemName: "{{Infinity Edge}} (Masterwork)" }, // Assuming generic ID for Masterwork representation for now
      { itemId: "6672", itemName: "{{Kraken Slayer}} (Masterwork)" },
      { itemId: "3085", itemName: "{{Runaan's Hurricane}} (Masterwork)" }, // Runaan's not a mythic, placeholder
      { itemId: "3072", itemName: "{{Bloodthirster}} (Masterwork)" } // Bloodthirster not a mythic, placeholder
    ],
    idealPicks: [
      { choiceName: "{{Kraken Slayer}} (Masterwork)", ratingKey: "oracle", explanation: "Correct! Upgrading Vayne's {{Kraken Slayer}} provides crucial true damage. This is essential for dueling Fiora, who typically builds health and relies on parrying burst. The consistent true damage bypasses some of her defenses and sustain." },
      { choiceName: "{{Infinity Edge}} (Masterwork)", ratingKey: "adept", explanation: "Upgrading {{Infinity Edge}} significantly boosts Vayne's overall damage, which is valuable. However, the true damage from an upgraded {{Kraken Slayer}} is often more immediately impactful against a duelist like Fiora." }
    ],
    defaultPlausibleRatingKey: 'plausible',
    defaultPlausibleExplanation: "While this upgrade provides some benefit, it might not be the most direct or impactful choice against a fed Fiora compared to options that directly enhance dueling or anti-tank capabilities."
  },
  {
    id: "puzzle_ban_vs_yasuo_malphite",
    title: "Dismantle the Combo",
    scenarioDescription: "The enemy team has secured Yasuo (Mid) and Malphite (Top), signaling a powerful area-of-effect knock-up combo. Your team needs to make a critical ban to disrupt their strategy. Which champion, if left open, poses the biggest threat by synergizing with or enabling this combo?",
    yourTeamInitialPicks: [{champion: "Jinx", role:"ADC"}, {champion: "Lulu", role:"Support"}],
    yourTeamInitialBans: ["Zed"],
    enemyTeamInitialPicks: [
        {champion: "Yasuo", role:"Mid", ddragonKey: "Yasuo"},
        {champion: "Malphite", role:"Top", ddragonKey: "Malphite"}
    ],
    enemyTeamInitialBans: ["Samira"],
    puzzleType: "crucialBan",
    choiceContextLabel: "Crucial Ban Choice",
    banChoiceOptions: ["Orianna", "Yone", "Diana", "Rell", "Gragas"],
    idealPicks: [
        { choiceName: "Orianna", ratingKey: "oracle", explanation: "Banning Orianna is paramount. Her Command: Shockwave provides a massive AoE damage follow-up and further CC, perfectly complementing Malphite's Unstoppable Force and Yasuo's Last Breath, creating an almost uncounterable teamfight." },
        { choiceName: "Rell", ratingKey: "master", explanation: "Rell offers another layer of AoE CC with Magnet Storm and Ferromancy: Crash Down, which can chain perfectly with Malphite and Yasuo, making teamfights incredibly difficult. Banning her reduces their lockdown potential significantly." }
    ],
    defaultPlausibleRatingKey: 'plausible',
    defaultPlausibleExplanation: "While this champion can be disruptive, banning a direct AoE CC amplifier like Orianna or Rell is likely more critical against the Yasuo-Malphite core."
  },
  {
    id: "puzzle_weaklink_no_engage_20240729",
    title: "The Missing Spark",
    scenarioDescription: "Your team has drafted the composition below. While rich in damage, there's a strategic flaw concerning how your team can effectively start fights or protect its carries. Identify the champion whose selection contributes most to this vulnerability, and then explain the core issue.",
    puzzleType: "weakLinkAnalysis",
    flawedTeamComposition: [
      { champion: "Jayce", role: "Top", ddragonKey: "Jayce" },
      { champion: "Master Yi", role: "Jungle", ddragonKey: "MasterYi" },
      { champion: "Lux", role: "Mid", ddragonKey: "Lux" },
      { champion: "Ezreal", role: "ADC", ddragonKey: "Ezreal" },
      { champion: "Soraka", role: "Support", ddragonKey: "Soraka" }
    ],
    yourTeamInitialPicks: [], // Not directly used by weakLink display, but good for context
    yourTeamInitialBans: [],
    enemyTeamInitialPicks: [],
    enemyTeamInitialBans: [],
    choiceContextLabel: "Identify the Weak Link", // This will change in UI for stage 2
    weakLinkCorrectChampionName: "Master Yi", // Or could be Soraka/Lux depending on the intended flaw
    weakLinkExplanationOptions: [
      { letter: "A", text: "The team lacks a dedicated magic damage hyper-carry for late game." },
      { letter: "B", text: "The composition has insufficient reliable engage and frontline presence, making it hard for Master Yi to function and for carries to stay safe." },
      { letter: "C", text: "Soraka's healing is easily countered by anti-heal items, making her pick suboptimal." },
      { letter: "D", text: "Jayce and Ezreal provide too much poke, which doesn't synergize with Master Yi's all-in style." }
    ],
    weakLinkCorrectExplanationLetter: "B",
    idealPicks: [ // Ideal picks for weakLinkAnalysis need to be structured for two stages
      // Stage 1: Identifying the champion
      { choiceName: "Master Yi", ratingKey: "oracle", explanation: "Correct. While Master Yi has high carry potential, his effectiveness is severely hampered by this team's lack of reliable engage and peel. Now, why is this specific pick problematic in this composition?" },
      // Stage 2: Explaining why
      { choiceName: "B", ratingKey: "oracle", explanation: "Precisely. Without a strong frontline or dependable CC to lock down targets, Master Yi will be easily kited or burst down. Similarly, Lux and Ezreal are vulnerable without dedicated peel against diving threats." }
    ],
    defaultPlausibleRatingKey: 'plausible', // For incorrect champion identification
    defaultPlausibleExplanation: "While that champion might have some issues, consider who most fundamentally lacks the tools to function or enable others in this specific team structure."
  }
];
