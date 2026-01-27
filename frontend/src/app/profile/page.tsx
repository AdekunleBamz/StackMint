'use client';

import { useState, useMemo } from 'react';
import Header from '@/components/Header';
import WalletBalance from '@/components/WalletBalance';
import TransactionHistory from '@/components/TransactionHistory';
import Footer from '@/components/Footer';

/**
 * Profile Page
 * User profile with NFT collection, activity, and settings
 * @module pages/Profile
 * @version 3.0.0
 */

// Mock data - would come from API in production
const mockNFTs = [
  { id: 1, name: 'Bitcoin Punk #1234', collection: 'Bitcoin Punks', image: '/placeholder.png', rarity: 'Rare', price: 15.5 },
  { id: 2, name: 'Stacks Ape #567', collection: 'Stacks Apes', image: '/placeholder.png', rarity: 'Common', price: 8.2 },
  { id: 3, name: 'Ordinal Cat #89', collection: 'Ordinal Cats', image: '/placeholder.png', rarity: 'Legendary', price: 125 },
  { id: 4, name: 'Clarity Dream #42', collection: 'Clarity Dreams', image: '/placeholder.png', rarity: 'Epic', price: 45 },
];

const profileTabs = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'nfts', label: 'My NFTs', icon: '🎨' },
  { id: 'activity', label: 'Activity', icon: '📋' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

// Stats configuration
const profileStats = [
  { label: 'NFTs Owned', value: '12', icon: '🖼️' },
  { label: 'Collections', value: '3', icon: '📦' },
  { label: 'Total Value', value: '45.5 STX', icon: '💰' },
  { label: 'Transactions', value: '8', icon: '🔄' },
];

// Rarity colors
const rarityColors: Record<string, { bg: string; text: string }> = {
  Common: { bg: 'bg-gray-500/20', text: 'text-gray-400' },
  Uncommon: { bg: 'bg-green-500/20', text: 'text-green-400' },
  Rare: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
  Epic: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
  Legendary: { bg: 'bg-orange-500/20', text: 'text-orange-400' },
};

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [filterCollection, setFilterCollection] = useState('all');
  const [notifications, setNotifications] = useState(true);

  // Get unique collections for filter
  const collections = useMemo(() => {
    const uniqueCollections = [...new Set(mockNFTs.map(nft => nft.collection))];
    return ['all', ...uniqueCollections];
  }, []);

  // Filter NFTs by collection
  const filteredNFTs = useMemo(() => {
    if (filterCollection === 'all') return mockNFTs;
    return mockNFTs.filter(nft => nft.collection === filterCollection);
  }, [filterCollection]);

  return (
    <main className="min-h-screen bg-gray-950">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-pink-600/10 rounded-full blur-3xl" />
      </div>

      <Header />
      
      <div className="relative pt-24 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header */}
          <div className="relative mb-12">
            {/* Banner */}
            <div className="h-48 md:h-56 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-2xl md:rounded-3xl overflow-hidden relative">
              <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent" />
              
              {/* Edit banner button */}
              <button 
                className="absolute top-4 right-4 p-2 bg-black/30 backdrop-blur-sm rounded-lg text-white/80 hover:text-white hover:bg-black/50 transition-all"
                aria-label="Edit banner"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
            
            {/* Avatar & Info */}
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-16 md:-mt-20 px-4 md:px-8">
              {/* Avatar */}
              <div className="relative group">
                <div className="w-32 h-32 md:w-36 md:h-36 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-2xl border-4 border-gray-900 flex items-center justify-center shadow-2xl shadow-purple-500/20">
                  <svg className="w-16 h-16 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <button 
                  className="absolute bottom-2 right-2 p-2.5 bg-purple-600 rounded-xl hover:bg-purple-500 transition-colors shadow-lg group-hover:scale-110"
                  aria-label="Change avatar"
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                {/* Online indicator */}
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-4 border-gray-900" />
              </div>
              
              {/* User Info */}
              <div className="flex-1 text-center md:text-left pb-2">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-2 md:gap-3 mb-2">
                  <h1 className="text-2xl md:text-3xl font-bold text-white">Anonymous User</h1>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-xs font-semibold rounded-full border border-purple-500/30">
                      Collector
                    </span>
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-semibold rounded-full border border-blue-500/30">
                      Early Adopter
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <p className="text-gray-400 font-mono text-sm">ST1PQHQKV0RJXZFY1DGX8...EZDM</p>
                  <button 
                    className="p-1.5 hover:bg-gray-700/50 rounded-lg transition-colors"
                    aria-label="Copy address"
                  >
                    <svg className="w-4 h-4 text-gray-400 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Edit Profile Button */}
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-6 py-2.5 bg-gray-800/80 hover:bg-gray-700 text-white rounded-xl transition-all flex items-center gap-2 border border-gray-700/50 hover:border-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span className="font-medium">Edit Profile</span>
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8 p-4 md:p-6 bg-gray-800/40 backdrop-blur-sm rounded-2xl border border-gray-700/50">
            {profileStats.map((stat, index) => (
              <div 
                key={stat.label}
                className={`text-center py-3 ${index > 0 ? 'md:border-l border-gray-700/50' : ''}`}
              >
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="text-lg">{stat.icon}</span>
                  <p className="text-xl md:text-2xl font-bold text-white tabular-nums">{stat.value}</p>
                </div>
                <p className="text-gray-400 text-xs md:text-sm">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
            {profileTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 md:px-6 py-3 rounded-xl font-medium whitespace-nowrap transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/20'
                    : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <span className="text-base">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="grid md:grid-cols-2 gap-6">
              <WalletBalance />
              <TransactionHistory />
            </div>
          )}

          {activeTab === 'nfts' && (
            <div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>🎨</span>
                  My NFTs 
                  <span className="text-gray-400 font-normal">({filteredNFTs.length})</span>
                </h2>
                <select 
                  value={filterCollection}
                  onChange={(e) => setFilterCollection(e.target.value)}
                  className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {collections.map(collection => (
                    <option key={collection} value={collection}>
                      {collection === 'all' ? 'All Collections' : collection}
                    </option>
                  ))}
                </select>
              </div>
              
              {filteredNFTs.length === 0 ? (
                <div className="text-center py-16 bg-gray-800/30 rounded-2xl border border-gray-700/50">
                  <span className="text-5xl mb-4 block">🖼️</span>
                  <p className="text-gray-400 mb-2">No NFTs found in this collection</p>
                  <button className="text-purple-400 hover:text-purple-300 text-sm">
                    Browse Marketplace →
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {filteredNFTs.map((nft, index) => (
                    <div
                      key={nft.id}
                      className="group bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/10 animate-fade-in-up"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="aspect-square bg-gradient-to-br from-purple-600/20 to-pink-600/20 relative overflow-hidden">
                        {/* Rarity badge */}
                        <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-lg text-xs font-medium border ${
                          rarityColors[nft.rarity]?.bg || 'bg-gray-500/20'
                        } ${rarityColors[nft.rarity]?.text || 'text-gray-400'} border-current/30 backdrop-blur-sm`}>
                          {nft.rarity}
                        </span>
                        
                        {/* Price badge */}
                        <span className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-sm font-semibold px-3 py-1.5 rounded-lg">
                          {nft.price} STX
                        </span>
                        
                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                          <button className="bg-white/90 hover:bg-white text-gray-900 font-medium px-4 py-2 rounded-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                            View Details
                          </button>
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="text-xs text-purple-400 font-medium mb-1">{nft.collection}</p>
                        <h3 className="font-semibold text-white mb-3 truncate">{nft.name}</h3>
                        <div className="flex gap-2">
                          <button className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-xl transition-colors">
                            List for Sale
                          </button>
                          <button className="p-2.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-xl transition-colors" aria-label="Share">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-2xl">📊</span>
                <h2 className="text-xl font-bold text-white">Recent Activity</h2>
              </div>
              <TransactionHistory />
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8">
              <div className="flex items-center gap-2 mb-8">
                <span className="text-2xl">⚙️</span>
                <h2 className="text-xl font-bold text-white">Profile Settings</h2>
              </div>
              
              <div className="space-y-8">
                {/* Profile Info Section */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Display Name</label>
                    <input
                      type="text"
                      placeholder="Enter display name"
                      className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                    <p className="text-xs text-gray-500">This is how you'll appear on StacksMint</p>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Email Address</label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                    <p className="text-xs text-gray-500">For notifications and account recovery</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">Bio</label>
                  <textarea
                    placeholder="Tell us about yourself, your collections, and what inspires you..."
                    rows={4}
                    className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all"
                  />
                  <p className="text-xs text-gray-500">Max 280 characters</p>
                </div>

                {/* Social Links */}
                <div className="border-t border-gray-700/50 pt-8">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <span>🔗</span>
                    Social Links
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 bg-gray-900/50 rounded-xl px-4 py-3 border border-gray-700">
                      <span className="text-xl">🐦</span>
                      <input
                        type="text"
                        placeholder="Twitter username"
                        className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-3 bg-gray-900/50 rounded-xl px-4 py-3 border border-gray-700">
                      <span className="text-xl">💬</span>
                      <input
                        type="text"
                        placeholder="Discord username"
                        className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Notifications */}
                <div className="border-t border-gray-700/50 pt-8">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <span>🔔</span>
                    Notifications
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-xl border border-gray-700">
                      <div>
                        <p className="text-white font-medium">Email Notifications</p>
                        <p className="text-sm text-gray-400">Receive email notifications for sales and offers</p>
                      </div>
                      <button 
                        onClick={() => setNotifications(!notifications)}
                        className={`relative w-14 h-7 rounded-full transition-colors ${notifications ? 'bg-purple-600' : 'bg-gray-600'}`}
                      >
                        <span className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${notifications ? 'right-1' : 'left-1'}`} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-xl border border-gray-700">
                      <div>
                        <p className="text-white font-medium">Price Alerts</p>
                        <p className="text-sm text-gray-400">Get notified when NFTs drop below your target price</p>
                      </div>
                      <button className="relative w-14 h-7 bg-gray-600 rounded-full">
                        <span className="absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button className="flex-1 px-6 py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:opacity-90 transition-all hover:shadow-lg hover:shadow-purple-500/25">
                    Save Changes
                  </button>
                  <button className="px-6 py-3.5 bg-gray-700 text-gray-300 font-semibold rounded-xl hover:bg-gray-600 transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}
