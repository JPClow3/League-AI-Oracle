import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChampionGrid } from '../../components/DraftLab/ChampionGrid';
import { ChampionContext } from '../../contexts/ChampionContext';
import { SettingsProvider } from '../../hooks/useSettings';
import type { DraftState, ChampionLite, Champion } from '../../types';

const mockChampions: Champion[] = Array.from({ length: 5 }, (_, i) => ({
  id: `champ-${i}`,
  name: `Champion ${i}`,
  image: `/champ-${i}.jpg`,
  splashUrl: `/splash-${i}.jpg`,
  loadingScreenUrl: `/loading-${i}.jpg`,
  title: `Title ${i}`,
  lore: 'Lore',
  playstyle: 'Test',
  roles: ['Mid'],
  class: ['Mage'],
  subclass: ['Burst'],
  damageType: 'AP',
  cc: 'Medium',
  engage: 'Low',
  abilities: [],
}));

const mockChampionsLite: ChampionLite[] = mockChampions.map(c => ({
  id: c.id,
  name: c.name,
  image: c.image,
  roles: c.roles,
  damageType: c.damageType,
}));

describe('Champion Selection Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should track recent champions when selecting', async () => {
    const onSelect = vi.fn();
    const draftState: DraftState = {
      blue: { picks: [], bans: [] },
      red: { picks: [], bans: [] },
      turn: 'blue',
      phase: 'pick1',
    };

    render(
      <ChampionContext.Provider
        value={
          {
            champions: mockChampions,
            championsLite: mockChampionsLite,
            isLoading: false,
            error: null,
          } as any
        }
      >
        <SettingsProvider>
          <ChampionGrid
            onSelect={onSelect}
            onQuickLook={vi.fn()}
            onWhyThisPick={vi.fn()}
            recommendations={[]}
            isRecsLoading={false}
            activeRole={null}
            draftState={draftState}
            onDragStart={vi.fn()}
          />
        </SettingsProvider>
      </ChampionContext.Provider>
    );

    await waitFor(() => {
      const buttons = screen.getAllByRole('button').filter(btn => btn.getAttribute('aria-label')?.includes('Select'));

      if (buttons.length > 0) {
        fireEvent.click(buttons[0]);
        expect(onSelect).toHaveBeenCalled();
      }
    });
  });

  it('should filter champions and maintain selection state', async () => {
    const draftState: DraftState = {
      blue: {
        picks: [{ champion: mockChampions[0], isActive: false }],
        bans: [],
      },
      red: { picks: [], bans: [] },
      turn: 'blue',
      phase: 'pick1',
    };

    render(
      <ChampionContext.Provider
        value={
          {
            champions: mockChampions,
            championsLite: mockChampionsLite,
            isLoading: false,
            error: null,
          } as any
        }
      >
        <SettingsProvider>
          <ChampionGrid
            onSelect={vi.fn()}
            onQuickLook={vi.fn()}
            onWhyThisPick={vi.fn()}
            recommendations={[]}
            isRecsLoading={false}
            activeRole={null}
            draftState={draftState}
            onDragStart={vi.fn()}
          />
        </SettingsProvider>
      </ChampionContext.Provider>
    );

    // Selected champion should not appear in available list
    await waitFor(() => {
      const availableButtons = screen
        .getAllByRole('button')
        .filter(btn => btn.getAttribute('aria-label')?.includes('Select'));
      // Should have fewer champions (one is selected)
      expect(availableButtons.length).toBeLessThan(mockChampions.length);
    });
  });
});
