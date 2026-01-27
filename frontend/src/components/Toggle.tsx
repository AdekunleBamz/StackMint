'use client';

/**
 * Toggle/Switch Component
 * Accessible toggle switch with various sizes and states
 * @module components/Toggle
 * @version 1.0.0
 */

import { memo, useId } from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'purple' | 'green' | 'blue' | 'red';
  labelPosition?: 'left' | 'right';
  className?: string;
}

function ToggleComponent({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  size = 'md',
  color = 'purple',
  labelPosition = 'right',
  className = '',
}: ToggleProps) {
  const id = useId();

  const sizeClasses = {
    sm: {
      track: 'w-8 h-5',
      thumb: 'w-3.5 h-3.5',
      translate: 'translate-x-3.5',
    },
    md: {
      track: 'w-11 h-6',
      thumb: 'w-5 h-5',
      translate: 'translate-x-5',
    },
    lg: {
      track: 'w-14 h-7',
      thumb: 'w-6 h-6',
      translate: 'translate-x-7',
    },
  };

  const colorClasses = {
    purple: 'bg-purple-600 shadow-purple-500/25',
    green: 'bg-green-600 shadow-green-500/25',
    blue: 'bg-blue-600 shadow-blue-500/25',
    red: 'bg-red-600 shadow-red-500/25',
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!disabled) {
        onChange(!checked);
      }
    }
  };

  const toggle = (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      onKeyDown={handleKeyDown}
      className={`
        relative inline-flex items-center rounded-full
        transition-colors duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-2 focus:ring-offset-gray-900
        ${sizeClasses[size].track}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${checked ? colorClasses[color] : 'bg-gray-700'}
      `}
    >
      <span
        className={`
          inline-block rounded-full bg-white shadow-lg
          transform transition-transform duration-200 ease-in-out
          ${sizeClasses[size].thumb}
          ${checked ? sizeClasses[size].translate : 'translate-x-0.5'}
        `}
      >
        {/* Optional icons inside thumb */}
        {size !== 'sm' && (
          <span className="absolute inset-0 flex items-center justify-center">
            {checked ? (
              <svg 
                className={`text-${color}-600 ${size === 'lg' ? 'w-3 h-3' : 'w-2.5 h-2.5'}`}
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg 
                className={`text-gray-400 ${size === 'lg' ? 'w-3 h-3' : 'w-2.5 h-2.5'}`}
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            )}
          </span>
        )}
      </span>
    </button>
  );

  // Without label, return just the toggle
  if (!label) {
    return toggle;
  }

  // With label
  return (
    <div className={`flex items-start gap-3 ${labelPosition === 'left' ? 'flex-row-reverse' : ''} ${className}`}>
      {toggle}
      <div className="flex-1">
        <label
          htmlFor={id}
          className={`block text-sm font-medium text-gray-200 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
        >
          {label}
        </label>
        {description && (
          <p className="text-sm text-gray-500 mt-0.5">{description}</p>
        )}
      </div>
    </div>
  );
}

/**
 * Toggle Group Component
 * Group of toggles with title
 */
interface ToggleGroupProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function ToggleGroup({ title, children, className = '' }: ToggleGroupProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {title && (
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
          {title}
        </h3>
      )}
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
}

export default memo(ToggleComponent);
