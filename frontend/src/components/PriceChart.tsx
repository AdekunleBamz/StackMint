'use client';

/**
 * PriceChart Component
 * Interactive price history chart for NFT collections
 * @module components/PriceChart
 * @version 1.0.0
 */

import React, { useState, useMemo, useRef, useCallback } from 'react';

// Types
export interface PriceDataPoint {
  date: Date;
  price: number;
  volume?: number;
}

interface PriceChartProps {
  data: PriceDataPoint[];
  period?: '24h' | '7d' | '30d' | '90d' | 'all';
  showVolume?: boolean;
  height?: number;
  className?: string;
  onPeriodChange?: (period: '24h' | '7d' | '30d' | '90d' | 'all') => void;
}

// Format date for axis
function formatAxisDate(date: Date, period: string): string {
  if (period === '24h') {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }
  if (period === '7d') {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Calculate percentage change
function calculateChange(data: PriceDataPoint[]): { value: number; isPositive: boolean } {
  if (data.length < 2) return { value: 0, isPositive: true };
  
  const first = data[0].price;
  const last = data[data.length - 1].price;
  const change = ((last - first) / first) * 100;
  
  return { value: Math.abs(change), isPositive: change >= 0 };
}

export function PriceChart({
  data,
  period = '7d',
  showVolume = true,
  height = 300,
  className = '',
  onPeriodChange,
}: PriceChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const periods: { value: typeof period; label: string }[] = [
    { value: '24h', label: '24H' },
    { value: '7d', label: '7D' },
    { value: '30d', label: '30D' },
    { value: '90d', label: '90D' },
    { value: 'all', label: 'ALL' },
  ];

  // Calculate chart dimensions
  const chartHeight = showVolume ? height - 60 : height - 30;
  const volumeHeight = 50;

  // Calculate min/max values
  const { minPrice, maxPrice, maxVolume, priceRange } = useMemo(() => {
    const prices = data.map((d) => d.price);
    const volumes = data.map((d) => d.volume || 0);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min || 1;
    
    return {
      minPrice: min - range * 0.1,
      maxPrice: max + range * 0.1,
      maxVolume: Math.max(...volumes),
      priceRange: max - min,
    };
  }, [data]);

  // Generate SVG path
  const linePath = useMemo(() => {
    if (data.length < 2) return '';
    
    const width = 100; // Using percentage
    const pointWidth = width / (data.length - 1);
    
    return data
      .map((point, i) => {
        const x = i * pointWidth;
        const y = 100 - ((point.price - minPrice) / (maxPrice - minPrice)) * 100;
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  }, [data, minPrice, maxPrice]);

  // Area path (for gradient fill)
  const areaPath = useMemo(() => {
    if (data.length < 2) return '';
    return `${linePath} L 100 100 L 0 100 Z`;
  }, [linePath]);

  // Handle mouse move
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const index = Math.round(percentage * (data.length - 1));
    
    setHoveredIndex(Math.max(0, Math.min(data.length - 1, index)));
  }, [data.length]);

  const change = useMemo(() => calculateChange(data), [data]);
  const currentPrice = hoveredIndex !== null ? data[hoveredIndex] : data[data.length - 1];

  if (data.length === 0) {
    return (
      <div className={`bg-gray-900 rounded-xl p-6 text-center ${className}`}>
        <p className="text-gray-400">No price data available</p>
      </div>
    );
  }

  return (
    <div className={`bg-gray-900 rounded-xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm text-gray-400">Floor Price</h3>
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-bold text-white">
                {currentPrice?.price.toFixed(2)} STX
              </span>
              <span
                className={`
                  text-sm font-medium
                  ${change.isPositive ? 'text-green-400' : 'text-red-400'}
                `}
              >
                {change.isPositive ? '+' : '-'}{change.value.toFixed(2)}%
              </span>
            </div>
          </div>

          {/* Period selector */}
          <div className="flex gap-1 bg-gray-800 rounded-lg p-1">
            {periods.map((p) => (
              <button
                key={p.value}
                onClick={() => onPeriodChange?.(p.value)}
                className={`
                  px-3 py-1 text-sm rounded-md transition-colors
                  ${period === p.value
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-400 hover:text-white'
                  }
                `}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Hovered date */}
        {hoveredIndex !== null && currentPrice && (
          <p className="text-xs text-gray-500 mt-1">
            {currentPrice.date.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        )}
      </div>

      {/* Chart */}
      <div
        ref={containerRef}
        className="relative px-4 py-2"
        style={{ height }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredIndex(null)}
      >
        {/* Price chart */}
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="w-full"
          style={{ height: chartHeight }}
        >
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor={change.isPositive ? '#22c55e' : '#ef4444'}
                stopOpacity="0.3"
              />
              <stop
                offset="100%"
                stopColor={change.isPositive ? '#22c55e' : '#ef4444'}
                stopOpacity="0"
              />
            </linearGradient>
          </defs>

          {/* Area fill */}
          <path
            d={areaPath}
            fill="url(#priceGradient)"
          />

          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke={change.isPositive ? '#22c55e' : '#ef4444'}
            strokeWidth="0.5"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* Volume bars */}
        {showVolume && (
          <div
            className="flex items-end gap-px mt-2"
            style={{ height: volumeHeight }}
          >
            {data.map((point, i) => {
              const volumePercent = maxVolume > 0 
                ? ((point.volume || 0) / maxVolume) * 100 
                : 0;
              
              return (
                <div
                  key={i}
                  className={`
                    flex-1 rounded-t transition-colors
                    ${hoveredIndex === i ? 'bg-primary-500' : 'bg-gray-700'}
                  `}
                  style={{ height: `${volumePercent}%` }}
                />
              );
            })}
          </div>
        )}

        {/* Hover line */}
        {hoveredIndex !== null && (
          <div
            className="absolute top-0 w-px bg-gray-500"
            style={{
              left: `${(hoveredIndex / (data.length - 1)) * 100}%`,
              height: chartHeight,
            }}
          />
        )}

        {/* Hover point */}
        {hoveredIndex !== null && (
          <div
            className="absolute w-3 h-3 rounded-full bg-white border-2 border-primary-500"
            style={{
              left: `calc(${(hoveredIndex / (data.length - 1)) * 100}% - 6px)`,
              top: `${((maxPrice - data[hoveredIndex].price) / (maxPrice - minPrice)) * chartHeight}px`,
            }}
          />
        )}
      </div>

      {/* X-axis labels */}
      <div className="px-4 pb-2 flex justify-between text-xs text-gray-500">
        {[0, Math.floor(data.length / 2), data.length - 1].map((i) => (
          <span key={i}>{formatAxisDate(data[i].date, period)}</span>
        ))}
      </div>
    </div>
  );
}

// Mini price sparkline
interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  className?: string;
}

export function Sparkline({
  data,
  width = 80,
  height = 24,
  color,
  className = '',
}: SparklineProps) {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const path = data
    .map((value, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  const isPositive = data[data.length - 1] >= data[0];
  const strokeColor = color || (isPositive ? '#22c55e' : '#ef4444');

  return (
    <svg
      width={width}
      height={height}
      className={className}
    >
      <path
        d={path}
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default PriceChart;
