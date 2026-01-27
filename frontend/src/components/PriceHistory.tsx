'use client';

/**
 * PriceHistory Component
 * Interactive price history chart for NFTs
 * @module components/PriceHistory
 * @version 1.0.0
 */

import { useState, useMemo, memo } from 'react';

// Time range options
type TimeRange = '24h' | '7d' | '30d' | '90d' | 'all';

interface PricePoint {
  timestamp: Date;
  price: number;
  volume?: number;
}

interface PriceHistoryProps {
  data?: PricePoint[];
  currentPrice?: number;
  currency?: string;
  showVolume?: boolean;
  height?: number;
}

// Mock data generator
function generateMockData(days: number): PricePoint[] {
  const data: PricePoint[] = [];
  const now = Date.now();
  const basePrice = 50;
  
  for (let i = days; i >= 0; i--) {
    const randomChange = (Math.random() - 0.5) * 10;
    const trend = Math.sin(i / 10) * 15;
    data.push({
      timestamp: new Date(now - i * 24 * 60 * 60 * 1000),
      price: Math.max(10, basePrice + trend + randomChange + (days - i) * 0.5),
      volume: Math.floor(Math.random() * 1000) + 100,
    });
  }
  return data;
}

const timeRangeConfig: Record<TimeRange, { label: string; days: number }> = {
  '24h': { label: '24H', days: 1 },
  '7d': { label: '7D', days: 7 },
  '30d': { label: '30D', days: 30 },
  '90d': { label: '90D', days: 90 },
  'all': { label: 'All', days: 365 },
};

function MiniChart({ data, height = 80, positive = true }: { data: PricePoint[]; height?: number; positive?: boolean }) {
  if (data.length < 2) return null;
  
  const prices = data.map(d => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const range = maxPrice - minPrice || 1;
  
  // Generate SVG path
  const width = 100;
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((d.price - minPrice) / range) * (height - 10) - 5;
    return `${x},${y}`;
  });
  
  const linePath = `M ${points.join(' L ')}`;
  const areaPath = `${linePath} L ${width},${height} L 0,${height} Z`;
  
  const gradientId = `gradient-${positive ? 'up' : 'down'}`;
  const strokeColor = positive ? '#22c55e' : '#ef4444';
  const fillColor = positive ? 'url(#gradient-up)' : 'url(#gradient-down)';
  
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="gradient-up" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="gradient-down" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={fillColor} />
      <path d={linePath} fill="none" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StatCard({ label, value, change, prefix = '' }: { label: string; value: string; change?: number; prefix?: string }) {
  return (
    <div className="bg-gray-800/30 rounded-xl p-3">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-lg font-bold text-white">{prefix}{value}</p>
      {change !== undefined && (
        <p className={`text-xs font-medium ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {change >= 0 ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
        </p>
      )}
    </div>
  );
}

function PriceHistoryComponent({
  data,
  currentPrice = 75,
  currency = 'STX',
  showVolume = true,
  height = 200,
}: PriceHistoryProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [hoveredPoint, setHoveredPoint] = useState<PricePoint | null>(null);
  
  // Generate or filter data based on time range
  const chartData = useMemo(() => {
    if (data) {
      const cutoff = Date.now() - timeRangeConfig[timeRange].days * 24 * 60 * 60 * 1000;
      return data.filter(d => d.timestamp.getTime() >= cutoff);
    }
    return generateMockData(timeRangeConfig[timeRange].days);
  }, [data, timeRange]);
  
  // Calculate statistics
  const stats = useMemo(() => {
    if (chartData.length === 0) return null;
    
    const prices = chartData.map(d => d.price);
    const volumes = chartData.map(d => d.volume || 0);
    const firstPrice = prices[0];
    const lastPrice = prices[prices.length - 1];
    const change = ((lastPrice - firstPrice) / firstPrice) * 100;
    
    return {
      high: Math.max(...prices),
      low: Math.min(...prices),
      avg: prices.reduce((a, b) => a + b, 0) / prices.length,
      change,
      volume: volumes.reduce((a, b) => a + b, 0),
      isPositive: change >= 0,
    };
  }, [chartData]);
  
  if (!stats) return null;
  
  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-400">Current Price</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">{currentPrice} {currency}</span>
              <span className={`text-sm font-medium ${stats.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {stats.isPositive ? '+' : ''}{stats.change.toFixed(2)}%
              </span>
            </div>
          </div>
          
          {/* Time range selector */}
          <div className="flex gap-1 bg-gray-800/50 rounded-lg p-1">
            {Object.entries(timeRangeConfig).map(([key, { label }]) => (
              <button
                key={key}
                onClick={() => setTimeRange(key as TimeRange)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  timeRange === key
                    ? 'bg-purple-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-3">
          <StatCard label="24h High" value={stats.high.toFixed(2)} prefix="" />
          <StatCard label="24h Low" value={stats.low.toFixed(2)} prefix="" />
          <StatCard label="Avg Price" value={stats.avg.toFixed(2)} prefix="" />
          {showVolume && <StatCard label="Volume" value={`${(stats.volume / 1000).toFixed(1)}K`} prefix="" />}
        </div>
      </div>
      
      {/* Chart */}
      <div className="p-4">
        <div style={{ height: `${height}px` }} className="relative">
          <MiniChart data={chartData} height={height} positive={stats.isPositive} />
          
          {/* Hover tooltip */}
          {hoveredPoint && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-gray-800 rounded-lg px-3 py-2 text-sm shadow-lg border border-gray-700">
              <p className="text-white font-medium">{hoveredPoint.price.toFixed(2)} {currency}</p>
              <p className="text-gray-400 text-xs">{hoveredPoint.timestamp.toLocaleDateString()}</p>
            </div>
          )}
        </div>
        
        {/* X-axis labels */}
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>{chartData[0]?.timestamp.toLocaleDateString()}</span>
          <span>{chartData[chartData.length - 1]?.timestamp.toLocaleDateString()}</span>
        </div>
      </div>
      
      {/* Volume bars (optional) */}
      {showVolume && (
        <div className="px-4 pb-4">
          <p className="text-xs text-gray-500 mb-2">Volume</p>
          <div className="flex items-end gap-0.5 h-12">
            {chartData.slice(-30).map((d, i) => {
              const maxVol = Math.max(...chartData.slice(-30).map(x => x.volume || 0));
              const h = ((d.volume || 0) / maxVol) * 100;
              return (
                <div
                  key={i}
                  className="flex-1 bg-purple-500/30 hover:bg-purple-500/50 transition-colors rounded-t"
                  style={{ height: `${h}%` }}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(PriceHistoryComponent);
export type { PricePoint, TimeRange };
