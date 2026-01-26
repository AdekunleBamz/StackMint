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

const txTypeIcons: Record<string, JSX.Element> = {
  token_transfer: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  ),
  contract_call: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  ),
  smart_contract: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
};

const txTypeLabels: Record<string, string> = {
  token_transfer: 'Transfer',
  contract_call: 'Contract Call',
  smart_contract: 'Deploy',
  coinbase: 'Coinbase',
};

export default function TransactionHistory() {
  const { address, isConnected } = useWallet();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'success' | 'pending'>('all');

  useEffect(() => {
    if (address) {
      setLoading(true);
      fetchTransactions(address).then((data) => {
        setTransactions(data.results?.slice(0, 10) || []);
        setLoading(false);
      });
    }
  }, [address]);

  const filteredTxs = transactions.filter((tx) => {
    if (filter === 'all') return true;
    if (filter === 'success') return tx.tx_status === 'success';
    if (filter === 'pending') return tx.tx_status === 'pending';
    return true;
  });

  if (!isConnected) {
    return (
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
        <div className="flex items-center justify-center gap-3 text-gray-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span>Connect wallet to view transactions</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden hover:border-purple-500/30 transition-all duration-300">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-700/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="font-semibold text-white">Transaction History</h3>
        </div>
        <a
          href={`https://explorer.stacks.co/address/${address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-purple-400 text-sm hover:text-purple-300 transition-colors flex items-center gap-1"
        >
          View All
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>

      {/* Filter Tabs */}
      <div className="px-6 py-3 border-b border-gray-700/50 flex gap-2">
        {(['all', 'success', 'pending'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              filter === f
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800/50 text-gray-400 hover:text-white'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Transaction List */}
      <div className="p-4 max-h-80 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8 gap-3">
            <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-400">Loading transactions...</span>
          </div>
        ) : filteredTxs.length === 0 ? (
          <div className="text-center py-8">
            <svg className="w-12 h-12 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-gray-400">No transactions found</p>
            <p className="text-gray-500 text-sm mt-1">Transactions will appear here</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTxs.map((tx, index) => (
              <a
                key={tx.tx_id}
                href={`https://explorer.stacks.co/txid/${tx.tx_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-3 bg-gray-800/30 hover:bg-gray-800/50 rounded-xl transition-all duration-200 group"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Icon */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  tx.tx_status === 'success' ? 'bg-green-500/20 text-green-400' :
                  tx.tx_status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {txTypeIcons[tx.tx_type] || (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{txTypeLabels[tx.tx_type] || tx.tx_type}</span>
                    {tx.tx_status === 'pending' && (
                      <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                    )}
                  </div>
                  <p className="text-gray-500 text-xs font-mono truncate">{tx.tx_id}</p>
                </div>

                {/* Status & Block */}
                <div className="text-right">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    tx.tx_status === 'success' ? 'bg-green-500/20 text-green-400' :
                    tx.tx_status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {tx.tx_status}
                  </span>
                  <p className="text-gray-500 text-xs mt-1">Block #{tx.block_height}</p>
                </div>

                {/* Arrow */}
                <svg className="w-5 h-5 text-gray-600 group-hover:text-purple-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
