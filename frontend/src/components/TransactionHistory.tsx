'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { fetchTransactions } from '@/lib/api';

interface Transaction {
  tx_id: string;
  tx_type: string;
  tx_status: string;
  block_height: number;
}

export default function TransactionHistory() {
  const { address, isConnected } = useWallet();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (address) {
      setLoading(true);
      fetchTransactions(address).then((data) => {
        setTransactions(data.results?.slice(0, 5) || []);
        setLoading(false);
      });
    }
  }, [address]);

  if (!isConnected) return null;

  return (
    <div className="bg-gray-900/50 border border-purple-500/20 rounded-xl p-4">
      <h4 className="font-bold text-white mb-4">Recent Transactions</h4>
      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : transactions.length === 0 ? (
        <p className="text-gray-400">No transactions yet</p>
      ) : (
        <div className="space-y-2">
          {transactions.map((tx) => (
            <div key={tx.tx_id} className="flex justify-between text-sm">
              <span className="text-gray-400">{tx.tx_id.slice(0, 12)}...</span>
              <span className={tx.tx_status === 'success' ? 'text-green-500' : 'text-yellow-500'}>
                {tx.tx_status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
