export type NavigationPage = 
  | 'overview' 
  | 'tenants' 
  | 'ledger' 
  | 'transactions' 
  | 'analytics' 
  | 'security' 
  | 'settings';

export type TenantStatus = 'Active' | 'Provisioning' | 'Suspended';
export type BillingPlan = 'Starter' | 'Growth' | 'Enterprise';
export type IsolationZone = 'Dedicated Enclave' | 'Standard Virtual VPC' | 'Zero-Knowledge Vault';

export interface Tenant {
  id: string;
  name: string;
  code: string;
  status: TenantStatus;
  plan: BillingPlan;
  isolationZone: IsolationZone;
  createdAt: string;
  monthlySpend: number;
  quotaUsedPercent: number;
  apiRequests: number;
  contactEmail: string;
  zkProofCount: number;
}

export type TransactionStatus = 'Completed' | 'Processing' | 'Flagged' | 'Failed';

export interface Transaction {
  id: string;
  tenantId: string;
  tenantName: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  timestamp: string;
  description: string;
  proofHash: string;
  publicInputsHash: string;
  processingNode: string;
  breakdown: {
    baseFee: number;
    computeUnits: number;
    isolationFee: number;
    networkTax: number;
  };
}

export type LedgerStatus = 'Settled' | 'Pending Settlement' | 'Audited' | 'Disputed';

export interface LedgerEntry {
  id: string;
  transactionId: string;
  tenantId: string;
  tenantName: string;
  description: string;
  amount: number;
  currency: string;
  date: string;
  status: LedgerStatus;
  batchId: string;
  signatureVerified: boolean;
}

export type SecuritySeverity = 'Normal' | 'Info' | 'Warning' | 'Critical';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  eventType: string;
  tenantName: string;
  tenantId: string;
  actor: string;
  severity: SecuritySeverity;
  verificationProofId: string;
  details: string;
}

export interface SecurityStatusSummary {
  tenantIsolation: {
    status: 'Isolated' | 'Degraded' | 'Compromised';
    enclaveHealthPercent: number;
    activeEnclaves: number;
    crossTenantViolations: number;
  };
  authentication: {
    status: 'Operational' | 'Warning' | 'Down';
    tokenVerificationSuccessRate: number;
    activeSessions: number;
    mfaEnforcedPercent: number;
  };
  signatureVerification: {
    status: 'Valid' | 'Anomalies Detected';
    validatedCount: number;
    failedSignatures: number;
    cryptoAlgorithm: string;
  };
  zkEngine: {
    status: 'Ready' | 'Proving' | 'Idle';
    circuitVersion: string;
    proofGenerationAvgMs: number;
    verificationSuccessRate: number;
  };
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'security';
}

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  department: string;
  securityClearance: string;
  avatarUrl?: string;
}

export interface AuthUser {
  id?: string;
  sub?: string;
  email: string;
  name: string;
  role: 'PLATFORM_ADMIN' | 'TENANT_ADMIN' | 'AUDITOR';
  tenantId: string;
  tenantName: string;
}

export interface TenantContextData {
  databaseName: string;
  profile: {
    tenantId: string;
    organizationName: string;
    plan: 'ENTERPRISE' | 'GROWTH' | 'STARTER';
    isolationZone: string;
    status: 'ACTIVE' | 'SUSPENDED';
    monthlyQuotaUsd: number;
    createdAt?: string;
    updatedAt?: string;
  };
  recentAuditLogs: Array<{
    _id?: string;
    action: string;
    actorEmail: string;
    tenantId: string;
    metadata: Record<string, any>;
    timestamp: string;
  }>;
}

export interface AuthSession {
  token: string;
  user: AuthUser;
  tenantContext?: TenantContextData;
}

export type LedgerTransactionType = 'CHARGE' | 'CREDIT' | 'ESCROW_HOLD' | 'SETTLEMENT';
export type LedgerTransactionStatus = 'COMMITTED' | 'ROLLED_BACK' | 'PENDING';

export interface LedgerTransactionItem {
  _id?: string;
  transactionId: string;
  idempotencyKey: string;
  tenantId: string;
  type: LedgerTransactionType;
  amountUsd: number;
  netAmountUsd: number;
  feeUsd: number;
  currency: string;
  counterparty: string;
  description: string;
  status: LedgerTransactionStatus;
  balanceBeforeUsd: number;
  balanceAfterUsd: number;
  acidMode: string;
  createdAt: string;
  updatedAt?: string;
}

export interface TenantAccountBalanceData {
  tenantId: string;
  currency: string;
  settledBalanceUsd: number;
  pendingEscrowUsd: number;
  totalSettledVolumeUsd: number;
  transactionCount: number;
  updatedAt?: string;
}

export interface BillingSummaryResponse {
  accountBalance: TenantAccountBalanceData;
  recentTransactions: LedgerTransactionItem[];
  totalSettledVolumeUsd: number;
  transactionCount: number;
}

export interface BillingTransactionsResponse {
  transactions: LedgerTransactionItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateBillingTransactionPayload {
  type: LedgerTransactionType;
  amountUsd: number;
  counterparty: string;
  description?: string;
  feeUsd?: number;
  simulateFailure?: boolean;
}

export interface CreateBillingTransactionResponse {
  transaction: LedgerTransactionItem;
  accountBalance: TenantAccountBalanceData;
  lockEngine: string;
  acidMode: string;
}
