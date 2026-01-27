'use client';

/**
 * NFT Detail Page
 * Individual NFT page with full details, attributes, and actions
 * @module pages/NFT/[id]
 * @version 1.0.0
 */

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Mock NFT data - would come from API
const mockNFT = {
  id: '1',
  name: 'Stacks Punk #42',
  description: 'A unique punk living on the Stacks blockchain, secured by Bitcoin. Part of the legendary Stacks Punks collection that pioneered NFTs on Stacks.',
  image: null,
  collection: 'Stacks Punks',
  collectionId: 'stacks-punks',
  owner: 'SP2M5N033DDRTN0JE2AYFMV4NBXSZYFHWM5E9QMA1',
  creator: 'SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N',
  price: 150,
  lastSale: 120,
  rarity: 'Rare',
  rank: 342,
  tokenId: 42,
  contractAddress: 'SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N.stacksmint-nft-v2-1-3',
  attributes: [
    { trait_type: 'Background', value: 'Purple', rarity: 12.5 },
    { trait_type: 'Skin', value: 'Zombie', rarity: 8.2 },
    { trait_type: 'Eyes', value: 'Laser', rarity: 3.1 },
    { trait_type: 'Hair', value: 'Mohawk', rarity: 5.7 },
    { trait_type: 'Accessory', value: 'Gold Chain', rarity: 2.3 },
    { trait_type: 'Expression', value: 'Smirk', rarity: 15.0 },
  ],
  isListed: true,
  isVerified: true,
};

const mockActivities = [
  { id: '1', type: 'listing', price: 150, from: mockNFT.owner, date: new Date() },
  { id: '2', type: 'transfer', from: mockNFT.creator, to: mockNFT.owner, date: new Date(Date.now() - 86400000) },
  { id: '3', type: 'mint', from: mockNFT.creator, date: new Date(Date.now() - 172800000) },
];

