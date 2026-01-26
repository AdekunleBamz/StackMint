'use client';

/**
 * PriceInput Component
 * STX price input with USD conversion and quick amounts
 * @module PriceInput
 * @version 2.2.0
 */

import { useState, useEffect, useCallback } from 'react';

// Price display configuration
const DEFAULT_USD_DECIMALS = 2;
const DEFAULT_MIN_PRICE = 0;
const DEFAULT_QUICK_AMOUNTS = [0.1, 0.5, 1, 5, 10];

/** Maximum allowed decimals for STX input */
const MAX_STX_DECIMALS = 6;

/** Debounce delay for USD conversion updates */
const CONVERSION_DEBOUNCE = 150;

/**
 * Price validation result
 */
interface PriceValidation {
  isValid: boolean;
  error?: string;
}

/**
 * Currency display mode
 */
type CurrencyDisplay = 'stx' | 'usd' | 'both';

interface PriceInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  showUsdConversion?: boolean;
  min?: number;
  max?: number;
  quickAmounts?: number[];
  helperText?: string;
  error?: string;
  disabled?: boolean;
}

const STX_TO_USD = 0.45; // Mock exchange rate

export default function PriceInput({
  value,
  onChange,
  label = 'Price',
  showUsdConversion = true,
  min = 0,
  max,
  quickAmounts = [0.1, 0.5, 1, 5, 10],
  helperText,
  error,
  disabled = false,
}: PriceInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [usdValue, setUsdValue] = useState('0.00');

  useEffect(() => {
    const stx = parseFloat(value) || 0;
    setUsdValue((stx * STX_TO_USD).toFixed(2));
  }, [value]);

  const handleQuickAmount = (amount: number) => {
    if (!disabled) {
      onChange(amount.toString());
    }
  };

  const handleIncrement = (delta: number) => {
    if (disabled) return;
    const current = parseFloat(value) || 0;
    const newValue = Math.max(min, current + delta);
    if (max !== undefined && newValue > max) return;
    onChange(newValue.toFixed(2));
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="flex items-center justify-between text-sm">
          <span className="text-gray-300 font-medium">{label}</span>
          {showUsdConversion && value && (
            <span className="text-gray-500">≈ ${usdValue} USD</span>
          )}
        </label>
      )}
      
      <div className={`relative group ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
        {/* Decrement Button */}
        <button
          type="button"
          onClick={() => handleIncrement(-0.1)}
          disabled={disabled || parseFloat(value) <= min}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors z-10"
        >
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>

        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="0.00"
          min={min}
          max={max}
          step="0.01"
          disabled={disabled}
          className={`w-full bg-gray-900/50 border rounded-xl px-12 py-4 text-white text-center text-lg font-semibold focus:outline-none transition-all ${
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
              : isFocused
              ? 'border-purple-500 ring-2 ring-purple-500/20'
              : 'border-gray-700 hover:border-gray-600'
          } ${disabled ? 'cursor-not-allowed' : ''}`}
        />

        {/* Increment Button */}
        <button
          type="button"
          onClick={() => handleIncrement(0.1)}
          disabled={disabled || (max !== undefined && parseFloat(value) >= max)}
          className="absolute right-16 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors z-10"
        >
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>

        {/* Currency Badge */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 bg-purple-600/20 px-3 py-1.5 rounded-lg">
          <div className="w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
            <span className="text-[10px] font-bold text-white">S</span>
          </div>
          <span className="text-purple-400 font-semibold text-sm">STX</span>
        </div>
      </div>

      {/* Quick Amount Buttons */}
      <div className="flex gap-2 flex-wrap">
        {quickAmounts.map((amount) => (
          <button
            key={amount}
            type="button"
            onClick={() => handleQuickAmount(amount)}
            disabled={disabled}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              parseFloat(value) === amount
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            {amount} STX
          </button>
        ))}
        <button
          type="button"
          onClick={() => onChange('')}
          disabled={disabled || !value}
          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all ml-auto"
        >
          Clear
        </button>
      </div>

      {/* Helper/Error Text */}
      {(helperText || error) && (
        <p className={`text-xs flex items-center gap-1 ${error ? 'text-red-400' : 'text-gray-500'}`}>
          {error ? (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {error || helperText}
        </p>
      )}

      {/* Price Range Indicator */}
      {max !== undefined && (
        <div className="relative h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, ((parseFloat(value) || 0) / max) * 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}
