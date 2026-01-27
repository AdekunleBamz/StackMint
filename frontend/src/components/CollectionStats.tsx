'use client';

/**
 * CollectionStats Component
 * Detailed collection statistics and analytics
 * @module components/CollectionStats
 * @version 1.0.0
 */

import { useState } from 'react';

interface CollectionStatsProps {
  stats: {
    floorPrice: number;
    floorChange24h: number;
    totalVolume: number;
    volumeChange24h: number;
    items: number;
    owners: number;
    listed: number;
    avgPrice: number;
    avgPriceChange24h: number;
    royalty?: number;
  };
  className?: string;
  layout?: 'horizontal' | 'grid';
}

export function CollectionStats({
  stats,
  className = '',
  layout = 'horizontal',
}: CollectionStatsProps) {
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  const formatChange = (change: number) => {
    const isPositive = change >= 0;
    return (
      <span className={isPositive ? 'text-green-400' : 'text-red-400'}>
        {isPositive ? '+' : ''}{change.toFixed(1)}%
      </span>
    );
  };

  const listedPercentage = ((stats.listed / stats.items) * 100).toFixed(1);
  const uniqueOwnersPercentage = ((stats.owners / stats.items) * 100).toFixed(1);

  const statItems = [
    {
      label: 'Floor Price',
      value: `${stats.floorPrice.toFixed(2)} STX`,
      change: stats.floorChange24h,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
    },
    {
      label: 'Total Volume',
      value: `${formatNumber(stats.totalVolume)} STX`,
      change: stats.volumeChange24h,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      label: 'Items',
      value: formatNumber(stats.items),
      subtext: `${listedPercentage}% listed`,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      label: 'Owners',
      value: formatNumber(stats.owners),
      subtext: `${uniqueOwnersPercentage}% unique`,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      label: 'Avg. Price',
      value: `${stats.avgPrice.toFixed(2)} STX`,
      change: stats.avgPriceChange24h,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
    },
  ];

  if (stats.royalty !== undefined) {
    statItems.push({
      label: 'Royalty',
      value: `${stats.royalty}%`,
      subtext: 'Creator fee',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    });
  }

  if (layout === 'grid') {
    return (
      <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 ${className}`}>
        {statItems.map((stat, index) => (
          <div
            key={index}
            className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 hover:border-gray-600 transition-colors"
          >
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              {stat.icon}
              <span className="text-xs uppercase tracking-wide">{stat.label}</span>
            </div>
            <p className="text-xl font-bold text-white">{stat.value}</p>
            {stat.change !== undefined && (
              <p className="text-xs mt-1">
                24h: {formatChange(stat.change)}
              </p>
            )}
            {stat.subtext && (
              <p className="text-xs text-gray-500 mt-1">{stat.subtext}</p>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap gap-6 md:gap-8 ${className}`}>
      {statItems.map((stat, index) => (
        <div key={index} className="min-w-[100px]">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
            {stat.label}
          </p>
          <p className="text-lg font-bold text-white">{stat.value}</p>
          {stat.change !== undefined && (
            <p className="text-xs mt-0.5">
              {formatChange(stat.change)}
            </p>
          )}
          {stat.subtext && (
            <p className="text-xs text-gray-500 mt-0.5">{stat.subtext}</p>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Collection price chart placeholder
 */
interface PriceChartProps {
  data: { date: Date; price: number; volume: number }[];
  className?: string;
}

export function CollectionPriceChart({ data, className = '' }: PriceChartProps) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  // Simple visualization without external chart library
  const maxPrice = Math.max(...data.map((d) => d.price));
  const minPrice = Math.min(...data.map((d) => d.price));
  const priceRange = maxPrice - minPrice;

  return (
    <div className={`bg-gray-800/50 rounded-xl p-4 border border-gray-700 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-white">Price History</h3>
        <div className="flex gap-1">
          {(['7d', '30d', '90d', 'all'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                timeRange === range
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-400 hover:bg-gray-700'
              }`}
            >
              {range === 'all' ? 'All' : range.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Simple line chart */}
      <div className="h-48 flex items-end gap-1">
        {data.slice(-30).map((point, index) => {
          const height = ((point.price - minPrice) / priceRange) * 100;
          return (
            <div
              key={index}
              className="flex-1 bg-primary-500/50 hover:bg-primary-500 rounded-t transition-colors cursor-pointer group relative"
              style={{ height: `${Math.max(height, 5)}%` }}
            >
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 rounded-lg p-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                <p className="text-white font-medium">{point.price.toFixed(2)} STX</p>
                <p className="text-gray-400">{point.date.toLocaleDateString()}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700 text-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary-500" />
            <span className="text-gray-400">Floor Price</span>
          </div>
        </div>
        <div className="text-gray-400">
          Min: {minPrice.toFixed(2)} • Max: {maxPrice.toFixed(2)} STX
        </div>
      </div>
    </div>
  );
}

/**
 * Collection activity summary
 */
interface ActivitySummaryProps {
  sales24h: number;
  volume24h: number;
  avgSalePrice: number;
  className?: string;
}

export function ActivitySummary({
  sales24h,
  volume24h,
  avgSalePrice,
  className = '',
}: ActivitySummaryProps) {
  return (
    <div className={`flex items-center gap-6 p-4 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 rounded-xl border border-primary-500/20 ${className}`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
          <svg className="w-5 h-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <div>
          <p className="text-sm text-gray-400">24h Sales</p>
          <p className="text-xl font-bold text-white">{sales24h}</p>
        </div>
      </div>

      <div className="w-px h-10 bg-gray-700" />

      <div>
        <p className="text-sm text-gray-400">24h Volume</p>
        <p className="text-xl font-bold text-primary-400">{volume24h.toLocaleString()} STX</p>
      </div>

      <div className="w-px h-10 bg-gray-700" />

      <div>
        <p className="text-sm text-gray-400">Avg. Sale</p>
        <p className="text-xl font-bold text-white">{avgSalePrice.toFixed(2)} STX</p>
      </div>
    </div>
  );
}

export default CollectionStats;
