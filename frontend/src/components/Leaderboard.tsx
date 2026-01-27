'use client';

/**
 * Leaderboard Component
 * Rankings and leaderboards for collectors and creators
 * @module components/Leaderboard
 * @version 1.0.0
 */

import React, { useState } from 'react';

// Types
export interface LeaderboardEntry {
  rank: number;
  address: string;
  username?: string;
  avatar?: string;
  value: number;
  change?: number;
  secondaryValue?: number;
  verified?: boolean;
}

type LeaderboardType = 'collectors' | 'sellers' | 'volume' | 'minters';
type TimePeriod = '24h' | '7d' | '30d' | 'all';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  type?: LeaderboardType;
  period?: TimePeriod;
  showPeriodSelector?: boolean;
  maxDisplay?: number;
  currentUserAddress?: string;
  className?: string;
  onTypeChange?: (type: LeaderboardType) => void;
  onPeriodChange?: (period: TimePeriod) => void;
  onEntryClick?: (entry: LeaderboardEntry) => void;
}

// Leaderboard type configs
const typeConfigs: Record<LeaderboardType, {
  label: string;
  valueLabel: string;
  icon: string;
}> = {
  collectors: {
    label: 'Top Collectors',
    valueLabel: 'NFTs Owned',
    icon: '👑',
  },
  sellers: {
    label: 'Top Sellers',
    valueLabel: 'Volume Sold',
    icon: '💰',
  },
  volume: {
    label: 'Trading Volume',
    valueLabel: 'Total Volume',
    icon: '📊',
  },
  minters: {
    label: 'Top Minters',
    valueLabel: 'NFTs Minted',
    icon: '🎨',
  },
};

// Truncate address
function truncateAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Rank badge styles
function getRankStyle(rank: number): { bg: string; text: string; icon?: string } {
  switch (rank) {
    case 1:
      return { bg: 'bg-yellow-500/20', text: 'text-yellow-400', icon: '🥇' };
    case 2:
      return { bg: 'bg-gray-400/20', text: 'text-gray-300', icon: '🥈' };
    case 3:
      return { bg: 'bg-orange-600/20', text: 'text-orange-400', icon: '🥉' };
    default:
      return { bg: 'bg-gray-800', text: 'text-gray-400' };
  }
}

// Single entry row
interface EntryRowProps {
  entry: LeaderboardEntry;
  type: LeaderboardType;
  isCurrentUser: boolean;
  onClick?: () => void;
}

