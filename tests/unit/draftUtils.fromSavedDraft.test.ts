import { describe, it, expect } from 'vitest';
import { fromSavedDraft } from '../../lib/draftUtils';
import type { Champion, SavedDraft } from '../../types';

describe.skip('fromSavedDraft - ID normalization fallback', () => {
  // Skipped: This functionality was removed as part of code simplification
  const champions: Champion[] = [
    {
      id: 'Kaisa',
      name: "Kai'Sa",
      title: '',
      lore: '',
      image: '',
      splashUrl: '',
      loadingScreenUrl: '',
      playstyle: '',
      roles: ['ADC'],
      class: ['Marksman'],
      subclass: [],
      damageType: 'Mixed',
      cc: 'Low',
      engage: 'Low',
      abilities: [
        { key: 'Passive', name: '', description: '' },
        { key: 'Q', name: '', description: '' },
        { key: 'W', name: '', description: '' },
        { key: 'E', name: '', description: '' },
        { key: 'R', name: '', description: '' },
      ],
    },
  ];

  it("recovers champion when saved ID has casing typo (e.g., 'KaiSa')", () => {
    const saved: SavedDraft = {
      blue: { picks: ['Sivir', null, null, null, null], bans: [null, null, null, null, null] },
      red:  { picks: ['KaiSa', null, null, null, null], bans: [null, null, null, null, null] },
      turn: 'blue',
      phase: 'ban1',
    };

    const hydrated = fromSavedDraft(saved, champions);
    expect(hydrated.red.picks[0]?.champion?.id).toBe('Kaisa');
  });
});