const rarityColors: Record<string, { bg: string; text: string; border: string }> = {
  Common: { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/30' },
  Uncommon: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30' },
  Rare: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  Epic: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
  Legendary: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
  Mythic: { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/30' },
};

export default function NFTPage() {
  const params = useParams();
  const [nft, setNft] = useState(mockNFT);
  const [activeTab, setActiveTab] = useState<'details' | 'attributes' | 'activity'>('details');
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const truncateAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  const rarityStyle = rarityColors[nft.rarity] || rarityColors.Common;

  const handleBuy = async () => {
    setIsLoading(true);
    // Simulate purchase
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
    alert('Purchase functionality would trigger here');
  };

  const handleMakeOffer = () => {
    alert('Make offer modal would open here');
  };

  const tabs = [
    { id: 'details', label: 'Details', icon: '📋' },
    { id: 'attributes', label: 'Attributes', icon: '✨', count: nft.attributes.length },
    { id: 'activity', label: 'Activity', icon: '📜' },
  ] as const;

  return (
    <main className="min-h-screen bg-gray-950">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-purple-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-pink-600/5 rounded-full blur-3xl" />
      </div>

      <Header />

      <div className="relative pt-24 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
            <Link href="/" className="hover:text-purple-400 transition-colors">Home</Link>
            <span className="text-gray-600">/</span>
            <Link href="/marketplace" className="hover:text-purple-400 transition-colors">Marketplace</Link>
            <span className="text-gray-600">/</span>
            <Link href={`/collections/${nft.collectionId}`} className="hover:text-purple-400 transition-colors">{nft.collection}</Link>
            <span className="text-gray-600">/</span>
            <span className="text-white">{nft.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left: Image */}
            <div className="space-y-4">
              {/* Main image */}
              <div className="relative aspect-square bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-700">
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-5" style={{
                  backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                  backgroundSize: '20px 20px',
                }} />

                {!imageLoaded && !nft.image && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                      <span className="text-8xl">🎨</span>
                    </div>
                  </div>
                )}

                {nft.image && (
                  <img
                    src={nft.image}
                    alt={nft.name}
                    className="w-full h-full object-contain"
                    onLoad={() => setImageLoaded(true)}
                  />
                )}

                {/* Rarity badge */}
                <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-full ${rarityStyle.bg} ${rarityStyle.text} border ${rarityStyle.border} text-sm font-medium`}>
                  {nft.rarity} • Rank #{nft.rank}
                </div>

                {/* Action buttons */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={() => setIsFavorited(!isFavorited)}
                    className={`p-3 rounded-xl backdrop-blur-sm transition-all ${
                      isFavorited
                        ? 'bg-pink-500/20 text-pink-400'
                        : 'bg-black/40 text-white/80 hover:bg-black/60 hover:text-white'
                    }`}
                  >
                    <svg className="w-5 h-5" fill={isFavorited ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                  <button className="p-3 bg-black/40 hover:bg-black/60 rounded-xl backdrop-blur-sm text-white/80 hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </button>
                  <button className="p-3 bg-black/40 hover:bg-black/60 rounded-xl backdrop-blur-sm text-white/80 hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Contract info */}
              <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Contract Details</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Contract</span>
                    <div className="text-white font-mono text-xs truncate">{nft.contractAddress}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Token ID</span>
                    <div className="text-white font-mono">{nft.tokenId}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Standard</span>
                    <div className="text-white">SIP-009</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Blockchain</span>
                    <div className="text-white">Stacks</div>
                  </div>
                </div>
                <a
                  href={`https://explorer.hiro.so/txid/${nft.contractAddress}?chain=mainnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-purple-400 hover:text-purple-300 text-sm transition-colors"
                >
                  View on Explorer
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Right: Details */}
            <div className="space-y-6">
              {/* Collection & Name */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Link
                    href={`/collections/${nft.collectionId}`}
                    className="text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    {nft.collection}
                  </Link>
                  {nft.isVerified && (
                    <span className="text-blue-400" title="Verified Collection">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">{nft.name}</h1>
              </div>

              {/* Owner & Creator */}
              <div className="flex flex-wrap gap-6">
                <div>
                  <span className="text-sm text-gray-400">Owner</span>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
                    <Link href={`/profile/${nft.owner}`} className="text-white hover:text-purple-400 font-mono transition-colors">
                      {truncateAddress(nft.owner)}
                    </Link>
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-400">Creator</span>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-500" />
                    <Link href={`/profile/${nft.creator}`} className="text-white hover:text-purple-400 font-mono transition-colors">
                      {truncateAddress(nft.creator)}
                    </Link>
                  </div>
                </div>
              </div>

              {/* Price & Actions */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-400">Current Price</span>
                  {nft.lastSale && (
                    <span className="text-sm text-gray-500">
                      Last sale: {nft.lastSale} STX
                    </span>
                  )}
                </div>
                <div className="text-4xl font-bold text-white mb-2">
                  {nft.price} STX
                </div>
                <div className="text-gray-400 mb-6">
                  ≈ ${(nft.price * 0.85).toFixed(2)} USD
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleBuy}
                    disabled={isLoading}
                    className="flex-1 py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-xl transition-all disabled:opacity-50"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      'Buy Now'
                    )}
                  </button>
                  <button
                    onClick={handleMakeOffer}
                    className="flex-1 py-4 px-6 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl transition-colors"
                  >
                    Make Offer
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="bg-gray-800/30 border border-gray-700 rounded-2xl overflow-hidden">
                <div className="flex border-b border-gray-700">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 py-4 px-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                        activeTab === tab.id
                          ? 'text-white bg-gray-800/50 border-b-2 border-purple-500'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800/30'
                      }`}
                    >
                      <span>{tab.icon}</span>
                      {tab.label}
                      {tab.count && (
                        <span className="px-1.5 py-0.5 bg-gray-700 rounded text-xs">{tab.count}</span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="p-6">
                  {activeTab === 'details' && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-400 mb-2">Description</h3>
                        <p className="text-gray-300 leading-relaxed">{nft.description}</p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'attributes' && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {nft.attributes.map((attr, index) => (
                        <div
                          key={index}
                          className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 hover:border-purple-500/50 transition-colors"
                        >
                          <div className="text-xs text-purple-400 uppercase tracking-wider mb-1">{attr.trait_type}</div>
                          <div className="text-white font-medium">{attr.value}</div>
                          <div className="text-xs text-gray-500 mt-1">{attr.rarity}% have this</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'activity' && (
                    <div className="space-y-3">
                      {mockActivities.map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-center gap-4 p-3 bg-gray-800/30 rounded-xl"
                        >
                          <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-lg">
                            {activity.type === 'listing' && '🏷️'}
                            {activity.type === 'transfer' && '↗️'}
                            {activity.type === 'mint' && '✨'}
                          </div>
                          <div className="flex-1">
                            <div className="text-white font-medium capitalize">{activity.type}</div>
                            <div className="text-sm text-gray-400">
                              {activity.type === 'transfer' && `From ${truncateAddress(activity.from)} to ${truncateAddress(activity.to!)}`}
                              {activity.type === 'listing' && `Listed for ${activity.price} STX`}
                              {activity.type === 'mint' && `Minted by ${truncateAddress(activity.from)}`}
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(activity.date).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
