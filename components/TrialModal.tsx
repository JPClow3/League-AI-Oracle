
import React, { useState } from 'react';
import { Trial, TrialFeedback, TrialDraftState, DDragonData } from '../types';
import { geminiService } from '../services/geminiService';
import { Spinner } from './common/Spinner';
import { useProfile } from '../contexts/ProfileContext';
import { ChampionIcon } from './common/ChampionIcon';

interface TrialModalProps {
  trial: Trial;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (trialId: string, xp: number) => void;
  ddragonData: DDragonData;
}

const DraftDisplay: React.FC<{ draftState: TrialDraftState; ddragonData: DDragonData; }> = ({ draftState, ddragonData }) => {
    const getChampion = (name: string) => Object.values(ddragonData.champions).find(c => c.name === name) || null;
    return (
        <div className="mb-4 p-4 bg-slate-100 dark:bg-black/20 rounded-lg border border-slate-300 dark:border-slate-700">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <h4 className="font-semibold text-blue-500 mb-2 text-center">BLUE TEAM</h4>
                    <div className="flex justify-center flex-wrap gap-2">
                        {draftState.blueTeam.picks.map(pick => (
                            <ChampionIcon key={pick.championName} champion={getChampion(pick.championName)} version={ddragonData.version} isClickable={false} className="w-12 h-12" />
                        ))}
                    </div>
                </div>
                 <div>
                    <h4 className="font-semibold text-red-500 mb-2 text-center">RED TEAM</h4>
                    <div className="flex justify-center flex-wrap gap-2">
                        {draftState.redTeam.picks.map(pick => (
                            <ChampionIcon key={pick.championName} champion={getChampion(pick.championName)} version={ddragonData.version} isClickable={false} className="w-12 h-12" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

const TrialModal: React.FC<TrialModalProps> = ({ trial, isOpen, onClose, onComplete, ddragonData }) => {
  const { activeProfile } = useProfile();
  const { settings } = activeProfile!;
  
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<TrialFeedback | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = () => {
    setSelectedOption(null);
    setFeedback(null);
    setIsLoading(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!selectedOption) return;
    setIsLoading(true);
    const result = await geminiService.getTrialFeedback(trial, selectedOption, settings);
    setIsLoading(false);
    if (result) {
      setFeedback(result);
      if (result.isCorrect && !settings.completedTrials.includes(trial.id)) {
        onComplete(trial.id, 50); // Grant 50 XP for completing a trial
      }
    } else {
        setFeedback({ feedback: "Sorry, there was an error getting feedback. Please try again.", isCorrect: false });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in" onClick={handleClose}>
      <div className="glass-effect rounded-lg shadow-2xl p-6 w-full max-w-2xl" onClick={e => e.stopPropagation()}>
        <h2 className="text-3xl font-display mb-4 text-slate-800 dark:text-slate-200">{trial.title}</h2>
        
        {!feedback ? (
            // Question View
            <div className="space-y-4">
                {trial.draftState && <DraftDisplay draftState={trial.draftState} ddragonData={ddragonData} />}
                <p className="text-slate-600 dark:text-slate-400 bg-slate-100/50 dark:bg-black/20 p-4 rounded-md"><strong>Scenario:</strong> {trial.scenario}</p>
                <p className="text-lg font-semibold text-slate-800 dark:text-slate-200">{trial.question}</p>
                <div className="space-y-3">
                    {trial.options.map((option, index) => (
                        <button
                            key={index}
                            onClick={() => setSelectedOption(option.text)}
                            className={`w-full text-left p-3 rounded-lg border-2 transition-colors duration-200 ${
                                selectedOption === option.text
                                ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-500/20'
                                : 'border-slate-300/50 dark:border-slate-600/50 hover:border-indigo-500/50'
                            }`}
                        >
                            {option.text}
                        </button>
                    ))}
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                    <button onClick={handleClose} className="px-4 py-2 rounded-md bg-slate-600 text-white hover:bg-slate-700 transition-colors duration-200">Cancel</button>
                    <button onClick={handleSubmit} disabled={!selectedOption || isLoading} className="px-6 py-2 rounded-md bg-primary-gradient text-white disabled:opacity-50 flex items-center transition-colors duration-200">
                        {isLoading && <Spinner size="h-5 w-5 mr-2" />}
                        Submit
                    </button>
                </div>
            </div>
        ) : (
            // Feedback View
            <div className="space-y-4 text-center">
                <h3 className={`text-4xl font-display ${feedback.isCorrect ? 'text-teal-600 dark:text-teal-400' : 'text-rose-600 dark:text-rose-500'}`}>
                    {feedback.isCorrect ? 'Correct!' : 'Not Quite'}
                </h3>
                <p className="text-slate-700 dark:text-slate-300">{feedback.feedback}</p>
                {feedback.isCorrect && !settings.completedTrials.includes(trial.id) && <p className="text-amber-500 dark:text-amber-400 font-semibold">+50 Strategic XP</p>}
                 <div className="flex justify-center pt-4">
                    <button onClick={feedback.isCorrect ? handleClose : handleReset} className="px-6 py-2 rounded-md bg-primary-gradient text-white">
                        {feedback.isCorrect ? 'Continue' : 'Try Again'}
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default TrialModal;
