import React, { useState, useMemo, useEffect } from 'react';
import { KnowledgeConcept, View, RichLessonContent, DDragonData, Champion, PowerCurveSection, CaseStudy } from '../types';
import { KNOWLEDGE_BASE } from '../data/knowledgeBase';
import { TRIALS_DATA } from '../data/trialsData';
import { useProfile } from '../contexts/ProfileContext';
import { Icon } from './common/Icon';
import InteractiveText from './common/InteractiveText';
import { ChampionIcon } from './common/ChampionIcon';

interface LessonsScreenProps {
  setView: (view: View) => void;
  selectedLessonId: string | null;
  onClearSelectedLesson: () => void;
  onNavigateToTrial: (trialId: string) => void;
  ddragonData: DDragonData; // Passed from App.tsx
}

const ROTATING_CATEGORIES = ['Drafting Fundamentals', 'In-Game Concepts'];
const MAX_LESSONS_PER_ROTATING_CATEGORY = 3;

const LessonCard: React.FC<{
    lesson: KnowledgeConcept;
    isCompleted: boolean;
    onClick: () => void;
}> = ({ lesson, isCompleted, onClick }) => (
    <div
        onClick={onClick}
        className={`bg-white dark:bg-slate-800/80 p-6 rounded-lg shadow-md border-2 transition-all duration-200 cursor-pointer transform hover:-translate-y-1 h-full flex flex-col
            ${isCompleted ? 'border-teal-600 dark:border-teal-400' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-600 dark:hover:border-indigo-500'}`}
    >
        <div className="flex items-center gap-4 mb-3">
            <div className="text-indigo-600 dark:text-indigo-400">
                <Icon name={lesson.icon as any} className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-display font-semibold flex-1">{lesson.title}</h3>
            {isCompleted && <Icon name="check" className="w-7 h-7 text-teal-500" />}
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 flex-grow">{lesson.description}</p>
    </div>
);

const shuffleArray = <T,>(array: T[]): T[] => {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
};

// Rich Text Renderer with Champion Icons and Glossary
const RichTextRenderer: React.FC<{ text: string; ddragonData: DDragonData; onKeywordClick: (lessonId: string) => void; }> = ({ text, ddragonData, onKeywordClick }) => {
    const { championMap, championRegex } = useMemo(() => {
        const champions = Object.values(ddragonData.champions);
        const map = new Map(champions.map(c => [c.name.toLowerCase(), c]));
        // Regex to find champion names as whole words, case-insensitive
        const regex = new RegExp(`\\b(${champions.map(c => c.name).join('|')})\\b`, 'gi');
        return { championMap: map, championRegex: regex };
    }, [ddragonData]);

    // Split the text by champion names, but keep the delimiters
    const parts = text.split(championRegex);

    return (
        <span className="inline leading-relaxed">
            {parts.map((part, index) => {
                const lowerPart = part.toLowerCase();
                if (championMap.has(lowerPart)) {
                    const champion = championMap.get(lowerPart);
                    return (
                        <span key={index} className="inline-flex items-center not-prose whitespace-nowrap align-middle mx-1">
                            <ChampionIcon champion={champion!} version={ddragonData.version} isClickable={false} className="w-6 h-6 rounded-full inline-block" showName={false} />
                            <b className="ml-1 text-indigo-600 dark:text-indigo-400">{part}</b>
                        </span>
                    );
                }
                return <InteractiveText key={index} onKeywordClick={onKeywordClick}>{part}</InteractiveText>;
            })}
        </span>
    );
};

const PowerCurveGraph: React.FC<{ highlighted: 'early' | 'mid' | 'late' | null }> = ({ highlighted }) => {
    const earlyPath = "M 0 80 C 15 20, 30 25, 50 40 C 70 55, 85 65, 100 75";
    const midPath = "M 0 85 C 20 75, 35 25, 50 15 C 65 25, 80 75, 100 85";
    const latePath = "M 0 90 C 20 85, 40 80, 60 60 C 80 30, 90 20, 100 10";
    
    const getCurveClass = (curve: 'early' | 'mid' | 'late') => {
        return `transition-all duration-300 ${highlighted === curve || !highlighted ? 'opacity-100' : 'opacity-20'}`;
    };

    return (
        <div className="p-4 bg-slate-100 dark:bg-slate-900/50 rounded-lg">
            <svg viewBox="-5 -5 110 110" className="w-full h-auto">
                {/* Axes */}
                <line x1="0" y1="0" x2="0" y2="100" stroke="currentColor" className="text-slate-300 dark:text-slate-600" strokeWidth="0.5" />
                <line x1="0" y1="100" x2="100" y2="100" stroke="currentColor" className="text-slate-300 dark:text-slate-600" strokeWidth="0.5" />
                {/* Curves */}
                <path d={earlyPath} stroke="#ef4444" strokeWidth="2" fill="none" className={getCurveClass('early')} />
                <path d={midPath} stroke="#eab308" strokeWidth="2" fill="none" className={getCurveClass('mid')} />
                <path d={latePath} stroke="#22c55e" strokeWidth="2" fill="none" className={getCurveClass('late')} />
            </svg>
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
                <span>Early Game</span>
                <span>Mid Game</span>
                <span>Late Game</span>
            </div>
            <div className="mt-2 flex justify-center gap-4 text-xs">
                <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-rose-500"></div><span className="text-rose-500">Early Game Spike</span></div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-yellow-500"></div><span className="text-yellow-500">Mid Game Spike</span></div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-green-500"></div><span className="text-green-500">Late Game Spike</span></div>
            </div>
        </div>
    );
};

