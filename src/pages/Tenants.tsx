import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Lock
} from 'lucide-react';
import { Tenant, TenantStatus, BillingPlan, IsolationZone } from '../types';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { DemoDisclaimer } from '../components/DemoDisclaimer';

interface TenantsPageProps {
  tenants: Tenant[];
  onAddTenant: (tenant: Tenant) => void;
  onToggleStatus: (tenantId: string) => void;
  onShowToast: (msg: string) => void;
}

export const Tenants: React.FC<TenantsPageProps> = ({
  tenants,
  onAddTenant,
  onToggleStatus,
  onShowToast
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | TenantStatus>('All');
  const [planFilter, setPlanFilter] = useState<'All' | BillingPlan>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTenantDetails, setSelectedTenantDetails] = useState<Tenant | null>(null);

  // Add Tenant Form State
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    plan: 'Enterprise' as BillingPlan,
    isolationZone: 'Dedicated Enclave' as IsolationZone,
    contactEmail: '',
    allocatedQuota: 1000000
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const filteredTenants = tenants.filter((tenant) => {
    const matchesSearch = 
      tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.contactEmail.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || tenant.status === statusFilter;
    const matchesPlan = planFilter === 'All' || tenant.plan === planFilter;

    return matchesSearch && matchesStatus && matchesPlan;
  });

  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      code: '',
      plan: 'Enterprise',
      isolationZone: 'Dedicated Enclave',
      contactEmail: '',
      allocatedQuota: 1000000
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Tenant legal name is required';
    if (!formData.code.trim()) errors.code = 'Tenant identifier code is required';
    if (!formData.contactEmail.trim() || !formData.contactEmail.includes('@')) {
      errors.contactEmail = 'A valid security contact email is required';
    }
    return errors;
  };

  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const newTenant: Tenant = {
      id: `tnt_${Math.random().toString(36).substring(2, 7)}`,
      name: formData.name.trim(),
      code: formData.code.trim().toUpperCase(),
      status: 'Provisioning',
      plan: formData.plan,
      isolationZone: formData.isolationZone,
      createdAt: new Date().toISOString().split('T')[0],
      monthlySpend: 0.00,
      quotaUsedPercent: 0,
      apiRequests: 0,
      contactEmail: formData.contactEmail.trim(),
      zkProofCount: 0
    };

    onAddTenant(newTenant);
    setIsModalOpen(false);
    onShowToast(`Tenant "${newTenant.name}" successfully provisioned into ${newTenant.isolationZone}!`);
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>Tenants Management</h1>
          <p>Multi-tenant enclave provisioning and cryptographic isolation boundaries</p>
        </div>
        <div className="page-actions">
          <button 
            type="button" 
            className="btn btn-primary"
            onClick={handleOpenAddModal}
          >
            <Plus size={16} />
            <span>Add Tenant</span>
          </button>
        </div>
      </div>

      <DemoDisclaimer message="TENANT DEMO ENGINE: Provisioning new tenants updates local React state and simulates enclave boundary isolation." />

      {/* Main Table Card */}
      <div className="card" style={{ padding: 0 }}>
        {/* Toolbar */}
        <div className="table-toolbar">
          <div className="table-search">
            <Search size={16} className="table-search-icon" />
            <input 
              type="text" 
              placeholder="Search by tenant name, ID, code, or email..."
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
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Provisioning">Provisioning</option>
              <option value="Suspended">Suspended</option>
            </select>

            <label style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>Plan:</label>
            <select 
              value={planFilter} 
              onChange={(e) => setPlanFilter(e.target.value as any)}
              style={{ padding: '0.4rem 0.75rem' }}
            >
              <option value="All">All Plans</option>
              <option value="Enterprise">Enterprise</option>
              <option value="Growth">Growth</option>
              <option value="Starter">Starter</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="table-container" style={{ border: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Tenant Name & ID</th>
                <th>Status</th>
                <th>Plan & Enclave</th>
                <th>Usage & Quota</th>
                <th>ZK Proofs</th>
                <th>Created Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No tenants found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredTenants.map((tenant) => (
                  <tr key={tenant.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{tenant.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '2px' }}>
                        <span className="mono-text" style={{ fontSize: '0.6875rem' }}>{tenant.id}</span>
                        <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>•</span>
                        <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--primary)' }}>{tenant.code}</span>
                      </div>
                    </td>
                    <td>
                      <Badge status={tenant.status} />
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{tenant.plan}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>
                        <Lock size={11} color="var(--primary)" />
                        <span>{tenant.isolationZone}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', width: '130px', marginBottom: '3px' }}>
                        <span className="mono-text">${tenant.monthlySpend.toLocaleString()}</span>
                        <span style={{ color: 'var(--text-muted)' }}>{tenant.quotaUsedPercent}%</span>
                      </div>
                      <div style={{ width: '130px', height: '5px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                        <div 
                          style={{ 
                            width: `${tenant.quotaUsedPercent}%`, 
                            height: '100%', 
                            backgroundColor: tenant.quotaUsedPercent > 90 ? 'var(--danger)' : 'var(--primary)' 
                          }} 
                        />
                      </div>
                    </td>
                    <td>
                      <span className="mono-text" style={{ fontWeight: 600 }}>
                        {tenant.zkProofCount.toLocaleString()}
                      </span>
                    </td>
                    <td className="mono-text" style={{ fontSize: '0.75rem' }}>
                      {tenant.createdAt}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                          onClick={() => setSelectedTenantDetails(tenant)}
                        >
                          Enclave Info
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ 
                            padding: '0.25rem 0.5rem', 
                            fontSize: '0.75rem',
                            color: tenant.status === 'Active' ? 'var(--danger)' : 'var(--success)'
                          }}
                          onClick={() => {
                            onToggleStatus(tenant.id);
                            onShowToast(`Status updated for ${tenant.name}`);
                          }}
                        >
                          {tenant.status === 'Active' ? 'Suspend' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Info */}
        <div className="pagination-bar">
          <div>
            Showing <strong>{filteredTenants.length}</strong> of <strong>{tenants.length}</strong> total tenants
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Each tenant operates within an isolated cryptographic boundary
          </div>
        </div>
      </div>

      {/* Add Tenant Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Provision New Enterprise Tenant"
        footer={
          <>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              form="add-tenant-form" 
              className="btn btn-primary"
            >
              Provision Enclave & Add
            </button>
          </>
        }
      >
        <form id="add-tenant-form" onSubmit={handleCreateTenant} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label>Legal Entity / Tenant Name *</label>
            <input 
              type="text" 
              placeholder="e.g. Acme Financial Technologies"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            {formErrors.name && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{formErrors.name}</span>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Tenant Identifier Code *</label>
              <input 
                type="text" 
                placeholder="e.g. ACME-FIN"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                style={{ textTransform: 'uppercase' }}
              />
              {formErrors.code && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{formErrors.code}</span>}
            </div>

            <div className="form-group">
              <label>Billing Plan</label>
              <select 
                value={formData.plan}
                onChange={(e) => setFormData({ ...formData, plan: e.target.value as BillingPlan })}
              >
                <option value="Enterprise">Enterprise ($40k+/mo)</option>
                <option value="Growth">Growth ($12k+/mo)</option>
                <option value="Starter">Starter ($2k+/mo)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Cryptographic Isolation Zone</label>
            <select 
              value={formData.isolationZone}
              onChange={(e) => setFormData({ ...formData, isolationZone: e.target.value as IsolationZone })}
            >
              <option value="Dedicated Enclave">Dedicated Hardware Enclave (Intel SGX / AWS Nitro)</option>
              <option value="Zero-Knowledge Vault">Zero-Knowledge Vault (BLS12-381 SNARK)</option>
              <option value="Standard Virtual VPC">Standard Virtual VPC (Multi-Tenant Ring)</option>
            </select>
            <span className="form-hint">Zero-knowledge proofs isolate ledger balance operations across all tenants.</span>
          </div>

          <div className="form-group">
            <label>Security & Compliance Contact Email *</label>
            <input 
              type="email" 
              placeholder="security-ops@acmefin.com"
              value={formData.contactEmail}
              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
            />
            {formErrors.contactEmail && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{formErrors.contactEmail}</span>}
          </div>

          <div style={{
            padding: '0.75rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-surface-alt)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)'
          }}>
            <strong>Frontend Simulation Notice:</strong> Submitting will instantly add this tenant to your active session state and simulate cryptographic enclave provisioning.
          </div>
        </form>
      </Modal>

      {/* Tenant Enclave Detail Modal */}
      {selectedTenantDetails && (
        <Modal
          isOpen={!!selectedTenantDetails}
          onClose={() => setSelectedTenantDetails(null)}
          title={`Enclave Details: ${selectedTenantDetails.name}`}
          footer={
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => setSelectedTenantDetails(null)}
            >
              Close
            </button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tenant ID</div>
                <div className="mono-text" style={{ fontWeight: 600, color: 'var(--text-main)', marginTop: '2px' }}>
                  {selectedTenantDetails.id}
                </div>
              </div>
              <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Current Status</div>
                <div style={{ marginTop: '2px' }}>
                  <Badge status={selectedTenantDetails.status} />
                </div>
              </div>
            </div>

            <div style={{ padding: '0.75rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.5rem' }}>Cryptographic Isolation Parameters</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Isolation Enclave:</span>
                  <span style={{ fontWeight: 600 }}>{selectedTenantDetails.isolationZone}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>ZK Proofs Validated:</span>
                  <span className="mono-text">{selectedTenantDetails.zkProofCount.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>API Requests Cycle:</span>
                  <span className="mono-text">{selectedTenantDetails.apiRequests.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Compliance Contact:</span>
                  <span className="mono-text">{selectedTenantDetails.contactEmail}</span>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
