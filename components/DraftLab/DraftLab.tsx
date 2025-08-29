import React, { useState, useCallback, useMemo, useEffect, useRef, useReducer } from 'react';
import type { DraftState, Champion, AIAdvice, TeamSide, ChampionLite, ChampionSuggestion, UserProfile, Settings } from '../../types';
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
import { updateSlotInDraft, toSavedDraft } from '../../lib/draftUtils';

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

// --- Custom Hooks for Logic Abstraction ---

const useDraftAI = ({
    draftState,
    settings,
    profile,
    dispatch,
    addSP,
    completeMission,
    addChampionMastery,
    addRecentFeedback,
    advicePanelRef
}: {
    draftState: DraftState,
    settings: Settings,
    profile: UserProfile,
    dispatch: React.Dispatch<DraftLabAction>,
    addSP: (amount: number, reason?: string) => void,
    completeMission: (missionId: string) => boolean,
    addChampionMastery: (champions: Champion[], grade: string) => void,
    addRecentFeedback: (feedback: any) => void,
    advicePanelRef: React.RefObject<HTMLDivElement>
}) => {
    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        return () => abortControllerRef.current?.abort();
    }, []);

    const handleAnalyze = useCallback(async (signal: AbortSignal) => {
        dispatch({ type: 'START_ANALYSIS' });
        try {
            const advice = await getDraftAdvice(draftState, settings.primaryRole, profile.skillLevel, signal);
            if (signal.aborted) return;
            
            const adviceWithId = {
                ...advice,
                draftId: JSON.stringify(toSavedDraft(draftState))
            };
            dispatch({ type: 'ANALYSIS_SUCCESS', payload: adviceWithId });
            setTimeout(() => advicePanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);

            const { draftScore: score, weaknesses } = advice.teamAnalysis.blue;
            if (weaknesses?.length) {
                addRecentFeedback({ type: 'lesson', message: `The AI identified a weakness in your last draft: "${weaknesses[0].description}". Consider reviewing relevant lessons.` });
            }
            if (score && ['C', 'D', 'F'].some(g => score.startsWith(g)) && weaknesses.some(w => w.keyword && KEYWORDS.some(k => k.term.toLowerCase() === w.keyword!.toLowerCase()))) {
                addRecentFeedback({ type: 'lesson', message: `Your last draft was challenging (${score}). We've added a Pro Tip to your profile to help with that.` });
            }
            
            completeMission(MISSION_IDS.GETTING_STARTED.FIRST_ANALYSIS);
            if (profile.lastLabAnalysisDate !== new Date().toISOString().split('T')[0]) {
                completeMission(MISSION_IDS.DAILY.FIRST_DRAFT_OF_DAY);
            }
            const spFromScore = getScoreValue(score);
            if (spFromScore > 0) addSP(spFromScore, "Draft Analysis");
            if (score?.startsWith('S')) completeMission(MISSION_IDS.WEEKLY.PERFECT_COMP);
            if (score?.startsWith('A') || score?.startsWith('S')) {
                const bluePicks = draftState.blue.picks.map(p => p.champion).filter((c): c is Champion => !!c);
                addChampionMastery(bluePicks, score);
            }
        } catch (err) {
            if (err instanceof DOMException && err.name === 'AbortError') return;
            if (!signal.aborted) dispatch({ type: 'ANALYSIS_ERROR', payload: err instanceof Error ? err.message : 'An unknown error occurred.' });
        }
    }, [draftState, settings.primaryRole, profile.skillLevel, dispatch, advicePanelRef, addRecentFeedback, completeMission, profile.lastLabAnalysisDate, addSP, addChampionMastery]);

    return { handleAnalyze, abortControllerRef };
};

const GRADE_SCORES: Record<string, number> = { S: 150, A: 100, B: 50, C: 25, D: 10, F: 0 };
const getScoreValue = (score: string | undefined): number => {
    if (!score) return 0;
    const grade = score.charAt(0).toUpperCase();
    return GRADE_SCORES[grade] || 0;
}

