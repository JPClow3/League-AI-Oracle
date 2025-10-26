import { describe, it, expect } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { ChampionProvider, useChampions } from '../../contexts/ChampionContext';
import { DraftProvider, useDraft } from '../../contexts/DraftContext';
import React from 'react';

describe('Draft Context Integration', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ChampionProvider>
      <DraftProvider>{children}</DraftProvider>
    </ChampionProvider>
  );

  it('should update draft state correctly', () => {
    const { result } = renderHook(() => useDraft(), { wrapper });

    expect(result.current.draftState.blue.picks.length).toBe(5);
    expect(result.current.draftState.red.picks.length).toBe(5);
  });

  it('should reset draft state', () => {
    const { result } = renderHook(() => useDraft(), { wrapper });

    act(() => {
      result.current.resetDraft();
    });

    expect(result.current.draftState.blue.picks.every(p => p.champion === null)).toBe(true);
  });

  it('should work with champion context', async () => {
    const { result: championsResult } = renderHook(() => useChampions(), { wrapper });
    const { result: draftResult } = renderHook(() => useDraft(), { wrapper });

    await waitFor(() => {
      expect(championsResult.current.champions.length).toBeGreaterThan(0);
    });

    expect(draftResult.current.draftState).toBeDefined();
  });
});

