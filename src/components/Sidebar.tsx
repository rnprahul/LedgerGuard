import React from 'react';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  Building2, 
  BookOpen, 
  ArrowLeftRight, 
  LineChart, 
  ShieldAlert, 
  Settings, 
  ChevronLeft, 
  ChevronRight
} from 'lucide-react';
import { NavigationPage } from '../types';

interface SidebarProps {
  currentPage: NavigationPage;
  onNavigate: (page: NavigationPage) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile
}) => {
  const navItems = [
    { id: 'overview' as NavigationPage, label: 'Overview', icon: LayoutDashboard },
    { id: 'tenants' as NavigationPage, label: 'Tenants', icon: Building2 },
    { id: 'ledger' as NavigationPage, label: 'Billing Ledger', icon: BookOpen },
    { id: 'transactions' as NavigationPage, label: 'Transactions', icon: ArrowLeftRight },
    { id: 'analytics' as NavigationPage, label: 'Analytics', icon: LineChart },
    { id: 'security' as NavigationPage, label: 'Security & Audit', icon: ShieldAlert },
    { id: 'settings' as NavigationPage, label: 'Settings', icon: Settings },
  ];

  const handleItemClick = (page: NavigationPage) => {
    onNavigate(page);
    onCloseMobile();
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="sidebar-brand" title="LedgerGuard – Secure Billing. Isolated Data. Trusted Transactions.">
          <div className="sidebar-logo-icon">
            <ShieldCheck size={22} strokeWidth={2.4} />
          </div>
          {!collapsed && (
            <div className="sidebar-brand-text">
              <span className="sidebar-brand-name">LedgerGuard</span>
              <span className="sidebar-brand-badge">Zero-Knowledge Billing</span>
            </div>
          )}
        </div>

        <button 
          type="button" 
          className="sidebar-collapse-btn" 
          onClick={onToggleCollapse}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        {!collapsed && <div className="nav-section-title">Billing Engine Engine</div>}
        
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => handleItemClick(item.id)}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={19} className="nav-item-icon" />
              {!collapsed && <span className="nav-item-text">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* System Status Footer */}
      {!collapsed ? (
        <div className="sidebar-footer">
          <div className="sidebar-status-box">
            <div className="status-dot-pulse" />
            <div className="sidebar-status-info">
              <div className="sidebar-status-title">ZK-Enclaves Active</div>
              <div className="sidebar-status-sub">Zero-Knowledge Verifier v2.4</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="sidebar-footer" style={{ display: 'flex', justifyContent: 'center' }}>
          <div className="status-dot-pulse" title="Zero-Knowledge Isolation: Active" />
        </div>
      )}
    </aside>
  );
};
