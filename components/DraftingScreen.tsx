import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Champion, DDragonData, DraftState, Team, AIAnalysis, Aura, DraftHistoryEntry, Role, View, AIChat, SharePayload, ContextualDraftTip } from '../types';
import { geminiService } from '../services/geminiService';
import { ChampionIcon } from './common/ChampionIcon';
import { useProfile } from '../contexts/ProfileContext';
import SaveToPlaybookModal from './common/SaveToPlaybookModal';
import { useDraftStore } from '../store/draftStore';
import { getDraftSequence } from '../data/gameplayConstants';
import { shareService } from '../utils/shareService';
import { Icon } from './common/Icon';
import html2canvas from 'html2canvas';
import ShareableImage from './common/ShareableImage';
import { ChampionGrid } from './common/ChampionGrid';
import { Spinner } from './common/Spinner';
import { isChampion } from '../utils/typeGuards';
import { useNotificationStore } from '../store/notificationStore';
import { DraftTimeline } from './DraftTimeline';
import { PostDraftAnalysisPanel } from './PostDraftAnalysisPanel';
import DraftingRightPanel from './DraftingRightPanel';
import { calculateTeamAnalytics } from '../data/analyticsHelper';

const TeamColumn: React.FC<{
    team: Team;
    draftState: DraftState;
    version: string;
}> = ({ team, draftState, version }) => {
    const teamData = team === 'BLUE' ? draftState.blueTeam : draftState.redTeam;
    const teamColor = team === 'BLUE' ? 'blue' : 'red';
    const sequence = getDraftSequence(draftState.mode);

    const isPickTurnForTeam = (pickIndex: number): boolean => {
        if(draftState.currentTurn >= sequence.length) return false;
        
        let pickCounter = -1;
        for(let i=0; i<=draftState.currentTurn; i++){
            const turn = sequence[i];
            if(turn.team === team && turn.type === 'PICK'){
                pickCounter++;
            }
            if(i === draftState.currentTurn){
                return pickCounter === pickIndex;
            }
        }
        return false;
    }

    return (
        <div className={`flex-1 space-y-3 p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700`}>
            <h2 className={`text-2xl font-display text-center text-${teamColor}-600 dark:text-${teamColor}-400`}>{team} TEAM</h2>
            <div>
                <h3 className="font-semibold text-sm text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 pb-1 mb-2">PICKS</h3>
                <div className="grid grid-cols-5 gap-1.5">
                    {teamData.picks.map((pick, i) => {
                         const isActive = isPickTurnForTeam(i);
                        return (
                             <div key={i} className="flex flex-col items-center gap-1 group relative">
                                <div className={`relative aspect-square w-full bg-slate-100 dark:bg-slate-900/50 rounded-md flex items-center justify-center transition-all duration-200
                                     ${pick.champion ? 'animate-pop-in' : ''}
                                     ${isActive ? 'ring-2 ring-amber-400 animate-pulse' : ''}
                                `}>
                                    <ChampionIcon champion={pick.champion} version={version} isClickable={false} className="w-full h-full" />
                                </div>
                                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wider">{pick.role.substring(0, 3)}</span>
                            </div>
                        )
                    })}
                </div>
            </div>
            <div>
                <h3 className="font-semibold text-sm text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 pb-1 mb-2">BANS</h3>
                <div className="flex justify-center gap-2">
                    {teamData.bans.map((ban, i) => (
                        <div key={i} className={`relative bg-slate-100 dark:bg-slate-900/50 rounded-md flex items-center justify-center`}>
                            <ChampionIcon champion={ban} version={version} isClickable={false} className="grayscale w-12 h-12" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

interface DraftingScreenProps {
  ddragonData: DDragonData;
  setAura: (aura: Aura) => void;
  setView: (view: View) => void;
  setHoverAura: (aura: string | null) => void;
  onNavigateToLesson: (lessonId: string) => void;
}

const DraftingScreen: React.FC<DraftingScreenProps> = ({ ddragonData, setAura, setView, setHoverAura, onNavigateToLesson }) => {
  const { activeProfile, updateHistory, saveToPlaybook } = useProfile();
  const { settings, draftHistory } = activeProfile!;
  
  const draftState = useDraftStore(state => state);
  const { setChampion, undo, setMode, resetDraft } = useDraftStore(state => state.actions);

  const [isAiLoading, setAiLoading] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<{ championName: string; reasoning: string }[] | null>(null);
  const [fullAnalysis, setFullAnalysis] = useState<AIAnalysis | null>(null);
  const [chat, setChat] = useState<AIChat | null>(null);
  const [isPlaybookModalOpen, setPlaybookModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [draftNotes, setDraftNotes] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const shareableRef = useRef<HTMLDivElement>(null);
  
  const addNotification = useNotificationStore(state => state.addNotification);
  const lastSeenRedPicks = useRef<(Champion|null)[]>([]);

  const sequence = getDraftSequence(draftState.mode);
  const isDraftComplete = draftState.currentTurn >= sequence.length;
  
  const blueTeamPicks = useMemo(() => draftState.blueTeam.picks.map(p => p.champion), [draftState.blueTeam.picks]);
  const redTeamPicks = useMemo(() => draftState.redTeam.picks.map(p => p.champion), [draftState.redTeam.picks]);

  useEffect(() => {
    resetDraft(); // Reset on mount to ensure clean state
  }, [resetDraft]);

  useEffect(() => {
    const specialAuras: Aura[] = ['thinking', 'positive', 'negative'];
    if (specialAuras.some(a => document.documentElement.classList.contains(`aura-${a}`))) return;
    
    const blueTeamAnalytics = calculateTeamAnalytics(blueTeamPicks.filter(isChampion));
    const { ad, ap, hybrid } = blueTeamAnalytics.damageProfile;
    const totalPicks = blueTeamPicks.filter(Boolean).length;

    if (totalPicks < 2) setAura('neutral');
    else if (ad > ap + hybrid + 1) setAura('ad-focused');
    else if (ap > ad + hybrid + 1) setAura('ap-focused');
    else setAura('neutral');
  }, [blueTeamPicks, setAura]);


  useEffect(() => {
    const newRedPicks = draftState.redTeam.picks.filter(p => p.champion);
    const lastSeenRedPickObjects = lastSeenRedPicks.current.filter(p => p);

    if (newRedPicks.length > lastSeenRedPickObjects.length) {
        const newPick = newRedPicks[newRedPicks.length - 1];
        if (newPick.champion) {
            const fetchIntel = async () => {
                const intel = await geminiService.getCounterIntelligence(newPick.champion!.name, settings);
                if (intel) {
                    addNotification({
                        type: 'counterIntel',
                        payload: { championName: newPick.champion!.name, intel },
                        duration: 8000,
                    });
                }
            };
            fetchIntel();
        }
    }
    lastSeenRedPicks.current = draftState.redTeam.picks.map(p => p.champion);
  }, [draftState.redTeam.picks, settings, addNotification]);

  useEffect(() => {
    const CONTEXTUAL_TIP_TURNS = [5, 12];
    if (CONTEXTUAL_TIP_TURNS.includes(draftState.currentTurn)) {
        const fetchContextualTip = async () => {
            const tip = await geminiService.getContextualDraftTip(draftState, settings);
            if (tip) {
                addNotification({
                    type: 'contextualTip',
                    payload: tip,
                    duration: 10000,
                });
            }
        };
        fetchContextualTip();
    }
  }, [draftState.currentTurn, draftState, settings, addNotification]);

  const handleChampionSelect = useCallback((champion: Champion) => {
    setChampion(champion);
    setAiSuggestions(null);
  }, [setChampion]);

  const handleGetSuggestion = useCallback(async () => {
    if (isAiLoading || isDraftComplete) return;
    setAiLoading(true);
    setAura('thinking');

    const championMap = new Map(Object.values(ddragonData.champions).map(c => [c.id, c.name]));
    const coreChampionNames = (activeProfile?.riotData?.mastery ?? [])
        .sort((a,b) => b.championPoints - a.championPoints).slice(0, 15)
        .map(m => Object.values(ddragonData.champions).find(c => Number(c.key) === m.championId)?.name)
        .filter((name): name is string => !!name);
    const practiceChampionNames = settings.championPool.map(id => championMap.get(id)).filter((name): name is string => !!name);
        
    const { team, type } = sequence[draftState.currentTurn];
    const suggestions = await geminiService.getDraftSuggestion(
        draftState, team, type, 'ANY', settings, coreChampionNames, practiceChampionNames
    );
    setAiSuggestions(suggestions?.suggestions || []);
    setAiLoading(false);
    setAura('neutral');
  }, [isAiLoading, isDraftComplete, draftState, sequence, settings, setAura, ddragonData.champions, activeProfile]);

  const handleGetFullAnalysis = useCallback(async () => {
    if (isAiLoading || !isDraftComplete) return;
    setAiLoading(true);
    setAura('thinking');
    setChat(null);
    const analysis = await geminiService.getFullDraftAnalysis(draftState, settings);
    setFullAnalysis(analysis);
    
    if (analysis) {
        const chatSession = geminiService.startAnalysisChat(analysis, settings);
        setChat({ session: chatSession, history: [] });
    }

    setAiLoading(false);
    if (analysis?.strategicFocus.toLowerCase().includes('blue team has a clear advantage')) setAura('positive');
    else if (analysis?.strategicFocus.toLowerCase().includes('red team has a clear advantage')) setAura('negative');
    else setAura('neutral');
  }, [isAiLoading, isDraftComplete, draftState, settings, setAura]);

  const handleSendChatMessage = async (message: string) => {
    if (!chat || !message.trim() || isChatLoading) return;
    
    setIsChatLoading(true);
    setChat(prev => prev ? ({ ...prev, history: [...prev.history, { isUser: true, text: message }] }) : null);
    
    try {
        const response = await geminiService.continueChat(chat.session, message);
        setChat(prev => prev ? ({ ...prev, history: [...prev.history, { isUser: false, text: response.text }] }) : null);
    } catch (e) {
        console.error("Chat error:", e);
         setChat(prev => prev ? ({ ...prev, history: [...prev.history, { isUser: false, text: "Sorry, I encountered an error." }] }) : null);
    } finally {
        setIsChatLoading(false);
    }
  };
  
  const handleKeywordClick = useCallback((lessonId: string) => { onNavigateToLesson(lessonId) }, [onNavigateToLesson]);

  const resetAll = (mode: 'SOLO_QUEUE' | 'COMPETITIVE') => {
    setMode(mode);
    setFullAnalysis(null);
    setAiSuggestions(null);
    setAura('neutral');
    setChat(null);
    setCopied(false);
    setDraftNotes('');
    useNotificationStore.getState().clearAll();
    lastSeenRedPicks.current = [];
  };

  const handleUndo = () => {
    undo();
    setFullAnalysis(null);
    setAiSuggestions(null);
    setAura('neutral');
    setChat(null);
    setCopied(false);
  };

  const handleSaveToHistory = () => {
    if (!fullAnalysis) return;
    const newHistoryEntry: DraftHistoryEntry = {
        id: new Date().toISOString(),
        date: new Date().toISOString(),
        analysis: fullAnalysis,
        draftState: { ...draftState, pickedChampions: new Set(Array.from(draftState.pickedChampions)) },
        inDraftNotes: draftNotes,
    };
    const newHistory = [newHistoryEntry, ...draftHistory].slice(0, 50);
    updateHistory(newHistory);
    addNotification({ type: 'genericInfo', payload: { title: 'Draft saved to History!'}, duration: 3000 });
  };
  
  const handleSaveToPlaybook = (name: string, description: string) => {
    if (!fullAnalysis) return;
    saveToPlaybook({
        name,
        description,
        analysis: fullAnalysis,
        draftState: { ...draftState, pickedChampions: new Set(Array.from(draftState.pickedChampions)) },
    });
    setPlaybookModalOpen(false);
     addNotification({ type: 'genericInfo', payload: { title: 'Strategy saved to Playbook!' }, duration: 3000 });
  };

  const handleShare = async () => {
      if (!fullAnalysis) return;
      const payload: SharePayload = { draftState, analysis: fullAnalysis };
      try {
          const encoded = await shareService.encodeForUrl(payload);
          const url = `${window.location.origin}${window.location.pathname}?share=${encoded}`;
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
      } catch (e) {
          console.error("Failed to create share link:", e);
          alert("Could not create share link.");
      }
  };

  const handleExportImage = async () => {
    if (!shareableRef.current || !fullAnalysis) return;
    setIsExporting(true);
    try {
        const canvas = await html2canvas(shareableRef.current, { scale: 2, useCORS: true, backgroundColor: 'rgb(15 23 42)' });
        const image = canvas.toDataURL('image/png', 1.0);
        const link = document.createElement('a');
        link.href = image;
        link.download = `draftwise-analysis-${new Date().toISOString().split('T')[0]}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error("Error exporting image:", error);
        alert("Sorry, there was an error exporting the image.");
    } finally {
        setIsExporting(false);
    }
  };

  const currentActionInfo = useMemo(() => {
    if(isDraftComplete) return "Draft Complete";
    const { team, type } = sequence[draftState.currentTurn];
    const teamColor = team === 'BLUE' ? 'text-blue-500' : 'text-red-500';
    return <span className="flex items-center gap-2">{team === 'BLUE' ? '🔷' : '🔴'} <span className={teamColor}>{team}</span> Team's Turn to <span className="font-bold">{type}</span></span>;
  }, [draftState.currentTurn, isDraftComplete, sequence]);
  
  const handleUseSuggestion = (championName: string) => {
    const champion = Object.values(ddragonData.champions).find(c => c.name === championName);
    if (champion) handleChampionSelect(champion);
  };

  return (
    <div className="space-y-4">
        {draftState.currentTurn === 0 && !isDraftComplete ? (
            <div className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col items-center gap-3">
                <h2 className="text-2xl font-display">Select Draft Mode</h2>
                <div className="flex space-x-4">
                    <button onClick={() => resetAll('COMPETITIVE')} className={`px-6 py-2 rounded-md font-semibold transition-all ${draftState.mode === 'COMPETITIVE' ? 'bg-indigo-600 text-white ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-900 dark:ring-offset-slate-800' : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'}`}>Competitive</button>
                    <button onClick={() => resetAll('SOLO_QUEUE')} className={`px-6 py-2 rounded-md font-semibold transition-all ${draftState.mode === 'SOLO_QUEUE' ? 'bg-indigo-600 text-white ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-900 dark:ring-offset-slate-800' : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'}`}>Solo Queue</button>
                </div>
            </div>
        ) : (
            <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                <h2 className="text-2xl md:text-3xl font-display">{currentActionInfo}</h2>
                <div className="flex space-x-2">
                    <button onClick={() => resetAll(draftState.mode)} className="px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 transition-all duration-200 active:scale-95 transform text-sm">Reset</button>
                    <button onClick={handleUndo} className="px-4 py-2 bg-slate-500 text-white rounded-md hover:bg-slate-600 transition-all duration-200 active:scale-95 text-sm" disabled={draftState.history.length === 0}>Undo</button>
                </div>
            </div>
        )}
        
        {draftState.mode === 'COMPETITIVE' && <DraftTimeline sequence={sequence} currentTurn={draftState.currentTurn} />}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 space-y-4">
                <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                    <TeamColumn team="BLUE" draftState={draftState} version={ddragonData.version} />
                    <TeamColumn team="RED" draftState={draftState} version={ddragonData.version} />
                </div>
                 {!isDraftComplete && (
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                        <ChampionGrid
                            ddragonData={ddragonData}
                            onChampionSelect={handleChampionSelect}
                            pickedChampionIds={draftState.pickedChampions}
                            iconClassName="w-full aspect-square"
                        />
                    </div>
                 )}
            </div>

            <div className="lg:col-span-1">
                {isDraftComplete ? (
                    <div className="sticky top-24">
                        {fullAnalysis ? (
                            <PostDraftAnalysisPanel
                                analysis={fullAnalysis}
                                draftState={draftState}
                                chat={chat}
                                ddragonData={ddragonData}
                                draftNotes={draftNotes}
                                isChatLoading={isChatLoading}
                                isExporting={isExporting}
                                copied={copied}
                                onKeywordClick={handleKeywordClick}
                                handleExportImage={handleExportImage}
                                handleSaveToHistory={handleSaveToHistory}
                                handleSendChatMessage={handleSendChatMessage}
                                handleShare={handleShare}
                                setDraftNotes={setDraftNotes}
                                setPlaybookModalOpen={setPlaybookModalOpen}
                            />
                        ) : (
                             <div className="text-center p-8 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                <h3 className="text-3xl font-display">Draft Complete!</h3>
                                <p className="text-slate-500 dark:text-slate-400 my-4">Ready for the Oracle's in-depth analysis?</p>
                                <button onClick={handleGetFullAnalysis} disabled={isAiLoading} className="px-6 py-4 bg-primary-gradient text-white rounded-lg transition-all duration-200 flex items-center justify-center mx-auto disabled:opacity-50 text-lg font-semibold active:scale-95 transform shadow-lg hover:shadow-xl">
                                    {isAiLoading ? <Spinner size="h-6 w-6 mr-3" /> : <Icon name="brain" className="h-6 w-6 mr-3" />}
                                    {isAiLoading ? 'Analyzing...' : 'Generate Analysis'}
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="sticky top-24 h-[calc(100vh-7rem)]">
                        <DraftingRightPanel
                            isAiLoading={isAiLoading}
                            bluePicks={blueTeamPicks}
                            redPicks={redTeamPicks}
                            handleGetSuggestion={handleGetSuggestion}
                            aiSuggestions={aiSuggestions}
                            ddragonData={ddragonData}
                            handleUseSuggestion={handleUseSuggestion}
                        />
                    </div>
                )}
            </div>
        </div>
        
        <SaveToPlaybookModal
            isOpen={isPlaybookModalOpen}
            onClose={() => setPlaybookModalOpen(false)}
            onSave={handleSaveToPlaybook}
            isLoading={isAiLoading}
        />
        {fullAnalysis && (
            <div ref={shareableRef} style={{ position: 'fixed', top: '-9999px', left: 0 }}>
              <ShareableImage
                draftState={draftState}
                analysis={fullAnalysis}
                ddragonData={ddragonData}
              />
            </div>
        )}
    </div>
  );
};

export default DraftingScreen;