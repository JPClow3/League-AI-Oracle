import { describe, it, expect, beforeEach, vi } from 'vitest';
import { logger } from '../../lib/logger';
import * as Sentry from '@sentry/react';

vi.mock('@sentry/react', () => ({
  init: vi.fn(),
  captureMessage: vi.fn(),
  captureException: vi.fn(),
  addBreadcrumb: vi.fn(),
  setUser: vi.fn(),
  startSpan: vi.fn((config, callback) => callback({})),
}));

describe('LoggingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (logger as any).isInitialized = false;
  });

  describe('initialize', () => {
    it('should initialize Sentry in production', () => {
      process.env.VITE_SENTRY_DSN = 'test-dsn';
      process.env.MODE = 'production';

      logger.initialize();

      expect(Sentry.init).toHaveBeenCalled();
      expect((logger as any).isInitialized).toBe(true);
    });

    it('should not initialize when DSN is missing', () => {
      delete process.env.VITE_SENTRY_DSN;

      logger.initialize();

      expect(Sentry.init).not.toHaveBeenCalled();
    });
  });

  describe('error', () => {
    it('should log error string', () => {
      (logger as any).isInitialized = true;

      logger.error('Test error', { context: 'test' });

      expect(Sentry.captureMessage).toHaveBeenCalledWith('Test error', {
        level: 'error',
        contexts: { custom: { context: 'test' } },
      });
    });

    it('should log Error object', () => {
      (logger as any).isInitialized = true;
      const error = new Error('Test error');

      logger.error(error, { context: 'test' });

      expect(Sentry.captureException).toHaveBeenCalledWith(error, {
        contexts: { custom: { context: 'test' } },
      });
    });
  });

  describe('warn', () => {
    it('should log warning', () => {
      (logger as any).isInitialized = true;

      logger.warn('Test warning', { context: 'test' });

      expect(Sentry.captureMessage).toHaveBeenCalledWith('Test warning', {
        level: 'warning',
        contexts: { custom: { context: 'test' } },
      });
    });
  });

  describe('info', () => {
    it('should log info message', () => {
      (logger as any).isInitialized = true;

      logger.info('Test info', { context: 'test' });

      expect(Sentry.captureMessage).toHaveBeenCalledWith('Test info', {
        level: 'info',
        contexts: { custom: { context: 'test' } },
      });
    });
  });

  describe('breadcrumb', () => {
    it('should add breadcrumb', () => {
      (logger as any).isInitialized = true;

      logger.breadcrumb('User action', 'click', { button: 'submit' });

      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
        message: 'User action',
        category: 'click',
        data: { button: 'submit' },
        level: 'info',
      });
    });
  });

  describe('setUser/clearUser', () => {
    it('should set and clear user', () => {
      (logger as any).isInitialized = true;

      logger.setUser({ id: '123', username: 'test' });
      expect(Sentry.setUser).toHaveBeenCalledWith({ id: '123', username: 'test' });

      logger.clearUser();
      expect(Sentry.setUser).toHaveBeenCalledWith(null);
    });
  });

  describe('measurePerformance', () => {
    it('should measure async function performance', async () => {
      (logger as any).isInitialized = true;

      const fn = vi.fn().mockResolvedValue('result');
      const result = await logger.measurePerformance('test', 'operation', fn);

      expect(fn).toHaveBeenCalled();
      expect(result).toBe('result');
      expect(Sentry.startSpan).toHaveBeenCalled();
    });
  });
});
