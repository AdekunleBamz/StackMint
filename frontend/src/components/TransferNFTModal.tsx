'use client';

/**
 * TransferNFTModal Component
 * Modal for transferring NFT ownership to another address
 * @module components/TransferNFTModal
 * @version 1.0.0
 */

import { useState, useEffect, useCallback } from 'react';

/** Gas fee estimate for transfer */
const TRANSFER_GAS_ESTIMATE = 0.0005;

/** Stacks address length */
const STACKS_ADDRESS_LENGTH = 41;

/** Stacks address prefix regex */
const STACKS_ADDRESS_REGEX = /^SP[A-Z0-9]{39}$/;

/** BNS domain regex */
const BNS_DOMAIN_REGEX = /^[a-z0-9-]+\.btc$/i;

/**
 * NFT data for transfer
 */
interface NFTData {
  id: string;
  name: string;
  image: string | null;
  collection: string;
  tokenId: number;
}

/**
 * Recent recipient entry
 */
interface RecentRecipient {
  address: string;
  name?: string;
  timestamp: number;
}

interface TransferNFTModalProps {
  /** Whether modal is open */
  isOpen: boolean;
  /** Callback when modal closes */
  onClose: () => void;
  /** NFT data to transfer */
  nft: NFTData;
  /** Callback when transfer is confirmed */
  onTransfer: (data: TransferData) => Promise<void>;
  /** Loading state from parent */
  isLoading?: boolean;
  /** User's STX balance for gas */
  userBalance?: number;
  /** Recent recipients for quick select */
  recentRecipients?: RecentRecipient[];
}

/**
 * Data submitted when transferring
 */
export interface TransferData {
  nftId: string;
  tokenId: number;
  recipient: string;
  memo?: string;
}

/**
 * TransferNFTModal - Modal for transferring NFTs
 */
