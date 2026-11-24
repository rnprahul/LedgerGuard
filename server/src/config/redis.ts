import Redis from 'ioredis';
import { env } from './env';

let isRedisConnected = false;

/**
 * Configure Redis client with non-blocking resilience:
 * - lazyConnect: does not block application startup
 * - maxRetriesPerRequest: fails fast so distributed lock can seamlessly fall back
 * - enableOfflineQueue: disabled to prevent queuing stale lock attempts
 */
export const redisClient = new Redis(env.REDIS_URL, {
  lazyConnect: true,
  maxRetriesPerRequest: 2,
  enableOfflineQueue: false,
  retryStrategy: (times) => {
    // Reconnect with backoff capped at 2 seconds
    return Math.min(times * 150, 2000);
  },
});

// Event listeners for state tracking without crashing
redisClient.on('ready', () => {
  isRedisConnected = true;
  console.log('[Redis] Distributed Lock Engine connected and ready.');
});

redisClient.on('connect', () => {
  isRedisConnected = true;
});

redisClient.on('close', () => {
  isRedisConnected = false;
});

redisClient.on('error', (err) => {
  isRedisConnected = false;
  // Keep error logs concise to avoid spamming the console when Redis is offline in dev
  if (err.message.includes('ECONNREFUSED')) {
    // Expected when running without a local Redis server
  } else {
    console.warn(`[Redis Notice] ${err.message}`);
  }
});

/**
 * Initiates connection to Redis server.
 * Never throws or blocks gateway startup if Redis is temporarily offline.
 */
export const connectRedis = async (): Promise<void> => {
  try {
    await redisClient.connect();
    isRedisConnected = true;
  } catch (err: any) {
    isRedisConnected = false;
    console.warn(`[Redis] Redis offline at ${env.REDIS_URL}. Fallback in-memory distributed lock manager active.`);
  }
};

/**
 * Disconnects Redis client cleanly during graceful shutdown.
 */
export const disconnectRedis = async (): Promise<void> => {
  try {
    if (redisClient.status === 'ready' || redisClient.status === 'connecting' || redisClient.status === 'connect') {
      await redisClient.quit();
    } else {
      redisClient.disconnect();
    }
  } catch (err) {
    redisClient.disconnect();
  } finally {
    isRedisConnected = false;
  }
};

/**
 * Returns current Redis connection and lock engine status.
 */
export const getRedisStatus = (): {
  connected: boolean;
  mode: 'redis' | 'memory-fallback';
  url: string;
} => {
  return {
    connected: isRedisConnected,
    mode: isRedisConnected ? 'redis' : 'memory-fallback',
    url: env.REDIS_URL,
  };
};
