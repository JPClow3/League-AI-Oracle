import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { DraftState, Champion, TeamSide, ChampionLite, AIAdvice, ChampionSuggestion } from '../../types';
import { getDraftAdvice, getBotDraftAction, getTeambuilderSuggestion } from '../../services/geminiService';
import { TeamPanel } from './TeamPanel';
import { ChampionGrid } from './ChampionGrid';
import { AdvicePanel } from './AdvicePanel';
import { Button } from '../common/Button';
import { useDraft } from '../../contexts/DraftContext';
import { useChampions } from '../../contexts/ChampionContext';
import { getAvailableChampions, swapChampionsInDraft, updateSlotInDraft } from '../../lib/draftUtils';
import { useSettings } from '../../hooks/useSettings';
import { useUserProfile } from '../../hooks/useUserProfile';
import { MISSION_IDS, ROLES } from '../../constants';
import toast from 'react-hot-toast';
import { BlueprintPanel } from './BlueprintPanel';
import { GuidedTour } from '../Onboarding/GuidedTour';
import type { TourStep } from '../Onboarding/GuidedTour';
import { TeamBuilderModal } from './TeamBuilderModal';
import { TeamBuilderAssistant } from './TeamBuilderAssistant';

const DRAFT_LAB_TOUR_STEPS: TourStep[] = [
    { selector: '#draftlab-blue-team', title: 'Your Team Panel', content: 'This is where you build your team. Click on an empty slot to select a champion.' },
    { selector: '#draftlab-champion-grid', title: 'The Champion Grid', content: 'Search, filter, and select champions here. You can also drag-and-drop champions into the slots.' },
    { selector: '#draftlab-red-team', title: 'The Opponent Panel', content: 'This is the enemy team. Fill this out to simulate a real draft scenario.' },
    { selector: '#draftlab-analyze-button', title: 'Get AI Analysis', content: 'Once both teams have 5 champions, click here to get instant, in-depth feedback on the matchup from the AI.' },
    { selector: '#draftlab-advice-panel', title: 'The Advice Panel', content: 'Your AI-powered analysis will appear here, packed with insights on strengths, weaknesses, and win conditions.' },
];

