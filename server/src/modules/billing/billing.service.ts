import crypto from 'crypto';
import { ClientSession } from 'mongoose';
import { 
  TenantModels, 
  ITenantAccountBalance, 
  LedgerTransactionType, 
  LedgerTransactionStatus, 
  ILedgerTransaction 
} from '../../models/tenantModels';
import { TenantDatabaseResult } from '../../config/tenantDb';
import { withDistributedLock } from '../../utils/distributedLock';
import { AppError } from '../../middleware/errorHandler';

export interface ExecuteTransactionParams {
  tenantDb: TenantDatabaseResult;
  authUser: { email: string; name?: string; tenantId: string };
  idempotencyKey: string;
  payload: {
    type: LedgerTransactionType;
    amountUsd: number;
    counterparty: string;
    description?: string;
    feeUsd?: number;
    simulateFailure?: boolean;
  };
}

export interface TransactionExecutionResult {
  replayed: boolean;
  transaction: Record<string, any>;
  accountBalance: Record<string, any>;
  lockEngine: 'redis' | 'memory' | 'none-cached';
  acidMode?: string;
}

/**
 * Checks whether the MongoDB deployment topology supports replica-set transactions.
 */
const checkSupportsReplicaTransactions = (tenantDb: TenantDatabaseResult): boolean => {
  try {
    const client = tenantDb.connection.getClient() as any;
    const topologyType = client?.topology?.description?.type;
    return topologyType === 'ReplicaSetWithPrimary' || topologyType === 'Sharded';
  } catch {
    return false;
  }
};

/**
 * Ensures an enterprise account balance document exists in that tenant's isolated database.
 * Initializes with $100,000 enterprise reserve on first access.
 */
export const ensureTenantAccount = async (
  models: TenantModels,
  tenantId: string,
  session?: ClientSession
): Promise<ITenantAccountBalance> => {
  let query = models.TenantAccountBalance.findOne({ tenantId });
  if (session) {
    query = query.session(session);
  }
  let account = await query;

  if (!account) {
    if (session) {
      const created = await models.TenantAccountBalance.create(
        [
          {
            tenantId,
            currency: 'USD',
            settledBalanceUsd: 100000,
            pendingEscrowUsd: 0,
            totalSettledVolumeUsd: 0,
            transactionCount: 0,
          },
        ],
        { session }
      );
      account = created[0];
    } else {
      account = await models.TenantAccountBalance.create({
        tenantId,
        currency: 'USD',
        settledBalanceUsd: 100000,
        pendingEscrowUsd: 0,
        totalSettledVolumeUsd: 0,
        transactionCount: 0,
      });
    }
  }

  return account;
};

/**
 * Computes canonical SHA-256 hash of transactional request payload to guarantee payload consistency.
 */
export const computeRequestHash = (payload: {
  type: string;
  amountUsd: number;
  counterparty: string;
}): string => {
  return crypto
    .createHash('sha256')
    .update(
      JSON.stringify({
        type: payload.type,
        amountUsd: Number(payload.amountUsd),
        counterparty: payload.counterparty.trim(),
      })
    )
    .digest('hex');
};

/**
 * Atomic double-entry transactional engine with idempotency protection and distributed locking.
 */
