
import React from 'react';
import type { Page } from '../../types';

interface BottomNavProps {
    currentPage: Page;
    setCurrentPage: (page: Page) => void;
}

const ICONS: Record<Page, React.ReactNode> = {
    'Home': <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
    'Live Co-Pilot': <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    'Strategy Forge': <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>,
    'Draft Arena': <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-9-9m0 0L3 3m9 9l9-9m-9 9l-9 9" /></svg>,
    'The Armory': <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286zm0 13.036h.008v.008h-.008v-.008z" /></svg>,
    'Profile': <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
} as any;

const NavItem: React.FC<{
    pageName: Page;
    label: string;
    currentPage: Page;
    onClick: (page: Page) => void;
}> = ({ pageName, label, currentPage, onClick }) => {
    const isActive = currentPage === pageName;
    return (
        <button
            onClick={() => onClick(pageName)}
            className={`flex flex-col items-center justify-center gap-1 w-full pt-2 pb-1 transition-colors duration-200 ${isActive ? 'text-[rgb(var(--color-accent-text))]' : 'text-slate-400 hover:text-slate-100'}`}
        >
            {ICONS[pageName]}
            <span className="text-xs">{label}</span>
        </button>
    );
};

export const BottomNav: React.FC<BottomNavProps> = ({ currentPage, setCurrentPage }) => {
    const navItems: { page: Page; label: string }[] = [
        { page: 'Home', label: 'Home' },
        { page: 'Live Co-Pilot', label: 'Live' },
        { page: 'Strategy Forge', label: 'Forge' },
        { page: 'The Armory', label: 'Armory' },
        { page: 'Profile', label: 'Profile' },
    ];
    
    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-900/80 backdrop-blur-sm border-t border-slate-700/50 z-50">
            <div className="flex justify-around items-center h-full">
                {navItems.map(item => (
                    <NavItem
                        key={item.page}
                        pageName={item.page}
                        label={item.label}
                        currentPage={currentPage}
                        onClick={setCurrentPage}
                    />
                ))}
            </div>
        </nav>
    );
};
