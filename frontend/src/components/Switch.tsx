'use client';

/**
 * Switch Component
 * Toggle switch for boolean settings
 * @module components/Switch
 * @version 1.0.0
 */

import React from 'react';

// Types
interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  label?: string;
  description?: string;
  color?: 'purple' | 'green' | 'blue' | 'pink';
  loading?: boolean;
  className?: string;
}

// Size configurations
const sizeConfig = {
  sm: {
    track: 'w-8 h-4',
    thumb: 'w-3 h-3',
    translate: 'translate-x-4',
    label: 'text-sm',
  },
  md: {
    track: 'w-11 h-6',
    thumb: 'w-5 h-5',
    translate: 'translate-x-5',
    label: 'text-base',
  },
  lg: {
    track: 'w-14 h-7',
    thumb: 'w-6 h-6',
    translate: 'translate-x-7',
    label: 'text-lg',
  },
};

// Color configurations
const colorConfig = {
  purple: 'bg-purple-500',
  green: 'bg-green-500',
  blue: 'bg-blue-500',
  pink: 'bg-pink-500',
};

/**
 * Main Switch Component
 */
export function Switch({
  checked,
  onChange,
  size = 'md',
  disabled = false,
  label,
  description,
  color = 'purple',
  loading = false,
  className = '',
}: SwitchProps) {
  const config = sizeConfig[size];
  const activeColor = colorConfig[color];

  const handleClick = () => {
    if (!disabled && !loading) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div className={`flex items-start gap-3 ${className}`}>
      {/* Switch control */}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled || loading}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={`
          relative inline-flex shrink-0 rounded-full
          transition-colors duration-200 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-purple-500/50
          ${config.track}
          ${checked ? activeColor : 'bg-zinc-600'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        {/* Thumb */}
        <span
          className={`
            pointer-events-none inline-block rounded-full
            bg-white shadow-lg transform ring-0
            transition duration-200 ease-in-out
            ${config.thumb}
            ${checked ? config.translate : 'translate-x-0.5'}
            ${loading ? 'animate-pulse' : ''}
          `}
          style={{ marginTop: '0.5px' }}
        >
          {loading && (
            <span className="absolute inset-0 flex items-center justify-center">
              <svg
                className="animate-spin h-3 w-3 text-purple-500"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            </span>
          )}
        </span>
      </button>

      {/* Label and description */}
      {(label || description) && (
        <div className="flex-1">
          {label && (
            <span
              className={`
                ${config.label} font-medium
                ${disabled ? 'text-zinc-500' : 'text-white'}
              `}
            >
              {label}
            </span>
          )}
          {description && (
            <p className="text-sm text-zinc-400 mt-0.5">
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Switch Group Component
 */
interface SwitchGroupProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function SwitchGroup({ title, children, className = '' }: SwitchGroupProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      )}
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
}

/**
 * Setting Switch - Switch styled for settings page
 */
interface SettingSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  badge?: string;
  className?: string;
}

export function SettingSwitch({
  checked,
  onChange,
  label,
  description,
  icon,
  disabled = false,
  badge,
  className = '',
}: SettingSwitchProps) {
  return (
    <div
      className={`
        flex items-center justify-between p-4
        bg-zinc-800/50 rounded-xl border border-zinc-700/50
        ${disabled ? 'opacity-50' : ''}
        ${className}
      `}
    >
      <div className="flex items-start gap-3">
        {icon && (
          <div className="p-2 bg-zinc-700/50 rounded-lg text-zinc-400">
            {icon}
          </div>
        )}
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-white">{label}</span>
            {badge && (
              <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                {badge}
              </span>
            )}
          </div>
          {description && (
            <p className="text-sm text-zinc-400 mt-1">{description}</p>
          )}
        </div>
      </div>

      <Switch
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
    </div>
  );
}

/**
 * Theme Switch - Dark/Light mode toggle
 */
interface ThemeSwitchProps {
  isDark: boolean;
  onChange: (isDark: boolean) => void;
  className?: string;
}

export function ThemeSwitch({ isDark, onChange, className = '' }: ThemeSwitchProps) {
  return (
    <button
      onClick={() => onChange(!isDark)}
      className={`
        relative w-16 h-8 rounded-full p-1
        bg-gradient-to-r transition-all duration-300
        ${isDark
          ? 'from-indigo-600 to-purple-600'
          : 'from-yellow-400 to-orange-400'
        }
        ${className}
      `}
    >
      {/* Sun icon */}
      <span
        className={`
          absolute left-1.5 top-1.5 w-5 h-5 text-yellow-300
          transition-opacity duration-200
          ${isDark ? 'opacity-0' : 'opacity-100'}
        `}
      >
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
            clipRule="evenodd"
          />
        </svg>
      </span>

      {/* Moon icon */}
      <span
        className={`
          absolute right-1.5 top-1.5 w-5 h-5 text-white
          transition-opacity duration-200
          ${isDark ? 'opacity-100' : 'opacity-0'}
        `}
      >
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      </span>

      {/* Thumb */}
      <span
        className={`
          block w-6 h-6 rounded-full bg-white shadow-lg
          transform transition-transform duration-200
          ${isDark ? 'translate-x-8' : 'translate-x-0'}
        `}
      />
    </button>
  );
}

/**
 * Notification Switch
 */
interface NotificationSwitchProps {
  type: 'email' | 'push' | 'sms';
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  className?: string;
}

const notificationIcons: Record<NotificationSwitchProps['type'], React.ReactNode> = {
  email: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  push: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
  sms: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  ),
};

const notificationLabels: Record<NotificationSwitchProps['type'], { label: string; description: string }> = {
  email: { label: 'Email Notifications', description: 'Receive updates via email' },
  push: { label: 'Push Notifications', description: 'Get instant browser alerts' },
  sms: { label: 'SMS Notifications', description: 'Receive text messages' },
};

export function NotificationSwitch({ type, enabled, onChange, className = '' }: NotificationSwitchProps) {
  const { label, description } = notificationLabels[type];
  const icon = notificationIcons[type];

  return (
    <SettingSwitch
      checked={enabled}
      onChange={onChange}
      label={label}
      description={description}
      icon={icon}
      className={className}
    />
  );
}

export default Switch;
