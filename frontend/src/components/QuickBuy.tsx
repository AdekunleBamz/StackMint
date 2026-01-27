'use client';

/**
 * QuickBuy Component
 * Quick purchase button with confirmation modal
 * @module components/QuickBuy
 * @version 1.0.0
 */

import { useState, useCallback } from 'react';

interface QuickBuyProps {
  /** NFT name */
  nftName: string;
  /** NFT image */
  nftImage?: string;
  /** Price in STX */
  price: number;
  /** Collection name */
  collection: string;
  /** Seller address */
  seller: string;
  /** User's STX balance */
  userBalance?: number;
  /** Whether user is connected */
  isConnected?: boolean;
  /** Loading state */
  isLoading?: boolean;
  /** Callback to execute purchase */
  onBuy: () => Promise<void>;
  /** Callback to connect wallet */
  onConnect?: () => void;
  /** Custom className */
  className?: string;
  /** Button variant */
  variant?: 'default' | 'compact' | 'large';
}

export default function QuickBuy({
  nftName,
  nftImage,
  price,
  collection,
  seller,
  userBalance = 0,
  isConnected = false,
  isLoading = false,
  onBuy,
  onConnect,
  className = '',
  variant = 'default',
}: QuickBuyProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const insufficientBalance = userBalance < price;
  const serviceFee = price * 0.025; // 2.5% fee
  const totalPrice = price + serviceFee;

  const truncateAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const handleBuyClick = useCallback(() => {
    if (!isConnected) {
      onConnect?.();
      return;
    }
    setShowConfirm(true);
    setError(null);
  }, [isConnected, onConnect]);

  const handleConfirmPurchase = useCallback(async () => {
    setIsPurchasing(true);
    setError(null);

    try {
      await onBuy();
      setShowConfirm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Purchase failed');
    } finally {
      setIsPurchasing(false);
    }
  }, [onBuy]);

  // Compact variant - just the button
  if (variant === 'compact') {
    return (
      <>
        <button
          onClick={handleBuyClick}
          disabled={isLoading || isPurchasing}
          className={`
            px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 
            hover:from-purple-500 hover:to-pink-500 
            text-white font-semibold rounded-lg transition-all
            disabled:opacity-50 disabled:cursor-not-allowed
            ${className}
          `}
        >
          {isPurchasing ? 'Buying...' : `Buy ${price} STX`}
        </button>
        {showConfirm && (
          <ConfirmModal
            nftName={nftName}
            nftImage={nftImage}
            price={price}
            serviceFee={serviceFee}
            totalPrice={totalPrice}
            collection={collection}
            seller={seller}
            userBalance={userBalance}
            insufficientBalance={insufficientBalance}
            isPurchasing={isPurchasing}
            error={error}
            onConfirm={handleConfirmPurchase}
            onCancel={() => setShowConfirm(false)}
          />
        )}
      </>
    );
  }

  // Large variant - full card with price breakdown
  if (variant === 'large') {
    return (
      <div className={`bg-gray-800/50 border border-gray-700 rounded-xl p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-400">Current Price</span>
          {isConnected && (
            <span className="text-xs text-gray-500">
              Balance: {userBalance.toFixed(2)} STX
            </span>
          )}
        </div>

        <div className="text-3xl font-bold text-white mb-1">
          {price} STX
        </div>
        <div className="text-sm text-gray-400 mb-6">
          ≈ ${(price * 0.85).toFixed(2)} USD
        </div>

        <button
          onClick={handleBuyClick}
          disabled={isLoading || isPurchasing || (isConnected && insufficientBalance)}
          className={`
            w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all
            ${isConnected && insufficientBalance
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {!isConnected
            ? 'Connect Wallet'
            : isPurchasing
            ? 'Processing...'
            : insufficientBalance
            ? 'Insufficient Balance'
            : 'Buy Now'
          }
        </button>

        {isConnected && insufficientBalance && (
          <p className="mt-3 text-sm text-red-400 text-center">
            You need {(price - userBalance).toFixed(2)} more STX
          </p>
        )}

        {showConfirm && (
          <ConfirmModal
            nftName={nftName}
            nftImage={nftImage}
            price={price}
            serviceFee={serviceFee}
            totalPrice={totalPrice}
            collection={collection}
            seller={seller}
            userBalance={userBalance}
            insufficientBalance={insufficientBalance}
            isPurchasing={isPurchasing}
            error={error}
            onConfirm={handleConfirmPurchase}
            onCancel={() => setShowConfirm(false)}
          />
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div>
        <div className="text-sm text-gray-400">Price</div>
        <div className="text-xl font-bold text-white">{price} STX</div>
      </div>
      
      <button
        onClick={handleBuyClick}
        disabled={isLoading || isPurchasing || (isConnected && insufficientBalance)}
        className={`
          flex-1 py-3 px-6 rounded-xl font-semibold transition-all
          ${isConnected && insufficientBalance
            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white'
          }
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        {!isConnected ? 'Connect to Buy' : isPurchasing ? 'Buying...' : 'Buy Now'}
      </button>

      {showConfirm && (
        <ConfirmModal
          nftName={nftName}
          nftImage={nftImage}
          price={price}
          serviceFee={serviceFee}
          totalPrice={totalPrice}
          collection={collection}
          seller={seller}
          userBalance={userBalance}
          insufficientBalance={insufficientBalance}
          isPurchasing={isPurchasing}
          error={error}
          onConfirm={handleConfirmPurchase}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
}

// Confirmation modal component
interface ConfirmModalProps {
  nftName: string;
  nftImage?: string;
  price: number;
  serviceFee: number;
  totalPrice: number;
  collection: string;
  seller: string;
  userBalance: number;
  insufficientBalance: boolean;
  isPurchasing: boolean;
  error: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmModal({
  nftName,
  nftImage,
  price,
  serviceFee,
  totalPrice,
  collection,
  seller,
  userBalance,
  insufficientBalance,
  isPurchasing,
  error,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const truncateAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onCancel}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-md bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Confirm Purchase</h3>
          <button
            onClick={onCancel}
            className="p-1 text-gray-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* NFT Preview */}
          <div className="flex items-center gap-4 mb-6">
            {nftImage ? (
              <img src={nftImage} alt={nftName} className="w-16 h-16 rounded-lg object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-2xl">
                🎨
              </div>
            )}
            <div>
              <div className="text-sm text-gray-400">{collection}</div>
              <div className="text-lg font-semibold text-white">{nftName}</div>
            </div>
          </div>

          {/* Price breakdown */}
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Item Price</span>
              <span className="text-white">{price.toFixed(4)} STX</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Service Fee (2.5%)</span>
              <span className="text-white">{serviceFee.toFixed(4)} STX</span>
            </div>
            <div className="border-t border-gray-800 pt-3 flex justify-between">
              <span className="text-white font-medium">Total</span>
              <span className="text-xl font-bold text-white">{totalPrice.toFixed(4)} STX</span>
            </div>
          </div>

          {/* Seller info */}
          <div className="p-3 bg-gray-800/50 rounded-lg mb-6 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Seller</span>
              <span className="text-white font-mono">{truncateAddress(seller)}</span>
            </div>
          </div>

          {/* Balance warning */}
          {insufficientBalance && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg mb-6 text-sm text-red-400">
              Insufficient balance. You need {(totalPrice - userBalance).toFixed(4)} more STX.
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg mb-6 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isPurchasing || insufficientBalance}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPurchasing ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Confirming...
                </span>
              ) : (
                'Confirm Purchase'
              )}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scale-in {
          animation: scale-in 200ms ease-out;
        }
      `}</style>
    </div>
  );
}
