'use client';

/**
 * BidCard Component
 * NFT bidding and auction components
 * @module components/BidCard
 * @version 1.0.0
 */

import { memo, useState, useCallback, useEffect } from 'react';

interface Bid {
  id: string;
  bidder: {
    address: string;
    displayName?: string;
    avatar?: string;
  };
  amount: number;
  timestamp: Date;
  status: 'active' | 'outbid' | 'accepted' | 'cancelled';
}

interface BidCardProps {
  nftName: string;
  nftImage: string;
  currentBid: number;
  minBid: number;
  auctionEnds?: Date;
  bidHistory?: Bid[];
  userBalance?: number;
  onPlaceBid?: (amount: number) => void;
  onBuyNow?: () => void;
  buyNowPrice?: number;
  className?: string;
}

function BidCardComponent({
  nftName,
  nftImage,
  currentBid,
  minBid,
  auctionEnds,
  bidHistory = [],
  userBalance = 0,
  onPlaceBid,
  onBuyNow,
  buyNowPrice,
  className = '',
}: BidCardProps) {
  const [bidAmount, setBidAmount] = useState(minBid.toString());
  const [showHistory, setShowHistory] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  // Countdown timer
  useEffect(() => {
    if (!auctionEnds) return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = auctionEnds.getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft(null);
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [auctionEnds]);

  const handlePlaceBid = useCallback(() => {
    const amount = parseFloat(bidAmount);
    if (!isNaN(amount) && amount >= minBid && amount <= userBalance) {
      onPlaceBid?.(amount);
    }
  }, [bidAmount, minBid, userBalance, onPlaceBid]);

  const incrementBid = useCallback((amount: number) => {
    const current = parseFloat(bidAmount) || minBid;
    setBidAmount((current + amount).toFixed(2));
  }, [bidAmount, minBid]);

  const isAuctionEnded = auctionEnds && new Date() > auctionEnds;
  const canBid = !isAuctionEnded && parseFloat(bidAmount) >= minBid && parseFloat(bidAmount) <= userBalance;

  return (
    <div className={`bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden ${className}`}>
      {/* NFT Preview */}
      <div className="flex gap-4 p-4 border-b border-gray-800">
        <img
          src={nftImage}
          alt={nftName}
          className="w-20 h-20 rounded-xl object-cover"
        />
        <div className="flex-1">
          <h3 className="font-semibold text-white">{nftName}</h3>
          <div className="mt-2">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Current Bid</p>
            <p className="text-xl font-bold text-white">{currentBid.toFixed(2)} STX</p>
          </div>
        </div>
      </div>

      {/* Countdown Timer */}
      {auctionEnds && (
        <div className="px-4 py-3 bg-gray-800/50 border-b border-gray-800">
          {isAuctionEnded ? (
            <div className="text-center">
              <p className="text-red-400 font-medium">Auction Ended</p>
            </div>
          ) : timeLeft ? (
            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{timeLeft.days}</p>
                <p className="text-xs text-gray-500">Days</p>
              </div>
              <span className="text-gray-600 text-xl">:</span>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{timeLeft.hours.toString().padStart(2, '0')}</p>
                <p className="text-xs text-gray-500">Hours</p>
              </div>
              <span className="text-gray-600 text-xl">:</span>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{timeLeft.minutes.toString().padStart(2, '0')}</p>
                <p className="text-xs text-gray-500">Mins</p>
              </div>
              <span className="text-gray-600 text-xl">:</span>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{timeLeft.seconds.toString().padStart(2, '0')}</p>
                <p className="text-xs text-gray-500">Secs</p>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Bid Input */}
      {!isAuctionEnded && (
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Your Bid</label>
            <div className="relative">
              <input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                min={minBid}
                step="0.01"
                className="w-full px-4 py-3 pr-16 bg-gray-800/50 border border-gray-700 rounded-xl text-white text-lg font-medium focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                STX
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Minimum bid: {minBid.toFixed(2)} STX
            </p>
          </div>

          {/* Quick Increment Buttons */}
          <div className="flex gap-2">
            {[1, 5, 10, 25].map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => incrementBid(amount)}
                className="flex-1 py-2 bg-gray-800 rounded-lg text-sm text-gray-300 hover:bg-gray-700 transition-colors"
              >
                +{amount}
              </button>
            ))}
          </div>

          {/* Balance Warning */}
          {parseFloat(bidAmount) > userBalance && (
            <div className="flex items-center gap-2 p-3 bg-red-600/10 border border-red-600/20 rounded-xl">
              <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-sm text-red-400">
                Insufficient balance. Your balance: {userBalance.toFixed(2)} STX
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handlePlaceBid}
              disabled={!canBid}
              className={`
                flex-1 py-3 rounded-xl font-semibold transition-all
                ${canBid 
                  ? 'bg-purple-600 text-white hover:bg-purple-500' 
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              Place Bid
            </button>
            
            {buyNowPrice && onBuyNow && (
              <button
                type="button"
                onClick={onBuyNow}
                disabled={buyNowPrice > userBalance}
                className={`
                  px-6 py-3 rounded-xl font-semibold transition-all
                  ${buyNowPrice <= userBalance 
                    ? 'bg-green-600 text-white hover:bg-green-500' 
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  }
                `}
              >
                Buy Now {buyNowPrice} STX
              </button>
            )}
          </div>
        </div>
      )}

      {/* Bid History */}
      {bidHistory.length > 0 && (
        <div className="border-t border-gray-800">
          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="w-full px-4 py-3 flex items-center justify-between text-gray-400 hover:text-white transition-colors"
          >
            <span className="font-medium">Bid History ({bidHistory.length})</span>
            <svg 
              className={`w-5 h-5 transition-transform ${showHistory ? 'rotate-180' : ''}`}
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showHistory && (
            <div className="px-4 pb-4 space-y-2 max-h-64 overflow-y-auto">
              {bidHistory.map((bid) => (
                <div
                  key={bid.id}
                  className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl"
                >
                  {bid.bidder.avatar ? (
                    <img
                      src={bid.bidder.avatar}
                      alt={bid.bidder.displayName || bid.bidder.address}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {bid.bidder.displayName || `${bid.bidder.address.slice(0, 6)}...${bid.bidder.address.slice(-4)}`}
                    </p>
                    <p className="text-xs text-gray-500">
                      {bid.timestamp.toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-white">{bid.amount.toFixed(2)} STX</p>
                    {bid.status !== 'active' && (
                      <span className={`
                        text-xs font-medium
                        ${bid.status === 'accepted' ? 'text-green-400' : ''}
                        ${bid.status === 'outbid' ? 'text-yellow-400' : ''}
                        ${bid.status === 'cancelled' ? 'text-red-400' : ''}
                      `}>
                        {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * QuickBid - simplified inline bid component
 */
interface QuickBidProps {
  currentBid: number;
  minBid: number;
  onBid: (amount: number) => void;
  className?: string;
}

export function QuickBid({
  currentBid,
  minBid,
  onBid,
  className = '',
}: QuickBidProps) {
  const quickAmounts = [minBid, minBid * 1.1, minBid * 1.25, minBid * 1.5];

  return (
    <div className={`space-y-2 ${className}`}>
      <p className="text-xs text-gray-500">
        Current: <span className="text-white font-medium">{currentBid.toFixed(2)} STX</span>
      </p>
      <div className="flex gap-2">
        {quickAmounts.map((amount, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onBid(amount)}
            className="flex-1 py-2 px-3 bg-gray-800 rounded-lg text-sm text-gray-300 hover:bg-purple-600 hover:text-white transition-colors"
          >
            {amount.toFixed(2)}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * OfferCard - make/view offers
 */
interface Offer {
  id: string;
  from: {
    address: string;
    displayName?: string;
    avatar?: string;
  };
  amount: number;
  expiresAt: Date;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
}

interface OfferCardProps {
  offer: Offer;
  isOwner?: boolean;
  onAccept?: () => void;
  onReject?: () => void;
  onCounter?: (amount: number) => void;
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
  const isExpired = new Date() > offer.expiresAt;
  const shortAddress = `${offer.from.address.slice(0, 6)}...${offer.from.address.slice(-4)}`;

  const statusColors = {
    pending: 'bg-yellow-600/20 text-yellow-400',
    accepted: 'bg-green-600/20 text-green-400',
    rejected: 'bg-red-600/20 text-red-400',
    expired: 'bg-gray-600/20 text-gray-400',
  };

  return (
    <div className={`p-4 bg-gray-900/50 rounded-xl border border-gray-800 ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {offer.from.avatar ? (
            <img
              src={offer.from.avatar}
              alt={offer.from.displayName || shortAddress}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
          )}
          <div>
            <p className="font-medium text-white">
              {offer.from.displayName || shortAddress}
            </p>
            <p className="text-sm text-gray-400">
              Expires {offer.expiresAt.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-xl font-bold text-white">{offer.amount.toFixed(2)} STX</p>
          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[isExpired ? 'expired' : offer.status]}`}>
            {isExpired ? 'Expired' : offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
          </span>
        </div>
      </div>

      {isOwner && offer.status === 'pending' && !isExpired && (
        <div className="flex gap-2 mt-4">
          <button
            type="button"
            onClick={onAccept}
            className="flex-1 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-500 transition-colors"
          >
            Accept
          </button>
          <button
            type="button"
            onClick={onReject}
            className="flex-1 py-2 bg-red-600/20 text-red-400 rounded-lg font-medium hover:bg-red-600/30 transition-colors"
          >
            Decline
          </button>
          {onCounter && (
            <button
              type="button"
              onClick={() => onCounter(offer.amount * 1.2)}
              className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              Counter
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default memo(BidCardComponent);
