
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { HomeScreen } from './components/HomeScreen';
import { DraftingScreen } from './components/DraftingScreen';
import { ExplorerScreen } from './components/ExplorerScreen';
import { HistoryScreen } from './components/HistoryScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { PlaybookScreen } from './components/PlaybookScreen';
import { DraftLabScreen } from './components/DraftLabScreen';
import { InteractiveLessonScreen } from './components/InteractiveLessonScreen';
import { OracleTrialsScreen } from './components/OracleTrialsScreen';
import { ArmoryScreen } from './components/ArmoryScreen'; 
import { OnboardingTour, OnboardingStep } from './components/OnboardingTour';
import { CommandPalette } from './components/CommandPalette';
import { APP_TITLE, GEMINI_MODEL_NAME, DEFAULT_ORACLE_PERSONALITY, DEFAULT_THEME, APP_SETTINGS_STORAGE_KEY, DRAFT_STATE_STORAGE_KEY, ONBOARDING_COMPLETED_KEY, VIEWED_CONCEPTS_STORAGE_KEY } from './constants';
import { OracleEyeIcon, Cog6ToothIcon, StrategyTomeIcon, EyeIcon as FocusModeEyeIcon, EyeSlashIcon as FocusModeEyeSlashIcon, FlaskConicalIcon, SunIcon, MoonIcon, MagnifyingGlassIcon, HomeIcon, BookOpenIcon, AcademicCapIcon, ChartBarIcon, BeakerIcon as HistoryIcon, PuzzlePieceIcon } from './components/icons/index'; 
import { DDragonChampionInfo, AppView, ChampionStaticInfo, AppSettings, OraclePersonality, DraftMode, Concept, PlaybookEntry, SavedDraftState, TeamSide, DDragonItemsData, ItemStaticInfo, AppTheme, Command, DDragonItemInfo, DraftAnalysis } from './types';
import { getLatestDDragonVersion, getAllChampionsData, getAllItemsData } from './services/ddragonService';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ChampionGridModal } from './components/ChampionGridModal';
import { staticChampionData } from './gameData';
import { itemStaticData } from './data/itemStaticData'; 
import { initialConceptsData } from './constants/conceptsData';


