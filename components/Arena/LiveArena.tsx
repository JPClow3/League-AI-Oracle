import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { DraftState, Champion, TeamSide, ChampionLite, ArenaBotPersona, AIAdvice } from '../../types';
import { MISSION_IDS } from '../../constants';
import { getBotDraftAction, getDraftAdvice, getTierList } from '../../services/geminiService';
import { TeamPanel } from '../DraftLab/TeamPanel';
import { ArenaChampionSelectModal } from './ArenaChampionSelectModal';
import { ArenaSaveModal } from './ArenaSaveModal';
import { Button } from '../common/Button';
import { TurnIndicator } from './TurnIndicator';
import { DraftTimeline } from './DraftTimeline';
import { COMPETITIVE_SEQUENCE } from './arenaConstants';
import toast from 'react-hot-toast';
import { useUserProfile } from '../../hooks/useUserProfile';
import { getAvailableChampions, updateSlotInDraft, swapChampionsInDraft } from '../../lib/draftUtils';
import { QuickLookPanel } from '../DraftLab/QuickLookPanel';
import { Swords, Bot, Trophy, BrainCircuit } from 'lucide-react';
import { useChampions } from '../../contexts/ChampionContext';
import { Loader } from '../common/Loader';
import { useSettings } from '../../hooks/useSettings';

interface LiveArenaProps {
  draftState: DraftState;
  setDraftState: React.Dispatch<React.SetStateAction<DraftState>>;
  onReset: () => void;
  onNavigateToForge: (draft: DraftState) => void;
}

const BOT_PERSONAS: ArenaBotPersona[] = [
  'The Strategist',
  'The Aggressor',
  'The Trickster',
  'The Meta Slave',
  'The One-Trick',
  'The Chaos Draft',
  'The Guardian',
  'The Split Pusher',
];

const personaDescriptions: Record<ArenaBotPersona, string> = {
  'The Strategist': 'Builds coherent, synergistic teams with meta-strong champions.',
  'The Aggressor': 'Prioritizes lane counters and early-game snowball champions.',
  'The Trickster': 'Uses flex picks and unconventional counters to disrupt your draft.',
  'The Meta Slave': 'Heavily prioritizes champions currently considered S-Tier.',
  'The One-Trick': 'Forces a specific champion, practicing against a known threat.',
  'The Chaos Draft': 'Picks champions in unexpected roles to create chaos.',
  'The Guardian': 'Builds a "Protect the Carry" team, prioritizing peel and a hyper-carry.',
  'The Split Pusher': 'Builds a "Split Push" team with a strong duelist and disengage.',
};

const ArenaResults = ({
  analysis,
  userSide,
  onReset,
  onNavigateToForge,
}: {
  analysis: AIAdvice | null;
  userSide: TeamSide;
  onReset: () => void;
  onNavigateToForge: () => void;
}) => {
  if (!analysis) {
    return (
      <div className="text-center bg-surface p-8 border border-border">
        <Loader messages={['Analyzing final score...']} />
      </div>
    );
  }

  const userAnalysis = analysis.teamAnalysis[userSide];
  const botAnalysis = analysis.teamAnalysis[userSide === 'blue' ? 'red' : 'blue'];

  const userWon = (userAnalysis.draftScore || 'C') >= (botAnalysis.draftScore || 'C');

  return (
    <div className="text-center bg-surface p-8 border border-border space-y-4">
      <div className="flex justify-center items-center gap-2">
        {userWon ? <Trophy className="h-8 w-8 text-gold" /> : <BrainCircuit className="h-8 w-8 text-error" />}
        <h2 className={`font-display text-4xl font-bold ${userWon ? 'text-gold' : 'text-error'}`}>
          {userWon ? 'Draft Won' : 'Draft Lost'}
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
        <div className="bg-secondary p-4 border border-border">
          <h3 className="font-semibold text-text-primary">Your Score</h3>
          <p className="font-display text-5xl font-black text-accent">{userAnalysis.draftScore}</p>
          <p className="text-xs text-text-secondary">{userAnalysis.teamIdentity}</p>
        </div>
        <div className="bg-secondary p-4 border border-border">
          <h3 className="font-semibold text-text-primary">Opponent&apos;s Score</h3>
          <p className="font-display text-5xl font-black text-error">{botAnalysis.draftScore}</p>
          <p className="text-xs text-text-secondary">{botAnalysis.teamIdentity}</p>
        </div>
      </div>
      <p className="text-text-secondary my-4 max-w-md mx-auto">
        Review the final compositions below, save to your Playbook, or send to the Draft Lab for a full AI analysis.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <Button onClick={onNavigateToForge} variant="primary">
          Analyze in Lab
        </Button>
        <Button onClick={onReset} variant="secondary">
          New Arena Draft
        </Button>
      </div>
    </div>
  );
};

