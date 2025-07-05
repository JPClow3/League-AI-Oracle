import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { DDragonData, Champion, AIAnalysis, Aura, Role, View, DraftState, Team } from '../types';
import { geminiService } from '../services/geminiService';
import { ChampionIcon } from './common/ChampionIcon';
import { Spinner } from './common/Spinner';
import TeamAnalyticsDashboard from './TeamAnalyticsDashboard';
import { useProfile } from '../contexts/ProfileContext';
import SaveToPlaybookModal from './common/SaveToPlaybookModal';
import FullAnalysisDisplay from './common/FullAnalysisDisplay';
import { Icon } from './common/Icon';
import { useDraftStore } from '../store/draftStore';
import { calculateTeamAnalytics } from '../data/analyticsHelper';
import CompositionAlert, { Alert } from './common/CompositionAlert';
import { SYNERGY_DATA } from '../data/synergyData';
import { ChampionGrid } from './common/ChampionGrid';

interface DraftLabProps {
    ddragonData: DDragonData;
    setAura: (aura: Aura) => void;
    setView: (view: View) => void;
    setHoverAura: (aura: string | null) => void;
}

const checkSynergies = (team: Champion[]): Alert[] => {
    const alerts: Alert[] = [];
    if (team.length < 2) return alerts;

    const teamChampionNames = new Set(team.map(c => c.name));

    for (const synergy of SYNERGY_DATA) {
        if (synergy.champions.every(name => teamChampionNames.has(name))) {
            alerts.push({
                type: 'synergy',
                title: synergy.name,
                message: synergy.description
            });
        }
    }
    return alerts;
};

const checkClashes = (team: Champion[]): Alert[] => {
    const alerts: Alert[] = [];
    if (team.length < 3) return alerts;

    // Damage type clash
    const adCount = team.filter(c => c.damageType === 'AD').length;
    const apCount = team.filter(c => c.damageType === 'AP').length;
    if (team.length >= 4) {
        if (adCount >= 4) {
            alerts.push({
                type: 'clash',
                title: 'Skewed Damage Profile',
                message: 'Your team is heavily physical damage. Consider adding a magic damage source to be harder to itemize against.'
            });
        }
        if (apCount >= 4) {
            alerts.push({
                type: 'clash',
                title: 'Skewed Damage Profile',
                message: 'Your team is heavily magic damage. Consider adding a physical damage source.'
            });
        }
    }
    
    // Frontline clash
    const frontlineCount = team.filter(c => c.championClass === 'Tank' || c.championClass === 'Fighter').length;
    if (team.length >= 4 && frontlineCount === 0) {
        alerts.push({
            type: 'clash',
            title: 'No Frontline',
            message: 'Your team lacks a tank or fighter. It will be vulnerable to enemy engage and have trouble protecting carries.'
        });
    }

    return alerts;
};


