import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, DDragonData, DraftState, Aura, SharePayload, Champion } from './types';
import { ddragonService } from './services/ddragonService';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useProfile } from './contexts/ProfileContext';
import { useDraftStore } from './store/draftStore';

import Home from './Home';
import DraftingScreen from './components/DraftingScreen';
import DraftLab from './components/DraftLab';
import ArmoryScreen from './components/ArmoryScreen';
import HistoryScreen from './components/HistoryScreen';
import LessonsScreen from './components/LessonsScreen';
import TrialsScreen from './components/TrialsScreen';
import Header from './components/Header';
import CommandPalette from './components/CommandPalette';
import ProfileSelectionScreen from './components/ProfileSelectionScreen';
import OnboardingScreen from './components/OnboardingScreen';
import { ErrorCard } from './components/common/ErrorCard';
import PlaybookScreen from './components/PlaybookScreen';
import ProfileScreen from './components/ProfileScreen';
import ErrorBoundary from './components/common/ErrorBoundary';
import { shareService } from './utils/shareService';
import SharedDraftScreen from './components/SharedDraftScreen';
import { NotificationHub } from './components/common/NotificationHub';
import ScoutScreen from './components/ScoutScreen';
import { riotService } from './services/riotService';
import { InitialLoadingScreen } from './components/common/InitialLoadingScreen';
import { FeatureDisabledScreen } from './components/common/FeatureDisabledScreen';

