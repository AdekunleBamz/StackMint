'use client';

import { useState, useMemo, memo } from 'react';
import Link from 'next/link';

/**
 * CollectionCard Component
 * Displays a collection with image, stats, and verification status
 * @module components/CollectionCard
 * @version 2.3.0
 */

// Gradient presets for collection backgrounds
const GRADIENT_PRESETS = [
  'from-purple-600 to-blue-600',
  'from-pink-600 to-purple-600',
  'from-blue-600 to-cyan-600',
  'from-orange-600 to-red-600',
  'from-green-600 to-teal-600',
] as const;

type GradientPreset = typeof GRADIENT_PRESETS[number];

// Card animation timing
const HOVER_TRANSITION_DURATION = 'duration-300';
const IMAGE_SCALE_AMOUNT = 1.05;

interface CollectionCardProps {
  name: string;
  creator: string;
  itemCount: number;
  image?: string;
  floorPrice?: number;
  volume?: number;
  volume24h?: number;
  verified?: boolean;
  featured?: boolean;
  owners?: number;
  change24h?: number;
}

export default function CollectionCard({ 
  name, 
  creator, 
  itemCount, 
  image,
  floorPrice,
  volume,
  volume24h,
  verified = false,
  featured = false,
  owners,
  change24h
}: CollectionCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  // Generate a consistent gradient based on name
  const getGradient = () => {
    const gradients = [
      'from-purple-600 to-blue-600',
      'from-pink-600 to-purple-600',
      'from-blue-600 to-cyan-600',
      'from-orange-600 to-red-600',
      'from-green-600 to-teal-600',
    ];
    const index = name.charCodeAt(0) % gradients.length;
    return gradients[index];
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  const displayVolume = volume24h ?? volume;

  return (
    <Link 
      href={`/collections/${name.toLowerCase().replace(/\s+/g, '-')}`}
      className="block group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`bg-gradient-to-br from-gray-900/80 to-gray-900/40 backdrop-blur-sm border rounded-2xl overflow-hidden transition-all duration-300 ${
        isHovered 
          ? 'border-purple-500/50 shadow-xl shadow-purple-500/10 -translate-y-1' 
          : 'border-purple-500/20'
      }`}>
        {/* Image section */}
        <div className={`h-48 bg-gradient-to-br ${getGradient()} relative overflow-hidden`}>
          {image && !imageError ? (
            <img 
              src={image} 
              alt={name}
              className={`w-full h-full object-cover transition-transform duration-500 ${isHovered ? 'scale-110' : 'scale-100'}`}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-6xl opacity-50 group-hover:scale-110 transition-transform duration-300">📦</span>
            </div>
          )}
          
          {/* Gradient overlay on hover */}
          <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
          
          {/* Featured badge */}
          {featured && (
            <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-lg">
              <span>⭐</span> Featured
            </div>
          )}
          
          {/* Like button */}
          <button
            onClick={handleLikeClick}
            className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
              isLiked 
                ? 'bg-pink-500 text-white' 
                : 'bg-black/40 backdrop-blur-sm text-white/70 hover:bg-black/60 hover:text-white'
            }`}
          >
            {isLiked ? '❤️' : '🤍'}
          </button>
          
          {/* Item count badge */}
          <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5">
            <span>🖼️</span> {itemCount} items
          </div>
          
          {/* Quick action on hover */}
          <div className={`absolute bottom-3 left-3 transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
            <span className="bg-purple-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-lg">
              View Collection →
            </span>
          </div>
        </div>
        
        {/* Content section */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="font-bold text-white truncate flex items-center gap-1.5 group-hover:text-purple-300 transition-colors">
              {name}
              {verified && (
                <svg className="w-4 h-4 text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </h4>
            {change24h !== undefined && (
              <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${change24h >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                {change24h >= 0 ? '+' : ''}{change24h}%
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2 mb-3">
            <div className="w-5 h-5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 ring-2 ring-purple-500/20" />
            <p className="text-sm text-gray-400">
              by <span className="text-gray-300">{creator.slice(0, 6)}...{creator.slice(-4)}</span>
            </p>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-700/50">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Floor</p>
              <p className="text-sm font-semibold text-purple-400">{floorPrice ?? '—'} STX</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-0.5">Volume</p>
              <p className="text-sm font-semibold text-white">{displayVolume ? displayVolume.toLocaleString() : '—'}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 mb-0.5">Owners</p>
              <p className="text-sm font-semibold text-gray-300">{owners ?? Math.floor(itemCount * 0.7)}</p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
