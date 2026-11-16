import { 
  Tenant, 
  Transaction, 
  LedgerEntry, 
  AuditLogEntry, 
  SecurityStatusSummary, 
  NotificationItem, 
  UserProfile 
} from '../types';

export const INITIAL_USER_PROFILE: UserProfile = {
  name: 'Elena Rostova',
  email: 'elena.rostova@ledgerguard.internal',
  role: 'Chief Cryptographic Architect',
  department: 'Security & Settlement Operations',
  securityClearance: 'Level 4 (Zero-Knowledge Verifier)'
};

export const INITIAL_TENANTS: Tenant[] = [
  {
    id: 'tnt_9821a',
    name: 'Apex Global Financial',
    code: 'APEX-FIN',
    status: 'Active',
    plan: 'Enterprise',
    isolationZone: 'Dedicated Enclave',
    createdAt: '2026-02-14',
    monthlySpend: 42850.00,
    quotaUsedPercent: 78,
    apiRequests: 1450200,
    contactEmail: 'infra-security@apexfin.com',
    zkProofCount: 94210
  },
  {
    id: 'tnt_4432b',
    name: 'Meridian Capital Partners',
    code: 'MERIDIAN',
    status: 'Active',
    plan: 'Enterprise',
    isolationZone: 'Zero-Knowledge Vault',
    createdAt: '2026-03-01',
    monthlySpend: 68900.00,
    quotaUsedPercent: 92,
    apiRequests: 2894100,
    contactEmail: 'zk-ops@meridian.io',
    zkProofCount: 184500
  },
  {
    id: 'tnt_7719c',
    name: 'Vanguard Health Pay',
    code: 'VANGUARD-HP',
    status: 'Active',
    plan: 'Enterprise',
    isolationZone: 'Dedicated Enclave',
    createdAt: '2026-04-18',
    monthlySpend: 31200.00,
    quotaUsedPercent: 64,
    apiRequests: 980400,
    contactEmail: 'compliance@vanguardhp.org',
    zkProofCount: 72150
  },
  {
    id: 'tnt_1084d',
    name: 'Synthetix Logistics AI',
    code: 'SYNTHETIX',
    status: 'Active',
    plan: 'Growth',
    isolationZone: 'Standard Virtual VPC',
    createdAt: '2026-05-22',
    monthlySpend: 15400.00,
    quotaUsedPercent: 51,
    apiRequests: 620000,
    contactEmail: 'billing-ai@synthetix.tech',
    zkProofCount: 41200
  },
  {
    id: 'tnt_5592e',
    name: 'Hyperion Cloud Brokerage',
    code: 'HYPERION',
    status: 'Active',
    plan: 'Growth',
    isolationZone: 'Standard Virtual VPC',
    createdAt: '2026-06-11',
    monthlySpend: 18750.00,
    quotaUsedPercent: 73,
    apiRequests: 745000,
    contactEmail: 'ops@hyperioncloud.net',
    zkProofCount: 53100
  },
  {
    id: 'tnt_3310f',
    name: 'Quantum Data Networks',
    code: 'QUANTUM-DN',
    status: 'Provisioning',
    plan: 'Enterprise',
    isolationZone: 'Zero-Knowledge Vault',
    createdAt: '2026-10-28',
    monthlySpend: 0.00,
    quotaUsedPercent: 12,
    apiRequests: 45000,
    contactEmail: 'admin@quantumdn.co',
    zkProofCount: 2400
  },
  {
    id: 'tnt_6621g',
    name: 'Aura Commerce Gateway',
    code: 'AURA-GW',
    status: 'Active',
    plan: 'Growth',
    isolationZone: 'Standard Virtual VPC',
    createdAt: '2026-07-09',
    monthlySpend: 12400.00,
    quotaUsedPercent: 44,
    apiRequests: 410000,
    contactEmail: 'finance@aurapay.io',
    zkProofCount: 29800
  },
  {
    id: 'tnt_8803h',
    name: 'Starlight Media Stream',
    code: 'STARLIGHT',
    status: 'Suspended',
    plan: 'Starter',
    isolationZone: 'Standard Virtual VPC',
    createdAt: '2026-01-10',
    monthlySpend: 2450.00,
    quotaUsedPercent: 99,
    apiRequests: 125000,
    contactEmail: 'devops@starlightmedia.com',
    zkProofCount: 9800
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx_zk_84920412',
    tenantId: 'tnt_4432b',
    tenantName: 'Meridian Capital Partners',
    amount: 14250.00,
    currency: 'USD',
    status: 'Completed',
    timestamp: '2026-11-16 10:48:22 UTC',
    description: 'B2B Settlement Batch #8491 - Multi-region clearing',
    proofHash: '0x8f4bc921e03a1107d6a524b0c98f5a2b1d3e8f4c',
    publicInputsHash: '0x1928374a5b6c7d8e9f0123456789abcdef012345',
    processingNode: 'enclave-us-east-4a',
    breakdown: {
      baseFee: 12000.00,
      computeUnits: 1450.00,
      isolationFee: 500.00,
      networkTax: 300.00
    }
  },
  {
    id: 'tx_zk_84920411',
    tenantId: 'tnt_9821a',
    tenantName: 'Apex Global Financial',
    amount: 8940.50,
    currency: 'USD',
    status: 'Completed',
    timestamp: '2026-11-16 10:32:05 UTC',
    description: 'High-frequency billing aggregation cycle #114',
    proofHash: '0x7e2bc419e12a4409d7b512a1d87e4a1a2b4c7d9e',
    publicInputsHash: '0x2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0123',
    processingNode: 'enclave-eu-west-1c',
    breakdown: {
      baseFee: 7800.00,
      computeUnits: 640.50,
      isolationFee: 350.00,
      networkTax: 150.00
    }
  },
  {
    id: 'tx_zk_84920410',
    tenantId: 'tnt_7719c',
    tenantName: 'Vanguard Health Pay',
    amount: 5120.00,
    currency: 'USD',
    status: 'Processing',
    timestamp: '2026-11-16 10:15:44 UTC',
    description: 'HIPAA-compliant zero-knowledge claims reconciliation',
    proofHash: '0x3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    publicInputsHash: '0x9f8e7d6c5b4a39281706152433425160718293a4',
    processingNode: 'enclave-us-central-2b',
    breakdown: {
      baseFee: 4200.00,
      computeUnits: 520.00,
      isolationFee: 300.00,
      networkTax: 100.00
    }
  },
  {
    id: 'tx_zk_84920409',
    tenantId: 'tnt_5592e',
    tenantName: 'Hyperion Cloud Brokerage',
    amount: 3450.75,
    currency: 'USD',
    status: 'Completed',
    timestamp: '2026-11-16 09:58:19 UTC',
    description: 'Automated infrastructure usage quota charge',
    proofHash: '0x5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d',
    publicInputsHash: '0x4f5e6d7c8b9a0123456789abcdef0123456789ab',
    processingNode: 'enclave-ap-northeast-1a',
    breakdown: {
      baseFee: 2900.00,
      computeUnits: 320.75,
      isolationFee: 150.00,
      networkTax: 80.00
    }
  },
  {
    id: 'tx_zk_84920408',
    tenantId: 'tnt_1084d',
    tenantName: 'Synthetix Logistics AI',
    amount: 1980.00,
    currency: 'USD',
    status: 'Flagged',
    timestamp: '2026-11-16 09:20:11 UTC',
    description: 'Cross-tenant signature latency spike check',
    proofHash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
    publicInputsHash: '0x8b7a6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b',
    processingNode: 'enclave-us-east-1d',
    breakdown: {
      baseFee: 1600.00,
      computeUnits: 230.00,
      isolationFee: 100.00,
      networkTax: 50.00
    }
  },
  {
    id: 'tx_zk_84920407',
    tenantId: 'tnt_6621g',
    tenantName: 'Aura Commerce Gateway',
    amount: 2750.25,
    currency: 'USD',
    status: 'Completed',
    timestamp: '2026-11-16 08:44:02 UTC',
    description: 'Micro-settlement batch for multi-vendor checkout',
    proofHash: '0x9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e',
    publicInputsHash: '0x3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b',
    processingNode: 'enclave-eu-central-1a',
    breakdown: {
      baseFee: 2300.00,
      computeUnits: 280.25,
      isolationFee: 120.00,
      networkTax: 50.00
    }
  },
  {
    id: 'tx_zk_84920406',
    tenantId: 'tnt_8803h',
    tenantName: 'Starlight Media Stream',
    amount: 620.00,
    currency: 'USD',
    status: 'Failed',
    timestamp: '2026-11-16 07:12:49 UTC',
    description: 'Bandwidth overage charge - quota limit reached',
    proofHash: '0x0000000000000000000000000000000000000000',
    publicInputsHash: '0x0000000000000000000000000000000000000000',
    processingNode: 'enclave-us-west-2a',
    breakdown: {
      baseFee: 500.00,
      computeUnits: 80.00,
      isolationFee: 30.00,
      networkTax: 10.00
    }
  }
];

