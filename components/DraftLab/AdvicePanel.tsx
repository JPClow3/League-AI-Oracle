import React, { useState, useEffect, useMemo } from 'react';
import type { AIAdvice } from '../../types';
import { Loader } from '../common/Loader';
import { Tooltip } from '../common/Tooltip';
import { KeywordHighlighter } from '../Academy/KeywordHighlighter';
import { PowerSpikeTimeline } from './PowerSpikeTimeline';
import { KEYWORDS } from '../Academy/lessons';
import { Button } from '../common/Button';

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

const getIconForGrade = (score: string | undefined) => {
    if (!score) return null;
    const grade = score.charAt(0).toUpperCase();
    switch(grade) {
        case 'S': return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-300" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>;
        case 'A': return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-300" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;
        case 'C':
        case 'D':
        case 'F':
            return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.636-1.21 2.273-1.21 2.91 0l5.425 10.32c.636 1.21-.273 2.706-1.455 2.706H4.287c-1.182 0-2.091-1.496-1.455-2.706L8.257 3.099zM10 12a1 1 0 100-2 1 1 0 000 2zm0-4a1 1 0 00-1 1v1a1 1 0 102 0V9a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;
        default: return null;
    }
}

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
                        <p className="text-sm text-gray-300 mb-2">"<KeywordHighlighter text={weakness} onKeywordClick={navigateToAcademy} />"</p>
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
          className="w-full flex justify-between items-center p-3 text-left focus:outline-none focus:ring-2 focus:ring-opacity-75 focus:ring-[rgb(var(--color-accent-bg))] rounded-lg"
          aria-expanded={isOpen}
          aria-controls={`section-content-${title.replace(/\s+/g, '-')}`}
        >
          <h3 className="text-lg font-bold text-yellow-300">{title}</h3>
           <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-400 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
        </button>
        {isOpen && (
            <div id={`section-content-${title.replace(/\s+/g, '-')}`} className="px-3 pb-3">
                {children}
            </div>
        )}
      </div>
    );
};

const TeamAnalysisDetail: React.FC<{ label: string; value: string; onKeywordClick: (id: string) => void; }> = ({ label, value, onKeywordClick }) => (
    <p><strong className="font-semibold text-gray-300">{label}:</strong> <KeywordHighlighter text={value} onKeywordClick={onKeywordClick} /></p>
);

const HextechLoader: React.FC = () => (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-slate-800 rounded-lg overflow-hidden">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 opacity-10">
            <defs>
                <pattern id="hex-pattern" patternUnits="userSpaceOnUse" width="60" height="104" patternTransform="scale(1.5) rotate(30)">
                    <path d="M30 0L60 17.32v34.64L30 69.28 0 51.96V17.32z" fill="rgb(var(--color-accent-bg))" />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hex-pattern)" />
        </svg>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-slate-800 via-slate-800/80 to-transparent"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-slate-800 via-slate-800/80 to-transparent"></div>
        
        <div className="absolute w-full h-1/2 bg-[rgb(var(--color-accent-bg))] opacity-20 filter blur-3xl animate-[hex-scan_4s_ease-in-out_infinite]"></div>

        <div className="relative z-10 flex flex-col items-center justify-center p-8 space-y-3">
            <div className="w-12 h-12 border-4 border-[rgb(var(--color-accent-bg))] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-lg font-semibold text-[rgb(var(--color-accent-text))] text-center animate-[pulse-text_2s_ease-in-out_infinite]">Running Hextech Analysis...</p>
        </div>
    </div>
);

