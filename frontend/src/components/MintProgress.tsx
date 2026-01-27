'use client';

/**
 * MintProgress Component
 * Mint progress bar with stages and animations
 * @module components/MintProgress
 * @version 1.0.0
 */

import React, { useState, useEffect, useMemo } from 'react';

// Types
export type MintStage = 'idle' | 'preparing' | 'confirming' | 'minting' | 'finalizing' | 'complete' | 'error';

export interface MintProgressProps {
  stage: MintStage;
  progress?: number;
  txId?: string;
  error?: string;
  totalMinted?: number;
  maxSupply?: number;
  variant?: 'default' | 'minimal' | 'detailed';
  className?: string;
  onRetry?: () => void;
  onViewTx?: (txId: string) => void;
}

// Stage configurations
const stageConfigs: Record<MintStage, {
  label: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
}> = {
  idle: {
    label: 'Ready to Mint',
    description: 'Click the mint button to begin',
    icon: '🎨',
    color: 'text-gray-400',
    bgColor: 'bg-gray-700',
  },
  preparing: {
    label: 'Preparing Transaction',
    description: 'Setting up your mint transaction...',
    icon: '⏳',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
  },
  confirming: {
    label: 'Confirm in Wallet',
    description: 'Please confirm the transaction in your wallet',
    icon: '🔐',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
  },
  minting: {
    label: 'Minting NFT',
    description: 'Your NFT is being minted on-chain...',
    icon: '⛏️',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
  },
  finalizing: {
    label: 'Finalizing',
    description: 'Waiting for block confirmation...',
    icon: '🔗',
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/20',
  },
  complete: {
    label: 'Mint Complete!',
    description: 'Your NFT has been successfully minted',
    icon: '✅',
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
  },
  error: {
    label: 'Mint Failed',
    description: 'Something went wrong during minting',
    icon: '❌',
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
  },
};

// Stage order for progress calculation
const stageOrder: MintStage[] = ['idle', 'preparing', 'confirming', 'minting', 'finalizing', 'complete'];

