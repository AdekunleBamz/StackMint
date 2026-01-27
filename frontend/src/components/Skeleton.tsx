'use client';

import { type ReactNode } from 'react';

// ============================================================================
// Base Skeleton Component
// ============================================================================

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  animate?: boolean;
}

export function Skeleton({
  className = '',
  width,
  height,
  rounded = 'md',
  animate = true,
}: SkeletonProps) {
  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    full: 'rounded-full',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`bg-gradient-to-r from-gray-700/50 via-gray-600/50 to-gray-700/50 background-animate ${roundedClasses[rounded]} ${animate ? 'animate-pulse' : ''} ${className}`}
      style={{
        ...style,
        backgroundSize: '200% 100%',
        animation: animate ? 'shimmer 2s ease-in-out infinite' : undefined,
      }}
      aria-hidden="true"
      role="presentation"
    />
  );
}

// ============================================================================
// Text Skeleton
// ============================================================================

interface TextSkeletonProps {
  lines?: number;
  lineHeight?: string;
  className?: string;
  lastLineWidth?: string;
}

export function TextSkeleton({
  lines = 3,
  lineHeight = 'h-4',
  className = '',
  lastLineWidth = '60%',
}: TextSkeletonProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {[...Array(lines)].map((_, i) => (
        <Skeleton
          key={i}
          className={lineHeight}
          width={i === lines - 1 ? lastLineWidth : '100%'}
        />
      ))}
    </div>
  );
}

// ============================================================================
// NFT Card Skeleton
// ============================================================================

interface NFTCardSkeletonProps {
  showPrice?: boolean;
  showCreator?: boolean;
  className?: string;
}

