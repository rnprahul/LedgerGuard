import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

interface DemoDisclaimerProps {
  message?: string;
  variant?: 'banner' | 'pill' | 'card';
}

export const DemoDisclaimer: React.FC<DemoDisclaimerProps> = ({ 
  message = "SIMULATED ENVIRONMENT: All financial, tenant, and cryptographic records shown are synthetic demo models for frontend architecture validation.",
  variant = 'banner' 
}) => {
  if (variant === 'pill') {
    return (
      <span className="demo-pill-badge" title="This interface renders mock data for architecture preview">
        <span className="demo-pill-dot" />
        DEMO MODE
      </span>
    );
  }

  if (variant === 'card') {
    return (
      <div style={{
        padding: '0.65rem 0.85rem',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--bg-surface-alt)',
        border: '1px dashed var(--border-strong)',
        fontSize: '0.75rem',
        color: 'var(--text-secondary)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <Info size={14} color="var(--primary)" style={{ flexShrink: 0 }} />
        <span>Simulated UI demonstration data. Not live cryptographic or ledger state.</span>
      </div>
    );
  }

  return (
    <div className="demo-banner">
      <div className="demo-banner-content">
        <ShieldCheck size={18} color="var(--primary)" style={{ flexShrink: 0 }} />
        <div>
          <span className="demo-banner-tag">Simulation Mode</span>
          <span style={{ marginLeft: '0.5rem' }}>{message}</span>
        </div>
      </div>
    </div>
  );
};
