// Based on academic research on the esports market and business models.

export const ESPORTS_ECOSYSTEM = {
  DESCRIPTION: "The interconnected network of actors and relationships within the competitive gaming industry. This includes developers, publishers, organizations (teams), players, leagues, sponsors, and fans, all contributing to a complex economic and social system.",
  ACTORS: {
    DEVELOPERS_PUBLISHERS: "The companies that create and distribute the games (e.g., Riot Games for League of Legends). They often control the primary competitive circuit and intellectual property.",
    ORGANIZATIONS: "Professional teams (e.g., Cloud9, Fnatic) that employ players (proplayers) to compete in various games. They function like traditional sports clubs, with revenue from sponsorships, merchandise, and prize winnings.",
    PROPLAYERS: "Professional players who compete at the highest level. They are typically salaried employees of organizations.",
    FANS_SPECTATORS: "The audience that watches competitions, follows teams and players, and injects revenue into the ecosystem through viewership, merchandise purchases, and in-game content.",
    SPONSORS: "Brands, both endemic (gaming-related, like hardware manufacturers) and non-endemic (mainstream, like automotive or beverage companies), that provide funding in exchange for visibility.",
  },
};

export const REVENUE_MODELS = {
  FREE_TO_PLAY: {
    title: "Free-to-Play (F2P)",
    description: "A business model where the base game is available for free, aiming to attract a large player base. Revenue is generated through optional in-game purchases (microtransactions) that are typically cosmetic and do not provide a competitive advantage.",
  },
  MICROTRANSACTIONS: {
    title: "Microtransactions",
    description: "Small purchases made within the game for virtual goods, such as skins, emotes, or battle passes. This is the primary revenue driver for F2P games like League of Legends.",
  },
  SKINS: {
    title: "Skins",
    description: "Cosmetic items that change the appearance of a champion or weapon. They are a core part of player expression and a major source of revenue, without affecting gameplay balance.",
  },
  BATTLE_PASS: {
    title: "Battle Pass",
    description: "A time-limited content package that players can purchase. By playing the game and completing challenges, players unlock tiers of rewards. A portion of the revenue often contributes to the prize pool of major tournaments (crowdfunding).",
  },
};

export const COMPETITIVE_STRUCTURES = {
  CLOSED_CIRCUIT: {
    title: "Closed Circuit (Franchising)",
    description: "A league model where the developer/publisher sells permanent or long-term slots to a fixed number of organizations (franchisees). This provides stability for teams and sponsors but creates a high barrier to entry. Examples include the League of Legends Championship Series (LCS).",
  },
  OPEN_CIRCUIT: {
    title: "Open Circuit",
    description: "A model where various third-party tournament organizers can host events, and teams typically qualify through open qualifiers. This allows for more competition but can lead to less stability.",
  },
};

export const GLOSSARY = {
  LINE: "A specific team or roster of players within an esports organization for a single game.",
  ENDEMIC_BRANDS: "Brands from sectors directly related to gaming, such as computer hardware, peripherals, and gaming chairs.",
  NON_ENDEMIC_BRANDS: "Brands from outside the core gaming industry, such as automotive companies or financial services, that sponsor teams and events.",
};