export const DraftLab = ({ startTour, onTourComplete, navigateToAcademy }: { startTour: boolean, onTourComplete: () => void, navigateToAcademy: (lessonId: string) => void }) => {
    const { draftState, setDraftState, resetDraft } = useDraft();
    const { champions, championsLite } = useChampions();
    const { settings } = useSettings();
    const { profile, addSP, completeMission, addChampionMastery } = useUserProfile();

    const [activeSlot, setActiveSlot] = useState<{ team: TeamSide; type: 'pick' | 'ban'; index: number } | null>(null);
    const [draggedOverSlot, setDraggedOverSlot] = useState<{ team: TeamSide; type: 'pick' | 'ban'; index: number } | null>(null);

    const [advice, setAdvice] = useState<AIAdvice | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [analysisCompleted, setAnalysisCompleted] = useState(false);
    
    const [isTourOpen, setIsTourOpen] = useState(startTour);
    const [isBuilderModalOpen, setIsBuilderModalOpen] = useState(false);
    
    // Team Builder State
    const [isBuilding, setIsBuilding] = useState(false);
    const [builderStep, setBuilderStep] = useState(0);
    const [builderSuggestions, setBuilderSuggestions] = useState<(ChampionSuggestion & {champion: ChampionLite})[]>([]);
    const [isBuilderLoading, setIsBuilderLoading] = useState(false);
    const [builderCore, setBuilderCore] = useState('');
    const [isOpponentLoading, setIsOpponentLoading] = useState(false);

    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        setIsTourOpen(startTour);
    }, [startTour]);
    
    // Cleanup abort controller on unmount
    useEffect(() => {
        return () => {
            abortControllerRef.current?.abort();
        };
    }, []);

    const isDraftComplete = draftState.blue.picks.every(p => p.champion) && draftState.red.picks.every(p => p.champion);
    const isStale = advice && JSON.stringify(draftState) !== advice.draftId;

    const handleSlotClick = (team: TeamSide, type: 'pick' | 'ban', index: number) => {
        setActiveSlot({ team, type, index });
    };

    const handleChampionSelect = (champion: Champion) => {
        if (!activeSlot) {return;}
        setDraftState(prev => updateSlotInDraft(prev, activeSlot.team, activeSlot.type, activeSlot.index, champion));
        setActiveSlot(null);
    };

    const handleClearSlot = (team: TeamSide, type: 'pick' | 'ban', index: number) => {
        setDraftState(prev => updateSlotInDraft(prev, team, type, index, null));
    };

    const handleAnalyze = async () => {
        if (!isDraftComplete || isLoading) {return;}
        setIsLoading(true);
        setError(null);
        setAnalysisCompleted(false);

        abortControllerRef.current?.abort();
        const controller = new AbortController();
        abortControllerRef.current = controller;

        try {
            const result = await getDraftAdvice(draftState, 'blue', settings.primaryRole, profile.skillLevel, 'gemini-2.5-pro', controller.signal);
            if(controller.signal.aborted) {return;}
            
            setAdvice({ ...result, draftId: JSON.stringify(draftState) });
            setAnalysisCompleted(true);
            
            const userScore = result.teamAnalysis.blue.draftScore;
            if (userScore) {
                if (userScore.startsWith('S')) {
                    addSP(150, "S-Grade Draft Analysis");
                    completeMission(MISSION_IDS.WEEKLY.PERFECT_COMP);
                    addChampionMastery(draftState.blue.picks.map(p => p.champion!), userScore);
                } else if (userScore.startsWith('A')) {
                    addChampionMastery(draftState.blue.picks.map(p => p.champion!), userScore);
                }
            }
            addSP(25, "Draft Analysis");
            completeMission(MISSION_IDS.GETTING_STARTED.FIRST_ANALYSIS);
            completeMission(MISSION_IDS.DAILY.FIRST_DRAFT_OF_DAY);

        } catch (err) {
            if (err instanceof DOMException && err.name === 'AbortError') {return;}
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            if (!controller.signal.aborted) {
                setIsLoading(false);
            }
        }
    };

    // --- Drag and Drop Logic ---
    const handleDragStart = (e: React.DragEvent, team: TeamSide, type: 'pick' | 'ban', index: number, champion: Champion) => {
        e.dataTransfer.setData('application/json', JSON.stringify({ champion, source: { team, type, index } }));
        e.dataTransfer.effectAllowed = 'copyMove';
    };

    const handleDrop = (e: React.DragEvent, team: TeamSide, type: 'pick' | 'ban', index: number) => {
        e.preventDefault();
        setDraggedOverSlot(null);
        try {
            const data = JSON.parse(e.dataTransfer.getData('application/json'));
            const champion = data.champion as Champion;

            if (data.source) { // It's a swap
                setDraftState(prev => swapChampionsInDraft(prev, team, data.source.index, index));
            } else { // It's a drag from the grid
                const available = getAvailableChampions(draftState, championsLite);
                if (available.some(c => c.id === champion.id)) {
                    setDraftState(prev => updateSlotInDraft(prev, team, type, index, champion));
                }
            }
        } catch (error) {
            console.error("Drag and drop failed:", error);
        }
    };
    const handleDragOver = (e: React.DragEvent) => e.preventDefault();
    const handleDragEnter = (e: React.DragEvent, team: TeamSide, type: 'pick' | 'ban', index: number) => { e.preventDefault(); setDraggedOverSlot({ team, type, index }); };
    const handleDragLeave = () => setDraggedOverSlot(null);

    // --- Blueprint Logic ---
    const handleLoadBlueprint = (championIds: string[]) => {
        const newPicks = Array(5).fill(null).map((_, i) => ({
            champion: championIds[i] ? champions.find(c => c.id === championIds[i]) || null : null,
            isActive: false
        }));
        setDraftState(prev => ({ ...prev, blue: { ...prev.blue, picks: newPicks } }));
        toast.success("Blueprint loaded!");
    };

    // --- Team Builder Assistant Logic ---
    const fetchBuilderSuggestions = useCallback(async (currentDraft: DraftState, step: number, core: string, signal: AbortSignal) => {
        setIsBuilderLoading(true);
        try {
            const currentPicks = currentDraft.blue.picks.map(p => p.champion?.name).filter(Boolean) as string[];
            const roleToPick = ROLES[step];
            const available = getAvailableChampions(currentDraft, championsLite);
            
            const suggestions = await getTeambuilderSuggestion({
                coreConcept: core,
                currentPicks,
                roleToPick,
                availableChampions: available,
                signal
            });
            if (signal.aborted) {return;}
            
            const suggestionsWithData = suggestions.map(s => ({
                ...s,
                champion: championsLite.find(c => c.name === s.championName)!
            })).filter(s => s.champion);

            setBuilderSuggestions(suggestionsWithData);

        } catch (err) {
            if (err instanceof DOMException && err.name === 'AbortError') {return;}
            toast.error(err instanceof Error ? err.message : "Failed to get suggestions.");
            setIsBuilding(false); // Abort builder on error
        } finally {
            if (!signal.aborted) {setIsBuilderLoading(false);}
        }
    }, [championsLite]);

    const handleStartBuilder = (core: { type: 'champion' | 'strategy'; value: string }) => {
        const newCoreConcept = core.type === 'champion' ? `Build around ${core.value}` : core.value;
        resetDraft();
        setIsBuilding(true);
        setBuilderStep(0);
        setBuilderCore(newCoreConcept);
        setIsBuilderModalOpen(false);
        
        abortControllerRef.current?.abort();
        const controller = new AbortController();
        abortControllerRef.current = controller;

        fetchBuilderSuggestions(draftState, 0, newCoreConcept, controller.signal);
    };

    const handleBuilderSelect = (champion: ChampionLite) => {
        const fullChampion = champions.find(c => c.id === champion.id);
        if (!fullChampion) {return;}

        const nextState = updateSlotInDraft(draftState, 'blue', 'pick', builderStep, fullChampion);
        setDraftState(nextState);
        
        const nextStep = builderStep + 1;
        setBuilderStep(nextStep);

        if (nextStep < 5) {
            abortControllerRef.current?.abort();
            const controller = new AbortController();
            abortControllerRef.current = controller;
            fetchBuilderSuggestions(nextState, nextStep, builderCore, controller.signal);
        }
    };
    
    const handleGenerateOpponent = async () => {
        setIsOpponentLoading(true);
        let currentRedDraft = draftState;
        
        for (let i = 0; i < 5; i++) {
            abortControllerRef.current?.abort();
            const controller = new AbortController();
            abortControllerRef.current = controller;
            try {
                const available = getAvailableChampions(currentRedDraft, championsLite);
                const suggestion = await getBotDraftAction({
                    draftState: currentRedDraft,
                    turn: { team: 'red', type: 'pick', index: i },
                    persona: 'The Strategist',
                    availableChampions: available,
                    signal: controller.signal
                });
                if (controller.signal.aborted) {break;}

                const champ = champions.find(c => c.name === suggestion.championName);
                if (champ) {
                    currentRedDraft = updateSlotInDraft(currentRedDraft, 'red', 'pick', i, champ);
                    setDraftState(currentRedDraft);
                }
            } catch (e) {
                if (e instanceof DOMException && e.name === 'AbortError') {break;}
                toast.error("Failed to generate part of the opponent team.");
                break;
            }
        }
        setIsOpponentLoading(false);
        setIsBuilding(false); // Exit builder mode
    };
    
    const handleReset = () => {
        resetDraft();
        setIsBuilding(false);
        setBuilderStep(0);
        setBuilderCore('');
        setBuilderSuggestions([]);
    }

    return (
        <div className="space-y-6">
            <GuidedTour isOpen={isTourOpen} onClose={() => { setIsTourOpen(false); onTourComplete(); }} steps={DRAFT_LAB_TOUR_STEPS} />
            <TeamBuilderModal isOpen={isBuilderModalOpen} onClose={() => setIsBuilderModalOpen(false)} onStart={handleStartBuilder}/>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="font-display text-3xl font-bold text-text-primary tracking-wide">Strategy Forge</h1>
                    <p className="text-sm text-text-secondary">Theory-craft team compositions and get instant AI-powered feedback.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button id="draftlab-teambuilder-button" variant="secondary" onClick={() => setIsBuilderModalOpen(true)}>Team Builder Assistant</Button>
                    <Button variant="secondary" onClick={handleReset}>Reset Draft</Button>
                    <Button id="draftlab-analyze-button" variant="primary" onClick={handleAnalyze} disabled={!isDraftComplete || isLoading}>
                        {isLoading ? 'Analyzing...' : 'Analyze'}
                    </Button>
                </div>
            </div>

            <BlueprintPanel onLoad={handleLoadBlueprint} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <TeamPanel id="draftlab-blue-team" side="blue" state={draftState.blue} onSlotClick={handleSlotClick} onClearSlot={handleClearSlot} activeSlot={activeSlot?.team === 'blue' ? activeSlot : null} onDrop={handleDrop} onDragStart={(e, t, y, i) => handleDragStart(e, t, y, i, draftState.blue.picks[i].champion!)} onDragOver={handleDragOver} onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} draggedOverSlot={draggedOverSlot} />
                        <TeamPanel id="draftlab-red-team" side="red" state={draftState.red} onSlotClick={handleSlotClick} onClearSlot={handleClearSlot} activeSlot={activeSlot?.team === 'red' ? activeSlot : null} onDrop={handleDrop} onDragStart={(e, t, y, i) => handleDragStart(e, t, y, i, draftState.red.picks[i].champion!)} onDragOver={handleDragOver} onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} draggedOverSlot={draggedOverSlot} />
                    </div>
                    <div id="draftlab-advice-panel">
                        <AdvicePanel advice={advice} isLoading={isLoading} error={error} navigateToAcademy={navigateToAcademy} analysisCompleted={analysisCompleted} onAnimationEnd={() => setAnalysisCompleted(false)} isStale={isStale} />
                    </div>
                </div>

                <div id="draftlab-champion-grid" className="lg:col-span-1">
                   {isBuilding ? 
                     <TeamBuilderAssistant 
                        step={builderStep} 
                        coreConcept={builderCore} 
                        suggestions={builderSuggestions} 
                        isLoading={isBuilderLoading} 
                        onSelect={handleBuilderSelect} 
                        onGenerateOpponent={handleGenerateOpponent} 
                        isOpponentLoading={isOpponentLoading}
                    />
                   : 
                     <ChampionGrid onSelect={(champLite) => { const champ = champions.find(c => c.id === champLite.id); if (champ) {handleChampionSelect(champ);} }} onQuickLook={() => {}} onWhyThisPick={() => {}} recommendations={[]} isRecsLoading={false} activeRole={null} draftState={draftState} onDragStart={(e, champ) => handleDragStart(e, 'blue', 'pick', -1, champ)} />
                   }
                </div>
            </div>
        </div>
    );
};


