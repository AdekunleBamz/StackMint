'use client';

/**
 * CTASection Component
 * Call-to-action section with animated elements and gradient background
 * @module CTASection
 * @version 2.3.0
 */

import Link from 'next/link';
import { useEffect, useRef, useState, memo, type FC } from 'react';

// CTA content configuration
const CTA_CONFIG = {
  animationThreshold: 0.2,
  transitionDuration: 700,
};

// Button text constants
const PRIMARY_CTA_TEXT = 'Start Minting';
const SECONDARY_CTA_TEXT = 'View Collections';

/** Intersection observer threshold */
const VISIBILITY_THRESHOLD = 0.2;

/** Animation delay between floating elements */
const FLOAT_STAGGER_DELAY = 200;

/**
 * CTA button variant
 */
type CTAButtonVariant = 'primary' | 'secondary' | 'outline';

/**
 * Floating icon configuration
 */
interface FloatingIcon {
  emoji: string;
  position: 'top-right' | 'bottom-left' | 'center-right';
  opacity: number;
}

function CTASectionComponent() {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.2 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-24 px-4" ref={ref}>
      <div className={`max-w-5xl mx-auto transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="relative bg-gradient-to-r from-purple-900/50 via-purple-800/30 to-blue-900/50 border border-purple-500/30 rounded-3xl p-12 md:p-16 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          
          {/* Floating icons */}
          <div className="absolute top-8 right-8 text-4xl animate-float opacity-30">🎨</div>
          <div className="absolute bottom-8 left-8 text-4xl animate-float stagger-2 opacity-30">💎</div>
          <div className="absolute top-1/2 right-16 text-3xl animate-float stagger-3 opacity-20">✨</div>
          
          <div className="relative z-10 text-center">
            <div className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-500/30 rounded-full px-4 py-2 mb-6">
              <span className="text-purple-300 text-sm font-medium">🚀 Join 1000+ creators</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Ready to Create Your<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">First NFT?</span>
            </h2>
            
            <p className="text-gray-300 mb-10 max-w-2xl mx-auto text-lg">
              Join thousands of creators on the most secure NFT platform built on Bitcoin. 
              Start minting in seconds with the lowest fees.
            </p>
            
            <div className="flex gap-4 justify-center flex-wrap">
              <Link 
                href="/mint"
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white px-10 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:-translate-y-1 flex items-center gap-2"
              >
                <span>✨</span> Start Minting
              </Link>
              <Link 
                href="/marketplace"
                className="border-2 border-purple-500/50 text-purple-300 px-10 py-4 rounded-xl font-semibold hover:bg-purple-500/10 hover:border-purple-400 transition-all duration-300 flex items-center gap-2"
              >
                <span>🏪</span> Browse Marketplace
              </Link>
            </div>
            
            {/* Trust badges */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-400">
              <div className="flex items-center gap-2 hover:text-gray-300 transition-colors cursor-default">
                <span className="text-green-400">✓</span> Free to start
              </div>
              <div className="flex items-center gap-2 hover:text-gray-300 transition-colors cursor-default">
                <span className="text-green-400">✓</span> Bitcoin-secured
              </div>
              <div className="flex items-center gap-2 hover:text-gray-300 transition-colors cursor-default">
                <span className="text-green-400">✓</span> Under 1 min setup
              </div>
            </div>
            
            {/* Social proof */}
            <div className="mt-10 flex items-center justify-center gap-2">
              <div className="flex -space-x-3">
                {['🧑‍🎨', '👩‍💻', '🧑‍🚀', '👨‍🎤', '👩‍🔬'].map((emoji, i) => (
                  <div 
                    key={i}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-lg border-2 border-gray-900"
                  >
                    {emoji}
                  </div>
                ))}
              </div>
              <span className="text-gray-400 text-sm ml-3">
                <span className="text-white font-semibold">2,500+</span> creators this month
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(CTASectionComponent);
