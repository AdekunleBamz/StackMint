'use client';

/**
 * Collections Page
 * Browse, filter, and create NFT collections
 * @module CollectionsPage
 * @version 2.3.0
 */

import { useState, useMemo, useCallback } from 'react';
import Header from '@/components/Header';
import CreateCollection from '@/components/CreateCollection';
import NFTGrid from '@/components/NFTGrid';
import Footer from '@/components/Footer';
import Link from 'next/link';

// Tab and sort configuration
type TabType = 'browse' | 'create';
type SortType = 'volume' | 'floor' | 'items' | 'recent';
const DEFAULT_SORT: SortType = 'volume';

/** Collections per page for pagination */
const COLLECTIONS_PER_PAGE = 12;

/** Default page number */
const DEFAULT_PAGE = 1;

/**
 * Collection data structure
 */
interface CollectionData {
  id: number;
  name: string;
  items: number;
  floor: number;
  volume: number;
  image: string;
  verified: boolean;
  change24h: number;
  owners: number;
  category: string;
}

const featuredCollections: CollectionData[] = [
  { id: 1, name: 'Bitcoin Punks', items: 10000, floor: 0.5, volume: 1250, image: '/placeholder.png', verified: true, change24h: 12.5, owners: 4532, category: 'PFP' },
  { id: 2, name: 'Stacks Apes', items: 5000, floor: 0.8, volume: 890, image: '/placeholder.png', verified: true, change24h: -5.2, owners: 2341, category: 'PFP' },
  { id: 3, name: 'Ordinal Cats', items: 3333, floor: 0.3, volume: 450, image: '/placeholder.png', verified: false, change24h: 28.7, owners: 1876, category: 'Art' },
  { id: 4, name: 'Clarity Wizards', items: 2500, floor: 1.2, volume: 780, image: '/placeholder.png', verified: true, change24h: 8.3, owners: 1245, category: 'Gaming' },
  { id: 5, name: 'Block Builders', items: 4000, floor: 0.4, volume: 320, image: '/placeholder.png', verified: true, change24h: -2.1, owners: 1678, category: 'Utility' },
  { id: 6, name: 'Stacks Legends', items: 1000, floor: 2.5, volume: 1800, image: '/placeholder.png', verified: true, change24h: 45.2, owners: 892, category: 'PFP' },
];

const categories = ['All', 'PFP', 'Art', 'Gaming', 'Utility', 'Music', 'Photography'];

const sortOptions = [
  { id: 'volume', label: 'Volume', icon: '📊' },
  { id: 'floor', label: 'Floor Price', icon: '💰' },
  { id: 'items', label: 'Items', icon: '🔢' },
  { id: 'recent', label: 'Recently Added', icon: '🕐' },
];

