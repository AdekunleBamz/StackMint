'use client';

/**
 * useAsync Hook
 * Manage async operations with loading, error, and data states
 * @module hooks/useAsync
 * @version 1.0.0
 */

import { useState, useCallback, useRef, useEffect } from 'react';

interface AsyncState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
}

interface UseAsyncReturn<T, Args extends unknown[]> extends AsyncState<T> {
  execute: (...args: Args) => Promise<T | null>;
  reset: () => void;
  setData: (data: T | null) => void;
}

/**
 * Hook for managing async operations
 */
export function useAsync<T, Args extends unknown[] = []>(
  asyncFunction: (...args: Args) => Promise<T>,
  options?: {
    immediate?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    initialData?: T | null;
  }
): UseAsyncReturn<T, Args> {
  const { immediate = false, onSuccess, onError, initialData = null } = options || {};
  
  const [state, setState] = useState<AsyncState<T>>({
    data: initialData,
    error: null,
    isLoading: immediate,
    isError: false,
    isSuccess: false,
  });

  const mountedRef = useRef(true);
  const lastCallIdRef = useRef(0);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const execute = useCallback(
    async (...args: Args): Promise<T | null> => {
      const callId = ++lastCallIdRef.current;

      setState((prev) => ({
        ...prev,
        isLoading: true,
        isError: false,
      }));

      try {
        const result = await asyncFunction(...args);
        
        if (mountedRef.current && callId === lastCallIdRef.current) {
          setState({
            data: result,
            error: null,
            isLoading: false,
            isError: false,
            isSuccess: true,
          });
          onSuccess?.(result);
        }
        
        return result;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        
        if (mountedRef.current && callId === lastCallIdRef.current) {
          setState({
            data: null,
            error: err,
            isLoading: false,
            isError: true,
            isSuccess: false,
          });
          onError?.(err);
        }
        
        return null;
      }
    },
    [asyncFunction, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setState({
      data: initialData,
      error: null,
      isLoading: false,
      isError: false,
      isSuccess: false,
    });
  }, [initialData]);

  const setData = useCallback((data: T | null) => {
    setState((prev) => ({
      ...prev,
      data,
    }));
  }, []);

  // Execute immediately if specified
  useEffect(() => {
    if (immediate) {
      execute(...([] as unknown as Args));
    }
  }, []);

  return {
    ...state,
    execute,
    reset,
    setData,
  };
}

/**
 * Hook for managing paginated async data
 */
interface UsePaginatedAsyncOptions<T> {
  pageSize?: number;
  initialPage?: number;
  onSuccess?: (data: T[], page: number) => void;
  onError?: (error: Error) => void;
}

interface UsePaginatedAsyncReturn<T> {
  data: T[];
  error: Error | null;
  isLoading: boolean;
  isLoadingMore: boolean;
  page: number;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  reset: () => void;
}

export function usePaginatedAsync<T>(
  fetchFunction: (page: number, pageSize: number) => Promise<{ data: T[]; hasMore: boolean }>,
  options?: UsePaginatedAsyncOptions<T>
): UsePaginatedAsyncReturn<T> {
  const { pageSize = 20, initialPage = 1, onSuccess, onError } = options || {};

  const [data, setData] = useState<T[]>([]);
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadMore = useCallback(async () => {
    if (isLoading || isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    setError(null);

    try {
      const result = await fetchFunction(page, pageSize);
      
      if (mountedRef.current) {
        setData((prev) => [...prev, ...result.data]);
        setHasMore(result.hasMore);
        setPage((prev) => prev + 1);
        onSuccess?.(result.data, page);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      if (mountedRef.current) {
        setError(error);
        onError?.(error);
      }
    } finally {
      if (mountedRef.current) {
        setIsLoadingMore(false);
      }
    }
  }, [fetchFunction, page, pageSize, hasMore, isLoading, isLoadingMore, onSuccess, onError]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setData([]);
    setPage(initialPage);
    setHasMore(true);

    try {
      const result = await fetchFunction(initialPage, pageSize);
      
      if (mountedRef.current) {
        setData(result.data);
        setHasMore(result.hasMore);
        setPage(initialPage + 1);
        onSuccess?.(result.data, initialPage);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      if (mountedRef.current) {
        setError(error);
        onError?.(error);
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [fetchFunction, initialPage, pageSize, onSuccess, onError]);

  const reset = useCallback(() => {
    setData([]);
    setPage(initialPage);
    setHasMore(true);
    setIsLoading(false);
    setIsLoadingMore(false);
    setError(null);
  }, [initialPage]);

  return {
    data,
    error,
    isLoading,
    isLoadingMore,
    page,
    hasMore,
    loadMore,
    refresh,
    reset,
  };
}

/**
 * Hook for retrying failed async operations
 */
interface UseRetryAsyncOptions {
  maxRetries?: number;
  retryDelay?: number;
  backoff?: 'linear' | 'exponential';
}

export function useRetryAsync<T, Args extends unknown[] = []>(
  asyncFunction: (...args: Args) => Promise<T>,
  options?: UseRetryAsyncOptions
): UseAsyncReturn<T, Args> & { retryCount: number } {
  const { maxRetries = 3, retryDelay = 1000, backoff = 'exponential' } = options || {};

  const [retryCount, setRetryCount] = useState(0);
  const asyncHook = useAsync(asyncFunction);

  const executeWithRetry = useCallback(
    async (...args: Args): Promise<T | null> => {
      setRetryCount(0);
      
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          const result = await asyncFunction(...args);
          return result;
        } catch (error) {
          setRetryCount(attempt + 1);
          
          if (attempt === maxRetries) {
            throw error;
          }
          
          const delay = backoff === 'exponential'
            ? retryDelay * Math.pow(2, attempt)
            : retryDelay * (attempt + 1);
          
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
      
      return null;
    },
    [asyncFunction, maxRetries, retryDelay, backoff]
  );

  const wrappedExecute = useCallback(
    async (...args: Args) => {
      return asyncHook.execute(...(args as Args));
    },
    [asyncHook.execute]
  );

  return {
    ...asyncHook,
    execute: wrappedExecute,
    retryCount,
  };
}

export default useAsync;
