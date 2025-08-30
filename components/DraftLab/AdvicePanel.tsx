import React, { useState, useMemo } from 'react';
import type { AIAdvice, TeamAnalysis } from '../../types';
import { Loader } from '../common/Loader';
import { KeywordHighlighter } from '../Academy/KeywordHighlighter';
import { PowerSpikeTimeline } from './PowerSpikeTimeline';
import { ThumbsUp, ThumbsDown, Info, AlertTriangle, ChevronsRight, Swords } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AdvicePanelProps {
  advice: AIAdvice | null;
  isLoading: boolean;
  error: string | null;
  userRole?: string;
  navigateToAcademy: (lessonId: string) => void;
  analysisCompleted: boolean;
  onAnimationEnd: () => void;
  isStale: boolean;
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
    const { className: gradeColor, title } = getAnalysisTitle(score);
    
    return (
        <div className={`relative flex flex-col items-center justify-center p-4 min-h-[120px] ${gradeColor}`}>
            <div className="absolute inset-0 bg-current opacity-5"></div>
            <motion.div
                className="relative flex items-start justify-center"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2, type: 'spring' }}
            >
                 <span className="font-display font-black text-7xl" style={{ textShadow: '0 0 10px currentColor' }}>{grade}</span>
                 <span className="font-display font-bold text-2xl mt-2">{modifier}</span>
            </motion.div>
            <p className="font-semibold text-sm mt-1">{title}</p>
        </div>
    );
};

const StaleWarning = () => (
    <div className="bg-warning/10 text-warning p-3 rounded-md flex items-center gap-3 border-2 border-warning/20 mb-4">
        <AlertTriangle className="h-8 w-8 flex-shrink-0" />
        <div>
            <strong className="font-bold text-base">Analysis is Out of Date</strong>
            <p className="text-sm">The draft has changed. Re-analyze for updated insights.</p>
        </div>
    </div>
);

