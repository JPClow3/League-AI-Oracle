import { Champion, TeamAnalytics } from '../types';
import { isChampion } from '../utils/typeGuards';

const SCORE_MAP: Record<string, number> = { 'Low': 1, 'Medium': 2, 'High': 3 };

const DNA_CATEGORIES: Record<string, string[]> = {
  'Engage/Dive': ['Dive', 'Engage', 'Vanguard', 'Teamfight', 'Juggernaut', 'Diver'],
  'Poke/Siege': ['Poke', 'Siege', 'Artillery', 'ZoneControl'],
  'Peel/Protect': ['Peel', 'Warden', 'Disengage', 'Enchanter', 'Protective', 'Catcher'],
  'Pick/Assassinate': ['Pick', 'Assassin', 'BurstMage', 'Slayer'],
  'Split Push': ['SplitPush', 'Duelist'],
  'Skirmish': ['Skirmisher'],
};

const getLabel = (value: number, totalChampions: number): string => {
  if (totalChampions === 0) return 'N/A';
  const average = value / totalChampions;
  if (average < 1.5) return 'Low';
  if (average < 2.5) return 'Medium';
  return 'High';
};

export const calculateTeamAnalytics = (champions: (Champion | null)[]): TeamAnalytics => {
  const validChampions = champions.filter(isChampion);
  
  const initialAnalytics: TeamAnalytics = {
    damageProfile: { ad: 0, ap: 0, hybrid: 0 },
    ccScore: { value: 0, label: 'Low' },
    engageScore: { value: 0, label: 'Low' },
    teamDNA: {}
  };

  if (validChampions.length === 0) {
    return initialAnalytics;
  }

  const analytics = validChampions.reduce(
    (acc: TeamAnalytics, champ) => {
      // Damage Profile
      if (champ.damageType === 'AD') acc.damageProfile.ad += 1;
      else if (champ.damageType === 'AP') acc.damageProfile.ap += 1;
      else if (champ.damageType === 'Hybrid') acc.damageProfile.hybrid += 1;

      // Scores
      // The new data doesn't have a simple 'ccLevel', so we estimate it based on the number of CC types.
      acc.ccScore.value += (champ.ccTypes?.length || 0) > 2 ? 3 : (champ.ccTypes?.length || 0) > 0 ? 2 : 1;
      acc.engageScore.value += SCORE_MAP[champ.engagePotential || 'Low'] || 1;

      return acc;
    },
    {
      damageProfile: { ad: 0, ap: 0, hybrid: 0 },
      ccScore: { value: 0, label: '' },
      engageScore: { value: 0, label: '' },
      teamDNA: {}
    }
  );

  analytics.ccScore.label = getLabel(analytics.ccScore.value, validChampions.length);
  analytics.engageScore.label = getLabel(analytics.engageScore.value, validChampions.length);
  
  // Calculate Team DNA
  const teamDNA: Record<string, number> = {};
  Object.keys(DNA_CATEGORIES).forEach(key => teamDNA[key] = 0);
  
  validChampions.forEach(champ => {
    champ.teamArchetypes?.forEach(archetype => {
      for (const category in DNA_CATEGORIES) {
        if (DNA_CATEGORIES[category].includes(archetype)) {
          teamDNA[category]++;
        }
      }
    });
  });
  analytics.teamDNA = teamDNA;

  return analytics;
};