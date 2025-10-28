/**
 * Advanced Caching Service
 * Supports TTL, versioning, and intelligent cache management
 */

interface CacheEntry<T> {
    timestamp: number;
    version: string;
    data: T;
    ttl?: number; // Custom TTL in milliseconds
}

interface CacheConfig {
    ttl?: number;
    version?: string;
    namespace?: string;
}

class CacheService {
    private readonly CACHE_PREFIX = 'cache_v2_';
    private readonly DEFAULT_TTL = 60 * 60 * 1000; // 1 hour
    private readonly LESSON_CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days for lessons
    private readonly META_CACHE_TTL = 30 * 60 * 1000; // 30 minutes for meta data

    /**
     * Get cached data with validation
     */
    get<T>(key: string, config: CacheConfig = {}): T | null {
        const { version = '1.0', namespace = 'default' } = config;
        const fullKey = this.buildKey(key, namespace);

        try {
            const cached = localStorage.getItem(fullKey);
            if (!cached) {
                console.debug(`[Cache] MISS: ${fullKey}`);
                return null;
            }

            const entry = JSON.parse(cached) as CacheEntry<T>;
            const ttl = config.ttl || entry.ttl || this.DEFAULT_TTL;
            const age = Date.now() - entry.timestamp;

            // Check if expired
            if (age >= ttl) {
                console.debug(`[Cache] EXPIRED: ${fullKey} (age: ${age}ms, ttl: ${ttl}ms)`);
                this.remove(key, namespace);
                return null;
            }

            // Check version mismatch
            if (entry.version !== version) {
                console.debug(`[Cache] VERSION_MISMATCH: ${fullKey} (expected: ${version}, got: ${entry.version})`);
                this.remove(key, namespace);
                return null;
            }

            console.debug(`[Cache] HIT: ${fullKey} (age: ${age}ms)`);
            return entry.data;
        } catch (error) {
            console.error(`[Cache] Error reading ${fullKey}:`, error);
            this.remove(key, namespace);
            return null;
        }
    }

    /**
     * Set cached data with TTL
     */
    set<T>(key: string, data: T, config: CacheConfig = {}): void {
        const { version = '1.0', namespace = 'default', ttl } = config;
        const fullKey = this.buildKey(key, namespace);

        try {
            const entry: CacheEntry<T> = {
                timestamp: Date.now(),
                version,
                data,
                ttl: ttl || this.DEFAULT_TTL
            };

            localStorage.setItem(fullKey, JSON.stringify(entry));
            console.debug(`[Cache] SET: ${fullKey} (ttl: ${entry.ttl}ms)`);
        } catch (error) {
            // Handle quota exceeded
            if (error instanceof DOMException && error.name === 'QuotaExceededError') {
                console.warn('[Cache] Quota exceeded, evicting old entries...');
                this.evictOldest(5);

                // Try again
                try {
                    const entry: CacheEntry<T> = {
                        timestamp: Date.now(),
                        version,
                        data,
                        ttl: ttl || this.DEFAULT_TTL
                    };
                    localStorage.setItem(fullKey, JSON.stringify(entry));
                } catch (retryError) {
                    console.error('[Cache] Failed to set even after eviction:', retryError);
                }
            } else {
                console.error(`[Cache] Error setting ${fullKey}:`, error);
            }
        }
    }

    /**
     * Remove cached item
     */
    remove(key: string, namespace: string = 'default'): void {
        const fullKey = this.buildKey(key, namespace);
        localStorage.removeItem(fullKey);
        console.debug(`[Cache] REMOVE: ${fullKey}`);
    }

