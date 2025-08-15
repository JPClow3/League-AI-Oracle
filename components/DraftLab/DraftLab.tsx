import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { DraftState, Champion, AIAdvice, TeamSide, ChampionLite, ChampionSuggestion } from '../../types';
import { CHAMPIONS, CHAMPIONS_LITE, ROLES } from '../../constants';
import { getDraftAdvice, getChampionSuggestions } from '../../services/geminiService';
import { TeamPanel } from './TeamPanel';
import { AdvicePanel } from './AdvicePanel';
import { ChampionGrid } from './ChampionGrid';
import { BlueprintPanel } from './BlueprintPanel';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import toast from 'react-hot-toast';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useSettings } from '../../hooks/useSettings';
import { usePlaybook } from '../../hooks/usePlaybook';
import { GuidedTour, TourStep } from '../Onboarding/GuidedTour';

interface DraftLabProps {
  draftState: DraftState;
  setDraftState: React.Dispatch<React.SetStateAction<DraftState>>;
  onReset: () => void;
  startTour?: boolean;
  onTourComplete?: () => void;
  navigateToAcademy: (lessonId: string) => void;
}

type EnrichedChampionSuggestion = ChampionSuggestion & { champion: ChampionLite };

const GRADE_SCORES: Record<string, number> = { S: 150, A: 100, B: 50, C: 25, D: 10, F: 0 };
const getScoreValue = (score: string | undefined): number => {
    if (!score) return 0;
    const grade = score.charAt(0).toUpperCase();
    return GRADE_SCORES[grade] || 0;
}

const tourSteps: TourStep[] = [
    {
        selector: '#draftlab-welcome',
        title: 'Welcome to the Draft Lab!',
        content: 'This is your sandbox for theory-crafting. You can build team compositions for both sides and get instant AI-powered analysis.',
    },
    {
        selector: '#blueprint-panel',
        title: 'Composition Blueprints',
        content: "To get started quickly, you can load a pre-made composition. Let's try one! Click any 'Load Blueprint' button.",
    },
    {
        selector: '#analyze-button-container',
        title: 'Get AI Analysis',
        content: "Now that you have a team, click 'Analyze Composition' to get feedback. For a full analysis, both teams need 5 champions.",
    },
    {
        selector: '#advice-panel',
        title: 'Review Your Insights',
        content: "The AI provides a draft score, strengths, weaknesses, and suggestions here. This is the core of DraftWise AI!",
    },
    {
        selector: '#champion-grid-container',
        title: 'The Champion Pool',
        content: "You can click any empty slot above and then select a champion from this grid to build your own drafts from scratch.",
    },
];

