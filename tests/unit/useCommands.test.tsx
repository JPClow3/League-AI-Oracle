import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useCommands } from '../../hooks/useCommands';
import { ChampionContext } from '../../contexts/ChampionContext';
import React from 'react';

// Mock useModals hook
vi.mock('../../hooks/useModals', () => ({
  useModals: () => ({
    dispatch: vi.fn(),
    modals: {
      profileSettings: false,
      settingsPanel: false,
      feedback: false,
      onboarding: false,
      keyboardShortcuts: false,
    },
  }),
}));

const mockSetCurrentPage = vi.fn();
const mockResetDraft = vi.fn();
const mockResetArena = vi.fn();
const mockResetLiveDraft = vi.fn();
const mockSetStrategyHubInitialTab = vi.fn();
const mockSetStrategyHubInitialSearch = vi.fn();

const mockChampionsLite = [
  { id: '1', name: 'Ahri', image: '/ahri.jpg', roles: ['Mid'], damageType: 'AP' },
  { id: '2', name: 'Zed', image: '/zed.jpg', roles: ['Mid'], damageType: 'AD' },
];

describe('useCommands', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ChampionContext.Provider
      value={
        {
          champions: [],
          championsLite: mockChampionsLite,
          isLoading: false,
          error: null,
        } as any
      }
    >
      {children}
    </ChampionContext.Provider>
  );

  it('should return list of commands', () => {
    const { result } = renderHook(
      () =>
        useCommands({
          setCurrentPage: mockSetCurrentPage,
          resetDraft: mockResetDraft,
          resetArena: mockResetArena,
          resetLiveDraft: mockResetLiveDraft,
          setStrategyHubInitialTab: mockSetStrategyHubInitialTab,
          setStrategyHubInitialSearch: mockSetStrategyHubInitialSearch,
        }),
      { wrapper }
    );

    expect(result.current).toBeDefined();
    expect(Array.isArray(result.current)).toBe(true);
    expect(result.current.length).toBeGreaterThan(0);
  });

  it('should include navigation commands', () => {
    const { result } = renderHook(
      () =>
        useCommands({
          setCurrentPage: mockSetCurrentPage,
          resetDraft: mockResetDraft,
          resetArena: mockResetArena,
          resetLiveDraft: mockResetLiveDraft,
          setStrategyHubInitialTab: mockSetStrategyHubInitialTab,
          setStrategyHubInitialSearch: mockSetStrategyHubInitialSearch,
        }),
      { wrapper }
    );

    const navCommands = result.current.filter(c => c.section === 'Navigation');
    expect(navCommands.length).toBeGreaterThan(0);
  });

  it('should include champion search commands', () => {
    const { result } = renderHook(
      () =>
        useCommands({
          setCurrentPage: mockSetCurrentPage,
          resetDraft: mockResetDraft,
          resetArena: mockResetArena,
          resetLiveDraft: mockResetLiveDraft,
          setStrategyHubInitialTab: mockSetStrategyHubInitialTab,
          setStrategyHubInitialSearch: mockSetStrategyHubInitialSearch,
        }),
      { wrapper }
    );

    const champCommands = result.current.filter(c => c.section === 'Champion Search');
    expect(champCommands.length).toBe(mockChampionsLite.length);
  });

  it('should execute navigation command', () => {
    const { result } = renderHook(
      () =>
        useCommands({
          setCurrentPage: mockSetCurrentPage,
          resetDraft: mockResetDraft,
          resetArena: mockResetArena,
          resetLiveDraft: mockResetLiveDraft,
          setStrategyHubInitialTab: mockSetStrategyHubInitialTab,
          setStrategyHubInitialSearch: mockSetStrategyHubInitialSearch,
        }),
      { wrapper }
    );

    const homeCommand = result.current.find(c => c.id === 'nav-home');
    if (homeCommand) {
      homeCommand.action();
      expect(mockSetCurrentPage).toHaveBeenCalledWith('Home');
    }
  });
});
