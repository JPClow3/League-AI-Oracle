import { ChampionVaultEntry } from '../types';

export const CHAMPION_VAULT_DATA: Record<string, ChampionVaultEntry> = {
  Aatrox: {
    championId: 'Aatrox',
    overview: "Aatrox is a demonic warrior who seeks world-ending catharsis. He is a lane-dominant juggernaut who excels in extended trades and teamfights, healing for massive amounts with his ultimate and well-aimed Qs.",
    playstyle: "Aatrox's gameplay revolves around landing the 'sweet spots' of his three-part Q, The Darkin Blade. Each hit knocks up enemies and deals significant damage. His gameplay is a dance of positioning and timing, weaving in auto-attacks and his E, Umbral Dash, to reposition for the next blow. In teamfights, he is a primary frontline threat, using World Ender to become a nigh-unkillable drain tank.",
    strengths: ["Strong Laning Phase", "Excellent Teamfighting", "High Sustain", "Area of Effect Crowd Control"],
    weaknesses: ["Vulnerable to Grievous Wounds", "High Skill Ceiling", "Relies on Skillshots", "Can be kited"],
    abilities: [
      { key: 'P', name: "Deathbringer Stance", proTip: "Weave auto-attacks between Q casts. The empowered attack from your passive is a significant source of damage and healing, especially on champions." },
      { key: 'Q', name: "The Darkin Blade", proTip: "Use your E, Umbral Dash, to reposition during your Q animation. This is the core mechanic for landing sweet spots and maximizing your damage and CC." },
      { key: 'W', name: "Infernal Chains", proTip: "Use Infernal Chains immediately after landing a Q sweet spot. The knockup guarantees the chain will land, and the slow helps set up your next Q." },
      { key: 'E', name: "Umbral Dash", proTip: "This is not just a gap closer, but your primary defensive tool. Save it to dodge critical skillshots or to dash over walls to escape." },
      { key: 'R', name: "World Ender", proTip: "Do not use World Ender as an initiator unless necessary. It's best used mid-fight when you've already taken some damage, as the immediate burst of healing and movement speed can turn the tide." },
    ],
    build: {
        coreItems: [
            { name: "Profane Hydra", description: "Provides AoE damage for waveclear and teamfights, along with a powerful active that synergizes with his all-in pattern." },
            { name: "Sterak's Gage", description: "A crucial survivability item. The shield it provides when low on health is essential for surviving burst damage and continuing to heal in teamfights." },
            { name: "Sundered Sky", description: "Gives Aatrox a guaranteed critical strike and heal on his first attack against a champion, amplifying his trading and all-in potential." },
        ],
        explanation: "Aatrox's build focuses on a blend of Attack Damage, Health, and Ability Haste. This combination allows him to be both a significant damage threat and a durable frontline drain tank."
    },
    matchups: {
        strongAgainst: [
            { championName: "Irelia", tip: "Aatrox can interrupt Irelia's Q dashes with his own Q knockups, preventing her from resetting and controlling the fight." },
            { championName: "Yasuo", tip: "Your knockups disrupt Yasuo's flow, and he is squishy enough to be bursted down if you land your full combo." },
            { championName: "Garen", tip: "You can kite Garen with your Qs and E, preventing him from reaching you to use his silence and ultimate." }
        ],
        weakAgainst: [
            { championName: "Fiora", tip: "Fiora's Riposte can parry your critical third Q, stunning you and turning the fight. Her high mobility and true damage make her a nightmare to deal with." },
            { championName: "Kled", tip: "Kled's built-in Grievous Wounds on his Q heavily reduces your healing, and his high aggression can overwhelm you early." },
            { championName: "Renekton", tip: "Renekton's mobility and point-and-click stun can interrupt your Q combo and allow him to win short trades easily." }
        ]
    },
    synergies: {
        partners: [
            { championName: "Jarvan IV", reason: "Jarvan's Cataclysm ultimate traps enemies in a small area, creating a perfect setup for Aatrox to land his entire Q combo on multiple targets." },
            { championName: "Orianna", reason: "Orianna's Shockwave can pull enemies into Aatrox's Q sweet spots, and her speed-up helps him stick to targets." }
        ],
        idealComps: ["Teamfight", "Dive", "Front-to-Back"]
    }
  },
  Ahri: {
    championId: 'Ahri',
    overview: 'Ahri is a highly mobile burst mage who excels at picking off isolated targets. With a mix of crowd control, burst damage, and incredible safety from her ultimate, she is a versatile and reliable mid-laner.',
    playstyle: 'Ahri\'s core gameplay pattern is to poke with her Q, Orb of Deception, and look for an opportunity to land her E, Charm. A successful Charm allows her to unload her full combo for a devastating burst of damage. Her ultimate, Spirit Rush, provides multiple dashes, which can be used offensively to chase down a kill or defensively to escape danger, making her one of the safest mages in the game.',
    strengths: ['High Mobility', 'Strong Pick Potential', 'Safe Laning Phase', 'Waveclear'],
    weaknesses: ['Reliant on Skillshots', 'High Mana Costs Early', 'Vulnerable when Ultimate is Down', 'Falls off vs. Tanks'],
    abilities: [
        { key: 'P', name: 'Essence Theft', proTip: 'After killing 9 minions or monsters, Ahri\'s next Q will heal her. Use this to sustain in lane, especially after trading.' },
        { key: 'Q', name: 'Orb of Deception', proTip: 'Remember that the orb deals true damage on its return trip. Reposition after throwing it to maximize damage on your opponent.' },
        { key: 'W', name: 'Fox-Fire', proTip: 'Fox-Fire prioritizes champions hit by your Charm. Use it immediately after a successful Charm to guarantee the damage lands on your primary target.' },
        { key: 'E', name: 'Charm', proTip: 'Charm is your most important ability. Do not use it frivolously. Wait for the opponent to use their mobility spell or be locked in an animation before throwing it.' },
        { key: 'R', name: 'Spirit Rush', proTip: 'Each dash from your ultimate empowers your other abilities. Use a dash to get in range for a guaranteed Charm, or to reposition your Q for true damage.' }
    ],
    build: {
        coreItems: [
            { name: 'Luden\'s Companion', description: 'Provides a significant burst of damage that synergizes perfectly with her combo, as well as crucial mana and ability haste.' },
            { name: 'Shadowflame', description: 'Grants a large amount of AP and Magic Penetration, and its passive execute damage is excellent for finishing off targets after a full combo.' },
            { name: 'Zhonya\'s Hourglass', description: 'An essential defensive item. It allows Ahri to make aggressive plays with her ultimate and then use the stasis to wait for her cooldowns or for her team to follow up.' }
        ],
        explanation: 'Ahri\'s build prioritizes Ability Power and Magic Penetration to maximize her burst damage potential. A key defensive item like Zhonya\'s or Banshee\'s Veil is almost always necessary to allow her to use her mobility offensively without being instantly punished.'
    },
    matchups: {
        strongAgainst: [
            { championName: 'Twisted Fate', tip: 'You can dodge his Gold Card with your ultimate and have superior burst damage and waveclear.' },
            { championName: 'Lux', tip: 'Your mobility allows you to easily dodge her Light Binding and Final Spark. You can all-in her once her Q is on cooldown.' },
            { championName: 'Veigar', tip: 'You can use Spirit Rush to escape his Event Horizon cage and all-in him before he can scale.' }
        ],
        weakAgainst: [
            { championName: 'Yasuo', tip: 'His Wind Wall can block your entire kit (Q and E), and his mobility makes him difficult to hit with skillshots.' },
            { championName: 'Fizz', tip: 'Fizz can use his Playful / Trickster to dodge your Charm and ultimate, then retaliate with his own high-damage combo.' },
            { championName: 'Kassadin', tip: 'Pre-6, the lane is fine. Post-6, his Riftwalk and magic damage shield make it nearly impossible for you to kill him, and he will outscale you hard.' }
        ]
    },
    synergies: {
        partners: [
            { championName: 'Jarvan IV', reason: 'Jarvan IV\'s engage and lockdown provide a perfect setup for Ahri to land her Charm and full combo.' },
            { championName: 'Vi', reason: 'Vi\'s point-and-click ultimate guarantees a lockdown on a priority target, making it easy for Ahri to follow up.' }
        ],
        idealComps: ['Pick', 'Skirmish', 'Kite']
    }
  }
};
