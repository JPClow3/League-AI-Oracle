import { Toaster, toast } from 'react-hot-toast';
import { Analytics } from '@vercel/analytics/react';
import type { Page, DraftState } from './types';
import { Header } from './components/Layout/Header';
import { Footer } from './components/Layout/Footer';
import { BottomNav } from './components/Layout/BottomNav';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { SEO } from './components/common/SEO';
import { OfflineIndicator } from './components/common/OfflineIndicator';
import { useSettings } from './hooks/useSettings';
import { useUserProfile } from './hooks/useUserProfile';
import { getInitialDraftState, useDraft } from './contexts/DraftContext';
import { ProfileSetupModal } from './components/Onboarding/ProfileSetupModal';
import { SettingsPanel } from './components/Settings/SettingsPanel';
import { ProfileSettingsModal } from './components/Settings/ProfileSettingsModal';
import { FeedbackModal } from './components/Feedback/FeedbackModal';
import { KeyboardShortcutsModal } from './components/common/KeyboardShortcutsModal';
import { CommandPalette } from './components/common/CommandPalette';
import { useCommands } from './hooks/useCommands';
import { Router } from './components/Router';
import { useModals } from './hooks/useModals';
import { ROLES } from './constants';
import { useChampions } from './contexts/ChampionContext';
import { Loader } from './components/common/Loader';
import { analytics } from './lib/analytics';
import * as storageService from './services/storageService';
import { performanceMonitor } from './lib/performanceMonitor';
import { logAccessibilityAudit } from './lib/accessibility';
import { useState, useEffect, useCallback } from 'react';

