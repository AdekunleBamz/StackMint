'use client';

/**
 * Marketplace Page
 * NFT marketplace with filtering, sorting, and price range selection
 * @module MarketplacePage
 * @version 2.2.0
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
}

/**
 * Rarity type for NFTs
 */
type RarityLevel = typeof RARITY_ORDER[number];

const mockListings = [
  { id: 1, name: 'Stacks Punk #42', price: 100, seller: 'SP1ABC...XYZ', image: null, collection: 'Stacks Punks', rarity: 'Rare' },
  { id: 2, name: 'Bitcoin Art #7', price: 50, seller: 'SP2DEF...ABC', image: null, collection: 'Bitcoin Art', rarity: 'Common' },
  { id: 3, name: 'Clarity Dream #13', price: 75, seller: 'SP3GHI...DEF', image: null, collection: 'Clarity Dreams', rarity: 'Uncommon' },
  { id: 4, name: 'Block Hero #99', price: 200, seller: 'SP4JKL...GHI', image: null, collection: 'Block Heroes', rarity: 'Legendary' },
  { id: 5, name: 'Stacks OG #1', price: 500, seller: 'SP5MNO...JKL', image: null, collection: 'Stacks OGs', rarity: 'Mythic' },
  { id: 6, name: 'Pixel Miner #33', price: 25, seller: 'SP6PQR...MNO', image: null, collection: 'Pixel Miners', rarity: 'Common' },
];

const sortOptions = ['Recently Listed', 'Price: Low to High', 'Price: High to Low', 'Rarity'];

export default function MarketplacePage() {
  const [sortBy, setSortBy] = useState(sortOptions[0]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);

  const getRarityColor = (rarity: string) => {
    const colors: Record<string, string> = {
      Common: 'text-gray-400 bg-gray-400/10',
      Uncommon: 'text-green-400 bg-green-400/10',
      Rare: 'text-blue-400 bg-blue-400/10',
      Legendary: 'text-purple-400 bg-purple-400/10',
      Mythic: 'text-orange-400 bg-orange-400/10',
    };
    return colors[rarity] || colors.Common;
  };

  return (
    <main className="animate-fade-in">
      <Header />
      <div className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
            <Link href="/" className="hover:text-purple-400 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-white">Marketplace</span>
          </nav>

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Marketplace</h1>
              <p className="text-gray-400">Discover, buy, and sell unique NFTs</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">{mockListings.length} items</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-2.5 focus:border-purple-500 focus:outline-none"
              >
                {sortOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Filters and Grid */}
          <div className="flex gap-8">
            {/* Filters Sidebar */}
            <div className="hidden lg:block w-64 flex-shrink-0">
              <div className="bg-gray-900/50 border border-gray-700/50 rounded-2xl p-6 sticky top-24">
                <h3 className="font-bold text-white mb-4">Filters</h3>
                
                {/* Price Range */}
                <div className="mb-6">
                  <label className="text-sm text-gray-400 mb-2 block">Price Range (STX)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                    />
                  </div>
                </div>

                {/* Rarity */}
                <div className="mb-6">
                  <label className="text-sm text-gray-400 mb-2 block">Rarity</label>
                  <div className="space-y-2">
                    {['Common', 'Uncommon', 'Rare', 'Legendary', 'Mythic'].map((rarity) => (
                      <label key={rarity} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="rounded bg-gray-800 border-gray-700 text-purple-500 focus:ring-purple-500" />
                        <span className={`text-sm px-2 py-0.5 rounded ${getRarityColor(rarity)}`}>{rarity}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-xl font-medium transition-colors">
                  Apply Filters
                </button>
              </div>
            </div>

            {/* NFT Grid */}
            <div className="flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {mockListings.map((listing, index) => (
                  <div 
                    key={listing.id} 
                    className="bg-gray-900/50 border border-purple-500/20 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all duration-300 group hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/10 animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="h-52 bg-gradient-to-br from-purple-600 to-blue-600 relative overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-6xl opacity-50">🎨</span>
                      </div>
                      <div className="absolute top-3 left-3">
                        <span className={`text-xs font-medium px-2 py-1 rounded-lg ${getRarityColor(listing.rarity)}`}>
                          {listing.rarity}
                        </span>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-purple-400 mb-1">{listing.collection}</p>
                      <h4 className="font-bold text-white text-lg">{listing.name}</h4>
                      <p className="text-sm text-gray-400 mb-4">by {listing.seller}</p>
                      <div className="flex justify-between items-center pt-3 border-t border-gray-700/50">
                        <div>
                          <p className="text-xs text-gray-500">Price</p>
                          <span className="text-purple-400 font-bold text-lg">{listing.price} STX</span>
                        </div>
                        <button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40">
                          Buy Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Load More */}
              <div className="mt-12 text-center">
                <button className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-3 rounded-xl font-medium transition-colors">
                  Load More
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
