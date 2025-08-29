import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { UserProfile, Mission, ChampionMastery, Champion, RecentFeedback } from '../types';
import toast from 'react-hot-toast';
import { safeGetLocalStorage, safeRemoveLocalStorage, safeSetLocalStorage } from '../lib/draftUtils';
import { MISSION_IDS } from '../constants';

// --- Default Data for a New User ---
const getInitialMissions = (): UserProfile['missions'] => ({
    gettingStarted: [
        { id: MISSION_IDS.GETTING_STARTED.FIRST_ANALYSIS, title: 'First Analysis', description: 'Analyze your first draft in the Draft Lab.', progress: 0, target: 1, rewardSP: 100, completed: false },
        { id: MISSION_IDS.GETTING_STARTED.PRACTICE_MAKES_PERFECT, title: 'Practice Makes Perfect', description: 'Complete one draft in the Arena.', progress: 0, target: 1, rewardSP: 100, completed: false },
        { id: MISSION_IDS.GETTING_STARTED.SAVE_STRATEGY, title: 'Save a Strategy', description: 'Save a draft to your Playbook.', progress: 0, target: 1, rewardSP: 50, completed: false },
        { id: MISSION_IDS.GETTING_STARTED.CHECK_META, title: 'Check the Meta', description: 'Generate an AI Tier List in the Intel Hub.', progress: 0, target: 1, rewardSP: 50, completed: false },
    ],
    daily: [
        { id: MISSION_IDS.DAILY.FIRST_DRAFT_OF_DAY, title: 'First Draft of the Day', description: 'Complete one analysis in the Draft Lab.', progress: 0, target: 1, rewardSP: 50, completed: false },
        { id: MISSION_IDS.DAILY.KNOWLEDGE_CHECK, title: 'Knowledge Check', description: 'Complete the Daily Trial.', progress: 0, target: 1, rewardSP: 75, completed: false },
    ],
    weekly: [
        { id: MISSION_IDS.WEEKLY.ARENA_CONTENDER, title: 'Arena Contender', description: 'Complete 5 drafts in the Arena.', progress: 0, target: 5, rewardSP: 250, completed: false },
        { id: MISSION_IDS.WEEKLY.EXPAND_PLAYBOOK, title: 'Expand the Playbook', description: 'Save 3 new drafts to your Playbook.', progress: 0, target: 3, rewardSP: 150, completed: false },
        { id: MISSION_IDS.WEEKLY.PERFECT_COMP, title: 'The Perfect Comp', description: 'Achieve an S-grade draft analysis in the Lab.', progress: 0, target: 1, rewardSP: 300, completed: false },
    ]
});

const defaultProfile: UserProfile = {
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
    },
    recentFeedback: []
};

const PROFILE_STORAGE_KEY = 'userProfile';

// --- Helper Functions ---
const getRankForLevel = (level: number): string => {
    if (level < 5) return 'Iron Analyst';
    if (level < 10) return 'Bronze Tactician';
    if (level < 20) return 'Silver Strategist';
    if (level < 30) return 'Gold Visionary';
    if (level < 40) return 'Platinum Commander';
    return 'Diamond Mastermind';
};

const getSPForNextLevel = (level: number): number => {
    return 500 + (level * 250);
};

const MASTERY_POINTS_FROM_GRADE: Record<string, number> = { 
    'S+': 100, 'S': 90, 'S-': 80, 
    'A+': 70, 'A': 60, 'A-': 50 
};
const STARTER_MASTERY_POINTS = 50;

