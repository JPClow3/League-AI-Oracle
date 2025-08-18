
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { Home } from './components/Home/Home';
import { DraftLab } from './components/DraftLab/DraftLab';
import { Playbook } from './components/Playbook/Playbook';
import { Academy } from './components/Academy/Academy';
import { LiveArena } from './components/Arena/LiveArena';
import { LiveDraft } from './components/LiveDraft/LiveDraft';
import { Sidebar } from './components/Layout/Sidebar';
import { BottomNav } from './components/Layout/BottomNav';
import { Footer } from './components/Layout/Footer';
import { Toaster } from 'react-hot-toast';
import { StrategyHub } from './components/StrategyHub/StrategyHub';
import { DailyTrial } from './components/Trials/DailyTrial';
import { Profile } from './components/Profile/Profile';
import type { Page, DraftState, Settings, Champion, Theme } from './types';
import { MetaOracle } from './components/MetaOracle/MetaOracle';
import { Command, CommandPalette } from './components/common/CommandPalette';
import { CHAMPIONS, CHAMPIONS_LITE, ROLES } from './constants';
import { useSettings } from './hooks/useSettings';
import { useUserProfile } from './hooks/useUserProfile';
import { SettingsModal } from './components/Settings/SettingsModal';
import { ConfirmationModal, ConfirmationState } from './components/common/ConfirmationModal';
import { FeedbackModal } from './components/Feedback/FeedbackModal';
import { ProfileSetupModal } from './components/Onboarding/ProfileSetupModal';
import toast from 'react-hot-toast';

const createInitialSlot = () => ({ champion: null, isActive: false });
const createInitialTeamState = () => ({
  picks: Array(5).fill(null).map(createInitialSlot),
  bans: Array(5).fill(null).map(createInitialSlot),
});

export const getInitialDraftState = (): DraftState => ({
  blue: createInitialTeamState(),
  red: createInitialTeamState(),
  turn: 'blue',
  phase: 'ban1',
});

interface OnboardingData {
    username: string;
    primaryRole: string;
    favoriteChampions: string[];
    skillLevel: 'Beginner' | 'Intermediate' | 'Advanced';
    goals: string[];
    avatar: string;
    theme: Settings['theme'];
}

const THEME_COLORS: Record<Theme, Record<string, string>> = {
    cyan: { '--color-accent-text': '103 232 249', '--color-accent-bg': '8 145 178', '--color-accent-bg-hover': '14 116 144', '--color-accent-logo': '34 211 238' },
    crimson: { '--color-accent-text': '251 113 133', '--color-accent-bg': '225 29 72', '--color-accent-bg-hover': '190 18 60', '--color-accent-logo': '244 63 94' },
    gold: { '--color-accent-text': '252 211 77', '--color-accent-bg': '217 119 6', '--color-accent-bg-hover': '180 83 9', '--color-accent-logo': '250 204 21' },
    teal: { '--color-accent-text': '94 234 212', '--color-accent-bg': '13 148 136', '--color-accent-bg-hover': '15 118 110', '--color-accent-logo': '45 212 191' },
};


