import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChampionGrid } from '../../components/DraftLab/ChampionGrid';
import { ChampionContext } from '../../contexts/ChampionContext';
import { SettingsProvider } from '../../hooks/useSettings';
import type { DraftState, ChampionLite, Champion } from '../../types';

const mockChampions: Champion[] = [
  {
    id: '1',
    name: 'Ahri',
    image: '/ahri.jpg',
    splashUrl: '/ahri-splash.jpg',
    loadingScreenUrl: '/ahri-loading.jpg',
    title: 'The Nine-Tailed Fox',
    lore: 'Lore',
    playstyle: 'Mage',
    roles: ['Mid'],
    class: ['Mage'],
    subclass: ['Burst'],
    damageType: 'AP',
    cc: 'Medium',
    engage: 'Low',
    abilities: [],
  },
  {
    id: '2',
    name: 'Zed',
    image: '/zed.jpg',
    splashUrl: '/zed-splash.jpg',
    loadingScreenUrl: '/zed-loading.jpg',
    title: 'The Master of Shadows',
    lore: 'Lore',
    playstyle: 'Assassin',
    roles: ['Mid'],
    class: ['Assassin'],
    subclass: ['Burst'],
    damageType: 'AD',
    cc: 'Low',
    engage: 'High',
    abilities: [],
  },
];

const mockChampionsLite: ChampionLite[] = mockChampions.map(c => ({
  id: c.id,
  name: c.name,
  image: c.image,
  roles: c.roles,
  damageType: c.damageType,
}));

const mockDraftState: DraftState = {
  blue: { picks: [], bans: [] },
  red: { picks: [], bans: [] },
  turn: 'blue',
  phase: 'pick1',
};

const mockChampionContextValue = {
  champions: mockChampions,
  championsLite: mockChampionsLite,
  isLoading: false,
  error: null,
};

describe('ChampionGrid', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderChampionGrid = (props = {}) => {
    return render(
      <ChampionContext.Provider value={mockChampionContextValue as any}>
        <SettingsProvider>
          <ChampionGrid
            onSelect={vi.fn()}
            onQuickLook={vi.fn()}
            onWhyThisPick={vi.fn()}
            recommendations={[]}
            isRecsLoading={false}
            activeRole={null}
            draftState={mockDraftState}
            onDragStart={vi.fn()}
            {...props}
          />
        </SettingsProvider>
      </ChampionContext.Provider>
    );
  };

  it('should render champion grid', () => {
    renderChampionGrid();

    expect(screen.getByPlaceholderText(/search champions/i)).toBeInTheDocument();
  });

  it('should filter champions by search term', async () => {
    renderChampionGrid();

    const searchInput = screen.getByPlaceholderText(/search champions/i);
    fireEvent.change(searchInput, { target: { value: 'Ahri' } });

    await waitFor(() => {
      expect(screen.getByAltText(/ahri/i)).toBeInTheDocument();
      expect(screen.queryByAltText(/zed/i)).not.toBeInTheDocument();
    });
  });

  it('should filter champions by role', async () => {
    renderChampionGrid();

    const midButton = screen.getByRole('button', { name: /mid/i });
    fireEvent.click(midButton);

    await waitFor(() => {
      expect(midButton).toHaveAttribute('aria-pressed', 'true');
    });
  });

  it('should handle champion selection', async () => {
    const onSelect = vi.fn();
    renderChampionGrid({ onSelect });

    await waitFor(() => {
      const championButton = screen.getByAltText(/ahri/i).closest('button');
      if (championButton) {
        fireEvent.click(championButton);
      }
    });

    expect(onSelect).toHaveBeenCalled();
  });

  it('should handle keyboard navigation', async () => {
    renderChampionGrid();

    await waitFor(() => {
      const firstButton = screen.getAllByRole('button').find(btn => btn.getAttribute('aria-label')?.includes('Select'));

      if (firstButton) {
        firstButton.focus();
        fireEvent.keyDown(firstButton, { key: 'ArrowRight' });
      }
    });
  });

  it('should show recent champions panel', async () => {
    // Mock settings with recent champions
    const { useSettings } = await import('../../hooks/useSettings');
    const originalUseSettings = useSettings;

    vi.spyOn(await import('../../hooks/useSettings'), 'useSettings').mockReturnValue({
      settings: {
        theme: 'dark',
        primaryRole: 'All',
        secondaryRole: 'All',
        favoriteChampions: [],
        recentChampions: ['1'], // Ahri
        language: 'en',
        enableSound: false,
        dashboardCards: [],
      },
      setSettings: vi.fn(),
    } as any);

    renderChampionGrid();

    await waitFor(() => {
      expect(screen.getByText(/recent/i)).toBeInTheDocument();
    });
  });
});
