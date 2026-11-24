import { Request, Response, NextFunction } from 'express';
import { authenticateUser } from './auth.service';
import { AppError } from '../../middleware/errorHandler';

/**
 * @route   POST /api/v1/auth/login
 * @desc    Authenticate enterprise tenant user and issue signed JWT
 * @access  Public
 */
export const loginHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const { email, password } = body;

    if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
      return next(
        new AppError(
          'Email and password are required and must be valid strings',
          400,
          'VALIDATION_ERROR'
        )
      );
    }

    const { token, user } = await authenticateUser(email, password);

    res.status(200).json({
      success: true,
      data: {
        token,
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/v1/auth/me
 * @desc    Retrieve authenticated caller's identity and tenant isolation context
 * @access  Protected (Bearer JWT)
 */
export const getMeHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    if (!req.auth) {
      return next(new AppError('Authentication context missing', 401, 'UNAUTHORIZED'));
    }

    res.status(200).json({
      success: true,
      data: {
        user: req.auth,
        tenantContext: {
          tenantId: req.auth.tenantId,
          tenantName: req.auth.tenantName,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
