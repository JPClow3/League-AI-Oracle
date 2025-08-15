import React, { useState, useEffect, useCallback } from 'react';
import type { DraftState, Champion, TeamSide, ChampionLite, ChampionSuggestion } from '../../types';
import { CHAMPIONS, CHAMPIONS_LITE } from '../../constants';
import { getChampionSuggestions } from '../../services/geminiService';
import { TeamPanel } from '../DraftLab/TeamPanel';
import { ChampionGrid } from '../DraftLab/ChampionGrid';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { TurnIndicator } from './TurnIndicator';
import { DraftTimeline } from './DraftTimeline';
import { COMPETITIVE_SEQUENCE } from './arenaConstants';
import toast from 'react-hot-toast';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useSettings } from '../../hooks/useSettings';
import { usePlaybook } from '../../hooks/usePlaybook';

interface LiveArenaProps {
  draftState: DraftState;
  setDraftState: React.Dispatch<React.SetStateAction<DraftState>>;
  onReset: () => void;
  onNavigateToForge: (draft: DraftState) => void;
}

export const LiveArena: React.FC<LiveArenaProps> = ({ draftState, setDraftState, onReset, onNavigateToForge }) => {
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [lastUpdatedIndex, setLastUpdatedIndex] = useState(-1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [draftName, setDraftName] = useState('');
  const { profile, addSP, completeMission } = useUserProfile();
  const { settings } = useSettings();
  const { addEntry: addPlaybookEntry } = usePlaybook();

  const isDraftStarted = currentTurnIndex > 0;
  const draftFinished = currentTurnIndex >= COMPETITIVE_SEQUENCE.length;
  const currentTurn = !draftFinished ? COMPETITIVE_SEQUENCE[currentTurnIndex] : null;

  useEffect(() => {
    if (draftFinished) {
        // Award SP for completing the draft
        addSP(100);
        toast.success("+100 SP for completing an Arena draft!");
        if (completeMission('w1')) {
            toast.success("Mission Complete: Arena Contender!");
        }
    }
  }, [draftFinished, addSP, completeMission]);

  const getAvailableChampions = useCallback(() => {
    const allPicksAndBans = [
      ...draftState.blue.picks, ...draftState.red.picks,
      ...draftState.blue.bans, ...draftState.red.bans
    ];
    const pickedIds = new Set(allPicksAndBans.filter(s => s.champion).map(s => s.champion!.id));
    return CHAMPIONS_LITE.filter(c => !pickedIds.has(c.id));
  }, [draftState]);

  const makeBotSelection = useCallback(async () => {
    if (!currentTurn) return;

    const botLogicLevel = ['Iron Analyst', 'Bronze Tactician'].includes(profile.rank) ? 'Beginner' : 'Advanced';
    let botPick: ChampionLite | undefined;
    const available = getAvailableChampions();
    if (available.length === 0) {
        console.error("Bot has no champions to pick from.");
        return null;
    }

    if (botLogicLevel === 'Advanced') {
        try {
            // Bot uses a neutral 'All' role preference and no mastery for its suggestions
            const suggestions = await getChampionSuggestions(draftState, currentTurn, 'All', []);
            const suggestedChamp = suggestions.length > 0 ? available.find(c => c.name.toLowerCase() === suggestions[0].championName.toLowerCase()) : undefined;
            botPick = suggestedChamp || available[Math.floor(Math.random() * available.length)];
        } catch (e) {
            console.error("Bot AI failed, picking random", e);
            botPick = available[Math.floor(Math.random() * available.length)];
        }
    } else {
        botPick = available[Math.floor(Math.random() * available.length)];
    }
    
    return CHAMPIONS.find(c => c.id === botPick?.id);
  }, [draftState, currentTurn, profile.rank, getAvailableChampions]);
  
  const handleChampionSelect = useCallback((champion: Champion) => {
    if (!currentTurn) return;

    const { team, type, index } = currentTurn;
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

    setIsModalOpen(false);
    setLastUpdatedIndex(currentTurnIndex);
    setCurrentTurnIndex(prev => prev + 1);
  }, [currentTurn, setDraftState, currentTurnIndex]);

  const handleChampionSelectLite = useCallback((championLite: ChampionLite) => {
    const champion = CHAMPIONS.find(c => c.id === championLite.id);
    if (champion) {
        handleChampionSelect(champion);
    } else {
        console.error("Selected champion not found in full list:", championLite.id);
    }
  }, [handleChampionSelect]);

  useEffect(() => {
    if (draftFinished || !currentTurn || currentTurn.team === 'blue') {
      setIsBotThinking(false);
      return;
    }

    setIsBotThinking(true);
    const timer = setTimeout(async () => {
      const botChampion = await makeBotSelection();
      if (botChampion) {
          handleChampionSelect(botChampion);
      } else {
          setLastUpdatedIndex(currentTurnIndex);
          setCurrentTurnIndex(prev => prev + 1); // Skip turn if no champ found
      }
    }, 1500 + Math.random() * 1000); // Realistic delay

    return () => clearTimeout(timer);
  }, [currentTurnIndex, draftFinished, currentTurn, makeBotSelection, handleChampionSelect]);

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
  
  const handleSaveToPlaybook = () => {
    setDraftName('');
    setIsSaveModalOpen(true);
  };

  const confirmSaveToPlaybook = () => {
    if (draftName.trim()) {
        if (addPlaybookEntry(draftName.trim(), draftState, null)) {
             setIsSaveModalOpen(false);
             addSP(25);
             if(completeMission('w2')) {
                toast.success("Mission Complete: Expand the Playbook!");
             }
        }
    }
  };


  const activeSlotForTeam = (team: TeamSide) => {
      if (currentTurn?.team === team) {
          return { type: currentTurn.type, index: currentTurn.index };
      }
      return null;
  }

  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-4 rounded-xl shadow-lg">
             <div className="flex items-center gap-4">
                <div className="bg-slate-700/50 text-blue-300 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                    <h1 className="font-display text-3xl font-bold text-white">Drafting Arena</h1>
                    <p className="text-sm text-gray-400">Practice the draft against a bot in a simulated environment.</p>
                </div>
            </div>
            <div className="flex flex-wrap gap-2">
                <Button onClick={handleSaveToPlaybook} variant="secondary" disabled={!isDraftStarted}>Save to Playbook</Button>
                <Button onClick={handleReset} variant="danger">Reset</Button>
            </div>
        </div>

        <DraftTimeline draftState={draftState} currentTurnIndex={currentTurnIndex} lastUpdatedIndex={lastUpdatedIndex} />

        <TurnIndicator turn={currentTurn} isBotThinking={isBotThinking} />

        {draftFinished && (
            <div className="text-center bg-slate-800 p-8 rounded-lg border border-slate-700">
                <p className="text-gray-300 my-4 max-w-md mx-auto">Review the final compositions below, save to your Playbook, or send to the Draft Lab for a full AI analysis.</p>
                <div className="flex flex-wrap justify-center gap-4">
                    <Button onClick={handleAnalyze} variant="primary-glow">Analyze in Lab</Button>
                    <Button onClick={handleSaveToPlaybook} variant="secondary">Save to Playbook</Button>
                    <Button onClick={handleReset} variant="secondary">New Arena Draft</Button>
                </div>
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TeamPanel side="blue" state={draftState.blue} onSlotClick={handleSlotClick} activeSlot={activeSlotForTeam('blue')} />
            <TeamPanel side="red" state={draftState.red} onSlotClick={handleSlotClick} activeSlot={activeSlotForTeam('red')} />
        </div>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Select your Champion">
            <div className="h-[550px]">
                <ChampionGrid champions={getAvailableChampions()} onSelect={handleChampionSelectLite} recommendations={[]} isRecsLoading={false} activeRole={null} />
            </div>
        </Modal>

        <Modal 
            isOpen={isSaveModalOpen} 
            onClose={() => {
                setIsSaveModalOpen(false);
                setDraftName('');
            }} 
            title="Save Arena Draft to Playbook"
        >
            <div className="p-4 space-y-4">
                <label htmlFor="draftName" className="block text-sm font-medium text-gray-300">Draft Name</label>
                <input
                    id="draftName"
                    type="text"
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    placeholder="e.g., Arena Practice vs Dive"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={() => { setIsSaveModalOpen(false); setDraftName(''); }}>Cancel</Button>
                    <Button variant="primary" onClick={confirmSaveToPlaybook} disabled={!draftName.trim()}>Save</Button>
                </div>
            </div>
      </Modal>
    </div>
  );
};
