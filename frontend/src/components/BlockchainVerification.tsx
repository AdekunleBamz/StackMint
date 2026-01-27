'use client';

/**
 * Blockchain Verification Component
 * Shows blockchain verification status and transaction details
 * @module components/BlockchainVerification
 * @version 1.0.0
 */

import { useState } from 'react';

interface BlockchainVerificationProps {
  contractAddress: string;
  tokenId: string | number;
  transactionId?: string;
  blockHeight?: number;
  verified?: boolean;
  network?: 'mainnet' | 'testnet';
  className?: string;
}

export function BlockchainVerification({
  contractAddress,
  tokenId,
  transactionId,
  blockHeight,
  verified = true,
  network = 'mainnet',
  className = '',
}: BlockchainVerificationProps) {
  const [expanded, setExpanded] = useState(false);

  const explorerBase = network === 'mainnet'
    ? 'https://explorer.stacks.co'
    : 'https://explorer.stacks.co/?chain=testnet';

  const shortenAddress = (address: string) => {
    if (address.length <= 16) return address;
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  return (
    <div className={`bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden ${className}`}>
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-800/70 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          {/* Verification icon */}
          <div className={`
            w-10 h-10 rounded-lg flex items-center justify-center
            ${verified ? 'bg-green-500/20' : 'bg-yellow-500/20'}
          `}>
            {verified ? (
              <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
          </div>

          <div>
            <h3 className="font-medium text-white flex items-center gap-2">
              Blockchain Verified
              {verified && (
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                  On-Chain
                </span>
              )}
            </h3>
            <p className="text-sm text-gray-400">
              Token #{tokenId} • {network === 'mainnet' ? 'Stacks Mainnet' : 'Stacks Testnet'}
            </p>
          </div>
        </div>

        {/* Expand icon */}
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-gray-700/50 pt-4">
          {/* Contract Address */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Contract</span>
            <div className="flex items-center gap-2">
              <code className="text-sm text-primary-400 bg-gray-900 px-2 py-1 rounded font-mono">
                {shortenAddress(contractAddress)}
              </code>
              <a
                href={`${explorerBase}/txid/${contractAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 hover:bg-gray-700 rounded transition-colors"
                title="View on Explorer"
              >
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>

          {/* Token ID */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Token ID</span>
            <code className="text-sm text-white bg-gray-900 px-2 py-1 rounded font-mono">
              {tokenId}
            </code>
          </div>

          {/* Transaction ID */}
          {transactionId && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Mint Transaction</span>
              <div className="flex items-center gap-2">
                <code className="text-sm text-primary-400 bg-gray-900 px-2 py-1 rounded font-mono">
                  {shortenAddress(transactionId)}
                </code>
                <a
                  href={`${explorerBase}/txid/${transactionId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 hover:bg-gray-700 rounded transition-colors"
                  title="View Transaction"
                >
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          )}

          {/* Block Height */}
          {blockHeight && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Block Height</span>
              <code className="text-sm text-white bg-gray-900 px-2 py-1 rounded font-mono">
                #{blockHeight.toLocaleString()}
              </code>
            </div>
          )}

          {/* Stacks blockchain indicator */}
          <div className="flex items-center gap-2 pt-2 border-t border-gray-700/50">
            <div className="w-6 h-6 rounded bg-[#5546FF] flex items-center justify-center">
              <span className="text-white text-xs font-bold">S</span>
            </div>
            <span className="text-sm text-gray-400">
              Secured by Stacks blockchain on Bitcoin
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Compact verification badge
 */
interface VerificationBadgeProps {
  verified?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function VerificationBadge({
  verified = true,
  size = 'md',
  showLabel = true,
  className = '',
}: VerificationBadgeProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div className={`
        ${sizeClasses[size]} rounded-full flex items-center justify-center
        ${verified ? 'bg-green-500' : 'bg-gray-500'}
      `}>
        {verified ? (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <span className="text-white text-xs">?</span>
        )}
      </div>
      {showLabel && (
        <span className={`${textSizes[size]} ${verified ? 'text-green-400' : 'text-gray-400'}`}>
          {verified ? 'Verified' : 'Unverified'}
        </span>
      )}
    </div>
  );
}

/**
 * Chain info banner
 */
interface ChainInfoBannerProps {
  network?: 'mainnet' | 'testnet';
  className?: string;
}

export function ChainInfoBanner({ network = 'mainnet', className = '' }: ChainInfoBannerProps) {
  return (
    <div className={`
      flex items-center justify-center gap-3 p-3 rounded-lg
      ${network === 'mainnet' 
        ? 'bg-gradient-to-r from-[#5546FF]/20 to-[#FF9500]/20 border border-[#5546FF]/30'
        : 'bg-yellow-500/10 border border-yellow-500/30'
      }
      ${className}
    `}>
      {/* Stacks logo */}
      <div className="w-8 h-8 rounded-lg bg-[#5546FF] flex items-center justify-center">
        <span className="text-white font-bold">S</span>
      </div>

      <div className="text-center">
        <p className="text-sm text-white font-medium">
          {network === 'mainnet' ? 'Stacks Mainnet' : 'Stacks Testnet'}
        </p>
        <p className="text-xs text-gray-400">
          Smart contracts secured by Bitcoin
        </p>
      </div>

      {/* Bitcoin logo */}
      <div className="w-8 h-8 rounded-lg bg-[#FF9500] flex items-center justify-center">
        <span className="text-white font-bold">₿</span>
      </div>
    </div>
  );
}

export default BlockchainVerification;
