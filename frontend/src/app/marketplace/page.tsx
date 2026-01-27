'use client';

/**
 * Marketplace Page
 * NFT marketplace with filtering, sorting, and price range selection
 * @module MarketplacePage
 * @version 2.3.0
 */

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Price range configuration
const DEFAULT_MIN_PRICE = 0;
const DEFAULT_MAX_PRICE = 1000;

/** Items per page for marketplace grid */
const ITEMS_PER_PAGE = 12;

/** Rarity levels in order */
const RARITY_ORDER = ['Common', 'Uncommon', 'Rare', 'Legendary', 'Mythic'] as const;

/**
 * NFT listing data structure
 */
interface Listing {
  id: number;
  name: string;
  price: number;
  seller: string;
  image: string | null;
  collection: string;
  rarity: string;
  likes: number;
  isNew?: boolean;
}

/**
 * Rarity type for NFTs
 */
type RarityLevel = typeof RARITY_ORDER[number];

const mockListings: Listing[] = [
  { id: 1, name: 'Stacks Punk #42', price: 100, seller: 'SP1ABC...XYZ', image: null, collection: 'Stacks Punks', rarity: 'Rare', likes: 24, isNew: true },
  { id: 2, name: 'Bitcoin Art #7', price: 50, seller: 'SP2DEF...ABC', image: null, collection: 'Bitcoin Art', rarity: 'Common', likes: 12 },
  { id: 3, name: 'Clarity Dream #13', price: 75, seller: 'SP3GHI...DEF', image: null, collection: 'Clarity Dreams', rarity: 'Uncommon', likes: 18 },
  { id: 4, name: 'Block Hero #99', price: 200, seller: 'SP4JKL...GHI', image: null, collection: 'Block Heroes', rarity: 'Legendary', likes: 56, isNew: true },
  { id: 5, name: 'Stacks OG #1', price: 500, seller: 'SP5MNO...JKL', image: null, collection: 'Stacks OGs', rarity: 'Mythic', likes: 89 },
  { id: 6, name: 'Pixel Miner #33', price: 25, seller: 'SP6PQR...MNO', image: null, collection: 'Pixel Miners', rarity: 'Common', likes: 7 },
];

const sortOptions = [
  { id: 'recent', label: 'Recently Listed', icon: '🕐' },
  { id: 'price-low', label: 'Price: Low to High', icon: '📉' },
  { id: 'price-high', label: 'Price: High to Low', icon: '📈' },
  { id: 'rarity', label: 'Rarity', icon: '💎' },
  { id: 'popular', label: 'Most Popular', icon: '🔥' },
];

const collections = ['All Collections', 'Stacks Punks', 'Bitcoin Art', 'Clarity Dreams', 'Block Heroes', 'Stacks OGs', 'Pixel Miners'];