export const executeIdempotentTransaction = async (
  params: ExecuteTransactionParams
): Promise<TransactionExecutionResult> => {
  const { tenantDb, authUser, idempotencyKey, payload } = params;

  if (!idempotencyKey || typeof idempotencyKey !== 'string') {
    throw new AppError('A valid idempotencyKey is required for ledger mutations', 400, 'IDEMPOTENCY_KEY_REQUIRED');
  }

  if (!payload.amountUsd || payload.amountUsd < 0.01) {
    throw new AppError('amountUsd must be a positive number of at least 0.01', 400, 'INVALID_AMOUNT');
  }

  if (!payload.counterparty || !payload.counterparty.trim()) {
    throw new AppError('counterparty is required', 400, 'INVALID_COUNTERPARTY');
  }

  const requestHash = computeRequestHash({
    type: payload.type,
    amountUsd: payload.amountUsd,
    counterparty: payload.counterparty,
  });

  // Step A: Fast Idempotency Pre-Check (before acquiring lock)
  const existingRecord = await tenantDb.models.IdempotencyRecord.findOne({ idempotencyKey });
  if (existingRecord) {
    if (existingRecord.requestHash !== requestHash) {
      throw new AppError(
        `Idempotency key '${idempotencyKey}' was previously used with different transaction parameters`,
        422,
        'IDEMPOTENCY_PAYLOAD_MISMATCH'
      );
    }

    const account = await ensureTenantAccount(tenantDb.models, authUser.tenantId);
    return {
      replayed: true,
      transaction: existingRecord.responsePayload,
      accountBalance: account.toObject(),
      lockEngine: 'none-cached',
      acidMode: existingRecord.responsePayload.acidMode,
    };
  }

  // Step B: Acquire Distributed Mutex Lock scoped to tenant + idempotency key
  const lockResult = await withDistributedLock(
    authUser.tenantId,
    idempotencyKey,
    async () => {
      // Step C: Re-verify IdempotencyRecord inside lock to eliminate race conditions
      const doubleCheck = await tenantDb.models.IdempotencyRecord.findOne({ idempotencyKey });
      if (doubleCheck) {
        if (doubleCheck.requestHash !== requestHash) {
          throw new AppError(
            `Idempotency key '${idempotencyKey}' was previously used with different transaction parameters`,
            422,
            'IDEMPOTENCY_PAYLOAD_MISMATCH'
          );
        }

        const account = await ensureTenantAccount(tenantDb.models, authUser.tenantId);
        return {
          replayed: true,
          transaction: doubleCheck.responsePayload,
          accountBalance: account.toObject(),
          lockEngine: 'none-cached' as const,
          acidMode: doubleCheck.responsePayload.acidMode,
        };
      }

      // Step D: Atomic Execution & Rollback Handling
      const supportsReplicaTransactions = checkSupportsReplicaTransactions(tenantDb);
      let session: ClientSession | null = null;

      if (supportsReplicaTransactions) {
        try {
          session = await tenantDb.connection.startSession();
          session.startTransaction();
        } catch {
          session = null;
        }
      }

      // Fetch account and preserve baseline for rollback if standalone
      const account = await ensureTenantAccount(tenantDb.models, authUser.tenantId, session || undefined);
      const initialSettledBalance = account.settledBalanceUsd;
      const initialPendingEscrow = account.pendingEscrowUsd;
      const initialTotalVolume = account.totalSettledVolumeUsd;
      const initialTxCount = account.transactionCount;

      const amount = Number(payload.amountUsd);
      const fee = Number(payload.feeUsd || 0);
      let netAmount: number;
      const balanceBefore = initialSettledBalance;
      let balanceAfter = initialSettledBalance;
      let txStatus: LedgerTransactionStatus = 'SETTLED';

      if (payload.type === 'CHARGE') {
        netAmount = amount + fee;
        if (initialSettledBalance < netAmount) {
          if (session) {
            await session.abortTransaction();
            await session.endSession();
          }
          throw new AppError(
            `Insufficient settled balance ($${initialSettledBalance.toFixed(2)}) for charge of $${netAmount.toFixed(2)}`,
            400,
            'INSUFFICIENT_TENANT_BALANCE'
          );
        }
        balanceAfter = initialSettledBalance - netAmount;
        account.settledBalanceUsd = balanceAfter;
        account.totalSettledVolumeUsd += amount;
        account.transactionCount += 1;
      } else if (payload.type === 'ESCROW_HOLD') {
        netAmount = amount + fee;
        if (initialSettledBalance < netAmount) {
          if (session) {
            await session.abortTransaction();
            await session.endSession();
          }
          throw new AppError(
            `Insufficient settled balance ($${initialSettledBalance.toFixed(2)}) for escrow hold of $${netAmount.toFixed(2)}`,
            400,
            'INSUFFICIENT_TENANT_BALANCE'
          );
        }
        balanceAfter = initialSettledBalance - netAmount;
        account.settledBalanceUsd = balanceAfter;
        account.pendingEscrowUsd += netAmount;
        account.totalSettledVolumeUsd += amount;
        account.transactionCount += 1;
        txStatus = 'PENDING_ESCROW';
      } else if (payload.type === 'CREDIT') {
        netAmount = amount - fee;
        balanceAfter = initialSettledBalance + netAmount;
        account.settledBalanceUsd = balanceAfter;
        account.totalSettledVolumeUsd += amount;
        account.transactionCount += 1;
      } else if (payload.type === 'SETTLEMENT') {
        netAmount = amount - fee;
        if (account.pendingEscrowUsd >= netAmount) {
          account.pendingEscrowUsd -= netAmount;
        }
        balanceAfter = initialSettledBalance + netAmount;
        account.settledBalanceUsd = balanceAfter;
        account.totalSettledVolumeUsd += amount;
        account.transactionCount += 1;
      } else {
        if (session) {
          await session.abortTransaction();
          await session.endSession();
        }
        throw new AppError(`Unsupported transaction type: ${payload.type}`, 400, 'INVALID_TX_TYPE');
      }

      try {
        // Save balance modification
        if (session) {
          await account.save({ session });
        } else {
          await account.save();
        }

        // Simulating Failure before final commit for rollback verification
        if (payload.simulateFailure) {
          throw new AppError(
            'Simulated transaction failure triggered for ACID rollback validation',
            500,
            'SIMULATED_TRANSACTION_FAILURE'
          );
        }

        const transactionId = 'tx_lg_' + crypto.randomBytes(6).toString('hex');
        const acidMode = supportsReplicaTransactions
          ? 'mongodb-replica-session'
          : 'compensating-standalone';

        const txPayload = {
          transactionId,
          idempotencyKey,
          tenantId: authUser.tenantId,
          type: payload.type,
          amountUsd: amount,
          feeUsd: fee,
          netAmountUsd: netAmount,
          counterparty: payload.counterparty.trim(),
          description: payload.description?.trim() || '',
          status: txStatus,
          balanceBeforeUsd: balanceBefore,
          balanceAfterUsd: balanceAfter,
          actorEmail: authUser.email,
          lockEngine: 'memory' as const, // will be populated from lock wrapper
          acidMode,
          createdAt: new Date(),
        };

        const [txDoc] = await tenantDb.models.LedgerTransaction.create([txPayload], {
          session: session || undefined,
        });

        const txObject = txDoc.toObject();

        // Write immutable audit log
        await tenantDb.models.TenantAuditLog.create(
          [
            {
              action: 'LEDGER_TX_COMMITTED',
              actorEmail: authUser.email,
              tenantId: authUser.tenantId,
              metadata: {
                transactionId,
                type: payload.type,
                amountUsd: amount,
                netAmountUsd: netAmount,
                balanceAfterUsd: balanceAfter,
                acidMode,
              },
              timestamp: new Date(),
            },
          ],
          { session: session || undefined }
        );

        // Save IdempotencyRecord
        await tenantDb.models.IdempotencyRecord.create(
          [
            {
              idempotencyKey,
              tenantId: authUser.tenantId,
              requestHash,
              status: 'COMPLETED',
              transactionId,
              responsePayload: txObject,
              createdAt: new Date(),
            },
          ],
          { session: session || undefined }
        );

        if (session) {
          await session.commitTransaction();
          await session.endSession();
        }

        return {
          replayed: false,
          transaction: txObject,
          accountBalance: account.toObject(),
          acidMode,
        };
      } catch (err: any) {
        // Rollback on any failure
        if (session) {
          await session.abortTransaction().catch(() => {});
          await session.endSession().catch(() => {});
        } else {
          // Compensating rollback for standalone instance
          account.settledBalanceUsd = initialSettledBalance;
          account.pendingEscrowUsd = initialPendingEscrow;
          account.totalSettledVolumeUsd = initialTotalVolume;
          account.transactionCount = initialTxCount;
          await account.save().catch(() => {});
        }
        throw err;
      }
    }
  );

  return {
    ...lockResult.result,
    lockEngine: lockResult.lockEngine,
  };
};

