import React, { useState, useEffect, useCallback } from 'react';
import type { DraftState, Champion, TeamSide, ChampionLite, ArenaBotPersona, ChampionSuggestion } from '../../types';
import { MISSION_IDS, ROLES } from '../../constants';
import { getBotDraftAction } from '../../services/geminiService';
import { TeamPanel } from '../DraftLab/TeamPanel';
import { ArenaChampionSelectModal } from './ArenaChampionSelectModal';
import { ArenaSaveModal } from './ArenaSaveModal';
import { Button } from '../common/Button';
import { TurnIndicator } from './TurnIndicator';
import { DraftTimeline } from './DraftTimeline';
import { COMPETITIVE_SEQUENCE } from './arenaConstants';
import toast from 'react-hot-toast';
import { useUserProfile } from '../../hooks/useUserProfile';
import { usePlaybook } from '../../hooks/usePlaybook';
import { getAvailableChampions, updateSlotInDraft } from '../../lib/draftUtils';
import { QuickLookPanel } from '../DraftLab/QuickLookPanel';
import { Swords } from 'lucide-react';
import { useChampions } from '../../contexts/ChampionContext';

interface LiveArenaProps {
  draftState: DraftState;
  setDraftState: React.Dispatch<React.SetStateAction<DraftState>>;
  onReset: () => void;
  onNavigateToForge: (draft: DraftState) => void;
}

const BOT_PERSONAS: ArenaBotPersona[] = ['The Aggressor', 'The Strategist', 'The Trickster'];

