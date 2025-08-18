
import React from 'react';
import type { Page } from '../../types';
import { useUserProfile } from '../../hooks/useUserProfile';
import { usePlaybook } from '../../hooks/usePlaybook';
import { SmartDashboard } from './SmartDashboard';

interface HomeProps {
  setCurrentPage: (page: Page) => void;
  navigateToArmory: (tab: 'champions' | 'intel') => void;
}

const FeatureCard: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  actionText: string;
  onClick: () => void;
}> = ({ title, description, icon, actionText, onClick }) => (
  <button
    onClick={onClick}
    className="group relative bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-lg p-6 flex flex-col text-left hover:border-[rgb(var(--color-accent-bg))] transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-cyan-500/30 w-full h-full shadow-[inset_0_1px_1px_#ffffff0d]"
  >
    {/* Glow effect */}
    <div className="absolute -inset-px bg-gradient-to-r from-cyan-500/50 to-purple-500/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-lg"></div>
    <div className="relative z-10 flex-grow flex flex-col h-full">
        <div className="bg-slate-800/70 text-cyan-300 w-12 h-12 rounded-lg flex items-center justify-center mb-4 border border-slate-700/50 group-hover:border-cyan-400/50 group-hover:text-cyan-200 transition-colors duration-300">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-slate-200 mb-2">{title}</h3>
        <p className="text-slate-400 text-sm flex-grow mb-4">{description}</p>
        <div className="mt-auto text-cyan-300 font-semibold text-sm flex items-center gap-2">
            {actionText}
            <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
        </div>
    </div>
  </button>
);

const ICONS = {
    DRAFT_LAB: <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" /></svg>,
    LIVE_DRAFT: <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1-3m-3.5-3.5L2 12l3-1 .5.5m9.5-3.5L20 9l-3 1-1-1m-4-5l1 3-1 3m-4 5l1 3-1 3" /></svg>,
    ARENA: <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-9-9m0 0L3 3m9 9l9-9m-9 9l-9 9" /></svg>,
    ARMORY: <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286zm0 13.036h.008v.008h-.008v-.008z" /></svg>,
    ACADEMY: <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-5.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-5.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222 4 2.222V20M1 12l5.354-3.333M23 12l-5.354-3.333" /></svg>,
    INTEL: <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 1.5m1-1.5l-1-1.5m1 1.5l1 1.5m1-1.5l1-1.5M6 16.5h2.25m0 0l-1 1.5m1-1.5l-1-1.5m1 1.5l1 1.5m1-1.5l1-1.5m-2.25 7.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" /></svg>,
    PLAYBOOK: <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>,
    TRIAL: <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>,
}


export const Home: React.FC<HomeProps> = ({ setCurrentPage, navigateToArmory }) => {
  const { profile } = useUserProfile();
  const { latestEntry } = usePlaybook();

  const hexPattern = `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;
    
  return (
    <div className="space-y-12">
      <div className="text-center p-8 md:p-12 bg-slate-900/50 border border-slate-700/50 rounded-2xl shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-100" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(14, 165, 233, 0.1), transparent 50%)' }}></div>
        <div className="absolute inset-0 opacity-50" style={{ backgroundImage: hexPattern }}></div>
        <div className="relative">
            <h1 className="font-display text-4xl md:text-5xl font-extrabold text-slate-200 tracking-tight">
              Master Your Draft. <span className="text-cyan-300">Dominate The Rift.</span>
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-400">
              Welcome to DraftWise AI — The ultimate AI co-pilot for mastering the draft.
            </p>
        </div>
      </div>

      <SmartDashboard 
        profile={profile} 
        latestPlaybookEntry={latestEntry}
        setCurrentPage={setCurrentPage}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <FeatureCard
          title="Live Co-Pilot"
          description="Get real-time suggestions during an active draft by manually inputting picks and bans as they happen."
          icon={ICONS.LIVE_DRAFT}
          actionText="Start Co-Pilot"
          onClick={() => setCurrentPage('Live Co-Pilot')}
        />
        <FeatureCard
          title="Strategy Forge"
          description="Forge and test team compositions with instant, AI-powered strategic feedback."
          icon={ICONS.DRAFT_LAB}
          actionText="Enter the Forge"
          onClick={() => setCurrentPage('Strategy Forge')}
        />
        <FeatureCard
          title="Draft Arena"
          description="Hone your drafting skills against a bot in a real-time, competitive draft simulation."
          icon={ICONS.ARENA}
          actionText="Practice Drafting"
          onClick={() => setCurrentPage('Draft Arena')}
        />
        <FeatureCard
          title="The Archives"
          description="Your personal library of strategies. Save drafts from the Forge or Arena and refine your strategic codex."
          icon={ICONS.PLAYBOOK}
          actionText="Open The Archives"
          onClick={() => setCurrentPage('The Archives')}
        />
        <FeatureCard
          title="Champion Dossiers"
          description="Explore detailed champion data, optimal builds, counters, and synergies to master your picks."
          icon={ICONS.ARMORY}
          actionText="Browse Dossiers"
          onClick={() => navigateToArmory('champions')}
        />
        <FeatureCard
          title="Meta Intelligence"
          description="Get the latest meta insights, including AI-generated tier lists and concise patch note summaries."
          icon={ICONS.INTEL}
          actionText="View Intel"
          onClick={() => navigateToArmory('intel')}
        />
         <FeatureCard
          title="The Oracle"
          description="Consult the All-Seeing Eye. Ask any question about the meta and receive an answer grounded in the latest data."
          icon={ICONS.ACADEMY}
          actionText="Consult The Oracle"
          onClick={() => setCurrentPage('The Oracle')}
        />
      </div>
    </div>
  );
};
