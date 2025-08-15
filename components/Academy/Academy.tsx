import React, { useState, useMemo, useEffect, useRef } from 'react';
import { LESSONS } from './lessons';
import { KeywordHighlighter } from './KeywordHighlighter';
import type { Lesson } from '../../types';
import { Button } from '../common/Button';
import { Loader } from '../common/Loader';
import { generateLessonStream } from '../../services/geminiService';
import toast from 'react-hot-toast';
import { MarkdownRenderer } from '../common/MarkdownRenderer';

interface AcademyProps {
    initialLessonId?: string;
    onHandled: () => void;
}

const FeedbackBox: React.FC<{ onFeedback: (rating: 'up' | 'down') => void, feedbackState?: 'up' | 'down' }> = ({ onFeedback, feedbackState }) => {
    if (feedbackState) {
        return <p className="text-sm text-green-400">Thank you for your feedback!</p>;
    }
    
    return (
        <>
            <p className="text-sm text-gray-400 mb-2">Was this AI-generated lesson helpful?</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => onFeedback('up')} className="p-2 rounded-full bg-slate-700 hover:bg-green-600 text-gray-300 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333V17a1 1 0 001 1h6.364a1 1 0 00.943-.684l1.714-4.286a1 1 0 00-.02-1.033l-3.32-4.648a1 1 0 00-.944-.314H8a1 1 0 00-1 1v1.167a2.25 2.25 0 01-1.25-2.025V6.5a1 1 0 00-1-1H6z" />
                </svg>
              </button>
              <button onClick={() => onFeedback('down')} className="p-2 rounded-full bg-slate-700 hover:bg-red-600 text-gray-300 hover:text-white transition-colors">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667V3a1 1 0 00-1-1H6.636a1 1 0 00-.943.684L4 7.429a1 1 0 00.02 1.033l3.32 4.648a1 1 0 00.944.314H12a1 1 0 001-1V11.833a2.25 2.25 0 011.25 2.025V13.5a1 1 0 001 1H14z" />
                </svg>
              </button>
            </div>
        </>
    );
};

