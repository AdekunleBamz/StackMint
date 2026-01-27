'use client';

/**
 * useSearch Hook
 * Debounced search with history and suggestions
 * @module hooks/useSearch
 * @version 1.0.0
 */

import { useState, useCallback, useEffect, useMemo } from 'react';

/** Search history storage key */
const HISTORY_STORAGE_KEY = 'stacksmint-search-history';

/** Maximum history items to store */
const MAX_HISTORY = 10;

interface SearchResult<T> {
  id: string;
  type: 'nft' | 'collection' | 'user';
  data: T;
  score: number;
}

interface UseSearchOptions<T> {
  /** Items to search through */
  items: T[];
  /** Keys to search in items */
  searchKeys: (keyof T)[];
  /** Debounce delay in ms */
  debounceMs?: number;
  /** Minimum characters to trigger search */
  minChars?: number;
  /** Maximum results to return */
  maxResults?: number;
  /** Enable search history */
  enableHistory?: boolean;
}

interface UseSearchReturn<T> {
  /** Current search query */
  query: string;
  /** Set search query */
  setQuery: (query: string) => void;
  /** Filtered results */
  results: T[];
  /** Whether search is in progress */
  isSearching: boolean;
  /** Search history */
  history: string[];
  /** Add to history */
  addToHistory: (query: string) => void;
  /** Clear history */
  clearHistory: () => void;
  /** Clear search */
  clear: () => void;
  /** Whether has results */
  hasResults: boolean;
  /** Results count */
  resultsCount: number;
}

export function useSearch<T extends Record<string, any>>(
  options: UseSearchOptions<T>
): UseSearchReturn<T> {
  const {
    items,
    searchKeys,
    debounceMs = 300,
    minChars = 2,
    maxResults = 50,
    enableHistory = true,
  } = options;

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  // Load history on mount
  useEffect(() => {
    if (enableHistory && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
        if (stored) {
          setHistory(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Failed to load search history:', error);
      }
    }
  }, [enableHistory]);

  // Save history on change
  useEffect(() => {
    if (enableHistory && typeof window !== 'undefined' && history.length > 0) {
      try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
      } catch (error) {
        console.error('Failed to save search history:', error);
      }
    }
  }, [history, enableHistory]);

  // Debounce query
  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setIsSearching(false);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  // Filter results
  const results = useMemo(() => {
    if (!debouncedQuery || debouncedQuery.length < minChars) {
      return [];
    }

    const lowerQuery = debouncedQuery.toLowerCase();

    const scored = items
      .map((item) => {
        let score = 0;

        for (const key of searchKeys) {
          const value = item[key];
          if (typeof value === 'string') {
            const lowerValue = value.toLowerCase();
            
            // Exact match gets highest score
            if (lowerValue === lowerQuery) {
              score += 100;
            }
            // Starts with query
            else if (lowerValue.startsWith(lowerQuery)) {
              score += 75;
            }
            // Contains query
            else if (lowerValue.includes(lowerQuery)) {
              score += 50;
            }
          }
        }

        return { item, score };
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults)
      .map(({ item }) => item);

    return scored;
  }, [debouncedQuery, items, searchKeys, minChars, maxResults]);

  // Add to history
  const addToHistory = useCallback((searchQuery: string) => {
    if (!searchQuery.trim() || !enableHistory) return;

    setHistory((prev) => {
      // Remove if exists and add to front
      const filtered = prev.filter((h) => h !== searchQuery);
      return [searchQuery, ...filtered].slice(0, MAX_HISTORY);
    });
  }, [enableHistory]);

  // Clear history
  const clearHistory = useCallback(() => {
    setHistory([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
    }
  }, []);

  // Clear search
  const clear = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
  }, []);

  return {
    query,
    setQuery,
    results,
    isSearching,
    history,
    addToHistory,
    clearHistory,
    clear,
    hasResults: results.length > 0,
    resultsCount: results.length,
  };
}

export default useSearch;
