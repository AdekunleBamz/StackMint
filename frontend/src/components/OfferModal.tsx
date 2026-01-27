'use client';

/**
 * OfferModal Component
 * Modal for making offers on NFTs
 * @module components/OfferModal
 * @version 1.0.0
 */

import { useState, useEffect, useMemo } from 'react';
import { useWallet } from '@/hooks/useWallet';

interface OfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  nft: {
    id: number;
    name: string;
    image?: string;
    listingPrice?: number;
    floorPrice?: number;
    lastSale?: number;
    collection?: string;
  };
  onSubmit?: (amount: number, expiry: number) => Promise<void>;
}

const expiryOptions = [
  { value: 24, label: '24 hours' },
  { value: 72, label: '3 days' },
  { value: 168, label: '7 days' },
  { value: 336, label: '14 days' },
  { value: 720, label: '30 days' },
];

export default function OfferModal({
  isOpen,
  onClose,
  nft,
  onSubmit,
}: OfferModalProps) {
  const { isConnected, address } = useWallet();
  const [amount, setAmount] = useState('');
  const [expiry, setExpiry] = useState(168); // 7 days default
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setExpiry(168);
      setError(null);
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Quick fill amounts
  const quickAmounts = useMemo(() => {
    const reference = nft.listingPrice || nft.floorPrice || nft.lastSale || 100;
    return [
      { label: '75%', value: reference * 0.75 },
      { label: '90%', value: reference * 0.90 },
      { label: '95%', value: reference * 0.95 },
      { label: '100%', value: reference },
    ];
  }, [nft]);

  // Validation
  const validation = useMemo(() => {
    const numAmount = parseFloat(amount);
    
    if (!amount) return { valid: false, message: 'Enter an amount' };
    if (isNaN(numAmount)) return { valid: false, message: 'Invalid amount' };
    if (numAmount <= 0) return { valid: false, message: 'Amount must be greater than 0' };
    if (numAmount < 0.001) return { valid: false, message: 'Minimum offer is 0.001 STX' };
    
    // Warning if offer is much lower than listing
    if (nft.listingPrice && numAmount < nft.listingPrice * 0.5) {
      return { valid: true, message: 'Your offer is less than 50% of the listing price', warning: true };
    }
    
    return { valid: true, message: null };
  }, [amount, nft.listingPrice]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validation.valid || submitting) return;
    
    setSubmitting(true);
    setError(null);
    
    try {
      if (onSubmit) {
        await onSubmit(parseFloat(amount), expiry);
      } else {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit offer');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden animate-scale-in shadow-2xl">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <h2 className="text-lg font-semibold text-white">Make an Offer</h2>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
          
          {/* NFT Preview */}
          <div className="p-4 border-b border-gray-800">
            <div className="flex gap-4">
              {nft.image ? (
                <img src={nft.image} alt={nft.name} className="w-20 h-20 rounded-xl object-cover" />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                  <span className="text-3xl">🎨</span>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-400">{nft.collection || 'NFT'}</p>
                <h3 className="font-semibold text-white">{nft.name}</h3>
                {nft.listingPrice && (
                  <p className="text-sm text-gray-400 mt-1">
                    Listed for <span className="text-white font-medium">{nft.listingPrice} STX</span>
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {/* Price Reference */}
          <div className="px-4 pt-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-gray-800/50 rounded-xl p-3">
                <p className="text-xs text-gray-500">Floor</p>
                <p className="font-semibold text-white">{nft.floorPrice || '--'} STX</p>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-3">
                <p className="text-xs text-gray-500">Listed</p>
                <p className="font-semibold text-white">{nft.listingPrice || '--'} STX</p>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-3">
                <p className="text-xs text-gray-500">Last Sale</p>
                <p className="font-semibold text-white">{nft.lastSale || '--'} STX</p>
              </div>
            </div>
          </div>
          
          {/* Amount Input */}
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Your Offer</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 pr-16 text-xl font-semibold text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                  STX
                </span>
              </div>
              
              {/* Quick fill buttons */}
              <div className="flex gap-2 mt-2">
                {quickAmounts.map(({ label, value }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setAmount(value.toFixed(2))}
                    className="flex-1 px-3 py-1.5 text-xs font-medium bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition-colors"
                  >
                    {label}
                  </button>
                ))}
              </div>
              
              {/* Validation message */}
              {validation.message && (
                <p className={`text-sm mt-2 ${validation.warning ? 'text-yellow-400' : 'text-red-400'}`}>
                  {validation.warning ? '⚠️' : '❌'} {validation.message}
                </p>
              )}
            </div>
            
            {/* Expiry */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Offer expires in</label>
              <div className="grid grid-cols-5 gap-2">
                {expiryOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setExpiry(option.value)}
                    className={`px-2 py-2 text-xs font-medium rounded-lg transition-all ${
                      expiry === option.value
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Error */}
            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="p-4 border-t border-gray-800 space-y-3">
            {!isConnected && (
              <p className="text-sm text-yellow-400 text-center">
                ⚠️ Connect your wallet to make an offer
              </p>
            )}
            <button
              type="submit"
              disabled={!validation.valid || submitting || !isConnected}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Submitting Offer...
                </>
              ) : (
                <>
                  <span>🤝</span>
                  Make Offer
                </>
              )}
            </button>
            <p className="text-xs text-gray-500 text-center">
              Offers are binding. Funds will be held until the offer expires or is accepted.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
