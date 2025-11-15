import React from 'react';
import type { Page } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import { Home, Signal, FlaskConical, Shield, User, MoreHorizontal } from 'lucide-react';
import { MoreMenu } from './MoreMenu';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';

// Interface moved to export statement below

const ICONS: Record<string, React.ReactNode> = {
  Home: <Home className="h-6 w-6" />,
  'Live Co-Pilot': <Signal className="h-6 w-6" />,
  'Strategy Forge': <FlaskConical className="h-6 w-6" />,
  Armory: <Shield className="h-6 w-6" />,
  Profile: <User className="h-6 w-6" />,
  More: <MoreHorizontal className="h-6 w-6" />,
};

const NavItem = ({
  pageName,
  label,
  currentPage,
  onClick,
  badge,
}: {
  pageName: Page;
  label: string;
  currentPage: Page;
  onClick: (page: Page) => void;
  badge?: number;
}) => {
  const isActive = currentPage === pageName;
  const haptic = useHapticFeedback();

  const handleClick = () => {
    haptic.light();
    onClick(pageName);
  };

  return (
    <button
      onClick={handleClick}
      className={`flex flex-col items-center justify-center gap-1 w-full pt-2 pb-1 min-h-[44px] transition-all duration-200 relative focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset ${
        isActive
          ? 'text-[hsl(var(--accent))] bg-[hsl(var(--accent)_/_0.1)]'
          : 'text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--surface)_/_0.5)]'
      }`}
      aria-current={isActive ? 'page' : undefined}
      aria-label={`Navigate to ${label}${badge ? ` (${badge} notifications)` : ''}`}
    >
      {isActive && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-[hsl(var(--accent))] rounded-b-full shadow-glow-accent" />
      )}
      <div className="relative">
        {ICONS[pageName]}
        {badge !== undefined && badge > 0 && (
          <span
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[hsl(var(--accent))] text-[hsl(var(--on-accent))] text-[10px] font-bold rounded-full flex items-center justify-center"
            aria-label={`${badge} notifications`}
          >
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </div>
      <span className={`text-xs font-medium ${isActive ? 'font-semibold' : ''}`}>{label}</span>
    </button>
  );
};

export interface BottomNavProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  badges?: Partial<Record<Page, number>>;
}

export const BottomNav = ({ currentPage, setCurrentPage, badges }: BottomNavProps) => {
  const { t: _t } = useTranslation();
  const [isMoreMenuOpen, setIsMoreMenuOpen] = React.useState(false);
  const haptic = useHapticFeedback();

  const navItems: {
    page: Page | 'More';
    key: 'nav_home' | 'nav_live_co_pilot' | 'nav_strategy_forge' | 'nav_armory' | 'nav_profile' | 'more';
    shortLabel: string;
  }[] = [
    { page: 'Home', key: 'nav_home', shortLabel: 'Home' },
    { page: 'Live Co-Pilot', key: 'nav_live_co_pilot', shortLabel: 'Live' },
    { page: 'Strategy Forge', key: 'nav_strategy_forge', shortLabel: 'Forge' },
    { page: 'Armory', key: 'nav_armory', shortLabel: 'Armory' },
    { page: 'More', key: 'more', shortLabel: 'More' },
  ];

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[hsl(var(--bg-secondary)_/_0.9)] backdrop-blur-sm border-t border-[hsl(var(--border))] z-50">
        <div className="flex justify-around items-center h-full">
          {navItems.map(item => {
            if (item.page === 'More') {
              return (
                <button
                  key={item.page}
                  onClick={() => {
                    haptic.light();
                    setIsMoreMenuOpen(true);
                  }}
                  className={`flex flex-col items-center justify-center gap-1 w-full pt-2 pb-1 min-h-[44px] transition-all duration-200 relative focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset ${
                    isMoreMenuOpen
                      ? 'text-[hsl(var(--accent))] bg-[hsl(var(--accent)_/_0.1)]'
                      : 'text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--surface)_/_0.5)]'
                  }`}
                  aria-label="More menu"
                >
                  {isMoreMenuOpen && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-[hsl(var(--accent))] rounded-b-full shadow-glow-accent" />
                  )}
                  {ICONS[item.page]}
                  <span className={`text-xs font-medium ${isMoreMenuOpen ? 'font-semibold' : ''}`}>
                    {item.shortLabel}
                  </span>
                </button>
              );
            }
            return (
              <React.Fragment key={item.page}>
                <NavItem
                  pageName={item.page as Page}
                  label={item.shortLabel}
                  currentPage={currentPage}
                  onClick={setCurrentPage}
                  badge={badges?.[item.page as Page]}
                />
              </React.Fragment>
            );
          })}
        </div>
      </nav>
      <MoreMenu
        isOpen={isMoreMenuOpen}
        onClose={() => setIsMoreMenuOpen(false)}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
    </>
  );
};
