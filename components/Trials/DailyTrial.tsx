import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { getTrialQuestion } from '../../services/geminiService';
import type { TrialQuestion } from '../../types';
import { Loader } from '../common/Loader';
import { Button } from '../common/Button';
import { useUserProfile } from '../../hooks/useUserProfile';
import toast from 'react-hot-toast';
import { KEYWORDS } from '../Academy/lessons';

interface CachedTrial {
    date: string;
    question: TrialQuestion;
}

interface DailyTrialProps {
    navigateToAcademy: (lessonId: string) => void;
}

export const DailyTrial: React.FC<DailyTrialProps> = ({ navigateToAcademy }) => {
    const [question, setQuestion] = useState<TrialQuestion | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const { addSP, completeMission } = useUserProfile();
    const abortControllerRef = useRef<AbortController | null>(null);

    const today = new Date().toISOString().split('T')[0];
    const cacheKey = 'dailyTrialCache';

    const fetchNewQuestion = useCallback(async () => {
        abortControllerRef.current?.abort();
        const controller = new AbortController();
        abortControllerRef.current = controller;

        setIsLoading(true);
        setError(null);
        setSelectedAnswer(null);
        setIsAnswered(false);
        setQuestion(null);
        try {
            const newQuestion = await getTrialQuestion(controller.signal);
            if (controller.signal.aborted) return;
            setQuestion(newQuestion);
            const cachePayload: CachedTrial = { date: today, question: newQuestion };
            localStorage.setItem(cacheKey, JSON.stringify(cachePayload));
        } catch (err) {
            if (err instanceof DOMException && err.name === 'AbortError') {
              console.log("Trial fetch aborted.");
              return;
            }
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unknown error occurred.");
            }
        } finally {
            if (!controller.signal.aborted) {
                setIsLoading(false);
            }
        }
    }, [today]);

    useEffect(() => {
        try {
            const cachedData = localStorage.getItem(cacheKey);
            if (cachedData) {
                const { date, question: cachedQuestion } = JSON.parse(cachedData) as CachedTrial;
                if (date === today) {
                    setQuestion(cachedQuestion);
                    setIsLoading(false);
                    return;
                }
            }
        } catch (e) {
            console.error("Failed to load daily trial from cache", e);
            localStorage.removeItem(cacheKey);
        }
        fetchNewQuestion();

        return () => {
            abortControllerRef.current?.abort();
        }
    }, [fetchNewQuestion, today]);

    const handleAnswerSelect = (option: string) => {
        if (isAnswered) return;
        setSelectedAnswer(option);
        setIsAnswered(true);
        if (option === question?.correctAnswer) {
            // Gamification logic for correct answer
            addSP(75, "Daily Trial Correct");
            if(completeMission('d2')) {
                // Toast is handled by completeMission
            }
        }
    };
    
    const getButtonClass = (option: string) => {
        if (!isAnswered) {
            return 'bg-slate-700 hover:bg-slate-600';
        }
        if (option === question?.correctAnswer) {
            return 'bg-green-600';
        }
        if (option === selectedAnswer) {
            return 'bg-red-600';
        }
        return 'bg-slate-700 opacity-60';
    };

    const explanationLink = useMemo(() => {
        if (!isAnswered || !question) return null;

        const explanationText = question.explanation.toLowerCase();
        const foundKeyword = KEYWORDS.find(kw => explanationText.includes(kw.term.toLowerCase()));

        if (foundKeyword) {
            return {
                text: `Learn more about ${foundKeyword.term}`,
                lessonId: foundKeyword.lessonId
            };
        }
        return null;
    }, [isAnswered, question]);

    return (
        <div className="space-y-6">
            <div className="bg-slate-800/50 p-4 rounded-lg shadow-lg text-center">
                <h1 className="text-2xl font-bold text-white">Daily Trial</h1>
                <p className="text-sm text-gray-400">Test your strategic knowledge. A new trial appears each day.</p>
            </div>

            <div className="bg-slate-800 p-6 rounded-lg shadow-lg max-w-2xl mx-auto min-h-[300px] flex flex-col justify-center">
                {isLoading && <Loader messages={["Generating new trial..."]} />}
                
                {error && !isLoading && (
                    <div className="text-center text-red-400">
                        <p className="mb-4">{error}</p>
                        <Button onClick={fetchNewQuestion} variant="primary">
                            Retry
                        </Button>
                    </div>
                )}
                
                {question && !isLoading && (
                    <div className="space-y-6">
                        <div>
                            <p className="text-lg font-semibold text-center">{question.question}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {question.options.map((option) => (
                                <button
                                    key={option}
                                    onClick={() => handleAnswerSelect(option)}
                                    disabled={isAnswered}
                                    className={`p-4 rounded-lg text-left transition-all duration-300 text-white font-medium ${getButtonClass(option)}`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                        {isAnswered && (
                            <div className={`p-4 rounded-lg ${selectedAnswer === question.correctAnswer ? 'bg-green-900/50' : 'bg-red-900/50'}`}>
                                <h3 className="font-bold text-lg">{selectedAnswer === question.correctAnswer ? 'Correct!' : 'Incorrect'}</h3>
                                <p className="mt-2 text-sm">{question.explanation}</p>
                                {explanationLink && (
                                    <div className="mt-3">
                                        <button
                                            onClick={() => navigateToAcademy(explanationLink.lessonId)}
                                            className="text-sm font-semibold text-blue-300 hover:text-blue-200 hover:underline"
                                        >
                                            {explanationLink.text} →
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};