
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  DDragonChampionInfo, ChampionSlot, Team, DraftAnalysis, DraftLabScreenProps,
  ChampionStaticInfo, PlaybookEntry, OraclePersonality, DDragonItemsData, StructuredDraftRec
} from '../types';
import { LOL_ROLES, MAX_BANS_PER_TEAM, MAX_CHAMPIONS_PER_TEAM } from '../constants';
import { getDraftRecommendations, getThreatAssessmentAnalysis } from '../services/geminiService'; // Added getThreatAssessmentAnalysis
import { TeamDisplay } from './TeamDisplay';
import { ChampionGrid } from './ChampionGrid';
import { ChampionGridModal } from './ChampionGridModal'; 
import { RecommendationDisplay } from './RecommendationDisplay';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorDisplay } from './ErrorDisplay';
import {
    ArrowUturnLeftIcon,
    ClearIcon,
    AISparkleIcon,
    FlaskConicalIcon,
    SwordIcon, 
    WarningIcon,
    FocusIcon, // Using FocusIcon (alias for EyeIcon) for threat assessment
    TargetIcon, // For targeted threat indicator
} from './icons/index';
import { staticChampionData as initialStaticChampionDataImport, getChampionStaticInfoById } from '../gameData'; 

export const DraftLabScreen: React.FC<DraftLabScreenProps> = ({
  onGoHome,
  ddragonVersion,
  allChampionsData,
  allItemsData, 
  staticChampionData, 
  oraclePersonality,
  initialPlaybookEntryToLoad,
  onInitialPlaybookEntryLoaded,
  onUpdateDraftAura,
}) => {
  const [yourTeamPicks, setYourTeamPicks] = useState<ChampionSlot[]>(() => 
    Array(MAX_CHAMPIONS_PER_TEAM).fill(null).map((_, i) => ({ champion: '', role: LOL_ROLES[i], ddragonKey: '' }))
  );
  const [enemyTeamPicks, setEnemyTeamPicks] = useState<ChampionSlot[]>(() => 
    Array(MAX_CHAMPIONS_PER_TEAM).fill(null).map((_, i) => ({ champion: '', role: LOL_ROLES[i], ddragonKey: '' }))
  );
  const [yourTeamBans, setYourTeamBans] = useState<string[]>(() => Array(MAX_BANS_PER_TEAM).fill(''));
  const [enemyTeamBans, setEnemyTeamBans] = useState<string[]>(() => Array(MAX_BANS_PER_TEAM).fill(''));

  const [analysis, setAnalysis] = useState<DraftAnalysis | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [isChampionGridOpen, setIsChampionGridOpen] = useState(false);
  const [championGridTarget, setChampionGridTarget] = useState<{ team: Team, type: 'pick' | 'ban', index: number, role?: string } | null>(null);

  // State for Threat Assessment Mode
  const [isThreatAssessmentModeActive, setIsThreatAssessmentModeActive] = useState<boolean>(false);
  const [targetedThreat, setTargetedThreat] = useState<{ name: string; ddragonKey?: string } | null>(null);
  const [threatAnalysis, setThreatAnalysis] = useState<DraftAnalysis | null>(null);
  const [isLoadingThreatAnalysis, setIsLoadingThreatAnalysis] = useState<boolean>(false);
  const [threatAnalysisError, setThreatAnalysisError] = useState<string | null>(null);


  useEffect(() => {
    if (initialPlaybookEntryToLoad) {
      const fillSlots = (currentSlots: ChampionSlot[], maxSlots: number, defaultRolePrefix: string): ChampionSlot[] => {
        const filled = currentSlots.map(p => ({ ...p }));
        while (filled.length < maxSlots) {
          const nextRoleIndex = filled.length;
          filled.push({ champion: '', role: LOL_ROLES[nextRoleIndex] || `${defaultRolePrefix}${nextRoleIndex + 1}`, ddragonKey: '' });
        }
        return filled.slice(0, maxSlots);
      };
       const fillBanSlots = (currentBans: string[], maxBans: number): string[] => {
        const filled = [...currentBans];
        while(filled.length < maxBans) {
            filled.push('');
        }
        return filled.slice(0, maxBans);
      };

      setYourTeamPicks(fillSlots(initialPlaybookEntryToLoad.yourTeamPicks, MAX_CHAMPIONS_PER_TEAM, 'FlexYT'));
      setEnemyTeamPicks(fillSlots(initialPlaybookEntryToLoad.enemyTeamPicks, MAX_CHAMPIONS_PER_TEAM, 'FlexET'));
      setYourTeamBans(fillBanSlots(initialPlaybookEntryToLoad.yourTeamBans, MAX_BANS_PER_TEAM));
      setEnemyTeamBans(fillBanSlots(initialPlaybookEntryToLoad.enemyTeamBans, MAX_BANS_PER_TEAM));
      
      if (onInitialPlaybookEntryLoaded) {
        onInitialPlaybookEntryLoaded();
      }
       setAnalysis(initialPlaybookEntryToLoad.analysis || null);
       if (initialPlaybookEntryToLoad.analysis?.auraSentiment) {
        onUpdateDraftAura(initialPlaybookEntryToLoad.analysis.auraSentiment);
       } else {
        onUpdateDraftAura('neutral');
       }
    } else {
      onUpdateDraftAura('neutral');
    }
  }, [initialPlaybookEntryToLoad, onInitialPlaybookEntryLoaded, onUpdateDraftAura]);

  useEffect(() => {
    return () => { // Cleanup on unmount
      onUpdateDraftAura('neutral');
    };
  }, [onUpdateDraftAura]);

  const clearAllAnalyses = () => {
    setAnalysis(null);
    setThreatAnalysis(null);
    setThreatAnalysisError(null);
    onUpdateDraftAura('neutral');
  };
  
  const handleLabPickSlotClick = (team: Team, role: string) => {
    if (isThreatAssessmentModeActive) return; 
    const picks = team === Team.YourTeam ? yourTeamPicks : enemyTeamPicks;
    const pickIndex = picks.findIndex(p => p.role === role);
    if (pickIndex !== -1) {
      setChampionGridTarget({ team, type: 'pick', index: pickIndex, role });
      setIsChampionGridOpen(true);
    }
  };

  const handleLabBanSlotClick = (team: Team, banIndex: number) => {
    if (isThreatAssessmentModeActive) return;
    setChampionGridTarget({ team, type: 'ban', index: banIndex });
    setIsChampionGridOpen(true);
  };
  
  const handleClearSlot = (team: Team, type: 'pick' | 'ban', identifier: string | number) => {
    clearAllAnalyses();
    setTargetedThreat(null); 
    if (type === 'pick') {
      const roleToClear = identifier as string;
      const setPicks = team === Team.YourTeam ? setYourTeamPicks : setEnemyTeamPicks;
      setPicks(prev => prev.map(p => p.role === roleToClear ? { champion: '', role: p.role, ddragonKey: '' } : p));
    } else { 
      const indexToClear = identifier as number;
      const setBans = team === Team.YourTeam ? setYourTeamBans : setEnemyTeamBans;
      setBans(prev => prev.map((b, i) => i === indexToClear ? '' : b));
    }
  };


  const handleChampionSelectFromGrid = (champion: DDragonChampionInfo) => {
    if (!championGridTarget) return;
    const { team, type, index, role } = championGridTarget;
    clearAllAnalyses();
    setTargetedThreat(null); 

    if (type === 'pick') {
      const setPicks = team === Team.YourTeam ? setYourTeamPicks : setEnemyTeamPicks;
      setPicks(prev => prev.map((p, i) => (p.role === role || i === index) ? { champion: champion.name, role: p.role, ddragonKey: champion.id } : p));
    } else { 
      const setBans = team === Team.YourTeam ? setYourTeamBans : setEnemyTeamBans;
      setBans(prev => prev.map((b, i) => i === index ? champion.id : b));
    }
    setIsChampionGridOpen(false);
    setChampionGridTarget(null);
  };
  
  const handleLabChampionDropOnPick = (team: Team, role: string, champion: DDragonChampionInfo) => {
    const setPicks = team === Team.YourTeam ? setYourTeamPicks : setEnemyTeamPicks;
    setPicks(prev => prev.map(p => p.role === role ? { champion: champion.name, role: p.role, ddragonKey: champion.id } : p));
    clearAllAnalyses();
    setTargetedThreat(null);
  };

  const handleLabChampionDropOnBan = (team: Team, banIndex: number, champion: DDragonChampionInfo) => {
    const setBans = team === Team.YourTeam ? setYourTeamBans : setEnemyTeamBans;
    setBans(prev => prev.map((b, i) => i === banIndex ? champion.id : b));
    clearAllAnalyses();
    setTargetedThreat(null);
  };

  const handleGetLabAnalysis = async () => {
    if (isThreatAssessmentModeActive) return; 
    setIsLoadingAnalysis(true);
    setError(null);
    clearAllAnalyses();
    try {
      const result = await getDraftRecommendations(
        yourTeamPicks.filter(p => p.champion),
        enemyTeamPicks.filter(p => p.champion),
        yourTeamBans.filter(b => b),
        enemyTeamBans.filter(b => b),
        oraclePersonality,
        [], 
        {}  
      );
      let overallSentiment: DraftAnalysis['overallSentiment'] = 'neutral';
      
      let analysisTextForSentimentCheck = "";
      if (typeof result.analysisData === 'string') {
          analysisTextForSentimentCheck = result.analysisData.toLowerCase();
      } else if (result.analysisType === 'draft') {
          // For structured draft, use overallSynopsis for a quick sentiment check
          const structuredData = result.analysisData as StructuredDraftRec;
          analysisTextForSentimentCheck = JSON.stringify(structuredData.overallSynopsis || {}).toLowerCase();
      }

      if (analysisTextForSentimentCheck.includes("strong synergy") || analysisTextForSentimentCheck.includes("excellent composition") || analysisTextForSentimentCheck.includes("highly favorable")) {
          overallSentiment = 'positive';
      } else if (analysisTextForSentimentCheck.includes("major weakness") || analysisTextForSentimentCheck.includes("critical flaw") || analysisTextForSentimentCheck.includes("significant vulnerability") || analysisTextForSentimentCheck.includes("lack of") || analysisTextForSentimentCheck.includes("no reliable")) {
          overallSentiment = 'critical_flaw';
      }
      
      let auraSentiment: DraftAnalysis['auraSentiment'] = 'neutral';
      if (overallSentiment === 'positive') auraSentiment = 'pleased';
      else if (overallSentiment === 'critical_flaw') auraSentiment = 'concerned';
      
      setAnalysis({...result, overallSentiment, auraSentiment});
      onUpdateDraftAura(auraSentiment);

    } catch (err) {
      console.error("Error fetching lab analysis:", err);
      setError(err instanceof Error ? err.message : "Failed to get analysis.");
      onUpdateDraftAura('neutral');
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  const handleToggleThreatAssessmentMode = () => {
    setIsThreatAssessmentModeActive(prev => {
      if (!prev === false) { 
        setTargetedThreat(null);
        setThreatAnalysis(null);
        setThreatAnalysisError(null);
        onUpdateDraftAura('neutral');
      }
      return !prev;
    });
    setAnalysis(null); 
    setError(null);
  };

  const handleSelectTargetThreat = async (championName: string, championKey?: string) => {
    if (!isThreatAssessmentModeActive) return;
    setTargetedThreat({ name: championName, ddragonKey: championKey });
    setIsLoadingThreatAnalysis(true);
    setThreatAnalysis(null);
    setThreatAnalysisError(null);
    onUpdateDraftAura('neutral'); 
    try {
      const result = await getThreatAssessmentAnalysis(
        yourTeamPicks.filter(p => p.champion),
        enemyTeamPicks.filter(p => p.champion),
        championName,
        oraclePersonality
      );
      setThreatAnalysis(result);
      // For threat analysis, aura is generally neutral as it's a focused query, not full draft state.
      // Or, you could choose to set a specific aura if desired, e.g., 'concerned' if the threat is high.
      // For now, keeping it neutral to avoid conflicting with main draft aura logic.
      onUpdateDraftAura('neutral');
    } catch (err) {
      console.error("Error fetching threat analysis:", err);
      setThreatAnalysisError(err instanceof Error ? err.message : `Failed to analyze threat: ${championName}.`);
      onUpdateDraftAura('neutral');
    } finally {
      setIsLoadingThreatAnalysis(false);
    }
  };

  const handleClearBoard = () => {
    setYourTeamPicks(Array(MAX_CHAMPIONS_PER_TEAM).fill(null).map((_, i) => ({ champion: '', role: LOL_ROLES[i], ddragonKey: '' })));
    setEnemyTeamPicks(Array(MAX_CHAMPIONS_PER_TEAM).fill(null).map((_, i) => ({ champion: '', role: LOL_ROLES[i], ddragonKey: '' })));
    setYourTeamBans(Array(MAX_BANS_PER_TEAM).fill(''));
    setEnemyTeamBans(Array(MAX_BANS_PER_TEAM).fill(''));
    clearAllAnalyses();
    setError(null);
    if (isThreatAssessmentModeActive) {
      setTargetedThreat(null);
      setThreatAnalysis(null);
      setThreatAnalysisError(null);
    }
  };
  
  const disabledChampionIds = useMemo(() => {
    const allSelected = new Set<string>();
    const addChampionToSet = (champIdentifier: string) => {
        if (!champIdentifier) return;
        const champById = allChampionsData.find(c => c.id.toLowerCase() === champIdentifier.toLowerCase());
        if (champById) {
            allSelected.add(champById.id);
            return;
        }
        const champByName = allChampionsData.find(c => c.name.toLowerCase() === champIdentifier.toLowerCase());
        if (champByName) {
            allSelected.add(champByName.id);
        }
        else if (!allChampionsData.some(c => c.name.toLowerCase() === champIdentifier.toLowerCase())) {
             allSelected.add(champIdentifier);
        }
    };

    yourTeamPicks.forEach(p => addChampionToSet(p.ddragonKey || p.champion));
    enemyTeamPicks.forEach(p => addChampionToSet(p.ddragonKey || p.champion));
    yourTeamBans.forEach(b => addChampionToSet(b));
    enemyTeamBans.forEach(b => addChampionToSet(b));
    
    return Array.from(allSelected);
  }, [yourTeamPicks, enemyTeamPicks, yourTeamBans, enemyTeamBans, allChampionsData]);

  return (
    <div className="w-full h-full flex flex-col p-2 sm:p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl sm:text-4xl font-['Playfair_Display'] text-sky-300 flex items-center">
          <FlaskConicalIcon className="w-7 h-7 sm:w-8 sm:h-8 mr-2 sm:mr-3" />
          Draft Lab
        </h2>
        <button onClick={onGoHome} className="lol-button lol-button-secondary text-sm px-3 py-1.5 sm:px-4 sm:py-2">
          <ArrowUturnLeftIcon className="w-4 h-4 mr-1.5" /> Home
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 flex-grow min-h-0">
        <div className="lg:col-span-1 min-h-[300px] sm:min-h-[400px]">
           <TeamDisplay
            title="Your Team"
            teamPicks={yourTeamPicks}
            teamBans={yourTeamBans}
            icon={<SwordIcon />}
            ddragonVersion={ddragonVersion}
            allChampionsData={allChampionsData}
            mode="lab"
            onLabPickSlotClick={handleLabPickSlotClick}
            onLabBanSlotClick={handleLabBanSlotClick}
            onLabFilledPickClick={(team, role, champName) => handleClearSlot(team, 'pick', role)}
            onLabFilledBanClick={(team, index, champName) => handleClearSlot(team, 'ban', index)}
            onLabChampionDropOnPick={handleLabChampionDropOnPick}
            onLabChampionDropOnBan={handleLabChampionDropOnBan}
            getChampionStaticInfoById={getChampionStaticInfoById}
            roleSwapState={null} onInitiateRoleSwap={() => {}} onCompleteRoleSwap={() => {}} onCancelRoleSwap={() => {}} anyLoading={false}
            analysisSentiment={analysis?.overallSentiment}
          />
        </div>
        <div className="lg:col-span-1 min-h-[300px] sm:min-h-[400px]">
          <TeamDisplay
            title="Enemy Team"
            teamPicks={enemyTeamPicks}
            teamBans={enemyTeamBans}
            icon={<WarningIcon />}
            ddragonVersion={ddragonVersion}
            allChampionsData={allChampionsData}
            mode="lab"
            onLabPickSlotClick={handleLabPickSlotClick}
            onLabBanSlotClick={handleLabBanSlotClick}
            onLabFilledPickClick={(team, role, champName) => {
                if (isThreatAssessmentModeActive) {
                    const champ = enemyTeamPicks.find(p => p.role === role && p.champion === champName);
                    if (champ) handleSelectTargetThreat(champ.champion, champ.ddragonKey);
                } else {
                    handleClearSlot(team, 'pick', role);
                }
            }}
            onLabFilledBanClick={(team, index, champName) => handleClearSlot(team, 'ban', index)}
            onLabChampionDropOnPick={handleLabChampionDropOnPick}
            onLabChampionDropOnBan={handleLabChampionDropOnBan}
            getChampionStaticInfoById={getChampionStaticInfoById}
            roleSwapState={null} onInitiateRoleSwap={() => {}} onCompleteRoleSwap={() => {}} onCancelRoleSwap={() => {}} anyLoading={false}
            isThreatAssessmentModeActive={isThreatAssessmentModeActive}
            targetedThreatChampionName={targetedThreat?.name}
            onSelectTargetThreat={handleSelectTargetThreat}
          />
        </div>

        <div className="lg:col-span-1 min-h-[400px] sm:min-h-[500px] lg:max-h-[calc(100vh-12rem)]">
          {ddragonVersion && allChampionsData.length > 0 && staticChampionData && staticChampionData.length > 0 && (
            <ChampionGrid
              champions={allChampionsData}
              ddragonVersion={ddragonVersion}
              championStaticData={staticChampionData}
              disabledChampionIds={disabledChampionIds}
              onDragStartChampion={(event, champion) => {
                event.dataTransfer.setData("text/plain", JSON.stringify(champion));
              }}
              getChampionStaticInfoById={getChampionStaticInfoById}
            />
          )}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t-2 border-slate-700/50">
        <div className="flex flex-wrap justify-center items-center gap-3 mb-4">
          <button onClick={handleGetLabAnalysis} disabled={isLoadingAnalysis || isThreatAssessmentModeActive} className="lol-button lol-button-primary py-2 px-4 text-sm flex items-center">
            <AISparkleIcon className="w-5 h-5 mr-2"/> {isLoadingAnalysis ? 'Analyzing...' : 'Analyze Full Setup'}
          </button>
           <button onClick={handleToggleThreatAssessmentMode} className={`lol-button py-2 px-4 text-sm flex items-center ${isThreatAssessmentModeActive ? 'bg-red-600 hover:bg-red-700 border-red-500' : 'lol-button-secondary'}`}>
            <FocusIcon className="w-5 h-5 mr-2"/> {isThreatAssessmentModeActive ? 'Exit Threat Mode' : 'Threat Assessment'}
          </button>
          <button onClick={handleClearBoard} className="lol-button lol-button-secondary py-2 px-4 text-sm flex items-center">
            <ClearIcon className="w-5 h-5 mr-2"/> Clear Board
          </button>
        </div>

        {isThreatAssessmentModeActive && !targetedThreat && !isLoadingThreatAnalysis && !threatAnalysis && (
            <p className="text-center text-yellow-300 text-sm mb-3 animate-fadeIn">Click an enemy champion to assess their specific threat.</p>
        )}

        {isLoadingAnalysis && <div className="text-center"><LoadingSpinner /><p className="text-sm text-slate-400 mt-1">Oracle analyzes the full board...</p></div>}
        {error && <ErrorDisplay errorMessage={error} onClear={() => setError(null)} />}
        
        {isLoadingThreatAnalysis && <div className="text-center"><LoadingSpinner /><p className="text-sm text-slate-400 mt-1">Assessing threat: {targetedThreat?.name}...</p></div>}
        {threatAnalysisError && <ErrorDisplay errorMessage={threatAnalysisError} onClear={() => setThreatAnalysisError(null)} />}

        {analysis && !isLoadingAnalysis && !isThreatAssessmentModeActive && (
          <div className="mt-4 lol-panel p-4 animate-fadeInUp">
            <RecommendationDisplay 
                analysis={analysis} 
                title="Oracle's Lab Analysis" 
                ddragonVersion={ddragonVersion} 
                allChampionsData={allChampionsData}
                allItemsData={allItemsData}
                overallSentiment={analysis.overallSentiment} 
            />
          </div>
        )}
        {threatAnalysis && !isLoadingThreatAnalysis && isThreatAssessmentModeActive && targetedThreat && (
          <div className="mt-4 lol-panel p-4 animate-fadeInUp">
            <RecommendationDisplay 
                analysis={threatAnalysis} 
                title={`Threat Assessment: ${targetedThreat.name}`}
                ddragonVersion={ddragonVersion} 
                allChampionsData={allChampionsData}
                allItemsData={allItemsData}
            />
          </div>
        )}
      </div>
      
      {isChampionGridOpen && ddragonVersion && allChampionsData.length > 0 && staticChampionData && staticChampionData.length > 0 && (
        <ChampionGridModal
          isOpen={isChampionGridOpen}
          onClose={() => setIsChampionGridOpen(false)}
          champions={allChampionsData}
          ddragonVersion={ddragonVersion}
          onChampionSelect={handleChampionSelectFromGrid}
          disabledChampionIds={disabledChampionIds}
          modalTitle={championGridTarget?.type === 'pick' && championGridTarget.role ? `Select Champion for ${championGridTarget.team === Team.YourTeam ? 'Your' : 'Enemy'} Team ${championGridTarget.role}` : `Select Ban for ${championGridTarget?.team === Team.YourTeam ? 'Your' : 'Enemy'} Team (Slot ${championGridTarget ? championGridTarget.index + 1: ''})`}
          championStaticData={staticChampionData}
        />
      )}
    </div>
  );
};
