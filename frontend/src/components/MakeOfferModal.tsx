'use client';

/**
 * MakeOfferModal Component
 * Modal for making offers on NFTs
 * @module components/MakeOfferModal
 * @version 1.0.0
 */

import { useState, useEffect, useCallback } from 'react';

/** Minimum offer percentage of floor price */
const MIN_OFFER_PERCENT = 10;

/** Maximum offer duration in days */
const MAX_OFFER_DURATION = 30;

/** Default offer expiration in days */
const DEFAULT_EXPIRATION = 7;

/**
 * NFT data for making offers
 */
interface NFTData {
  id: string;
  name: string;
  image: string | null;
  collection: string;
  currentPrice?: number;
  floorPrice?: number;
  lastSalePrice?: number;
  owner: string;
}

/**
 * Expiration option
 */
interface ExpirationOption {
  label: string;
  days: number;
}

interface MakeOfferModalProps {
  /** Whether modal is open */
  isOpen: boolean;
  /** Callback when modal closes */
  onClose: () => void;
  /** NFT data to make offer on */
  nft: NFTData;
  /** Callback when offer is submitted */
  onOffer: (data: OfferData) => Promise<void>;
  /** Loading state from parent */
  isLoading?: boolean;
  /** User's STX balance */
  userBalance?: number;
  /** User's WSTX balance (wrapped) */
  wstxBalance?: number;
}

/**
 * Data submitted when making offer
 */
export interface OfferData {
  nftId: string;
  amount: number;
  expirationDays: number;
  message?: string;
}

const expirationOptions: ExpirationOption[] = [
  { label: '1 Day', days: 1 },
  { label: '3 Days', days: 3 },
  { label: '7 Days', days: 7 },
  { label: '14 Days', days: 14 },
  { label: '30 Days', days: 30 },
];

/**
 * Quick offer percentages relative to floor/current price
 */
const quickOfferPercentages = [75, 90, 100, 110];

/**
 * MakeOfferModal - Modal for making offers on NFTs
 */
