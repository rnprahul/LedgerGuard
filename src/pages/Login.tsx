import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Database, 
  KeyRound, 
  AlertCircle, 
  Sparkles,
  Server
} from 'lucide-react';
import { loginRequest, setStoredToken, fetchTenantContext } from '../services/api';
import { AuthSession } from '../types';

interface LoginProps {
  onLoginSuccess: (session: AuthSession) => void;
}

interface DemoAccount {
  label: string;
  email: string;
  password: string;
  tenantId: string;
  role: string;
  dbName: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    label: 'Acme Financial Corp',
    email: 'admin@acme.ledgerguard.io',
    password: 'Acme@2026!',
    tenantId: 'tenant_acme',
    role: 'TENANT_ADMIN',
    dbName: 'ledgerguard_tenant_acme',
  },
  {
    label: 'Globex Clearing House',
    email: 'admin@globex.ledgerguard.io',
    password: 'Globex@2026!',
    tenantId: 'tenant_globex',
    role: 'TENANT_ADMIN',
    dbName: 'ledgerguard_tenant_globex',
  },
  {
    label: 'LedgerGuard Root Enclave',
    email: 'secops@ledgerguard.io',
    password: 'Guard@2026!',
    tenantId: 'tenant_platform',
    role: 'PLATFORM_ADMIN',
    dbName: 'ledgerguard_tenant_platform',
  },
];

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedDemoIndex, setSelectedDemoIndex] = useState<number | null>(null);

  const handleSelectDemoAccount = (acc: DemoAccount, index: number) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setSelectedDemoIndex(index);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage('Please enter your enterprise email address.');
      return;
    }
    if (!trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your enclave password.');
      return;
    }

    setLoading(true);

    try {
      // 1. Authenticate against live backend
      const { token, user } = await loginRequest(trimmedEmail, password);
      setStoredToken(token);

      // 2. Resolve live tenant isolated database context
      let tenantContext;
      try {
        tenantContext = await fetchTenantContext();
      } catch (ctxErr) {
        console.warn('Tenant context retrieval note:', ctxErr);
      }

      onLoginSuccess({
        token,
        user,
        tenantContext,
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#090e1a',
      color: '#f8fafc',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Subtle Background Circuit Glows */}
      <div style={{
        position: 'absolute',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, rgba(9,14,26,0) 70%)',
        top: '-150px',
        left: '-150px',
        pointerEvents: 'none'
      }} />

      <div style={{
        position: 'absolute',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.1) 0%, rgba(9,14,26,0) 70%)',
        bottom: '-100px',
        right: '-100px',
        pointerEvents: 'none'
      }} />

      <div style={{
        width: '100%',
        maxWidth: '480px',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Branding Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '54px',
            height: '54px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
            boxShadow: '0 8px 24px rgba(37, 99, 235, 0.4)',
            marginBottom: '1rem'
          }}>
            <ShieldCheck size={32} color="#ffffff" strokeWidth={2.4} />
          </div>

          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: '#ffffff',
            margin: 0
          }}>
            LedgerGuard
          </h1>
          <p style={{
            fontSize: '0.875rem',
            color: '#94a3b8',
            marginTop: '0.35rem',
            letterSpacing: '0.01em'
          }}>
            Secure Billing. Isolated Data. Trusted Transactions.
          </p>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            backgroundColor: 'rgba(37, 99, 235, 0.15)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '999px',
            padding: '0.25rem 0.75rem',
            fontSize: '0.6875rem',
            fontWeight: 600,
            color: '#60a5fa',
            marginTop: '0.75rem'
          }}>
            <Server size={12} />
            <span>LIVE BACKEND GATEWAY CONNECTED (PORT 5000)</span>
          </div>
        </div>

        {/* Card Container */}
        <div style={{
          backgroundColor: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)'
        }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
              Enterprise Enclave Sign In
            </h2>
            <p style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.2rem' }}>
              Authenticate with your tenant credentials to mount your isolated database.
            </p>
          </div>

          {/* Error Message Box */}
          {errorMessage && (
            <div style={{
              backgroundColor: 'rgba(220, 38, 38, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.6rem',
              fontSize: '0.8125rem',
              color: '#fca5a5'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div className="form-group">
              <label style={{ color: '#cbd5e1', fontSize: '0.8125rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Mail size={14} color="#60a5fa" />
                <span>Enterprise Identity Email</span>
              </label>
              <input
                type="email"
                placeholder="admin@acme.ledgerguard.io"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setSelectedDemoIndex(null);
                }}
                disabled={loading}
                style={{
                  backgroundColor: '#1e293b',
                  borderColor: '#334155',
                  color: '#f8fafc',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px'
                }}
              />
            </div>

            <div className="form-group">
              <label style={{ color: '#cbd5e1', fontSize: '0.8125rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Lock size={14} color="#60a5fa" />
                <span>Enclave Access Password</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setSelectedDemoIndex(null);
                  }}
                  disabled={loading}
                  style={{
                    width: '100%',
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    color: '#f8fafc',
                    padding: '0.65rem 2.5rem 0.65rem 0.85rem',
                    borderRadius: '8px'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '0.9375rem',
                marginTop: '0.5rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)'
              }}
            >
              {loading ? (
                <>
                  <span className="status-dot-pulse" style={{ backgroundColor: '#ffffff' }} />
                  <span>Mounting Tenant Enclave...</span>
                </>
              ) : (
                <>
                  <span>Sign In & Mount Enclave</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Panel */}
          <div style={{
            marginTop: '1.75rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid #1e293b'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.75rem'
            }}>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#94a3b8',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}>
                <Sparkles size={13} color="#60a5fa" />
                Quick Demo Enclave Accounts
              </span>
              <span style={{ fontSize: '0.6875rem', color: '#64748b' }}>Click to autofill</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {DEMO_ACCOUNTS.map((acc, index) => {
                const isSelected = selectedDemoIndex === index;
                return (
                  <button
                    key={acc.tenantId}
                    type="button"
                    onClick={() => handleSelectDemoAccount(acc, index)}
                    style={{
                      textAlign: 'left',
                      padding: '0.65rem 0.75rem',
                      borderRadius: '8px',
                      backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.2)' : 'rgba(30, 41, 59, 0.5)',
                      border: `1px solid ${isSelected ? '#3b82f6' : '#1e293b'}`,
                      transition: 'all 150ms ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        color: isSelected ? '#60a5fa' : '#f1f5f9'
                      }}>
                        {acc.label}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: '#94a3b8', fontFamily: 'var(--font-mono)', marginTop: '1px' }}>
                        {acc.email}
                      </div>
                    </div>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      gap: '2px'
                    }}>
                      <span style={{
                        fontSize: '0.625rem',
                        fontWeight: 600,
                        color: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        padding: '0.1rem 0.35rem',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.2rem'
                      }}>
                        <Database size={10} />
                        {acc.dbName}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Security Footer Note */}
        <div style={{
          textAlign: 'center',
          marginTop: '1.5rem',
          fontSize: '0.75rem',
          color: '#64748b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.4rem'
        }}>
          <KeyRound size={13} color="#475569" />
          <span>Each authenticated account connects to a distinct, dynamically isolated MongoDB database.</span>
        </div>
      </div>
    </div>
  );
};
