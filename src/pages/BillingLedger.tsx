import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Zap,
  Lock,
  Database,
  X,
  Copy,
  Check,
  Clock
} from 'lucide-react';
import { 
  LedgerEntry, 
  BillingSummaryResponse,
  LedgerTransactionItem,
  LedgerTransactionType,
  CreateBillingTransactionPayload
} from '../types';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { DemoDisclaimer } from '../components/DemoDisclaimer';
import { 
  fetchBillingSummary, 
  fetchBillingTransactions, 
  submitBillingTransaction 
} from '../services/api';

interface BillingLedgerProps {
  entries?: LedgerEntry[];
  onShowToast: (msg: string) => void;
}

interface BannerNotice {
  type: 'success' | 'replayed' | 'error';
  title: string;
  message: string;
  details?: string;
  txId?: string;
}

const generateIdempotencyKey = () => 
  `idem_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

export const BillingLedger: React.FC<BillingLedgerProps> = ({
  entries = [],
  onShowToast
}) => {
  // Live billing state
  const [summary, setSummary] = useState<BillingSummaryResponse | null>(null);
  const [liveTransactions, setLiveTransactions] = useState<LedgerTransactionItem[]>([]);
  const [totalLiveCount, setTotalLiveCount] = useState(0);
  const [isLiveDb, setIsLiveDb] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | string>('All');
  const [typeFilter, setTypeFilter] = useState<'All' | LedgerTransactionType>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [totalPages, setTotalPages] = useState(1);

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formType, setFormType] = useState<LedgerTransactionType>('CHARGE');
  const [formAmount, setFormAmount] = useState('2500.00');
  const [formCounterparty, setFormCounterparty] = useState('Cloudflare Inc');
  const [formDescription, setFormDescription] = useState('Enterprise Edge Routing Monthly Fee');
  const [formIdempotencyKey, setFormIdempotencyKey] = useState(generateIdempotencyKey());
  const [lastSubmittedKey, setLastSubmittedKey] = useState<string | null>(null);
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Notification Banner
  const [banner, setBanner] = useState<BannerNotice | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  // Fetch live ledger data
  const loadBillingData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [summaryRes, txRes] = await Promise.all([
        fetchBillingSummary(),
        fetchBillingTransactions({
          page: currentPage,
          limit: itemsPerPage,
          status: statusFilter !== 'All' ? statusFilter : undefined,
          type: typeFilter !== 'All' ? typeFilter : undefined,
        }),
      ]);

      setSummary(summaryRes);
      setLiveTransactions(txRes.transactions);
      setTotalLiveCount(txRes.total);
      setTotalPages(Math.max(1, txRes.totalPages));
      setIsLiveDb(true);
    } catch {
      // Graceful fallback to simulated rows if backend is offline or disconnected
      setIsLiveDb(false);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, statusFilter, typeFilter]);

  useEffect(() => {
    loadBillingData();
  }, [loadBillingData]);

  // Open modal with fresh idempotency key
  const handleOpenModal = () => {
    if (!lastSubmittedKey) {
      setFormIdempotencyKey(generateIdempotencyKey());
    }
    setSimulateFailure(false);
    setIsModalOpen(true);
  };

  // Replay helper
  const handleReplayKey = () => {
    if (lastSubmittedKey) {
      setFormIdempotencyKey(lastSubmittedKey);
      onShowToast(`Replay key selected: ${lastSubmittedKey}`);
    }
  };

  // Generate new key
  const handleGenerateNewKey = () => {
    const newKey = generateIdempotencyKey();
    setFormIdempotencyKey(newKey);
    onShowToast('Generated new cryptographic idempotency key');
  };

  // Copy key
  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
    onShowToast('Idempotency key copied to clipboard');
  };

  // Submit transaction handler
  const handleSubmitTransaction = async (e: React.FormEvent) => {
    e.preventDefault();

    const amount = parseFloat(formAmount);
    if (isNaN(amount) || amount < 0.01) {
      onShowToast('Error: Amount must be at least $0.01');
      return;
    }

    if (!formCounterparty.trim()) {
      onShowToast('Error: Counterparty is required');
      return;
    }

    if (!formIdempotencyKey.trim()) {
      onShowToast('Error: Idempotency Key is required');
      return;
    }

    setIsSubmitting(true);
    const keyToSubmit = formIdempotencyKey.trim();

    try {
      const payload: CreateBillingTransactionPayload = {
        type: formType,
        amountUsd: amount,
        counterparty: formCounterparty.trim(),
        description: formDescription.trim() || undefined,
        simulateFailure,
      };

      const result = await submitBillingTransaction(payload, keyToSubmit);
      setLastSubmittedKey(keyToSubmit);

      if (result.replayed) {
        setBanner({
          type: 'replayed',
          title: '⚡ Idempotency Replay Detected (HTTP 200)',
          message: `The idempotency key "${keyToSubmit}" was recognized by the distributed lock manager.`,
          details: `Cached transaction ${result.data.transaction.transactionId} was returned with zero duplicate deduction. Balance: $${result.data.accountBalance.settledBalanceUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}.`,
          txId: result.data.transaction.transactionId,
        });
        onShowToast(`Idempotency Replay: Returned cached transaction ${result.data.transaction.transactionId}`);
      } else {
        setBanner({
          type: 'success',
          title: '✓ Transaction Committed (HTTP 201 Created)',
          message: `Double-entry mutation atomic commit successful. Transaction ID: ${result.data.transaction.transactionId}`,
          details: `New Settled Balance: $${result.data.accountBalance.settledBalanceUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })} (Lock Engine: ${result.data.lockEngine} | ACID Mode: ${result.data.acidMode}).`,
          txId: result.data.transaction.transactionId,
        });
        onShowToast(`Transaction ${result.data.transaction.transactionId} successfully committed`);
      }

      setIsModalOpen(false);
      // Auto-generate fresh key for subsequent transaction
      setFormIdempotencyKey(generateIdempotencyKey());
      // Refresh live records
      await loadBillingData();
    } catch (err: any) {
      setBanner({
        type: 'error',
        title: '⚠ Atomic Failure & Compensating Rollback Triggered',
        message: err.message || 'Transaction aborted during execution.',
        details: 'The distributed transaction manager aborted the operation and restored database balance state without persisting corrupted changes.',
      });
      onShowToast(`Transaction Aborted: ${err.message || 'Compensating rollback executed'}`);
      setIsModalOpen(false);
      await loadBillingData();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (isLiveDb && liveTransactions.length > 0) {
      const headers = [
        'Transaction ID',
        'Idempotency Key',
        'Type',
        'Counterparty',
        'Description',
        'Amount (USD)',
        'Net Amount (USD)',
        'Balance After (USD)',
        'Status',
        'ACID Mode',
        'Created At'
      ];
      const rows = liveTransactions.map(t => [
        t.transactionId,
        t.idempotencyKey,
        t.type,
        `"${t.counterparty}"`,
        `"${t.description || ''}"`,
        t.amountUsd.toFixed(2),
        t.netAmountUsd.toFixed(2),
        t.balanceAfterUsd.toFixed(2),
        t.status,
        t.acidMode,
        t.createdAt
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `ledgerguard_live_ledger_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      onShowToast(`Exported ${liveTransactions.length} live database transactions to CSV`);
    } else {
      // Fallback export
      const headers = ['Ledger ID', 'Transaction ID', 'Tenant', 'Description', 'Amount (USD)', 'Date', 'Status', 'Batch ID'];
      const rows = entries.map(e => [
        e.id,
        e.transactionId,
        `"${e.tenantName}"`,
        `"${e.description}"`,
        e.amount.toFixed(2),
        e.date,
        e.status,
        e.batchId
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `ledgerguard_simulated_ledger_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      onShowToast(`Exported ${entries.length} simulated ledger entries to CSV`);
    }
  };

  // Filtered live transactions for search
  const filteredLiveTransactions = liveTransactions.filter((tx) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      tx.transactionId.toLowerCase().includes(query) ||
      tx.counterparty.toLowerCase().includes(query) ||
      tx.description.toLowerCase().includes(query) ||
      tx.idempotencyKey.toLowerCase().includes(query)
    );
  });

  // Fallback filtering
  const filteredFallbackEntries = entries.filter((entry) => {
    const matchesSearch = 
      entry.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.tenantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.batchId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || entry.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h1>Billing Ledger</h1>
            {isLiveDb ? (
              <span 
                className="demo-pill-badge" 
                style={{ 
                  backgroundColor: 'rgba(5, 150, 105, 0.1)', 
                  borderColor: 'rgba(5, 150, 105, 0.3)', 
                  color: 'var(--success)' 
                }}
              >
                <span className="demo-pill-dot" style={{ backgroundColor: 'var(--success)' }} />
                LIVE DB: ledgerguard_{summary?.accountBalance?.tenantId || 'tenant'}
              </span>
            ) : (
              <span className="demo-pill-badge">
                <span className="demo-pill-dot" />
                SIMULATED DATA POOL
              </span>
            )}
          </div>
          <p>
            {isLiveDb 
              ? 'Multi-tenant isolated database ledger with Redis distributed lock idempotency & double-entry balance accounting'
              : 'Multi-tenant zero-knowledge settlement state and cryptographic balance audit records'}
          </p>
        </div>
        <div className="page-actions" style={{ display: 'flex', gap: '0.6rem' }}>
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={handleExportCSV}
          >
            <Download size={16} />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleOpenModal}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Plus size={16} />
            <span>New Transaction</span>
          </button>
        </div>
      </div>

      {!isLiveDb && (
        <DemoDisclaimer message="SIMULATED LEDGER: Real cryptographic ledger engines batch and settle balances using zero-knowledge recursive proofs." />
      )}

      {/* Dynamic Status / Idempotency Banner */}
      {banner && (
        <div 
          style={{
            marginBottom: '1.5rem',
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-lg)',
            border: banner.type === 'success' 
              ? '1px solid var(--success-border)' 
              : banner.type === 'replayed' 
                ? '1px solid var(--info-border)' 
                : '1px solid var(--danger-border)',
            backgroundColor: banner.type === 'success' 
              ? 'var(--success-bg)' 
              : banner.type === 'replayed' 
                ? 'var(--info-bg)' 
                : 'var(--danger-bg)',
            color: banner.type === 'success' 
              ? 'var(--success)' 
              : banner.type === 'replayed' 
                ? 'var(--info)' 
                : 'var(--danger)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '1rem',
            animation: 'fadeIn 0.2s ease-in-out'
          }}
        >
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <div style={{ marginTop: '2px' }}>
              {banner.type === 'success' && <CheckCircle2 size={20} />}
              {banner.type === 'replayed' && <Zap size={20} />}
              {banner.type === 'error' && <AlertTriangle size={20} />}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>
                {banner.title}
              </div>
              <div style={{ fontSize: '0.8125rem', marginTop: '0.2rem', color: 'var(--text-main)' }}>
                {banner.message}
              </div>
              {banner.details && (
                <div 
                  className="mono-text" 
                  style={{ 
                    fontSize: '0.75rem', 
                    marginTop: '0.35rem', 
                    opacity: 0.9,
                    color: banner.type === 'error' ? 'var(--danger)' : 'var(--text-secondary)'
                  }}
                >
                  {banner.details}
                </div>
              )}
            </div>
          </div>
          <button
            type="button"
            className="icon-button"
            onClick={() => setBanner(null)}
            style={{ color: 'inherit', padding: '0.2rem' }}
            title="Dismiss notice"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Quick Summary Metric Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '1rem', 
        marginBottom: '1.5rem' 
      }}>
        <div style={{ 
          padding: '1rem', 
          backgroundColor: 'var(--bg-surface)', 
          border: '1px solid var(--border-subtle)', 
          borderRadius: 'var(--radius-lg)' 
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            {isLiveDb ? 'Live Settled Escrow Balance' : 'Filtered Settled Volume'}
          </div>
          <div style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--success)', fontFamily: 'var(--font-mono)', marginTop: '0.25rem' }}>
            ${isLiveDb && summary?.accountBalance 
              ? summary.accountBalance.settledBalanceUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })
              : '93,750.00'}
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {isLiveDb ? 'Real-time double-entry reserve' : 'Simulated initial reserve'}
          </div>
        </div>

        <div style={{ 
          padding: '1rem', 
          backgroundColor: 'var(--bg-surface)', 
          border: '1px solid var(--border-subtle)', 
          borderRadius: 'var(--radius-lg)' 
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Pending Escrow Holds</div>
          <div style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--info)', fontFamily: 'var(--font-mono)', marginTop: '0.25rem' }}>
            ${isLiveDb && summary?.accountBalance 
              ? summary.accountBalance.pendingEscrowUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })
              : '0.00'}
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Funds reserved prior to settlement
          </div>
        </div>

        <div style={{ 
          padding: '1rem', 
          backgroundColor: 'var(--bg-surface)', 
          border: '1px solid var(--border-subtle)', 
          borderRadius: 'var(--radius-lg)' 
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Lifetime Settled Volume</div>
          <div style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-main)', fontFamily: 'var(--font-mono)', marginTop: '0.25rem' }}>
            ${isLiveDb && summary 
              ? summary.totalSettledVolumeUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })
              : '6,250.00'}
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Cumulative settled throughput
          </div>
        </div>

        <div style={{ 
          padding: '1rem', 
          backgroundColor: 'var(--bg-surface)', 
          border: '1px solid var(--border-subtle)', 
          borderRadius: 'var(--radius-lg)' 
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total Ledger Mutations</div>
          <div className="mono-text" style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--primary)', marginTop: '0.25rem' }}>
            {isLiveDb && summary ? summary.transactionCount : totalLiveCount} Records
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Atomic double-entry commitments
          </div>
        </div>
      </div>

      {/* Main Ledger Table Card */}
      <div className="card" style={{ padding: 0 }}>
        {/* Toolbar */}
        <div className="table-toolbar">
          <div className="table-search">
            <Search size={16} className="table-search-icon" />
            <input 
              type="text" 
              placeholder={isLiveDb ? "Search by transaction ID, counterparty, description, or key..." : "Search ledger ID, transaction ID, tenant, or batch..."}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="filter-group" style={{ display: 'flex', gap: '0.75rem' }}>
            {isLiveDb && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Type:</label>
                <select
                  value={typeFilter}
                  onChange={(e) => {
                    setTypeFilter(e.target.value as any);
                    setCurrentPage(1);
                  }}
                  style={{ padding: '0.4rem 0.75rem' }}
                >
                  <option value="All">All Types</option>
                  <option value="CHARGE">CHARGE</option>
                  <option value="CREDIT">CREDIT</option>
                  <option value="ESCROW_HOLD">ESCROW_HOLD</option>
                  <option value="SETTLEMENT">SETTLEMENT</option>
                </select>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Status:</label>
              <select 
                value={statusFilter} 
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                style={{ padding: '0.4rem 0.75rem' }}
              >
                <option value="All">All Statuses</option>
                {isLiveDb ? (
                  <>
                    <option value="COMMITTED">COMMITTED</option>
                    <option value="ROLLED_BACK">ROLLED_BACK</option>
                    <option value="PENDING">PENDING</option>
                  </>
                ) : (
                  <>
                    <option value="Settled">Settled</option>
                    <option value="Pending Settlement">Pending Settlement</option>
                    <option value="Audited">Audited</option>
                    <option value="Disputed">Disputed</option>
                  </>
                )}
              </select>
            </div>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={loadBillingData}
              title="Refresh ledger records from database"
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.65rem' }}
            >
              <RefreshCw size={14} className={isLoading ? 'spin-animation' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="table-container" style={{ border: 'none' }}>
          {isLiveDb ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Type</th>
                  <th>Counterparty</th>
                  <th>Amount</th>
                  <th>Balance After</th>
                  <th>Settlement Timestamp</th>
                  <th>Status</th>
                  <th>ACID / Engine</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      Loading live tenant ledger records from MongoDB...
                    </td>
                  </tr>
                ) : filteredLiveTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      No ledger transactions found in this tenant database matching filters.
                      <div style={{ marginTop: '0.75rem' }}>
                        <button 
                          type="button" 
                          className="btn btn-primary btn-sm"
                          onClick={handleOpenModal}
                        >
                          Execute First Transaction
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredLiveTransactions.map((tx) => {
                    const isPositive = tx.type === 'CREDIT' || tx.type === 'SETTLEMENT';
                    return (
                      <tr key={tx.transactionId}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <span className="mono-text" style={{ fontWeight: 600, color: 'var(--primary)' }}>
                              {tx.transactionId}
                            </span>
                            <button
                              type="button"
                              className="icon-button"
                              onClick={() => handleCopyKey(tx.transactionId)}
                              title="Copy Transaction ID"
                              style={{ padding: '2px' }}
                            >
                              <Copy size={12} color="var(--text-muted)" />
                            </button>
                          </div>
                          <div className="mono-text" style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }} title={tx.idempotencyKey}>
                            key: {tx.idempotencyKey.substring(0, 18)}...
                          </div>
                        </td>
                        <td>
                          <span 
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '0.15rem 0.5rem',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              fontFamily: 'var(--font-mono)',
                              backgroundColor: tx.type === 'CHARGE' ? 'var(--warning-bg)' : tx.type === 'CREDIT' ? 'var(--success-bg)' : 'var(--info-bg)',
                              color: tx.type === 'CHARGE' ? 'var(--warning)' : tx.type === 'CREDIT' ? 'var(--success)' : 'var(--info)',
                              border: `1px solid ${tx.type === 'CHARGE' ? 'var(--warning-border)' : tx.type === 'CREDIT' ? 'var(--success-border)' : 'var(--info-border)'}`
                            }}
                          >
                            {tx.type}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{tx.counterparty}</div>
                          {tx.description && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {tx.description}
                            </div>
                          )}
                        </td>
                        <td>
                          <span 
                            style={{ 
                              fontWeight: 700, 
                              fontFamily: 'var(--font-mono)',
                              color: isPositive ? 'var(--success)' : 'var(--text-main)'
                            }}
                          >
                            {isPositive ? '+' : '-'}${tx.amountUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td>
                          <span className="mono-text" style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                            ${tx.balanceAfterUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="mono-text" style={{ fontSize: '0.75rem' }}>
                          {new Date(tx.createdAt).toLocaleString()}
                        </td>
                        <td>
                          <Badge status={tx.status === 'COMMITTED' ? 'Settled' : tx.status === 'ROLLED_BACK' ? 'Failed' : 'Processing'} />
                        </td>
                        <td>
                          <span style={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '0.25rem', 
                            color: 'var(--success)', 
                            fontSize: '0.75rem',
                            fontWeight: 600
                          }}>
                            <Lock size={12} />
                            {tx.acidMode || 'ACID Lock'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          ) : (
            /* Fallback Simulated Table */
            <table className="data-table">
              <thead>
                <tr>
                  <th>Entry ID</th>
                  <th>Transaction ID</th>
                  <th>Tenant</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Settlement Date</th>
                  <th>Status</th>
                  <th>ZK Signature</th>
                </tr>
              </thead>
              <tbody>
                {filteredFallbackEntries.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      No ledger entries found matching filters.
                    </td>
                  </tr>
                ) : (
                  filteredFallbackEntries.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((entry) => (
                    <tr key={entry.id}>
                      <td>
                        <span className="mono-text" style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                          {entry.id}
                        </span>
                      </td>
                      <td>
                        <span className="mono-text" style={{ color: 'var(--primary)', fontSize: '0.75rem' }}>
                          {entry.transactionId}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{entry.tenantName}</span>
                      </td>
                      <td style={{ maxWidth: '280px', color: 'var(--text-secondary)' }}>
                        {entry.description}
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                          ${entry.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="mono-text" style={{ fontSize: '0.75rem' }}>
                        {entry.date}
                      </td>
                      <td>
                        <Badge status={entry.status} />
                      </td>
                      <td>
                        {entry.signatureVerified ? (
                          <span style={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '0.25rem', 
                            color: 'var(--success)', 
                            fontSize: '0.75rem',
                            fontWeight: 600
                          }}>
                            <Database size={14} />
                            Verified
                          </span>
                        ) : (
                          <span style={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '0.25rem', 
                            color: 'var(--warning)', 
                            fontSize: '0.75rem',
                            fontWeight: 600
                          }}>
                            <Clock size={14} />
                            Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Bar */}
        <div className="pagination-bar">
          <div>
            Showing <strong>{isLiveDb ? filteredLiveTransactions.length : filteredFallbackEntries.length}</strong> of{' '}
            <strong>{isLiveDb ? totalLiveCount : entries.length}</strong> records
          </div>

          <div className="pagination-controls">
            <button
              type="button"
              className="pagination-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            >
              <ChevronLeft size={16} />
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                type="button"
                className={`pagination-btn ${currentPage === num ? 'active' : ''}`}
                onClick={() => setCurrentPage(num)}
              >
                {num}
              </button>
            ))}

            <button
              type="button"
              className="pagination-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* New Billing Transaction Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Execute Atomic Billing Transaction"
        maxWidth="620px"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', width: '100%' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmitTransaction}
              disabled={isSubmitting}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              {isSubmitting && <RefreshCw size={14} className="spin-animation" />}
              <span>{isSubmitting ? 'Acquiring Lock & Mutating...' : 'Commit Transaction'}</span>
            </button>
          </div>
        }
      >
        <form onSubmit={handleSubmitTransaction} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Header Info Note */}
          <div style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--primary-light)',
            border: '1px solid var(--primary-border)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.8125rem',
            color: 'var(--text-main)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem'
          }}>
            <Lock size={18} color="var(--primary)" style={{ flexShrink: 0 }} />
            <div>
              <strong>Distributed Lock Guarded:</strong> Mutates the isolated tenant database ledger atomically. Duplicate requests with matching idempotency keys return HTTP 200 without double-billing.
            </div>
          </div>

          {/* Type & Amount row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Transaction Type
              </label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value as LedgerTransactionType)}
                style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
              >
                <option value="CHARGE">CHARGE (Debit from Account)</option>
                <option value="CREDIT">CREDIT (Inflow / Refund)</option>
                <option value="ESCROW_HOLD">ESCROW_HOLD (Reserve Balance)</option>
                <option value="SETTLEMENT">SETTLEMENT (Clearance)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Amount (USD)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
                placeholder="2500.00"
                style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                required
              />
            </div>
          </div>

          {/* Counterparty & Description */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Counterparty Organization
            </label>
            <input
              type="text"
              value={formCounterparty}
              onChange={(e) => setFormCounterparty(e.target.value)}
              placeholder="e.g. Cloudflare Inc, AWS, Stripe Payments"
              style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Description / Audit Memo (Optional)
            </label>
            <input
              type="text"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="e.g. Enterprise Edge Routing Monthly Allocation"
              style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
            />
          </div>

          {/* Idempotency Key Section */}
          <div style={{
            padding: '1rem',
            backgroundColor: 'var(--bg-surface-alt)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Zap size={14} color="var(--primary)" />
                Idempotency-Key HTTP Header
              </label>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                {lastSubmittedKey && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={handleReplayKey}
                    style={{ fontSize: '0.6875rem', padding: '0.2rem 0.5rem' }}
                    title="Reuse the last submitted key to demonstrate replay protection"
                  >
                    Replay Same Key
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleGenerateNewKey}
                  style={{ fontSize: '0.6875rem', padding: '0.2rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                >
                  <RefreshCw size={11} />
                  <span>Generate New</span>
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                type="text"
                className="mono-text"
                value={formIdempotencyKey}
                onChange={(e) => setFormIdempotencyKey(e.target.value)}
                style={{ 
                  flex: 1, 
                  padding: '0.45rem 0.75rem', 
                  fontSize: '0.8125rem', 
                  borderRadius: 'var(--radius-sm)', 
                  border: '1px solid var(--border-strong)',
                  backgroundColor: '#ffffff'
                }}
                required
              />
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleCopyKey(formIdempotencyKey)}
                title="Copy Key"
                style={{ padding: '0.45rem 0.6rem' }}
              >
                {copiedKey ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
              </button>
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
              💡 <em>To test duplicate protection: submit once (201 Created), then click <strong>"Replay Same Key"</strong> and submit again (200 Replayed).</em>
            </div>
          </div>

          {/* Atomic Failure Simulation Checkbox */}
          <div style={{
            padding: '0.75rem 1rem',
            backgroundColor: simulateFailure ? 'var(--danger-bg)' : 'var(--bg-surface)',
            border: simulateFailure ? '1px solid var(--danger-border)' : '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            transition: 'all 0.2s ease'
          }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={simulateFailure}
                onChange={(e) => setSimulateFailure(e.target.checked)}
                style={{ marginTop: '3px' }}
              />
              <div>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: simulateFailure ? 'var(--danger)' : 'var(--text-main)' }}>
                  Simulate Atomic Failure & Compensating Rollback (`simulateFailure: true`)
                </span>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.15rem 0 0 0' }}>
                  Injects an intentional exception during execution to demonstrate automatic compensating rollback. Balance mutations will be safely reverted.
                </p>
              </div>
            </label>
          </div>
        </form>
      </Modal>
    </div>
  );
};
