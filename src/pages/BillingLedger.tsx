import React, { useState } from 'react';
import { 
  Search, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  ShieldCheck
} from 'lucide-react';
import { LedgerEntry, LedgerStatus } from '../types';
import { Badge } from '../components/Badge';
import { DemoDisclaimer } from '../components/DemoDisclaimer';

interface BillingLedgerProps {
  entries: LedgerEntry[];
  onShowToast: (msg: string) => void;
}

export const BillingLedger: React.FC<BillingLedgerProps> = ({
  entries,
  onShowToast
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | LedgerStatus>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch = 
      entry.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.tenantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.batchId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || entry.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filteredEntries.length / itemsPerPage));
  const currentEntries = filteredEntries.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const totalSettled = filteredEntries
    .filter(e => e.status === 'Settled' || e.status === 'Audited')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalPending = filteredEntries
    .filter(e => e.status === 'Pending Settlement')
    .reduce((sum, e) => sum + e.amount, 0);

  const handleExportCSV = () => {
    const headers = ['Ledger ID', 'Transaction ID', 'Tenant', 'Description', 'Amount (USD)', 'Date', 'Status', 'Batch ID'];
    const rows = filteredEntries.map(e => [
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
    link.setAttribute('download', `ledgerguard_billing_ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onShowToast(`Exported ${filteredEntries.length} simulated ledger entries to CSV`);
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>Billing Ledger</h1>
          <p>Multi-tenant zero-knowledge settlement state and cryptographic balance audit records</p>
        </div>
        <div className="page-actions">
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={handleExportCSV}
          >
            <Download size={16} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <DemoDisclaimer message="SIMULATED LEDGER: Real cryptographic ledger engines batch and settle balances using zero-knowledge recursive proofs." />

      {/* Quick Summary Pill Bar */}
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
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Filtered Settled / Audited Volume</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--success)', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
            ${totalSettled.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div style={{ 
          padding: '1rem', 
          backgroundColor: 'var(--bg-surface)', 
          border: '1px solid var(--border-subtle)', 
          borderRadius: 'var(--radius-lg)' 
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Pending Escrow / Settlement</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--info)', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
            ${totalPending.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div style={{ 
          padding: '1rem', 
          backgroundColor: 'var(--bg-surface)', 
          border: '1px solid var(--border-subtle)', 
          borderRadius: 'var(--radius-lg)' 
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Active Batch ID</div>
          <div className="mono-text" style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--primary)', marginTop: '0.2rem' }}>
            batch_20261116_01
          </div>
        </div>
      </div>

      {/* Main Ledger Card */}
      <div className="card" style={{ padding: 0 }}>
        {/* Toolbar */}
        <div className="table-toolbar">
          <div className="table-search">
            <Search size={16} className="table-search-icon" />
            <input 
              type="text" 
              placeholder="Search ledger ID, transaction ID, tenant, or batch..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="filter-group">
            <label style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Status:</label>
            <select 
              value={statusFilter} 
              onChange={(e) => {
                setStatusFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              style={{ padding: '0.4rem 0.75rem' }}
            >
              <option value="All">All Statuses</option>
              <option value="Settled">Settled</option>
              <option value="Pending Settlement">Pending Settlement</option>
              <option value="Audited">Audited</option>
              <option value="Disputed">Disputed</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="table-container" style={{ border: 'none' }}>
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
              {currentEntries.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No ledger entries found matching filters.
                  </td>
                </tr>
              ) : (
                currentEntries.map((entry) => (
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
                          <ShieldCheck size={14} />
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
                          Pending Sig
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="pagination-bar">
          <div>
            Showing <strong>{filteredEntries.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</strong> to{' '}
            <strong>{Math.min(currentPage * itemsPerPage, filteredEntries.length)}</strong> of{' '}
            <strong>{filteredEntries.length}</strong> ledger entries
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
    </div>
  );
};
