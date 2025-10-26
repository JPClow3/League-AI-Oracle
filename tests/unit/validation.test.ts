import { describe, it, expect } from 'vitest';
import { validateDraft } from '../../lib/validation';

describe('validation', () => {
  describe('validateDraft', () => {
    it('should validate a complete draft', () => {
      const mockChampion = { id: 'ahri', name: 'Ahri', roles: ['Mid'] };
      const mockDraft = {
        blue: {
          picks: Array(5).fill(null).map((_, i) => ({
            champion: { id: `champ${i}`, name: `Champ${i}`, roles: ['Top'] },
            isActive: false
          })),
          bans: Array(5).fill(null).map((_, i) => ({
            champion: { id: `ban${i}`, name: `Ban${i}`, roles: ['Mid'] }
          }))
        },
        red: {
          picks: Array(5).fill(null).map((_, i) => ({
            champion: { id: `champ${i + 5}`, name: `Champ${i + 5}`, roles: ['Top'] },
            isActive: false
          })),
          bans: Array(5).fill(null).map((_, i) => ({
            champion: { id: `ban${i + 5}`, name: `Ban${i + 5}`, roles: ['Mid'] }
          }))
        }
      };

      const result = validateDraft(mockDraft as any);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should invalidate incomplete draft', () => {
      const mockDraft = {
        blue: {
          picks: Array(3).fill(null).map((_, i) => ({
            champion: { id: `champ${i}`, name: `Champ${i}`, roles: ['Top'] },
            isActive: false
          })).concat(Array(2).fill({ champion: null, isActive: false })),
          bans: Array(5).fill(null).map((_, i) => ({
            champion: { id: `ban${i}`, name: `Ban${i}`, roles: ['Mid'] }
          }))
        },
        red: {
          picks: Array(5).fill(null).map((_, i) => ({
            champion: { id: `champ${i + 5}`, name: `Champ${i + 5}`, roles: ['Top'] },
            isActive: false
          })),
          bans: Array(5).fill(null).map((_, i) => ({
            champion: { id: `ban${i + 5}`, name: `Ban${i + 5}`, roles: ['Mid'] }
          }))
        }
      };

      const result = validateDraft(mockDraft as any);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});

