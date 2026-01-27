'use client';

/**
 * StatCard Component
 * Dashboard stat cards with trends and sparklines
 * @module components/StatCard
 * @version 1.0.0
 */

import { memo, ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  sparkline?: number[];
  variant?: 'default' | 'gradient' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

function StatCardComponent({
  title,
  value,
  subtitle,
  icon,
  trend,
  sparkline,
  variant = 'default',
  size = 'md',
  className = '',
}: StatCardProps) {
  const sizeClasses = {
    sm: {
      padding: 'p-4',
      title: 'text-xs',
      value: 'text-xl',
      icon: 'w-8 h-8',
    },
    md: {
      padding: 'p-5',
      title: 'text-sm',
      value: 'text-2xl',
      icon: 'w-10 h-10',
    },
    lg: {
      padding: 'p-6',
      title: 'text-sm',
      value: 'text-3xl',
      icon: 'w-12 h-12',
    },
  };

  const variantClasses = {
    default: 'bg-gray-800/50 border-gray-700/50',
    gradient: 'bg-gradient-to-br from-purple-900/50 to-pink-900/30 border-purple-500/20',
    outline: 'bg-transparent border-gray-700 hover:border-gray-600',
  };

  // Generate sparkline SVG path
  const generateSparklinePath = (data: number[]) => {
    if (!data || data.length < 2) return '';
    
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    
    const width = 80;
    const height = 32;
    const points = data.map((val, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * height;
      return `${x},${y}`;
    });
    
    return `M${points.join(' L')}`;
  };

  return (
    <div
      className={`
        rounded-2xl border transition-all duration-300
        hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/5
        ${variantClasses[variant]}
        ${sizeClasses[size].padding}
        ${className}
      `}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <p className={`${sizeClasses[size].title} font-medium text-gray-400 mb-1`}>
            {title}
          </p>
          
          {/* Value */}
          <p className={`${sizeClasses[size].value} font-bold text-white mb-1 tabular-nums`}>
            {value}
          </p>
          
          {/* Subtitle or trend */}
          {(subtitle || trend) && (
            <div className="flex items-center gap-2">
              {trend && (
                <span className={`
                  inline-flex items-center gap-1 text-xs font-medium
                  ${trend.isPositive ? 'text-green-400' : 'text-red-400'}
                `}>
                  {trend.isPositive ? (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                  ) : (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  )}
                  {Math.abs(trend.value)}%
                </span>
              )}
              {subtitle && (
                <span className="text-xs text-gray-500">{subtitle}</span>
              )}
              {trend?.label && (
                <span className="text-xs text-gray-500">{trend.label}</span>
              )}
            </div>
          )}
        </div>
        
        {/* Icon or Sparkline */}
        <div className="flex-shrink-0">
          {sparkline && sparkline.length > 1 ? (
            <svg 
              width="80" 
              height="32" 
              className="opacity-60"
            >
              <path
                d={generateSparklinePath(sparkline)}
                fill="none"
                stroke={trend?.isPositive !== false ? '#22c55e' : '#ef4444'}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : icon ? (
            <div className={`
              ${sizeClasses[size].icon} 
              rounded-xl bg-purple-500/10 text-purple-400
              flex items-center justify-center
            `}>
              {icon}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/**
 * Stat Grid - container for multiple stat cards
 */
interface StatGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function StatGrid({ children, columns = 4, className = '' }: StatGridProps) {
  const columnClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`grid gap-4 ${columnClasses[columns]} ${className}`}>
      {children}
    </div>
  );
}

/**
 * Mini Stat - compact inline stat display
 */
interface MiniStatProps {
  label: string;
  value: string | number;
  trend?: { value: number; isPositive: boolean };
  className?: string;
}

export function MiniStat({ label, value, trend, className = '' }: MiniStatProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm text-gray-500">{label}:</span>
      <span className="text-sm font-bold text-white tabular-nums">{value}</span>
      {trend && (
        <span className={`
          text-xs font-medium
          ${trend.isPositive ? 'text-green-400' : 'text-red-400'}
        `}>
          {trend.isPositive ? '+' : ''}{trend.value}%
        </span>
      )}
    </div>
  );
}

export default memo(StatCardComponent);
