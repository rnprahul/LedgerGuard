import React from 'react';
import { 
  Building2, 
  DollarSign, 
  ArrowLeftRight, 
  ShieldCheck, 
  TrendingUp, 
  ExternalLink,
  Lock
} from 'lucide-react';
import { MetricCard } from '../components/MetricCard';
import { DemoDisclaimer } from '../components/DemoDisclaimer';
import { Badge } from '../components/Badge';
import { Tenant, Transaction, NavigationPage } from '../types';
import { REVENUE_CHART_DATA, TRANSACTION_ACTIVITY_DATA } from '../data/demoData';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  LineChart, 
  Line 
} from 'recharts';

interface OverviewProps {
  tenants: Tenant[];
  transactions: Transaction[];
  onNavigate: (page: NavigationPage) => void;
  onSelectTransaction: (tx: Transaction) => void;
}

export const Overview: React.FC<OverviewProps> = ({
  tenants,
  transactions,
  onNavigate,
  onSelectTransaction
}) => {
  const totalRevenue = tenants.reduce((acc, t) => acc + t.monthlySpend, 0);
  const activeTenantsCount = tenants.filter(t => t.status === 'Active').length;
  const recentTransactions = transactions.slice(0, 5);

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>Overview Dashboard</h1>
          <p>Multi-Tenant Zero-Knowledge Billing and Settlement Architecture</p>
        </div>
        <div className="page-actions">
          <button 
            type="button" 
            className="btn btn-secondary btn-sm"
            onClick={() => onNavigate('security')}
          >
            <ShieldCheck size={16} />
            Security Health: Optimal
          </button>
          <button 
            type="button" 
            className="btn btn-primary btn-sm"
            onClick={() => onNavigate('tenants')}
          >
            <Building2 size={16} />
            Manage Tenants
          </button>
        </div>
      </div>

      {/* Demo Disclaimer */}
      <DemoDisclaimer message="SIMULATED DEMO DATA: All ledger balances, ZK-proof verifications, and tenant volumes shown below are generated for architecture demonstration." />

      {/* 4 Summary Cards */}
      <div className="metrics-grid">
        <MetricCard
          label="Total Tenants"
          value={`${activeTenantsCount} Active`}
          trend={{ value: '+2 new', isPositive: true, label: 'this billing cycle' }}
          icon={Building2}
          iconColor="#2563eb"
          iconBg="#eff6ff"
          subtitle="14 Isolated enclaves"
        />

        <MetricCard
          label="Total Revenue (Monthly)"
          value={`$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          trend={{ value: '+14.8%', isPositive: true, label: 'vs last month' }}
          icon={DollarSign}
          iconColor="#059669"
          iconBg="#ecfdf5"
          subtitle="Simulated billing ledger"
        />

        <MetricCard
          label="Total Transactions"
          value="84,219"
          trend={{ value: '99.98%', isPositive: true, label: 'verification rate' }}
          icon={ArrowLeftRight}
          iconColor="#7c3aed"
          iconBg="#f5f3ff"
          subtitle="Zero-Knowledge verified"
        />

        <MetricCard
          label="System Integrity"
          value="100.0%"
          trend={{ value: '0 leaks', isPositive: true, label: 'cross-tenant checks' }}
          icon={ShieldCheck}
          iconColor="#0284c7"
          iconBg="#f0f9ff"
          subtitle="Hardware enclave active"
        />
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Revenue Overview Chart */}
        <div className="card col-8">
          <div className="card-header">
            <div>
              <div className="card-title">
                <TrendingUp size={18} color="var(--primary)" />
                <span>Revenue Overview</span>
              </div>
              <div className="card-subtitle">
                Monthly aggregated tenant billing volume (Enterprise vs Growth tiers)
              </div>
            </div>
            <span className="demo-pill-badge">
              <span className="demo-pill-dot" />
              DEMO DATA
            </span>
          </div>

          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_CHART_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEnterprise" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip 
                  formatter={(val: number) => [`$${val.toLocaleString()}`, '']}
                  contentStyle={{ 
                    backgroundColor: 'var(--bg-surface)', 
                    borderRadius: '8px', 
                    border: '1px solid var(--border-subtle)', 
                    color: 'var(--text-main)',
                    boxShadow: 'var(--shadow-md)' 
                  }}
                  itemStyle={{ color: 'var(--text-main)' }}
                />
                <Area type="monotone" dataKey="enterpriseRevenue" name="Enterprise Tier" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorEnterprise)" />
                <Area type="monotone" dataKey="growthRevenue" name="Growth Tier" stroke="#0284c7" strokeWidth={2} fillOpacity={1} fill="url(#colorGrowth)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Transaction Activity Chart */}
        <div className="card col-4">
          <div className="card-header">
            <div>
              <div className="card-title">
                <ArrowLeftRight size={18} color="#7c3aed" />
                <span>Transaction Activity</span>
              </div>
              <div className="card-subtitle">24-hour verification velocity (UTC)</div>
            </div>
            <span className="demo-pill-badge">
              <span className="demo-pill-dot" />
              DEMO DATA
            </span>
          </div>

          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={TRANSACTION_ACTIVITY_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip 
                  formatter={(val: number, name: string) => [val.toLocaleString(), name === 'volume' ? 'Transactions' : name]}
                  contentStyle={{ 
                    backgroundColor: 'var(--bg-surface)', 
                    borderRadius: '8px', 
                    border: '1px solid var(--border-subtle)', 
                    color: 'var(--text-main)',
                    boxShadow: 'var(--shadow-md)' 
                  }}
                  itemStyle={{ color: 'var(--text-main)' }}
                />
                <Line type="monotone" dataKey="volume" name="Verified Volume" stroke="#7c3aed" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Split Section: Recent Transactions & Tenant Activity */}
      <div className="charts-grid">
        {/* Recent Transactions Table */}
        <div className="card col-8">
          <div className="card-header">
            <div>
              <div className="card-title">Recent Transactions</div>
              <div className="card-subtitle">Real-time ledger events validated with simulated ZK-proofs</div>
            </div>
            <button 
              type="button" 
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigate('transactions')}
            >
              <span>View All</span>
              <ExternalLink size={14} />
            </button>
          </div>

          <div className="table-container" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Tenant</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Timestamp</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((tx) => (
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
                        ${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td>
                      <Badge status={tx.status} />
                    </td>
                    <td className="mono-text" style={{ fontSize: '0.75rem' }}>
                      {tx.timestamp}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        type="button" 
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                        onClick={() => onSelectTransaction(tx)}
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tenant Activity Section */}
        <div className="card col-4">
          <div className="card-header">
            <div>
              <div className="card-title">Tenant Activity</div>
              <div className="card-subtitle">Quota consumption & isolation status</div>
            </div>
            <button 
              type="button" 
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigate('tenants')}
            >
              <span>All Tenants</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {tenants.slice(0, 4).map((tenant) => (
              <div 
                key={tenant.id} 
                style={{ 
                  padding: '0.75rem', 
                  borderRadius: 'var(--radius-md)', 
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-surface-alt)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{tenant.name}</span>
                  <Badge status={tenant.status} />
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  <span>Usage Quota: {tenant.quotaUsedPercent}%</span>
                  <span className="mono-text">${tenant.monthlySpend.toLocaleString()}</span>
                </div>

                {/* Progress Bar */}
                <div style={{ 
                  width: '100%', 
                  height: '6px', 
                  backgroundColor: '#e2e8f0', 
                  borderRadius: '999px',
                  overflow: 'hidden' 
                }}>
                  <div 
                    style={{ 
                      width: `${tenant.quotaUsedPercent}%`, 
                      height: '100%', 
                      backgroundColor: tenant.quotaUsedPercent > 90 ? 'var(--danger)' : tenant.quotaUsedPercent > 70 ? 'var(--warning)' : 'var(--primary)',
                      borderRadius: '999px' 
                    }} 
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.45rem', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                  <Lock size={12} color="var(--primary)" />
                  <span>{tenant.isolationZone}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
