'use client';

/**
 * CancelListingModal Component
 * Modal for canceling active NFT listings
 * @module components/CancelListingModal
 * @version 1.0.0
 */

import { useState, useEffect } from 'react';

/** Gas estimate for cancel transaction */
const CANCEL_GAS_ESTIMATE = 0.0004;

/**
 * Listing data for cancellation
 */
interface ListingData {
  id: string;
  nftId: string;
  nftName: string;
  nftImage: string | null;
  collection: string;
  price: number;
  listingType: 'fixed' | 'auction';
  listedAt: Date;
  expiresAt?: Date;
  highestBid?: number;
  bidCount?: number;
}

interface CancelListingModalProps {
  /** Whether modal is open */
  isOpen: boolean;
  /** Callback when modal closes */
  onClose: () => void;
  /** Listing data to cancel */
  listing: ListingData;
  /** Callback when cancellation is confirmed */
  onCancel: (listingId: string) => Promise<void>;
  /** Loading state from parent */
  isLoading?: boolean;
  /** User's STX balance for gas */
  userBalance?: number;
}

/**
 * Format time duration
 */
function formatDuration(date: Date): string {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (diffDays > 0) {
    return `${diffDays}d ${diffHours}h remaining`;
  } else if (diffHours > 0) {
    return `${diffHours}h remaining`;
  } else {
    return 'Expiring soon';
  }
}

/**
 * CancelListingModal - Modal for canceling NFT listings
 */
export default function CancelListingModal({
  isOpen,
  onClose,
  listing,
  onCancel,
  isLoading = false,
  userBalance = 0,
}: CancelListingModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasEnoughGas = userBalance >= CANCEL_GAS_ESTIMATE;
  const hasActiveBids = listing.listingType === 'auction' && (listing.bidCount || 0) > 0;

  // Reset error when modal opens
  useEffect(() => {
    if (isOpen) {
      setError(null);
    }
  }, [isOpen]);

  // Handle cancel submission
  const handleCancel = async () => {
    if (!hasEnoughGas) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await onCancel(listing.id);
      onClose();
    } catch (err) {
      setError('Failed to cancel listing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const loading = isLoading || isSubmitting;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={loading ? undefined : onClose}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div 
        className="relative w-full max-w-md bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 animate-fade-in-up overflow-hidden"
        role="dialog"
        aria-labelledby="cancel-modal-title"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 id="cancel-modal-title" className="text-xl font-bold text-white">
            Cancel Listing
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Active Bids Warning */}
          {hasActiveBids && (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl mb-6">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <h4 className="font-medium text-yellow-400">Active bids will be refunded</h4>
                  <p className="text-sm text-yellow-300/80 mt-1">
                    This auction has {listing.bidCount} bid{listing.bidCount !== 1 ? 's' : ''}.
                    All bidders will be automatically refunded.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* NFT Preview */}
          <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-xl mb-6">
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-700 flex-shrink-0">
              {listing.nftImage ? (
                <img src={listing.nftImage} alt={listing.nftName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl">🖼️</div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white truncate">{listing.nftName}</h3>
              <p className="text-sm text-gray-400">{listing.collection}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  listing.listingType === 'auction' 
                    ? 'bg-purple-500/20 text-purple-400' 
                    : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {listing.listingType === 'auction' ? '⚡ Auction' : '🏷️ Fixed'}
                </span>
              </div>
            </div>
          </div>

          {/* Listing Details */}
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">
                {listing.listingType === 'auction' ? 'Starting Price' : 'Listed Price'}
              </span>
              <span className="text-white font-medium">{listing.price} STX</span>
            </div>
            
            {listing.listingType === 'auction' && listing.highestBid && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Highest Bid</span>
                <span className="text-green-400 font-medium">{listing.highestBid} STX</span>
              </div>
            )}

            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Listed</span>
              <span className="text-white">
                {new Date(listing.listedAt).toLocaleDateString()}
              </span>
            </div>

            {listing.expiresAt && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Expires</span>
                <span className="text-white">{formatDuration(new Date(listing.expiresAt))}</span>
              </div>
            )}
          </div>

          {/* Confirmation Text */}
          <div className="p-4 bg-gray-800/30 rounded-xl mb-6">
            <p className="text-sm text-gray-300">
              Your NFT will be removed from the marketplace and returned to your wallet.
              {listing.listingType === 'auction' 
                ? ' All active bids will be automatically refunded to bidders.'
                : ''}
            </p>
          </div>

          {/* Gas Fee */}
          <div className="flex justify-between text-sm p-3 bg-gray-800/30 rounded-lg mb-4">
            <span className="text-gray-400">Network Fee</span>
            <span className={hasEnoughGas ? 'text-white' : 'text-red-400'}>
              ~{CANCEL_GAS_ESTIMATE} STX
            </span>
          </div>

          {!hasEnoughGas && (
            <p className="text-sm text-red-400 mb-4">
              Insufficient balance for gas fees
            </p>
          )}

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-800 bg-gray-900/50">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gray-800 text-white font-medium rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Keep Listed
            </button>
            <button
              onClick={handleCancel}
              disabled={loading || !hasEnoughGas}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Canceling...
                </>
              ) : (
                <>
                  <span>Cancel Listing</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
