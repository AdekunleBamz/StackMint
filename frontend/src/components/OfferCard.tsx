'use client';

/**
 * OfferCard Component
 * Display NFT offers with actions
 * @module components/OfferCard
 * @version 1.0.0
 */

import { useState } from 'react';

interface Offer {
  id: string;
  amount: number;
  offerer: string;
  offererAvatar?: string;
  offererName?: string;
  expiresAt: Date;
  status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'cancelled';
  createdAt: Date;
}

interface OfferCardProps {
  offer: Offer;
  isOwner?: boolean;
  onAccept?: (offerId: string) => void;
  onReject?: (offerId: string) => void;
  onCounter?: (offerId: string) => void;
  className?: string;
}

export function OfferCard({
  offer,
  isOwner = false,
  onAccept,
  onReject,
  onCounter,
  className = '',
}: OfferCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getTimeRemaining = (expiresAt: Date) => {
    const diff = expiresAt.getTime() - Date.now();
    if (diff <= 0) return 'Expired';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h left`;
    }
    return `${hours}h ${minutes}m left`;
  };

  const getStatusBadge = () => {
    const statusConfig = {
      pending: {
        text: 'Pending',
        bg: 'bg-yellow-500/20',
        color: 'text-yellow-400',
      },
      accepted: {
        text: 'Accepted',
        bg: 'bg-green-500/20',
        color: 'text-green-400',
      },
      rejected: {
        text: 'Rejected',
        bg: 'bg-red-500/20',
        color: 'text-red-400',
      },
      expired: {
        text: 'Expired',
        bg: 'bg-gray-500/20',
        color: 'text-gray-400',
      },
      cancelled: {
        text: 'Cancelled',
        bg: 'bg-gray-500/20',
        color: 'text-gray-400',
      },
    };

    const config = statusConfig[offer.status];
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${config.bg} ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const handleAccept = async () => {
    setIsLoading(true);
    try {
      await onAccept?.(offer.id);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    setIsLoading(true);
    try {
      await onReject?.(offer.id);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`bg-gray-800/50 rounded-xl p-4 border border-gray-700 hover:border-gray-600 transition-colors ${className}`}>
      <div className="flex items-center justify-between">
        {/* Offerer info */}
        <div className="flex items-center gap-3">
          {offer.offererAvatar ? (
            <img
              src={offer.offererAvatar}
              alt={offer.offererName || 'Offerer'}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
              <span className="text-white text-sm font-bold">
                {(offer.offererName || offer.offerer).charAt(0).toUpperCase()}
              </span>
            </div>
          )}

          <div>
            <p className="font-medium text-white">
              {offer.offererName || shortenAddress(offer.offerer)}
            </p>
            <p className="text-xs text-gray-500">
              {offer.createdAt.toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Offer amount */}
        <div className="text-right">
          <p className="text-xl font-bold text-primary-400">
            {offer.amount.toFixed(2)} STX
          </p>
          <p className="text-xs text-gray-500">
            {getTimeRemaining(offer.expiresAt)}
          </p>
        </div>
      </div>

      {/* Status and actions */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
        {getStatusBadge()}

        {offer.status === 'pending' && isOwner && (
          <div className="flex gap-2">
            <button
              onClick={handleReject}
              disabled={isLoading}
              className="px-3 py-1.5 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
            >
              Reject
            </button>
            {onCounter && (
              <button
                onClick={() => onCounter(offer.id)}
                disabled={isLoading}
                className="px-3 py-1.5 text-sm font-medium text-primary-400 hover:bg-primary-500/10 rounded-lg transition-colors disabled:opacity-50"
              >
                Counter
              </button>
            )}
            <button
              onClick={handleAccept}
              disabled={isLoading}
              className="px-3 py-1.5 text-sm font-medium bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : 'Accept'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Offers list component
 */
interface OffersListProps {
  offers: Offer[];
  isOwner?: boolean;
  onAccept?: (offerId: string) => void;
  onReject?: (offerId: string) => void;
  onCounter?: (offerId: string) => void;
  emptyMessage?: string;
  className?: string;
}

export function OffersList({
  offers,
  isOwner = false,
  onAccept,
  onReject,
  onCounter,
  emptyMessage = 'No offers yet',
  className = '',
}: OffersListProps) {
  if (offers.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {offers.map((offer) => (
        <OfferCard
          key={offer.id}
          offer={offer}
          isOwner={isOwner}
          onAccept={onAccept}
          onReject={onReject}
          onCounter={onCounter}
        />
      ))}
    </div>
  );
}

/**
 * Make offer form
 */
interface MakeOfferFormProps {
  minPrice?: number;
  maxPrice?: number;
  onSubmit: (amount: number, expirationDays: number) => Promise<void>;
  className?: string;
}

export function MakeOfferForm({
  minPrice = 0,
  maxPrice,
  onSubmit,
  className = '',
}: MakeOfferFormProps) {
  const [amount, setAmount] = useState('');
  const [expirationDays, setExpirationDays] = useState(7);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (numAmount < minPrice) {
      setError(`Minimum offer is ${minPrice} STX`);
      return;
    }
    if (maxPrice && numAmount > maxPrice) {
      setError(`Maximum offer is ${maxPrice} STX`);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(numAmount, expirationDays);
      setAmount('');
    } catch (err) {
      setError('Failed to submit offer');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      {/* Amount input */}
      <div>
        <label className="block text-sm text-gray-400 mb-2">Offer Amount</label>
        <div className="relative">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            step="0.01"
            min={minPrice}
            max={maxPrice}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 pr-16 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
            STX
          </span>
        </div>
      </div>

      {/* Expiration */}
      <div>
        <label className="block text-sm text-gray-400 mb-2">Offer Expires In</label>
        <select
          value={expirationDays}
          onChange={(e) => setExpirationDays(parseInt(e.target.value))}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-500"
        >
          <option value={1}>1 day</option>
          <option value={3}>3 days</option>
          <option value={7}>7 days</option>
          <option value={14}>14 days</option>
          <option value={30}>30 days</option>
        </select>
      </div>

      {/* Error */}
      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting || !amount}
        className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors"
      >
        {isSubmitting ? 'Submitting...' : 'Make Offer'}
      </button>
    </form>
  );
}

export default OfferCard;
