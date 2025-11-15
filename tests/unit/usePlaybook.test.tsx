import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { usePlaybook } from '../../hooks/usePlaybook';
import * as indexedDb from '../../lib/indexedDb';

vi.mock('../../lib/indexedDb', () => ({
  getDb: vi.fn(),
}));

describe('usePlaybook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should load entries from database', async () => {
    const mockEntries = [
      {
        id: '1',
        name: 'Test Draft',
        draftState: { blue: { picks: [], bans: [] }, red: { picks: [], bans: [] }, turn: 'blue', phase: 'pick1' },
        createdAt: new Date(),
        status: 'saved' as const,
      },
    ];

    const mockDb = {
      history: {
        toArray: vi.fn().mockResolvedValue(mockEntries),
        add: vi.fn(),
        delete: vi.fn(),
        update: vi.fn(),
      },
    };

    vi.mocked(indexedDb.getDb).mockResolvedValue(mockDb as any);

    const { result } = renderHook(() => usePlaybook());

    await waitFor(() => {
      expect(result.current.entries).toHaveLength(1);
      expect(result.current.entries[0].name).toBe('Test Draft');
    });
  });

  it('should save draft to playbook', async () => {
    const mockDb = {
      history: {
        toArray: vi.fn().mockResolvedValue([]),
        add: vi.fn().mockResolvedValue('new-id'),
        delete: vi.fn(),
        update: vi.fn(),
      },
    };

    vi.mocked(indexedDb.getDb).mockResolvedValue(mockDb as any);

    const { result } = renderHook(() => usePlaybook());

    await waitFor(() => {
      result.current.saveDraft(
        {
          blue: { picks: [], bans: [] },
          red: { picks: [], bans: [] },
          turn: 'blue',
          phase: 'pick1',
        },
        'New Draft'
      );
    });

    await waitFor(() => {
      expect(mockDb.history.add).toHaveBeenCalled();
    });
  });

  it('should delete entry', async () => {
    const mockDb = {
      history: {
        toArray: vi.fn().mockResolvedValue([]),
        add: vi.fn(),
        delete: vi.fn(),
        update: vi.fn(),
      },
    };

    vi.mocked(indexedDb.getDb).mockResolvedValue(mockDb as any);

    const { result } = renderHook(() => usePlaybook());

    await waitFor(() => {
      result.current.deleteEntry('entry-id');
    });

    expect(mockDb.history.delete).toHaveBeenCalledWith('entry-id');
  });
});
