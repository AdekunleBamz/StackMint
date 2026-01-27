'use client';

/**
 * Masonry Grid Component
 * Pinterest-style masonry layout for NFT galleries
 * @module components/MasonryGrid
 * @version 1.0.0
 */

import { useState, useEffect, useRef, useCallback, ReactNode } from 'react';

interface MasonryItem {
  id: string;
  height?: number;
  aspectRatio?: number;
}

interface MasonryGridProps<T extends MasonryItem> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  columns?: number | { sm?: number; md?: number; lg?: number; xl?: number };
  gap?: number;
  className?: string;
  onItemClick?: (item: T, index: number) => void;
}

export function MasonryGrid<T extends MasonryItem>({
  items,
  renderItem,
  columns = { sm: 2, md: 3, lg: 4, xl: 5 },
  gap = 16,
  className = '',
  onItemClick,
}: MasonryGridProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [columnCount, setColumnCount] = useState(
    typeof columns === 'number' ? columns : 3
  );

  // Responsive column count
  useEffect(() => {
    if (typeof columns === 'number') {
      setColumnCount(columns);
      return;
    }

    const updateColumns = () => {
      const width = window.innerWidth;
      if (width >= 1280 && columns.xl) {
        setColumnCount(columns.xl);
      } else if (width >= 1024 && columns.lg) {
        setColumnCount(columns.lg);
      } else if (width >= 768 && columns.md) {
        setColumnCount(columns.md);
      } else if (columns.sm) {
        setColumnCount(columns.sm);
      } else {
        setColumnCount(2);
      }
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, [columns]);

  // Distribute items into columns
  const distributeItems = useCallback(() => {
    const columnHeights = Array(columnCount).fill(0);
    const columnItems: T[][] = Array.from({ length: columnCount }, () => []);

    items.forEach((item) => {
      // Find the shortest column
      const shortestColumn = columnHeights.indexOf(Math.min(...columnHeights));
      
      // Add item to shortest column
      columnItems[shortestColumn].push(item);
      
      // Update column height (use aspect ratio or default)
      const itemHeight = item.height || (item.aspectRatio ? 200 / item.aspectRatio : 200);
      columnHeights[shortestColumn] += itemHeight + gap;
    });

    return columnItems;
  }, [items, columnCount, gap]);

  const columnItems = distributeItems();

  return (
    <div
      ref={containerRef}
      className={`grid ${className}`}
      style={{
        gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
        gap: `${gap}px`,
      }}
    >
      {columnItems.map((column, columnIndex) => (
        <div
          key={columnIndex}
          className="flex flex-col"
          style={{ gap: `${gap}px` }}
        >
          {column.map((item, itemIndex) => (
            <div
              key={item.id}
              onClick={() => onItemClick?.(item, itemIndex)}
              className={onItemClick ? 'cursor-pointer' : ''}
            >
              {renderItem(item, items.indexOf(item))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Animated Masonry Item wrapper
 */
interface MasonryItemWrapperProps {
  children: ReactNode;
  index: number;
  className?: string;
}

export function MasonryItemWrapper({
  children,
  index,
  className = '',
}: MasonryItemWrapperProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`
        transition-all duration-500 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
        ${className}
      `}
      style={{
        transitionDelay: `${(index % 6) * 100}ms`,
      }}
    >
      {children}
    </div>
  );
}

/**
 * NFT Masonry Grid with built-in card styling
 */
interface NFTMasonryItem extends MasonryItem {
  name: string;
  image: string;
  price?: number;
  collection?: string;
}

interface NFTMasonryGridProps {
  items: NFTMasonryItem[];
  columns?: number | { sm?: number; md?: number; lg?: number; xl?: number };
  gap?: number;
  className?: string;
  onItemClick?: (item: NFTMasonryItem) => void;
  showPrice?: boolean;
}

export function NFTMasonryGrid({
  items,
  columns = { sm: 2, md: 3, lg: 4, xl: 5 },
  gap = 16,
  className = '',
  onItemClick,
  showPrice = true,
}: NFTMasonryGridProps) {
  return (
    <MasonryGrid
      items={items}
      columns={columns}
      gap={gap}
      className={className}
      onItemClick={onItemClick}
      renderItem={(item, index) => (
        <MasonryItemWrapper index={index}>
          <div className="group relative bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-primary-500 transition-all duration-300">
            {/* Image */}
            <div className="relative overflow-hidden">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Quick action buttons */}
              <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                <button className="flex-1 bg-primary-500 hover:bg-primary-600 text-white text-sm py-2 rounded-lg font-medium transition-colors">
                  Buy Now
                </button>
                <button className="p-2 bg-gray-900/80 hover:bg-gray-800 rounded-lg transition-colors">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Info */}
            <div className="p-3">
              <h3 className="font-medium text-white truncate group-hover:text-primary-400 transition-colors">
                {item.name}
              </h3>
              
              {item.collection && (
                <p className="text-xs text-gray-500 truncate mt-0.5">
                  {item.collection}
                </p>
              )}
              
              {showPrice && item.price !== undefined && (
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-400">Price</span>
                  <span className="text-primary-400 font-medium">
                    {item.price.toFixed(2)} STX
                  </span>
                </div>
              )}
            </div>
          </div>
        </MasonryItemWrapper>
      )}
    />
  );
}

export default MasonryGrid;
