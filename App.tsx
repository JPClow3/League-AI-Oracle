
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { DraftLab } from './components/DraftLab/DraftLab';
import { Playbook } from './components/Playbook/Playbook';
import { Academy } from './components/Academy/Academy';
import { LiveArena } from './components/Arena/LiveArena';
import { Header } from './components/Layout/Header';
import { Footer } from './components/Layout/Footer';
import { Toaster } from 'react-hot-toast';
import { Home } from './components/Home/Home';
import { StrategyHub } from './components/StrategyHub/StrategyHub';
import { DailyTrial } from './components/Trials/DailyTrial';
import { Profile } from './components/Profile/Profile';
import type { Page, DraftState, Settings, Champion } from './types';
import { Command, CommandPalette } from './components/common/CommandPalette';
import { CHAMPIONS, CHAMPIONS_LITE } from './constants';
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

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('Home');
  const [draftState, setDraftState] = useState<DraftState>(getInitialDraftState());
  const [arenaDraftState, setArenaDraftState] = useState<DraftState>(getInitialDraftState());
  const [confirmationState, setConfirmationState] = useState<ConfirmationState | null>(null);

  // State for Command Palette
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [strategyHubInitialTab, setStrategyHubInitialTab] = useState<'champions' | 'intel'>('champions');
  const [strategyHubInitialSearch, setStrategyHubInitialSearch] = useState<string | null>(null);
  const [academyInitialLessonId, setAcademyInitialLessonId] = useState<string | undefined>(undefined);

  // State for Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const { setSettings } = useSettings();
  const { checkStreak, initializeNewProfile } = useUserProfile();

  // --- Onboarding State ---
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [startLabTour, setStartLabTour] = useState(false);

  useEffect(() => {
    // Check if onboarding has been completed
    const onboardingComplete = localStorage.getItem('onboardingComplete');
    if (!onboardingComplete) {
      setShowOnboardingModal(true);
    }
  }, []);

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
    });
    
    localStorage.setItem('onboardingComplete', 'true');
    setCurrentPage('Draft Lab'); // Navigate to the lab for the tour
    setStartLabTour(true);
  }, [initializeNewProfile, setSettings]);

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
        setCurrentPage('Draft Lab');
    };

    if (isDraftDirty) {
        setConfirmationState({
            title: "Overwrite Draft?",
            message: "Loading this draft will overwrite your current session in the Draft Lab. Are you sure you want to continue?",
            onConfirm: performLoad,
        });
    } else {
        performLoad();
    }
  };

    const loadChampionToLab = (championId: string) => {
        const champion = CHAMPIONS.find(c => c.id === championId);
        if (!champion) {
            toast.error("Champion not found.");
            return;
        }

        setDraftState(prev => {
            const bluePicks = [...prev.blue.picks];
            let placed = false;
            for (let i = 0; i < bluePicks.length; i++) {
                if (!bluePicks[i].champion) {
                    bluePicks[i] = { champion, isActive: false };
                    placed = true;
                    break;
                }
            }
            if (!placed) {
                toast.error("Blue team is full. Clear a slot to add the champion.");
                return prev; // Return original state if no space
            }
            toast.success(`${champion.name} added to Draft Lab!`);
            return {
                ...prev,
                blue: {
                    ...prev.blue,
                    picks: bluePicks
                }
            };
        });
        setCurrentPage('Draft Lab');
    };
  
  const resetDraft = useCallback(() => {
    setDraftState(getInitialDraftState());
  }, []);

  const resetArena = useCallback(() => {
    setArenaDraftState(getInitialDraftState());
  }, []);

  const navigateToAcademy = useCallback((lessonId: string) => {
    setAcademyInitialLessonId(lessonId);
    setCurrentPage('Academy');
  }, []);

  const commands: Command[] = useMemo(() => {
    const pageCommands: Command[] = [
        { id: 'nav-home', title: 'Go to Home', section: 'Navigation', action: () => setCurrentPage('Home') },
        { id: 'nav-draft-lab', title: 'Go to Draft Lab', section: 'Navigation', action: () => setCurrentPage('Draft Lab') },
        { id: 'nav-arena', title: 'Go to Arena', section: 'Navigation', action: () => setCurrentPage('Arena') },
        { id: 'nav-playbook', title: 'Go to Playbook', section: 'Navigation', action: () => setCurrentPage('Playbook') },
        { id: 'nav-strategy-hub', title: 'Go to Strategy Hub', section: 'Navigation', action: () => setCurrentPage('Strategy Hub') },
        { id: 'nav-academy', title: 'Go to Academy', section: 'Navigation', action: () => setCurrentPage('Academy') },
        { id: 'nav-trial', title: 'Go to Daily Trial', section: 'Navigation', action: () => setCurrentPage('Daily Trial') },
        { id: 'nav-profile', title: 'Go to Profile', section: 'Navigation', action: () => setCurrentPage('Profile') },
    ];
    
    const actionCommands: Command[] = [
        { id: 'action-reset-lab', title: 'Reset Draft Lab', section: 'Actions', action: resetDraft },
        { id: 'action-reset-arena', title: 'Reset Arena', section: 'Actions', action: resetArena },
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
            setCurrentPage('Strategy Hub');
        }
    }));

    return [...pageCommands, ...actionCommands, ...championSearchCommands];
  }, [resetDraft, resetArena]);

  const navigateToStrategyHub = (tab: 'champions' | 'intel') => {
    setStrategyHubInitialTab(tab);
    setCurrentPage('Strategy Hub');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'Home':
        return <Home setCurrentPage={setCurrentPage} navigateToStrategyHub={navigateToStrategyHub} />;
      case 'Draft Lab':
        return <DraftLab draftState={draftState} setDraftState={setDraftState} onReset={resetDraft} startTour={startLabTour} onTourComplete={handleTourComplete} navigateToAcademy={navigateToAcademy} />;
      case 'Arena':
        return <LiveArena 
          draftState={arenaDraftState}
          setDraftState={setArenaDraftState}
          onReset={resetArena}
          onNavigateToForge={loadDraftAndNavigate} 
        />;
      case 'Playbook':
        return <Playbook onLoadDraft={loadDraftAndNavigate} setCurrentPage={setCurrentPage} navigateToAcademy={navigateToAcademy} />;
      case 'Academy':
        return <Academy initialLessonId={academyInitialLessonId} onHandled={() => setAcademyInitialLessonId(undefined)} />;
      case 'Strategy Hub':
        return <StrategyHub 
            initialTab={strategyHubInitialTab} 
            initialSearchTerm={strategyHubInitialSearch}
            onLoadChampionInLab={loadChampionToLab}
            onHandled={() => {
                setStrategyHubInitialTab('champions');
                setStrategyHubInitialSearch(null);
            }} 
        />;
      case 'Daily Trial':
        return <DailyTrial navigateToAcademy={navigateToAcademy} />;
      case 'Profile':
        return <Profile setCurrentPage={setCurrentPage} navigateToAcademy={navigateToAcademy} />;
      default:
        return <Home setCurrentPage={setCurrentPage} navigateToStrategyHub={navigateToStrategyHub} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gradient-to-b from-[#0A0F1F] to-[#141A33]">
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
            background: '#141A33', // New Panel Background
            color: '#E2E8F0', // Off-white
            border: '1px solid #334155' // slate-700
          }
        }}
      />
      <Header 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenFeedback={() => setIsFeedbackModalOpen(true)}
      />
      <main className="flex-grow container mx-auto p-4 md:p-6">
        {renderPage()}
      </main>
      <Footer />
    </div>
  );
};

export default App;
