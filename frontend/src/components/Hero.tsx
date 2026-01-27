import Link from 'next/link';

/**
 * Hero Component
 * Main landing section with CTA and animated background
 * @module components/Hero
 * @version 3.0.0
 */

/**
 * Hero section size variants
 */
type HeroSize = 'sm' | 'md' | 'lg';

/**
 * Background blur element configuration
 */
interface BlurElement {
  position: string;
  size: string;
  color: string;
}

// Animation configuration
const ANIMATION_DELAYS = {
  tagline: 0,
  title: 100,
  description: 200,
  buttons: 300,
  trust: 400,
  stats: 500,
} as const;

/** Background element count */
const BLUR_ELEMENT_COUNT = 3;

// Hero section content configuration
const HERO_CONTENT = {
  tagline: 'Live on Stacks Mainnet',
  title: {
    main: 'Mint Your',
    highlight: 'NFTs',
    sub: 'on Bitcoin',
  },
  description: 'Create, collect, and trade unique digital assets secured by the Bitcoin blockchain through Stacks',
  primaryCTA: { label: 'Start Minting', href: '/mint' },
  secondaryCTA: { label: 'Explore Collection', href: '/marketplace' },
};

// Trust indicators
const TRUST_INDICATORS = [
  { icon: '⚡', text: 'No gas wars' },
  { icon: '🔐', text: 'Bitcoin-secured' },
  { icon: '💰', text: 'Low fees' },
];

// Live stats (would be fetched from API in production)
const LIVE_STATS = [
  { value: '10K+', label: 'NFTs Minted' },
  { value: '2.5K+', label: 'Collectors' },
  { value: '500+', label: 'Collections' },
];

export default function Hero() {
  return (
    <section className="relative pt-32 pb-24 px-4 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {/* Gradient orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl animate-float stagger-2" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl" />
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
        
        {/* Floating particles */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-purple-400 rounded-full animate-bounce-gentle opacity-60" />
        <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce-gentle stagger-1 opacity-60" />
        <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-blue-400 rounded-full animate-bounce-gentle stagger-2 opacity-60" />
      </div>
      
      <div className="max-w-5xl mx-auto text-center relative z-10">
        {/* Status badge */}
        <div 
          className="inline-flex items-center gap-2 bg-purple-500/10 backdrop-blur-sm border border-purple-500/30 rounded-full px-5 py-2.5 mb-8 animate-fade-in-up"
          role="status"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
          </span>
          <span className="text-sm font-medium text-purple-300">Live on Stacks Mainnet</span>
        </div>
        
        {/* Main title */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-6 animate-fade-in-up stagger-1">
          Mint Your{' '}
          <span className="relative inline-block">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400">
              NFTs
            </span>
            <span className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 rounded-full opacity-50" />
          </span>
          <br />
          <span className="text-3xl sm:text-4xl md:text-5xl text-gray-300 font-semibold">
            on Bitcoin
          </span>
        </h1>
        
        {/* Description */}
        <p className="text-lg sm:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-up stagger-2">
          Create, collect, and trade unique digital assets secured by the Bitcoin blockchain through Stacks
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up stagger-3">
          <Link 
            href="/mint"
            className="group relative inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 hover:-translate-y-0.5 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              <span>Start Minting</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity" />
          </Link>
          <Link 
            href="/marketplace"
            className="group inline-flex items-center justify-center gap-2 border-2 border-purple-500/50 text-purple-400 px-8 py-4 rounded-xl font-semibold hover:bg-purple-500/10 hover:border-purple-400 transition-all duration-300 backdrop-blur-sm"
          >
            <span>Explore Collection</span>
            <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </Link>
        </div>
        
        {/* Trust indicators */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-sm text-gray-500 animate-fade-in-up stagger-4">
          {TRUST_INDICATORS.map((item, index) => (
            <div 
              key={item.text}
              className="flex items-center gap-2 bg-gray-800/30 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-700/50"
            >
              <span className="text-green-500">{item.icon}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>
        
        {/* Live stats */}
        <div className="mt-16 pt-10 border-t border-gray-800/50 animate-fade-in-up stagger-5">
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto">
            {LIVE_STATS.map((stat, index) => (
              <div key={stat.label} className="text-center group cursor-default">
                <p className="text-2xl sm:text-3xl font-bold text-white mb-1 tabular-nums group-hover:text-purple-400 transition-colors">
                  {stat.value}
                </p>
                <p className="text-xs sm:text-sm text-gray-500 uppercase tracking-wider">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="mt-16 flex flex-col items-center animate-fade-in-up stagger-6">
          <span className="text-xs text-gray-600 uppercase tracking-widest mb-3">Scroll to explore</span>
          <div className="w-6 h-10 border-2 border-gray-700 rounded-full flex justify-center p-2">
            <div className="w-1 h-2 bg-gray-500 rounded-full animate-bounce" />
          </div>
        </div>
      </div>
    </section>
  );
}
