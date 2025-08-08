// Based on academic research on win prediction in League of Legends.

export const CORE_AI_PERSONA = `You are the Lead Strategic Analyst for DraftWise AI. Your purpose is to provide clear, confident, data-driven analysis for the Commander (the user).`;

export const STRATEGIC_CONCEPTS = {
  METAGAME_VS_MECHANICS: "The 'metagame' refers to the overarching strategies, champion priorities, and item builds that are considered optimal in the current state of the game. 'Mechanics' refers to a player's raw skill in controlling their champion. In high-level play, a superior understanding of the metagame can overcome a slight mechanical disadvantage.",
  TEAM_COMPOSITION: "A successful team composition balances several factors: damage types (AD/AP), crowd control (CC), engage potential, disengage/peel for carries, and waveclear. The synergy between champions is paramount.",
  WIN_CONDITIONS: "A team's 'win condition' is the primary strategy they must execute to win the game. This could be protecting a late-game hyper-carry, creating picks on isolated targets, or executing a superior teamfight combo around major objectives.",
};

export const GAME_PHASES_INFO = {
  EARLY_GAME: {
    duration: "0-15 minutes",
    focus: "Laning phase. The primary goal is to accumulate resources (gold and XP) and gain small advantages over the direct lane opponent. Early objectives like the first tower or first dragon are contested.",
    importance: "Performance in this phase sets the stage for the mid-game, but its direct impact on the final outcome diminishes as the game progresses."
  },
  MID_GAME: {
    duration: "15-30 minutes",
    focus: "Transitioning out of laning phase into team-based objective control. Fights around Dragon and Baron Nashor become more frequent and critical. Teams group up to siege towers.",
    importance: "This is often where the game's tempo is decided. Advantages gained here are highly likely to lead to victory."
  },
  LATE_GAME: {
    duration: "30+ minutes",
    focus: "Full teamfights are the norm. A single lost teamfight can result in losing the game, as death timers are long. Control of Baron Nashor and the Elder Dragon is the highest priority.",
    importance: "At this stage, champion scaling and teamfight execution are paramount. Early game leads matter less than having the superior late-game team composition and making the correct macro-decision."
  },
};

export const KEY_WIN_INDICATORS_INFO = [
  "Gold Advantage: This is consistently the most reliable predictor of victory. A significant gold lead allows a team to purchase better items, making them stronger in fights.",
  "Experience (XP) Advantage: Closely correlated with gold, an XP lead means higher champion levels, unlocking more powerful abilities and base stats.",
  "Objective Control: Securing objectives like Towers, Inhibitors, Dragons, and Baron Nashor provides global gold, powerful buffs, and map control. Destroying an inhibitor is a major step towards victory.",
  "KDA (Kills/Deaths/Assists): While important, raw kill counts can be misleading. A low number of deaths is often more indicative of success than a high number of kills. A death in the late game is far more punitive than one in the early game due to long respawn timers."
];

export const OBJECTIVES_INFO = {
  NEXUS: "The ultimate objective. Destroying the enemy Nexus wins the game.",
  INHIBITORS: "Destroying an inhibitor spawns powerful Super Minions for your team in that lane, creating immense pressure. At least one inhibitor must be destroyed to damage the Nexus towers. They respawn after 5 minutes.",
  TOWERS: "Defensive structures that must be destroyed to advance into the enemy base. They provide vision and global gold to the team that destroys them.",
  DRAGON: "A neutral monster that provides powerful, stacking, permanent buffs to the team that slays it. Controlling dragons is a key mid-game objective.",
  BARON_NASHOR: "The most powerful neutral monster, appearing after 20 minutes. It grants a temporary but immense buff that empowers minions, making it the ultimate tool for sieging and closing out a game."
};