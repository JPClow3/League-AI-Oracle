import React from 'react';
import type { Page } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import { Home, Signal, FlaskConical, Shield, User } from 'lucide-react';

interface BottomNavProps {
    currentPage: Page;
    setCurrentPage: (page: Page) => void;
}

const ICONS: Record<string, React.ReactNode> = {
    'Home': <Home className="h-6 w-6" />,
    'Live Co-Pilot': <Signal className="h-6 w-6" />,
    'Strategy Forge': <FlaskConical className="h-6 w-6" />,
    'The Armory': <Shield className="h-6 w-6" />,
    'Profile': <User className="h-6 w-6" />,
};

const NavItem = ({
    pageName,
    label,
    currentPage,
    onClick,
}: {
    pageName: Page;
    label: string;
    currentPage: Page;
    onClick: (page: Page) => void;
}) => {
    const isActive = currentPage === pageName;
    return (
        <button
            onClick={() => onClick(pageName)}
            className={`flex flex-col items-center justify-center gap-1 w-full pt-2 pb-1 transition-colors duration-200 relative ${isActive ? 'text-[hsl(var(--accent))]' : 'text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]'}`}
        >
            {isActive && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[hsl(var(--accent))] rounded-full" />}
            {ICONS[pageName]}
            <span className="text-xs">{label}</span>
        </button>
    );
};

export const BottomNav = ({ currentPage, setCurrentPage }: BottomNavProps) => {
    const { t } = useTranslation();
    const navItems: { page: Page; key: 'nav_home' | 'nav_live_co_pilot' | 'nav_strategy_forge' | 'nav_the_armory' | 'nav_profile', shortLabel: string }[] = [
        { page: 'Home', key: 'nav_home', shortLabel: 'Home' },
        { page: 'Live Co-Pilot', key: 'nav_live_co_pilot', shortLabel: 'Live' },
        { page: 'Strategy Forge', key: 'nav_strategy_forge', shortLabel: 'Forge' },
        { page: 'The Armory', key: 'nav_the_armory', shortLabel: 'Armory' },
        { page: 'Profile', key: 'nav_profile', shortLabel: 'Profile' },
    ];
    
    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[hsl(var(--bg-secondary)_/_0.9)] backdrop-blur-sm border-t border-[hsl(var(--border))] z-50">
            <div className="flex justify-around items-center h-full">
                {navItems.map(item => (
                    <NavItem
                        key={item.page}
                        pageName={item.page}
                        label={item.shortLabel}
                        currentPage={currentPage}
                        onClick={setCurrentPage}
                    />
                ))}
            </div>
        </nav>
    );
};
