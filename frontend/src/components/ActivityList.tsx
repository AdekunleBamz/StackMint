'use client';

/**
 * ActivityList Component
 * Real-time activity feed for NFT transactions
 * @module components/ActivityList
 * @version 1.0.0
 */

import { useState, useMemo } from 'react';

/** Activity types */
type ActivityType = 'sale' | 'listing' | 'offer' | 'transfer' | 'mint' | 'cancel' | 'bid';

interface Activity {
  id: string;
  type: ActivityType;
  nftName: string;
  nftImage?: string;
  collection: string;
  price?: number;
  from: string;
  to?: string;
  timestamp: Date;
  txId?: string;
}

interface ActivityListProps {
  /** List of activities */
  activities: Activity[];
  /** Show filters */
  showFilters?: boolean;
  /** Compact mode */
  compact?: boolean;
  /** Maximum items to show */
  limit?: number;
  /** Custom className */
  className?: string;
  /** Callback for load more */
  onLoadMore?: () => void;
  /** Whether more items are available */
  hasMore?: boolean;
  /** Loading state */
  isLoading?: boolean;
  /** Empty state message */
  emptyMessage?: string;
}

const activityConfig: Record<ActivityType, { label: string; icon: string; color: string }> = {
  sale: { label: 'Sale', icon: '💰', color: 'text-green-400' },
  listing: { label: 'Listed', icon: '🏷️', color: 'text-blue-400' },
  offer: { label: 'Offer', icon: '💬', color: 'text-purple-400' },
  transfer: { label: 'Transfer', icon: '↗️', color: 'text-orange-400' },
  mint: { label: 'Minted', icon: '✨', color: 'text-pink-400' },
  cancel: { label: 'Cancelled', icon: '❌', color: 'text-gray-400' },
  bid: { label: 'Bid', icon: '🔨', color: 'text-yellow-400' },
};

const filterOptions: { id: ActivityType | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'sale', label: 'Sales' },
  { id: 'listing', label: 'Listings' },
  { id: 'offer', label: 'Offers' },
  { id: 'transfer', label: 'Transfers' },
  { id: 'mint', label: 'Mints' },
];

export default function ActivityList({
  activities,
  showFilters = true,
  compact = false,
  limit,
  className = '',
  onLoadMore,
  hasMore = false,
  isLoading = false,
  emptyMessage = 'No activity yet',
}: ActivityListProps) {
  const [filter, setFilter] = useState<ActivityType | 'all'>('all');

  const truncateAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const filteredActivities = useMemo(() => {
    let filtered = filter === 'all' 
      ? activities 
      : activities.filter(a => a.type === filter);
    
    if (limit) {
      filtered = filtered.slice(0, limit);
    }
    
    return filtered;
  }, [activities, filter, limit]);

  return (
    <div className={`${className}`}>
      {/* Filters */}
      {showFilters && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
          {filterOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setFilter(option.id)}
              className={`
                px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors
                ${filter === option.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                }
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      {/* Activity list */}
      <div className="space-y-2">
        {filteredActivities.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <span className="text-4xl mb-3 block">📭</span>
            <p>{emptyMessage}</p>
          </div>
        ) : (
          filteredActivities.map((activity) => {
            const config = activityConfig[activity.type];

            // Compact mode
            if (compact) {
              return (
                <div
                  key={activity.id}
                  className="flex items-center gap-3 p-2 hover:bg-gray-800/50 rounded-lg transition-colors"
                >
                  <span className="text-lg">{config.icon}</span>
                  <div className="flex-1 min-w-0">
                    <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
                    <span className="text-sm text-gray-400 ml-2 truncate">{activity.nftName}</span>
                  </div>
                  {activity.price && (
                    <span className="text-sm font-medium text-white">{activity.price} STX</span>
                  )}
                  <span className="text-xs text-gray-500">{formatTimeAgo(activity.timestamp)}</span>
                </div>
              );
            }

            // Full mode
            return (
              <div
                key={activity.id}
                className="flex items-center gap-4 p-4 bg-gray-800/30 hover:bg-gray-800/50 border border-gray-800 rounded-xl transition-colors"
              >
                {/* NFT Image */}
                <div className="flex-shrink-0">
                  {activity.nftImage ? (
                    <img
                      src={activity.nftImage}
                      alt={activity.nftName}
                      className="w-14 h-14 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-xl">
                      🎨
                    </div>
                  )}
                </div>

                {/* Activity info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{config.icon}</span>
                    <span className={`text-sm font-semibold ${config.color}`}>{config.label}</span>
                  </div>
                  <div className="text-white font-medium truncate">{activity.nftName}</div>
                  <div className="text-sm text-gray-400 truncate">{activity.collection}</div>
                </div>

                {/* Price */}
                {activity.price && (
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">{activity.price} STX</div>
                    <div className="text-xs text-gray-400">≈ ${(activity.price * 0.85).toFixed(2)}</div>
                  </div>
                )}

                {/* Addresses */}
                <div className="hidden md:block text-right">
                  <div className="text-sm">
                    <span className="text-gray-400">From: </span>
                    <a href={`/profile/${activity.from}`} className="text-purple-400 hover:text-purple-300 font-mono transition-colors">
                      {truncateAddress(activity.from)}
                    </a>
                  </div>
                  {activity.to && (
                    <div className="text-sm">
                      <span className="text-gray-400">To: </span>
                      <a href={`/profile/${activity.to}`} className="text-purple-400 hover:text-purple-300 font-mono transition-colors">
                        {truncateAddress(activity.to)}
                      </a>
                    </div>
                  )}
                </div>

                {/* Timestamp & Explorer link */}
                <div className="text-right">
                  <div className="text-sm text-gray-500">{formatTimeAgo(activity.timestamp)}</div>
                  {activity.txId && (
                    <a
                      href={`https://explorer.hiro.so/txid/${activity.txId}?chain=mainnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-gray-400 hover:text-purple-400 transition-colors"
                    >
                      View TX ↗
                    </a>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center py-6">
            <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Load more button */}
        {hasMore && !isLoading && onLoadMore && (
          <button
            onClick={onLoadMore}
            className="w-full py-3 text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
          >
            Load More
          </button>
        )}
      </div>
    </div>
  );
}

// Compact variant export
export function ActivityListCompact(props: Omit<ActivityListProps, 'compact'>) {
  return <ActivityList {...props} compact showFilters={false} />;
}