export default function MakeOfferModal({
  isOpen,
  onClose,
  nft,
  onOffer,
  isLoading = false,
  userBalance = 0,
  wstxBalance = 0,
}: MakeOfferModalProps) {
  const [amount, setAmount] = useState<string>('');
  const [expiration, setExpiration] = useState<number>(DEFAULT_EXPIRATION);
  const [message, setMessage] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reference price for quick offers (floor or current price)
  const referencePrice = nft.currentPrice || nft.floorPrice || 0;

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setExpiration(DEFAULT_EXPIRATION);
      setMessage('');
      setErrors({});
    }
  }, [isOpen]);

  // Calculate offer comparison
  const offerAmount = parseFloat(amount) || 0;
  const percentOfPrice = referencePrice > 0 
    ? ((offerAmount / referencePrice) * 100).toFixed(1)
    : '0';
  
  // Check balance
  const hasEnoughBalance = offerAmount <= userBalance || offerAmount <= wstxBalance;
  const totalBalance = userBalance + wstxBalance;

  // Set quick offer amount
  const setQuickOffer = (percent: number) => {
    if (referencePrice > 0) {
      const quickAmount = (referencePrice * percent) / 100;
      setAmount(quickAmount.toFixed(4));
    }
  };

  // Validate form
  const validate = useCallback(() => {
    const newErrors: Record<string, string> = {};
    
    if (!amount || offerAmount <= 0) {
      newErrors.amount = 'Please enter an offer amount';
    } else if (!hasEnoughBalance) {
      newErrors.amount = `Insufficient balance. You have ${totalBalance.toFixed(4)} STX`;
    } else if (referencePrice > 0 && offerAmount < referencePrice * (MIN_OFFER_PERCENT / 100)) {
      newErrors.amount = `Minimum offer is ${MIN_OFFER_PERCENT}% of floor price`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [amount, offerAmount, hasEnoughBalance, totalBalance, referencePrice]);

  // Handle form submission
  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onOffer({
        nftId: nft.id,
        amount: offerAmount,
        expirationDays: expiration,
        message: message.trim() || undefined,
      });
      onClose();
    } catch (err) {
      setErrors({ submit: 'Failed to submit offer. Please try again.' });
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
        aria-labelledby="offer-modal-title"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 id="offer-modal-title" className="text-xl font-bold text-white">
            Make an Offer
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
          {/* NFT Preview */}
          <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-xl mb-6">
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-700 flex-shrink-0">
              {nft.image ? (
                <img src={nft.image} alt={nft.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl">🖼️</div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white truncate">{nft.name}</h3>
              <p className="text-sm text-gray-400">{nft.collection}</p>
              {nft.currentPrice && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-gray-500">Listed at</span>
                  <span className="text-sm font-medium text-purple-400">{nft.currentPrice} STX</span>
                </div>
              )}
            </div>
          </div>

          {/* Balance Info */}
          <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg mb-6">
            <span className="text-sm text-gray-400">Your Balance</span>
            <div className="text-right">
              <div className="text-white font-medium">{userBalance.toFixed(4)} STX</div>
              {wstxBalance > 0 && (
                <div className="text-xs text-gray-500">+ {wstxBalance.toFixed(4)} WSTX</div>
              )}
            </div>
          </div>

          {/* Quick Offers */}
          {referencePrice > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Quick Offer
              </label>
              <div className="flex gap-2">
                {quickOfferPercentages.map((percent) => {
                  const quickAmount = (referencePrice * percent) / 100;
                  const isDisabled = quickAmount > totalBalance;
                  return (
                    <button
                      key={percent}
                      type="button"
                      onClick={() => setQuickOffer(percent)}
                      disabled={isDisabled}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        isDisabled
                          ? 'bg-gray-800/50 text-gray-600 cursor-not-allowed'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      {percent}%
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Amount Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Offer Amount
            </label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min={0}
                step="0.0001"
                className={`w-full px-4 py-3 pr-16 bg-gray-800 border rounded-xl text-white text-lg placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
                  errors.amount 
                    ? 'border-red-500 focus:ring-red-500/50' 
                    : 'border-gray-700 focus:ring-purple-500/50 focus:border-purple-500'
                }`}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                STX
              </span>
            </div>
            {errors.amount ? (
              <p className="mt-2 text-sm text-red-400">{errors.amount}</p>
            ) : (
              referencePrice > 0 && offerAmount > 0 && (
                <p className={`mt-2 text-sm ${
                  parseFloat(percentOfPrice) >= 100 ? 'text-green-400' : 'text-yellow-400'
                }`}>
                  {percentOfPrice}% of {nft.currentPrice ? 'listed price' : 'floor price'}
                </p>
              )
            )}
          </div>

          {/* Expiration */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Offer Expiration
            </label>
            <div className="flex flex-wrap gap-2">
              {expirationOptions.map((option) => (
                <button
                  key={option.days}
                  type="button"
                  onClick={() => setExpiration(option.days)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    expiration === option.days
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Optional Message */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Message <span className="text-gray-500">(optional)</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a note to the seller..."
              maxLength={200}
              rows={2}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 resize-none transition-all"
            />
            <p className="mt-1 text-xs text-gray-500 text-right">{message.length}/200</p>
          </div>

          {/* Price History */}
          {(nft.floorPrice || nft.lastSalePrice) && (
            <div className="p-4 bg-gray-800/30 rounded-xl space-y-2 mb-4">
              {nft.floorPrice && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Floor Price</span>
                  <span className="text-white">{nft.floorPrice} STX</span>
                </div>
              )}
              {nft.lastSalePrice && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Last Sale</span>
                  <span className="text-white">{nft.lastSalePrice} STX</span>
                </div>
              )}
            </div>
          )}

          {/* Submit Error */}
          {errors.submit && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg mb-4">
              <p className="text-sm text-red-400">{errors.submit}</p>
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
              disabled={loading || !amount || offerAmount <= 0}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <span>Submit Offer</span>
                  <span>💎</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
