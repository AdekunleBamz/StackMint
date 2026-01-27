'use client';

import { useState, useCallback, memo } from 'react';
import Image from 'next/image';

/**
 * NFTCard Component
 * Displays an NFT with image, price, and owner information
 * @module components/NFTCard
 * @version 3.0.0
 */

// Default placeholder for NFT images
const DEFAULT_PLACEHOLDER = '🎨';
const ADDRESS_DISPLAY_LENGTH = 12;
const PRICE_DECIMALS = 2;

// Animation configuration
const HOVER_SCALE_CLASS = 'scale-105';
const DEFAULT_SCALE_CLASS = 'scale-100';
const TRANSITION_DURATION_CLASS = 'duration-300';

// Rarity configuration
type RarityLevel = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';

const rarityConfig: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  Common: { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/30', glow: '' },
  Uncommon: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30', glow: 'shadow-green-500/10' },
  Rare: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30', glow: 'shadow-blue-500/10' },
  Epic: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30', glow: 'shadow-purple-500/10' },
  Legendary: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30', glow: 'shadow-orange-500/20' },
  Mythic: { bg: 'bg-gradient-to-r from-pink-500/20 to-purple-500/20', text: 'text-pink-400', border: 'border-pink-500/30', glow: 'shadow-pink-500/20' },
};

interface NFTCardProps {
  id: number;
  name: string;
  image?: string;
  price?: number;
  owner: string;
  collection?: string;
  rarity?: string;
  onBuy?: () => void;
  onView?: () => void;
  isLoading?: boolean;
  isFavorited?: boolean;
  onFavorite?: () => void;
}

function NFTCardComponent({ 
  id, 
  name, 
  image, 
  price, 
  owner, 
  collection,
  rarity = 'Common',
  onBuy, 
  onView,
  isLoading,
  isFavorited = false,
  onFavorite,
}: NFTCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const formatAddress = useCallback((addr: string) => {
    if (addr.length <= ADDRESS_DISPLAY_LENGTH) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  }, []);

  const rarityStyle = rarityConfig[rarity] || rarityConfig.Common;

  return (
    <article 
      className={`group relative bg-gray-900/60 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden transition-all duration-300 ${
        isHovered ? 'border-purple-500/50 shadow-xl shadow-purple-500/10 -translate-y-1' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="article"
      aria-labelledby={`nft-${id}-title`}
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
        {image && !imageError ? (
          <>
            {/* Loading skeleton */}
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-800 animate-shimmer" />
            )}
            <img 
              src={image} 
              alt={name} 
              className={`w-full h-full object-cover transition-all duration-500 ${
                isHovered ? 'scale-110' : 'scale-100'
              } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              loading="lazy"
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/30 to-pink-900/30">
            <span className="text-6xl opacity-40 group-hover:scale-110 transition-transform duration-300">🎨</span>
          </div>
        )}
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Top badges */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
          {/* ID Badge */}
          <span className="bg-black/60 backdrop-blur-md text-white text-xs font-medium px-2.5 py-1 rounded-lg border border-white/10">
            #{id}
          </span>
          
          {/* Rarity Badge */}
          {rarity && (
            <span className={`${rarityStyle.bg} ${rarityStyle.text} ${rarityStyle.border} border backdrop-blur-md text-xs font-medium px-2.5 py-1 rounded-lg`}>
              {rarity}
            </span>
          )}
        </div>
        
        {/* Favorite button */}
        {onFavorite && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFavorite();
            }}
            className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
              isFavorited 
                ? 'bg-red-500 text-white' 
                : 'bg-black/40 backdrop-blur-md text-white/70 hover:text-white hover:bg-black/60 opacity-0 group-hover:opacity-100'
            }`}
            aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <svg 
              className="w-4 h-4" 
              fill={isFavorited ? 'currentColor' : 'none'} 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        )}
        
        {/* Quick action overlay */}
        <div className="absolute bottom-4 left-4 right-4 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <button 
            onClick={onView}
            className="w-full bg-white/90 hover:bg-white text-gray-900 font-medium px-4 py-2.5 rounded-xl backdrop-blur-sm transition-colors"
          >
            View Details
          </button>
        </div>
        
        {/* Price Badge */}
        {price !== undefined && (
          <div className="absolute bottom-3 right-3 opacity-100 group-hover:opacity-0 transition-opacity duration-200">
            <span className="bg-purple-600/90 backdrop-blur-md text-white text-sm font-bold px-3 py-1.5 rounded-lg shadow-lg shadow-purple-500/20">
              {price} STX
            </span>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-4">
        {/* Collection name */}
        {collection && (
          <p className="text-xs text-purple-400 font-medium mb-1 truncate">{collection}</p>
        )}
        
        {/* NFT name */}
        <h3 
          id={`nft-${id}-title`}
          className="font-bold text-white text-lg mb-2 truncate group-hover:text-purple-300 transition-colors"
        >
          {name}
        </h3>
        
        {/* Owner info */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 ring-1 ring-purple-500/30" />
          <span className="text-xs text-gray-400 font-mono">{formatAddress(owner)}</span>
        </div>
        
        {/* Buy button */}
        {price !== undefined && onBuy && (
          <button 
            onClick={onBuy}
            disabled={isLoading}
            className="w-full relative overflow-hidden bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 disabled:from-purple-800 disabled:to-purple-900 disabled:cursor-not-allowed text-white py-3 rounded-xl text-sm font-semibold transition-all duration-300 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 group/btn"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span>Buy for {price} STX</span>
                <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            )}
            {/* Button shine effect */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
          </button>
        )}
      </div>
    </article>
  );
}

export default memo(NFTCardComponent);
