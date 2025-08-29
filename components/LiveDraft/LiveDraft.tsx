import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { DraftState, Champion, TeamSide, ChampionLite, ChampionSuggestion, PlaybookPlusDossier, DraftMode } from '../../types';
import { ROLES } from '../../constants';
import { getChampionSuggestions, generatePlaybookPlusDossier, generateDraftName } from '../../services/geminiService';
import { TeamPanel } from '../DraftLab/TeamPanel';
import { ChampionGrid } from '../DraftLab/ChampionGrid';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { TurnIndicator } from '../Arena/TurnIndicator';
import { DraftTimeline } from '../Arena/DraftTimeline';
import { COMPETITIVE_SEQUENCE, SOLO_QUEUE_SEQUENCE } from '../Arena/arenaConstants';
import toast from 'react-hot-toast';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useSettings } from '../../hooks/useSettings';
import { usePlaybook } from '../../hooks/usePlaybook';
import { QuickLookPanel } from '../DraftLab/QuickLookPanel';
import { Loader } from '../common/Loader';
import { Signal, Info, Eye, Users, User } from 'lucide-react';
import { useChampions } from '../../contexts/ChampionContext';

// A component to display suggestions cleanly and quickly for live drafting.
const SuggestionPanel = ({ suggestions, isLoading, onSelect }: { suggestions: (ChampionSuggestion & { champion: ChampionLite })[], isLoading: boolean, onSelect: (champion: ChampionLite) => void }) => {
    if (isLoading) {
        return <div className="p-4 text-center text-text-secondary animate-pulse">Getting suggestions...</div>;
    }
    if (suggestions.length === 0 && !isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center text-text-secondary">
                <Info className="h-12 w-12 mb-2 text-border" />
                <p>Awaiting your turn to provide suggestions.</p>
             </div>
        );
    }

    return (
        <div className="space-y-2">
            <h3 className="text-lg font-bold text-accent">AI Co-Pilot Suggestions</h3>
            {suggestions.map(rec => (
                <button 
                    key={rec.champion.id} 
                    onClick={() => onSelect(rec.champion)}
                    className="w-full text-left p-2 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors flex items-center gap-3 border border-border"
                >
                    <img src={rec.champion.image} alt={rec.champion.name} className="w-10 h-10 flex-shrink-0" />
                    <div>
                        <p className="font-bold text-text-primary">{rec.championName}</p>
                        <p className="text-xs text-text-secondary">{rec.reasoning}</p>
                    </div>
                </button>
            ))}
        </div>
    );
};

const DossierDisplay = ({ dossier }: { dossier: PlaybookPlusDossier }) => (
    <div className="space-y-4">
        <h3 className="text-xl font-bold text-accent mb-2">Pre-Game Briefing</h3>
        <div className="bg-secondary p-4 border border-border space-y-3 text-sm">
            <div>
                <h4 className="font-semibold text-accent">Win Condition</h4>
                <p className="text-text-secondary">{dossier.winCondition}</p>
            </div>
             <div>
                <h4 className="font-semibold text-accent">Early Game (0-15m)</h4>
                <p className="text-text-secondary">{dossier.earlyGame}</p>
            </div>
             <div>
                <h4 className="font-semibold text-accent">Mid Game (15-25m)</h4>
                <p className="text-text-secondary">{dossier.midGame}</p>
            </div>
             <div>
                <h4 className="font-semibold text-accent">Teamfighting</h4>
                <p className="text-text-secondary">{dossier.teamfighting}</p>
            </div>
        </div>
    </div>
);

const PreGameBriefing = ({ draftState, onReset }: { draftState: DraftState, onReset: () => void }) => {
    const [dossier, setDossier] = useState<PlaybookPlusDossier | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { addEntry: addPlaybookEntry } = usePlaybook();
    const [isSaving, setIsSaving] = useState(false);
    const [draftName, setDraftName] = useState('');

    useEffect(() => {
        const controller = new AbortController();
        
        const generateData = async () => {
            try {
                const [dossierResult, nameResult] = await Promise.all([
                    generatePlaybookPlusDossier(draftState, controller.signal),
                    generateDraftName(draftState, controller.signal)
                ]);

                if (controller.signal.aborted) return;
                
                setDossier(dossierResult);
                setDraftName(nameResult || 'Live Game Draft');

            } catch (err) {
                if (!(err instanceof DOMException && err.name === 'AbortError')) {
                    setError('Failed to generate AI briefing.');
                }
            } finally {
                 if (!controller.signal.aborted) {
                    setIsLoading(false);
                 }
            }
        };

        generateData();
        return () => controller.abort();
    }, [draftState]);

    const handleSave = async () => {
        if (!draftName.trim() || !dossier) return;
        setIsSaving(true);
        const notes = `Dossier:\n- Win Con: ${dossier.winCondition}\n- Early: ${dossier.earlyGame}\n- Mid: ${dossier.midGame}\n- Fights: ${dossier.teamfighting}`;
        await addPlaybookEntry(draftName, draftState, null, notes);
        setIsSaving(false);
    };

    if (isLoading) {
        return <div className="text-center bg-surface p-8 border border-border"><Loader messages={['Analyzing final draft...', 'Generating strategic dossier...']} /></div>;
    }

    if (error) {
         return <div className="text-center bg-error/10 p-8 border border-error/20 text-error">{error}</div>;
    }

    return (
        <div className="text-center bg-surface p-8 border border-border space-y-4">
            {dossier && <DossierDisplay dossier={dossier} />}
            <p className="text-text-secondary my-4 max-w-md mx-auto">Review your pre-game briefing. You can save this draft to your Playbook for later analysis.</p>
            <div className="flex flex-wrap justify-center gap-4">
                <Button onClick={handleSave} variant="primary" disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save to Playbook'}
                </Button>
                <Button onClick={onReset} variant="secondary">New Co-Pilot Session</Button>
            </div>
        </div>
    );
};


