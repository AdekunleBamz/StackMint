'use client';

/**
 * OwnershipHistory Component
 * Display the ownership history and provenance of an NFT
 * @module components/OwnershipHistory
 * @version 1.0.0
 */

import { memo, useMemo } from 'react';

interface OwnershipRecord {
  id: string;
  owner: string;
  ownerName?: string;
  isVerified?: boolean;
  acquiredAt: Date;
  acquiredVia: 'mint' | 'sale' | 'transfer' | 'offer' | 'auction';
  price?: number;
  txHash?: string;
  duration?: string; // How long they held it
}

interface OwnershipHistoryProps {
  records: OwnershipRecord[];
  currentOwner?: string;
  maxRecords?: number;
  showPrices?: boolean;
  showLinks?: boolean;
}

const acquisitionConfig: Record<string, { icon: string; label: string; color: string }> = {
  mint: { icon: '✨', label: 'Minted', color: 'text-purple-400' },
  sale: { icon: '💰', label: 'Purchased', color: 'text-green-400' },
  transfer: { icon: '↔️', label: 'Transferred', color: 'text-blue-400' },
  offer: { icon: '🤝', label: 'Offer Accepted', color: 'text-orange-400' },
  auction: { icon: '🔨', label: 'Won Auction', color: 'text-pink-400' },
};

function formatAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function calculateDuration(from: Date, to: Date = new Date()): string {
  const days = Math.floor((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
  
  if (days < 1) return 'Less than a day';
  if (days === 1) return '1 day';
  if (days < 30) return `${days} days`;
  if (days < 365) return `${Math.floor(days / 30)} months`;
  return `${Math.floor(days / 365)} years`;
}

function OwnershipRecord({ 
  record, 
  isFirst, 
  isLast, 
  isCurrent,
  showPrices,
  showLinks,
  nextRecord,
}: { 
  record: OwnershipRecord; 
  isFirst: boolean; 
  isLast: boolean;
  isCurrent: boolean;
  showPrices: boolean;
  showLinks: boolean;
  nextRecord?: OwnershipRecord;
}) {
  const config = acquisitionConfig[record.acquiredVia];
  const holdDuration = nextRecord 
    ? calculateDuration(record.acquiredAt, nextRecord.acquiredAt)
    : calculateDuration(record.acquiredAt);

  return (
    <div className="relative flex gap-4">
      {/* Timeline line */}
      <div className="flex flex-col items-center">
        {/* Dot */}
        <div className={`
          w-4 h-4 rounded-full border-2 flex items-center justify-center
          ${isCurrent 
            ? 'bg-purple-500 border-purple-400 ring-4 ring-purple-500/20' 
            : 'bg-gray-800 border-gray-600'}
          ${isFirst ? 'ring-2 ring-green-500/30' : ''}
        `}>
          {isCurrent && (
            <span className="w-1.5 h-1.5 bg-white rounded-full" />
          )}
        </div>
        {/* Line */}
        {!isLast && (
          <div className="w-0.5 flex-1 bg-gradient-to-b from-gray-600 to-gray-800 min-h-[60px]" />
        )}
      </div>
      
      {/* Content */}
      <div className={`flex-1 pb-6 ${isLast ? 'pb-0' : ''}`}>
        <div className={`
          bg-gray-800/50 rounded-xl p-4 border transition-all
          ${isCurrent ? 'border-purple-500/50 bg-purple-500/5' : 'border-gray-700/50 hover:border-gray-600'}
        `}>
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`${config.color} text-sm font-medium`}>
                  {config.icon} {config.label}
                </span>
                {isCurrent && (
                  <span className="bg-purple-500/20 text-purple-400 text-xs px-2 py-0.5 rounded-full font-medium">
                    Current Owner
                  </span>
                )}
                {isFirst && (
                  <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full font-medium">
                    Original
                  </span>
                )}
              </div>
              
              {/* Owner */}
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                  {(record.ownerName || record.owner).charAt(0).toUpperCase()}
                </span>
                <div>
                  <p className="font-medium text-white">
                    {record.ownerName || formatAddress(record.owner)}
                    {record.isVerified && (
                      <span className="ml-1 text-blue-400">✓</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500">{formatAddress(record.owner)}</p>
                </div>
              </div>
            </div>
            
            {/* Price */}
            {showPrices && record.price !== undefined && (
              <div className="text-right">
                <p className="font-semibold text-white">{record.price} STX</p>
                <p className="text-xs text-gray-500">${(record.price * 0.5).toFixed(2)}</p>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="mt-3 pt-3 border-t border-gray-700/50 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-3">
              <span>📅 {formatDate(record.acquiredAt)}</span>
              <span>⏱️ Held for {holdDuration}</span>
            </div>
            {showLinks && record.txHash && (
              <a 
                href={`https://explorer.stacks.co/txid/${record.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
              >
                View tx ↗
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function OwnershipHistoryComponent({
  records,
  currentOwner,
  maxRecords = 10,
  showPrices = true,
  showLinks = true,
}: OwnershipHistoryProps) {
  // Sort by date (newest first) and limit
  const sortedRecords = useMemo(() => {
    return [...records]
      .sort((a, b) => b.acquiredAt.getTime() - a.acquiredAt.getTime())
      .slice(0, maxRecords);
  }, [records, maxRecords]);

  // Stats
  const stats = useMemo(() => {
    const prices = records.filter(r => r.price !== undefined).map(r => r.price!);
    const totalVolume = prices.reduce((a, b) => a + b, 0);
    const avgPrice = prices.length > 0 ? totalVolume / prices.length : 0;
    
    return {
      totalOwners: records.length,
      totalVolume: totalVolume.toFixed(2),
      avgPrice: avgPrice.toFixed(2),
      transfers: records.filter(r => r.acquiredVia === 'transfer').length,
    };
  }, [records]);

  if (records.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <span className="text-3xl block mb-2">📜</span>
        <p>No ownership history available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-gray-800/50 rounded-xl p-3 text-center">
          <p className="text-xs text-gray-500">Owners</p>
          <p className="text-lg font-bold text-white">{stats.totalOwners}</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-3 text-center">
          <p className="text-xs text-gray-500">Volume</p>
          <p className="text-lg font-bold text-white">{stats.totalVolume} STX</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-3 text-center">
          <p className="text-xs text-gray-500">Avg Price</p>
          <p className="text-lg font-bold text-white">{stats.avgPrice} STX</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-3 text-center">
          <p className="text-xs text-gray-500">Transfers</p>
          <p className="text-lg font-bold text-white">{stats.transfers}</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-0">
        {sortedRecords.map((record, index) => (
          <OwnershipRecord
            key={record.id}
            record={record}
            isFirst={index === sortedRecords.length - 1}
            isLast={index === 0}
            isCurrent={currentOwner === record.owner && index === 0}
            showPrices={showPrices}
            showLinks={showLinks}
            nextRecord={sortedRecords[index - 1]}
          />
        ))}
      </div>
      
      {/* Show more */}
      {records.length > maxRecords && (
        <button className="w-full py-2 text-sm text-purple-400 hover:text-purple-300 transition-colors">
          Show all {records.length} owners →
        </button>
      )}
    </div>
  );
}

export default memo(OwnershipHistoryComponent);
export type { OwnershipRecord };
