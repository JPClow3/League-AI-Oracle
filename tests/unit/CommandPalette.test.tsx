import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CommandPalette } from '../../components/common/CommandPalette';

const mockCommands = [
  { id: 'cmd-1', title: 'Command 1', section: 'Test', action: vi.fn() },
  { id: 'cmd-2', title: 'Command 2', section: 'Test', action: vi.fn() },
];

describe('CommandPalette', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render when isOpen is true', () => {
    render(<CommandPalette isOpen={true} onClose={vi.fn()} commands={mockCommands} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('should not render when isOpen is false', () => {
    render(<CommandPalette isOpen={false} onClose={vi.fn()} commands={mockCommands} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should filter commands by search term', async () => {
    render(<CommandPalette isOpen={true} onClose={vi.fn()} commands={mockCommands} />);

    const input = screen.getByPlaceholderText(/search commands/i);
    fireEvent.change(input, { target: { value: 'Command 1' } });

    await waitFor(() => {
      expect(screen.getByText('Command 1')).toBeInTheDocument();
      expect(screen.queryByText('Command 2')).not.toBeInTheDocument();
    });
  });

  it('should execute command on selection', async () => {
    const action = vi.fn();
    const commands = [{ id: 'cmd-1', title: 'Test Command', section: 'Test', action }];

    render(<CommandPalette isOpen={true} onClose={vi.fn()} commands={commands} />);

    const commandItem = screen.getByText('Test Command');
    fireEvent.click(commandItem);

    await waitFor(() => {
      expect(action).toHaveBeenCalled();
    });
  });

  it('should close on Escape key', () => {
    const onClose = vi.fn();
    render(<CommandPalette isOpen={true} onClose={onClose} commands={mockCommands} />);

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });
});
