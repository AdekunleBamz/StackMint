'use client';

/**
 * WalletBalance Component
 * Displays the connected wallet's STX balance with real-time updates
 * @module WalletBalance
 * @version 2.2.0
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

  useEffect(() => {
    if (address) {
      fetchSTXBalance(address).then((data) => {
        const stx = parseInt(data.balance) / 1000000;
        setBalance(stx.toFixed(4));
      });
    }
  }, [address]);

  if (!isConnected) return null;

  return (
    <div className="bg-gray-900/50 border border-purple-500/20 rounded-xl p-4 text-center">
      <p className="text-gray-400 text-sm">Your Balance</p>
      <p className="text-2xl font-bold text-white">{balance || '...'} <span className="text-purple-500">STX</span></p>
    </div>
  );
}
