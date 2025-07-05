import React, { useState, useEffect } from 'react';
import { View } from '../types';
import { useProfile } from '../contexts/ProfileContext';
import { Icon } from './common/Icon';

interface HeaderProps {
  currentView: View;
  setView: (view: View) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  onCommandPaletteOpen: () => void;
}

const NavItem: React.FC<{
  view: View;
  currentView: View;
  setView: (view: View) => void;
  children: React.ReactNode;
  iconName: React.ComponentProps<typeof Icon>['name'];
  isMobile?: boolean;
}> = ({ view, currentView, setView, children, iconName, isMobile = false }) => {
  const isActive = view === currentView;
  
  if (isMobile) {
      return (
         <button
            onClick={() => setView(view)}
            className={`flex items-center gap-4 px-4 py-3 text-lg w-full text-left
                ${
                isActive
                    ? 'bg-indigo-500/20 text-indigo-500 dark:text-indigo-400 font-semibold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700/70'
                }`}
            >
            <Icon name={iconName} className="w-6 h-6" />
            {children}
        </button>
      );
  }

  return (
    <button
      onClick={() => setView(view)}
      className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all duration-150 transform active:scale-95
        ${
          isActive
            ? 'bg-primary-gradient text-white shadow'
            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-700/70'
        }`}
    >
        <Icon name={iconName} className="w-4 h-4" />
        {children}
    </button>
  );
};

const ProfileDisplay: React.FC<{setView: (view: View) => void}> = ({ setView }) => {
    const { activeProfile, logout } = useProfile();
    if (!activeProfile) return null;

    const { name, avatar, settings } = activeProfile;
    const { xp } = settings;

    const level = Math.floor(xp / 100) + 1;

    return (
        <div className="flex items-center gap-3">
            <div 
                className="flex items-center gap-2 cursor-pointer p-1 rounded-md hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
                onClick={() => setView(View.PROFILE)}
                title="View Profile"
            >
                <div className="text-2xl">{avatar}</div>
                <div>
                    <div className="font-semibold text-sm leading-tight text-slate-800 dark:text-slate-200">{name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Level {level}</div>
                </div>
            </div>
             <button
                onClick={(e) => {
                    e.stopPropagation();
                    logout();
                }}
                className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
                title="Switch Profile"
                aria-label="Switch Profile"
            >
                <Icon name="logout" className="w-4 h-4" />
            </button>
        </div>
    );
};

const NAV_LINKS: { view: View; label: string; iconName: React.ComponentProps<typeof Icon>['name'] }[] = [
    { view: View.HOME, label: "Home", iconName: "home" },
    { view: View.DRAFTING, label: "Drafting", iconName: "draft" },
    { view: View.DRAFT_LAB, label: "Lab", iconName: "lab" },
    { view: View.PLAYBOOK, label: "Playbook", iconName: "playbook" },
    { view: View.VAULT, label: "Vault", iconName: "vault" },
    { view: View.LESSONS, label: "Lessons", iconName: "lessons" },
    { view: View.HISTORY, label: "History", iconName: "history" },
];


const Header: React.FC<HeaderProps> = ({ currentView, setView, theme, setTheme, onCommandPaletteOpen }) => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <header className="bg-slate-100/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 shadow-sm sticky top-0 z-40 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Left Section */}
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-bold font-display text-gradient-primary cursor-pointer" onClick={() => setView(View.HOME)}>
                DraftWise AI
              </h1>
              <nav className="hidden md:flex items-center space-x-1 bg-slate-200/50 dark:bg-slate-900/30 p-1 rounded-lg border border-slate-300/50 dark:border-slate-700/50">
                {NAV_LINKS.map(link => (
                    <NavItem key={link.view} view={link.view} currentView={currentView} setView={setView} iconName={link.iconName}>
                        {link.label}
                    </NavItem>
                ))}
              </nav>
            </div>
            {/* Right Section */}
            <div className="flex items-center space-x-2">
              <div className="hidden md:flex">
                <ProfileDisplay setView={setView} />
              </div>
              <button 
                onClick={onCommandPaletteOpen}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 text-sm text-slate-500 dark:text-slate-400 bg-white/0 dark:bg-slate-800/0 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-200/70 dark:hover:bg-slate-700/70 transition-colors"
              >
                <Icon name="search" className="w-4 h-4" />
                <span className="font-sans">Ctrl+K</span>
              </button>
              <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-slate-200/70 dark:hover:bg-slate-700/70 transition-colors" aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}>
                <Icon name={theme === 'light' ? 'moon' : 'sun'} className="w-5 h-5" />
              </button>
              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2 -mr-2"
                onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Open navigation menu"
              >
                <div className={`space-y-1.5 ${isMobileMenuOpen ? 'mobile-nav-open' : ''}`}>
                  <span className="block w-6 h-0.5 bg-slate-600 dark:bg-slate-300 hamburger-line hamburger-line-top"></span>
                  <span className="block w-6 h-0.5 bg-slate-600 dark:bg-slate-300 hamburger-line hamburger-line-middle"></span>
                  <span className="block w-6 h-0.5 bg-slate-600 dark:bg-slate-300 hamburger-line hamburger-line-bottom"></span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div 
        className={`fixed inset-0 z-30 transition-opacity md:hidden ${isMobileMenuOpen ? 'bg-black/40' : 'pointer-events-none opacity-0'}`}
        onClick={() => setMobileMenuOpen(false)}
      />
      <div className={`mobile-menu fixed top-0 right-0 h-full w-72 bg-slate-100 dark:bg-slate-900 shadow-2xl z-40 md:hidden ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="p-4 flex flex-col h-full">
            <div className="mb-8">
                <ProfileDisplay setView={(v) => { setView(v); setMobileMenuOpen(false); }}/>
            </div>
            <nav className="flex-grow">
                {NAV_LINKS.map(link => (
                    <NavItem 
                        key={link.view}
                        view={link.view}
                        currentView={currentView}
                        setView={(v) => { setView(v); setMobileMenuOpen(false); }}
                        iconName={link.iconName}
                        isMobile
                    >
                        {link.label}
                    </NavItem>
                ))}
            </nav>
        </div>
      </div>
    </>
  );
};

export default Header;