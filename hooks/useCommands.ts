import { useMemo } from 'react';
import type { Page } from '../types';
import { Command } from '../components/common/CommandPalette';
import { useModals } from './useModals';
import { useChampions } from '../contexts/ChampionContext';

interface UseCommandsProps {
  setCurrentPage: (page: Page) => void;
  resetDraft: () => void;
  resetArena: () => void;
  resetLiveDraft: () => void;
  setStrategyHubInitialTab: (tab: 'champions' | 'intel') => void;
  setStrategyHubInitialSearch: (term: string | null) => void;
}

export const useCommands = ({
  setCurrentPage,
  resetDraft,
  resetArena,
  resetLiveDraft,
  setStrategyHubInitialTab,
  setStrategyHubInitialSearch,
}: UseCommandsProps): Command[] => {
  const { dispatch } = useModals();
  const { championsLite } = useChampions();

  return useMemo(() => {
    const pageCommands: Command[] = [
      { id: 'nav-home', title: 'Go to Home', section: 'Navigation', action: () => setCurrentPage('Home') },
      {
        id: 'nav-live-draft',
        title: 'Go to Live Co-Pilot',
        section: 'Navigation',
        action: () => setCurrentPage('Live Co-Pilot'),
      },
      {
        id: 'nav-draft-lab',
        title: 'Go to Strategy Forge',
        section: 'Navigation',
        action: () => setCurrentPage('Strategy Forge'),
      },
      {
        id: 'nav-arena',
        title: 'Go to Draft Arena',
        section: 'Navigation',
        action: () => setCurrentPage('Draft Arena'),
      },
      {
        id: 'nav-scenarios',
        title: 'Go to Draft Scenarios',
        section: 'Navigation',
        action: () => setCurrentPage('Draft Scenarios'),
      },
      { id: 'nav-playbook', title: 'Go to Archives', section: 'Navigation', action: () => setCurrentPage('Archives') },
      { id: 'nav-strategy-hub', title: 'Go to Armory', section: 'Navigation', action: () => setCurrentPage('Armory') },
      { id: 'nav-academy', title: 'Go to Academy', section: 'Navigation', action: () => setCurrentPage('Academy') },
      { id: 'nav-meta-oracle', title: 'Go to Oracle', section: 'Navigation', action: () => setCurrentPage('Oracle') },
      {
        id: 'nav-trial',
        title: 'Go to Daily Challenge',
        section: 'Navigation',
        action: () => setCurrentPage('Daily Challenge'),
      },
      { id: 'nav-profile', title: 'Go to Profile', section: 'Navigation', action: () => setCurrentPage('Profile') },
    ];

    const actionCommands: Command[] = [
      { id: 'action-reset-lab', title: 'Reset Strategy Forge', section: 'Actions', action: resetDraft },
      { id: 'action-reset-arena', title: 'Reset Draft Arena', section: 'Actions', action: resetArena },
      { id: 'action-reset-live-draft', title: 'Reset Live Co-Pilot', section: 'Actions', action: resetLiveDraft },
      {
        id: 'action-open-settings',
        title: 'Open Settings',
        section: 'Actions',
        action: () => dispatch({ type: 'OPEN_SETTINGS_PANEL' }),
      },
      {
        id: 'action-give-feedback',
        title: 'Give Feedback',
        section: 'Actions',
        action: () => dispatch({ type: 'OPEN_FEEDBACK' }),
      },
    ];

    const championSearchCommands: Command[] = championsLite.map(champ => ({
      id: `search-champ-${champ.id}`,
      title: `Find Champion: ${champ.name}`,
      section: 'Champion Search',
      action: () => {
        setStrategyHubInitialTab('champions');
        setStrategyHubInitialSearch(champ.name);
        setCurrentPage('Armory');
      },
    }));

    return [...pageCommands, ...actionCommands, ...championSearchCommands];
  }, [
    championsLite,
    setCurrentPage,
    resetDraft,
    resetArena,
    resetLiveDraft,
    dispatch,
    setStrategyHubInitialTab,
    setStrategyHubInitialSearch,
  ]);
};
