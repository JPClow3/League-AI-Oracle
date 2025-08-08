import React, { useState, useEffect } from 'react';
import { Trial, View, DDragonData } from '../types';
import { TRIALS_DATA } from '../data/trialsData';
import { KNOWLEDGE_BASE } from '../data/knowledgeBase';
import TrialModal from './TrialModal';
import { useProfile } from '../contexts/ProfileContext';
import { Icon } from './common/Icon';

interface TrialsScreenProps {
  ddragonData: DDragonData;
  setView: (view: View) => void;
  selectedTrialId: string | null;
  onClearSelectedTrial: () => void;
}

const TrialCard: React.FC<{
    trial: Trial;
    isLocked: boolean;
    isCompleted: boolean;
    onClick: () => void;
}> = ({ trial, isLocked, isCompleted, onClick }) => {
    const lesson = KNOWLEDGE_BASE.find(l => l.id === trial.lessonId);
    return (
        <div
            onClick={!isLocked ? onClick : undefined}
            className={`bg-white dark:bg-slate-800/80 p-6 rounded-lg shadow-md border-2 transition-all duration-200
                ${isLocked
                    ? 'border-slate-200/50 dark:border-slate-700/50 text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-60'
                    : `border-slate-200 dark:border-slate-700 hover:border-indigo-600 dark:hover:border-indigo-500 cursor-pointer transform hover:scale-105`
                }
                ${isCompleted ? '!border-teal-600 dark:!border-teal-400' : ''}`
            }
        >
            <div className="flex justify-between items-start">
                <div>
                    <h3 className={`text-2xl font-display font-semibold ${isLocked ? 'text-slate-600 dark:text-slate-500' : ''}`}>
                        {trial.title}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {isLocked ? `Complete the "${lesson?.title}" lesson to unlock.` : trial.scenario}
                    </p>
                </div>
                <div className="text-3xl">
                    {isLocked ? <Icon name="lock" className="w-8 h-8"/> : isCompleted ? <Icon name="check" className="w-8 h-8 text-teal-500"/> : <Icon name="sword" className="w-8 h-8 text-indigo-500" />}
                </div>
            </div>
        </div>
    );
};


const TrialsScreen: React.FC<TrialsScreenProps> = ({ ddragonData, setView, selectedTrialId, onClearSelectedTrial }) => {
    const { activeProfile, onProgressUpdate } = useProfile();
    const { settings } = activeProfile!;
    
    const [activeTrial, setActiveTrial] = useState<Trial | null>(null);

    useEffect(() => {
        if (selectedTrialId) {
            const trial = TRIALS_DATA.find(t => t.id === selectedTrialId);
            if (trial) {
                setActiveTrial(trial);
            }
            onClearSelectedTrial();
        }
    }, [selectedTrialId, onClearSelectedTrial]);

    const handleTrialComplete = (trialId: string, xp: number) => {
        onProgressUpdate('trial', trialId, xp);
        setActiveTrial(null);
    };

    return (
        <div className="animate-fade-in">
             <div className="text-center mb-12">
                <h1 className="text-6xl font-display font-bold text-gradient-primary">Strategic Trials</h1>
                <p className="text-xl text-slate-500 dark:text-slate-400 mt-2">Apply your knowledge from The Academy in these practical challenges to earn XP.</p>
            </div>
            <div className="max-w-4xl mx-auto space-y-4">
                {TRIALS_DATA.map((trial, index) => (
                    <div key={trial.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms`}}>
                        <TrialCard
                            trial={trial}
                            isLocked={!settings.completedLessons.includes(trial.lessonId)}
                            isCompleted={settings.completedTrials.includes(trial.id)}
                            onClick={() => setActiveTrial(trial)}
                        />
                    </div>
                ))}
            </div>

            {activeTrial && (
                <TrialModal
                    trial={activeTrial}
                    isOpen={!!activeTrial}
                    onClose={() => setActiveTrial(null)}
                    onComplete={handleTrialComplete}
                    ddragonData={ddragonData}
                />
            )}
        </div>
    );
};

export default TrialsScreen;