const App: React.FC = () => {
  const pageRefs = useRef<{[key: string]: React.RefObject<HTMLDivElement>}>({});
  const [currentPage, setCurrentPage] = useState<Page>('Home');
  const [draftState, setDraftState] = useState<DraftState>(getInitialDraftState());
  const [arenaDraftState, setArenaDraftState] = useState<DraftState>(getInitialDraftState());
  const [liveDraftState, setLiveDraftState] = useState<DraftState>(getInitialDraftState());
  const [confirmationState, setConfirmationState] = useState<ConfirmationState | null>(null);

  // State for Command Palette
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [strategyHubInitialTab, setStrategyHubInitialTab] = useState<'champions' | 'intel'>('champions');
  const [strategyHubInitialSearch, setStrategyHubInitialSearch] = useState<string | null>(null);
  const [academyInitialLessonId, setAcademyInitialLessonId] = useState<string | undefined>(undefined);

  // State for Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const { settings, setSettings } = useSettings();
  const { checkStreak, initializeNewProfile } = useUserProfile();

  // --- Onboarding State ---
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [startLabTour, setStartLabTour] = useState(false);

  useEffect(() => {
    // Check if onboarding has been completed robustly
    const onboardingComplete = localStorage.getItem('onboardingComplete');
    const userProfileExists = localStorage.getItem('userProfile');

    if (!onboardingComplete || !userProfileExists) {
      // If the flag is set but the profile data is missing, something went wrong.
      // Reset the flag to re-trigger onboarding.
      if (onboardingComplete && !userProfileExists) {
        localStorage.removeItem('onboardingComplete');
      }
      setShowOnboardingModal(true);
    }
  }, []);

  // BUG FIX: Ensure guided tour is stopped if user navigates away
  useEffect(() => {
    if (currentPage !== 'Strategy Forge' && startLabTour) {
      setStartLabTour(false);
    }
  }, [currentPage, startLabTour]);

  // BUG FIX: Apply theme colors dynamically for instant theme switching
  useEffect(() => {
    const root = document.documentElement;
    const themeColors = THEME_COLORS[settings.theme] || THEME_COLORS.cyan;
    for (const [key, value] of Object.entries(themeColors)) {
        root.style.setProperty(key, value);
    }
  }, [settings.theme]);

  const handleProfileSetupComplete = useCallback((data: OnboardingData) => {
    setShowOnboardingModal(false);
    
    // Set user profile data
    initializeNewProfile({
        username: data.username,
        skillLevel: data.skillLevel,
        avatar: data.avatar,
        goals: data.goals,
        favoriteChampions: data.favoriteChampions
    });

    // Set user settings
    setSettings({
        primaryRole: data.primaryRole,
        favoriteChampions: data.favoriteChampions,
        theme: data.theme,
        enableSound: settings.enableSound, // Preserve existing sound setting
    });
    
    // Set the completion flag last to ensure profile/settings are saved first.
    localStorage.setItem('onboardingComplete', 'true');
    setCurrentPage('Strategy Forge'); // Navigate to the lab for the tour
    setStartLabTour(true);
  }, [initializeNewProfile, setSettings, settings.enableSound]);

  const handleTourComplete = useCallback(() => {
    setStartLabTour(false);
  }, []);
  // --- End Onboarding State ---

  // Check daily streak on app load
  useEffect(() => {
    checkStreak();
  }, [checkStreak]);

  // Keyboard listener for command palette
  useEffect(() => {
      const handler = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
          e.preventDefault();
          // Ensure other modals are closed before opening the palette
          setIsSettingsOpen(false);
          setIsFeedbackModalOpen(false);
          setConfirmationState(null);
          setIsPaletteOpen(prev => !prev);
        }
      };
      window.addEventListener('keydown', handler);
      return () => window.removeEventListener('keydown', handler);
  }, []);

  const loadDraftAndNavigate = (draft: DraftState) => {
    const isDraftDirty = JSON.stringify(draftState) !== JSON.stringify(getInitialDraftState());
    
    const performLoad = () => {
        setDraftState(draft);
        setCurrentPage('Strategy Forge');
    };

    if (isDraftDirty) {
        setConfirmationState({
            title: "Overwrite Draft?",
            message: "Loading this draft will overwrite your current session in the Strategy Forge. Are you sure you want to continue?",
            onConfirm: performLoad,
        });
    } else {
        performLoad();
    }
  };

    const loadChampionToLab = (championId: string, role?: string) => {
        const champion = CHAMPIONS.find(c => c.id === championId);
        if (!champion) {
            toast.error("Champion not found.");
            return;
        }

        setDraftState(prev => {
            const bluePicks = [...prev.blue.picks];
            let placed = false;

            if (role) {
                const roleIndex = ROLES.indexOf(role);
                if (roleIndex !== -1 && !bluePicks[roleIndex].champion) {
                    bluePicks[roleIndex] = { champion, isActive: false };
                    placed = true;
                    toast.success(`${champion.name} added to ${role} slot!`);
                }
            }
            
            if (!placed) {
                for (let i = 0; i < bluePicks.length; i++) {
                    if (!bluePicks[i].champion) {
                        bluePicks[i] = { champion, isActive: false };
                        placed = true;
                        toast.success(`${champion.name} added to Strategy Forge!`);
                        break;
                    }
                }
            }

            if (!placed) {
                toast.error("Blue team is full. Clear a slot to add the champion.");
                return prev; // Return original state if no space
            }
            
            return {
                ...prev,
                blue: {
                    ...prev.blue,
                    picks: bluePicks
                }
            };
        });
        setCurrentPage('Strategy Forge');
    };
  
  const resetDraft = useCallback(() => {
    setDraftState(getInitialDraftState());
  }, []);

  const resetArena = useCallback(() => {
    setArenaDraftState(getInitialDraftState());
  }, []);

  const resetLiveDraft = useCallback(() => {
    setLiveDraftState(getInitialDraftState());
  }, []);

  const navigateToAcademy = useCallback((lessonId: string) => {
    setAcademyInitialLessonId(lessonId);
    setCurrentPage('Academy');
  }, []);

  const navigateToArmory = (tab: 'champions' | 'intel') => {
    setStrategyHubInitialTab(tab);
    setCurrentPage('The Armory');
  };

  const commands: Command[] = useMemo(() => {
    const pageCommands: Command[] = [
        { id: 'nav-home', title: 'Go to Home', section: 'Navigation', action: () => setCurrentPage('Home') },
        { id: 'nav-live-draft', title: 'Go to Live Co-Pilot', section: 'Navigation', action: () => setCurrentPage('Live Co-Pilot') },
        { id: 'nav-draft-lab', title: 'Go to Strategy Forge', section: 'Navigation', action: () => setCurrentPage('Strategy Forge') },
        { id: 'nav-arena', title: 'Go to Draft Arena', section: 'Navigation', action: () => setCurrentPage('Draft Arena') },
        { id: 'nav-playbook', title: 'Go to The Archives', section: 'Navigation', action: () => setCurrentPage('The Archives') },
        { id: 'nav-strategy-hub', title: 'Go to The Armory', section: 'Navigation', action: () => setCurrentPage('The Armory') },
        { id: 'nav-academy', title: 'Go to Academy', section: 'Navigation', action: () => setCurrentPage('Academy') },
        { id: 'nav-meta-oracle', title: 'Go to The Oracle', section: 'Navigation', action: () => setCurrentPage('The Oracle') },
        { id: 'nav-trial', title: 'Go to Daily Challenge', section: 'Navigation', action: () => setCurrentPage('Daily Challenge') },
        { id: 'nav-profile', title: 'Go to Profile', section: 'Navigation', action: () => setCurrentPage('Profile') },
    ];
    
    const actionCommands: Command[] = [
        { id: 'action-reset-lab', title: 'Reset Strategy Forge', section: 'Actions', action: resetDraft },
        { id: 'action-reset-arena', title: 'Reset Draft Arena', section: 'Actions', action: resetArena },
        { id: 'action-reset-live-draft', title: 'Reset Live Co-Pilot', section: 'Actions', action: resetLiveDraft },
        { id: 'action-open-settings', title: 'Open Settings', section: 'Actions', action: () => setIsSettingsOpen(true) },
        { id: 'action-give-feedback', title: 'Give Feedback', section: 'Actions', action: () => setIsFeedbackModalOpen(true) },
    ];

    const championSearchCommands: Command[] = CHAMPIONS_LITE.map(champ => ({
        id: `search-champ-${champ.id}`,
        title: `Find Champion: ${champ.name}`,
        section: 'Champion Search',
        action: () => {
            setStrategyHubInitialTab('champions');
            setStrategyHubInitialSearch(champ.name);
            setCurrentPage('The Armory');
        }
    }));

    return [...pageCommands, ...actionCommands, ...championSearchCommands];
  }, [resetDraft, resetArena, resetLiveDraft]);

  const renderPage = () => {
    switch (currentPage) {
      case 'Home':
        return <Home setCurrentPage={setCurrentPage} navigateToArmory={navigateToArmory} />;
      case 'Strategy Forge':
        return <DraftLab draftState={draftState} setDraftState={setDraftState} onReset={resetDraft} startTour={startLabTour} onTourComplete={handleTourComplete} navigateToAcademy={navigateToAcademy} />;
      case 'Live Co-Pilot':
        return <LiveDraft
          draftState={liveDraftState}
          setDraftState={setLiveDraftState}
          onReset={resetLiveDraft}
        />;
      case 'Draft Arena':
        return <LiveArena 
          draftState={arenaDraftState}
          setDraftState={setArenaDraftState}
          onReset={resetArena}
          onNavigateToForge={loadDraftAndNavigate} 
        />;
      case 'The Archives':
        return <Playbook onLoadDraft={loadDraftAndNavigate} setCurrentPage={setCurrentPage} navigateToAcademy={navigateToAcademy} />;
      case 'Academy':
        return <Academy initialLessonId={academyInitialLessonId} onHandled={() => setAcademyInitialLessonId(undefined)} />;
      case 'The Armory':
        return <StrategyHub 
            initialTab={strategyHubInitialTab} 
            initialSearchTerm={strategyHubInitialSearch}
            onLoadChampionInLab={loadChampionToLab}
            draftState={draftState}
            onHandled={() => {
                setStrategyHubInitialTab('champions');
                setStrategyHubInitialSearch(null);
            }} 
        />;
      case 'The Oracle':
        return <MetaOracle />;
      case 'Daily Challenge':
        return <DailyTrial navigateToAcademy={navigateToAcademy} />;
      case 'Profile':
        return <Profile setCurrentPage={setCurrentPage} navigateToAcademy={navigateToAcademy} />;
      default:
        return <Home setCurrentPage={setCurrentPage} navigateToArmory={navigateToArmory} />;
    }
  };

  const nodeRef = pageRefs.current[currentPage] ?? (pageRefs.current[currentPage] = React.createRef());

  return (
    <div className="min-h-screen flex bg-transparent">
      <ProfileSetupModal isOpen={showOnboardingModal} onComplete={handleProfileSetupComplete} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <FeedbackModal isOpen={isFeedbackModalOpen} onClose={() => setIsFeedbackModalOpen(false)} draftState={draftState} />
      <CommandPalette isOpen={isPaletteOpen} onClose={() => setIsPaletteOpen(false)} commands={commands} />
      <ConfirmationModal
        isOpen={!!confirmationState}
        onClose={() => setConfirmationState(null)}
        state={confirmationState}
      />
      <Toaster 
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1e293b', // slate-800
            color: '#e2e8f0', // slate-200
            border: '1px solid #334155' // slate-700
          }
        }}
      />
      
      <Sidebar 
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenFeedback={() => setIsFeedbackModalOpen(true)}
      />

      <div className="flex-1 flex flex-col md:pl-64">
        <main className="flex-grow p-4 md:p-6 pb-20 md:pb-6 relative">
            <TransitionGroup component={null}>
                <CSSTransition key={currentPage} nodeRef={nodeRef} timeout={300} classNames="page">
                    <div ref={nodeRef} className="page-container absolute inset-0 md:inset-6 md:top-0">
                        {renderPage()}
                    </div>
                </CSSTransition>
            </TransitionGroup>
        </main>
        <Footer />
      </div>

      <BottomNav currentPage={currentPage} setCurrentPage={setCurrentPage} />
    </div>
  );
};

export default App;
