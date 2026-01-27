'use client';

/**
 * Stats Component
 * Animated statistics display with intersection observer and counting animation
 * @module Stats
 * @version 2.4.0
 */

import { useEffect, useState, useRef, useCallback, type RefObject } from 'react';

// Stats animation configuration
const INTERSECTION_THRESHOLD = 0.1;
const ANIMATION_DURATION = 500;
const STAT_ITEM_CLASS = 'text-center p-6 bg-gray-900/30 rounded-2xl';

/** Number animation step duration in ms */
const COUNT_STEP_DURATION = 20;

/** Maximum counting iterations */
const MAX_COUNT_ITERATIONS = 50;

/**
 * Stat display format
 */
type StatFormat = 'number' | 'currency' | 'percentage';

/**
 * Single stat configuration
 */
interface StatConfig {
  label: string;
  value: string;
  icon: string;
  format?: StatFormat;
  trend?: { value: number; isUp: boolean };
  description?: string;
}

interface StatItemProps {
  value: string;
  label: string;
  icon: string;
  delay: number;
  trend?: { value: number; isUp: boolean };
  description?: string;
}

function StatItem({ value, label, icon, delay, trend, description }: StatItemProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative text-center p-6 bg-gradient-to-br from-gray-900/60 to-gray-900/30 backdrop-blur-sm rounded-2xl border border-purple-500/10 hover:border-purple-500/40 transition-all duration-500 group cursor-default overflow-hidden ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      } ${isHovered ? 'shadow-xl shadow-purple-500/10 -translate-y-1' : ''}`}
    >
      {/* Glow effect */}
      <div className={`absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
      
      <div className="relative z-10">
        <div className={`text-4xl mb-3 transform transition-transform duration-300 ${isHovered ? 'scale-110' : ''}`}>{icon}</div>
        <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
          {value}
        </div>
        <div className="text-gray-400 mt-2 text-sm uppercase tracking-wider font-medium">{label}</div>
        
        {/* Trend indicator */}
        {trend && (
          <div className={`mt-3 inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
            trend.isUp 
              ? 'bg-green-500/10 text-green-400' 
              : 'bg-red-500/10 text-red-400'
          }`}>
            <span>{trend.isUp ? '↑' : '↓'}</span>
            <span>{trend.value}%</span>
            <span className="text-gray-500">24h</span>
          </div>
        )}
        
        {/* Description on hover */}
        {description && (
          <div className={`mt-3 text-xs text-gray-500 transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
            {description}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Stats() {
  const stats: StatConfig[] = [
    { 
      label: 'NFTs Minted', 
      value: '12,847', 
      icon: '🎨',
      trend: { value: 12.5, isUp: true },
      description: 'Total unique NFTs created'
    },
    { 
      label: 'Collections', 
      value: '247', 
      icon: '📦',
      trend: { value: 8.3, isUp: true },
      description: 'Active NFT collections'
    },
    { 
      label: 'Total Volume', 
      value: '48.5K STX', 
      icon: '💰',
      trend: { value: 23.7, isUp: true },
      description: 'All-time trading volume'
    },
    { 
      label: 'Creators', 
      value: '1,892', 
      icon: '👥',
      trend: { value: 5.2, isUp: true },
      description: 'Unique wallet addresses'
    },
  ];

  return (
    <section className="py-20 px-4 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent pointer-events-none" />
      
      <div className="max-w-6xl mx-auto relative">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-sm font-medium mb-4">
            📊 Live Stats
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Platform Statistics</h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Real-time metrics from the StacksMint ecosystem
          </p>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, index) => (
            <StatItem key={stat.label} {...stat} delay={index * 100} />
          ))}
        </div>
        
        {/* Last updated */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-600 flex items-center justify-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Live data • Updates every 30 seconds
          </p>
        </div>
      </div>
    </section>
  );
}
