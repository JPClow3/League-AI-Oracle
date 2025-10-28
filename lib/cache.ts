/**
 * Simple Cache Manager
 * Provides in-memory caching with TTL support
 */

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number;
}

class CacheManager {
    private cache: Map<string, CacheEntry<any>> = new Map();
    private defaultTTL: number = 5 * 60 * 1000; // 5 minutes default
    private pruneInterval: ReturnType<typeof setInterval> | null = null;

    constructor() {
        // ✅ BUG FIX: Auto-prune every 5 minutes to prevent memory leaks
        this.pruneInterval = setInterval(() => {
            const removed = this.prune();
            if (removed > 0) {
                console.debug(`[Cache] Auto-pruned ${removed} expired entries`);
            }
        }, 5 * 60 * 1000);
    }

    /**
     * Destroy the cache manager and cleanup intervals
     */
    destroy(): void {
        if (this.pruneInterval) {
            clearInterval(this.pruneInterval);
            this.pruneInterval = null;
        }
        this.clear();
    }

    /**
     * Set a value in the cache with optional TTL
     */
    set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl,
        });
    }

    /**
     * Get a value from the cache if it exists and hasn't expired
     */
    get<T>(key: string): T | null {
        const entry = this.cache.get(key);
        
        if (!entry) {
            return null;
        }

        const now = Date.now();
        const age = now - entry.timestamp;

        if (age > entry.ttl) {
            // Entry has expired, remove it
            this.cache.delete(key);
            return null;
        }

        return entry.data as T;
    }

    /**
     * Check if a key exists and is valid
     */
    has(key: string): boolean {
        const entry = this.cache.get(key);
        
        if (!entry) {
            return false;
        }

        const now = Date.now();
        const age = now - entry.timestamp;

        if (age > entry.ttl) {
            this.cache.delete(key);
            return false;
        }

        return true;
    }

    /**
     * Delete a specific cache entry
     */
    delete(key: string): boolean {
        return this.cache.delete(key);
    }

    /**
     * Clear all cache entries
     */
    clear(): void {
        this.cache.clear();
    }

    /**
     * Remove expired entries
     */
    prune(): number {
        const now = Date.now();
        let removed = 0;

        for (const [key, entry] of this.cache.entries()) {
            const age = now - entry.timestamp;
            if (age > entry.ttl) {
                this.cache.delete(key);
                removed++;
            }
        }

        return removed;
    }

    /**
     * Get cache statistics
     */
    getStats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys()),
        };
    }

    /**
     * Set default TTL for cache entries
     */
    setDefaultTTL(ttl: number): void {
        this.defaultTTL = ttl;
    }
}

// Export singleton instance
export default new CacheManager();

