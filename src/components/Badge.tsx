import React from 'react';

interface BadgeProps {
  status: string;
  variant?: 'status' | 'outline' | 'subtle';
  children?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ status, variant = 'status', children }) => {
  const normalizedClass = status.toLowerCase().replace(/\s+/g, '-');

  if (variant === 'outline') {
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.15rem 0.5rem',
        borderRadius: 'var(--radius-full)',
        fontSize: '0.75rem',
        fontWeight: 600,
        border: '1px solid var(--border-strong)',
        color: 'var(--text-secondary)'
      }}>
        {children || status}
      </span>
    );
  }

  return (
    <span className={`status-badge ${normalizedClass}`}>
      <span style={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        backgroundColor: 'currentColor'
      }} />
      {children || status}
    </span>
  );
};
