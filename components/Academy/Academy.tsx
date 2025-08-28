import React, { useState, useMemo, useEffect, useRef } from 'react';
import { LESSONS } from './lessons';
import { KeywordHighlighter } from './KeywordHighlighter';
import type { Lesson } from '../../types';
import { Button } from '../common/Button';
import { Loader } from '../common/Loader';
import { generateLessonStream } from '../../services/geminiService';
import toast from 'react-hot-toast';
import { MarkdownRenderer } from '../common/MarkdownRenderer';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, ThumbsUp, ThumbsDown } from 'lucide-react';

interface AcademyProps {
    initialLessonId?: string;
    onHandled: () => void;
}

const FeedbackBox = ({ onFeedback, feedbackState }: { onFeedback: (rating: 'up' | 'down') => void, feedbackState?: 'up' | 'down' }) => {
    if (feedbackState) {
        return <p className="text-sm text-success">Thank you for your feedback!</p>;
    }
    
    return (
        <>
            <p className="text-sm text-text-secondary mb-2">Was this AI-generated lesson helpful?</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => onFeedback('up')} className="p-2 rounded-full bg-secondary hover:bg-success/20 text-text-secondary hover:text-success transition-colors">
                <ThumbsUp className="h-5 w-5" />
              </button>
              <button onClick={() => onFeedback('down')} className="p-2 rounded-full bg-secondary hover:bg-error/20 text-text-secondary hover:text-error transition-colors">
                 <ThumbsDown className="h-5 w-5" />
              </button>
            </div>
        </>
    );
};

export const Academy = ({ initialLessonId, onHandled }: AcademyProps) => {
    const [selectedLessonId, setSelectedLessonId] = useState<string>(initialLessonId || 'team-comp-archetypes');
    const [searchTerm, setSearchTerm] = useState('');
    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        if(initialLessonId) {
            setSelectedLessonId(initialLessonId);
            onHandled();
        }
    }, [initialLessonId, onHandled]);
    
    // Abort any ongoing stream on unmount
    useEffect(() => {
        return () => {
            abortControllerRef.current?.abort();
        };
    }, []);

    // State for AI-generated lessons
    const [generatedLessons, setGeneratedLessons] = useState<Lesson[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationError, setGenerationError] = useState<string | null>(null);
    const [currentGenerationId, setCurrentGenerationId] = useState<string | null>(null);
    const [generationFeedback, setGenerationFeedback] = useState<Record<string, 'up' | 'down'>>({});

    const staticLessons = useMemo(() => {
        const lowerSearch = searchTerm.toLowerCase();
        if (!lowerSearch) return LESSONS;
        
        return LESSONS.map(category => ({
            ...category,
            lessons: category.lessons.filter(lesson => 
                lesson.title.toLowerCase().includes(lowerSearch) || 
                lesson.content.toLowerCase().includes(lowerSearch)
            )
        })).filter(category => category.lessons.length > 0);
    }, [searchTerm]);

    const selectedLesson = useMemo(() => {
        for (const category of LESSONS) {
            const found = category.lessons.find(l => l.id === selectedLessonId);
            if (found) return { ...found, isGenerated: false };
        }
        const foundGenerated = generatedLessons.find(l => l.id === selectedLessonId);
        if (foundGenerated) return { ...foundGenerated, isGenerated: true };
        return null;
    }, [selectedLessonId, generatedLessons]);
    
    const handleGenerateLesson = async (topic: string) => {
        if (isGenerating) {
            toast.error("Please wait for the current lesson to finish generating.");
            return;
        }

        abortControllerRef.current?.abort();
        const controller = new AbortController();
        abortControllerRef.current = controller;
        
        const newLessonId = `gen-${Date.now()}`;
        setIsGenerating(true);
        setGenerationError(null);
        setCurrentGenerationId(newLessonId);
        
        const newLesson: Lesson = { id: newLessonId, title: topic, content: '' };
        setGeneratedLessons(prev => [newLesson, ...prev]);
        setSelectedLessonId(newLessonId);

        try {
            const stream = generateLessonStream(topic, controller.signal);
            for await (const chunk of stream) {
                if (controller.signal.aborted) return;
                setGeneratedLessons(prev => prev.map(l => l.id === newLessonId ? { ...l, content: l.content + chunk } : l));
            }
        } catch (err) {
            if (err instanceof DOMException && err.name === 'AbortError') return;
            setGenerationError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            if (!controller.signal.aborted) {
                setIsGenerating(false);
                setCurrentGenerationId(null);
            }
        }
    };
    
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 bg-surface-primary border border-border-primary p-4 shadow-sm">
                <div className="bg-surface-secondary text-info w-12 h-12 flex items-center justify-center flex-shrink-0">
                    <GraduationCap size={32} />
                </div>
                <div>
                    <h1 className="font-display text-3xl font-bold text-text-primary tracking-wide">The Academy</h1>
                    <p className="text-sm text-text-secondary">Your knowledge base for mastering high-level League of Legends strategy.</p>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1 space-y-4">
                     <input
                        type="text"
                        placeholder="Search lessons..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 bg-surface border border-border-primary focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                    
                    <div className="space-y-3">
                         {generatedLessons.length > 0 && (
                            <div>
                                <h3 className="font-semibold text-accent mb-2">Generated Lessons</h3>
                                {generatedLessons.map(lesson => (
                                    <button 
                                        key={lesson.id} 
                                        onClick={() => setSelectedLessonId(lesson.id)}
                                        className={`w-full text-left p-2 rounded-md text-sm ${selectedLessonId === lesson.id ? 'bg-secondary text-text-primary' : 'text-text-secondary hover:bg-surface'}`}
                                    >
                                        {lesson.title}
                                    </button>
                                ))}
                            </div>
                        )}
                        {staticLessons.map(category => (
                            <div key={category.name}>
                                <h3 className="font-semibold text-accent mb-2">{category.name}</h3>
                                {category.lessons.map(lesson => (
                                    <button 
                                        key={lesson.id} 
                                        onClick={() => setSelectedLessonId(lesson.id)}
                                        className={`w-full text-left p-2 rounded-md text-sm ${selectedLessonId === lesson.id ? 'bg-secondary text-text-primary' : 'text-text-secondary hover:bg-surface'}`}
                                    >
                                        {lesson.title}
                                    </button>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-3 bg-surface-primary p-6 border border-border-primary min-h-[600px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            {...{
                                key: selectedLessonId,
                                initial: { opacity: 0, y: 10 },
                                animate: { opacity: 1, y: 0 },
                                exit: { opacity: 0, y: -10 },
                                transition: { duration: 0.2 },
                            }}
                        >
                            {selectedLesson ? (
                                <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none prose-headings:text-accent prose-strong:text-text-primary">
                                    <h1>{selectedLesson.title}</h1>
                                    <MarkdownRenderer text={selectedLesson.content} />
                                    {isGenerating && currentGenerationId === selectedLesson.id && <div className="blinking-cursor" />}
                                    {generationError && currentGenerationId === selectedLesson.id && <p className="text-error">{generationError}</p>}
                                    {selectedLesson.isGenerated && !isGenerating && (
                                        <div className="mt-8 pt-4 border-t border-border text-center not-prose">
                                            <FeedbackBox 
                                                onFeedback={(rating) => setGenerationFeedback(prev => ({ ...prev, [selectedLesson.id]: rating }))}
                                                feedbackState={generationFeedback[selectedLesson.id]}
                                            />
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center p-8">
                                    <h2 className="text-xl font-semibold">Select a lesson to begin.</h2>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};