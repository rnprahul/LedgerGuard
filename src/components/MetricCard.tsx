import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  subtitle?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  trend,
  icon: Icon,
  iconColor = '#2563eb',
  iconBg = '#eff6ff',
  subtitle
}) => {
  return (
    <div className="metric-card">
      <div className="metric-card-top">
        <span className="metric-label">{label}</span>
        <div className="metric-icon-wrap" style={{ backgroundColor: iconBg, color: iconColor }}>
          <Icon size={20} />
        </div>
      </div>
      
      <div className="metric-value">{value}</div>

      <div className="metric-footer">
        {trend && (
          <span className={`trend-badge ${trend.isPositive ? 'positive' : 'neutral'}`}>
            {trend.value}
          </span>
        )}
        <span>{subtitle || (trend?.label ? trend.label : 'Simulated demo state')}</span>
        <span style={{
          marginLeft: 'auto',
          fontSize: '0.625rem',
          fontWeight: 700,
          color: 'var(--text-muted)',
          backgroundColor: 'var(--bg-surface-alt)',
          padding: '0.1rem 0.35rem',
          borderRadius: '4px',
          border: '1px solid var(--border-subtle)'
        }}>
          DEMO
        </span>
      </div>
    </div>
  );
};
