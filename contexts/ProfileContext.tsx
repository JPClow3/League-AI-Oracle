

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Profile, UserSettings, DraftHistoryEntry, PlaybookEntry } from '../types';

interface ProfileContextType {
  profiles: Record<string, Profile>;
  activeProfile: Profile | null;
  loading: boolean;
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

  // One-time migration from old localStorage structure
  useEffect(() => {
    const oldSettingsRaw = localStorage.getItem('draftwise_settings');
    const oldHistoryRaw = localStorage.getItem('draftwise_history');
    const oldProfilesRaw = localStorage.getItem('draftwise_profiles'); // Legacy profiles

    // Only migrate if new profile system is empty
    if (Object.keys(profiles).length === 0) {
      let migrated = false;

      if (oldProfilesRaw) {
        try {
            const oldProfiles = JSON.parse(oldProfilesRaw);
            if(Object.keys(oldProfiles).length > 0) {
              const migratedProfiles: Record<string, Profile> = {};
              for (const id in oldProfiles) {
                const oldProfile = oldProfiles[id];
                // remove compact mode from old settings
                const { compactMode, ...restSettings } = oldProfile.settings;
                migratedProfiles[id] = {
                  ...oldProfile,
                  settings: {
                    ...defaultSettings,
                    ...restSettings,
                  },
                  playbook: oldProfile.playbook || [],
                  isOnboarded: true, 
                };
              }
              setProfiles(migratedProfiles);
              migrated = true;
            }
        } catch { console.error("Failed to parse legacy profiles."); }
      }
      
      if (!migrated && (oldSettingsRaw || oldHistoryRaw)) {
        let migratedSettings: UserSettings = { ...defaultSettings, xp: 0, completedLessons: [], completedTrials: [] };
        let migratedHistory: DraftHistoryEntry[] = [];

        if (oldSettingsRaw) {
          try {
            const { compactMode, ...restSettings } = JSON.parse(oldSettingsRaw);
            migratedSettings = { ...migratedSettings, ...restSettings };
          } catch { /* use default */ }
        }
        if (oldHistoryRaw) {
          try { migratedHistory = JSON.parse(oldHistoryRaw); } catch { /* use default */ }
        }
        
        const defaultProfile: Profile = {
          id: 'default_profile',
          name: 'Default Profile',
          avatar: '🤖',
          settings: migratedSettings,
          draftHistory: migratedHistory,
          playbook: [],
          isOnboarded: true,
        };
        
        setProfiles({ [defaultProfile.id]: defaultProfile });
        setActiveProfileId(defaultProfile.id);
        migrated = true;
      }

      if(migrated) {
        localStorage.removeItem('draftwise_settings');
        localStorage.removeItem('draftwise_history');
        localStorage.removeItem('draftwise_profiles');
        localStorage.removeItem('draftwise_active_profile_id');
      }
    }
    setLoading(false);
  }, []); // Run only once on mount

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

  const createProfile = (name: string, avatar: string) => {
    const id = `profile_${new Date().getTime()}`;
    const newProfile: Profile = {
      id,
      name,
      avatar,
      settings: { ...defaultSettings, xp: 0, completedLessons: [], completedTrials: [] },
      draftHistory: [],
      playbook: [],
      isNew: true, // Set flag for onboarding
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
        isNew: false, // No longer a "new" profile
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