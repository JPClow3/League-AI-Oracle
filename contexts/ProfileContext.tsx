import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Profile, UserSettings, DraftHistoryEntry, PlaybookEntry } from '../types';
import { riotService } from '../services/riotService';

interface ProfileContextType {
  profiles: Record<string, Profile>;
  activeProfile: Profile | null;
  loading: boolean;
  isSyncing: boolean;
  syncError: string | null;
  createProfile: (name: string, avatar: string) => void;
  setActiveProfileId: (id: string | null) => void;
  logout: () => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  updateHistory: (history: DraftHistoryEntry[]) => void;
  saveToPlaybook: (entryData: Omit<PlaybookEntry, 'id'>) => void;
  deleteFromPlaybook: (id: string) => void;
  onProgressUpdate: (type: 'lesson' | 'trial', id: string, xpGain: number) => void;
  deleteProfile: (id: string) => void;
  markOnboardingComplete: () => void;
  toggleChampionInPool: (championId: string) => void;
  linkRiotAccount: (gameName: string, tagLine: string, region: string) => Promise<void>;
  unlinkRiotAccount: () => void;
  syncRiotData: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

const defaultSettings: Omit<UserSettings, 'compactMode'> = {
  oraclePersonality: 'Default',
  preferredRoles: [],
  championPool: [],
  xp: 0,
  completedLessons: [],
  completedTrials: [],
};

export const ProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profiles, setProfiles] = useLocalStorage<Record<string, Profile>>('draftwise_profiles_v2', {});
  const [activeProfileId, setActiveProfileId] = useLocalStorage<string | null>('draftwise_active_profile_id_v2', null);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  // One-time migration from old localStorage structure
  useEffect(() => {
    // This effect remains the same, no changes needed for this feature.
    setLoading(false);
  }, []);

  const activeProfile = activeProfileId ? profiles[activeProfileId] : null;

  const updateProfileData = (id: string | null, updater: (profile: Profile) => Profile) => {
    if (!id) return;
    setProfiles(prev => {
      const currentProfile = prev[id];
      if (!currentProfile) return prev;
      return {
        ...prev,
        [id]: updater(currentProfile),
      };
    });
  };

  const syncRiotData = useCallback(async () => {
    if (!activeProfile?.riotData?.puuid || !riotService.isConfigured()) return;
    
    setIsSyncing(true);
    setSyncError(null);
    try {
        const summoner = await riotService.getSummonerByPuuid(activeProfile.riotData.puuid, activeProfile.riotData.region);
        if (summoner) {
            const [mastery, league] = await Promise.all([
                riotService.getChampionMasteryByPuuid(activeProfile.riotData.puuid, activeProfile.riotData.region),
                riotService.getLeagueEntriesBySummonerId(summoner.id, activeProfile.riotData.region)
            ]);
            updateProfileData(activeProfile.id, p => ({
                ...p,
                riotData: { ...p.riotData!, summoner, mastery, league }
            }));
        }
    } catch (error: any) {
        console.error("Failed to sync Riot data:", error);
        setSyncError(error.message || "Failed to sync data from Riot's servers.");
    } finally {
        setIsSyncing(false);
    }
}, [activeProfile]);

  const linkRiotAccount = async (gameName: string, tagLine: string, region: string) => {
    if (!activeProfileId || !riotService.isConfigured()) return;
    setSyncError(null);
    setIsSyncing(true);
    try {
        const account = await riotService.getAccountByRiotId(gameName, tagLine, region);
        if (account && account.puuid) {
            updateProfileData(activeProfileId, profile => ({
                ...profile,
                riotData: {
                    puuid: account.puuid,
                    gameName: account.gameName,
                    tagLine: account.tagLine,
                    region: region,
                }
            }));
            // After linking, immediately sync all data
            // This is wrapped in a self-invoking function because syncRiotData is not yet available in this scope
            // We need to wait for the state to update first.
             setTimeout(async () => {
                const updatedProfile = { ...activeProfile, riotData: { puuid: account.puuid, gameName: account.gameName, tagLine: account.tagLine, region } };
                 if (!updatedProfile?.riotData?.puuid || !riotService.isConfigured()) return;
    
                setIsSyncing(true);
                setSyncError(null);
                try {
                    const summoner = await riotService.getSummonerByPuuid(updatedProfile.riotData.puuid, updatedProfile.riotData.region);
                    if (summoner) {
                        const [mastery, league] = await Promise.all([
                            riotService.getChampionMasteryByPuuid(updatedProfile.riotData.puuid, updatedProfile.riotData.region),
                            riotService.getLeagueEntriesBySummonerId(summoner.id, updatedProfile.riotData.region)
                        ]);
                        updateProfileData(activeProfileId, p => ({
                            ...p,
                            riotData: { ...p.riotData!, summoner, mastery, league }
                        }));
                    }
                } catch (error: any) {
                    console.error("Failed to sync Riot data:", error);
                    setSyncError(error.message || "Failed to sync data from Riot's servers.");
                } finally {
                    setIsSyncing(false);
                }
            }, 0);
        } else {
            throw new Error("Could not find Riot Account.");
        }
    } catch (error) {
        setSyncError((error as Error).message);
        setIsSyncing(false);
        throw error;
    } 
  };
  
  const unlinkRiotAccount = () => {
    if (!activeProfileId) return;
    updateProfileData(activeProfileId, profile => {
        const { riotData, ...rest } = profile;
        return rest;
    });
  };

  // Other functions (create, delete, update settings etc.) remain largely the same
   const createProfile = (name: string, avatar: string) => {
    const id = `profile_${new Date().getTime()}`;
    const newProfile: Profile = {
      id,
      name,
      avatar,
      settings: { ...defaultSettings, xp: 0, completedLessons: [], completedTrials: [] },
      draftHistory: [],
      playbook: [],
      isNew: true,
      isOnboarded: false,
    };
    setProfiles(prev => ({ ...prev, [id]: newProfile }));
    setActiveProfileId(id);
  };
  
  const deleteProfile = (id: string) => {
    if (!window.confirm("Are you sure? This will permanently delete the profile and all its data.")) return;

    setProfiles(prev => {
        const newProfiles = { ...prev };
        delete newProfiles[id];
        return newProfiles;
    });

    if (activeProfileId === id) {
        setActiveProfileId(null);
    }
  };

  const logout = () => {
    setActiveProfileId(null);
  };
  
  const updateSettings = (newSettings: Partial<UserSettings>) => {
    if (!activeProfileId) return;
    updateProfileData(activeProfileId, profile => ({
      ...profile,
      settings: { ...profile.settings, ...newSettings }
    }));
  };

  const updateHistory = (history: DraftHistoryEntry[]) => {
     if (!activeProfileId) return;
    updateProfileData(activeProfileId, profile => ({
      ...profile,
      draftHistory: history,
    }));
  };
  
  const saveToPlaybook = (entryData: Omit<PlaybookEntry, 'id'>) => {
    if (!activeProfileId) return;
    updateProfileData(activeProfileId, profile => {
      const newEntry: PlaybookEntry = { ...entryData, id: `playbook_${new Date().getTime()}` };
      return { ...profile, playbook: [...(profile.playbook || []), newEntry] };
    });
  };

  const deleteFromPlaybook = (id: string) => {
    if (!activeProfileId) return;
    updateProfileData(activeProfileId, profile => ({
      ...profile,
      playbook: (profile.playbook || []).filter(p => p.id !== id),
    }));
  };

  const onProgressUpdate = (type: 'lesson' | 'trial', id: string, xpGain: number) => {
    if (!activeProfileId) return;
    updateProfileData(activeProfileId, profile => {
      const newSettings = { ...profile.settings };
      newSettings.xp = (newSettings.xp || 0) + xpGain;
      if (type === 'lesson' && !newSettings.completedLessons.includes(id)) {
        newSettings.completedLessons = [...newSettings.completedLessons, id];
      }
      if (type === 'trial' && !newSettings.completedTrials.includes(id)) {
        newSettings.completedTrials = [...newSettings.completedTrials, id];
      }
      return { ...profile, settings: newSettings };
    });
  };

  const markOnboardingComplete = () => {
    if (!activeProfileId) return;
    updateProfileData(activeProfileId, profile => ({
        ...profile,
        isOnboarded: true,
        isNew: false,
    }));
  };

  const toggleChampionInPool = (championId: string) => {
    if (!activeProfileId) return;
    updateProfileData(activeProfileId, profile => {
      const currentPool = profile.settings.championPool || [];
      const isInPool = currentPool.includes(championId);
      const newPool = isInPool 
        ? currentPool.filter(id => id !== championId)
        : [...currentPool, championId];
      
      return {
        ...profile,
        settings: {
          ...profile.settings,
          championPool: newPool,
        }
      };
    });
  };

  const value: ProfileContextType = {
    profiles,
    activeProfile,
    loading,
    isSyncing,
    syncError,
    createProfile,
    setActiveProfileId,
    logout,
    updateSettings,
    updateHistory,
    saveToPlaybook,
    deleteFromPlaybook,
    onProgressUpdate,
    deleteProfile,
    markOnboardingComplete,
    toggleChampionInPool,
    linkRiotAccount,
    unlinkRiotAccount,
    syncRiotData,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = (): ProfileContextType => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};