export const INITIAL_LEDGER_ENTRIES: LedgerEntry[] = [
  {
    id: 'led_entry_901',
    transactionId: 'tx_zk_84920412',
    tenantId: 'tnt_4432b',
    tenantName: 'Meridian Capital Partners',
    description: 'Settlement: Global Institutional Clearing #8491',
    amount: 14250.00,
    currency: 'USD',
    date: '2026-11-16 10:48',
    status: 'Settled',
    batchId: 'batch_20261116_01',
    signatureVerified: true
  },
  {
    id: 'led_entry_902',
    transactionId: 'tx_zk_84920411',
    tenantId: 'tnt_9821a',
    tenantName: 'Apex Global Financial',
    description: 'Settlement: High-frequency billing cycle #114',
    amount: 8940.50,
    currency: 'USD',
    date: '2026-11-16 10:32',
    status: 'Settled',
    batchId: 'batch_20261116_01',
    signatureVerified: true
  },
  {
    id: 'led_entry_903',
    transactionId: 'tx_zk_84920410',
    tenantId: 'tnt_7719c',
    tenantName: 'Vanguard Health Pay',
    description: 'Escrow: Claims verification intermediate pool',
    amount: 5120.00,
    currency: 'USD',
    date: '2026-11-16 10:15',
    status: 'Pending Settlement',
    batchId: 'batch_20261116_02',
    signatureVerified: true
  },
  {
    id: 'led_entry_904',
    transactionId: 'tx_zk_84920409',
    tenantId: 'tnt_5592e',
    tenantName: 'Hyperion Cloud Brokerage',
    description: 'Settlement: Infrastructure usage quota',
    amount: 3450.75,
    currency: 'USD',
    date: '2026-11-16 09:58',
    status: 'Settled',
    batchId: 'batch_20261116_01',
    signatureVerified: true
  },
  {
    id: 'led_entry_905',
    transactionId: 'tx_zk_84920408',
    tenantId: 'tnt_1084d',
    tenantName: 'Synthetix Logistics AI',
    description: 'Hold: Latency verification audit pending review',
    amount: 1980.00,
    currency: 'USD',
    date: '2026-11-16 09:20',
    status: 'Disputed',
    batchId: 'batch_20261116_02',
    signatureVerified: false
  },
  {
    id: 'led_entry_906',
    transactionId: 'tx_zk_84920407',
    tenantId: 'tnt_6621g',
    tenantName: 'Aura Commerce Gateway',
    description: 'Settlement: Multi-vendor checkout micro-clearing',
    amount: 2750.25,
    currency: 'USD',
    date: '2026-11-16 08:44',
    status: 'Settled',
    batchId: 'batch_20261116_01',
    signatureVerified: true
  },
  {
    id: 'led_entry_907',
    transactionId: 'tx_zk_84920405',
    tenantId: 'tnt_4432b',
    tenantName: 'Meridian Capital Partners',
    description: 'Audit verified: Automated nocturnal balance lock',
    amount: 22100.00,
    currency: 'USD',
    date: '2026-11-15 23:59',
    status: 'Audited',
    batchId: 'batch_20261115_09',
    signatureVerified: true
  },
  {
    id: 'led_entry_908',
    transactionId: 'tx_zk_84920404',
    tenantId: 'tnt_9821a',
    tenantName: 'Apex Global Financial',
    description: 'Audit verified: End-of-day clearing proof generation',
    amount: 16500.00,
    currency: 'USD',
    date: '2026-11-15 22:30',
    status: 'Audited',
    batchId: 'batch_20261115_09',
    signatureVerified: true
  },
  {
    id: 'led_entry_909',
    transactionId: 'tx_zk_84920403',
    tenantId: 'tnt_7719c',
    tenantName: 'Vanguard Health Pay',
    description: 'Settlement: Provider batch distribution #442',
    amount: 9840.00,
    currency: 'USD',
    date: '2026-11-15 19:10',
    status: 'Settled',
    batchId: 'batch_20261115_08',
    signatureVerified: true
  },
  {
    id: 'led_entry_910',
    transactionId: 'tx_zk_84920402',
    tenantId: 'tnt_5592e',
    tenantName: 'Hyperion Cloud Brokerage',
    description: 'Settlement: Multi-region storage egress ledger credit',
    amount: 4120.30,
    currency: 'USD',
    date: '2026-11-15 16:24',
    status: 'Settled',
    batchId: 'batch_20261115_07',
    signatureVerified: true
  },
  {
    id: 'led_entry_911',
    transactionId: 'tx_zk_84920401',
    tenantId: 'tnt_1084d',
    tenantName: 'Synthetix Logistics AI',
    description: 'Pending Settlement: Routing optimizer compute fee',
    amount: 1450.00,
    currency: 'USD',
    date: '2026-11-15 14:12',
    status: 'Pending Settlement',
    batchId: 'batch_20261115_06',
    signatureVerified: true
  },
  {
    id: 'led_entry_912',
    transactionId: 'tx_zk_84920400',
    tenantId: 'tnt_6621g',
    tenantName: 'Aura Commerce Gateway',
    description: 'Audited: Merchant disbursement batch',
    amount: 7890.10,
    currency: 'USD',
    date: '2026-11-15 11:05',
    status: 'Audited',
    batchId: 'batch_20261115_05',
    signatureVerified: true
  }
];

