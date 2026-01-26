'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { fetchSTXBalance } from '@/lib/api';

export default function WalletBalance() {
  const { address, isConnected } = useWallet();
  const [balance, setBalance] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [priceChange] = useState(2.34); // Mock price change percentage

  useEffect(() => {
    if (address) {
      setIsLoading(true);
      fetchSTXBalance(address)
        .then((data) => {
          const stx = parseInt(data.balance) / 1000000;
          setBalance(stx.toFixed(4));
        })
        .finally(() => setIsLoading(false));
    }
  }, [address]);

  if (!isConnected) {
    return (
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
        <div className="flex items-center justify-center gap-3 text-gray-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>Connect wallet to view balance</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden hover:border-purple-500/30 transition-all duration-300">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-700/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h3 className="font-semibold text-white">Wallet Balance</h3>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
        >
          <svg className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${showDetails ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Balance Display */}
      <div className="p-6">
        <div className="text-center mb-4">
          <p className="text-gray-400 text-sm mb-2">Total Balance</p>
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-gray-400">Loading...</span>
            </div>
          ) : (
            <>
              <p className="text-4xl font-bold text-white mb-1">
                {balance || '0.0000'} <span className="text-purple-400 text-2xl">STX</span>
              </p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-gray-400 text-sm">≈ ${(parseFloat(balance || '0') * 0.45).toFixed(2)} USD</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${priceChange >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {priceChange >= 0 ? '+' : ''}{priceChange}%
                </span>
              </div>
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          <button className="flex flex-col items-center gap-2 p-3 bg-gray-800/50 hover:bg-purple-600/20 rounded-xl transition-colors group">
            <div className="w-10 h-10 bg-purple-600/20 group-hover:bg-purple-600 rounded-full flex items-center justify-center transition-colors">
              <svg className="w-5 h-5 text-purple-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
            </div>
            <span className="text-xs text-gray-400 group-hover:text-white transition-colors">Send</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-3 bg-gray-800/50 hover:bg-purple-600/20 rounded-xl transition-colors group">
            <div className="w-10 h-10 bg-purple-600/20 group-hover:bg-purple-600 rounded-full flex items-center justify-center transition-colors">
              <svg className="w-5 h-5 text-purple-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
              </svg>
            </div>
            <span className="text-xs text-gray-400 group-hover:text-white transition-colors">Receive</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-3 bg-gray-800/50 hover:bg-purple-600/20 rounded-xl transition-colors group">
            <div className="w-10 h-10 bg-purple-600/20 group-hover:bg-purple-600 rounded-full flex items-center justify-center transition-colors">
              <svg className="w-5 h-5 text-purple-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <span className="text-xs text-gray-400 group-hover:text-white transition-colors">Swap</span>
          </button>
        </div>

        {/* Expanded Details */}
        {showDetails && (
          <div className="mt-6 pt-6 border-t border-gray-700/50 space-y-3 animate-fade-in">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Available</span>
              <span className="text-white font-medium">{balance || '0.0000'} STX</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Staked</span>
              <span className="text-white font-medium">0.0000 STX</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Pending</span>
              <span className="text-white font-medium">0.0000 STX</span>
            </div>
            <div className="mt-4 p-3 bg-purple-500/10 rounded-lg">
              <p className="text-purple-400 text-xs flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Stake STX to earn Bitcoin rewards
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Address Footer */}
      <div className="px-6 py-3 bg-gray-900/50 border-t border-gray-700/50">
        <div className="flex items-center justify-between">
          <span className="text-gray-500 text-xs font-mono truncate max-w-[200px]">{address}</span>
          <button
            onClick={() => navigator.clipboard.writeText(address || '')}
            className="p-1.5 hover:bg-gray-700/50 rounded-lg transition-colors"
            title="Copy address"
          >
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
