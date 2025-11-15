import { describe, it, expect } from 'vitest';
import {
  toSavedDraft,
  fromSavedDraft,
  getAvailableChampions,
  updateSlotInDraft,
  swapChampionsInDraft,
} from '../../lib/draftUtils';
import type { DraftState, ChampionLite, Champion } from '../../types';

const createMockChampion = (id: string, name: string): Champion => ({
  id,
  name,
  image: `image-${id}`,
  splashUrl: `splash-${id}`,
  loadingScreenUrl: `loading-${id}`,
  title: `Title ${name}`,
  lore: `Lore ${name}`,
  playstyle: 'Aggressive',
  roles: ['Mid'],
  class: ['Mage'],
  subclass: ['Burst'],
  damageType: 'AP',
  cc: 'Medium',
  engage: 'Low',
  abilities: [],
});

const createMockChampionLite = (id: string, name: string): ChampionLite => ({
  id,
  name,
  image: `image-${id}`,
  roles: ['Mid'],
  damageType: 'AP',
});

describe('draftUtils', () => {
  describe('toSavedDraft', () => {
    it('should convert DraftState to SavedDraft', () => {
      const draftState: DraftState = {
        blue: {
          picks: [
            { champion: createMockChampion('1', 'Ahri'), isActive: false },
            { champion: null, isActive: false },
          ],
          bans: [{ champion: createMockChampion('2', 'Zed'), isActive: false }],
        },
        red: {
          picks: [],
          bans: [],
        },
        turn: 'blue',
        phase: 'pick1',
      };

      const saved = toSavedDraft(draftState);

      expect(saved.blue.picks).toEqual(['1', null]);
      expect(saved.blue.bans).toEqual(['2']);
      expect(saved.red.picks).toEqual([null, null, null, null, null]);
    });
  });

  describe('fromSavedDraft', () => {
    it('should convert SavedDraft to DraftState with champions', () => {
      const champions = [createMockChampion('1', 'Ahri'), createMockChampion('2', 'Zed')];

      const saved = {
        blue: { picks: ['1', null], bans: ['2'] },
        red: { picks: [], bans: [] },
        turn: 'blue' as const,
        phase: 'pick1' as const,
      };

      const draftState = fromSavedDraft(saved, champions);

      expect(draftState.blue.picks[0]?.champion?.id).toBe('1');
      expect(draftState.blue.picks[1]?.champion).toBeNull();
      expect(draftState.blue.bans[0]?.champion?.id).toBe('2');
    });

    it('should handle missing champions gracefully', () => {
      const champions: Champion[] = [];
      const saved = {
        blue: { picks: ['missing'], bans: [] },
        red: { picks: [], bans: [] },
        turn: 'blue' as const,
        phase: 'pick1' as const,
      };

      const draftState = fromSavedDraft(saved, champions);
      expect(draftState.blue.picks[0]?.champion).toBeNull();
    });
  });

  describe('getAvailableChampions', () => {
    it('should filter out selected and banned champions', () => {
      const allChampions: ChampionLite[] = [
        createMockChampionLite('1', 'Ahri'),
        createMockChampionLite('2', 'Zed'),
        createMockChampionLite('3', 'Jinx'),
      ];

      const draftState: DraftState = {
        blue: {
          picks: [{ champion: createMockChampion('1', 'Ahri'), isActive: false }],
          bans: [{ champion: createMockChampion('2', 'Zed'), isActive: false }],
        },
        red: {
          picks: [],
          bans: [],
        },
        turn: 'blue',
        phase: 'pick1',
      };

      const available = getAvailableChampions(draftState, allChampions);

      expect(available).toHaveLength(1);
      expect(available[0].id).toBe('3');
    });
  });

  describe('updateSlotInDraft', () => {
    it('should update a pick slot', () => {
      const draftState: DraftState = {
        blue: {
          picks: [{ champion: null, isActive: false }],
          bans: [],
        },
        red: { picks: [], bans: [] },
        turn: 'blue',
        phase: 'pick1',
      };

      const updated = updateSlotInDraft(draftState, 'blue', 'pick', 0, createMockChampion('1', 'Ahri'));

      expect(updated.blue.picks[0]?.champion?.id).toBe('1');
    });

    it('should clear a slot when champion is null', () => {
      const draftState: DraftState = {
        blue: {
          picks: [{ champion: createMockChampion('1', 'Ahri'), isActive: false }],
          bans: [],
        },
        red: { picks: [], bans: [] },
        turn: 'blue',
        phase: 'pick1',
      };

      const updated = updateSlotInDraft(draftState, 'blue', 'pick', 0, null);
      expect(updated.blue.picks[0]?.champion).toBeNull();
    });
  });

  describe('swapChampionsInDraft', () => {
    it('should swap two champions', () => {
      const draftState: DraftState = {
        blue: {
          picks: [
            { champion: createMockChampion('1', 'Ahri'), isActive: false },
            { champion: createMockChampion('2', 'Zed'), isActive: false },
          ],
          bans: [],
        },
        red: { picks: [], bans: [] },
        turn: 'blue',
        phase: 'pick1',
      };

      const swapped = swapChampionsInDraft(
        draftState,
        { team: 'blue', type: 'pick', index: 0 },
        { team: 'blue', type: 'pick', index: 1 }
      );

      expect(swapped.blue.picks[0]?.champion?.id).toBe('2');
      expect(swapped.blue.picks[1]?.champion?.id).toBe('1');
    });
  });
});
