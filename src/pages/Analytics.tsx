import React, { useState } from 'react';
import { 
  TrendingUp, 
  PieChart as PieChartIcon, 
  BarChart3, 
  Layers
} from 'lucide-react';
import { DemoDisclaimer } from '../components/DemoDisclaimer';
import { 
  REVENUE_CHART_DATA, 
  MONTHLY_USAGE_DATA, 
  TENANT_EXPENDITURE_DATA 
} from '../data/demoData';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid 
} from 'recharts';

export const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'30D' | '90D' | 'YTD'>('30D');

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>Analytics & Financial Intelligence</h1>
          <p>Multi-tenant expenditure distribution, usage telemetry, and zero-knowledge compute trends</p>
        </div>
        <div className="page-actions">
          <div style={{ 
            display: 'inline-flex', 
            backgroundColor: 'var(--bg-surface)', 
            border: '1px solid var(--border-subtle)', 
            borderRadius: 'var(--radius-md)', 
            padding: '2px' 
          }}>
            {(['30D', '90D', 'YTD'] as const).map((range) => (
              <button
                key={range}
                type="button"
                style={{
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: timeRange === range ? 'var(--primary)' : 'transparent',
                  color: timeRange === range ? '#ffffff' : 'var(--text-secondary)'
                }}
                onClick={() => setTimeRange(range)}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      <DemoDisclaimer message="ANALYTICS PROTOTYPE: Recharts visualization populated with realistic multi-tenant enterprise billing datasets." />

      {/* Top Metric Highlights */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-label">Average Transaction Value</span>
            <span className="demo-pill-badge" style={{ fontSize: '0.625rem' }}>SIMULATED</span>
          </div>
          <div className="metric-value">$6,482.10</div>
          <div className="metric-footer">
            <span className="trend-badge positive">+8.2%</span>
            <span>growth over previous quarter</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-label">Proof Computation Latency</span>
            <span className="demo-pill-badge" style={{ fontSize: '0.625rem' }}>SIMULATED</span>
          </div>
          <div className="metric-value">82.4 ms</div>
          <div className="metric-footer">
            <span className="trend-badge positive">-14.1%</span>
            <span>reduction with Groth16 Turbo</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-label">Monthly ZK Proofs Generated</span>
            <span className="demo-pill-badge" style={{ fontSize: '0.625rem' }}>SIMULATED</span>
          </div>
          <div className="metric-value">3.4M</div>
          <div className="metric-footer">
            <span className="trend-badge positive">+19.5%</span>
            <span>month-over-month volume</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-label">Enclave Storage Egress</span>
            <span className="demo-pill-badge" style={{ fontSize: '0.625rem' }}>SIMULATED</span>
          </div>
          <div className="metric-value">33.1 TB</div>
          <div className="metric-footer">
            <span className="trend-badge neutral">99.99%</span>
            <span>zero-leak data isolation</span>
          </div>
        </div>
      </div>

      {/* Charts Row 1: Revenue Trends & Tenant-wise Expenditure */}
      <div className="charts-grid">
        {/* Revenue Trends */}
        <div className="card col-8">
          <div className="card-header">
            <div>
              <div className="card-title">
                <TrendingUp size={18} color="var(--primary)" />
                <span>Revenue Trends by Subscription Tier</span>
              </div>
              <div className="card-subtitle">
                Aggregate billing volume across Enterprise Enclaves vs Growth Virtual VPCs
              </div>
            </div>
            <span className="demo-pill-badge">DEMO DATA</span>
          </div>

          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_CHART_DATA} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="anEnterprise" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="anGrowth" x1="0" y1="0" x2="0" y2="1">
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
                <Legend iconType="circle" wrapperStyle={{ fontSize: '0.8125rem', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="enterpriseRevenue" name="Enterprise Enclave Billing" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#anEnterprise)" />
                <Area type="monotone" dataKey="growthRevenue" name="Growth Tier Billing" stroke="#0284c7" strokeWidth={2.5} fillOpacity={1} fill="url(#anGrowth)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tenant-wise Expenditure Donut */}
        <div className="card col-4">
          <div className="card-header">
            <div>
              <div className="card-title">
                <PieChartIcon size={18} color="#2563eb" />
                <span>Tenant Expenditure</span>
              </div>
              <div className="card-subtitle">Distribution of current billing cycle</div>
            </div>
            <span className="demo-pill-badge">DEMO DATA</span>
          </div>

          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={TENANT_EXPENDITURE_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {TENANT_EXPENDITURE_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val: number) => [`$${val.toLocaleString()}`, 'Monthly Spend']}
                  contentStyle={{ 
                    backgroundColor: 'var(--bg-surface)', 
                    borderRadius: '8px', 
                    border: '1px solid var(--border-subtle)', 
                    color: 'var(--text-main)',
                    boxShadow: 'var(--shadow-md)' 
                  }}
                  itemStyle={{ color: 'var(--text-main)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
            {TENANT_EXPENDITURE_DATA.slice(0, 4).map((item) => (
              <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: item.color }} />
                <span style={{ color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2: Monthly Usage & Transaction Statistics */}
      <div className="charts-grid">
        {/* Monthly Usage (Compute Hours vs Proofs) */}
        <div className="card col-6">
          <div className="card-header">
            <div>
              <div className="card-title">
                <BarChart3 size={18} color="var(--primary)" />
                <span>Monthly Enclave Usage & Compute Hours</span>
              </div>
              <div className="card-subtitle">Allocated isolated execution time (Hours)</div>
            </div>
            <span className="demo-pill-badge">DEMO DATA</span>
          </div>

          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONTHLY_USAGE_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip 
                  formatter={(val: number) => [val.toLocaleString(), 'Compute Hours']}
                  contentStyle={{ 
                    backgroundColor: 'var(--bg-surface)', 
                    borderRadius: '8px', 
                    border: '1px solid var(--border-subtle)', 
                    color: 'var(--text-main)',
                    boxShadow: 'var(--shadow-md)' 
                  }}
                  itemStyle={{ color: 'var(--text-main)' }}
                />
                <Bar dataKey="computeHours" name="Compute Hours" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Transaction Statistics (Bandwidth vs ZK Proofs) */}
        <div className="card col-6">
          <div className="card-header">
            <div>
              <div className="card-title">
                <Layers size={18} color="#7c3aed" />
                <span>Zero-Knowledge Proof Generations (Millions)</span>
              </div>
              <div className="card-subtitle">Monthly circuit execution throughput</div>
            </div>
            <span className="demo-pill-badge">DEMO DATA</span>
          </div>

          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONTHLY_USAGE_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip 
                  formatter={(val: number) => [`${val}M`, 'Proofs Generated']}
                  contentStyle={{ 
                    backgroundColor: 'var(--bg-surface)', 
                    borderRadius: '8px', 
                    border: '1px solid var(--border-subtle)', 
                    color: 'var(--text-main)',
                    boxShadow: 'var(--shadow-md)' 
                  }}
                  itemStyle={{ color: 'var(--text-main)' }}
                />
                <Bar dataKey="zkProofsM" name="ZK Proofs (M)" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
