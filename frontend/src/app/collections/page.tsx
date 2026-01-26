'use client';

/**
 * Collections Page
 * Browse and create NFT collections
 * @module CollectionsPage
 * @version 2.1.0
 */

import { useState } from 'react';
import Header from '@/components/Header';
import CreateCollection from '@/components/CreateCollection';
import NFTGrid from '@/components/NFTGrid';
import Footer from '@/components/Footer';

// Tab and sort configuration
type TabType = 'browse' | 'create';
type SortType = 'volume' | 'floor' | 'items';
const DEFAULT_SORT: SortType = 'volume';

const featuredCollections = [
  { id: 1, name: 'Bitcoin Punks', items: 10000, floor: 0.5, volume: 1250, image: '/placeholder.png', verified: true },
  { id: 2, name: 'Stacks Apes', items: 5000, floor: 0.8, volume: 890, image: '/placeholder.png', verified: true },
  { id: 3, name: 'Ordinal Cats', items: 3333, floor: 0.3, volume: 450, image: '/placeholder.png', verified: false },
];

export default function CollectionsPage() {
  const [activeTab, setActiveTab] = useState<'browse' | 'create'>('browse');
  const [sortBy, setSortBy] = useState('volume');

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/10 to-gray-900">
      <Header />
      <div className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
            <a href="/" className="hover:text-white transition-colors">Home</a>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-purple-400">Collections</span>
          </nav>

          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                NFT Collections
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Explore curated collections or create your own masterpiece on the Stacks blockchain
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center gap-4 mb-12">
            <button
              onClick={() => setActiveTab('browse')}
              className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 ${
                activeTab === 'browse'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                  : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Browse Collections
              </span>
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 ${
                activeTab === 'create'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                  : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Collection
              </span>
            </button>
          </div>

          {activeTab === 'browse' ? (
            <>
              {/* Featured Collections */}
              <div className="mb-16">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Featured Collections</h2>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="volume">Volume</option>
                    <option value="floor">Floor Price</option>
                    <option value="items">Items</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {featuredCollections.map((collection, index) => (
                    <div
                      key={collection.id}
                      className="group bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="aspect-square bg-gradient-to-br from-purple-600/20 to-pink-600/20 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-bold text-white">{collection.name}</h3>
                            {collection.verified && (
                              <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="p-5">
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <p className="text-gray-400 text-xs mb-1">Items</p>
                            <p className="text-white font-semibold">{collection.items.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-xs mb-1">Floor</p>
                            <p className="text-white font-semibold">{collection.floor} STX</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-xs mb-1">Volume</p>
                            <p className="text-white font-semibold">{collection.volume} STX</p>
                          </div>
                        </div>
                        <button className="w-full mt-4 py-2 bg-purple-600/20 text-purple-400 rounded-lg font-medium hover:bg-purple-600 hover:text-white transition-all duration-300">
                          View Collection
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* All Collections Grid */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">All Collections</h2>
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