export function MintProgress({
  stage,
  progress: customProgress,
  txId,
  error,
  totalMinted,
  maxSupply,
  variant = 'default',
  className = '',
  onRetry,
  onViewTx,
}: MintProgressProps) {
  const config = stageConfigs[stage];
  
  // Calculate progress percentage
  const progress = useMemo(() => {
    if (customProgress !== undefined) return customProgress;
    if (stage === 'error') return 0;
    const stageIndex = stageOrder.indexOf(stage);
    return (stageIndex / (stageOrder.length - 1)) * 100;
  }, [stage, customProgress]);

  // Minimal variant
  if (variant === 'minimal') {
    return (
      <div className={`${className}`}>
        <div className="flex items-center gap-2 mb-2">
          <span>{config.icon}</span>
          <span className={`text-sm font-medium ${config.color}`}>
            {config.label}
          </span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              stage === 'error' ? 'bg-red-500' : 'bg-primary-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  }

  // Detailed variant
  if (variant === 'detailed') {
    return (
      <div className={`bg-gray-900 rounded-xl p-6 ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-lg">Mint Progress</h3>
          {maxSupply && totalMinted !== undefined && (
            <span className="text-sm text-gray-400">
              {totalMinted.toLocaleString()} / {maxSupply.toLocaleString()} minted
            </span>
          )}
        </div>

        {/* Supply progress */}
        {maxSupply && totalMinted !== undefined && (
          <div className="mb-6">
            <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-purple-500 transition-all duration-300"
                style={{ width: `${(totalMinted / maxSupply) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              {((totalMinted / maxSupply) * 100).toFixed(1)}% minted
            </p>
          </div>
        )}

        {/* Stages */}
        <div className="space-y-3">
          {stageOrder.slice(1).map((s, index) => {
            const stageConfig = stageConfigs[s];
            const currentIndex = stageOrder.indexOf(stage);
            const thisIndex = index + 1;
            
            const isComplete = currentIndex > thisIndex;
            const isCurrent = currentIndex === thisIndex;
            const isPending = currentIndex < thisIndex;

            return (
              <div
                key={s}
                className={`
                  flex items-center gap-4 p-3 rounded-lg transition-all
                  ${isCurrent ? stageConfig.bgColor : ''}
                  ${isComplete ? 'opacity-60' : ''}
                `}
              >
                {/* Step indicator */}
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center
                    ${isComplete ? 'bg-green-500' : isCurrent ? stageConfig.bgColor : 'bg-gray-800'}
                    ${isCurrent ? 'ring-2 ring-offset-2 ring-offset-gray-900 ring-current' : ''}
                  `}
                >
                  {isComplete ? (
                    <span className="text-white">✓</span>
                  ) : (
                    <span className={isPending ? 'text-gray-500' : ''}>
                      {stageConfig.icon}
                    </span>
                  )}
                </div>

                {/* Step info */}
                <div className="flex-1">
                  <p
                    className={`
                      font-medium
                      ${isComplete ? 'text-gray-400' : isCurrent ? stageConfig.color : 'text-gray-500'}
                    `}
                  >
                    {stageConfig.label}
                  </p>
                  {isCurrent && (
                    <p className="text-sm text-gray-400 mt-0.5">
                      {stageConfig.description}
                    </p>
                  )}
                </div>

                {/* Status */}
                {isComplete && (
                  <span className="text-xs text-green-400">Complete</span>
                )}
                {isCurrent && stage !== 'complete' && (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                )}
              </div>
            );
          })}
        </div>

        {/* Error state */}
        {stage === 'error' && error && (
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="mt-3 px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors"
              >
                Try Again
              </button>
            )}
          </div>
        )}

        {/* Success state */}
        {stage === 'complete' && txId && (
          <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
            <p className="text-green-400 mb-3">🎉 Your NFT has been minted!</p>
            {onViewTx && (
              <button
                onClick={() => onViewTx(txId)}
                className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors"
              >
                View Transaction
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className={`bg-gray-900 rounded-xl p-4 ${className}`}>
      {/* Current stage info */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className={`
            w-12 h-12 rounded-full flex items-center justify-center text-2xl
            ${config.bgColor}
          `}
        >
          {stage !== 'idle' && stage !== 'complete' && stage !== 'error' ? (
            <div className="relative">
              <span className="animate-pulse">{config.icon}</span>
            </div>
          ) : (
            config.icon
          )}
        </div>
        
        <div className="flex-1">
          <h4 className={`font-semibold ${config.color}`}>
            {config.label}
          </h4>
          <p className="text-sm text-gray-400">
            {stage === 'error' ? error : config.description}
          </p>
        </div>

        {/* Spinner for active states */}
        {!['idle', 'complete', 'error'].includes(stage) && (
          <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`
            h-full transition-all duration-500 ease-out
            ${stage === 'error' 
              ? 'bg-red-500' 
              : stage === 'complete'
                ? 'bg-green-500'
                : 'bg-gradient-to-r from-primary-500 to-purple-500'
            }
          `}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Stage indicators */}
      <div className="flex justify-between mt-2">
        {stageOrder.slice(1, -1).map((s, index) => {
          const currentIndex = stageOrder.indexOf(stage);
          const thisIndex = index + 1;
          const isComplete = currentIndex > thisIndex;
          const isCurrent = currentIndex === thisIndex;

          return (
            <div
              key={s}
              className={`
                w-2 h-2 rounded-full transition-colors
                ${isComplete ? 'bg-green-500' : isCurrent ? 'bg-primary-500' : 'bg-gray-700'}
              `}
            />
          );
        })}
      </div>

      {/* Transaction link */}
      {txId && stage === 'complete' && onViewTx && (
        <button
          onClick={() => onViewTx(txId)}
          className="mt-4 w-full py-2 text-sm text-primary-400 hover:text-primary-300 text-center"
        >
          View transaction →
        </button>
      )}

      {/* Retry button */}
      {stage === 'error' && onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 w-full py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

// Animated minting counter
interface MintCounterProps {
  current: number;
  max: number;
  className?: string;
}

export function MintCounter({ current, max, className = '' }: MintCounterProps) {
  const [displayValue, setDisplayValue] = useState(current);

  useEffect(() => {
    const diff = current - displayValue;
    if (diff === 0) return;

    const duration = 500;
    const steps = 20;
    const increment = diff / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      setDisplayValue((prev) => {
        if (step >= steps) {
          clearInterval(timer);
          return current;
        }
        return prev + increment;
      });
    }, duration / steps);

    return () => clearInterval(timer);
  }, [current]);

  const percentage = (displayValue / max) * 100;

  return (
    <div className={`text-center ${className}`}>
      <div className="relative inline-block">
        {/* Circular progress */}
        <svg className="w-32 h-32 -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="56"
            fill="none"
            stroke="#1f2937"
            strokeWidth="8"
          />
          <circle
            cx="64"
            cy="64"
            r="56"
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${percentage * 3.52} 352`}
            className="transition-all duration-500"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Counter text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-white">
            {Math.floor(displayValue).toLocaleString()}
          </span>
          <span className="text-sm text-gray-500">
            / {max.toLocaleString()}
          </span>
        </div>
      </div>
      
      <p className="mt-2 text-sm text-gray-400">
        {percentage.toFixed(1)}% minted
      </p>
    </div>
  );
}

export default MintProgress;
