import React from 'react';
import { KnowledgeConcept, RichLessonContent, Trial } from '../../types';

interface LessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  lesson: KnowledgeConcept;
  trial: Trial;
  onTakeTrial: (trial: Trial) => void;
}

const LessonModal: React.FC<LessonModalProps> = ({ isOpen, onClose, lesson, trial, onTakeTrial }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center animate-fade-in" onClick={onClose}>
      <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-3xl font-display text-yellow-400">Lesson of the Patch: {lesson.title}</h2>
            <button onClick={onClose} className="text-2xl text-slate-500 hover:text-white">&times;</button>
        </div>
        <div className="prose prose-slate dark:prose-invert max-w-none whitespace-pre-wrap mb-6">
            {typeof lesson.content === 'string' ? lesson.content : (lesson.content as RichLessonContent).intro.summary}
        </div>
        <div className="bg-slate-800 p-4 rounded-lg text-center">
            <h3 className="font-display text-2xl">Ready to test your knowledge?</h3>
            <p className="text-slate-400 mb-4">A new Trial based on this lesson is available.</p>
            <button 
                onClick={() => {
                    onTakeTrial(trial);
                    onClose();
                }}
                className="px-6 py-2 rounded-md bg-yellow-500 text-black font-semibold hover:bg-yellow-600 transition"
            >
                Take the Trial
            </button>
        </div>
      </div>
    </div>
  );
};

export default LessonModal;