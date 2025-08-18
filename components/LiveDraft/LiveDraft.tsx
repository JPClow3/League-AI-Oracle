import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { DraftState, Champion, TeamSide, ChampionLite, ChampionSuggestion, PlaybookPlusDossier } from '../../types';
import { CHAMPIONS, CHAMPIONS_LITE, ROLES } from '../../constants';
import { getChampionSuggestions, generatePlaybookPlusDossier, generateDraftName } from '../../services/geminiService';
import { TeamPanel } from '../DraftLab/TeamPanel';
import { ChampionGrid } from '../DraftLab/ChampionGrid';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { TurnIndicator } from '../Arena/TurnIndicator';
import { DraftTimeline } from '../Arena/DraftTimeline';
import { COMPETITIVE_SEQUENCE } from '../Arena/arenaConstants';
import toast from 'react-hot-toast';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useSettings } from '../../hooks/useSettings';
import { usePlaybook } from '../../hooks/usePlaybook';
import { QuickLookPanel } from '../DraftLab/QuickLookPanel';
import { Loader } from '../common/Loader';

// A component to display suggestions cleanly and quickly for live drafting.
const SuggestionPanel: React.FC<{ suggestions: (ChampionSuggestion & { champion: ChampionLite })[], isLoading: boolean, onSelect: (champion: ChampionLite) => void }> = ({ suggestions, isLoading, onSelect }) => {
    if (isLoading) {
        return <div className="p-4 text-center text-gray-400 animate-pulse">Getting suggestions...</div>;
    }
    if (suggestions.length === 0 && !isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p>Awaiting your turn to provide suggestions.</p>
             </div>
        );
    }

    return (
        <div className="space-y-2">
            <h3 className="text-lg font-bold text-yellow-300">AI Co-Pilot Suggestions</h3>
            {suggestions.map(rec => (
                <button 
                    key={rec.champion.id} 
                    onClick={() => onSelect(rec.champion)}
                    className="w-full text-left p-2 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-3"
                >
                    <img src={rec.champion.image} alt={rec.champion.name} className="w-10 h-10 rounded-md flex-shrink-0" />
                    <div>
                        <p className="font-bold text-white">{rec.championName}</p>
                        <p className="text-xs text-gray-300">{rec.reasoning}</p>
                    </div>
                </button>
            ))}
        </div>
    );
};

const DossierDisplay: React.FC<{ dossier: PlaybookPlusDossier }> = ({ dossier }) => (
    <div className="space-y-4">
        <h3 className="text-xl font-bold text-yellow-300 mb-2">Pre-Game Briefing</h3>
        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 space-y-3 text-sm">
            <div>
                <h4 className="font-semibold text-cyan-300">Win Condition</h4>
                <p className="text-gray-300">{dossier.winCondition}</p>
            </div>
             <div>
                <h4 className="font-semibold text-cyan-300">Early Game (0-15m)</h4>
                <p className="text-gray-300">{dossier.earlyGame}</p>
            </div>
             <div>
                <h4 className="font-semibold text-cyan-300">Mid Game (15-25m)</h4>
                <p className="text-gray-300">{dossier.midGame}</p>
            </div>
             <div>
                <h4 className="font-semibold text-cyan-300">Teamfighting</h4>
                <p className="text-gray-300">{dossier.teamfighting}</p>
            </div>
        </div>
    </div>
);

