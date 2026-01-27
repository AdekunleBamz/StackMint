'use client';

/**
 * BidHistory Component
 * Historical bids display for auction items
 * @module components/BidHistory
 * @version 1.0.0
 */

import React, { useState } from 'react';

// Types
export interface Bid {
  id: string;
  bidder: string;
  amount: number;
  timestamp: Date;
  status: 'active' | 'outbid' | 'cancelled' | 'won';
  txId?: string;
}

interface BidHistoryProps {
  bids: Bid[];
  currentUserAddress?: string;
  showAll?: boolean;
  maxDisplay?: number;
  className?: string;
  onBidderClick?: (address: string) => void;
}

// Truncate address
function truncateAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Format time ago
function timeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

// Status badge
const statusStyles: Record<Bid['status'], { bg: string; text: string; label: string }> = {
  active: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Active' },
  outbid: { bg: 'bg-gray-500/20', text: 'text-gray-400', label: 'Outbid' },
  cancelled: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Cancelled' },
  won: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Winner' },
};

// Single bid row
interface BidRowProps {
  bid: Bid;
  rank: number;
  isCurrentUser: boolean;
  isHighest: boolean;
  onBidderClick?: (address: string) => void;
}

function BidRow({ bid, rank, isCurrentUser, isHighest, onBidderClick }: BidRowProps) {
  const status = statusStyles[bid.status];
  
  return (
    <div
      className={`
        flex items-center gap-4 p-3 rounded-lg transition-colors
        ${isCurrentUser ? 'bg-primary-500/10 border border-primary-500/30' : 'hover:bg-gray-800/50'}
        ${isHighest && bid.status === 'active' ? 'ring-1 ring-yellow-500/30' : ''}
      `}
    >
      {/* Rank */}
      <div
        className={`
          w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
          ${isHighest && bid.status === 'active'
            ? 'bg-yellow-500/20 text-yellow-400'
            : 'bg-gray-800 text-gray-400'
          }
        `}
      >
        {isHighest && bid.status === 'active' ? '👑' : rank}
      </div>

      {/* Bidder */}
      <div className="flex-1 min-w-0">
        <button
          onClick={() => onBidderClick?.(bid.bidder)}
          className={`
            font-mono text-sm hover:text-primary-400 transition-colors
            ${isCurrentUser ? 'text-primary-400 font-semibold' : 'text-gray-300'}
          `}
        >
          {truncateAddress(bid.bidder)}
          {isCurrentUser && <span className="ml-2 text-xs">(You)</span>}
        </button>
        <p className="text-xs text-gray-500 mt-0.5">
          {timeAgo(bid.timestamp)}
        </p>
      </div>

      {/* Amount */}
      <div className="text-right">
        <p className="font-bold text-white">{bid.amount.toFixed(2)} STX</p>
        <p className="text-xs text-gray-500">
          ≈ ${(bid.amount * 0.5).toFixed(2)}
        </p>
      </div>

      {/* Status */}
      {bid.status !== 'active' && (
        <span
          className={`
            px-2 py-1 rounded text-xs font-medium
            ${status.bg} ${status.text}
          `}
        >
          {status.label}
        </span>
      )}
    </div>
  );
}

export function BidHistory({
  bids,
  currentUserAddress,
  showAll = false,
  maxDisplay = 5,
  className = '',
  onBidderClick,
}: BidHistoryProps) {
  const [expanded, setExpanded] = useState(showAll);

  // Sort bids by amount (highest first)
  const sortedBids = [...bids].sort((a, b) => b.amount - a.amount);
  const displayBids = expanded ? sortedBids : sortedBids.slice(0, maxDisplay);
  const hasMore = sortedBids.length > maxDisplay;

  if (bids.length === 0) {
    return (
      <div className={`bg-gray-900 rounded-xl p-6 text-center ${className}`}>
        <span className="text-4xl mb-3 block">🏷️</span>
        <p className="text-gray-400">No bids yet</p>
        <p className="text-sm text-gray-500 mt-1">Be the first to place a bid!</p>
      </div>
    );
  }

  return (
    <div className={`bg-gray-900 rounded-xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
        <h3 className="font-bold">
          Bid History
          <span className="ml-2 text-sm text-gray-500 font-normal">
            ({bids.length} {bids.length === 1 ? 'bid' : 'bids'})
          </span>
        </h3>
        
        {/* Highest bid summary */}
        {sortedBids[0] && (
          <div className="text-right">
            <span className="text-xs text-gray-500">Current Bid</span>
            <p className="font-bold text-primary-400">{sortedBids[0].amount} STX</p>
          </div>
        )}
      </div>

      {/* Bid list */}
      <div className="p-2 space-y-1">
        {displayBids.map((bid, index) => (
          <BidRow
            key={bid.id}
            bid={bid}
            rank={index + 1}
            isCurrentUser={currentUserAddress === bid.bidder}
            isHighest={index === 0}
            onBidderClick={onBidderClick}
          />
        ))}
      </div>

      {/* Show more button */}
      {hasMore && !expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="w-full py-3 text-sm text-primary-400 hover:text-primary-300 border-t border-gray-800 transition-colors"
        >
          Show all {sortedBids.length} bids
        </button>
      )}

      {expanded && hasMore && (
        <button
          onClick={() => setExpanded(false)}
          className="w-full py-3 text-sm text-gray-500 hover:text-white border-t border-gray-800 transition-colors"
        >
          Show less
        </button>
      )}
    </div>
  );
}

// Compact bid summary for cards
interface BidSummaryProps {
  highestBid?: number;
  totalBids: number;
  endTime?: Date;
  className?: string;
}

export function BidSummary({ highestBid, totalBids, endTime, className = '' }: BidSummaryProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');

  React.useEffect(() => {
    if (!endTime) return;

    const updateTime = () => {
      const now = new Date();
      const diff = endTime.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeLeft('Ended');
        return;
      }

      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      if (hours > 24) {
        setTimeLeft(`${Math.floor(hours / 24)}d ${hours % 24}h`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setTimeLeft(`${minutes}m ${seconds}s`);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div>
        <p className="text-xs text-gray-500">Current Bid</p>
        <p className="font-bold text-white">
          {highestBid ? `${highestBid} STX` : 'No bids'}
        </p>
      </div>
      
      <div className="text-center">
        <p className="text-xs text-gray-500">Bids</p>
        <p className="font-semibold text-gray-300">{totalBids}</p>
      </div>

      {endTime && (
        <div className="text-right">
          <p className="text-xs text-gray-500">Ends in</p>
          <p className={`font-semibold ${timeLeft === 'Ended' ? 'text-red-400' : 'text-green-400'}`}>
            {timeLeft}
          </p>
        </div>
      )}
    </div>
  );
}

export default BidHistory;
