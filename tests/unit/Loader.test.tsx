import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Loader } from '../../components/common/Loader';

describe('Loader', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render with default messages', () => {
    render(<Loader />);

    expect(screen.getByText(/Consulting the meta/i)).toBeInTheDocument();
  });

  it('should cycle through messages', () => {
    const messages = ['Message 1', 'Message 2', 'Message 3'];
    render(<Loader messages={messages} interval={1000} />);

    expect(screen.getByText('Message 1')).toBeInTheDocument();

    vi.advanceTimersByTime(1000);
    expect(screen.getByText('Message 2')).toBeInTheDocument();

    vi.advanceTimersByTime(1000);
    expect(screen.getByText('Message 3')).toBeInTheDocument();
  });

  it('should show progress indicator when showProgress is true', () => {
    const messages = ['Stage 1', 'Stage 2', 'Stage 3'];
    render(<Loader messages={messages} showProgress={true} currentStage={0} totalStages={3} />);

    expect(screen.getByText(/Stage 1 of 3/i)).toBeInTheDocument();

    // Check for progress bar
    const progressBar = document.querySelector('.bg-accent');
    expect(progressBar).toBeInTheDocument();
  });

  it('should show stage indicators', () => {
    const messages = ['Stage 1', 'Stage 2'];
    render(<Loader messages={messages} showProgress={true} currentStage={0} totalStages={2} />);

    const indicators = document.querySelectorAll('.rounded-full');
    expect(indicators.length).toBeGreaterThan(0);
  });
});
