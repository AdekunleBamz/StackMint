'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';

// Default placeholder for NFT images
const DEFAULT_PLACEHOLDER = '🎨';
const ADDRESS_DISPLAY_LENGTH = 12;

interface NFTCardProps {
  id: number;
  name: string;
  image?: string;
  price?: number;
  owner: string;
  onBuy?: () => void;
  isLoading?: boolean;
}

export default function NFTCard({ id, name, image, price, owner, onBuy, isLoading }: NFTCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const formatAddress = useCallback((addr: string) => {
    if (addr.length <= ADDRESS_DISPLAY_LENGTH) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  }, []);

  return (
    <div 
      className="bg-gray-900/50 border border-purple-500/20 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all duration-300 group hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="h-52 bg-gradient-to-br from-purple-600 to-blue-600 relative overflow-hidden">
        {image && !imageError ? (
          <img 
            src={image} 
            alt={name} 
            className={`w-full h-full object-cover transition-transform duration-500 ${isHovered ? 'scale-110' : 'scale-100'}`}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl opacity-50">🎨</span>
          </div>
        )}
        
        {/* Overlay with actions */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
          <button className="bg-white/90 hover:bg-white text-gray-900 font-medium px-4 py-2 rounded-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            View Details
          </button>
        </div>
        
        {/* ID Badge */}
        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-lg">
          #{id}
        </div>
        
        {/* Price Badge */}
        {price && (
          <div className="absolute top-3 right-3 bg-purple-600/90 backdrop-blur-sm text-white text-sm font-bold px-3 py-1 rounded-lg">
            {price} STX
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h4 className="font-bold text-white truncate text-lg mb-1">{name}</h4>
        
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
          <span className="text-xs text-gray-400">{formatAddress(owner)}</span>
        </div>
        
        {price && onBuy && (
          <button 
            onClick={onBuy}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 disabled:from-purple-800 disabled:to-purple-900 disabled:cursor-not-allowed text-white py-3 rounded-xl text-sm font-semibold transition-all duration-300 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40"
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
              'Buy Now'
            )}
          </button>
        )}
      </div>
    </div>
  );
}
