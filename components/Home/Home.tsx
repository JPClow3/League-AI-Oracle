import React from 'react';
import type { Page } from '../../types';
import { useUserProfile } from '../../hooks/useUserProfile';
import { usePlaybook } from '../../hooks/usePlaybook';
import { SmartDashboard } from './SmartDashboard';
import { HeroSection } from './HeroSection';
import { FeatureSection } from './FeatureSection';
import { useTranslation } from '../../hooks/useTranslation';
import { Button } from '../common/Button';
import { Signal } from 'lucide-react';

interface HomeProps {
  setCurrentPage: (page: Page) => void;
  navigateToArmory: (tab: 'champions' | 'intel') => void;
}

export const Home = ({ setCurrentPage, navigateToArmory }: HomeProps) => {
  const { profile } = useUserProfile();
  const { latestEntry } = usePlaybook();
  const { t } = useTranslation();

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <HeroSection setCurrentPage={setCurrentPage} userLevel={profile.level} />

      {/* Quick Start Section for New Users */}
      {profile.level < 3 && (
        <section className="bg-gradient-to-br from-[hsl(var(--accent)_/_0.1)] to-[hsl(var(--surface-tertiary))] p-6 rounded-lg border border-[hsl(var(--accent)_/_0.2)]">
          <h2 className="font-display text-2xl font-semibold text-[hsl(var(--text-primary))] mb-4">Quick Start</h2>
          <p className="text-[hsl(var(--text-secondary))] mb-4">
            New to DraftWise? Start here to learn the basics and create your first draft strategy.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => setCurrentPage('Strategy Forge')} variant="primary">
              Create Your First Draft
            </Button>
            <Button onClick={() => setCurrentPage('Academy')} variant="secondary">
              Learn the Basics
            </Button>
          </div>
        </section>
      )}

      {/* Prominent Live Co-Pilot Feature */}
      <div className="bg-gradient-to-br from-[hsl(var(--accent)_/_0.1)] to-[hsl(var(--surface-tertiary)_/_0.5)] p-6 rounded-lg border-2 border-[hsl(var(--accent)_/_0.3)] shadow-lg shadow-[hsl(var(--accent)_/_0.1)] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Signal className="h-12 w-12 text-[hsl(var(--accent))] animate-gentle-pulse" />
          <div>
            <h2 className="font-display text-3xl font-bold text-[hsl(var(--text-primary))] tracking-wide">
              {t('home_card_live_title')}
            </h2>
            <p className="text-[hsl(var(--text-secondary))] max-w-lg">{t('home_card_live_desc')}</p>
          </div>
        </div>
        <Button
          onClick={() => setCurrentPage('Live Co-Pilot')}
          variant="primary"
          className="text-lg px-8 py-4 w-full md:w-auto flex-shrink-0"
        >
          {t('home_card_live_action')}
        </Button>
      </div>

      {/* Enhanced Smart Dashboard */}
      <SmartDashboard profile={profile} latestPlaybookEntry={latestEntry} setCurrentPage={setCurrentPage} />

      {/* Grouped Feature Sections */}
      <FeatureSection setCurrentPage={setCurrentPage} navigateToArmory={navigateToArmory} />
    </div>
  );
};
