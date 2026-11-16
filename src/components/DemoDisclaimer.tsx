import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

interface DemoDisclaimerProps {
  message?: string;
  variant?: 'banner' | 'pill' | 'card';
}

export const DemoDisclaimer: React.FC<DemoDisclaimerProps> = ({ 
  message = "WEEK 1 LIVE ARCHITECTURE: JWT Authentication and isolated tenant databases are LIVE. Transaction batches and ZK-proof charts remain simulated until Weeks 2–3.",
  variant = 'banner' 
}) => {
  if (variant === 'pill') {
    return (
      <span className="demo-pill-badge" title="Live auth & isolated DB with simulated billing engine">
        <span className="demo-pill-dot" style={{ backgroundColor: '#10b981' }} />
        LIVE DB / DEMO ENGINE
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
        <span>Authentication and database isolation are live. Ledger data is simulated for Week 1 demonstration.</span>
      </div>
    );
  }

  return (
    <div className="demo-banner">
      <div className="demo-banner-content">
        <ShieldCheck size={18} color="var(--primary)" style={{ flexShrink: 0 }} />
        <div>
          <span className="demo-banner-tag" style={{ backgroundColor: '#ecfdf5', color: '#059669' }}>
            Live Tenant DB
          </span>
          <span style={{ marginLeft: '0.5rem' }}>{message}</span>
        </div>
      </div>
    </div>
  );
};
