import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as storageService from '../../services/storageService';

describe('StorageService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('getSettings', () => {
    it('should return null when no settings exist', () => {
      const result = storageService.getSettings();
      expect(result).toBeNull();
    });

    it('should return parsed settings', () => {
      const settings = {
        theme: 'dark' as const,
        primaryRole: 'Mid',
        favoriteChampions: ['Ahri'],
        recentChampions: [],
        language: 'en' as const,
        enableSound: false,
        dashboardCards: [],
      };

      localStorage.setItem('userSettings', JSON.stringify(settings));
      const result = storageService.getSettings();

      expect(result).toEqual(settings);
    });

    it('should handle corrupted settings gracefully', () => {
      localStorage.setItem('userSettings', 'invalid json{');

      expect(() => {
        storageService.getSettings();
      }).not.toThrow();
    });
  });

  describe('saveSettings', () => {
    it('should save settings to localStorage', () => {
      const settings = {
        theme: 'light' as const,
        primaryRole: 'Top',
        favoriteChampions: [],
        recentChampions: [],
        language: 'en' as const,
        enableSound: true,
        dashboardCards: [],
      };

      storageService.saveSettings(settings);

      const saved = localStorage.getItem('userSettings');
      expect(saved).toBeTruthy();
      expect(JSON.parse(saved!)).toEqual(settings);
    });
  });
});
