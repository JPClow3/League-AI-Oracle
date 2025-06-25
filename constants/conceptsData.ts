
import { Concept } from '../types';
import {
    // TeamCompositionIcon, // Replaced by GuardianShieldIcon
    TrophyIcon,
    // DamageProfileIcon, // Replaced by MagicOrbIcon
    TargetIcon,
    GuardianShieldIcon, // New
    MagicOrbIcon,       // New
    HammerAnvilIcon     // New
} from '../components/icons/index';

// Note: The onClick handler for conceptsData will be assigned in HomeScreen.tsx
// based on the concept.id to call the correct navigation function.

export const initialConceptsData: Concept[] = [
  {
    id: 'team-compositions',
    title: 'Path of the Vanguard: Team Structures',
    description: 'Understand fundamental archetypes like Dive, Poke, Protect the Carry, and their interactions.',
    icon: GuardianShieldIcon,
  },
  {
    id: 'win-conditions',
    title: 'Path of the Tactician: Win Conditions',
    description: "Identify your team's clearest path to victory. Adapt your strategy accordingly before the game begins.",
    icon: TrophyIcon,
  },
  {
    id: 'damage-profiles',
    title: 'Path of the Mage: Damage & Control',
    description: 'Master the balance of Physical (AD) and Magical (AP) damage to build a versatile and threatening team composition.',
    icon: MagicOrbIcon,
  },
  {
    id: 'counter-picking',
    title: 'Path of the Duelist: Counter Strategies',
    description: "Learn the art of selecting champions that directly counter your opponents' picks and overall strategies.",
    icon: TargetIcon,
  },
  {
    id: 'itemization-basics',
    title: "The Armorer's Test: Itemization",
    description: 'Explore the fundamentals of item choices, build paths, and how items counter specific threats or amplify champion strengths.',
    icon: HammerAnvilIcon,
  }
];