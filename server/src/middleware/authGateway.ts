import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../modules/auth/auth.service';
import { AppError } from './errorHandler';
import '../types/auth.types';

const SAFE_TENANT_SLUG_REGEX = /^[a-zA-Z0-9_-]+$/;

/**
 * Gateway middleware that authenticates the caller and enforces a valid,
 * sanitized tenant isolation identifier on the request.
 */
export const requireAuthAndTenant = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(
      new AppError(
        'Authorization header missing or invalid format. Expected "Bearer <token>"',
        401,
        'MISSING_AUTH_HEADER'
      )
    );
  }

  const token = authHeader.split(' ')[1]?.trim();
  if (!token) {
    return next(
      new AppError('Authentication bearer token is empty', 401, 'MISSING_AUTH_HEADER')
    );
  }

  try {
    const decoded = verifyToken(token);

    // Validate tenant isolation claim for database naming security
    if (
      !decoded.tenantId ||
      typeof decoded.tenantId !== 'string' ||
      !SAFE_TENANT_SLUG_REGEX.test(decoded.tenantId)
    ) {
      return next(
        new AppError(
          'Token contains an invalid, empty, or unsafe tenant identifier claim',
          403,
          'INVALID_TENANT_CLAIM'
        )
      );
    }

    req.auth = decoded;
    next();
  } catch (error) {
    next(error);
  }
};
