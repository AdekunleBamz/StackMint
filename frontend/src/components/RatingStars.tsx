'use client';

/**
 * RatingStars Component
 * Star rating display and input
 * @module components/RatingStars
 * @version 1.0.0
 */

import { memo, useState, useCallback } from 'react';

interface RatingStarsProps {
  value: number;
  onChange?: (rating: number) => void;
  max?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  readonly?: boolean;
  showValue?: boolean;
  showCount?: boolean;
  count?: number;
  allowHalf?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
};

const gapClasses = {
  sm: 'gap-0.5',
  md: 'gap-1',
  lg: 'gap-1.5',
  xl: 'gap-2',
};

function RatingStarsComponent({
  value,
  onChange,
  max = 5,
  size = 'md',
  readonly = false,
  showValue = false,
  showCount = false,
  count,
  allowHalf = false,
  className = '',
}: RatingStarsProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const displayValue = hoverValue !== null ? hoverValue : value;

  const handleClick = useCallback((index: number, isHalf: boolean) => {
    if (readonly || !onChange) return;
    const newValue = isHalf && allowHalf ? index + 0.5 : index + 1;
    onChange(newValue);
  }, [readonly, onChange, allowHalf]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLButtonElement>, index: number) => {
    if (readonly) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isHalf = x < rect.width / 2;
    setHoverValue(isHalf && allowHalf ? index + 0.5 : index + 1);
  }, [readonly, allowHalf]);

  const handleMouseLeave = useCallback(() => {
    setHoverValue(null);
  }, []);

  const renderStar = (index: number) => {
    const filled = displayValue >= index + 1;
    const halfFilled = !filled && displayValue >= index + 0.5;
    
    return (
      <button
        key={index}
        type="button"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const isHalf = x < rect.width / 2;
          handleClick(index, isHalf);
        }}
        onMouseMove={(e) => handleMouseMove(e, index)}
        onMouseLeave={handleMouseLeave}
        disabled={readonly}
        className={`
          relative transition-transform
          ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}
          ${sizeClasses[size]}
        `}
      >
        {/* Empty star background */}
        <svg
          className={`absolute inset-0 ${sizeClasses[size]} text-gray-600`}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>

        {/* Filled star */}
        {(filled || halfFilled) && (
          <svg
            className={`absolute inset-0 ${sizeClasses[size]} text-yellow-400`}
            fill="currentColor"
            viewBox="0 0 24 24"
            style={halfFilled ? { clipPath: 'inset(0 50% 0 0)' } : undefined}
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        )}
      </button>
    );
  };

  return (
    <div className={`inline-flex items-center ${gapClasses[size]} ${className}`}>
      <div className={`flex ${gapClasses[size]}`}>
        {Array.from({ length: max }, (_, index) => renderStar(index))}
      </div>
      
      {showValue && (
        <span className="ml-2 text-gray-400 text-sm font-medium">
          {value.toFixed(1)}
        </span>
      )}
      
      {showCount && count !== undefined && (
        <span className="text-gray-500 text-sm">
          ({count.toLocaleString()})
        </span>
      )}
    </div>
  );
}

/**
 * Rating Summary - shows distribution of ratings
 */
interface RatingSummaryProps {
  average: number;
  total: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  className?: string;
}

export function RatingSummary({
  average,
  total,
  distribution,
  className = '',
}: RatingSummaryProps) {
  const maxCount = Math.max(...Object.values(distribution));

  return (
    <div className={`flex gap-8 ${className}`}>
      {/* Average Score */}
      <div className="flex flex-col items-center justify-center">
        <div className="text-5xl font-bold text-white mb-2">
          {average.toFixed(1)}
        </div>
        <RatingStarsComponent value={average} readonly size="md" />
        <div className="mt-2 text-gray-400 text-sm">
          {total.toLocaleString()} ratings
        </div>
      </div>

      {/* Distribution */}
      <div className="flex-1 space-y-2">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = distribution[star as keyof typeof distribution];
          const percentage = total > 0 ? (count / total) * 100 : 0;
          const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0;

          return (
            <div key={star} className="flex items-center gap-3">
              <span className="w-3 text-sm text-gray-400">{star}</span>
              <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                  style={{ width: `${barWidth}%` }}
                />
              </div>
              <span className="w-12 text-right text-sm text-gray-500">
                {percentage.toFixed(0)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Emoji Rating - alternative rating with emojis
 */
interface EmojiRatingProps {
  value: number | null;
  onChange?: (value: number) => void;
  readonly?: boolean;
  className?: string;
}

const RATING_EMOJIS = [
  { value: 1, emoji: '😠', label: 'Terrible' },
  { value: 2, emoji: '😕', label: 'Bad' },
  { value: 3, emoji: '😐', label: 'Okay' },
  { value: 4, emoji: '😊', label: 'Good' },
  { value: 5, emoji: '🤩', label: 'Amazing' },
];

export function EmojiRating({
  value,
  onChange,
  readonly = false,
  className = '',
}: EmojiRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className={`inline-flex gap-2 ${className}`}>
      {RATING_EMOJIS.map(({ value: val, emoji, label }) => {
        const isSelected = value === val;
        const isHovered = hovered === val;

        return (
          <button
            key={val}
            type="button"
            onClick={() => !readonly && onChange?.(val)}
            onMouseEnter={() => !readonly && setHovered(val)}
            onMouseLeave={() => setHovered(null)}
            disabled={readonly}
            className={`
              relative flex flex-col items-center gap-1 p-2 rounded-xl
              transition-all
              ${readonly ? 'cursor-default' : 'cursor-pointer'}
              ${isSelected ? 'bg-purple-600/20 scale-110' : 'hover:bg-gray-800'}
              ${isHovered && !isSelected ? 'scale-105' : ''}
            `}
          >
            <span className={`text-3xl transition-transform ${isSelected || isHovered ? 'scale-110' : ''}`}>
              {emoji}
            </span>
            {(isSelected || isHovered) && (
              <span className="text-xs text-gray-400">{label}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Quick Rating - simple thumbs up/down
 */
interface QuickRatingProps {
  likes: number;
  dislikes: number;
  userVote?: 'like' | 'dislike' | null;
  onVote?: (vote: 'like' | 'dislike') => void;
  className?: string;
}

export function QuickRating({
  likes,
  dislikes,
  userVote,
  onVote,
  className = '',
}: QuickRatingProps) {
  return (
    <div className={`inline-flex items-center gap-4 ${className}`}>
      <button
        type="button"
        onClick={() => onVote?.('like')}
        className={`
          flex items-center gap-2 px-3 py-1.5 rounded-full
          transition-all
          ${userVote === 'like' 
            ? 'bg-green-600/20 text-green-400' 
            : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
          }
        `}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
        </svg>
        <span className="font-medium">{likes.toLocaleString()}</span>
      </button>

      <button
        type="button"
        onClick={() => onVote?.('dislike')}
        className={`
          flex items-center gap-2 px-3 py-1.5 rounded-full
          transition-all
          ${userVote === 'dislike' 
            ? 'bg-red-600/20 text-red-400' 
            : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
          }
        `}
      >
        <svg className="w-5 h-5 transform rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
        </svg>
        <span className="font-medium">{dislikes.toLocaleString()}</span>
      </button>
    </div>
  );
}

export default memo(RatingStarsComponent);
