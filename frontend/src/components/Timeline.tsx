'use client';

/**
 * Timeline Component
 * Activity and event timeline display
 * @module components/Timeline
 * @version 1.0.0
 */

import React from 'react';

// Types
interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  timestamp: Date | string;
  type: 'mint' | 'sale' | 'transfer' | 'list' | 'offer' | 'bid' | 'cancel' | 'update';
  icon?: React.ReactNode;
  user?: {
    address: string;
    avatar?: string;
  };
  metadata?: {
    price?: number;
    tokenId?: number;
    collection?: string;
    txHash?: string;
  };
}

interface TimelineProps {
  events: TimelineEvent[];
  variant?: 'default' | 'compact' | 'detailed';
  showConnector?: boolean;
  animated?: boolean;
  maxItems?: number;
  className?: string;
}

// Icons for event types
const EventIcons: Record<TimelineEvent['type'], React.ReactNode> = {
  mint: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  ),
  sale: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  transfer: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  ),
  list: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  ),
  offer: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  bid: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  cancel: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  update: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
};

// Event type colors
const eventColors: Record<TimelineEvent['type'], string> = {
  mint: 'bg-green-500',
  sale: 'bg-purple-500',
  transfer: 'bg-blue-500',
  list: 'bg-yellow-500',
  offer: 'bg-pink-500',
  bid: 'bg-orange-500',
  cancel: 'bg-red-500',
  update: 'bg-cyan-500',
};

// Event type labels
const eventLabels: Record<TimelineEvent['type'], string> = {
  mint: 'Minted',
  sale: 'Sold',
  transfer: 'Transferred',
  list: 'Listed',
  offer: 'Offer Made',
  bid: 'Bid Placed',
  cancel: 'Cancelled',
  update: 'Updated',
};

/**
 * Format relative time
 */