const tourSteps: TourStep[] = [
    { selector: '#draftlab-welcome', title: 'Welcome to the Strategy Forge!', content: 'This is your sandbox for theory-crafting. You can build team compositions for both sides and get instant AI-powered analysis.' },
    { selector: '#blueprint-panel', title: 'Composition Blueprints', content: "To get started quickly, you can load a pre-made composition. Let's try one! Click any 'Load Blueprint' button." },
    { selector: '#analyze-button-container', title: 'Get AI Analysis', content: "Now that you have a team, click 'Analyze Composition' to get feedback. For a full analysis, both teams need 5 champions." },
    { selector: '#advice-panel', title: 'Review Your Insights', content: "The AI provides a draft score, strengths, weaknesses, and suggestions here. This is the core of DraftWise AI!" },
    { selector: '#champion-grid-container', title: 'The Champion Pool', content: "You can click any empty slot above and then select a champion from this grid to build your own drafts from scratch." },
];

const validateDraft = (draftState: DraftState): string[] => {
    const warnings: string[] = [];
    const allPicks = [...draftState.blue.picks, ...draftState.red.picks];
    const pickedChampions = allPicks.map(p => p.champion).filter((c): c is Champion => !!c);

    if (new Set(pickedChampions.map(c => c.id)).size !== pickedChampions.length) {
        warnings.push("Duplicate champions have been picked. A valid draft cannot have the same champion selected more than once.");
    }

    (['blue', 'red'] as const).forEach(teamSide => {
        const teamPicks = draftState[teamSide].picks.map(p => p.champion).filter((c): c is Champion => !!c);
        if (teamPicks.length < 5) return;

        const damageProfile = teamPicks.reduce((acc, champ) => ({ ...acc, [champ.damageType === 'AD' ? 'ad' : 'ap']: acc[champ.damageType === 'AD' ? 'ad' : 'ap'] + 1 }), { ad: 0, ap: 0 });
        if (damageProfile.ad >= 4 && damageProfile.ap <= 1) warnings.push(`The ${teamSide} team has a heavily AD-focused damage profile, which can be easily countered with armor.`);
        if (damageProfile.ap >= 4 && damageProfile.ad <= 1) warnings.push(`The ${teamSide} team has a heavily AP-focused damage profile, which can be easily countered with magic resist.`);

        const ccScore = teamPicks.reduce((sum, champ) => sum + ({ Low: 1, Medium: 2, High: 3 }[champ.cc] || 0), 0);
        if (ccScore <= 6) warnings.push(`The ${teamSide} team appears to have very low crowd control, which may make it difficult to lock down targets or start fights.`);
    });
    return warnings;
};


