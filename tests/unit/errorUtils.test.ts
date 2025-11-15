import { describe, it, expect } from 'vitest';
import { isNetworkError, isAbortError, getErrorMessage, formatApiError } from '../../lib/errorUtils';

describe('errorUtils', () => {
  describe('isNetworkError', () => {
    it('should identify network errors', () => {
      const networkError = new Error('Network request failed');
      expect(isNetworkError(networkError)).toBe(true);
    });

    it('should identify fetch errors', () => {
      const fetchError = new Error('Failed to fetch');
      expect(isNetworkError(fetchError)).toBe(true);
    });

    it('should return false for non-network errors', () => {
      const otherError = new Error('Something else');
      expect(isNetworkError(otherError)).toBe(false);
    });

    it('should return false for non-Error types', () => {
      expect(isNetworkError('string')).toBe(false);
      expect(isNetworkError(null)).toBe(false);
    });
  });

  describe('isAbortError', () => {
    it('should identify AbortError', () => {
      const abortError = new DOMException('Aborted', 'AbortError');
      expect(isAbortError(abortError)).toBe(true);
    });

    it('should return false for other errors', () => {
      const otherError = new Error('Not aborted');
      expect(isAbortError(otherError)).toBe(false);
    });
  });

  describe('getErrorMessage', () => {
    it('should extract message from Error object', () => {
      const error = new Error('Test error');
      expect(getErrorMessage(error)).toBe('Test error');
    });

    it('should handle string errors', () => {
      expect(getErrorMessage('String error')).toBe('String error');
    });

    it('should handle objects with message property', () => {
      const errorObj = { message: 'Object error' };
      expect(getErrorMessage(errorObj)).toBe('Object error');
    });

    it('should provide default message for unknown errors', () => {
      expect(getErrorMessage(null)).toBe('An unexpected error occurred');
      expect(getErrorMessage(undefined)).toBe('An unexpected error occurred');
    });
  });

  describe('formatApiError', () => {
    it('should format API error from JSON response', async () => {
      const mockResponse = {
        json: async () => ({ error: 'API Error Message' }),
        statusText: 'Bad Request',
      } as Response;

      const message = await formatApiError(mockResponse);
      expect(message).toBe('API Error Message');
    });

    it('should fallback to statusText when JSON parsing fails', async () => {
      const mockResponse = {
        json: async () => {
          throw new Error('Invalid JSON');
        },
        statusText: 'Internal Server Error',
      } as Response;

      const message = await formatApiError(mockResponse);
      expect(message).toBe('API Error: Internal Server Error');
    });
  });
});
