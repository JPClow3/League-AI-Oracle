import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { DDragonData, Champion, AIAnalysis, Aura, Role, View, DraftState, Team, MetaComposition, CompositionDeconstruction } from '../types';
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
import { isChampion } from '../utils/typeGuards';
import { META_COMPOSITIONS } from '../data/metaComps';
import CompositionDeconstructionDisplay from './common/CompositionDeconstructionDisplay';

const ROLES: Role[] = ['TOP', 'JUNGLE', 'MIDDLE', 'BOTTOM', 'SUPPORT'];

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

const LabTeamDisplay: React.FC<{
    team: Team;
    draftState: DraftState;
    ddragonData: DDragonData;
    onSlotSelect: (team: Team, index: number) => void;
    activeSlot?: {team: Team, index: number} | null;
    alerts: Alert[],
    onDismissAlert: (team: Team, title: string) => void;
    onClearTeam: (team: Team) => void;
    onSuggestFit: (team: Team, index: number) => void;
}> = ({ team, draftState, ddragonData, onSlotSelect, activeSlot, alerts, onDismissAlert, onClearTeam, onSuggestFit }) => {
    const teamData = team === 'BLUE' ? draftState.blueTeam : draftState.redTeam;
    const teamChampions = teamData.picks.map(p => p.champion).filter(isChampion);
    
    return (
        <div className={`flex-1 p-4 bg-white/50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 space-y-4`}>
            <div className="flex justify-between items-center">
                <h3 className={`text-2xl font-display text-${team.toLowerCase()}-600 dark:text-${team.toLowerCase()}-400`}>{team} TEAM</h3>
                <button onClick={() => onClearTeam(team)} className="text-xs px-2 py-1 bg-rose-500/10 text-rose-500 rounded hover:bg-rose-500/20">Clear</button>
            </div>
            <div className="space-y-2">
                {alerts.map((alert, i) => <CompositionAlert key={`${team}-${alert.title}-${i}`} {...alert} onDismiss={() => onDismissAlert(team, alert.title)} />)}
            </div>
            <div className="grid grid-cols-5 gap-2 mt-4">
                {teamData.picks.map((pick, index) => {
                    const canSuggest = teamChampions.length === 4 && pick.champion === null;
                    return (
                    <div className="relative group" key={index}>
                        <div 
                            onClick={() => onSlotSelect(team, index)}
                            className={`w-full aspect-square bg-slate-100 dark:bg-slate-900/50 rounded flex items-center justify-center transition-all duration-200 cursor-pointer
                                ${activeSlot?.team === team && activeSlot?.index === index ? 'ring-2 ring-amber-500 scale-105' : 'hover:ring-2 hover:ring-indigo-500/50'}
                                ${pick.champion ? 'animate-pop-in' : ''}
                            `}
                        >
                            {pick.champion ? (
                                <ChampionIcon champion={pick.champion} version={ddragonData.version} isClickable={false} className="w-full h-full" />
                            ) : (
                                <span className="text-3xl text-slate-400 dark:text-slate-600">+</span>
                            )}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <Icon name="edit" className="w-6 h-6 text-white"/>
                            </div>
                        </div>
                        {canSuggest && (
                            <button onClick={() => onSuggestFit(team, index)} className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 z-10 text-xs px-2 py-0.5 rounded-full bg-amber-500 text-black font-semibold shadow-lg animate-pop-in">
                                Suggest
                            </button>
                        )}
                    </div>
                )})}
            </div>
            <TeamAnalyticsDashboard teamName={team} champions={teamData.picks.map(p => p.champion)} />
        </div>
    );
}