function EntryRow({ entry, type, isCurrentUser, onClick }: EntryRowProps) {
  const rankStyle = getRankStyle(entry.rank);
  const config = typeConfigs[type];

  return (
    <div
      onClick={onClick}
      className={`
        flex items-center gap-4 p-3 rounded-xl transition-colors cursor-pointer
        ${isCurrentUser
          ? 'bg-primary-500/10 border border-primary-500/30'
          : 'hover:bg-gray-800/50'
        }
      `}
    >
      {/* Rank */}
      <div
        className={`
          w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg
          ${rankStyle.bg} ${rankStyle.text}
        `}
      >
        {rankStyle.icon || entry.rank}
      </div>

      {/* User info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden flex-shrink-0">
          {entry.avatar ? (
            <img
              src={entry.avatar}
              alt={entry.username || 'User'}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-bold">
              {(entry.username || entry.address)[0].toUpperCase()}
            </div>
          )}
        </div>

        {/* Name/Address */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`font-semibold truncate ${
                isCurrentUser ? 'text-primary-400' : 'text-white'
              }`}
            >
              {entry.username || truncateAddress(entry.address)}
            </span>
            {entry.verified && (
              <span className="text-blue-400 text-sm">✓</span>
            )}
            {isCurrentUser && (
              <span className="text-xs text-primary-400">(You)</span>
            )}
          </div>
          <p className="text-xs text-gray-500 font-mono">
            {truncateAddress(entry.address)}
          </p>
        </div>
      </div>

      {/* Value */}
      <div className="text-right">
        <p className="font-bold text-white">
          {type === 'volume' || type === 'sellers'
            ? `${entry.value.toLocaleString()} STX`
            : entry.value.toLocaleString()
          }
        </p>
        {entry.change !== undefined && (
          <p
            className={`text-xs ${
              entry.change >= 0 ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {entry.change >= 0 ? '+' : ''}{entry.change}%
          </p>
        )}
      </div>
    </div>
  );
}

export function Leaderboard({
  entries,
  type = 'collectors',
  period = '7d',
  showPeriodSelector = true,
  maxDisplay = 10,
  currentUserAddress,
  className = '',
  onTypeChange,
  onPeriodChange,
  onEntryClick,
}: LeaderboardProps) {
  const [expanded, setExpanded] = useState(false);
  const config = typeConfigs[type];

  const displayEntries = expanded ? entries : entries.slice(0, maxDisplay);
  const hasMore = entries.length > maxDisplay;

  const periods: { value: TimePeriod; label: string }[] = [
    { value: '24h', label: '24H' },
    { value: '7d', label: '7D' },
    { value: '30d', label: '30D' },
    { value: 'all', label: 'All' },
  ];

  return (
    <div className={`bg-gray-900 rounded-xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <span>{config.icon}</span>
            {config.label}
          </h3>

          {/* Period selector */}
          {showPeriodSelector && (
            <div className="flex gap-1 bg-gray-800 rounded-lg p-1">
              {periods.map((p) => (
                <button
                  key={p.value}
                  onClick={() => onPeriodChange?.(p.value)}
                  className={`
                    px-3 py-1 text-xs rounded-md transition-colors
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
          )}
        </div>

        {/* Type tabs */}
        {onTypeChange && (
          <div className="flex gap-4 mt-4 overflow-x-auto">
            {(Object.keys(typeConfigs) as LeaderboardType[]).map((t) => (
              <button
                key={t}
                onClick={() => onTypeChange(t)}
                className={`
                  pb-2 border-b-2 transition-colors whitespace-nowrap
                  ${type === t
                    ? 'border-primary-500 text-white'
                    : 'border-transparent text-gray-500 hover:text-gray-300'
                  }
                `}
              >
                {typeConfigs[t].label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Column headers */}
      <div className="px-4 py-2 flex items-center text-xs text-gray-500 border-b border-gray-800">
        <span className="w-14">Rank</span>
        <span className="flex-1">User</span>
        <span className="text-right">{config.valueLabel}</span>
      </div>

      {/* Entries */}
      <div className="p-2 space-y-1">
        {entries.length === 0 ? (
          <div className="p-8 text-center">
            <span className="text-4xl mb-3 block">🏆</span>
            <p className="text-gray-400">No data yet</p>
          </div>
        ) : (
          displayEntries.map((entry) => (
            <EntryRow
              key={entry.address}
              entry={entry}
              type={type}
              isCurrentUser={entry.address === currentUserAddress}
              onClick={() => onEntryClick?.(entry)}
            />
          ))
        )}
      </div>

      {/* Show more */}
      {hasMore && !expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="w-full py-3 text-sm text-primary-400 hover:text-primary-300 border-t border-gray-800 transition-colors"
        >
          Show all {entries.length} entries
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

// Mini leaderboard widget
interface LeaderboardWidgetProps {
  entries: LeaderboardEntry[];
  title?: string;
  className?: string;
}

export function LeaderboardWidget({
  entries,
  title = 'Top Collectors',
  className = '',
}: LeaderboardWidgetProps) {
  const topThree = entries.slice(0, 3);

  return (
    <div className={`bg-gray-900 rounded-xl p-4 ${className}`}>
      <h3 className="font-bold mb-4">{title}</h3>
      
      <div className="space-y-3">
        {topThree.map((entry) => {
          const rankStyle = getRankStyle(entry.rank);
          
          return (
            <div key={entry.address} className="flex items-center gap-3">
              <span className="text-lg">{rankStyle.icon}</span>
              <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden">
                {entry.avatar ? (
                  <img
                    src={entry.avatar}
                    alt={entry.username || 'User'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary-500 to-purple-600" />
                )}
              </div>
              <span className="flex-1 font-medium truncate">
                {entry.username || truncateAddress(entry.address)}
              </span>
              <span className="text-sm text-gray-400">
                {entry.value.toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Leaderboard;
