
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  SwordIcon,
  ArrowUturnLeftIcon,
  StrategyTomeIcon,
  BeakerIcon,
  FlaskConicalIcon, 
  AISparkleIcon,
  SourceLinkIcon, 
  UsersIcon, 
  WarningIcon,
  PuzzlePieceIcon,
  OracleEyeIcon,
  ClearIcon as ClearChampionIcon, 
  DocumentMagnifyingGlassIcon,
  BookOpenIcon,
  CheckCircleIcon,
  AcademicCapIcon,
  ClipboardDocumentListIcon,
} from './icons/index';
import { DRAFT_STATE_STORAGE_KEY, DRAFT_HISTORY_STORAGE_KEY, PLAYBOOK_STORAGE_KEY, VIEWED_CONCEPTS_STORAGE_KEY } from '../constants';
import { 
    SavedDraftState, 
    Concept, 
    HomeScreenProps, 
    DraftMode, 
    TeamSide, 
    DDragonChampionInfo,
    PreGameRitualAnalysis,
    RitualChampionInfo,
    ChampionStaticInfo,
    DraftAnalysis, 
    DDragonItemsData,
    ArchivedDraft,
    PlaybookEntry,
    IconProps
} from '../types';
// initialConceptsData is now passed as a prop: concepts
import { ChooseDraftModeModal } from './ChooseDraftModeModal';
import { ChampionGridModal } from './ChampionGridModal';
import { LoadingSpinner } from './LoadingSpinner';
import { getChampionImageURL } from '../services/ddragonService';
import { getPreGameRitualAnalysis, getExplorerAnalysis } from '../services/geminiService';
import { formatMarkdownString } from '../utils/textFormatting';
import { getChampionStaticInfoById } from '../gameData';
import { MetaTierBadge } from './MetaTierBadge';
import { RecommendationDisplay } from './RecommendationDisplay'; 
import { ErrorDisplay } from './ErrorDisplay'; 
import { getCurrentDailyPuzzle, isPuzzleCompletedToday } from '../services/puzzleService';


const SectionHeading: React.FC<{ title: string, icon?: React.ReactNode, className?: string }> = ({ title, icon, className = "" }) => (
  <div className={`flex items-center justify-center mb-7 sm:mb-10 ${className}`}> {/* Increased mb */}
    {icon && <span className="mr-2.5 sm:mr-3.5">{icon}</span>} {/* Increased mr */}
    <h2 className="text-3xl sm:text-4xl font-semibold text-center text-slate-100 tracking-wide font-['Inter']"> {/* Increased font size */}
      {title}
    </h2>
  </div>
);

const DashboardItemCard: React.FC<{title: string, onClick?: () => void, children: React.ReactNode, icon?: React.ReactNode, className?: string, titleClassName?: string, iconProps?: IconProps}> = 
  ({ title, onClick, children, icon, className="", titleClassName="", iconProps }) => (
  <div className={`lol-panel p-4 sm:p-5 rounded-xl ${onClick ? 'cursor-pointer hover:border-sky-500/70' : ''} ${className}`} onClick={onClick}> {/* Increased padding */}
    <div className={`flex items-center mb-2.5 ${titleClassName}`}> {/* Increased mb */}
      {icon && <span className="w-6 h-6 mr-2.5 flex items-center justify-center flex-shrink-0"> {/* Increased icon size and mr */}
        {React.isValidElement(icon) ? React.cloneElement(icon, iconProps as any) : icon}
      </span>}
      <h4 className="text-base font-semibold text-sky-300 truncate font-['Inter']">{title}</h4> {/* Increased font size */}
    </div>
    <div className="text-sm text-slate-300 font-['Inter'] leading-relaxed">{children}</div> {/* Increased font size */}
  </div>
);