export const REVENUE_CHART_DATA = [
  { month: 'Jun', totalRevenue: 98000, enterpriseRevenue: 72000, growthRevenue: 26000, transactions: 54000 },
  { month: 'Jul', totalRevenue: 112000, enterpriseRevenue: 84000, growthRevenue: 28000, transactions: 61000 },
  { month: 'Aug', totalRevenue: 135000, enterpriseRevenue: 102000, growthRevenue: 33000, transactions: 69500 },
  { month: 'Sep', totalRevenue: 158000, enterpriseRevenue: 120000, growthRevenue: 38000, transactions: 74200 },
  { month: 'Oct', totalRevenue: 182000, enterpriseRevenue: 141000, growthRevenue: 41000, transactions: 81000 },
  { month: 'Nov (Proj)', totalRevenue: 204000, enterpriseRevenue: 159000, growthRevenue: 45000, transactions: 89400 }
];

export const TRANSACTION_ACTIVITY_DATA = [
  { time: '00:00', volume: 2400, verifiedRate: 99.99 },
  { time: '03:00', volume: 1800, verifiedRate: 100.00 },
  { time: '06:00', volume: 3200, verifiedRate: 99.98 },
  { time: '09:00', volume: 7600, verifiedRate: 99.95 },
  { time: '12:00', volume: 9100, verifiedRate: 99.97 },
  { time: '15:00', volume: 8800, verifiedRate: 99.99 },
  { time: '18:00', volume: 6400, verifiedRate: 99.98 },
  { time: '21:00', volume: 4300, verifiedRate: 100.00 }
];