const App = () => {
  const [currentPage, setCurrentPage] = useState<Page>('Home');
  const { settings, setSettings } = useSettings();
  const { profile, checkStreak, initializeNewProfile, spForNextLevel, isHydrated } = useUserProfile();
  const { modals, dispatch } = useModals();
  const { champions, isLoading: isChampionsLoading, error: championsError } = useChampions();

  const { setDraftState, resetDraft } = useDraft();
  const [liveDraftState, setLiveDraftState] = useState<DraftState>(getInitialDraftState());
  const [arenaDraftState, setArenaDraftState] = useState<DraftState>(getInitialDraftState());

  // State for navigation with parameters
  const [academyInitialLessonId, setAcademyInitialLessonId] = useState<string | undefined>();
  const [strategyHubInitialTab, setStrategyHubInitialTab] = useState<'champions' | 'intel'>('champions');
  const [strategyHubInitialSearch, setStrategyHubInitialSearch] = useState<string | null>(null);

  const [startLabTour, setStartLabTour] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Apply theme to the document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
  }, [settings.theme]);

  // Track page views
  useEffect(() => {
    analytics.pageView(currentPage);
  }, [currentPage]);

  // Clear stale navigation state when navigating away from pages
  useEffect(() => {
    // Clear Academy lesson ID when leaving Academy
    if (currentPage !== 'Academy' && academyInitialLessonId !== undefined) {
      setTimeout(() => setAcademyInitialLessonId(undefined), 0);
    }

    // Clear Armory search/tab when leaving Armory
    if (currentPage !== 'The Armory') {
      if (strategyHubInitialSearch !== null || strategyHubInitialTab !== 'champions') {
        setTimeout(() => {
          setStrategyHubInitialTab('champions');
          setStrategyHubInitialSearch(null);
        }, 0);
      }
    }
  }, [currentPage, academyInitialLessonId, strategyHubInitialSearch, strategyHubInitialTab]);

  // Check if onboarding is complete
  useEffect(() => {
    const onboardingComplete = localStorage.getItem('onboardingComplete');
    if (!onboardingComplete && isHydrated) {
      dispatch({ type: 'OPEN_ONBOARDING' });
    }
  }, [dispatch, isHydrated]);

  // Run cache eviction on startup
  useEffect(() => {
    storageService.evictExpiredCache();
  }, []);

  // Initialize performance monitoring
  useEffect(() => {
    if (typeof window !== 'undefined') {
      performanceMonitor.initializeMonitoring();

      // Run accessibility audit in development
      if (import.meta.env.DEV) {
        setTimeout(() => {
          logAccessibilityAudit();
        }, 2000); // Wait for initial render
      }
    }
  }, []);

  const handleOnboardingComplete = (data: {
    username: string;
    skillLevel: 'Beginner' | 'Intermediate' | 'Advanced';
    avatar: string;
    goals: string[];
    favoriteChampions: string[];
  }) => {
    initializeNewProfile(data);
    setSettings({
      primaryRole: data.favoriteChampions.length > 0 ? settings.primaryRole : 'All',
      favoriteChampions: data.favoriteChampions,
    });
    localStorage.setItem('onboardingComplete', 'true');
    dispatch({ type: 'CLOSE', payload: 'onboarding' });
    setStartLabTour(true);
  };

  const handleTourComplete = () => setStartLabTour(false);

  // Reset draft states
  const resetLiveDraft = useCallback(() => setLiveDraftState(getInitialDraftState()), []);
  const resetArena = useCallback(() => setArenaDraftState(getInitialDraftState()), []);

  // Daily streak check - runs on mount and periodically for PWA users
  useEffect(() => {
    let streakInterval: NodeJS.Timeout | undefined;

    if (isHydrated) {
      checkStreak();

      // Check streak every hour for users who keep the PWA open
      // This ensures daily challenges refresh at midnight even without reload
      streakInterval = setInterval(
        () => {
          checkStreak();
        },
        60 * 60 * 1000
      ); // Every 1 hour
    }

    return () => {
      if (streakInterval) {
        clearInterval(streakInterval);
      }
    };
  }, [checkStreak, isHydrated]);

  // Command Palette Hotkey
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsCommandPaletteOpen((prev: boolean) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Navigation functions
  const navigateToAcademy = (lessonId: string) => {
    setAcademyInitialLessonId(lessonId);
    setCurrentPage('Academy');
  };

  const navigateToArmory = (tab: 'champions' | 'intel') => {
    setStrategyHubInitialTab(tab);
    setCurrentPage('The Armory');
  };

  const loadDraftAndNavigate = (draft: DraftState) => {
    setDraftState(draft);
    setCurrentPage('Strategy Forge');
  };

  const loadChampionToLab = (championId: string, role?: string) => {
    const champ = champions.find(c => c.id === championId);
    if (!champ) {
      console.error(`Champion with id "${championId}" not found`);
      toast.error('Champion not found');
      return;
    }

    setDraftState(prev => {
      let roleIndex = -1;

      if (role) {
        // Handle common role name variations
        const normalizedRole = role.toLowerCase();
        const roleMap: { [key: string]: string } = {
          bot: 'ADC',
          adc: 'ADC',
          bottom: 'ADC',
          top: 'Top',
          jungle: 'Jungle',
          jg: 'Jungle',
          mid: 'Mid',
          middle: 'Mid',
          support: 'Support',
          sup: 'Support',
          supp: 'Support',
        };

        const mappedRole = roleMap[normalizedRole] || role;
        roleIndex = ROLES.indexOf(mappedRole);

        if (roleIndex === -1) {
          console.warn(`Role "${role}" not found in ROLES array. Available roles:`, ROLES);
          toast.error(`Invalid role: ${role}. Placing in first available slot.`);
        }
      }

      const newPicks = [...prev.blue.picks];

      if (roleIndex !== -1 && newPicks[roleIndex]) {
        newPicks[roleIndex] = { champion: champ, isActive: false };
      } else {
        const emptyIndex = newPicks.findIndex(p => p.champion === null);
        if (emptyIndex !== -1) {
          newPicks[emptyIndex] = { champion: champ, isActive: false };
        } else {
          toast.error('All pick slots are full. Champion not added.');
          return prev;
        }
      }

      return { ...prev, blue: { ...prev.blue, picks: newPicks } };
    });

    setCurrentPage('Strategy Forge');
    toast.success(`${champ.name} added to Strategy Forge`);
  };

  const loadChampionsAndNavigateToForge = (championIds: string[]) => {
    const newDraft = getInitialDraftState();

    championIds.forEach((id, i) => {
      if (i < newDraft.blue.picks.length) {
        const champ = champions.find(c => c.id === id);
        if (champ) {
          newDraft.blue.picks[i] = {
            ...newDraft.blue.picks[i],
            champion: champ,
            isActive: newDraft.blue.picks[i]?.isActive || false,
          };
        }
      }
    });

    setDraftState(newDraft);
    setCurrentPage('Strategy Forge');
    toast.success('Blueprint loaded into the Strategy Forge!');
  };

  const commands = useCommands({
    setCurrentPage,
    resetDraft,
    resetArena,
    resetLiveDraft,
    setStrategyHubInitialTab,
    setStrategyHubInitialSearch,
  });

  const renderContent = () => {
    if (isChampionsLoading || !isHydrated) {
      return (
        <div className="flex-grow flex items-center justify-center">
          <Loader messages={['Loading Champion Database...', 'Personalizing Your Experience...']} />
        </div>
      );
    }

    if (championsError) {
      // CRITICAL: Return error UI and prevent any component rendering
      // This prevents crashes from components trying to use empty champions array
      return (
        <div className="flex-grow flex items-center justify-center p-4">
          <div className="text-center bg-error/10 p-8 border border-error/20 text-error max-w-md">
            <h2 className="text-2xl font-bold mb-4">Failed to Load Champion Data</h2>
            <p className="mb-2">{championsError}</p>
            <p className="text-sm mb-4">Please check your internet connection and refresh the page.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-error text-white rounded hover:bg-error/80 transition-colors"
              aria-label="Reload page to retry loading champion data"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    // Only render Router if champions are loaded successfully
    return (
      <main className="flex-grow w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        {/* ✅ BUG FIX: Wrap Router in ErrorBoundary to prevent full app crashes */}
        <ErrorBoundary>
          <Router
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            navigateToArmory={navigateToArmory}
            startLabTour={startLabTour}
            handleTourComplete={handleTourComplete}
            navigateToAcademy={navigateToAcademy}
            liveDraftState={liveDraftState}
            setLiveDraftState={setLiveDraftState}
            resetLiveDraft={resetLiveDraft}
            arenaDraftState={arenaDraftState}
            setArenaDraftState={setArenaDraftState}
            resetArena={resetArena}
            loadDraftAndNavigate={loadDraftAndNavigate}
            academyInitialLessonId={academyInitialLessonId}
            setAcademyInitialLessonId={setAcademyInitialLessonId}
            strategyHubInitialTab={strategyHubInitialTab}
            strategyHubInitialSearch={strategyHubInitialSearch}
            loadChampionToLab={loadChampionToLab}
            loadChampionsAndNavigateToForge={loadChampionsAndNavigateToForge}
            setStrategyHubInitialTab={setStrategyHubInitialTab}
            setStrategyHubInitialSearch={setStrategyHubInitialSearch}
          />
        </ErrorBoundary>
      </main>
    );
  };

  return (
    <ErrorBoundary>
      <SEO />
      <div className="flex flex-col min-h-screen">
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'hsl(var(--surface-tertiary))',
              color: 'hsl(var(--text-primary))',
              border: '1px solid hsl(var(--border))',
            },
          }}
        />
        <ProfileSetupModal isOpen={modals.onboarding} onComplete={handleOnboardingComplete} />
        <SettingsPanel />
        <ProfileSettingsModal />
        <FeedbackModal />
        <KeyboardShortcutsModal
          isOpen={modals.keyboardShortcuts}
          onClose={() => dispatch({ type: 'CLOSE', payload: 'keyboardShortcuts' })}
        />
        <CommandPalette
          isOpen={isCommandPaletteOpen}
          onClose={() => setIsCommandPaletteOpen(false)}
          commands={commands}
        />
        <Header
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          profile={profile}
          spForNextLevel={spForNextLevel}
        />
        {renderContent()}
        <Footer />
        <BottomNav currentPage={currentPage} setCurrentPage={setCurrentPage} />
        <OfflineIndicator />
        {/* Vercel Web Analytics */}
        <Analytics />
        <div className="pb-16 md:pb-0" /> {/* Spacer for BottomNav */}
      </div>
    </ErrorBoundary>
  );
};

export default App;
