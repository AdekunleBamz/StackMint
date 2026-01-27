/**
 * Mint Page
 * NFT minting interface with wallet balance display and feature highlights
 * @module MintPage
 * @version 2.3.0
 */

import Header from '@/components/Header';
import MintCard from '@/components/MintCard';
import WalletBalance from '@/components/WalletBalance';
import Footer from '@/components/Footer';
import Link from 'next/link';

// Mint fee configuration
const MINT_FEE_STX = 0.01;
const NETWORK_NAME = 'Stacks Mainnet';

/** Maximum mints per transaction */
const MAX_MINTS_PER_TX = 10;

/** Feature card grid columns */
const FEATURE_GRID_COLS = 4;

/**
 * Feature item configuration
 */
interface FeatureItem {
  icon: string;
  title: string;
  desc: string;
  gradient: string;
}

export default function MintPage() {
  const features: FeatureItem[] = [
    { 
      icon: '🎨', 
      title: 'Unique Tokens', 
      desc: 'Each NFT is one-of-a-kind, verified on-chain',
      gradient: 'from-purple-500/20 to-purple-600/20'
    },
    { 
      icon: '🔐', 
      title: 'Bitcoin Security', 
      desc: 'Secured by Bitcoin via Stacks L2',
      gradient: 'from-orange-500/20 to-orange-600/20'
    },
    { 
      icon: '💸', 
      title: 'Low Fees', 
      desc: 'Only 0.01 STX to mint your NFT',
      gradient: 'from-green-500/20 to-green-600/20'
    },
    { 
      icon: '⚡', 
      title: 'Fast Minting', 
      desc: 'Your NFT is ready in seconds',
      gradient: 'from-blue-500/20 to-blue-600/20'
    },
  ];

  const steps = [
    { step: 1, text: 'Connect your Stacks wallet', icon: '🔗' },
    { step: 2, text: 'Enter your NFT metadata URI (IPFS)', icon: '📝' },
    { step: 3, text: 'Pay 0.01 STX minting fee', icon: '💎' },
    { step: 4, text: 'Your NFT is minted!', icon: '🎉' },
  ];

  return (
    <main className="min-h-screen bg-gray-950 animate-fade-in">
      <Header />
      
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl" />
      </div>
      
      <div className="relative pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
            <Link href="/" className="hover:text-purple-400 transition-colors flex items-center gap-1">
              <span className="text-base">🏠</span>
              <span>Home</span>
            </Link>
            <span className="text-gray-600">/</span>
            <span className="text-white font-medium">Mint</span>
          </nav>

          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-full px-5 py-2.5 mb-6 animate-fade-in-up">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-sm text-purple-300 font-medium">Live on Stacks Mainnet</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6" style={{ animationDelay: '100ms' }}>
              Mint Your{' '}
              <span className="relative">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-orange-400">NFT</span>
                <span className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 via-pink-500 to-orange-400 rounded-full opacity-50" />
              </span>
            </h1>
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto" style={{ animationDelay: '200ms' }}>
              Create unique digital collectibles on Stacks. <br className="hidden md:block" />
              <span className="text-gray-300">Secured by Bitcoin, owned forever by you.</span>
            </p>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Mint Card - takes 3 columns */}
            <div className="lg:col-span-3">
              <MintCard />
            </div>

            {/* Sidebar - takes 2 columns */}
            <div className="lg:col-span-2 space-y-6">
              <WalletBalance />
              
              {/* How it works */}
              <div className="bg-gradient-to-br from-gray-900/90 to-gray-900/70 border border-purple-500/20 rounded-2xl p-6 backdrop-blur-sm">
                <h4 className="font-bold text-white mb-5 flex items-center gap-2">
                  <span className="text-xl">📋</span> How it works
                </h4>
                <ol className="space-y-4">
                  {steps.map(({ step, text, icon }, index) => (
                    <li 
                      key={step} 
                      className="flex items-center gap-4 group"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <span className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-600/30 to-purple-700/30 rounded-xl flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                        {icon}
                      </span>
                      <div className="flex-1">
                        <span className="text-xs text-purple-400 font-medium">Step {step}</span>
                        <p className="text-gray-300 text-sm">{text}</p>
                      </div>
                      {step < 4 && (
                        <div className="hidden sm:block w-px h-8 bg-gradient-to-b from-purple-500/30 to-transparent absolute left-5 top-full" />
                      )}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Need help? */}
              <div className="bg-gradient-to-br from-blue-900/20 to-blue-900/10 border border-blue-500/20 rounded-2xl p-6 backdrop-blur-sm">
                <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                  <span className="text-xl">💡</span> Need help?
                </h4>
                <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                  Upload your image to IPFS first, then use the resulting URI to mint your NFT. 
                  IPFS ensures your artwork is stored permanently and decentralized.
                </p>
                <a 
                  href="https://nft.storage" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-400 text-sm hover:text-blue-300 font-medium transition-colors group"
                >
                  <span>Use NFT.Storage for free IPFS hosting</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </a>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-white">1,247</p>
                  <p className="text-xs text-gray-400 mt-1">NFTs Minted</p>
                </div>
                <div className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-white">892</p>
                  <p className="text-xs text-gray-400 mt-1">Unique Creators</p>
                </div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="mt-20">
            <h2 className="text-2xl font-bold text-white text-center mb-8">
              Why Mint on <span className="text-purple-400">StacksMint</span>?
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {features.map((feature, index) => (
                <div 
                  key={feature.title}
                  className={`group bg-gradient-to-br ${feature.gradient} border border-gray-700/50 rounded-2xl p-5 text-center hover:border-purple-500/30 hover:-translate-y-1 transition-all duration-300`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <span className="text-4xl mb-3 block group-hover:scale-110 transition-transform">{feature.icon}</span>
                  <h5 className="font-semibold text-white text-sm mb-1">{feature.title}</h5>
                  <p className="text-gray-400 text-xs leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-20 text-center bg-gradient-to-r from-purple-900/20 via-pink-900/20 to-orange-900/20 border border-purple-500/20 rounded-3xl p-10">
            <h3 className="text-2xl font-bold text-white mb-4">Ready to create?</h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Join thousands of creators building their digital art legacy on Stacks.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link 
                href="/collections"
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-medium transition-colors"
              >
                Explore Collections
              </Link>
              <Link 
                href="/marketplace"
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40"
              >
                Visit Marketplace
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
