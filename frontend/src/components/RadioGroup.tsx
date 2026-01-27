'use client';

/**
 * RadioGroup Component
 * Radio button selection groups
 * @module components/RadioGroup
 * @version 1.0.0
 */

import React, { createContext, useContext } from 'react';

// Types
interface RadioOption<T = string> {
  value: T;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  badge?: string;
}

interface RadioGroupProps<T = string> {
  value: T;
  onChange: (value: T) => void;
  options: RadioOption<T>[];
  name: string;
  label?: string;
  orientation?: 'horizontal' | 'vertical';
  variant?: 'default' | 'cards' | 'buttons';
  size?: 'sm' | 'md' | 'lg';
  error?: string;
  className?: string;
}

// Context
interface RadioContextType<T = string> {
  name: string;
  value: T;
  onChange: (value: T) => void;
  variant: RadioGroupProps['variant'];
  size: RadioGroupProps['size'];
}

const RadioContext = createContext<RadioContextType | null>(null);

function useRadioContext<T>() {
  const context = useContext(RadioContext);
  if (!context) {
    throw new Error('Radio components must be used within RadioGroup');
  }
  return context as RadioContextType<T>;
}

// Size configurations
const sizeConfig = {
  sm: {
    radio: 'w-4 h-4',
    dot: 'w-2 h-2',
    label: 'text-sm',
    card: 'p-3',
    button: 'px-3 py-1.5 text-sm',
  },
  md: {
    radio: 'w-5 h-5',
    dot: 'w-2.5 h-2.5',
    label: 'text-base',
    card: 'p-4',
    button: 'px-4 py-2 text-sm',
  },
  lg: {
    radio: 'w-6 h-6',
    dot: 'w-3 h-3',
    label: 'text-lg',
    card: 'p-5',
    button: 'px-5 py-2.5 text-base',
  },
};

/**
 * Main RadioGroup Component
 */