export const LiveArena = ({ draftState, setDraftState, onReset, onNavigateToForge }: LiveArenaProps) => {
  const [currentTurnIndex, setCurrentTurnIndex] = useState(-1);
  const [lastUpdatedIndex, setLastUpdatedIndex] = useState(-1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [botPersona, setBotPersona] = useState<ArenaBotPersona>('The Strategist');
  const [oneTrickChampion, setOneTrickChampion] = useState<ChampionLite | null>(null);
  const [isOneTrickModalOpen, setIsOneTrickModalOpen] = useState(false);
  const [sTierList, setSTierList] = useState<string[]>([]);
  const [quickLookChampion, setQuickLookChampion] = useState<ChampionLite | null>(null);
  const [userSide, setUserSide] = useState<TeamSide>('blue');
  const { champions, championsLite } = useChampions();
  const [finalAnalysis, setFinalAnalysis] = useState<AIAdvice | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const abortControllerRef = React.useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  const { profile, addSP, completeMission, updateArenaStats } = useUserProfile();
  const { settings } = useSettings();

  const isDraftStarted = currentTurnIndex > -1;
  const draftFinished = currentTurnIndex >= COMPETITIVE_SEQUENCE.length;
  const currentTurn = !draftFinished ? COMPETITIVE_SEQUENCE[currentTurnIndex] : null;

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      abortControllerRef.current?.abort();
      setIsBotThinking(false);
    };
  }, []);

  useEffect(() => {
    if (botPersona === 'The Meta Slave' && sTierList.length === 0) {
      const controller = new AbortController();
      getTierList(controller.signal)
        .then(list => {
          if (!controller.signal.aborted) {
            const sTierNames = list.tierList.flatMap(r => r.champions.map(c => c.championName));
            setSTierList(sTierNames);
            toast.success('S-Tier list loaded for Meta Slave persona.');
          }
        })
        .catch(err => {
          if (!(err instanceof DOMException && err.name === 'AbortError')) {
            console.error('Failed to load S-Tier list:', err);
            toast.error('Could not load S-Tier list. Bot will use default logic.');
          }
        });
      return () => controller.abort();
    }
    return undefined;
  }, [botPersona, sTierList.length]);

  const handleDraftFinish = useCallback(async () => {
    if (isAnalyzing) {
      return;
    } // Prevent duplicate calls

    setIsAnalyzing(true);
    setFinalAnalysis(null);
    const controller = new AbortController();
    abortControllerRef.current = controller;
    try {
      const advice = await getDraftAdvice(
        draftState,
        userSide,
        settings.primaryRole,
        profile.skillLevel,
        'gemini-2.5-flash',
        controller.signal
      );
      if (controller.signal.aborted || !isMountedRef.current) {
        return;
      }
      setFinalAnalysis(advice);

      const userScore = advice.teamAnalysis[userSide].draftScore || 'C';
      const botScore = advice.teamAnalysis[userSide === 'blue' ? 'red' : 'blue'].draftScore || 'C';
      const userTeamIdentity = advice.teamAnalysis[userSide].teamIdentity || 'Balanced';

      toast.success(`Draft Complete! Your Score: ${userScore} vs Opponent: ${botScore}`);

      updateArenaStats(userScore, botPersona, userTeamIdentity);

      addSP(50, 'Arena Draft Completed');
      completeMission(MISSION_IDS.GETTING_STARTED.PRACTICE_MAKES_PERFECT);
      completeMission(MISSION_IDS.WEEKLY.ARENA_CONTENDER);
    } catch (e) {
      if (!(e instanceof DOMException && e.name === 'AbortError')) {
        toast.error('Could not get final draft score.');
      }
    } finally {
      if (isMountedRef.current) {
        setIsAnalyzing(false);
      }
    }
  }, [
    draftState,
    userSide,
    settings.primaryRole,
    profile.skillLevel,
    addSP,
    completeMission,
    updateArenaStats,
    botPersona,
    isAnalyzing,
  ]);

  useEffect(() => {
    if (draftFinished && !finalAnalysis && !isAnalyzing) {
      handleDraftFinish();
    }
  }, [draftFinished, finalAnalysis, isAnalyzing, handleDraftFinish]);

  const makeBotSelection = useCallback(
    async (signal: AbortSignal): Promise<{ champion: Champion | undefined; reasoning: string | null }> => {
      if (!currentTurn) {
        return { champion: undefined, reasoning: null };
      }

      const available = getAvailableChampions(draftState, championsLite);
      if (available.length === 0) {
        console.error('Bot has no champions to pick from.');
        return { champion: undefined, reasoning: null };
      }

      try {
        const aiSuggestion = await getBotDraftAction({
          draftState,
          turn: currentTurn,
          persona: botPersona,
          availableChampions: available,
          signal,
          sTierChampions: botPersona === 'The Meta Slave' ? sTierList : undefined,
          oneTrickChampion: botPersona === 'The One-Trick' ? oneTrickChampion?.name : undefined,
        });
        const botPick = champions.find(c => c.name.toLowerCase() === aiSuggestion.championName.toLowerCase());
        return { champion: botPick, reasoning: aiSuggestion.reasoning };
      } catch (error) {
        console.error('Critical error in bot action selection, using fallback:', error);
        toast('The opponent AI had an issue and is selecting a random champion to continue.', { icon: '🤖' });
        const randomPick = available[Math.floor(Math.random() * available.length)];
        const champion = randomPick ? champions.find(c => c.id === randomPick.id) : undefined;
        return { champion, reasoning: 'Failsafe: A random champion was selected due to an AI error.' };
      }
    },
    [draftState, currentTurn, botPersona, champions, championsLite, sTierList, oneTrickChampion]
  );

  const handleChampionSelect = useCallback(
    (champion: Champion | undefined) => {
      if (!currentTurn || !champion) {
        return;
      }
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }

      const { team, type, index } = currentTurn;
      setDraftState(prev => updateSlotInDraft(prev, team, type, index, champion));

      setIsModalOpen(false);
      setIsOneTrickModalOpen(false);
      setLastUpdatedIndex(currentTurnIndex);
      setCurrentTurnIndex(prev => prev + 1);
    },
    [currentTurn, setDraftState, currentTurnIndex]
  );

  const handleChampionSelectLite = useCallback(
    (championLite: ChampionLite) => {
      if (botPersona === 'The One-Trick' && isOneTrickModalOpen) {
        setOneTrickChampion(championLite);
        setIsOneTrickModalOpen(false);
        return;
      }
      const champion = champions.find(c => c.id === championLite.id);
      if (champion) {
        handleChampionSelect(champion);
      }
    },
    [handleChampionSelect, champions, botPersona, isOneTrickModalOpen]
  );

  useEffect(() => {
    if (draftFinished || !currentTurn || currentTurn.team === userSide) {
      setIsBotThinking(false);
      return;
    }

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsBotThinking(true);
    const timer = setTimeout(
      async () => {
        const { champion: botChampion, reasoning } = await makeBotSelection(controller.signal);
        if (controller.signal.aborted || !isMountedRef.current) {
          return;
        }

        if (botChampion) {
          if (reasoning && !reasoning.startsWith('Failsafe:')) {
            const actionText = currentTurn.type === 'pick' ? 'picked' : 'banned';
            toast.custom(
              t => (
                <div
                  className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-sm w-full bg-surface shadow-lg pointer-events-auto flex ring-1 ring-error/30 border border-border`}
                >
                  <div className="p-4 flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <img className="h-10 w-10" src={botChampion.image} alt={botChampion.name} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-error">
                        Opponent {actionText} {botChampion.name}
                      </p>
                      <p className="mt-1 text-xs text-text-secondary">&quot;{reasoning}&quot;</p>
                    </div>
                  </div>
                </div>
              ),
              { position: 'top-center', duration: 6000 }
            );
          }
          handleChampionSelect(botChampion);
        } else {
          setLastUpdatedIndex(currentTurnIndex);
          setCurrentTurnIndex(prev => prev + 1);
        }
      },
      500 + Math.random() * 500
    );

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [currentTurnIndex, draftFinished, currentTurn, makeBotSelection, handleChampionSelect, draftState, userSide]);

  const handleSlotClick = (team: TeamSide, type: 'pick' | 'ban', index: number) => {
    if (draftFinished || !currentTurn || isBotThinking || team !== userSide) {
      return;
    }

    if (currentTurn.team === team && currentTurn.type === type && currentTurn.index === index) {
      setIsModalOpen(true);
    }
  };

  const handleReset = () => {
    onReset();
    setCurrentTurnIndex(-1);
    setLastUpdatedIndex(-1);
    setIsBotThinking(false);
    setFinalAnalysis(null);
  };

  const handleDragStart = (e: React.DragEvent, team: TeamSide, type: 'pick' | 'ban', index: number) => {
    if (type === 'pick' && team === userSide) {
      e.dataTransfer.setData('sourceSlot', JSON.stringify({ team, type, index }));
      e.dataTransfer.effectAllowed = 'move';
    }
  };

  const handleDrop = useCallback(
    (event: React.DragEvent, team: TeamSide, type: 'pick' | 'ban', index: number) => {
      event.preventDefault();
      const sourceSlotJSON = event.dataTransfer.getData('sourceSlot');
      if (sourceSlotJSON) {
        const sourceSlot = JSON.parse(sourceSlotJSON);
        if (sourceSlot.team === team && sourceSlot.type === 'pick' && type === 'pick' && team === userSide) {
          setDraftState(prev => swapChampionsInDraft(prev, team, sourceSlot.index, index));
        }
      }
    },
    [setDraftState, userSide]
  );

  const activeSlotForTeam = (team: TeamSide) => {
    return currentTurn?.team === team ? { type: currentTurn.type, index: currentTurn.index } : null;
  };

  return (
    <div className="space-y-6">
      <QuickLookPanel
        champion={quickLookChampion}
        onClose={() => setQuickLookChampion(null)}
        onDraft={handleChampionSelectLite}
        canDraft={isModalOpen || isOneTrickModalOpen}
      />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface p-4 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="bg-secondary text-accent w-12 h-12 flex items-center justify-center flex-shrink-0">
            <Swords size={32} />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-text-primary">Drafting Arena</h1>
            <p className="text-sm text-text-secondary">Practice the draft against a simulated environment.</p>
          </div>
        </div>
        {isDraftStarted && (
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setIsSaveModalOpen(true)} variant="secondary" disabled={!draftFinished}>
              Save to The Archives
            </Button>
            <Button onClick={handleReset} variant="danger">
              Reset
            </Button>
          </div>
        )}
      </div>

      {!isDraftStarted ? (
        <div className="bg-surface p-6 sm:p-8 border border-border text-center">
          <h2 className="text-2xl font-bold font-display text-text-primary mb-2">Configure Your Arena Session</h2>
          <p className="text-text-secondary mb-6 max-w-xl mx-auto">
            Choose your side and select an AI opponent to begin your draft practice.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-secondary p-4 rounded-lg border border-border">
              <h3 className="text-lg font-bold text-text-primary mb-3">1. Choose Your Side</h3>
              <div className="flex gap-2">
                <Button
                  onClick={() => setUserSide('blue')}
                  variant={userSide === 'blue' ? 'primary' : 'secondary'}
                  className="w-full !py-3"
                >
                  Blue Side
                </Button>
                <Button
                  onClick={() => setUserSide('red')}
                  variant={userSide === 'red' ? 'primary' : 'secondary'}
                  className="w-full !py-3"
                >
                  Red Side
                </Button>
              </div>
            </div>
            <div className="bg-secondary p-4 rounded-lg border border-border">
              <h3 className="text-lg font-bold text-text-primary mb-3">2. Choose Your Opponent</h3>
              <select
                onChange={e => setBotPersona(e.target.value as ArenaBotPersona)}
                value={botPersona}
                className="w-full bg-surface-inset border border-border p-2 focus:outline-none focus:ring-2 focus:ring-accent"
              >
                {BOT_PERSONAS.map(p => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <p className="text-xs text-text-secondary italic mt-2 h-8">{personaDescriptions[botPersona]}</p>
              {botPersona === 'The One-Trick' && (
                <div className="flex items-center gap-2 mt-2">
                  <Button onClick={() => setIsOneTrickModalOpen(true)} variant="secondary">
                    Select Champion
                  </Button>
                  {oneTrickChampion && (
                    <div className="flex items-center gap-2">
                      <img src={oneTrickChampion.image} className="w-8 h-8" alt={oneTrickChampion.name} />{' '}
                      <span className="font-semibold">{oneTrickChampion.name}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="mt-8">
            <Button
              onClick={() => setCurrentTurnIndex(0)}
              variant="primary"
              className="!text-lg !px-8 !py-4"
              disabled={botPersona === 'The One-Trick' && !oneTrickChampion}
            >
              Start Draft
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-surface p-3 border border-border flex justify-between items-center">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold text-text-secondary">Bot Persona:</span>
              <span className="font-bold text-text-primary">{botPersona}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Bot size={16} className="text-info" />
              <span className="font-semibold text-text-secondary">Adaptive Difficulty:</span>
              <span className="font-bold text-info">{profile.arenaStats.difficulty}</span>
            </div>
          </div>

          <DraftTimeline
            sequence={COMPETITIVE_SEQUENCE}
            draftState={draftState}
            currentTurnIndex={currentTurnIndex}
            lastUpdatedIndex={lastUpdatedIndex}
          />
          <TurnIndicator turn={currentTurn || null} isBotThinking={isBotThinking} userSide={userSide} context="arena" />
        </>
      )}

      {draftFinished && (
        <ArenaResults
          analysis={finalAnalysis}
          userSide={userSide}
          onReset={handleReset}
          onNavigateToForge={() => onNavigateToForge(draftState)}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TeamPanel
          side="blue"
          state={draftState.blue}
          onSlotClick={handleSlotClick}
          activeSlot={activeSlotForTeam('blue')}
          isTurnActive={!draftFinished && currentTurn?.team === 'blue'}
          onDragStart={handleDragStart}
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
        />
        <TeamPanel
          side="red"
          state={draftState.red}
          onSlotClick={handleSlotClick}
          activeSlot={activeSlotForTeam('red')}
          isTurnActive={!draftFinished && currentTurn?.team === 'red'}
          onDragStart={handleDragStart}
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
        />
      </div>

      <ArenaChampionSelectModal
        isOpen={isModalOpen || isOneTrickModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setIsOneTrickModalOpen(false);
        }}
        onSelect={handleChampionSelectLite}
        onQuickLook={setQuickLookChampion}
        draftState={draftState}
        title={isOneTrickModalOpen ? 'Select One-Trick Champion' : 'Select your Champion'}
      />
      <ArenaSaveModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        draftState={draftState}
        botPersona={botPersona}
        userSide={userSide}
      />
    </div>
  );
};
