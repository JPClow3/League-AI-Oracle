import React, { useState, useCallback, useMemo, useEffect, useRef, useReducer } from 'react';
import type { DraftState, Champion, AIAdvice, TeamSide, ChampionLite, ChampionSuggestion } from '../../types';
import { ROLES, MISSION_IDS } from '../../constants';
import { getDraftAdvice, getChampionSuggestions, generateDraftName, getTierList, getPatchNotesSummary } from '../../services/geminiService';
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
import { useDraft } from '../../contexts/DraftContext';
import { GuidedTour, TourStep } from '../Onboarding/GuidedTour';
import { QuickLookPanel } from './QuickLookPanel';
import { KEYWORDS } from '../Academy/lessons';
import { FlaskConical } from 'lucide-react';
import { ConfirmationModal, ConfirmationState } from '../common/ConfirmationModal';
import { useChampions } from '../../contexts/ChampionContext';
import { motion, AnimatePresence } from 'framer-motion';
import { updateSlotInDraft } from '../../lib/draftUtils';

interface DraftLabProps {
  startTour?: boolean;
  onTourComplete?: () => void;
  navigateToAcademy: (lessonId: string) => void;
}

type EnrichedChampionSuggestion = ChampionSuggestion & { champion: ChampionLite };
type IntelData = { sTier: string[], buffs: string[], nerfs: string[] };
type DraggedOverSlot = { team: TeamSide; type: 'pick' | 'ban'; index: number };
type MobileTab = 'blue' | 'red' | 'ai';

// --- State Management with useReducer ---

interface DraftLabState {
    selectionContext: DraggedOverSlot | null;
    aiAdvice: AIAdvice | null;
    isLoading: boolean;
    error: string | null;
    recommendations: EnrichedChampionSuggestion[];
    isRecsLoading: boolean;
    mobileTab: MobileTab;
    analysisCompleted: boolean;
    confirmationWarnings: ConfirmationState | null;
}

type DraftLabAction =
    | { type: 'SET_SELECTION_CONTEXT'; payload: DraggedOverSlot | null }
    | { type: 'START_ANALYSIS' }
    | { type: 'ANALYSIS_SUCCESS'; payload: AIAdvice }
    | { type: 'ANALYSIS_ERROR'; payload: string }
    | { type: 'START_RECS_FETCH' }
    | { type: 'RECS_FETCH_SUCCESS'; payload: EnrichedChampionSuggestion[] }
    | { type: 'RECS_FETCH_ERROR' }
    | { type: 'CLEAR_ANALYSIS' }
    | { type: 'SET_MOBILE_TAB'; payload: MobileTab }
    | { type: 'SET_ANALYSIS_COMPLETED'; payload: boolean }
    | { type: 'SET_CONFIRMATION'; payload: ConfirmationState | null };

const initialState: DraftLabState = {
    selectionContext: null,
    aiAdvice: null,
    isLoading: false,
    error: null,
    recommendations: [],
    isRecsLoading: false,
    mobileTab: 'blue',
    analysisCompleted: false,
    confirmationWarnings: null,
};

function draftLabReducer(state: DraftLabState, action: DraftLabAction): DraftLabState {
    switch (action.type) {
        case 'SET_SELECTION_CONTEXT':
            return { ...state, selectionContext: action.payload };
        case 'START_ANALYSIS':
            return { ...state, isLoading: true, error: null };
        case 'ANALYSIS_SUCCESS':
            return { ...state, isLoading: false, aiAdvice: action.payload, analysisCompleted: true, mobileTab: 'ai' };
        case 'ANALYSIS_ERROR':
            return { ...state, isLoading: false, error: action.payload };
        case 'START_RECS_FETCH':
            return { ...state, isRecsLoading: true, recommendations: [] };
        case 'RECS_FETCH_SUCCESS':
            return { ...state, isRecsLoading: false, recommendations: action.payload };
        case 'RECS_FETCH_ERROR':
            return { ...state, isRecsLoading: false };
        case 'CLEAR_ANALYSIS':
            return { ...state, aiAdvice: null, error: null };
        case 'SET_MOBILE_TAB':
            return { ...state, mobileTab: action.payload };
        case 'SET_ANALYSIS_COMPLETED':
            return { ...state, analysisCompleted: action.payload };
        case 'SET_CONFIRMATION':
            return { ...state, confirmationWarnings: action.payload };
        default:
            return state;
    }
}
// --- End State Management ---