interface LiveDraftProps {
  draftState: DraftState;
  setDraftState: React.Dispatch<React.SetStateAction<DraftState>>;
  onReset: () => void;
}

export const LiveDraft = ({ draftState, setDraftState, onReset }: LiveDraftProps) => {
  const [currentTurnIndex, setCurrentTurnIndex] = useState(-1); // -1 means not started
  const [draftMode, setDraftMode] = useState<DraftMode | null>(null);
  const [lastUpdatedIndex, setLastUpdatedIndex] = useState(-1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quickLookChampion, setQuickLookChampion] = useState<ChampionLite | null>(null);
  const { champions, championsLite } = useChampions();
  
  const [suggestions, setSuggestions] = useState<(ChampionSuggestion & { champion: ChampionLite })[]>([]);
  const [isRecsLoading, setIsRecsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const { profile } = useUserProfile();
  const { settings } = useSettings();

  const sequence = draftMode === 'soloq' ? SOLO_QUEUE_SEQUENCE : COMPETITIVE_SEQUENCE;
  const isDraftStarted = currentTurnIndex >= 0 && draftMode !== null;
  const draftFinished = isDraftStarted && currentTurnIndex >= sequence.length;
  const currentTurn = isDraftStarted && !draftFinished ? sequence[currentTurnIndex] : null;

  const handleChampionSelect = useCallback((championLite: ChampionLite) => {
    if (!currentTurn) return;
    
    const champion = champions.find(c => c.id === championLite.id);
    if (!champion) return;

    const { team, type, index } = currentTurn;
    setDraftState(prevState => {
      const isPick = type === 'pick';
      const targetArray = isPick ? prevState[team].picks : prevState[team].bans;
      const newArray = targetArray.map((slot, i) => i === index ? { ...slot, champion } : slot);
      return {
        ...prevState,
        [team]: {
          ...prevState[team],
          [isPick ? 'picks' : 'bans']: newArray,
        },
      };
    });

    setIsModalOpen(false);
    setLastUpdatedIndex(currentTurnIndex);
    setCurrentTurnIndex(prev => prev + 1);
  }, [currentTurn, setDraftState, currentTurnIndex, champions]);
  
  // Fetch suggestions when it's the user's turn
  useEffect(() => {
    if (currentTurn?.team !== 'blue') {
        setSuggestions([]);
        setIsRecsLoading(false);
        return;
    }
    
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsRecsLoading(true);
    setSuggestions([]);

    const favoriteChampionNames = settings.favoriteChampions
        .map(id => championsLite.find(c => c.id === id)?.name)
        .filter((name): name is string => !!name);

    getChampionSuggestions(draftState, currentTurn, settings.primaryRole, profile.skillLevel, favoriteChampionNames, 'standard', controller.signal)
        .then(suggs => {
            if (controller.signal.aborted) return;
            const enriched = suggs.map(s => ({ ...s, champion: championsLite.find(c => c.name.toLowerCase() === s.championName.toLowerCase())! })).filter(s => s.champion);
            setSuggestions(enriched);
        })
        .catch(err => {
            if (!(err instanceof DOMException && err.name === 'AbortError')) {
                toast.error("Failed to get suggestions.");
            }
        })
        .finally(() => {
            if (!controller.signal.aborted) {
                setIsRecsLoading(false);
            }
        });

    return () => controller.abort();
  }, [currentTurnIndex, draftState, settings, profile.skillLevel, championsLite]);


  const handleSlotClick = (team: TeamSide, type: 'pick' | 'ban', index: number) => {
    if (draftFinished || !currentTurn) return;
    
    if (currentTurn.team === team && currentTurn.type === type && currentTurn.index === index) {
      setIsModalOpen(true);
    } else {
      toast.error("It's not that slot's turn yet.");
    }
  };

  const handleReset = () => {
    onReset();
    setCurrentTurnIndex(-1);
    setLastUpdatedIndex(-1);
    setDraftMode(null);
  };
  
  const handleStart = (mode: DraftMode) => {
    onReset();
    setDraftMode(mode);
    setCurrentTurnIndex(0);
  }

  const handleUndo = () => {
    if (currentTurnIndex <= 0) return;
    
    const prevTurnIndex = currentTurnIndex - 1;
    const turnToUndo = sequence[prevTurnIndex];
    const { team, type, index } = turnToUndo;

    setDraftState(prevState => {
        const teamState = prevState[team];
        const targetArray = type === 'pick' ? teamState.picks : teamState.bans;
        const newArray = targetArray.map((slot, i) => 
            i === index ? { ...slot, champion: null } : slot
        );
        
        return {
            ...prevState,
            [team]: {
                ...teamState,
                [type === 'pick' ? 'picks' : 'bans']: newArray
            }
        };
    });

    setCurrentTurnIndex(prevTurnIndex);
    setLastUpdatedIndex(prevTurnIndex > 0 ? prevTurnIndex - 1 : -1);
    toast.success('Last action undone.');
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface border border-border p-4 shadow-lg">
            <div className="flex items-center gap-4">
                <div className="bg-secondary text-accent w-12 h-12 flex items-center justify-center flex-shrink-0">
                    <Signal size={32} />
                </div>
                <div>
                    <h1 className="font-display text-3xl font-bold text-text-primary">Live Co-Pilot</h1>
                    <p className="text-sm text-text-secondary">Get real-time AI suggestions as you draft in your live game.</p>
                </div>
            </div>
            {isDraftStarted && (
                <div className="flex flex-wrap gap-2">
                    <Button onClick={handleUndo} variant="secondary" disabled={currentTurnIndex <= 0}>Undo Last Action</Button>
                    <Button onClick={handleReset} variant="danger">Reset Draft</Button>
                </div>
            )}
        </div>

        {!isDraftStarted && (
            <div className="text-center bg-surface p-8 border border-border">
                <h2 className="text-2xl font-bold text-text-primary mb-2">Select Draft Mode</h2>
                <p className="text-text-secondary my-4 max-w-md mx-auto">Choose the draft format that matches your game to get started.</p>
                <div className="flex flex-col md:flex-row justify-center items-center gap-6 mt-6">
                    <button onClick={() => handleStart('competitive')} className="p-6 border-2 border-border hover:border-accent w-full md:w-64 text-center group transition-all duration-300 transform hover:-translate-y-1">
                        <Users className="h-10 w-10 mx-auto text-text-secondary group-hover:text-accent transition-colors" />
                        <h3 className="text-xl font-bold text-text-primary mt-2">Competitive</h3>
                        <p className="text-sm text-text-secondary">Standard 5v5 tournament draft with multiple ban phases.</p>
                    </button>
                    <button onClick={() => handleStart('soloq')} className="p-6 border-2 border-border hover:border-accent w-full md:w-64 text-center group transition-all duration-300 transform hover:-translate-y-1">
                        <User className="h-10 w-10 mx-auto text-text-secondary group-hover:text-accent transition-colors" />
                        <h3 className="text-xl font-bold text-text-primary mt-2">Solo Queue</h3>
                        <p className="text-sm text-text-secondary">Standard ranked draft with one initial ban phase.</p>
                    </button>
                </div>
            </div>
        )}

        {isDraftStarted && !draftFinished && (
            <>
                <DraftTimeline sequence={sequence} draftState={draftState} currentTurnIndex={currentTurnIndex} lastUpdatedIndex={lastUpdatedIndex} />
                <TurnIndicator turn={currentTurn} isBotThinking={false} />
            </>
        )}
        
        {draftFinished && (
           <PreGameBriefing draftState={draftState} onReset={handleReset} />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <TeamPanel side="blue" state={draftState.blue} onSlotClick={handleSlotClick} activeSlot={activeSlotForTeam('blue')} isTurnActive={!draftFinished && currentTurn?.team === 'blue'} />
            
            <div className="lg:col-span-1 order-first lg:order-none bg-surface p-4 min-h-[300px] border border-border">
                {currentTurn?.team === 'blue' ? (
                    <SuggestionPanel 
                        suggestions={suggestions} 
                        isLoading={isRecsLoading}
                        onSelect={handleChampionSelect}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-text-secondary">
                        <Eye className="h-12 w-12 mb-2 text-border" />
                        <p>Waiting for opponent's action...</p>
                        <p className="text-xs mt-1">Click the active slot on the Red Team panel to input their choice.</p>
                    </div>
                )}
            </div>

            <TeamPanel side="red" state={draftState.red} onSlotClick={handleSlotClick} activeSlot={activeSlotForTeam('red')} isTurnActive={!draftFinished && currentTurn?.team === 'red'} />
        </div>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Select Champion for ${currentTurn?.team}'s ${currentTurn?.type}`}>
            <div className="h-[550px]">
                <ChampionGrid 
                    onSelect={handleChampionSelect}
                    onQuickLook={setQuickLookChampion} 
                    recommendations={[]}
                    isRecsLoading={false}
                    activeRole={currentTurn?.type === 'pick' ? ROLES[currentTurn.index] : null} 
                    draftState={draftState} 
                    intelData={null}
                    onDragStart={() => {}}
                />
            </div>
        </Modal>
    </div>
  );
};