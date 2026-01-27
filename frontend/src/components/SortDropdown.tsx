'use client';

/**
 * SortDropdown Component
 * Sorting options dropdown for marketplace and collections
 * @module components/SortDropdown
 * @version 1.0.0
 */

import { useState, useRef, useEffect, memo } from 'react';

export type SortOption = {
  value: string;
  label: string;
  icon?: string;
};

interface SortDropdownProps {
  options: SortOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
}

const defaultSortOptions: SortOption[] = [
  { value: 'recent', label: 'Recently Listed', icon: '🕐' },
  { value: 'price-low', label: 'Price: Low to High', icon: '📈' },
  { value: 'price-high', label: 'Price: High to Low', icon: '📉' },
  { value: 'ending', label: 'Ending Soon', icon: '⏰' },
  { value: 'popular', label: 'Most Popular', icon: '🔥' },
  { value: 'oldest', label: 'Oldest', icon: '📅' },
];

function SortDropdownComponent({
  options = defaultSortOptions,
  value,
  onChange,
  label = 'Sort by',
  className = '',
}: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get selected option
  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={`
          flex items-center gap-2 px-4 py-2.5 rounded-xl
          bg-gray-800 border border-gray-700 text-sm
          hover:bg-gray-700 hover:border-gray-600
          transition-all duration-200
          ${isOpen ? 'border-purple-500 ring-2 ring-purple-500/20' : ''}
        `}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {/* Sort icon */}
        <svg 
          className="w-4 h-4 text-gray-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
        </svg>

        {/* Label and selected option */}
        <span className="text-gray-400">{label}:</span>
        <span className="text-white font-medium">{selectedOption.label}</span>

        {/* Chevron */}
        <svg 
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div 
          role="listbox"
          className="absolute z-50 right-0 mt-2 w-56 py-1 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl animate-fade-in-down"
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            
            return (
              <button
                key={option.value}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(option.value)}
                className={`
                  w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm
                  transition-colors
                  ${isSelected 
                    ? 'bg-purple-600/20 text-purple-300' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }
                `}
              >
                {/* Icon */}
                {option.icon && (
                  <span className="text-base">{option.icon}</span>
                )}
                
                {/* Label */}
                <span className="flex-1">{option.label}</span>
                
                {/* Checkmark for selected */}
                {isSelected && (
                  <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Quick sort pills for common sort options
 */
interface SortPillsProps {
  options: SortOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function SortPills({
  options,
  value,
  onChange,
  className = '',
}: SortPillsProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {options.map((option) => {
        const isSelected = option.value === value;
        
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`
              inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
              transition-all duration-200
              ${isSelected
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white border border-gray-700'
              }
            `}
          >
            {option.icon && <span>{option.icon}</span>}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export default memo(SortDropdownComponent);
