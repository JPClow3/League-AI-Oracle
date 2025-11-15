import { describe, it, expect, beforeEach, vi } from 'vitest';
import { cacheService } from '../../services/cacheService';

describe('CacheService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('get', () => {
    it('should return null for non-existent key', () => {
      const result = cacheService.get('non-existent');
      expect(result).toBeNull();
    });

    it('should return cached data when valid', () => {
      const testData = { name: 'test', value: 123 };
      cacheService.set('test-key', testData);

      const result = cacheService.get<typeof testData>('test-key');
      expect(result).toEqual(testData);
    });

    it('should return null for expired cache', () => {
      const testData = { name: 'test' };
      cacheService.set('expired-key', testData, { ttl: 100 });

      // Fast-forward time
      vi.useFakeTimers();
      vi.advanceTimersByTime(200);

      const result = cacheService.get('expired-key');
      expect(result).toBeNull();

      vi.useRealTimers();
    });

    it('should return null for version mismatch', () => {
      const testData = { name: 'test' };
      cacheService.set('version-key', testData, { version: '1.0' });

      const result = cacheService.get('version-key', { version: '2.0' });
      expect(result).toBeNull();
    });

    it('should handle corrupted cache data gracefully', () => {
      localStorage.setItem('cache_v2_default_corrupted', 'invalid json{');

      const result = cacheService.get('corrupted');
      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('should store data with default TTL', () => {
      const testData = { name: 'test' };
      cacheService.set('set-key', testData);

      const result = cacheService.get('set-key');
      expect(result).toEqual(testData);
    });

    it('should store data with custom TTL', () => {
      const testData = { name: 'test' };
      cacheService.set('custom-ttl', testData, { ttl: 5000 });

      const result = cacheService.get('custom-ttl');
      expect(result).toEqual(testData);
    });

    it('should store data with namespace', () => {
      const testData = { name: 'test' };
      cacheService.set('namespaced-key', testData, { namespace: 'test-ns' });

      const result = cacheService.get('namespaced-key', { namespace: 'test-ns' });
      expect(result).toEqual(testData);

      // Should not be accessible without namespace
      const wrongResult = cacheService.get('namespaced-key');
      expect(wrongResult).toBeNull();
    });

    it('should handle localStorage quota exceeded', () => {
      // Mock localStorage.setItem to throw quota exceeded error
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = vi.fn(() => {
        throw new DOMException('QuotaExceededError', 'QuotaExceededError');
      });

      const testData = { name: 'test' };
      // Should not throw
      expect(() => {
        cacheService.set('quota-key', testData);
      }).not.toThrow();

      localStorage.setItem = originalSetItem;
    });
  });

  describe('getWithRevalidate', () => {
    it('should return cached data immediately', async () => {
      const testData = { name: 'cached' };
      cacheService.set('revalidate-key', testData);

      const fetcher = vi.fn().mockResolvedValue({ name: 'fresh' });
      const result = await cacheService.getWithRevalidate('revalidate-key', fetcher);

      expect(result).toEqual(testData);
      expect(fetcher).not.toHaveBeenCalled();
    });

    it('should fetch and cache when no cache exists', async () => {
      const freshData = { name: 'fresh' };
      const fetcher = vi.fn().mockResolvedValue(freshData);

      const result = await cacheService.getWithRevalidate('no-cache', fetcher);

      expect(result).toEqual(freshData);
      expect(fetcher).toHaveBeenCalledOnce();

      // Should be cached now
      const cached = cacheService.get('no-cache');
      expect(cached).toEqual(freshData);
    });

    it('should return stale data and revalidate in background', async () => {
      const staleData = { name: 'stale' };
      cacheService.set('stale-key', staleData, { ttl: 1000 });

      // Fast-forward to make it stale (80% of TTL)
      vi.useFakeTimers();
      vi.advanceTimersByTime(850);

      const freshData = { name: 'fresh' };
      const fetcher = vi.fn().mockResolvedValue(freshData);
      const onUpdate = vi.fn();

      const result = await cacheService.getWithRevalidate('stale-key', fetcher, {
        staleTtl: 800,
        onUpdate,
      });

      // Should return stale data immediately
      expect(result).toEqual(staleData);

      // Wait for revalidation
      await vi.runAllTimersAsync();

      // onUpdate should be called with fresh data
      expect(onUpdate).toHaveBeenCalledWith(freshData);

      vi.useRealTimers();
    });

    it('should handle fetcher errors gracefully', async () => {
      const cachedData = { name: 'cached' };
      cacheService.set('error-key', cachedData);

      const fetcher = vi.fn().mockRejectedValue(new Error('Fetch failed'));

      // Should return cached data even if revalidation fails
      const result = await cacheService.getWithRevalidate('error-key', fetcher);
      expect(result).toEqual(cachedData);
    });
  });

  describe('remove', () => {
    it('should remove cached data', () => {
      const testData = { name: 'test' };
      cacheService.set('remove-key', testData);

      cacheService.remove('remove-key');

      const result = cacheService.get('remove-key');
      expect(result).toBeNull();
    });

    it('should remove data from specific namespace', () => {
      const testData = { name: 'test' };
      cacheService.set('ns-key', testData, { namespace: 'ns1' });
      cacheService.set('ns-key', testData, { namespace: 'ns2' });

      cacheService.remove('ns-key', 'ns1');

      expect(cacheService.get('ns-key', { namespace: 'ns1' })).toBeNull();
      expect(cacheService.get('ns-key', { namespace: 'ns2' })).toEqual(testData);
    });
  });

  describe('clear', () => {
    it('should clear all cache entries', () => {
      cacheService.set('key1', { data: 1 });
      cacheService.set('key2', { data: 2 }, { namespace: 'ns' });

      cacheService.clear();

      expect(cacheService.get('key1')).toBeNull();
      expect(cacheService.get('key2', { namespace: 'ns' })).toBeNull();
    });
  });
});