export function NFTCardSkeleton({
  showPrice = true,
  showCreator = true,
  className = '',
}: NFTCardSkeletonProps) {
  return (
    <div
      className={`bg-gray-800/50 border border-gray-700/50 rounded-2xl overflow-hidden ${className}`}
    >
      {/* Image */}
      <Skeleton className="aspect-square w-full" rounded="none" />

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <Skeleton className="h-5 w-3/4" />

        {/* Creator */}
        {showCreator && (
          <div className="flex items-center gap-2">
            <Skeleton className="w-6 h-6" rounded="full" />
            <Skeleton className="h-3 w-24" />
          </div>
        )}

        {/* Price */}
        {showPrice && (
          <div className="flex items-center justify-between pt-2 border-t border-gray-700/50">
            <div>
              <Skeleton className="h-3 w-12 mb-1" />
              <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="h-8 w-16" rounded="lg" />
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Collection Card Skeleton
// ============================================================================

export function CollectionCardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`bg-gray-800/50 border border-gray-700/50 rounded-2xl overflow-hidden ${className}`}
    >
      {/* Banner */}
      <Skeleton className="h-32 w-full" rounded="none" />

      {/* Avatar */}
      <div className="px-4 -mt-8 relative">
        <Skeleton className="w-16 h-16 border-4 border-gray-800" rounded="xl" />
      </div>

      {/* Content */}
      <div className="p-4 pt-2 space-y-3">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />

        {/* Stats */}
        <div className="flex gap-4 pt-2">
          <div>
            <Skeleton className="h-3 w-8 mb-1" />
            <Skeleton className="h-4 w-12" />
          </div>
          <div>
            <Skeleton className="h-3 w-8 mb-1" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div>
            <Skeleton className="h-3 w-8 mb-1" />
            <Skeleton className="h-4 w-10" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Profile Skeleton
// ============================================================================

export function ProfileSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={className}>
      {/* Banner */}
      <Skeleton className="h-48 w-full" rounded="none" />

      <div className="max-w-6xl mx-auto px-4">
        {/* Avatar & Info */}
        <div className="-mt-16 relative flex flex-col sm:flex-row items-start gap-4">
          <Skeleton className="w-32 h-32 border-4 border-gray-900" rounded="2xl" />
          <div className="pt-4 space-y-2 flex-1">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-32" />
            <div className="flex gap-4 pt-2">
              <Skeleton className="h-10 w-24" rounded="lg" />
              <Skeleton className="h-10 w-10" rounded="lg" />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-800/50 rounded-xl p-4">
              <Skeleton className="h-3 w-16 mb-2" />
              <Skeleton className="h-6 w-20" />
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mt-8 border-b border-gray-800 pb-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-8 w-20" rounded="lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Stats Bar Skeleton
// ============================================================================

export function StatsSkeleton({ count = 4, className = '' }: { count?: number; className?: string }) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-${count} gap-6 ${className}`}>
      {[...Array(count)].map((_, i) => (
        <div key={i} className="bg-gray-800/50 rounded-2xl p-6">
          <Skeleton className="h-4 w-16 mb-2" />
          <Skeleton className="h-8 w-24" />
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Table Skeleton
// ============================================================================

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  className?: string;
}

export function TableSkeleton({
  rows = 5,
  columns = 4,
  showHeader = true,
  className = '',
}: TableSkeletonProps) {
  return (
    <div className={`bg-gray-800/50 rounded-xl overflow-hidden ${className}`}>
      {/* Header */}
      {showHeader && (
        <div className="flex gap-4 p-4 border-b border-gray-700/50">
          {[...Array(columns)].map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
      )}

      {/* Rows */}
      {[...Array(rows)].map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="flex gap-4 p-4 border-b border-gray-700/50 last:border-0"
        >
          {[...Array(columns)].map((_, colIndex) => (
            <Skeleton
              key={colIndex}
              className="h-5 flex-1"
              width={colIndex === 0 ? '120px' : undefined}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Transaction History Skeleton
// ============================================================================

export function TransactionSkeleton({ count = 5, className = '' }: { count?: number; className?: string }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-xl"
        >
          {/* Icon */}
          <Skeleton className="w-10 h-10 shrink-0" rounded="full" />

          {/* Details */}
          <div className="flex-1 min-w-0">
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-3 w-24" />
          </div>

          {/* Amount */}
          <div className="text-right">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Wallet Balance Skeleton
// ============================================================================

export function WalletBalanceSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-gray-800/50 rounded-2xl p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-6 w-6" rounded="full" />
      </div>
      <Skeleton className="h-10 w-40 mb-2" />
      <Skeleton className="h-4 w-24" />
    </div>
  );
}

// ============================================================================
// Form Skeleton
// ============================================================================

export function FormSkeleton({ fields = 4, className = '' }: { fields?: number; className?: string }) {
  return (
    <div className={`space-y-6 ${className}`}>
      {[...Array(fields)].map((_, i) => (
        <div key={i}>
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-12 w-full" rounded="lg" />
        </div>
      ))}
      <Skeleton className="h-12 w-full" rounded="lg" />
    </div>
  );
}

// ============================================================================
// Grid Skeleton
// ============================================================================

interface GridSkeletonProps {
  count?: number;
  columns?: 2 | 3 | 4;
  ItemSkeleton?: React.ComponentType<{ className?: string }>;
  className?: string;
}

export function GridSkeleton({
  count = 8,
  columns = 4,
  ItemSkeleton = NFTCardSkeleton,
  className = '',
}: GridSkeletonProps) {
  const columnClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`grid ${columnClasses[columns]} gap-6 ${className}`}>
      {[...Array(count)].map((_, i) => (
        <ItemSkeleton key={i} />
      ))}
    </div>
  );
}

// ============================================================================
// Shimmer Effect (alternative to pulse)
// ============================================================================

export function ShimmerSkeleton({
  className = '',
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={`relative overflow-hidden bg-gray-700/50 ${className}`}>
      {children}
      <div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"
        style={{
          animation: 'shimmer 2s infinite',
        }}
      />
      <style jsx>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}

// ============================================================================
// Skeleton Container (for layout)
// ============================================================================

interface SkeletonContainerProps {
  isLoading: boolean;
  skeleton: ReactNode;
  children: ReactNode;
  className?: string;
}

export function SkeletonContainer({
  isLoading,
  skeleton,
  children,
  className = '',
}: SkeletonContainerProps) {
  return (
    <div className={className}>
      {isLoading ? skeleton : children}
    </div>
  );
}

export default Skeleton;
