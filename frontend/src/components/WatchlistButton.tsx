'use client';

/**
 * WatchlistButton Component
 * Add/remove NFTs and collections from watchlist
 * @module components/WatchlistButton
 * @version 1.0.0
 */

import { useState } from 'react';

interface WatchlistButtonProps {
  itemId: string;
  itemType: 'nft' | 'collection';
  isWatched?: boolean;
  onToggle?: (isWatched: boolean) => Promise<void>;
  variant?: 'icon' | 'button' | 'card';
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  watchCount?: number;
  className?: string;
}

export function WatchlistButton({
  itemId,
  itemType,
  isWatched: initialIsWatched = false,
  onToggle,
  variant = 'icon',
  size = 'md',
  showCount = false,
  watchCount = 0,
  className = '',
}: WatchlistButtonProps) {
  const [isWatched, setIsWatched] = useState(initialIsWatched);
  const [isLoading, setIsLoading] = useState(false);
  const [animating, setAnimating] = useState(false);

  const handleToggle = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setAnimating(true);

    try {
      const newState = !isWatched;
      setIsWatched(newState);
      await onToggle?.(newState);
    } catch (error) {
      // Revert on error
      setIsWatched(isWatched);
    } finally {
      setIsLoading(false);
      setTimeout(() => setAnimating(false), 300);
    }
  };

  const sizeConfig = {
    sm: {
      icon: 'w-4 h-4',
      button: 'px-2 py-1 text-xs gap-1',
      iconButton: 'p-1.5',
    },
    md: {
      icon: 'w-5 h-5',
      button: 'px-3 py-2 text-sm gap-2',
      iconButton: 'p-2',
    },
    lg: {
      icon: 'w-6 h-6',
      button: 'px-4 py-2.5 text-base gap-2',
      iconButton: 'p-3',
    },
  };

  const HeartIcon = ({ filled }: { filled: boolean }) => (
    <svg
      className={`
        ${sizeConfig[size].icon}
        transition-all duration-300
        ${animating ? 'scale-125' : 'scale-100'}
        ${filled ? 'text-red-500' : 'text-gray-400'}
      `}
      fill={filled ? 'currentColor' : 'none'}
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    </svg>
  );

  if (variant === 'icon') {
    return (
      <button
        onClick={handleToggle}
        disabled={isLoading}
        className={`
          ${sizeConfig[size].iconButton}
          rounded-lg transition-all
          ${isWatched 
            ? 'bg-red-500/20 hover:bg-red-500/30' 
            : 'bg-gray-800 hover:bg-gray-700'
          }
          ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
          ${className}
        `}
        title={isWatched ? 'Remove from watchlist' : 'Add to watchlist'}
      >
        <HeartIcon filled={isWatched} />
      </button>
    );
  }

  if (variant === 'button') {
    return (
      <button
        onClick={handleToggle}
        disabled={isLoading}
        className={`
          inline-flex items-center rounded-lg font-medium transition-all
          ${sizeConfig[size].button}
          ${isWatched
            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
            : 'bg-gray-800 text-white hover:bg-gray-700'
          }
          ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
          ${className}
        `}
      >
        <HeartIcon filled={isWatched} />
        <span>{isWatched ? 'Watching' : 'Watch'}</span>
        {showCount && watchCount > 0 && (
          <span className="ml-1 text-gray-400">({watchCount})</span>
        )}
      </button>
    );
  }

  // Card variant
  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`
        flex items-center gap-3 w-full p-4 rounded-xl border transition-all
        ${isWatched
          ? 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20'
          : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
        }
        ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      <div className={`
        w-10 h-10 rounded-lg flex items-center justify-center
        ${isWatched ? 'bg-red-500/20' : 'bg-gray-700'}
      `}>
        <HeartIcon filled={isWatched} />
      </div>
      <div className="text-left flex-1">
        <p className="font-medium text-white">
          {isWatched ? 'Watching' : 'Add to Watchlist'}
        </p>
        <p className="text-xs text-gray-400">
          {isWatched 
            ? 'Get notified about price changes'
            : 'Be notified when price changes'
          }
        </p>
      </div>
      {showCount && watchCount > 0 && (
        <span className="text-sm text-gray-400">{watchCount}</span>
      )}
    </button>
  );
}

/**
 * Like button (simpler version)
 */
interface LikeButtonProps {
  liked?: boolean;
  count?: number;
  onToggle?: (liked: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  className?: string;
}

export function LikeButton({
  liked: initialLiked = false,
  count: initialCount = 0,
  onToggle,
  size = 'md',
  showCount = true,
  className = '',
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [animating, setAnimating] = useState(false);

  const handleClick = () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setCount((prev) => (newLiked ? prev + 1 : prev - 1));
    setAnimating(true);
    setTimeout(() => setAnimating(false), 300);
    onToggle?.(newLiked);
  };

  const sizeClasses = {
    sm: 'gap-1 text-xs',
    md: 'gap-1.5 text-sm',
    lg: 'gap-2 text-base',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <button
      onClick={handleClick}
      className={`
        inline-flex items-center transition-colors
        ${liked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      <svg
        className={`
          ${iconSizes[size]}
          transition-transform duration-300
          ${animating ? 'scale-125' : 'scale-100'}
        `}
        fill={liked ? 'currentColor' : 'none'}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      {showCount && count > 0 && (
        <span className={liked ? 'text-red-400' : ''}>{count}</span>
      )}
    </button>
  );
}

/**
 * Bookmark button for saving items
 */
interface BookmarkButtonProps {
  bookmarked?: boolean;
  onToggle?: (bookmarked: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function BookmarkButton({
  bookmarked: initialBookmarked = false,
  onToggle,
  size = 'md',
  className = '',
}: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);

  const handleClick = () => {
    const newState = !bookmarked;
    setBookmarked(newState);
    onToggle?.(newState);
  };

  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <button
      onClick={handleClick}
      className={`
        rounded-lg transition-all
        ${bookmarked
          ? 'bg-primary-500/20 text-primary-400'
          : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
        }
        ${sizeClasses[size]}
        ${className}
      `}
      title={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
    >
      <svg
        className={iconSizes[size]}
        fill={bookmarked ? 'currentColor' : 'none'}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
        />
      </svg>
    </button>
  );
}

export default WatchlistButton;
