import { Schema, Document, Connection, Model } from 'mongoose';

export type TenantPlan = 'ENTERPRISE' | 'GROWTH' | 'STARTER';
export type TenantStatus = 'ACTIVE' | 'SUSPENDED';

export type LedgerTransactionType = 'CHARGE' | 'CREDIT' | 'ESCROW_HOLD' | 'SETTLEMENT';
export type LedgerTransactionStatus = 'SETTLED' | 'PENDING_ESCROW' | 'ROLLED_BACK' | 'FAILED';
export type LockEngineType = 'redis' | 'memory';
export type AcidModeType = 'mongodb-replica-session' | 'compensating-standalone';
export type IdempotencyRecordStatus = 'COMPLETED' | 'ROLLED_BACK';

export interface ITenantProfile extends Document {
  tenantId: string;
  organizationName: string;
  plan: TenantPlan;
  isolationZone: string;
  status: TenantStatus;
  monthlyQuotaUsd: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITenantAuditLog extends Document {
  action: string;
  actorEmail: string;
  tenantId: string;
  metadata: Record<string, any>;
  timestamp: Date;
}

export interface ITenantAccountBalance extends Document {
  tenantId: string;
  currency: string;
  settledBalanceUsd: number;
  pendingEscrowUsd: number;
  totalSettledVolumeUsd: number;
  transactionCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILedgerTransaction extends Document {
  transactionId: string;
  idempotencyKey: string;
  tenantId: string;
  type: LedgerTransactionType;
  amountUsd: number;
  feeUsd: number;
  netAmountUsd: number;
  counterparty: string;
  description: string;
  status: LedgerTransactionStatus;
  balanceBeforeUsd: number;
  balanceAfterUsd: number;
  actorEmail: string;
  lockEngine: LockEngineType;
  acidMode: AcidModeType;
  createdAt: Date;
}

export interface IIdempotencyRecord extends Document {
  idempotencyKey: string;
  tenantId: string;
  requestHash: string;
  status: IdempotencyRecordStatus;
  transactionId: string;
  responsePayload: Record<string, any>;
  createdAt: Date;
}

const TenantProfileSchema = new Schema<ITenantProfile>(
  {
    tenantId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    organizationName: {
      type: String,
      required: true,
      trim: true,
    },
    plan: {
      type: String,
      enum: ['ENTERPRISE', 'GROWTH', 'STARTER'],
      default: 'ENTERPRISE',
      required: true,
    },
    isolationZone: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'SUSPENDED'],
      default: 'ACTIVE',
      required: true,
    },
    monthlyQuotaUsd: {
      type: Number,
      required: true,
      default: 250000,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

const TenantAuditLogSchema = new Schema<ITenantAuditLog>(
  {
    action: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    actorEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    tenantId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
  }
);

const TenantAccountBalanceSchema = new Schema<ITenantAccountBalance>(
  {
    tenantId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    currency: {
      type: String,
      default: 'USD',
      required: true,
      trim: true,
    },
    settledBalanceUsd: {
      type: Number,
      default: 100000,
      required: true,
      min: 0,
    },
    pendingEscrowUsd: {
      type: Number,
      default: 0,
      required: true,
      min: 0,
    },
    totalSettledVolumeUsd: {
      type: Number,
      default: 0,
      required: true,
      min: 0,
    },
    transactionCount: {
      type: Number,
      default: 0,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

const LedgerTransactionSchema = new Schema<ILedgerTransaction>(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    idempotencyKey: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    tenantId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['CHARGE', 'CREDIT', 'ESCROW_HOLD', 'SETTLEMENT'],
      required: true,
    },
    amountUsd: {
      type: Number,
      required: true,
      min: 0.01,
    },
    feeUsd: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    netAmountUsd: {
      type: Number,
      required: true,
    },
    counterparty: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['SETTLED', 'PENDING_ESCROW', 'ROLLED_BACK', 'FAILED'],
      required: true,
    },
    balanceBeforeUsd: {
      type: Number,
      required: true,
    },
    balanceAfterUsd: {
      type: Number,
      required: true,
    },
    actorEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    lockEngine: {
      type: String,
      enum: ['redis', 'memory'],
      required: true,
    },
    acidMode: {
      type: String,
      enum: ['mongodb-replica-session', 'compensating-standalone'],
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
  }
);

const IdempotencyRecordSchema = new Schema<IIdempotencyRecord>(
  {
    idempotencyKey: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    tenantId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    requestHash: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['COMPLETED', 'ROLLED_BACK'],
      required: true,
    },
    transactionId: {
      type: String,
      required: true,
      trim: true,
    },
    responsePayload: {
      type: Schema.Types.Mixed,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 86400, // 24-hour TTL index
      index: true,
    },
  },
  {
    timestamps: false,
  }
);

export interface TenantModels {
  TenantProfile: Model<ITenantProfile>;
  TenantAuditLog: Model<ITenantAuditLog>;
  TenantAccountBalance: Model<ITenantAccountBalance>;
  LedgerTransaction: Model<ILedgerTransaction>;
  IdempotencyRecord: Model<IIdempotencyRecord>;
}

/**
 * Registers and returns schemas dynamically scoped to an individual tenant's connection.
 * Prevents OverwriteModelError by reusing existing models if already compiled on that connection.
 */
export const registerTenantModels = (conn: Connection): TenantModels => {
  const TenantProfile =
    (conn.models.TenantProfile as Model<ITenantProfile>) ||
    conn.model<ITenantProfile>('TenantProfile', TenantProfileSchema);

  const TenantAuditLog =
    (conn.models.TenantAuditLog as Model<ITenantAuditLog>) ||
    conn.model<ITenantAuditLog>('TenantAuditLog', TenantAuditLogSchema);

  const TenantAccountBalance =
    (conn.models.TenantAccountBalance as Model<ITenantAccountBalance>) ||
    conn.model<ITenantAccountBalance>('TenantAccountBalance', TenantAccountBalanceSchema);

  const LedgerTransaction =
    (conn.models.LedgerTransaction as Model<ILedgerTransaction>) ||
    conn.model<ILedgerTransaction>('LedgerTransaction', LedgerTransactionSchema);

  const IdempotencyRecord =
    (conn.models.IdempotencyRecord as Model<IIdempotencyRecord>) ||
    conn.model<IIdempotencyRecord>('IdempotencyRecord', IdempotencyRecordSchema);

  return {
    TenantProfile,
    TenantAuditLog,
    TenantAccountBalance,
    LedgerTransaction,
    IdempotencyRecord,
  };
};