const GRADE_SCORES: Record<string, number> = { S: 150, A: 100, B: 50, C: 25, D: 10, F: 0 };
const getScoreValue = (score: string | undefined): number => {
    if (!score) return 0;
    const grade = score.charAt(0).toUpperCase();
    return GRADE_SCORES[grade] || 0;
}

const tourSteps: TourStep[] = [
    {
        selector: '#draftlab-welcome',
        title: 'Welcome to the Strategy Forge!',
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

const validateDraft = (draftState: DraftState): string[] => {
    const warnings: string[] = [];
    const allPicks = [...draftState.blue.picks, ...draftState.red.picks];
    const pickedChampions = allPicks.map(p => p.champion).filter((c): c is Champion => !!c);

    // 1. Duplicate Champion Check
    const championIds = pickedChampions.map(c => c.id);
    const uniqueChampionIds = new Set(championIds);
    if (championIds.length !== uniqueChampionIds.size) {
        warnings.push("Duplicate champions have been picked. A valid draft cannot have the same champion selected more than once.");
    }

    const scoreMap: Record<string, number> = { Low: 1, Medium: 2, High: 3 };

    // 2. Per-team checks (Damage & CC)
    (['blue', 'red'] as const).forEach(teamSide => {
        const teamPicks = draftState[teamSide].picks.map(p => p.champion).filter((c): c is Champion => !!c);
        if (teamPicks.length < 5) return; // Only run these checks on full teams

        // Damage Profile Check
        const damageProfile = teamPicks.reduce((acc, champ) => {
            if (champ.damageType === 'AD') acc.ad++;
            else if (champ.damageType === 'AP') acc.ap++;
            return acc;
        }, { ad: 0, ap: 0 });

        if (damageProfile.ad >= 4 && damageProfile.ap <= 1) { // allow for 1 mixed/ap champ
             warnings.push(`The ${teamSide} team has a heavily AD-focused damage profile, which can be easily countered with armor.`);
        }
        if (damageProfile.ap >= 4 && damageProfile.ad <= 1) {
             warnings.push(`The ${teamSide} team has a heavily AP-focused damage profile, which can be easily countered with magic resist.`);
        }

        // CC Check
        const ccScore = teamPicks.reduce((sum, champ) => sum + (scoreMap[champ.cc] || 0), 0);
        if (ccScore <= 6) { // A threshold for low CC. 5 champs with "Low" CC would be 5.
            warnings.push(`The ${teamSide} team appears to have very low crowd control, which may make it difficult to lock down targets or start fights.`);
        }
    });

    return warnings;
};


export const DraftLab = ({ startTour, onTourComplete, navigateToAcademy }: DraftLabProps) => {
  const { draftState, setDraftState, resetDraft: onReset } = useDraft();
  const { champions, championsLite, latestVersion } = useChampions();
  
  // --- REDUCER STATE ---
  const [state, dispatch] = useReducer(draftLabReducer, initialState);
  const { selectionContext, aiAdvice, isLoading, error, recommendations, isRecsLoading, mobileTab, analysisCompleted, confirmationWarnings } = state;

  // --- LOCAL UI STATE ---
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [draftNotes, setDraftNotes] = useState('');
  const [activeRole, setActiveRole] = useState<string | null>(null);
  const [counterMetaMode, setCounterMetaMode] = useState(false);
  const [quickLookChampion, setQuickLookChampion] = useState<ChampionLite | null>(null);
  const [draggedOverSlot, setDraggedOverSlot] = useState<DraggedOverSlot | null>(null);
  const [isAnalysisStale, setIsAnalysisStale] = useState(false);
  
  const { profile, addSP, completeMission, addChampionMastery, addRecentFeedback } = useUserProfile();
  const { settings } = useSettings();
  const { addEntry: addPlaybookEntry } = usePlaybook();
  
  const advicePanelRef = useRef<HTMLDivElement>(null);
  const [intelData, setIntelData] = useState<IntelData | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const draftStateString = useMemo(() => JSON.stringify(draftState), [draftState]);

  // Fetch contextual intel data on load
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const fetchIntel = async () => {
        try {
            const [tierList, patchNotes] = await Promise.all([
                getTierList(signal),
                getPatchNotesSummary(signal)
            ]);
            
            if (signal.aborted) return;
            
            const sTier = tierList.tierList.flatMap(role => role.champions.map(c => c.championName));
            const buffs = patchNotes.buffs.map(b => b.name);
            const nerfs = patchNotes.nerfs.map(n => n.name);

            setIntelData({ sTier, buffs, nerfs });
        } catch (err) {
            if (err instanceof DOMException && err.name === 'AbortError') return;
            console.error("Failed to fetch intel data:", err);
        }
    };
    
    fetchIntel();
    
    return () => controller.abort();
  }, []);

  const isDraftEmpty = useMemo(() => {
    const allSlots = [
      ...draftState.blue.picks, ...draftState.blue.bans,
      ...draftState.red.picks, ...draftState.red.bans,
    ];
    return allSlots.every(slot => slot.champion === null);
  }, [draftState]);

  // Mark analysis as stale when draft changes, instead of clearing it
  useEffect(() => {
    if (aiAdvice) {
        setIsAnalysisStale(true);
    }
  }, [draftStateString, aiAdvice]);

  useEffect(() => {
    if (!selectionContext) {
      dispatch({ type: 'RECS_FETCH_SUCCESS', payload: [] });
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
      dispatch({ type: 'START_RECS_FETCH' });
      try {
        const topMasteryChamps = profile.championMastery
            .sort((a, b) => b.points - a.points)
            .slice(0, 3)
            .map(m => championsLite.find(c => c.id === m.championId)?.name)
            .filter((name): name is string => !!name);

        const suggestions = await getChampionSuggestions(draftState, selectionContext, settings.primaryRole, profile.skillLevel, topMasteryChamps, counterMetaMode ? 'counter-meta' : 'standard', signal);
        if (signal.aborted) return;
        
        const enrichedSuggestions = suggestions
            .map(rec => {
                const champion = championsLite.find(c => c.name.toLowerCase() === rec.championName.toLowerCase());
                return champion ? { ...rec, champion } : null;
            })
            .filter((item): item is EnrichedChampionSuggestion => item !== null);

        dispatch({ type: 'RECS_FETCH_SUCCESS', payload: enrichedSuggestions });
      } catch (err) {
        if (signal.aborted) return;
        if (!(err instanceof DOMException && err.name === 'AbortError')) {
          console.error("Failed to fetch recommendations:", err);
          toast.error("Could not fetch champion suggestions.");
          dispatch({ type: 'RECS_FETCH_ERROR' });
        }
      }
    };

    fetchRecs();

    return () => {
      controller.abort();
    };
  }, [selectionContext, draftStateString, settings.primaryRole, profile.skillLevel, profile.championMastery, counterMetaMode, championsLite]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const handleAnalyze = useCallback(async (signal: AbortSignal) => {
    dispatch({ type: 'START_ANALYSIS' });
    setIsAnalysisStale(false);
    try {
      const advice = await getDraftAdvice(draftState, settings.primaryRole, profile.skillLevel, signal);
      if (!signal.aborted) {
        dispatch({ type: 'ANALYSIS_SUCCESS', payload: advice });
        
        setTimeout(() => {
            advicePanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
        
        const score = advice.teamAnalysis.blue.draftScore;
        const weaknesses = advice.teamAnalysis.blue.weaknesses;

        if (weaknesses && weaknesses.length > 0) {
            addRecentFeedback({
                type: 'lesson',
                message: `The AI identified a weakness in your last draft: "${weaknesses[0].description}". Consider reviewing relevant lessons.`
            });
        }
        
        if (score && ['C', 'D', 'F'].some(g => score.startsWith(g))) {
            const hasActionableWeakness = weaknesses.some(w => w.keyword && KEYWORDS.some(k => k.term.toLowerCase() === w.keyword!.toLowerCase()));
            if(hasActionableWeakness) {
                 addRecentFeedback({
                    type: 'lesson',
                    message: `Your last draft was challenging (${score}). We've identified a key weakness to focus on.`
                });
                toast.custom((t) => (
                    <div className={`${ t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-bg-secondary shadow-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 border border-warning/50`}>
                        <div className="flex-1 w-0 p-4">
                            <div className="flex items-start">
                                <div className="ml-3 flex-1">
                                    <p className="text-sm font-semibold text-warning">Pro Tip Available!</p>
                                    <p className="mt-1 text-sm text-text-secondary">Tough draft! We've added a Pro Tip to your profile to help with that.</p>
                                </div>
                            </div>
                        </div>
                         <div className="flex border-l border-border-primary">
                             <button onClick={() => {toast.dismiss(t.id);}} className="w-full border border-transparent p-4 flex items-center justify-center text-sm font-medium text-gold hover:text-gold/80 focus:outline-none focus:ring-2 focus:ring-gold">Close</button>
                        </div>
                    </div>
                ), { id: 'pro-tip-toast' });
            }
        }
        
        completeMission(MISSION_IDS.GETTING_STARTED.FIRST_ANALYSIS);
        
        const today = new Date().toISOString().split('T')[0];
        if (profile.lastLabAnalysisDate !== today) {
            completeMission(MISSION_IDS.DAILY.FIRST_DRAFT_OF_DAY);
        }
        
        const spFromScore = getScoreValue(score);
        if (spFromScore > 0) {
            addSP(spFromScore, "Draft Analysis");
        }

        if (score?.startsWith('S')) {
            completeMission(MISSION_IDS.WEEKLY.PERFECT_COMP);
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
        dispatch({ type: 'ANALYSIS_ERROR', payload: err instanceof Error ? err.message : 'An unknown error occurred.' });
      }
    }
  }, [draftState, addSP, completeMission, addChampionMastery, addRecentFeedback, profile.lastLabAnalysisDate, settings.primaryRole, profile.skillLevel]);
  
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
    
    const warnings = validateDraft(draftState);

    const performAnalysis = () => {
        abortControllerRef.current?.abort();
        const controller = new AbortController();
        abortControllerRef.current = controller;
        handleAnalyze(controller.signal);
    };

    if (warnings.length > 0) {
        dispatch({ type: 'SET_CONFIRMATION', payload: {
            title: "Draft Composition Warnings",
            message: (
                <div className="space-y-2 text-left">
                    <p>The AI has identified potential issues with your draft. You can still proceed with the analysis, but consider these points:</p>
                    <ul className="list-disc list-inside text-sm text-text-secondary space-y-1">
                        {warnings.map((warning, index) => <li key={index}>{warning}</li>)}
                    </ul>
                </div>
            ),
            onConfirm: performAnalysis,
            confirmVariant: 'primary',
            confirmText: 'Analyze Anyway'
        }});
    } else {
        performAnalysis();
    }
  };

  const handleSlotClick = (team: TeamSide, type: 'pick' | 'ban', index: number) => {
    if (selectionContext?.team === team && selectionContext?.type === type && selectionContext?.index === index) {
        dispatch({ type: 'SET_SELECTION_CONTEXT', payload: null });
    } else {
        dispatch({ type: 'SET_SELECTION_CONTEXT', payload: { team, type, index } });
    }
  };

  const updateDraftSlotAndMarkStale = useCallback((champion: Champion | null, team: TeamSide, type: 'pick' | 'ban', index: number) => {
    setDraftState(prev => updateSlotInDraft(prev, team, type, index, champion));
    if (aiAdvice) {
        setIsAnalysisStale(true);
    }
  }, [setDraftState, aiAdvice]);
  
  const handleChampionSelect = useCallback((championLite: ChampionLite) => {
    if (!selectionContext) return;

    const allPicksAndBans = [
        ...draftState.blue.picks, ...draftState.red.picks,
        ...draftState.blue.bans, ...draftState.red.bans
    ];
    const isAlreadyPicked = allPicksAndBans.some(slot => slot.champion?.id === championLite.id);
    if (isAlreadyPicked) {
        toast.error(`${championLite.name} is already picked or banned.`);
        return;
    }

    const champion = champions.find(c => c.id === championLite.id);
    if (!champion) {
        console.error("Selected champion not found in full list:", championLite.id);
        toast.error("An error occurred selecting the champion.");
        return;
    }
    
    const { team, type, index } = selectionContext;
    updateDraftSlotAndMarkStale(champion, team, type, index);
    dispatch({ type: 'SET_SELECTION_CONTEXT', payload: null });
  }, [selectionContext, updateDraftSlotAndMarkStale, champions, draftState]);

  const handleClearSlot = useCallback((team: TeamSide, type: 'pick' | 'ban', index: number) => {
    updateDraftSlotAndMarkStale(null, team, type, index);
  }, [updateDraftSlotAndMarkStale]);
  
  const handleDragStart = (event: React.DragEvent, championId: string) => {
    event.dataTransfer.setData('championId', championId);
    event.dataTransfer.effectAllowed = 'copy';
  };
  
  const handleDragOver = (event: React.DragEvent) => {
      event.preventDefault();
  };
  
  const handleDragEnter = (event: React.DragEvent, team: TeamSide, type: 'pick' | 'ban', index: number) => {
      event.preventDefault();
      setDraggedOverSlot({ team, type, index });
  };
  
  const handleDragLeave = () => {
      setDraggedOverSlot(null);
  };
  
  const handleDrop = (event: React.DragEvent, team: TeamSide, type: 'pick' | 'ban', index: number) => {
      event.preventDefault();
      const championId = event.dataTransfer.getData('championId');
      
      const allPicksAndBans = [
          ...draftState.blue.picks, ...draftState.red.picks,
          ...draftState.blue.bans, ...draftState.red.bans
      ];
      const isAlreadyPicked = allPicksAndBans.some(slot => slot.champion?.id === championId);
      if (isAlreadyPicked) {
          const championName = champions.find(c => c.id === championId)?.name || 'Champion';
          toast.error(`${championName} is already picked or banned.`);
          setDraggedOverSlot(null);
          return;
      }

      const champion = champions.find(c => c.id === championId);
      if (champion) {
          updateDraftSlotAndMarkStale(champion, team, type, index);
      }
      setDraggedOverSlot(null);
      dispatch({ type: 'SET_SELECTION_CONTEXT', payload: null });
  };

  const handleReset = () => {
    onReset();
    dispatch({ type: 'SET_SELECTION_CONTEXT', payload: null });
    dispatch({ type: 'CLEAR_ANALYSIS' });
    setIsAnalysisStale(false);
    dispatch({ type: 'SET_MOBILE_TAB', payload: 'blue' });
  };
  
  const handleSaveToPlaybook = async () => {
    setIsSaveModalOpen(true);
    let initialNotes = '';
    if (aiAdvice) {
        const { blue, red } = aiAdvice.teamAnalysis;
        initialNotes = `AI Analysis Summary:\n- Blue Score: ${blue.draftScore} (${blue.draftScoreReasoning})\n- Blue Strengths: ${blue.strengths.join(', ')}\n- Red Score: ${red.draftScore}\n- Red Strengths: ${red.strengths.join(', ')}`;
    }
    setDraftNotes(initialNotes);
    
    setDraftName('Generating name...');
    try {
        const tempName = await generateDraftName(draftState);
        setDraftName(tempName || '');
    } catch (e) {
        console.error("Failed to generate draft name:", e);
        setDraftName('');
        toast.error("Could not suggest a name for the draft.");
    }
  };

  const confirmSaveToPlaybook = async () => {
    if (draftName.trim() && !isSaving) {
        setIsSaving(true);
        const success = await addPlaybookEntry(draftName.trim(), draftState, aiAdvice, draftNotes);
        setIsSaving(false);
        if (success) {
            setIsSaveModalOpen(false);
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
        const blueprintChampions = championIds.map(id => champions.find(c => c.id === id) || null);

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
    dispatch({ type: 'SET_SELECTION_CONTEXT', payload: null });
  };

  const getActiveSlotForTeam = (team: TeamSide) => {
    if (selectionContext?.team === team) {
      return { type: selectionContext.type, index: selectionContext.index };
    }
    return null;
  };
  
  const MobileTabButton = ({ target, children }: { target: MobileTab, children: React.ReactNode }) => (
    <button 
        id={`mobile-tab-btn-${target}`}
        role="tab"
        aria-selected={mobileTab === target}
        aria-controls={`mobile-tab-panel-${target}`}
        onClick={() => dispatch({ type: 'SET_MOBILE_TAB', payload: target })} 
        className={`px-4 py-3 rounded-md w-full text-center font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent focus-visible:ring-offset-surface-primary ${mobileTab === target ? 'bg-accent text-on-accent' : 'text-text-secondary hover:bg-surface-secondary'}`}
    >
        {children}
    </button>
  );

  const TABS: MobileTab[] = ['blue', 'red', 'ai'];
  const SWIPE_CONFIDENCE_THRESHOLD = 10000;
  const handleSwipe = (offset: { x: number; y: number }, velocity: { x: number; y: number }) => {
    const swipePower = Math.abs(offset.x) * velocity.x;
    if (swipePower < -SWIPE_CONFIDENCE_THRESHOLD) { // Swiped left
        const currentIndex = TABS.indexOf(mobileTab);
        if (currentIndex < TABS.length - 1) {
            dispatch({ type: 'SET_MOBILE_TAB', payload: TABS[currentIndex + 1] });
        }
    } else if (swipePower > SWIPE_CONFIDENCE_THRESHOLD) { // Swiped right
        const currentIndex = TABS.indexOf(mobileTab);
        if (currentIndex > 0) {
            dispatch({ type: 'SET_MOBILE_TAB', payload: TABS[currentIndex - 1] });
        }
    }
  };


  return (
    <div className="space-y-6">
       <GuidedTour
            isOpen={!!startTour}
            onClose={onTourComplete!}
            steps={tourSteps}
        />
        <QuickLookPanel champion={quickLookChampion} onClose={() => setQuickLookChampion(null)} />
         <ConfirmationModal 
            isOpen={!!confirmationWarnings}
            onClose={() => dispatch({ type: 'SET_CONFIRMATION', payload: null })}
            state={confirmationWarnings}
        />
      <div id="draftlab-welcome" className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-bg-secondary border border-border-primary p-4 shadow-sm">
        <div className="flex items-center gap-4">
            <div className="bg-accent/10 text-accent w-12 h-12 flex items-center justify-center">
                <FlaskConical size={32} />
            </div>
            <div>
                <h1 className="font-display text-3xl font-bold text-text-primary tracking-wide">Strategy Forge</h1>
                <p className="text-sm text-text-secondary">Forge and test team compositions with instant, AI-powered strategic feedback.</p>
                <p className="text-xs text-text-muted mt-1">AI analysis based on patch {latestVersion}</p>
            </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 bg-surface-tertiary p-1">
                <label htmlFor="counter-meta-toggle" className="text-xs font-semibold text-text-secondary pl-2">Counter-Meta</label>
                <button onClick={() => setCounterMetaMode(!counterMetaMode)} id="counter-meta-toggle" role="switch" aria-checked={counterMetaMode} className={`relative inline-flex items-center h-6 w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface-tertiary focus:ring-gold ${counterMetaMode ? 'bg-gold' : 'bg-surface-inset'}`}>
                    <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${counterMetaMode ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
            </div>
            <Button onClick={handleShare} variant="secondary" disabled={isDraftEmpty}>Share Draft</Button>
            <Button 
                onClick={handleSaveToPlaybook} 
                variant="secondary" 
                disabled={isDraftEmpty}
            >
                Save to The Archives
            </Button>
            <Button onClick={handleReset} variant="danger">Reset</Button>
        </div>
      </div>

        {/* Desktop Layout */}
        <div className="hidden lg:grid grid-cols-1 lg:grid-cols-3 gap-6">
            <TeamPanel side="blue" state={draftState.blue} onSlotClick={handleSlotClick} activeSlot={getActiveSlotForTeam('blue')} onClearSlot={handleClearSlot} onDrop={handleDrop} onDragOver={handleDragOver} onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} draggedOverSlot={draggedOverSlot} />
            
            <div className="lg:col-span-1 order-first lg:order-none flex flex-col gap-4">
                <div id="analyze-button-container" className="bg-bg-secondary border border-border-primary p-4 flex justify-center items-center">
                    <Button 
                        onClick={handleAnalyzeClick} 
                        disabled={isLoading}
                        variant="primary"
                        className="text-lg px-8 py-4 w-full"
                    >
                        {isLoading ? 'Analyzing...' : 'Analyze Composition'}
                    </Button>
                </div>
                <div id="advice-panel" ref={advicePanelRef}>
                    <AdvicePanel advice={aiAdvice} isLoading={isLoading} error={error} userRole={settings.primaryRole} navigateToAcademy={navigateToAcademy} analysisCompleted={analysisCompleted} onAnimationEnd={() => dispatch({ type: 'SET_ANALYSIS_COMPLETED', payload: false })} isStale={isAnalysisStale} />
                </div>
            </div>

            <TeamPanel side="red" state={draftState.red} onSlotClick={handleSlotClick} activeSlot={getActiveSlotForTeam('red')} onClearSlot={handleClearSlot} onDrop={handleDrop} onDragOver={handleDragOver} onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} draggedOverSlot={draggedOverSlot} />
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden flex flex-col gap-4 overflow-x-hidden">
            <div className="flex items-center gap-2 bg-surface-primary p-1 rounded-lg" role="tablist" aria-label="Draft sections">
                <MobileTabButton target="blue">Blue Team</MobileTabButton>
                <MobileTabButton target="red">Red Team</MobileTabButton>
                <MobileTabButton target="ai">AI Advice</MobileTabButton>
            </div>
            
            <AnimatePresence mode="wait">
                <motion.div
                    key={mobileTab}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.1}
                    onDragEnd={(e, { offset, velocity }) => handleSwipe(offset, velocity)}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                >
                    {mobileTab === 'blue' && (
                        <div role="tabpanel" id="mobile-tab-panel-blue" aria-labelledby="mobile-tab-btn-blue">
                             <TeamPanel side="blue" state={draftState.blue} onSlotClick={handleSlotClick} activeSlot={getActiveSlotForTeam('blue')} onClearSlot={handleClearSlot} onDrop={handleDrop} onDragOver={handleDragOver} onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} draggedOverSlot={draggedOverSlot} />
                        </div>
                    )}
                     {mobileTab === 'red' && (
                        <div role="tabpanel" id="mobile-tab-panel-red" aria-labelledby="mobile-tab-btn-red">
                            <TeamPanel side="red" state={draftState.red} onSlotClick={handleSlotClick} activeSlot={getActiveSlotForTeam('red')} onClearSlot={handleClearSlot} onDrop={handleDrop} onDragOver={handleDragOver} onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} draggedOverSlot={draggedOverSlot} />
                        </div>
                    )}
                     {mobileTab === 'ai' && (
                        <div role="tabpanel" id="mobile-tab-panel-ai" aria-labelledby="mobile-tab-btn-ai">
                             <div ref={advicePanelRef}>
                                <AdvicePanel advice={aiAdvice} isLoading={isLoading} error={error} userRole={settings.primaryRole} navigateToAcademy={navigateToAcademy} analysisCompleted={analysisCompleted} onAnimationEnd={() => dispatch({ type: 'SET_ANALYSIS_COMPLETED', payload: false })} isStale={isAnalysisStale} />
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>


      <div id="blueprint-panel">
         <BlueprintPanel onLoad={handleBlueprintLoad} />
      </div>

      <div id="champion-grid-container" className="bg-bg-secondary border border-border-primary shadow-sm">
          <div className="p-4 border-b border-border-primary">
            <h2 className="text-2xl font-semibold font-display text-text-primary">
                {selectionContext 
                    ? <span className="text-accent">Select a Champion for {selectionContext.team.charAt(0).toUpperCase() + selectionContext.team.slice(1)} Team's {selectionContext.type}</span> 
                    : 'Champion Pool'
                }
            </h2>
          </div>
          <div className="h-[600px] overflow-hidden">
            <ChampionGrid 
                onSelect={handleChampionSelect} 
                onQuickLook={setQuickLookChampion}
                draftState={draftState} 
                recommendations={recommendations}
                isRecsLoading={isRecsLoading}
                activeRole={activeRole}
                intelData={intelData}
                onDragStart={handleDragStart}
            />
          </div>
      </div>
      
       <Modal 
            isOpen={isSaveModalOpen} 
            onClose={() => {
                if(isSaving) return;
                setIsSaveModalOpen(false);
                setDraftName('');
                setDraftNotes('');
            }} 
            title="Archive Strategy"
        >
            <div className="p-6 space-y-4">
                <div>
                    <label htmlFor="draftName" className="block text-sm font-medium text-text-secondary">Draft Name</label>
                    <input
                        id="draftName"
                        type="text"
                        value={draftName}
                        onChange={(e) => setDraftName(e.target.value)}
                        placeholder="e.g., Jinx Hyper-carry Comp"
                        className="w-full mt-1 px-3 py-2 bg-surface-secondary border border-border-primary focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                </div>
                 <div>
                    <label htmlFor="draftNotes" className="block text-sm font-medium text-text-secondary">Notes</label>
                     <textarea
                        id="draftNotes"
                        rows={4}
                        value={draftNotes}
                        onChange={(e) => setDraftNotes(e.target.value)}
                        placeholder="Add your personal notes about this strategy..."
                        className="w-full mt-1 px-3 py-2 bg-surface-secondary border border-border-primary focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                </div>
                <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={() => setIsSaveModalOpen(false)} disabled={isSaving}>Cancel</Button>
                    <Button variant="primary" onClick={confirmSaveToPlaybook} disabled={!draftName.trim() || isSaving}>
                        {isSaving ? 'Saving...' : 'Save to The Archives'}
                    </Button>
                </div>
            </div>
      </Modal>

      {/* Mobile Floating Action Button for Analyze */}
       <div className="lg:hidden fixed bottom-20 right-4 z-30">
            <Button
                onClick={handleAnalyzeClick}
                disabled={isLoading}
                variant="primary"
                className="rounded-full shadow-lg shadow-black/30 w-16 h-16 flex items-center justify-center disabled:bg-surface-tertiary disabled:shadow-none disabled:saturate-50"
                aria-label="Analyze Composition"
            >
                {isLoading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-on-accent"></div>
                ) : (
                    <FlaskConical size={24} />
                )}
            </Button>
        </div>

    </div>
  );
};