import React from 'react';
import type { Page } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import { motion } from 'framer-motion';
import { useModals } from '../../hooks/useModals';
import { Home, Signal, FlaskConical, Swords, Library, Shield, GraduationCap, Eye, Target, User, Component } from 'lucide-react';

const ICONS: Record<Page, React.ReactNode> = {
    'Home': <Home className="h-6 w-6" />,
    'Live Co-Pilot': <Signal className="h-6 w-6" />,
    'Strategy Forge': <FlaskConical className="h-6 w-6" />,
    'Draft Arena': <Swords className="h-6 w-6" />,
    'The Armory': <Shield className="h-6 w-6" />,
    'The Archives': <Library className="h-6 w-6" />,
    'Academy': <GraduationCap className="h-6 w-6" />,
    'The Oracle': <Eye className="h-6 w-6" />,
    'Daily Challenge': <Target className="h-6 w-6" />,
    'Profile': <User className="h-6 w-6" />,
};


interface SidebarProps {
    currentPage: Page;
    setCurrentPage: (page: Page) => void;
}

const NavLink = ({ pageName, label, currentPage, onClick, icon }: {
    pageName: Page;
    label: string;
    currentPage: Page;
    onClick: (page: Page) => void;
    icon: React.ReactNode;
}) => {
    const isActive = currentPage === pageName;
    return (
        <button
            onClick={() => onClick(pageName)}
            className={`flex items-center gap-4 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 w-full relative group ${
                isActive
                ? 'bg-surface text-accent shadow-md'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface/80'
            }`}
        >
            <div className={`transition-colors ${isActive ? 'text-accent' : 'text-text-muted group-hover:text-secondary-accent'}`}>{icon}</div>
            <span className="font-semibold">{label}</span>
            {isActive && <motion.div {...{ layoutId: "active-sidebar-link" }} className="absolute left-0 top-2 bottom-2 w-1 bg-accent rounded-r-full" />}
        </button>
    );
};

export const Sidebar = ({ currentPage, setCurrentPage }: SidebarProps) => {
    const { t } = useTranslation();
    const { dispatch } = useModals();

    const navLinks: { page: Page; key: 'nav_home' | 'nav_live_co_pilot' | 'nav_strategy_forge' | 'nav_draft_arena' | 'nav_the_armory' | 'nav_the_archives' | 'nav_academy' | 'nav_the_oracle' | 'nav_daily_challenge' | 'nav_profile' }[] = [
      { page: 'Home', key: 'nav_home'},
      { page: 'Live Co-Pilot', key: 'nav_live_co_pilot' },
      { page: 'Strategy Forge', key: 'nav_strategy_forge' },
      { page: 'Draft Arena', key: 'nav_draft_arena' },
      { page: 'The Archives', key: 'nav_the_archives' },
      { page: 'The Armory', key: 'nav_the_armory' },
      { page: 'Academy', key: 'nav_academy'},
      { page: 'The Oracle', key: 'nav_the_oracle'},
      { page: 'Daily Challenge', key: 'nav_daily_challenge'},
    ];

    return (
        <aside className="hidden md:flex flex-col w-64 bg-bg-secondary p-4 flex-shrink-0 border-r border-border">
            <button onClick={() => setCurrentPage('Home')} className="flex items-center gap-2 group mb-6 px-2">
                <Component className="h-7 w-7 text-accent" />
                <span className="font-display font-bold text-xl text-text-primary tracking-wider">DraftWise AI</span>
            </button>
            <nav className="flex flex-col gap-2 flex-grow">
                {navLinks.map(({page, key}) => <NavLink key={page} pageName={page} label={t(key)} currentPage={currentPage} onClick={setCurrentPage} icon={ICONS[page]} />)}
            </nav>
            <div className="flex-shrink-0">
                <NavLink pageName="Profile" label={t('nav_profile')} currentPage={currentPage} onClick={setCurrentPage} icon={ICONS['Profile']} />
            </div>
        </aside>
    );
};