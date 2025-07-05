import { KnowledgeConcept } from '../types';

export const KNOWLEDGE_BASE: KnowledgeConcept[] = [
    // --- DRAFTING FUNDAMENTALS (Pool for Rotation) ---
    {
        id: 'df-101',
        category: 'Drafting Fundamentals',
        title: 'Team Composition Archetypes',
        description: 'Go beyond individual picks and learn the major strategic frameworks of team compositions.',
        icon: 'brain',
        content: `A well-constructed team composition is a synergistic entity where the whole is greater than the sum of its parts. While individual champion strength is a factor, the true power of a draft lies in how those champions interact to form a cohesive strategic unit. Understanding the primary archetypes of team compositions is essential for both drafting a winning strategy and identifying how to dismantle an opponent's.

**Foundational Pillars: Damage Profiles, Frontline, and Crowd Control**
Before a composition can be classified into a specific archetype, it must first satisfy several foundational requirements:
- **Balanced Damage Profile:** A team's damage output must be diversified between physical damage (AD) and magic damage (AP). A composition that deals exclusively one type of damage is highly vulnerable, as the opposing team can itemize efficiently by stacking a single defensive statistic.
- **Functional Frontline:** A team requires champions capable of initiating fights, absorbing damage, and creating space for their vulnerable damage dealers. This role is typically filled by tanks or bruisers. A composition without a dedicated frontline—often referred to as a "five-squishy" comp—is extremely susceptible to enemy assassins and divers.
- **Crowd Control (CC) and Initiation:** Crowd control abilities are the tools that allow a team to dictate the flow of combat. "Engage" tools are used to initiate fights and lock down priority targets, while "disengage" or "peel" tools are used to protect carries from incoming threats.

**The Five Core Archetypes**
Once the foundational pillars are in place, a team composition typically crystallizes into one of several strategic archetypes.
\n- **Poke/Siege Compositions:** These compositions leverage superior range to inflict damage from a safe distance, slowly bleeding the enemy team of their health and resources. The goal is to make it impossible for the opponent to contest an objective or defend a turret without taking a fight at a significant health disadvantage. This strategy is particularly effective against teams that lack reliable engage tools but is inherently vulnerable to all-in, hard-engage strategies that can close the distance.
\n- **Dive/Engage Compositions:** Often referred to as "wombo-combo" comps, these teams are built for decisive, all-in teamfights. Their strategy revolves around using powerful, often AoE, initiation abilities to lock down multiple enemies and eliminate them with a coordinated burst of damage. They excel in confined spaces but are weak to compositions with strong disengage that can nullify their primary engage attempt.
\n- **Protect the Carry Compositions:** This is one of the most traditional and reliable strategies. The entire team's purpose is to enable a single hyper-scaling damage dealer (like Jinx or Kog'Maw) to survive and deal massive sustained damage in teamfights. The frontline tanks and bruisers focus on peeling for the carry, while enchanter supports provide shields and buffs. This composition is incredibly powerful in the late game but has a very weak early game, making it vulnerable to aggressive opponents.
\n- **Split Push Compositions:** This is a macro-oriented strategy that seeks to win the game by avoiding direct 5v5 confrontations. It relies on sending a strong 1v1 duelist to continuously push a side lane and threaten enemy structures. This forces the enemy team to make a difficult choice: either send multiple members to deal with the split pusher, creating a numbers advantage for the pusher's team elsewhere, or ignore the pusher and risk losing their base.
\n- **Pick Compositions:** Pick comps aim to dismantle the enemy team one by one. They leverage long-range crowd control, high burst damage, and superior vision control to catch isolated enemies out of position. By securing a "pick," the team creates a temporary 5v4 power play, which they can then use to secure objectives or force a favorable teamfight. They are most effective against teams that are poorly coordinated or lack vision control.`
    },
    {
        id: 'df-102',
        category: 'Drafting Fundamentals',
        title: 'Identifying Win Conditions',
        description: 'Learn to identify your team\'s primary path to victory and the enemy\'s path to defeating you.',
        icon: 'map',
        content: {
            intro: {
                title: 'Identifying Win Conditions',
                summary: 'The single most critical element of a successful draft is the establishment of a clear and coherent win condition. A win condition is the specific set of actions or circumstances that a team must create to secure victory. It is the strategic blueprint that guides every decision, from champion selection to in-game rotations and objective prioritization.'
            },
            powerCurves: {
                title: 'The Power Curve: Drafting for Dominance',
                description: 'Intricately linked to the win condition is the concept of the "power curve," which represents a team\'s relative strength at different stages of the game.',
                curves: [
                    {
                        id: 'early',
                        title: 'Early Game Comps',
                        champions: ['Draven', 'Lucian', 'Lee Sin', 'Renekton'],
                        text: 'These compositions aim to establish dominance within the first 15 minutes. They are built around "lane bullies" and aggressive junglers who can create early leads and snowball them into a swift victory. The primary risk is that if they fail to end the game quickly, they will be out-scaled.'
                    },
                    {
                        id: 'mid',
                        title: 'Mid Game Comps',
                        champions: ['Zed', 'Irelia', 'Corki', 'Rumble'],
                        text: 'These compositions typically hit their most significant power spikes around the two-to-three item mark, making them formidable in skirmishes for mid-game objectives like Dragons or Baron Nashor. Many assassins and fighters excel in this phase.'
                    },
                    {
                        id: 'late',
                        title: 'Late Game Comps',
                        champions: ['Kayle', 'Kassadin', 'Jinx', 'Vayne'],
                        text: 'Often called "scaling" compositions, these teams intentionally accept a weaker early game in exchange for overwhelming power in the later stages. They are built around hyper-carries who become nearly unstoppable once they complete their core item builds.'
                    }
                ]
            },
            caseStudy: {
                title: 'Case Study: Drafting for Survival',
                description: 'A team cannot simply draft for a late-game win condition without considering its ability to survive the journey there. The interplay between a team\'s win condition and its power curve reveals a deeper layer of strategic complexity.',
                teamA: { name: 'Aggressive Early-Game Team', champions: ['Draven', 'Lee Sin', 'Renekton'] },
                teamB: { name: 'Scaling Late-Game Team', champions: ['Kayle', 'Kassadin', 'Jinx'] },
                solution: {
                    champions: ['Janna', 'Sejuani', 'Lulu'],
                    text: 'The scaling team\'s draft is only viable if their remaining picks provide the necessary tools to weather the initial storm. A successful scaling composition must include champions with sufficient disengage, wave clear, or defensive utility to bridge the gap to their powerful late-game phase. Champions like Janna or Sejuani provide the "peel" and lockdown needed to survive.'
                }
            },
            miniChallenge: {
                question: 'Your team has picked Kassadin and Jinx. Which Support best helps you survive the early game?',
                options: [
                    { championName: 'Lulu', isCorrect: true },
                    { championName: 'Brand', isCorrect: false },
                    { championName: 'Pyke', isCorrect: false }
                ],
                feedback: {
                    correct: 'Correct! Lulu provides excellent defensive utility and peel, which is crucial for protecting hyper-carries like Kassadin and Jinx through their vulnerable early game.',
                    incorrect: 'Not quite. While that champion has their strengths, Lulu\'s shields, polymorph, and ultimate are the best tools among these choices to ensure your scaling carries survive the early game pressure.'
                }
            }
        }
    },
    {
        id: 'df-103',
        category: 'Drafting Fundamentals',
        title: 'Damage Profiles & Your Draft',
        description: 'Dive deep into why having a mix of damage types is critical for success.',
        icon: 'shield',
        content: `A team's damage profile refers to the balance between its sources of physical damage (AD) and magic damage (AP). This is a foundational pillar of any strong composition because it directly impacts the enemy's ability to build defensively.

**The Strategic Dilemma of Defense**
In League of Legends, defensive items are specialized. Armor reduces incoming physical damage, while Magic Resist reduces incoming magic damage. There are very few items that provide both in large quantities.
\n- **Exploiting a Skewed Profile:** If a team drafts a composition that is almost entirely physical damage (e.g., Zed mid, Nocturne jungle, an AD marksman), the enemy team can itemize very efficiently. Their tank can rush multiple high-value armor items like Frozen Heart and Thornmail without needing to spend any gold on Magic Resist. This makes the all-AD team's damage output significantly less effective as the game progresses.
\n- **The Power of Balance:** A balanced damage profile, featuring significant threats from both AD and AP champions, forces the enemy into a defensive dilemma. A tank cannot simply stack armor or magic resist; they must build a mix of both. This is less gold-efficient and means they will be less durable overall compared to being able to itemize against a single damage type.

**Drafting Implications**
- **First Three Picks (B1, R1, R2):** Pay close attention to the damage type of the first few champions picked on both teams. If your team has locked in two AD champions, it becomes increasingly important for the remaining picks (especially Mid and Support) to provide magic damage.
- **Counter-Picking a Tank:** If the enemy team drafts a tank known for stacking a specific resistance (e.g., Malphite, who excels against AD), picking a magic damage threat in that lane can completely neutralize the tank's effectiveness.`
    },
    {
        id: 'df-201',
        category: 'Drafting Fundamentals',
        title: 'Counter-Picking vs. Comfort Picking',
        description: 'Understand the critical trade-off between a good matchup and a champion you have mastered.',
        icon: 'brain',
        content: `One of the most common strategic pitfalls for players is the misunderstanding of "counter-picking." The belief that simply selecting a champion with a theoretical advantage will guarantee victory is a pervasive fallacy that often leads to defeat, especially in non-elite levels of play.

**The Counter-Pick Fallacy**
The logic is as follows: A player sees their opponent lock in Champion X. They quickly consult a website, which informs them that Champion Y is a strong counter. The player, who may have little to no experience on Champion Y, selects them, assuming the matchup advantage will carry them to an easy victory.
However, their opponent, who may be a "one-trick" with hundreds of games on Champion X, has played this theoretically "bad" matchup countless times. This experienced opponent knows the precise damage thresholds, cooldown timings, and trading patterns required to not only survive but to turn the lane in their favor. The inexperienced player on the "counter" champion inevitably makes mechanical or strategic errors, fails to press their theoretical advantage, and ultimately loses the lane to the far more practiced and knowledgeable opponent.

**The Verdict: Mastery Over Matchup**
For the vast majority of the player base, it is far more effective to develop a small, focused champion pool (typically 2-3 champions per role) and achieve a deep level of mastery on them. This allows a player to learn the intricacies of their champions' matchups from a position of strength and experience, which is a much more reliable path to climbing the ranks than attempting to counter-pick with unfamiliar champions.

**True Counter-Picking**
At the highest levels of counter-picking is a sophisticated skill. It goes beyond simply selecting a champion with a kit advantage. It involves a deeper strategic understanding, such as picking a champion specifically to deny an opponent's primary win condition (e.g., selecting a champion with high mobility and disengage to neutralize a snowballing assassin) or picking a champion who executes the same strategic game plan more effectively (e.g., picking a harder-scaling champion into another scaling champion to win the late game). This level of strategic drafting requires a broad, well-practiced champion pool and a profound understanding of the game's strategic dynamics.`
    },
    {
        id: 'df-202',
        category: 'Drafting Fundamentals',
        title: 'The Power of Flex Picks',
        description: 'Learn how to use multi-role champions to create draft advantages and confusion.',
        icon: 'lab',
        content: `A "flex pick" is a champion that can be played viably in multiple roles, such as Gragas (Top, Jungle, Support) or Sylas (Mid, Top, Jungle). The strategic value of these champions lies in their ability to create ambiguity and disrupt the enemy's drafting process.

**Manufacturing Advantage Through Ambiguity**
When a team uses an early pick on a flex champion, the opponent is left guessing about its final lane assignment. This uncertainty makes it incredibly difficult to select a direct lane counter. This ambiguity can be leveraged in several ways:
\n- **Concealing Intent:** It hides the team's full composition, allowing them to see more of the enemy's draft before committing their own champions to specific roles.
\n- **Enabling Favorable Matchups:** The team can wait for the enemy to lock in their laners and then "flex" the champion into the most advantageous matchup. For instance, if a team picks Pantheon early and the enemy responds with a Malzahar mid (a difficult matchup for Pantheon), they can flex Pantheon to the support role and pick a more favorable mid laner later in the draft.
\n- **Applying Psychological Pressure:** The uncertainty forces the opponent to draft for multiple possibilities, which can lead them to make safer, more generalized picks that do not excel in any single scenario, thereby diluting their overall strategy.

**The Downside of Flexibility**
The primary advantage of flex picks is the strategic flexibility and unpredictability they offer. However, the main drawback is that a "jack of all trades can fall before a master of one." A flex champion might be a solid choice for several roles but may not be the absolute best-in-slot champion for any single one when compared to a specialist. Their power is derived from versatility, which can become a liability if they fall behind or are unable to leverage their strategic advantage in the draft.`
    },
    {
        id: 'df-203',
        category: 'Drafting Fundamentals',
        title: 'The Blind Pick',
        description: 'Understand what makes a champion a safe and reliable choice early in the draft.',
        icon: 'shield',
        content: `A "blind pick" is a champion selected in the first three picks of a draft, before you have full information about the enemy team's composition. A good blind pick is crucial for not giving away an early advantage, as it is highly susceptible to being counter-picked.

**Qualities of a Good Blind Pick:**
\n- **Self-Sufficiency & Safety:** The champion does not rely heavily on specific teammates to function. They have tools for their own survival, such as defensive abilities, mobility, or crowd control to disengage from bad fights. This allows them to navigate difficult matchups without feeding.
\n- **Few Hard Counters:** The champion does not have many well-known counters that make the lane unplayable. While they may have unfavored matchups, they can still contribute to the game. Champions with polarizing, all-or-nothing kits are generally poor blind picks.
\n- **Utility and Team-Relevance:** Even if they fall behind in lane, they still provide value to the team through crowd control, waveclear, or other utility. A champion whose only contribution is damage becomes useless when behind. A champion with a game-changing teamfight ultimate is always useful.
\n- **Versatility:** They can fit into multiple types of team compositions. A good blind pick doesn't lock your team into a single strategy, keeping your options open as the draft progresses.

**Classic Examples:**
\n- **Top Lane:** Champions like Ornn, Gragas, and Renekton are often good blind picks. Ornn provides immense utility regardless of his lane outcome. Gragas has safety and disengage. Renekton is a lane bully with few truly unwinnable matchups.
\n- **Mid Lane:** Control mages like Orianna and Viktor are classic blind picks due to their safe waveclear and massive teamfight impact, allowing them to be useful even if they don't dominate their lane.`
    },

    // --- IN-GAME CONCEPTS (Pool for Rotation) ---
    {
        id: 'ig-101',
        category: 'In-Game Concepts',
        title: 'Advanced Wave Management',
        description: 'Go beyond just killing minions and learn to control the flow of the lane.',
        icon: 'map',
        content: `Beyond the mechanical skill of last-hitting, wave management is the preeminent strategic discipline of the laning phase. It is the art and science of manipulating the position and size of minion waves to achieve specific tactical and strategic goals. A player who understands wave management can create safety for themselves, deny resources to their opponent, set up ganks for their jungler, and create pressure across the entire map.
        \n\n**Minion Wave Mechanics: Equilibrium, Reinforcements, and Cannon Waves**
        \nTo manipulate the waves, one must first understand their inherent behavior. Minion waves are not random; they follow a strict set of rules.
        \n- **Composition and Spawn Cycle:** Minions spawn from the Nexus starting at 1:05 and emerge in waves every 30 seconds thereafter. A standard wave contains three melee minions and three caster minions. The rhythm of the laning phase is dictated by the "cannon wave." Every third wave until the 20-minute mark includes a durable siege minion, also known as a cannon minion.
        \n- **Lane Geometry and Arrival Times:** The mid lane is shorter than the top and bottom lanes. Consequently, minions reach the center of the mid lane at approximately 1:28, while they reach the side lanes' meeting point around 1:38. This ten-second difference has a profound impact on early-game timings.
        \n- **The Principle of Reinforcement and Wave Equilibrium:** The fundamental principle governing wave movement is reinforcement timing. When a minion wave is on one side of the river, that side's next wave of reinforcements will arrive sooner than the enemy's. This means that if two equal minion waves are fighting on your side of the map, your wave will be reinforced first, gain a numerical advantage, and naturally begin to "push" towards the enemy. Conversely, if the wave is on the enemy's side, it will naturally push back towards you. A wave is in a "reset" or neutral state only when it meets exactly in the center of the lane.
        \n\n**The Freeze: Creating a Zone of Safety and Denial**
        \nA freeze is a defensive technique used to lock the minion wave in a specific, advantageous position, typically just outside the attack range of one's own turret.
        \n- **Goal:** The primary goal of a freeze is to force the enemy laner to "overextend" far down the lane if they wish to farm, thereby denying them gold and experience while simultaneously making them extremely vulnerable to ganks from an allied jungler. It also creates a safe haven for the freezing player to farm without fear of being ganked themselves.
        \n- **Execution:** To establish a freeze, the enemy minion wave must have a surplus of minions. The standard rule is that you need approximately four more full-health enemy caster minions than you have in your own wave. Once this surplus is established, the player maintains the freeze by only last-hitting minions at the very last possible moment. It is crucial to avoid dealing any extraneous damage to the wave.
        \n- **Strategic Application:** Freezing is a versatile tool. It is used offensively when you are ahead in a duel to deny the weaker opponent any chance of farming safely. It is used defensively when you are behind to allow you to farm securely near your tower and catch up. Most importantly, it is the primary method for setting up a gank, as it creates a long, open lane for your jungler to run down an exposed enemy.
        \n\n**The Slow Push: Building an Unstoppable Force**
        \nA slow push is the opposite of a freeze; it is an offensive technique designed to build your own minion wave into a massive, threatening force.
        \n- **Goal:** The purpose of a slow push is to create immense pressure on an enemy turret at a future time, forcing an enemy to respond to it. This creates a window of opportunity for your team to make a play elsewhere on the map with a numbers advantage.
        \n- **Execution:** A slow push is initiated by creating a slight numerical advantage in your own minion wave. The most common method is to kill only the enemy's three caster minions, leaving the tankier melee minions alive. As your subsequent minion waves arrive and merge with the pushing wave, it will grow in size, becoming a formidable siege force by the time it reaches the enemy tower.
        \n- **Strategic Application:** The slow push is the fundamental setup for nearly every major macro play. Before roaming, recalling, or grouping for an objective, a player should first set up a slow push in a side lane to ensure the enemy team is forced to split their attention.
        \n\n**The Fast Push (Shove): Creating Tempo for Recalls and Rotations**
        \nA fast push, or shove, is the most straightforward wave management technique, focused on speed and immediacy.
        \n- **Goal:** To clear the enemy minion wave as quickly as possible to make your own wave crash into the enemy tower immediately. This creates a short-term "tempo" advantage—a window of time where you are free to act while your opponent is forced to deal with the minions at their tower.
        \n- **Execution:** Achieved by using all available auto-attacks and area-of-effect (AOE) abilities to kill the entire enemy wave as fast as possible.
        \n- **Strategic Application:** Used to create windows for immediate actions like recalling to base, punishing a roaming opponent, or enabling your own roams.`
    },
    {
        id: 'ig-102',
        category: 'In-Game Concepts',
        title: 'Trading Stance & Cooldowns',
        description: 'Learn when to be aggressive and when to be passive by tracking abilities.',
        icon: 'sword',
        content: `Trading is the direct interaction between champions, a constant and calculated exchange of resources with the goal of creating a health, mana, or cooldown advantage that can be leveraged into lane control and kill pressure. It is not mindless aggression but a nuanced discipline rooted in positioning, timing, and a deep understanding of matchup dynamics.
        \n\n**Trading Stance and Positional Advantage**
        \n- **Defining the Stance:** An aggressive trading stance involves positioning forward in the lane, often parallel to or ahead of your own minion wave. This posture allows you to threaten the opponent and contest their last-hits. A defensive stance involves positioning further back, using the distance to remain safe from harassment while focusing on securing CS. The choice of stance is dictated by numerous factors, including the champion matchup, current health and mana levels, ability cooldowns, and the perceived location of the enemy jungler.
        \n- **The Power of Positioning:** Advanced positional play involves manipulating space to your advantage. A common tactic is to position on the opposite side of the minion wave from your opponent, increasing the travel time and predictability of their skillshots.
        \n- **Minion Aggro: The Unseen Combatant:** A critical and often underestimated factor in early trades is minion aggression. When a champion targets an enemy champion with a basic attack or a targeted spell, all nearby enemy minions will immediately switch their focus and attack that champion. The cumulative damage from a full minion wave, especially in the first few levels, is substantial and can easily decide the outcome of an all-in fight.
        \n\n**Identifying Trading Windows: Cooldowns, Level Spikes, and Minion State**
        \nEffective trading is about striking when you are strong and your opponent is weak.
        \n- **Ability Cooldowns:** The most frequent and exploitable trading windows are created by ability cooldowns. When an opponent uses a key ability—particularly a primary damage spell, a form of crowd control, or an escape tool—they become temporarily weaker and more predictable.
        \n- **Level Spikes:** Gaining a level advantage is one of the most powerful trading windows. Reaching level 2, 3, or 6 before an opponent grants a significant, albeit temporary, power spike due to access to an additional ability or a game-changing ultimate.
        \n- **Opponent Actions and Minion State:** The act of last-hitting creates a micro-window for trading. When an opponent moves into a predictable position to secure a minion, their attention is divided, and they are momentarily locked in an animation. This is the ideal moment to land "free" harass.
        \n\n**Adapting to Matchups: The Melee vs. Ranged Paradigm**
        \n- **The Core Conflict:** This matchup is inherently asymmetrical. The ranged champion possesses a constant positional advantage. Their goal is to leverage this to consistently "poke" and harass the melee champion. The melee champion's goal is one of survival and timing. They must endure the early harassment and wait for a specific window to force an all-in fight.
        \n- **Melee Champion Strategy:** Prioritize health preservation. This often means conceding CS that cannot be safely acquired. Utilize lane bushes to break line of sight. Bait out the ranged champion's key defensive or disengage tool and then capitalize on that cooldown window to force a fight.
        \n- **Ranged Champion Strategy:** Be disciplined in aggression. Use auto-attacks to punish the melee champion every time they attempt to last-hit. Carefully manage the minion wave to prevent it from pushing too close to the melee champion's tower, which would make them safe. Conserve your primary escape or self-peel ability, using it only to counter the melee champion's all-in attempt.`
    },
    {
        id: 'ig-103',
        category: 'In-Game Concepts',
        title: 'The Art of the Last Hit: Mastering CSing',
        description: 'Master the core economic engine of the game by perfecting your Creep Score (CS) mechanics.',
        icon: 'briefcase',
        content: `The act of landing the killing blow on a minion, colloquially known as Creep Score (CS) or last-hitting, is the single most fundamental mechanical skill in the laning phase. While experience is gained passively by being near dying minions, gold is awarded only to the champion who delivers the final hit. As items are the primary driver of a champion's power, mastery of CSing is the bedrock of economic advantage.
        \n\n**The Mathematics of Minions: Gold and Experience Values**
        \nUnderstanding these values is crucial for appreciating the economic impact of every successful or missed last hit.
        \n- **Gold Distribution:** Melee minions grant 21 gold, caster minions grant 14 gold, and the valuable siege (or cannon) minions grant a scaling amount of gold that starts at 60 and increases to 90 as the game progresses. A perfect CS score in the first six waves (a total of 38 minions) represents a significant gold income.
        \n- **Experience Distribution:** Experience is shared among all nearby allied champions upon a minion's death. This creates an important strategic layer: even if a player is being zoned and cannot safely secure the gold from a last hit, it is imperative to remain within experience range (approximately 1400 units) to avoid falling behind in levels.
        \n- **Comparative Value:** The emphasis on CSing stems from its reliability compared to seeking kills. Securing around 15-17 CS provides the same amount of gold as a champion kill. A player who can consistently out-farm their opponent by 3-4 minions per wave is generating a kill's worth of gold advantage every four to five waves, all without the inherent risk of an all-in fight.
        \n\n**Structured Practice for Mastery**
        \nTo move from conscious calculation to muscle memory, structured practice is essential. An effective, multi-layered practice regimen can be employed in the game's Practice Tool to systematically build this skill.
        \n- **Level 1: The Baseline Challenge:** The initial goal is to achieve a near-perfect score of 36 out of 38 CS over the first six minion waves with no abilities. This benchmark is intentionally difficult as last-hitting is at its hardest in the early game when champion stats are at their lowest.
        \n- **Level 2: Positional Discipline:** After each last hit, the player practices moving back to a safe position out of the opponent's range, only moving forward again for the next last hit. This drill instills the habit of minimizing unnecessary exposure to harassment.
        \n- **Level 3: Wave Control Integration:** The player alternates between "freezing" (last-hitting at the absolute latest moment) and "fast pushing" (clearing the wave as quickly as possible). This integrates the mechanical act of CSing with the strategic act of wave management.
        \n- **Level 4: Advanced Drills:** Further levels of this practice method introduce compounding difficulties, such as adding an AI opponent or forbidding the use of abilities to secure CS.
        \n\n**Advanced CSing: Under Turret**
        \nAs the lane state shifts, players will inevitably face situations where they must last-hit under the fire of their own turret. This scenario has a specific, learnable rhythm.
        \n- **The Under-Tower Formula:**
        \n  - **Melee Minions:** Require two turret shots before they are low enough for a single auto-attack kill.
        \n  - **Caster Minions:** Require one auto-attack from the player, followed by one turret shot, and then a final auto-attack for the kill.
        \nThis formula is a baseline and must be adjusted based on the champion's damage at a given level.`
    },
    {
        id: 'ig-201',
        category: 'In-Game Concepts',
        title: 'Jungle Pathing & Tracking',
        description: 'Think like a jungler to predict their movements and avoid ganks.',
        icon: 'history',
        content: `In high-level play, the jungler's role transcends that of a simple ganker; they are the primary driver of tempo and the architect of the team's win condition. Understanding their movements is crucial for every laner.

**The Three Pillars of Jungle Pathing**
Every optimal jungle path is born from a pre-game analysis of three critical factors.
\n- **Champion Identity:** Is the enemy jungler a fast-clearing farmer like Karthus, who wants to reach level 6? Or an early-game duelist like Xin Zhao, who wants to invade and fight? This dictates their likely priorities.
\n- **Lane States and Win Conditions:** The jungler must assess the matchups in all three lanes. They will naturally path towards volatile lanes where they can snowball a lead, or towards lanes with reliable crowd control to set up easy ganks.
\n- **Enemy Jungle Awareness:** The most advanced pillar is predicting and countering the enemy jungler's plan. If the enemy jungler is a known early ganker, the correct play may be to "mirror" their path—clearing in the same direction on the opposite side of the map—to be in position for a counter-gank.

**How Laners Can Track the Jungler**
\n- **Leashing:** Pay attention to which enemy laners (Top or Bot) arrive late to lane at the start of the game. This almost always tells you which buff the jungler started at. If the enemy bot lane arrives late, their jungler started on the bottom side of the map.
\n- **Pathing Timers:** A standard "full clear" (all 6 camps) takes a jungler approximately 3 minutes and 15-30 seconds. Knowing where they started, you can predict with high accuracy when and where they will emerge on the map to gank. For example, a jungler who starts botside will typically be looking to gank top or mid lane around 3:15-3:30.
\n- **Vision:** A single ward placed at a key jungle entrance or at their Raptor camp can reveal their entire pathing sequence, giving your team invaluable information.

By using these clues, you can make an educated guess about where the jungler is and play more safely when they are likely on your side of the map.`
    },
    {
        id: 'ig-202',
        category: 'In-Game Concepts',
        title: 'Teamfight Positioning',
        description: 'Learn where you should be standing when a 5v5 fight breaks out.',
        icon: 'map',
        content: `A 5v5 teamfight can appear to be a chaotic flurry of abilities, but at its core, it is a structured engagement with clear roles and objectives. The team that better understands its own structure will emerge victorious.

**Teamfight Structures**
\n- **Front-to-Back:** This is the most standard teamfight formation. The team's frontline champions (tanks and bruisers) position at the front, engaging the enemy and absorbing damage. The team's backline champions (mages and ADCs) position safely behind them, dealing sustained damage. The strategic goal is to systematically eliminate the enemy frontline to gain access to their vulnerable carries.
\n- **Diving the Backline:** This is a high-risk, high-reward strategy employed by compositions rich in assassins and mobile fighters (divers). The goal is to bypass the enemy's frontline entirely and use high mobility and burst damage to quickly eliminate the highest-priority targets in the enemy backline.
\n- **Flanking:** This is a positional tactic rather than a full team structure. A champion, typically an assassin or a mobile mage, positions themselves at a side angle to the main teamfight. As the fight begins, they attack the enemy team from the side or rear, creating chaos and gaining direct access to the enemy backline.

**The Peel vs. Dive Dilemma**
For frontline champions, the most critical in-fight decision is whether to "peel" for their own carries or "dive" onto the enemy's carries.
\n- **Peeling:** This is the act of using one's body and crowd control (CC) abilities to protect allied damage dealers from enemy threats. A frontline champion should prioritize peeling if their team's carries are their primary win condition and are stronger or more critical to the teamfight than the enemy's carries.
\n- **Diving:** This is the act of using one's engage tools to attack the enemy backline. A frontline champion should prioritize diving if the enemy's carries pose a greater threat than their own, and if they possess the damage and lockdown to successfully eliminate them. It is also crucial to have a "dive buddy"—another champion who can follow up on the initial engage.

**Target Selection**
Target selection is a dynamic process of constant re-evaluation based on three key factors: Threat, Opportunity, and Proximity.
\n- **Threat:** At the start of a fight, the primary target should be the single greatest threat on the enemy team. This is often the most fed enemy champion.
\n- **Opportunity:** The priority list is fluid. A lower-priority target who makes a significant positional error or uses a key defensive ability (like Flash) can instantly become the correct target.
\n- **Proximity (The ADC's Rule):** For a backline damage dealer like an ADC, safety is paramount. The correct target is often simply the highest-priority enemy champion that they can attack *without compromising their own position*. It is always better to safely deal damage to the enemy tank than to die attempting to reach the enemy ADC.`
    },
     {
        id: 'ig-203',
        category: 'In-Game Concepts',
        title: 'The Strategic Recall: Timing the Perfect Reset',
        description: 'Learn how to turn recalling into an offensive weapon that generates tempo and gold advantages.',
        icon: 'home',
        content: `The act of recalling—teleporting back to the base—is one of the most deceptively complex and strategically vital actions in the laning phase. Far from being a simple reset button for low health, a well-timed recall is a proactive maneuver to convert an abstract advantage (accumulated gold) into a concrete one (items and combat stats). Mastering the art of the recall is about understanding its function as a strategic investment in tempo and power.
        \n\n**Principles of Optimal Recall Timers**
        \nThe effectiveness of a recall is measured by what is gained versus what is lost. The goal is to maximize the gain while minimizing the loss.
        \n- **The Golden Rule: Crash the Wave First:** The single most important principle for a successful recall is to first manipulate the minion wave. Before initiating the 8-second recall channel, the player should fast push their minion wave so that it "crashes" into the enemy's turret. This forces the enemy laner to spend time clearing the minions under their turret, creating the largest possible window of time for you to recall, purchase items, and return to lane.
        \n- **Recalling on Gold Thresholds:** Recalls should be purposeful and planned around item purchases. It is inefficient to recall with an arbitrary amount of gold. For example, a mid lane assassin might aim to recall once they have enough gold for a Serrated Dirk.
        \n- **Syncing Recalls with Objectives:** Advanced recall timing involves synchronizing with major map objectives. Recalling approximately 45-60 seconds before a Dragon or Rift Herald spawns allows a player to return to the map with full health, full mana, and newly purchased items.
        \n\n**The "Cheater Recall": An Early Game Gambit**
        \nThe "Cheater Recall" is a specific, high-level technique designed to generate an item and resource advantage with virtually zero cost in lost minions.
        \n- **Execution:** The cheater recall is meticulously timed around the first three minion waves.
        \n  1. **Waves 1 and 2:** The player must establish lane priority by pushing the first two waves more aggressively than their opponent.
        \n  2. **Wave 3 (The Cannon Wave):** The player must use all their resources to "hard shove" this wave, clearing the enemy minions as quickly as possible to ensure their own wave, led by the cannon, crashes fully under the enemy tower.
        \n  3. **The Recall:** The moment the wave crashes, the player immediately recalls. The enemy tower will focus the durable cannon minion, extending the time it takes to clear the wave and maximizing the player's recall window.
        \n  4. **The Return:** After a rapid purchase in the shop, the player sprints back to lane. If executed correctly, they will arrive just as the fourth wave is meeting in the middle of the lane, having missed no CS. They now possess full health, full mana, and a tangible item advantage.`
    },
    {
        id: 'ig-204',
        category: 'In-Game Concepts',
        title: 'Vision as a Weapon: Information Warfare',
        description: 'Learn how to control the flow of information on the map through effective warding and vision denial.',
        icon: 'map',
        content: `In League of Legends, information is power, and vision is the currency of information. Vision control is not merely a defensive measure to avoid ganks; it is a proactive and aggressive tool used to exert pressure, create opportunities, and dominate the map. A team that controls vision controls the flow of the game.
        \n\n**The Warding Toolkit**
        \nPlayers have access to a variety of tools to engage in this information warfare.
        \n- **Stealth Ward (Yellow Trinket):** The standard warding tool. It places a ward that is invisible to the enemy team unless detected by a Control Ward or an Oracle Lens. Best used for general-purpose vision in high-traffic areas like river bushes and jungle entrances.
        \n- **Control Ward (Pink Ward):** A purchasable item (costing 75 gold) that is visible to the enemy team. Its unique power lies in its ability to reveal and disable all enemy Stealth Wards and invisible traps within its radius. Control Wards are the primary tool for vision denial.
        \n- **Oracle Lens (Red Trinket/Sweeper):** This trinket allows a champion to sweep an area around them, revealing and disabling any enemy wards for a short duration. It is the essential tool for clearing enemy vision in preparation for a gank, a roam, or an objective attempt.
        \n- **Farsight Alteration (Blue Trinket):** Unlocked at level 9, this trinket allows a player to place a visible, long-range ward from a great distance. It is primarily a safety tool.
        \n\n**Laning Phase Warding Schematics**
        \nEffective warding is contextual and must adapt to the state of the lane.
        \n- **Top Lane:** Due to its length, the top lane is highly susceptible to ganks. The most critical ward placements are in the river bush and the tri-bush. These wards should be placed around the 2:40 to 3:00 minute mark to provide warning against the first wave of common jungle ganks.
        \n- **Mid Lane:** As the central nexus of the map, the mid lane is the most vulnerable to ganks from multiple angles. The standard defensive strategy is to place a ward in one of the river's side bushes and then position oneself closer to that warded side of the lane, creating a "safe side".
        \n- **Bot Lane:** Vision control in the bot lane is a primary responsibility of the Support player. The key locations mirror the top lane: the river bush and the tri-bush are paramount for safety. Because the bot lane is also adjacent to the Dragon pit, establishing vision priority in the river is crucial.
        \n\n**Vision Denial and Economic Warfare**
        \nThe vision game is not just about placing wards; it is equally about removing the enemy's. Using an Oracle Lens to clear a path for a roam or using a Control Ward to establish a dark zone around an objective creates uncertainty and forces the enemy team to play more reactively and cautiously. This act of vision denial is also a form of economic warfare. Every Control Ward an enemy is forced to destroy is 75 gold they must spend again to regain that vision.`
    },
    {
        id: 'ig-301',
        category: 'In-Game Concepts',
        title: 'Objective Bounties',
        description: 'Understand how comeback mechanics can swing the momentum of a game.',
        icon: 'warning',
        content: `Objective Bounties are a comeback mechanic designed to help teams that are significantly behind in resources. They are a critical system to understand for both pressing an advantage and clawing your way back from a deficit.

**How Objective Bounties Work**
- **Trigger Condition:** Bounties activate automatically when a team falls behind by a significant margin. The game calculates the difference in gold from champion kills, gold from minions/monsters, and gold from destroyed turrets. XP difference is also a factor.
- **Visual Indicator:** When active, bounties will appear on the minimap, highlighting the enemy team's outer and inner turrets. Small gold icons will appear next to the objectives.
- **Cashing In:** If the losing team destroys a turret with an active bounty, every member of their team receives a bonus amount of global gold. This bonus gold does NOT come from the enemy team's pockets; it is generated by the game system. The amount of gold depends on how far behind the team is.

**Strategic Implications**
\n- **For the Losing Team:** Objective Bounties are your lifeline. Your team's strategic priority must shift from forcing teamfights (which you are likely to lose) to safely securing these bounty-laden objectives. This becomes your primary win condition. Trading one of your own turrets for an enemy turret with a bounty can be a net positive gold swing, helping you get back into the game.
\n- **For the Winning Team:** The activation of Objective Bounties is a warning sign that you are not pressing your advantage effectively enough. It punishes passive play from the winning team. You must become more vigilant in defending your structures. Giving up a "free" outer turret that you might have ignored before is now much more costly. You need to use your lead to control the map and prevent the enemy from cashing in on your bounties and closing the gold gap.`
    },
    
    // --- ESPORTS ECOSYSTEM (Static) ---
    {
        id: 'biz-101',
        category: 'The Esports Ecosystem',
        title: 'The Structure of Professional Play',
        description: 'Understand the key players and structures that make up the professional gaming industry.',
        icon: 'briefcase',
        content: `The world of professional esports is a complex and interconnected network of actors and relationships, much like traditional sports. Understanding this structure provides context for the game at its highest level.
        \n\n**Key Actors in the Ecosystem**
        \n- **Developers & Publishers:** These are the companies that create and distribute the games (e.g., Riot Games for League of Legends). They hold the intellectual property and often control the primary competitive circuits.
        \n- **Organizations (Teams):** These are the professional teams (e.g., Cloud9, Fnatic, T1) that employ players and support staff. They function like sports clubs, with revenue from sponsorships, merchandise sales, and prize winnings.
        \n- **Pro-players:** The professional athletes who compete at the highest level. They are typically salaried employees of organizations and often supplement their income with streaming and personal sponsorships.
        \n- **Sponsors:** These are the brands that provide the financial fuel for the ecosystem. They can be **endemic** (gaming-related, like computer hardware manufacturers) or **non-endemic** (mainstream companies, like automotive or financial services brands) that sponsor teams and events to reach the coveted esports demographic.
        \n- **Fans & Spectators:** The audience that watches competitions, follows teams and players, and injects revenue into the ecosystem through viewership, merchandise purchases, and in-game content linked to esports events.
        \n\n**Competitive Structures**
        \n- **Closed Circuit (Franchising):** This is the dominant model in top-tier League of Legends. The publisher sells permanent or long-term slots in a league (like the LCS in North America or the LEC in Europe) to a fixed number of organizations. This provides stability for teams and sponsors but creates a high barrier to entry and removes the traditional system of promotion and relegation.
        \n- **Open Circuit:** This model allows various third-party tournament organizers to host events, and teams typically qualify through open qualifiers. While this allows for more competition and "Cinderella stories," it can lead to less financial stability for teams and organizers.`
    },
    {
        id: 'biz-102',
        category: 'The Esports Ecosystem',
        title: 'The Business of Free-to-Play',
        description: 'Learn how games like League of Legends generate billions in revenue without a purchase price.',
        icon: 'briefcase',
        content: `League of Legends operates on a "Free-to-Play" (F2P) business model, which has become a dominant force in the modern gaming industry. The core philosophy is to remove the initial barrier to entry (the purchase price) to attract the largest possible player base. Revenue is then generated through optional in-game purchases, known as microtransactions.
        \n\n**The Art of Ethical Microtransactions**
        \nFor an F2P model to be successful and respected by its community, its microtransactions must adhere to a crucial principle: they should not provide a competitive advantage. This is often referred to as avoiding a "pay-to-win" system. In League of Legends, the vast majority of purchases are for cosmetic items that change the appearance of a champion or other in-game elements but have no impact on gameplay stats.
        \n\n**Primary Revenue Drivers**
        \n- **Skins:** These are cosmetic alterations that change a champion's appearance, animations, and sound effects. They are the primary driver of revenue and a core part of player expression and identity within the game.
        \n- **Battle Pass (Event Pass):** This is a time-limited content package that players can purchase. By playing the game and completing missions, players unlock tiers of rewards, which typically include skins, currency, and other cosmetic items. A portion of the revenue from major event passes often contributes directly to the prize pools of international tournaments like the World Championship, a form of crowdfunding that engages the player base in the competitive scene.
        \n- **Esports Content:** During major tournaments, players can purchase in-game items like team icons and emotes, with a portion of the revenue being shared directly with the professional teams. This creates a direct financial link between the fans and the teams they support.`
    },
];