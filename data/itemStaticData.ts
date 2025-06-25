
import { ItemStaticInfo } from '../types';

// DDragon Item IDs are crucial and need to be manually looked up/verified.
// The "id" field below MUST be the DDragon numerical ID string.
// Item names should match DDragon's display name.
// Cost and numerical stats are primarily for AI context and should defer to live DDragon data for UI display.
// This file's main purpose is to provide STRATEGIC context, KEYWORDS for search, and item TYPE for filtering.

export const itemStaticData: ItemStaticInfo[] = [
  // Basic Items
  {
    id: "1036", name: "Long Sword", type: 'Basic',
    strategicSummary: "Fundamental AD component, building block for many AD items.",
    keywords: ["AD", "Attack Damage", "Component", "Physical Damage"]
  },
  {
    id: "1052", name: "Amplifying Tome", type: 'Basic',
    strategicSummary: "Fundamental AP component, base for many AP items.",
    keywords: ["AP", "Ability Power", "Component", "Magic Damage"]
  },
  {
    id: "1042", name: "Dagger", type: 'Basic',
    strategicSummary: "Basic attack speed component.",
    keywords: ["AS", "Attack Speed", "Component"]
  },
  {
    id: "1029", name: "Cloth Armor", type: 'Basic',
    strategicSummary: "Basic armor component for physical damage reduction.",
    keywords: ["Armor", "Defense", "Physical Defense", "Component"]
  },
  {
    id: "1033", name: "Null-Magic Mantle", type: 'Basic',
    strategicSummary: "Basic magic resist component.",
    keywords: ["MR", "Magic Resist", "Magic Defense", "Defense", "Component"]
  },
  {
    id: "1028", name: "Ruby Crystal", type: 'Basic',
    strategicSummary: "Basic health component.",
    keywords: ["Health", "HP", "Defense", "Component"]
  },
  {
    id: "1004", name: "Faerie Charm", type: 'Basic',
    strategicSummary: "Basic mana regeneration component.",
    keywords: ["Mana Regen", "Mana", "Component"]
  },
  {
    id: "1001", name: "Boots", type: 'Basic',
    strategicSummary: "Essential early movement speed.",
    keywords: ["Movement Speed", "MS", "Boots", "Component"]
  },

  // Epic Items
  {
    id: "3057", name: "Sheen", type: 'Epic',
    strategicSummary: "Core Spellblade component. Empowers next attack after ability use with bonus physical damage.",
    passiveName: "Spellblade", passiveDescription: "After using an Ability, your next basic attack deals bonus physical damage on-hit, (1.5s cooldown) equal to 100% base AD.",
    purposeAndSynergies: "Core for Trinity Force, Lich Bane, Essence Reaver, Iceborn Gauntlet. Signals intent for burst or sustained hybrid damage.",
    primaryUsers: ["Bruisers (Jax, Camille)", "Mages (Fizz, Viktor)", "Some ADCs (Ezreal)"],
    keywords: ["Spellblade", "On-hit", "Burst", "Component"],
    buildPathNotes: "Essential first buy for champions rushing Trinity Force, Essence Reaver, etc."
  },
  {
    id: "3751", name: "Bami's Cinder", type: 'Epic',
    strategicSummary: "Tank-based Wave Clear: Deals AoE magic damage (Immolate passive). Builds into Sunfire Aegis or Hollow Radiance.",
    passiveName: "Immolate", passiveDescription: "Taking or dealing damage causes you to begin dealing magic damage per second to nearby enemies (increased against minions and monsters).",
    primaryUsers: ["Tanks (Ornn, Sejuani)"], keywords: ["Tank", "Waveclear", "AoE", "Health", "Component", "Burn"],
    buildPathNotes: "Signals intent for an Immolate-passive Legendary for wave clear and tankiness."
  },
  {
    id: "3123", name: "Executioner's Calling", type: 'Epic',
    strategicSummary: "Countering Healing (AD): Applies Grievous Wounds on physical damage. Builds into Mortal Reminder or Chempunk Chainsword.",
    passiveName: "Rend", passiveDescription: "Physical damage inflicts 40% Grievous Wounds on enemy champions for 3 seconds.",
    primaryUsers: ["AD Champions"], keywords: ["Anti-heal", "Grievous Wounds", "AD", "Component"],
    buildPathNotes: "Early purchase vs high-sustain opponents."
  },
  {
    id: "3076", name: "Bramble Vest", type: 'Epic',
    strategicSummary: "Countering Healing (Tank vs AD Auto-Attackers): Reflects magic damage and applies Grievous Wounds to attackers. Builds into Thornmail.",
    passiveName: "Thorns", passiveDescription: "When struck by a basic attack, deals magic damage to the attacker and inflicts 40% Grievous Wounds for 3 seconds.",
    primaryUsers: ["Tanks (Rammus, Malphite)"], keywords: ["Anti-heal", "Grievous Wounds", "Armor", "Tank", "Component", "Reflect"],
    buildPathNotes: "Rushed against AD auto-attackers with lifesteal."
  },
  {
    id: "3134", name: "Serrated Dirk", type: 'Epic',
    strategicSummary: "Early Lethality spike for AD assassins. Core for Lethality items.",
    primaryUsers: ["AD Assassins (Zed, Talon, Qiyana)"], keywords: ["Assassin", "Lethality", "AD", "Burst", "Component", "Armor Penetration"],
    buildPathNotes: "First major component for AD assassins. Signals a major burst threat."
  },
  {
    id: "3035", name: "Last Whisper", type: 'Epic',
    strategicSummary: "Anti-Tank (AD): Provides percentage armor penetration. Builds into Lord Dominik's Regards or Serylda's Grudge.",
    primaryUsers: ["ADCs", "AD Fighters"], keywords: ["Anti-Tank", "Armor Penetration", "AD", "Component"],
    buildPathNotes: "Essential against teams building significant armor."
  },
  {
    id: "3077", name: "Tiamat", type: 'Epic',
    strategicSummary: "Melee Wave Clear: Adds AoE damage to attacks/abilities. Builds into Hydra items.",
    activeName: "Crescent (Active)", activeDescription: "Deals physical damage to enemies around you.",
    passiveName: "Cleave (Passive)", passiveDescription: "Basic attacks deal bonus physical damage to other enemies near the target.",
    primaryUsers: ["Melee Fighters/Bruisers (Fiora, Camille, Renekton)"], keywords: ["Waveclear", "AoE", "AD", "Melee", "Component"],
    buildPathNotes: "Key for melee champions needing to augment wave clear and add AoE to combos."
  },
  {
    id: "3155", name: "Hexdrinker", type: 'Epic',
    strategicSummary: "Anti-Mage (AD): Provides AD and MR, with a magic shield passive. Builds into Maw of Malmortius.",
    passiveName: "Lifeline", passiveDescription: "If magic damage would reduce you below 30% health, first gain a magic shield (90s cooldown).",
    primaryUsers: ["AD Champions vs AP Burst"], keywords: ["Anti-Mage", "Magic Resist", "Shield", "AD", "Component"],
    buildPathNotes: "Key survival tool for AD champions laning against or threatened by magic burst."
  },

  // Legendary Items
  {
    id: "3001", name: "Abyssal Mask", type: 'Legendary',
    strategicSummary: "Tank item reducing nearby enemy MR (Unmake passive), amplifying team magic damage.",
    passiveName: "Unmake", passiveDescription: "Curse nearby enemy champions, reducing their Magic Resist. For each Cursed enemy, gain bonus Magic Resist.",
    purposeAndSynergies: "For tanks on teams with significant magic damage. Amplifies allied mages. Best with reliable CC (Amumu, Maokai) or frontline presence.",
    situationalApplication: "When team has strong AP and enemy has multiple magic damage threats or MR stackers.",
    primaryUsers: ["Tanks with CC", "Engage Tanks"], keywords: ["Tank", "Magic Resist", "Debuff", "Team Utility", "Aura", "Magic Damage Amp"],
  },
  {
    id: "3003", name: "Archangel's Staff", type: 'Legendary',
    strategicSummary: "Scaling mana/AP item for mages, transforms to Seraph's Embrace (shield).",
    passiveName: "Awe / Mana Charge", passiveDescription: "Awe: Gain Ability Haste equal to a percentage of bonus mana. Mana Charge: Grants bonus mana on spell cast or mana expenditure, up to a cap (e.g., 360). Transforms to Seraph's Embrace at max bonus mana.",
    activeName: "Lifeline (Seraph's Embrace passive)", activeDescription: "Upon taking damage that would reduce Health below 30%, gain a shield equal to a base amount plus a percentage of current mana (90 second cooldown).",
    purposeAndSynergies: "Premier scaling for mana-hungry mages (Ryze, Kassadin, Anivia). Solves mana, late-game AP spike, defensive utility from shield.",
    situationalApplication: "Core for synergistic champs. Tear component bought early.",
    primaryUsers: ["Mana-hungry Mages"], keywords: ["Mana", "AP", "Scaling", "Shield", "Ability Power", "Ability Haste"],
    buildPathNotes: "Tear of the Goddess first, then complete Archangel's as 2nd or 3rd item."
  },
  {
    id: "3072", name: "Bloodthirster", type: 'Legendary',
    strategicSummary: "High AD & Lifesteal, overheal shield for auto-attackers.",
    passiveName: "Ichorshield", passiveDescription: "Converts Lifesteal exceeding max health into a decaying shield, up to 50-350 (based on level). Shield decays out of combat for 25 seconds.",
    purposeAndSynergies: "Offensive/defensive for auto-attackers (Marksmen). High AD, sustain, shield vs poke/burst. Synergizes with crit.",
    situationalApplication: "Typically a 3rd or 4th item for marksmen. Good vs poke or for survivability. Core on Draven, Samira.",
    primaryUsers: ["Marksmen", "Some AD Fighters"], keywords: ["Lifesteal", "AD", "Shield", "Sustain", "Attack Damage"],
    goldEfficiencyNotes: "Value in Ichorshield providing effective health."
  },
  {
    id: "3165", name: "Morellonomicon", type: 'Legendary',
    strategicSummary: "Primary anti-heal for mages, applies Grievous Wounds with magic damage.",
    passiveName: "Affliction", passiveDescription: "Magic damage inflicts 40% Grievous Wounds on enemy champions for 3 seconds. If the target is below 50% health, this is increased to 60% Grievous Wounds.",
    purposeAndSynergies: "Counters healing (Mundo, Soraka, Aatrox). Good with DoT mages (Brand, Malzahar) and burst mages to secure kills on low-health healing targets.",
    situationalApplication: "Situational. Oblivion Orb (800g) component early for 40% GW effect.",
    primaryUsers: ["Mages (esp. DoT & Burst)"], keywords: ["Anti-heal", "Grievous Wounds", "AP", "Health", "Magic Damage", "Execute"],
    buildPathNotes: "Oblivion Orb for early GW, complete Morello later if needed for more AP/health and stronger GW."
  },
  {
    id: "3157", name: "Zhonya's Hourglass", type: 'Legendary',
    strategicSummary: "Core defensive AP/Armor item with game-changing Stasis active.",
    activeName: "Stasis", activeDescription: "Become invulnerable and untargetable for 2.5s, but unable to take any actions (120s CD).",
    purposeAndSynergies: "Impactful active for mages. Survival via Stasis: dodge ults, wait for CDs, channel ults, negate tower damage. Allows aggressive positioning.",
    situationalApplication: "Core & situational. Build path component (e.g. Perfected Stopwatch from Commencing Stopwatch) can be rushed vs AD assassins. Usually 2nd/3rd item.",
    primaryUsers: ["Most Mages", "Some AP Assassins"], keywords: ["Invulnerability", "Stasis", "AP", "Armor", "Defensive Active", "Playmaking", "Counter Burst"],
    goldEfficiencyNotes: "High value primarily due to its Stasis active."
  },
  {
    id: "3153", name: "Blade of the Ruined King", type: 'Legendary',
    strategicSummary: "Anti-tank and dueling item for AD auto-attackers, deals % current health damage.",
    passiveName: "Mist's Edge / Siphon", passiveDescription: "Mist's Edge: Attacks deal bonus physical damage based on target's current health (melee: 12%, ranged: 8%). Siphon: Attacking a champion 3 times deals magic damage and steals 25% of their movement speed for 2 seconds (20s cooldown).",
    purposeAndSynergies: "Excellent for shredding high-health targets. Strong dueling power due to on-hit damage and MS steal. Synergizes with attack speed and on-hit builds.",
    primaryUsers: ["Marksmen (Vayne, Kog'Maw, Ashe)", "Fighters (Irelia, Jax, Master Yi)"], keywords: ["Anti-Tank", "On-hit", "Attack Speed", "Lifesteal", "Dueling", "AD", "Percent Health Damage", "MS Steal"],
    goldEfficiencyNotes: "Value in % current health damage and Siphon passive for kiting/chasing."
  },
  {
    id: "3089", name: "Rabadon's Deathcap", type: 'Legendary',
    strategicSummary: "Ultimate AP multiplier, significantly boosts total AP.",
    passiveName: "Magical Opus", passiveDescription: "Increases your total Ability Power by 40%.",
    purposeAndSynergies: "Largest raw AP source due to % amplification. Core for mages needing massive AP scaling.",
    situationalApplication: "Usually 3rd, 4th, or 5th item. Most effective when substantial AP already exists.",
    primaryUsers: ["All AP Mages aiming for max damage"], keywords: ["AP", "Scaling", "Damage Multiplier", "Ability Power"],
    goldEfficiencyNotes: "Gold efficiency becomes massive once other AP items are built."
  },
  {
    id: "3031", name: "Infinity Edge", type: 'Legendary',
    strategicSummary: "Premier critical strike damage amplifier for ADCs.",
    passiveName: "Perfection", passiveDescription: "If you have at least 40% Critical Strike Chance, gain 35% Critical Strike Damage.",
    purposeAndSynergies: "Massively increases crit damage. Core for most crit-building ADCs.",
    primaryUsers: ["Marksmen (Caitlyn, Jinx, Tristana)"], keywords: ["Crit", "ADC", "Attack Damage", "Scaling", "Critical Strike Damage"],
    buildPathNotes: "Typically built 2nd or 3rd item in crit builds."
  },
  {
    id: "6672", name: "Kraken Slayer", type: 'Legendary',
    strategicSummary: "Provides true damage on-hit every third attack, effective against durable targets.",
    passiveName: "Bring It Down", passiveDescription: "Every third basic attack deals bonus true damage on-hit.",
    purposeAndSynergies: "Strong against tanks and bruisers. Good for ADCs who can proc it frequently.",
    primaryUsers: ["Marksmen (Vayne, Ashe, Kai'Sa)"], keywords: ["On-hit", "True Damage", "Attack Speed", "ADC", "Anti-Tank"],
    buildPathNotes: "Often a first or second item for on-hit ADCs or those needing to counter tanks early."
  },
  {
    id: "3152", name: "Liandry's Anguish", type: 'Legendary',
    strategicSummary: "Melts high-health targets with % max health burn and provides AP based on target's bonus health.",
    passiveName: "Torment / Agony", passiveDescription: "Dealing ability damage burns enemies for a percentage of their maximum health as magic damage over time. Deal bonus magic damage to bonus health targets.",
    purposeAndSynergies: "Essential for mages against tanky compositions. Great on DoT mages.",
    primaryUsers: ["Control Mages (Brand, Malzahar, Anivia)", "Battle Mages (Swain)"], keywords: ["Burn", "AP", "Anti-Tank", "DoT", "Magic Damage", "Percent Health Damage", "Ability Haste"],
    buildPathNotes: "Core item for mages facing multiple tanks or high-health champions."
  },
  {
    id: "4628", name: "Riftmaker", type: 'Legendary',
    strategicSummary: "Provides AP, health, omnivamp, and ramping damage amplification in extended combat.",
    passiveName: "Void Corruption", passiveDescription: "For each second in champion combat, deal 2% bonus damage (max 10%). At maximum stacks, convert 100% of bonus damage to true damage.",
    purposeAndSynergies: "Ideal for AP bruisers and battle mages who thrive in prolonged fights.",
    primaryUsers: ["AP Bruisers (Gwen, Mordekaiser)", "Battle Mages (Kayle, Cassiopeia)"], keywords: ["AP", "Health", "Sustain", "Omnivamp", "True Damage", "Extended Combat", "AP Bruiser"],
    buildPathNotes: "Core item for AP champions who need sustain and damage in longer engagements."
  },
  {
    id: "3068", name: "Sunfire Aegis", type: 'Legendary',
    strategicSummary: "Core tank item with AoE burn (Immolate) that ramps up in combat.",
    passiveName: "Immolate", passiveDescription: "Taking or dealing damage causes you to begin dealing magic damage per second to nearby enemies (increased by 25% per stack, max 6 stacks, while in combat with champions or epic monsters). At max stacks, basic attacks also explode with Immolate damage.",
    purposeAndSynergies: "Waveclear, sustained AoE damage in fights for tanks.",
    primaryUsers: ["Tanks (Ornn, Sejuani, Malphite, K'Sante)"], keywords: ["Tank", "Armor", "Health", "Waveclear", "Burn", "AoE", "Teamfight"],
    buildPathNotes: "Often a first item for tanks needing waveclear and consistent damage."
  },
  {
    id: "6667", name: "Jak'Sho, The Protean", type: 'Legendary',
    strategicSummary: "Provides ramping resistances and drain during combat, making tanks incredibly durable in extended fights.",
    passiveName: "Voidborn Resilience", passiveDescription: "For each second in champion combat, gain a stack of Voidborn Resilience, granting bonus Armor and Magic Resist. At max stacks, become empowered, instantly draining nearby enemies for magic damage and healing yourself, and increasing your bonus resistances until end of combat.",
    purposeAndSynergies: "Excellent for tanks and bruisers who expect long fights and need mixed resistances.",
    primaryUsers: ["Tanks (K'Sante, Ornn)", "Some Bruisers"], keywords: ["Tank", "Resistances", "Sustain", "Scaling Defense", "Armor", "Magic Resist", "Teamfight"],
    buildPathNotes: "Good second or third item for tanks needing to scale resistances in teamfights."
  },
  {
    id: "3078", name: "Trinity Force", type: 'Legendary',
    strategicSummary: "Classic bruiser item offering a mix of stats and the Spellblade passive for sustained damage and burst.",
    passiveName: "Spellblade / Threefold Strike", passiveDescription: "Spellblade: After using an ability, your next attack deals bonus physical damage (typically 200% base AD). Threefold Strike: Basic attacks grant bonus movement speed and stacking base AD for a short duration (up to 5 stacks).",
    purposeAndSynergies: "For champions who weave abilities and attacks, and benefit from all-around stats.",
    primaryUsers: ["Bruisers (Jax, Camille, Irelia)", "Some ADCs (Ezreal)"], keywords: ["Spellblade", "AD", "Attack Speed", "Health", "MS", "Bruiser", "Dueling", "Ability Haste"],
    buildPathNotes: "Core item for many bruisers, often rushed."
  },
  {
    id: "3053", name: "Sterak's Gage", type: 'Legendary',
    strategicSummary: "Defensive item for bruisers, providing a large shield when low health.",
    passiveName: "Lifeline / The Claws That Catch", passiveDescription: "Lifeline: Upon taking damage that would reduce Health below 30%, gain a large shield that decays over time. The Claws That Catch: Gain bonus Attack Damage equal to 50% of base Attack Damage.",
    purposeAndSynergies: "Crucial for surviving burst and staying in fights longer for melee champions.",
    primaryUsers: ["Juggernauts (Darius, Garen)", "Divers (Sett, Vi)"], keywords: ["Health", "AD", "Shield", "Survival", "Bruiser", "Anti-Burst", "Juggernaut"],
    buildPathNotes: "Typically a second or third item for bruisers needing survivability against burst."
  },
  {
    id: "3190", name: "Locket of the Iron Solari", type: 'Legendary',
    strategicSummary: "Support tank item providing an AoE shield active for the team and bonus resistances to nearby allies.",
    activeName: "Devotion", activeDescription: "Grant nearby allies a shield that decays over 2.5 seconds (90s cooldown).",
    passiveName: "Consecrate", passiveDescription: "Grant nearby allied champions bonus Armor and Magic Resist.",
    purposeAndSynergies: "Team-wide protection against burst. Aura boosts nearby allies' defenses. Essential for protecting carries.",
    primaryUsers: ["Tank Supports (Leona, Nautilus)", "Enchanter Supports (sometimes when team lacks frontline)"], keywords: ["Support", "Tank", "Shield", "Team Utility", "Aura", "Resistances", "Peel"],
    buildPathNotes: "Often a core item for tank supports, built early to mid game."
  }
  // Add more items as needed, following the DDragon ID and structure.
];

