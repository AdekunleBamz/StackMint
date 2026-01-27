'use client';

/**
 * BurnNFTModal Component
 * Modal for burning/destroying NFTs permanently
 * @module components/BurnNFTModal
 * @version 1.0.0
 */

import { useState, useEffect } from 'react';

/** Gas estimate for burn transaction */
const BURN_GAS_ESTIMATE = 0.0003;

/**
 * NFT data for burning
 */
interface NFTData {
  id: string;
  name: string;
  image: string | null;
  collection: string;
  tokenId: number;
}

interface BurnNFTModalProps {
  /** Whether modal is open */
  isOpen: boolean;
  /** Callback when modal closes */
  onClose: () => void;
  /** NFT data to burn */
  nft: NFTData;
  /** Callback when burn is confirmed */
  onBurn: (nftId: string, tokenId: number) => Promise<void>;
  /** Loading state from parent */
  isLoading?: boolean;
  /** User's STX balance for gas */
  userBalance?: number;
}

/**
 * BurnNFTModal - Modal for permanently destroying NFTs
 */
export default function BurnNFTModal({
  isOpen,
  onClose,
  nft,
  onBurn,
  isLoading = false,
  userBalance = 0,
}: BurnNFTModalProps) {
  const [confirmText, setConfirmText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requiredConfirmText = 'BURN';
  const isConfirmed = confirmText.toUpperCase() === requiredConfirmText;
  const hasEnoughGas = userBalance >= BURN_GAS_ESTIMATE;

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setConfirmText('');
      setError(null);
    }
  }, [isOpen]);

  // Handle burn submission
  const handleBurn = async () => {
    if (!isConfirmed || !hasEnoughGas) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await onBurn(nft.id, nft.tokenId);
      onClose();
    } catch (err) {
      setError('Failed to burn NFT. Please try again.');
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
        className="relative w-full max-w-md bg-gray-900 rounded-2xl shadow-2xl border border-red-900/50 animate-fade-in-up overflow-hidden"
        role="alertdialog"
        aria-labelledby="burn-modal-title"
        aria-describedby="burn-modal-description"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-red-900/30 bg-red-500/5">
          <h2 id="burn-modal-title" className="text-xl font-bold text-red-400 flex items-center gap-2">
            <span className="text-2xl">🔥</span>
            Burn NFT
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
          {/* Warning Banner */}
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl mb-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h4 className="font-semibold text-red-400">This action is permanent!</h4>
                <p id="burn-modal-description" className="text-sm text-red-300/80 mt-1">
                  Burning an NFT will permanently destroy it. This cannot be undone.
                  You will not be able to recover this NFT.
                </p>
              </div>
            </div>
          </div>

          {/* NFT Preview */}
          <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-xl mb-6">
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-700 flex-shrink-0 relative">
              {nft.image ? (
                <img src={nft.image} alt={nft.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl">🖼️</div>
              )}
              {/* Burn overlay */}
              <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                <span className="text-3xl opacity-50">🔥</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white truncate">{nft.name}</h3>
              <p className="text-sm text-gray-400">{nft.collection}</p>
              <p className="text-xs text-gray-500 mt-1">Token #{nft.tokenId}</p>
            </div>
          </div>

          {/* Confirmation Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Type <span className="text-red-400 font-bold">{requiredConfirmText}</span> to confirm
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={requiredConfirmText}
              className={`w-full px-4 py-3 bg-gray-800 border rounded-xl text-white text-center text-lg font-mono placeholder-gray-600 focus:outline-none focus:ring-2 transition-all ${
                confirmText && !isConfirmed
                  ? 'border-red-500 focus:ring-red-500/50'
                  : isConfirmed
                  ? 'border-green-500 focus:ring-green-500/50'
                  : 'border-gray-700 focus:ring-red-500/50 focus:border-red-500'
              }`}
              autoComplete="off"
              spellCheck={false}
            />
          </div>

          {/* Gas Fee */}
          <div className="flex justify-between text-sm p-3 bg-gray-800/30 rounded-lg mb-4">
            <span className="text-gray-400">Network Fee</span>
            <span className={hasEnoughGas ? 'text-white' : 'text-red-400'}>
              ~{BURN_GAS_ESTIMATE} STX
            </span>
          </div>

          {!hasEnoughGas && (
            <p className="text-sm text-red-400 mb-4">
              Insufficient balance for gas fees
            </p>
          )}

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg mb-4">
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
              Cancel
            </button>
            <button
              onClick={handleBurn}
              disabled={loading || !isConfirmed || !hasEnoughGas}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Burning...
                </>
              ) : (
                <>
                  <span>Burn Forever</span>
                  <span>🔥</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
