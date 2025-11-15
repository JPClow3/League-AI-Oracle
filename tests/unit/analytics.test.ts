import { describe, it, expect, beforeEach, vi } from 'vitest';
import { analytics } from '../../lib/analytics';
import posthog from 'posthog-js';

vi.mock('posthog-js', () => ({
  default: {
    init: vi.fn(),
    capture: vi.fn(),
    identify: vi.fn(),
    reset: vi.fn(),
    people: {
      set: vi.fn(),
    },
    opt_out_capturing: vi.fn(),
    opt_in_capturing: vi.fn(),
    has_opted_out_capturing: vi.fn(() => false),
    startSessionRecording: vi.fn(),
    stopSessionRecording: vi.fn(),
    getFeatureFlag: vi.fn(),
    isFeatureEnabled: vi.fn(() => false),
  },
}));

describe('AnalyticsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset initialization state
    (analytics as any).isInitialized = false;
    (analytics as any).userId = null;
  });

  describe('initialize', () => {
    it('should initialize PostHog when API key is provided', () => {
      process.env.VITE_POSTHOG_API_KEY = 'test-key';

      analytics.initialize();

      expect(posthog.init).toHaveBeenCalledWith('test-key', expect.any(Object));
      expect((analytics as any).isInitialized).toBe(true);
    });

    it('should not initialize when API key is missing', () => {
      delete process.env.VITE_POSTHOG_API_KEY;

      analytics.initialize();

      expect(posthog.init).not.toHaveBeenCalled();
    });
  });

  describe('pageView', () => {
    it('should track page view when initialized', () => {
      (analytics as any).isInitialized = true;

      analytics.pageView('Test Page', { section: 'home' });

      expect(posthog.capture).toHaveBeenCalledWith('$pageview', {
        page: 'Test Page',
        section: 'home',
      });
    });

    it('should not track when not initialized', () => {
      (analytics as any).isInitialized = false;

      analytics.pageView('Test Page');

      expect(posthog.capture).not.toHaveBeenCalled();
    });
  });

  describe('track', () => {
    it('should track custom events', () => {
      (analytics as any).isInitialized = true;

      analytics.track('button_click', { button: 'submit' });

      expect(posthog.capture).toHaveBeenCalledWith('button_click', {
        button: 'submit',
      });
    });
  });

  describe('identifyUser', () => {
    it('should identify user with properties', () => {
      (analytics as any).isInitialized = true;

      analytics.identifyUser('user-123', { rank: 'Gold', mainRole: 'Mid' });

      expect(posthog.identify).toHaveBeenCalledWith('user-123', {
        rank: 'Gold',
        mainRole: 'Mid',
      });
      expect((analytics as any).userId).toBe('user-123');
    });
  });

  describe('resetUser', () => {
    it('should reset user and clear userId', () => {
      (analytics as any).isInitialized = true;
      (analytics as any).userId = 'user-123';

      analytics.resetUser();

      expect(posthog.reset).toHaveBeenCalled();
      expect((analytics as any).userId).toBeNull();
    });
  });

  describe('optOut/optIn', () => {
    it('should handle opt out', () => {
      (analytics as any).isInitialized = true;

      analytics.optOut();

      expect(posthog.opt_out_capturing).toHaveBeenCalled();
    });

    it('should handle opt in', () => {
      (analytics as any).isInitialized = true;

      analytics.optIn();

      expect(posthog.opt_in_capturing).toHaveBeenCalled();
    });
  });
});
