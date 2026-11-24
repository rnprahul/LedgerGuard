import { Request, Response, NextFunction } from 'express';
import { 
  executeIdempotentTransaction, 
  getTenantLedgerTransactions, 
  getTenantBillingSummary 
} from './billing.service';
import { LedgerTransactionType } from '../../models/tenantModels';
import { AppError } from '../../middleware/errorHandler';

const VALID_TRANSACTION_TYPES: LedgerTransactionType[] = [
  'CHARGE',
  'CREDIT',
  'ESCROW_HOLD',
  'SETTLEMENT',
];

/**
 * @route   POST /api/v1/billing/transactions
 * @desc    Executes an atomic double-entry ledger mutation with distributed locking & idempotency
 * @access  Protected (requireAuthAndTenant + attachTenantDb)
 */
export const createTransactionHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.tenantDb || !req.auth) {
    return next(new AppError('Tenant database context not established', 500, 'CONTEXT_ERROR'));
  }

  const idempotencyKeyRaw = req.header('Idempotency-Key');
  if (!idempotencyKeyRaw || !idempotencyKeyRaw.trim()) {
    return next(
      new AppError(
        "Header 'Idempotency-Key' is required for state-mutating ledger transactions",
        400,
        'MISSING_IDEMPOTENCY_KEY'
      )
    );
  }

  const idempotencyKey = idempotencyKeyRaw.trim();
  if (idempotencyKey.length > 128) {
    return next(
      new AppError(
        "'Idempotency-Key' must not exceed 128 characters",
        400,
        'INVALID_IDEMPOTENCY_KEY'
      )
    );
  }

  const { type, amountUsd, counterparty, description, feeUsd, simulateFailure } = req.body;

  if (!type || !VALID_TRANSACTION_TYPES.includes(type)) {
    return next(
      new AppError(
        `Valid 'type' is required: must be one of ${VALID_TRANSACTION_TYPES.join(', ')}`,
        400,
        'VALIDATION_ERROR'
      )
    );
  }

  if (typeof amountUsd !== 'number' || !Number.isFinite(amountUsd) || amountUsd < 0.01) {
    return next(
      new AppError(
        "'amountUsd' must be a finite positive number >= 0.01",
        400,
        'VALIDATION_ERROR'
      )
    );
  }

  if (!counterparty || typeof counterparty !== 'string' || !counterparty.trim()) {
    return next(
      new AppError(
        "'counterparty' must be a non-empty string",
        400,
        'VALIDATION_ERROR'
      )
    );
  }

  if (description !== undefined && typeof description !== 'string') {
    return next(
      new AppError("'description' must be a string", 400, 'VALIDATION_ERROR')
    );
  }

  if (
    feeUsd !== undefined &&
    (typeof feeUsd !== 'number' || !Number.isFinite(feeUsd) || feeUsd < 0)
  ) {
    return next(
      new AppError("'feeUsd' must be a non-negative number", 400, 'VALIDATION_ERROR')
    );
  }

  if (simulateFailure !== undefined && typeof simulateFailure !== 'boolean') {
    return next(
      new AppError("'simulateFailure' must be a boolean", 400, 'VALIDATION_ERROR')
    );
  }

  try {
    const result = await executeIdempotentTransaction({
      tenantDb: req.tenantDb,
      authUser: req.auth,
      idempotencyKey,
      payload: {
        type,
        amountUsd,
        counterparty: counterparty.trim(),
        description: description?.trim(),
        feeUsd,
        simulateFailure,
      },
    });

    res.setHeader('X-Idempotency-Replayed', String(result.replayed));

    const statusCode = result.replayed ? 200 : 201;

    res.status(statusCode).json({
      success: true,
      replayed: result.replayed,
      data: {
        transaction: result.transaction,
        accountBalance: result.accountBalance,
        lockEngine: result.lockEngine,
        acidMode: result.acidMode,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/v1/billing/transactions
 * @desc    Retrieves paginated ledger transactions isolated to the authenticated tenant
 * @access  Protected (requireAuthAndTenant + attachTenantDb)
 */
export const listTransactionsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.tenantDb || !req.auth) {
    return next(new AppError('Tenant database context not established', 500, 'CONTEXT_ERROR'));
  }

  const page = req.query.page ? parseInt(String(req.query.page), 10) : 1;
  const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 10;
  const status = req.query.status ? String(req.query.status) : undefined;
  const type = req.query.type ? String(req.query.type) : undefined;

  if (isNaN(page) || page < 1) {
    return next(new AppError("'page' must be a positive integer", 400, 'VALIDATION_ERROR'));
  }

  if (isNaN(limit) || limit < 1 || limit > 100) {
    return next(
      new AppError("'limit' must be an integer between 1 and 100", 400, 'VALIDATION_ERROR')
    );
  }

  try {
    const data = await getTenantLedgerTransactions(req.tenantDb, {
      page,
      limit,
      status,
      type,
    });

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/v1/billing/summary
 * @desc    Retrieves current balance and recent transactions isolated to the authenticated tenant
 * @access  Protected (requireAuthAndTenant + attachTenantDb)
 */
export const getBillingSummaryHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.tenantDb || !req.auth) {
    return next(new AppError('Tenant database context not established', 500, 'CONTEXT_ERROR'));
  }

  try {
    const data = await getTenantBillingSummary(req.tenantDb, req.auth.tenantId);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};
