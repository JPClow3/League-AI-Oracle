import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AdvicePanel } from '../../components/DraftLab/AdvicePanel';
import type { AIAdvice } from '../../types';

const mockAdvice: AIAdvice = {
  teamAnalysis: {
    blue: {
      draftScore: 'A',
      strengths: ['Strong early game', 'Good engage'],
      weaknesses: [],
      winCondition: 'Win early teamfights',
      powerSpikeTiming: 'Mid game',
      recommendedBuild: 'Standard build',
    },
    red: {
      draftScore: 'B',
      strengths: [],
      weaknesses: ['Weak early'],
      winCondition: 'Scale to late game',
      powerSpikeTiming: 'Late game',
      recommendedBuild: 'Scaling build',
    },
  },
  headToHead: {
    summary: 'Blue team favored in early game',
  },
  buildSuggestions: [
    {
      championName: 'Ahri',
      build: "Luden's Echo, Rabadon's",
      reasoning: 'Standard mage build',
    },
  ],
};

describe('AdvicePanel', () => {
  it('should show loading state', () => {
    render(
      <AdvicePanel
        advice={null}
        isLoading={true}
        error={null}
        navigateToAcademy={vi.fn()}
        analysisCompleted={false}
        onAnimationEnd={vi.fn()}
        isStale={false}
      />
    );

    expect(screen.getByText(/consulting|analyzing/i)).toBeInTheDocument();
  });

  it('should show error state', () => {
    render(
      <AdvicePanel
        advice={null}
        isLoading={false}
        error="Analysis failed"
        navigateToAcademy={vi.fn()}
        analysisCompleted={false}
        onAnimationEnd={vi.fn()}
        isStale={false}
      />
    );

    expect(screen.getByText(/analysis failed/i)).toBeInTheDocument();
  });

  it('should display advice when available', () => {
    render(
      <AdvicePanel
        advice={mockAdvice}
        isLoading={false}
        error={null}
        navigateToAcademy={vi.fn()}
        analysisCompleted={true}
        onAnimationEnd={vi.fn()}
        isStale={false}
      />
    );

    expect(screen.getByText(/blue team/i)).toBeInTheDocument();
    expect(screen.getByText(/red team/i)).toBeInTheDocument();
  });

  it('should show empty state when no advice', () => {
    render(
      <AdvicePanel
        advice={null}
        isLoading={false}
        error={null}
        navigateToAcademy={vi.fn()}
        analysisCompleted={false}
        onAnimationEnd={vi.fn()}
        isStale={false}
      />
    );

    expect(screen.getByText(/awaiting analysis/i)).toBeInTheDocument();
  });

  it('should switch between tabs', () => {
    render(
      <AdvicePanel
        advice={mockAdvice}
        isLoading={false}
        error={null}
        navigateToAcademy={vi.fn()}
        analysisCompleted={true}
        onAnimationEnd={vi.fn()}
        isStale={false}
      />
    );

    const redTab = screen.getByRole('button', { name: /red/i });
    if (redTab) {
      fireEvent.click(redTab);
    }
  });
});
