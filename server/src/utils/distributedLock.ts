import crypto from 'crypto';
import { redisClient, getRedisStatus } from '../config/redis';
import { env } from '../config/env';
import { AppError } from '../middleware/errorHandler';

export interface LockResult {
  acquired: boolean;
  lockKey: string;
  lockToken: string;
  engine: 'redis' | 'memory';
}

// In-memory fallback lock store for when Redis is offline
const memoryLockStore = new Map<string, { token: string; expiresAt: number }>();

// Atomic Lua script to release lock ONLY if token matches
const RELEASE_LOCK_LUA = `
if redis.call("get", KEYS[1]) == ARGV[1] then
  return redis.call("del", KEYS[1])
else
  return 0
end
`;

/**
 * Acquires a distributed lock on a resource key.
 * Uses atomic Redis NX+PX when connected; falls back to NX memory store if Redis is offline.
 */
export const acquireLock = async (
  resourceKey: string,
  ttlMs?: number
): Promise<LockResult> => {
  const ttl = ttlMs && ttlMs > 0 ? ttlMs : env.LOCK_TTL_MS;
  const lockToken = crypto.randomUUID();
  const redisStatus = getRedisStatus();

  if (redisStatus.connected) {
    try {
      // Atomic SET with NX (only if Not eXists) and PX (millisecond TTL)
      const res = await redisClient.set(resourceKey, lockToken, 'PX', ttl, 'NX');
      if (res === 'OK') {
        return {
          acquired: true,
          lockKey: resourceKey,
          lockToken,
          engine: 'redis',
        };
      }
      return {
        acquired: false,
        lockKey: resourceKey,
        lockToken,
        engine: 'redis',
      };
    } catch {
      // If Redis call fails mid-operation, gracefully fall through to memory store
    }
  }

  // Memory fallback with identical NX + TTL semantics
  const now = Date.now();
  const existing = memoryLockStore.get(resourceKey);

  // Evict expired lock if present
  if (existing && existing.expiresAt <= now) {
    memoryLockStore.delete(resourceKey);
  }

  if (memoryLockStore.has(resourceKey)) {
    return {
      acquired: false,
      lockKey: resourceKey,
      lockToken,
      engine: 'memory',
    };
  }

  memoryLockStore.set(resourceKey, {
    token: lockToken,
    expiresAt: now + ttl,
  });

  return {
    acquired: true,
    lockKey: resourceKey,
    lockToken,
    engine: 'memory',
  };
};

/**
 * Releases a distributed lock using token matching to prevent releasing another worker's lock.
 */
export const releaseLock = async (
  lockKey: string,
  lockToken: string
): Promise<boolean> => {
  const redisStatus = getRedisStatus();

  if (redisStatus.connected) {
    try {
      const result = await redisClient.eval(RELEASE_LOCK_LUA, 1, lockKey, lockToken);
      return result === 1;
    } catch {
      // Fall through to memory check
    }
  }

  const existing = memoryLockStore.get(lockKey);
  if (existing && existing.token === lockToken) {
    memoryLockStore.delete(lockKey);
    return true;
  }

  return false;
};

/**
 * Scopes and executes a critical function inside a tenant-isolated distributed lock.
 * Lock key: `ledgerguard:lock:${tenantId}:${idempotencyKey}`.
 *
 * Throws 409 CONCURRENT_TRANSACTION_IN_PROGRESS if the lock is currently held.
 * Always releases the lock in a finally block.
 */
export const withDistributedLock = async <T>(
  tenantId: string,
  idempotencyKey: string,
  fn: () => Promise<T>,
  ttlMs?: number
): Promise<{ result: T; lockEngine: 'redis' | 'memory' }> => {
  if (!tenantId || !idempotencyKey) {
    throw new AppError('tenantId and idempotencyKey are required for distributed lock', 400, 'LOCK_PARAM_REQUIRED');
  }

  const lockKey = `ledgerguard:lock:${tenantId}:${idempotencyKey}`;
  const lock = await acquireLock(lockKey, ttlMs);

  if (!lock.acquired) {
    throw new AppError(
      `Concurrent transaction in progress for idempotency key '${idempotencyKey}'. Please retry shortly.`,
      409,
      'CONCURRENT_TRANSACTION_IN_PROGRESS'
    );
  }

  try {
    const result = await fn();
    return {
      result,
      lockEngine: lock.engine,
    };
  } finally {
    await releaseLock(lock.lockKey, lock.lockToken);
  }
};
