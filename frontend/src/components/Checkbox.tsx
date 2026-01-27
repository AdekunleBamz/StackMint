'use client';

/**
 * Checkbox Component
 * Checkbox for multiple selections
 * @module components/Checkbox
 * @version 1.0.0
 */

import React, { createContext, useContext, useCallback } from 'react';

// Types
interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  indeterminate?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
}

// Size configurations
const sizeConfig = {
  sm: {
    box: 'w-4 h-4',
    icon: 'w-3 h-3',
    label: 'text-sm',
  },
  md: {
    box: 'w-5 h-5',
    icon: 'w-3.5 h-3.5',
    label: 'text-base',
  },
  lg: {
    box: 'w-6 h-6',
    icon: 'w-4 h-4',
    label: 'text-lg',
  },
};

/**
 * Main Checkbox Component
 */
export function Checkbox({
  checked,
  onChange,
  label,
  description,
  size = 'md',
  indeterminate = false,
  disabled = false,
  error,
  className = '',
}: CheckboxProps) {
  const config = sizeConfig[size];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!disabled) {
      onChange(e.target.checked);
    }
  };

  return (
    <div className={className}>
      <label
        className={`
          flex items-start gap-3 cursor-pointer
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {/* Hidden native checkbox */}
        <input
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          className="sr-only"
        />

        {/* Custom checkbox */}
        <span
          className={`
            ${config.box} shrink-0 rounded
            flex items-center justify-center
            border-2 transition-all
            ${checked || indeterminate
              ? 'bg-purple-500 border-purple-500'
              : 'border-zinc-600 bg-transparent'
            }
            ${!disabled && !checked && !indeterminate ? 'hover:border-zinc-500' : ''}
            ${error ? 'border-red-500' : ''}
          `}
        >
          {indeterminate ? (
            <span className={`${config.icon} text-white`}>
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </span>
          ) : checked ? (
            <span className={`${config.icon} text-white`}>
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </span>
          ) : null}
        </span>

        {/* Label and description */}
        {(label || description) && (
          <div>
            {label && (
              <span className={`${config.label} text-white block`}>
                {label}
              </span>
            )}
            {description && (
              <span className="text-sm text-zinc-400 block mt-0.5">
                {description}
              </span>
            )}
          </div>
        )}
      </label>

      {error && (
        <p className="mt-1 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}

/**
 * Checkbox Group Context
 */
interface CheckboxGroupContextType {
  values: string[];
  onChange: (value: string, checked: boolean) => void;
  size: CheckboxProps['size'];
}

const CheckboxGroupContext = createContext<CheckboxGroupContextType | null>(null);

function useCheckboxGroupContext() {
  return useContext(CheckboxGroupContext);
}

/**
 * Checkbox Group Component
 */
interface CheckboxGroupProps {
  values: string[];
  onChange: (values: string[]) => void;
  label?: string;
  size?: CheckboxProps['size'];
  orientation?: 'horizontal' | 'vertical';
  error?: string;
  children: React.ReactNode;
  className?: string;
}

export function CheckboxGroup({
  values,
  onChange,
  label,
  size = 'md',
  orientation = 'vertical',
  error,
  children,
  className = '',
}: CheckboxGroupProps) {
  const handleChange = useCallback(
    (value: string, checked: boolean) => {
      if (checked) {
        onChange([...values, value]);
      } else {
        onChange(values.filter((v) => v !== value));
      }
    },
    [values, onChange]
  );

  return (
    <CheckboxGroupContext.Provider value={{ values, onChange: handleChange, size }}>
      <fieldset className={className}>
        {label && (
          <legend className="text-white font-medium mb-3">{label}</legend>
        )}

        <div
          className={`
            flex gap-3
            ${orientation === 'vertical' ? 'flex-col' : 'flex-wrap'}
          `}
        >
          {children}
        </div>

        {error && (
          <p className="mt-2 text-sm text-red-400">{error}</p>
        )}
      </fieldset>
    </CheckboxGroupContext.Provider>
  );
}

/**
 * Checkbox Group Item
 */
interface CheckboxItemProps {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export function CheckboxItem({ value, label, description, disabled }: CheckboxItemProps) {
  const context = useCheckboxGroupContext();

  if (!context) {
    throw new Error('CheckboxItem must be used within CheckboxGroup');
  }

  const { values, onChange, size } = context;
  const isChecked = values.includes(value);

  return (
    <Checkbox
      checked={isChecked}
      onChange={(checked) => onChange(value, checked)}
      label={label}
      description={description}
      size={size}
      disabled={disabled}
    />
  );
}

/**
 * Checkbox Card Component
 */
interface CheckboxCardProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export function CheckboxCard({
  checked,
  onChange,
  label,
  description,
  icon,
  disabled = false,
  className = '',
}: CheckboxCardProps) {
  return (
    <label
      className={`
        block p-4 rounded-xl cursor-pointer
        border-2 transition-all
        ${checked
          ? 'border-purple-500 bg-purple-500/10'
          : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => !disabled && onChange(e.target.checked)}
        disabled={disabled}
        className="sr-only"
      />

      <div className="flex items-start gap-3">
        {icon && (
          <div className={`
            p-2 rounded-lg
            ${checked ? 'bg-purple-500 text-white' : 'bg-zinc-700 text-zinc-400'}
          `}>
            {icon}
          </div>
        )}

        <div className="flex-1">
          <span className="text-white font-medium block">{label}</span>
          {description && (
            <span className="text-sm text-zinc-400 block mt-1">{description}</span>
          )}
        </div>

        {/* Checkbox indicator */}
        <span
          className={`
            w-5 h-5 rounded flex items-center justify-center
            border-2 transition-all shrink-0
            ${checked
              ? 'bg-purple-500 border-purple-500'
              : 'border-zinc-600'
            }
          `}
        >
          {checked && (
            <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </span>
      </div>
    </label>
  );
}

/**
 * Select All Checkbox
 */
interface SelectAllCheckboxProps {
  items: string[];
  selectedItems: string[];
  onChange: (items: string[]) => void;
  label?: string;
  className?: string;
}

export function SelectAllCheckbox({
  items,
  selectedItems,
  onChange,
  label = 'Select All',
  className = '',
}: SelectAllCheckboxProps) {
  const allSelected = items.length > 0 && items.every((item) => selectedItems.includes(item));
  const someSelected = items.some((item) => selectedItems.includes(item)) && !allSelected;

  const handleChange = (checked: boolean) => {
    if (checked) {
      onChange([...new Set([...selectedItems, ...items])]);
    } else {
      onChange(selectedItems.filter((item) => !items.includes(item)));
    }
  };

  return (
    <Checkbox
      checked={allSelected}
      indeterminate={someSelected}
      onChange={handleChange}
      label={label}
      className={className}
    />
  );
}

/**
 * Terms Checkbox
 */
interface TermsCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
  className?: string;
}

export function TermsCheckbox({ checked, onChange, error, className = '' }: TermsCheckboxProps) {
  return (
    <div className={className}>
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />

        <span
          className={`
            w-5 h-5 shrink-0 rounded flex items-center justify-center
            border-2 transition-all
            ${checked ? 'bg-purple-500 border-purple-500' : 'border-zinc-600'}
            ${error ? 'border-red-500' : ''}
          `}
        >
          {checked && (
            <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </span>

        <span className="text-sm text-zinc-400">
          I agree to the{' '}
          <a href="/terms" className="text-purple-400 hover:text-purple-300">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" className="text-purple-400 hover:text-purple-300">
            Privacy Policy
          </a>
        </span>
      </label>

      {error && (
        <p className="mt-1 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}

export default Checkbox;
