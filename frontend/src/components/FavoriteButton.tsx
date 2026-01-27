'use client';

/**
 * FavoriteButton Component
 * Heart/favorite toggle button with animation
 * @module components/FavoriteButton
 * @version 1.0.0
 */

import { useState, useCallback } from 'react';

interface FavoriteButtonProps {
  /** Whether item is favorited */
  isFavorited?: boolean;
  /** Number of favorites/likes */
  count?: number;
  /** Callback when toggled */
  onToggle?: (isFavorited: boolean) => void;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Show count next to button */
  showCount?: boolean;
  /** Variant style */
  variant?: 'default' | 'outline' | 'ghost' | 'filled';
  /** Custom className */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Loading state */
  isLoading?: boolean;
  /** Aria label */
  ariaLabel?: string;
}

const sizeConfig = {
  sm: {
    button: 'w-8 h-8',
    icon: 'w-4 h-4',
    text: 'text-xs',
    gap: 'gap-1',
  },
  md: {
    button: 'w-10 h-10',
    icon: 'w-5 h-5',
    text: 'text-sm',
    gap: 'gap-1.5',
  },
  lg: {
    button: 'w-12 h-12',
    icon: 'w-6 h-6',
    text: 'text-base',
    gap: 'gap-2',
  },
};

export default function FavoriteButton({
  isFavorited: controlledFavorited,
  count = 0,
  onToggle,
  size = 'md',
  showCount = false,
  variant = 'default',
  className = '',
  disabled = false,
  isLoading = false,
  ariaLabel,
}: FavoriteButtonProps) {
  // Internal state for uncontrolled mode
  const [internalFavorited, setInternalFavorited] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [particles, setParticles] = useState<number[]>([]);

  // Use controlled or uncontrolled state
  const isFavorited = controlledFavorited !== undefined ? controlledFavorited : internalFavorited;

  const handleClick = useCallback(() => {
    if (disabled || isLoading) return;

    const newState = !isFavorited;

    // Trigger animation
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);

    // Particle effect on favorite
    if (newState) {
      setParticles([1, 2, 3, 4, 5, 6]);
      setTimeout(() => setParticles([]), 600);
    }

    // Update state
    if (controlledFavorited === undefined) {
      setInternalFavorited(newState);
    }

    onToggle?.(newState);
  }, [isFavorited, disabled, isLoading, controlledFavorited, onToggle]);

  const sizes = sizeConfig[size];

  // Variant styles
  const variantStyles = {
    default: `
      ${isFavorited 
        ? 'bg-pink-500/20 text-pink-400 border-pink-500/30' 
        : 'bg-gray-800 text-gray-400 border-gray-700 hover:text-pink-400 hover:border-pink-500/30'
      }
    `,
    outline: `
      bg-transparent border-2
      ${isFavorited 
        ? 'text-pink-400 border-pink-500' 
        : 'text-gray-400 border-gray-600 hover:text-pink-400 hover:border-pink-500'
      }
    `,
    ghost: `
      bg-transparent border-none
      ${isFavorited 
        ? 'text-pink-400' 
        : 'text-gray-400 hover:text-pink-400'
      }
    `,
    filled: `
      ${isFavorited 
        ? 'bg-pink-500 text-white' 
        : 'bg-gray-700 text-gray-300 hover:bg-pink-500/20 hover:text-pink-400'
      }
    `,
  };

  // Calculate display count
  const displayCount = isFavorited && controlledFavorited === undefined 
    ? count + 1 
    : count;

  return (
    <div className={`relative inline-flex items-center ${sizes.gap} ${className}`}>
      <button
        onClick={handleClick}
        disabled={disabled || isLoading}
        className={`
          relative ${sizes.button} rounded-full border
          flex items-center justify-center
          transition-all duration-200 ease-out
          ${variantStyles[variant]}
          ${isAnimating ? 'scale-110' : 'scale-100'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:ring-offset-2 focus:ring-offset-gray-900
        `}
        aria-label={ariaLabel || (isFavorited ? 'Remove from favorites' : 'Add to favorites')}
        aria-pressed={isFavorited}
      >
        {/* Loading spinner */}
        {isLoading ? (
          <span className={`${sizes.icon} border-2 border-current border-t-transparent rounded-full animate-spin`} />
        ) : (
          <>
            {/* Heart icon */}
            <svg 
              className={`${sizes.icon} transition-transform duration-200 ${isAnimating ? 'scale-125' : 'scale-100'}`}
              fill={isFavorited ? 'currentColor' : 'none'} 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
              />
            </svg>

            {/* Particle effects */}
            {particles.map((particle) => (
              <span
                key={particle}
                className="absolute w-1.5 h-1.5 bg-pink-400 rounded-full animate-particle"
                style={{
                  '--particle-angle': `${particle * 60}deg`,
                } as React.CSSProperties}
              />
            ))}
          </>
        )}
      </button>

      {/* Count display */}
      {showCount && (
        <span className={`${sizes.text} font-medium ${isFavorited ? 'text-pink-400' : 'text-gray-400'} transition-colors`}>
          {displayCount > 0 ? (displayCount > 999 ? `${(displayCount / 1000).toFixed(1)}k` : displayCount) : ''}
        </span>
      )}

      <style jsx>{`
        @keyframes particle {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) rotate(var(--particle-angle)) translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) rotate(var(--particle-angle)) translateY(-20px) scale(0);
          }
        }
        .animate-particle {
          animation: particle 0.6s ease-out forwards;
          left: 50%;
          top: 50%;
        }
      `}</style>
    </div>
  );
}

// Convenience exports for common variants
export function FavoriteIconButton(props: Omit<FavoriteButtonProps, 'variant' | 'showCount'>) {
  return <FavoriteButton {...props} variant="ghost" />;
}

export function FavoriteButtonWithCount(props: Omit<FavoriteButtonProps, 'showCount'>) {
  return <FavoriteButton {...props} showCount />;
}

export function FavoriteButtonFilled(props: Omit<FavoriteButtonProps, 'variant'>) {
  return <FavoriteButton {...props} variant="filled" />;
}
