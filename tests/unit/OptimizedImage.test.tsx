import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { OptimizedImage } from '../../components/common/OptimizedImage';

describe('OptimizedImage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render image with src', () => {
    render(<OptimizedImage src="/test.jpg" alt="Test image" />);

    const img = screen.getByAltText('Test image');
    expect(img).toBeInTheDocument();
  });

  it('should use priority loading when priority is true', () => {
    render(<OptimizedImage src="/test.jpg" alt="Test" priority />);

    const img = screen.getByAltText('Test');
    expect(img).toHaveAttribute('loading', 'eager');
  });

  it('should use lazy loading by default', () => {
    render(<OptimizedImage src="/test.jpg" alt="Test" />);

    const img = screen.getByAltText('Test');
    expect(img).toHaveAttribute('loading', 'lazy');
  });

  it('should show blur placeholder when provided', () => {
    render(<OptimizedImage src="/test.jpg" alt="Test" blurPlaceholder="data:image/jpeg;base64,/9j/4AAQSkZJRg==" />);

    const placeholder = document.querySelector('img[aria-hidden="true"]');
    expect(placeholder).toBeInTheDocument();
  });

  it('should handle image load', async () => {
    const onLoad = vi.fn();
    render(<OptimizedImage src="/test.jpg" alt="Test" onLoad={onLoad} />);

    const img = screen.getByAltText('Test') as HTMLImageElement;

    // Simulate image load
    Object.defineProperty(img, 'complete', { value: true });
    img.dispatchEvent(new Event('load'));

    await waitFor(() => {
      expect(onLoad).toHaveBeenCalled();
    });
  });

  it('should handle image error and use fallback', () => {
    const onError = vi.fn();
    render(<OptimizedImage src="/invalid.jpg" alt="Test" fallback="/fallback.jpg" onError={onError} />);

    const img = screen.getByAltText('Test') as HTMLImageElement;
    img.dispatchEvent(new Event('error'));

    expect(onError).toHaveBeenCalled();
  });
});
