'use client';

/**
 * NFTPreview Component
 * Full-screen modal for previewing NFT details
 * @module components/NFTPreview
 * @version 1.0.0
 */

import { useState, useEffect, useCallback } from 'react';

/** Animation duration in ms */
const ANIMATION_DURATION = 200;

interface NFTAttribute {
  trait_type: string;
  value: string | number;
  rarity?: number;
}

interface NFTData {
  id: string | number;
  name: string;
  description?: string;
  image: string | null;
  collection: string;
  owner: string;
  creator?: string;
  price?: number;
  lastSale?: number;
  rarity?: string;
  attributes?: NFTAttribute[];
  tokenId?: number;
  contractAddress?: string;
}

interface NFTPreviewProps {
  /** NFT data to display */
  nft: NFTData;
  /** Whether modal is open */
  isOpen: boolean;
  /** Callback to close modal */
  onClose: () => void;
  /** Optional callback for buy action */
  onBuy?: () => void;
  /** Optional callback for make offer */
  onMakeOffer?: () => void;
  /** Optional callback for share */
  onShare?: () => void;
  /** Optional callback for favorite */
  onFavorite?: () => void;
  /** Whether NFT is favorited */
  isFavorited?: boolean;
  /** Loading state for actions */
  isLoading?: boolean;
}

