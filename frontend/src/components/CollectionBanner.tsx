'use client';

/**
 * CollectionBanner Component
 * Hero banner for collection pages with stats and actions
 * @module components/CollectionBanner
 * @version 1.0.0
 */

import { useState } from 'react';

interface CollectionStats {
  items: number;
  owners: number;
  floorPrice: number;
  volume: number;
  listed: number;
}

interface CollectionBannerProps {
  /** Collection name */
  name: string;
  /** Collection description */
  description?: string;
  /** Banner image URL */
  bannerImage?: string;
  /** Collection avatar/logo */
  avatarImage?: string;
  /** Creator address */
  creator: string;
  /** Whether collection is verified */
  isVerified?: boolean;
  /** Collection stats */
  stats: CollectionStats;
  /** Social links */
  socials?: {
    website?: string;
    twitter?: string;
    discord?: string;
  };
  /** Custom className */
  className?: string;
  /** Callback for share action */
  onShare?: () => void;
  /** Callback for report action */
  onReport?: () => void;
}

export default function CollectionBanner({
  name,
  description,
  bannerImage,
  avatarImage,
  creator,
  isVerified = false,
  stats,
  socials,
  className = '',
  onShare,
  onReport,
}: CollectionBannerProps) {
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [bannerLoaded, setBannerLoaded] = useState(false);

  const truncateAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const statItems = [
    { label: 'Items', value: stats.items.toLocaleString(), icon: '🖼️' },
    { label: 'Owners', value: stats.owners.toLocaleString(), icon: '👥' },
    { label: 'Floor', value: `${stats.floorPrice} STX`, icon: '💰' },
    { label: 'Volume', value: `${stats.volume.toLocaleString()} STX`, icon: '📊' },
    { label: 'Listed', value: `${((stats.listed / stats.items) * 100).toFixed(1)}%`, icon: '🏷️' },
  ];

  return (
    <div className={`relative ${className}`}>
      {/* Banner Image */}
      <div className="relative h-48 md:h-64 lg:h-80 overflow-hidden">
        {bannerImage ? (
          <>
            {!bannerLoaded && (
              <div className="absolute inset-0 bg-gradient-to-r from-purple-900 via-pink-900 to-orange-900 animate-pulse" />
            )}
            <img
              src={bannerImage}
              alt={`${name} banner`}
              className={`w-full h-full object-cover transition-opacity duration-500 ${bannerLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setBannerLoaded(true)}
            />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-purple-900 via-pink-900 to-orange-900" />
        )}
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/50 to-transparent" />

        {/* Action buttons */}
        <div className="absolute top-4 right-4 flex gap-2">
          {onShare && (
            <button
              onClick={onShare}
              className="p-2.5 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-lg text-white/80 hover:text-white transition-colors"
              aria-label="Share collection"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
          )}
          {onReport && (
            <button
              onClick={onReport}
              className="p-2.5 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-lg text-white/80 hover:text-white transition-colors"
              aria-label="Report collection"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="relative max-w-6xl mx-auto px-4 -mt-24 md:-mt-28">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="relative">
              {avatarImage ? (
                <img
                  src={avatarImage}
                  alt={name}
                  className="w-32 h-32 md:w-40 md:h-40 rounded-2xl border-4 border-gray-950 object-cover shadow-xl"
                />
              ) : (
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl border-4 border-gray-950 bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-4xl shadow-xl">
                  🎨
                </div>
              )}
              
              {/* Verified badge */}
              {isVerified && (
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center border-4 border-gray-950 shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 pt-4 md:pt-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
                  {name}
                  {isVerified && (
                    <span className="text-blue-400 text-xl" title="Verified Collection">✓</span>
                  )}
                </h1>
                
                <div className="mt-2 flex flex-wrap items-center gap-4 text-sm">
                  <span className="text-gray-400">
                    Created by{' '}
                    <a href={`/profile/${creator}`} className="text-purple-400 hover:text-purple-300 font-mono transition-colors">
                      {truncateAddress(creator)}
                    </a>
                  </span>

                  {/* Social links */}
                  {socials && (
                    <div className="flex items-center gap-2">
                      {socials.website && (
                        <a
                          href={socials.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-gray-400 hover:text-white transition-colors"
                          aria-label="Website"
                        >
                          🌐
                        </a>
                      )}
                      {socials.twitter && (
                        <a
                          href={socials.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-gray-400 hover:text-white transition-colors"
                          aria-label="Twitter"
                        >
                          𝕏
                        </a>
                      )}
                      {socials.discord && (
                        <a
                          href={socials.discord}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-gray-400 hover:text-white transition-colors"
                          aria-label="Discord"
                        >
                          💬
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-lg transition-colors">
                  View Items
                </button>
                <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors">
                  Watch
                </button>
              </div>
            </div>

            {/* Description */}
            {description && (
              <div className="mt-4">
                <p className={`text-gray-300 ${isDescExpanded ? '' : 'line-clamp-2'}`}>
                  {description}
                </p>
                {description.length > 150 && (
                  <button
                    onClick={() => setIsDescExpanded(!isDescExpanded)}
                    className="text-purple-400 hover:text-purple-300 text-sm mt-1 transition-colors"
                  >
                    {isDescExpanded ? 'Show less' : 'Read more'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {statItems.map((stat) => (
            <div
              key={stat.label}
              className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-center hover:bg-gray-800 transition-colors"
            >
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
