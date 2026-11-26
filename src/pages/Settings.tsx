import React, { useState } from 'react';
import { 
  User, 
  Shield, 
  Sliders, 
  Key, 
  Save, 
  Copy, 
  Check,
  Sun,
  Moon
} from 'lucide-react';
import { UserProfile } from '../types';
import { DemoDisclaimer } from '../components/DemoDisclaimer';
import { useTheme } from '../context/ThemeContext';

interface SettingsProps {
  userProfile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  onShowToast: (msg: string) => void;
}

export const Settings: React.FC<SettingsProps> = ({
  userProfile,
  onUpdateProfile,
  onShowToast
}) => {
  const [profileForm, setProfileForm] = useState<UserProfile>(userProfile);
  const [currency, setCurrency] = useState('USD');
  const [settlementCycle, setSettlementCycle] = useState('Daily Batch');
  const [circuitOptimization, setCircuitOptimization] = useState('High Throughput (Groth16)');
  const [alertThreshold, setAlertThreshold] = useState('85%');
  const [copiedKey, setCopiedKey] = useState(false);
  const { theme, isDark, setTheme } = useTheme();

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(profileForm);
    onShowToast('Settings and preferences successfully saved to local session!');
  };

  const handleCopyMockKey = () => {
    navigator.clipboard.writeText('lg_live_sec_zk_99847192837192834710293847');
    setCopiedKey(true);
    onShowToast('Simulated API Key copied to clipboard');
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>Platform Settings</h1>
          <p>Configure user security profile, zero-knowledge verification rules, and billing engine presets</p>
        </div>
        <div className="page-actions">
          <button 
            type="submit" 
            form="settings-form" 
            className="btn btn-primary"
          >
            <Save size={16} />
            <span>Save Preferences</span>
          </button>
        </div>
      </div>

      <DemoDisclaimer message="SIMULATED CONFIGURATION: Preference changes persist in local React state for your current dashboard evaluation session." />

      <form id="settings-form" onSubmit={handleSavePreferences} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Appearance & Color Theme Card */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                {isDark ? <Moon size={18} color="var(--primary)" /> : <Sun size={18} color="#d97706" />}
                <span>Appearance & Color Theme</span>
              </div>
              <div className="card-subtitle">Select your preferred interface display mode for dashboard views and audit workflows</div>
            </div>
            <span className="demo-pill-badge" style={{ textTransform: 'uppercase' }}>
              ACTIVE: {theme}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            {/* Light Mode Option */}
            <div 
              onClick={() => {
                setTheme('light');
                onShowToast('Switched to Light Theme');
              }}
              style={{
                cursor: 'pointer',
                padding: '1.25rem',
                borderRadius: 'var(--radius-lg)',
                border: !isDark ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                backgroundColor: !isDark ? 'var(--primary-light)' : 'var(--bg-surface-alt)',
                transition: 'all var(--transition-fast)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.6rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-main)' }}>
                  <Sun size={18} color="#d97706" />
                  <span>Light Theme</span>
                </div>
                {!isDark && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 700 }}>
                    <Check size={14} /> Active
                  </span>
                )}
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                High-contrast daytime enterprise interface with clean white cards and navy accents.
              </p>
            </div>

            {/* Dark Mode Option */}
            <div 
              onClick={() => {
                setTheme('dark');
                onShowToast('Switched to Dark Theme');
              }}
              style={{
                cursor: 'pointer',
                padding: '1.25rem',
                borderRadius: 'var(--radius-lg)',
                border: isDark ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                backgroundColor: isDark ? 'var(--primary-light)' : 'var(--bg-surface-alt)',
                transition: 'all var(--transition-fast)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.6rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-main)' }}>
                  <Moon size={18} color="#60a5fa" />
                  <span>Dark Theme</span>
                </div>
                {isDark && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 700 }}>
                    <Check size={14} /> Active
                  </span>
                )}
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                Deep obsidian and slate dark palette optimized for continuous monitoring and audit workflows.
              </p>
            </div>
          </div>
        </div>

        {/* User Profile Card */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <User size={18} color="var(--primary)" />
                <span>Security Officer Profile</span>
              </div>
              <div className="card-subtitle">Personal credentials and cryptographic verification clearance</div>
            </div>
            <span className="demo-pill-badge">ADMIN</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label>Full Name</label>
              <input 
                type="text" 
                value={profileForm.name} 
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} 
              />
            </div>

            <div className="form-group">
              <label>Internal Security Email</label>
              <input 
                type="email" 
                value={profileForm.email} 
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} 
              />
            </div>

            <div className="form-group">
              <label>Role</label>
              <input 
                type="text" 
                value={profileForm.role} 
                onChange={(e) => setProfileForm({ ...profileForm, role: e.target.value })} 
              />
            </div>

            <div className="form-group">
              <label>Department</label>
              <input 
                type="text" 
                value={profileForm.department} 
                onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })} 
              />
            </div>
          </div>

          <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: 'var(--bg-surface-alt)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <Shield size={14} color="var(--primary)" />
              <span>Assigned Security Clearance: <strong>{profileForm.securityClearance}</strong></span>
            </div>
          </div>
        </div>

        {/* Billing Engine Parameters */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <Sliders size={18} color="var(--primary)" />
                <span>Billing Engine Parameters</span>
              </div>
              <div className="card-subtitle">Zero-knowledge proof scheduling and settlement parameters</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label>Default Settlement Frequency</label>
              <select value={settlementCycle} onChange={(e) => setSettlementCycle(e.target.value)}>
                <option value="Instant Micro-Settlement">Instant Micro-Settlement (Continuous)</option>
                <option value="Daily Batch">Daily Batch (Midnight UTC Reconcile)</option>
                <option value="Weekly Aggregation">Weekly Aggregation</option>
              </select>
            </div>

            <div className="form-group">
              <label>ZK-Proof Circuit Optimization</label>
              <select value={circuitOptimization} onChange={(e) => setCircuitOptimization(e.target.value)}>
                <option value="High Throughput (Groth16)">High Throughput (Groth16 - 80ms verification)</option>
                <option value="Universal Setup (PLONK)">Universal Setup (PLONK - No trusted ceremony)</option>
                <option value="Recursive Aggregation (Halo2)">Recursive Aggregation (Halo2)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Tenant Quota Warning Threshold</label>
              <select value={alertThreshold} onChange={(e) => setAlertThreshold(e.target.value)}>
                <option value="75%">75% Quota Used</option>
                <option value="85%">85% Quota Used</option>
                <option value="95%">95% Quota Used</option>
              </select>
            </div>

            <div className="form-group">
              <label>Default Currency Unit</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                <option value="USD">USD ($ - United States Dollar)</option>
                <option value="EUR">EUR (€ - Euro)</option>
                <option value="GBP">GBP (£ - British Pound)</option>
              </select>
            </div>
          </div>
        </div>

        {/* API Credentials Placeholder */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <Key size={18} color="var(--primary)" />
                <span>API Keys & Verification Public Keys</span>
              </div>
              <div className="card-subtitle">Placeholder credentials for external tenant billing integration</div>
            </div>
            <span className="demo-pill-badge">READ ONLY SIMULATION</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label>Public Verifier Key (BLS12-381 G1)</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  readOnly 
                  value="zk_pub_key_0x8f4bc921e03a1107d6a524b0c98f5a2b1d3e8f4c" 
                  className="mono-text"
                  style={{ backgroundColor: 'var(--bg-surface-alt)' }}
                />
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm"
                  onClick={handleCopyMockKey}
                >
                  {copiedKey ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedKey ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Webhook Event Verification Secret</label>
              <input 
                type="text" 
                readOnly 
                value="whsec_demo_9821a_zk_isolated_mock_secret_key" 
                className="mono-text"
                style={{ backgroundColor: 'var(--bg-surface-alt)' }}
              />
              <span className="form-hint">Backend integration and secret management will be configured in subsequent development phases.</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
