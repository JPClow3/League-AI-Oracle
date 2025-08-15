import React, { useState, useEffect, useMemo } from 'react';
import type { AIAdvice } from '../../types';
import { Loader } from '../common/Loader';
import { Tooltip } from '../common/Tooltip';
import { KEYWORDS } from '../Academy/lessons';

interface AdvicePanelProps {
  advice: AIAdvice | null;
  isLoading: boolean;
  error: string | null;
  userRole?: string;
  navigateToAcademy: (lessonId: string) => void;
}

const getAnalysisTitle = (score: string | undefined): { title: string, className: string } => {
    if (!score) return { title: 'Draft Analysis', className: 'text-white' };
    if (score.startsWith('S')) return { title: 'Masterful Composition', className: 'text-green-400' };
    if (score.startsWith('A')) return { title: 'Excellent Composition', className: 'text-cyan-300' };
    if (score.startsWith('B')) return { title: 'Solid Foundation', className: 'text-yellow-400' };
    if (score.startsWith('C')) return { title: 'Room for Improvement', className: 'text-orange-400' };
    return { title: 'Challenging Draft', className: 'text-red-400' };
};

const ImprovementOpportunities: React.FC<{ weaknesses: string[], navigateToAcademy: (lessonId: string) => void }> = ({ weaknesses, navigateToAcademy }) => {
    const opportunities = useMemo(() => {
        const found = new Set<string>();
        return weaknesses
            .map(weakness => {
                const lowerWeakness = weakness.toLowerCase();
                const keyword = KEYWORDS.find(kw => lowerWeakness.includes(kw.term.toLowerCase()));
                if (keyword && !found.has(keyword.lessonId)) {
                    found.add(keyword.lessonId);
                    return { weakness, keyword };
                }
                return null;
            })
            .filter((item): item is NonNullable<typeof item> => item !== null);
    }, [weaknesses]);

    if (opportunities.length === 0) {
        return null;
    }

    return (
        <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
             <h3 className="text-lg font-bold text-yellow-300 mb-2">Improvement Opportunities</h3>
             <div className="space-y-2">
                {opportunities.map(({ weakness, keyword }) => (
                     <div key={keyword.lessonId} className="bg-slate-700/50 p-3 rounded-md">
                        <p className="text-sm text-gray-300 mb-2">"{weakness}"</p>
                        <button
                            onClick={() => navigateToAcademy(keyword.lessonId)}
                            className="text-sm font-semibold text-blue-300 hover:text-blue-200 hover:underline"
                        >
                            Learn about countering with {keyword.term} →
                        </button>
                    </div>
                ))}
             </div>
        </div>
    );
};

const AdviceSection: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
      <div className="bg-slate-800/50 rounded-lg border border-slate-700/50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex justify-between items-center p-3 text-left focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent-bg))] rounded-lg"
          aria-expanded={isOpen}
        >
          <h3 className="text-lg font-bold text-yellow-300">{title}</h3>
           <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-400 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
        </button>
        {isOpen && (
            <div className="px-3 pb-3">
                {children}
            </div>
        )}
      </div>
    );
};

const TeamAnalysisDetail: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <p><strong className="font-semibold text-gray-300">{label}:</strong> {value}</p>
);

