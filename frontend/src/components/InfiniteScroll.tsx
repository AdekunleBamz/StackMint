'use client';

/**
 * InfiniteScroll Component
 * Infinite loading and virtualized lists
 * @module components/InfiniteScroll
 * @version 1.0.0
 */

import { memo, useRef, useEffect, useState, useCallback, ReactNode } from 'react';

// Types
interface InfiniteScrollProps {
  children: ReactNode;
  onLoadMore: () => void | Promise<void>;
  hasMore: boolean;
  isLoading?: boolean;
  threshold?: number;
  loader?: ReactNode;
  endMessage?: ReactNode;
  className?: string;
}

function InfiniteScrollComponent({
  children,
  onLoadMore,
  hasMore,
  isLoading = false,
  threshold = 200,
  loader,
  endMessage,
  className = '',
}: InfiniteScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const handleScroll = useCallback(() => {
    if (!containerRef.current || loadingRef.current || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    if (distanceFromBottom < threshold) {
      loadingRef.current = true;
      Promise.resolve(onLoadMore()).finally(() => {
        loadingRef.current = false;
      });
    }
  }, [hasMore, onLoadMore, threshold]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const defaultLoader = (
    <div className="flex items-center justify-center py-8">
      <div className="flex items-center gap-3 text-gray-400">
        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span>Loading more...</span>
      </div>
    </div>
  );

  const defaultEndMessage = (
    <div className="text-center py-8 text-gray-500">
      <p>You&apos;ve reached the end</p>
    </div>
  );

  return (
    <div ref={containerRef} className={className}>
      {children}
      {isLoading && (loader || defaultLoader)}
      {!hasMore && !isLoading && (endMessage || defaultEndMessage)}
    </div>
  );
}

/**
 * InfiniteScrollContainer - Container-based infinite scroll
 */
interface InfiniteScrollContainerProps extends Omit<InfiniteScrollProps, 'className'> {
  height?: string | number;
  className?: string;
}

export function InfiniteScrollContainer({
  children,
  onLoadMore,
  hasMore,
  isLoading = false,
  threshold = 100,
  loader,
  endMessage,
  height = 400,
  className = '',
}: InfiniteScrollContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const handleScroll = useCallback(() => {
    if (!containerRef.current || loadingRef.current || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    if (distanceFromBottom < threshold) {
      loadingRef.current = true;
      Promise.resolve(onLoadMore()).finally(() => {
        loadingRef.current = false;
      });
    }
  }, [hasMore, onLoadMore, threshold]);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      style={{ height: typeof height === 'number' ? `${height}px` : height }}
      className={`overflow-y-auto ${className}`}
    >
      {children}
      {isLoading && (
        loader || (
          <div className="flex items-center justify-center py-4">
            <svg className="animate-spin h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        )
      )}
      {!hasMore && !isLoading && (endMessage || <div className="py-4 text-center text-gray-500 text-sm">No more items</div>)}
    </div>
  );
}

/**
 * LoadMoreButton - Manual load more trigger
 */
interface LoadMoreButtonProps {
  onClick: () => void | Promise<void>;
  isLoading?: boolean;
  hasMore: boolean;
  loadedCount?: number;
  totalCount?: number;
  className?: string;
}

export function LoadMoreButton({
  onClick,
  isLoading = false,
  hasMore,
  loadedCount,
  totalCount,
  className = '',
}: LoadMoreButtonProps) {
  if (!hasMore) return null;

  return (
    <div className={`flex flex-col items-center gap-3 py-6 ${className}`}>
      {loadedCount !== undefined && totalCount !== undefined && (
        <p className="text-sm text-gray-500">
          Showing {loadedCount} of {totalCount}
        </p>
      )}
      <button
        type="button"
        onClick={onClick}
        disabled={isLoading}
        className={`
          inline-flex items-center gap-2 px-6 py-3 rounded-xl
          bg-gray-800 border border-gray-700
          text-white font-medium
          hover:bg-gray-700 hover:border-gray-600
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all
        `}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Loading...</span>
          </>
        ) : (
          <>
            <span>Load More</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </>
        )}
      </button>
    </div>
  );
}

/**
 * PullToRefresh - Pull down to refresh
 */
interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  isRefreshing?: boolean;
  threshold?: number;
  className?: string;
}

