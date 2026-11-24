import { Router } from 'express';
import {
  createTransactionHandler,
  listTransactionsHandler,
  getBillingSummaryHandler,
} from './billing.controller';
import { requireAuthAndTenant } from '../../middleware/authGateway';
import { attachTenantDb } from '../../middleware/tenantContext';

const router = Router();

// Enforce authentication gateway and isolated database attachment on all billing endpoints
router.use(requireAuthAndTenant);
router.use(attachTenantDb);

/**
 * @route   GET /api/v1/billing/summary
 * @desc    Get tenant account balance and recent activity
 * @access  Protected
 */
router.get('/summary', getBillingSummaryHandler);

/**
 * @route   GET /api/v1/billing/transactions
 * @desc    Get paginated ledger transactions
 * @access  Protected
 */
router.get('/transactions', listTransactionsHandler);

/**
 * @route   POST /api/v1/billing/transactions
 * @desc    Execute idempotent atomic transaction
 * @access  Protected
 */
router.post('/transactions', createTransactionHandler);

export default router;
