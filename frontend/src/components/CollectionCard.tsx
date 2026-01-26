'use client';

import { useState, useMemo, memo } from 'react';
import Link from 'next/link';

/**
 * CollectionCard Component
 * Displays a collection with image, stats, and verification status
 * @module components/CollectionCard
 */

// Gradient presets for collection backgrounds
const GRADIENT_PRESETS = [
  'from-purple-600 to-blue-600',
  'from-pink-600 to-purple-600',
  'from-blue-600 to-cyan-600',
  'from-orange-600 to-red-600',
  'from-green-600 to-teal-600',
] as const;

interface CollectionCardProps {
  name: string;
  creator: string;
  itemCount: number;
  image?: string;
  floorPrice?: number;
  volume?: number;
  verified?: boolean;
  featured?: boolean;
}

export default function CollectionCard({ 
  name, 
  creator, 
  itemCount, 
  image,
  floorPrice,
  volume,
  verified = false,
  featured = false
}: CollectionCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

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

  return (
    <Link 
      href={`/collections/${name.toLowerCase().replace(/\s+/g, '-')}`}
      className="block group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`bg-gray-900/50 border rounded-2xl overflow-hidden transition-all duration-300 ${
        isHovered 
          ? 'border-purple-500/50 shadow-xl shadow-purple-500/10 -translate-y-1' 
          : 'border-purple-500/20'
      }`}>
        {/* Image section */}
        <div className={`h-44 bg-gradient-to-br ${getGradient()} relative overflow-hidden`}>
          {image && !imageError ? (
            <img 
              src={image} 
              alt={name}
              className={`w-full h-full object-cover transition-transform duration-500 ${isHovered ? 'scale-110' : 'scale-100'}`}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-5xl opacity-50">📦</span>
            </div>
          )}
          
          {/* Featured badge */}
          {featured && (
            <div className="absolute top-3 left-3 bg-yellow-500/90 backdrop-blur-sm text-black text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
              <span>⭐</span> Featured
            </div>
          )}
          
          {/* Item count badge */}
          <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-lg">
            {itemCount} items
          </div>
        </div>
        
        {/* Content section */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="font-bold text-white truncate flex items-center gap-1.5">
              {name}
              {verified && (
                <svg className="w-4 h-4 text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </h4>
          </div>
          
          <div className="flex items-center gap-2 mb-3">
            <div className="w-5 h-5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
            <p className="text-sm text-gray-400">by {creator.slice(0, 6)}...{creator.slice(-4)}</p>
          </div>
          
          {/* Stats */}
          {(floorPrice !== undefined || volume !== undefined) && (
            <div className="flex justify-between items-center pt-3 border-t border-gray-700/50">
              {floorPrice !== undefined && (
                <div>
                  <p className="text-xs text-gray-500">Floor</p>
                  <p className="text-sm font-semibold text-purple-400">{floorPrice} STX</p>
                </div>
              )}
              {volume !== undefined && (
                <div className="text-right">
                  <p className="text-xs text-gray-500">Volume</p>
                  <p className="text-sm font-semibold text-white">{volume.toLocaleString()} STX</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