const rarityColors: Record<string, { bg: string; text: string; border: string }> = {
  Common: { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/30' },
  Uncommon: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30' },
  Rare: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  Epic: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
  Legendary: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
  Mythic: { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/30' },
};

export default function NFTPreview({
  nft,
  isOpen,
  onClose,
  onBuy,
  onMakeOffer,
  onShare,
  onFavorite,
  isFavorited = false,
  isLoading = false,
}: NFTPreviewProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'attributes' | 'history'>('details');
  const [isClosing, setIsClosing] = useState(false);

  // Handle escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        handleClose();
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, ANIMATION_DURATION);
  }, [onClose]);

  if (!isOpen) return null;

  const truncateAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  const rarityStyle = rarityColors[nft.rarity || 'Common'] || rarityColors.Common;

  const tabs = [
    { id: 'details', label: 'Details', icon: '📋' },
    { id: 'attributes', label: 'Attributes', icon: '✨' },
    { id: 'history', label: 'History', icon: '📜' },
  ] as const;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
        isClosing ? 'animate-fade-out' : 'animate-fade-in'
      }`}
      onClick={handleClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className={`relative w-full max-w-5xl max-h-[90vh] bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden shadow-2xl ${
          isClosing ? 'animate-scale-out' : 'animate-scale-in'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white/80 hover:text-white transition-colors"
          aria-label="Close preview"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col lg:flex-row h-full max-h-[90vh]">
          {/* Image Section */}
          <div className="lg:w-1/2 bg-gray-950 flex items-center justify-center p-6 relative">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5" style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
              backgroundSize: '20px 20px',
            }} />

            {/* Image container */}
            <div className="relative w-full aspect-square max-w-md">
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gray-800 rounded-xl animate-pulse flex items-center justify-center">
                  <span className="text-4xl">🖼️</span>
                </div>
              )}
              {nft.image ? (
                <img
                  src={nft.image}
                  alt={nft.name}
                  className={`w-full h-full object-contain rounded-xl transition-opacity duration-300 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={() => setImageLoaded(true)}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                  <span className="text-6xl">🎨</span>
                </div>
              )}

              {/* Rarity badge */}
              {nft.rarity && (
                <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-full ${rarityStyle.bg} ${rarityStyle.text} border ${rarityStyle.border} text-sm font-medium`}>
                  {nft.rarity}
                </div>
              )}

              {/* Action buttons */}
              <div className="absolute bottom-4 right-4 flex gap-2">
                {onFavorite && (
                  <button
                    onClick={onFavorite}
                    className={`p-3 rounded-full backdrop-blur-sm transition-all ${
                      isFavorited 
                        ? 'bg-pink-500/20 text-pink-400' 
                        : 'bg-black/50 text-white/80 hover:bg-black/70 hover:text-white'
                    }`}
                    aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <svg className="w-5 h-5" fill={isFavorited ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                )}
                {onShare && (
                  <button
                    onClick={onShare}
                    className="p-3 bg-black/50 hover:bg-black/70 rounded-full text-white/80 hover:text-white backdrop-blur-sm transition-colors"
                    aria-label="Share NFT"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="lg:w-1/2 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-800">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <a 
                    href={`/collections/${nft.collection.toLowerCase().replace(/\s+/g, '-')}`}
                    className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    {nft.collection}
                  </a>
                  <h2 className="text-2xl font-bold text-white mt-1">{nft.name}</h2>
                </div>
                {nft.tokenId && (
                  <span className="px-3 py-1 bg-gray-800 rounded-lg text-sm text-gray-400 font-mono">
                    #{nft.tokenId}
                  </span>
                )}
              </div>

              {/* Owner/Creator */}
              <div className="flex flex-wrap gap-4 mt-4 text-sm">
                <div>
                  <span className="text-gray-400">Owner: </span>
                  <a href={`/profile/${nft.owner}`} className="text-white hover:text-purple-400 transition-colors font-mono">
                    {truncateAddress(nft.owner)}
                  </a>
                </div>
                {nft.creator && (
                  <div>
                    <span className="text-gray-400">Creator: </span>
                    <a href={`/profile/${nft.creator}`} className="text-white hover:text-purple-400 transition-colors font-mono">
                      {truncateAddress(nft.creator)}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Price & Actions */}
            {(nft.price || onBuy || onMakeOffer) && (
              <div className="p-6 bg-gray-800/30 border-b border-gray-800">
                {nft.price && (
                  <div className="mb-4">
                    <div className="text-sm text-gray-400 mb-1">Current Price</div>
                    <div className="text-3xl font-bold text-white flex items-baseline gap-2">
                      {nft.price} STX
                      <span className="text-sm text-gray-400 font-normal">≈ ${(nft.price * 0.85).toFixed(2)}</span>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  {onBuy && nft.price && (
                    <button
                      onClick={onBuy}
                      disabled={isLoading}
                      className="flex-1 py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                          Processing...
                        </span>
                      ) : (
                        'Buy Now'
                      )}
                    </button>
                  )}
                  {onMakeOffer && (
                    <button
                      onClick={onMakeOffer}
                      className="flex-1 py-3 px-6 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl transition-colors"
                    >
                      Make Offer
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="flex border-b border-gray-800">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-3 px-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                    activeTab === tab.id
                      ? 'text-white border-b-2 border-purple-500'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'details' && (
                <div className="space-y-4">
                  {nft.description && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-400 mb-2">Description</h3>
                      <p className="text-gray-300">{nft.description}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <div className="text-xs text-gray-400 mb-1">Contract</div>
                      <div className="text-sm text-white font-mono truncate">
                        {nft.contractAddress || 'stacksmint-nft-v2-1-3'}
                      </div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <div className="text-xs text-gray-400 mb-1">Token ID</div>
                      <div className="text-sm text-white font-mono">{nft.tokenId || nft.id}</div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <div className="text-xs text-gray-400 mb-1">Blockchain</div>
                      <div className="text-sm text-white">Stacks</div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <div className="text-xs text-gray-400 mb-1">Token Standard</div>
                      <div className="text-sm text-white">SIP-009</div>
                    </div>
                  </div>

                  {nft.lastSale && (
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <div className="text-xs text-gray-400 mb-1">Last Sale</div>
                      <div className="text-lg text-white font-bold">{nft.lastSale} STX</div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'attributes' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {nft.attributes && nft.attributes.length > 0 ? (
                    nft.attributes.map((attr, index) => (
                      <div key={index} className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
                        <div className="text-xs text-purple-400 uppercase mb-1">{attr.trait_type}</div>
                        <div className="text-sm text-white font-medium">{attr.value}</div>
                        {attr.rarity && (
                          <div className="text-xs text-gray-400 mt-1">{attr.rarity}% have this</div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8 text-gray-400">
                      <span className="text-3xl mb-2 block">✨</span>
                      No attributes found
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'history' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-4 p-4 bg-gray-800/30 rounded-lg">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                      <span>🎉</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-white">Minted</div>
                      <div className="text-xs text-gray-400">by {truncateAddress(nft.creator || nft.owner)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400">Just now</div>
                    </div>
                  </div>
                  
                  <div className="text-center py-6 text-gray-500 text-sm">
                    No trading history yet
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fade-out {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes scale-out {
          from { opacity: 1; transform: scale(1); }
          to { opacity: 0; transform: scale(0.95); }
        }
        .animate-fade-in { animation: fade-in ${ANIMATION_DURATION}ms ease-out; }
        .animate-fade-out { animation: fade-out ${ANIMATION_DURATION}ms ease-out; }
        .animate-scale-in { animation: scale-in ${ANIMATION_DURATION}ms ease-out; }
        .animate-scale-out { animation: scale-out ${ANIMATION_DURATION}ms ease-out; }
      `}</style>
    </div>
  );
}
