'use client';

/**
 * NFTGrid Component
 * Displays a filterable grid of NFT collections with animations
 * @module NFTGrid
 * @version 2.3.0
 */

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import CollectionCard from './CollectionCard';

// Loading state transition duration
const FILTER_TRANSITION_MS = 300;
const GRID_COLUMN_COUNT = 3;

/** Maximum collections to display */
const MAX_DISPLAY_COUNT = 12;

/** Grid gap in rem units */
const GRID_GAP = 1.5;

/**
 * Grid display mode
 */
type GridDisplayMode = 'grid' | 'list' | 'compact';

/**
 * Collection data structure
 */
interface CollectionItem {
  name: string;
  creator: string;
  itemCount: number;
  featured: boolean;
  image?: string;
  floorPrice?: number;
  volume24h?: number;
  verified?: boolean;
}

const mockCollections: CollectionItem[] = [
  { name: 'Stacks Punks', creator: 'SP1ABC...', itemCount: 100, featured: true, floorPrice: 125, volume24h: 2450, verified: true },
  { name: 'Bitcoin Art', creator: 'SP2DEF...', itemCount: 50, featured: false, floorPrice: 45, volume24h: 890 },
  { name: 'Clarity Dreams', creator: 'SP3GHI...', itemCount: 75, featured: true, floorPrice: 200, volume24h: 1200, verified: true },
  { name: 'Block Heroes', creator: 'SP4JKL...', itemCount: 200, featured: false, floorPrice: 30, volume24h: 450 },
  { name: 'Stacks OGs', creator: 'SP5MNO...', itemCount: 88, featured: true, floorPrice: 500, volume24h: 3200, verified: true },
  { name: 'Pixel Miners', creator: 'SP6PQR...', itemCount: 150, featured: false, floorPrice: 15, volume24h: 280 },
];

type FilterType = 'all' | 'featured' | 'new';
type SortType = 'volume' | 'floor' | 'items';

export default function NFTGrid() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('volume');
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const handleFilterChange = (newFilter: FilterType) => {
    setIsLoading(true);
    setFilter(newFilter);
    setTimeout(() => setIsLoading(false), 300);
  };

  const filteredCollections = useMemo(() => {
    let result = filter === 'featured' 
      ? mockCollections.filter(c => c.featured)
      : mockCollections;
    
    // Sort collections
    return [...result].sort((a, b) => {
      if (sortBy === 'volume') return (b.volume24h || 0) - (a.volume24h || 0);
      if (sortBy === 'floor') return (b.floorPrice || 0) - (a.floorPrice || 0);
      return b.itemCount - a.itemCount;
    });
  }, [filter, sortBy]);

  const totalVolume = mockCollections.reduce((sum, c) => sum + (c.volume24h || 0), 0);

  return (
    <section ref={sectionRef} className="py-24 px-4 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent relative">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />
      </div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className={`flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div>
            <span className="inline-block px-4 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-sm font-medium mb-4">
              🔥 Trending Now
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Popular Collections</h2>
            <p className="text-gray-400">Discover {mockCollections.length} trending NFT collections • {totalVolume.toLocaleString()} STX 24h volume</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Sort dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortType)}
              className="bg-gray-900/50 border border-gray-700/50 text-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-purple-500"
            >
              <option value="volume">Sort by Volume</option>
              <option value="floor">Sort by Floor</option>
              <option value="items">Sort by Items</option>
            </select>
            
            {/* Filter tabs */}
            <div className="flex gap-1 bg-gray-900/50 p-1 rounded-xl border border-gray-700/50">
              {(['all', 'featured', 'new'] as FilterType[]).map((f) => (
                <button
                  key={f}
                  onClick={() => handleFilterChange(f)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 capitalize flex items-center gap-1.5 ${
                    filter === f
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {f === 'featured' && <span>⭐</span>}
                  {f === 'new' && <span>✨</span>}
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className={`grid grid-cols-3 gap-4 mb-8 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="bg-gray-900/30 rounded-xl p-4 border border-gray-800/50 text-center">
            <div className="text-2xl font-bold text-white">{mockCollections.length}</div>
            <div className="text-xs text-gray-500">Collections</div>
          </div>
          <div className="bg-gray-900/30 rounded-xl p-4 border border-gray-800/50 text-center">
            <div className="text-2xl font-bold text-white">{mockCollections.reduce((sum, c) => sum + c.itemCount, 0)}</div>
            <div className="text-xs text-gray-500">Total NFTs</div>
          </div>
          <div className="bg-gray-900/30 rounded-xl p-4 border border-gray-800/50 text-center">
            <div className="text-2xl font-bold text-white">{totalVolume.toLocaleString()}</div>
            <div className="text-xs text-gray-500">24h Volume (STX)</div>
          </div>
        </div>

        {/* Grid */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-300 ${isLoading ? 'opacity-50 scale-[0.99]' : 'opacity-100 scale-100'}`}>
          {filteredCollections.map((collection, index) => (
            <div 
              key={collection.name}
              className={`transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ transitionDelay: `${(index + 2) * 100}ms` }}
            >
              <CollectionCard {...collection} />
            </div>
          ))}
        </div>

        {/* Empty state */}
        {filteredCollections.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-white mb-2">No collections found</h3>
            <p className="text-gray-400">Try adjusting your filters</p>
          </div>
        )}

        {/* View all link */}
        <div className={`mt-12 text-center transition-all duration-700 delay-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <Link 
            href="/collections"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white px-8 py-3 rounded-xl font-medium transition-all hover:shadow-lg hover:shadow-purple-500/25 hover:-translate-y-0.5 group"
          >
            <span>View All Collections</span>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
