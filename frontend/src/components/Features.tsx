/**
 * Features Component
 * Displays the main features of StacksMint with animations
 * @module Features
 * @version 2.3.0
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import FeatureCard from './FeatureCard';

// Section configuration
const SECTION_TITLE = 'Why StacksMint?';
const SECTION_SUBTITLE = 'The easiest way to create and trade NFTs on Bitcoin';

/** Grid columns per breakpoint */
const GRID_COLS = {
  sm: 1,
  md: 2,
  lg: 4,
} as const;

/** Animation stagger delay in ms */
const STAGGER_DELAY = 100;

/**
 * Feature data structure
 */
interface FeatureData {
  icon: string;
  title: string;
  description: string;
  highlight?: string;
  stats?: string;
  link?: { href: string; label: string };
}

const features: FeatureData[] = [
  { 
    icon: '🎨', 
    title: 'Easy Minting', 
    description: 'Mint NFTs in seconds with our intuitive interface. No coding required.',
    highlight: 'Most Popular',
    stats: '12K+ NFTs minted',
    link: { href: '/mint', label: 'Start Minting' }
  },
  { 
    icon: '📦', 
    title: 'Collections', 
    description: 'Organize your NFTs into beautiful, discoverable collections with custom branding.',
    stats: '240+ collections',
    link: { href: '/collections', label: 'Browse Collections' }
  },
  { 
    icon: '💰', 
    title: 'Marketplace', 
    description: 'Buy and sell NFTs with the lowest fees on any Bitcoin L2. Just 2.5% platform fee.',
    stats: '48K STX volume',
    link: { href: '/marketplace', label: 'Explore Market' }
  },
  { 
    icon: '🔒', 
    title: 'Bitcoin Security', 
    description: 'Your NFTs are secured by Bitcoin through the Stacks blockchain. True ownership.',
    highlight: 'Enterprise Grade',
    stats: '100% uptime'
  },
];

export default function Features() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 px-4 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent pointer-events-none" />
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section header */}
        <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <span className="inline-block px-4 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-sm font-medium mb-4">
            ⚡ Core Features
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{SECTION_TITLE}</h2>
          <p className="text-gray-400 max-w-xl mx-auto text-lg">{SECTION_SUBTITLE}</p>
        </div>
        
        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <FeatureCard {...feature} />
            </div>
          ))}
        </div>
        
        {/* Bottom stats bar */}
        <div className={`mt-16 grid grid-cols-3 gap-8 max-w-3xl mx-auto transition-all duration-700 delay-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-white">100%</div>
            <div className="text-sm text-gray-500 mt-1">On-chain</div>
          </div>
          <div className="text-center border-x border-gray-800">
            <div className="text-2xl md:text-3xl font-bold text-white">2.5%</div>
            <div className="text-sm text-gray-500 mt-1">Platform Fee</div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-white">&lt;30s</div>
            <div className="text-sm text-gray-500 mt-1">Mint Time</div>
          </div>
        </div>
      </div>
    </section>
  );
}
