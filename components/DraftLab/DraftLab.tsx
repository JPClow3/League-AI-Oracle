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
import { Download } from 'lucide-react';
import { logger } from '../../lib/logger';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { MobileTabs, type TabType } from './MobileTabs';
import { MobileTeamView } from './MobileTeamView';
import { UndoRedoControls } from './UndoRedoControls';

const DRAFT_LAB_TOUR_STEPS: TourStep[] = [
  {
    selector: '#draftlab-blue-team',
    title: 'Your Team Panel',
    content: 'This is where you build your team. Click on an empty slot to select a champion.',
  },
  {
    selector: '#draftlab-champion-grid',
    title: 'The Champion Grid',
    content: 'Search, filter, and select champions here. You can also drag-and-drop champions into the slots.',
  },
  {
    selector: '#draftlab-red-team',
    title: 'The Opponent Panel',
    content: 'This is the enemy team. Fill this out to simulate a real draft scenario.',
  },
  {
    selector: '#draftlab-analyze-button',
    title: 'Get AI Analysis',
    content:
      'Once both teams have 5 champions, click here to get instant, in-depth feedback on the matchup from the AI.',
  },
  {
    selector: '#draftlab-advice-panel',
    title: 'The Advice Panel',
    content:
      'Your AI-powered analysis will appear here, packed with insights on strengths, weaknesses, and win conditions.',
  },
];

