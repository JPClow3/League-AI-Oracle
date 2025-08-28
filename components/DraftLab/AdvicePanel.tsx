import React, { useState, useEffect, useMemo } from 'react';
import type { AIAdvice } from '../../types';
import { Loader } from '../common/Loader';
import { Tooltip } from '../common/Tooltip';
import { KeywordHighlighter } from '../Academy/KeywordHighlighter';
import { PowerSpikeTimeline } from './PowerSpikeTimeline';
import { KEYWORDS } from '../Academy/lessons';
import { ThumbsUp, ThumbsDown, ChevronDown, Info } from 'lucide-react';
import { Button } from '../common/Button';

interface AdvicePanelProps {
  advice: AIAdvice | null;
  isLoading: boolean;
  error: string | null;
  userRole?: string;
  navigateToAcademy: (lessonId: string) => void;
  analysisCompleted: boolean;
  onAnimationEnd: () => void;
}

const getAnalysisTitle = (score: string | undefined): { title: string, className: string } => {
    if (!score) return { title: 'Draft Analysis', className: 'text-text-primary' };
    if (score.startsWith('S')) return { title: 'Masterful Composition', className: 'text-success' };
    if (score.startsWith('A')) return { title: 'Excellent Composition', className: 'text-info' };
    if (score.startsWith('B')) return { title: 'Solid Foundation', className: 'text-gold' };
    if (score.startsWith('C')) return { title: 'Room for Improvement', className: 'text-warning' };
    return { title: 'Challenging Draft', className: 'text-error' };
};

const GradeDisplay = ({ score }: { score: string }) => {
    const grade = score.charAt(0);
    const modifier = score.length > 1 ? score.charAt(1) : '';
    const gradeColor = getAnalysisTitle(score).className;
    
    return (
        <div className={`relative flex items-center justify-center p-4 min-h-[100px] ${gradeColor}`}>
            <div className="absolute inset-0 bg-current opacity-5"></div>
            <div className="absolute inset-0 border-2 border-current opacity-20"></div>
            <div className="relative flex items-start justify-center">
                 <span className="font-display font-black text-7xl" style={{ textShadow: '0 0 10px currentColor' }}>{grade}</span>
                 <span className="font-display font-bold text-2xl mt-2">{modifier}</span>
            </div>
        </div>
    );
};

const StrengthIcon = () => (
    <div className="w-6 h-6 flex-shrink-0 bg-success/10 text-success rounded-full flex items-center justify-center">
        <ThumbsUp className="h-4 w-4" />
    </div>
);

const WeaknessIcon = () => (
    <div className="w-6 h-6 flex-shrink-0 bg-error/10 text-error rounded-full flex items-center justify-center">
        <ThumbsDown className="h-4 w-4" />
    </div>
);

