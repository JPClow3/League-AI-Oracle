import React from 'react';
import type { Page } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import {
  FlaskConical,
  Signal,
  Swords,
  Shield,
  GraduationCap,
  FileText,
  Library,
  Sparkles,
  BrainCircuit,
} from 'lucide-react';

interface FeatureSectionProps {
  setCurrentPage: (page: Page) => void;
  navigateToArmory: (tab: 'champions' | 'intel') => void;
}

const FeatureCard = ({
  title,
  description,
  icon,
  actionText,
  onClick,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  actionText: string;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className="group bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] shadow-sm p-6 rounded-lg flex flex-col text-left hover:border-[hsl(var(--accent))] hover:shadow-lg hover:shadow-[hsl(var(--accent)_/_0.1)] transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] w-full h-full relative overflow-hidden"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--accent)_/_0)] to-[hsl(var(--accent)_/_0.1)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    <div className="relative flex-grow flex flex-col h-full">
      <div className="bg-[hsl(var(--accent)_/_0.1)] text-[hsl(var(--accent))] w-12 h-12 flex items-center justify-center mb-4 rounded-md border border-[hsl(var(--border))] group-hover:shadow-glow-accent transition-all duration-300">
        {icon}
      </div>
      <h3 className="font-display text-xl font-semibold text-[hsl(var(--text-primary))] mb-2 tracking-wide">{title}</h3>
      <p className="text-[hsl(var(--text-secondary))] text-sm flex-grow mb-4">{description}</p>
      <div className="mt-auto text-[hsl(var(--accent))] font-semibold text-sm flex items-center gap-2">
        {actionText}
        <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
      </div>
    </div>
  </button>
);

const ICONS = {
  DRAFT_LAB: <FlaskConical size={28} strokeWidth={1.5} />,
  LIVE_DRAFT: <Signal size={28} strokeWidth={1.5} />,
  ARENA: <Swords size={28} strokeWidth={1.5} />,
  ARMORY: <Shield size={28} strokeWidth={1.5} />,
  ACADEMY: <GraduationCap size={28} strokeWidth={1.5} />,
  INTEL: <FileText size={28} strokeWidth={1.5} />,
  PLAYBOOK: <Library size={28} strokeWidth={1.5} />,
  BUILDER: <Sparkles size={28} strokeWidth={1.5} />,
  SCENARIOS: <BrainCircuit size={28} strokeWidth={1.5} />,
};

export const FeatureSection = ({ setCurrentPage, navigateToArmory }: FeatureSectionProps) => {
  const { t } = useTranslation();

  const coreTools = [
    {
      title: t('home_card_forge_title'),
      description: t('home_card_forge_desc'),
      icon: ICONS.DRAFT_LAB,
      actionText: t('home_card_forge_action'),
      onClick: () => setCurrentPage('Strategy Forge'),
    },
    {
      title: 'Team Builder Assistant',
      description: 'Let the AI guide you step-by-step in creating a powerful composition around a core champion or strategy.',
      icon: ICONS.BUILDER,
      actionText: 'Start Building',
      onClick: () => setCurrentPage('Strategy Forge'),
    },
    {
      title: t('home_card_arena_title'),
      description: t('home_card_arena_desc'),
      icon: ICONS.ARENA,
      actionText: t('home_card_arena_action'),
      onClick: () => setCurrentPage('Draft Arena'),
    },
  ];

  const learning = [
    {
      title: t('home_card_dossiers_title'),
      description: t('home_card_dossiers_desc'),
      icon: ICONS.ARMORY,
      actionText: t('home_card_dossiers_action'),
      onClick: () => navigateToArmory('champions'),
    },
    {
      title: 'Draft Scenarios',
      description: 'Test your knowledge in specific, tricky draft situations and get instant AI feedback on your choices.',
      icon: ICONS.SCENARIOS,
      actionText: 'Train Your Skills',
      onClick: () => setCurrentPage('Draft Scenarios'),
    },
  ];

  const resources = [
    {
      title: t('home_card_archives_title'),
      description: t('home_card_archives_desc'),
      icon: ICONS.PLAYBOOK,
      actionText: t('home_card_archives_action'),
      onClick: () => setCurrentPage('Archives'),
    },
    {
      title: t('home_card_intel_title'),
      description: t('home_card_intel_desc'),
      icon: ICONS.INTEL,
      actionText: t('home_card_intel_action'),
      onClick: () => navigateToArmory('intel'),
    },
    {
      title: t('home_card_oracle_title'),
      description: t('home_card_oracle_desc'),
      icon: ICONS.ACADEMY,
      actionText: t('home_card_oracle_action'),
      onClick: () => setCurrentPage('Oracle'),
    },
  ];

  return (
    <div className="space-y-12">
      {/* Core Tools */}
      <section>
        <h2 className="font-display text-2xl md:text-3xl font-semibold text-[hsl(var(--text-primary))] mb-6 tracking-wide">
          Core Tools
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coreTools.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </section>

      {/* Learning */}
      <section>
        <h2 className="font-display text-2xl md:text-3xl font-semibold text-[hsl(var(--text-primary))] mb-6 tracking-wide">
          Learning
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {learning.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </section>

      {/* Resources */}
      <section>
        <h2 className="font-display text-2xl md:text-3xl font-semibold text-[hsl(var(--text-primary))] mb-6 tracking-wide">
          Resources
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </section>
    </div>
  );
};
