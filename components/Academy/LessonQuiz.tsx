import { useState } from 'react';
import { Button } from '../common/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Award, RefreshCw } from 'lucide-react';

interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswer: number; // Index of correct option
    explanation: string;
}

interface LessonQuizProps {
    lessonId: string;
    lessonTitle: string;
    questions: QuizQuestion[];
    onComplete: (score: number) => void;
}

export const LessonQuiz = ({ lessonId, lessonTitle, questions, onComplete }: LessonQuizProps) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const [finalScore, setFinalScore] = useState<number>(0);

    // Validation: Check if questions array is valid
    if (!questions || questions.length === 0) {
        return (
            <div className="p-6 bg-surface-primary border border-border-primary rounded-lg text-center">
                <p className="text-error">No quiz questions available for this lesson.</p>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === questions.length - 1;
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    const handleAnswerSelect = (index: number) => {
        if (showExplanation) return; // Prevent changing answer after submission
        setSelectedAnswer(index);
    };

    const handleSubmit = () => {
        if (selectedAnswer === null) return;

        setShowExplanation(true);

        if (selectedAnswer === currentQuestion!.correctAnswer) {
            setCorrectAnswers(prev => prev + 1);
        }
    };

    const handleNext = () => {
        if (isLastQuestion) {
            // Calculate final score consistently
            const score = Math.round(((correctAnswers + (selectedAnswer === currentQuestion!.correctAnswer ? 1 : 0)) / questions.length) * 100);
            setFinalScore(score);
            setIsComplete(true);
            onComplete(score);
        } else {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedAnswer(null);
            setShowExplanation(false);
        }
    };

    const handleRetry = () => {
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setShowExplanation(false);
        setCorrectAnswers(0);
        setIsComplete(false);
        setFinalScore(0);
    };

    if (isComplete) {
        const passed = finalScore >= 70;

        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 bg-surface-primary border border-border-primary rounded-lg text-center"
            >
                <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${passed ? 'bg-success/20' : 'bg-warning/20'}`}>
                    <Award size={48} className={passed ? 'text-success' : 'text-warning'} />
                </div>

                <h2 className="text-2xl font-bold text-text-primary mb-2">Quiz Complete!</h2>
                <p className="text-text-secondary mb-4">You scored</p>

                <div className="text-5xl font-bold text-accent mb-6">
                    {finalScore}%
                </div>

                <p className="text-text-secondary mb-6">
                    {passed
                        ? '🎉 Excellent work! You\'ve mastered this lesson.'
                        : '💪 Good effort! Consider reviewing the lesson and trying again.'}
                </p>

                <div className="text-sm text-text-secondary mb-6">
                    Correct: {correctAnswers + (selectedAnswer === questions[questions.length - 1]?.correctAnswer ? 1 : 0)} / {questions.length}
                </div>

                <div className="flex gap-3 justify-center">
                    <Button variant="secondary" onClick={handleRetry}>
                        <RefreshCw size={16} className="mr-2" />
                        Retry Quiz
                    </Button>
                    <Button variant="primary" onClick={() => onComplete(finalScore)}>
                        Continue
                    </Button>
                </div>
            </motion.div>
        );
    }

    if (!currentQuestion) return null;

    return (
        <div className="p-6 bg-surface-primary border border-border-primary rounded-lg">
            {/* Progress Bar */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-text-secondary">
                        Question {currentQuestionIndex + 1} of {questions.length}
                    </span>
                    <span className="text-sm font-mono text-accent">
                        {Math.round(progress)}%
                    </span>
                </div>
                <div className="w-full bg-surface-secondary rounded-full h-2">
                    <div
                        className="h-full bg-gradient-to-r from-accent to-info transition-all duration-300 rounded-full"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Question */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentQuestionIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                >
                    <h3 className="text-lg font-semibold text-text-primary mb-4">
                        {currentQuestion.question}
                    </h3>

                    {/* Options */}
                    <div className="space-y-3 mb-6" role="radiogroup" aria-label="Quiz answer options">
                        {currentQuestion.options.map((option, index) => {
                            const isSelected = selectedAnswer === index;
                            const isCorrect = index === currentQuestion.correctAnswer;
                            const showResult = showExplanation;

                            let borderColor = 'border-border-primary';
                            let bgColor = 'bg-surface';
                            let textColor = 'text-text-primary';

                            if (showResult) {
                                if (isCorrect) {
                                    borderColor = 'border-success';
                                    bgColor = 'bg-success/10';
                                    textColor = 'text-success';
                                } else if (isSelected) {
                                    borderColor = 'border-error';
                                    bgColor = 'bg-error/10';
                                    textColor = 'text-error';
                                }
                            } else if (isSelected) {
                                borderColor = 'border-accent';
                                bgColor = 'bg-accent/5';
                            }

                            return (
                                <button
                                    key={index}
                                    onClick={() => handleAnswerSelect(index)}
                                    disabled={showExplanation}
                                    aria-label={`Option ${index + 1}: ${option}`}
                                    aria-checked={isSelected}
                                    role="radio"
                                    className={`w-full p-4 border-2 ${borderColor} ${bgColor} rounded-lg text-left transition-all hover:scale-[1.01] disabled:cursor-not-allowed ${!showResult && 'hover:border-accent'}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className={`${textColor} font-medium`}>{option}</span>
                                        {showResult && (
                                            isCorrect ? (
                                                <CheckCircle size={20} className="text-success" />
                                            ) : isSelected ? (
                                                <XCircle size={20} className="text-error" />
                                            ) : null
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Explanation */}
                    {showExplanation && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 bg-surface-secondary border border-border-primary rounded-lg mb-4"
                        >
                            <p className="text-sm text-text-secondary">
                                <strong className="text-accent">Explanation:</strong> {currentQuestion.explanation}
                            </p>
                        </motion.div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                        {!showExplanation ? (
                            <Button
                                variant="primary"
                                onClick={handleSubmit}
                                disabled={selectedAnswer === null}
                                className="flex-1"
                            >
                                Submit Answer
                            </Button>
                        ) : (
                            <Button
                                variant="primary"
                                onClick={handleNext}
                                className="flex-1"
                            >
                                {isLastQuestion ? 'View Results' : 'Next Question'}
                            </Button>
                        )}
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

/**
 * Generate quiz questions from lesson content using AI
 * Note: This is a placeholder implementation. In production, use Gemini API to generate contextual questions.
 */
export const generateQuizQuestions = (lessonContent: string, lessonTopic: string): QuizQuestion[] => {
    // Placeholder implementation with generic questions
    // TODO: Replace with actual AI generation using Gemini API

    const genericQuestions: QuizQuestion[] = [
        {
            question: `Based on the lesson "${lessonTopic}", what is the most important factor to consider?`,
            options: [
                'Champion mechanics and skill expression',
                'Understanding the strategic context and game state',
                'Individual player skill ratings',
                'Random chance and luck'
            ],
            correctAnswer: 1,
            explanation: 'Strategic understanding of game context is crucial for applying any League concept effectively.'
        },
        {
            question: 'When should you apply the concepts from this lesson?',
            options: [
                'Only in ranked games',
                'Throughout the entire game when relevant',
                'Only during the late game',
                'Only when you are ahead'
            ],
            correctAnswer: 1,
            explanation: 'Most strategic concepts are applicable throughout the game when the situation calls for them.'
        },
        {
            question: 'What is the key to improving at League of Legends?',
            options: [
                'Playing as many games as possible',
                'Blaming teammates for mistakes',
                'Understanding concepts and applying them consistently',
                'Only playing meta champions'
            ],
            correctAnswer: 2,
            explanation: 'Consistent application of strategic concepts leads to long-term improvement.'
        }
    ];

    return genericQuestions;
};

