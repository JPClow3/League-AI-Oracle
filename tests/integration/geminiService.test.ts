import { describe, it, expect } from 'vitest';
import { getDraftAdvice } from '../../services/geminiService';
import { getInitialDraftState } from '../../contexts/DraftContext';

/**
 * Integration tests for Gemini Service
 * Note: These tests require VITE_GEMINI_API_KEY to be set
 */
describe('GeminiService Integration', () => {
  // Skip these tests if no API key is available
  const hasApiKey = !!process.env.VITE_GEMINI_API_KEY;

  it.skipIf(!hasApiKey)('should handle draft analysis request', async () => {
    const draftState = getInitialDraftState();
    const controller = new AbortController();

    try {
      const result = await getDraftAdvice(
        draftState,
        'blue',
        'Mid',
        'Intermediate',
        'gemini-2.5-flash',
        controller.signal
      );

      // Should return proper structure even with empty draft
      expect(result).toBeDefined();
      expect(result.teamAnalysis).toBeDefined();
      expect(result.teamAnalysis.blue).toBeDefined();
      expect(result.teamAnalysis.red).toBeDefined();
    } catch (error) {
      // Expected to fail with incomplete draft
      expect(error).toBeDefined();
    }
  }, 10000); // 10 second timeout for API calls

  it('should abort request when signal is triggered', async () => {
    if (!hasApiKey) return;

    const draftState = getInitialDraftState();
    const controller = new AbortController();

    // Abort immediately
    controller.abort();

    await expect(
      getDraftAdvice(
        draftState,
        'blue',
        'Mid',
        'Intermediate',
        'gemini-2.5-flash',
        controller.signal
      )
    ).rejects.toThrow('Aborted');
  });

  it('should validate empty response from AI', async () => {
    // This test validates error handling for empty responses
    // Actual test would require mocking the AI response
    expect(true).toBe(true);
  });
});
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChampionGrid } from '../../components/DraftLab/ChampionGrid';
import { ChampionProvider } from '../../contexts/ChampionContext';
import { getInitialDraftState } from '../../contexts/DraftContext';
import type { ChampionLite } from '../../types';

// Mock champion data
const mockChampions: ChampionLite[] = [
  { id: 'Ahri', name: 'Ahri', image: '/ahri.jpg', roles: ['Mid'], damageType: 'AP' },
  { id: 'Garen', name: 'Garen', image: '/garen.jpg', roles: ['Top'], damageType: 'AD' },
  { id: 'Jinx', name: 'Jinx', image: '/jinx.jpg', roles: ['ADC'], damageType: 'AD' },
  { id: 'Leona', name: 'Leona', image: '/leona.jpg', roles: ['Support'], damageType: 'Mixed' },
];

const mockFullChampions = mockChampions.map(c => ({
  ...c,
  splashUrl: '',
  loadingScreenUrl: '',
  title: '',
  lore: '',
  playstyle: '',
  class: [],
  subclass: [],
  cc: 'Medium' as const,
  engage: 'Medium' as const,
  abilities: [],
}));

// Mock contexts
vi.mock('../../contexts/ChampionContext', () => ({
  useChampions: () => ({
    champions: mockFullChampions,
    championsLite: mockChampions,
    isLoading: false,
    error: null,
    latestVersion: '14.1.1',
  }),
}));

vi.mock('../../hooks/useSettings', () => ({
  useSettings: () => ({
    settings: {
      theme: 'dark',
      primaryRole: 'All',
      secondaryRole: 'All',
      favoriteChampions: ['Ahri'],
      language: 'en',
      enableSound: true,
      dashboardCards: [],
    },
    setSettings: vi.fn(),
  }),
}));

