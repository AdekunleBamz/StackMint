'use client';

/**
 * TransactionStatus Component
 * Real-time transaction status tracking with progress indicator
 * @module components/TransactionStatus
 * @version 1.0.0
 */

import { useState, useEffect, useCallback } from 'react';

/** Transaction status types */
type TxStatus = 'pending' | 'broadcasting' | 'confirming' | 'success' | 'failed';

/** Polling interval in milliseconds */
const POLL_INTERVAL = 3000;

/** Maximum polling attempts before timeout */
const MAX_POLL_ATTEMPTS = 60;

interface TransactionStatusProps {
  /** Transaction ID to track */
  txId: string;
  /** Callback when transaction confirms */
  onConfirm?: (txId: string) => void;
  /** Callback when transaction fails */
  onFail?: (error: string) => void;
  /** Show detailed info */
  showDetails?: boolean;
  /** Compact mode */
  compact?: boolean;
  /** Custom className */
  className?: string;
  /** Auto-dismiss after success (ms) */
  autoDismiss?: number;
  /** Callback when dismissed */
  onDismiss?: () => void;
}

const statusConfig: Record<TxStatus, {
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  pulse: boolean;
}> = {
  pending: {
    label: 'Pending',
    icon: '⏳',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    pulse: true,
  },
  broadcasting: {
    label: 'Broadcasting',
    icon: '📡',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    pulse: true,
  },
  confirming: {
    label: 'Confirming',
    icon: '⚡',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    pulse: true,
  },
  success: {
    label: 'Confirmed',
    icon: '✓',
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    pulse: false,
  },
  failed: {
    label: 'Failed',
    icon: '✕',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    pulse: false,
  },
};

export default function TransactionStatus({
  txId,
  onConfirm,
  onFail,
  showDetails = true,
  compact = false,
  className = '',
  autoDismiss,
  onDismiss,
}: TransactionStatusProps) {
  const [status, setStatus] = useState<TxStatus>('broadcasting');
  const [confirmations, setConfirmations] = useState(0);
  const [blockHeight, setBlockHeight] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);

  // Truncate txId for display
  const truncatedTxId = `${txId.slice(0, 8)}...${txId.slice(-8)}`;

  // Poll transaction status
  const checkStatus = useCallback(async () => {
    try {
      const response = await fetch(`https://api.mainnet.hiro.so/extended/v1/tx/${txId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          // Transaction not yet indexed
          setStatus('broadcasting');
          return false;
        }
        throw new Error('Failed to fetch transaction');
      }

      const data = await response.json();

      if (data.tx_status === 'pending') {
        setStatus('confirming');
        return false;
      } else if (data.tx_status === 'success') {
        setStatus('success');
        setBlockHeight(data.block_height);
        setConfirmations(1);
        onConfirm?.(txId);
        return true;
      } else if (data.tx_status === 'abort_by_response' || data.tx_status === 'abort_by_post_condition') {
        setStatus('failed');
        setError(data.tx_result?.repr || 'Transaction aborted');
        onFail?.(data.tx_result?.repr || 'Transaction aborted');
        return true;
      }

      return false;
    } catch (err) {
      console.error('Error checking tx status:', err);
      return false;
    }
  }, [txId, onConfirm, onFail]);

  // Start polling
  useEffect(() => {
    let interval: NodeJS.Timeout;
    let isMounted = true;

    const poll = async () => {
      if (!isMounted) return;
      
      const isComplete = await checkStatus();
      setAttempts((prev) => prev + 1);

      if (isComplete || attempts >= MAX_POLL_ATTEMPTS) {
        clearInterval(interval);
        if (attempts >= MAX_POLL_ATTEMPTS && !isComplete) {
          setStatus('failed');
          setError('Transaction timeout - please check explorer');
          onFail?.('Transaction timeout');
        }
      }
    };

    poll();
    interval = setInterval(poll, POLL_INTERVAL);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [checkStatus, attempts, onFail]);

  // Auto-dismiss after success
  useEffect(() => {
    if (status === 'success' && autoDismiss) {
      const timeout = setTimeout(() => {
        onDismiss?.();
      }, autoDismiss);
      return () => clearTimeout(timeout);
    }
  }, [status, autoDismiss, onDismiss]);

  const config = statusConfig[status];

  // Compact mode
  if (compact) {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <span className={`${config.color}`}>
          {config.pulse ? (
            <span className="relative flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.bgColor} opacity-75`} />
              <span className={`relative inline-flex rounded-full h-3 w-3 ${config.bgColor} items-center justify-center text-[8px]`}>
                {config.icon}
              </span>
            </span>
          ) : (
            <span className="text-sm">{config.icon}</span>
          )}
        </span>
        <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
      </div>
    );
  }

  return (
    <div className={`bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className={`px-4 py-3 ${config.bgColor} border-b border-gray-700 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          {config.pulse ? (
            <span className="relative flex h-4 w-4">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.color.replace('text-', 'bg-')} opacity-75`} />
              <span className={`relative inline-flex rounded-full h-4 w-4 ${config.color.replace('text-', 'bg-')} items-center justify-center text-[10px] text-white`}>
                {config.icon}
              </span>
            </span>
          ) : (
            <span className={`text-lg ${config.color}`}>{config.icon}</span>
          )}
          <span className={`font-semibold ${config.color}`}>{config.label}</span>
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-1 text-gray-400 hover:text-white transition-colors"
            aria-label="Dismiss"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Transaction ID */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Transaction</span>
          <a
            href={`https://explorer.hiro.so/txid/${txId}?chain=mainnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-mono text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
          >
            {truncatedTxId}
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>

        {/* Progress steps */}
        {showDetails && (
          <div className="flex items-center gap-2 py-2">
            {(['broadcasting', 'confirming', 'success'] as TxStatus[]).map((step, index) => {
              const stepStatus = 
                status === 'failed' ? 'failed' :
                status === step ? 'current' :
                ['broadcasting', 'confirming', 'success'].indexOf(status) > index ? 'complete' : 'pending';

              return (
                <div key={step} className="flex-1 flex items-center gap-2">
                  <div className={`
                    w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                    ${stepStatus === 'complete' ? 'bg-green-500 text-white' :
                      stepStatus === 'current' ? 'bg-purple-500 text-white animate-pulse' :
                      stepStatus === 'failed' ? 'bg-red-500 text-white' :
                      'bg-gray-700 text-gray-400'}
                  `}>
                    {stepStatus === 'complete' ? '✓' : index + 1}
                  </div>
                  {index < 2 && (
                    <div className={`flex-1 h-0.5 ${
                      stepStatus === 'complete' || (['broadcasting', 'confirming', 'success'].indexOf(status) > index)
                        ? 'bg-green-500' 
                        : 'bg-gray-700'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Block height */}
        {blockHeight && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Block Height</span>
            <span className="text-white font-mono">{blockHeight.toLocaleString()}</span>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 pt-2">
          <a
            href={`https://explorer.hiro.so/txid/${txId}?chain=mainnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-lg text-center transition-colors"
          >
            View on Explorer
          </a>
          {status === 'success' && onDismiss && (
            <button
              onClick={onDismiss}
              className="py-2 px-4 bg-green-500 hover:bg-green-400 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Compact variant export
export function TransactionStatusCompact(props: Omit<TransactionStatusProps, 'compact'>) {
  return <TransactionStatus {...props} compact />;
}
