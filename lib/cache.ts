interface CachedData<T> {
  data: T;
  timestamp: number;
  version: string;
}

/**
 * Manages caching with version control and TTL (Time To Live).
 * Automatically invalidates cache when version changes or TTL expires.
 */
const CacheManager = {
  /**
   * Gets the current data version from environment or defaults to 1.0.0
   */
  getCurrentVersion(): string {
    return import.meta.env.VITE_DATA_VERSION || '1.0.0';
  },

  /**
   * Stores data in cache with version and timestamp.
   * 
   * @param key - Cache key identifier
   * @param data - Data to cache
   * @param ttl - Time to live in milliseconds (default: 24 hours)
   */
  set<T>(key: string, data: T, ttl: number = 86400000): void {
    try {
      const cached: CachedData<T> = {
        data,
        timestamp: Date.now(),
        version: this.getCurrentVersion()
      };
      localStorage.setItem(key, JSON.stringify(cached));
    } catch (error) {
      console.warn(`Failed to cache data for key: ${key}`, error);
    }
  },

  /**
   * Retrieves data from cache if valid, otherwise returns null.
   * Validates both expiration time and version match.
   * 
   * @param key - Cache key identifier
   * @param ttl - Time to live in milliseconds (default: 24 hours)
   * @returns Cached data or null if invalid/expired
   */
  get<T>(key: string, ttl: number = 86400000): T | null {
    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;

      const parsed: CachedData<T> = JSON.parse(cached);
      const isExpired = Date.now() - parsed.timestamp > ttl;
      const isOutdated = parsed.version !== this.getCurrentVersion();

      if (isExpired || isOutdated) {
        localStorage.removeItem(key);
        return null;
      }

      return parsed.data;
    } catch (error) {
      console.warn(`Failed to retrieve cache for key: ${key}`, error);
      localStorage.removeItem(key);
      return null;
    }
  },

  /**
   * Clears a specific cache entry.
   * 
   * @param key - Cache key to clear
   */
  clear(key: string): void {
    localStorage.removeItem(key);
  },

  /**
   * Clears all cache entries (use with caution).
   */
  clearAll(): void {
    localStorage.clear();
  },

  /**
   * Checks if a cache entry exists and is valid.
   * 
   * @param key - Cache key to check
   * @param ttl - Time to live in milliseconds
   * @returns True if valid cache exists
   */
  has(key: string, ttl: number = 86400000): boolean {
    return this.get(key, ttl) !== null;
  }
};

export default CacheManager;

