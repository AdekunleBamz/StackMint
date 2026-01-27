'use client';

/**
 * Textarea Component
 * Enhanced textarea with character count and auto-resize
 * @module components/Textarea
 * @version 1.0.0
 */

import { useState, useRef, useEffect, memo, forwardRef, TextareaHTMLAttributes } from 'react';

interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  label?: string;
  error?: string;
  helperText?: string;
  maxLength?: number;
  showCount?: boolean;
  autoResize?: boolean;
  minRows?: number;
  maxRows?: number;
  onChange?: (value: string) => void;
  className?: string;
}

const TextareaComponent = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      maxLength,
      showCount = false,
      autoResize = false,
      minRows = 3,
      maxRows = 10,
      onChange,
      value,
      disabled,
      className = '',
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState(value?.toString() || '');
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    const displayValue = value !== undefined ? value.toString() : internalValue;
    const charCount = displayValue.length;

    // Auto-resize logic
    useEffect(() => {
      if (autoResize && textareaRef.current) {
        const textarea = textareaRef.current;
        textarea.style.height = 'auto';
        
        const lineHeight = parseInt(getComputedStyle(textarea).lineHeight) || 24;
        const minHeight = minRows * lineHeight;
        const maxHeight = maxRows * lineHeight;
        
        const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight);
        textarea.style.height = `${newHeight}px`;
      }
    }, [displayValue, autoResize, minRows, maxRows]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      
      // Respect maxLength
      if (maxLength && newValue.length > maxLength) {
        return;
      }
      
      setInternalValue(newValue);
      onChange?.(newValue);
    };

    // Combine refs
    const setRefs = (element: HTMLTextAreaElement | null) => {
      textareaRef.current = element;
      if (typeof ref === 'function') {
        ref(element);
      } else if (ref) {
        ref.current = element;
      }
    };

    const isOverLimit = maxLength ? charCount > maxLength * 0.9 : false;
    const isAtLimit = maxLength ? charCount >= maxLength : false;

    return (
      <div className={className}>
        {/* Label */}
        {label && (
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {label}
            {props.required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}

        {/* Textarea container */}
        <div className="relative">
          <textarea
            ref={setRefs}
            value={displayValue}
            onChange={handleChange}
            disabled={disabled}
            rows={autoResize ? minRows : undefined}
            className={`
              w-full px-4 py-3 rounded-xl
              bg-gray-800 border text-white placeholder-gray-500
              transition-all duration-200 resize-none
              focus:outline-none focus:ring-2 focus:ring-purple-500/20
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              ${error 
                ? 'border-red-500 focus:border-red-500' 
                : 'border-gray-700 focus:border-purple-500'
              }
              ${!autoResize ? 'min-h-[120px]' : ''}
            `}
            {...props}
          />

          {/* Resize handle indicator (when not auto-resize) */}
          {!autoResize && !disabled && (
            <div className="absolute bottom-2 right-2 w-3 h-3 opacity-30 pointer-events-none">
              <svg className="w-full h-full text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22 22H20V20H22V22ZM22 18H18V22H22V18ZM14 22H18V18H22V14H14V22Z" />
              </svg>
            </div>
          )}
        </div>

        {/* Footer with helper text and character count */}
        <div className="mt-2 flex items-center justify-between">
          {/* Error or helper text */}
          <div className="flex-1">
            {error ? (
              <p className="text-sm text-red-400 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </p>
            ) : helperText ? (
              <p className="text-sm text-gray-500">{helperText}</p>
            ) : null}
          </div>

          {/* Character count */}
          {showCount && maxLength && (
            <p className={`
              text-sm font-mono
              ${isAtLimit ? 'text-red-400' : isOverLimit ? 'text-yellow-400' : 'text-gray-500'}
            `}>
              {charCount}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

TextareaComponent.displayName = 'Textarea';

export default memo(TextareaComponent);
