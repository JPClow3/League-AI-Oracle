/**
 * Redis-based Rate Limiter
 * For production deployment with Upstash Redis or similar
 *
 * Setup:
 * 1. Create account at https://upstash.com/
 * 2. Create Redis database
 * 3. Add environment variables to Vercel:
 *    - UPSTASH_REDIS_REST_URL
 *    - UPSTASH_REDIS_REST_TOKEN
 */

// In-memory fallback for development
const inMemoryStore = new Map();

/**
 * Rate limit configuration
 * @typedef {Object} RateLimitConfig
 * @property {number} maxRequests
 * @property {number} windowMs
 */

const DEFAULT_CONFIG = {
    maxRequests: 30,
    windowMs: 60000 // 1 minute
};

/**
 * Check if Redis is configured
 * @returns {boolean}
 */
function isRedisConfigured() {
    return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

/**
 * Redis rate limiter using Upstash REST API
 * @param {string} key
 * @param {RateLimitConfig} config
 * @returns {Promise<{allowed: boolean, remaining: number, reset: number}>}
 */
async function checkRateLimitRedis(
    key,
    config = DEFAULT_CONFIG
) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
        throw new Error('Redis not configured');
    }

    const now = Date.now();
    const windowKey = `ratelimit:${key}:${Math.floor(now / config.windowMs)}`;

    try {
        // Use Redis INCR to atomically increment counter
        const response = await fetch(`${url}/incr/${windowKey}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('Redis request failed');
        }

        const data = await response.json();
        const count = data.result;

        // Set expiration on first request
        if (count === 1) {
            await fetch(`${url}/expire/${windowKey}/${Math.ceil(config.windowMs / 1000)}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
        }

        const allowed = count <= config.maxRequests;
        const remaining = Math.max(0, config.maxRequests - count);
        const reset = Math.ceil(now / config.windowMs) * config.windowMs + config.windowMs;

        return { allowed, remaining, reset };
    } catch (error) {
        console.error('Redis rate limit error:', error);
        // Fallback to in-memory on error
        return checkRateLimitInMemory(key, config);
    }
}

/**
 * In-memory rate limiter (development/fallback)
 * @param {string} key
 * @param {RateLimitConfig} config
 * @returns {{allowed: boolean, remaining: number, reset: number}}
 */
function checkRateLimitInMemory(
    key,
    config = DEFAULT_CONFIG
) {
    const now = Date.now();
    const windowStart = Math.floor(now / config.windowMs) * config.windowMs;
    const cacheKey = `${key}:${windowStart}`;

    // ✅ BUG FIX: Complete the implementation
    // Get or create entry
    let entry = inMemoryStore.get(cacheKey);
    if (!entry) {
        entry = { count: 0, resetAt: windowStart + config.windowMs };
        inMemoryStore.set(cacheKey, entry);

        // Auto-cleanup after window expires
        setTimeout(() => {
            inMemoryStore.delete(cacheKey);
        }, config.windowMs + 1000);
    }

    entry.count++;

    const allowed = entry.count <= config.maxRequests;
    const remaining = Math.max(0, config.maxRequests - entry.count);

    return { allowed, remaining, reset: entry.resetAt };
}
    let count = inMemoryStore.get(cacheKey) || 0;
    count++;
    inMemoryStore.set(cacheKey, count);

    // Clean up old entries
    for (const [k] of inMemoryStore.entries()) {
        if (k.startsWith(key) && k !== cacheKey) {
            inMemoryStore.delete(k);
        }
    }

    const allowed = count <= config.maxRequests;
    const remaining = Math.max(0, config.maxRequests - count);
    const reset = windowStart + config.windowMs;

    return { allowed, remaining, reset };
}

/**
 * Main rate limiter function
 * Automatically uses Redis if configured, otherwise falls back to in-memory
 * @param {string} identifier
 * @param {RateLimitConfig} config
 * @returns {Promise<{allowed: boolean, remaining: number, reset: number, retryAfter?: number}>}
 */
export async function checkRateLimit(
    identifier,
    config = DEFAULT_CONFIG
) {
    const key = `ip:${identifier}`;

    let result;
    if (isRedisConfigured()) {
        result = await checkRateLimitRedis(key, config);
    } else {
        result = checkRateLimitInMemory(key, config);
    }

    if (!result.allowed) {
        const retryAfter = Math.ceil((result.reset - Date.now()) / 1000);
        return { ...result, retryAfter };
    }

    return result;
}

/**
 * Express/Vercel middleware for rate limiting
 * @param {any} req
 * @param {any} res
 * @returns {Promise<boolean>}
 */
export async function rateLimitMiddleware(req, res) {
    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() ||
               req.headers['x-real-ip'] ||
               req.socket.remoteAddress ||
               'unknown';

    const result = await checkRateLimit(ip);

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', DEFAULT_CONFIG.maxRequests);
    res.setHeader('X-RateLimit-Remaining', result.remaining);
    res.setHeader('X-RateLimit-Reset', result.reset);

    if (!result.allowed) {
        res.setHeader('Retry-After', result.retryAfter || 60);
        res.status(429).json({
            error: 'Too many requests. Please try again later.',
            retryAfter: result.retryAfter,
            type: 'rate_limit'
        });
        return false;
    }

    return true;
}

/**
 * Get rate limiter stats (admin/debugging)
 * @returns {{type: string, entriesCount: number, configured: boolean}}
 */
export function getRateLimiterStats() {
    return {
        type: isRedisConfigured() ? 'redis' : 'memory',
        entriesCount: inMemoryStore.size,
        configured: isRedisConfigured()
    };
}

