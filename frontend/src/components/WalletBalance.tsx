'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { fetchSTXBalance } from '@/lib/api';

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
