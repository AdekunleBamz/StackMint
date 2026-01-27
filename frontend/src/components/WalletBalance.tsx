'use client';

/**
 * WalletBalance Component
 * Displays the connected wallet's STX balance with real-time updates
 * @module WalletBalance
 * @version 2.3.0
 */

import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { fetchSTXBalance } from '@/lib/api';

// Balance display configuration
const MICROSTX_DIVISOR = 1_000_000;
const BALANCE_DECIMALS = 4;
const LOADING_PLACEHOLDER = '...';

/** Auto-refresh interval in milliseconds */
const REFRESH_INTERVAL = 30000;

/** Animation duration for balance updates */
const UPDATE_ANIMATION_DURATION = 300;

/**
 * Balance display state
 */
type BalanceState = 'idle' | 'loading' | 'success' | 'error';

export default function WalletBalance() {
  const { address, isConnected } = useWallet();
  const [balance, setBalance] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchBalance = useCallback(async () => {
    if (!address) return;
    
    try {
      setIsRefreshing(true);
      const data = await fetchSTXBalance(address);
      const stx = parseInt(data.balance) / 1000000;
      setBalance(stx.toFixed(4));
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [address]);

  useEffect(() => {
    if (address) {
      fetchBalance();
      
      // Auto-refresh every 30 seconds
      const interval = setInterval(fetchBalance, REFRESH_INTERVAL);
      return () => clearInterval(interval);
    }
  }, [address, fetchBalance]);

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
  };

  if (!isConnected) return null;

  // Mock USD value (in real app, fetch from API)
  const usdValue = balance ? (parseFloat(balance) * 0.42).toFixed(2) : '0.00';

  return (
    <div className="bg-gradient-to-br from-gray-900/90 to-gray-900/70 border border-purple-500/20 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute -top-12 -right-12 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-sm">💰</span>
            </div>
            <span className="text-gray-300 font-medium">Wallet Balance</span>
          </div>
          <button 
            onClick={fetchBalance}
            disabled={isRefreshing}
            className="p-2 text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-all disabled:opacity-50"
            title="Refresh balance"
          >
            <svg 
              className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
        
        {/* Balance Display */}
        <div className="text-center py-4">
          {isLoading ? (
            <div className="animate-pulse">
              <div className="h-10 w-32 bg-gray-700 rounded-lg mx-auto mb-2" />
              <div className="h-4 w-20 bg-gray-700 rounded mx-auto" />
            </div>
          ) : (
            <>
              <p className={`text-4xl font-bold text-white transition-all ${isRefreshing ? 'opacity-50' : ''}`}>
                {balance || '0.0000'} 
                <span className="text-2xl text-purple-400 ml-1">STX</span>
              </p>
              <p className="text-gray-500 text-sm mt-1">
                ≈ ${usdValue} USD
              </p>
            </>
          )}
        </div>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <button className="flex items-center justify-center gap-2 py-3 bg-purple-600/20 hover:bg-purple-600 text-purple-400 hover:text-white rounded-xl font-medium transition-all">
            <span>↗️</span>
            <span className="text-sm">Send</span>
          </button>
          <button className="flex items-center justify-center gap-2 py-3 bg-gray-700/50 hover:bg-gray-600 text-gray-300 hover:text-white rounded-xl font-medium transition-all">
            <span>↙️</span>
            <span className="text-sm">Receive</span>
          </button>
        </div>
        
        {/* Last Updated */}
        {lastUpdated && (
          <p className="text-center text-xs text-gray-500 mt-4">
            Last updated {formatTimeAgo(lastUpdated)}
          </p>
        )}
      </div>
    </div>
  );
}
