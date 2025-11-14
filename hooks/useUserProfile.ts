import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { UserProfile, Mission, ChampionMastery, Champion, RecentFeedback } from '../types';
import toast from 'react-hot-toast';
import * as storageService from '../services/storageService';
import { MISSION_IDS } from '../constants';

// --- Default Data for a New User ---
const getInitialMissions = (): UserProfile['missions'] => ({
  gettingStarted: [
    {
      id: MISSION_IDS.GETTING_STARTED.FIRST_ANALYSIS,
      title: 'First Analysis',
      description: 'Analyze your first draft in Strategy Forge.',
      progress: 0,
      target: 1,
      rewardSP: 100,
      completed: false,
    },
    {
      id: MISSION_IDS.GETTING_STARTED.PRACTICE_MAKES_PERFECT,
      title: 'Practice Makes Perfect',
      description: 'Complete one draft in the Arena.',
      progress: 0,
      target: 1,
      rewardSP: 100,
      completed: false,
    },
    {
      id: MISSION_IDS.GETTING_STARTED.SAVE_STRATEGY,
      title: 'Save a Strategy',
      description: 'Save a draft to your Archives.',
      progress: 0,
      target: 1,
      rewardSP: 50,
      completed: false,
    },
    {
      id: MISSION_IDS.GETTING_STARTED.CHECK_META,
      title: 'Check the Meta',
      description: 'Generate an AI Tier List in Armory.',
      progress: 0,
      target: 1,
      rewardSP: 50,
      completed: false,
    },
  ],
  daily: [
    {
      id: MISSION_IDS.DAILY.FIRST_DRAFT_OF_DAY,
      title: 'First Draft of the Day',
      description: 'Complete one analysis in Strategy Forge.',
      progress: 0,
      target: 1,
      rewardSP: 50,
      completed: false,
    },
    {
      id: MISSION_IDS.DAILY.KNOWLEDGE_CHECK,
      title: 'Knowledge Check',
      description: 'Complete the Daily Challenge.',
      progress: 0,
      target: 1,
      rewardSP: 75,
      completed: false,
    },
  ],
  weekly: [
    {
      id: MISSION_IDS.WEEKLY.ARENA_CONTENDER,
      title: 'Arena Contender',
      description: 'Complete 5 drafts in the Arena.',
      progress: 0,
      target: 5,
      rewardSP: 250,
      completed: false,
    },
    {
      id: MISSION_IDS.WEEKLY.EXPAND_PLAYBOOK,
      title: 'Expand the Archives',
      description: 'Save 3 new drafts to your Archives.',
      progress: 0,
      target: 3,
      rewardSP: 150,
      completed: false,
    },
    {
      id: MISSION_IDS.WEEKLY.PERFECT_COMP,
      title: 'The Perfect Comp',
      description: 'Achieve an S-grade draft analysis in Strategy Forge.',
      progress: 0,
      target: 1,
      rewardSP: 300,
      completed: false,
    },
    {
      id: MISSION_IDS.WEEKLY.META_BREAKER,
      title: 'Meta Breaker',
      description: 'Achieve an S-Rank analysis with at least 3 non-meta champions.',
      progress: 0,
      target: 1,
      rewardSP: 300,
      completed: false,
    },
    {
      id: MISSION_IDS.WEEKLY.POKE_MASTER,
      title: 'Master of Poke',
      description: 'Win an Arena match with a Poke comp against "The Strategist" bot.',
      progress: 0,
      target: 1,
      rewardSP: 300,
      completed: false,
    },
    {
      id: MISSION_IDS.WEEKLY.SCENARIO_MASTER,
      title: 'Scenario Master',
      description: 'Complete 3 Draft Scenarios successfully.',
      progress: 0,
      target: 3,
      rewardSP: 200,
      completed: false,
    },
  ],
});

const defaultProfile: UserProfile = {
  id: 'currentUser',
  username: 'Rookie',
  avatar: 'garen', // Default avatar
  skillLevel: 'Beginner',
  goals: [],
  sp: 0,
  level: 1,
  rank: 'Iron Analyst',
  badges: [],
  streak: 0,
  lastActiveDate: '1970-01-01',
  lastLabAnalysisDate: '1970-01-01',
  missions: getInitialMissions(),
  championMastery: [],
  arenaStats: {
    averageScore: 0,
    difficulty: 'Beginner',
    winRateVsBot: 0,
    totalArenaGames: 0,
  },
  recentFeedback: [],
  dynamicProTip: undefined,
};

