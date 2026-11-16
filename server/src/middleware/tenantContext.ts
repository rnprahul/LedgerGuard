import { Request, Response, NextFunction } from 'express';
import { getTenantDatabase } from '../config/tenantDb';
import { AppError } from './errorHandler';

/**
 * Middleware that dynamically resolves and attaches the tenant-isolated
 * database connection and compiled models onto the Express request object.
 * MUST run after `requireAuthAndTenant`.
 */
export const attachTenantDb = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.auth || !req.auth.tenantId) {
    return next(
      new AppError(
        'Authentication and tenant context must be established before database attachment',
        401,
        'UNAUTHORIZED'
      )
    );
  }

  try {
    const tenantDb = await getTenantDatabase(req.auth.tenantId);
    req.tenantDb = tenantDb;
    next();
  } catch (error) {
    next(error);
  }
};
