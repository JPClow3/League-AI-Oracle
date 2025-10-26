import React, { useState, useMemo } from 'react';
import type { AIAdvice, TeamAnalysis } from '../../types';
import { Loader } from '../common/Loader';
import { KeywordHighlighter } from '../Academy/KeywordHighlighter';
import { PowerSpikeTimeline } from './PowerSpikeTimeline';
import { ThumbsUp, ThumbsDown, Info, AlertTriangle, ChevronsRight, Swords, Link, Sparkles, Copy, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { KEYWORDS } from '../Academy/lessons';
import { Button } from '../common/Button';
import { useChampions } from '../../contexts/ChampionContext';

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
                {...{
                    initial: { scale: 0.8, opacity: 0 },
                    animate: { scale: 1, opacity: 1 },
                    transition: { duration: 0.5, delay: 0.2, type: 'spring' },
                }}
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
        {active && <motion.div {...{ layoutId: "advice-tab-underline" }} className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />}
    </button>
);

const KeyMatchupCard = ({ matchup }: { matchup: NonNullable<TeamAnalysis['keyMatchups']>[0] }) => {
    const { championsLite } = useChampions();
    const blueChamp = championsLite.find(c => c.name === matchup.blueChampion);
    const redChamp = championsLite.find(c => c.name === matchup.redChampion);
    
    return (
        <div className="bg-surface-primary p-4 border border-border">
            <h4 className="font-semibold text-text-secondary text-center mb-2 uppercase text-xs tracking-wider">{matchup.role}</h4>
            <div className="grid grid-cols-[1fr,auto,1fr] gap-2 items-center">
                <div className="flex items-center justify-center gap-2 text-team-blue">
                    {blueChamp && <img src={blueChamp.image} alt={blueChamp.name} className="w-6 h-6" />}
                    <span className="font-bold truncate">{matchup.blueChampion}</span>
                </div>
                <Swords className="h-5 w-5 text-text-muted" />
                <div className="flex items-center justify-center gap-2 text-team-red">
                    <span className="font-bold truncate">{matchup.redChampion}</span>
                    {redChamp && <img src={redChamp.image} alt={redChamp.name} className="w-6 h-6" />}
                </div>
            </div>
            <p className="text-xs text-text-secondary mt-2 text-center italic">"<KeywordHighlighter text={matchup.analysis} />"</p>
        </div>
    );
};

const SynergyCard = ({ synergy, type }: { synergy: NonNullable<TeamAnalysis['synergies']>[0], type: 'good' | 'bad' }) => {
    const Icon = type === 'good' ? Link : Sparkles;
    const color = type === 'good' ? 'text-success' : 'text-warning';
    
    return (
        <div className="flex items-start gap-3 text-sm bg-surface p-3 border border-border">
            <Icon className={`h-5 w-5 ${color} flex-shrink-0 mt-0.5`} />
            <div>
                <p className="font-bold text-text-primary">{synergy.championNames.join(' + ')}</p>
                <p className="text-text-secondary text-xs italic">"<KeywordHighlighter text={synergy.reasoning} />"</p>
            </div>
        </div>
    );
}

