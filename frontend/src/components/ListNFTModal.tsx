'use client';

/**
 * ListNFTModal Component
 * Modal for listing NFTs for sale on the marketplace
 * @module components/ListNFTModal
 * @version 1.0.0
 */

import { useState, useEffect, useCallback } from 'react';

/** Marketplace fee percentage */
const MARKETPLACE_FEE_PERCENT = 2.5;

/** Creator royalty percentage */
const CREATOR_ROYALTY_PERCENT = 5;

/** Minimum listing price in STX */
const MIN_LISTING_PRICE = 0.001;

/** Maximum listing duration in days */
const MAX_DURATION_DAYS = 90;

/**
 * NFT data for listing
 */
interface NFTData {
  id: string;
  name: string;
  image: string | null;
  collection: string;
  lastPrice?: number;
  floorPrice?: number;
}

/**
 * Listing type configuration
 */
type ListingType = 'fixed' | 'auction';

/**
 * Duration preset option
 */
interface DurationOption {
  label: string;
  days: number;
}

interface ListNFTModalProps {
  /** Whether modal is open */
  isOpen: boolean;
  /** Callback when modal closes */
  onClose: () => void;
  /** NFT data to list */
  nft: NFTData;
  /** Callback when listing is submitted */
  onList: (data: ListingData) => Promise<void>;
  /** Loading state from parent */
  isLoading?: boolean;
  /** User's STX balance for gas estimation */
  userBalance?: number;
}

/**
 * Data submitted when listing
 */
export interface ListingData {
  nftId: string;
  price: number;
  listingType: ListingType;
  duration: number;
  reservePrice?: number;
  buyNowPrice?: number;
}

const durationOptions: DurationOption[] = [
  { label: '1 Day', days: 1 },
  { label: '3 Days', days: 3 },
  { label: '7 Days', days: 7 },
  { label: '14 Days', days: 14 },
  { label: '30 Days', days: 30 },
  { label: '90 Days', days: 90 },
];

/**
 * ListNFTModal - Modal for listing NFTs for sale
 */
