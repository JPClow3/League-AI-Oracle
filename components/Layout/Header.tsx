import React from 'react';
import type { Page } from '../../types';

interface HeaderProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  onOpenSettings: () => void;
  onOpenFeedback: () => void;
}

const NavLink: React.FC<{
  pageName: Page;
  currentPage: Page;
  onClick: (page: Page) => void;
  children: React.ReactNode;
}> = ({ pageName, currentPage, onClick, children }) => {
  const isActive = currentPage === pageName;
  return (
    <button
      onClick={() => onClick(pageName)}
      className={`relative px-3 py-2 rounded-md text-sm md:text-base font-semibold transition-all duration-200 ${
        isActive
          ? 'text-[rgb(var(--color-accent-text))]'
          : 'text-gray-400 hover:text-white'
      }`}
    >
      {children}
      {isActive && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 h-0.5 bg-[rgb(var(--color-accent-bg))] rounded-full"></span>}
    </button>
  );
};

export const Header: React.FC<HeaderProps> = ({ currentPage, setCurrentPage, onOpenSettings, onOpenFeedback }) => {
  return (
    <header className="bg-[#0A0F1F]/60 backdrop-blur-sm shadow-xl sticky top-0 z-50 border-b border-slate-700/50">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button onClick={() => setCurrentPage('Home')} className="flex items-center focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent-bg))] rounded-lg p-1 group">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[rgb(var(--color-accent-logo))] group-hover:opacity-80 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.562L16.25 21.75l-.648-1.188a2.25 2.25 0 00-1.635-1.635L12.75 18.5l1.188-.648a2.25 2.25 0 001.635-1.635L16.25 15l.648 1.188a2.25 2.25 0 001.635 1.635L19.75 18.5l-1.188.648a2.25 2.25 0 00-1.635 1.635z" />
            </svg>
            <span className="font-display ml-2 text-2xl font-bold text-white tracking-wider group-hover:text-gray-200 transition-colors">DraftWise AI</span>
          </button>
          <div className="flex items-center gap-1">
            <div className="hidden md:flex items-center space-x-0 md:space-x-1 flex-wrap">
              <NavLink pageName="Draft Lab" currentPage={currentPage} onClick={setCurrentPage}>Draft Lab</NavLink>
              <NavLink pageName="Arena" currentPage={currentPage} onClick={setCurrentPage}>Arena</NavLink>
              <NavLink pageName="Playbook" currentPage={currentPage} onClick={setCurrentPage}>Playbook</NavLink>
              <NavLink pageName="Strategy Hub" currentPage={currentPage} onClick={setCurrentPage}>Strategy Hub</NavLink>
              <NavLink pageName="Academy" currentPage={currentPage} onClick={setCurrentPage}>Academy</NavLink>
            </div>
             <button
              onClick={() => setCurrentPage('Profile')}
              className="p-2 rounded-full text-gray-400 hover:bg-slate-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-white"
              aria-label="Open profile"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
            <button
              onClick={onOpenFeedback}
              className="p-2 rounded-full text-gray-400 hover:bg-slate-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-white"
              aria-label="Give feedback"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
            </button>
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-full text-gray-400 hover:bg-slate-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-white"
              aria-label="Open settings"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};