const TeamAnalysisContent = ({ analysis, navigateToAcademy }: { analysis: TeamAnalysis, navigateToAcademy: (lessonId: string) => void }) => {
     const improvementOpportunities = useMemo(() => {
        return (analysis.weaknesses || [])
            .map(weakness => {
                const keyword = weakness.keyword;
                const lesson = keyword ? KEYWORDS.find(k => k.term.toLowerCase() === keyword.toLowerCase()) : null;
                if (keyword && lesson) {
                    return { weakness: weakness.description, keyword, lessonId: lesson.lessonId };
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
            {improvementOpportunities.length > 0 && (
                <div className="md:col-span-2 mt-4 p-4 bg-secondary/50 rounded-lg border border-accent/20">
                    <h4 className="font-semibold text-accent mb-3 flex items-center gap-2">
                        <GraduationCap size={20} />
                        Improvement Opportunities
                    </h4>
                    <ul className="space-y-2">
                        {improvementOpportunities.map(({ keyword, lessonId }) => (
                            <li key={keyword} className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm bg-surface/50 p-2 rounded-md">
                                <p className="mb-2 sm:mb-0">Your draft shows a weakness in: <strong className="text-text-primary">{keyword}</strong></p>
                                <Button variant="secondary" onClick={() => navigateToAcademy(lessonId)}>Learn more about {keyword}</Button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
             {(analysis.synergies?.length || analysis.antiSynergies?.length) && (
                <div className="md:col-span-2 space-y-4 pt-4 border-t border-border">
                     <h3 className="font-semibold text-lg text-accent">Synergies & Clashes</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            {(analysis.synergies || []).map((s, i) => <React.Fragment key={`syn-${i}`}><SynergyCard synergy={s} type="good" /></React.Fragment>)}
                        </div>
                        <div className="space-y-2">
                             {(analysis.antiSynergies || []).map((s, i) => <React.Fragment key={`asyn-${i}`}><SynergyCard synergy={s} type="bad" /></React.Fragment>)}
                        </div>
                     </div>
                </div>
            )}
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
                            <React.Fragment key={i}><KeyMatchupCard matchup={matchup} /></React.Fragment>
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
                                <div key={p.championName} className="bg-surface p-3 border border-border group relative">
                                    <button 
                                        onClick={() => {
                                            navigator.clipboard.writeText(p.championName);
                                            toast.success(`${p.championName} copied!`);
                                        }}
                                        className="absolute top-2 right-2 p-1 text-text-muted opacity-50 group-hover:opacity-100 transition-opacity"
                                        aria-label={`Copy ${p.championName}`}
                                    >
                                        <Copy size={14} />
                                    </button>
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
                                <div key={b.championName} className="bg-surface p-3 border border-border group relative">
                                    <button 
                                        onClick={() => {
                                            navigator.clipboard.writeText(b.championName);
                                            toast.success(`${b.championName} copied!`);
                                        }}
                                        className="absolute top-2 right-2 p-1 text-text-muted opacity-50 group-hover:opacity-100 transition-opacity"
                                        aria-label={`Copy ${b.championName}`}
                                    >
                                        <Copy size={14} />
                                    </button>
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

const BuildSuggestionsContent = ({ builds }: { builds: NonNullable<AIAdvice['buildSuggestions']> }) => {
    if (!builds || builds.length === 0) {
        return <div className="text-center p-8 text-text-secondary">No specific build suggestions available for this draft.</div>;
    }
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {builds.map(build => (
                <div key={build.championName} className="bg-surface p-4 border border-border space-y-4">
                    <h3 className="text-xl font-bold text-text-primary">{build.championName} ({build.role})</h3>
                    <p className="text-sm italic text-text-secondary">"<KeywordHighlighter text={build.reasoning} />"</p>
                    
                    <div>
                        <h4 className="font-semibold text-accent mb-2">Runes</h4>
                         <div className="bg-secondary p-3 text-sm rounded-md border border-border-secondary">
                            <p><strong className="font-semibold">{build.runes.primaryPath}:</strong> {build.runes.keystone}</p>
                            <p><strong className="font-semibold">{build.runes.secondaryPath}</strong></p>
                        </div>
                    </div>
                     <div>
                        <h4 className="font-semibold text-accent mb-2">Item Build</h4>
                        <div className="space-y-2 text-sm">
                            <p><strong className="font-semibold text-text-secondary">Core:</strong> {build.coreItems.join(', ')}</p>
                            <div>
                                <strong className="font-semibold text-text-secondary">Situational:</strong>
                                <ul className="list-disc list-inside text-text-secondary">
                                    {build.situationalItems.map(item => <li key={item.item}><strong className="text-text-primary">{item.item}:</strong> {item.reason}</li>)}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

const analysisMessages = [
    "Initializing strategic analysis...",
    "Evaluating Blue Team's win condition...",
    "Assessing Red Team's synergies...",
    "Comparing power spike timings...",
    "Calculating draft scores...",
    "Finalizing recommendations...",
];

export const AdvicePanel = ({ advice, isLoading, error, navigateToAcademy, analysisCompleted, onAnimationEnd, isStale }: AdvicePanelProps) => {
  const [activeTab, setActiveTab] = useState<'blue' | 'red' | 'head-to-head' | 'builds'>('blue');
  
  if (isLoading) {
    return <div className="bg-bg-secondary p-4 border border-border-primary h-full"><Loader messages={analysisMessages} /></div>;
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
        
        <div className="border-b border-border flex justify-center flex-wrap">
            <TabButton active={activeTab === 'blue'} onClick={() => setActiveTab('blue')}>Blue Team</TabButton>
            <TabButton active={activeTab === 'red'} onClick={() => setActiveTab('red')}>Red Team</TabButton>
            <TabButton active={activeTab === 'head-to-head'} onClick={() => setActiveTab('head-to-head')}>Head-to-Head</TabButton>
            {advice.buildSuggestions && advice.buildSuggestions.length > 0 && (
                <TabButton active={activeTab === 'builds'} onClick={() => setActiveTab('builds')}>Builds</TabButton>
            )}
        </div>

        <div className="pt-4 min-h-[400px]">
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    {...{
                        initial: { opacity: 0, y: 10 },
                        animate: { opacity: 1, y: 0 },
                        exit: { opacity: 0, y: -10 },
                        transition: { duration: 0.2 },
                    }}
                >
                    {activeTab === 'blue' && <TeamAnalysisContent analysis={advice.teamAnalysis.blue} navigateToAcademy={navigateToAcademy} />}
                    {activeTab === 'red' && <TeamAnalysisContent analysis={advice.teamAnalysis.red} navigateToAcademy={navigateToAcademy} />}
                    {activeTab === 'head-to-head' && <HeadToHeadContent advice={advice} navigateToAcademy={navigateToAcademy} />}
                    {activeTab === 'builds' && advice.buildSuggestions && <BuildSuggestionsContent builds={advice.buildSuggestions} />}
                </motion.div>
            </AnimatePresence>
        </div>
    </div>
  );
};