function formatTimeAgo(date: Date | string): string {
  const now = new Date();
  const eventDate = typeof date === 'string' ? new Date(date) : date;
  const seconds = Math.floor((now.getTime() - eventDate.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return eventDate.toLocaleDateString();
}

/**
 * Truncate address
 */
function truncateAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Main Timeline Component
 */
export function Timeline({
  events,
  variant = 'default',
  showConnector = true,
  animated = true,
  maxItems,
  className = '',
}: TimelineProps) {
  const displayEvents = maxItems ? events.slice(0, maxItems) : events;

  if (variant === 'compact') {
    return (
      <div className={`space-y-2 ${className}`}>
        {displayEvents.map((event, index) => (
          <div
            key={event.id}
            className={`
              flex items-center gap-3 p-2 rounded-lg bg-zinc-800/50
              ${animated ? 'animate-fadeIn' : ''}
            `}
            style={animated ? { animationDelay: `${index * 50}ms` } : undefined}
          >
            <div className={`p-1.5 rounded-full ${eventColors[event.type]}`}>
              {event.icon || EventIcons[event.type]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">
                {eventLabels[event.type]}
                {event.metadata?.price && (
                  <span className="text-purple-400 ml-1">
                    {event.metadata.price} STX
                  </span>
                )}
              </p>
            </div>
            <span className="text-xs text-zinc-500">
              {formatTimeAgo(event.timestamp)}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Connector line */}
      {showConnector && displayEvents.length > 1 && (
        <div className="absolute left-4 top-8 bottom-8 w-0.5 bg-zinc-700" />
      )}

      <div className="space-y-6">
        {displayEvents.map((event, index) => (
          <div
            key={event.id}
            className={`
              relative flex gap-4
              ${animated ? 'animate-slideIn' : ''}
            `}
            style={animated ? { animationDelay: `${index * 100}ms` } : undefined}
          >
            {/* Event indicator */}
            <div
              className={`
                relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-white
                ${eventColors[event.type]}
              `}
            >
              {event.icon || EventIcons[event.type]}
            </div>

            {/* Event content */}
            <div
              className={`
                flex-1 bg-zinc-800/50 rounded-xl p-4 border border-zinc-700/50
                ${variant === 'detailed' ? 'space-y-3' : ''}
              `}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-white font-medium">
                    {event.title || eventLabels[event.type]}
                  </p>
                  {event.description && (
                    <p className="text-zinc-400 text-sm mt-1">{event.description}</p>
                  )}
                </div>
                <span className="text-xs text-zinc-500 whitespace-nowrap">
                  {formatTimeAgo(event.timestamp)}
                </span>
              </div>

              {/* Metadata */}
              {variant === 'detailed' && event.metadata && (
                <div className="flex flex-wrap gap-4 pt-2 border-t border-zinc-700/50">
                  {event.metadata.price !== undefined && (
                    <div>
                      <p className="text-xs text-zinc-500">Price</p>
                      <p className="text-sm text-purple-400 font-medium">
                        {event.metadata.price} STX
                      </p>
                    </div>
                  )}
                  {event.metadata.tokenId !== undefined && (
                    <div>
                      <p className="text-xs text-zinc-500">Token ID</p>
                      <p className="text-sm text-white">#{event.metadata.tokenId}</p>
                    </div>
                  )}
                  {event.metadata.collection && (
                    <div>
                      <p className="text-xs text-zinc-500">Collection</p>
                      <p className="text-sm text-white">{event.metadata.collection}</p>
                    </div>
                  )}
                  {event.metadata.txHash && (
                    <div>
                      <p className="text-xs text-zinc-500">Transaction</p>
                      <a
                        href={`https://explorer.stacks.co/txid/${event.metadata.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-purple-400 hover:text-purple-300"
                      >
                        View on Explorer ↗
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* User info */}
              {event.user && (
                <div className="flex items-center gap-2 pt-2">
                  {event.user.avatar ? (
                    <img
                      src={event.user.avatar}
                      alt=""
                      className="w-5 h-5 rounded-full"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
                  )}
                  <span className="text-xs text-zinc-400">
                    {truncateAddress(event.user.address)}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Show more */}
      {maxItems && events.length > maxItems && (
        <div className="mt-4 text-center">
          <button className="text-purple-400 hover:text-purple-300 text-sm">
            Show {events.length - maxItems} more events
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Timeline Item - For custom timeline content
 */
interface TimelineItemProps {
  icon?: React.ReactNode;
  iconColor?: string;
  time?: string;
  isLast?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function TimelineItem({
  icon,
  iconColor = 'bg-purple-500',
  time,
  isLast = false,
  children,
  className = '',
}: TimelineItemProps) {
  return (
    <div className={`relative flex gap-4 ${className}`}>
      {/* Connector */}
      {!isLast && (
        <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-zinc-700" />
      )}

      {/* Icon */}
      <div
        className={`
          relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-white
          ${iconColor}
        `}
      >
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 pb-6">
        {time && (
          <p className="text-xs text-zinc-500 mb-1">{time}</p>
        )}
        {children}
      </div>
    </div>
  );
}

/**
 * Activity Timeline Widget
 */
interface ActivityTimelineProps {
  title?: string;
  events: TimelineEvent[];
  maxItems?: number;
  onViewAll?: () => void;
  className?: string;
}

export function ActivityTimeline({
  title = 'Recent Activity',
  events,
  maxItems = 5,
  onViewAll,
  className = '',
}: ActivityTimelineProps) {
  return (
    <div className={`bg-zinc-800/50 rounded-xl border border-zinc-700/50 ${className}`}>
      <div className="flex items-center justify-between p-4 border-b border-zinc-700/50">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-sm text-purple-400 hover:text-purple-300"
          >
            View All
          </button>
        )}
      </div>

      <div className="p-4">
        {events.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-zinc-500">No activity yet</p>
          </div>
        ) : (
          <Timeline
            events={events}
            variant="compact"
            maxItems={maxItems}
            showConnector={false}
          />
        )}
      </div>
    </div>
  );
}

/**
 * NFT History Timeline
 */
interface NFTHistoryProps {
  tokenId: number;
  history: TimelineEvent[];
  className?: string;
}

export function NFTHistory({ tokenId, history, className = '' }: NFTHistoryProps) {
  return (
    <div className={className}>
      <h3 className="text-lg font-semibold text-white mb-4">
        Item History
      </h3>

      {history.length === 0 ? (
        <div className="text-center py-8 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
          <p className="text-zinc-500">No history available</p>
        </div>
      ) : (
        <Timeline
          events={history}
          variant="detailed"
          animated
        />
      )}
    </div>
  );
}

export default Timeline;
