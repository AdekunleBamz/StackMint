'use client';

/**
 * EmptyState Component
 * Contextual empty states for various scenarios
 * @module components/EmptyState
 * @version 1.0.0
 */

import { memo, ReactNode } from 'react';

type EmptyStateType = 
  | 'no-results'
  | 'no-nfts'
  | 'no-collections'
  | 'no-activity'
  | 'no-offers'
  | 'no-listings'
  | 'wallet-not-connected'
  | 'error'
  | 'coming-soon'
  | 'custom';

interface EmptyStateConfig {
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
}

const emptyStateConfigs: Record<Exclude<EmptyStateType, 'custom'>, EmptyStateConfig> = {
  'no-results': {
    icon: '🔍',
    title: 'No results found',
    description: 'Try adjusting your search or filters to find what you\'re looking for.',
    actionLabel: 'Clear filters',
  },
  'no-nfts': {
    icon: '🖼️',
    title: 'No NFTs yet',
    description: 'Start your collection by minting or purchasing your first NFT.',
    actionLabel: 'Explore marketplace',
  },
  'no-collections': {
    icon: '📁',
    title: 'No collections',
    description: 'Create your first collection to organize and showcase your NFTs.',
    actionLabel: 'Create collection',
  },
  'no-activity': {
    icon: '📊',
    title: 'No activity yet',
    description: 'Activity will appear here once you start trading NFTs.',
  },
  'no-offers': {
    icon: '🏷️',
    title: 'No offers received',
    description: 'You haven\'t received any offers on your NFTs yet.',
  },
  'no-listings': {
    icon: '📋',
    title: 'No active listings',
    description: 'You don\'t have any NFTs listed for sale.',
    actionLabel: 'List an NFT',
  },
  'wallet-not-connected': {
    icon: '👛',
    title: 'Wallet not connected',
    description: 'Connect your wallet to view your NFTs and start trading.',
    actionLabel: 'Connect wallet',
  },
  'error': {
    icon: '⚠️',
    title: 'Something went wrong',
    description: 'We encountered an error loading this content. Please try again.',
    actionLabel: 'Retry',
  },
  'coming-soon': {
    icon: '🚀',
    title: 'Coming soon',
    description: 'This feature is under development and will be available soon.',
  },
};

interface EmptyStateProps {
  type?: EmptyStateType;
  icon?: string;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  children?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

function EmptyStateComponent({
  type = 'no-results',
  icon,
  title,
  description,
  action,
  secondaryAction,
  children,
  size = 'md',
  className = '',
}: EmptyStateProps) {
  const config = type !== 'custom' ? emptyStateConfigs[type] : null;
  
  const displayIcon = icon || config?.icon || '📭';
  const displayTitle = title || config?.title || 'Nothing here';
  const displayDescription = description || config?.description || '';
  const actionLabel = action?.label || config?.actionLabel;

  const sizeClasses = {
    sm: {
      container: 'py-8',
      icon: 'text-4xl',
      title: 'text-lg',
      description: 'text-sm',
    },
    md: {
      container: 'py-12',
      icon: 'text-6xl',
      title: 'text-xl',
      description: 'text-base',
    },
    lg: {
      container: 'py-16',
      icon: 'text-7xl',
      title: 'text-2xl',
      description: 'text-lg',
    },
  };

  return (
    <div className={`flex flex-col items-center justify-center text-center ${sizeClasses[size].container} ${className} bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/40 animated-in fade-in-50 duration-500`}>
      {/* Animated icon */}
      <div className={`${sizeClasses[size].icon} mb-6 animate-float drop-shadow-lg`}>
        {displayIcon}
      </div>
      
      {/* Title */}
      <h3 className={`${sizeClasses[size].title} font-semibold text-white mb-3`}>
        {displayTitle}
      </h3>
      
      {/* Description */}
      {displayDescription && (
        <p className={`${sizeClasses[size].description} text-gray-400 max-w-md mb-6`}>
          {displayDescription}
        </p>
      )}
      
      {/* Actions */}
      {(actionLabel || secondaryAction) && (
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {actionLabel && (
            <button
              onClick={action?.onClick}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-medium rounded-xl transition-all duration-200 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/40 hover:scale-105"
            >
              {actionLabel}
            </button>
          )}
          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800/60 hover:bg-gray-700/60 text-gray-300 font-medium rounded-xl transition-all duration-200 border border-gray-700/40 hover:border-gray-600/60"
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
      
      {/* Custom content */}
      {children}
    </div>
  );
}

export default memo(EmptyStateComponent);
