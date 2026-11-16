import React, { useState } from 'react';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Overview } from './pages/Overview';
import { Tenants } from './pages/Tenants';
import { BillingLedger } from './pages/BillingLedger';
import { Transactions } from './pages/Transactions';
import { Analytics } from './pages/Analytics';
import { SecurityAudit } from './pages/SecurityAudit';
import { Settings } from './pages/Settings';
import { 
  NavigationPage, 
  Tenant, 
  Transaction, 
  UserProfile, 
  NotificationItem 
} from './types';
import { 
  INITIAL_TENANTS, 
  INITIAL_TRANSACTIONS, 
  INITIAL_LEDGER_ENTRIES, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_USER_PROFILE 
} from './data/demoData';
import { CheckCircle2 } from 'lucide-react';

export const App: React.FC = () => {
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
            userProfile={userProfile}
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
      userProfile={userProfile}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
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
