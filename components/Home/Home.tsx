import React from 'react';
import type { Page } from '../../types';
import { useUserProfile } from '../../hooks/useUserProfile';
import { usePlaybook } from '../../hooks/usePlaybook';
import { SmartDashboard } from './SmartDashboard';
import { useTranslation } from '../../hooks/useTranslation';
import { Button } from '../common/Button';
import { FlaskConical, Signal, Swords, Shield, GraduationCap, FileText, Library, Sparkles, BrainCircuit } from 'lucide-react';

interface HomeProps {
  setCurrentPage: (page: Page) => void;
  navigateToArmory: (tab: 'champions' | 'intel') => void;
}

const FeatureCard = ({ title, description, icon, actionText, onClick }: {
  title: string;
  description: string;
  icon: React.ReactNode;
  actionText: string;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className="group bg-bg-secondary border border-border-primary shadow-sm p-6 flex flex-col text-left hover:border-accent hover:shadow-lg hover:shadow-accent/10 transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring w-full h-full relative overflow-hidden"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-accent/0 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    <div className="relative flex-grow flex flex-col h-full">
        <div className="bg-accent/10 text-accent w-12 h-12 flex items-center justify-center mb-4 border border-border-primary group-hover:shadow-glow-accent transition-all duration-300">
            {icon}
        </div>
        <h3 className="font-display text-xl font-semibold text-text-primary mb-2 tracking-wide">{title}</h3>
        <p className="text-text-secondary text-sm flex-grow mb-4">{description}</p>
        <div className="mt-auto text-accent font-semibold text-sm flex items-center gap-2">
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
}

export const Home = ({ setCurrentPage, navigateToArmory }: HomeProps) => {
  const { profile } = useUserProfile();
  const { latestEntry } = usePlaybook();
  const { t } = useTranslation();
    
  return (
    <div className="space-y-12">
      <div className="text-center p-8 md:p-12 bg-bg-secondary border border-border-primary shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,hsl(var(--secondary-accent)/0.1),transparent_50%)]"></div>
        <div className="relative">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-text-primary tracking-wide">
              {t('home_title')} <span className="text-accent">{t('home_subtitle')}</span>
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-text-secondary">
              {t('home_description')}
            </p>
        </div>
      </div>
      
      {/* Prominent Live Co-Pilot Feature */}
      <div className="bg-gradient-to-br from-accent/10 to-surface-secondary/50 p-6 border-2 border-accent/30 shadow-lg shadow-accent/10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
            <Signal className="h-12 w-12 text-accent animate-gentle-pulse" />
            <div>
                <h2 className="font-display text-3xl font-bold text-text-primary tracking-wide">{t('home_card_live_title')}</h2>
                <p className="text-text-secondary max-w-lg">{t('home_card_live_desc')}</p>
            </div>
        </div>
        <Button onClick={() => setCurrentPage('Live Co-Pilot')} variant="primary" className="text-lg px-8 py-4 w-full md:w-auto flex-shrink-0">
            {t('home_card_live_action')}
        </Button>
      </div>


      <SmartDashboard 
        profile={profile} 
        latestPlaybookEntry={latestEntry}
        setCurrentPage={setCurrentPage}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <FeatureCard
          title={t('home_card_forge_title')}
          description={t('home_card_forge_desc')}
          icon={ICONS.DRAFT_LAB}
          actionText={t('home_card_forge_action')}
          onClick={() => setCurrentPage('Strategy Forge')}
        />
         <FeatureCard
          title="Team Builder Assistant"
          description="Let the AI guide you step-by-step in creating a powerful composition around a core champion or strategy."
          icon={ICONS.BUILDER}
          actionText="Start Building"
          onClick={() => setCurrentPage('Strategy Forge')}
        />
        <FeatureCard
          title={t('home_card_arena_title')}
          description={t('home_card_arena_desc')}
          icon={ICONS.ARENA}
          actionText={t('home_card_arena_action')}
          onClick={() => setCurrentPage('Draft Arena')}
        />
        <FeatureCard
          title="Draft Scenarios"
          description="Test your knowledge in specific, tricky draft situations and get instant AI feedback on your choices."
          icon={ICONS.SCENARIOS}
          actionText="Train Your Skills"
          onClick={() => setCurrentPage('Draft Scenarios')}
        />
        <FeatureCard
          title={t('home_card_archives_title')}
          description={t('home_card_archives_desc')}
          icon={ICONS.PLAYBOOK}
          actionText={t('home_card_archives_action')}
          onClick={() => setCurrentPage('The Archives')}
        />
        <FeatureCard
          title={t('home_card_dossiers_title')}
          description={t('home_card_dossiers_desc')}
          icon={ICONS.ARMORY}
          actionText={t('home_card_dossiers_action')}
          onClick={() => navigateToArmory('champions')}
        />
      </div>
    </div>
  );
};