import { Suspense, lazy } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Stats from '@/components/Stats';
import Features from '@/components/Features';
import MintCard from '@/components/MintCard';
import NFTGrid from '@/components/NFTGrid';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';

/**
 * Home Page
 * Main landing page for StacksMint platform
 * @module pages/Home
 */

// Skeleton item count constants
const STATS_SKELETON_COUNT = 4;
const NFT_GRID_SKELETON_COUNT = 8;

// Loading skeletons for each section
function StatsSkeleton() {
  return (
    <div className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[...Array(STATS_SKELETON_COUNT)].map((_, i) => (
            <div key={i} className="bg-gray-800/50 rounded-2xl p-6 animate-pulse">
              <div className="h-4 w-16 bg-gray-700 rounded mb-2" />
              <div className="h-8 w-24 bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function NFTGridSkeleton() {
  return (
    <div className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="h-8 w-48 bg-gray-700 rounded mb-8 mx-auto" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(NFT_GRID_SKELETON_COUNT)].map((_, i) => (
            <div key={i} className="bg-gray-800/50 rounded-2xl overflow-hidden animate-pulse">
              <div className="aspect-square bg-gray-700" />
              <div className="p-4 space-y-3">
                <div className="h-4 w-3/4 bg-gray-700 rounded" />
                <div className="h-3 w-1/2 bg-gray-700 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Decorative background elements
function BackgroundDecoration() {
  return (
    <>
      {/* Top gradient */}
      <div 
        className="fixed top-0 left-0 right-0 h-[600px] pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(249, 115, 22, 0.15), transparent)',
        }}
      />
      
      {/* Grid pattern overlay */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Floating orbs */}
      <div className="fixed top-20 left-10 w-72 h-72 bg-orange-500/10 rounded-full blur-[100px] pointer-events-none z-0 animate-pulse" />
      <div className="fixed top-40 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none z-0 animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="fixed bottom-20 left-1/3 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none z-0 animate-pulse" style={{ animationDelay: '2s' }} />
    </>
  );
}

// Section wrapper with intersection observer trigger
function Section({ 
  id, 
  children, 
  className = '',
  ariaLabel,
}: { 
  id?: string;
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <section 
      id={id}
      aria-label={ariaLabel}
      className={`relative ${className}`}
    >
      {children}
    </section>
  );
}

// Mint section with enhanced styling
function MintSection() {
  return (
    <Section 
      id="mint" 
      ariaLabel="Mint NFTs"
      className="py-20 px-4 relative"
    >
      {/* Section background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-500/5 to-transparent pointer-events-none" />
      
      <div className="max-w-6xl mx-auto relative">
        {/* Section header */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full text-orange-400 text-sm font-medium mb-4">
            🎨 Start Creating
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Mint Your First NFT
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Join thousands of creators and start minting unique digital assets on Stacks.
            <span className="text-orange-400 font-medium"> Just 0.01 STX to get started.</span>
          </p>
        </div>

        {/* Mint card with glow effect */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-purple-500/20 to-blue-500/20 rounded-3xl blur-2xl opacity-50" />
          <div className="relative">
            <MintCard />
          </div>
        </div>

        {/* Trust indicators */}
        <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Secured by Bitcoin</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Instant Minting</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Low Fees</span>
          </div>
        </div>
      </div>
    </Section>
  );
}

// NFT showcase section with enhanced header
function NFTShowcaseSection() {
  return (
    <Section 
      id="explore" 
      ariaLabel="Explore NFTs"
      className="py-20 px-4"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-sm font-medium mb-4">
            🔥 Trending Now
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Discover Amazing NFTs
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Explore the latest and most popular NFTs created by our community.
          </p>
        </div>

        {/* NFT Grid */}
        <Suspense fallback={<NFTGridSkeleton />}>
          <NFTGrid />
        </Suspense>

        {/* View more button */}
        <div className="mt-12 text-center">
          <a 
            href="/marketplace"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-full text-white font-medium transition-all duration-300 group"
          >
            <span>Explore All NFTs</span>
            <svg 
              className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </Section>
  );
}

export default function Home() {
  return (
    <main className="relative min-h-screen">
      <BackgroundDecoration />
      
      {/* Content layers */}
      <div className="relative z-10">
        <Header />
        
        {/* Hero section with fade-in */}
        <div className="animate-fade-in">
          <Hero />
        </div>

        {/* Stats with stagger animation */}
        <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <Suspense fallback={<StatsSkeleton />}>
            <Stats />
          </Suspense>
        </div>

        {/* Features */}
        <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <Features />
        </div>

        {/* Mint section */}
        <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <MintSection />
        </div>

        {/* NFT Showcase */}
        <div className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <NFTShowcaseSection />
        </div>

        {/* CTA */}
        <div className="animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <CTASection />
        </div>

        <Footer />
      </div>

      {/* Scroll to top button - shows after scrolling */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 z-50 p-3 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg shadow-orange-500/25 opacity-0 hover:opacity-100 focus:opacity-100 transition-all duration-300 group"
        aria-label="Scroll to top"
      >
        <svg className="w-6 h-6 transform group-hover:-translate-y-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </main>
  );
}
