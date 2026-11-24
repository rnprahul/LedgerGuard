import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  ShieldCheck, 
  Copy, 
  Check, 
  Info,
  RefreshCw,
  Lock,
  ArrowRight,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { 
  Transaction, 
  TransactionStatus,
  LedgerTransactionItem,
  LedgerTransactionType
} from '../types';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { DemoDisclaimer } from '../components/DemoDisclaimer';
import { fetchBillingTransactions } from '../services/api';

interface TransactionsPageProps {
  transactions: Transaction[];
  selectedTransaction: Transaction | null;
  onSelectTransaction: (tx: Transaction | null) => void;
  onShowToast: (msg: string) => void;
}

export const Transactions: React.FC<TransactionsPageProps> = ({
  transactions,
  selectedTransaction,
  onSelectTransaction,
  onShowToast
}) => {
  // Live billing state
  const [liveTransactions, setLiveTransactions] = useState<LedgerTransactionItem[]>([]);
  const [totalLiveCount, setTotalLiveCount] = useState(0);
  const [isLiveDb, setIsLiveDb] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | string>('All');
  const [typeFilter, setTypeFilter] = useState<'All' | LedgerTransactionType>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [totalPages, setTotalPages] = useState(1);

  // Inspection & Clipboard
  const [inspectedLiveTx, setInspectedLiveTx] = useState<LedgerTransactionItem | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Fetch live transactions
  const loadTransactions = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchBillingTransactions({
        page: currentPage,
        limit: itemsPerPage,
        status: statusFilter !== 'All' ? statusFilter : undefined,
        type: typeFilter !== 'All' ? typeFilter : undefined,
      });

      setLiveTransactions(res.transactions);
      setTotalLiveCount(res.total);
      setTotalPages(Math.max(1, res.totalPages));
      setIsLiveDb(true);
    } catch {
      // Fallback to simulated transaction pool
      setIsLiveDb(false);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, statusFilter, typeFilter]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    onShowToast(`Copied ${fieldName} to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Filtered live items by search query
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

  // Filtered fallback items
  const filteredFallbackTransactions = transactions.filter((tx) => {
    const matchesSearch = 
      tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.tenantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.tenantId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.proofHash.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || tx.status === (statusFilter as TransactionStatus);
    return matchesSearch && matchesStatus;
  });

  const activeInspection = inspectedLiveTx || selectedTransaction;

  const handleCloseModal = () => {
    setInspectedLiveTx(null);
    onSelectTransaction(null);
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h1>Transactions Registry</h1>
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
                LIVE DATABASE REGISTRY
              </span>
            ) : (
              <span className="demo-pill-badge">
                <span className="demo-pill-dot" />
                SYNTHETIC TRANSACTION POOL
              </span>
            )}
          </div>
          <p>
            {isLiveDb 
              ? 'Real-time ledger transactions verified by distributed locks, MongoDB ACID state, and SHA-256 audit hashing'
              : 'Real-time transaction stream verified through Zero-Knowledge SNARK proofs'}
          </p>
        </div>
        <div className="page-actions">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={loadTransactions}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <RefreshCw size={14} className={isLoading ? 'spin-animation' : ''} />
            <span>Refresh Registry</span>
          </button>
        </div>
      </div>

      {!isLiveDb && (
        <DemoDisclaimer message="ZERO-KNOWLEDGE AUDIT DEMO: In production LedgerGuard, zero-knowledge proofs verify balance sufficiency and enclave isolation without revealing transactional amounts to unauthorized parties." />
      )}

      {/* Main Table Card */}
      <div className="card" style={{ padding: 0 }}>
        {/* Toolbar */}
        <div className="table-toolbar">
          <div className="table-search">
            <Search size={16} className="table-search-icon" />
            <input 
              type="text" 
              placeholder={isLiveDb ? "Search transaction ID, counterparty, key..." : "Search by transaction ID, tenant name, or proof hash..."}
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
                    <option value="Completed">Completed</option>
                    <option value="Processing">Processing</option>
                    <option value="Flagged">Flagged</option>
                    <option value="Failed">Failed</option>
                  </>
                )}
              </select>
            </div>
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
                  <th>Status</th>
                  <th>Idempotency Key</th>
                  <th>Timestamp</th>
                  <th style={{ textAlign: 'right' }}>Audit</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      Loading live transaction records...
                    </td>
                  </tr>
                ) : filteredLiveTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      No transactions recorded in this isolated tenant database matching the filters.
                    </td>
                  </tr>
                ) : (
                  filteredLiveTransactions.map((tx) => (
                    <tr key={tx.transactionId}>
                      <td>
                        <span className="mono-text" style={{ fontWeight: 600, color: 'var(--primary)' }}>
                          {tx.transactionId}
                        </span>
                      </td>
                      <td>
                        <span 
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '0.15rem 0.45rem',
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
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {tx.description}
                          </div>
                        )}
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                          ${tx.amountUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })} {tx.currency}
                        </span>
                      </td>
                      <td>
                        <Badge status={tx.status === 'COMMITTED' ? 'Completed' : tx.status === 'ROLLED_BACK' ? 'Failed' : 'Processing'} />
                      </td>
                      <td>
                        <span className="hash-snippet" title={tx.idempotencyKey}>
                          {tx.idempotencyKey.substring(0, 14)}...
                        </span>
                      </td>
                      <td className="mono-text" style={{ fontSize: '0.75rem' }}>
                        {new Date(tx.createdAt).toLocaleString()}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem' }}
                          onClick={() => setInspectedLiveTx(tx)}
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            /* Fallback Synthetic Table */
            <table className="data-table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Tenant</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>ZK Proof Hash</th>
                  <th>Timestamp</th>
                  <th style={{ textAlign: 'right' }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredFallbackTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      No transactions match current filters.
                    </td>
                  </tr>
                ) : (
                  filteredFallbackTransactions.map((tx) => (
                    <tr key={tx.id}>
                      <td>
                        <span className="mono-text" style={{ fontWeight: 600, color: 'var(--primary)' }}>
                          {tx.id}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{tx.tenantName}</div>
                        <div className="mono-text" style={{ fontSize: '0.6875rem' }}>{tx.tenantId}</div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                          ${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} {tx.currency}
                        </span>
                      </td>
                      <td>
                        <Badge status={tx.status} />
                      </td>
                      <td>
                        <span className="hash-snippet" title={tx.proofHash}>
                          {tx.proofHash.substring(0, 10)}...{tx.proofHash.substring(tx.proofHash.length - 6)}
                        </span>
                      </td>
                      <td className="mono-text" style={{ fontSize: '0.75rem' }}>
                        {tx.timestamp}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem' }}
                          onClick={() => onSelectTransaction(tx)}
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="pagination-bar">
          <div>
            Showing <strong>{isLiveDb ? filteredLiveTransactions.length : filteredFallbackTransactions.length}</strong> of{' '}
            <strong>{isLiveDb ? totalLiveCount : transactions.length}</strong> recorded transactions
          </div>

          {totalPages > 1 && (
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
          )}

          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {isLiveDb ? 'MongoDB Enclave Isolation & Redis Lock Guarded' : 'Groth16 Zero-Knowledge circuit verification simulated'}
          </div>
        </div>
      </div>

      {/* Transaction Inspection Modal */}
      {activeInspection && (
        <Modal
          isOpen={!!activeInspection}
          onClose={handleCloseModal}
          title={`Transaction Audit: ${'transactionId' in activeInspection ? activeInspection.transactionId : activeInspection.id}`}
          maxWidth="640px"
          footer={
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={handleCloseModal}
            >
              Done
            </button>
          }
        >
          {'transactionId' in activeInspection ? (
            /* Live Transaction Inspector */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Header Summary */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: '1rem', 
                backgroundColor: 'var(--bg-surface-alt)', 
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)'
              }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mutated Amount ({activeInspection.type})</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-main)', marginTop: '2px' }}>
                    ${activeInspection.amountUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })} <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>{activeInspection.currency}</span>
                  </div>
                </div>
                <div>
                  <Badge status={activeInspection.status === 'COMMITTED' ? 'Completed' : 'Failed'} />
                </div>
              </div>

              {/* Counterparty & Details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Counterparty</span>
                  <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{activeInspection.counterparty}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>{activeInspection.description || 'Standard transaction'}</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Tenant Enclave ID</span>
                  <span className="mono-text" style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{activeInspection.tenantId}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>
                    {new Date(activeInspection.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Balance Mutation Flow */}
              <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.875rem' }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.65rem' }}>
                  Atomic Double-Entry Balance Audit
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Balance Before</span>
                    <span className="mono-text" style={{ fontWeight: 600, fontSize: '0.9375rem' }}>
                      ${activeInspection.balanceBeforeUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', color: 'var(--primary)', gap: '0.25rem' }}>
                    <ArrowRight size={18} />
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Balance After</span>
                    <span className="mono-text" style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--success)' }}>
                      ${activeInspection.balanceAfterUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Idempotency & Cryptographic Engine */}
              <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.875rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.65rem' }}>
                  <Lock size={15} color="var(--primary)" />
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700 }}>Distributed Lock & ACID Verification</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Idempotency Key:</span>
                      <button 
                        type="button" 
                        onClick={() => handleCopy(activeInspection.idempotencyKey, 'Idempotency Key')}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.6875rem', color: 'var(--primary)' }}
                      >
                        {copiedField === 'Idempotency Key' ? <Check size={12} /> : <Copy size={12} />}
                        {copiedField === 'Idempotency Key' ? 'Copied' : 'Copy Key'}
                      </button>
                    </div>
                    <div className="mono-text" style={{ 
                      fontSize: '0.6875rem', 
                      padding: '0.35rem 0.6rem', 
                      backgroundColor: 'var(--bg-surface-alt)', 
                      borderRadius: '4px',
                      wordBreak: 'break-all'
                    }}>
                      {activeInspection.idempotencyKey}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', paddingTop: '0.4rem', borderTop: '1px dashed var(--border-subtle)' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>ACID Execution Mode:</span>
                    <span className="mono-text" style={{ fontWeight: 600 }}>{activeInspection.acidMode}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Fallback Legacy Transaction Inspector */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: '1rem', 
                backgroundColor: 'var(--bg-surface-alt)', 
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)'
              }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Settled Amount</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-main)', marginTop: '2px' }}>
                    ${activeInspection.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>{activeInspection.currency}</span>
                  </div>
                </div>
                <div>
                  <Badge status={activeInspection.status} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Tenant</span>
                  <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{activeInspection.tenantName}</span>
                  <span className="mono-text" style={{ fontSize: '0.75rem', display: 'block' }}>{activeInspection.tenantId}</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Processing Enclave Node</span>
                  <span className="mono-text" style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{activeInspection.processingNode}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>{activeInspection.timestamp}</span>
                </div>
              </div>

              {/* Cryptographic Parameters */}
              <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.875rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.65rem' }}>
                  <ShieldCheck size={16} color="var(--primary)" />
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700 }}>Zero-Knowledge Cryptographic Parameters</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>ZK-SNARK Proof Hash:</span>
                      <button 
                        type="button" 
                        onClick={() => handleCopy(activeInspection.proofHash, 'Proof Hash')}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.6875rem', color: 'var(--primary)' }}
                      >
                        {copiedField === 'Proof Hash' ? <Check size={12} /> : <Copy size={12} />}
                        {copiedField === 'Proof Hash' ? 'Copied' : 'Copy Hash'}
                      </button>
                    </div>
                    <div className="mono-text" style={{ 
                      fontSize: '0.6875rem', 
                      padding: '0.35rem 0.6rem', 
                      backgroundColor: 'var(--bg-surface-alt)', 
                      borderRadius: '4px',
                      wordBreak: 'break-all'
                    }}>
                      {activeInspection.proofHash}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ 
                fontSize: '0.75rem', 
                color: 'var(--text-muted)', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.4rem' 
              }}>
                <Info size={14} />
                <span>Cryptographic verification simulated for frontend prototype preview.</span>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};