// --- Context Definition ---
interface UserProfileContextType {
    profile: UserProfile;
    spForNextLevel: number;
    lastCompletedMissionId: string | null;
    clearLastCompletedMissionId: () => void;
    setProfile: (profile: Partial<UserProfile>) => void;
    addSP: (amount: number, reason?: string) => void;
    completeMission: (missionId: string) => boolean; // Returns true if mission was completed
    addChampionMastery: (champions: Champion[], grade: string) => void;
    addRecentFeedback: (feedback: Omit<RecentFeedback, 'id' | 'timestamp'>) => void;
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
 * Manages loading and saving the user profile to localStorage, handling level-ups,
 * missions, and other progression systems.
 */
export const UserProfileProvider = ({ children }: { children: React.ReactNode }) => {
    const [profile, setProfileState] = useState<UserProfile>(defaultProfile);
    const [lastCompletedMissionId, setLastCompletedMissionId] = useState<string | null>(null);

    const loadProfile = useCallback(() => {
        try {
            const storedProfile = safeGetLocalStorage(PROFILE_STORAGE_KEY);
            if (storedProfile) {
                const parsed = JSON.parse(storedProfile);
                const defaultMissions = getInitialMissions();
                const missions = {
                    gettingStarted: parsed.missions?.gettingStarted || defaultMissions.gettingStarted,
                    daily: parsed.missions?.daily || defaultMissions.daily,
                    weekly: parsed.missions?.weekly || defaultMissions.weekly,
                };
                setProfileState({ ...defaultProfile, ...parsed, missions });
            } else {
                setProfileState(defaultProfile);
            }
        } catch (error) {
            console.error('Failed to parse user profile from localStorage', error);
            toast.error('Your profile data was corrupted and have been reset.');
            safeRemoveLocalStorage(PROFILE_STORAGE_KEY);
            setProfileState(defaultProfile);
        }
    }, []);

    useEffect(() => {
        loadProfile();
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === PROFILE_STORAGE_KEY) {
                loadProfile();
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [loadProfile]);

    useEffect(() => {
        safeSetLocalStorage(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    }, [profile]);

    const setProfile = (newProfileData: Partial<UserProfile>) => {
        setProfileState(prev => ({ ...prev, ...newProfileData }));
    };

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

    const initializeNewProfile = useCallback((data: { username: string; skillLevel: 'Beginner' | 'Intermediate' | 'Advanced', avatar: string, goals: string[], favoriteChampions: string[] }) => {
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
            highestGrade: ''
        }));

        setProfileState(prev => ({
            ...prev,
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
    }, []);

    const completeMission = useCallback((missionId: string) => {
        let missionJustCompleted = false;
        let missionReward = 0;
        let missionTitle = '';

        setProfileState(prev => {
            let finalProfile = { ...prev };

            const updateMissions = (missions: Mission[]): Mission[] => missions.map(m => {
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
                finalProfile.lastLabAnalysisDate = new Date().toISOString().split('T')[0];
            }
            
            return finalProfile;
        });

        if (missionJustCompleted && missionReward > 0) {
            setLastCompletedMissionId(missionId);
            // The addSP function now handles the toast for SP gain and level up.
            addSP(missionReward, `Mission Complete: ${missionTitle}`);
        }
        
        return missionJustCompleted;
    }, [addSP]);

    const addChampionMastery = useCallback((champions: Champion[], grade: string) => {
        const pointsToAdd = MASTERY_POINTS_FROM_GRADE[grade] || 0;
        if (pointsToAdd === 0) return;

        setProfileState(prev => {
            const newMastery = [...prev.championMastery];
            champions.forEach(champ => {
                const existingIndex = newMastery.findIndex(m => m.championId === champ.id);
                if (existingIndex > -1) {
                    const existing = newMastery[existingIndex];
                    newMastery[existingIndex] = {
                        ...existing,
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

    const checkStreak = useCallback(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize today to the beginning of the day
        
        const lastActive = new Date(profile.lastActiveDate);
        lastActive.setHours(0, 0, 0, 0); // Normalize last active date

        if (today.getTime() === lastActive.getTime()) return; // Already active today

        const todayStr = new Date().toISOString().split('T')[0];
        
        // Reset daily missions if it's a new day
        const resetDailies = profile.missions.daily.map(m => ({ ...m, progress: 0, completed: false }));

        const msInDay = 1000 * 60 * 60 * 24;
        const dayDifference = (today.getTime() - lastActive.getTime()) / msInDay;

        if (dayDifference === 1) {
             setProfile({ streak: profile.streak + 1, lastActiveDate: todayStr, missions: {...profile.missions, daily: resetDailies} });
        } else {
             setProfile({ streak: 1, lastActiveDate: todayStr, missions: {...profile.missions, daily: resetDailies} });
        }
    }, [profile.lastActiveDate, profile.streak, profile.missions]);

    const spForNextLevel = getSPForNextLevel(profile.level);

    const clearLastCompletedMissionId = useCallback(() => {
        setLastCompletedMissionId(null);
    }, []);

    const contextValue = useMemo(() => ({
        profile,
        spForNextLevel,
        lastCompletedMissionId,
        clearLastCompletedMissionId,
        setProfile,
        addSP,
        completeMission,
        addChampionMastery,
        addRecentFeedback,
        checkStreak,
        initializeNewProfile,
    }), [profile, spForNextLevel, lastCompletedMissionId, clearLastCompletedMissionId, addSP, completeMission, addChampionMastery, addRecentFeedback, checkStreak, initializeNewProfile]);

    return React.createElement(
        UserProfileContext.Provider,
        { value: contextValue },
        children
    );
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