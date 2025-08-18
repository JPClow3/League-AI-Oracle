
import React from 'react';
import type { Page } from '../../types';

interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  onOpenSettings: () => void;
  onOpenFeedback: () => void;
}

const NavLink: React.FC<{
  pageName: Page;
  currentPage: Page;
  onClick: (page: Page) => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ pageName, currentPage, onClick, icon, children }) => {
  const isActive = currentPage === pageName;
  return (
    <li>
      <button
        onClick={() => onClick(pageName)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-semibold transition-all duration-200 ${
          isActive
            ? 'bg-slate-700/50 text-[rgb(var(--color-accent-text))]'
            : 'text-slate-400 hover:text-slate-100 hover:bg-slate-700/30'
        }`}
      >
        {icon}
        {children}
      </button>
    </li>
  );
};

const NavGroup: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div>
        <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{title}</h3>
        <ul className="space-y-1">
            {children}
        </ul>
    </div>
);

const ICONS: Record<string, React.ReactNode> = {
    HOME: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
    LIVE: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    FORGE: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>,
    ARENA: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-9-9m0 0L3 3m9 9l9-9m-9 9l-9 9" /></svg>,
    ARCHIVES: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>,
    ARMORY: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286zm0 13.036h.008v.008h-.008v-.008z" /></svg>,
    ORACLE: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    ACADEMY: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>,
    CHALLENGE: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>,
};


export const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage, onOpenSettings, onOpenFeedback }) => {
  return (
    <aside className="hidden md:flex flex-col w-64 bg-slate-900 h-full fixed top-0 left-0 border-r border-slate-700/50 p-4 space-y-6">
        <button onClick={() => setCurrentPage('Home')} className="flex items-center flex-shrink-0 px-2 focus:outline-none focus:ring-2 focus:ring-opacity-75 focus:ring-[rgb(var(--color-accent-bg))] rounded-lg p-1 group">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[rgb(var(--color-accent-logo))] group-hover:opacity-80 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.562L16.25 21.75l-.648-1.188a2.25 2.25 0 00-1.635-1.635L12.75 18.5l1.188-.648a2.25 2.25 0 001.635-1.635L16.25 15l.648 1.188a2.25 2.25 0 001.635 1.635L19.75 18.5l-1.188.648a2.25 2.25 0 00-1.635 1.635z" />
            </svg>
            <span className="font-display ml-2 text-2xl font-bold text-slate-200 tracking-wider group-hover:text-gray-200 transition-colors">DraftWise AI</span>
        </button>
      
      <nav className="flex-grow space-y-6 overflow-y-auto">
        <NavGroup title="Dashboard">
            <NavLink pageName="Home" currentPage={currentPage} onClick={setCurrentPage} icon={ICONS.HOME}>Home</NavLink>
        </NavGroup>

        <NavGroup title="Live">
            <NavLink pageName="Live Co-Pilot" currentPage={currentPage} onClick={setCurrentPage} icon={ICONS.LIVE}>Live Co-Pilot</NavLink>
        </NavGroup>
        
        <NavGroup title="Prepare">
            <NavLink pageName="Strategy Forge" currentPage={currentPage} onClick={setCurrentPage} icon={ICONS.FORGE}>Strategy Forge</NavLink>
            <NavLink pageName="Draft Arena" currentPage={currentPage} onClick={setCurrentPage} icon={ICONS.ARENA}>Draft Arena</NavLink>
            <NavLink pageName="The Archives" currentPage={currentPage} onClick={setCurrentPage} icon={ICONS.ARCHIVES}>The Archives</NavLink>
        </NavGroup>

        <NavGroup title="Reference">
            <NavLink pageName="The Armory" currentPage={currentPage} onClick={setCurrentPage} icon={ICONS.ARMORY}>The Armory</NavLink>
            <NavLink pageName="The Oracle" currentPage={currentPage} onClick={setCurrentPage} icon={ICONS.ORACLE}>The Oracle</NavLink>
            <NavLink pageName="Academy" currentPage={currentPage} onClick={setCurrentPage} icon={ICONS.ACADEMY}>Academy</NavLink>
        </NavGroup>
        
        <NavGroup title="Engage">
            <NavLink pageName="Daily Challenge" currentPage={currentPage} onClick={setCurrentPage} icon={ICONS.CHALLENGE}>Daily Challenge</NavLink>
        </NavGroup>

      </nav>

      <div className="flex-shrink-0 space-y-1">
         <NavLink pageName="Profile" currentPage={currentPage} onClick={setCurrentPage} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}>Profile</NavLink>
         <li>
            <button onClick={onOpenFeedback} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-semibold text-slate-400 hover:text-slate-100 hover:bg-slate-700/30">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                Feedback
            </button>
         </li>
         <li>
            <button onClick={onOpenSettings} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-semibold text-slate-400 hover:text-slate-100 hover:bg-slate-700/30">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                Settings
            </button>
         </li>
      </div>
    </aside>
  );
};