export const HomeScreen: React.FC<HomeScreenProps> = ({
  onStartDraft,
  onResumeLastDraft,
  onGoToExplorer, 
  onGoToHistory,
  onGoToPlaybook,       
  onGoToDraftLab,
  onGoToArmory, 
  onInitiateLessonWithPersona,
  onGoToOracleTrials, 
  ddragonVersion,
  allChampionsData,
  allItemsData, 
  staticChampionData,
  oraclePersonality,
  greetingMessage,
  greetingVisible,
  viewedConceptIds,
  concepts, // Now received as a prop
}) => {
  const [canResume, setCanResume] = useState<boolean>(false);
  const [isChooseModeModalOpen, setIsChooseModeModalOpen] = useState<boolean>(false);

  const [ritualSelectedChampion, setRitualSelectedChampion] = useState<DDragonChampionInfo | null>(null);
  const [ritualAnalysis, setRitualAnalysis] = useState<PreGameRitualAnalysis | null>(null);
  const [isRitualLoading, setIsRitualLoading] = useState<boolean>(false);
  const [ritualError, setRitualError] = useState<string | null>(null);
  const [isRitualChampionGridOpen, setIsRitualChampionGridOpen] = useState<boolean>(false);

  const [showDeepDive, setShowDeepDive] = useState<boolean>(false);
  const [deepDiveChampions, setDeepDiveChampions] = useState<(DDragonChampionInfo | null)[]>([null, null]);
  const [deepDiveQuery, setDeepDiveQuery] = useState<string>('');
  const [deepDiveAnalysis, setDeepDiveAnalysis] = useState<DraftAnalysis | null>(null);
  const [isDeepDiveLoading, setIsDeepDiveLoading] = useState<boolean>(false);
  const [deepDiveError, setDeepDiveError] = useState<string | null>(null);
  const [deepDiveChampionSelectIndex, setDeepDiveChampionSelectIndex] = useState<number | null>(null);
  const [isDeepDiveChampionGridOpen, setIsDeepDiveChampionGridOpen] = useState<boolean>(false);

  const [recentDrafts, setRecentDrafts] = useState<ArchivedDraft[]>([]);
  const [recentPlaybookEntries, setRecentPlaybookEntries] = useState<PlaybookEntry[]>([]);
  const [todaysTrialStatus, setTodaysTrialStatus] = useState<'available' | 'completed' | 'none'>('none');
  const [spotlightConcept, setSpotlightConcept] = useState<Concept | null>(null);


  const learningConcepts = useMemo(() => {
    return concepts.map(concept => ({
      ...concept,
      onClick: () => onInitiateLessonWithPersona(concept)
    }));
  }, [concepts, onInitiateLessonWithPersona]);


  useEffect(() => {
    const savedStateRaw = localStorage.getItem(DRAFT_STATE_STORAGE_KEY);
    if (savedStateRaw) {
      try {
        const savedState = JSON.parse(savedStateRaw) as Partial<SavedDraftState>;
        setCanResume(
          ((savedState.yourTeamPicks && savedState.yourTeamPicks.length > 0) ||
           (savedState.enemyTeamPicks && savedState.enemyTeamPicks.length > 0) ||
           (savedState.yourTeamBans && savedState.yourTeamBans.length > 0) ||
           (savedState.enemyTeamBans && savedState.enemyTeamBans.length > 0))
        );
      } catch (e) { console.error("Error parsing saved state for resume check:", e); setCanResume(false); }
    } else { setCanResume(false); }

    try {
      const historyRaw = localStorage.getItem(DRAFT_HISTORY_STORAGE_KEY);
      if (historyRaw) setRecentDrafts((JSON.parse(historyRaw) as ArchivedDraft[]).slice(0, 2));
    } catch (e) { console.error("Error loading recent drafts:", e); }

    try {
      const playbookRaw = localStorage.getItem(PLAYBOOK_STORAGE_KEY);
      if (playbookRaw) setRecentPlaybookEntries((JSON.parse(playbookRaw) as PlaybookEntry[]).slice(0, 2));
    } catch (e) { console.error("Error loading recent playbook entries:", e); }
    
    const currentTrial = getCurrentDailyPuzzle();
    if (currentTrial) {
        setTodaysTrialStatus(isPuzzleCompletedToday(currentTrial.id) ? 'completed' : 'available');
    } else {
        setTodaysTrialStatus('none');
    }

    const unreadConcepts = learningConcepts.filter(c => !viewedConceptIds.includes(c.id));
    if (unreadConcepts.length > 0) {
      setSpotlightConcept(unreadConcepts[Math.floor(Math.random() * unreadConcepts.length)]); // Pick random unread
    } else if (learningConcepts.length > 0) {
      setSpotlightConcept(learningConcepts[Math.floor(Math.random() * learningConcepts.length)]);
    }

  }, [viewedConceptIds, learningConcepts]); // learningConcepts dependency added

  const handleOpenChooseModeModal = () => setIsChooseModeModalOpen(true);
  const handleCloseChooseModeModal = () => setIsChooseModeModalOpen(false);
  const handleModeAndSideSelected = (mode: DraftMode, side: TeamSide) => {
    setIsChooseModeModalOpen(false);
    onStartDraft(mode, side);
  };

  const handleOpenRitualChampionGrid = () => setIsRitualChampionGridOpen(true);
  const handleRitualChampionSelect = (champion: DDragonChampionInfo) => {
    setRitualSelectedChampion(champion);
    setRitualAnalysis(null); 
    setRitualError(null);
    setIsRitualChampionGridOpen(false);
  };
  const handleClearRitualChampion = () => {
    setRitualSelectedChampion(null);
    setRitualAnalysis(null);
    setRitualError(null);
  };
  const handleAssessOmens = useCallback(async () => {
    if (!ritualSelectedChampion) return;
    setIsRitualLoading(true);
    setRitualError(null);
    setRitualAnalysis(null);
    try {
      const analysisResult = await getPreGameRitualAnalysis(ritualSelectedChampion.name, oraclePersonality, allChampionsData);
      setRitualAnalysis(analysisResult);
    } catch (err) {
      setRitualError(err instanceof Error ? err.message : "The Oracle's vision for this champion is currently obscured.");
    } finally {
      setIsRitualLoading(false);
    }
  }, [ritualSelectedChampion, oraclePersonality, allChampionsData]);

  const toggleDeepDive = () => {
    setShowDeepDive(prev => !prev);
    if (showDeepDive) { 
      setDeepDiveChampions([null, null]);
      setDeepDiveQuery('');
      setDeepDiveAnalysis(null);
      setDeepDiveError(null);
    }
  };
  const handleDeepDiveOpenChampionGrid = (index: number) => {
    setDeepDiveChampionSelectIndex(index);
    setIsDeepDiveChampionGridOpen(true);
  };
  const handleDeepDiveChampionSelect = (champion: DDragonChampionInfo) => {
    if (deepDiveChampionSelectIndex !== null) {
      const newSelectedChampions = [...deepDiveChampions];
      const otherIndex = deepDiveChampionSelectIndex === 0 ? 1 : 0;
      if (newSelectedChampions[otherIndex]?.id === champion.id) {
          setIsDeepDiveChampionGridOpen(false);
          return;
      }
      newSelectedChampions[deepDiveChampionSelectIndex] = champion;
      setDeepDiveChampions(newSelectedChampions);
      setDeepDiveAnalysis(null); 
    }
    setIsDeepDiveChampionGridOpen(false);
  };
  const handleDeepDiveClearChampion = (index: number) => {
    const newSelectedChampions = [...deepDiveChampions];
    newSelectedChampions[index] = null;
    setDeepDiveChampions(newSelectedChampions);
    setDeepDiveAnalysis(null); 
  };
  const handleGetDeepDiveAnalysis = useCallback(async () => {
    if (deepDiveChampions.every(c => c === null) && !deepDiveQuery.trim()) {
      setDeepDiveError("Please select at least one champion or enter a query.");
      return;
    }
    setIsDeepDiveLoading(true);
    setDeepDiveError(null);
    setDeepDiveAnalysis(null);
    try {
      const championNames = deepDiveChampions.map(c => c?.name).filter(Boolean) as string[];
      const result = await getExplorerAnalysis(deepDiveQuery, oraclePersonality, championNames[0], championNames[1]);
      setDeepDiveAnalysis(result);
    } catch (err) {
      setDeepDiveError(err instanceof Error ? err.message : "An error occurred during consultation.");
    } finally {
      setIsDeepDiveLoading(false);
    }
  }, [deepDiveChampions, deepDiveQuery, oraclePersonality]);
  const handleClearDeepDiveConsultation = () => {
    setDeepDiveChampions([null, null]);
    setDeepDiveQuery('');
    setDeepDiveAnalysis(null);
    setDeepDiveError(null);
  };
  const handleRefineDeepDiveQuery = () => {
    setDeepDiveAnalysis(null); 
    setDeepDiveError(null);
  };
  const deepDiveDisabledChampionIds = useMemo(() => {
    if (deepDiveChampionSelectIndex === null) return [];
    const otherIndex = deepDiveChampionSelectIndex === 0 ? 1 : 0;
    return deepDiveChampions[otherIndex] ? [deepDiveChampions[otherIndex]!.id] : [];
  }, [deepDiveChampions, deepDiveChampionSelectIndex]);

  const renderRitualChampionItem = (ritualChamp: RitualChampionInfo, type: 'ally' | 'threat') => {
    const championInfo = allChampionsData.find(c => c.id === ritualChamp.ddragonKey || c.name === ritualChamp.champion);
    const staticInfo = championInfo ? getChampionStaticInfoById(championInfo.id) : null;
    const iconColor = type === 'ally' ? 'text-green-400' : 'text-red-400';
    const borderColor = type === 'ally' ? 'border-green-500/50' : 'border-red-500/50';
    const panelBg = type === 'ally' ? 'bg-slate-800/50 hover:bg-slate-700/60' : 'bg-slate-800/50 hover:bg-slate-700/60';

    return (
      <div key={ritualChamp.champion} className={`lol-panel p-3.5 rounded-xl ${panelBg} transition-all duration-150 animate-popIn`}> {/* Increased padding */}
        <div className="flex items-start space-x-3.5"> {/* Increased spacing */}
            {championInfo && ddragonVersion && (
            <img src={getChampionImageURL(ddragonVersion, championInfo.id)} alt={ritualChamp.champion} className={`w-14 h-14 rounded-lg border-2 ${borderColor} flex-shrink-0 shadow-sm`}/> /* Increased image size */
            )}
            <div className="flex-grow">
            <h5 className={`font-semibold ${iconColor} text-lg leading-tight font-['Inter']`}>{ritualChamp.champion}</h5> {/* Increased font size */}
            {staticInfo && staticInfo.primaryRole && <p className="text-sm text-slate-400 font-['Inter']">{staticInfo.primaryRole}</p>} {/* Increased font size */}
            <p className="text-sm text-slate-300 mt-1.5 leading-relaxed font-['Inter']">{ritualChamp.reason}</p> {/* Increased font size & mt */}
            </div>
        </div>
      </div>
    );
  };
  const selectedChampionStaticInfo = ritualSelectedChampion ? getChampionStaticInfoById(ritualSelectedChampion.id) : null;

  const totalConcepts = learningConcepts.length;
  const viewedCount = viewedConceptIds.length;

  return (
    <div className="flex flex-col items-center justify-start text-center p-2 sm:p-4 flex-grow w-full space-y-12 sm:space-y-14"> {/* Increased space-y */}
      {greetingMessage && (
        <div className={`dynamic-greeting ${greetingVisible ? 'visible' : ''}`} aria-live="polite">
          {greetingMessage}
        </div>
      )}

      {/* Dashboard Section */}
      <section className="w-full max-w-5xl lol-panel p-7 sm:p-10 animate-popIn"> {/* Increased padding and max-w */}
        <SectionHeading title="Oracle's Dashboard" icon={<OracleEyeIcon className="w-8 h-8 sm:w-9 sm:h-9 text-yellow-400" />} /> {/* Increased icon size */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"> {/* Increased gap */}
          <DashboardItemCard title="Oracle's Trial" icon={<PuzzlePieceIcon />} iconProps={{className:"text-yellow-400 w-7 h-7"}} onClick={onGoToOracleTrials} className="bg-yellow-600/10 hover:border-yellow-500/70" titleClassName="text-yellow-300"> {/* Increased icon size via props */}
            {todaysTrialStatus === 'available' && <p className="text-yellow-200">A new trial awaits your wisdom!</p>}
            {todaysTrialStatus === 'completed' && <p className="text-green-300">Today's trial conquered! Well done.</p>}
            {todaysTrialStatus === 'none' && <p className="text-slate-400">No trials currently active.</p>}
          </DashboardItemCard>

          {spotlightConcept && (
            <DashboardItemCard title="Concept Spotlight" icon={<spotlightConcept.icon />} iconProps={{className:"text-sky-400 w-7 h-7"}} onClick={spotlightConcept.onClick} className="bg-sky-600/10 hover:border-sky-500/70" titleClassName="text-sky-300"> {/* Increased icon size */}
              <p className="text-sky-200 font-medium truncate mb-1.5">{spotlightConcept.title}</p> {/* Increased mb */}
              <p className="text-sm text-slate-400 line-clamp-2">{spotlightConcept.description}</p> {/* Increased font size */}
            </DashboardItemCard>
          )}
          
          <DashboardItemCard title="Learning Progress" icon={<CheckCircleIcon />} iconProps={{className:"text-green-400 w-7 h-7"}} className="bg-green-600/10" titleClassName="text-green-300"> {/* Increased icon size */}
            <p>You've explored <strong className="text-green-200">{viewedCount}</strong> out of <strong className="text-green-200">{totalConcepts}</strong> core concepts.</p>
             {viewedCount < totalConcepts ? 
                <button onClick={() => { 
                    const firstUnread = learningConcepts.find(c => !viewedConceptIds.includes(c.id));
                    if (firstUnread?.onClick) firstUnread.onClick(); 
                    else if (learningConcepts[0]?.onClick) learningConcepts[0].onClick();
                }} className="text-sm text-sky-400 hover:underline mt-1.5">Explore More</button> : /* Increased font size and mt */
                <p className="text-sm text-green-200 mt-1.5">Mastery Achieved!</p> /* Increased font size and mt */
            }
          </DashboardItemCard>

          {recentDrafts.length > 0 && (
            <DashboardItemCard title="Recent Drafts" icon={<ClipboardDocumentListIcon />} iconProps={{className:"text-indigo-400 w-7 h-7"}} onClick={onGoToHistory} className="md:col-span-1 lg:col-span-1 bg-indigo-600/10 hover:border-indigo-500/70" titleClassName="text-indigo-300"> {/* Increased icon size */}
                {recentDrafts.map(draft => (
                    <div key={draft.id} className="mb-2 last:mb-0 p-2 bg-slate-700/30 rounded-md text-left"> {/* Increased p and mb */}
                        <p className="truncate text-indigo-200 text-sm">{`Draft: ${new Date(draft.timestamp).toLocaleDateString()}`}</p> {/* Increased font size */}
                    </div>
                ))}
                {recentDrafts.length === 0 && <p className="text-sm text-slate-400">No recent drafts found.</p>}
            </DashboardItemCard>
          )}
          
          {recentPlaybookEntries.length > 0 && (
            <DashboardItemCard title="Playbook Access" icon={<StrategyTomeIcon />} iconProps={{className:"text-teal-400 w-7 h-7"}} onClick={onGoToPlaybook} className="md:col-span-1 lg:col-span-1 bg-teal-600/10 hover:border-teal-500/70" titleClassName="text-teal-300"> {/* Increased icon size */}
                 {recentPlaybookEntries.map(entry => (
                    <div key={entry.id} className="mb-2 last:mb-0 p-2 bg-slate-700/30 rounded-md text-left"> {/* Increased p and mb */}
                        <p className="truncate text-teal-200 text-sm">{entry.name || `Strategy: ${new Date(entry.timestamp).toLocaleDateString()}`}</p> {/* Increased font size */}
                    </div>
                ))}
                {recentPlaybookEntries.length === 0 && <p className="text-sm text-slate-400">No recent playbook entries.</p>}
            </DashboardItemCard>
          )}
        </div>
      </section>


      {/* Section: Core Drafting Actions */}
      <section className="w-full max-w-3xl lol-panel p-10 sm:p-12 md:p-14 animate-popIn"> {/* Increased padding and max-w */}
        <SectionHeading title="Core Drafting Actions" icon={<SwordIcon className="w-8 h-8 sm:w-9 sm:h-9 text-sky-400" />} /> {/* Increased icon size */}
        <div className="space-y-4 sm:space-y-5 max-w-lg mx-auto"> {/* Increased spacing and max-w */}
          <button id="onboarding-start-draft-button" onClick={handleOpenChooseModeModal} className="w-full lol-button lol-button-primary text-xl sm:text-2xl px-10 sm:px-12 py-4 sm:py-5 flex items-center justify-center"> {/* Increased font size and padding */}
            <SwordIcon className="w-7 h-7 mr-3"/> Start New Draft {/* Increased icon size and mr */}
          </button>
          {canResume && (
            <button onClick={onResumeLastDraft} className="w-full lol-button lol-button-secondary text-lg sm:text-xl px-8 py-3 flex items-center justify-center"> {/* Increased font size and padding */}
              <ArrowUturnLeftIcon className="w-6 h-6 mr-3"/> Continue Last Draft {/* Increased icon size and mr */}
            </button>
          )}
          <button id="onboarding-draft-lab-button" onClick={onGoToDraftLab} className="w-full lol-button lol-button-secondary text-lg sm:text-xl px-8 py-3 flex items-center justify-center"> {/* Increased font size and padding */}
            <FlaskConicalIcon className="w-6 h-6 mr-3"/> Draft Lab {/* Increased icon size and mr */}
          </button>
        </div>
      </section>

      {/* Section: Engage the Oracle */}
      <section className="w-full max-w-5xl lol-panel p-8 sm:p-12 animate-fadeIn" style={{animationDelay: '0.1s'}}> {/* Increased padding and max-w */}
        <SectionHeading title="Engage the Oracle" icon={<OracleEyeIcon className="w-8 h-8 sm:w-9 sm:h-9 text-yellow-400" />} /> {/* Increased icon size */}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 mb-10 sm:mb-12"> {/* Increased gap and mb */}
            <button id="onboarding-oracle-trials-button" onClick={onGoToOracleTrials} className="w-full lol-button lol-button-secondary text-lg sm:text-xl px-8 py-4 flex items-center justify-center bg-yellow-600/20 hover:bg-yellow-500/30 border-yellow-500/40 text-yellow-300 animate-subtle-pulse-glow"> {/* Increased font size and padding */}
                <PuzzlePieceIcon className="w-6 h-6 mr-3"/> Oracle's Trials {/* Increased icon size and mr */}
            </button>
            <button id="onboarding-armory-button" onClick={onGoToArmory} className="w-full lol-button lol-button-secondary text-lg sm:text-xl px-8 py-4 flex items-center justify-center bg-amber-600/20 hover:bg-amber-500/30 border-amber-500/40 text-amber-300"> {/* Increased font size and padding */}
                <BookOpenIcon className="w-6 h-6 mr-3"/> Oracle's Armory {/* Increased icon size and mr */}
            </button>
        </div>

        <div className="lol-panel bg-slate-800/30 p-7 sm:p-8 mb-10 sm:mb-12 rounded-2xl border border-slate-700/50"> {/* Increased padding and mb */}
          <h3 className="text-2xl sm:text-3xl font-semibold text-center text-sky-300 mb-6 sm:mb-7 font-['Inter']">Pre-Game Tactical Briefing</h3> {/* Increased font size and mb */}
          {!ritualSelectedChampion && (
            <div className="text-center py-5 sm:py-7 flex flex-col items-center animate-popIn"> {/* Increased padding */}
              <OracleEyeIcon className="w-16 h-16 sm:w-20 sm:h-20 text-sky-400/60 mb-4" /> {/* Increased icon size and mb */}
              <p className="text-slate-300 mb-5 max-w-lg mx-auto text-base leading-relaxed font-['Inter']">Select a champion to reveal their current meta standing, fated allies, and grave threats.</p> {/* Increased font size and mb */}
              <button onClick={handleOpenRitualChampionGrid} className="lol-button lol-button-secondary px-7 py-3 text-base">Summon Champion Insights</button> {/* Increased padding and font size */}
            </div>
          )}
          {ritualSelectedChampion && !ritualAnalysis && !isRitualLoading && !ritualError && (
            <div className="text-center py-5 flex flex-col items-center animate-popIn"> {/* Increased padding */}
              {ddragonVersion && <img src={getChampionImageURL(ddragonVersion, ritualSelectedChampion.id, 'splash')} alt={ritualSelectedChampion.name} className="w-36 h-auto rounded-xl border-2 border-sky-500 shadow-lg mb-4 object-cover aspect-[16/9]" style={{ WebkitMaskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)', maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)' }}/>} {/* Increased image size and mb */}
              <h4 className="text-2xl font-bold text-sky-300 font-['Inter']">{ritualSelectedChampion.name}</h4> {/* Increased font size */}
              <p className="text-sm text-slate-400 mb-4 capitalize font-['Inter']">{ritualSelectedChampion.title}</p> {/* Increased font size and mb */}
              <p className="text-sm text-slate-400 mb-4 italic max-w-md mx-auto leading-relaxed font-['Inter']">Consider also exploring the Armory for items that synergize with {ritualSelectedChampion.name} or counter their threats.</p> {/* Increased font size and mb */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center"> {/* Increased gap */}
                  <button onClick={handleAssessOmens} disabled={isRitualLoading} className="lol-button bg-yellow-500 hover:bg-yellow-600 text-slate-900 border-yellow-600 text-base px-6 py-2.5 flex items-center justify-center"> {/* Increased font size and padding */}
                      <AISparkleIcon className="w-5 h-5 mr-2"/> {isRitualLoading ? "Assessing..." : "Assess Omens"} {/* Increased icon size */}
                  </button>
                  <button onClick={handleClearRitualChampion} className="lol-button lol-button-secondary text-base px-6 py-2.5">Choose Another</button> {/* Increased font size and padding */}
              </div>
            </div>
          )}
          {isRitualLoading && <div className="text-center py-8"><LoadingSpinner /><p className="text-sm text-slate-400 mt-2 font-['Inter']">Oracle consults stars for {ritualSelectedChampion?.name}...</p></div>} {/* Increased padding and font size */}
          {ritualError && <ErrorDisplay errorMessage={ritualError} onClear={() => setRitualError(null)} title="Briefing Error" />}
          {ritualAnalysis && ritualSelectedChampion && !isRitualLoading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 animate-popIn"> {/* Increased gap */}
              <div className="md:col-span-1 space-y-4"> {/* Increased spacing */}
                <div className="flex flex-col items-center">
                  {ddragonVersion && <img src={getChampionImageURL(ddragonVersion, ritualSelectedChampion.id, 'splash')} alt={ritualSelectedChampion.name} className="w-full max-w-[220px] h-auto rounded-xl border-2 border-sky-600 shadow-lg mb-2.5 object-cover aspect-[16/9]" style={{ WebkitMaskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)', maskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)' }}/>} {/* Increased image size and mb */}
                  <h4 className="text-2xl font-bold text-sky-300 font-['Inter']">{ritualSelectedChampion.name}</h4> {/* Increased font size */}
                  <p className="text-sm text-slate-400 capitalize mb-1.5 font-['Inter']">{ritualSelectedChampion.title}</p> {/* Increased font size and mb */}
                  {selectedChampionStaticInfo?.metaTier && <MetaTierBadge tier={selectedChampionStaticInfo.metaTier} className="mb-1.5"/>} {/* Increased mb */}
                </div>
                {selectedChampionStaticInfo && (
                  <div className="text-left text-sm space-y-1 bg-slate-900/30 p-3 rounded-xl border border-slate-700/40 font-['Inter']"> {/* Increased font size, spacing, and padding */}
                    <p><strong className="text-slate-400">Role:</strong> <span className="text-sky-400">{selectedChampionStaticInfo.primaryRole}</span></p>
                    <p><strong className="text-slate-400">Class:</strong> <span className="text-sky-400">{selectedChampionStaticInfo.championClass || 'N/A'}</span></p>
                  </div>
                )}
                <div className="prose prose-sm max-w-none text-slate-300 leading-relaxed bg-slate-900/30 p-3 rounded-xl border border-slate-700/40 text-left"> {/* Increased padding */}
                   <h5 className="text-base font-semibold text-sky-200 !mt-0 !mb-1.5 font-['Inter']">Summary:</h5> {/* Increased font size and mb */}
                   {formatMarkdownString(ritualAnalysis.identitySummary)}
                </div>
                 <p className="text-xs text-slate-500 italic p-2 bg-slate-900/20 rounded-lg border border-slate-700/30 font-['Inter'] leading-relaxed">Deepen your understanding of itemization in the Oracle's Armory.</p> {/* Increased padding */}
                <div className="flex flex-col space-y-2 pt-1.5"> {/* Increased spacing and pt */}
                  <button onClick={handleAssessOmens} disabled={isRitualLoading} className="lol-button bg-yellow-500 hover:bg-yellow-600 text-slate-900 border-yellow-600 text-sm py-2 w-full">Re-assess</button>
                  <button onClick={handleClearRitualChampion} className="lol-button lol-button-secondary text-sm py-2 w-full">Choose Another</button>
                </div>
              </div>
              <div className="md:col-span-2 space-y-4 sm:space-y-5"> {/* Increased spacing */}
                <div>
                  <h5 className="text-lg font-semibold text-green-400 mb-2 flex items-center font-['Inter']"><UsersIcon className="w-5 h-5 mr-2"/>Fated Allies:</h5> {/* Increased font size, icon size, and margins */}
                  {ritualAnalysis.fatedAllies.length > 0 ? <div className="grid grid-cols-1 gap-3">{ritualAnalysis.fatedAllies.map(ally => renderRitualChampionItem(ally, 'ally'))}</div> : <p className="text-slate-400 text-sm italic font-['Inter']">No specific strong allies highlighted.</p>} {/* Increased font size */}
                </div>
                <div>
                  <h5 className="text-lg font-semibold text-red-400 mb-2 flex items-center font-['Inter']"><WarningIcon className="w-5 h-5 mr-2"/>Grave Threats:</h5> {/* Increased font size, icon size, and margins */}
                  {ritualAnalysis.graveThreats.length > 0 ? <div className="grid grid-cols-1 gap-3">{ritualAnalysis.graveThreats.map(threat => renderRitualChampionItem(threat, 'threat'))}</div> : <p className="text-slate-400 text-sm italic font-['Inter']">No immediate grave threats foreseen.</p>} {/* Increased font size */}
                </div>
                {ritualAnalysis.sources && ritualAnalysis.sources.length > 0 && (
                  <div className="mt-3.5 pt-2.5 border-t border-slate-700/40"> {/* Increased margins */}
                      <h6 className="text-sm font-semibold text-slate-500 mb-1.5 font-['Inter']">Sources:</h6> {/* Increased font size and mb */}
                      <ul className="list-none space-y-1 pl-0">{ritualAnalysis.sources.map((chunk, idx) => { const source = chunk.web || chunk.retrievedContext; if (source?.uri) return <li key={`ritual-src-${idx}`} className="mb-1"><a href={source.uri} target="_blank" rel="noopener noreferrer" className="flex items-center text-xs text-sky-600 hover:text-sky-500 hover:underline font-['Inter']"><SourceLinkIcon className="w-3 h-3 mr-1.5 flex-shrink-0" /><span className="truncate">{source.title || source.uri}</span></a></li>; return null; })}</ul> {/* Increased font size and icon size */}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="lol-panel bg-slate-800/30 p-7 sm:p-8 rounded-2xl border border-slate-700/50"> {/* Increased padding */}
            <button id="deep-dive-consultation-toggle" onClick={toggleDeepDive} className="w-full text-left flex items-center justify-between p-2.5 hover:bg-slate-700/50 rounded-xl transition-colors" aria-expanded={showDeepDive} aria-controls="deep-dive-section"> {/* Increased padding */}
                <div className="flex items-center">
                    <DocumentMagnifyingGlassIcon className="w-7 h-7 sm:w-8 sm:h-8 text-green-400 mr-3.5" /> {/* Increased icon size and mr */}
                    <div>
                        <h3 className="text-xl sm:text-2xl font-semibold text-green-300 font-['Inter']">Deep Dive Consultation</h3> {/* Increased font size */}
                        <p className="text-sm text-slate-400 font-['Inter'] leading-relaxed">Select champions and pose strategic questions directly to the Oracle.</p> {/* Increased font size */}
                    </div>
                </div>
                <span className={`transform transition-transform duration-200 ${showDeepDive ? 'rotate-180' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 text-slate-400"><path fillRule="evenodd" d="M5.22 8.22a.75.75 0 011.06 0L10 11.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 9.28a.75.75 0 010-1.06z" clipRule="evenodd" /></svg> {/* Increased icon size */}
                </span>
            </button>
            {showDeepDive && (
            <div id="deep-dive-section" className="mt-5 sm:mt-6 space-y-5 sm:space-y-6 animate-fadeInUp"> {/* Increased margins and spacing */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5"> {/* Increased gap */}
                {[0, 1].map(index => (
                    <div key={`deep-dive-champ-${index}`} className="lol-panel bg-slate-900/40 p-3.5 rounded-xl border border-slate-700"> {/* Increased padding */}
                    <label className="block text-sm font-medium text-slate-400 mb-2 font-['Inter']">Champion {index + 1} (Optional)</label> {/* Increased font size and mb */}
                    {deepDiveChampions[index] ? (
                        <div className="flex items-center space-x-2.5"> {/* Increased spacing */}
                        <img src={getChampionImageURL(ddragonVersion, deepDiveChampions[index]!.id)} alt={deepDiveChampions[index]!.name} className="w-10 h-10 rounded-lg border border-slate-600"/> {/* Increased image size */}
                        <span className="text-slate-200 font-medium text-sm flex-grow truncate font-['Inter']">{deepDiveChampions[index]!.name}</span> {/* Increased font size */}
                        <button onClick={() => handleDeepDiveOpenChampionGrid(index)} className="lol-button lol-button-secondary text-xs px-2 py-1">Chg</button> {/* Increased padding */}
                        <button onClick={() => handleDeepDiveClearChampion(index)} className="text-red-500 hover:text-red-400 p-1" title={`Clear Champion ${index+1}`}><ClearChampionIcon className="w-3.5 h-3.5" /></button> {/* Increased icon size */}
                        </div>
                    ) : (
                        <button onClick={() => handleDeepDiveOpenChampionGrid(index)} className="w-full lol-button lol-button-secondary py-2 text-sm">Select Champ {index + 1}</button> {/* Increased padding and font size */}
                    )}
                    </div>
                ))}
                </div>
                <div>
                <label htmlFor="deepDiveQueryInput" className="block text-sm font-medium text-slate-300 mb-2 font-['Inter']">Your Query / Focus:</label> {/* Increased font size and mb */}
                <textarea id="deepDiveQueryInput" value={deepDiveQuery} onChange={(e) => setDeepDiveQuery(e.target.value)} placeholder="e.g., Synergy? Counters?" className="w-full lol-input h-20 resize-y text-sm" rows={3}/> {/* Increased height and font size */}
                </div>
                <button onClick={handleGetDeepDiveAnalysis} disabled={isDeepDiveLoading} className="w-full lol-button lol-button-primary py-2.5 text-base flex items-center justify-center"> {/* Increased padding and font size */}
                <AISparkleIcon className="w-5 h-5 mr-2" /> {isDeepDiveLoading ? 'Consulting...' : 'Consult Oracle'} {/* Increased icon size */}
                </button>
                {isDeepDiveLoading && <div className="animate-fadeIn text-center"><LoadingSpinner /></div>}
                {deepDiveError && <ErrorDisplay errorMessage={deepDiveError} onClear={() => setDeepDiveError(null)} title="Consultation Error"/>}
                {deepDiveAnalysis && !isDeepDiveLoading && (
                <div className="mt-4 animate-fadeInUp">
                    <RecommendationDisplay analysis={deepDiveAnalysis} title="Oracle's Consultation" ddragonVersion={ddragonVersion} allChampionsData={allChampionsData} allItemsData={allItemsData} />
                    <div className="flex flex-col sm:flex-row gap-2.5 mt-3.5"> {/* Increased gap and mt */}
                        <button onClick={handleRefineDeepDiveQuery} className="lol-button lol-button-secondary text-sm py-2 px-3.5 flex-1">Refine Query</button> {/* Increased padding */}
                        <button onClick={handleClearDeepDiveConsultation} className="lol-button bg-slate-600 hover:bg-slate-500 border-slate-500 text-sm py-2 px-3.5 flex-1">Clear Consultation</button> {/* Increased padding */}
                    </div>
                </div>
                )}
            </div>
            )}
        </div>
      </section>

      <section id="onboarding-knowledge-base-button" className="w-full max-w-5xl animate-fadeIn" style={{animationDelay: '0.2s'}}> {/* Increased max-w */}
        <SectionHeading title="Expand Your Knowledge" icon={<AcademicCapIcon className="w-8 h-8 sm:w-9 sm:h-9 text-sky-400" />} /> {/* Increased icon size */}
        <p className="text-center text-base text-slate-400 mb-5 -mt-4 font-['Inter']"> {/* Increased font size and mb */}
          You've explored <strong className="text-sky-300">{viewedCount}</strong> of <strong className="text-sky-300">{totalConcepts}</strong> concepts.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-7 sm:gap-10"> {/* Increased gap */}
          {learningConcepts.map((concept) => {
            const isViewed = viewedConceptIds.includes(concept.id);
            const IconComponent = concept.icon;
            return (
                <button key={concept.id} onClick={concept.onClick} className={`lol-panel p-8 sm:p-10 text-left hover:shadow-sky-400/30 transition-all duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 rounded-2xl transform hover:-translate-y-1 animate-popIn relative ${isViewed ? 'concept-viewed' : ''}`} style={{animationDelay: `${learningConcepts.indexOf(concept) * 100 + 200}ms`}} aria-label={`Unlock Secrets of ${concept.title}`}> {/* Increased padding */}
                    <div className="flex items-start space-x-5"> {/* Increased spacing */}
                        <div className="flex-shrink-0 mt-1.5"><IconComponent className={`w-10 h-10 sm:w-12 sm:h-12 ${isViewed ? 'text-yellow-500 opacity-80' : 'text-sky-400'}`} /></div> {/* Increased icon size */}
                        <div>
                            <h3 className={`text-xl sm:text-2xl font-medium mb-2 font-['Inter'] leading-tight ${isViewed ? 'text-yellow-400' : 'text-sky-300'}`}>{concept.title}</h3> {/* Increased font size and mb */}
                            <p className={`text-base text-slate-400 font-['Inter'] leading-relaxed ${isViewed ? 'opacity-75' : ''}`}>{concept.description}</p> {/* Increased font size */}
                        </div>
                    </div>
                </button>
            );
          })}
        </div>
      </section>
      
      <section className="w-full max-w-lg animate-fadeIn" style={{animationDelay: '0.3s'}}> {/* Increased max-w */}
         <SectionHeading title="Review & Archive" icon={<BeakerIcon className="w-8 h-8 sm:w-9 sm:h-9 text-slate-400" />} className="mt-10" /> {/* Increased icon size and mt */}
         <button onClick={onGoToHistory} className="w-full lol-button lol-button-secondary text-lg sm:text-xl px-8 py-3 flex items-center justify-center"> {/* Increased font size and padding */}
            <StrategyTomeIcon className="w-6 h-6 mr-2.5" /> View Draft History {/* Increased icon size and mr */}
          </button>
      </section>

      <ChooseDraftModeModal isOpen={isChooseModeModalOpen} onClose={handleCloseChooseModeModal} onSelectModeAndSide={handleModeAndSideSelected} />
      {ddragonVersion && (
        <>
          <ChampionGridModal isOpen={isRitualChampionGridOpen} onClose={() => setIsRitualChampionGridOpen(false)} champions={allChampionsData} ddragonVersion={ddragonVersion} onChampionSelect={handleRitualChampionSelect} modalTitle="Declare Champion for Tactical Briefing" championStaticData={staticChampionData as ChampionStaticInfo[]} disabledChampionIds={[]} />
          <ChampionGridModal isOpen={isDeepDiveChampionGridOpen} onClose={() => setIsDeepDiveChampionGridOpen(false)} champions={allChampionsData} ddragonVersion={ddragonVersion} onChampionSelect={handleDeepDiveChampionSelect} modalTitle={`Select Champion ${deepDiveChampionSelectIndex !== null ? deepDiveChampionSelectIndex + 1 : ''}`} championStaticData={staticChampionData as ChampionStaticInfo[]} disabledChampionIds={deepDiveDisabledChampionIds} explorerMode={true} explorerSelectedChampionIds={deepDiveChampions.map(c => c?.id).filter(Boolean) as string[]}/>
        </>
      )}
    </div>
  );
};