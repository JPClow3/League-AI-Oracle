import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getDraftAdvice, getBotDraftAction, getTeambuilderSuggestion } from '../../services/geminiService';
import type { DraftState, ChampionLite } from '../../types';

// Mock the API calls
vi.mock('../../services/geminiService', async () => {
  const actual = await vi.importActual('../../services/geminiService');
  return {
    ...actual,
    callGemini: vi.fn().mockResolvedValue({
      teamAnalysis: {
        blue: { draftScore: 'A', strengths: [], weaknesses: [] },
        red: { draftScore: 'B', strengths: [], weaknesses: [] },
      },
    }),
  };
});

describe('GeminiService Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockDraftState: DraftState = {
    blue: {
      picks: Array(5)
        .fill(null)
        .map(() => ({ champion: null, isActive: false })),
      bans: [],
    },
    red: {
      picks: Array(5)
        .fill(null)
        .map(() => ({ champion: null, isActive: false })),
      bans: [],
    },
    turn: 'blue',
    phase: 'pick1',
  };

  const mockChampionsLite: ChampionLite[] = [
    { id: '1', name: 'Ahri', image: '/ahri.jpg', roles: ['Mid'], damageType: 'AP' },
  ];

  it('should validate draft advice response with Zod', async () => {
    const abortController = new AbortController();

    // This will use the mocked callGemini which returns valid structure
    const result = await getDraftAdvice(
      mockDraftState,
      'blue',
      'Mid',
      'Beginner',
      'gemini-2.5-flash',
      abortController.signal
    );

    expect(result).toBeDefined();
    expect(result.teamAnalysis).toBeDefined();
    expect(result.teamAnalysis.blue).toBeDefined();
    expect(result.teamAnalysis.red).toBeDefined();
  });

  it('should validate bot draft action response', async () => {
    const abortController = new AbortController();

    const result = await getBotDraftAction({
      draftState: mockDraftState,
      turn: { team: 'blue', type: 'pick', index: 0 },
      persona: 'Aggressive',
      availableChampions: mockChampionsLite,
      signal: abortController.signal,
    });

    expect(result).toBeDefined();
    expect(result.championName).toBeDefined();
  });
});
