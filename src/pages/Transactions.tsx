import React, { useState } from 'react';
import { 
  Search, 
  ShieldCheck, 
  Copy, 
  Check, 
  Info
} from 'lucide-react';
import { Transaction, TransactionStatus } from '../types';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { DemoDisclaimer } from '../components/DemoDisclaimer';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | TransactionStatus>('All');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch = 
      tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.tenantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.tenantId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.proofHash.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || tx.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    onShowToast(`Copied ${fieldName} to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>Transactions Registry</h1>
          <p>Real-time transaction stream verified through Zero-Knowledge SNARK proofs</p>
        </div>
        <div className="page-actions">
          <span className="demo-pill-badge">
            <span className="demo-pill-dot" />
            SYNTHETIC TRANSACTION POOL
          </span>
        </div>
      </div>

      <DemoDisclaimer message="ZERO-KNOWLEDGE AUDIT DEMO: In production LedgerGuard, zero-knowledge proofs verify balance sufficiency and enclave isolation without revealing transactional amounts to unauthorized parties." />

      {/* Main Table Card */}
      <div className="card" style={{ padding: 0 }}>
        {/* Toolbar */}
        <div className="table-toolbar">
          <div className="table-search">
            <Search size={16} className="table-search-icon" />
            <input 
              type="text" 
              placeholder="Search by transaction ID, tenant name, or proof hash..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Status:</label>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value as any)}
              style={{ padding: '0.4rem 0.75rem' }}
            >
              <option value="All">All Transactions</option>
              <option value="Completed">Completed</option>
              <option value="Processing">Processing</option>
              <option value="Flagged">Flagged</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="table-container" style={{ border: 'none' }}>
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
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No transactions match current filters.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
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
        </div>

        <div className="pagination-bar">
          <div>
            Showing <strong>{filteredTransactions.length}</strong> of <strong>{transactions.length}</strong> recorded transactions
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Groth16 Zero-Knowledge circuit verification simulated
          </div>
        </div>
      </div>

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <Modal
          isOpen={!!selectedTransaction}
          onClose={() => onSelectTransaction(null)}
          title={`Transaction Inspection: ${selectedTransaction.id}`}
          maxWidth="640px"
          footer={
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => onSelectTransaction(null)}
            >
              Done
            </button>
          }
        >
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
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Settled Amount</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-main)', marginTop: '2px' }}>
                  ${selectedTransaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>{selectedTransaction.currency}</span>
                </div>
              </div>
              <div>
                <Badge status={selectedTransaction.status} />
              </div>
            </div>

            {/* Description & Tenant */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Tenant</span>
                <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{selectedTransaction.tenantName}</span>
                <span className="mono-text" style={{ fontSize: '0.75rem', display: 'block' }}>{selectedTransaction.tenantId}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Processing Enclave Node</span>
                <span className="mono-text" style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{selectedTransaction.processingNode}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>{selectedTransaction.timestamp}</span>
              </div>
            </div>

            {/* Fee Breakdown */}
            <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.875rem' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.65rem' }}>
                Billing Line Item Breakdown
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8125rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Base Tier Transaction Fee</span>
                  <span className="mono-text">${selectedTransaction.breakdown.baseFee.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Compute Units Allocated</span>
                  <span className="mono-text">${selectedTransaction.breakdown.computeUnits.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Dedicated Enclave Isolation Fee</span>
                  <span className="mono-text">${selectedTransaction.breakdown.isolationFee.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Network Settlement Tax</span>
                  <span className="mono-text">${selectedTransaction.breakdown.networkTax.toFixed(2)}</span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  paddingTop: '0.4rem', 
                  borderTop: '1px dashed var(--border-subtle)', 
                  fontWeight: 700 
                }}>
                  <span>Total Calculated Charge</span>
                  <span className="mono-text" style={{ color: 'var(--primary)' }}>
                    ${selectedTransaction.amount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Cryptographic Proof Details */}
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
                      onClick={() => handleCopy(selectedTransaction.proofHash, 'Proof Hash')}
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
                    {selectedTransaction.proofHash}
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Public Inputs Hash:</span>
                    <button 
                      type="button" 
                      onClick={() => handleCopy(selectedTransaction.publicInputsHash, 'Public Inputs')}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.6875rem', color: 'var(--primary)' }}
                    >
                      {copiedField === 'Public Inputs' ? <Check size={12} /> : <Copy size={12} />}
                      {copiedField === 'Public Inputs' ? 'Copied' : 'Copy Hash'}
                    </button>
                  </div>
                  <div className="mono-text" style={{ 
                    fontSize: '0.6875rem', 
                    padding: '0.35rem 0.6rem', 
                    backgroundColor: 'var(--bg-surface-alt)', 
                    borderRadius: '4px',
                    wordBreak: 'break-all'
                  }}>
                    {selectedTransaction.publicInputsHash}
                  </div>
                </div>
              </div>
            </div>

            {/* Simulated verification banner */}
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
        </Modal>
      )}
    </div>
  );
};
