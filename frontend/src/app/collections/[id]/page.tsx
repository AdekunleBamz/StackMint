'use client';

/**
 * Collection Detail Page
 * Individual collection page with items grid, stats, and activity
 * @module pages/Collections/[id]
 * @version 1.0.0
 */

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Mock collection data
const mockCollection = {
  id: 'stacks-punks',
  name: 'Stacks Punks',
  description: 'The original punk collection on Stacks. 10,000 unique punks living on Bitcoin via Stacks L2. Each punk is algorithmically generated with unique traits and rarity.',
  bannerImage: null,
  avatarImage: null,
  creator: 'SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N',
  isVerified: true,
  contractAddress: 'SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N.stacks-punks',
  stats: {
    items: 10000,
    owners: 4532,
    floorPrice: 0.5,
    volume: 12500,
    listed: 856,
    sales24h: 45,
    volume24h: 234,
  },
  socials: {
    website: 'https://stackspunks.io',
    twitter: 'https://twitter.com/stackspunks',
    discord: 'https://discord.gg/stackspunks',
  },
};

// Mock NFT items
const mockItems = Array.from({ length: 24 }, (_, i) => ({
  id: `${i + 1}`,
  name: `Stacks Punk #${1000 + i}`,
  image: null,
  price: Math.random() * 5 + 0.5,
  rarity: ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'][Math.floor(Math.random() * 5)],
  rank: Math.floor(Math.random() * 10000) + 1,
  owner: `SP${Math.random().toString(36).substring(2, 8).toUpperCase()}...${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
  isListed: Math.random() > 0.3,
  lastSale: Math.random() * 3 + 0.2,
}));

const rarityColors: Record<string, string> = {
  Common: 'text-gray-400',
  Uncommon: 'text-green-400',
  Rare: 'text-blue-400',
  Epic: 'text-purple-400',
  Legendary: 'text-orange-400',
};

const sortOptions = [
  { id: 'price-low', label: 'Price: Low to High' },
  { id: 'price-high', label: 'Price: High to Low' },
  { id: 'rank', label: 'Rarity Rank' },
  { id: 'recent', label: 'Recently Listed' },
];

const traitFilters = [
  { trait: 'Background', values: ['Purple', 'Blue', 'Green', 'Red', 'Orange'] },
  { trait: 'Skin', values: ['Normal', 'Zombie', 'Alien', 'Ape'] },
  { trait: 'Eyes', values: ['Normal', 'Laser', 'VR', '3D Glasses'] },
  { trait: 'Hair', values: ['Mohawk', 'Wild', 'Cap', 'Beanie', 'None'] },
];

export default function CollectionPage() {
  const params = useParams();
  const [collection] = useState(mockCollection);
  const [items] = useState(mockItems);
  const [activeTab, setActiveTab] = useState<'items' | 'activity'>('items');
  const [sortBy, setSortBy] = useState('price-low');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTraits, setSelectedTraits] = useState<Record<string, string[]>>({});
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);

  const truncateAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const filteredItems = useMemo(() => {
    let filtered = [...items];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Price filter
    filtered = filtered.filter(item =>
      item.price >= priceRange[0] && item.price <= priceRange[1]
    );

    // Sort
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rank':
        filtered.sort((a, b) => a.rank - b.rank);
        break;
    }

    return filtered;
  }, [items, searchQuery, sortBy, priceRange]);

  const statItems = [
    { label: 'Items', value: collection.stats.items.toLocaleString(), icon: '🖼️' },
    { label: 'Owners', value: collection.stats.owners.toLocaleString(), icon: '👥' },
    { label: 'Floor', value: `${collection.stats.floorPrice} STX`, icon: '💰' },
    { label: 'Volume', value: `${(collection.stats.volume / 1000).toFixed(1)}K STX`, icon: '📊' },
    { label: 'Listed', value: `${((collection.stats.listed / collection.stats.items) * 100).toFixed(1)}%`, icon: '🏷️' },
  ];

  return (
    <main className="min-h-screen bg-gray-950">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-purple-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-pink-600/5 rounded-full blur-3xl" />
      </div>

      <Header />

      {/* Banner */}
      <div className="relative h-48 md:h-64 bg-gradient-to-r from-purple-900 via-pink-900 to-orange-900 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent" />
      </div>

      {/* Collection Info */}
      <div className="relative max-w-7xl mx-auto px-4 -mt-20">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="relative">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl border-4 border-gray-950 bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-5xl shadow-xl">
                🎭
              </div>
              {collection.isVerified && (
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center border-4 border-gray-950">
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
                  {collection.name}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-sm">
                  <span className="text-gray-400">
                    By{' '}
                    <Link href={`/profile/${collection.creator}`} className="text-purple-400 hover:text-purple-300 font-mono transition-colors">
                      {truncateAddress(collection.creator)}
                    </Link>
                  </span>
                  {collection.socials && (
                    <div className="flex items-center gap-2">
                      {collection.socials.website && (
                        <a href={collection.socials.website} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">🌐</a>
                      )}
                      {collection.socials.twitter && (
                        <a href={collection.socials.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">𝕏</a>
                      )}
                      {collection.socials.discord && (
                        <a href={collection.socials.discord} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">💬</a>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button className="p-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </button>
                <button className="p-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                  </svg>
                </button>
              </div>
            </div>

            <p className="mt-4 text-gray-300 max-w-2xl">{collection.description}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {statItems.map((stat) => (
            <div key={stat.label} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-center hover:bg-gray-800 transition-colors">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mt-8 border-b border-gray-800">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('items')}
              className={`pb-4 text-sm font-medium transition-colors ${
                activeTab === 'items'
                  ? 'text-white border-b-2 border-purple-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Items
              <span className="ml-2 px-2 py-0.5 bg-gray-800 rounded text-xs">{collection.stats.items}</span>
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`pb-4 text-sm font-medium transition-colors ${
                activeTab === 'activity'
                  ? 'text-white border-b-2 border-purple-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Activity
            </button>
          </div>
        </div>

        {/* Items Tab */}
        {activeTab === 'items' && (
          <div className="py-8">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              {/* Search */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or token ID..."
                  className="w-full px-4 py-3 pl-11 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                />
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Filter button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 ${
                  showFilters ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters
              </button>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-purple-500"
              >
                {sortOptions.map((option) => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>
            </div>

            {/* Results count */}
            <div className="text-sm text-gray-400 mb-6">
              Showing {filteredItems.length} of {items.length} items
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {filteredItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/nft/${item.id}`}
                  className="group bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all hover:shadow-lg hover:shadow-purple-500/10"
                >
                  {/* Image */}
                  <div className="aspect-square bg-gradient-to-br from-purple-600/20 to-pink-600/20 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-50 group-hover:scale-110 transition-transform">
                      🎭
                    </div>
                    {/* Rarity badge */}
                    <div className={`absolute top-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded text-xs font-medium ${rarityColors[item.rarity]}`}>
                      #{item.rank}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <div className="text-sm font-medium text-white truncate group-hover:text-purple-400 transition-colors">
                      {item.name}
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      {item.isListed ? (
                        <div>
                          <div className="text-xs text-gray-500">Price</div>
                          <div className="text-sm font-bold text-white">{item.price.toFixed(2)} STX</div>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500">Not listed</div>
                      )}
                      <div className={`text-xs font-medium ${rarityColors[item.rarity]}`}>
                        {item.rarity}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Load more */}
            <div className="mt-8 text-center">
              <button className="px-8 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-xl transition-colors">
                Load More
              </button>
            </div>
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="py-8">
            <div className="text-center py-12 text-gray-400">
              <span className="text-4xl mb-3 block">📋</span>
              <p>Activity feed coming soon...</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-20">
        <Footer />
      </div>
    </main>
  );
}
