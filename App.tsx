import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Toaster, toast } from 'react-hot-toast';
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

    // One ref object to hold refs for all pages
    const pageRefs = useRef<{ [key: string]: React.RefObject<HTMLDivElement> }>({});

    // Apply theme to the document
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', settings.theme);
    }, [settings.theme]);

    // Track page views
    useEffect(() => {
        analytics.pageView(currentPage);
    }, [currentPage]);

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

    const handleOnboardingComplete = (data: { username: string; skillLevel: 'Beginner' | 'Intermediate' | 'Advanced'; avatar: string, goals: string[], favoriteChampions: string[] }) => {
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

    // Daily streak check
    useEffect(() => {
        if (isHydrated) { // Only check streak after profile is loaded
            checkStreak();
        }
    }, [checkStreak, isHydrated]);

    // Command Palette Hotkey
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setIsCommandPaletteOpen(prev => !prev);
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
        if (!champ) {return;}
        
        setDraftState(prev => {
            const roleIndex = role ? ROLES.indexOf(role) : -1;
            const newPicks = [...prev.blue.picks];
            if (roleIndex !== -1) {
                newPicks[roleIndex] = { champion: champ, isActive: false };
            } else {
                 const emptyIndex = newPicks.findIndex(p => p.champion === null);
                 if (emptyIndex !== -1) {
                     newPicks[emptyIndex] = { champion: champ, isActive: false };
                 }
            }
            return { ...prev, blue: { ...prev.blue, picks: newPicks }};
        });
        
        setCurrentPage('Strategy Forge');
    };

    const loadChampionsAndNavigateToForge = (championIds: string[]) => {
        const blueprintChamps = championIds.map(id => champions.find(c => c.id === id) || null);
        
        const newDraft = getInitialDraftState();
        newDraft.blue.picks = newDraft.blue.picks.map((slot, i) =>
            i < blueprintChamps.length ? { ...slot, champion: blueprintChamps[i] } : slot
        );

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
                    <Loader messages={["Loading Champion Database...", "Personalizing Your Experience..."]} />
                </div>
            );
        }

        if (championsError) {
             return (
                <div className="flex-grow flex items-center justify-center p-4">
                    <div className="text-center bg-error/10 p-8 border border-error/20 text-error">
                        <h2 className="text-2xl font-bold">Failed to Load Champion Data</h2>
                        <p>{championsError}</p>
                        <p className="mt-2 text-sm">Please check your internet connection and refresh the page.</p>
                    </div>
                </div>
             );
        }

        return (
             <main className="flex-grow w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
                <Router
                    currentPage={currentPage}
                    pageRefs={pageRefs}
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

                <ProfileSetupModal
                    isOpen={modals.onboarding}
                    onComplete={handleOnboardingComplete}
                />
                
                <SettingsPanel />
                <ProfileSettingsModal />
                <FeedbackModal />
                <KeyboardShortcutsModal
                    isOpen={modals.keyboardShortcuts}
                    onClose={() => dispatch({ type: 'CLOSE', payload: 'keyboardShortcuts' })}
                />
                <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} commands={commands} />

                <Header currentPage={currentPage} setCurrentPage={setCurrentPage} profile={profile} spForNextLevel={spForNextLevel} />

                {renderContent()}
                
                <Footer />
                <BottomNav currentPage={currentPage} setCurrentPage={setCurrentPage} />
                <OfflineIndicator />
                <div className="pb-16 md:pb-0" /> {/* Spacer for BottomNav */}
            </div>
        </ErrorBoundary>
    );
};

export default App;