    /**
     * Clear all cache in namespace
     */
    clearNamespace(namespace: string): void {
        const prefix = `${this.CACHE_PREFIX}${namespace}_`;
        const keysToRemove: string[] = [];

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith(prefix)) {
                keysToRemove.push(key);
            }
        }

        keysToRemove.forEach(key => localStorage.removeItem(key));
        console.debug(`[Cache] CLEAR_NAMESPACE: ${namespace} (${keysToRemove.length} items)`);
    }

    /**
     * Evict expired entries across all namespaces
     */
    evictExpired(): number {
        let evictedCount = 0;
        const keysToRemove: string[] = [];

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith(this.CACHE_PREFIX)) {
                try {
                    const cached = localStorage.getItem(key);
                    if (cached) {
                        const entry = JSON.parse(cached) as CacheEntry<unknown>;
                        const ttl = entry.ttl || this.DEFAULT_TTL;
                        const age = Date.now() - entry.timestamp;

                        if (age >= ttl) {
                            keysToRemove.push(key);
                        }
                    }
                } catch (error) {
                    // Corrupted entry, remove it
                    console.warn(`[Cache] Corrupted cache entry: ${key}`);
                    keysToRemove.push(key);
                }
            }
        }

        keysToRemove.forEach(key => {
            try {
                localStorage.removeItem(key);
                evictedCount++;
            } catch (error) {
                console.error(`[Cache] Failed to remove ${key}:`, error);
            }
        });

        if (evictedCount > 0) {
            console.debug(`[Cache] EVICTED: ${evictedCount} expired entries`);
        }

        return evictedCount;
    }

    /**
     * Evict oldest entries
     */
    private evictOldest(count: number): void {
        const entries: Array<{ key: string; timestamp: number }> = [];

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith(this.CACHE_PREFIX)) {
                try {
                    const cached = localStorage.getItem(key);
                    if (cached) {
                        const entry = JSON.parse(cached) as CacheEntry<unknown>;
                        entries.push({ key, timestamp: entry.timestamp });
                    }
                } catch (error) {
                    // Corrupted entry, add with timestamp 0 to ensure removal
                    entries.push({ key, timestamp: 0 });
                }
            }
        }

        // Sort by timestamp (oldest first)
        entries.sort((a, b) => a.timestamp - b.timestamp);

        // Remove oldest entries
        entries.slice(0, count).forEach(({ key }) => {
            localStorage.removeItem(key);
        });

        console.debug(`[Cache] EVICT_OLDEST: ${Math.min(count, entries.length)} items`);
    }

    /**
     * Get cache statistics
     */
    getStats(): { count: number; totalSize: number; oldestEntry: number | null; newestEntry: number | null } {
        let count = 0;
        let totalSize = 0;
        let oldestEntry: number | null = null;
        let newestEntry: number | null = null;

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith(this.CACHE_PREFIX)) {
                count++;
                const item = localStorage.getItem(key);
                if (item) {
                    totalSize += item.length;
                    try {
                        const entry = JSON.parse(item) as CacheEntry<unknown>;
                        if (!oldestEntry || entry.timestamp < oldestEntry) {
                            oldestEntry = entry.timestamp;
                        }
                        if (!newestEntry || entry.timestamp > newestEntry) {
                            newestEntry = entry.timestamp;
                        }
                    } catch (error) {
                        // Skip corrupted entries
                    }
                }
            }
        }

        return { count, totalSize, oldestEntry, newestEntry };
    }

    /**
     * Build full cache key
     */
    private buildKey(key: string, namespace: string): string {
        return `${this.CACHE_PREFIX}${namespace}_${key}`;
    }

    /**
     * Preset TTL values
     */
    get TTL() {
        return {
            FIVE_MINUTES: 5 * 60 * 1000,
            THIRTY_MINUTES: 30 * 60 * 1000,
            ONE_HOUR: 60 * 60 * 1000,
            SIX_HOURS: 6 * 60 * 60 * 1000,
            ONE_DAY: 24 * 60 * 60 * 1000,
            ONE_WEEK: 7 * 24 * 60 * 60 * 1000,
            LESSON: this.LESSON_CACHE_TTL,
            META: this.META_CACHE_TTL
        };
    }
}

// Singleton instance
export const cacheService = new CacheService();

// Auto-eviction on initialization
cacheService.evictExpired();

// Periodic eviction every 5 minutes
setInterval(() => {
    cacheService.evictExpired();
}, 5 * 60 * 1000);

