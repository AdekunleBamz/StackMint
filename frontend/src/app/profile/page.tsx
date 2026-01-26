'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import WalletBalance from '@/components/WalletBalance';
import TransactionHistory from '@/components/TransactionHistory';
import Footer from '@/components/Footer';

const mockNFTs = [
  { id: 1, name: 'Bitcoin Punk #1234', collection: 'Bitcoin Punks', image: '/placeholder.png', rarity: 'Rare' },
  { id: 2, name: 'Stacks Ape #567', collection: 'Stacks Apes', image: '/placeholder.png', rarity: 'Common' },
  { id: 3, name: 'Ordinal Cat #89', collection: 'Ordinal Cats', image: '/placeholder.png', rarity: 'Legendary' },
];

const profileTabs = ['Overview', 'My NFTs', 'Activity', 'Settings'];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [isEditing, setIsEditing] = useState(false);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/10 to-gray-900">
      <Header />
      <div className="pt-32 pb-20 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Profile Header */}
          <div className="relative mb-12">
            {/* Banner */}
            <div className="h-48 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
            </div>
            
            {/* Avatar & Info */}
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-16 px-6">
              <div className="relative">
                <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full border-4 border-gray-900 flex items-center justify-center">
                  <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-purple-600 rounded-full hover:bg-purple-700 transition-colors">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-white">Anonymous User</h1>
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs font-medium rounded-full">
                    Collector
                  </span>
                </div>
                <p className="text-gray-400 font-mono text-sm">ST1PQHQKV0RJXZFY1DGX8...EZDM</p>
              </div>
              
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Profile
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-4 gap-4 mb-8 p-6 bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">12</p>
              <p className="text-gray-400 text-sm">NFTs Owned</p>
            </div>
            <div className="text-center border-l border-gray-700">
              <p className="text-2xl font-bold text-white">3</p>
              <p className="text-gray-400 text-sm">Collections</p>
            </div>
            <div className="text-center border-l border-gray-700">
              <p className="text-2xl font-bold text-white">45.5 STX</p>
              <p className="text-gray-400 text-sm">Total Value</p>
            </div>
            <div className="text-center border-l border-gray-700">
              <p className="text-2xl font-bold text-white">8</p>
              <p className="text-gray-400 text-sm">Transactions</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {profileTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-xl font-medium whitespace-nowrap transition-all duration-300 ${
                  activeTab === tab
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'Overview' && (
            <div className="grid md:grid-cols-2 gap-8">
              <WalletBalance />
              <TransactionHistory />
            </div>
          )}

          {activeTab === 'My NFTs' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">My NFTs ({mockNFTs.length})</h2>
                <select className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm">
                  <option>All Collections</option>
                  <option>Bitcoin Punks</option>
                  <option>Stacks Apes</option>
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockNFTs.map((nft, index) => (
                  <div
                    key={nft.id}
                    className="group bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-1"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="aspect-square bg-gradient-to-br from-purple-600/20 to-pink-600/20 relative">
                      <span className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${
                        nft.rarity === 'Legendary' ? 'bg-yellow-500/20 text-yellow-400' :
                        nft.rarity === 'Rare' ? 'bg-purple-500/20 text-purple-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {nft.rarity}
                      </span>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-white mb-1">{nft.name}</h3>
                      <p className="text-gray-400 text-sm">{nft.collection}</p>
                      <div className="flex gap-2 mt-4">
                        <button className="flex-1 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors">
                          List for Sale
                        </button>
                        <button className="p-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'Activity' && (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
              <TransactionHistory />
            </div>
          )}

          {activeTab === 'Settings' && (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
              <h2 className="text-xl font-bold text-white mb-6">Profile Settings</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Display Name</label>
                  <input
                    type="text"
                    placeholder="Enter display name"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Bio</label>
                  <textarea
                    placeholder="Tell us about yourself"
                    rows={3}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Email Notifications</label>
                  <div className="flex items-center gap-3">
                    <button className="relative w-12 h-6 bg-purple-600 rounded-full">
                      <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full transition-transform" />
                    </button>
                    <span className="text-gray-300">Receive email notifications for sales and offers</span>
                  </div>
                </div>
                <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity">
                  Save Changes
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}