/**
 * Retrieves paginated transaction records from the tenant's isolated database.
 */
export const getTenantLedgerTransactions = async (
  tenantDb: TenantDatabaseResult,
  options: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
  }
): Promise<{
  transactions: ILedgerTransaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> => {
  const page = Math.max(1, options.page || 1);
  const limit = Math.min(100, Math.max(1, options.limit || 20));
  const filter: Record<string, any> = {};

  if (options.status) {
    filter.status = options.status;
  }
  if (options.type) {
    filter.type = options.type;
  }

  const [transactions, total] = await Promise.all([
    tenantDb.models.LedgerTransaction.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    tenantDb.models.LedgerTransaction.countDocuments(filter),
  ]);

  return {
    transactions: transactions as unknown as ILedgerTransaction[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
};

/**
 * Returns executive billing summary from the tenant's isolated database.
 */
export const getTenantBillingSummary = async (
  tenantDb: TenantDatabaseResult,
  tenantId: string
): Promise<{
  accountBalance: Record<string, any>;
  recentTransactions: ILedgerTransaction[];
  totalSettledVolumeUsd: number;
  transactionCount: number;
}> => {
  const account = await ensureTenantAccount(tenantDb.models, tenantId);
  const recentTransactions = await tenantDb.models.LedgerTransaction.find({ tenantId })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  return {
    accountBalance: account.toObject(),
    recentTransactions: recentTransactions as unknown as ILedgerTransaction[],
    totalSettledVolumeUsd: account.totalSettledVolumeUsd,
    transactionCount: account.transactionCount,
  };
};
