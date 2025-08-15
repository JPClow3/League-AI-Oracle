import type { KeywordDefinition, LessonCategory } from '../../types';

export const KEYWORDS: KeywordDefinition[] = [
    { term: 'Team Composition', definition: 'The overall strategic identity of a team based on the champions selected.', lessonId: 'team-comp-archetypes' },
    { term: 'Poke', definition: 'A strategy focused on whittling down enemy health from a distance before a fight begins.', lessonId: 'poke-composition' },
    { term: 'Dive', definition: 'A strategy centered around aggressively singling out and eliminating a key enemy target.', lessonId: 'dive-composition' },
    { term: 'Split Push', definition: 'A strategy where one player applies pressure to a side lane to draw enemy attention, creating opportunities elsewhere.', lessonId: 'split-push' },
    { term: 'Engage', definition: 'The act of initiating a teamfight, often with crowd control abilities.', lessonId: 'engage-disengage' },
    { term: 'Disengage', definition: 'The act of safely retreating from a teamfight or preventing the enemy from starting one.', lessonId: 'engage-disengage' },
    { term: 'Peel', definition: 'The act of using abilities to protect a key teammate (usually a carry) from enemy threats.', lessonId: 'protect-the-carry' },
    { term: 'Wave Management', definition: 'The intentional control over the position and size of the minion wave to create strategic advantages.', lessonId: 'wave-management' },
    { term: 'Power Spike', definition: 'A significant increase in a champion\'s power, typically from a key item or level, creating a window of opportunity.', lessonId: 'power-spikes' },
    { term: 'Vision Control', definition: 'The strategic placement and denial of wards to control information on the map.', lessonId: 'vision-objectives' },
    { term: 'Objective Control', definition: 'Prioritizing and securing neutral objectives like Dragon, Baron, and turrets to gain team-wide advantages.', lessonId: 'vision-objectives' },
    { term: 'Tempo', definition: 'The pace of the game; having tempo means you have the freedom to make proactive plays while the opponent must react.', lessonId: 'power-spikes' },
];

