'use client';

import {
  forwardRef,
  useState,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
  type ReactNode,
} from 'react';

// ============================================================================
// Types
// ============================================================================

type InputSize = 'sm' | 'md' | 'lg';

interface InputBaseProps {
  label?: string;
  error?: string;
  hint?: string;
  leftElement?: ReactNode;
  rightElement?: ReactNode;
  inputSize?: InputSize;
  fullWidth?: boolean;
}

interface InputProps extends InputBaseProps, Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {}

interface TextareaProps extends InputBaseProps, Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

// ============================================================================
// Styles
// ============================================================================

const sizeStyles: Record<InputSize, string> = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-3 text-base',
  lg: 'px-5 py-4 text-lg',
};

const baseInputStyles = `
  w-full bg-gray-900 border rounded-lg text-white 
  placeholder-gray-500 
  transition-all duration-200
  focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent
  disabled:opacity-50 disabled:cursor-not-allowed
`;

const getInputStyles = (hasError: boolean, hasLeftElement: boolean, hasRightElement: boolean, size: InputSize) => {
  let styles = baseInputStyles + ' ' + sizeStyles[size];
  
  styles += hasError ? ' border-red-500' : ' border-gray-700 hover:border-gray-600';
  
  if (hasLeftElement) styles += ' pl-10';
  if (hasRightElement) styles += ' pr-10';
  
  return styles;
};

// ============================================================================
// Input Component
// ============================================================================

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftElement,
      rightElement,
      inputSize = 'md',
      fullWidth = true,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`;
    const hasError = !!error;

    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label 
            htmlFor={inputId} 
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {leftElement && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {leftElement}
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            className={`${getInputStyles(hasError, !!leftElement, !!rightElement, inputSize)} ${className}`}
            aria-invalid={hasError}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            {...props}
          />
          
          {rightElement && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {rightElement}
            </div>
          )}
        </div>
        
        {error && (
          <p id={`${inputId}-error`} className="mt-2 text-sm text-red-400 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </p>
        )}
        
        {hint && !error && (
          <p id={`${inputId}-hint`} className="mt-2 text-sm text-gray-500">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// ============================================================================
// Textarea Component
// ============================================================================

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      hint,
      inputSize = 'md',
      fullWidth = true,
      resize = 'vertical',
      className = '',
      id,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const inputId = id || `textarea-${Math.random().toString(36).slice(2, 9)}`;
    const hasError = !!error;

    const resizeStyles = {
      none: 'resize-none',
      vertical: 'resize-y',
      horizontal: 'resize-x',
      both: 'resize',
    };

    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label 
            htmlFor={inputId} 
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <textarea
          ref={ref}
          id={inputId}
          rows={rows}
          className={`${getInputStyles(hasError, false, false, inputSize)} ${resizeStyles[resize]} min-h-[100px] ${className}`}
          aria-invalid={hasError}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
        
        {error && (
          <p id={`${inputId}-error`} className="mt-2 text-sm text-red-400 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </p>
        )}
        
        {hint && !error && (
          <p id={`${inputId}-hint`} className="mt-2 text-sm text-gray-500">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

// ============================================================================
// Search Input Component
// ============================================================================

interface SearchInputProps extends Omit<InputProps, 'leftElement' | 'type'> {
  onClear?: () => void;
  isLoading?: boolean;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ onClear, isLoading, value, className = '', ...props }, ref) => {
    const showClear = value && String(value).length > 0;

    return (
      <Input
        ref={ref}
        type="search"
        value={value}
        leftElement={
          isLoading ? (
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )
        }
        rightElement={
          showClear && onClear ? (
            <button
              type="button"
              onClick={onClear}
              className="p-1 hover:bg-gray-700 rounded transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ) : undefined
        }
        className={className}
        {...props}
      />
    );
  }
);

SearchInput.displayName = 'SearchInput';

// ============================================================================
// Password Input Component
// ============================================================================

export const PasswordInput = forwardRef<HTMLInputElement, Omit<InputProps, 'type'>>(
  ({ ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <Input
        ref={ref}
        type={showPassword ? 'text' : 'password'}
        rightElement={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
            tabIndex={-1}
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        }
        {...props}
      />
    );
  }
);

PasswordInput.displayName = 'PasswordInput';

// ============================================================================
// Number Input Component
// ============================================================================

interface NumberInputProps extends Omit<InputProps, 'type' | 'onChange'> {
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  onChange?: (value: number) => void;
  showControls?: boolean;
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      min,
      max,
      step = 1,
      value = 0,
      onChange,
      showControls = true,
      className = '',
      ...props
    },
    ref
  ) => {
    const handleIncrement = () => {
      const newValue = value + step;
      if (max === undefined || newValue <= max) {
        onChange?.(newValue);
      }
    };

    const handleDecrement = () => {
      const newValue = value - step;
      if (min === undefined || newValue >= min) {
        onChange?.(newValue);
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseFloat(e.target.value) || 0;
      if ((min === undefined || newValue >= min) && (max === undefined || newValue <= max)) {
        onChange?.(newValue);
      }
    };

    return (
      <div className="relative">
        {showControls && (
          <button
            type="button"
            onClick={handleDecrement}
            disabled={min !== undefined && value <= min}
            className="absolute left-0 top-0 bottom-0 px-3 text-gray-400 hover:text-white hover:bg-gray-700 rounded-l-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
        )}
        
        <Input
          ref={ref}
          type="number"
          value={value}
          onChange={handleChange}
          min={min}
          max={max}
          step={step}
          className={`${showControls ? 'text-center px-12' : ''} ${className} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
          {...props}
        />
        
        {showControls && (
          <button
            type="button"
            onClick={handleIncrement}
            disabled={max !== undefined && value >= max}
            className="absolute right-0 top-0 bottom-0 px-3 text-gray-400 hover:text-white hover:bg-gray-700 rounded-r-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        )}
      </div>
    );
  }
);

NumberInput.displayName = 'NumberInput';

// ============================================================================
// Select Component
// ============================================================================

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<InputHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  inputSize?: InputSize;
  fullWidth?: boolean;
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      hint,
      options,
      inputSize = 'md',
      fullWidth = true,
      placeholder,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `select-${Math.random().toString(36).slice(2, 9)}`;
    const hasError = !!error;

    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label 
            htmlFor={inputId} 
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          <select
            ref={ref}
            id={inputId}
            className={`${getInputStyles(hasError, false, true, inputSize)} appearance-none cursor-pointer ${className}`}
            aria-invalid={hasError}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option 
                key={option.value} 
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        
        {error && (
          <p id={`${inputId}-error`} className="mt-2 text-sm text-red-400 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </p>
        )}
        
        {hint && !error && (
          <p id={`${inputId}-hint`} className="mt-2 text-sm text-gray-500">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

// ============================================================================
// Checkbox Component
// ============================================================================

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string;
  description?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, className = '', id, ...props }, ref) => {
    const inputId = id || `checkbox-${Math.random().toString(36).slice(2, 9)}`;

    return (
      <div className="flex items-start gap-3">
        <input
          ref={ref}
          type="checkbox"
          id={inputId}
          className={`w-5 h-5 mt-0.5 bg-gray-900 border-gray-700 rounded text-orange-500 focus:ring-orange-500 focus:ring-offset-gray-900 cursor-pointer ${className}`}
          {...props}
        />
        {(label || description) && (
          <div>
            {label && (
              <label htmlFor={inputId} className="text-white font-medium cursor-pointer">
                {label}
              </label>
            )}
            {description && (
              <p className="text-sm text-gray-400">{description}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Input;
