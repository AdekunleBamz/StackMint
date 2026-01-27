'use client';

/**
 * usePagination Hook
 * Pagination state and logic management
 * @module hooks/usePagination
 * @version 1.0.0
 */

import { useState, useCallback, useMemo } from 'react';

// Types
interface UsePaginationOptions {
  totalItems: number;
  initialPage?: number;
  initialPageSize?: number;
  pageSizeOptions?: number[];
}

interface UsePaginationReturn {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  isFirstPage: boolean;
  isLastPage: boolean;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  firstPage: () => void;
  lastPage: () => void;
  setPageSize: (size: number) => void;
  getPageItems: <T>(items: T[]) => T[];
  pageRange: (number | 'ellipsis')[];
  reset: () => void;
}

/**
 * Generate page range with ellipsis
 */
function generatePageRange(
  currentPage: number,
  totalPages: number,
  siblingCount: number = 1
): (number | 'ellipsis')[] {
  const totalNumbers = siblingCount * 2 + 3;
  const totalBlocks = totalNumbers + 2;

  if (totalPages <= totalBlocks) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

  const showLeftEllipsis = leftSiblingIndex > 2;
  const showRightEllipsis = rightSiblingIndex < totalPages - 1;

  if (!showLeftEllipsis && showRightEllipsis) {
    const leftRange = Array.from({ length: totalNumbers }, (_, i) => i + 1);
    return [...leftRange, 'ellipsis', totalPages];
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    const rightRange = Array.from(
      { length: totalNumbers },
      (_, i) => totalPages - totalNumbers + i + 1
    );
    return [1, 'ellipsis', ...rightRange];
  }

  const middleRange = Array.from(
    { length: rightSiblingIndex - leftSiblingIndex + 1 },
    (_, i) => leftSiblingIndex + i
  );
  return [1, 'ellipsis', ...middleRange, 'ellipsis', totalPages];
}

/**
 * Main usePagination Hook
 */
export function usePagination({
  totalItems,
  initialPage = 1,
  initialPageSize = 10,
  pageSizeOptions = [10, 20, 50, 100],
}: UsePaginationOptions): UsePaginationReturn {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  // Computed values
  const totalPages = useMemo(
    () => Math.ceil(totalItems / pageSize),
    [totalItems, pageSize]
  );

  const startIndex = useMemo(
    () => (currentPage - 1) * pageSize,
    [currentPage, pageSize]
  );

  const endIndex = useMemo(
    () => Math.min(startIndex + pageSize - 1, totalItems - 1),
    [startIndex, pageSize, totalItems]
  );

  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  // Page range for rendering pagination
  const pageRange = useMemo(
    () => generatePageRange(currentPage, totalPages),
    [currentPage, totalPages]
  );

  // Navigation functions
  const goToPage = useCallback(
    (page: number) => {
      const validPage = Math.max(1, Math.min(page, totalPages));
      setCurrentPage(validPage);
    },
    [totalPages]
  );

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [hasNextPage]);

  const prevPage = useCallback(() => {
    if (hasPrevPage) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [hasPrevPage]);

  const firstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const lastPage = useCallback(() => {
    setCurrentPage(totalPages);
  }, [totalPages]);

  // Page size change
  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    setCurrentPage(1); // Reset to first page when changing size
  }, []);

  // Get current page items
  const getPageItems = useCallback(
    <T>(items: T[]): T[] => {
      return items.slice(startIndex, endIndex + 1);
    },
    [startIndex, endIndex]
  );

  // Reset pagination
  const reset = useCallback(() => {
    setCurrentPage(initialPage);
    setPageSizeState(initialPageSize);
  }, [initialPage, initialPageSize]);

  return {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    startIndex,
    endIndex,
    hasNextPage,
    hasPrevPage,
    isFirstPage,
    isLastPage,
    goToPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    setPageSize,
    getPageItems,
    pageRange,
    reset,
  };
}

/**
 * Hook for cursor-based pagination (infinite scroll)
 */
interface UseCursorPaginationOptions<T> {
  pageSize?: number;
  getCursor?: (item: T) => string;
}

interface UseCursorPaginationReturn<T> {
  items: T[];
  cursor: string | null;
  hasMore: boolean;
  isLoading: boolean;
  loadMore: () => void;
  addItems: (newItems: T[], hasMore: boolean) => void;
  reset: () => void;
  setLoading: (loading: boolean) => void;
}

export function useCursorPagination<T>({
  pageSize = 20,
  getCursor,
}: UseCursorPaginationOptions<T> = {}): UseCursorPaginationReturn<T> {
  const [items, setItems] = useState<T[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const addItems = useCallback(
    (newItems: T[], hasMoreItems: boolean) => {
      setItems((prev) => [...prev, ...newItems]);
      setHasMore(hasMoreItems);

      if (newItems.length > 0 && getCursor) {
        const lastItem = newItems[newItems.length - 1];
        setCursor(getCursor(lastItem));
      }
    },
    [getCursor]
  );

  const loadMore = useCallback(() => {
    if (!hasMore || isLoading) return;
    // This will trigger a fetch in the consuming component
  }, [hasMore, isLoading]);

  const reset = useCallback(() => {
    setItems([]);
    setCursor(null);
    setHasMore(true);
    setIsLoading(false);
  }, []);

  return {
    items,
    cursor,
    hasMore,
    isLoading,
    loadMore,
    addItems,
    reset,
    setLoading: setIsLoading,
  };
}

/**
 * Hook for infinite scroll with intersection observer
 */
interface UseInfiniteScrollOptions {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  threshold?: number;
  rootMargin?: string;
}

export function useInfiniteScroll({
  hasMore,
  isLoading,
  onLoadMore,
  threshold = 0.1,
  rootMargin = '100px',
}: UseInfiniteScrollOptions) {
  const [sentinel, setSentinel] = useState<HTMLElement | null>(null);

  const ref = useCallback((node: HTMLElement | null) => {
    setSentinel(node);
  }, []);

  // Set up intersection observer
  useMemo(() => {
    if (!sentinel || !hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !isLoading) {
          onLoadMore();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [sentinel, hasMore, isLoading, onLoadMore, threshold, rootMargin]);

  return { ref };
}

/**
 * Hook for virtual list pagination
 */
interface UseVirtualPaginationOptions {
  totalItems: number;
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

export function useVirtualPagination({
  totalItems,
  itemHeight,
  containerHeight,
  overscan = 5,
}: UseVirtualPaginationOptions) {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    totalItems - 1,
    startIndex + visibleCount + overscan * 2
  );

  const visibleItems = useMemo(() => {
    return Array.from({ length: endIndex - startIndex + 1 }, (_, i) => startIndex + i);
  }, [startIndex, endIndex]);

  const totalHeight = totalItems * itemHeight;
  const offsetY = startIndex * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    startIndex,
    endIndex,
    totalHeight,
    offsetY,
    handleScroll,
  };
}

export default usePagination;
