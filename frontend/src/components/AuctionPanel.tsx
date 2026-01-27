'use client';

/**
 * AuctionPanel Component
 * Complete auction interface for NFT bidding
 * @module components/AuctionPanel
 * @version 1.0.0
 */

import { useState, useEffect } from 'react';

interface Bid {
  id: string;
  amount: number;
  bidder: string;
  bidderAvatar?: string;
  bidderName?: string;
  timestamp: Date;
  status: 'active' | 'outbid' | 'winning' | 'won' | 'lost';
}

interface AuctionPanelProps {
  tokenId: string;
  currentBid: number;
  minBidIncrement?: number;
  reservePrice?: number;
  buyNowPrice?: number;
  endTime: Date;
  bidHistory: Bid[];
  isOwner?: boolean;
  userAddress?: string;
  onPlaceBid: (amount: number) => Promise<void>;
  onBuyNow?: () => Promise<void>;
  className?: string;
}

export function AuctionPanel({
  tokenId,
  currentBid,
  minBidIncrement = 0.1,
  reservePrice,
  buyNowPrice,
  endTime,
  bidHistory,
  isOwner = false,
  userAddress,
  onPlaceBid,
  onBuyNow,
  className = '',
}: AuctionPanelProps) {
  const [bidAmount, setBidAmount] = useState('');
  const [isPlacingBid, setIsPlacingBid] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isEnded: false,
  });

  const minimumBid = currentBid + minBidIncrement;
  const isUserWinning = bidHistory[0]?.bidder === userAddress;
  const reserveMet = !reservePrice || currentBid >= reservePrice;

  // Countdown timer
  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = endTime.getTime() - Date.now();
      
      if (difference <= 0) {
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isEnded: true,
        };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isEnded: false,
      };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  const handlePlaceBid = async () => {
    setError('');
    const amount = parseFloat(bidAmount);

    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid bid amount');
      return;
    }
    if (amount < minimumBid) {
      setError(`Minimum bid is ${minimumBid.toFixed(2)} STX`);
      return;
    }

    setIsPlacingBid(true);
    try {
      await onPlaceBid(amount);
      setBidAmount('');
    } catch (err) {
      setError('Failed to place bid');
    } finally {
      setIsPlacingBid(false);
    }
  };

  const handleBuyNow = async () => {
    if (!onBuyNow) return;
    setIsBuyingNow(true);
    try {
      await onBuyNow();
    } catch (err) {
      setError('Failed to complete purchase');
    } finally {
      setIsBuyingNow(false);
    }
  };

  return (
    <div className={`bg-gray-800/50 rounded-2xl border border-gray-700 overflow-hidden ${className}`}>
      {/* Timer header */}
      <div className={`p-4 ${timeLeft.isEnded ? 'bg-gray-700' : 'bg-gradient-to-r from-primary-500/20 to-secondary-500/20'}`}>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">
            {timeLeft.isEnded ? 'Auction Ended' : 'Auction Ends In'}
          </span>
          {isUserWinning && !timeLeft.isEnded && (
            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
              You're Winning!
            </span>
          )}
        </div>

        {!timeLeft.isEnded && (
          <div className="flex gap-3 mt-3">
            {[
              { value: timeLeft.days, label: 'Days' },
              { value: timeLeft.hours, label: 'Hours' },
              { value: timeLeft.minutes, label: 'Mins' },
              { value: timeLeft.seconds, label: 'Secs' },
            ].map((unit, i) => (
              <div key={i} className="flex-1 text-center">
                <div className="bg-gray-900 rounded-lg py-2">
                  <span className="text-2xl font-bold text-white font-mono">
                    {String(unit.value).padStart(2, '0')}
                  </span>
                </div>
                <span className="text-xs text-gray-500 mt-1">{unit.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Current bid */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Current Bid</p>
            <p className="text-3xl font-bold text-white">
              {currentBid.toFixed(2)} <span className="text-lg text-primary-400">STX</span>
            </p>
          </div>

          {reservePrice && (
            <div className={`
              px-3 py-1 rounded-full text-xs font-medium
              ${reserveMet 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-yellow-500/20 text-yellow-400'
              }
            `}>
              {reserveMet ? '✓ Reserve Met' : `Reserve: ${reservePrice} STX`}
            </div>
          )}
        </div>

        {bidHistory.length > 0 && (
          <div className="flex items-center gap-2 mt-3 text-sm text-gray-400">
            <span>{bidHistory.length} bid{bidHistory.length !== 1 ? 's' : ''}</span>
            <span>•</span>
            <span>
              Top bidder: {bidHistory[0].bidderName || `${bidHistory[0].bidder.slice(0, 6)}...`}
            </span>
          </div>
        )}
      </div>

      {/* Bid input */}
      {!timeLeft.isEnded && !isOwner && (
        <div className="p-4 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-gray-400">Your Bid</label>
              <span className="text-xs text-gray-500">
                Minimum: {minimumBid.toFixed(2)} STX
              </span>
            </div>
            <div className="relative">
              <input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                placeholder={minimumBid.toFixed(2)}
                step="0.01"
                min={minimumBid}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 pr-16 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                STX
              </span>
            </div>
          </div>

          {/* Quick bid buttons */}
          <div className="flex gap-2">
            {[minimumBid, minimumBid * 1.5, minimumBid * 2].map((amount) => (
              <button
                key={amount}
                onClick={() => setBidAmount(amount.toFixed(2))}
                className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
              >
                {amount.toFixed(1)} STX
              </button>
            ))}
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            onClick={handlePlaceBid}
            disabled={isPlacingBid || !bidAmount}
            className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors"
          >
            {isPlacingBid ? 'Placing Bid...' : 'Place Bid'}
          </button>

          {/* Buy now option */}
          {buyNowPrice && onBuyNow && (
            <div className="pt-4 border-t border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-400">Buy Now Price</span>
                <span className="text-lg font-bold text-white">{buyNowPrice} STX</span>
              </div>
              <button
                onClick={handleBuyNow}
                disabled={isBuyingNow}
                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-700 text-white font-medium py-3 rounded-lg transition-colors"
              >
                {isBuyingNow ? 'Processing...' : 'Buy Now'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Bid history */}
      {bidHistory.length > 0 && (
        <div className="border-t border-gray-700">
          <button
            className="w-full p-4 text-left"
            onClick={() => {}}
          >
            <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
              Bid History
            </h4>
          </button>

          <div className="px-4 pb-4 space-y-2 max-h-48 overflow-y-auto">
            {bidHistory.slice(0, 5).map((bid, index) => (
              <div
                key={bid.id}
                className="flex items-center justify-between py-2 border-b border-gray-700/50 last:border-0"
              >
                <div className="flex items-center gap-3">
                  {bid.bidderAvatar ? (
                    <img
                      src={bid.bidderAvatar}
                      alt={bid.bidderName || 'Bidder'}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {(bid.bidderName || bid.bidder).charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-white">
                      {bid.bidderName || `${bid.bidder.slice(0, 6)}...${bid.bidder.slice(-4)}`}
                      {index === 0 && (
                        <span className="ml-2 text-xs text-green-400">Highest</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500">
                      {bid.timestamp.toLocaleString()}
                    </p>
                  </div>
                </div>
                <span className="font-medium text-primary-400">{bid.amount.toFixed(2)} STX</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default AuctionPanel;