const App: React.FC = () => {
  const { activeProfile, loading: profileLoading } = useProfile();
  const [view, setView] = useState<View>(View.HOME);
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('draftwise_theme', 'dark');
  
  const [ddragonData, setDdragonData] = useState<DDragonData | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [aura, setAura] = useState<Aura>('neutral');
  const [hoverAura, setHoverAura] = useState<string | null>(null);
  const loadDraft = useDraftStore(state => state.actions.loadDraft);
  
  const [sharedDraft, setSharedDraft] = useState<SharePayload | null>(null);
  const [isParsingShare, setIsParsingShare] = useState(true);
  
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [selectedTrialId, setSelectedTrialId] = useState<string | null>(null);
  const [initialArmoryChampion, setInitialArmoryChampion] = useState<Champion | null>(null);


  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.classList.toggle('light', theme === 'light');
  }, [theme]);
  
  useEffect(() => {
    const auras: Aura[] = ['neutral', 'positive', 'negative', 'thinking', 'ad-focused', 'ap-focused'];
    const classList = document.documentElement.classList;
    auras.forEach(a => classList.remove(`aura-${a}`));
    if (aura) {
        classList.add(`aura-${aura}`);
    }
  }, [aura]);

  useEffect(() => {
    const hoverAuras = ['engage', 'positive', 'negative'];
    const classList = document.documentElement.classList;
    hoverAuras.forEach(a => classList.remove(`hover-aura-${a}`));
    if (hoverAura) {
        classList.add(`hover-aura-${hoverAura}`);
    }
  }, [hoverAura]);


  const fetchDDragonData = useCallback(async () => {
    try {
      setError(null);
      setIsLoadingData(true);
      const data = await ddragonService.getAllData();
      setDdragonData(data);
    } catch (err) {
      setError('Failed to load game data. The servers might be down or your connection is unstable.');
      console.error(err);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    const parseUrl = async () => {
        const params = new URLSearchParams(window.location.search);
        const shareData = params.get('share');
        if (shareData) {
            try {
                const decoded = await shareService.decodeFromUrl(shareData);
                setSharedDraft(decoded);
            } catch (e) {
                console.error("Failed to decode share link", e);
                // Clear the invalid param so a refresh doesn't retry
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        }
        setIsParsingShare(false);
    };
    parseUrl();
    fetchDDragonData();
  }, [fetchDDragonData]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      setCommandPaletteOpen(prev => !prev);
    }
  }, []);
  
  const loadDraftInLab = useCallback((draft: DraftState) => {
    loadDraft(draft);
    setView(View.DRAFT_LAB);
  }, [loadDraft, setView]);

  const handleNavigateToLesson = useCallback((lessonId: string) => {
    setSelectedLessonId(lessonId);
    setView(View.LESSONS);
  }, []);

  const handleNavigateToTrial = useCallback((trialId: string) => {
    setSelectedTrialId(trialId);
    setView(View.TRIALS);
  }, []);
  
  const handleNavigateToArmory = useCallback((champion: Champion) => {
    setInitialArmoryChampion(champion);
    setView(View.ARMORY);
  }, []);


  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const renderContent = () => {
    if (isParsingShare || profileLoading || isLoadingData) {
        let message = 'Initializing...';
        if (isParsingShare) message = 'Decoding shared draft...';
        else if (profileLoading) message = 'Loading Commander profiles...';
        else if (isLoadingData) message = 'Calibrating strategic matrices...';
        
      return <InitialLoadingScreen message={message} />;
    }
    
    if (error) {
       return (
        <div className="flex justify-center items-center h-screen bg-slate-50 dark:bg-slate-900">
          <ErrorCard
            title="Data Fetch Error"
            message={error}
            onRetry={fetchDDragonData}
          />
        </div>
      );
    }
    
     if (!ddragonData) {
        return <div className="flex justify-center items-center h-screen">Something went wrong. Please refresh the page.</div>;
    }

    if(sharedDraft) {
      return <SharedDraftScreen sharedData={sharedDraft} ddragonData={ddragonData} />;
    }
    
    if (!activeProfile) {
        return <ProfileSelectionScreen />;
    }

    if (activeProfile.isNew && !activeProfile.isOnboarded) {
        return <OnboardingScreen ddragonData={ddragonData} />;
    }

    switch (view) {
      case View.HOME:
        return <Home setView={setView} ddragonData={ddragonData} />;
      case View.PROFILE:
        return <ProfileScreen ddragonData={ddragonData} setView={setView} onNavigateToLesson={handleNavigateToLesson} />;
      case View.DRAFTING:
        return <DraftingScreen ddragonData={ddragonData} setAura={setAura} setView={setView} setHoverAura={setHoverAura} onNavigateToLesson={handleNavigateToLesson} />;
      case View.DRAFT_LAB:
        return <DraftLab ddragonData={ddragonData} setAura={setAura} setView={setView} setHoverAura={setHoverAura} />;
      case View.SCOUT:
        return riotService.isConfigured() 
            ? <ScoutScreen ddragonData={ddragonData} /> 
            : <FeatureDisabledScreen 
                featureName="Live Game Scout" 
                reason="This feature is disabled. Please provide a RIOT_API_KEY in the app's environment settings to enable it." 
              />;
      case View.ARMORY:
        return <ArmoryScreen 
                    ddragonData={ddragonData}
                    initialChampion={initialArmoryChampion}
                    onInitialChampionConsumed={() => setInitialArmoryChampion(null)} 
                />;
      case View.HISTORY:
        return <HistoryScreen ddragonData={ddragonData} setView={setView} onNavigateToLesson={handleNavigateToLesson} />;
      case View.PLAYBOOK:
        return <PlaybookScreen ddragonData={ddragonData} setView={setView} loadDraftInLab={loadDraftInLab} />;
      case View.LESSONS:
        return <LessonsScreen ddragonData={ddragonData} setView={setView} selectedLessonId={selectedLessonId} onClearSelectedLesson={() => setSelectedLessonId(null)} onNavigateToTrial={handleNavigateToTrial} />;
       case View.TRIALS:
        return <TrialsScreen ddragonData={ddragonData} setView={setView} selectedTrialId={selectedTrialId} onClearSelectedTrial={() => setSelectedTrialId(null)} />;
      default:
        return <Home setView={setView} ddragonData={ddragonData} />;
    }
  };

  const allChampions = useMemo(() => (ddragonData ? Object.values(ddragonData.champions) : []), [ddragonData]);
  const allItems = useMemo(() => (ddragonData ? Object.values(ddragonData.items) : []), [ddragonData]);
  
  const showHeader = !isParsingShare && !sharedDraft && activeProfile && !(activeProfile.isNew && !activeProfile.isOnboarded);
  
  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 transition-colors duration-200`}>
      {showHeader && (
        <Header
          currentView={view}
          setView={setView}
          theme={theme}
          setTheme={setTheme}
          onCommandPaletteOpen={() => setCommandPaletteOpen(true)}
        />
      )}
      <main className={`container mx-auto px-4 ${showHeader ? 'py-8' : 'py-0'}`}>
        <ErrorBoundary>
            <div key={view} className="animate-slide-fade-in">
                {renderContent()}
            </div>
        </ErrorBoundary>
      </main>
      {isCommandPaletteOpen && ddragonData && (
        <CommandPalette
          isOpen={isCommandPaletteOpen}
          onClose={() => setCommandPaletteOpen(false)}
          setView={setView}
          champions={allChampions}
          items={allItems}
          onNavigateToArmory={handleNavigateToArmory}
        />
      )}
      <NotificationHub onNavigateToLesson={handleNavigateToLesson} />
    </div>
  );
};

export default App;