export const LESSONS: LessonCategory[] = [
    {
        name: 'Drafting Fundamentals',
        lessons: [
            {
                id: 'team-comp-archetypes',
                title: 'Team Composition Archetypes',
                content: `
A strong **Team Composition** is more than just five strong champions; it's a cohesive unit with a clear, unified plan for victory. Understanding the major archetypes is the first step to mastering the draft. Think of these as a game of rock-paper-scissors: **Poke** beats **Protect the Carry**, **Dive** beats **Poke**, and **Protect the Carry** beats **Dive**.

- **Poke / Siege Compositions**:
    - **Goal**: Win the war of attrition. Use superior range to chip away at enemy health from a safe distance, making it impossible for them to contest objectives or defend towers.
    - **How it Works**: This composition avoids direct, all-in fights. It establishes a siege, usually around a tower or neutral objective, and uses long-range abilities to force the enemy back. Once the enemy is low on health, they can take the objective for free.
    - **Strengths**: Excellent objective control, safe damage application, frustrating to play against.
    - **Weaknesses**: Extremely vulnerable to hard **Engage** and flanks. If the enemy can close the distance, poke comps often crumble due to their lack of durability and close-range damage.

- **Dive Compositions**:
    - **Goal**: Isolate and eliminate a high-priority target. This is a precision strike to decapitate the enemy team by removing their primary damage dealer.
    - **How it Works**: A Dive comp uses layered crowd control (CC) and burst damage to converge on a single target, usually the enemy ADC or mid laner. It requires excellent coordination and timing.
    - **Strengths**: Decisive teamfighting, punishes poor positioning, directly counters **Poke** comps.
    - **Weaknesses**: Relies heavily on key ultimate abilities and coordination. A failed dive can leave the team scattered and vulnerable. Easily thwarted by strong **Disengage** and **Peel**.

- **Protect the Carry (Front-to-Back)**:
    - **Goal**: Enable a single, late-game scaling champion (a "hyper-carry") to win the game. The entire team's purpose is to act as bodyguards for this win condition.
    - **How it Works**: The team survives the early game, funneling gold and resources into their hyper-carry. In teamfights, a strong frontline and supportive champions create a safe pocket for the carry to deal massive, sustained damage.
    - **Strengths**: Unmatched late-game 5v5 power, strong defensive capabilities. A natural counter to **Dive** comps.
    - **Weaknesses**: Very weak early game, creating a single point of failure. If the hyper-carry is shut down or killed early in a fight, the composition has no damage.

- **Split Push Compositions**:
    - **Goal**: Avoid 5v5 teamfights entirely. Create overwhelming map pressure in multiple lanes simultaneously, forcing the enemy to make impossible choices.
    - **How it Works**: A strong duelist pushes a side lane alone, while the other four members group elsewhere, threatening an objective or another lane. This forces the enemy to either split their forces and risk losing a 4v4/4v3, or send multiple members to deal with the split-pusher, giving up a major objective.
    - **Strengths**: Incredible map control, forces the enemy into reactive, disadvantageous positions.
    - **Weaknesses**: Requires a duelist who can reliably win 1v1s or survive 1v2s, and a 4-man group with strong **Disengage** to avoid being wiped out in a 4v5.
                `.trim()
            },
        ]
    },
    {
        name: 'Core Concepts',
        lessons: [
            {
                id: 'poke-composition',
                title: 'Mastering the Poke Composition',
                content: `
A **Poke** composition's philosophy is "win the fight before it starts." By controlling space and applying constant, long-range pressure, you force the enemy into a reactive state, unable to safely contest objectives.

**Drafting a Poke Composition:**
A successful poke comp needs more than just damage; it requires layers of utility and safety.

- **Top Lane (Self-Sufficient or Ranged Threat)**:
    - **Jayce**: The quintessential poke champion. His empowered Shock Blast is a primary source of siege damage.
    - **Kennen**: Provides ranged harass in lane and a powerful teamfight ultimate that serves as a massive deterrent to enemy **Engage**.
- **Jungle (Disengage or Follow-up)**:
    - **Nidalee**: Offers long-range poke with her spear and healing for sustain. Her mobility allows for safe positioning.
    - **Gragas**: His ultimate is a premier **Disengage** tool, knocking enemies away and preventing an all-in.
- **Mid Lane (Primary Poke Damage)**:
    - **Zoe / Xerath**: Artillery mages who can deal devastating damage from multiple screens away. They are the core of the strategy.
- **ADC (Long-Range and Safe)**:
    - **Ezreal / Caitlyn / Varus**: These marksmen can contribute to the poke from a safe distance and have tools to self-peel.
- **Support (Peel and More Poke)**:
    - **Lux / Karma**: Offer additional poke and crowd control to lock down targets for skillshots.
    - **Janna**: Provides best-in-class **Disengage** to completely nullify enemy dive attempts.

**In-Game Application:**
- **Early Game**: Focus on safe farming and harassing opponents to build small advantages. Your goal is not necessarily to kill, but to force recalls and gain priority in lane.
- **Mid Game (Your Power Spike!)**: Group around objectives like towers or Dragon. Use your range advantage to establish **Vision Control**. Methodically chip away at enemy health. Do not force fights; let your poke do the work. If an enemy is chunked to 50% health, they can't contest the objective.
- **Teamfighting**: Your teamfight is the siege beforehand. If a 5v5 erupts, your goal is to kite backward, using your disengage tools to stay safe while your carries continue to deal damage from maximum range. Positioning is everything.
                `.trim()
            },
            {
                id: 'dive-composition',
                title: 'Executing the Perfect Dive',
                content: `
A **Dive** composition is an exercise in coordinated aggression. It's about identifying the enemy's most critical member and executing a flawless, multi-pronged attack to eliminate them from the fight instantly.

**Drafting a Dive Composition:**
Every member must have a clear role in the dive, whether it's initiating, following up, or providing a crucial piece of crowd control.

- **Top Lane (Initiator or Diver)**:
    - **Malphite / Kled**: "Press R" initiators who can start a fight from a distance with unstoppable engages.
    - **Irelia / Camille**: Highly mobile divers who can follow up on initiation and stick to a target.
- **Jungle (Primary Engage)**:
    - **Vi / Nocturne / Jarvan IV**: Champions with reliable, targeted ultimates that lock down a priority target.
- **Mid Lane (Follow-up Burst)**:
    - **Akali / Diana / Yone**: Mobile assassins or skirmishers who can follow the primary engage and provide the necessary burst damage to kill the target.
- **ADC (Self-Sufficient or Follow-up)**:
    - **Kai'Sa / Tristana / Samira**: Marksmen with mobility tools that allow them to follow the dive and clean up the fight.
- **Support (Secondary Engage / Lockdown)**:
    - **Leona / Nautilus / Rakan**: Provide layered crowd control, ensuring the target cannot escape once the dive begins.

**In-Game Application:**
- **Early Game**: Identify your win condition. Are you diving their immobile ADC? Or their scaling mid laner? Play towards ganking that lane to put them behind.
- **Mid Game**: This is where Dive comps shine. Use **Vision Control** (sweepers, control wards) to find flanks and catch enemies rotating. A successful dive requires catching the enemy off-guard.
- **Teamfighting**: Patience is key. Wait for the enemy to misstep. The initiator (e.g., Malphite) looks for a multi-man ultimate. The moment he goes in, the jungler (e.g., Vi) immediately follows up on the primary target, and the mid laner (e.g., Akali) dives in with them. The goal is a 5v4 before the enemy can even react.
                `.trim()
            },
            {
                id: 'split-push',
                title: 'The Art of the Split Push',
                content: `
**Split Push** is a macro-economic strategy. You are trading a direct 5v5 confrontation for guaranteed map-wide pressure, slowly strangling the enemy team by forcing them to defend multiple places at once.

**Drafting a Split Push Composition:**
This is a two-part draft: the **Solo Threat** and the **4-Man Stall Unit**.

1.  **The Solo Threat (The Splitter)**: This champion must be a dominant duelist.
    - **Key Attributes**: Strong 1v1 potential, good waveclear, and an escape mechanism.
    - **Examples**: Fiora (true damage, parry), Jax (scaling, dodge), Tryndamere (invulnerability), Camille (mobility, lockdown).

2.  **The 4-Man Stall Unit**: This group's only job is to not die.
    - **Key Attributes**: Excellent waveclear to hold off sieges, strong **Disengage** to prevent being wiped in a 4v5.
    - **Top/Jungle/Mid Examples**: Anivia (waveclear, wall), Ziggs (extreme waveclear), Gragas (disengage ultimate).
    - **Support/ADC Examples**: Sivir (waveclear, engage/disengage ultimate), Janna (best-in-class disengage), Ezreal (safe poke and mobility).

**In-Game Application:**
- **Setup**: The split-pusher goes to a side lane (usually top or bottom) opposite a major objective (like Baron or Dragon). The 4-man group hovers near that objective.
- **The Dilemma**: You present the enemy with a choice:
    1.  **Send 1 to stop the splitter**: Your duelist likely wins the 1v1 and continues pushing.
    2.  **Send 2+ to stop the splitter**: Your 4-man group now has a numbers advantage (4v3) and can force the major objective.
    3.  **Ignore the splitter and force a 5v4**: Your 4-man group uses its disengage tools to kite and stall for as long as possible while your splitter takes multiple towers and inhibitors.
- **Execution**: This strategy lives and dies on **Vision Control**. The splitter needs vision to see ganks coming, and the 4-man group needs vision to avoid being flanked.
                `.trim()
            },
            {
                id: 'engage-disengage',
                title: 'Engage and Disengage: Controlling the Fight',
                content: `
Every teamfight has a beginning and an end. Mastering **Engage** and **Disengage** is about ensuring those moments happen on your terms, not the enemy's.

**Engage: Starting the Fight**
Engage is about creating an unfair fight. It's not just running at the enemy; it's about forcing a confrontation when you have a distinct advantage.

- **Hard Engage**: These are forceful, often AoE abilities that lock enemies down and dictate the location of the fight. They are the primary tools for punishing positional mistakes.
    - **Examples**: Malphite's \`Unstoppable Force\`, Leona's \`Solar Flare\`, Sejuani's \`Glacial Prison\`.
    - **When to use**: When the enemy carry steps too far forward, when you have a numbers advantage, or when key enemy cooldowns (like Flash or Zhonya's) are down.

- **Soft Engage / "Pick"**: These abilities are designed to catch a single, isolated target, creating a 5v4 advantage before a full teamfight breaks out.
    - **Examples**: Ashe's \`Enchanted Crystal Arrow\`, Blitzcrank's \`Rocket Grab\`, Thresh's \`Death Sentence\`.
    - **When to use**: When enemies are rotating through the jungle without vision, or when a squishy target is isolated in a side lane.

**Disengage: Ending the Fight (or Preventing It)**
Disengage is the art of saying "no." It's the counter to aggressive Engage and Dive compositions, creating space and resetting a fight that would otherwise be lost.

- **Knockbacks**: The most effective form of disengage, physically moving enemies away from your team.
    - **Examples**: Janna's \`Monsoon\`, Gragas's \`Explosive Cask\`, Alistar's \`Headbutt\`.
- **Area Control**: Creating zones that make it difficult or impossible for the enemy to advance.
    - **Examples**: Anivia's \`Crystallize\` (wall), Taliyah's \`Weaver's Wall\`, Trundle's \`Pillar of Ice\`.
- **Peel**: This is single-target disengage, focused on protecting one key ally from a specific threat.
    - **Examples**: Lulu's \`Whimsy\` (polymorphing an assassin), Tahm Kench's \`Devour\` (eating an ally to save them).
                `.trim()
            },
            {
                id: 'protect-the-carry',
                title: 'Protect the Carry: The Late-Game Wager',
                content: `
The **Protect the Carry** composition, often called "1-3-1" in terms of threat distribution (one hyper-carry as the win condition), is a high-stakes bet on the late game. You are intentionally sacrificing early-game pressure for an almost unbeatable 5v5 teamfight once your carry comes online.

**Drafting to Protect the Carry:**
The draft has two parts: selecting the "Precious Cargo" and then building the "Armored Convoy" around them.

1.  **The Hyper-Carry**: This champion must have immense, scaling, sustained damage.
    - **ADC Examples**: Jinx (AoE rockets), Vayne (true damage tank shredding), Kog'Maw (extreme range and mixed damage).
    - **Mid/Top Examples**: Kayle (transforms into a ranged AoE carry), Kassadin (unmatched late-game mobility and burst).

2.  **The Protectors**: Every other role is dedicated to **Peel** and utility.
    - **Top Lane (Warden/Tank)**: Shen (global ultimate to save the carry), Ornn (tankiness and engage).
    - **Jungle (Defensive Tank)**: Sejuani (CC to lock down threats), Ivern (shields and a personal bodyguard in Daisy).
    - **Mid Lane (Utility Mage)**: Lulu (the ultimate enabler with shields, polymorph, and bonus health), Orianna (shields and AoE CC for zone control).
    - **Support (Primary Peeler)**: Janna (disengage), Braum (blocks projectiles), Lulu (the best-in-class hyper-carry enabler).

**In-Game Application:**
- **Survive the Early Game**: This is the most critical and difficult phase. The enemy knows your win condition and will try to shut down your carry. Lanes may need to concede CS to avoid dying. The jungler should focus on counter-ganking to protect the carry's lane.
- **Mid Game**: The carry needs to farm safely. The team should avoid risky fights and only contest objectives they are certain they can win or trade for.
- **Late Game (The Payoff)**: Once the carry has 3-4 items, the game changes. The team now groups as a tight five-person unit, moving like a fortress around their carry. The goal is to force a 5v5 fight where the frontline absorbs damage and the supports use every ability to keep the carry alive. If the carry survives, they will win the fight.
                `.trim()
            },
        ]
    },
    {
        name: 'Advanced Concepts',
        lessons: [
            {
                id: 'wave-management',
                title: 'Advanced Wave Management',
                content: `
**Wave Management** is how you control the game's **Tempo** without ever fighting your opponent. By manipulating the minion wave, you create opportunities for yourself and deny them to the enemy.

**Freezing the Wave**
- **What it is**: Holding the minion equilibrium in one spot, typically just outside your own turret's range.
- **How to do it**: You need the enemy wave to have 3-4 more caster minions than your wave. After that, you only last-hit minions at the absolute last second. If your wave gets too big, you can "trim" it by attacking the minions more. You may also need to stand in front of your wave to "tank" the enemy minions to hold the freeze.
- **Why do it**:
    1.  **Safety**: It makes you extremely safe from ganks, as you are farming next to your tower.
    2.  **Denial**: It forces your opponent to overextend deep into the lane to farm, making them incredibly vulnerable to ganks. If you are stronger than them, you can "zone" them off the wave entirely, denying them gold and XP.

**Slow Pushing**
- **What it is**: Building up a massive wave of your own minions that slowly pushes towards the enemy.
- **How to do it**: Kill only the enemy's three caster minions. Your melee minions are tankier, so your wave will naturally start to build up and push forward slowly.
- **Why do it**:
    1.  **Objective Setup**: Start a slow push in a side lane (e.g., top) about 1.5 minutes before an objective like Dragon spawns. By the time the objective is live, a giant wave will be crashing into the enemy's top lane tower, forcing them to either send someone to defend (giving you a 5v4 at Dragon) or concede the tower.
    2.  **Roam Timers**: A slow push gives you time to recall or roam to another lane while the enemy is forced to deal with the incoming wave.

**Fast Pushing (Shoving)**
- **What it is**: Killing the entire enemy minion wave as quickly as possible.
- **How to do it**: Use all your abilities to clear the wave.
- **Why do it**:
    1.  **Force a Recall**: Shove the wave under the enemy tower to give yourself a safe window to recall and buy items without missing CS.
    2.  **Tower Damage**: Crash the wave to get damage onto the enemy turret.
    3.  **Deny CS**: When the enemy is not in lane, shoving the wave into their tower means the tower will kill your minions, denying them gold and XP.
                `.trim()
            },
            {
                id: 'power-spikes',
                title: 'Understanding & Abusing Power Spikes',
                content: `
A **Power Spike** is a non-linear jump in your champion's effectiveness. It's a window of opportunity where you are significantly stronger than your opponent. Winning is about recognizing your spikes and your opponent's, then forcing fights during yours and avoiding them during theirs.

**Key Power Spikes to Track:**

- **Level Spikes**:
    - **Level 2**: Often the first all-in opportunity in a lane. Champions like Leona or Riven gain immense kill pressure.
    - **Level 3**: Most champions have their full set of basic abilities, enabling their core trading combos.
    - **Level 6 (The Ultimate Spike)**: This is the most important spike in the early game. Champions like Malphite or Annie go from being passive laners to massive threats. Always be aware of who will hit level 6 first.
    - **Levels 11 & 16**: When ultimates are ranked up, their power increases dramatically. Kassadin's level 16 is legendary for transforming him into an unstoppable force.

- **Item Component Spikes**:
    - **Serrated Dirk**: A huge damage spike for AD assassins like Zed or Talon, enabling one-shot potential.
    - **Sheen**: A significant trading power increase for champions like Camille, Fiora, or Ezreal.
    - **Lost Chapter**: Solves mana issues for mages and allows them to constantly pressure the lane.

- **First Item Completion**:
    - This is often the point where a champion "comes online."
    - **Trinity Force on Irelia**: She becomes a dominant duelist.
    - **Luden's Companion on Lux**: She gains the ability to clear waves instantly and significant burst.
    - **Blade of the Ruined King on Vayne**: She can now effectively duel and shred tankier targets.

**How to Apply This Knowledge:**
- **Press TAB constantly**: Check your opponent's items and level. Did they just recall and buy a B.F. Sword while you only have a Pickaxe? Avoid fighting. Did you just hit Level 6 while they are still Level 5? This is your window to all-in.
- **Force Objectives on a Team Spike**: Did your ADC and Mid laner just complete their first items? This is the perfect time to group and force a fight at Dragon, as your team's collective power is likely higher than the enemy's.
                `.trim()
            },
            {
                id: 'vision-objectives',
                title: 'Vision & Objective Control: Winning the Information War',
                content: `
Map objectives (Towers, Dragons, Baron) are how you translate small leads into a victory, and **Vision Control** is the key that unlocks them. The team that sees more of the map makes better decisions.

**The Philosophy of Vision**
Vision is not just about placing wards; it's about controlling information.

- **Gaining Information (Warding)**:
    - **Defensive Warding**: When behind, place wards at the entrances to your own jungle. This helps you track enemy invades and prevents you from getting caught out.
    - **Offensive (Deep) Warding**: When ahead, place wards deep in the enemy jungle. This allows you to track their jungler, anticipate their movements, and set up ambushes or counter-ganks.
    - **Objective Warding**: Around 1 minute before an objective spawns, both teams should fight for vision control around the pit. This involves clearing enemy wards and placing your own.

- **Denying Information (Clearing Wards)**:
    - **Control Wards**: These pink wards not only provide vision but also disable and reveal nearby enemy wards. They are essential for securing objectives.
    - **Oracle Lens (Sweeper)**: This trinket allows you to clear out multiple enemy wards in an area. Junglers and supports should switch to this after their first few recalls.
    - Forcing a "face-check" into an unwarded bush is a powerful way to create a pick.

**Objective Control: The Payoff**
Once you have vision control, you can safely take objectives.

- **Dragon Setup**:
    1.  Push the mid and bot lane waves. This gives you **Tempo** and forces the enemy to either miss CS or be late to the fight.
    2.  Use Oracle Lens and Control Wards to clear all enemy vision around the Dragon pit.
    3.  Position your team between the objective and the enemy's most likely approach path. This forces them to run into you blind.

- **The Baron Power Play**:
    - After securing Baron Nashor, do not run around aimlessly. Your team is now incredibly powerful.
    - **Group up and push a single lane**. The empowered minions are a siege engine. Force the enemy to defend, and use your Baron-buffed stats to dive them under their tower or take the inhibitor for free.
    - Don't die! The Baron buff is wasted if you give the enemy shutdown gold. Recall, heal, and group up to press your advantage.
                `.trim()
            }
        ]
    }
];
