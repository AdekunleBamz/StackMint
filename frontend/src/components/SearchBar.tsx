'use client';

/**
 * SearchBar Component
 * Provides search functionality with suggestions and recent searches
 * @module components/SearchBar
 * @version 2.2.0
 */

import { useState, useRef, useEffect, useCallback } from 'react';

// Search configuration
const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_DELAY = 300;
const DEFAULT_PLACEHOLDER = 'Search NFTs, collections, creators...';
const MAX_SUGGESTIONS = 5;
const MAX_RECENT_SEARCHES = 5;

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  suggestions?: string[];
  recentSearches?: string[];
  minQueryLength?: number;
}

export default function SearchBar({ 
  placeholder = 'Search NFTs, collections, creators...', 
  onSearch,
  suggestions = [],
  recentSearches = []
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
      setShowDropdown(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    onSearch(suggestion);
    setShowDropdown(false);
  };

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  const filteredSuggestions = suggestions.filter(s => 
    s.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="relative max-w-xl w-full" ref={dropdownRef}>
      <form onSubmit={handleSubmit} className="relative">
        {/* Search icon */}
        <svg 
          className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${isFocused ? 'text-purple-400' : 'text-gray-500'}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => {
            setIsFocused(true);
            setShowDropdown(true);
          }}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={`w-full bg-gray-900/80 border-2 rounded-xl px-4 py-3.5 pl-12 pr-10 text-white placeholder-gray-500 transition-all duration-300 ${
            isFocused 
              ? 'border-purple-500 shadow-lg shadow-purple-500/20 bg-gray-900' 
              : 'border-gray-700/50 hover:border-gray-600'
          } focus:outline-none`}
        />

        {/* Clear button */}
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-12 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Search button */}
        <button
          type="submit"
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </form>

      {/* Dropdown */}
      {showDropdown && (query || recentSearches.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-gray-700/50 rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in">
          {/* Recent searches */}
          {!query && recentSearches.length > 0 && (
            <div className="p-3">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Recent Searches</p>
              {recentSearches.slice(0, 5).map((search, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestionClick(search)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {search}
                </button>
              ))}
            </div>
          )}

          {/* Suggestions */}
          {query && filteredSuggestions.length > 0 && (
            <div className="p-3">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Suggestions</p>
              {filteredSuggestions.slice(0, 5).map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span dangerouslySetInnerHTML={{ 
                    __html: suggestion.replace(new RegExp(`(${query})`, 'gi'), '<strong class="text-purple-400">$1</strong>')
                  }} />
                </button>
              ))}
            </div>
          )}

          {/* No results */}
          {query && filteredSuggestions.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              <div className="text-3xl mb-2">🔍</div>
              <p className="font-medium text-gray-400">No results found</p>
              <p className="text-sm mt-1">Try searching for "{query.slice(0, 3)}..." or browse collections</p>
            </div>
          )}
          
          {/* Quick filters */}
          <div className="border-t border-gray-800 p-3">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Quick Filters</p>
            <div className="flex flex-wrap gap-2">
              {['Art', 'Collectibles', 'Gaming', 'Music', 'Photography'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => handleSuggestionClick(filter)}
                  className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-purple-600/20 hover:text-purple-400 text-gray-400 rounded-full transition-colors"
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
          
          {/* Keyboard shortcut hint */}
          <div className="border-t border-gray-800 px-4 py-2 flex items-center justify-between text-xs text-gray-600">
            <span>Press Enter to search</span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-500 font-mono">⌘</kbd>
              <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-500 font-mono">K</kbd>
              <span className="ml-1">to focus</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
