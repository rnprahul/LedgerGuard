import { Router, Request, Response } from 'express';
import { getRedisStatus } from '../config/redis';

const router = Router();

/**
 * @route   GET /api/v1/health
 * @desc    API Gateway health check and gateway capabilities endpoint
 * @access  Public
 */
router.get('/', (_req: Request, res: Response) => {
  const redisStatus = getRedisStatus();

  res.status(200).json({
    success: true,
    service: 'LedgerGuard API Gateway',
    status: 'healthy',
    capabilities: {
      auth: 'jwt-bearer',
      tenantIsolation: 'claim-enforced',
      distributedLock: redisStatus.mode,
      idempotentLedger: 'enforced',
    },
    timestamp: new Date().toISOString(),
  });
});

export default router;
