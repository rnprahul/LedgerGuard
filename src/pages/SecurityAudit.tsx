import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Key, 
  Search, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  Activity
} from 'lucide-react';
import { SecuritySeverity } from '../types';
import { SECURITY_STATUS_DATA, AUDIT_LOG_ENTRIES } from '../data/demoData';
import { Badge } from '../components/Badge';
import { DemoDisclaimer } from '../components/DemoDisclaimer';

interface SecurityAuditProps {
  onShowToast: (msg: string) => void;
}

export const SecurityAudit: React.FC<SecurityAuditProps> = ({ onShowToast }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'All' | SecuritySeverity>('All');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState<string | null>(null);

  const filteredLogs = AUDIT_LOG_ENTRIES.filter((log) => {
    const matchesSearch = 
      log.eventType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.tenantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.verificationProofId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSeverity = severityFilter === 'All' || log.severity === severityFilter;

    return matchesSearch && matchesSeverity;
  });

  const handleRunIntegrityScan = () => {
    setIsScanning(true);
    setScanStep('Inspecting hardware memory partitions (Intel SGX / Nitro)...');
    
    setTimeout(() => {
      setScanStep('Validating Zero-Knowledge constraint satisfaction & circuits...');
    }, 900);

    setTimeout(() => {
      setScanStep('Auditing multi-tenant Ed25519 digital signatures...');
    }, 1800);

    setTimeout(() => {
      setIsScanning(false);
      setScanStep(null);
      onShowToast('Simulated Integrity Scan: 14/14 tenant enclaves verified 100% isolated!');
    }, 2700);
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>Security & Cryptographic Audit</h1>
          <p>Real-time zero-knowledge proof verification, enclave boundaries, and immutable audit logs</p>
        </div>
        <div className="page-actions">
          <button 
            type="button" 
            className="btn btn-primary"
            onClick={handleRunIntegrityScan}
            disabled={isScanning}
          >
            <RefreshCw size={16} className={isScanning ? 'status-dot-pulse' : ''} />
            <span>{isScanning ? 'Verifying Proofs...' : 'Run Integrity Scan'}</span>
          </button>
        </div>
      </div>

      <DemoDisclaimer message="SECURITY PROTOCOL DISCLAIMER: Metrics and cryptographic verifications shown below are simulated for frontend architecture demonstration. No actual HSM or cryptographic enclave keys are loaded in this browser demo." />

      {/* Simulated Scan Notification Banner if running */}
      {isScanning && (
        <div style={{
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: 'var(--radius-md)',
          padding: '0.875rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          animation: 'modalIn 200ms ease-out'
        }}>
          <Activity size={18} color="var(--primary)" className="status-dot-pulse" />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--primary)' }}>
              Executing Simulated Multi-Tenant Enclave Check
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {scanStep}
            </div>
          </div>
        </div>
      )}

      {/* 4 Security Architecture Cards */}
      <div className="metrics-grid">
        {/* Tenant Isolation Status */}
        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-label">Tenant Isolation Status</span>
            <div className="metric-icon-wrap" style={{ backgroundColor: '#ecfdf5', color: '#059669' }}>
              <Lock size={18} />
            </div>
          </div>
          <div className="metric-value" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>{SECURITY_STATUS_DATA.tenantIsolation.status}</span>
            <Badge status="Active">100% SGX</Badge>
          </div>
          <div className="metric-footer">
            <span className="trend-badge positive">0 violations</span>
            <span>across {SECURITY_STATUS_DATA.tenantIsolation.activeEnclaves} active tenant enclaves</span>
          </div>
        </div>

        {/* Authentication Status */}
        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-label">Authentication Engine</span>
            <div className="metric-icon-wrap" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
              <ShieldCheck size={18} />
            </div>
          </div>
          <div className="metric-value">
            {SECURITY_STATUS_DATA.authentication.status}
          </div>
          <div className="metric-footer">
            <span className="trend-badge positive">{SECURITY_STATUS_DATA.authentication.tokenVerificationSuccessRate}%</span>
            <span>token validation ({SECURITY_STATUS_DATA.authentication.activeSessions} sessions)</span>
          </div>
        </div>

        {/* Signature Verification */}
        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-label">Signature Verification</span>
            <div className="metric-icon-wrap" style={{ backgroundColor: '#f5f3ff', color: '#7c3aed' }}>
              <Key size={18} />
            </div>
          </div>
          <div className="metric-value">
            {SECURITY_STATUS_DATA.signatureVerification.status}
          </div>
          <div className="metric-footer">
            <span className="trend-badge neutral">{SECURITY_STATUS_DATA.signatureVerification.cryptoAlgorithm}</span>
            <span>({SECURITY_STATUS_DATA.signatureVerification.validatedCount.toLocaleString()} checked)</span>
          </div>
        </div>

        {/* ZK Proof Engine Status */}
        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-label">ZK Proof Engine</span>
            <div className="metric-icon-wrap" style={{ backgroundColor: '#f0f9ff', color: '#0284c7' }}>
              <Layers size={18} />
            </div>
          </div>
          <div className="metric-value">
            {SECURITY_STATUS_DATA.zkEngine.status}
          </div>
          <div className="metric-footer">
            <span className="trend-badge positive">{SECURITY_STATUS_DATA.zkEngine.proofGenerationAvgMs}ms</span>
            <span>average latency ({SECURITY_STATUS_DATA.zkEngine.circuitVersion})</span>
          </div>
        </div>
      </div>

      {/* Audit Log Entries Table Card */}
      <div className="card" style={{ padding: 0, marginBottom: '1.5rem' }}>
        <div className="table-toolbar">
          <div className="table-search">
            <Search size={16} className="table-search-icon" />
            <input 
              type="text" 
              placeholder="Search audit events, tenant name, actor, or proof ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Severity:</label>
            <select 
              value={severityFilter} 
              onChange={(e) => setSeverityFilter(e.target.value as any)}
              style={{ padding: '0.4rem 0.75rem' }}
            >
              <option value="All">All Severities</option>
              <option value="Normal">Normal</option>
              <option value="Warning">Warning</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
        </div>

        <div className="table-container" style={{ border: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp (UTC)</th>
                <th>Event Type</th>
                <th>Tenant Involved</th>
                <th>Actor / Service</th>
                <th>Severity</th>
                <th>Verification Proof ID</th>
                <th>Audit Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No audit records match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="mono-text" style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                      {log.timestamp}
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.8125rem' }}>
                        {log.eventType}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{log.tenantName}</div>
                      <div className="mono-text" style={{ fontSize: '0.6875rem' }}>{log.tenantId}</div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                        {log.actor}
                      </span>
                    </td>
                    <td>
                      <Badge status={log.severity} />
                    </td>
                    <td>
                      <span className="hash-snippet">
                        {log.verificationProofId}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', maxWidth: '300px' }}>
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination-bar">
          <div>
            Showing <strong>{filteredLogs.length}</strong> of <strong>{AUDIT_LOG_ENTRIES.length}</strong> immutable audit entries
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Cryptographically sealed in Merkle state tree
          </div>
        </div>
      </div>

      {/* Security Event History & Threat Detection Timeline */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">
              <Activity size={18} color="var(--primary)" />
              <span>Security Event History & Threat Detection Timeline</span>
            </div>
            <div className="card-subtitle">
              Chronological log of multi-tenant cryptographic attestation checks
            </div>
          </div>
          <span className="demo-pill-badge">UI SIMULATION</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '0.5rem' }}>
          {[
            {
              time: '11:18:04 UTC',
              title: 'Automatic Ephemeral Key Rotation Complete',
              desc: 'Enclave master seed preserved; forward-secrecy session keys re-derived.',
              badge: 'Success',
              type: 'normal'
            },
            {
              time: '09:20:12 UTC',
              title: 'Cross-Tenant Latency Watchdog Triggered',
              desc: 'Synthetix Logistics AI enclave exceeded 250ms threshold. Quarantine verified non-breaching.',
              badge: 'Warning',
              type: 'warning'
            },
            {
              time: '07:12:50 UTC',
              title: 'Hard Quota Enforcement Intercept',
              desc: 'Tenant Starlight Media Stream bandwidth overage triggered automatic state suspension.',
              badge: 'Critical Alert',
              type: 'critical'
            },
            {
              time: '00:00:01 UTC',
              title: 'Daily Merkle Root Consistency Verified',
              desc: 'Zero discrepancies across all 14 tenant state balances against zero-knowledge proofs.',
              badge: 'Verified',
              type: 'normal'
            }
          ].map((item, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                backgroundColor: item.type === 'critical' ? '#fee2e2' : item.type === 'warning' ? '#fef3c7' : '#dcfce7',
                color: item.type === 'critical' ? '#dc2626' : item.type === 'warning' ? '#d97706' : '#16a34a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: '2px'
              }}>
                {item.type === 'critical' ? <AlertTriangle size={15} /> : item.type === 'warning' ? <ShieldAlert size={15} /> : <CheckCircle2 size={15} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-main)' }}>{item.title}</span>
                  <span className="mono-text" style={{ fontSize: '0.6875rem' }}>{item.time}</span>
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {item.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