const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('HOME');
  const [ddragonVersion, setDdragonVersion] = useState<string>('');
  const [allChampions, setAllChampions] = useState<DDragonChampionInfo[]>([]);
  const [allItems, setAllItems] = useState<DDragonItemsData | null>(null); 
  const [isLoadingChampions, setIsLoadingChampions] = useState<boolean>(true);
  const [isLoadingItems, setIsLoadingItems] = useState<boolean>(true); 
  const [dDragonError, setDDragonError] = useState<string | null>(null);
  const [appSettings, setAppSettings] = useState<AppSettings>({
    oraclePersonality: DEFAULT_ORACLE_PERSONALITY,
    enableAnimations: true,
    isFocusModeActive: false, 
    theme: DEFAULT_THEME,
  });
  const [currentDraftMode, setCurrentDraftMode] = useState<DraftMode>('SOLO_QUEUE');
  const [currentStartingSide, setCurrentStartingSide] = useState<TeamSide>('BLUE');
  
  const [selectedConceptForLesson, setSelectedConceptForLesson] = useState<Concept | null>(null);
  const [championPersonaForLesson, setChampionPersonaForLesson] = useState<DDragonChampionInfo | null>(null);
  const [isChampionPersonaSelectionModalOpen, setIsChampionPersonaSelectionModalOpen] = useState<boolean>(false);

  const [playbookEntryToLoadForLab, setPlaybookEntryToLoadForLab] = useState<PlaybookEntry | null>(null);
  const [showOnboardingTour, setShowOnboardingTour] = useState<boolean>(false);

  const [greetingMessage, setGreetingMessage] = useState<string | null>(null);
  const [greetingVisible, setGreetingVisible] = useState<boolean>(false);

  const [viewedConcepts, setViewedConcepts] = useState<Set<string>>(new Set());

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [currentAura, setCurrentAura] = useState<DraftAnalysis['auraSentiment']>('neutral');


  const onboardingSteps: OnboardingStep[] = [
    {
      targetSelector: '#onboarding-start-draft-button',
      content: "Welcome, Seeker! Begin your journey by starting a new draft. Choose your game mode and starting side to let the Oracle guide you.",
      placement: 'bottom',
    },
    {
      targetSelector: '#onboarding-draft-lab-button',
      content: "Peer into the Scrying Pool (Draft Lab). Here, you may freely experiment with team compositions and seek the Oracle's wisdom on your creations.",
      placement: 'top',
    },
     {
      targetSelector: '#onboarding-oracle-trials-button', 
      content: "Test your strategic acumen against the Oracle's daily trials. Wisdom awaits those who dare to solve them.",
      placement: 'top',
    },
    {
      targetSelector: '#onboarding-playbook-link',
      content: "Preserve your most potent prophecies and review visions of past drafts within your personal Tome (Playbook & History).",
      placement: 'bottom-start',
    },
     {
      targetSelector: '#onboarding-knowledge-base-button',
      content: "Unlock the Oracle's Arcana. Choose a concept, then a Champion to guide your learning with their unique voice!",
      placement: 'top',
    },
    {
      targetSelector: '#onboarding-armory-button', 
      content: "Delve into the Oracle's Armory. Explore items, understand their strategic purpose, and seek deeper wisdom on their use.",
      placement: 'top',
    }
  ];

  // Effect for DDragon data, settings, onboarding, viewed concepts (runs once on mount)
  useEffect(() => {
    const onboardingCompleted = localStorage.getItem(ONBOARDING_COMPLETED_KEY);
    if (!onboardingCompleted) {
      setShowOnboardingTour(true);
    }

    const storedViewedConcepts = localStorage.getItem(VIEWED_CONCEPTS_STORAGE_KEY);
    if (storedViewedConcepts) {
      try {
        setViewedConcepts(new Set(JSON.parse(storedViewedConcepts)));
      } catch (e) {
        console.error("Error parsing viewed concepts from localStorage:", e);
      }
    }

    const fetchDDragonData = async () => {
      setIsLoadingChampions(true);
      setIsLoadingItems(true);
      setDDragonError(null);
      try {
        const version = await getLatestDDragonVersion();
        setDdragonVersion(version);
        if (version) {
          const [championsData, itemsDataResult] = await Promise.all([
            getAllChampionsData(version),
            getAllItemsData(version) 
          ]);
          setAllChampions(Object.values(championsData));
          setAllItems(itemsDataResult);
        } else {
          throw new Error("Failed to retrieve DDragon version.");
        }
      } catch (err) {
        console.error("Failed to load DDragon data in App:", err);
        setDDragonError(err instanceof Error ? err.message : "The stars are misaligned; DDragon data could not be summoned. Please try refreshing.");
      } finally {
        setIsLoadingChampions(false);
        setIsLoadingItems(false);
      }
    };
    fetchDDragonData();

    const savedSettingsRaw = localStorage.getItem(APP_SETTINGS_STORAGE_KEY);
    if (savedSettingsRaw) {
      try {
        const savedSettings = JSON.parse(savedSettingsRaw) as AppSettings;
        setAppSettings(prev => ({
            ...prev,
            ...savedSettings,
            oraclePersonality: savedSettings.oraclePersonality || DEFAULT_ORACLE_PERSONALITY,
            enableAnimations: savedSettings.enableAnimations === undefined ? true : savedSettings.enableAnimations,
            isFocusModeActive: savedSettings.isFocusModeActive === undefined ? false : savedSettings.isFocusModeActive,
            theme: savedSettings.theme || DEFAULT_THEME,
        }));
      } catch (e) {
        console.error("Error parsing app settings from localStorage:", e);
        setAppSettings(prev => ({
            ...prev, 
            oraclePersonality: DEFAULT_ORACLE_PERSONALITY,
            enableAnimations: true, 
            isFocusModeActive: false,
            theme: DEFAULT_THEME,
        })); 
      }
    } else {
        setAppSettings(prev => ({
            ...prev, 
            oraclePersonality: DEFAULT_ORACLE_PERSONALITY,
            enableAnimations: true, 
            isFocusModeActive: false,
            theme: DEFAULT_THEME,
        })); 
    }
  }, []);

  // Effect for Greeting Message (runs once on mount)
  useEffect(() => {
    const savedDraftStateRaw = localStorage.getItem(DRAFT_STATE_STORAGE_KEY);
    if (savedDraftStateRaw) {
      try {
        const savedState = JSON.parse(savedDraftStateRaw) as Partial<SavedDraftState>;
        if ( (savedState.yourTeamPicks && savedState.yourTeamPicks.length > 0) ||
             (savedState.enemyTeamPicks && savedState.enemyTeamPicks.length > 0) ||
             (savedState.yourTeamBans && savedState.yourTeamBans.length > 0) ||
             (savedState.enemyTeamBans && savedState.enemyTeamBans.length > 0) ) {
          setGreetingMessage("Welcome back, Seeker. The Oracle guides your hand once more.");
        } else {
          setGreetingMessage("The Oracle awaits. What path will you choose today?");
        }
      } catch (e) {
        setGreetingMessage("The Oracle's sight is keen. Your journey continues.");
      }
    } else {
      setGreetingMessage("The Oracle awaits. What path will you choose today?");
    }
    setGreetingVisible(true);
    const timer = setTimeout(() => setGreetingVisible(false), 5000); 
    return () => clearTimeout(timer);
  }, []);

  // Effect for Command Palette Key Listener
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
      // This check needs to access the latest `isCommandPaletteOpen` state
      if (event.key === 'Escape' && isCommandPaletteOpen) {
        setIsCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isCommandPaletteOpen]); // isCommandPaletteOpen is needed here because the Escape logic depends on it


  const handleSetAppSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setAppSettings(prevSettings => {
      const updatedSettings = { ...prevSettings, ...newSettings };
      localStorage.setItem(APP_SETTINGS_STORAGE_KEY, JSON.stringify(updatedSettings));
      return updatedSettings;
    });
  }, []);

  useEffect(() => {
    if (appSettings.theme === 'light') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }

    if (!appSettings.enableAnimations || (appSettings.enableAnimations && appSettings.isFocusModeActive)) {
      document.body.classList.add('animations-disabled');
    } else {
      document.body.classList.remove('animations-disabled');
    }
    if (appSettings.isFocusModeActive && appSettings.enableAnimations) {
      document.body.classList.add('focus-mode-visuals-active');
    } else {
      document.body.classList.remove('focus-mode-visuals-active');
    }
  }, [appSettings.enableAnimations, appSettings.isFocusModeActive, appSettings.theme]);

  const handleUpdateDraftAura = useCallback((aura: DraftAnalysis['auraSentiment']) => {
    setCurrentAura(aura || 'neutral');
  }, []);
  
  useEffect(() => {
    document.body.classList.remove('aura-pleased', 'aura-concerned');
    if (currentView === 'DRAFT' || currentView === 'DRAFT_LAB') {
      if (currentAura === 'pleased' && appSettings.enableAnimations && !appSettings.isFocusModeActive) {
        document.body.classList.add('aura-pleased');
      } else if (currentAura === 'concerned' && appSettings.enableAnimations && !appSettings.isFocusModeActive) {
        document.body.classList.add('aura-concerned');
      }
    }
  }, [currentAura, currentView, appSettings.enableAnimations, appSettings.isFocusModeActive]);


  const handleStartDraft = useCallback((mode: DraftMode, side: TeamSide) => {
    setCurrentDraftMode(mode);
    setCurrentStartingSide(side);
    setCurrentView('DRAFT');
    handleUpdateDraftAura('neutral'); 
  }, [handleUpdateDraftAura]);

  const handleResumeLastDraft = useCallback(() => {
    const savedStateRaw = localStorage.getItem(DRAFT_STATE_STORAGE_KEY);
    if (savedStateRaw) {
      try {
        const savedState = JSON.parse(savedStateRaw) as Partial<SavedDraftState>;
        setCurrentDraftMode(savedState.currentDraftMode || 'SOLO_QUEUE'); 
        setCurrentStartingSide(savedState.userStartingSide || 'BLUE'); 
      } catch (e) {
        console.error("Error parsing saved draft state for resume:", e);
        setCurrentDraftMode('SOLO_QUEUE'); 
        setCurrentStartingSide('BLUE'); 
      }
    } else {
      setCurrentDraftMode('SOLO_QUEUE'); 
      setCurrentStartingSide('BLUE'); 
    }
    setCurrentView('DRAFT');
    handleUpdateDraftAura('neutral'); 
  }, [handleUpdateDraftAura]);

  const navigateToView = useCallback((view: AppView, params?: any) => { 
    setCurrentView(view);
    setIsCommandPaletteOpen(false); 
    if (view !== 'DRAFT' && view !== 'DRAFT_LAB') {
      handleUpdateDraftAura('neutral'); 
    }
    if (view === 'HOME') {
        setSelectedConceptForLesson(null);
        setChampionPersonaForLesson(null);
        setIsChampionPersonaSelectionModalOpen(false);
    }
  }, [handleUpdateDraftAura]);


  const handleGoHome = useCallback(() => navigateToView('HOME'), [navigateToView]);
  const handleGoToExplorer = useCallback(() => navigateToView('EXPLORER'), [navigateToView]);
  const handleGoToHistory = useCallback(() => navigateToView('HISTORY'), [navigateToView]);
  const handleGoToSettings = useCallback(() => navigateToView('SETTINGS'), [navigateToView]);
  const handleGoToPlaybook = useCallback(() => navigateToView('PLAYBOOK'), [navigateToView]);
  const handleGoToDraftLab = useCallback(() => {
    setPlaybookEntryToLoadForLab(null); 
    navigateToView('DRAFT_LAB');
    handleUpdateDraftAura('neutral');
  }, [navigateToView, handleUpdateDraftAura]);
  const handleGoToOracleTrials = useCallback(() => navigateToView('ORACLE_TRIALS'), [navigateToView]);
  const handleGoToArmory = useCallback(() => navigateToView('ARMORY'), [navigateToView]);

  
  const handleInitiateLessonWithPersona = useCallback((concept: Concept) => {
    setSelectedConceptForLesson(concept);
    setChampionPersonaForLesson(null); 
    setIsChampionPersonaSelectionModalOpen(true);
    
    setViewedConcepts(prev => {
      const newViewed = new Set(prev);
      newViewed.add(concept.id);
      localStorage.setItem(VIEWED_CONCEPTS_STORAGE_KEY, JSON.stringify(Array.from(newViewed)));
      return newViewed;
    });
  }, []);

  const handleChampionPersonaSelectedForLesson = useCallback((champion: DDragonChampionInfo) => {
    setChampionPersonaForLesson(champion);
    setIsChampionPersonaSelectionModalOpen(false);
    navigateToView('INTERACTIVE_LESSON');
  }, [navigateToView]);

  const handleCompleteLesson = useCallback(() => {
    setSelectedConceptForLesson(null);
    setChampionPersonaForLesson(null);
    navigateToView('HOME'); 
  }, [navigateToView]);


  const handleLoadPlaybookEntryToLab = useCallback((entry: PlaybookEntry) => {
    setPlaybookEntryToLoadForLab(entry);
    navigateToView('DRAFT_LAB');
    handleUpdateDraftAura('neutral');
  }, [navigateToView, handleUpdateDraftAura]);

  const handleInitialPlaybookEntryLoadedInLab = useCallback(() => {
    setPlaybookEntryToLoadForLab(null);
  }, []);
  
  const handleOnboardingComplete = () => {
    localStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
    setShowOnboardingTour(false);
  };

  const handleToggleFocusMode = () => {
    handleSetAppSettings({ isFocusModeActive: !appSettings.isFocusModeActive });
    setIsCommandPaletteOpen(false);
  };

  const handleToggleTheme = () => {
    const newTheme = appSettings.theme === 'light' ? 'dark' : 'light';
    handleSetAppSettings({ theme: newTheme });
    setIsCommandPaletteOpen(false);
  };
  
  const commandPaletteCommands: Command[] = useMemo(() => [
    { id: 'nav_home', type: 'navigation', label: 'Go to Home', action: handleGoHome, icon: HomeIcon, keywords: ['main', 'dashboard', 'start'] },
    { id: 'nav_draft_lab', type: 'navigation', label: 'Go to Draft Lab', action: handleGoToDraftLab, icon: FlaskConicalIcon, keywords: ['experiment', 'sandbox', 'practice'] },
    { id: 'nav_explorer', type: 'navigation', label: 'Go to Champion Explorer', action: handleGoToExplorer, icon: MagnifyingGlassIcon, keywords: ['champions', 'browse', 'stats', 'lookup'] },
    { id: 'nav_armory', type: 'navigation', label: 'Go to Item Armory', action: handleGoToArmory, icon: BookOpenIcon, keywords: ['items', 'builds', 'gear'] },
    { id: 'nav_playbook', type: 'navigation', label: 'Go to Playbook', action: handleGoToPlaybook, icon: StrategyTomeIcon, keywords: ['saved', 'strategies', 'comps'] },
    { id: 'nav_history', type: 'navigation', label: 'Go to Draft History', action: handleGoToHistory, icon: HistoryIcon, keywords: ['past', 'games', 'review'] },
    { id: 'nav_trials', type: 'navigation', label: 'Go to Oracle Trials', action: handleGoToOracleTrials, icon: PuzzlePieceIcon, keywords: ['puzzle', 'daily', 'challenge', 'test'] },
    { id: 'nav_settings', type: 'navigation', label: 'Go to Settings', action: handleGoToSettings, icon: Cog6ToothIcon, keywords: ['options', 'config', 'preferences'] },
    { id: 'action_toggle_theme', type: 'action', label: `Toggle Theme (Currently ${appSettings.theme})`, action: handleToggleTheme, icon: appSettings.theme === 'dark' ? SunIcon : MoonIcon, keywords: ['dark', 'light', 'mode', 'appearance'] },
    { id: 'action_toggle_focus', type: 'action', label: `Toggle Focus Mode (Currently ${appSettings.isFocusModeActive ? 'On' : 'Off'})`, action: handleToggleFocusMode, icon: appSettings.isFocusModeActive ? FocusModeEyeSlashIcon : FocusModeEyeIcon, keywords: ['zen', 'distraction', 'interface']  },
    { id: 'search_champions_link', type: 'navigation', label: 'Search Champions (in Explorer)...', action: () => { handleGoToExplorer(); }, icon: MagnifyingGlassIcon, keywords: ['find champion'] },
    { id: 'search_items_link', type: 'navigation', label: 'Search Items (in Armory)...', action: () => { handleGoToArmory(); }, icon: MagnifyingGlassIcon, keywords: ['find item'] },
    { id: 'search_concepts_link', type: 'navigation', label: 'Search Concepts (View All on Home)...', action: () => { handleGoHome(); }, icon: AcademicCapIcon, keywords: ['learn', 'find concept'] },
  ], [
      handleGoHome, handleGoToDraftLab, handleGoToExplorer, handleGoToArmory, 
      handleGoToPlaybook, handleGoToHistory, handleGoToOracleTrials, handleGoToSettings,
      handleToggleTheme, handleToggleFocusMode, appSettings.theme, appSettings.isFocusModeActive
  ]);


  const renderView = () => {
    const isLoadingData = isLoadingChampions || isLoadingItems;
    const sharedPropsLoading = {
      isLoading: isLoadingData,
      error: dDragonError,
      onGoHome: handleGoHome,
    };

    if (sharedPropsLoading.isLoading && currentView !== 'HOME' && currentView !== 'SETTINGS' && !isChampionPersonaSelectionModalOpen) {
      return (
        <div className="flex flex-col items-center justify-center flex-grow">
          <LoadingSpinner />
          <p className="mt-4 text-slate-400">The Runes Align... Summoning Champion & Item Data...</p>
          {sharedPropsLoading.error && <p className="mt-2 text-red-400">{sharedPropsLoading.error}</p>}
        </div>
      );
    }
    if (sharedPropsLoading.error && currentView !== 'HOME' && currentView !== 'SETTINGS' && !isChampionPersonaSelectionModalOpen) {
      return (
          <div className="flex flex-col items-center justify-center flex-grow p-4 lol-panel">
              <p className="text-red-400 text-center mb-4">{sharedPropsLoading.error}</p>
              <button onClick={sharedPropsLoading.onGoHome} className="lol-button lol-button-secondary">Return to Sanctuary (Home)</button>
          </div>
      );
    }

    switch (currentView) {
      case 'HOME':
        return <HomeScreen
                  onStartDraft={handleStartDraft}
                  onResumeLastDraft={handleResumeLastDraft}
                  onGoToExplorer={handleGoToExplorer}
                  onGoToHistory={handleGoToHistory}
                  onGoToPlaybook={handleGoToPlaybook}
                  onGoToDraftLab={handleGoToDraftLab}
                  onGoToArmory={handleGoToArmory} 
                  onInitiateLessonWithPersona={handleInitiateLessonWithPersona}
                  onGoToOracleTrials={handleGoToOracleTrials} 
                  ddragonVersion={ddragonVersion}
                  allChampionsData={allChampions}
                  allItemsData={allItems}
                  staticChampionData={staticChampionData as ChampionStaticInfo[]}
                  oraclePersonality={appSettings.oraclePersonality}
                  greetingMessage={greetingMessage}
                  greetingVisible={greetingVisible}
                  viewedConceptIds={Array.from(viewedConcepts)}
                  concepts={initialConceptsData} 
                />;
      case 'DRAFT':
        return <DraftingScreen
                  onGoHome={handleGoHome}
                  ddragonVersion={ddragonVersion}
                  allChampionsData={allChampions}
                  allItemsData={allItems}
                  oraclePersonality={appSettings.oraclePersonality}
                  draftMode={currentDraftMode}
                  userStartingSide={currentStartingSide} 
                  onUpdateDraftAura={handleUpdateDraftAura}
                />;
      case 'EXPLORER':
        return <ExplorerScreen
                  onGoHome={handleGoHome}
                  ddragonVersion={ddragonVersion}
                  allChampionsData={allChampions}
                  allItemsData={allItems}
                  staticChampionData={staticChampionData as ChampionStaticInfo[]}
                  oraclePersonality={appSettings.oraclePersonality}
                />;
      case 'HISTORY':
        return <HistoryScreen
                  onGoHome={handleGoHome}
                  ddragonVersion={ddragonVersion}
                  allChampionsData={allChampions}
                  allItemsData={allItems}
                />;
      case 'SETTINGS':
        return <SettingsScreen
                  onGoHome={handleGoHome}
                  currentSettings={appSettings}
                  onSaveSettings={(newSettings) => handleSetAppSettings(newSettings)}
                />;
      case 'PLAYBOOK':
        return <PlaybookScreen
                  onGoHome={handleGoHome}
                  ddragonVersion={ddragonVersion}
                  allChampionsData={allChampions}
                  allItemsData={allItems}
                  onLoadPlaybookEntryToLab={handleLoadPlaybookEntryToLab}
                />;
      case 'DRAFT_LAB':
        return <DraftLabScreen
                  onGoHome={handleGoHome}
                  ddragonVersion={ddragonVersion}
                  allChampionsData={allChampions}
                  allItemsData={allItems}
                  staticChampionData={staticChampionData as ChampionStaticInfo[]}
                  oraclePersonality={appSettings.oraclePersonality}
                  initialPlaybookEntryToLoad={playbookEntryToLoadForLab}
                  onInitialPlaybookEntryLoaded={handleInitialPlaybookEntryLoadedInLab}
                  onUpdateDraftAura={handleUpdateDraftAura}
                />;
      case 'INTERACTIVE_LESSON':
        if (!selectedConceptForLesson) { 
            handleGoHome(); 
            return null;
        }
        if (sharedPropsLoading.isLoading) {
             return (
                <div className="flex flex-col items-center justify-center flex-grow">
                  <LoadingSpinner />
                  <p className="mt-4 text-slate-400">The Runes Align... Summoning Data for Your Lesson...</p>
                </div>
            );
        }
        if (sharedPropsLoading.error) {
             return (
                <div className="flex flex-col items-center justify-center flex-grow p-4 lol-panel">
                  <p className="text-red-400 text-center mb-4">
                    A cosmic disturbance affects the champion/item data: {sharedPropsLoading.error} The lesson's wisdom may be partially obscured.
                  </p>
                  <button onClick={handleGoHome} className="lol-button lol-button-secondary mr-2">Return to Sanctuary (Home)</button>
                </div>
            );
        }

        return <InteractiveLessonScreen
                  selectedConcept={selectedConceptForLesson}
                  championPersona={championPersonaForLesson}
                  onCompleteLesson={handleCompleteLesson}
                  oraclePersonality={appSettings.oraclePersonality}
                  allChampionsData={allChampions}
                  allItemsData={allItems}
                  ddragonVersion={ddragonVersion}
                  staticChampionData={staticChampionData as ChampionStaticInfo[]}
                />;
       case 'ORACLE_TRIALS': 
        if (sharedPropsLoading.isLoading) { 
          return (
            <div className="flex flex-col items-center justify-center flex-grow">
              <LoadingSpinner />
              <p className="mt-4 text-slate-400">Preparing the Oracle's Trial Chamber...</p>
            </div>
          );
        }
        if (sharedPropsLoading.error) {
          return (
            <div className="flex flex-col items-center justify-center flex-grow p-4 lol-panel">
              <p className="text-red-400 text-center mb-4">A cosmic disturbance affects the champion/item data: {sharedPropsLoading.error} The Oracle's Trials may be unstable.</p>
              <button onClick={handleGoHome} className="lol-button lol-button-secondary">Return to Sanctuary</button>
            </div>
          );
        }
        return <OracleTrialsScreen
                  onGoHome={handleGoHome}
                  ddragonVersion={ddragonVersion}
                  allChampionsData={allChampions}
                  allItemsData={allItems}
                  staticChampionData={staticChampionData as ChampionStaticInfo[]}
                />;
      case 'ARMORY': 
        if (sharedPropsLoading.isLoading) {
          return (
            <div className="flex flex-col items-center justify-center flex-grow">
              <LoadingSpinner />
              <p className="mt-4 text-slate-400">Forging the Oracle's Armory...</p>
            </div>
          );
        }
         if (sharedPropsLoading.error || !allItems) {
          return (
            <div className="flex flex-col items-center justify-center flex-grow p-4 lol-panel">
              <p className="text-red-400 text-center mb-4">
                {sharedPropsLoading.error || "Item data is unavailable. The Armory cannot be accessed."}
              </p>
              <button onClick={handleGoHome} className="lol-button lol-button-secondary">Return to Sanctuary</button>
            </div>
          );
        }
        return <ArmoryScreen
                  onGoHome={handleGoHome}
                  ddragonVersion={ddragonVersion}
                  allItemsData={allItems}
                  itemStaticData={itemStaticData as ItemStaticInfo[]} 
                  oraclePersonality={appSettings.oraclePersonality}
                />;
      default:
        handleGoHome();
        return null;
    }
  };

  const getHeaderDescription = () => {
    const modeTextSolo = "Ranked Draft (Solo/Duo & Flex)";
    const modeTextComp = "Competitive Draft (Clash & Professional)";
    const sideTextBlue = "Blue Side Start";
    const sideTextRed = "Red Side Start";
    
    switch(currentView) {
      case 'HOME':
        return "The Oracle awaits. Seek insights for your League of Legends drafts.";
      case 'DRAFT':
        const modeText = currentDraftMode === 'COMPETITIVE' ? modeTextComp : modeTextSolo;
        const sideText = currentStartingSide === 'BLUE' ? sideTextBlue : sideTextRed;
        return `Drafting Chamber: ${modeText} - ${sideText}.`;
      case 'EXPLORER':
        return "Strategy Explorer: Query the Oracle for champion lore, synergies, and counters.";
      case 'HISTORY':
        return "Draft History: Review past drafts and the Oracle's analyses.";
      case 'SETTINGS':
        return "Settings: Customize your interaction with the Oracle.";
      case 'PLAYBOOK':
        return "Playbook: Manage your saved draft strategies and compositions.";
      case 'DRAFT_LAB':
        return "Draft Lab: Experiment with team compositions and get instant feedback.";
      case 'INTERACTIVE_LESSON':
        const personaName = championPersonaForLesson ? championPersonaForLesson.name : "the Oracle";
        return `${personaName} teaches: ${selectedConceptForLesson?.title || 'A Lesson'}.`;
      case 'ORACLE_TRIALS': 
        return "Oracle's Trials: Test your strategic acumen with daily draft puzzles.";
      case 'ARMORY': 
        return "Oracle's Armory: Explore items and seek the Oracle's wisdom on their strategic use.";
      default:
        return "The Oracle awaits. Seek insights for your League of Legends drafts.";
    }
  };


  return (
    <div className={`min-h-screen flex flex-col items-center p-4 sm:p-6 md:p-8 selection:bg-yellow-300 selection:text-slate-900 relative`}>
      <div className="particle-container" aria-hidden="true">
        <div className="particle p1"></div>
        <div className="particle p2"></div>
        <div className="particle p3"></div>
        <div className="particle p4"></div>
        <div className="particle p5"></div>
        <div className="particle p6"></div>
      </div>
      
      <header className="w-full max-w-6xl mb-8 relative z-10"> {/* Increased mb */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleGoHome}
            title="Return to the Oracle's Sanctuary (Home)"
            className="flex items-center space-x-3 p-1 rounded-full text-[var(--accent-yellow)] hover:text-[hsl(var(--accent-yellow-hsl),0.8)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-yellow)] group"
            aria-label="Go Home"
          >
            <OracleEyeIcon className="h-12 w-12 sm:h-14 sm:w-14 group-hover:rotate-[15deg] transition-transform duration-200" /> {/* Increased icon size */}
            <h1
              className={`app-title text-4xl sm:text-5xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-[var(--accent-yellow)] to-[var(--accent-amber)] py-1 group-hover:from-sky-300 group-hover:via-[hsl(var(--accent-yellow-hsl),0.9)] group-hover:to-[hsl(var(--accent-amber-hsl),0.9)] transition-colors ${appSettings.enableAnimations && currentView === 'HOME' ? 'animate-textFlipInX' : ''}`}
            >
              {APP_TITLE}
            </h1>
          </button>
          <div className="flex items-center space-x-1.5 sm:space-x-2.5"> {/* Increased spacing */}
             <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="p-2 sm:p-2.5 rounded-full text-slate-400 hover:text-[var(--accent-yellow)] hover:bg-slate-800/60 transition-colors duration-150" // Increased padding
              title="Open Command Palette (Ctrl+K)"
              aria-label="Open Command Palette"
            >
              <MagnifyingGlassIcon className="w-6 h-6 sm:w-7 sm:h-7" /> {/* Increased icon size */}
            </button>
            <button
              id="onboarding-playbook-link"
              onClick={handleGoToPlaybook}
              className="p-2 sm:p-2.5 rounded-xl text-slate-400 hover:text-[var(--accent-yellow)] hover:bg-slate-800/60 transition-colors duration-150 flex items-center space-x-1.5 sm:space-x-2 text-base" // Increased padding & text size
              title="Open Your Tome of Prophecies (Playbook)"
              aria-label="Open My Playbook"
            >
              <StrategyTomeIcon className="w-6 h-6 sm:w-7 sm:h-7" /> {/* Increased icon size */}
              <span className="hidden sm:inline">Playbook</span>
            </button>
             <button
              onClick={handleToggleTheme}
              className="p-2 sm:p-2.5 rounded-full text-slate-400 hover:text-[var(--accent-yellow)] hover:bg-slate-800/60 transition-colors duration-150" // Increased padding
              title={appSettings.theme === 'dark' ? "Switch to Light Theme" : "Switch to Dark Theme"}
              aria-label={appSettings.theme === 'dark' ? "Enable Light Theme" : "Enable Dark Theme"}
            >
              {appSettings.theme === 'dark' ? 
                <SunIcon className="w-6 h-6 sm:w-7 sm:h-7" /> :  /* Increased icon size */
                <MoonIcon className="w-6 h-6 sm:w-7 sm:h-7 text-[var(--accent-yellow)]" /> /* Increased icon size */
              }
            </button>
            <button
              onClick={handleToggleFocusMode}
              className="p-2 sm:p-2.5 rounded-full text-slate-400 hover:text-[var(--accent-yellow)] hover:bg-slate-800/60 transition-colors duration-150" // Increased padding
              title={appSettings.isFocusModeActive ? "Disable Oracle's Focus" : "Enable Oracle's Focus"}
              aria-label={appSettings.isFocusModeActive ? "Disable Focus Mode" : "Enable Focus Mode"}
              aria-pressed={appSettings.isFocusModeActive}
            >
              {appSettings.isFocusModeActive ? 
                <FocusModeEyeSlashIcon className="w-6 h-6 sm:w-7 sm:h-7 text-[var(--accent-yellow)]" /> : /* Increased icon size */
                <FocusModeEyeIcon className="w-6 h-6 sm:w-7 sm:h-7" /> /* Increased icon size */
              }
            </button>
            <button
              onClick={handleGoToSettings}
              className="p-2 sm:p-2.5 rounded-full text-slate-400 hover:text-[var(--accent-yellow)] hover:bg-slate-800/60 transition-colors duration-150" // Increased padding
              title="Attune Your Oracle (Settings)"
              aria-label="Open Settings"
            >
              <Cog6ToothIcon className="w-6 h-6 sm:w-7 sm:h-7" /> {/* Increased icon size */}
            </button>
          </div>
        </div>
         <p className={`text-slate-300 text-base sm:text-lg text-center mt-2 ${appSettings.enableAnimations ? 'animate-fadeIn' : ''}`}> {/* Increased font size and margin */}
            {getHeaderDescription()}
        </p>
      </header>

      <main className="w-full max-w-6xl space-y-8 flex-grow flex flex-col relative z-10"> {/* Increased space-y */}
        <div 
          id="main-content-panel"
          className={`${appSettings.enableAnimations ? 'animate-fadeInUp' : ''} w-full h-full flex flex-col lol-panel p-4 sm:p-6 md:p-6 overflow-hidden rounded-2xl ${appSettings.isFocusModeActive && appSettings.enableAnimations ? 'lol-panel-focused' : ''}`} /* Increased padding */
        > 
           {renderView()}
        </div>
      </main>

      <footer className="w-full max-w-6xl mt-12 text-center text-slate-400 text-base relative z-10"> {/* Increased margin and font size */}
        <p>&copy; {new Date().getFullYear()} {APP_TITLE}. Powered by the whispers of Gemini ({GEMINI_MODEL_NAME}).</p>
        <p>This conduit to visions is not affiliated with Riot Games.</p>
      </footer>
      
      {showOnboardingTour && currentView === 'HOME' && (
        <OnboardingTour
          steps={onboardingSteps}
          onComplete={handleOnboardingComplete}
        />
      )}

      {isChampionPersonaSelectionModalOpen && ddragonVersion && allChampions.length > 0 && selectedConceptForLesson && (
        <ChampionGridModal
          isOpen={isChampionPersonaSelectionModalOpen}
          onClose={() => {
            setIsChampionPersonaSelectionModalOpen(false);
            setSelectedConceptForLesson(null); 
          }}
          champions={allChampions}
          ddragonVersion={ddragonVersion}
          onChampionSelect={handleChampionPersonaSelectedForLesson}
          modalTitle={`Learn ${selectedConceptForLesson.title} from...`}
          championStaticData={staticChampionData as ChampionStaticInfo[]}
          disabledChampionIds={[]} 
        />
      )}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        commands={commandPaletteCommands}
        champions={allChampions}
        items={allItems ? Object.values(allItems.data) as DDragonItemInfo[] : []}
        concepts={initialConceptsData}
        ddragonVersion={ddragonVersion}
        navigateTo={navigateToView}
      />
    </div>
  );
};

export default App;