const PreGameBriefing: React.FC<{ draftState: DraftState, onReset: () => void }> = ({ draftState, onReset }) => {
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
        return <div className="text-center bg-slate-800 p-8 rounded-lg border border-slate-700"><Loader messages={['Analyzing final draft...', 'Generating strategic dossier...']} /></div>;
    }

    if (error) {
         return <div className="text-center bg-red-900/30 p-8 rounded-lg border border-red-500/50 text-red-300">{error}</div>;
    }

    return (
        <div className="text-center bg-slate-800 p-8 rounded-lg border border-slate-700 space-y-4">
            {dossier && <DossierDisplay dossier={dossier} />}
            <p className="text-gray-300 my-4 max-w-md mx-auto">Review your pre-game briefing. You can save this draft to your Playbook for later analysis.</p>
            <div className="flex flex-wrap justify-center gap-4">
                <Button onClick={handleSave} variant="primary-glow" disabled={isSaving}>
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

export const LiveDraft: React.FC<LiveDraftProps> = ({ draftState, setDraftState, onReset }) => {
  const [currentTurnIndex, setCurrentTurnIndex] = useState(-1); // -1 means not started
  const [lastUpdatedIndex, setLastUpdatedIndex] = useState(-1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quickLookChampion, setQuickLookChampion] = useState<ChampionLite | null>(null);
  
  const [suggestions, setSuggestions] = useState<(ChampionSuggestion & { champion: ChampionLite })[]>([]);
  const [isRecsLoading, setIsRecsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const { profile } = useUserProfile();
  const { settings } = useSettings();

  const isDraftStarted = currentTurnIndex >= 0;
  const draftFinished = currentTurnIndex >= COMPETITIVE_SEQUENCE.length;
  const currentTurn = isDraftStarted && !draftFinished ? COMPETITIVE_SEQUENCE[currentTurnIndex] : null;

  const handleChampionSelect = useCallback((championLite: ChampionLite) => {
    if (!currentTurn) return;
    
    const champion = CHAMPIONS.find(c => c.id === championLite.id);
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
  }, [currentTurn, setDraftState, currentTurnIndex]);
  
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
        .map(id => CHAMPIONS_LITE.find(c => c.id === id)?.name)
        .filter((name): name is string => !!name);

    getChampionSuggestions(draftState, currentTurn, settings.primaryRole, profile.skillLevel, favoriteChampionNames, 'standard', controller.signal)
        .then(suggs => {
            if (controller.signal.aborted) return;
            const enriched = suggs.map(s => ({ ...s, champion: CHAMPIONS_LITE.find(c => c.name.toLowerCase() === s.championName.toLowerCase())! })).filter(s => s.champion);
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
  }, [currentTurnIndex, draftState, settings, profile.skillLevel]);


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
  };
  
  const handleStart = () => {
    onReset();
    setCurrentTurnIndex(0);
  }

  const activeSlotForTeam = (team: TeamSide) => {
      if (currentTurn?.team === team) {
          return { type: currentTurn.type, index: currentTurn.index };
      }
      return null;
  }

  return (
    <div className="space-y-6">
        <QuickLookPanel champion={quickLookChampion} onClose={() => setQuickLookChampion(null)} />
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-4 rounded-xl shadow-lg">
            <div className="flex items-center gap-4">
                <div className="bg-slate-700/50 text-blue-300 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1-3m-3.5-3.5L2 12l3-1 .5.5m9.5-3.5L20 9l-3 1-1-1m-4-5l1 3-1 3m-4 5l1 3-1 3" /></svg>
                </div>
                <div>
                    <h1 className="font-display text-3xl font-bold text-white">Live Co-Pilot</h1>
                    <p className="text-sm text-gray-400">Get real-time AI suggestions as you draft in your live game.</p>
                </div>
            </div>
            {isDraftStarted && (
                <div className="flex flex-wrap gap-2">
                    <Button onClick={handleReset} variant="danger">Reset Draft</Button>
                </div>
            )}
        </div>

        {!isDraftStarted && (
            <div className="text-center bg-slate-800 p-8 rounded-lg border border-slate-700">
                <p className="text-gray-300 my-4 max-w-md mx-auto">Click below to start a new live draft session. Input picks and bans for both teams as they happen to get real-time advice for your team.</p>
                <Button onClick={handleStart} variant="primary-glow" className="text-lg px-8 py-4">Start Live Draft</Button>
            </div>
        )}

        {isDraftStarted && !draftFinished && (
            <>
                <DraftTimeline draftState={draftState} currentTurnIndex={currentTurnIndex} lastUpdatedIndex={lastUpdatedIndex} />
                <TurnIndicator turn={currentTurn} isBotThinking={false} />
            </>
        )}
        
        {draftFinished && (
           <PreGameBriefing draftState={draftState} onReset={handleReset} />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <TeamPanel side="blue" state={draftState.blue} onSlotClick={handleSlotClick} activeSlot={activeSlotForTeam('blue')} />
            
            <div className="lg:col-span-1 order-first lg:order-none bg-slate-800 p-4 rounded-lg min-h-[300px]">
                {currentTurn?.team === 'blue' ? (
                    <SuggestionPanel 
                        suggestions={suggestions} 
                        isLoading={isRecsLoading}
                        onSelect={handleChampionSelect}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        <p>Waiting for opponent's action...</p>
                        <p className="text-xs mt-1">Click the active slot on the Red Team panel to input their choice.</p>
                    </div>
                )}
            </div>

            <TeamPanel side="red" state={draftState.red} onSlotClick={handleSlotClick} activeSlot={activeSlotForTeam('red')} />
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
                />
            </div>
        </Modal>
    </div>
  );
};