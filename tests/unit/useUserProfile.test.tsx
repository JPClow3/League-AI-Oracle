import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useUserProfile, UserProfileProvider } from '../../hooks/useUserProfile';
import * as indexedDb from '../../lib/indexedDb';

vi.mock('../../lib/indexedDb', () => ({
  getDb: vi.fn(),
}));

describe('useUserProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should provide default profile', async () => {
    const mockDb = {
      profile: {
        get: vi.fn().mockResolvedValue(null),
        put: vi.fn(),
      },
    };

    vi.mocked(indexedDb.getDb).mockResolvedValue(mockDb as any);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <UserProfileProvider>{children}</UserProfileProvider>
    );

    const { result } = renderHook(() => useUserProfile(), { wrapper });

    await waitFor(() => {
      expect(result.current.profile).toBeDefined();
      expect(result.current.profile.skillLevel).toBe('Beginner');
    });
  });

  it('should load profile from database', async () => {
    const mockProfile = {
      skillLevel: 'Advanced' as const,
      sp: 1000,
      missions: [],
      championMastery: [],
      recentFeedback: [],
    };

    const mockDb = {
      profile: {
        get: vi.fn().mockResolvedValue(mockProfile),
        put: vi.fn(),
      },
    };

    vi.mocked(indexedDb.getDb).mockResolvedValue(mockDb as any);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <UserProfileProvider>{children}</UserProfileProvider>
    );

    const { result } = renderHook(() => useUserProfile(), { wrapper });

    await waitFor(() => {
      expect(result.current.profile.skillLevel).toBe('Advanced');
      expect(result.current.profile.sp).toBe(1000);
    });
  });

  it('should add SP', async () => {
    const mockDb = {
      profile: {
        get: vi.fn().mockResolvedValue(null),
        put: vi.fn(),
      },
    };

    vi.mocked(indexedDb.getDb).mockResolvedValue(mockDb as any);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <UserProfileProvider>{children}</UserProfileProvider>
    );

    const { result } = renderHook(() => useUserProfile(), { wrapper });

    await waitFor(() => {
      result.current.addSP(100, 'Test reason');
    });

    await waitFor(() => {
      expect(result.current.profile.sp).toBe(100);
    });
  });
});