export default function ListNFTModal({
  isOpen,
  onClose,
  nft,
  onList,
  isLoading = false,
  userBalance = 0,
}: ListNFTModalProps) {
  const [listingType, setListingType] = useState<ListingType>('fixed');
  const [price, setPrice] = useState<string>('');
  const [duration, setDuration] = useState<number>(7);
  const [reservePrice, setReservePrice] = useState<string>('');
  const [buyNowPrice, setBuyNowPrice] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setPrice(nft.floorPrice?.toString() || '');
      setListingType('fixed');
      setDuration(7);
      setReservePrice('');
      setBuyNowPrice('');
      setErrors({});
    }
  }, [isOpen, nft.floorPrice]);

  // Calculate fees
  const priceValue = parseFloat(price) || 0;
  const marketplaceFee = priceValue * (MARKETPLACE_FEE_PERCENT / 100);
  const creatorRoyalty = priceValue * (CREATOR_ROYALTY_PERCENT / 100);
  const youReceive = priceValue - marketplaceFee - creatorRoyalty;

  // Estimated gas fee
  const estimatedGas = 0.001;

  // Validate form
  const validate = useCallback(() => {
    const newErrors: Record<string, string> = {};
    
    if (!price || parseFloat(price) < MIN_LISTING_PRICE) {
      newErrors.price = `Minimum price is ${MIN_LISTING_PRICE} STX`;
    }
    
    if (listingType === 'auction') {
      if (reservePrice && parseFloat(reservePrice) >= parseFloat(price)) {
        newErrors.reservePrice = 'Reserve price must be less than starting price';
      }
      if (buyNowPrice && parseFloat(buyNowPrice) <= parseFloat(price)) {
        newErrors.buyNowPrice = 'Buy now price must be greater than starting price';
      }
    }

    if (userBalance < estimatedGas) {
      newErrors.balance = 'Insufficient balance for gas fees';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [price, listingType, reservePrice, buyNowPrice, userBalance, estimatedGas]);

  // Handle form submission
  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onList({
        nftId: nft.id,
        price: parseFloat(price),
        listingType,
        duration,
        reservePrice: reservePrice ? parseFloat(reservePrice) : undefined,
        buyNowPrice: buyNowPrice ? parseFloat(buyNowPrice) : undefined,
      });
      onClose();
    } catch (err) {
      setErrors({ submit: 'Failed to list NFT. Please try again.' });
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
        className="relative w-full max-w-lg bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 animate-fade-in-up overflow-hidden"
        role="dialog"
        aria-labelledby="list-modal-title"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 id="list-modal-title" className="text-xl font-bold text-white">
            List for Sale
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
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* NFT Preview */}
          <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-xl mb-6">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-700 flex-shrink-0">
              {nft.image ? (
                <img src={nft.image} alt={nft.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl">🖼️</div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white truncate">{nft.name}</h3>
              <p className="text-sm text-gray-400">{nft.collection}</p>
              {nft.floorPrice && (
                <p className="text-xs text-gray-500 mt-1">Floor: {nft.floorPrice} STX</p>
              )}
            </div>
          </div>

          {/* Listing Type */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Listing Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setListingType('fixed')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  listingType === 'fixed'
                    ? 'border-purple-500 bg-purple-500/10 text-white'
                    : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600'
                }`}
              >
                <div className="text-2xl mb-2">🏷️</div>
                <div className="font-medium">Fixed Price</div>
                <div className="text-xs opacity-70 mt-1">Sell at a set price</div>
              </button>
              <button
                type="button"
                onClick={() => setListingType('auction')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  listingType === 'auction'
                    ? 'border-purple-500 bg-purple-500/10 text-white'
                    : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600'
                }`}
              >
                <div className="text-2xl mb-2">⚡</div>
                <div className="font-medium">Auction</div>
                <div className="text-xs opacity-70 mt-1">Accept bids</div>
              </button>
            </div>
          </div>

          {/* Price Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {listingType === 'fixed' ? 'Price' : 'Starting Price'}
            </label>
            <div className="relative">
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                min={MIN_LISTING_PRICE}
                step="0.001"
                className={`w-full px-4 py-3 pr-16 bg-gray-800 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
                  errors.price 
                    ? 'border-red-500 focus:ring-red-500/50' 
                    : 'border-gray-700 focus:ring-purple-500/50 focus:border-purple-500'
                }`}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                STX
              </span>
            </div>
            {errors.price && (
              <p className="mt-2 text-sm text-red-400">{errors.price}</p>
            )}
          </div>

          {/* Auction Options */}
          {listingType === 'auction' && (
            <>
              {/* Reserve Price */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Reserve Price <span className="text-gray-500">(optional)</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={reservePrice}
                    onChange={(e) => setReservePrice(e.target.value)}
                    placeholder="0.00"
                    min={0}
                    step="0.001"
                    className={`w-full px-4 py-3 pr-16 bg-gray-800 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
                      errors.reservePrice 
                        ? 'border-red-500 focus:ring-red-500/50' 
                        : 'border-gray-700 focus:ring-purple-500/50 focus:border-purple-500'
                    }`}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                    STX
                  </span>
                </div>
                {errors.reservePrice && (
                  <p className="mt-2 text-sm text-red-400">{errors.reservePrice}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Minimum price for sale. Hidden from bidders.
                </p>
              </div>

              {/* Buy Now Price */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Buy Now Price <span className="text-gray-500">(optional)</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={buyNowPrice}
                    onChange={(e) => setBuyNowPrice(e.target.value)}
                    placeholder="0.00"
                    min={0}
                    step="0.001"
                    className={`w-full px-4 py-3 pr-16 bg-gray-800 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
                      errors.buyNowPrice 
                        ? 'border-red-500 focus:ring-red-500/50' 
                        : 'border-gray-700 focus:ring-purple-500/50 focus:border-purple-500'
                    }`}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                    STX
                  </span>
                </div>
                {errors.buyNowPrice && (
                  <p className="mt-2 text-sm text-red-400">{errors.buyNowPrice}</p>
                )}
              </div>
            </>
          )}

          {/* Duration */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Duration
            </label>
            <div className="flex flex-wrap gap-2">
              {durationOptions.map((option) => (
                <button
                  key={option.days}
                  type="button"
                  onClick={() => setDuration(option.days)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    duration === option.days
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Fee Breakdown */}
          <div className="p-4 bg-gray-800/50 rounded-xl space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Listing Price</span>
              <span className="text-white font-medium">{priceValue.toFixed(4)} STX</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Marketplace Fee ({MARKETPLACE_FEE_PERCENT}%)</span>
              <span className="text-red-400">-{marketplaceFee.toFixed(4)} STX</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Creator Royalty ({CREATOR_ROYALTY_PERCENT}%)</span>
              <span className="text-red-400">-{creatorRoyalty.toFixed(4)} STX</span>
            </div>
            <div className="border-t border-gray-700 pt-3 flex justify-between">
              <span className="text-gray-300 font-medium">You Receive</span>
              <span className="text-green-400 font-bold">{youReceive.toFixed(4)} STX</span>
            </div>
          </div>

          {/* Gas Estimate */}
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-gray-500">Estimated Gas</span>
            <span className="text-gray-400">~{estimatedGas} STX</span>
          </div>

          {/* Errors */}
          {(errors.balance || errors.submit) && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-400">{errors.balance || errors.submit}</p>
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
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !price}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Listing...
                </>
              ) : (
                <>
                  <span>List for Sale</span>
                  <span>🚀</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
