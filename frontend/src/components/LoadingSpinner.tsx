/**
 * LoadingSpinner Component
 * Customizable loading spinner with multiple variants and sizes
 * @module LoadingSpinner
 * @version 2.2.0
 */

import { memo, type FC } from 'react';

type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';
type SpinnerVariant = 'default' | 'dots' | 'pulse' | 'bars';

/**
 * Spinner color theme
 */
type SpinnerColor = 'primary' | 'secondary' | 'white' | 'purple';

// Default configuration
const DEFAULT_SIZE: SpinnerSize = 'md';
const DEFAULT_VARIANT: SpinnerVariant = 'default';
const DOT_COUNT = 3;

/** Spin animation duration in ms */
const SPIN_DURATION = 1000;

/** Dot animation stagger in ms */
const DOT_STAGGER = 150;

interface LoadingSpinnerProps {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  text?: string;
  fullScreen?: boolean;
}

function LoadingSpinnerComponent({ 
  size = 'md', 
  variant = 'default',
  text,
  fullScreen = false 
}: LoadingSpinnerProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4',
  };

  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`${dotSizes[size]} bg-gradient-to-b from-purple-400 to-purple-600 rounded-full animate-bounce shadow-lg shadow-purple-500/30`}
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        );

      case 'pulse':
        return (
          <div className="relative">
            <div className={`${sizes[size]} bg-purple-500/40 rounded-full animate-ping absolute shadow-lg shadow-purple-500/40`} />
            <div className={`${sizes[size]} bg-gradient-to-br from-purple-400 to-purple-600 rounded-full shadow-lg shadow-purple-500/30`} />
          </div>
        );

      case 'bars':
        return (
          <div className="flex gap-1.5 items-end h-8">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-1.5 bg-gradient-to-t from-purple-600 via-purple-500 to-purple-400 rounded-full shadow-lg shadow-purple-500/20"
                style={{ 
                  height: `${12 + i * 4}px`,
                  animationDelay: `${i * 0.1}s`,
                  animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                }}
              />
            ))}
          </div>
        );

      default:
        return (
          <div className={`${sizes[size]} relative`}>
            <div className="absolute inset-0 rounded-full border-2 border-purple-500/20" />
            <div className={`${sizes[size]} animate-spin rounded-full border-2 border-transparent border-t-purple-400 border-r-purple-400 shadow-lg shadow-purple-500/20`} />
          </div>
        );
    }
  };

  const content = (
    <div className="flex flex-col items-center gap-3" role="status" aria-label={text || 'Loading'}>
      {renderSpinner()}
      {text && (
        <p className="text-gray-400 text-sm animate-pulse">{text}</p>
      )}
      <span className="sr-only">{text || 'Loading...'}</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gray-950/90 backdrop-blur-md flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-gray-900/50 border border-gray-800/50">
          {content}
        </div>
      </div>
    );
  }

  return content;
}

// Memoize for performance
const LoadingSpinner = memo(LoadingSpinnerComponent);
LoadingSpinner.displayName = 'LoadingSpinner';

export default LoadingSpinner;