const TabButton = ({ active, onClick, children }: { active: boolean, onClick: () => void, children: React.ReactNode }) => (
    <button onClick={onClick} className={`relative px-4 py-2 font-semibold transition-colors ${active ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}>
        {children}
        {active && <motion.div layoutId="advice-tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />}
    </button>
);

const KeyMatchupCard = ({ matchup }: { matchup: NonNullable<TeamAnalysis['keyMatchups']>[0] }) => (
    <div className="bg-surface-primary p-4 border border-border">
        <h4 className="font-semibold text-text-secondary text-center mb-2 uppercase text-xs tracking-wider">{matchup.role}</h4>
        <div className="grid grid-cols-[1fr,auto,1fr] gap-2 items-center">
            <div className="text-center font-bold text-team-blue truncate">{matchup.blueChampion}</div>
            <Swords className="h-5 w-5 text-text-muted" />
            <div className="text-center font-bold text-team-red truncate">{matchup.redChampion}</div>
        </div>
        <p className="text-xs text-text-secondary mt-2 text-center italic">"<KeywordHighlighter text={matchup.analysis} />"</p>
    </div>
);


const TeamAnalysisContent = ({ analysis, navigateToAcademy }: { analysis: TeamAnalysis, navigateToAcademy: (lessonId: string) => void }) => {
     const improvementOpportunities = useMemo(() => {
        return (analysis.weaknesses || [])
            .map(weakness => {
                const keyword = weakness.keyword;
                if (keyword) {
                    return { weakness: weakness.description, keyword };
                }
                return null;
            })
            .filter((item): item is NonNullable<typeof item> => item !== null);
    }, [analysis.weaknesses]);
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
                {analysis.draftScore && <GradeDisplay score={analysis.draftScore} />}
                <div className="bg-surface p-3 text-center text-sm italic text-text-secondary">{analysis.draftScoreReasoning}</div>

                <div className="bg-surface p-4 border border-border space-y-2">
                    <h3 className="font-semibold text-lg text-accent">Summary</h3>
                     <p className="text-sm"><strong className="font-semibold text-text-primary">Identity:</strong> <KeywordHighlighter text={analysis.teamIdentity} onKeywordClick={navigateToAcademy} /></p>
                    <p className="text-sm"><strong className="font-semibold text-text-primary">Win Condition:</strong> <KeywordHighlighter text={analysis.winCondition} onKeywordClick={navigateToAcademy} /></p>
                </div>
            </div>
             <div className="space-y-4">
                 <div className="bg-surface p-4 border border-border space-y-3">
                    <h3 className="font-semibold text-lg text-accent">Strengths</h3>
                    <ul className="space-y-2 text-sm">
                        {(analysis.strengths || []).map((s, i) => (
                            <li key={`s-${i}`} className="flex items-start gap-2">
                                <ThumbsUp className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                                <KeywordHighlighter text={s} onKeywordClick={navigateToAcademy} />
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="bg-surface p-4 border border-border space-y-3">
                    <h3 className="font-semibold text-lg text-error">Weaknesses</h3>
                     <ul className="space-y-2 text-sm">
                        {(analysis.weaknesses || []).map((w, i) => (
                            <li key={`w-${i}`} className="flex items-start gap-2">
                                <ThumbsDown className="h-4 w-4 text-error flex-shrink-0 mt-0.5" />
                                <KeywordHighlighter text={w.description} onKeywordClick={navigateToAcademy} />
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

const HeadToHeadContent = ({ advice, navigateToAcademy }: { advice: AIAdvice, navigateToAcademy: (lessonId: string) => void }) => {
    return (
        <div className="space-y-6">
            <div>
                 <h3 className="font-semibold text-lg text-accent mb-2">Power Spike Timeline</h3>
                 <PowerSpikeTimeline timeline={advice.teamAnalysis.blue.powerSpikeTimeline!} />
            </div>

            {advice.teamAnalysis.blue.keyMatchups && advice.teamAnalysis.blue.keyMatchups.length > 0 && (
                <div>
                     <h3 className="font-semibold text-lg text-accent mb-2">Key Matchups</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {advice.teamAnalysis.blue.keyMatchups.map((matchup, i) => (
                            <KeyMatchupCard key={i} matchup={matchup} />
                        ))}
                     </div>
                </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
                {advice.pickSuggestions && advice.pickSuggestions.length > 0 && (
                    <div>
                        <h3 className="font-semibold text-lg text-accent mb-2">Pick Suggestions</h3>
                        <div className="space-y-2">
                            {advice.pickSuggestions.slice(0, 3).map(p => (
                                <div key={p.championName} className="bg-surface p-3 border border-border">
                                    <h4 className="font-bold text-text-primary">{p.championName} ({p.role})</h4>
                                    <p className="text-xs text-text-secondary"><KeywordHighlighter text={p.reasoning} onKeywordClick={navigateToAcademy} /></p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                 {advice.banSuggestions && advice.banSuggestions.length > 0 && (
                    <div>
                        <h3 className="font-semibold text-lg text-accent mb-2">Ban Suggestions</h3>
                        <div className="space-y-2">
                            {advice.banSuggestions.slice(0, 2).map(b => (
                                <div key={b.championName} className="bg-surface p-3 border border-border">
                                    <h4 className="font-bold text-text-primary">{b.championName}</h4>
                                    <p className="text-xs text-text-secondary"><KeywordHighlighter text={b.reasoning} onKeywordClick={navigateToAcademy} /></p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export const AdvicePanel = ({ advice, isLoading, error, navigateToAcademy, analysisCompleted, onAnimationEnd, isStale }: AdvicePanelProps) => {
  const [activeTab, setActiveTab] = useState<'blue' | 'red' | 'head-to-head'>('blue');
  
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

  return (
    <div 
        className={`bg-bg-secondary border border-border-primary p-4 space-y-4 transition-shadow duration-1000 ${analysisCompleted ? 'shadow-glow-accent animate-pulse-once' : ''}`}
        onAnimationEnd={onAnimationEnd}
    >
        {isStale && <StaleWarning />}
        
        <div className="border-b border-border flex justify-center">
            <TabButton active={activeTab === 'blue'} onClick={() => setActiveTab('blue')}>Blue Team Analysis</TabButton>
            <TabButton active={activeTab === 'head-to-head'} onClick={() => setActiveTab('head-to-head')}>Head-to-Head</TabButton>
            <TabButton active={activeTab === 'red'} onClick={() => setActiveTab('red')}>Red Team Analysis</TabButton>
        </div>

        <div className="pt-4 min-h-[400px]">
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === 'blue' && <TeamAnalysisContent analysis={advice.teamAnalysis.blue} navigateToAcademy={navigateToAcademy} />}
                    {activeTab === 'red' && <TeamAnalysisContent analysis={advice.teamAnalysis.red} navigateToAcademy={navigateToAcademy} />}
                    {activeTab === 'head-to-head' && <HeadToHeadContent advice={advice} navigateToAcademy={navigateToAcademy} />}
                </motion.div>
            </AnimatePresence>
        </div>
    </div>
  );
};