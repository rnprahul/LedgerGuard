import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';

export class AppError extends Error {
  public statusCode: number;
  public code: string;

  constructor(message: string, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Universal error handler that guarantees a valid JSON response for every failure path.
 * Express default HTML error pages are completely suppressed.
 */
export const errorHandler: ErrorRequestHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  try {
    if (res.headersSent) {
      return _next(err);
    }

    // Explicitly enforce JSON Content-Type
    res.setHeader('Content-Type', 'application/json');

    // Handle body-parser malformed JSON SyntaxError (status 400)
    if (err instanceof SyntaxError && ('body' in err || 'status' in err)) {
      res.status(400).json({
        success: false,
        message: 'Malformed JSON payload in request body',
        code: 'MALFORMED_JSON',
      });
      return;
    }

    const statusCode =
      typeof err?.statusCode === 'number'
        ? err.statusCode
        : typeof err?.status === 'number'
          ? err.status
          : 500;

    const rawCode = err?.code || (statusCode >= 500 ? 'INTERNAL_SERVER_ERROR' : 'BAD_REQUEST');
    const code = typeof rawCode === 'number' ? `ERR_${rawCode}` : String(rawCode);
    const message = err?.message || 'An unexpected error occurred processing your request.';

    res.status(statusCode).json({
      success: false,
      message,
      code,
    });
  } catch (internalErr: any) {
    // Failsafe catch: ensure even an error inside the handler outputs JSON
    if (!res.headersSent) {
      res.status(500).setHeader('Content-Type', 'application/json').end(
        JSON.stringify({
          success: false,
          message: internalErr?.message || 'Critical internal server error',
          code: 'CRITICAL_ERROR',
        })
      );
    }
  }
};
