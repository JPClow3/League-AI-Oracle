import { DetailedItemAnalysis } from '../types';

export const ITEM_DETAILS_DATA: Record<string, DetailedItemAnalysis> = {
    "Abyssal Mask": {
        name: "Abyssal Mask",
        cost: "2650g",
        stats: ["+350 Health", "+45 Magic Resist", "+15 Ability Haste"],
        mechanics: "Passive - Unmake: Immobilizing an enemy champion causes them to take 10% increased damage from all sources for 4 seconds.",
        strategicPurpose: "Abyssal Mask is a tank item designed for teams with significant magic damage. Its primary purpose is to amplify the damage output of allied mages by making enemies more vulnerable to their attacks. It is best built by tanks who have reliable crowd control (CC) in their kits, such as Amumu, Maokai, or Galio.",
        situationalApplication: "This is a situational purchase made when two conditions are met: 1) The user's team has at least one, and preferably multiple, strong magic damage threats, and 2) The enemy team has durable targets that need to be focused down. It is particularly effective when built alongside other magic resist items if facing a heavy AP enemy composition."
    },
    "Archangel's Staff": {
        name: "Archangel's Staff / Seraph's Embrace",
        cost: "2900g",
        stats: ["+70 Ability Power", "+600 Mana", "+25 Ability Haste"],
        mechanics: `Passive - Awe: Grants bonus Ability Power equal to a percentage of bonus mana.
Passive - Mana Charge: The item gains stacks of bonus mana over time and by spending mana, up to a cap of 360 bonus mana. Upon reaching the cap, the item transforms into Seraph's Embrace, which grants a large damage-absorbing shield.`,
        strategicPurpose: `This is the premier scaling item for mana-hungry mages who cast spells frequently, such as Ryze, Kassadin, Cassiopeia, Orianna, and Anivia. Its purpose is twofold: first, it solves all mana issues, allowing for sustained spellcasting. Second, it provides a massive late-game power spike through its AP scaling with mana and the defensive utility of the Seraph's Embrace shield.`,
        situationalApplication: "This is a core item that is almost always rushed. Players typically purchase its component, Tear of the Goddess, on their first back to begin stacking its mana passive as early as possible. The full Archangel's Staff is often completed as a second or third item."
    },
    "Bloodthirster": {
        name: "Bloodthirster",
        cost: "3400g",
        stats: ["+80 Attack Damage", "+15% Life Steal"],
        mechanics: "Passive - Engorge: Converts healing from lifesteal that exceeds the user's maximum health into a decaying shield. The shield's maximum value scales with champion level.",
        strategicPurpose: `Bloodthirster is a premier defensive and offensive item for auto-attack-based champions, primarily marksmen. It provides the highest flat Attack Damage of any lifesteal item. Its core function is to provide sustain through lifesteal and added durability via its shield, which acts as a buffer against poke and initial burst damage in teamfights.`,
        situationalApplication: "Typically built as a third or fourth item for marksmen, after core damage items like Infinity Edge and a Zeal item are completed. It is an excellent choice against teams with significant poke damage or when the ADC needs extra survivability without sacrificing too much damage output."
    },
    "Fimbulwinter": {
        name: "Fimbulwinter",
        cost: "2400g",
        stats: ["+550 Health", "+860 Mana", "+15 Ability Haste"],
        mechanics: `Passive - Awe: Grants bonus health equal to 15% of maximum mana.
Passive - Everlasting: Immobilizing an enemy champion (or slowing them, for melee champions) grants a shield based on current mana. The shield is significantly larger if more than one enemy is nearby.`,
        strategicPurpose: "Fimbulwinter is the defensive equivalent of Muramana, designed for tanks and some bruisers who have large mana pools and reliable crowd control (e.g., Blitzcrank, Taric, Skarner). The item's purpose is to convert a large mana pool into both health and a recurring shield, dramatically increasing the user's durability in teamfights.",
        situationalApplication: "Like Archangel's Staff, this item's path begins with Tear of the Goddess. The component item, Winter's Approach, is purchased, and it transforms into Fimbulwinter once the mana-stacking passive is complete. It is a core scaling item for its users, not a reactive purchase."
    },
    "Manamune": {
        name: "Manamune / Muramana",
        cost: "2900g",
        stats: ["+35 Attack Damage", "+500 Mana", "+15 Ability Haste"],
        mechanics: `Passive - Awe: Grants bonus Attack Damage equal to 2% of maximum mana.
Passive - Mana Charge: Gains stacks of bonus mana on-hit and on ability use, up to a cap of 360. Upon reaching the cap, it transforms into Muramana.
Muramana Passive - Shock: Causes single-target abilities and basic attacks against champions to deal bonus physical damage based on maximum mana.`,
        strategicPurpose: "Manamune is the core scaling item for AD Casters—champions who deal a significant portion of their physical damage through abilities rather than just auto-attacks (e.g., Ezreal, Corki, Jayce, Varus). It solves their high mana consumption while providing a massive damage spike upon transforming into Muramana.",
        situationalApplication: "This is a core item that is almost always rushed. Players buy Tear of the Goddess on their first back to begin stacking immediately. Manamune is typically completed as the first or second full item to ensure it transforms as quickly as possible."
    },
    "Morellonomicon": {
        name: "Morellonomicon",
        cost: "2850g",
        stats: ["+75 Ability Power", "+350 Health", "+15 Ability Haste"],
        mechanics: "Passive - Affliction: Dealing magic damage to enemy champions inflicts them with 40% Grievous Wounds for 3 seconds. Grievous Wounds is a debuff that reduces all incoming healing and regeneration.",
        strategicPurpose: "Morellonomicon is the primary anti-heal item for mages. Its sole purpose is to counter champions who rely on significant healing to be effective, such as Dr. Mundo, Soraka, Vladimir, or champions building lifesteal. It synergizes particularly well with damage-over-time mages like Brand, as each tick of their damage can refresh the Grievous Wounds debuff.",
        situationalApplication: "This is a purely situational, reactive purchase. It is built when the enemy team's healing becomes a significant problem. Players often buy its component, Oblivion Orb (800g), to apply the Grievous Wounds effect early and only upgrade to the full Morellonomicon later in the game."
    },
    "Rabadon's Deathcap": {
        name: "Rabadon's Deathcap",
        cost: "3500g",
        stats: ["+130 Ability Power"],
        mechanics: "Passive - Magical Opus: Increases your total Ability Power by 30-40% (depending on game version).",
        strategicPurpose: "Rabadon's Deathcap is the ultimate damage multiplier for mages. It is the single largest source of AP in the game due to its percentage-based passive. Its purpose is to take a champion's existing AP from other items and runes and amplify it to extreme levels. It synergizes with any champion who has high AP ratios on their abilities.",
        situationalApplication: "Due to its high cost and multiplicative nature, Rabadon's Deathcap is almost always built as a third, fourth, or even fifth item. Its passive is most effective when there is already a substantial amount of AP to multiply. Building it too early is inefficient. It is the capstone item that signals a mage has reached their maximum damage potential."
    },
    "Zhonya's Hourglass": {
        name: "Zhonya's Hourglass",
        cost: "3250g",
        stats: ["+105 Ability Power", "+50 Armor", "+10 Ability Haste"],
        mechanics: "Active - Stasis: The user becomes invulnerable and untargetable for 2.5 seconds, but is unable to perform any other actions during this time (120-second cooldown).",
        strategicPurpose: "Zhonya's Hourglass is arguably the most impactful active item in the game for mages. Its purpose is survival. The 2.5 seconds of invulnerability can be used to dodge critical ultimates (like Zed's Death Mark), wait for ability cooldowns, or allow channeled ultimates (like Fiddlesticks') to continue dealing damage while the caster is safe.",
        situationalApplication: "Zhonya's is both a core and situational item. For mid-lane mages facing AD assassins like Zed or Talon, its component Seeker's Armguard is often a rush purchase, and the full item is completed first or second. For other mages, it is typically built as a second or third item as a general defensive tool. Its presence fundamentally changes how an enemy must engage."
    }
};
