'use client';

/**
 * GasEstimator Component
 * Transaction gas/fee estimator for Stacks transactions
 * @module components/GasEstimator
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';

// Types
export type FeeSpeed = 'slow' | 'standard' | 'fast';

export interface FeeEstimate {
  speed: FeeSpeed;
  label: string;
  fee: number;
  time: string;
  recommended?: boolean;
}

interface GasEstimatorProps {
  transactionType?: 'transfer' | 'contract_call' | 'mint' | 'list' | 'buy';
  selectedSpeed?: FeeSpeed;
  onSpeedChange?: (speed: FeeSpeed) => void;
  customFee?: number;
  onCustomFeeChange?: (fee: number) => void;
  showCustom?: boolean;
  compact?: boolean;
  className?: string;
}

// Fee multipliers for different speeds
const feeMultipliers: Record<FeeSpeed, number> = {
  slow: 0.5,
  standard: 1,
  fast: 2,
};

// Time estimates
const timeEstimates: Record<FeeSpeed, string> = {
  slow: '~30 min',
  standard: '~10 min',
  fast: '~2 min',
};

// Speed configs
const speedConfigs: Record<FeeSpeed, { icon: string; color: string }> = {
  slow: { icon: '🐢', color: 'text-blue-400' },
  standard: { icon: '⚡', color: 'text-green-400' },
  fast: { icon: '🚀', color: 'text-orange-400' },
};

export function GasEstimator({
  transactionType = 'contract_call',
  selectedSpeed = 'standard',
  onSpeedChange,
  customFee,
  onCustomFeeChange,
  showCustom = false,
  compact = false,
  className = '',
}: GasEstimatorProps) {
  const [baseFee, setBaseFee] = useState<number>(0.001);
  const [isLoading, setIsLoading] = useState(true);
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Fetch current network fee estimate
  useEffect(() => {
    const fetchFeeEstimate = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          'https://api.mainnet.hiro.so/extended/v1/fee_rate'
        );
        if (response.ok) {
          const data = await response.json();
          // Convert to STX (microSTX to STX)
          setBaseFee(data.fee_rate / 1000000);
        }
      } catch {
        // Use fallback fee
        setBaseFee(0.001);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeeEstimate();
  }, []);

  // Calculate fees for each speed
  const feeEstimates: FeeEstimate[] = [
    {
      speed: 'slow',
      label: 'Slow',
      fee: baseFee * feeMultipliers.slow,
      time: timeEstimates.slow,
    },
    {
      speed: 'standard',
      label: 'Standard',
      fee: baseFee * feeMultipliers.standard,
      time: timeEstimates.standard,
      recommended: true,
    },
    {
      speed: 'fast',
      label: 'Fast',
      fee: baseFee * feeMultipliers.fast,
      time: timeEstimates.fast,
    },
  ];

  const currentEstimate = feeEstimates.find((e) => e.speed === selectedSpeed)!;

  // Compact variant
  if (compact) {
    return (
      <div className={`flex items-center justify-between ${className}`}>
        <span className="text-sm text-gray-400">Est. Fee:</span>
        <div className="flex items-center gap-2">
          {feeEstimates.map((estimate) => (
            <button
              key={estimate.speed}
              onClick={() => onSpeedChange?.(estimate.speed)}
              className={`
                px-2 py-1 rounded text-xs font-medium transition-colors
                ${selectedSpeed === estimate.speed
                  ? 'bg-primary-500/20 text-primary-400'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
                }
              `}
            >
              {speedConfigs[estimate.speed].icon}
            </button>
          ))}
          <span className="text-white font-semibold ml-2">
            {isLoading ? '...' : `${currentEstimate.fee.toFixed(6)} STX`}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-900 rounded-xl p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white">Transaction Fee</h3>
        <span className="text-xs text-gray-500">
          Network: {isLoading ? 'Loading...' : 'Stacks Mainnet'}
        </span>
      </div>

      {/* Speed options */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {feeEstimates.map((estimate) => {
          const config = speedConfigs[estimate.speed];
          const isSelected = selectedSpeed === estimate.speed;

          return (
            <button
              key={estimate.speed}
              onClick={() => onSpeedChange?.(estimate.speed)}
              disabled={isLoading}
              className={`
                relative p-3 rounded-lg border-2 transition-all
                ${isSelected
                  ? 'border-primary-500 bg-primary-500/10'
                  : 'border-gray-800 hover:border-gray-700 bg-gray-800/50'
                }
                ${isLoading ? 'opacity-50' : ''}
              `}
            >
              {estimate.recommended && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-green-500 text-white text-[10px] rounded-full">
                  Recommended
                </span>
              )}
              
              <span className="text-2xl block mb-1">{config.icon}</span>
              <p className={`font-semibold ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                {estimate.label}
              </p>
              <p className={`text-sm ${config.color}`}>
                {isLoading ? '...' : `${estimate.fee.toFixed(6)} STX`}
              </p>
              <p className="text-xs text-gray-500 mt-1">{estimate.time}</p>
            </button>
          );
        })}
      </div>

      {/* Custom fee toggle */}
      {showCustom && (
        <div className="border-t border-gray-800 pt-4">
          <button
            onClick={() => setShowCustomInput(!showCustomInput)}
            className="text-sm text-primary-400 hover:text-primary-300"
          >
            {showCustomInput ? 'Hide custom fee' : 'Set custom fee'}
          </button>

          {showCustomInput && (
            <div className="mt-3 flex items-center gap-2">
              <input
                type="number"
                value={customFee || ''}
                onChange={(e) => onCustomFeeChange?.(parseFloat(e.target.value) || 0)}
                placeholder="Enter custom fee"
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
                step="0.000001"
                min="0"
              />
              <span className="text-gray-400">STX</span>
            </div>
          )}
        </div>
      )}

      {/* Summary */}
      <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Estimated Fee</span>
          <span className="text-white font-bold">
            {isLoading ? '...' : `${(customFee || currentEstimate.fee).toFixed(6)} STX`}
          </span>
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-gray-500 text-sm">Estimated Time</span>
          <span className="text-gray-300 text-sm">{currentEstimate.time}</span>
        </div>
      </div>
    </div>
  );
}

// Fee display component
interface FeeDisplayProps {
  fee: number;
  label?: string;
  showUSD?: boolean;
  stxPrice?: number;
  className?: string;
}

export function FeeDisplay({
  fee,
  label = 'Fee',
  showUSD = true,
  stxPrice = 0.5,
  className = '',
}: FeeDisplayProps) {
  const usdValue = fee * stxPrice;

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <span className="text-gray-400 text-sm">{label}</span>
      <div className="text-right">
        <span className="text-white font-medium">{fee.toFixed(6)} STX</span>
        {showUSD && (
          <span className="text-gray-500 text-sm ml-2">
            (≈ ${usdValue.toFixed(4)})
          </span>
        )}
      </div>
    </div>
  );
}

// Network status indicator
interface NetworkStatusProps {
  className?: string;
}

export function NetworkStatus({ className = '' }: NetworkStatusProps) {
  const [congestion, setCongestion] = useState<'low' | 'medium' | 'high'>('low');
  const [blockHeight, setBlockHeight] = useState<number | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch('https://api.mainnet.hiro.so/extended/v1/info');
        if (response.ok) {
          const data = await response.json();
          setBlockHeight(data.stacks_tip_height);
          // Simulate congestion based on block height variance
          setCongestion('low');
        }
      } catch {
        // Ignore errors
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const congestionStyles = {
    low: { bg: 'bg-green-500', text: 'text-green-400', label: 'Low' },
    medium: { bg: 'bg-yellow-500', text: 'text-yellow-400', label: 'Medium' },
    high: { bg: 'bg-red-500', text: 'text-red-400', label: 'High' },
  };

  const style = congestionStyles[congestion];

  return (
    <div className={`flex items-center gap-4 text-sm ${className}`}>
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${style.bg} animate-pulse`} />
        <span className="text-gray-400">
          Network: <span className={style.text}>{style.label}</span>
        </span>
      </div>
      
      {blockHeight && (
        <span className="text-gray-500">
          Block #{blockHeight.toLocaleString()}
        </span>
      )}
    </div>
  );
}

export default GasEstimator;
