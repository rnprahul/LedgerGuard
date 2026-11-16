import { Schema, Document, Connection, Model } from 'mongoose';

export type TenantPlan = 'ENTERPRISE' | 'GROWTH' | 'STARTER';
export type TenantStatus = 'ACTIVE' | 'SUSPENDED';

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

export interface TenantModels {
  TenantProfile: Model<ITenantProfile>;
  TenantAuditLog: Model<ITenantAuditLog>;
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

  return {
    TenantProfile,
    TenantAuditLog,
  };
};