const MiniChallenge: React.FC<{
    challenge: RichLessonContent['miniChallenge'];
    ddragonData: DDragonData;
}> = ({ challenge, ddragonData }) => {
    const [selection, setSelection] = useState<{ name: string; correct: boolean } | null>(null);

    const handleSelect = (option: { championName: string; isCorrect: boolean }) => {
        setSelection({ name: option.championName, correct: option.isCorrect });
    };

    const getChampion = (name: string) => Object.values(ddragonData.champions).find(c => c.name === name) || null;

    return (
        <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
            <h4 className="font-display text-2xl text-center text-amber-600 dark:text-amber-400 mb-4">Mini-Challenge</h4>
            <p className="text-center mb-6">{challenge.question}</p>
            <div className="flex justify-center gap-4">
                {challenge.options.map(opt => {
                    const isSelected = selection?.name === opt.championName;
                    const champion = getChampion(opt.championName);
                    return (
                        <button key={opt.championName} onClick={() => handleSelect(opt)} disabled={!!selection}
                            className={`p-2 rounded-lg transition-all duration-200 disabled:cursor-not-allowed
                            ${isSelected && opt.isCorrect ? 'bg-teal-500/20 ring-2 ring-teal-500' : ''}
                            ${isSelected && !opt.isCorrect ? 'bg-rose-500/20 ring-2 ring-rose-500' : ''}
                            ${!isSelected ? 'hover:bg-slate-200 dark:hover:bg-slate-700' : ''}
                            ${selection && !isSelected ? 'opacity-50' : ''}
                            `}
                        >
                            {champion && <ChampionIcon champion={champion} version={ddragonData.version} className="w-20 h-20" isClickable={false}/>}
                        </button>
                    )
                })}
            </div>
            {selection && (
                <div className={`mt-4 p-3 rounded-md text-sm text-center animate-fade-in ${selection.correct ? 'bg-teal-500/10 text-teal-800 dark:text-teal-300' : 'bg-rose-500/10 text-rose-800 dark:text-rose-300'}`}>
                    <RichTextRenderer text={selection.correct ? challenge.feedback.correct : challenge.feedback.incorrect} ddragonData={ddragonData} onKeywordClick={() => {}} />
                </div>
            )}
        </div>
    )
}

const IntroBlock: React.FC<{ intro: RichLessonContent['intro']; onKeywordClick: (id: string) => void; ddragonData: DDragonData }> = ({ intro, onKeywordClick, ddragonData }) => (
    <div className="p-8 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
        <h2 className="text-4xl font-display text-indigo-600 dark:text-indigo-400 mb-4">{intro.title}</h2>
        <div className="text-lg text-slate-600 dark:text-slate-300">
            <RichTextRenderer text={intro.summary} ddragonData={ddragonData} onKeywordClick={onKeywordClick} />
        </div>
    </div>
);