const AdviceSection = ({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    useEffect(() => {
        setIsOpen(defaultOpen);
    }, [defaultOpen]);

    return (
      <div className="bg-surface-primary border border-border-primary">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex justify-between items-center p-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
          aria-expanded={isOpen}
          aria-controls={`section-content-${title.replace(/\s+/g, '-')}`}
        >
          <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
           <ChevronDown className={`h-5 w-5 text-text-secondary transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        {isOpen && (
          <div id={`section-content-${title.replace(/\s+/g, '-')}`} className="p-4 border-t border-border-primary bg-surface-secondary/30">
            {children}
          </div>
        )}
      </div>
    );
};

export const AdvicePanel = ({ advice, isLoading, error, userRole, navigateToAcademy, analysisCompleted, onAnimationEnd }: AdvicePanelProps) => {
  const [activeTeam, setActiveTeam] = useState<'blue' | 'red'>('blue');
  const teamAnalysis = advice?.teamAnalysis[activeTeam];

  const analysisTitle = getAnalysisTitle(teamAnalysis?.draftScore);
  
  const improvementOpportunities = useMemo(() => {
        if (!teamAnalysis?.weaknesses) return [];
        const found = new Set<string>();
        return (teamAnalysis.weaknesses || [])
            .map(weakness => {
                const keyword = weakness.keyword ? KEYWORDS.find(kw => kw.term.toLowerCase() === weakness.keyword!.toLowerCase()) : undefined;
                if (keyword && !found.has(keyword.lessonId)) {
                    found.add(keyword.lessonId);
                    return { weakness: weakness.description, keyword };
                }
                return null;
            })
            .filter((item): item is NonNullable<typeof item> => item !== null);
    }, [teamAnalysis]);


  if (isLoading) {
    return <div className="bg-bg-secondary p-4 border border-border-primary h-full"><Loader /></div>;
  }
  if (error) {
    return <div className="bg-error/10 text-error p-4 border border-error/20">{error}</div>;
  }
  if (!advice) {
    return (
      <div className="bg-bg-secondary text-text-secondary p-4 border border-border-primary text-center flex flex-col justify-center items-center h-full min-h-[300px]">
        <Info className="h-12 w-12 text-border-secondary mb-2" />
        <p className="font-semibold text-text-primary">Awaiting Analysis</p>
        <p className="text-sm">Complete a 5v5 draft and press 'Analyze' to receive AI-powered feedback.</p>
      </div>
    );
  }

  const pickSuggestions = userRole && userRole !== 'All' 
    ? [...(advice.pickSuggestions || [])].sort((a, b) => (a.role === userRole ? -1 : 1) - (b.role === userRole ? -1 : 1))
    : (advice.pickSuggestions || []);

  return (
    <div 
        className={`bg-bg-secondary border border-border-primary p-4 space-y-4 transition-shadow duration-1000 ${analysisCompleted ? 'shadow-glow-accent animate-pulse-once' : ''}`}
        onAnimationEnd={onAnimationEnd}
    >
      <div className="text-center">
        <div className="flex justify-center gap-2 mb-2 bg-surface-tertiary p-1">
            <button onClick={() => setActiveTeam('blue')} className={`w-full py-1.5 text-sm font-semibold transition-colors ${activeTeam === 'blue' ? 'bg-bg-secondary shadow-sm text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}>Blue Team</button>
            <button onClick={() => setActiveTeam('red')} className={`w-full py-1.5 text-sm font-semibold transition-colors ${activeTeam === 'red' ? 'bg-bg-secondary shadow-sm text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}>Red Team</button>
        </div>
        {teamAnalysis?.draftScore ? (
            <GradeDisplay score={teamAnalysis.draftScore} />
        ) : (
            <h2 className={`text-2xl font-bold ${analysisTitle.className}`}>{analysisTitle.title}</h2>
        )}
        <p className="font-semibold text-text-secondary text-sm italic mt-1">
            {teamAnalysis?.draftScoreReasoning}
        </p>
      </div>

      <div className="space-y-3">
        {improvementOpportunities.length > 0 && (
            <AdviceSection title="Improvement Opportunities" defaultOpen={true}>
                 <div className="space-y-2">
                    {improvementOpportunities.map(({ weakness, keyword }) => (
                         <div key={keyword.lessonId} className="bg-surface-primary p-3 border border-border-primary">
                            <p className="text-sm text-text-secondary mb-2">"<KeywordHighlighter text={weakness} onKeywordClick={navigateToAcademy} />"</p>
                            <Button
                                variant="secondary"
                                onClick={() => navigateToAcademy(keyword.lessonId)}
                                className="text-sm mt-2"
                            >
                                Learn more about {keyword.term}
                            </Button>
                        </div>
                    ))}
                 </div>
            </AdviceSection>
        )}
        
        {teamAnalysis?.powerSpikeTimeline && (
             <AdviceSection title="Power Spike Timeline" defaultOpen>
                <PowerSpikeTimeline timeline={teamAnalysis.powerSpikeTimeline} />
            </AdviceSection>
        )}

        <AdviceSection title="Team Analysis" defaultOpen>
            {teamAnalysis && (
                <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-2"><strong className="font-semibold text-text-primary w-28">Identity:</strong> <KeywordHighlighter text={teamAnalysis.teamIdentity} onKeywordClick={navigateToAcademy} /></li>
                    <li className="flex items-start gap-2"><strong className="font-semibold text-text-primary w-28">Win Condition:</strong> <KeywordHighlighter text={teamAnalysis.winCondition} onKeywordClick={navigateToAcademy} /></li>
                    {(teamAnalysis.strengths || []).map((s, i) => (
                        <li key={`s-${i}`} className="flex items-start gap-2">
                            <StrengthIcon />
                            <KeywordHighlighter text={s} onKeywordClick={navigateToAcademy} />
                        </li>
                    ))}
                    {(teamAnalysis.weaknesses || []).map((w, i) => (
                         <li key={`w-${i}`} className="flex items-start gap-2">
                            <WeaknessIcon />
                            <KeywordHighlighter text={w.description} onKeywordClick={navigateToAcademy} />
                        </li>
                    ))}
                </ul>
            )}
        </AdviceSection>

        {pickSuggestions.length > 0 && (
             <AdviceSection title="Pick Suggestions">
                <div className="space-y-3">
                    {pickSuggestions.slice(0, 3).map(p => (
                        <div key={p.championName} className="bg-surface-primary p-3 border border-border-primary">
                            <h4 className="font-bold text-text-primary">{p.championName} ({p.role})</h4>
                            <p className="text-sm text-text-secondary"><KeywordHighlighter text={p.reasoning} onKeywordClick={navigateToAcademy} /></p>
                        </div>
                    ))}
                </div>
            </AdviceSection>
        )}
        
        {(advice.banSuggestions || []).length > 0 && (
             <AdviceSection title="Ban Suggestions">
                 <div className="space-y-3">
                    {advice.banSuggestions.slice(0, 2).map(b => (
                        <div key={b.championName} className="bg-surface-primary p-3 border border-border-primary">
                            <h4 className="font-bold text-text-primary">{b.championName}</h4>
                            <p className="text-sm text-text-secondary"><KeywordHighlighter text={b.reasoning} onKeywordClick={navigateToAcademy} /></p>
                        </div>
                    ))}
                </div>
            </AdviceSection>
        )}
      </div>
    </div>
  );
};