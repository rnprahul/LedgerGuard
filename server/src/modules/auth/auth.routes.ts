import { Router } from 'express';
import { loginHandler, getMeHandler } from './auth.controller';
import { requireAuthAndTenant } from '../../middleware/authGateway';

const router = Router();

/**
 * @route   POST /api/v1/auth/login
 * @desc    Authenticate credentials and issue JWT
 * @access  Public
 */
router.post('/login', loginHandler);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get currently authenticated user and tenant context
 * @access  Protected
 */
router.get('/me', requireAuthAndTenant, getMeHandler);

export default router;
