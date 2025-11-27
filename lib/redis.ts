import Redis from 'ioredis'

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'

let redisClient: Redis | null = null

function getRedisClient(): Redis {
    if (!redisClient) {
        redisClient = new Redis(redisUrl, {
            maxRetriesPerRequest: null,
            retryStrategy(times) {
                const delay = Math.min(times * 50, 2000);
                return delay;
            },
            lazyConnect: true, // Don't connect immediately
        })

        redisClient.on('error', (err) => {
            // Suppress connection errors to avoid flooding the console if Redis is not available yet
            if (process.env.NODE_ENV === 'development') {
                console.warn('Redis connection error:', err.message);
            } else {
                console.error('Redis connection error:', err);
            }
        })
    }
    return redisClient
}

export const redis = {
    async set(key: string, value: string, mode?: 'EX', duration?: number): Promise<'OK' | null> {
        try {
            const client = getRedisClient()
            if (!client.status || client.status === 'end') {
                await client.connect()
            }
            if (mode === 'EX' && duration) {
                return await client.set(key, value, 'EX', duration)
            }
            return await client.set(key, value)
        } catch (error) {
            console.warn('Redis set failed:', error instanceof Error ? error.message : error)
            return null
        }
    },

    async get(key: string): Promise<string | null> {
        try {
            const client = getRedisClient()
            if (!client.status || client.status === 'end') {
                await client.connect()
            }
            return await client.get(key)
        } catch (error) {
            console.warn('Redis get failed:', error instanceof Error ? error.message : error)
            return null
        }
    },

    async del(key: string): Promise<number> {
        try {
            const client = getRedisClient()
            if (!client.status || client.status === 'end') {
                await client.connect()
            }
            return await client.del(key)
        } catch (error) {
            console.warn('Redis del failed:', error instanceof Error ? error.message : error)
            return 0
        }
    }
}
