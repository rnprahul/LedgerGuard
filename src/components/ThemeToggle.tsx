import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
  variant?: 'icon' | 'pill';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  showLabel = false,
  variant = 'icon'
}) => {
  const { theme, isDark, toggleTheme } = useTheme();

  if (variant === 'pill') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`theme-toggle-pill ${className}`}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        title={`Currently ${theme} mode. Click to switch to ${isDark ? 'light' : 'dark'} mode.`}
      >
        <span className={`theme-toggle-indicator ${isDark ? 'dark' : 'light'}`}>
          {isDark ? <Moon size={14} /> : <Sun size={14} />}
        </span>
        <span className="theme-toggle-label">
          {isDark ? 'Dark Mode' : 'Light Mode'}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`icon-button theme-toggle-btn ${className}`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
    >
      {isDark ? (
        <Sun size={18} className="theme-icon sun-icon" />
      ) : (
        <Moon size={18} className="theme-icon moon-icon" />
      )}
      {showLabel && (
        <span style={{ fontSize: '0.8125rem', fontWeight: 600, marginLeft: '0.4rem' }}>
          {isDark ? 'Light' : 'Dark'}
        </span>
      )}
    </button>
  );
};
