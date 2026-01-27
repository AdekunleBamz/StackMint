'use client';

/**
 * ActivityFeed Component
 * Real-time activity feed showing recent NFT transactions
 * @module components/ActivityFeed
 * @version 1.0.0
 */

import { useState, useEffect, memo } from 'react';

// Activity types
type ActivityType = 'mint' | 'sale' | 'listing' | 'offer' | 'transfer' | 'burn';

interface Activity {
  id: string;
  type: ActivityType;
  tokenId: number;
  tokenName: string;
  tokenImage?: string;
  from?: string;
  to?: string;
  price?: number;
  timestamp: Date;
  txHash?: string;
}

interface ActivityFeedProps {
  activities?: Activity[];
  maxItems?: number;
  showFilters?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
  compact?: boolean;
}

// Activity type configuration
const activityConfig: Record<ActivityType, { icon: string; label: string; color: string }> = {
  mint: { icon: '✨', label: 'Minted', color: 'text-purple-400' },
  sale: { icon: '💰', label: 'Sold', color: 'text-green-400' },
  listing: { icon: '🏷️', label: 'Listed', color: 'text-blue-400' },
  offer: { icon: '🤝', label: 'Offer', color: 'text-yellow-400' },
  transfer: { icon: '↔️', label: 'Transferred', color: 'text-orange-400' },
  burn: { icon: '🔥', label: 'Burned', color: 'text-red-400' },
};

// Mock activities for demo
const mockActivities: Activity[] = [
  { id: '1', type: 'sale', tokenId: 42, tokenName: 'Stacks Punk #42', price: 100, from: 'SP1...ABC', to: 'SP2...DEF', timestamp: new Date(Date.now() - 60000) },
  { id: '2', type: 'mint', tokenId: 156, tokenName: 'Bitcoin Art #156', price: 0.01, to: 'SP3...GHI', timestamp: new Date(Date.now() - 120000) },
  { id: '3', type: 'listing', tokenId: 89, tokenName: 'Clarity Dream #89', price: 75, from: 'SP4...JKL', timestamp: new Date(Date.now() - 180000) },
  { id: '4', type: 'offer', tokenId: 42, tokenName: 'Stacks Punk #42', price: 90, from: 'SP5...MNO', timestamp: new Date(Date.now() - 240000) },
  { id: '5', type: 'transfer', tokenId: 33, tokenName: 'Block Hero #33', from: 'SP6...PQR', to: 'SP7...STU', timestamp: new Date(Date.now() - 300000) },
];

function formatAddress(address: string): string {
  if (address.length <= 10) return address;
  return `${address.slice(0, 4)}...${address.slice(-3)}`;
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function ActivityItem({ activity, compact = false }: { activity: Activity; compact?: boolean }) {
  const config = activityConfig[activity.type];
  
  return (
    <div className={`activity-item flex items-center gap-3 py-3 ${compact ? 'py-2' : 'py-3'} border-b border-gray-800/50 last:border-0`}>
      {/* Token Image/Icon */}
      <div className={`relative flex-shrink-0 ${compact ? 'w-10 h-10' : 'w-12 h-12'} rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center overflow-hidden`}>
        {activity.tokenImage ? (
          <img src={activity.tokenImage} alt={activity.tokenName} className="w-full h-full object-cover" />
        ) : (
          <span className="text-xl">🎨</span>
        )}
        {/* Activity type indicator */}
        <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-gray-900 rounded-full flex items-center justify-center text-xs border border-gray-700">
          {config.icon}
        </span>
      </div>
      
      {/* Activity Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
          <span className="text-gray-500 text-xs">•</span>
          <span className="text-gray-500 text-xs">{formatTimeAgo(activity.timestamp)}</span>
        </div>
        <p className="text-sm text-white font-medium truncate">{activity.tokenName}</p>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          {activity.from && (
            <>
              <span>{formatAddress(activity.from)}</span>
              {activity.to && <span className="text-gray-600">→</span>}
            </>
          )}
          {activity.to && <span>{formatAddress(activity.to)}</span>}
        </div>
      </div>
      
      {/* Price */}
      {activity.price !== undefined && (
        <div className="text-right flex-shrink-0">
          <p className="text-sm font-semibold text-white">{activity.price} STX</p>
          <p className="text-xs text-gray-500">${(activity.price * 0.5).toFixed(2)}</p>
        </div>
      )}
    </div>
  );
}

const MemoizedActivityItem = memo(ActivityItem);

export default function ActivityFeed({
  activities = mockActivities,
  maxItems = 10,
  showFilters = true,
  autoRefresh = false,
  refreshInterval = 30000,
  compact = false,
}: ActivityFeedProps) {
  const [filter, setFilter] = useState<ActivityType | 'all'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [displayedActivities, setDisplayedActivities] = useState(activities);

  // Filter activities
  useEffect(() => {
    if (filter === 'all') {
      setDisplayedActivities(activities.slice(0, maxItems));
    } else {
      setDisplayedActivities(
        activities.filter(a => a.type === filter).slice(0, maxItems)
      );
    }
  }, [filter, activities, maxItems]);

  // Auto-refresh simulation
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 500);
    }, refreshInterval);
    
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const filterOptions: { value: ActivityType | 'all'; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'sale', label: 'Sales' },
    { value: 'mint', label: 'Mints' },
    { value: 'listing', label: 'Listings' },
    { value: 'offer', label: 'Offers' },
  ];

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-white">Activity</h3>
          {autoRefresh && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
          )}
        </div>
        
        {isLoading && (
          <svg className="animate-spin h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
      </div>
      
      {/* Filters */}
      {showFilters && (
        <div className="px-4 py-2 border-b border-gray-800/50 flex gap-2 overflow-x-auto scrollbar-hide">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-all ${
                filter === option.value
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
      
      {/* Activity List */}
      <div className="px-4 max-h-96 overflow-y-auto scrollbar-hide">
        {displayedActivities.length > 0 ? (
          displayedActivities.map((activity) => (
            <MemoizedActivityItem key={activity.id} activity={activity} compact={compact} />
          ))
        ) : (
          <div className="py-8 text-center text-gray-500">
            <span className="text-2xl block mb-2">📭</span>
            <p>No activity found</p>
          </div>
        )}
      </div>
      
      {/* View All Link */}
      <div className="px-4 py-3 border-t border-gray-800">
        <button className="w-full text-center text-sm text-purple-400 hover:text-purple-300 transition-colors">
          View all activity →
        </button>
      </div>
    </div>
  );
}

export type { Activity, ActivityType };
