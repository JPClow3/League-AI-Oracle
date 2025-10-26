import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Tooltip } from '../common/Tooltip';
import { useModals } from '../../hooks/useModals';
import type { Page, UserProfile } from '../../types';
import { motion } from 'framer-motion';
import { User, Settings, Component } from 'lucide-react';

interface HeaderProps {
    currentPage: Page;
    setCurrentPage: (page: Page) => void;
    profile: UserProfile;
    spForNextLevel: number;
}

export const Header = ({ currentPage, setCurrentPage, profile, spForNextLevel }: HeaderProps) => {
    const { t } = useTranslation();
    const { dispatch } = useModals();
    const onOpenSettings = () => dispatch({ type: 'OPEN_SETTINGS_PANEL' });

    const progress = spForNextLevel > 0 ? (profile.sp / spForNextLevel) * 100 : 0;
    const radius = 18;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <header className="sticky top-0 z-40 w-full bg-[hsl(var(--bg-secondary)_/_0.8)] backdrop-blur-md border-b border-[hsl(var(--border))] shadow-lg shadow-black/10 h-16 flex-shrink-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
                {/* Left: Logo */}
                <button onClick={() => setCurrentPage('Home')} className="flex items-center gap-2 group">
                    <Component className="h-7 w-7 text-[hsl(var(--accent))]" />
                    <span className="font-display font-semibold text-xl text-[hsl(var(--text-primary))] tracking-wider hidden sm:block">DraftWise</span>
                </button>

                {/* Center: Page Title (Mobile) */}
                 <div className="md:hidden">
                    <h1 className="font-display text-2xl font-bold text-[hsl(var(--text-primary))]">{currentPage}</h1>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2">
                     <Tooltip content={`Level ${profile.level}: ${profile.sp} / ${spForNextLevel} SP`}>
                        <button onClick={() => setCurrentPage('Profile')} className="relative w-10 h-10 flex items-center justify-center text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--surface))] hover:text-[hsl(var(--text-primary))] transition-colors" aria-label={t('nav_profile')}>
                             <svg className="absolute inset-0 w-full h-full" viewBox="0 0 40 40">
                                <circle className="text-[hsl(var(--border))]" strokeWidth="3" stroke="currentColor" fill="transparent" r={radius} cx="20" cy="20"/>
                                <circle
                                    className="text-[hsl(var(--accent))] animate-gentle-pulse"
                                    strokeWidth="3"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={offset}
                                    strokeLinecap="round"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r={radius}
                                    cx="20"
                                    cy="20"
                                    style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 0.5s ease-out' }}
                                />
                            </svg>
                            <div className="relative">
                                <User className="h-6 w-6" strokeWidth={1.5} />
                            </div>
                        </button>
                    </Tooltip>
                    <Tooltip content={t('header_settings')}>
                        <button onClick={onOpenSettings} className="p-2 text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--surface))] hover:text-[hsl(var(--text-primary))] transition-colors" aria-label={t('header_settings')}>
                           <Settings className="h-6 w-6" strokeWidth={1.5} />
                        </button>
                    </Tooltip>
                </div>
            </div>
        </header>
    );
};