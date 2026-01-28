'use client';

/**
 * TagInput Component
 * Multi-tag input with suggestions
 * @module components/TagInput
 * @version 1.0.0
 */

import { memo, useState, useCallback, useRef, KeyboardEvent } from 'react';

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
  maxTags?: number;
  allowCustom?: boolean;
  disabled?: boolean;
  className?: string;
}

function TagInputComponent({
  value,
  onChange,
  placeholder = 'Add tag...',
  suggestions = [],
  maxTags,
  allowCustom = true,
  disabled = false,
  className = '',
}: TagInputProps) {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredSuggestions = suggestions.filter(
    s => s.toLowerCase().includes(input.toLowerCase()) && !value.includes(s)
  );

  const addTag = useCallback((tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed) return;
    if (value.includes(trimmed)) return;
    if (maxTags && value.length >= maxTags) return;
    
    onChange([...value, trimmed]);
    setInput('');
    setShowSuggestions(false);
    setHighlightedIndex(0);
  }, [value, onChange, maxTags]);

  const removeTag = useCallback((tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove));
  }, [value, onChange]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (showSuggestions && filteredSuggestions.length > 0) {
        addTag(filteredSuggestions[highlightedIndex]);
      } else if (allowCustom && input.trim()) {
        addTag(input);
      }
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      removeTag(value[value.length - 1]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => 
        prev < filteredSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => 
        prev > 0 ? prev - 1 : filteredSuggestions.length - 1
      );
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    } else if (e.key === ',') {
      e.preventDefault();
      if (allowCustom && input.trim()) {
        addTag(input);
      }
    }
  }, [input, value, addTag, removeTag, showSuggestions, filteredSuggestions, highlightedIndex, allowCustom]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setShowSuggestions(true);
    setHighlightedIndex(0);
  }, []);

  const isMaxReached = maxTags !== undefined && value.length >= maxTags;

  return (
    <div className={`relative ${className}`}>
      <div 
        className={`
          flex flex-wrap gap-2 p-3 rounded-xl
          bg-gray-800/50 border border-gray-700
          transition-all focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/20
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onClick={() => inputRef.current?.focus()}
      >
        {/* Tags */}
        {value.map(tag => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-600/30 text-purple-300 text-sm"
          >
            {tag}
            {!disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTag(tag);
                }}
                className="p-0.5 hover:bg-purple-600/50 rounded-full transition-colors"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </span>
        ))}

        {/* Input */}
        {!isMaxReached && !disabled && (
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder={value.length === 0 ? placeholder : ''}
            className="flex-1 min-w-[120px] bg-transparent outline-none text-white placeholder:text-gray-500"
          />
        )}
      </div>

      {/* Max Tags Indicator */}
      {maxTags && (
        <div className="mt-1 text-xs text-gray-500 text-right">
          {value.length}/{maxTags} tags
        </div>
      )}

      {/* Suggestions Dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute top-full mt-2 left-0 right-0 z-50 py-2 bg-gray-900 border border-gray-700 rounded-xl shadow-xl max-h-48 overflow-y-auto">
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => addTag(suggestion)}
              className={`
                w-full px-4 py-2 text-left transition-colors
                ${index === highlightedIndex ? 'bg-purple-600/20 text-purple-300' : 'text-gray-300 hover:bg-gray-800'}
              `}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Tag Component for standalone use
 */
interface TagProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  removable?: boolean;
  onRemove?: () => void;
  onClick?: () => void;
  className?: string;
}

const tagVariants = {
  default: 'bg-gray-700/50 text-gray-300 border-gray-600',
  success: 'bg-green-900/30 text-green-400 border-green-700/50',
  warning: 'bg-yellow-900/30 text-yellow-400 border-yellow-700/50',
  error: 'bg-red-900/30 text-red-400 border-red-700/50',
  info: 'bg-blue-900/30 text-blue-400 border-blue-700/50',
};

const tagSizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-base',
};

export function Tag({
  children,
  variant = 'default',
  size = 'md',
  removable = false,
  onRemove,
  onClick,
  className = '',
}: TagProps) {
  const isClickable = !!onClick;

  const content = (
    <>
      <span>{children}</span>
      {removable && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          className="ml-1 p-0.5 hover:bg-white/10 rounded-full transition-colors"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </>
  );

  const baseClasses = `
    inline-flex items-center rounded-full border
    ${tagVariants[variant]}
    ${tagSizes[size]}
    ${isClickable ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}
    ${className}
  `;

  if (isClickable) {
    return (
      <button type="button" onClick={onClick} className={baseClasses}>
        {content}
      </button>
    );
  }

  return <span className={baseClasses}>{content}</span>;
}

/**
 * Tag Cloud - displays tags in a cloud layout
 */
interface TagCloudProps {
  tags: Array<{
    label: string;
    count?: number;
    variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  }>;
  onTagClick?: (tag: string) => void;
  selectedTags?: string[];
  className?: string;
}

export function TagCloud({
  tags,
  onTagClick,
  selectedTags = [],
  className = '',
}: TagCloudProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {tags.map(tag => (
        <Tag
          key={tag.label}
          variant={selectedTags.includes(tag.label) ? 'info' : tag.variant || 'default'}
          onClick={onTagClick ? () => onTagClick(tag.label) : undefined}
          className={selectedTags.includes(tag.label) ? 'ring-2 ring-blue-500/30' : ''}
        >
          {tag.label}
          {tag.count !== undefined && (
            <span className="ml-1 opacity-60">({tag.count})</span>
          )}
        </Tag>
      ))}
    </div>
  );
}

/**
 * Category Tags - predefined NFT categories
 */
interface CategoryTagsProps {
  selected: string[];
  onChange: (categories: string[]) => void;
  className?: string;
}

const NFT_CATEGORIES = [
  { label: 'Art', emoji: '🎨' },
  { label: 'Photography', emoji: '📷' },
  { label: 'Music', emoji: '🎵' },
  { label: 'Video', emoji: '🎬' },
  { label: 'Collectibles', emoji: '🃏' },
  { label: 'Gaming', emoji: '🎮' },
  { label: 'Memes', emoji: '😂' },
  { label: 'PFP', emoji: '👤' },
  { label: '3D', emoji: '🧊' },
  { label: 'Generative', emoji: '🌀' },
];

export function CategoryTags({
  selected,
  onChange,
  className = '',
}: CategoryTagsProps) {
  const toggleCategory = (category: string) => {
    if (selected.includes(category)) {
      onChange(selected.filter(c => c !== category));
    } else {
      onChange([...selected, category]);
    }
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {NFT_CATEGORIES.map(({ label, emoji }) => (
        <button
          key={label}
          type="button"
          onClick={() => toggleCategory(label)}
          className={`
            inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
            border transition-all
            ${selected.includes(label)
              ? 'bg-purple-600 border-purple-500 text-white'
              : 'bg-gray-800/50 border-gray-700 text-gray-300 hover:border-gray-600'
            }
          `}
        >
          <span>{emoji}</span>
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}

export default memo(TagInputComponent);
