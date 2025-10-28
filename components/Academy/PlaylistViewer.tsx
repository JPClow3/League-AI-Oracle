import { useState, useEffect } from 'react';
import { Button } from '../common/Button';
import { motion } from 'framer-motion';
import { PlayCircle, CheckCircle, Clock, Award, ChevronRight } from 'lucide-react';
import type { LearningPlaylist } from '../../data/learningPlaylists';

interface PlaylistViewerProps {
    playlist: LearningPlaylist;
    completedLessons: Set<string>;
    onSelectLesson: (topic: string) => void;
    onClose: () => void;
}

export const PlaylistViewer = ({
    playlist,
    completedLessons,
    onSelectLesson,
    onClose
}: PlaylistViewerProps) => {
    const [selectedLessonIndex, setSelectedLessonIndex] = useState<number | null>(null);

    const totalLessons = playlist.lessons.length;
    const completedCount = playlist.lessons.filter(lesson => completedLessons.has(lesson)).length;
    const progress = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;

    const difficultyColors = {
        beginner: 'text-success',
        intermediate: 'text-warning',
        advanced: 'text-error'
    };

    // Keyboard navigation: Close on Escape
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    const handleStartPlaylist = () => {
        // Find first incomplete lesson
        const firstIncomplete = playlist.lessons.find(lesson => !completedLessons.has(lesson));
        if (firstIncomplete) {
            onSelectLesson(firstIncomplete);
            onClose();
        } else if (playlist.lessons.length > 0) {
            // All complete, start from beginning
            onSelectLesson(playlist.lessons[0]!);
            onClose();
        }
    };

    // Empty state check
    if (totalLessons === 0) {
        return (
                role="dialog"
                aria-labelledby="playlist-title"
                aria-describedby="playlist-description"
                aria-modal="true"
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                        <div className="text-5xl" aria-hidden="true">{playlist.icon}</div>
                onClick={onClose}
                            <h2 id="playlist-title" className="text-2xl font-bold text-text-primary mb-2">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                            <p id="playlist-description" className="text-text-secondary mb-3">
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-surface-primary border-2 border-border-primary rounded-lg max-w-md w-full p-6 text-center"
                    role="dialog"
                    aria-labelledby="empty-playlist-title"
                    aria-modal="true"
                >
                    <h2 id="empty-playlist-title" className="text-xl font-bold text-text-primary mb-4">
                        No Lessons Available
                    </h2>
                    <p className="text-text-secondary mb-4">
                        This playlist doesn't have any lessons yet.
                    </p>
                    <Button variant="primary" onClick={onClose}>
                        Close
                    </Button>
                </motion.div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-surface-primary border-2 border-border-primary rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            >
                {/* Header */}
                <div className="p-6 border-b border-border-primary">
                    <div className="flex items-start gap-4 mb-4">
                        <div className="text-5xl">{playlist.icon}</div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-text-primary mb-2">
                                {playlist.title}
                            </h2>
                            <p className="text-text-secondary mb-3">
                                {playlist.description}
                            </p>
                            <div className="flex flex-wrap gap-3 text-sm">
                                <span className={`flex items-center gap-1 ${difficultyColors[playlist.difficulty]}`}>
                                    <Award size={16} />
                                    {playlist.difficulty.charAt(0).toUpperCase() + playlist.difficulty.slice(1)}
                                </span>
                                {playlist.role && (
                                    <span className="text-accent">
                                        Role: {playlist.role}
                                    </span>
                                )}
                                <span className="flex items-center gap-1 text-text-secondary">
                                    <Clock size={16} />
                                    {playlist.estimatedTime}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-text-secondary">
                                Progress: {completedCount} / {totalLessons} lessons
                            </span>
                            <span className="text-sm font-mono text-accent">
                                {Math.round(progress)}%
                            </span>
                        </div>
                        <div className="w-full bg-surface-secondary rounded-full h-2">
                            <div
                                className="h-full bg-gradient-to-r from-accent to-success transition-all duration-300 rounded-full"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                        <Button
                            variant="primary"
                            onClick={handleStartPlaylist}
                            className="flex items-center gap-2"
                        >
                            <PlayCircle size={18} />
                            {completedCount === 0 ? 'Start Playlist' : 'Continue Learning'}
                        </Button>
                        <Button variant="secondary" onClick={onClose}>
                            Close
                        </Button>
                    </div>
                </div>

                {/* Lesson List */}
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-accent mb-4">Lessons</h3>
                    <div className="space-y-2">
                        {playlist.lessons.map((lesson, index) => {
                            const isCompleted = completedLessons.has(lesson);
                            const isSelected = selectedLessonIndex === index;

                            return (
                                <button
                                    key={index}
                                    onClick={() => {
                                        setSelectedLessonIndex(index);
                                        onSelectLesson(lesson);
                                        onClose();
                                    }}
                                    onMouseEnter={() => setSelectedLessonIndex(index)}
                                    onMouseLeave={() => setSelectedLessonIndex(null)}
                                    className={`w-full p-4 border rounded-lg text-left transition-all ${
                                        isSelected
                                            ? 'border-accent bg-accent/5 scale-[1.02]'
                                            : 'border-border-primary bg-surface hover:border-accent/50'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                            isCompleted 
                                                ? 'bg-success/20 text-success' 
                                                : 'bg-surface-secondary text-text-secondary'
                                        }`}>
                                            {isCompleted ? (
                                                <CheckCircle size={18} />
                                            ) : (
                                                <span className="text-sm font-semibold">{index + 1}</span>
                                            )}
                                        </div>

                                        <div className="flex-1">
                                            <h4 className={`font-medium ${
                                                isCompleted ? 'text-text-secondary line-through' : 'text-text-primary'
                                            }`}>
                                                {lesson}
                                            </h4>
                                        </div>

                                        <ChevronRight
                                            size={20}
                                            className={`flex-shrink-0 transition-transform ${
                                                isSelected ? 'translate-x-1 text-accent' : 'text-text-secondary'
                                            }`}
                                        />
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