export const TENANT_EXPENDITURE_DATA = [
  { name: 'Meridian Capital', value: 68900, color: '#2563EB' },
  { name: 'Apex Financial', value: 42850, color: '#3B82F6' },
  { name: 'Vanguard Health', value: 31200, color: '#60A5FA' },
  { name: 'Hyperion Cloud', value: 18750, color: '#93C5FD' },
  { name: 'Synthetix AI', value: 15400, color: '#0284C7' },
  { name: 'Aura Commerce', value: 12400, color: '#0EA5E9' },
  { name: 'Other Tenants', value: 7500, color: '#CBD5E1' }
];

export const MONTHLY_USAGE_DATA = [
  { month: 'Jun', computeHours: 4200, zkProofsM: 1.2, bandwidthTb: 14.5 },
  { month: 'Jul', computeHours: 4900, zkProofsM: 1.5, bandwidthTb: 17.2 },
  { month: 'Aug', computeHours: 5800, zkProofsM: 1.9, bandwidthTb: 21.0 },
  { month: 'Sep', computeHours: 6600, zkProofsM: 2.3, bandwidthTb: 24.8 },
  { month: 'Oct', computeHours: 7800, zkProofsM: 2.9, bandwidthTb: 29.4 },
  { month: 'Nov', computeHours: 8500, zkProofsM: 3.4, bandwidthTb: 33.1 }
];

