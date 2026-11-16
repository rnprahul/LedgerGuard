import { Router } from 'express';
import { getTenantContextHandler, updateTenantProfileHandler } from './tenant.controller';
import { requireAuthAndTenant } from '../../middleware/authGateway';
import { attachTenantDb } from '../../middleware/tenantContext';

const router = Router();

// All tenant routes require valid authentication and isolated database connection
router.use(requireAuthAndTenant);
router.use(attachTenantDb);

/**
 * @route   GET /api/v1/tenant/context
 * @desc    Get tenant profile and audit log from isolated database
 * @access  Protected
 */
router.get('/context', getTenantContextHandler);

/**
 * @route   PATCH /api/v1/tenant/profile
 * @desc    Update tenant profile in isolated database
 * @access  Protected
 */
router.patch('/profile', updateTenantProfileHandler);

export default router;
