import { useState, useMemo } from 'react';
import { SCENARIOS } from '../../data/scenarios';
import type { DraftScenario } from '../../types';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useChampions } from '../../contexts/ChampionContext';
import { fromSavedDraft } from '../../lib/draftUtils';
import { TeamPanel } from '../DraftLab/TeamPanel';
import { Button } from '../common/Button';
import { BrainCircuit, Check, X } from 'lucide-react';
import { MISSION_IDS } from '../../constants';
import { motion, AnimatePresence } from 'framer-motion';

export const DraftScenarios = () => {
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<DraftScenario['options'][0] | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const { addSP, completeMission } = useUserProfile();
  const { champions, championsLite } = useChampions();

  const currentScenario = SCENARIOS[currentScenarioIndex];

  const draftState = useMemo(() => {
    if (!currentScenario) {
      return null;
    }
    return fromSavedDraft(currentScenario.draft, champions);
  }, [currentScenario, champions]);

  const handleSelectOption = (option: DraftScenario['options'][0]) => {
    if (isAnswered || !currentScenario) {
      return;
    }
    setSelectedOption(option);
    setIsAnswered(true);
    if (option.isCorrect) {
      addSP(50, `Scenario: ${currentScenario.title}`);
      completeMission(MISSION_IDS.WEEKLY.SCENARIO_MASTER);
    }
  };

  const handleNext = () => {
    setIsAnswered(false);
    setSelectedOption(null);
    setCurrentScenarioIndex(prev => (prev + 1) % SCENARIOS.length);
  };

  if (!currentScenario || !draftState) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 bg-surface p-4 shadow-lg">
          <div className="bg-secondary text-accent w-12 h-12 flex items-center justify-center flex-shrink-0">
            <BrainCircuit size={32} />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-text-primary">Draft Scenarios</h1>
            <p className="text-sm text-text-secondary">No scenarios available.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 bg-surface p-4 shadow-lg">
        <div className="bg-secondary text-accent w-12 h-12 flex items-center justify-center flex-shrink-0">
          <BrainCircuit size={32} />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold text-text-primary">Draft Scenarios</h1>
          <p className="text-sm text-text-secondary">Hone your decision-making in pivotal draft moments.</p>
        </div>
      </div>

      <div className="bg-surface p-6 shadow-lg border border-border space-y-4">
        <div className="text-center">
          <h2 className="text-xl font-bold text-accent">{currentScenario.title}</h2>
          <p className="text-text-secondary max-w-2xl mx-auto">{currentScenario.description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TeamPanel
            side="blue"
            state={draftState.blue}
            onSlotClick={() => {}}
            activeSlot={
              currentScenario.userContext.side === 'blue'
                ? { type: 'pick', index: currentScenario.userContext.index }
                : null
            }
          />
          <TeamPanel
            side="red"
            state={draftState.red}
            onSlotClick={() => {}}
            activeSlot={
              currentScenario.userContext.side === 'red'
                ? { type: 'pick', index: currentScenario.userContext.index }
                : null
            }
          />
        </div>
      </div>

      <div className="bg-surface p-6 shadow-lg border border-border">
        <AnimatePresence mode="wait">
          {!isAnswered ? (
            <motion.div key="options" {...{ initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }}>
              <h3 className="text-lg font-bold text-text-primary text-center mb-4">What&apos;s the pick?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {currentScenario.options.map(option => {
                  const champ = championsLite.find(c => c.id === option.championId);
                  if (!champ) {
                    return null;
                  }
                  return (
                    <button
                      key={option.championId}
                      onClick={() => handleSelectOption(option)}
                      className="group relative bg-secondary border border-border text-left hover:border-accent transition-all duration-300 transform hover:-translate-y-1 overflow-hidden shadow-md hover:shadow-lg hover:shadow-accent/10 p-3 flex flex-col items-center"
                    >
                      <img
                        src={champ.image}
                        alt={champ.name}
                        className="w-24 h-24 mb-2 border-2 border-border-secondary"
                      />
                      <h4 className="font-bold text-text-primary">{champ.name}</h4>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <motion.div key="feedback" {...{ initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }}>
              {selectedOption && (
                <div className="text-center">
                  <div className="flex justify-center items-center gap-3 mb-3">
                    {selectedOption.isCorrect ? (
                      <Check size={32} className="text-success" />
                    ) : (
                      <X size={32} className="text-error" />
                    )}
                    <h3
                      className={`text-3xl font-bold font-display ${selectedOption.isCorrect ? 'text-success' : 'text-error'}`}
                    >
                      {selectedOption.isCorrect ? 'Correct!' : 'Suboptimal'}
                    </h3>
                  </div>
                  <p className="text-text-secondary mb-2 italic">&quot;{selectedOption.explanation}&quot;</p>
                  {!selectedOption.isCorrect && (
                    <p className="text-text-primary font-semibold mt-4 mb-2">The Optimal Choice:</p>
                  )}
                  <p className="text-text-secondary max-w-2xl mx-auto">{currentScenario.correctChoiceExplanation}</p>
                  <Button onClick={handleNext} variant="primary" className="mt-6">
                    Next Scenario
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
