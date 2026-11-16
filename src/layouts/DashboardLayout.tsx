import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { NavigationPage, NotificationItem, UserProfile } from '../types';

interface DashboardLayoutProps {
  currentPage: NavigationPage;
  onNavigate: (page: NavigationPage) => void;
  notifications: NotificationItem[];
  userProfile: UserProfile;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  currentPage,
  onNavigate,
  notifications,
  userProfile,
  searchQuery,
  onSearchChange,
  children
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-layout">
      {/* Mobile Backdrop */}
      <div 
        className={`mobile-overlay ${mobileOpen ? 'active' : ''}`} 
        onClick={() => setMobileOpen(false)} 
      />

      {/* Dark Navy Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={onNavigate}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className={`main-wrapper ${collapsed ? 'expanded' : ''}`}>
        <Header
          onOpenMobileMenu={() => setMobileOpen(true)}
          notifications={notifications}
          userProfile={userProfile}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          onNavigate={onNavigate}
        />

        <main className="page-container">
          {children}
        </main>
      </div>
    </div>
  );
};