export const DraftLab = ({ startTour, onTourComplete, navigateToAcademy }: DraftLabProps) => {
  const { draftState, setDraftState, resetDraft: onReset } = useDraft();
  const { champions, championsLite, latestVersion } = useChampions();
  
  const [state, dispatch] = useReducer(draftLabReducer, initialState);
  const { selectionContext, aiAdvice, isLoading, error, recommendations, isRecsLoading, mobileTab, analysisCompleted, confirmationWarnings } = state;

  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [draftNotes, setDraftNotes] = useState('');
  const [activeRole, setActiveRole] = useState<string | null>(null);
  const [counterMetaMode, setCounterMetaMode] = useState(false);
  const [quickLookChampion, setQuickLookChampion] = useState<ChampionLite | null>(null);
  const [draggedOverSlot, setDraggedOverSlot] = useState<DraggedOverSlot | null>(null);
  
  const { profile, addSP, completeMission, addChampionMastery, addRecentFeedback } = useUserProfile();
  const { settings } = useSettings();
  const { addEntry: addPlaybookEntry } = usePlaybook();
  
  const advicePanelRef = useRef<HTMLDivElement>(null);
  const [intelData, setIntelData] = useState<IntelData | null>(null);
  const draftStateString = useMemo(() => JSON.stringify(draftState), [draftState]);

  const { handleAnalyze, abortControllerRef } = useDraftAI({ draftState, settings, profile, dispatch, addSP, completeMission, addChampionMastery, addRecentFeedback, advicePanelRef });

  const isAnalysisStale = useMemo(() => {
    if (!aiAdvice) return false;
    const currentDraftId = JSON.stringify(toSavedDraft(draftState));
    return aiAdvice.draftId !== currentDraftId;
  }, [aiAdvice, draftState]);

  useEffect(() => {
    const controller = new AbortController();
    const fetchIntel = async () => {
        try {
            const [tierList, patchNotes] = await Promise.all([getTierList(controller.signal), getPatchNotesSummary(controller.signal)]);
            if (controller.signal.aborted) return;
            setIntelData({ sTier: tierList.tierList.flatMap(r => r.champions.map(c => c.championName)), buffs: patchNotes.buffs.map(b => b.name), nerfs: patchNotes.nerfs.map(n => n.name) });
        } catch (err) {
            if (!(err instanceof DOMException && err.name === 'AbortError')) console.error("Failed to fetch intel data:", err);
        }
    };
    fetchIntel();
    return () => controller.abort();
  }, []);

  const isDraftEmpty = useMemo(() => [...draftState.blue.picks, ...draftState.blue.bans, ...draftState.red.picks, ...draftState.red.bans].every(s => !s.champion), [draftState]);

  useEffect(() => {
    if (!selectionContext) {
        dispatch({ type: 'RECS_FETCH_SUCCESS', payload: [] });
        setActiveRole(null);
        return;
    }
    setActiveRole(selectionContext.type === 'pick' ? ROLES[selectionContext.index] : null);
    
    const controller = new AbortController();
    const fetchRecs = async () => {
        dispatch({ type: 'START_RECS_FETCH' });
        try {
            const topMastery = profile.championMastery.sort((a, b) => b.points - a.points).slice(0, 3).map(m => championsLite.find(c => c.id === m.championId)?.name).filter((n): n is string => !!n);
            const suggestions = await getChampionSuggestions(draftState, selectionContext, settings.primaryRole, profile.skillLevel, topMastery, counterMetaMode ? 'counter-meta' : 'standard', controller.signal);
            if (controller.signal.aborted) return;
            const enriched = suggestions.map(r => ({ ...r, champion: championsLite.find(c => c.name.toLowerCase() === r.championName.toLowerCase())! })).filter(r => r.champion);
            dispatch({ type: 'RECS_FETCH_SUCCESS', payload: enriched });
        } catch (err) {
            if (!(err instanceof DOMException && err.name === 'AbortError')) {
                toast.error("Could not fetch champion suggestions.");
                dispatch({ type: 'RECS_FETCH_ERROR' });
            }
        }
    };
    fetchRecs();
    return () => controller.abort();
  }, [selectionContext, draftStateString, settings.primaryRole, profile.skillLevel, profile.championMastery, counterMetaMode, championsLite]);

  const isDraftComplete = useMemo(() => draftState.blue.picks.filter(p => p.champion).length === 5 && draftState.red.picks.filter(p => p.champion).length === 5, [draftState]);

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
        dispatch({ type: 'SET_CONFIRMATION', payload: { title: "Draft Composition Warnings", message: <div className="space-y-2 text-left"><p>The AI has identified potential issues with your draft. You can still proceed with the analysis, but consider these points:</p><ul className="list-disc list-inside text-sm text-text-secondary space-y-1">{warnings.map((w, i) => <li key={i}>{w}</li>)}</ul></div>, onConfirm: performAnalysis, confirmVariant: 'primary', confirmText: 'Analyze Anyway' } });
    } else {
        performAnalysis();
    }
  };

  const updateDraftSlot = useCallback((champion: Champion | null, team: TeamSide, type: 'pick' | 'ban', index: number) => {
    setDraftState(prev => updateSlotInDraft(prev, team, type, index, champion));
  }, [setDraftState]);

  const handleChampionSelect = useCallback((championLite: ChampionLite) => {
    if (!selectionContext) return;
    const allSlots = [...draftState.blue.picks, ...draftState.red.picks, ...draftState.blue.bans, ...draftState.red.bans];
    if (allSlots.some(s => s.champion?.id === championLite.id)) {
        toast.error(`${championLite.name} is already picked or banned.`);
        return;
    }
    const champion = champions.find(c => c.id === championLite.id);
    if (!champion) return;
    updateDraftSlot(champion, selectionContext.team, selectionContext.type, selectionContext.index);
    dispatch({ type: 'SET_SELECTION_CONTEXT', payload: null });
  }, [selectionContext, updateDraftSlot, champions, draftState]);

  const handleSlotClick = useCallback((team: TeamSide, type: 'pick' | 'ban', index: number) => {
    dispatch({ type: 'SET_SELECTION_CONTEXT', payload: selectionContext?.team === team && selectionContext.type === type && selectionContext.index === index ? null : { team, type, index } });
  }, [selectionContext]);
  
  const handleDrop = useCallback((event: React.DragEvent, team: TeamSide, type: 'pick' | 'ban', index: number) => {
      event.preventDefault();
      const championId = event.dataTransfer.getData('championId');
      const allSlots = [...draftState.blue.picks, ...draftState.red.picks, ...draftState.blue.bans, ...draftState.red.bans];
      if (allSlots.some(s => s.champion?.id === championId)) {
          toast.error(`${champions.find(c => c.id === championId)?.name || 'Champion'} is already picked or banned.`);
      } else {
          const champion = champions.find(c => c.id === championId);
          if (champion) updateDraftSlot(champion, team, type, index);
      }
      setDraggedOverSlot(null);
      dispatch({ type: 'SET_SELECTION_CONTEXT', payload: null });
  }, [draftState, champions, updateDraftSlot]);

  const handleReset = useCallback(() => {
    onReset();
    dispatch({ type: 'SET_SELECTION_CONTEXT', payload: null });
    dispatch({ type: 'CLEAR_ANALYSIS' });
    dispatch({ type: 'SET_MOBILE_TAB', payload: 'blue' });
  }, [onReset]);

  const handleSaveToPlaybook = async () => {
    setIsSaveModalOpen(true);
    let initialNotes = aiAdvice ? `AI Analysis Summary:\n- Blue Score: ${aiAdvice.teamAnalysis.blue.draftScore} (${aiAdvice.teamAnalysis.blue.draftScoreReasoning})\n- Blue Strengths: ${aiAdvice.teamAnalysis.blue.strengths.join(', ')}\n- Red Score: ${aiAdvice.teamAnalysis.red.draftScore}\n- Red Strengths: ${aiAdvice.teamAnalysis.red.strengths.join(', ')}` : '';
    setDraftNotes(initialNotes);
    setDraftName('Generating name...');
    try {
        setDraftName(await generateDraftName(draftState) || '');
    } catch (e) {
        setDraftName('');
        toast.error("Could not suggest a name for the draft.");
    }
  };

  const confirmSaveToPlaybook = async () => {
    if (draftName.trim() && !isSaving) {
        setIsSaving(true);
        if (await addPlaybookEntry(draftName.trim(), draftState, aiAdvice, draftNotes)) {
            setIsSaveModalOpen(false);
        }
        setIsSaving(false);
    }
  };

  const handleBlueprintLoad = (championIds: string[]) => {
    setDraftState(prev => {
        const blueprintChamps = championIds.map(id => champions.find(c => c.id === id) || null);
        const newBluePicks = prev.blue.picks.map((slot, i) => i < blueprintChamps.length ? { ...slot, champion: blueprintChamps[i] } : slot);
        return { ...prev, blue: { ...prev.blue, picks: newBluePicks }, red: { ...prev.red, picks: prev.red.picks.map(s => ({ ...s, champion: null })) } };
    });
    dispatch({ type: 'SET_SELECTION_CONTEXT', payload: null });
  };
  
  const TABS: MobileTab[] = ['blue', 'red', 'ai'];
  const SWIPE_CONFIDENCE_THRESHOLD = 10000;
  const handleSwipe = (offset: { x: number; y: number }, velocity: { x: number; y: number }) => {
    const swipePower = Math.abs(offset.x) * velocity.x;
    const currentIndex = TABS.indexOf(mobileTab);
    if (swipePower < -SWIPE_CONFIDENCE_THRESHOLD && currentIndex < TABS.length - 1) {
        dispatch({ type: 'SET_MOBILE_TAB', payload: TABS[currentIndex + 1] });
    } else if (swipePower > SWIPE_CONFIDENCE_THRESHOLD && currentIndex > 0) {
        dispatch({ type: 'SET_MOBILE_TAB', payload: TABS[currentIndex - 1] });
    }
  };


  return (
    <div className="space-y-6">
       <GuidedTour isOpen={!!startTour} onClose={onTourComplete!} steps={tourSteps} />
       <QuickLookPanel champion={quickLookChampion} onClose={() => setQuickLookChampion(null)} />
       <ConfirmationModal isOpen={!!confirmationWarnings} onClose={() => dispatch({ type: 'SET_CONFIRMATION', payload: null })} state={confirmationWarnings} />
      <div id="draftlab-welcome" className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-bg-secondary border border-border-primary p-4 shadow-sm">
        <div className="flex items-center gap-4">
            <div className="bg-accent/10 text-accent w-12 h-12 flex items-center justify-center"><FlaskConical size={32} /></div>
            <div>
                <h1 className="font-display text-3xl font-bold text-text-primary tracking-wide">Strategy Forge</h1>
                <p className="text-sm text-text-secondary">Forge and test team compositions with instant, AI-powered strategic feedback.</p>
                <p className="text-xs text-text-muted mt-1">AI analysis based on patch {latestVersion}</p>
            </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 bg-surface-tertiary p-1">
                <label htmlFor="counter-meta-toggle" className="text-xs font-semibold text-text-secondary pl-2">Counter-Meta</label>
                <button onClick={() => setCounterMetaMode(!counterMetaMode)} id="counter-meta-toggle" role="switch" aria-checked={counterMetaMode} className={`relative inline-flex items-center h-6 w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface-tertiary focus:ring-gold ${counterMetaMode ? 'bg-gold' : 'bg-surface-inset'}`}><span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${counterMetaMode ? 'translate-x-6' : 'translate-x-1'}`} /></button>
            </div>
            <Button onClick={() => navigator.clipboard.writeText(`Blue: ${draftState.blue.picks.map(p=>p.champion?.name||'').join(', ')}\nRed: ${draftState.red.picks.map(p=>p.champion?.name||'').join(', ')}`).then(()=>toast.success('Copied!'))} variant="secondary" disabled={isDraftEmpty}>Share Draft</Button>
            <Button onClick={handleSaveToPlaybook} variant="secondary" disabled={isDraftEmpty}>Save to The Archives</Button>
            <Button onClick={handleReset} variant="danger">Reset</Button>
        </div>
      </div>
      
      {/* New Desktop Layout */}
      <div className="hidden lg:grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Draft Panels */}
          <div className="lg:col-span-1 space-y-6">
            <TeamPanel side="blue" state={draftState.blue} onSlotClick={handleSlotClick} activeSlot={selectionContext?.team === 'blue' ? selectionContext : null} onClearSlot={(...args) => updateDraftSlot(null, ...args)} onDrop={handleDrop} onDragOver={e => e.preventDefault()} onDragEnter={(e, ...args) => { e.preventDefault(); setDraggedOverSlot({ team: args[0], type: args[1], index: args[2] }); }} onDragLeave={() => setDraggedOverSlot(null)} draggedOverSlot={draggedOverSlot} isAnalyzing={isLoading} />
            <TeamPanel side="red" state={draftState.red} onSlotClick={handleSlotClick} activeSlot={selectionContext?.team === 'red' ? selectionContext : null} onClearSlot={(...args) => updateDraftSlot(null, ...args)} onDrop={handleDrop} onDragOver={e => e.preventDefault()} onDragEnter={(e, ...args) => { e.preventDefault(); setDraggedOverSlot({ team: args[0], type: args[1], index: args[2] }); }} onDragLeave={() => setDraggedOverSlot(null)} draggedOverSlot={draggedOverSlot} isAnalyzing={isLoading} />
          </div>

          {/* Right Column: Controls, Advice, and Champion Grid */}
          <div className="lg:col-span-2 space-y-6">
              <div id="analyze-button-container" className="bg-bg-secondary border border-border-primary p-4"><Button onClick={handleAnalyzeClick} disabled={isLoading} variant="primary" className="text-lg px-8 py-4 w-full">{isLoading ? 'Analyzing...' : 'Analyze Composition'}</Button></div>
              <div id="advice-panel" ref={advicePanelRef}><AdvicePanel advice={aiAdvice} isLoading={isLoading} error={error} userRole={settings.primaryRole} navigateToAcademy={navigateToAcademy} analysisCompleted={analysisCompleted} onAnimationEnd={() => dispatch({ type: 'SET_ANALYSIS_COMPLETED', payload: false })} isStale={isAnalysisStale} /></div>
              <div id="blueprint-panel"><BlueprintPanel onLoad={handleBlueprintLoad} /></div>
              <div id="champion-grid-container" className="bg-bg-secondary border border-border-primary shadow-sm">
                  <div className="p-4 border-b border-border-primary"><h2 className="text-2xl font-semibold font-display text-text-primary">{selectionContext ? <span className="text-accent">Select for {selectionContext.team} {selectionContext.type}</span> : 'Champion Pool'}</h2></div>
                  <div className="h-[600px] overflow-hidden">
                      <ChampionGrid onSelect={handleChampionSelect} onQuickLook={setQuickLookChampion} draftState={draftState} recommendations={recommendations} isRecsLoading={isRecsLoading} activeRole={activeRole} intelData={intelData} onDragStart={(e, id) => e.dataTransfer.setData('championId', id)} />
                  </div>
              </div>
          </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden flex flex-col gap-4 overflow-x-hidden">
          <div className="flex items-center gap-2 bg-surface-primary p-1 rounded-lg" role="tablist">
              {TABS.map(tab => <button key={tab} id={`mobile-tab-btn-${tab}`} role="tab" aria-selected={mobileTab === tab} onClick={() => dispatch({ type: 'SET_MOBILE_TAB', payload: tab })} className={`px-4 py-3 w-full font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${mobileTab === tab ? 'bg-accent text-on-accent' : 'text-text-secondary hover:bg-surface-secondary'}`}>{tab.charAt(0).toUpperCase() + tab.slice(1)} Team</button>)}
          </div>
          <AnimatePresence mode="wait">
              <motion.div key={mobileTab} drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.1} onDragEnd={(e, { offset, velocity }) => handleSwipe(offset, velocity)} initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} transition={{ duration: 0.2 }}>
                  {mobileTab === 'blue' && <div role="tabpanel"><TeamPanel side="blue" state={draftState.blue} onSlotClick={handleSlotClick} activeSlot={selectionContext?.team === 'blue' ? selectionContext : null} onClearSlot={(...args) => updateDraftSlot(null, ...args)} onDrop={handleDrop} onDragOver={e => e.preventDefault()} onDragEnter={(e, ...args) => { e.preventDefault(); setDraggedOverSlot({ team: args[0], type: args[1], index: args[2] }); }} onDragLeave={() => setDraggedOverSlot(null)} draggedOverSlot={draggedOverSlot} /></div>}
                  {mobileTab === 'red' && <div role="tabpanel"><TeamPanel side="red" state={draftState.red} onSlotClick={handleSlotClick} activeSlot={selectionContext?.team === 'red' ? selectionContext : null} onClearSlot={(...args) => updateDraftSlot(null, ...args)} onDrop={handleDrop} onDragOver={e => e.preventDefault()} onDragEnter={(e, ...args) => { e.preventDefault(); setDraggedOverSlot({ team: args[0], type: args[1], index: args[2] }); }} onDragLeave={() => setDraggedOverSlot(null)} draggedOverSlot={draggedOverSlot} /></div>}
                  {mobileTab === 'ai' && <div role="tabpanel" ref={advicePanelRef}><AdvicePanel advice={aiAdvice} isLoading={isLoading} error={error} userRole={settings.primaryRole} navigateToAcademy={navigateToAcademy} analysisCompleted={analysisCompleted} onAnimationEnd={() => dispatch({ type: 'SET_ANALYSIS_COMPLETED', payload: false })} isStale={isAnalysisStale} /></div>}
              </motion.div>
          </AnimatePresence>
          <div id="blueprint-panel" className="lg:hidden"><BlueprintPanel onLoad={handleBlueprintLoad} /></div>
          <div id="champion-grid-container" className="lg:hidden bg-bg-secondary border border-border-primary shadow-sm">
              <div className="p-4 border-b border-border-primary"><h2 className="text-2xl font-semibold font-display text-text-primary">{selectionContext ? <span className="text-accent">Select for {selectionContext.team} {selectionContext.type}</span> : 'Champion Pool'}</h2></div>
              <div className="h-[600px] overflow-hidden">
                  <ChampionGrid onSelect={handleChampionSelect} onQuickLook={setQuickLookChampion} draftState={draftState} recommendations={recommendations} isRecsLoading={isRecsLoading} activeRole={activeRole} intelData={intelData} onDragStart={(e, id) => e.dataTransfer.setData('championId', id)} />
              </div>
          </div>
      </div>
      
       <Modal isOpen={isSaveModalOpen} onClose={() => {if(!isSaving) setIsSaveModalOpen(false);}} title="Archive Strategy">
            <div className="p-6 space-y-4">
                <div>
                    <label htmlFor="draftName" className="block text-sm font-medium text-text-secondary">Draft Name</label>
                    <input id="draftName" type="text" value={draftName} onChange={e => setDraftName(e.target.value)} placeholder="e.g., Jinx Hyper-carry Comp" className="w-full mt-1 px-3 py-2 bg-surface-secondary border border-border-primary focus:outline-none focus:ring-2 focus:ring-accent" />
                </div>
                <div>
                    <label htmlFor="draftNotes" className="block text-sm font-medium text-text-secondary">Notes</label>
                    <textarea id="draftNotes" rows={4} value={draftNotes} onChange={e => setDraftNotes(e.target.value)} placeholder="Add your personal notes..." className="w-full mt-1 px-3 py-2 bg-surface-secondary border border-border-primary focus:outline-none focus:ring-2 focus:ring-accent" />
                </div>
                <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={() => setIsSaveModalOpen(false)} disabled={isSaving}>Cancel</Button>
                    <Button variant="primary" onClick={confirmSaveToPlaybook} disabled={!draftName.trim() || isSaving}>{isSaving ? 'Saving...' : 'Save to The Archives'}</Button>
                </div>
            </div>
      </Modal>

      <div className="lg:hidden fixed bottom-20 right-4 z-30">
          <Button onClick={handleAnalyzeClick} disabled={isLoading} variant="primary" className="rounded-full shadow-lg shadow-black/30 w-16 h-16 flex items-center justify-center" aria-label="Analyze Composition">
              {isLoading ? <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-on-accent"></div> : <FlaskConical size={24} />}
          </Button>
      </div>
    </div>
  );
};