export function PullToRefresh({
  children,
  onRefresh,
  isRefreshing = false,
  threshold = 80,
  className = '',
}: PullToRefreshProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const startY = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling) return;

    const currentY = e.touches[0].clientY;
    const distance = Math.max(0, currentY - startY.current);
    setPullDistance(Math.min(distance * 0.5, threshold * 1.5));
  };

  const handleTouchEnd = async () => {
    if (pullDistance >= threshold && !isRefreshing) {
      await onRefresh();
    }
    setIsPulling(false);
    setPullDistance(0);
  };

  const progress = Math.min(pullDistance / threshold, 1);
  const rotation = progress * 360;

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`relative ${className}`}
    >
      {/* Pull indicator */}
      <div
        className="absolute left-1/2 -translate-x-1/2 z-10 transition-opacity"
        style={{
          top: pullDistance - 40,
          opacity: progress,
        }}
      >
        <div
          className={`
            w-10 h-10 rounded-full bg-gray-800 border border-gray-700
            flex items-center justify-center
            ${isRefreshing ? 'animate-spin' : ''}
          `}
          style={!isRefreshing ? { transform: `rotate(${rotation}deg)` } : undefined}
        >
          <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: isPulling ? 'none' : 'transform 0.3s ease',
        }}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * VirtualList - Virtualized list for large datasets
 */
interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  renderItem: (item: T, index: number) => ReactNode;
  overscan?: number;
  className?: string;
}

export function VirtualList<T>({
  items,
  itemHeight,
  renderItem,
  overscan = 5,
  className = '',
}: VirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      setContainerHeight(entries[0].contentRect.height);
    });
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  const handleScroll = () => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);
    }
  };

  const totalHeight = items.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.floor((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = [];
  for (let i = startIndex; i <= endIndex; i++) {
    visibleItems.push(
      <div
        key={i}
        style={{
          position: 'absolute',
          top: i * itemHeight,
          left: 0,
          right: 0,
          height: itemHeight,
        }}
      >
        {renderItem(items[i], i)}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={`overflow-auto ${className}`}
    >
      <div style={{ position: 'relative', height: totalHeight }}>
        {visibleItems}
      </div>
    </div>
  );
}

/**
 * NFTInfiniteGrid - Infinite scroll for NFT grids
 */
interface NFTInfiniteGridProps<T> {
  items: T[];
  renderItem: (item: T) => ReactNode;
  onLoadMore: () => void | Promise<void>;
  hasMore: boolean;
  isLoading?: boolean;
  columns?: 2 | 3 | 4 | 5;
  className?: string;
}

export function NFTInfiniteGrid<T>({
  items,
  renderItem,
  onLoadMore,
  hasMore,
  isLoading = false,
  columns = 4,
  className = '',
}: NFTInfiniteGridProps<T>) {
  const columnClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
  };

  return (
    <InfiniteScrollComponent
      onLoadMore={onLoadMore}
      hasMore={hasMore}
      isLoading={isLoading}
      className={className}
      loader={
        <div className={`grid ${columnClasses[columns]} gap-6 mt-6`}>
          {[...Array(columns)].map((_, i) => (
            <div key={i} className="bg-gray-800/50 rounded-2xl animate-pulse aspect-square" />
          ))}
        </div>
      }
      endMessage={
        items.length > 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800/50 text-gray-400 text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>All NFTs loaded</span>
            </div>
          </div>
        ) : null
      }
    >
      <div className={`grid ${columnClasses[columns]} gap-6`}>
        {items.map((item, index) => (
          <div key={index}>{renderItem(item)}</div>
        ))}
      </div>
    </InfiniteScrollComponent>
  );
}

/**
 * ScrollProgress - Scroll progress indicator
 */
interface ScrollProgressProps {
  className?: string;
}

export function ScrollProgress({ className = '' }: ScrollProgressProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      const total = scrollHeight - clientHeight;
      const current = (scrollTop / total) * 100;
      setProgress(Math.min(current, 100));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`fixed top-0 left-0 right-0 h-1 bg-gray-800/50 z-50 ${className}`}>
      <div
        className="h-full bg-gradient-to-r from-purple-600 to-pink-500 transition-all duration-100"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

/**
 * BackToTop - Back to top button
 */
interface BackToTopProps {
  threshold?: number;
  className?: string;
}

export function BackToTop({ threshold = 400, className = '' }: BackToTopProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > threshold);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isVisible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      className={`
        fixed bottom-6 right-6 z-50
        p-3 rounded-full
        bg-purple-600 hover:bg-purple-700
        text-white shadow-lg shadow-purple-500/25
        transition-all transform hover:scale-110
        ${className}
      `}
      title="Back to top"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    </button>
  );
}

export default memo(InfiniteScrollComponent);