export const DraftLab: React.FC<DraftLabProps> = ({ draftState, setDraftState, onReset, startTour, onTourComplete, navigateToAcademy }) => {
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [draftNotes, setDraftNotes] = useState('');
  const [selectionContext, setSelectionContext] = useState<{ team: TeamSide; type: 'pick' | 'ban'; index: number } | null>(null);
  const [activeRole, setActiveRole] = useState<string | null>(null);
  const [aiAdvice, setAiAdvice] = useState<AIAdvice | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { profile, addSP, completeMission, addChampionMastery, addRecentFeedback } = useUserProfile();
  const { settings } = useSettings();
  const { addEntry: addPlaybookEntry } = usePlaybook();
  const [hasShownUnbalancedTip, setHasShownUnbalancedTip] = useState(false);
  const [shouldGlowSaveButton, setShouldGlowSaveButton] = useState(false);

  const [recommendations, setRecommendations] = useState<EnrichedChampionSuggestion[]>([]);
  const [isRecsLoading, setIsRecsLoading] = useState(false);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const previousDraftState = useRef(JSON.stringify(draftState));
  
  // Create a stable string representation of draftState for useEffect dependencies
  const draftStateString = useMemo(() => JSON.stringify(draftState), [draftState]);


  const isDraftEmpty = useMemo(() => {
    const allSlots = [
      ...draftState.blue.picks, ...draftState.blue.bans,
      ...draftState.red.picks, ...draftState.red.bans,
    ];
    return allSlots.every(slot => slot.champion === null);
  }, [draftState]);

  useEffect(() => {
    if (previousDraftState.current !== draftStateString) {
        setAiAdvice(null);
        setError(null);
        setShouldGlowSaveButton(false);
        previousDraftState.current = draftStateString;
    }
  }, [draftStateString]);

  useEffect(() => {
    if (!selectionContext) {
      setRecommendations([]);
      setIsRecsLoading(false);
      setActiveRole(null);
      return;
    }

    if (selectionContext.type === 'pick') {
        setActiveRole(ROLES[selectionContext.index]);
    } else {
        setActiveRole(null);
    }

    const controller = new AbortController();
    const { signal } = controller;

    const fetchRecs = async () => {
      setIsRecsLoading(true);
      setRecommendations([]);
      try {
        const topMasteryChamps = profile.championMastery
            .sort((a, b) => b.points - a.points)
            .slice(0, 3)
            .map(m => CHAMPIONS_LITE.find(c => c.id === m.championId)?.name)
            .filter((name): name is string => !!name);

        const suggestions = await getChampionSuggestions(draftState, selectionContext, settings.primaryRole, topMasteryChamps, signal);
        if (signal.aborted) return;
        
        const enrichedSuggestions = suggestions
            .map(rec => {
                const champion = CHAMPIONS_LITE.find(c => c.name.toLowerCase() === rec.championName.toLowerCase());
                return champion ? { ...rec, champion } : null;
            })
            .filter((item): item is EnrichedChampionSuggestion => item !== null);

        setRecommendations(enrichedSuggestions);
      } catch (err) {
        if (signal.aborted) return;
        if (!(err instanceof DOMException && err.name === 'AbortError')) {
          console.error("Failed to fetch recommendations:", err);
          toast.error("Could not fetch champion suggestions.");
        }
      } finally {
        if (!signal.aborted) {
          setIsRecsLoading(false);
        }
      }
    };

    fetchRecs();

    return () => {
      controller.abort();
    };
  }, [selectionContext, draftStateString, settings.primaryRole, profile.championMastery]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const handleAnalyze = useCallback(async (signal: AbortSignal) => {
    setIsLoading(true);
    setError(null);
    try {
      const advice = await getDraftAdvice(draftState, settings.primaryRole, signal);
      if (!signal.aborted) {
        setAiAdvice(advice);
        
        // --- Gamification & Contextual Feedback Logic ---
        const score = advice.teamAnalysis.blue.draftScore;
        const weaknesses = advice.teamAnalysis.blue.weaknesses;

        if (weaknesses && weaknesses.length > 0) {
            addRecentFeedback({
                type: 'lesson',
                message: `The AI identified a weakness in your last draft: "${weaknesses[0]}". Consider reviewing relevant lessons.`
            });
        }
        
        completeMission('gs1'); // Onboarding mission
        
        const today = new Date().toISOString().split('T')[0];
        if (profile.lastLabAnalysisDate !== today) {
            completeMission('d1');
        }
        
        const spFromScore = getScoreValue(score);
        if (spFromScore > 0) {
            addSP(spFromScore, "Draft Analysis");
        }

        if (score?.startsWith('S')) {
            completeMission('w3');
            setShouldGlowSaveButton(true);
        }
        
        if (score?.startsWith('A') || score?.startsWith('S')) {
            const bluePicks = draftState.blue.picks.map(p => p.champion).filter(c => c);
            addChampionMastery(bluePicks as Champion[], score);
            toast(`+${score.startsWith('S') ? '100' : '50'} Mastery Points!`, { icon: '🏆' });
        }
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        console.log("Analysis request was aborted.");
        return;
      }
      if (!signal.aborted) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred.');
        }
      }
    } finally {
      if (!signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [draftState, addSP, completeMission, addChampionMastery, addRecentFeedback, profile.lastLabAnalysisDate, settings.primaryRole]);
  
  const isDraftComplete = useMemo(() => {
      const bluePicks = draftState.blue.picks.filter(p => p.champion).length;
      const redPicks = draftState.red.picks.filter(p => p.champion).length;
      return bluePicks === 5 && redPicks === 5;
  }, [draftState]);

  const handleAnalyzeClick = () => {
    if (!isDraftComplete) {
      toast.error("Please complete all 10 picks for a full analysis.");
      return;
    }
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    handleAnalyze(controller.signal);
  };

  const handleSlotClick = (team: TeamSide, type: 'pick' | 'ban', index: number) => {
    if (selectionContext?.team === team && selectionContext?.type === type && selectionContext?.index === index) {
        setSelectionContext(null);
    } else {
        setSelectionContext({ team, type, index });
    }
  };

  const handleChampionSelect = useCallback((championLite: ChampionLite) => {
    if (!selectionContext) return;

    const champion = CHAMPIONS.find(c => c.id === championLite.id);
    if (!champion) {
        console.error("Selected champion not found in full list:", championLite.id);
        toast.error("An error occurred selecting the champion.");
        return;
    }
    
    const { team, type, index } = selectionContext;

    setDraftState(prevState => {
      const isPick = type === 'pick';
      const targetArray = isPick ? prevState[team].picks : prevState[team].bans;

      const newArray = targetArray.map((slot, i) =>
        i === index ? { ...slot, champion } : slot
      );

      return {
        ...prevState,
        [team]: {
          ...prevState[team],
          [isPick ? 'picks' : 'bans']: newArray,
        },
      };
    });

    setAiAdvice(null); // Invalidate old advice on change
    setSelectionContext(null); // Deselect slot after picking
  }, [selectionContext, setDraftState]);

  const handleReset = () => {
    onReset();
    setAiAdvice(null);
    setError(null);
    setSelectionContext(null);
    setHasShownUnbalancedTip(false);
    setShouldGlowSaveButton(false);
  };
  
  const handleSaveToPlaybook = () => {
    let initialNotes = '';
    if (aiAdvice) {
        const { blue, red } = aiAdvice.teamAnalysis;
        initialNotes = `AI Analysis Summary:\n- Blue Score: ${blue.draftScore} (${blue.draftScoreReasoning})\n- Blue Strengths: ${blue.strengths.join(', ')}\n- Red Score: ${red.draftScore}\n- Red Strengths: ${red.strengths.join(', ')}`;
    }
    setDraftNotes(initialNotes);
    setDraftName('');
    setIsSaveModalOpen(true);
  };

  const confirmSaveToPlaybook = () => {
    if (draftName.trim()) {
        if (addPlaybookEntry(draftName.trim(), draftState, aiAdvice, draftNotes)) {
            setIsSaveModalOpen(false);
            completeMission('gs3'); // Onboarding
            completeMission('w2');
        }
    }
  };

  const handleShare = () => {
    const formatTeam = (side: TeamSide) => {
        const team = draftState[side];
        const picks = team.picks.map(p => p.champion?.name || 'Empty').join(', ');
        const bans = team.bans.map(b => b.champion?.name || 'Empty').join(', ');
        return `${side.toUpperCase()} TEAM\nPicks: ${picks}\nBans: ${bans}`;
    };
    const summary = `DraftWise AI Summary\n\n${formatTeam('blue')}\n\n${formatTeam('red')}`;
    navigator.clipboard.writeText(summary).then(() => {
        toast.success('Draft summary copied to clipboard!');
    }, () => {
        toast.error('Failed to copy draft summary.');
    });
  };

  const handleBlueprintLoad = (championIds: string[]) => {
    setDraftState(prevState => {
        const blueprintChampions = championIds.map(id => CHAMPIONS.find(c => c.id === id) || null);

        const newBluePicks = prevState.blue.picks.map((slot, i) => {
            if (i < blueprintChampions.length) {
                return { ...slot, champion: blueprintChampions[i] };
            }
            return slot;
        });

        const newRedPicks = prevState.red.picks.map(slot => ({ ...slot, champion: null }));

        return {
            ...prevState,
            blue: {
                ...prevState.blue,
                picks: newBluePicks
            },
            red: {
                ...prevState.red,
                picks: newRedPicks
            }
        };
    });
    setSelectionContext(null); // Clear selection context to prevent side-effects
    setAiAdvice(null);
    setError(null);
  };

  const availableChampions = useMemo(() => {
    const allPicksAndBans = [
      ...draftState.blue.picks, ...draftState.red.picks,
      ...draftState.blue.bans, ...draftState.red.bans
    ];
    const pickedIds = new Set(allPicksAndBans.filter(s => s.champion).map(s => s.champion!.id));
    return CHAMPIONS_LITE.filter(c => !pickedIds.has(c.id));
  }, [draftState]);

  const getActiveSlotForTeam = (team: TeamSide) => {
    if (selectionContext?.team === team) {
      return { type: selectionContext.type, index: selectionContext.index };
    }
    return null;
  };
  
  const handleUnbalancedDraftTip = useCallback((isUnbalanced: boolean) => {
      if (isUnbalanced && !hasShownUnbalancedTip && profile.level < 5) {
          toast.custom((t) => (
            <div
              className={`${
                t.visible ? 'animate-enter' : 'animate-leave'
              } max-w-md w-full bg-slate-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 border border-yellow-500/50`}
            >
              <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 pt-0.5 text-yellow-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-semibold text-yellow-300">
                      Pro Tip
                    </p>
                    <p className="mt-1 text-sm text-gray-300">
                      Your team has a lot of one damage type! Consider adding a different threat to make it harder for the enemy to itemize.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex border-l border-slate-700">
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-blue-400 hover:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Close
                </button>
              </div>
            </div>
          ), {
            id: 'unbalanced-tip',
            duration: 8000
          });
          setHasShownUnbalancedTip(true);
      }
  }, [profile.level, hasShownUnbalancedTip]);

  return (
    <div className="space-y-6">
       <GuidedTour
            isOpen={!!startTour}
            onClose={onTourComplete!}
            steps={tourSteps}
        />
      <div id="draftlab-welcome" className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-4 rounded-xl shadow-lg">
        <div className="flex items-center gap-4">
            <div className="bg-slate-700/50 text-blue-300 w-12 h-12 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
            </div>
            <div>
                <h1 className="font-display text-3xl font-bold text-white">Draft Lab</h1>
                <p className="text-sm text-gray-400">Theory-craft compositions with live AI analysis.</p>
            </div>
        </div>
        <div className="flex flex-wrap gap-2">
            <Button onClick={handleShare} variant="secondary" disabled={isDraftEmpty}>Share Draft</Button>
            <Button 
                onClick={handleSaveToPlaybook} 
                variant="secondary" 
                disabled={isDraftEmpty}
                className={shouldGlowSaveButton ? 'animate-pulse-glow' : ''}
            >
                Save to Playbook
            </Button>
            <Button onClick={handleReset} variant="danger">Reset</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TeamPanel side="blue" state={draftState.blue} onSlotClick={handleSlotClick} activeSlot={getActiveSlotForTeam('blue')} onTeamUpdate={handleUnbalancedDraftTip} />
        
        <div className="lg:col-span-1 order-first lg:order-none flex flex-col gap-4">
            <div id="analyze-button-container" className="bg-slate-800 p-4 rounded-lg flex justify-center items-center">
                <Button 
                    onClick={handleAnalyzeClick} 
                    disabled={isLoading}
                    variant="primary-glow"
                    className="text-lg px-8 py-4 w-full transform hover:scale-105"
                >
                    {isLoading ? 'Analyzing...' : 'Analyze Composition'}
                </Button>
            </div>
            <div id="advice-panel">
                 <AdvicePanel advice={aiAdvice} isLoading={isLoading} error={error} userRole={settings.primaryRole} navigateToAcademy={navigateToAcademy} />
            </div>
        </div>

        <TeamPanel side="red" state={draftState.red} onSlotClick={handleSlotClick} activeSlot={getActiveSlotForTeam('red')} />
      </div>

      <div id="blueprint-panel">
         <BlueprintPanel onLoad={handleBlueprintLoad} />
      </div>

      <div id="champion-grid-container" className="bg-slate-800/50 rounded-lg shadow-lg">
          <div className="p-4">
            <h2 className="font-display text-2xl font-bold text-white">
                {selectionContext 
                    ? <span className="text-yellow-300">Selecting for {selectionContext.team} team's {selectionContext.type} #{selectionContext.index + 1}</span>
                    : 'Champion Pool'
                }
            </h2>
          </div>
          <div className="h-[650px]">
              <ChampionGrid 
                champions={availableChampions} 
                onSelect={handleChampionSelect}
                recommendations={recommendations}
                isRecsLoading={isRecsLoading}
                activeRole={activeRole}
              />
          </div>
      </div>

      <Modal 
        isOpen={isSaveModalOpen} 
        onClose={() => {
            setIsSaveModalOpen(false);
            setDraftName('');
            setDraftNotes('');
        }} 
        title="Save Draft to Playbook"
      >
        <div className="p-4 space-y-4">
            <div>
                <label htmlFor="draftName" className="block text-sm font-medium text-gray-300">Draft Name</label>
                <input
                    id="draftName"
                    type="text"
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    placeholder="e.g., Anti-Dive Comp"
                    className="w-full mt-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <div>
                <label htmlFor="draftNotes" className="block text-sm font-medium text-gray-300">Notes (auto-filled from AI)</label>
                 <textarea
                    id="draftNotes"
                    value={draftNotes}
                    onChange={(e) => setDraftNotes(e.target.value)}
                    rows={4}
                    placeholder="Add personal notes here..."
                    className="w-full mt-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => { setIsSaveModalOpen(false); setDraftName(''); setDraftNotes(''); }}>Cancel</Button>
                <Button variant="primary" onClick={confirmSaveToPlaybook} disabled={!draftName.trim()}>Save</Button>
            </div>
        </div>
      </Modal>

    </div>
  );
};
