import type { Page } from '../types';

export interface HelpTip {
  title: string;
  content: string;
  icon?: string;
}

export type HelpContent = Record<Page, HelpTip[]>;

/**
 * Page-specific help content
 */
export const helpContent: HelpContent = {
  Home: [
    {
      title: 'Getting Started',
      content: 'Start by creating your first draft strategy. Click "Start Your First Draft" to begin.',
    },
    {
      title: 'Smart Dashboard',
      content: 'Your dashboard shows recent activity, progress, and personalized recommendations.',
    },
    {
      title: 'Quick Actions',
      content: 'Use the Quick Actions menu in the header for shortcuts to common tasks.',
    },
  ],
  'Strategy Forge': [
    {
      title: 'Building Your Draft',
      content: 'Click on empty slots to select champions, or drag champions from the grid directly onto slots.',
    },
    {
      title: 'Undo/Redo',
      content: 'Use Ctrl+Z to undo and Ctrl+Shift+Z to redo any changes to your draft.',
    },
    {
      title: 'AI Analysis',
      content: 'Complete both teams (5 champions each) and click "Analyze" to get AI-powered feedback.',
    },
    {
      title: 'Champion Selection',
      content:
        'Use Quick Pick mode for meta champions, or use filters to find specific champions. Star champions to add them to favorites.',
    },
  ],
  'Live Co-Pilot': [
    {
      title: 'Real-Time Analysis',
      content: 'Input picks and bans as they happen in your draft to get real-time AI guidance.',
    },
    {
      title: 'Turn Indicator',
      content: 'The highlighted slot shows the current turn in the draft sequence.',
    },
  ],
  'Draft Arena': [
    {
      title: 'Practice Mode',
      content: 'Practice against AI opponents with different personas to improve your drafting skills.',
    },
    {
      title: 'Bot Personas',
      content: 'Each bot has a unique drafting style - experiment to learn different strategies.',
    },
  ],
  Archives: [
    {
      title: 'Saved Drafts',
      content: 'View and analyze all your saved draft strategies. Click on any draft to see details.',
    },
    {
      title: 'Comparison',
      content: "Compare multiple drafts side-by-side to understand what works and what doesn't.",
    },
  ],
  Academy: [
    {
      title: 'Learning Path',
      content: 'Follow structured lessons to learn drafting fundamentals and advanced strategies.',
    },
    {
      title: 'Interactive Quizzes',
      content: 'Test your knowledge with interactive quizzes at the end of each lesson.',
    },
  ],
  Armory: [
    {
      title: 'Champion Database',
      content: 'Browse all champions, view detailed stats, and load champions directly into your draft.',
    },
    {
      title: 'Meta Intelligence',
      content: 'Check tier lists and patch notes to stay updated on the current meta.',
    },
  ],
  'Daily Challenge': [
    {
      title: 'Daily Practice',
      content: 'Complete daily challenges to earn rewards and improve your drafting skills.',
    },
  ],
  'Draft Scenarios': [
    {
      title: 'Scenario-Based Training',
      content: 'Practice specific draft scenarios to prepare for common situations.',
    },
  ],
  Oracle: [
    {
      title: 'Meta Intelligence',
      content: 'Get insights into the current meta, tier lists, and patch notes.',
    },
  ],
  Profile: [
    {
      title: 'Your Progress',
      content: 'Track your level, experience points, and achievements. Complete missions to earn rewards.',
    },
  ],
};

/**
 * Get help content for a specific page
 */
export const getHelpContent = (page: Page): HelpTip[] => {
  return helpContent[page] || [];
};