const DraftLab: React.FC<DraftLabProps> = ({ ddragonData, setAura, setView, setHoverAura }) => {
    const { activeProfile, saveToPlaybook } = useProfile();
    const { settings } = activeProfile!;
    const draftState = useDraftStore(state => state);
    const { setChampionInLab, swapChampions, resetDraft } = useDraftStore(state => state.actions);

    const [selectedSlot, setSelectedSlot] = useState<{ team: 'BLUE' | 'RED'; index: number } | null>(null);
    const [isAiLoading, setAiLoading] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
    const [isPlaybookModalOpen, setPlaybookModalOpen] = useState(false);
    const [swapState, setSwapState] = useState<{ team: 'BLUE' | 'RED'; index: number } | null>(null);
    const [blueAlerts, setBlueAlerts] = useState<Alert[]>([]);
    const [redAlerts, setRedAlerts] = useState<Alert[]>([]);
    
    const blueTeamPicks = useMemo(() => draftState.blueTeam.picks.map(p => p.champion), [draftState.blueTeam.picks]);
    const redTeamPicks = useMemo(() => draftState.redTeam.picks.map(p => p.champion), [draftState.redTeam.picks]);

    useEffect(() => {
        const blueChampions = blueTeamPicks.filter((c): c is Champion => c !== null);
        const redChampions = redTeamPicks.filter((c): c is Champion => c !== null);

        setBlueAlerts([...checkSynergies(blueChampions), ...checkClashes(blueChampions)]);
        setRedAlerts([...checkSynergies(redChampions), ...checkClashes(redChampions)]);
        
        const specialAuras: Aura[] = ['thinking', 'positive', 'negative'];
        if (specialAuras.some(a => document.documentElement.classList.contains(`aura-${a}`))) return;
        
        const blueTeamAnalytics = calculateTeamAnalytics(blueChampions);
        const { ad, ap, hybrid } = blueTeamAnalytics.damageProfile;
        const totalPicks = blueChampions.length;

        if (totalPicks < 2) setAura('neutral');
        else if (ad > ap + hybrid + 1) setAura('ad-focused');
        else if (ap > ad + hybrid + 1) setAura('ap-focused');
        else setAura('neutral');
        
    }, [blueTeamPicks, redTeamPicks, setAura]);

    useEffect(() => {
        resetDraft();
        setAura('neutral');
    }, [resetDraft, setAura]);

    const handleSlotSelect = (team: 'BLUE' | 'RED', index: number) => {
        setSelectedSlot({ team, index });
        setSwapState(null);
    };
    
    const handlePickClick = (team: 'BLUE' | 'RED', index: number) => {
        const teamPicks = team === 'BLUE' ? draftState.blueTeam.picks : draftState.redTeam.picks;
        if (!teamPicks[index].champion) return;

        if (!swapState) {
            setSwapState({ team, index });
        } else {
            if (swapState.team === team) {
                if (swapState.index === index) {
                    setSwapState(null);
                } else {
                    swapChampions(team, swapState.index, index);
                    setSwapState(null);
                }
            } else {
                setSwapState(null);
            }
        }
    };


    const handleChampionSelect = useCallback((champion: Champion) => {
        if (!selectedSlot) return;
        setChampionInLab(selectedSlot.team, selectedSlot.index, champion);
        setSelectedSlot(null);
        setAiAnalysis(null);
    }, [selectedSlot, setChampionInLab]);
    
    const handleGetAnalysis = useCallback(async () => {
      const isComplete = draftState.blueTeam.picks.every(c => c.champion) && draftState.redTeam.picks.every(c => c.champion);
      if (!isComplete) return;

      setAiLoading(true);
      setAura('thinking');
      const analysis = await geminiService.getFullDraftAnalysis(draftState, settings);
      setAiAnalysis(analysis);
      setAiLoading(false);
      
      if (analysis?.strategicFocus.toLowerCase().includes('blue team has a clear advantage')) setAura('positive');
      else if (analysis?.strategicFocus.toLowerCase().includes('red team has a clear advantage')) setAura('negative');
      else setAura('neutral');

    }, [draftState, settings, setAura]);
    
    const handleSaveToPlaybook = (name: string, description: string) => {
        if (!aiAnalysis) return;
        
        const stateToSave = { ...draftState, analysis: aiAnalysis, pickedChampions: new Set(Array.from(draftState.pickedChampions)) };

        saveToPlaybook({
            name, description, analysis: aiAnalysis, draftState: stateToSave,
        });
        setPlaybookModalOpen(false);
        alert("Strategy saved to Playbook!");
    };
    
    const handleChampionHover = useCallback((champion: Champion) => {
        if (!selectedSlot) return;

        const teamPicks = (selectedSlot.team === 'BLUE' ? blueTeamPicks : redTeamPicks).filter((c): c is Champion => c !== null);
        const teamAnalytics = calculateTeamAnalytics(teamPicks);
        const { ad, ap } = teamAnalytics.damageProfile;

        if (champion.engagePotential === 'High') {
            setHoverAura('engage');
        } else if (teamPicks.length >= 2 && ad > ap + 1 && champion.damageType === 'AP') {
            setHoverAura('positive');
        } else if (teamPicks.length >= 2 && ap > ad + 1 && champion.damageType === 'AD') {
            setHoverAura('positive');
        }
    }, [selectedSlot, blueTeamPicks, redTeamPicks, setHoverAura]);

    const handleChampionLeave = useCallback(() => {
        setHoverAura(null);
    }, [setHoverAura]);

    const isDraftComplete = draftState.blueTeam.picks.every(c => c.champion) && draftState.redTeam.picks.every(c => c.champion);

    const handleKeywordClick = useCallback((lessonId: string) => {
        setView(View.LESSONS);
    }, [setView]);

    return (
        <div className="space-y-4 relative" onClick={() => swapState && setSwapState(null)}>
            <div className="text-center">
                <h2 className="text-4xl font-display">Draft Lab</h2>
                <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">Freely build team compositions and get real-time feedback and analysis. Right-click champions to manage your pool.</p>
            </div>
            
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 min-h-[6rem]">
                <div className="space-y-2">{blueAlerts.map((alert, i) => <CompositionAlert key={`b-${alert.title}-${i}`} {...alert} onDismiss={() => setBlueAlerts(a => a.filter(al => al.title !== alert.title))} />)}</div>
                <div className="space-y-2">{redAlerts.map((alert, i) => <CompositionAlert key={`r-${alert.title}-${i}`} {...alert} onDismiss={() => setRedAlerts(a => a.filter(al => al.title !== alert.title))} />)}</div>
            </div>

            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4" onClick={e => e.stopPropagation()}>
                {(['BLUE', 'RED'] as const).map(team => (
                    <div key={team} className={`flex-1 p-4 bg-white/50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700`}>
                        <h3 className={`text-2xl font-display text-center text-${team.toLowerCase()}-600 dark:text-${team.toLowerCase()}-400`}>{team} TEAM</h3>
                        <div className="grid grid-cols-5 gap-2 mt-4">
                            {draftState[team === 'BLUE' ? 'blueTeam' : 'redTeam'].picks.map((pick, index) => {
                                const isSwappingThis = swapState?.team === team && swapState?.index === index;
                                const isSwapTarget = swapState && swapState.team === team && !isSwappingThis;
                                const canBeClicked = !!pick.champion;
                                return (
                                    <div 
                                        key={index}
                                        onClick={canBeClicked ? () => handlePickClick(team, index) : () => handleSlotSelect(team, index)}
                                        className={`group relative w-24 h-24 bg-slate-100 dark:bg-slate-900/50 rounded flex items-center justify-center transition-all duration-200 
                                            ${selectedSlot?.team === team && selectedSlot?.index === index ? 'ring-2 ring-amber-500' : ''}
                                            ${isSwappingThis ? 'ring-4 ring-amber-400 scale-105 z-20 cursor-grabbing' : ''}
                                            ${isSwapTarget ? 'hover:ring-2 hover:ring-amber-400/80' : ''}
                                            ${'cursor-pointer'}
                                            ${pick.champion ? 'animate-pop-in' : ''}
                                        `}
                                    >
                                        {pick.champion ? (
                                            <ChampionIcon champion={pick.champion} version={ddragonData.version} isClickable={false} className="w-full h-full" />
                                        ) : (
                                            <span className="text-3xl text-slate-400 dark:text-slate-600">+</span>
                                        )}
                                        {isSwapTarget && pick.champion && (
                                            <div className="absolute inset-0 bg-amber-400/30 rounded-md flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Icon name="plus" className="w-6 h-6 text-white" />
                                            </div>
                                        )}
                                    </div>
                                )}
                            )}
                        </div>
                         <div className="mt-4">
                            <TeamAnalyticsDashboard teamName={team} champions={draftState[team === 'BLUE' ? 'blueTeam' : 'redTeam'].picks.map(p => p.champion)} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="text-center">
                 <button onClick={handleGetAnalysis} disabled={!isDraftComplete || isAiLoading} className="px-8 py-3 bg-primary-gradient text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto active:scale-95 transform shadow-lg hover:shadow-xl">
                    {isAiLoading && <Spinner size="h-5 w-5 mr-2" />} {isAiLoading ? 'Analyzing...' : 'Analyze Full Setup'}
                </button>
            </div>
            
            {aiAnalysis && (
                <div className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-inner border border-slate-200 dark:border-slate-700 space-y-4 animate-slide-fade-in">
                     <div className="flex justify-between items-center">
                        <h3 className="text-2xl font-display text-teal-600 dark:text-teal-400">In-Depth Analysis</h3>
                        <button onClick={() => setPlaybookModalOpen(true)} className="px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm font-semibold">Save to Playbook</button>
                    </div>
                    <FullAnalysisDisplay analysis={aiAnalysis} ddragonData={ddragonData} onKeywordClick={handleKeywordClick} />
                </div>
            )}

            {selectedSlot && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={() => setSelectedSlot(null)}>
                    <div className="glass-effect p-4 rounded-lg shadow-xl w-full max-w-4xl animate-pop-in" onClick={e => e.stopPropagation()}>
                         <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-display text-slate-800 dark:text-slate-200">Select a Champion for {selectedSlot.team} Team</h3>
                        </div>
                        <ChampionGrid
                            ddragonData={ddragonData}
                            onChampionSelect={handleChampionSelect}
                            onChampionHover={handleChampionHover}
                            onChampionLeave={handleChampionLeave}
                            pickedChampionIds={draftState.pickedChampions}
                            iconClassName="w-full aspect-square"
                        />
                    </div>
                </div>
            )}
            <SaveToPlaybookModal
                isOpen={isPlaybookModalOpen}
                onClose={() => setPlaybookModalOpen(false)}
                onSave={handleSaveToPlaybook}
                isLoading={isAiLoading}
            />
        </div>
    );
};

export default DraftLab;