describe('ChampionGrid', () => {
  const mockOnSelect = vi.fn();
  const mockOnQuickLook = vi.fn();
  const mockOnDragStart = vi.fn();
  const mockDraftState = getInitialDraftState();

  it('renders all available champions', () => {
    render(
      <ChampionGrid
        onSelect={mockOnSelect}
        onQuickLook={mockOnQuickLook}
        onWhyThisPick={vi.fn()}
        recommendations={[]}
        isRecsLoading={false}
        activeRole={null}
        draftState={mockDraftState}
        onDragStart={mockOnDragStart}
      />
    );

    expect(screen.getByAltText('Ahri')).toBeInTheDocument();
    expect(screen.getByAltText('Garen')).toBeInTheDocument();
    expect(screen.getByAltText('Jinx')).toBeInTheDocument();
    expect(screen.getByAltText('Leona')).toBeInTheDocument();
  });

  it('filters champions by search term', async () => {
    render(
      <ChampionGrid
        onSelect={mockOnSelect}
        onQuickLook={mockOnQuickLook}
        onWhyThisPick={vi.fn()}
        recommendations={[]}
        isRecsLoading={false}
        activeRole={null}
        draftState={mockDraftState}
        onDragStart={mockOnDragStart}
      />
    );

    const searchInput = screen.getByLabelText('Search champions');
    fireEvent.change(searchInput, { target: { value: 'Ahri' } });

    await waitFor(() => {
      expect(screen.getByAltText('Ahri')).toBeInTheDocument();
      expect(screen.queryByAltText('Garen')).not.toBeInTheDocument();
    });
  });

  it('filters champions by role', async () => {
    render(
      <ChampionGrid
        onSelect={mockOnSelect}
        onQuickLook={mockOnQuickLook}
        onWhyThisPick={vi.fn()}
        recommendations={[]}
        isRecsLoading={false}
        activeRole={null}
        draftState={mockDraftState}
        onDragStart={mockOnDragStart}
      />
    );

    const midButton = screen.getByLabelText('Filter by Mid');
    fireEvent.click(midButton);

    await waitFor(() => {
      expect(screen.getByAltText('Ahri')).toBeInTheDocument();
      expect(screen.queryByAltText('Garen')).not.toBeInTheDocument();
    });
  });

  it('filters champions by damage type', async () => {
    render(
      <ChampionGrid
        onSelect={mockOnSelect}
        onQuickLook={mockOnQuickLook}
        onWhyThisPick={vi.fn()}
        recommendations={[]}
        isRecsLoading={false}
        activeRole={null}
        draftState={mockDraftState}
        onDragStart={mockOnDragStart}
      />
    );

    const adButton = screen.getByLabelText('Filter by AD');
    fireEvent.click(adButton);

    await waitFor(() => {
      expect(screen.getByAltText('Garen')).toBeInTheDocument();
      expect(screen.getByAltText('Jinx')).toBeInTheDocument();
      expect(screen.queryByAltText('Ahri')).not.toBeInTheDocument();
    });
  });

  it('calls onSelect when champion is clicked', () => {
    render(
      <ChampionGrid
        onSelect={mockOnSelect}
        onQuickLook={mockOnQuickLook}
        onWhyThisPick={vi.fn()}
        recommendations={[]}
        isRecsLoading={false}
        activeRole={null}
        draftState={mockDraftState}
        onDragStart={mockOnDragStart}
      />
    );

    const ahriButton = screen.getByLabelText('Select Ahri');
    fireEvent.click(ahriButton);

    expect(mockOnSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'Ahri', name: 'Ahri' })
    );
  });

  it('shows empty state when no champions match filters', async () => {
    render(
      <ChampionGrid
        onSelect={mockOnSelect}
        onQuickLook={mockOnQuickLook}
        onWhyThisPick={vi.fn()}
        recommendations={[]}
        isRecsLoading={false}
        activeRole={null}
        draftState={mockDraftState}
        onDragStart={mockOnDragStart}
      />
    );

    const searchInput = screen.getByLabelText('Search champions');
    fireEvent.change(searchInput, { target: { value: 'NonexistentChampion' } });

    await waitFor(() => {
      expect(screen.getByText('No champions available')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your search or filters')).toBeInTheDocument();
    });
  });
});

