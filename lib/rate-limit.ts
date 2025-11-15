import { RATE_LIMIT } from "./constants"

const rateLimit = new Map<string, { count: number; resetTime: number }>()

interface RateLimitConfig {
  interval: number
  maxRequests: number
}

const DEFAULT_CONFIG: RateLimitConfig = {
  interval: RATE_LIMIT.REGISTRATION.interval,
  maxRequests: RATE_LIMIT.REGISTRATION.maxRequests,
}

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = DEFAULT_CONFIG
): { success: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const record = rateLimit.get(identifier)

  if (!record || now > record.resetTime) {
    rateLimit.set(identifier, {
      count: 1,
      resetTime: now + config.interval,
    })
    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetTime: now + config.interval,
    }
  }

  if (record.count >= config.maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetTime: record.resetTime,
    }
  }

  record.count++
  return {
    success: true,
    remaining: config.maxRequests - record.count,
    resetTime: record.resetTime,
  }
}

export function cleanupRateLimit() {
  const now = Date.now()
  for (const [key, value] of rateLimit.entries()) {
    if (now > value.resetTime) {
      rateLimit.delete(key)
    }
  }
}

setInterval(cleanupRateLimit, 60000)
