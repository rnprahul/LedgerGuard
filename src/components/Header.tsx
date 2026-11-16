import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  Menu, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Info,
  ChevronDown,
  User,
  LogOut
} from 'lucide-react';
import { NotificationItem, UserProfile, NavigationPage } from '../types';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  notifications: NotificationItem[];
  userProfile: UserProfile;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onNavigate: (page: NavigationPage) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileMenu,
  notifications,
  userProfile,
  searchQuery,
  onSearchChange,
  onNavigate
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotifIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={16} color="var(--success)" />;
      case 'warning':
        return <AlertTriangle size={16} color="var(--warning)" />;
      case 'security':
        return <ShieldCheck size={16} color="var(--primary)" />;
      default:
        return <Info size={16} color="var(--info)" />;
    }
  };

  return (
    <header className="top-header">
      <div className="header-left">
        <button 
          type="button" 
          className="mobile-menu-toggle" 
          onClick={onOpenMobileMenu}
          aria-label="Open sidebar menu"
        >
          <Menu size={20} />
        </button>

        <div className="header-search">
          <Search size={16} className="header-search-icon" />
          <input 
            type="text" 
            placeholder="Search tenants, transactions, ledger hash..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <span className="header-search-shortcut">⌘K</span>
        </div>
      </div>

      <div className="header-right">
        {/* Simulation / Demo Environment Pill */}
        <div className="demo-pill-badge" title="Frontend preview with local state mock engine">
          <span className="demo-pill-dot" />
          <span>SIMULATION MODE</span>
        </div>

        {/* Notifications Dropdown */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button 
            type="button" 
            className="icon-button" 
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="View notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && <span className="icon-badge-dot" />}
          </button>

          {showNotifications && (
            <div className="notifications-dropdown">
              <div className="notifications-header">
                <span>System Notifications</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {unreadCount} unread
                </span>
              </div>
              <div className="notifications-list">
                {notifications.map((item) => (
                  <div key={item.id} className={`notification-item ${!item.read ? 'unread' : ''}`}>
                    <div style={{ marginTop: '2px' }}>
                      {getNotifIcon(item.type)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {item.message}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {item.timestamp}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ 
                padding: '0.6rem', 
                textAlign: 'center', 
                borderTop: '1px solid var(--border-subtle)', 
                backgroundColor: 'var(--bg-surface-alt)' 
              }}>
                <button 
                  type="button" 
                  style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}
                  onClick={() => {
                    setShowNotifications(false);
                    onNavigate('security');
                  }}
                >
                  View Full Audit Logs →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div style={{ position: 'relative' }} ref={profileRef}>
          <button 
            type="button" 
            className="user-profile-btn"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <div className="user-avatar">
              {userProfile.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="user-info">
              <span className="user-name">{userProfile.name}</span>
              <span className="user-role">{userProfile.role}</span>
            </div>
            <ChevronDown size={14} color="var(--text-muted)" />
          </button>

          {showProfileMenu && (
            <div className="notifications-dropdown" style={{ width: '220px', right: 0 }}>
              <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {userProfile.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {userProfile.email}
                </div>
                <div style={{ 
                  marginTop: '0.4rem', 
                  fontSize: '0.6875rem', 
                  color: 'var(--primary)',
                  fontWeight: 600,
                  backgroundColor: 'var(--primary-light)',
                  padding: '0.15rem 0.4rem',
                  borderRadius: '4px',
                  display: 'inline-block'
                }}>
                  {userProfile.securityClearance}
                </div>
              </div>

              <div style={{ padding: '0.4rem' }}>
                <button 
                  type="button" 
                  className="nav-item" 
                  style={{ color: 'var(--text-secondary)' }}
                  onClick={() => {
                    setShowProfileMenu(false);
                    onNavigate('settings');
                  }}
                >
                  <User size={15} />
                  <span>Profile & Preferences</span>
                </button>
                <button 
                  type="button" 
                  className="nav-item" 
                  style={{ color: 'var(--text-secondary)' }}
                  onClick={() => {
                    setShowProfileMenu(false);
                    onNavigate('security');
                  }}
                >
                  <ShieldCheck size={15} />
                  <span>Security Status</span>
                </button>
              </div>

              <div style={{ padding: '0.4rem', borderTop: '1px solid var(--border-subtle)' }}>
                <button 
                  type="button" 
                  className="nav-item" 
                  style={{ color: 'var(--danger)' }}
                  onClick={() => {
                    setShowProfileMenu(false);
                    alert("Demo session reset: All mock state is running in local memory.");
                  }}
                >
                  <LogOut size={15} />
                  <span>Reset Demo Session</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