export const AUDIT_LOG_ENTRIES: AuditLogEntry[] = [
  {
    id: 'aud_log_001',
    timestamp: '2026-11-16 11:18:04 UTC',
    eventType: 'Tenant Enclave Key Rotation',
    tenantName: 'Apex Global Financial',
    tenantId: 'tnt_9821a',
    actor: 'Automated Key Management Service',
    severity: 'Normal',
    verificationProofId: 'zk_prf_rot_8932',
    details: 'Zero-knowledge ephemeral key pair rotated without revealing seed entropy.'
  },
  {
    id: 'aud_log_002',
    timestamp: '2026-11-16 10:48:23 UTC',
    eventType: 'Ledger Batch State Settlement',
    tenantName: 'Meridian Capital Partners',
    tenantId: 'tnt_4432b',
    actor: 'Consensus Proof Engine v2.4',
    severity: 'Normal',
    verificationProofId: 'zk_prf_set_4491',
    details: 'Batch #8491 settled on-chain simulation with 14,250.00 USD aggregated.'
  },
  {
    id: 'aud_log_003',
    timestamp: '2026-11-16 09:20:12 UTC',
    eventType: 'Anomaly Detection Warning',
    tenantName: 'Synthetix Logistics AI',
    tenantId: 'tnt_1084d',
    actor: 'Threat Intelligence Monitor',
    severity: 'Warning',
    verificationProofId: 'zk_prf_chk_1092',
    details: 'Cross-tenant signature latency spiked above 250ms SLA; isolated sandbox held.'
  },
  {
    id: 'aud_log_004',
    timestamp: '2026-11-16 08:30:00 UTC',
    eventType: 'Cryptographic Signature Verification',
    tenantName: 'Vanguard Health Pay',
    tenantId: 'tnt_7719c',
    actor: 'Ed25519 Hardware Security Module',
    severity: 'Normal',
    verificationProofId: 'zk_prf_sig_3301',
    details: 'Verified 4,120 claims transactions. Zero public parameter disclosure.'
  },
  {
    id: 'aud_log_005',
    timestamp: '2026-11-16 07:12:50 UTC',
    eventType: 'Quota Limit Breach Event',
    tenantName: 'Starlight Media Stream',
    tenantId: 'tnt_8803h',
    actor: 'Resource Limiter Enforcer',
    severity: 'Critical',
    verificationProofId: 'zk_prf_flt_0093',
    details: 'Tenant exceeded 100% bandwidth tier threshold. Access transitioned to Suspended.'
  },
  {
    id: 'aud_log_006',
    timestamp: '2026-11-16 05:00:15 UTC',
    eventType: 'Zero-Knowledge Proof Batch Generation',
    tenantName: 'Hyperion Cloud Brokerage',
    tenantId: 'tnt_5592e',
    actor: 'SNARK Prover Worker-04',
    severity: 'Normal',
    verificationProofId: 'zk_prf_gen_9918',
    details: 'Generated Groth16 cryptographic proof within 84ms execution cycle.'
  },
  {
    id: 'aud_log_007',
    timestamp: '2026-11-15 23:59:59 UTC',
    eventType: 'Midnight Ledger Reconciliation',
    tenantName: 'Global Aggregator',
    tenantId: 'ALL_TENANTS',
    actor: 'System Ledger Auditor',
    severity: 'Normal',
    verificationProofId: 'zk_prf_rcn_1100',
    details: 'Daily multi-tenant state trees checked: Merkle root consistency 100% matched.'
  }
];

export const SECURITY_STATUS_DATA: SecurityStatusSummary = {
  tenantIsolation: {
    status: 'Isolated',
    enclaveHealthPercent: 100,
    activeEnclaves: 14,
    crossTenantViolations: 0
  },
  authentication: {
    status: 'Operational',
    tokenVerificationSuccessRate: 99.99,
    activeSessions: 48,
    mfaEnforcedPercent: 100
  },
  signatureVerification: {
    status: 'Valid',
    validatedCount: 142890,
    failedSignatures: 2,
    cryptoAlgorithm: 'Ed25519 & BLS12-381'
  },
  zkEngine: {
    status: 'Ready',
    circuitVersion: 'Groth16-v2.4-Turbo',
    proofGenerationAvgMs: 82.4,
    verificationSuccessRate: 100
  }
};

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_1',
    title: 'Zero-Knowledge Ledger Settlement',
    message: 'Meridian Capital batch #8491 ($14,250.00) completed verification.',
    timestamp: '12 min ago',
    read: false,
    type: 'success'
  },
  {
    id: 'notif_2',
    title: 'Tenant Latency Anomaly Flagged',
    message: 'Synthetix Logistics AI reported latency spike in VPC-East enclave.',
    timestamp: '1 hour ago',
    read: false,
    type: 'warning'
  },
  {
    id: 'notif_3',
    title: 'Daily Cryptographic Key Rotation',
    message: 'All tenant zero-knowledge master isolation keys rotated automatically.',
    timestamp: '4 hours ago',
    read: true,
    type: 'security'
  },
  {
    id: 'notif_4',
    title: 'Tenant Starlight Media Suspended',
    message: 'Resource usage exceeded quota limit. Suspended status applied.',
    timestamp: '6 hours ago',
    read: true,
    type: 'info'
  }
];
