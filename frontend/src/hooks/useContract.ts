'use client';

/**
 * useContract Hook
 * Handles smart contract interactions and transaction state
 * @module useContract
 * @version 2.1.0
 */

import { useState, useCallback, useMemo } from 'react';
import { openContractCall } from '@stacks/connect';
import { mintNFT, createCollection } from '@/lib/contracts';

// Transaction status types
type TransactionStatus = 'idle' | 'pending' | 'confirming' | 'success' | 'error';

// Confirmation thresholds
const REQUIRED_CONFIRMATIONS = 1;
const MAX_CONFIRMATIONS_TO_TRACK = 6;

interface TransactionState {
  status: TransactionStatus;
  txId: string | null;
  error: string | null;
  confirmations: number;
}

interface ContractCallOptions {
  onSuccess?: (txId: string) => void;
  onError?: (error: Error) => void;
  onPending?: () => void;
}

interface UseContractReturn {
  // State
  loading: boolean;
  error: string | null;
  txId: string | null;
  status: TransactionStatus;
  confirmations: number;
  
  // Computed
  isIdle: boolean;
  isPending: boolean;
  isConfirming: boolean;
  isSuccess: boolean;
  isError: boolean;
  explorerUrl: string | null;
  
  // Actions
  mint: (uri: string, options?: ContractCallOptions) => Promise<string | null>;
  create: (name: string, maxSupply: number, options?: ContractCallOptions) => Promise<string | null>;
  reset: () => void;
  clearError: () => void;
}

const INITIAL_STATE: TransactionState = {
  status: 'idle',
  txId: null,
  error: null,
  confirmations: 0,
};

// Explorer URL configuration
const EXPLORER_BASE_URL = 'https://explorer.stacks.co';
const buildExplorerUrl = (txId: string) => `${EXPLORER_BASE_URL}/txid/${txId}`;

export function useContract(): UseContractReturn {
  const [state, setState] = useState<TransactionState>(INITIAL_STATE);

  // Computed values
  const isIdle = state.status === 'idle';
  const isPending = state.status === 'pending';
  const isConfirming = state.status === 'confirming';
  const isSuccess = state.status === 'success';
  const isError = state.status === 'error';
  const loading = isPending || isConfirming;

  const explorerUrl = useMemo(() => {
    if (!state.txId) return null;
    return `https://explorer.stacks.co/txid/${state.txId}`;
  }, [state.txId]);

  const executeContractCall = useCallback(async (
    getOptions: () => Promise<object>,
    callbacks?: ContractCallOptions
  ): Promise<string | null> => {
    setState({
      status: 'pending',
      txId: null,
      error: null,
      confirmations: 0,
    });
    callbacks?.onPending?.();

    try {
      const txOptions = await getOptions();
      
      return new Promise((resolve, reject) => {
        openContractCall({
          ...txOptions,
          onFinish: (data: { txId: string }) => {
            const txId = data.txId;
            setState(prev => ({
              ...prev,
              status: 'confirming',
              txId,
            }));
            
            // Simulate confirmation tracking (in production, you'd poll the API)
            setTimeout(() => {
              setState(prev => ({
                ...prev,
                status: 'success',
                confirmations: 1,
              }));
              callbacks?.onSuccess?.(txId);
              resolve(txId);
            }, 2000);
          },
          onCancel: () => {
            setState(prev => ({
              ...prev,
              status: 'idle',
              error: 'Transaction cancelled by user',
            }));
            resolve(null);
          },
        } as any);
      });
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
      setState({
        status: 'error',
        txId: null,
        error: errorMessage,
        confirmations: 0,
      });
      callbacks?.onError?.(e instanceof Error ? e : new Error(errorMessage));
      return null;
    }
  }, []);

  const mint = useCallback(async (uri: string, options?: ContractCallOptions): Promise<string | null> => {
    // Validate URI
    if (!uri || uri.trim().length === 0) {
      setState(prev => ({
        ...prev,
        status: 'error',
        error: 'Token URI is required',
      }));
      return null;
    }

    // Basic URI validation
    try {
      new URL(uri);
    } catch {
      setState(prev => ({
        ...prev,
        status: 'error',
        error: 'Invalid token URI format',
      }));
      return null;
    }

    return executeContractCall(() => mintNFT(uri), options);
  }, [executeContractCall]);

  const create = useCallback(async (
    name: string, 
    maxSupply: number, 
    options?: ContractCallOptions
  ): Promise<string | null> => {
    // Validate inputs
    if (!name || name.trim().length === 0) {
      setState(prev => ({
        ...prev,
        status: 'error',
        error: 'Collection name is required',
      }));
      return null;
    }

    if (name.length > 50) {
      setState(prev => ({
        ...prev,
        status: 'error',
        error: 'Collection name must be 50 characters or less',
      }));
      return null;
    }

    if (maxSupply <= 0) {
      setState(prev => ({
        ...prev,
        status: 'error',
        error: 'Max supply must be greater than 0',
      }));
      return null;
    }

    if (maxSupply > 100000) {
      setState(prev => ({
        ...prev,
        status: 'error',
        error: 'Max supply cannot exceed 100,000',
      }));
      return null;
    }

    return executeContractCall(() => createCollection(name, maxSupply), options);
  }, [executeContractCall]);

  const reset = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    // State
    loading,
    error: state.error,
    txId: state.txId,
    status: state.status,
    confirmations: state.confirmations,
    
    // Computed
    isIdle,
    isPending,
    isConfirming,
    isSuccess,
    isError,
    explorerUrl,
    
    // Actions
    mint,
    create,
    reset,
    clearError,
  };
}