export const Academy: React.FC<AcademyProps> = ({ initialLessonId, onHandled }) => {
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
    const [generationTopic, setGenerationTopic] = useState('');
    const [lessonFeedback, setLessonFeedback] = useState<Record<string, 'up' | 'down'>>({});

    const allLessons = useMemo(() => {
        const staticLessons = LESSONS.flatMap(category => category.lessons);
        return [...generatedLessons, ...staticLessons];
    }, [generatedLessons]);

    const selectedLesson = useMemo(() => {
        return allLessons.find(l => l.id === selectedLessonId);
    }, [selectedLessonId, allLessons]);

    const filteredCategories = useMemo(() => {
        if (!searchTerm.trim()) return LESSONS;
        const lowercasedFilter = searchTerm.toLowerCase();
        
        return LESSONS.map(category => ({
            ...category,
            lessons: category.lessons.filter(lesson => 
                lesson.title.toLowerCase().includes(lowercasedFilter)
            )
        })).filter(category => category.lessons.length > 0);
    }, [searchTerm]);

    const handleLessonClick = (lesson: Lesson) => {
        setSelectedLessonId(lesson.id);
    };

    const handleGenerateLesson = async () => {
        if (!generationTopic.trim()) {
            toast.error("Please enter a topic.");
            return;
        }
        
        // Abort previous generation if it exists
        abortControllerRef.current?.abort();
        const controller = new AbortController();
        abortControllerRef.current = controller;

        setIsGenerating(true);
        setGenerationError(null);

        const newLessonId = `gen-${new Date().toISOString()}`;
        const newLessonTitle = generationTopic.trim().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        
        // Add a placeholder lesson immediately for better UX
        const placeholderLesson: Lesson = {
            id: newLessonId,
            title: newLessonTitle,
            content: ''
        };
        setGeneratedLessons(prev => [placeholderLesson, ...prev]);
        setSelectedLessonId(newLessonId);
        const currentTopic = generationTopic; // Capture topic before clearing
        setGenerationTopic('');

        try {
            const stream = generateLessonStream(currentTopic, controller.signal);
            for await (const chunk of stream) {
                if (controller.signal.aborted) break;
                setGeneratedLessons(prev => prev.map(l => 
                    l.id === newLessonId 
                    ? { ...l, content: l.content + chunk } 
                    : l
                ));
            }
            if (!controller.signal.aborted) {
                 toast.success("New lesson generated!");
            }
        } catch (err) {
            if (err instanceof DOMException && err.name === 'AbortError') {
              console.log("Lesson generation aborted.");
              return;
            }
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
            setGenerationError(errorMessage);
            toast.error(errorMessage);
            // Remove the failed placeholder
            setGeneratedLessons(prev => prev.filter(l => l.id !== newLessonId));
            // If the failed lesson was selected, select the first available lesson
            if (selectedLessonId === newLessonId) {
                 const staticLessons = LESSONS.flatMap(category => category.lessons);
                 setSelectedLessonId(staticLessons[0]?.id || 'team-comp-archetypes');
            }
        } finally {
             if (!controller.signal.aborted) {
                setIsGenerating(false);
            }
        }
    };

    const handleLessonFeedback = (lessonId: string, rating: 'up' | 'down') => {
        setLessonFeedback(prev => ({ ...prev, [lessonId]: rating }));
        console.log(`Feedback for lesson ${lessonId}: ${rating}`);
    };

    return (
        <div className="flex flex-col md:flex-row gap-6 h-full min-h-[calc(100vh-150px)]">
            {/* Left Panel: Lesson Browser */}
            <aside className="w-full md:w-1/3 lg:w-1/4 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-4 rounded-xl shadow-lg flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-slate-700/50 text-blue-300 w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-5.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-5.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222 4 2.222V20M1 12l5.354-3.333M23 12l-5.354-3.333" /></svg>
                    </div>
                    <h2 className="font-display text-2xl font-bold text-white">Academy</h2>
                </div>
                
                 {/* Lesson Generation Section */}
                <div className="mb-4 p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
                     <h3 className="font-semibold text-blue-300 text-sm mb-2">Generate a New Lesson</h3>
                     <input
                        type="text"
                        placeholder="e.g., Wave Management"
                        value={generationTopic}
                        onChange={(e) => setGenerationTopic(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        disabled={isGenerating}
                     />
                     <Button onClick={handleGenerateLesson} disabled={isGenerating} className="w-full mt-2 text-sm" variant="primary">
                        {isGenerating ? 'Generating...' : 'Generate Lesson'}
                     </Button>
                </div>
                
                <input
                    type="text"
                    placeholder="Search curated lessons..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                />
                <nav className="flex-grow overflow-y-auto pr-2">
                    {generatedLessons.length > 0 && (
                        <div className="mb-4">
                            <h3 className="font-semibold text-green-400 text-sm uppercase tracking-wider mb-2">Generated Lessons</h3>
                             <ul className="space-y-1">
                                {generatedLessons.map(lesson => (
                                    <li key={lesson.id}>
                                        <button 
                                            onClick={() => handleLessonClick(lesson)}
                                            className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                                                selectedLessonId === lesson.id 
                                                ? 'bg-blue-600 text-white font-semibold' 
                                                : 'text-gray-300 hover:bg-slate-700/70'
                                            }`}
                                        >
                                            {lesson.title}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {filteredCategories.length > 0 ? filteredCategories.map(category => (
                        <div key={category.name} className="mb-4">
                            <h3 className="font-semibold text-yellow-300 text-sm uppercase tracking-wider mb-2">{category.name}</h3>
                            <ul className="space-y-1">
                                {category.lessons.map(lesson => (
                                    <li key={lesson.id}>
                                        <button 
                                            onClick={() => handleLessonClick(lesson)}
                                            className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                                                selectedLessonId === lesson.id 
                                                ? 'bg-blue-600 text-white font-semibold' 
                                                : 'text-gray-300 hover:bg-slate-700/70'
                                            }`}
                                        >
                                            {lesson.title}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )) : (
                        <p className="text-gray-400 text-sm p-4 text-center">No lessons found for "{searchTerm}".</p>
                    )}
                </nav>
            </aside>

            {/* Right Panel: Content Viewer */}
            <section className="w-full md:w-2/3 lg:w-3/4 bg-slate-800 p-6 md:p-8 rounded-lg overflow-y-auto border border-slate-700/50">
                {isGenerating && selectedLesson?.id.startsWith('gen-') && !selectedLesson.content && (
                     <div className="flex flex-col items-center justify-center h-full text-center">
                        <Loader messages={[`Generating lesson on "${generationTopic || selectedLesson?.title}"...`]} />
                    </div>
                )}
                {selectedLesson ? (
                    <article className="prose prose-invert prose-slate max-w-none text-gray-300 prose-headings:text-white prose-a:text-blue-400 prose-strong:text-gray-200">
                        <h1 className="font-display text-4xl font-bold text-white mb-4 pb-2 border-b border-slate-700">{selectedLesson.title}</h1>
                        <div className="whitespace-pre-wrap leading-relaxed">
                             <MarkdownRenderer text={selectedLesson.content} />
                        </div>
                        {selectedLesson.id.startsWith('gen-') && !isGenerating && (
                             <div className="mt-8 pt-4 border-t border-slate-700 text-center">
                                <FeedbackBox 
                                    onFeedback={(rating) => handleLessonFeedback(selectedLesson.id, rating)}
                                    feedbackState={lessonFeedback[selectedLesson.id]}
                                />
                             </div>
                        )}
                    </article>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                           <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                        </svg>
                        <p className="text-gray-400">Select a lesson from the list or generate a new one to begin your training.</p>
                    </div>
                )}
            </section>
        </div>
    );
};