// --- Helper Functions ---
const getRankForLevel = (level: number): string => {
  if (level < 5) {
    return 'Iron Analyst';
  }
  if (level < 10) {
    return 'Bronze Tactician';
  }
  if (level < 20) {
    return 'Silver Strategist';
  }
  if (level < 30) {
    return 'Gold Visionary';
  }
  if (level < 40) {
    return 'Platinum Commander';
  }
  return 'Diamond Mastermind';
};

const getSPForNextLevel = (level: number): number => {
  return 500 + level * 250;
};

const MASTERY_POINTS_FROM_GRADE: Record<string, number> = {
  'S+': 100,
  S: 90,
  'S-': 80,
  'A+': 70,
  A: 60,
  'A-': 50,
};
const STARTER_MASTERY_POINTS = 50;

// Helper to get the date of the last Monday
const getStartOfWeek = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  return new Date(d.setDate(diff));
};

// --- Context Definition ---
interface UserProfileContextType {
  profile: UserProfile;
  isHydrated: boolean; // Flag to indicate if profile has been loaded from storage
  spForNextLevel: number;
  lastCompletedMissionId: string | null;
  clearLastCompletedMissionId: () => void;
  setProfile: (profile: Partial<UserProfile>) => void;
  addSP: (amount: number, reason?: string) => void;
  completeMission: (missionId: string) => boolean; // Returns true if mission was completed
  addChampionMastery: (champions: Champion[], grade: string) => void;
  addRecentFeedback: (feedback: Omit<RecentFeedback, 'id' | 'timestamp'>) => void;
  updateArenaStats: (draftScore: string, botPersona: string, teamIdentity: string) => void;
  checkStreak: () => void;
  initializeNewProfile: (data: {
    username: string;
    skillLevel: 'Beginner' | 'Intermediate' | 'Advanced';
    avatar: string;
    goals: string[];
    favoriteChampions: string[];
  }) => void;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

/**
 * Provides user profile and gamification state to its children.
 * Manages loading and saving the user profile to IndexedDB, handling level-ups,
 * missions, and other progression systems.
 */
export const UserProfileProvider = ({ children }: { children: React.ReactNode }) => {
  const [profile, setProfileState] = useState<UserProfile>(defaultProfile);
  const [isHydrated, setIsHydrated] = useState(false);
  const [lastCompletedMissionId, setLastCompletedMissionId] = useState<string | null>(null);

  // Load profile from IndexedDB on initial mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const storedProfile = await storageService.getUserProfile();
        if (storedProfile) {
          const defaultMissions = getInitialMissions();
          // Merge missions to handle cases where new missions are added in an update
          const missions = {
            gettingStarted: storedProfile.missions?.gettingStarted || defaultMissions.gettingStarted,
            daily: storedProfile.missions?.daily || defaultMissions.daily,
            weekly: defaultMissions.weekly.map(dm => storedProfile.missions?.weekly.find(sm => sm.id === dm.id) || dm),
          };
          setProfileState({ ...defaultProfile, ...storedProfile, missions });
        } else {
          // No profile found, could be a first-time user who needs to do onboarding.
          // The defaultProfile state is already set.
        }
      } catch (error) {
        console.error('Failed to load user profile from IndexedDB', error);
        toast.error('Could not load your profile data.');
        setProfileState(defaultProfile);
      } finally {
        setIsHydrated(true); // Signal that the loading attempt is complete
      }
    };
    loadProfile();
  }, []);

  // Save profile to IndexedDB whenever it changes
  useEffect(() => {
    // Don't save the default profile on initial load, or if it hasn't changed.
    // We check if the user has a real username to determine if it's a "real" profile.
    if (isHydrated && profile && profile.username !== 'Rookie') {
      storageService.saveUserProfile(profile);
    }
  }, [profile, isHydrated]);

  const setProfile = useCallback((newProfileData: Partial<UserProfile>) => {
    setProfileState(prev => ({ ...prev, ...newProfileData }));
  }, []);

  const addSP = useCallback((amount: number, reason?: string) => {
    if (reason) {
      toast.success(`+${amount} SP: ${reason}`, { icon: '⭐' });
    }
    setProfileState(prev => {
      let newSP = prev.sp + amount;
      let newLevel = prev.level;
      let spToNext = getSPForNextLevel(newLevel);

      let leveledUp = false;
      while (newSP >= spToNext) {
        newSP -= spToNext;
        newLevel++;
        spToNext = getSPForNextLevel(newLevel);
        leveledUp = true;
      }

      if (leveledUp) {
        toast.success(`Level Up! You are now Level ${newLevel}!`, { icon: '🎉' });
      }

      return {
        ...prev,
        sp: newSP,
        level: newLevel,
        rank: getRankForLevel(newLevel),
      };
    });
  }, []);

  const initializeNewProfile = useCallback(
    (data: {
      username: string;
      skillLevel: 'Beginner' | 'Intermediate' | 'Advanced';
      avatar: string;
      goals: string[];
      favoriteChampions: string[];
    }) => {
      const initialSP = 250;
      const initialBadge = 'Rookie Strategist';

      toast.success(`Welcome, ${data.username}!`, { icon: '👋' });
      toast.success(`+${initialSP} SP for completing your profile!`, { icon: '⭐' });
      if (data.favoriteChampions.length > 0) {
        toast.success(`+${STARTER_MASTERY_POINTS * data.favoriteChampions.length} starter mastery!`, { icon: '🏆' });
      }

      const starterMastery: ChampionMastery[] = data.favoriteChampions.map(champId => ({
        championId: champId,
        points: STARTER_MASTERY_POINTS,
        highestGrade: '',
      }));

      setProfileState(prev => ({
        ...prev,
        id: 'currentUser',
        username: data.username,
        avatar: data.avatar,
        skillLevel: data.skillLevel,
        goals: data.goals,
        sp: initialSP,
        badges: [initialBadge],
        arenaStats: {
          ...prev.arenaStats,
          difficulty: data.skillLevel,
        },
        championMastery: starterMastery,
      }));
    },
    []
  );

  const completeMission = useCallback(
    (missionId: string) => {
      let missionJustCompleted = false;
      let missionReward = 0;
      let missionTitle = '';

      setProfileState(prev => {
        const finalProfile = { ...prev };

        const updateMissions = (missions: Mission[]): Mission[] =>
          missions.map(m => {
            if (m.id === missionId && !m.completed) {
              const newProgress = m.progress + 1;
              if (newProgress >= m.target) {
                missionJustCompleted = true;
                missionReward = m.rewardSP;
                missionTitle = m.title;
                return { ...m, progress: m.target, completed: true };
              }
              return { ...m, progress: newProgress };
            }
            return m;
          });

        const newMissions = {
          gettingStarted: updateMissions(finalProfile.missions.gettingStarted),
          daily: updateMissions(finalProfile.missions.daily),
          weekly: updateMissions(finalProfile.missions.weekly),
        };
        finalProfile.missions = newMissions;

        if (missionId === MISSION_IDS.DAILY.FIRST_DRAFT_OF_DAY) {
          finalProfile.lastLabAnalysisDate = new Date().toISOString().split('T')[0]!;
        }

        return finalProfile;
      });

      if (missionJustCompleted && missionReward > 0) {
        setLastCompletedMissionId(missionId);
        // The addSP function now handles the toast for SP gain and level up.
        addSP(missionReward, `Mission Complete: ${missionTitle}`);
      }

      return missionJustCompleted;
    },
    [addSP]
  );

  const addChampionMastery = useCallback((champions: Champion[], grade: string) => {
    const pointsToAdd = MASTERY_POINTS_FROM_GRADE[grade] || 0;
    if (pointsToAdd === 0) {
      return;
    }

    setProfileState(prev => {
      const newMastery = [...prev.championMastery];
      champions.forEach(champ => {
        const existingIndex = newMastery.findIndex(m => m.championId === champ.id);
        if (existingIndex > -1) {
          const existing = newMastery[existingIndex]!;
          newMastery[existingIndex] = {
            championId: existing.championId,
            points: existing.points + pointsToAdd,
            highestGrade: grade > existing.highestGrade ? grade : existing.highestGrade,
          };
        } else {
          newMastery.push({ championId: champ.id, points: pointsToAdd, highestGrade: grade });
        }
      });
      return { ...prev, championMastery: newMastery };
    });
  }, []);

  const addRecentFeedback = useCallback((feedback: Omit<RecentFeedback, 'id' | 'timestamp'>) => {
    setProfileState(prev => {
      const newFeedback: RecentFeedback = {
        ...feedback,
        id: new Date().toISOString(),
        timestamp: new Date().toISOString(),
      };
      const updatedFeedback = [newFeedback, ...prev.recentFeedback].slice(0, 5);
      return { ...prev, recentFeedback: updatedFeedback };
    });
  }, []);

  const updateArenaStats = useCallback(
    (draftScore: string, botPersona: string, teamIdentity: string) => {
      const grade = draftScore.charAt(0);
      const didWin = ['S', 'A', 'B'].includes(grade);

      if (didWin && botPersona === 'The Strategist' && teamIdentity.toLowerCase().includes('poke')) {
        completeMission(MISSION_IDS.WEEKLY.POKE_MASTER);
      }

      setProfileState(prev => {
        const newTotalGames = prev.arenaStats.totalArenaGames + 1;
        const currentWins = (prev.arenaStats.winRateVsBot / 100) * prev.arenaStats.totalArenaGames;
        const newWins = didWin ? currentWins + 1 : currentWins;
        const newWinRate = (newWins / newTotalGames) * 100;

        const gradeScores: Record<string, number> = { S: 100, A: 85, B: 70, C: 50, D: 30, F: 10 };
        const scoreValue = gradeScores[grade] || 50;
        const newAverageScore =
          (prev.arenaStats.averageScore * prev.arenaStats.totalArenaGames + scoreValue) / newTotalGames;

        let newDifficulty = prev.arenaStats.difficulty;
        if (newTotalGames >= 5) {
          if (newWinRate > 70 && prev.arenaStats.difficulty === 'Beginner') {
            newDifficulty = 'Intermediate';
            toast.success('Bot difficulty increased to Intermediate!', { icon: '📈' });
          } else if (newWinRate > 60 && prev.arenaStats.difficulty === 'Intermediate') {
            newDifficulty = 'Advanced';
            toast.success('Bot difficulty increased to Advanced!', { icon: '🚀' });
          } else if (newWinRate < 30 && prev.arenaStats.difficulty === 'Advanced') {
            newDifficulty = 'Intermediate';
          } else if (newWinRate < 30 && prev.arenaStats.difficulty === 'Intermediate') {
            newDifficulty = 'Beginner';
          }
        }

        return {
          ...prev,
          arenaStats: {
            totalArenaGames: newTotalGames,
            winRateVsBot: newWinRate,
            averageScore: newAverageScore,
            difficulty: newDifficulty,
          },
        };
      });
    },
    [completeMission]
  );

  const checkStreak = useCallback(() => {
    setProfileState(prev => {
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0]!;
      const lastActiveDate = new Date(prev.lastActiveDate);
      const lastActiveStr = lastActiveDate.toISOString().split('T')[0]!;

      if (lastActiveStr === todayStr) {
        return prev; // Already active today, no change needed.
      }

      const startOfThisWeek = getStartOfWeek(now);
      const startOfLastActiveWeek = getStartOfWeek(lastActiveDate);

      const newMissions = { ...prev.missions };
      let didResetWeeklies = false;

      // Reset weekly missions if the last active day was before the start of this week.
      if (startOfLastActiveWeek < startOfThisWeek) {
        newMissions.weekly = getInitialMissions().weekly;
        didResetWeeklies = true;
      }

      // Reset daily missions if it's a new day
      const resetDailies = prev.missions.daily.map(m => ({ ...m, progress: 0, completed: false }));
      newMissions.daily = resetDailies;

      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      let newStreak;
      if (lastActiveStr === yesterdayStr) {
        newStreak = prev.streak + 1; // Streak continues
      } else {
        newStreak = 1; // Streak broken or first day
      }

      if (didResetWeeklies) {
        toast.success('Your weekly missions have been reset!', { icon: '📅' });
      }

      return {
        ...prev,
        streak: newStreak,
        lastActiveDate: todayStr,
        missions: newMissions,
      };
    });
  }, []);

  const spForNextLevel = getSPForNextLevel(profile.level);

  const clearLastCompletedMissionId = useCallback(() => {
    setLastCompletedMissionId(null);
  }, []);

  const contextValue = useMemo(
    () => ({
      profile,
      isHydrated,
      spForNextLevel,
      lastCompletedMissionId,
      clearLastCompletedMissionId,
      setProfile,
      addSP,
      completeMission,
      addChampionMastery,
      addRecentFeedback,
      updateArenaStats,
      checkStreak,
      initializeNewProfile,
    }),
    [
      profile,
      isHydrated,
      spForNextLevel,
      lastCompletedMissionId,
      clearLastCompletedMissionId,
      setProfile,
      addSP,
      completeMission,
      addChampionMastery,
      addRecentFeedback,
      updateArenaStats,
      checkStreak,
      initializeNewProfile,
    ]
  );

  // FIX: Replaced JSX with React.createElement because this is a .ts file, not a .tsx file.
  return React.createElement(UserProfileContext.Provider, { value: contextValue }, children);
};

/**
 * Provides access to the user's profile and gamification state.
 * Manages SP, level, missions, mastery, and more.
 * This hook must be used within a UserProfileProvider.
 * @returns The user profile context, including the profile object and methods to modify it.
 */
export const useUserProfile = (): UserProfileContextType => {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
};