const AISuggestionCard: React.FC<{
    suggestion: { championName: string; reasoning: string };
    ddragonData: DDragonData;
    onUse: (champion: Champion) => void;
    onClose: () => void;
}> = ({ suggestion, ddragonData, onUse, onClose }) => {
    const champion = Object.values(ddragonData.champions).find(c => c.name === suggestion.championName);
    if (!champion) return null;

    return (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg animate-slide-fade-in space-y-3">
             <div className="flex justify-between items-start">
                <h4 className="font-display text-2xl text-amber-500">AI Suggestion</h4>
                <button onClick={onClose} className="p-1 rounded-full hover:bg-black/10"><Icon name="x" className="w-4 h-4 text-amber-500"/></button>
            </div>
            <div className="flex gap-4">
                <ChampionIcon champion={champion} version={ddragonData.version} isClickable={false} className="w-20 h-20 flex-shrink-0" />
                <div>
                    <p className="font-bold text-lg text-slate-800 dark:text-slate-200">{champion.name}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{suggestion.reasoning}</p>
                </div>
            </div>
            <button onClick={() => onUse(champion)} className="w-full bg-amber-500 text-slate-900 font-semibold py-2 rounded-md hover:bg-amber-400 transition-colors">Use this Champion</button>
        </div>
    );
};

const MetaCompLoader: React.FC<{onSelect: (comp: MetaComposition) => void}> = ({ onSelect }) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = e.target.value;
        if (selectedId) {
            const comp = META_COMPOSITIONS.find(c => c.id === selectedId);
            if(comp) onSelect(comp);
            e.target.value = ''; // Reset dropdown after selection
        }
    };
    return (
        <select onChange={handleChange} defaultValue="" className="bg-slate-100 dark:bg-slate-700 p-2 rounded-md text-sm font-semibold border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none">
            <option value="" disabled>Load Meta Blueprint...</option>
            {META_COMPOSITIONS.map(comp => (
                <option key={comp.id} value={comp.id}>{comp.name}</option>
            ))}
        </select>
    );
};