export function RadioGroup<T extends string>({
  value,
  onChange,
  options,
  name,
  label,
  orientation = 'vertical',
  variant = 'default',
  size = 'md',
  error,
  className = '',
}: RadioGroupProps<T>) {
  const config = sizeConfig[size];

  return (
    <RadioContext.Provider value={{ name, value, onChange, variant, size } as RadioContextType}>
      <fieldset className={className}>
        {label && (
          <legend className="text-white font-medium mb-3">{label}</legend>
        )}

        <div
          className={`
            ${variant === 'default' ? 'space-y-2' : ''}
            ${variant === 'cards' ? `grid gap-3 ${orientation === 'horizontal' ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-1'}` : ''}
            ${variant === 'buttons' ? `flex flex-wrap gap-2 ${orientation === 'vertical' ? 'flex-col' : ''}` : ''}
          `}
        >
          {options.map((option) => (
            <RadioItem key={String(option.value)} option={option} />
          ))}
        </div>

        {error && (
          <p className="mt-2 text-sm text-red-400">{error}</p>
        )}
      </fieldset>
    </RadioContext.Provider>
  );
}

/**
 * Radio Item Component
 */
interface RadioItemProps<T = string> {
  option: RadioOption<T>;
}

function RadioItem<T extends string>({ option }: RadioItemProps<T>) {
  const { name, value, onChange, variant, size } = useRadioContext<T>();
  const config = sizeConfig[size || 'md'];
  const isSelected = value === option.value;
  const isDisabled = option.disabled;

  const handleChange = () => {
    if (!isDisabled) {
      onChange(option.value);
    }
  };

  // Button variant
  if (variant === 'buttons') {
    return (
      <button
        type="button"
        onClick={handleChange}
        disabled={isDisabled}
        className={`
          ${config.button} rounded-lg font-medium transition-all
          ${isSelected
            ? 'bg-purple-500 text-white'
            : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
          }
          ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        {option.label}
      </button>
    );
  }

  // Card variant
  if (variant === 'cards') {
    return (
      <label
        className={`
          ${config.card} rounded-xl cursor-pointer
          border-2 transition-all
          ${isSelected
            ? 'border-purple-500 bg-purple-500/10'
            : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600'
          }
          ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          type="radio"
          name={name}
          value={String(option.value)}
          checked={isSelected}
          onChange={handleChange}
          disabled={isDisabled}
          className="sr-only"
        />

        <div className="flex items-start gap-3">
          {option.icon && (
            <div className={`
              p-2 rounded-lg
              ${isSelected ? 'bg-purple-500 text-white' : 'bg-zinc-700 text-zinc-400'}
            `}>
              {option.icon}
            </div>
          )}

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className={`${config.label} font-medium text-white`}>
                {option.label}
              </span>
              {option.badge && (
                <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                  {option.badge}
                </span>
              )}
            </div>
            {option.description && (
              <p className="text-sm text-zinc-400 mt-1">{option.description}</p>
            )}
          </div>

          {/* Selection indicator */}
          <div
            className={`
              ${config.radio} rounded-full border-2 flex items-center justify-center
              transition-colors shrink-0
              ${isSelected
                ? 'border-purple-500 bg-purple-500'
                : 'border-zinc-600'
              }
            `}
          >
            {isSelected && (
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        </div>
      </label>
    );
  }

  // Default variant
  return (
    <label
      className={`
        flex items-center gap-3 cursor-pointer
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input
        type="radio"
        name={name}
        value={String(option.value)}
        checked={isSelected}
        onChange={handleChange}
        disabled={isDisabled}
        className="sr-only"
      />

      {/* Radio circle */}
      <span
        className={`
          ${config.radio} rounded-full border-2 flex items-center justify-center
          transition-colors
          ${isSelected
            ? 'border-purple-500'
            : 'border-zinc-600 group-hover:border-zinc-500'
          }
        `}
      >
        <span
          className={`
            ${config.dot} rounded-full bg-purple-500
            transition-transform
            ${isSelected ? 'scale-100' : 'scale-0'}
          `}
        />
      </span>

      {/* Label */}
      <div>
        <span className={`${config.label} text-white`}>
          {option.label}
        </span>
        {option.description && (
          <p className="text-sm text-zinc-400">{option.description}</p>
        )}
      </div>
    </label>
  );
}

/**
 * Price Type Radio Group - Specific for NFT pricing
 */
interface PriceTypeRadioProps {
  value: 'fixed' | 'auction';
  onChange: (value: 'fixed' | 'auction') => void;
  className?: string;
}

export function PriceTypeRadio({ value, onChange, className = '' }: PriceTypeRadioProps) {
  const options: RadioOption<'fixed' | 'auction'>[] = [
    {
      value: 'fixed',
      label: 'Fixed Price',
      description: 'Set a specific price for your NFT',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
    },
    {
      value: 'auction',
      label: 'Timed Auction',
      description: 'Let buyers bid on your NFT',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      badge: 'Popular',
    },
  ];

  return (
    <RadioGroup
      value={value}
      onChange={onChange}
      options={options}
      name="priceType"
      variant="cards"
      orientation="horizontal"
      className={className}
    />
  );
}

/**
 * Sort Option Radio Group
 */
interface SortRadioProps {
  value: string;
  onChange: (value: string) => void;
  options?: RadioOption<string>[];
  className?: string;
}

export function SortRadio({ value, onChange, options, className = '' }: SortRadioProps) {
  const defaultOptions: RadioOption<string>[] = [
    { value: 'recent', label: 'Recently Listed' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'ending', label: 'Ending Soon' },
  ];

  return (
    <RadioGroup
      value={value}
      onChange={onChange}
      options={options || defaultOptions}
      name="sortOption"
      variant="default"
      className={className}
    />
  );
}

/**
 * Currency Radio Group
 */
interface CurrencyRadioProps {
  value: 'STX' | 'BTC' | 'USD';
  onChange: (value: 'STX' | 'BTC' | 'USD') => void;
  className?: string;
}

export function CurrencyRadio({ value, onChange, className = '' }: CurrencyRadioProps) {
  const options: RadioOption<'STX' | 'BTC' | 'USD'>[] = [
    { value: 'STX', label: 'STX' },
    { value: 'BTC', label: 'BTC' },
    { value: 'USD', label: 'USD' },
  ];

  return (
    <RadioGroup
      value={value}
      onChange={onChange}
      options={options}
      name="currency"
      variant="buttons"
      orientation="horizontal"
      className={className}
    />
  );
}

export default RadioGroup;
