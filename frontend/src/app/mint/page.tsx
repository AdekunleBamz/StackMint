/**
 * Mint Page
 * NFT minting interface with wallet balance display and feature highlights
 * @module MintPage
 * @version 2.2.0
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
}

export default function MintPage() {
  const features = [
    { icon: '🎨', title: 'Unique Tokens', desc: 'Each NFT is one-of-a-kind' },
    { icon: '🔐', title: 'Bitcoin Security', desc: 'Secured by Bitcoin via Stacks' },
    { icon: '💸', title: 'Low Fees', desc: 'Only 0.01 STX to mint' },
    { icon: '⚡', title: 'Fast Minting', desc: 'Ready in seconds' },
  ];

  return (
    <main className="animate-fade-in">
      <Header />
      <div className="pt-32 pb-20 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
            <Link href="/" className="hover:text-purple-400 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-white">Mint</span>
          </nav>

          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-full px-4 py-2 mb-4">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-purple-300">Live on Stacks Mainnet</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Mint Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">NFT</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Create unique digital collectibles on Stacks. Secured by Bitcoin, owned by you.
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
              <div className="bg-gradient-to-br from-gray-900/80 to-gray-900/50 border border-purple-500/20 rounded-2xl p-6">
                <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-xl">📋</span> How it works
                </h4>
                <ol className="space-y-4">
                  {[
                    { step: 1, text: 'Connect your Stacks wallet' },
                    { step: 2, text: 'Enter your NFT metadata URI (IPFS)' },
                    { step: 3, text: 'Pay 0.01 STX minting fee' },
                    { step: 4, text: 'Your NFT is minted!' },
                  ].map(({ step, text }) => (
                    <li key={step} className="flex items-center gap-3">
                      <span className="flex-shrink-0 w-8 h-8 bg-purple-600/20 rounded-lg flex items-center justify-center text-purple-400 font-bold text-sm">
                        {step}
                      </span>
                      <span className="text-gray-300">{text}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Need help? */}
              <div className="bg-blue-900/20 border border-blue-500/20 rounded-2xl p-6">
                <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                  <span>💡</span> Need help?
                </h4>
                <p className="text-gray-400 text-sm mb-4">
                  Upload your image to IPFS first, then use the resulting URI to mint your NFT.
                </p>
                <a 
                  href="https://nft.storage" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 text-sm hover:text-blue-300 flex items-center gap-1"
                >
                  Use NFT.Storage for free IPFS hosting →
                </a>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map((feature) => (
              <div 
                key={feature.title}
                className="bg-gray-900/30 border border-gray-700/50 rounded-xl p-4 text-center hover:border-purple-500/30 transition-colors"
              >
                <span className="text-3xl mb-2 block">{feature.icon}</span>
                <h5 className="font-semibold text-white text-sm">{feature.title}</h5>
                <p className="text-gray-500 text-xs mt-1">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
