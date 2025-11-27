import Redis from 'ioredis'

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'

export const redis = new Redis(redisUrl, {
    maxRetriesPerRequest: null,
    retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
})

redis.on('error', (err) => {
    // Suppress connection errors to avoid flooding the console if Redis is not available yet
    if (process.env.NODE_ENV === 'development') {
        console.warn('Redis connection error:', err.message);
    } else {
        console.error('Redis connection error:', err);
    }
})
