'use client';

/**
 * FeatureCard Component
 * Animated feature card with intersection observer and hover effects
 * @module FeatureCard
 * @version 2.4.0
 */

import { useRef, useState, useEffect, memo, type FC } from 'react';
import Link from 'next/link';

/**
 * Feature card size variants
 */
type FeatureCardSize = 'sm' | 'md' | 'lg';

/**
 * Feature card color theme
 */
type FeatureCardTheme = 'purple' | 'blue' | 'orange' | 'green';

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  delay?: number;
  size?: FeatureCardSize;
  theme?: FeatureCardTheme;
  highlight?: string;
  stats?: string;
  link?: { href: string; label: string };
}

// Intersection observer configuration
const VISIBILITY_THRESHOLD = 0.1;
const DEFAULT_ANIMATION_DELAY = 0;
const ANIMATION_DURATION_CLASS = 'duration-500';

/** Hover scale multiplier */
const HOVER_SCALE = 1.1;

/** Hover rotation degrees */
const HOVER_ROTATION = 3;

function FeatureCardComponent({ 
  icon, 
  title, 
  description, 
  delay = DEFAULT_ANIMATION_DELAY,
  highlight,
  stats,
  link
}: FeatureCardProps) {
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

  const CardWrapper = ({ children }: { children: React.ReactNode }) => {
    if (link) {
      return (
        <Link href={link.href} className="block h-full">
          {children}
        </Link>
      );
    }
    return <>{children}</>;
  };

  return (
    <CardWrapper>
      <div 
        ref={ref}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`relative h-full bg-gradient-to-br from-gray-900/80 to-gray-900/40 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6 md:p-8 transition-all duration-500 group overflow-hidden ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        } ${isHovered ? 'border-purple-500/50 shadow-xl shadow-purple-500/10 -translate-y-2' : ''}`}
      >
        {/* Glow effect on hover */}
        <div className={`absolute inset-0 bg-gradient-to-br from-purple-600/10 to-transparent transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
        
        {/* Shine effect */}
        <div className={`absolute -inset-full top-0 z-0 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/5 to-transparent transition-all duration-1000 ${isHovered ? 'translate-x-full' : '-translate-x-full'}`} />
        
        {/* Highlight badge */}
        {highlight && (
          <div className="absolute top-4 right-4">
            <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-full">
              {highlight}
            </span>
          </div>
        )}
        
        <div className="relative z-10">
          <div className={`w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-2xl flex items-center justify-center mb-5 transition-all duration-500 border border-purple-500/20 ${isHovered ? 'scale-110 rotate-3 border-purple-500/40' : ''}`}>
            <span className="text-3xl md:text-4xl">{icon}</span>
          </div>
          
          <h3 className="text-lg md:text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">{title}</h3>
          <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-4">{description}</p>
          
          {/* Stats badge */}
          {stats && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-800/50 border border-gray-700/50 rounded-lg text-xs">
              <span className="text-green-400">✓</span>
              <span className="text-gray-300 font-medium">{stats}</span>
            </div>
          )}
          
          {/* Learn more link */}
          {link && (
            <div className={`mt-4 flex items-center gap-2 text-purple-400 text-sm font-medium transition-all duration-300 ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}>
              <span>{link.label}</span>
              <svg className={`w-4 h-4 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          )}
        </div>
      </div>
    </CardWrapper>
  );
}

// Memoize component to prevent unnecessary re-renders
const FeatureCard = memo(FeatureCardComponent);
FeatureCard.displayName = 'FeatureCard';

export default FeatureCard;