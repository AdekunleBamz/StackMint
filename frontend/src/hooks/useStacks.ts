'use client';

/**
 * useStacks Hook
 * Stacks blockchain interaction hooks
 * @module hooks/useStacks
 * @version 1.0.0
 */

import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@/context/WalletContext';

// Types
interface Transaction {
  txId: string;
  status: 'pending' | 'success' | 'failed' | 'dropped';
  type: 'contract_call' | 'token_transfer' | 'smart_contract' | 'coinbase';
  sender: string;
  timestamp: Date;
  fee: number;
  blockHeight?: number;
}

interface AccountBalance {
  stx: number;
  stxLocked: number;
  fungibleTokens: Record<string, { balance: number; decimals: number }>;
  nonFungibleTokens: Record<string, { count: number }>;
}

/**
 * Hook for fetching and tracking account balance
 */
export function useAccountBalance(address?: string) {
  const { address: walletAddress } = useWallet();
  const targetAddress = address || walletAddress;
  
  const [balance, setBalance] = useState<AccountBalance | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchBalance = useCallback(async () => {
    if (!targetAddress) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api.mainnet.hiro.so/extended/v1/address/${targetAddress}/balances`
      );
      
      if (!response.ok) throw new Error('Failed to fetch balance');
      
      const data = await response.json();
      
      setBalance({
        stx: parseInt(data.stx.balance) / 1000000,
        stxLocked: parseInt(data.stx.locked) / 1000000,
        fungibleTokens: Object.entries(data.fungible_tokens || {}).reduce(
          (acc, [key, value]: [string, any]) => ({
            ...acc,
            [key]: {
              balance: parseInt(value.balance),
              decimals: value.decimals || 0,
            },
          }),
          {}
        ),
        nonFungibleTokens: Object.entries(data.non_fungible_tokens || {}).reduce(
          (acc, [key, value]: [string, any]) => ({
            ...acc,
            [key]: { count: parseInt(value.count) },
          }),
          {}
        ),
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [targetAddress]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!targetAddress) return;
    
    const interval = setInterval(fetchBalance, 30000);
    return () => clearInterval(interval);
  }, [targetAddress, fetchBalance]);

  return {
    balance,
    isLoading,
    error,
    refetch: fetchBalance,
  };
}

/**
 * Hook for tracking transaction status
 */
export function useTransactionStatus(txId: string) {
  const [status, setStatus] = useState<Transaction['status']>('pending');
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const checkStatus = useCallback(async () => {
    if (!txId) return;

    try {
      const response = await fetch(
        `https://api.mainnet.hiro.so/extended/v1/tx/${txId}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch transaction');
      
      const data = await response.json();
      
      const txStatus: Transaction['status'] = 
        data.tx_status === 'success' ? 'success' :
        data.tx_status === 'abort_by_response' || data.tx_status === 'abort_by_post_condition' ? 'failed' :
        data.tx_status === 'dropped_replace_by_fee' || data.tx_status === 'dropped_stale_garbage_collect' ? 'dropped' :
        'pending';

      setStatus(txStatus);
      setTransaction({
        txId: data.tx_id,
        status: txStatus,
        type: data.tx_type,
        sender: data.sender_address,
        timestamp: new Date(data.burn_block_time_iso || data.receipt_time_iso),
        fee: parseInt(data.fee_rate) / 1000000,
        blockHeight: data.block_height,
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [txId]);

  useEffect(() => {
    checkStatus();
    
    // Poll for pending transactions
    if (status === 'pending') {
      const interval = setInterval(checkStatus, 10000);
      return () => clearInterval(interval);
    }
  }, [txId, status, checkStatus]);

  return {
    status,
    transaction,
    isLoading,
    error,
    isPending: status === 'pending',
    isSuccess: status === 'success',
    isFailed: status === 'failed' || status === 'dropped',
    refetch: checkStatus,
  };
}

/**
 * Hook for fetching address transactions
 */
export function useTransactionHistory(address?: string, options?: {
  limit?: number;
  offset?: number;
}) {
  const { address: walletAddress } = useWallet();
  const targetAddress = address || walletAddress;
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const { limit = 20, offset = 0 } = options || {};

  const fetchTransactions = useCallback(async (page = 0) => {
    if (!targetAddress) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api.mainnet.hiro.so/extended/v1/address/${targetAddress}/transactions?limit=${limit}&offset=${page * limit}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch transactions');
      
      const data = await response.json();
      
      const txs: Transaction[] = data.results.map((tx: any) => ({
        txId: tx.tx_id,
        status: tx.tx_status === 'success' ? 'success' : 
                tx.tx_status === 'pending' ? 'pending' : 'failed',
        type: tx.tx_type,
        sender: tx.sender_address,
        timestamp: new Date(tx.burn_block_time_iso || tx.receipt_time_iso),
        fee: parseInt(tx.fee_rate) / 1000000,
        blockHeight: tx.block_height,
      }));

      if (page === 0) {
        setTransactions(txs);
      } else {
        setTransactions((prev) => [...prev, ...txs]);
      }

      setHasMore(txs.length === limit);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [targetAddress, limit]);

  useEffect(() => {
    fetchTransactions(0);
  }, [targetAddress]);

  const loadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      const nextPage = Math.floor(transactions.length / limit);
      fetchTransactions(nextPage);
    }
  }, [hasMore, isLoading, transactions.length, limit, fetchTransactions]);

  return {
    transactions,
    isLoading,
    error,
    hasMore,
    loadMore,
    refetch: () => fetchTransactions(0),
  };
}

/**
 * Hook for getting current network info
 */
export function useNetworkInfo() {
  const [info, setInfo] = useState<{
    network: 'mainnet' | 'testnet';
    chainId: number;
    peerCount: number;
    burnBlockHeight: number;
    stxBlockHeight: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const response = await fetch('https://api.mainnet.hiro.so/extended/v1/info');
        if (!response.ok) return;
        
        const data = await response.json();
        
        setInfo({
          network: data.network_id === 1 ? 'mainnet' : 'testnet',
          chainId: data.network_id,
          peerCount: data.peer_count,
          burnBlockHeight: data.burn_block_height,
          stxBlockHeight: data.stacks_tip_height,
        });
      } catch {
        // Silently fail
      } finally {
        setIsLoading(false);
      }
    };

    fetchInfo();
  }, []);

  return { info, isLoading };
}

/**
 * Hook for STX price in USD
 */
export function useSTXPrice() {
  const [price, setPrice] = useState<number | null>(null);
  const [change24h, setChange24h] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        // Use CoinGecko API for price
        const response = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=blockstack&vs_currencies=usd&include_24hr_change=true'
        );
        
        if (!response.ok) return;
        
        const data = await response.json();
        
        setPrice(data.blockstack.usd);
        setChange24h(data.blockstack.usd_24h_change);
      } catch {
        // Silently fail
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrice();
    
    // Refresh price every 5 minutes
    const interval = setInterval(fetchPrice, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const formatUSD = useCallback((stxAmount: number) => {
    if (!price) return null;
    return (stxAmount * price).toFixed(2);
  }, [price]);

  return {
    price,
    change24h,
    isLoading,
    formatUSD,
  };
}

export default useAccountBalance;