export default function TransferNFTModal({
  isOpen,
  onClose,
  nft,
  onTransfer,
  isLoading = false,
  userBalance = 0,
  recentRecipients = [],
}: TransferNFTModalProps) {
  const [recipient, setRecipient] = useState<string>('');
  const [memo, setMemo] = useState<string>('');
  const [isValidating, setIsValidating] = useState(false);
  const [addressValid, setAddressValid] = useState<boolean | null>(null);
  const [resolvedAddress, setResolvedAddress] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setRecipient('');
      setMemo('');
      setAddressValid(null);
      setResolvedAddress(null);
      setErrors({});
      setShowConfirmation(false);
    }
  }, [isOpen]);

  // Validate address format
  const validateAddress = useCallback(async (address: string) => {
    if (!address) {
      setAddressValid(null);
      setResolvedAddress(null);
      return;
    }

    setIsValidating(true);

    try {
      // Check if it's a BNS name
      if (BNS_DOMAIN_REGEX.test(address)) {
        // In production, would resolve BNS to address
        // Mock resolution for demo
        await new Promise(resolve => setTimeout(resolve, 500));
        const mockResolvedAddress = 'SP' + 'X'.repeat(39);
        setResolvedAddress(mockResolvedAddress);
        setAddressValid(true);
      } else if (STACKS_ADDRESS_REGEX.test(address)) {
        // Valid Stacks address format
        setAddressValid(true);
        setResolvedAddress(null);
      } else if (address.startsWith('SP') && address.length === STACKS_ADDRESS_LENGTH) {
        // Might be valid but with lowercase
        setAddressValid(true);
        setResolvedAddress(null);
      } else {
        setAddressValid(false);
        setResolvedAddress(null);
      }
    } catch (err) {
      setAddressValid(false);
      setResolvedAddress(null);
    } finally {
      setIsValidating(false);
    }
  }, []);

  // Debounced address validation
  useEffect(() => {
    const timer = setTimeout(() => {
      validateAddress(recipient);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [recipient, validateAddress]);

  // Check if user has enough gas
  const hasEnoughGas = userBalance >= TRANSFER_GAS_ESTIMATE;

  // Handle form validation
  const validate = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!recipient) {
      newErrors.recipient = 'Please enter a recipient address';
    } else if (!addressValid) {
      newErrors.recipient = 'Invalid Stacks address or BNS name';
    }

    if (!hasEnoughGas) {
      newErrors.gas = `Insufficient balance for gas. Need ${TRANSFER_GAS_ESTIMATE} STX`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [recipient, addressValid, hasEnoughGas]);

  // Handle continue to confirmation
  const handleContinue = () => {
    if (validate()) {
      setShowConfirmation(true);
    }
  };

  // Handle transfer submission
  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onTransfer({
        nftId: nft.id,
        tokenId: nft.tokenId,
        recipient: resolvedAddress || recipient,
        memo: memo.trim() || undefined,
      });
      onClose();
    } catch (err) {
      setErrors({ submit: 'Failed to transfer NFT. Please try again.' });
      setShowConfirmation(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Select recent recipient
  const selectRecipient = (address: string) => {
    setRecipient(address);
  };

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        if (showConfirmation) {
          setShowConfirmation(false);
        } else {
          onClose();
        }
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, isSubmitting, showConfirmation, onClose]);

  if (!isOpen) return null;

  const loading = isLoading || isSubmitting;
  const finalRecipient = resolvedAddress || recipient;

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
        aria-labelledby="transfer-modal-title"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 id="transfer-modal-title" className="text-xl font-bold text-white flex items-center gap-2">
            {showConfirmation ? (
              <>
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="p-1 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                Confirm Transfer
              </>
            ) : (
              'Transfer NFT'
            )}
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
              <p className="text-xs text-gray-500 mt-1">Token #{nft.tokenId}</p>
            </div>
          </div>

          {showConfirmation ? (
            /* Confirmation View */
            <>
              {/* Warning Banner */}
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl mb-6">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <h4 className="font-medium text-yellow-400">Double-check the address</h4>
                    <p className="text-sm text-yellow-300/80 mt-1">
                      Transfers are irreversible. Make sure the recipient address is correct.
                    </p>
                  </div>
                </div>
              </div>

              {/* Transfer Details */}
              <div className="space-y-4 mb-6">
                <div className="p-4 bg-gray-800/50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Sending</p>
                  <p className="font-medium text-white">{nft.name}</p>
                </div>

                <div className="flex justify-center">
                  <div className="p-2 bg-gray-800 rounded-full">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>
                </div>

                <div className="p-4 bg-gray-800/50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">To</p>
                  {resolvedAddress ? (
                    <>
                      <p className="font-medium text-white">{recipient}</p>
                      <p className="text-xs text-gray-500 mt-1 font-mono break-all">{resolvedAddress}</p>
                    </>
                  ) : (
                    <p className="font-mono text-sm text-white break-all">{recipient}</p>
                  )}
                </div>

                {memo && (
                  <div className="p-4 bg-gray-800/50 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">Memo</p>
                    <p className="text-sm text-white">{memo}</p>
                  </div>
                )}
              </div>

              {/* Gas Fee */}
              <div className="flex justify-between text-sm p-3 bg-gray-800/30 rounded-lg mb-4">
                <span className="text-gray-400">Network Fee</span>
                <span className="text-white">~{TRANSFER_GAS_ESTIMATE} STX</span>
              </div>
            </>
          ) : (
            /* Input View */
            <>
              {/* Recent Recipients */}
              {recentRecipients.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Recent
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {recentRecipients.slice(0, 3).map((r) => (
                      <button
                        key={r.address}
                        type="button"
                        onClick={() => selectRecipient(r.address)}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-xs">
                          {(r.name || r.address)[0].toUpperCase()}
                        </div>
                        <span className="text-sm text-white truncate max-w-[100px]">
                          {r.name || `${r.address.slice(0, 8)}...`}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Recipient Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Recipient Address
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="SP... or name.btc"
                    className={`w-full px-4 py-3 pr-12 bg-gray-800 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all font-mono text-sm ${
                      errors.recipient 
                        ? 'border-red-500 focus:ring-red-500/50' 
                        : addressValid === true
                        ? 'border-green-500 focus:ring-green-500/50'
                        : 'border-gray-700 focus:ring-purple-500/50 focus:border-purple-500'
                    }`}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {isValidating ? (
                      <div className="w-5 h-5 border-2 border-gray-600 border-t-gray-400 rounded-full animate-spin" />
                    ) : addressValid === true ? (
                      <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : addressValid === false ? (
                      <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : null}
                  </div>
                </div>
                {errors.recipient && (
                  <p className="mt-2 text-sm text-red-400">{errors.recipient}</p>
                )}
                {resolvedAddress && (
                  <p className="mt-2 text-xs text-gray-500 font-mono">
                    Resolves to: {resolvedAddress.slice(0, 10)}...{resolvedAddress.slice(-8)}
                  </p>
                )}
              </div>

              {/* Memo Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Memo <span className="text-gray-500">(optional)</span>
                </label>
                <input
                  type="text"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="Add a note..."
                  maxLength={100}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                />
              </div>

              {/* Gas Fee */}
              <div className="flex justify-between text-sm p-3 bg-gray-800/30 rounded-lg mb-4">
                <span className="text-gray-400">Estimated Gas</span>
                <span className={hasEnoughGas ? 'text-white' : 'text-red-400'}>
                  ~{TRANSFER_GAS_ESTIMATE} STX
                </span>
              </div>

              {errors.gas && (
                <p className="text-sm text-red-400 mb-4">{errors.gas}</p>
              )}
            </>
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
              onClick={showConfirmation ? () => setShowConfirmation(false) : onClose}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gray-800 text-white font-medium rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              {showConfirmation ? 'Back' : 'Cancel'}
            </button>
            <button
              onClick={showConfirmation ? handleSubmit : handleContinue}
              disabled={loading || !addressValid || !hasEnoughGas}
              className={`flex-1 px-6 py-3 font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${
                showConfirmation
                  ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white hover:opacity-90'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Transferring...
                </>
              ) : showConfirmation ? (
                <>
                  <span>Confirm Transfer</span>
                  <span>🔥</span>
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
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