const PowerCurveTabs: React.FC<{ powerCurves: RichLessonContent['powerCurves']; ddragonData: DDragonData; onKeywordClick: (id: string) => void; }> = ({ powerCurves, ddragonData, onKeywordClick }) => {
    const [activeTab, setActiveTab] = useState<'early' | 'mid' | 'late'>(powerCurves.curves[0].id);

    return (
        <div className="p-8 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
            <h3 className="text-3xl font-display mb-2">{powerCurves.title}</h3>
            <div className="text-slate-500 dark:text-slate-400 mb-6">
                <RichTextRenderer text={powerCurves.description} ddragonData={ddragonData} onKeywordClick={onKeywordClick} />
            </div>

            <PowerCurveGraph highlighted={activeTab} />

            <div className="mt-6">
                <div className="flex border-b border-slate-200 dark:border-slate-700">
                    {powerCurves.curves.map(curve => (
                        <button
                            key={curve.id}
                            onClick={() => setActiveTab(curve.id)}
                            className={`px-4 py-2 font-semibold text-sm transition-colors duration-200 -mb-px border-b-2
                                ${activeTab === curve.id ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400'}`}
                        >
                            {curve.title}
                        </button>
                    ))}
                </div>
                <div className="pt-6">
                    {powerCurves.curves.map(curve => (
                        <div key={curve.id} className={`${activeTab === curve.id ? 'block' : 'hidden'} animate-fade-in`}>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {curve.champions.map(name => {
                                    const champion = Object.values(ddragonData.champions).find(c=>c.name===name)!;
                                    return <ChampionIcon key={name} champion={champion} version={ddragonData.version} isClickable={false} className="w-12 h-12" />
                                })}
                            </div>
                            <RichTextRenderer text={curve.text} ddragonData={ddragonData} onKeywordClick={onKeywordClick} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const CaseStudyBlock: React.FC<{ caseStudy: CaseStudy; ddragonData: DDragonData; onKeywordClick: (id: string) => void; }> = ({ caseStudy, ddragonData, onKeywordClick }) => (
    <div className="p-8 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
        <h3 className="text-3xl font-display mb-2">{caseStudy.title}</h3>
        <div className="text-slate-500 dark:text-slate-400 mb-6">
             <RichTextRenderer text={caseStudy.description} ddragonData={ddragonData} onKeywordClick={onKeywordClick} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start p-6 bg-slate-100 dark:bg-slate-900/50 rounded-lg">
            <div className="text-center">
                <h4 className="font-semibold text-rose-500 mb-2">{caseStudy.teamA.name}</h4>
                 <div className="flex justify-center gap-3">
                     {caseStudy.teamA.champions.map(name => <ChampionIcon key={name} champion={Object.values(ddragonData.champions).find(c=>c.name===name)!} version={ddragonData.version} isClickable={false} />)}
                 </div>
            </div>
            <div className="text-center">
                 <h4 className="font-semibold text-teal-500 mb-2">{caseStudy.teamB.name}</h4>
                 <div className="flex justify-center gap-3">
                    {caseStudy.teamB.champions.map(name => <ChampionIcon key={name} champion={Object.values(ddragonData.champions).find(c=>c.name===name)!} version={ddragonData.version} isClickable={false} />)}
                 </div>
            </div>
        </div>
        
        <div className="mt-6 border-t border-slate-200 dark:border-slate-700 pt-6">
             <h4 className="font-semibold text-indigo-600 dark:text-indigo-400 mb-2">The Strategic Problem & Solution</h4>
             <RichTextRenderer text={caseStudy.solution.text} ddragonData={ddragonData} onKeywordClick={onKeywordClick} />
             <div className="mt-4 flex flex-wrap gap-3">
                {caseStudy.solution.champions.map(name => <ChampionIcon key={name} champion={Object.values(ddragonData.champions).find(c=>c.name===name)!} version={ddragonData.version} isClickable={false} />)}
             </div>
        </div>
    </div>
);

const RichLessonDisplay: React.FC<{
    lesson: KnowledgeConcept;
    ddragonData: DDragonData;
    onKeywordClick: (lessonId: string) => void;
}> = ({ lesson, ddragonData, onKeywordClick }) => {
    const content = lesson.content as RichLessonContent;
    
    return (
        <div className="space-y-8">
            <IntroBlock intro={content.intro} ddragonData={ddragonData} onKeywordClick={onKeywordClick} />
            <PowerCurveTabs powerCurves={content.powerCurves} ddragonData={ddragonData} onKeywordClick={onKeywordClick} />
            <CaseStudyBlock caseStudy={content.caseStudy} ddragonData={ddragonData} onKeywordClick={onKeywordClick} />
            <MiniChallenge challenge={content.miniChallenge} ddragonData={ddragonData} />
        </div>
    );
}

const LessonsScreen: React.FC<LessonsScreenProps> = ({ setView, selectedLessonId, onClearSelectedLesson, onNavigateToTrial, ddragonData }) => {
    const { activeProfile, onProgressUpdate } = useProfile();
    const { settings } = activeProfile!;

    const [selectedLesson, setSelectedLesson] = useState<KnowledgeConcept | null>(null);
    
    const displayedLessons = useMemo(() => {
        const grouped = KNOWLEDGE_BASE.reduce((acc, lesson) => {
            (acc[lesson.category] = acc[lesson.category] || []).push(lesson);
            return acc;
        }, {} as Record<string, KnowledgeConcept[]>);

        ROTATING_CATEGORIES.forEach(category => {
            if (grouped[category]) {
                grouped[category] = shuffleArray(grouped[category]).slice(0, MAX_LESSONS_PER_ROTATING_CATEGORY);
            }
        });
        
        const categoryOrder = ['Drafting Fundamentals', 'In-Game Concepts', 'The Esports Ecosystem'];
        const orderedGrouped: Record<string, KnowledgeConcept[]> = {};
        for (const category of categoryOrder) {
            if (grouped[category]) {
                orderedGrouped[category] = grouped[category];
            }
        }
        return orderedGrouped;
    }, []);

    useEffect(() => {
        if (selectedLessonId) {
            const lesson = KNOWLEDGE_BASE.find(l => l.id === selectedLessonId);
            if (lesson) {
                handleLessonClick(lesson);
            }
            onClearSelectedLesson();
        }
    }, [selectedLessonId, onClearSelectedLesson]);

    const handleLessonClick = (lesson: KnowledgeConcept) => {
        setSelectedLesson(lesson);
        window.scrollTo(0, 0);
        if (!settings.completedLessons.includes(lesson.id)) {
            onProgressUpdate('lesson', lesson.id, 25);
        }
    };
    
    const onKeywordClick = (lessonId: string) => {
        const lesson = KNOWLEDGE_BASE.find(l => l.id === lessonId);
        if (lesson) {
            handleLessonClick(lesson);
        }
    };

    if (selectedLesson) {
        const correspondingTrial = TRIALS_DATA.find(t => t.lessonId === selectedLesson.id);
        const isRichLesson = typeof selectedLesson.content === 'object';

        return (
            <div className="max-w-4xl mx-auto animate-slide-fade-in">
                <button onClick={() => setSelectedLesson(null)} className="mb-4 text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                    <Icon name="chevron-right" className="w-4 h-4 transform rotate-180" /> Back to Knowledge Hub
                </button>
                
                {isRichLesson ? (
                    <RichLessonDisplay lesson={selectedLesson} ddragonData={ddragonData} onKeywordClick={onKeywordClick} />
                ) : (
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
                        <h2 className="text-4xl font-display mb-4">{selectedLesson.title}</h2>
                        <div className="prose prose-lg prose-slate dark:prose-invert max-w-none">
                            <RichTextRenderer text={selectedLesson.content as string} ddragonData={ddragonData} onKeywordClick={onKeywordClick}/>
                        </div>
                    </div>
                )}

                <div className="mt-8 p-6 bg-slate-100 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 text-center">
                    <h3 className="text-2xl font-display">Apply Your Knowledge</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-4">Put what you've learned into practice.</p>
                    <div className="flex justify-center gap-4">
                        {correspondingTrial && (
                             <button
                                onClick={() => onNavigateToTrial(correspondingTrial.id)}
                                className="px-5 py-2.5 font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2"
                            >
                                <Icon name="trials" className="w-5 h-5" />
                                Test in a Trial
                            </button>
                        )}
                        <button
                            onClick={() => setView(View.DRAFT_LAB)}
                            className="px-5 py-2.5 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                        >
                            <Icon name="lab" className="w-5 h-5" />
                            Experiment in Draft Lab
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div className="text-center mb-12">
                <h1 className="text-6xl font-display font-bold text-gradient-primary">Knowledge Hub</h1>
                <p className="text-xl text-slate-500 dark:text-slate-400 mt-2">Explore the strategy library. The fundamentals rotate to offer new insights on each visit.</p>
            </div>
            <div className="space-y-12">
                {Object.entries(displayedLessons).map(([category, lessons]) => (
                    <div key={category}>
                        <div className="flex justify-between items-center border-b-2 border-indigo-500/50 pb-2 mb-6">
                            <h2 className="text-3xl font-display ">{category}</h2>
                            {ROTATING_CATEGORIES.includes(category) && (
                                <span className="text-sm text-slate-500 dark:text-slate-400">Showing a selection of concepts</span>
                            )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {lessons.map((lesson, index) => (
                                <div key={lesson.id} className="animate-slide-fade-in" style={{ animationDelay: `${index * 50}ms`, opacity: 0, animationFillMode: 'forwards'}}>
                                    <LessonCard
                                        lesson={lesson}
                                        isCompleted={settings.completedLessons.includes(lesson.id)}
                                        onClick={() => handleLessonClick(lesson)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LessonsScreen;