export const AdvicePanel: React.FC<AdvicePanelProps> = ({ advice, isLoading, error, userRole, navigateToAcademy }) => {
  const [feedbackState, setFeedbackState] = useState<'up' | 'down' | null>(null);
  const [showFeedbackOptions, setShowFeedbackOptions] = useState(false);

  useEffect(() => {
    // Reset feedback state when new advice comes in or loading starts
    setFeedbackState(null);
    setShowFeedbackOptions(false);
  }, [advice, isLoading]);
  
  const handleFeedback = (rating: 'up' | 'down') => {
    if (rating === 'up') {
        setFeedbackState('up');
        // In a real app, send analytics event
        console.log(`Feedback received for analysis: up`);
    } else {
        setShowFeedbackOptions(true);
    }
  };

  const handleGranularFeedback = (issue: string) => {
    // In a real app, send detailed analytics event
    console.log(`Feedback received for analysis: down, Reason: ${issue}`);
    setShowFeedbackOptions(false);
    setFeedbackState('down'); // To show the "thank you" message
  };

  if (isLoading) {
    return (
      <div className="bg-slate-800 p-4 rounded-lg shadow-inner h-full flex items-center justify-center border border-slate-700">
        <HextechLoader />
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
  const draftHighlight = blueAnalysis.draftHighlight || redAnalysis.draftHighlight;

  return (
    <div aria-live="polite" className="bg-gradient-to-br from-slate-900 to-slate-800/80 p-4 rounded-lg shadow-inner space-y-3 max-h-[calc(100vh-20rem)] overflow-y-auto border border-slate-700/50">
      <h2 className={`font-display text-2xl font-bold text-center mb-1 ${analysisTitle.className}`}>{analysisTitle.title}</h2>
      {userRole && userRole !== 'All' && (
          <p className="text-xs text-center text-cyan-400/70 -mt-1 mb-2">Personalized for a {userRole} main</p>
      )}
      <p className="text-sm text-center text-gray-300 mb-4"><KeywordHighlighter text={blueAnalysis.draftScoreReasoning || ''} onKeywordClick={navigateToAcademy} /></p>
      
      {draftHighlight && (
        <div className="bg-slate-700/50 p-3 rounded-lg border border-yellow-500/30 text-center mb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-yellow-300">Draft Highlight</h3>
            <p className="font-semibold text-white mt-1">
                {draftHighlight.championName}: <span className="font-normal text-gray-300">{draftHighlight.reasoning}</span>
            </p>
        </div>
      )}

      {(blueAnalysis.draftScore || redAnalysis.draftScore) && (
        <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-blue-900/30 p-3 rounded-lg border border-blue-500/30">
                <div className="flex items-center justify-center gap-2 text-3xl font-black text-blue-300">
                    {getIconForGrade(blueAnalysis.draftScore)}
                    <span>{blueAnalysis.draftScore || '?'}</span>
                </div>
                <div className="text-xs text-blue-200">Blue Team Score</div>
            </div>
            <div className="bg-red-900/30 p-3 rounded-lg border border-red-500/30">
                <div className="flex items-center justify-center gap-2 text-3xl font-black text-red-300">
                    {getIconForGrade(redAnalysis.draftScore)}
                    <span>{redAnalysis.draftScore || '?'}</span>
                </div>
                <div className="text-xs text-red-200">Red Team Score</div>
            </div>
        </div>
      )}

      {blueAnalysis.powerSpikeTimeline && (
          <AdviceSection title="Projected Draft Story" defaultOpen={true}>
              <PowerSpikeTimeline timeline={blueAnalysis.powerSpikeTimeline} />
          </AdviceSection>
      )}

      <ImprovementOpportunities weaknesses={blueAnalysis.weaknesses} navigateToAcademy={navigateToAcademy} />

      <AdviceSection title="Pick Suggestions" defaultOpen={!blueAnalysis.powerSpikeTimeline}>
        <ul className="space-y-2 text-sm">
          {advice.pickSuggestions.slice(0, 3).map(p => (
            <li key={p.championName} className="p-3 bg-slate-700/50 rounded-md border border-slate-600/50">
              <strong className="text-[rgb(var(--color-accent-text))]">{p.championName} ({p.role})</strong>: <KeywordHighlighter text={p.reasoning} onKeywordClick={navigateToAcademy} />
            </li>
          ))}
        </ul>
      </AdviceSection>

       <AdviceSection title="Ban Suggestions">
        <ul className="space-y-2 text-sm">
          {advice.banSuggestions.slice(0, 2).map(b => (
            <li key={b.championName} className="p-3 bg-slate-700/50 rounded-md border border-slate-600/50">
              <strong className="text-red-300">{b.championName}</strong>: <KeywordHighlighter text={b.reasoning} onKeywordClick={navigateToAcademy} />
            </li>
          ))}
        </ul>
      </AdviceSection>

      <AdviceSection title="Team Analysis">
        <div className="grid grid-cols-1 gap-4 text-xs">
            <div className="p-3 bg-blue-900/30 rounded-md border border-blue-500/20 space-y-1">
                <h4 className="font-bold text-blue-400 mb-1">Blue Team</h4>
                <TeamAnalysisDetail label="Identity" value={blueAnalysis.teamIdentity} onKeywordClick={navigateToAcademy} />
                <TeamAnalysisDetail label="Power Spike" value={blueAnalysis.powerSpike} onKeywordClick={navigateToAcademy} />
                <TeamAnalysisDetail label="Win Con" value={blueAnalysis.winCondition} onKeywordClick={navigateToAcademy} />
                 <TeamAnalysisDetail label="Key Threats" value={redAnalysis.keyThreats} onKeywordClick={navigateToAcademy} />
            </div>
             <div className="p-3 bg-red-900/30 rounded-md border border-red-500/20 space-y-1">
                <h4 className="font-bold text-red-400 mb-1">Red Team</h4>
                <TeamAnalysisDetail label="Identity" value={redAnalysis.teamIdentity} onKeywordClick={navigateToAcademy} />
                <TeamAnalysisDetail label="Power Spike" value={redAnalysis.powerSpike} onKeywordClick={navigateToAcademy} />
                <TeamAnalysisDetail label="Win Con" value={redAnalysis.winCondition} onKeywordClick={navigateToAcademy} />
                <TeamAnalysisDetail label="Key Threats" value={blueAnalysis.keyThreats} onKeywordClick={navigateToAcademy} />
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
      
      <div className="pt-3 mt-3 border-t border-slate-700/50 text-center">
        {feedbackState ? (
          <p className="text-sm text-green-400">Thank you for your feedback!</p>
        ) : showFeedbackOptions ? (
             <div>
                <p className="text-sm text-gray-300 mb-2">What was the issue?</p>
                <div className="flex flex-col sm:flex-row justify-center gap-2">
                    <Button variant="secondary" className="text-xs" onClick={() => handleGranularFeedback('Inaccurate Reasoning')}>Inaccurate Reasoning</Button>
                    <Button variant="secondary" className="text-xs" onClick={() => handleGranularFeedback('Bad Champion Suggestion')}>Bad Champion Suggestion</Button>
                    <Button variant="secondary" className="text-xs" onClick={() => handleGranularFeedback('Unclear Explanation')}>Unclear Explanation</Button>
                </div>
            </div>
        ) : (
          <>
            <p className="text-sm text-gray-300 mb-2">Was this analysis helpful?</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => handleFeedback('up')} aria-label="Helpful" className="p-2 rounded-full bg-slate-700 hover:bg-green-600 text-gray-300 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333V17a1 1 0 001 1h6.364a1 1 0 00.943-.684l1.714-4.286a1 1 0 00-.02-1.033l-3.32-4.648a1 1 0 00-.944-.314H8a1 1 0 00-1 1v1.167a2.25 2.25 0 01-1.25-2.025V6.5a1 1 0 00-1-1H6z" />
                </svg>
              </button>
              <button onClick={() => handleFeedback('down')} aria-label="Not helpful" className="p-2 rounded-full bg-slate-700 hover:bg-red-600 text-gray-300 hover:text-white transition-colors">
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