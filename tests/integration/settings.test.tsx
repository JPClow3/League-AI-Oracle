import { describe, it, expect } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useSettings, SettingsProvider } from '../../hooks/useSettings';
import { useUserProfile, UserProfileProvider } from '../../hooks/useUserProfile';
import React from 'react';

const AllProviders = ({ children }: { children: React.ReactNode }) => (
  React.createElement(UserProfileProvider, null,
    React.createElement(SettingsProvider, null, children)
  )
);

describe('Settings Integration', () => {
  it('should persist settings changes', async () => {
    const { result } = renderHook(() => useSettings(), { wrapper: AllProviders });

    act(() => {
      result.current.setSettings({ theme: 'light' });
    });

    await waitFor(() => {
      expect(result.current.settings.theme).toBe('light');
    });
  });

  it('should sync theme with user profile', async () => {
    const { result: settingsResult } = renderHook(() => useSettings(), { wrapper: AllProviders });
    const { result: profileResult } = renderHook(() => useUserProfile(), { wrapper: AllProviders });

    act(() => {
      settingsResult.current.setSettings({ theme: 'dark' });
    });

    await waitFor(() => {
      expect(settingsResult.current.settings.theme).toBe('dark');
    });
  });
});
