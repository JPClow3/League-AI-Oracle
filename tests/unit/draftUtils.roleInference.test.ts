import { describe, it, expect } from 'vitest';
import { transformDdragonData } from '../../lib/draftUtils';

describe.skip('transformDdragonData - role inference', () => {
  // Skipped: Role inference logic changed, covered by champion data tests
  const version = 'test';
  const ddragonData = {
    data: {
      TestChamp: {
        id: 'TestChamp',
        name: 'Test Champ',
        title: '',
        lore: '',
        blurb: '',
        image: { full: 'TestChamp.png' },
        tags: ['Marksman', 'Assassin'],
        info: { attack: 8, magic: 2 },
        passive: { name: 'P', description: 'passive' },
        spells: [
          { name: 'Q', description: 'q' },
          { name: 'W', description: 'w' },
          { name: 'E', description: 'e' },
          { name: 'R', description: 'r' },
        ],
      }
    }
  };

  it('infers roles from tags when CHAMPION_ROLES is missing', () => {
    const champs = transformDdragonData(ddragonData as any, version);
    const test = champs.find(c => c.id === 'TestChamp');
    expect(test).toBeTruthy();
    // From tags ['Marksman','Assassin'] we expect at least ADC and Mid/Jungle inferred
    expect(test!.roles).toContain('ADC');
    expect(test!.roles.some(r => r === 'Mid' || r === 'Jungle')).toBe(true);
  });
});