/**
 * Provides a summarized string of static item data for system prompts.
 * Slices the list to a specified limit to keep the prompt concise.
 * @param {number} limit - The maximum number of items to include in the summary.
 * @returns {string} A string summarizing a sample of static item data.
 */
export const getStaticItemSummary = (limit: number = 6): string => {
  if (itemStaticData.length === 0) return "No static item data available.";

  const effectiveLimit = Math.min(limit, itemStaticData.length);
  
  const epics = itemStaticData.filter(item => item.type === 'Epic');
  const legendaries = itemStaticData.filter(item => item.type === 'Legendary');
  
  let sampleItems: ItemStaticInfo[] = [];
  const numEpicsToTake = Math.min(epics.length, Math.ceil(effectiveLimit / 3)); 
  const numLegendariesToTake = effectiveLimit - numEpicsToTake;

  sampleItems.push(...epics.slice(0, numEpicsToTake));
  sampleItems.push(...legendaries.slice(0, Math.min(legendaries.length, numLegendariesToTake)));
  
  if (sampleItems.length < effectiveLimit) {
    const remainingNeeded = effectiveLimit - sampleItems.length;
    const existingIds = new Set(sampleItems.map(item => item.id));
    const additionalItems = itemStaticData.filter(item => !existingIds.has(item.id)).slice(0, remainingNeeded);
    sampleItems.push(...additionalItems);
  }
  sampleItems = sampleItems.slice(0, effectiveLimit);

  let summary = sampleItems
    .map(item => {
      let descPart = item.strategicSummary || item.purposeAndSynergies || "General use item";
      if (item.type === 'Epic' && item.strategicSummary) {
        const signalIndex = item.strategicSummary.indexOf(":");
        descPart = signalIndex !== -1 ? item.strategicSummary.substring(0, signalIndex) : item.strategicSummary;
      } else if (item.type === 'Legendary' && item.passiveName && item.strategicSummary) {
         const summaryPoints = item.strategicSummary.split('.')[0]; // Take first sentence of summary
        descPart = `${item.passiveName} passive. ${summaryPoints}`;
      } else if (item.strategicSummary) {
        descPart = item.strategicSummary.split('.')[0];
      }
      
      if (descPart.length > 70) descPart = descPart.substring(0, 67) + "...";
      return `${item.name} (${item.type}, ${descPart})`;
    })
    .join('; ');

  if (itemStaticData.length > effectiveLimit) {
    summary += '; and many other items with defined types, strategic purposes, passives, actives, and synergies.';
  } else {
    summary += '.';
  }
  return summary;
};
