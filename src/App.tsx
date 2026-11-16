import React, { useState, useEffect } from 'react';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Overview } from './pages/Overview';
import { Tenants } from './pages/Tenants';
import { BillingLedger } from './pages/BillingLedger';
import { Transactions } from './pages/Transactions';
import { Analytics } from './pages/Analytics';
import { SecurityAudit } from './pages/SecurityAudit';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { 
  NavigationPage, 
  Tenant, 
  Transaction, 
  UserProfile, 
  NotificationItem,
  AuthSession
} from './types';
import { 
  INITIAL_TENANTS, 
  INITIAL_TRANSACTIONS, 
  INITIAL_LEDGER_ENTRIES, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_USER_PROFILE 
} from './data/demoData';
import { 
  getStoredToken, 
  clearStoredToken, 
  fetchCurrentUser, 
  fetchTenantContext, 
  onUnauthorized 
} from './services/api';
import { CheckCircle2, ShieldCheck } from 'lucide-react';

export const App: React.FC = () => {
  const [authSession, setAuthSession] = useState<AuthSession | null>(null);
  const [isVerifyingSession, setIsVerifyingSession] = useState(true);
  const [currentPage, setCurrentPage] = useState<NavigationPage>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [tenants, setTenants] = useState<Tenant[]>(INITIAL_TENANTS);
  const [transactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [ledgerEntries] = useState(INITIAL_LEDGER_ENTRIES);
  const [notifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_USER_PROFILE);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Toast System
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((current) => (current === message ? null : current));
    }, 3500);
  };

  // Restore and verify live session on initial load
  useEffect(() => {
    const unsub = onUnauthorized(() => {
      setAuthSession(null);
      showToast('Enclave session expired. Please sign in again.');
    });

    const verifyExistingToken = async () => {
      const token = getStoredToken();
      if (!token) {
        setIsVerifyingSession(false);
        return;
      }

      try {
        const { user } = await fetchCurrentUser();
        let tenantContext;
        try {
          tenantContext = await fetchTenantContext();
        } catch (ctxErr) {
          console.warn('Could not resolve tenant DB context:', ctxErr);
        }

        setAuthSession({ token, user, tenantContext });
      } catch (err) {
        clearStoredToken();
        setAuthSession(null);
      } finally {
        setIsVerifyingSession(false);
      }
    };

    verifyExistingToken();
    return () => unsub();
  }, []);

  const handleLoginSuccess = (session: AuthSession) => {
    setAuthSession(session);
    showToast(`Authenticated as ${session.user.name} (${session.user.tenantName})`);
  };

  const handleSignOut = () => {
    clearStoredToken();
    setAuthSession(null);
    setCurrentPage('overview');
    showToast('Signed out of tenant enclave.');
  };

  const handleAddTenant = (newTenant: Tenant) => {
    setTenants(prev => [newTenant, ...prev]);
  };

  const handleToggleTenantStatus = (tenantId: string) => {
    setTenants(prev => prev.map(t => {
      if (t.id === tenantId) {
        const nextStatus = t.status === 'Active' ? 'Suspended' : 'Active';
        return { ...t, status: nextStatus };
      }
      return t;
    }));
  };

  const handleInspectTransaction = (tx: Transaction | null) => {
    setSelectedTransaction(tx);
    if (tx && currentPage !== 'transactions') {
      setCurrentPage('transactions');
    }
  };

  // Compute live user profile from authenticated session
  const activeUserProfile: UserProfile = authSession ? {
    name: authSession.user.name,
    email: authSession.user.email,
    role: authSession.user.role === 'PLATFORM_ADMIN' ? 'Platform Security Officer' : `${authSession.user.tenantName} Admin`,
    department: `${authSession.user.tenantName} Enclave`,
    securityClearance: authSession.user.role === 'PLATFORM_ADMIN' ? 'Level 4 (Root Clearance)' : 'Level 3 (Isolated Tenant Enclave)',
  } : userProfile;

  // Session verification loading splash
  if (isVerifyingSession) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#090e1a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '1rem',
        color: '#f8fafc'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(37, 99, 235, 0.4)'
        }}>
          <ShieldCheck size={28} color="#ffffff" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#94a3b8' }}>
          <span className="status-dot-pulse" style={{ backgroundColor: '#3b82f6' }} />
          <span>Connecting to LedgerGuard Gateway & Enclaves...</span>
        </div>
      </div>
    );
  }

  // If unauthenticated, render enterprise Login Portal
  if (!authSession) {
    return (
      <>
        <Login onLoginSuccess={handleLoginSuccess} />
        {toastMessage && (
          <div className="toast-container">
            <div className="toast">
              <CheckCircle2 size={18} color="#10b981" />
              <span>{toastMessage}</span>
            </div>
          </div>
        )}
      </>
    );
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'overview':
        return (
          <Overview
            tenants={tenants}
            transactions={transactions}
            onNavigate={setCurrentPage}
            onSelectTransaction={handleInspectTransaction}
          />
        );
      case 'tenants':
        return (
          <Tenants
            tenants={tenants}
            onAddTenant={handleAddTenant}
            onToggleStatus={handleToggleTenantStatus}
            onShowToast={showToast}
          />
        );
      case 'ledger':
        return (
          <BillingLedger
            entries={ledgerEntries}
            onShowToast={showToast}
          />
        );
      case 'transactions':
        return (
          <Transactions
            transactions={transactions}
            selectedTransaction={selectedTransaction}
            onSelectTransaction={setSelectedTransaction}
            onShowToast={showToast}
          />
        );
      case 'analytics':
        return <Analytics />;
      case 'security':
        return <SecurityAudit onShowToast={showToast} />;
      case 'settings':
        return (
          <Settings
            userProfile={activeUserProfile}
            onUpdateProfile={setUserProfile}
            onShowToast={showToast}
          />
        );
      default:
        return (
          <Overview
            tenants={tenants}
            transactions={transactions}
            onNavigate={setCurrentPage}
            onSelectTransaction={handleInspectTransaction}
          />
        );
    }
  };

  return (
    <DashboardLayout
      currentPage={currentPage}
      onNavigate={setCurrentPage}
      notifications={notifications}
      userProfile={activeUserProfile}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      isolatedDbName={authSession.tenantContext?.databaseName}
      tenantName={authSession.user.tenantName}
      onSignOut={handleSignOut}
    >
      {renderCurrentPage()}

      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="toast-container">
          <div className="toast">
            <CheckCircle2 size={18} color="#10b981" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default App;
