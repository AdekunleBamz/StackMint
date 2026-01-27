'use client';

/**
 * ProgressBar Component
 * Animated progress indicators with various styles
 * @module components/ProgressBar
 * @version 1.0.0
 */

import { memo, useEffect, useState } from 'react';

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  valueFormat?: 'percent' | 'fraction' | 'custom';
  customValue?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'purple' | 'green' | 'blue' | 'red' | 'yellow' | 'gradient';
  animated?: boolean;
  striped?: boolean;
  className?: string;
}

function ProgressBarComponent({
  value,
  max = 100,
  label,
  showValue = true,
  valueFormat = 'percent',
  customValue,
  size = 'md',
  color = 'purple',
  animated = true,
  striped = false,
  className = '',
}: ProgressBarProps) {
  const [animatedWidth, setAnimatedWidth] = useState(0);
  
  // Clamp value between 0 and max
  const clampedValue = Math.max(0, Math.min(value, max));
  const percentage = (clampedValue / max) * 100;

  // Animate on mount and value change
  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setAnimatedWidth(percentage);
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setAnimatedWidth(percentage);
    }
  }, [percentage, animated]);

  // Format display value
  const getDisplayValue = () => {
    switch (valueFormat) {
      case 'percent':
        return `${Math.round(percentage)}%`;
      case 'fraction':
        return `${clampedValue}/${max}`;
      case 'custom':
        return customValue || `${clampedValue}`;
      default:
        return `${Math.round(percentage)}%`;
    }
  };

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const colorClasses = {
    purple: 'bg-purple-600',
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    gradient: 'bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500',
  };

  const glowClasses = {
    purple: 'shadow-purple-500/50',
    green: 'shadow-green-500/50',
    blue: 'shadow-blue-500/50',
    red: 'shadow-red-500/50',
    yellow: 'shadow-yellow-500/50',
    gradient: 'shadow-purple-500/50',
  };

  return (
    <div className={className}>
      {/* Header with label and value */}
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-2">
          {label && (
            <span className="text-sm font-medium text-gray-300">{label}</span>
          )}
          {showValue && (
            <span className="text-sm font-mono text-gray-400">
              {getDisplayValue()}
            </span>
          )}
        </div>
      )}

      {/* Progress track */}
      <div 
        className={`
          w-full rounded-full bg-gray-800 overflow-hidden
          ${sizeClasses[size]}
        `}
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
      >
        {/* Progress fill */}
        <div
          className={`
            h-full rounded-full transition-all duration-500 ease-out
            ${colorClasses[color]}
            ${percentage > 0 ? `shadow-lg ${glowClasses[color]}` : ''}
            ${striped ? 'bg-stripes' : ''}
          `}
          style={{ 
            width: `${animatedWidth}%`,
            backgroundSize: striped ? '1rem 1rem' : undefined,
          }}
        >
          {/* Animated shine effect */}
          {animated && percentage > 0 && (
            <div className="h-full w-full relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Circular Progress Component
 */
interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: 'purple' | 'green' | 'blue' | 'red';
  showValue?: boolean;
  label?: string;
  className?: string;
}

export function CircularProgress({
  value,
  max = 100,
  size = 80,
  strokeWidth = 8,
  color = 'purple',
  showValue = true,
  label,
  className = '',
}: CircularProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const colorMap = {
    purple: 'stroke-purple-500',
    green: 'stroke-green-500',
    blue: 'stroke-blue-500',
    red: 'stroke-red-500',
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        className="-rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-800"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={`${colorMap[color]} transition-all duration-500 ease-out`}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      
      {/* Center content */}
      {showValue && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-white">
            {Math.round(percentage)}%
          </span>
          {label && (
            <span className="text-xs text-gray-400">{label}</span>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Multi-step Progress Component
 */
interface Step {
  label: string;
  completed?: boolean;
  current?: boolean;
}

interface StepProgressProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export function StepProgress({ steps, currentStep, className = '' }: StepProgressProps) {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between relative">
        {/* Progress line */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-800">
          <div 
            className="h-full bg-purple-500 transition-all duration-500"
            style={{ width: `${((currentStep) / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {/* Steps */}
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <div key={index} className="relative flex flex-col items-center">
              {/* Step circle */}
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center z-10
                  transition-all duration-300
                  ${isCompleted 
                    ? 'bg-purple-600 text-white' 
                    : isCurrent 
                      ? 'bg-purple-600 text-white ring-4 ring-purple-500/30' 
                      : 'bg-gray-800 text-gray-500 border border-gray-700'
                  }
                `}
              >
                {isCompleted ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>

              {/* Step label */}
              <span className={`
                mt-2 text-xs font-medium
                ${isCurrent ? 'text-purple-400' : isCompleted ? 'text-gray-300' : 'text-gray-500'}
              `}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default memo(ProgressBarComponent);