const DraftLab: React.FC<DraftLabProps> = ({ ddragonData, setAura, setView, setHoverAura }) => {
    const { activeProfile, saveToPlaybook } = useProfile();
    const { settings } = activeProfile!;
    const draftState = useDraftStore(state => state);
    const { setChampionInLab, resetDraft } = useDraftStore(state => state.actions);

    const [activeSlot, setActiveSlot] = useState<{ team: 'BLUE' | 'RED'; index: number } | null>(null);
    const [isAiLoading, setAiLoading] = useState(false);
    const [isSuggestionLoading, setIsSuggestionLoading] = useState(false);
    const [isDeconstructing, setIsDeconstructing] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
    const [deconstruction, setDeconstruction] = useState<CompositionDeconstruction | null>(null);
    const [aiSuggestion, setAISuggestion] = useState<{championName: string; reasoning: string} | null>(null);
    const [isPlaybookModalOpen, setPlaybookModalOpen] = useState(false);
    const [blueAlerts, setBlueAlerts] = useState<Alert[]>([]);
    const [redAlerts, setRedAlerts] = useState<Alert[]>([]);
    const [loadedMetaComp, setLoadedMetaComp] = useState<MetaComposition | null>(null);
    
    const blueTeamPicks = useMemo(() => draftState.blueTeam.picks.map(p => p.champion), [draftState.blueTeam.picks]);
    const redTeamPicks = useMemo(() => draftState.redTeam.picks.map(p => p.champion), [draftState.redTeam.picks]);

    useEffect(() => {
        const blueChampions = blueTeamPicks.filter(isChampion);
        const redChampions = redTeamPicks.filter(isChampion);

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

    const handleFullReset = useCallback(() => {
        resetDraft();
        setAiAnalysis(null);
        setAISuggestion(null);
        setActiveSlot(null);
        setDeconstruction(null);
        setLoadedMetaComp(null);
    }, [resetDraft]);

    const handleSlotSelect = (team: 'BLUE' | 'RED', index: number) => {
        setActiveSlot({ team, index });
        setAISuggestion(null);
    };

    const handleChampionSelect = useCallback((champion: Champion) => {
        if (!activeSlot) return;
        setChampionInLab(activeSlot.team, activeSlot.index, champion);
        setAiAnalysis(null);
        setAISuggestion(null);
        setDeconstruction(null);
        setLoadedMetaComp(null);
        setActiveSlot(null);
    }, [activeSlot, setChampionInLab]);
    
    const handleGetAnalysis = useCallback(async () => {
      const isComplete = draftState.blueTeam.picks.every(c => c.champion) && draftState.redTeam.picks.every(c => c.champion);
      if (!isComplete) {
          alert("Please fill all 10 champion slots before analyzing.");
          return;
      }

      setAiLoading(true);
      setAura('thinking');
      const analysis = await geminiService.getFullDraftAnalysis(draftState, settings);
      setAiAnalysis(analysis);
      setDeconstruction(null);
      setAiLoading(false);
      
      if (analysis?.strategicFocus.toLowerCase().includes('blue team has a clear advantage')) setAura('positive');
      else if (analysis?.strategicFocus.toLowerCase().includes('red team has a clear advantage')) setAura('negative');
      else setAura('neutral');

    }, [draftState, settings, setAura]);

    const handleSuggestFit = useCallback(async (team: Team, index: number) => {
        setActiveSlot({ team, index });
        setIsSuggestionLoading(true);
        setAISuggestion(null);
        
        const teamPicks = (team === 'BLUE' ? blueTeamPicks : redTeamPicks).filter(isChampion);
        const roleToFill = draftState.blueTeam.picks[index].role;

        const suggestion = await geminiService.getCompositionSuggestion(teamPicks, roleToFill, settings);
        if (suggestion) {
            setAISuggestion(suggestion);
        } else {
            alert("The Oracle could not think of a suggestion right now. Please try again.");
        }
        setIsSuggestionLoading(false);
    }, [blueTeamPicks, redTeamPicks, draftState, settings]);

    const handleLoadMetaComp = useCallback((comp: MetaComposition) => {
        handleFullReset();
        setLoadedMetaComp(comp);
    
        const championsToLoad = comp.champions.map(metaChamp => {
            const champData = Object.values(ddragonData.champions).find(c => c.name === metaChamp.name);
            return { champData, role: metaChamp.role };
        });
        
        championsToLoad.forEach(({ champData, role }) => {
            if (champData) {
                const roleIndex = ROLES.indexOf(role);
                if(roleIndex !== -1) {
                    setChampionInLab('BLUE', roleIndex, champData);
                }
            }
        });
    }, [ddragonData.champions, handleFullReset, setChampionInLab]);
    
    const handleDeconstruct = useCallback(async () => {
        if (!loadedMetaComp) return;
        const blueTeamChamps = draftState.blueTeam.picks.map(p => p.champion).filter(isChampion);
        if (blueTeamChamps.length < 5) return;
    
        setIsDeconstructing(true);
        setDeconstruction(null);
        setAiAnalysis(null);
        setAura('thinking');
    
        const result = await geminiService.getCompositionDeconstruction(blueTeamChamps, settings);
        setDeconstruction(result);
    
        setIsDeconstructing(false);
        setAura('neutral');
    }, [draftState.blueTeam.picks, loadedMetaComp, settings, setAura]);

    const handleSaveToPlaybook = (name: string, description: string) => {
        if (!aiAnalysis) return;
        const stateToSave = { ...draftState, analysis: aiAnalysis, pickedChampions: new Set(Array.from(draftState.pickedChampions)) };
        saveToPlaybook({ name, description, analysis: aiAnalysis, draftState: stateToSave });
        setPlaybookModalOpen(false);
        alert("Strategy saved to Playbook!");
    };

    const isDraftComplete = draftState.blueTeam.picks.every(c => c.champion) && draftState.redTeam.picks.every(c => c.champion);

    const handleKeywordClick = useCallback((lessonId: string) => {
        setView(View.LESSONS);
    }, [setView]);
    
    const handleClearTeam = useCallback((team: Team) => {
        for(let i=0; i<5; i++) {
            setChampionInLab(team, i, null);
        }
        setAiAnalysis(null);
        setDeconstruction(null);
        if (team === 'BLUE') setLoadedMetaComp(null);
    }, [setChampionInLab]);

    return (
        <div className="space-y-4">
            <div className="text-center">
                 <div className="flex items-center gap-4 justify-center">
                    <h2 className="text-4xl font-display">The Forge</h2>
                    <MetaCompLoader onSelect={handleLoadMetaComp} />
                </div>
                <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">Forge powerful compositions, get live feedback, and use the Oracle to craft the perfect final pick.</p>
            </div>
            
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                <LabTeamDisplay 
                    team="BLUE"
                    draftState={draftState}
                    ddragonData={ddragonData}
                    onSlotSelect={handleSlotSelect}
                    activeSlot={activeSlot}
                    alerts={blueAlerts}
                    onDismissAlert={(_, title) => setBlueAlerts(a => a.filter(al => al.title !== title))}
                    onClearTeam={handleClearTeam}
                    onSuggestFit={handleSuggestFit}
                />
                <LabTeamDisplay 
                    team="RED"
                    draftState={draftState}
                    ddragonData={ddragonData}
                    onSlotSelect={handleSlotSelect}
                    activeSlot={activeSlot}
                    alerts={redAlerts}
                    onDismissAlert={(_, title) => setRedAlerts(a => a.filter(al => al.title !== title))}
                    onClearTeam={handleClearTeam}
                    onSuggestFit={handleSuggestFit}
                />
            </div>
            
            <div className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                         <h3 className="font-display text-2xl mb-2">Champion Roster</h3>
                         <ChampionGrid
                            ddragonData={ddragonData}
                            onChampionSelect={handleChampionSelect}
                            pickedChampionIds={draftState.pickedChampions}
                            iconClassName="w-full aspect-square"
                        />
                    </div>
                    <div className="space-y-3">
                        <h3 className="font-display text-2xl mb-2">Actions & Analysis</h3>
                        {isSuggestionLoading ? (
                             <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center justify-center h-40">
                                <Spinner />
                                <p className="ml-4 text-amber-500">Oracle is searching for the perfect fit...</p>
                            </div>
                        ) : aiSuggestion ? (
                            <AISuggestionCard suggestion={aiSuggestion} ddragonData={ddragonData} onUse={handleChampionSelect} onClose={() => setAISuggestion(null)} />
                        ) : (
                            <div className="p-4 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg flex flex-col items-center justify-center text-center h-40">
                                <Icon name="brain" className="w-10 h-10 text-slate-400 mb-2"/>
                                <p className="text-sm text-slate-500">Build a team of 4 and select the last slot to get an AI suggestion.</p>
                            </div>
                        )}
                        <div className="flex flex-wrap gap-2">
                            {loadedMetaComp && !deconstruction ? (
                                <button onClick={handleDeconstruct} disabled={isDeconstructing} className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center active:scale-95 transform shadow-lg hover:shadow-xl font-semibold">
                                    {isDeconstructing && <Spinner size="h-5 w-5 mr-2" />} {isDeconstructing ? 'Deconstructing...' : `Deconstruct: ${loadedMetaComp.name}`}
                                </button>
                            ) : (
                                <button onClick={handleGetAnalysis} disabled={!isDraftComplete || isAiLoading} className="flex-1 px-4 py-2 bg-primary-gradient text-white rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center active:scale-95 transform shadow-lg hover:shadow-xl font-semibold">
                                    {isAiLoading && <Spinner size="h-5 w-5 mr-2" />} {isAiLoading ? 'Analyzing...' : 'Analyze Full Setup'}
                                </button>
                            )}
                            <button onClick={handleFullReset} className="px-3 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 transition-colors">Reset All</button>
                             <button onClick={() => setPlaybookModalOpen(true)} disabled={!aiAnalysis} className="px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50">Save to Playbook</button>
                        </div>
                    </div>
                </div>
            </div>

            {aiAnalysis && (
                <div className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-inner border border-slate-200 dark:border-slate-700 space-y-4 animate-slide-fade-in">
                    <FullAnalysisDisplay analysis={aiAnalysis} ddragonData={ddragonData} onKeywordClick={handleKeywordClick} draftState={draftState} />
                </div>
            )}
            
            {deconstruction && (
                 <div className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-inner border border-slate-200 dark:border-slate-700 space-y-4 animate-slide-fade-in">
                    <CompositionDeconstructionDisplay deconstruction={deconstruction} ddragonData={ddragonData} onKeywordClick={handleKeywordClick} />
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