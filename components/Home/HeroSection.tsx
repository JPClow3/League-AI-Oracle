import React from 'react';
import type { Page } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import { Button } from '../common/Button';
import { Sparkles } from 'lucide-react';

interface HeroSectionProps {
  setCurrentPage: (page: Page) => void;
  userLevel: number;
}

export const HeroSection = ({ setCurrentPage, userLevel }: HeroSectionProps) => {
  const { t } = useTranslation();
  const isNewUser = userLevel < 3;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[hsl(var(--accent)_/_0.1)] via-[hsl(var(--accent)_/_0.05)] to-transparent border border-[hsl(var(--accent)_/_0.2)] p-8 md:p-12 shadow-xl">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,hsl(var(--accent)/0.15),transparent_50%)]"></div>
      <div className="relative z-10 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="h-6 w-6 text-[hsl(var(--accent))] animate-gentle-pulse" />
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-[hsl(var(--text-primary))] tracking-wide">
            {t('home_title')} <span className="text-[hsl(var(--accent))]">{t('home_subtitle')}</span>
          </h1>
        </div>
        <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-[hsl(var(--text-secondary))]">
          {t('home_description')}
        </p>
        {isNewUser && (
          <div className="mt-8">
            <Button
              onClick={() => setCurrentPage('Strategy Forge')}
              variant="primary"
              className="text-lg px-8 py-4 shadow-lg hover:shadow-xl transition-all"
            >
              Start Your First Draft
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
