
import React, { useState, useEffect, useCallback } from 'react';
import { InteractiveLessonScreenProps, ChallengeData, OraclePersonality, DDragonChampionInfo } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorDisplay } from './ErrorDisplay';
import { ArrowUturnLeftIcon, AISparkleIcon, AcademicCapIcon } from './icons/index';
import { getConceptExplanation, generateConceptChallenge, getChallengeFeedback } from '../services/geminiService';
import { formatMarkdownString } from '../utils/textFormatting';
import { getStaticChampionRoleSummary } from '../gameData';
import { getChampionImageURL } from '../services/ddragonService';


type LessonStep = 
  | 'INITIAL_LOAD' 
  | 'EXPLANATION_LOADED' 
  | 'CHALLENGE_START_PROMPT'
  | 'CHALLENGE_LOADING' 
  | 'CHALLENGE_LOADED' 
  | 'ANSWER_SUBMITTED'
  | 'FEEDBACK_LOADING' 
  | 'FEEDBACK_LOADED' 
  | 'ERROR';

export const InteractiveLessonScreen: React.FC<InteractiveLessonScreenProps> = ({
  selectedConcept,
  championPersona, // New prop
  onCompleteLesson,
  oraclePersonality,
  ddragonVersion, // Added for persona image
  allChampionsData // Added for persona image consistency (though championPersona should have ID)
}) => {
  const [currentStep, setCurrentStep] = useState<LessonStep>('INITIAL_LOAD');
  const [explanation, setExplanation] = useState<string>('');
  const [challenge, setChallenge] = useState<ChallengeData | null>(null);
  const [userAnswerLetter, setUserAnswerLetter] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const championDataSummaryForAI = React.useMemo(() => getStaticChampionRoleSummary(15), []);

  const fetchExplanation = useCallback(async () => {
    if (!selectedConcept) return;
    setIsLoading(true);
    setError(null);
    setCurrentStep('INITIAL_LOAD');
    try {
      const content = await getConceptExplanation(selectedConcept.title, oraclePersonality, championPersona?.name);
      setExplanation(content);
      setCurrentStep('EXPLANATION_LOADED'); 
    } catch (err) {
      console.error("Error fetching explanation:", err);
      setError(err instanceof Error ? err.message : "Failed to load explanation.");
      setCurrentStep('ERROR');
    } finally {
      setIsLoading(false);
    }
  }, [selectedConcept, oraclePersonality, championPersona]);

  const fetchChallenge = useCallback(async () => {
    if (!selectedConcept) return;
    setIsLoading(true);
    setError(null);
    setCurrentStep('CHALLENGE_LOADING');
    try {
      const challengeData = await generateConceptChallenge(selectedConcept.title, oraclePersonality, championDataSummaryForAI, championPersona?.name);
      setChallenge(challengeData);
      setUserAnswerLetter(null); 
      setFeedback('');
      setCurrentStep('CHALLENGE_LOADED');
    } catch (err) {
      console.error("Error fetching challenge:", err);
      setError(err instanceof Error ? err.message : "Failed to load challenge.");
      setCurrentStep('ERROR');
    } finally {
      setIsLoading(false);
    }
  }, [selectedConcept, oraclePersonality, championDataSummaryForAI, championPersona]);

  const fetchFeedbackForAnswer = useCallback(async (answerLetter: string, currentChallenge: ChallengeData) => {
    if (!selectedConcept || !currentChallenge) return;
    setIsLoading(true);
    setError(null);
    setCurrentStep('FEEDBACK_LOADING');
    try {
      const feedbackContent = await getChallengeFeedback(selectedConcept.title, currentChallenge, answerLetter, oraclePersonality, championPersona?.name);
      setFeedback(feedbackContent);
      setCurrentStep('FEEDBACK_LOADED');
    } catch (err) {
      console.error("Error fetching feedback:", err);
      setError(err instanceof Error ? err.message : "Failed to load feedback.");
      setCurrentStep('ERROR');
    } finally {
      setIsLoading(false);
    }
  }, [selectedConcept, oraclePersonality, championPersona]);

  useEffect(() => {
    if (selectedConcept) {
      fetchExplanation();
    } else {
      onCompleteLesson(); 
    }
  }, [selectedConcept, fetchExplanation, onCompleteLesson]);

  const handleStartChallenge = () => {
    setCurrentStep('CHALLENGE_START_PROMPT');
  };
  
  const handleProceedToChallengeActual = () => {
      fetchChallenge();
  };

  const handleAnswerSelect = (optionLetter: string) => {
    if (!challenge) return;
    setUserAnswerLetter(optionLetter);
    setCurrentStep('ANSWER_SUBMITTED');
    fetchFeedbackForAnswer(optionLetter, challenge);
  };
  
  const handleTryAnotherChallenge = () => {
    fetchChallenge(); 
  };

  if (!selectedConcept) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center p-4">
        <p className="text-slate-400 font-['Inter']">No concept selected for learning.</p>
        <button onClick={onCompleteLesson} className="lol-button lol-button-secondary mt-4">Return Home</button>
      </div>
    );
  }
  
  const personaImage = championPersona && ddragonVersion && allChampionsData.find(c => c.id === championPersona.id)
    ? getChampionImageURL(ddragonVersion, championPersona.id)
    : null;

  const renderExplanationPanel = () => {
    if (currentStep === 'INITIAL_LOAD' && isLoading) {
      return <div className="lol-panel p-4 sm:p-6 h-full flex items-center justify-center"><LoadingSpinner /><p className="ml-3 text-slate-400 font-['Inter']">{championPersona ? `${championPersona.name} is preparing the lesson...` : "Loading Explanation..."}</p></div>;
    }
    if (currentStep === 'ERROR' && !explanation) {
      return (
        <div className="lol-panel p-4 sm:p-6 h-full">
          <ErrorDisplay errorMessage={error || "An unknown error occurred."} onClear={() => { setError(null); fetchExplanation(); }} />
        </div>
      );
    }
    return (
      <div className="lol-panel p-4 sm:p-6 animate-fadeIn h-full flex flex-col">
        <h3 className="text-xl sm:text-2xl font-semibold text-sky-300 mb-1 font-['Inter']">Explanation: {selectedConcept?.title}</h3>
        {championPersona && (
            <div className="flex items-center space-x-2 mb-4 text-sm text-slate-400 font-['Inter']">
                {personaImage && <img src={personaImage} alt={championPersona.name} className="w-8 h-8 rounded-full border-2 border-sky-500"/>}
                <span>Lesson by: <strong className="text-sky-400">{championPersona.name}</strong></span>
            </div>
        )}
        <div className="prose prose-sm sm:prose-base prose-invert max-w-none text-slate-200 leading-relaxed selection:bg-sky-500 selection:text-white overflow-y-auto flex-grow mb-4">
          {formatMarkdownString(explanation)}
        </div>
        {(currentStep === 'EXPLANATION_LOADED' || currentStep === 'CHALLENGE_START_PROMPT' || currentStep === 'CHALLENGE_LOADED' || currentStep === 'ANSWER_SUBMITTED' || currentStep === 'FEEDBACK_LOADING' || currentStep === 'FEEDBACK_LOADED') && !challenge && (
          <button onClick={handleStartChallenge} className="lol-button lol-button-primary mt-auto w-full flex items-center justify-center">
            Start Challenge <AISparkleIcon className="w-5 h-5 ml-2 inline"/>
          </button>
        )}
      </div>
    );
  };

  const renderInteractiveWidgetPanel = () => {
    if (currentStep === 'INITIAL_LOAD' || (currentStep === 'EXPLANATION_LOADED' && !isLoading)) {
       return (
        <div className="lol-panel p-4 sm:p-6 h-full flex flex-col items-center justify-center animate-fadeIn">
          {championPersona && personaImage && (
              <img src={personaImage} alt={championPersona.name} className="w-20 h-20 rounded-full border-4 border-yellow-400 mb-4 shadow-lg"/>
          )}
          {!championPersona && <AcademicCapIcon className="w-12 h-12 text-yellow-400 mb-4" />}
          <p className="text-slate-300 text-center mb-4 font-['Inter'] leading-relaxed">
            {championPersona ? `${championPersona.name} will test your knowledge soon.` : "A challenge will appear here when you're ready."}
          </p>
          <button onClick={handleStartChallenge} className="lol-button lol-button-primary">
            {championPersona ? `I'm Ready, ${championPersona.name}!` : "Start Challenge"}
          </button>
        </div>
      );
    }
    
    if (currentStep === 'CHALLENGE_START_PROMPT') {
        return (
            <div className="lol-panel p-4 sm:p-6 h-full flex flex-col items-center justify-center animate-fadeIn">
                 <p className="text-lg text-slate-200 mb-6 text-center font-['Inter'] leading-relaxed">
                    {championPersona ? `${championPersona.name} says: ` : ""} 
                    "Let's see if you've understood <strong className="text-sky-300">{selectedConcept.title}</strong>!"
                </p>
                 <button onClick={handleProceedToChallengeActual} className="lol-button lol-button-primary px-8 py-3 text-lg">
                    Begin Challenge
                </button>
            </div>
        );
    }

    if (isLoading && (currentStep === 'CHALLENGE_LOADING' || currentStep === 'FEEDBACK_LOADING')) {
      let loadingText = championPersona ? `${championPersona.name} is creating a challenge...` : "Loading Challenge...";
      if (currentStep === 'FEEDBACK_LOADING') loadingText = championPersona ? `${championPersona.name} is reviewing your answer...` : "Checking Answer...";
      return <div className="lol-panel p-4 sm:p-6 h-full flex items-center justify-center"><LoadingSpinner /><p className="ml-3 text-slate-400 font-['Inter']">{loadingText}</p></div>;
    }
    
    if (currentStep === 'ERROR' && (challenge || feedback || userAnswerLetter)) {
        return (
            <div className="lol-panel p-4 sm:p-6 h-full">
            <ErrorDisplay errorMessage={error || "An unknown error occurred."} onClear={() => { setError(null); fetchChallenge(); }} />
            </div>
        );
    }


    if (challenge && (currentStep === 'CHALLENGE_LOADED' || currentStep === 'ANSWER_SUBMITTED' || currentStep === 'FEEDBACK_LOADING' || currentStep === 'FEEDBACK_LOADED')) {
      return (
        <div className="lol-panel p-4 sm:p-6 animate-fadeIn h-full flex flex-col">
          <h3 className="text-xl sm:text-2xl font-semibold text-yellow-400 mb-4 font-['Inter']">
            {championPersona ? `${championPersona.name}'s Challenge:` : "Challenge Time!"}
          </h3>
          <div className="prose prose-sm sm:prose-base prose-invert max-w-none text-slate-200 leading-relaxed selection:bg-sky-500 selection:text-white mb-4">
            {formatMarkdownString(challenge.scenario)}
          </div>
          <p className="text-slate-100 font-medium mb-4 font-['Inter']">{challenge.question}</p>
          <div className="space-y-3 mb-4">
            {challenge.options.map((opt) => {
              const isSelected = userAnswerLetter === opt.letter;
              const isDisabled = userAnswerLetter !== null || currentStep === 'FEEDBACK_LOADING';
              let buttonClass = "lol-button lol-button-secondary text-left";
              if (isSelected && userAnswerLetter) {
                buttonClass = "lol-button lol-button-primary text-left ring-2 ring-offset-2 ring-offset-slate-800 ring-sky-400";
              }
              return (
                <button
                  key={opt.letter}
                  onClick={() => !isDisabled && handleAnswerSelect(opt.letter)}
                  disabled={isDisabled}
                  className={`w-full px-4 py-3 transition-all duration-150 ${buttonClass} ${isDisabled && !isSelected ? 'opacity-60 cursor-not-allowed' : ''} ${!isDisabled ? 'hover:bg-slate-600 focus:bg-slate-600' : ''}`}
                  aria-label={`Select option ${opt.letter}: ${opt.text}`}
                  aria-pressed={isSelected}
                >
                  <span className="font-bold mr-2 text-sky-400 font-['Inter']">{opt.letter}.</span> <span className="font-['Inter']">{opt.text}</span>
                </button>
              );
            })}
          </div>
          
          {currentStep === 'FEEDBACK_LOADING' && <div className="my-4 text-center"><LoadingSpinner /><p className="text-sm text-slate-400 font-['Inter']">{championPersona ? `${championPersona.name} is checking your answer...` : "Checking Answer..."}</p></div>}

          {feedback && (currentStep === 'FEEDBACK_LOADED') && (
            <div className="mt-4 pt-4 border-t border-slate-700 animate-fadeIn">
              <h4 className="text-lg font-semibold text-green-400 mb-2 font-['Inter']">{championPersona ? `${championPersona.name}'s Feedback:` : "Feedback:"}</h4>
              <div className="prose prose-sm sm:prose-base prose-invert max-w-none text-slate-200 leading-relaxed selection:bg-sky-500 selection:text-white">
                {formatMarkdownString(feedback)}
              </div>
            </div>
          )}
          
          {(currentStep === 'FEEDBACK_LOADED') && (
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mt-auto pt-6">
              <button onClick={handleTryAnotherChallenge} className="lol-button lol-button-primary w-full sm:w-auto">
                {championPersona ? `Another Challenge, ${championPersona.name}!` : "Try Another Challenge"}
              </button>
              <button onClick={onCompleteLesson} className="lol-button lol-button-secondary w-full sm:w-auto">
                Complete Lesson
              </button>
            </div>
          )}
        </div>
      );
    }
    
    if (!isLoading) {
      return <div className="lol-panel p-4 sm:p-6 h-full flex items-center justify-center"><p className="text-slate-400 font-['Inter']">{championPersona ? `${championPersona.name} is preparing the lesson...` : "Preparing lesson..."}</p></div>;
    }
    return null;
  };


  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6 px-1">
        <h2 className="text-3xl sm:text-4xl font-['Playfair_Display'] text-sky-300 flex items-center">
          {selectedConcept.icon && <selectedConcept.icon className="w-7 h-7 sm:w-8 sm:h-8 mr-2 sm:mr-3 text-sky-400 flex-shrink-0" />}
          <span className="truncate" title={`Interactive Lesson: ${selectedConcept.title}`}>
             Interactive Lesson: {selectedConcept.title}
          </span>
        </h2>
        <button
          onClick={onCompleteLesson}
          className="lol-button lol-button-secondary text-sm px-3 py-1.5 sm:px-4 sm:py-2 flex items-center flex-shrink-0 ml-2"
          aria-label="Return Home"
        >
          <ArrowUturnLeftIcon className="w-4 h-4 mr-1 sm:mr-1.5" />
          <span className="hidden sm:inline">Return</span>
        </button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 sm:gap-6 min-h-[60vh] md:min-h-[70vh]">
        <div className="md:w-1/2 flex-shrink-0 h-auto md:max-h-[75vh]">
          {renderExplanationPanel()}
        </div>
        <div className="md:w-1/2 flex-shrink-0 h-auto md:max-h-[75vh]">
          {renderInteractiveWidgetPanel()}
        </div>
      </div>
    </div>
  );
};