export const AdvicePanel: React.FC<AdvicePanelProps> = ({ advice, isLoading, error, userRole, navigateToAcademy }) => {
  const [feedbackState, setFeedbackState] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    // Reset feedback state when new advice comes in or loading starts
    setFeedbackState(null);
  }, [advice, isLoading]);
  
  const handleFeedback = (rating: 'up' | 'down') => {
    setFeedbackState(rating);
    console.log(`Feedback received for analysis: ${rating}`);
    // In a real app, this would send an event to an analytics service.
  };

  if (isLoading) {
    return (
      <div className="bg-slate-800 p-4 rounded-lg shadow-inner h-full flex items-center justify-center border border-slate-700">
        <Loader />
      </div>
    );
  }
  if (error) {
     return (
        <div aria-live="polite" className="bg-red-900/40 border border-red-500 p-4 rounded-lg shadow-inner h-full flex flex-col items-center justify-center text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-bold text-red-300">AI Error</h3>
            <p className="text-red-200 mt-2">{error}</p>
        </div>
     )
  }
  if (!advice) {
     return (
        <div className="bg-slate-800 p-4 rounded-lg shadow-inner h-full flex flex-col items-center justify-center text-center border border-slate-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <h3 className="text-xl font-bold text-slate-300">Analysis Pending</h3>
            <p className="text-slate-400 mt-2 max-w-xs">Complete both team compositions, then press "Analyze" to receive AI-powered insights.</p>
        </div>
     )
  }
  
  const { blue: blueAnalysis, red: redAnalysis } = advice.teamAnalysis;
  const analysisTitle = getAnalysisTitle(blueAnalysis.draftScore);

  return (
    <div aria-live="polite" className="bg-gradient-to-br from-slate-900 to-slate-800/80 p-4 rounded-lg shadow-inner space-y-3 max-h-[calc(100vh-20rem)] overflow-y-auto border border-slate-700">
      <h2 className={`font-display text-2xl font-bold text-center mb-1 ${analysisTitle.className}`}>{analysisTitle.title}</h2>
      {userRole && userRole !== 'All' && (
          <p className="text-xs text-center text-cyan-400/70 -mt-1 mb-2">Personalized for a {userRole} main</p>
      )}
      <p className="text-sm text-center text-gray-400 mb-4">{blueAnalysis.draftScoreReasoning}</p>
      
      {/* Draft Score Section */}
      {(blueAnalysis.draftScore || redAnalysis.draftScore) && (
        <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-blue-900/30 p-3 rounded-lg border border-blue-500/30">
                <div className="text-3xl font-black text-blue-300">{blueAnalysis.draftScore || '?'}</div>
                <div className="text-xs text-blue-200">Blue Team Score</div>
            </div>
            <div className="bg-red-900/30 p-3 rounded-lg border border-red-500/30">
                <div className="text-3xl font-black text-red-300">{redAnalysis.draftScore || '?'}</div>
                <div className="text-xs text-red-200">Red Team Score</div>
            </div>
        </div>
      )}

      <ImprovementOpportunities weaknesses={blueAnalysis.weaknesses} navigateToAcademy={navigateToAcademy} />

      <AdviceSection title="Pick Suggestions" defaultOpen={true}>
        <ul className="space-y-2 text-sm">
          {advice.pickSuggestions.slice(0, 3).map(p => (
            <li key={p.championName} className="p-3 bg-slate-700/50 rounded-md border border-slate-600/50">
              <strong className="text-[rgb(var(--color-accent-text))]">{p.championName} ({p.role})</strong>: {p.reasoning}
            </li>
          ))}
        </ul>
      </AdviceSection>

       <AdviceSection title="Ban Suggestions">
        <ul className="space-y-2 text-sm">
          {advice.banSuggestions.slice(0, 2).map(b => (
            <li key={b.championName} className="p-3 bg-slate-700/50 rounded-md border border-slate-600/50">
              <strong className="text-red-300">{b.championName}</strong>: {b.reasoning}
            </li>
          ))}
        </ul>
      </AdviceSection>

      <AdviceSection title="Team Analysis">
        <div className="grid grid-cols-1 gap-4 text-xs">
            <div className="p-3 bg-blue-900/30 rounded-md border border-blue-500/20 space-y-1">
                <h4 className="font-bold text-blue-400 mb-1">Blue Team</h4>
                <TeamAnalysisDetail label="Identity" value={blueAnalysis.teamIdentity} />
                <TeamAnalysisDetail label="Power Spike" value={blueAnalysis.powerSpike} />
                <TeamAnalysisDetail label="Win Con" value={blueAnalysis.winCondition} />
                 <TeamAnalysisDetail label="Key Threats" value={redAnalysis.keyThreats} />
            </div>
             <div className="p-3 bg-red-900/30 rounded-md border border-red-500/20 space-y-1">
                <h4 className="font-bold text-red-400 mb-1">Red Team</h4>
                <TeamAnalysisDetail label="Identity" value={redAnalysis.teamIdentity} />
                <TeamAnalysisDetail label="Power Spike" value={redAnalysis.powerSpike} />
                <TeamAnalysisDetail label="Win Con" value={redAnalysis.winCondition} />
                <TeamAnalysisDetail label="Key Threats" value={blueAnalysis.keyThreats} />
            </div>
        </div>
      </AdviceSection>

       <AdviceSection title="Item Suggestions">
        <ul className="space-y-2 text-xs">
          {advice.itemSuggestions.slice(0,3).map(i => (
            <li key={i.championName} className="p-3 bg-slate-700/50 rounded-md border border-slate-600/50">
              <strong className="text-yellow-200">{i.championName}</strong>
              <p><strong>Core:</strong> {i.coreItems.join(', ')}</p>
              <p><strong>Sit.:</strong> {i.situationalItems.join(', ')}</p>
            </li>
          ))}
        </ul>
      </AdviceSection>
      
      {/* Feedback Section */}
      <div className="pt-3 mt-3 border-t border-slate-700/50 text-center">
        {feedbackState ? (
          <p className="text-sm text-green-400">Thank you for your feedback!</p>
        ) : (
          <>
            <p className="text-sm text-gray-400 mb-2">Was this analysis helpful?</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => handleFeedback('up')} className="p-2 rounded-full bg-slate-700 hover:bg-green-600 text-gray-300 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333V17a1 1 0 001 1h6.364a1 1 0 00.943-.684l1.714-4.286a1 1 0 00-.02-1.033l-3.32-4.648a1 1 0 00-.944-.314H8a1 1 0 00-1 1v1.167a2.25 2.25 0 01-1.25-2.025V6.5a1 1 0 00-1-1H6z" />
                </svg>
              </button>
              <button onClick={() => handleFeedback('down')} className="p-2 rounded-full bg-slate-700 hover:bg-red-600 text-gray-300 hover:text-white transition-colors">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667V3a1 1 0 00-1-1H6.636a1 1 0 00-.943.684L4 7.429a1 1 0 00.02 1.033l3.32 4.648a1 1 0 00.944.314H12a1 1 0 001-1V11.833a2.25 2.25 0 011.25 2.025V13.5a1 1 0 001 1H14z" />
                </svg>
              </button>
            </div>
          </>
        )}
      </div>

    </div>
  );
};