export const DraftLab = ({
  startTour,
  onTourComplete,
  navigateToAcademy,
}: {
  startTour: boolean;
  onTourComplete: () => void;
  navigateToAcademy: (lessonId: string) => void;
}) => {
  const { draftState, setDraftState, resetDraft, canUndo, canRedo, undo, redo } = useDraft();
  const { champions, championsLite } = useChampions();
  const { settings } = useSettings();
  const { profile, addSP, completeMission, addChampionMastery } = useUserProfile();

  const [activeSlot, setActiveSlot] = useState<{ team: TeamSide; type: 'pick' | 'ban'; index: number } | null>(null);
  const [draggedOverSlot, setDraggedOverSlot] = useState<{
    team: TeamSide;
    type: 'pick' | 'ban';
    index: number;
  } | null>(null);

  const [advice, setAdvice] = useState<AIAdvice | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisCompleted, setAnalysisCompleted] = useState(false);

  const [isTourOpen, setIsTourOpen] = useState(startTour);
  const [isBuilderModalOpen, setIsBuilderModalOpen] = useState(false);

  // Team Builder State
  const [isBuilding, setIsBuilding] = useState(false);
  const [builderStep, setBuilderStep] = useState(0);
  const [builderSuggestions, setBuilderSuggestions] = useState<(ChampionSuggestion & { champion: ChampionLite })[]>([]);
  const [isBuilderLoading, setIsBuilderLoading] = useState(false);
  const [builderCore, setBuilderCore] = useState('');
  const [isOpponentLoading, setIsOpponentLoading] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState<TabType>('team');

  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    setIsTourOpen(startTour);
  }, [startTour]);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Z or Cmd+Z for undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) {
          undo();
          toast.success('Undone', { duration: 2000 });
        }
      }
      // Ctrl+Shift+Z or Cmd+Shift+Z for redo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        if (canRedo) {
          redo();
          toast.success('Redone', { duration: 2000 });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, undo, redo]);

  // Cleanup abort controller on unmount and mark as unmounted
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      abortControllerRef.current?.abort();
    };
  }, []);

  const isDraftComplete = draftState.blue.picks.every(p => p.champion) && draftState.red.picks.every(p => p.champion);
  const isStale = advice && JSON.stringify(draftState) !== advice.draftId;

  const handleSlotClick = useCallback((team: TeamSide, type: 'pick' | 'ban', index: number) => {
    setActiveSlot({ team, type, index });
  }, []);

  const handleChampionSelect = useCallback(
    (champion: Champion) => {
      if (!activeSlot) {
        return;
      }
      setDraftState(prev => updateSlotInDraft(prev, activeSlot.team, activeSlot.type, activeSlot.index, champion));
      setActiveSlot(null);
    },
    [activeSlot, setDraftState]
  );

  const handleClearSlot = useCallback(
    (team: TeamSide, type: 'pick' | 'ban', index: number) => {
      setDraftState(prev => updateSlotInDraft(prev, team, type, index, null));
    },
    [setDraftState]
  );

  const handleAnalyze = async () => {
    if (!isDraftComplete || isLoading) {
      return;
    }
    setIsLoading(true);
    // Abort any previous request to prevent race conditions
    setError(null);
    setAnalysisCompleted(false);

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Check if request was aborted or component unmounted
    if (controller.signal.aborted || !isMountedRef.current) {
      return;
    }
    try {
      const result = await getDraftAdvice(
        draftState,
        'blue',
        settings.primaryRole,
        profile.skillLevel,
        'gemini-2.5-pro',
        controller.signal
      );
      if (controller.signal.aborted) {
        return;
      }

      setAdvice({ ...result, draftId: JSON.stringify(draftState) });
      setAnalysisCompleted(true);

      const userScore = result.teamAnalysis.blue.draftScore;
      if (userScore) {
        const blueChampions = draftState.blue.picks
          .filter((p): p is { champion: ChampionLite } => !!p.champion)
          .map(p => p.champion);
        if (userScore.startsWith('S')) {
          addSP(150, 'S-Grade Draft Analysis');
          completeMission(MISSION_IDS.WEEKLY.PERFECT_COMP);
          addChampionMastery(blueChampions, userScore);
        } else if (userScore.startsWith('A')) {
          addChampionMastery(blueChampions, userScore);
        }
      }
      addSP(25, 'Draft Analysis');
      completeMission(MISSION_IDS.GETTING_STARTED.FIRST_ANALYSIS);
      completeMission(MISSION_IDS.DAILY.FIRST_DRAFT_OF_DAY);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }
      if (!isMountedRef.current) {
        return;
      }

      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      if (!controller.signal.aborted && isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  // --- Drag and Drop Logic ---
  const handleDragStart = useCallback(
    (e: React.DragEvent, team: TeamSide, type: 'pick' | 'ban', index: number, champion: Champion) => {
      e.dataTransfer.setData('application/json', JSON.stringify({ champion, source: { team, type, index } }));
      e.dataTransfer.effectAllowed = 'copyMove';
    },
    []
  );

  const handleDrop = useCallback(
    (e: React.DragEvent, team: TeamSide, type: 'pick' | 'ban', index: number) => {
      e.preventDefault();
      setDraggedOverSlot(null);
      try {
        const dataString = e.dataTransfer.getData('application/json');
        if (!dataString) {
          logger.error('Drag and drop failed: No data', { component: 'DraftLab' });
          return;
        }

        const data = JSON.parse(dataString);
        if (!data || !data.champion) {
          logger.error('Drag and drop failed: Invalid data structure', { component: 'DraftLab' });
          return;
        }

        const champion = data.champion as Champion;

        if (data.source) {
          // It's a swap
          // Only allow swaps within the same team and same type
          if (data.source.team === team && data.source.type === type) {
            setDraftState(prev => swapChampionsInDraft(prev, team, data.source.index, index));
          } else {
            // Cross-team or cross-type drag: treat as new placement
            const available = getAvailableChampions(draftState, championsLite);
            if (available.some(c => c.id === champion.id)) {
              setDraftState(prev => updateSlotInDraft(prev, team, type, index, champion));
            }
          }
        } else {
          // It's a drag from the grid
          const available = getAvailableChampions(draftState, championsLite);
          if (available.some(c => c.id === champion.id)) {
            setDraftState(prev => updateSlotInDraft(prev, team, type, index, champion));
          }
        }
      } catch (error) {
        logger.error(error instanceof Error ? error : new Error('Drag and drop failed'), { component: 'DraftLab' });
        toast.error('Failed to move champion. Please try again.');
      }
    },
    [draftState, championsLite, setDraftState]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent, team: TeamSide, type: 'pick' | 'ban', index: number) => {
    e.preventDefault();
    setDraggedOverSlot({ team, type, index });
  }, []);

  const handleDragLeave = useCallback(() => {
    setDraggedOverSlot(null);
  }, []);

  // --- Blueprint Logic ---
  const handleLoadBlueprint = useCallback(
    (championIds: string[]) => {
      const newPicks = Array(5)
        .fill(null)
        .map((_, i) => ({
          champion: championIds[i] ? champions.find(c => c.id === championIds[i]) || null : null,
          isActive: false,
        }));
      setDraftState(prev => ({ ...prev, blue: { ...prev.blue, picks: newPicks } }));
      toast.success('Blueprint loaded!');
    },
    [champions, setDraftState]
  );

  // --- Team Builder Assistant Logic ---
  const fetchBuilderSuggestions = useCallback(
    async (currentDraft: DraftState, step: number, _core: string, signal: AbortSignal) => {
      setIsBuilderLoading(true);
      try {
        // Bounds check for ROLES array
        if (step < 0 || step >= ROLES.length) {
          logger.error(`Invalid step index: ${step}`, { component: 'DraftLab', step, rolesLength: ROLES.length });
          setIsBuilderLoading(false);
          return;
        }

        const roleToPick = ROLES[step];
        const available = getAvailableChampions(currentDraft, championsLite);

        // Use currentDraft parameter instead of closure draftState
        const currentPicks = currentDraft.blue.picks
          .filter((p): p is { champion: ChampionLite } => !!p.champion)
          .map(p => p.champion.name);

        const suggestions = await getTeambuilderSuggestion({
          coreConcept: _core, // Use parameter instead of closure variable to avoid stale state
          currentPicks,
          roleToPick: roleToPick || 'Any',
          availableChampions: available,
          signal,
        });
        if (signal.aborted) {
          return;
        }

        // Handle undefined find results gracefully
        const suggestionsWithData = suggestions
          .map(s => {
            const champion = championsLite.find(c => c.name === s.championName);
            return champion ? { ...s, champion } : null;
          })
          .filter((s): s is ChampionSuggestion & { champion: ChampionLite } => s !== null);

        setBuilderSuggestions(suggestionsWithData);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }
        toast.error(err instanceof Error ? err.message : 'Failed to get suggestions.');
        setIsBuilding(false); // Abort builder on error
      } finally {
        if (!signal.aborted) {
          setIsBuilderLoading(false);
        }
      }
    },
    [championsLite]
  );

  const handleStartBuilder = useCallback(
    (core: { type: 'champion' | 'strategy'; value: string }) => {
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
    },
    [draftState, fetchBuilderSuggestions, resetDraft]
  );

  const handleBuilderSelect = useCallback(
    (champion: ChampionLite) => {
      const fullChampion = champions.find(c => c.id === champion.id);
      if (!fullChampion) {
        return;
      }

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
    },
    [champions, draftState, builderStep, builderCore, fetchBuilderSuggestions, setDraftState]
  );

  const handleGenerateOpponent = useCallback(async () => {
    setIsOpponentLoading(true);
    let currentRedDraft = draftState;

    // Abort any previous generation attempt
    abortControllerRef.current?.abort();
    const mainController = new AbortController();
    abortControllerRef.current = mainController;

    for (let i = 0; i < 5; i++) {
      // Check if main controller was aborted
      if (mainController.signal.aborted) {
        break;
      }

      // Create a new controller for each request, but abort it if main is aborted
      const controller = new AbortController();
      if (mainController.signal.aborted) {
        controller.abort();
      }

      try {
        const available = getAvailableChampions(currentRedDraft, championsLite);
        if (available.length === 0) {
          toast.error('No more champions available for opponent team.');
          break;
        }

        const suggestion = await getBotDraftAction({
          draftState: currentRedDraft,
          turn: { team: 'red', type: 'pick', index: i },
          persona: 'The Strategist',
          availableChampions: available,
          signal: controller.signal,
        });

        if (controller.signal.aborted || mainController.signal.aborted) {
          break;
        }

        const champ = champions.find(c => c.name === suggestion.championName);
        if (champ) {
          currentRedDraft = updateSlotInDraft(currentRedDraft, 'red', 'pick', i, champ);
          // Only update state if not aborted
          if (!mainController.signal.aborted && isMountedRef.current) {
            setDraftState(currentRedDraft);
          }
        } else {
          console.warn(`Champion ${suggestion.championName} not found in champions list`);
        }
      } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') {
          break;
        }
        toast.error('Failed to generate part of the opponent team.');
        break;
      }
    }

    if (!mainController.signal.aborted && isMountedRef.current) {
      setIsOpponentLoading(false);
      setIsBuilding(false); // Exit builder mode
    }
  }, [draftState, championsLite, champions, setDraftState]);

  const handleReset = useCallback(() => {
    setIsResetConfirmOpen(true);
  }, []);

  const confirmReset = useCallback(() => {
    resetDraft();
    setIsBuilding(false);
    setBuilderStep(0);
    setBuilderCore('');
    setBuilderSuggestions([]);
    setIsResetConfirmOpen(false);
    toast.success('Draft reset');
  }, [resetDraft]);

  const handleExportDraft = useCallback(async () => {
    try {
      const draftContainer = document.getElementById('draftlab-draft-container');
      if (!draftContainer) {
        toast.error('Could not find draft to export');
        return;
      }

      toast.loading('Exporting draft as image...', { id: 'export-draft' });

      // Lazy load html2canvas only when needed (reduces initial bundle size)
      const html2canvas = (await import('html2canvas')).default;

      const canvas = await html2canvas(draftContainer, {
        backgroundColor: null,
        scale: 2,
        logging: false,
        useCORS: true,
      });

      canvas.toBlob(blob => {
        if (!blob) {
          toast.error('Failed to create image', { id: 'export-draft' });
          return;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `draft-${new Date().toISOString().split('T')[0]}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success('Draft exported successfully!', { id: 'export-draft' });
      }, 'image/png');
    } catch (error) {
      logger.error(error instanceof Error ? error : new Error('Failed to export draft'), { component: 'DraftLab' });
      toast.error('Failed to export draft', { id: 'export-draft' });
    }
  }, []);

  return (
    <div className="space-y-6">
      <GuidedTour
        isOpen={isTourOpen}
        onClose={() => {
          setIsTourOpen(false);
          onTourComplete();
        }}
        steps={DRAFT_LAB_TOUR_STEPS}
      />
      <TeamBuilderModal
        isOpen={isBuilderModalOpen}
        onClose={() => setIsBuilderModalOpen(false)}
        onStart={handleStartBuilder}
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-text-primary tracking-wide">Strategy Forge</h1>
          <p className="text-sm text-text-secondary">
            Theory-craft team compositions and get instant AI-powered feedback.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <UndoRedoControls
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={() => {
              undo();
              toast.success('Undone', { duration: 2000 });
            }}
            onRedo={() => {
              redo();
              toast.success('Redone', { duration: 2000 });
            }}
          />
          <Button id="draftlab-teambuilder-button" variant="secondary" onClick={() => setIsBuilderModalOpen(true)}>
            Team Builder Assistant
          </Button>
          <Button variant="secondary" onClick={handleReset}>
            Reset Draft
          </Button>
          <ConfirmationModal
            isOpen={isResetConfirmOpen}
            onClose={() => setIsResetConfirmOpen(false)}
            onConfirm={confirmReset}
            title="Reset Draft"
            message="Are you sure you want to reset the draft? This will clear all picks and bans. This action cannot be undone."
            confirmText="Reset"
            cancelText="Cancel"
            variant="danger"
          />
          <Button variant="secondary" onClick={handleExportDraft} disabled={!isDraftComplete}>
            <Download size={16} className="mr-2" aria-hidden="true" />
            Export
          </Button>
          <Button
            id="draftlab-analyze-button"
            variant="primary"
            onClick={handleAnalyze}
            disabled={!isDraftComplete || isLoading}
          >
            {isLoading ? 'Analyzing...' : 'Analyze'}
          </Button>
        </div>
      </div>

      <BlueprintPanel onLoad={handleLoadBlueprint} />

      {/* Mobile Layout */}
      {isMobile ? (
        <MobileTabs
          activeTab={activeMobileTab}
          onTabChange={setActiveMobileTab}
          teamContent={
            <MobileTeamView
              draftState={draftState}
              onSlotClick={handleSlotClick}
              onClearSlot={handleClearSlot}
              activeSlot={activeSlot}
              onDrop={handleDrop}
              onDragStart={(e, t, y, i) => {
                const champ = t === 'blue' ? draftState.blue.picks[i]?.champion : draftState.red.picks[i]?.champion;
                if (champ) {
                  handleDragStart(e, t, y, i, champ);
                }
              }}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              draggedOverSlot={draggedOverSlot}
            />
          }
          championsContent={
            isBuilding ? (
              <TeamBuilderAssistant
                step={builderStep}
                coreConcept={builderCore}
                suggestions={builderSuggestions}
                isLoading={isBuilderLoading}
                onSelect={handleBuilderSelect}
                onGenerateOpponent={handleGenerateOpponent}
                isOpponentLoading={isOpponentLoading}
              />
            ) : (
              <ChampionGrid
                onSelect={champLite => {
                  const champ = champions.find(c => c.id === champLite.id);
                  if (champ) {
                    handleChampionSelect(champ);
                  }
                }}
                onQuickLook={() => {}}
                onWhyThisPick={() => {}}
                recommendations={[]}
                isRecsLoading={false}
                activeRole={null}
                draftState={draftState}
                onDragStart={(e, champ) => handleDragStart(e, 'blue', 'pick', -1, champ)}
              />
            )
          }
          adviceContent={
            <AdvicePanel
              advice={advice}
              isLoading={isLoading}
              error={error}
              navigateToAcademy={navigateToAcademy}
              analysisCompleted={analysisCompleted}
              onAnimationEnd={() => setAnalysisCompleted(false)}
              isStale={isStale || false}
            />
          }
        />
      ) : (
        /* Desktop Layout */
        <div id="draftlab-draft-container" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TeamPanel
                id="draftlab-blue-team"
                side="blue"
                state={draftState.blue}
                onSlotClick={handleSlotClick}
                onClearSlot={handleClearSlot}
                activeSlot={activeSlot?.team === 'blue' ? activeSlot : null}
                onDrop={handleDrop}
                onDragStart={(e, t, y, i) => {
                  const champ = draftState.blue.picks[i]?.champion;
                  if (champ) {
                    handleDragStart(e, t, y, i, champ);
                  }
                }}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                draggedOverSlot={draggedOverSlot}
              />
              <TeamPanel
                id="draftlab-red-team"
                side="red"
                state={draftState.red}
                onSlotClick={handleSlotClick}
                onClearSlot={handleClearSlot}
                activeSlot={activeSlot?.team === 'red' ? activeSlot : null}
                onDrop={handleDrop}
                onDragStart={(e, t, y, i) => {
                  const champ = draftState.red.picks[i]?.champion;
                  if (champ) {
                    handleDragStart(e, t, y, i, champ);
                  }
                }}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                draggedOverSlot={draggedOverSlot}
              />
            </div>
            <div id="draftlab-advice-panel">
              <AdvicePanel
                advice={advice}
                isLoading={isLoading}
                error={error}
                navigateToAcademy={navigateToAcademy}
                analysisCompleted={analysisCompleted}
                onAnimationEnd={() => setAnalysisCompleted(false)}
                isStale={isStale || false}
              />
            </div>
          </div>

          <div id="draftlab-champion-grid" className="lg:col-span-1">
            {isBuilding ? (
              <TeamBuilderAssistant
                step={builderStep}
                coreConcept={builderCore}
                suggestions={builderSuggestions}
                isLoading={isBuilderLoading}
                onSelect={handleBuilderSelect}
                onGenerateOpponent={handleGenerateOpponent}
                isOpponentLoading={isOpponentLoading}
              />
            ) : (
              <ChampionGrid
                onSelect={champLite => {
                  const champ = champions.find(c => c.id === champLite.id);
                  if (champ) {
                    handleChampionSelect(champ);
                  }
                }}
                onQuickLook={() => {}}
                onWhyThisPick={() => {}}
                recommendations={[]}
                isRecsLoading={false}
                activeRole={null}
                draftState={draftState}
                onDragStart={(e, champ) => handleDragStart(e, 'blue', 'pick', -1, champ)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
