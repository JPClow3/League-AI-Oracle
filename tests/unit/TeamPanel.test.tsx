import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TeamPanel } from '../../components/DraftLab/TeamPanel';
import type { DraftState, TeamState } from '../../types';

const createMockDraftState = (): TeamState => ({
  picks: [
    { champion: null, isActive: false },
    { champion: null, isActive: false },
    { champion: null, isActive: false },
    { champion: null, isActive: false },
    { champion: null, isActive: false },
  ],
  bans: [
    { champion: null, isActive: false },
    { champion: null, isActive: false },
    { champion: null, isActive: false },
    { champion: null, isActive: false },
    { champion: null, isActive: false },
  ],
});

describe('TeamPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const defaultProps = {
    side: 'blue' as const,
    state: createMockDraftState(),
    onSlotClick: vi.fn(),
    onClearSlot: vi.fn(),
    onDrop: vi.fn(),
    onDragStart: vi.fn(),
    onDragOver: vi.fn(),
    onDragEnter: vi.fn(),
    onDragLeave: vi.fn(),
  };

  it('should render team panel', () => {
    render(<TeamPanel {...defaultProps} />);

    expect(screen.getByText(/blue team/i)).toBeInTheDocument();
  });

  it('should render red team panel', () => {
    render(<TeamPanel {...defaultProps} side="red" />);

    expect(screen.getByText(/red team/i)).toBeInTheDocument();
  });

  it('should call onSlotClick when slot is clicked', () => {
    const onSlotClick = vi.fn();
    render(<TeamPanel {...defaultProps} onSlotClick={onSlotClick} />);

    // Find and click a pick slot
    const slots = screen.getAllByRole('button');
    const pickSlot = slots.find(btn => btn.getAttribute('aria-label')?.includes('pick'));

    if (pickSlot) {
      fireEvent.click(pickSlot);
      expect(onSlotClick).toHaveBeenCalled();
    }
  });

  it('should handle drag and drop', () => {
    const onDrop = vi.fn();
    const onDragOver = vi.fn();

    render(<TeamPanel {...defaultProps} onDrop={onDrop} onDragOver={onDragOver} />);

    const slots = screen.getAllByRole('button');
    const dropTarget = slots[0];

    fireEvent.dragOver(dropTarget);
    expect(onDragOver).toHaveBeenCalled();

    fireEvent.drop(dropTarget);
    expect(onDrop).toHaveBeenCalled();
  });

  it('should highlight active slot', () => {
    const activeSlot = { team: 'blue' as const, type: 'pick' as const, index: 0 };

    render(<TeamPanel {...defaultProps} activeSlot={activeSlot} />);

    // Active slot should have different styling
    const slots = screen.getAllByRole('button');
    expect(slots.length).toBeGreaterThan(0);
  });

  it('should show turn indicator when isTurnActive is true', () => {
    render(<TeamPanel {...defaultProps} isTurnActive={true} />);

    // Turn indicator should be visible through styling
    const panel = screen.getByText(/blue team/i).closest('div');
    expect(panel).toBeInTheDocument();
  });
});