export default function MarketplacePage() {
  const [sortBy, setSortBy] = useState(sortOptions[0].id);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollection, setSelectedCollection] = useState('All Collections');
  const [selectedRarities, setSelectedRarities] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const getRarityColor = (rarity: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      Common: { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/30' },
      Uncommon: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30' },
      Rare: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
      Legendary: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
      Mythic: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
    };
    return colors[rarity] || colors.Common;
  };

  const toggleRarity = (rarity: string) => {
    setSelectedRarities(prev => 
      prev.includes(rarity) 
        ? prev.filter(r => r !== rarity)
        : [...prev, rarity]
    );
  };

  const filteredListings = useMemo(() => {
    let filtered = [...mockListings];
    
    if (searchQuery) {
      filtered = filtered.filter(l => 
        l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.collection.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (selectedCollection !== 'All Collections') {
      filtered = filtered.filter(l => l.collection === selectedCollection);
    }
    
    if (selectedRarities.length > 0) {
      filtered = filtered.filter(l => selectedRarities.includes(l.rarity));
    }
    
    filtered = filtered.filter(l => l.price >= priceRange[0] && l.price <= priceRange[1]);
    
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'popular':
        filtered.sort((a, b) => b.likes - a.likes);
        break;
    }
    
    return filtered;
  }, [searchQuery, selectedCollection, selectedRarities, priceRange, sortBy]);

  const stats = {
    totalVolume: '2.4M',
    totalListings: '12,847',
    floorPrice: '0.5',
    owners: '3,421'
  };

  return (
    <main className="min-h-screen bg-gray-950 animate-fade-in">
      <Header />
      
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>
      
      <div className="relative pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
            <Link href="/" className="hover:text-purple-400 transition-colors flex items-center gap-1">
              <span>🏠</span>
              <span>Home</span>
            </Link>
            <span className="text-gray-600">/</span>
            <span className="text-white font-medium">Marketplace</span>
          </nav>

          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
                NFT <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Marketplace</span>
              </h1>
              <p className="text-gray-400 text-lg">Discover, buy, and sell unique digital collectibles</p>
            </div>
            
            {/* Stats Bar */}
            <div className="flex flex-wrap gap-6 bg-gray-900/50 border border-gray-700/50 rounded-2xl px-6 py-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{stats.totalVolume}</p>
                <p className="text-xs text-gray-400">Total Volume (STX)</p>
              </div>
              <div className="w-px bg-gray-700" />
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{stats.totalListings}</p>
                <p className="text-xs text-gray-400">Listed NFTs</p>
              </div>
              <div className="w-px bg-gray-700 hidden sm:block" />
              <div className="text-center hidden sm:block">
                <p className="text-2xl font-bold text-white">{stats.floorPrice} STX</p>
                <p className="text-xs text-gray-400">Floor Price</p>
              </div>
              <div className="w-px bg-gray-700 hidden md:block" />
              <div className="text-center hidden md:block">
                <p className="text-2xl font-bold text-white">{stats.owners}</p>
                <p className="text-xs text-gray-400">Unique Owners</p>
              </div>
            </div>
          </div>

          {/* Search and Controls Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            {/* Search */}
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              <input
                type="text"
                placeholder="Search NFTs, collections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-900/80 border border-gray-700/50 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all"
              />
            </div>
            
            {/* Collection Filter */}
            <select
              value={selectedCollection}
              onChange={(e) => setSelectedCollection(e.target.value)}
              className="bg-gray-900/80 border border-gray-700/50 text-white rounded-xl px-4 py-3.5 focus:border-purple-500 focus:outline-none min-w-[180px]"
            >
              {collections.map((collection) => (
                <option key={collection} value={collection}>{collection}</option>
              ))}
            </select>
            
            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-900/80 border border-gray-700/50 text-white rounded-xl px-4 py-3.5 focus:border-purple-500 focus:outline-none min-w-[180px]"
            >
              {sortOptions.map((option) => (
                <option key={option.id} value={option.id}>{option.icon} {option.label}</option>
              ))}
            </select>
            
            {/* View Toggle */}
            <div className="hidden md:flex items-center bg-gray-900/80 border border-gray-700/50 rounded-xl p-1">
              <button 
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>
            
            {/* Mobile Filter Toggle */}
            <button 
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="lg:hidden bg-gray-900/80 border border-gray-700/50 text-white rounded-xl px-4 py-3.5 flex items-center justify-center gap-2"
            >
              <span>⚙️</span>
              <span>Filters</span>
            </button>
          </div>

          {/* Filters and Grid */}
          <div className="flex gap-8">
            {/* Filters Sidebar */}
            <div className={`${showMobileFilters ? 'fixed inset-0 z-50 bg-gray-950/95 p-6 overflow-auto' : 'hidden'} lg:block lg:relative lg:bg-transparent lg:p-0 lg:w-72 flex-shrink-0`}>
              {/* Mobile close button */}
              {showMobileFilters && (
                <div className="flex items-center justify-between mb-6 lg:hidden">
                  <h3 className="font-bold text-white text-xl">Filters</h3>
                  <button 
                    onClick={() => setShowMobileFilters(false)}
                    className="p-2 text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
              )}
              
              <div className="bg-gray-900/70 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 sticky top-24">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <span>🎯</span> Filters
                  </h3>
                  <button 
                    onClick={() => {
                      setSelectedRarities([]);
                      setPriceRange([0, 1000]);
                      setSelectedCollection('All Collections');
                    }}
                    className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    Clear all
                  </button>
                </div>
                
                {/* Price Range */}
                <div className="mb-6">
                  <label className="text-sm text-gray-300 mb-3 block font-medium">Price Range (STX)</label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange[0] || ''}
                      onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                      className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl px-3 py-2.5 text-white text-sm focus:border-purple-500 focus:outline-none"
                    />
                    <span className="text-gray-500">—</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange[1] || ''}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 1000])}
                      className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl px-3 py-2.5 text-white text-sm focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  {/* Price Range Slider Visual */}
                  <div className="mt-4 relative h-2 bg-gray-700 rounded-full">
                    <div 
                      className="absolute h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                      style={{ 
                        left: `${(priceRange[0] / 1000) * 100}%`,
                        right: `${100 - (priceRange[1] / 1000) * 100}%`
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0 STX</span>
                    <span>1000 STX</span>
                  </div>
                </div>

                {/* Rarity */}
                <div className="mb-6">
                  <label className="text-sm text-gray-300 mb-3 block font-medium">Rarity</label>
                  <div className="space-y-2">
                    {RARITY_ORDER.map((rarity) => {
                      const colors = getRarityColor(rarity);
                      const isSelected = selectedRarities.includes(rarity);
                      return (
                        <button 
                          key={rarity} 
                          onClick={() => toggleRarity(rarity)}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                            isSelected 
                              ? `${colors.bg} border ${colors.border}` 
                              : 'bg-gray-800/30 border border-transparent hover:bg-gray-800/50'
                          }`}
                        >
                          <span className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                            isSelected ? 'bg-purple-600 border-purple-600' : 'border-gray-600'
                          }`}>
                            {isSelected && (
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </span>
                          <span className={`text-sm font-medium ${colors.text}`}>{rarity}</span>
                          <span className="ml-auto text-xs text-gray-500">
                            {mockListings.filter(l => l.rarity === rarity).length}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="border-t border-gray-700/50 pt-6">
                  <p className="text-sm text-gray-400 mb-3">Quick Stats</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Showing</span>
                      <span className="text-white font-medium">{filteredListings.length} items</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Price range</span>
                      <span className="text-white font-medium">{priceRange[0]} - {priceRange[1]} STX</span>
                    </div>
                  </div>
                </div>

                {/* Mobile Apply Button */}
                <button 
                  onClick={() => setShowMobileFilters(false)}
                  className="lg:hidden w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-medium"
                >
                  Show {filteredListings.length} Results
                </button>
              </div>
            </div>

            {/* NFT Grid */}
            <div className="flex-1">
              {/* Results info */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-gray-400">
                  <span className="text-white font-medium">{filteredListings.length}</span> items found
                  {selectedRarities.length > 0 && (
                    <span className="ml-2 text-sm">
                      • Filtering by: {selectedRarities.join(', ')}
                    </span>
                  )}
                </p>
              </div>

              {filteredListings.length === 0 ? (
                <div className="text-center py-20 bg-gray-900/30 rounded-2xl border border-gray-700/50">
                  <span className="text-6xl mb-4 block">🔍</span>
                  <h3 className="text-xl font-bold text-white mb-2">No NFTs found</h3>
                  <p className="text-gray-400 mb-6">Try adjusting your filters or search query</p>
                  <button 
                    onClick={() => {
                      setSelectedRarities([]);
                      setPriceRange([0, 1000]);
                      setSearchQuery('');
                      setSelectedCollection('All Collections');
                    }}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-medium transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className={`grid gap-5 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' 
                    : 'grid-cols-1'
                }`}>
                  {filteredListings.map((listing, index) => {
                    const rarityColors = getRarityColor(listing.rarity);
                    return (
                      <div 
                        key={listing.id} 
                        className={`group bg-gray-900/70 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/10 animate-fade-in-up ${
                          viewMode === 'list' ? 'flex' : ''
                        }`}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className={`${viewMode === 'list' ? 'w-40 h-40' : 'h-56'} bg-gradient-to-br from-purple-600/80 to-blue-600/80 relative overflow-hidden flex-shrink-0`}>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-6xl opacity-50 group-hover:scale-110 transition-transform">🎨</span>
                          </div>
                          
                          {/* Badges */}
                          <div className="absolute top-3 left-3 flex flex-col gap-2">
                            <span className={`text-xs font-medium px-2.5 py-1 rounded-lg backdrop-blur-sm border ${rarityColors.bg} ${rarityColors.text} ${rarityColors.border}`}>
                              {listing.rarity}
                            </span>
                            {listing.isNew && (
                              <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-green-500/20 text-green-400 border border-green-500/30 backdrop-blur-sm">
                                New
                              </span>
                            )}
                          </div>
                          
                          {/* Like button */}
                          <button className="absolute top-3 right-3 w-9 h-9 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-black/60 transition-all group-hover:scale-110">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          </button>
                          
                          {/* Hover overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                            <button className="bg-white/95 hover:bg-white text-gray-900 font-medium px-5 py-2.5 rounded-xl transform translate-y-4 group-hover:translate-y-0 transition-transform">
                              Quick View
                            </button>
                          </div>
                        </div>
                        
                        <div className={`p-5 ${viewMode === 'list' ? 'flex-1 flex flex-col justify-between' : ''}`}>
                          <div>
                            <p className="text-xs text-purple-400 font-medium mb-1">{listing.collection}</p>
                            <h4 className="font-bold text-white text-lg mb-1 group-hover:text-purple-300 transition-colors">{listing.name}</h4>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              by <span className="text-gray-400">{listing.seller}</span>
                            </p>
                          </div>
                          
                          <div className={`flex justify-between items-center pt-4 ${viewMode === 'list' ? '' : 'mt-4 border-t border-gray-700/50'}`}>
                            <div>
                              <p className="text-xs text-gray-500 mb-0.5">Current Price</p>
                              <span className="text-purple-400 font-bold text-xl">{listing.price} STX</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                ❤️ {listing.likes}
                              </span>
                              <button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40">
                                Buy Now
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Load More */}
              {filteredListings.length > 0 && (
                <div className="mt-12 text-center">
                  <button className="group bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 hover:border-purple-500/30 text-white px-8 py-3.5 rounded-xl font-medium transition-all inline-flex items-center gap-2">
                    <span>Load More</span>
                    <span className="group-hover:translate-y-0.5 transition-transform">↓</span>
                  </button>
                  <p className="text-xs text-gray-500 mt-3">Showing {filteredListings.length} of {mockListings.length} items</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
