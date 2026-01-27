'use client';

/**
 * Skeleton Variants Component
 * Enhanced skeleton loading states for NFT platform
 * @module components/SkeletonVariants
 * @version 1.0.0
 */

import { ReactNode } from 'react';

interface SkeletonProps {
  className?: string;
  animate?: boolean;
}

/**
 * Base skeleton element
 */
export function Skeleton({ className = '', animate = true }: SkeletonProps) {
  return (
    <div
      className={`
        bg-gray-700/50 rounded
        ${animate ? 'animate-pulse' : ''}
        ${className}
      `}
    />
  );
}

/**
 * Skeleton for NFT card
 */
export function NFTCardSkeleton() {
  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
      {/* Image skeleton */}
      <Skeleton className="aspect-square w-full" />
      
      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <Skeleton className="h-5 w-3/4" />
        
        {/* Collection */}
        <Skeleton className="h-4 w-1/2" />
        
        {/* Price row */}
        <div className="flex items-center justify-between pt-2">
          <div className="space-y-1">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-5 w-20" />
          </div>
          <Skeleton className="h-9 w-20 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton grid for multiple NFT cards
 */
export function NFTGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <NFTCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Skeleton for collection card
 */
export function CollectionCardSkeleton() {
  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
      {/* Banner */}
      <Skeleton className="h-32 w-full" />
      
      {/* Avatar */}
      <div className="px-4 -mt-10 relative z-10">
        <Skeleton className="w-20 h-20 rounded-xl border-4 border-gray-800" />
      </div>
      
      {/* Content */}
      <div className="p-4 space-y-3">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        
        {/* Stats */}
        <div className="flex gap-4 pt-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-5 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for profile header
 */
export function ProfileHeaderSkeleton() {
  return (
    <div className="relative">
      {/* Banner */}
      <Skeleton className="h-48 w-full rounded-xl" />
      
      {/* Profile info */}
      <div className="flex flex-col md:flex-row gap-6 -mt-16 px-6 relative z-10">
        {/* Avatar */}
        <Skeleton className="w-32 h-32 rounded-full border-4 border-gray-900" />
        
        {/* Details */}
        <div className="flex-1 pt-4 md:pt-8 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          
          <Skeleton className="h-4 w-full max-w-lg" />
          <Skeleton className="h-4 w-3/4 max-w-md" />
          
          {/* Stats */}
          <div className="flex gap-6 pt-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex gap-2 pt-4 md:pt-8">
          <Skeleton className="h-10 w-28 rounded-lg" />
          <Skeleton className="h-10 w-10 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for transaction row
 */
export function TransactionRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg">
      <Skeleton className="w-12 h-12 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
      <div className="text-right space-y-2">
        <Skeleton className="h-4 w-20 ml-auto" />
        <Skeleton className="h-3 w-16 ml-auto" />
      </div>
    </div>
  );
}

/**
 * Skeleton for transaction list
 */
export function TransactionListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <TransactionRowSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Skeleton for stats cards
 */
export function StatsCardSkeleton() {
  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center gap-4">
        <Skeleton className="w-12 h-12 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-6 w-24" />
        </div>
      </div>
      <Skeleton className="h-3 w-16 mt-4" />
    </div>
  );
}

/**
 * Skeleton for marketplace filters
 */
export function FiltersSkeleton() {
  return (
    <div className="space-y-6">
      {/* Price range */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-24" />
        <div className="flex gap-2">
          <Skeleton className="h-10 flex-1 rounded-lg" />
          <Skeleton className="h-10 flex-1 rounded-lg" />
        </div>
      </div>
      
      {/* Categories */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-20" />
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="w-5 h-5 rounded" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </div>
      
      {/* Status */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-16" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Full page skeleton
 */
interface PageSkeletonProps {
  variant: 'marketplace' | 'collection' | 'profile' | 'nft-detail';
}

export function PageSkeleton({ variant }: PageSkeletonProps) {
  switch (variant) {
    case 'marketplace':
      return (
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <Skeleton className="h-10 w-64" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-64 rounded-lg" />
              <Skeleton className="h-10 w-32 rounded-lg" />
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-24 rounded-lg" />
            ))}
          </div>
          
          {/* Grid */}
          <NFTGridSkeleton count={12} />
        </div>
      );

    case 'collection':
      return (
        <div className="space-y-8">
          <CollectionCardSkeleton />
          <NFTGridSkeleton count={8} />
        </div>
      );

    case 'profile':
      return (
        <div className="space-y-8">
          <ProfileHeaderSkeleton />
          
          {/* Tabs */}
          <div className="flex gap-4 border-b border-gray-700 pb-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-20 rounded-lg" />
            ))}
          </div>
          
          <NFTGridSkeleton count={6} />
        </div>
      );

    case 'nft-detail':
      return (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image */}
          <Skeleton className="aspect-square rounded-xl" />
          
          {/* Details */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-10 w-3/4" />
            </div>
            
            <div className="flex items-center gap-4">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-5 w-24" />
              </div>
            </div>
            
            <div className="p-6 bg-gray-800 rounded-xl space-y-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
              <div className="flex gap-2">
                <Skeleton className="h-12 flex-1 rounded-lg" />
                <Skeleton className="h-12 w-12 rounded-lg" />
              </div>
            </div>
            
            <TransactionListSkeleton count={3} />
          </div>
        </div>
      );

    default:
      return null;
  }
}

/**
 * Skeleton wrapper with shimmer effect
 */
interface ShimmerSkeletonProps {
  children: ReactNode;
  className?: string;
}

export function ShimmerSkeleton({ children, className = '' }: ShimmerSkeletonProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {children}
      <div 
        className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite]"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
        }}
      />
    </div>
  );
}

export default Skeleton;
