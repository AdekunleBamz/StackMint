'use client';

/**
 * VirtualList Component
 * Virtualized list for efficiently rendering large datasets
 * @module components/VirtualList
 * @version 1.0.0
 */

import { useState, useRef, useEffect, useCallback, memo, ReactNode } from 'react';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number | ((item: T, index: number) => number);
  renderItem: (item: T, index: number) => ReactNode;
  overscan?: number;
  className?: string;
  containerHeight?: number;
  onEndReached?: () => void;
  endReachedThreshold?: number;
  loading?: boolean;
  loadingComponent?: ReactNode;
  emptyComponent?: ReactNode;
}

function VirtualListComponent<T>({
  items,
  itemHeight,
  renderItem,
  overscan = 3,
  className = '',
  containerHeight = 600,
  onEndReached,
  endReachedThreshold = 200,
  loading = false,
  loadingComponent,
  emptyComponent,
}: VirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [hasCalledEndReached, setHasCalledEndReached] = useState(false);

  // Calculate item height (support fixed or dynamic)
  const getItemHeight = useCallback(
    (index: number): number => {
      if (typeof itemHeight === 'function') {
        return itemHeight(items[index], index);
      }
      return itemHeight;
    },
    [itemHeight, items]
  );

  // Calculate total height and item positions
  const { totalHeight, itemPositions } = (() => {
    let height = 0;
    const positions: number[] = [];

    for (let i = 0; i < items.length; i++) {
      positions.push(height);
      height += getItemHeight(i);
    }

    return { totalHeight: height, itemPositions: positions };
  })();

  // Find visible range
  const getVisibleRange = useCallback(() => {
    const start = scrollTop;
    const end = scrollTop + containerHeight;

    let startIndex = 0;
    let endIndex = items.length - 1;

    // Binary search for start index
    let low = 0;
    let high = items.length - 1;
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      if (itemPositions[mid] < start) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }
    startIndex = Math.max(0, high - overscan);

    // Binary search for end index
    low = 0;
    high = items.length - 1;
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      if (itemPositions[mid] < end) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }
    endIndex = Math.min(items.length - 1, low + overscan);

    return { startIndex, endIndex };
  }, [scrollTop, containerHeight, items.length, itemPositions, overscan]);

  const { startIndex, endIndex } = getVisibleRange();

  // Handle scroll
  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      const newScrollTop = containerRef.current.scrollTop;
      setScrollTop(newScrollTop);

      // Check if we've reached the end
      const scrollHeight = containerRef.current.scrollHeight;
      const clientHeight = containerRef.current.clientHeight;
      const distanceFromBottom = scrollHeight - newScrollTop - clientHeight;

      if (
        distanceFromBottom < endReachedThreshold &&
        onEndReached &&
        !hasCalledEndReached &&
        !loading
      ) {
        setHasCalledEndReached(true);
        onEndReached();
      } else if (distanceFromBottom >= endReachedThreshold) {
        setHasCalledEndReached(false);
      }
    }
  }, [onEndReached, endReachedThreshold, hasCalledEndReached, loading]);

  // Set up scroll listener
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // Empty state
  if (items.length === 0 && !loading) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height: containerHeight }}>
        {emptyComponent || (
          <div className="text-center text-gray-500">
            <p>No items to display</p>
          </div>
        )}
      </div>
    );
  }

  // Build visible items
  const visibleItems = [];
  for (let i = startIndex; i <= endIndex; i++) {
    const item = items[i];
    if (item !== undefined) {
      visibleItems.push(
        <div
          key={i}
          style={{
            position: 'absolute',
            top: itemPositions[i],
            left: 0,
            right: 0,
            height: getItemHeight(i),
          }}
        >
          {renderItem(item, i)}
        </div>
      );
    }
  }

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
    >
      <div style={{ position: 'relative', height: totalHeight }}>
        {visibleItems}
      </div>
      
      {/* Loading indicator at bottom */}
      {loading && (
        <div className="flex items-center justify-center py-4">
          {loadingComponent || (
            <div className="flex items-center gap-2 text-gray-400">
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>Loading more...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Simple windowed list for fixed-height items
 */
interface SimpleVirtualListProps<T> {
  items: T[];
  itemHeight: number;
  renderItem: (item: T, index: number) => ReactNode;
  height?: number;
  className?: string;
}

export function SimpleVirtualList<T>({
  items,
  itemHeight,
  renderItem,
  height = 400,
  className = '',
}: SimpleVirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalHeight = items.length * itemHeight;
  const startIndex = Math.floor(scrollTop / itemHeight);
  const visibleCount = Math.ceil(height / itemHeight) + 1;
  const endIndex = Math.min(startIndex + visibleCount, items.length);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={`overflow-auto ${className}`}
      style={{ height }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {Array.from({ length: endIndex - startIndex }).map((_, i) => {
          const index = startIndex + i;
          return (
            <div
              key={index}
              style={{
                position: 'absolute',
                top: index * itemHeight,
                left: 0,
                right: 0,
                height: itemHeight,
              }}
            >
              {renderItem(items[index], index)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default memo(VirtualListComponent) as typeof VirtualListComponent;
