import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useSettings } from '../../hooks/useSettings';
import { SettingsProvider } from '../../hooks/useSettings';
import * as storageService from '../../services/storageService';

vi.mock('../../services/storageService', () => ({
  getSettings: vi.fn(),
  saveSettings: vi.fn(),
}));

describe('useSettings Hook', () => {
  it('loads settings from storage on mount', async () => {
    const mockSettings = {
      theme: 'dark' as const,
      primaryRole: 'Mid',
      secondaryRole: 'Top',
      favoriteChampions: ['Ahri', 'Zed'],
      language: 'en' as const,
      enableSound: true,
      dashboardCards: [],
    };

    vi.mocked(storageService.getSettings).mockReturnValue(mockSettings);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <SettingsProvider>{children}</SettingsProvider>
    );

    const { result } = renderHook(() => useSettings(), { wrapper });

    await waitFor(() => {
      expect(result.current.settings.theme).toBe('dark');
      expect(result.current.settings.primaryRole).toBe('Mid');
    });
  });

  it('updates settings and saves to storage', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <SettingsProvider>{children}</SettingsProvider>
    );

    const { result } = renderHook(() => useSettings(), { wrapper });

    await waitFor(() => {
      result.current.setSettings({ theme: 'light' });
    });

    await waitFor(() => {
      expect(result.current.settings.theme).toBe('light');
      expect(storageService.saveSettings).toHaveBeenCalled();
    });
  });
});