export default function CollectionsPage() {
  const [activeTab, setActiveTab] = useState<'browse' | 'create'>('browse');
  const [sortBy, setSortBy] = useState<SortType>('volume');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const filteredCollections = useMemo(() => {
    let filtered = [...featuredCollections];
    
    if (searchQuery) {
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(c => c.category === selectedCategory);
    }
    
    switch (sortBy) {
      case 'volume':
        filtered.sort((a, b) => b.volume - a.volume);
        break;
      case 'floor':
        filtered.sort((a, b) => b.floor - a.floor);
        break;
      case 'items':
        filtered.sort((a, b) => b.items - a.items);
        break;
    }
    
    return filtered;
  }, [searchQuery, selectedCategory, sortBy]);

  const stats = {
    totalCollections: '247',
    totalVolume: '48.5K',
    avgFloor: '0.85',
    uniqueCreators: '1.2K'
  };

  return (
    <main className="min-h-screen bg-gray-950">
      <Header />
      
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/3 rounded-full blur-3xl" />
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
            <span className="text-white font-medium">Collections</span>
          </nav>

          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-full px-5 py-2.5 mb-6">
              <span className="text-xl">🎨</span>
              <span className="text-sm text-purple-300 font-medium">{stats.totalCollections} Collections Live</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                NFT Collections
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
              Explore curated collections or create your own masterpiece on the Stacks blockchain
            </p>
            
            {/* Stats Bar */}
            <div className="inline-flex flex-wrap justify-center gap-8 bg-gray-900/50 border border-gray-700/50 rounded-2xl px-8 py-5">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{stats.totalCollections}</p>
                <p className="text-xs text-gray-400">Total Collections</p>
              </div>
              <div className="w-px bg-gray-700" />
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{stats.totalVolume} STX</p>
                <p className="text-xs text-gray-400">Total Volume</p>
              </div>
              <div className="w-px bg-gray-700" />
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{stats.avgFloor} STX</p>
                <p className="text-xs text-gray-400">Avg Floor</p>
              </div>
              <div className="w-px bg-gray-700" />
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{stats.uniqueCreators}</p>
                <p className="text-xs text-gray-400">Creators</p>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center gap-4 mb-10">
            <button
              onClick={() => setActiveTab('browse')}
              className={`px-8 py-3.5 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'browse'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                  : 'bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="text-lg">🖼️</span>
                Browse Collections
              </span>
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`px-8 py-3.5 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'create'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                  : 'bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="text-lg">✨</span>
                Create Collection
              </span>
            </button>
          </div>

          {activeTab === 'browse' ? (
            <>
              {/* Search and Filters */}
              <div className="flex flex-col md:flex-row gap-4 mb-8">
                {/* Search */}
                <div className="relative flex-1">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                  <input
                    type="text"
                    placeholder="Search collections..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-900/80 border border-gray-700/50 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all"
                  />
                </div>
                
                {/* Category Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                        selectedCategory === category
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
                
                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortType)}
                  className="bg-gray-900/80 border border-gray-700/50 text-white rounded-xl px-4 py-3.5 focus:border-purple-500 focus:outline-none min-w-[160px]"
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
                    onClick={() => setViewMode('table')}
                    className={`px-3 py-2 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Featured Collections */}
              <div className="mb-16">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <span>🔥</span>
                    {selectedCategory === 'All' ? 'Trending' : selectedCategory} Collections
                    <span className="text-base font-normal text-gray-400">({filteredCollections.length})</span>
                  </h2>
                </div>
                
                {filteredCollections.length === 0 ? (
                  <div className="text-center py-16 bg-gray-900/30 rounded-2xl border border-gray-700/50">
                    <span className="text-5xl mb-4 block">🔍</span>
                    <h3 className="text-xl font-bold text-white mb-2">No collections found</h3>
                    <p className="text-gray-400 mb-6">Try adjusting your search or filters</p>
                    <button 
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('All');
                      }}
                      className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-medium transition-colors"
                    >
                      Clear Filters
                    </button>
                  </div>
                ) : viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCollections.map((collection, index) => (
                      <div
                        key={collection.id}
                        className="group bg-gray-900/70 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1 animate-fade-in-up"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="aspect-[4/3] bg-gradient-to-br from-purple-600/30 to-pink-600/30 relative overflow-hidden">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-7xl opacity-30 group-hover:scale-110 transition-transform">🎨</span>
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />
                          
                          {/* Category badge */}
                          <span className="absolute top-4 left-4 px-3 py-1 bg-black/40 backdrop-blur-sm rounded-lg text-xs font-medium text-gray-300">
                            {collection.category}
                          </span>
                          
                          {/* 24h change */}
                          <span className={`absolute top-4 right-4 px-3 py-1 rounded-lg text-xs font-bold backdrop-blur-sm ${
                            collection.change24h >= 0 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {collection.change24h >= 0 ? '↑' : '↓'} {Math.abs(collection.change24h)}%
                          </span>
                          
                          <div className="absolute bottom-4 left-4 right-4">
                            <div className="flex items-center gap-2">
                              <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">{collection.name}</h3>
                              {collection.verified && (
                                <span className="text-blue-400 text-lg">✓</span>
                              )}
                            </div>
                            <p className="text-sm text-gray-400">{collection.owners.toLocaleString()} owners</p>
                          </div>
                        </div>
                        <div className="p-5">
                          <div className="grid grid-cols-3 gap-4 text-center mb-4">
                            <div className="bg-gray-800/50 rounded-xl p-3">
                              <p className="text-gray-500 text-xs mb-1">Items</p>
                              <p className="text-white font-bold">{collection.items.toLocaleString()}</p>
                            </div>
                            <div className="bg-gray-800/50 rounded-xl p-3">
                              <p className="text-gray-500 text-xs mb-1">Floor</p>
                              <p className="text-white font-bold">{collection.floor} STX</p>
                            </div>
                            <div className="bg-gray-800/50 rounded-xl p-3">
                              <p className="text-gray-500 text-xs mb-1">Volume</p>
                              <p className="text-white font-bold">{collection.volume}</p>
                            </div>
                          </div>
                          <button className="w-full py-3 bg-purple-600/20 text-purple-400 rounded-xl font-medium hover:bg-purple-600 hover:text-white transition-all duration-300 group-hover:bg-purple-600 group-hover:text-white">
                            View Collection →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Table View */
                  <div className="bg-gray-900/50 border border-gray-700/50 rounded-2xl overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-700/50">
                          <th className="text-left text-gray-400 font-medium text-sm p-4">#</th>
                          <th className="text-left text-gray-400 font-medium text-sm p-4">Collection</th>
                          <th className="text-right text-gray-400 font-medium text-sm p-4">Floor</th>
                          <th className="text-right text-gray-400 font-medium text-sm p-4 hidden md:table-cell">Volume</th>
                          <th className="text-right text-gray-400 font-medium text-sm p-4 hidden lg:table-cell">24h</th>
                          <th className="text-right text-gray-400 font-medium text-sm p-4 hidden lg:table-cell">Owners</th>
                          <th className="text-right text-gray-400 font-medium text-sm p-4 hidden sm:table-cell">Items</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCollections.map((collection, index) => (
                          <tr 
                            key={collection.id} 
                            className="border-b border-gray-700/30 hover:bg-gray-800/50 cursor-pointer transition-colors"
                          >
                            <td className="p-4 text-gray-500">{index + 1}</td>
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-600/30 to-pink-600/30 rounded-xl flex items-center justify-center">
                                  <span className="text-2xl">🎨</span>
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-white">{collection.name}</span>
                                    {collection.verified && <span className="text-blue-400">✓</span>}
                                  </div>
                                  <span className="text-xs text-gray-500">{collection.category}</span>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-right font-semibold text-white">{collection.floor} STX</td>
                            <td className="p-4 text-right text-gray-300 hidden md:table-cell">{collection.volume} STX</td>
                            <td className={`p-4 text-right font-medium hidden lg:table-cell ${collection.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {collection.change24h >= 0 ? '+' : ''}{collection.change24h}%
                            </td>
                            <td className="p-4 text-right text-gray-300 hidden lg:table-cell">{collection.owners.toLocaleString()}</td>
                            <td className="p-4 text-right text-gray-300 hidden sm:table-cell">{collection.items.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* All Collections Grid */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <span>🌟</span>
                  All Collections
                </h2>
                <NFTGrid />
              </div>
            </>
          ) : (
            <div className="mb-16">
              <CreateCollection />
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}