export const LiveArena = ({ draftState, setDraftState, onReset, onNavigateToForge }: LiveArenaProps) => {
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [lastUpdatedIndex, setLastUpdatedIndex] = useState(-1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [botPersona, setBotPersona] = useState<ArenaBotPersona>('The Strategist');
  const [quickLookChampion, setQuickLookChampion] = useState<ChampionLite | null>(null);
  const { champions, championsLite } = useChampions();
  
  const abortControllerRef = React.useRef<AbortController | null>(null);

  const { addSP, completeMission } = useUserProfile();

  const isDraftStarted = currentTurnIndex > 0;
  const draftFinished = currentTurnIndex >= COMPETITIVE_SEQUENCE.length;
  const currentTurn = !draftFinished ? COMPETITIVE_SEQUENCE[currentTurnIndex] : null;

  // Effect for component unmount cleanup
  useEffect(() => {
    return () => {
        abortControllerRef.current?.abort();
        setIsBotThinking(false);
    }
  }, []);

  useEffect(() => {
    if (draftFinished) {
        addSP(100, "Arena Draft Completed");
        completeMission(MISSION_IDS.GETTING_STARTED.PRACTICE_MAKES_PERFECT);
        if (completeMission(MISSION_IDS.WEEKLY.ARENA_CONTENDER)) {
            toast.success("Mission Complete: Arena Contender!");
        }
    }
  }, [draftFinished, addSP, completeMission]);

  const makeBotSelection = useCallback(async (signal: AbortSignal): Promise<{ champion: Champion | undefined, reasoning: string | null }> => {
    if (!currentTurn) return { champion: undefined, reasoning: null };
    
    const available = getAvailableChampions(draftState, championsLite);
    if (available.length === 0) {
        console.error("Bot has no champions to pick from.");
        return { champion: undefined, reasoning: null };
    }

    try {
        const aiSuggestion = await getBotDraftAction(draftState, currentTurn, botPersona, available, signal);
        const botPick = champions.find(c => c.name.toLowerCase() === aiSuggestion.championName.toLowerCase());
        const reasoning = aiSuggestion.reasoning;
        return { champion: botPick, reasoning };
    } catch (error) {
        console.error("Critical error in bot action selection, using fallback:", error);
        toast("The opponent AI had an issue and is selecting a random champion to continue.", { icon: '🤖' });
        const randomPick = available[Math.floor(Math.random() * available.length)];
        const champion = champions.find(c => c.id === randomPick.id);
        return { champion, reasoning: "Failsafe: A random champion was selected due to an AI error." };
    }
  }, [draftState, currentTurn, botPersona, champions, championsLite]);
  
  const handleChampionSelect = useCallback((champion: Champion | undefined) => {
    if (!currentTurn || !champion) return;

    const { team, type, index } = currentTurn;
    setDraftState(prev => updateSlotInDraft(prev, team, type, index, champion));

    setIsModalOpen(false);
    setLastUpdatedIndex(currentTurnIndex);
    setCurrentTurnIndex(prev => prev + 1);
  }, [currentTurn, setDraftState, currentTurnIndex]);

  const handleChampionSelectLite = useCallback((championLite: ChampionLite) => {
    const champion = champions.find(c => c.id === championLite.id);
    if (champion) {
        handleChampionSelect(champion);
    } else {
        console.error("Selected champion not found in full list:", championLite.id);
    }
  }, [handleChampionSelect, champions]);

  useEffect(() => {
    if (draftFinished || !currentTurn || currentTurn.team === 'blue') {
      setIsBotThinking(false);
      return;
    }

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsBotThinking(true);
    const timer = setTimeout(async () => {
      const { champion: botChampion, reasoning } = await makeBotSelection(controller.signal);
      if (controller.signal.aborted) return;

      if (botChampion) {
          if (reasoning) {
              const actionText = currentTurn.type === 'pick' ? 'picked' : 'banned';
              toast.custom((t) => (
                <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-sm w-full bg-surface-primary shadow-lg pointer-events-auto flex ring-1 ring-error/30 border border-border-primary`}>
                    <div className="p-4 flex items-center gap-3">
                        <div className="flex-shrink-0">
                            <img className="h-10 w-10" src={botChampion.image} alt={botChampion.name} />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-error">Opponent {actionText} {botChampion.name}</p>
                            <p className="mt-1 text-xs text-text-secondary">"{reasoning}"</p>
                        </div>
                    </div>
                </div>
              ), { position: 'top-center', duration: 6000 });
          }
          handleChampionSelect(botChampion);
      } else {
          setLastUpdatedIndex(currentTurnIndex);
          setCurrentTurnIndex(prev => prev + 1); // Skip turn if no champ found
      }
    }, 1500 + Math.random() * 1000); // Realistic delay

    return () => {
        clearTimeout(timer);
        controller.abort();
    }
  }, [currentTurnIndex, draftFinished, currentTurn, makeBotSelection, handleChampionSelect, draftState]);

  const handleSlotClick = (team: TeamSide, type: 'pick' | 'ban', index: number) => {
    if (draftFinished || !currentTurn || isBotThinking || team !== 'blue') return;
    
    if (currentTurn.team === team && currentTurn.type === type && currentTurn.index === index) {
      setIsModalOpen(true);
    }
  };

  const handleReset = () => {
    onReset();
    setCurrentTurnIndex(0);
    setLastUpdatedIndex(-1);
    setIsBotThinking(false);
  };
  
  const handleAnalyze = () => {
    onNavigateToForge(draftState);
  };

  const activeSlotForTeam = (team: TeamSide) => {
      if (currentTurn?.team === team) {
          return { type: currentTurn.type, index: currentTurn.index };
      }
      return null;
  }
  
  return (
    <div className="space-y-6">
        <QuickLookPanel champion={quickLookChampion} onClose={() => setQuickLookChampion(null)} />
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-primary border border-border-primary p-4 shadow-lg">
             <div className="flex items-center gap-4">
                <div className="bg-surface-secondary text-accent w-12 h-12 flex items-center justify-center flex-shrink-0">
                    <Swords size={32} />
                </div>
                <div>
                    <h1 className="font-display text-3xl font-bold text-text-primary">Drafting Arena</h1>
                    <p className="text-sm text-text-secondary">Practice the draft against a simulated environment.</p>
                </div>
            </div>
            <div className="flex flex-wrap gap-2">
                <Button onClick={() => setIsSaveModalOpen(true)} variant="secondary" disabled={!isDraftStarted}>Save to The Archives</Button>
                <Button onClick={handleReset} variant="danger">Reset</Button>
            </div>
        </div>

        {!isDraftStarted && (
            <div className="bg-surface-primary p-4 border border-border-primary">
                <h3 className="text-lg font-bold text-text-primary mb-2">Choose Your Opponent</h3>
                <div className="flex flex-wrap gap-2">
                    {BOT_PERSONAS.map(persona => (
                        <Button 
                            key={persona} 
                            onClick={() => setBotPersona(persona)} 
                            variant={botPersona === persona ? 'primary' : 'secondary'}
                        >
                            {persona}
                        </Button>
                    ))}
                </div>
            </div>
        )}

        <DraftTimeline sequence={COMPETITIVE_SEQUENCE} draftState={draftState} currentTurnIndex={currentTurnIndex} lastUpdatedIndex={lastUpdatedIndex} />

        <TurnIndicator turn={currentTurn} isBotThinking={isBotThinking} />

        {draftFinished && (
            <div className="text-center bg-surface-primary p-8 border border-border-primary">
                <p className="text-text-secondary my-4 max-w-md mx-auto">Review the final compositions below, save to your Playbook, or send to the Draft Lab for a full AI analysis.</p>
                <div className="flex flex-wrap justify-center gap-4">
                    <Button onClick={handleAnalyze} variant="primary">Analyze in Lab</Button>
                    <Button onClick={() => setIsSaveModalOpen(true)} variant="secondary">Save to The Archives</Button>
                    <Button onClick={handleReset} variant="secondary">New Arena Draft</Button>
                </div>
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TeamPanel side="blue" state={draftState.blue} onSlotClick={handleSlotClick} activeSlot={activeSlotForTeam('blue')} isTurnActive={!draftFinished && currentTurn?.team === 'blue'} />
            <TeamPanel side="red" state={draftState.red} onSlotClick={handleSlotClick} activeSlot={activeSlotForTeam('red')} isTurnActive={!draftFinished && currentTurn?.team === 'red'} />
        </div>

        <ArenaChampionSelectModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSelect={handleChampionSelectLite}
            onQuickLook={setQuickLookChampion}
            draftState={draftState}
        />

        <ArenaSaveModal
            isOpen={isSaveModalOpen}
            onClose={() => setIsSaveModalOpen(false)}
            draftState={draftState}
            botPersona={botPersona}
        />
    </div>
  );
};