'use client';

import { useWallet } from '@/hooks/useWallet';

export default function Header() {
  const { address, connect, disconnect, isConnected } = useWallet();
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-purple-500/20">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-2xl">💎</span>
          <span className="text-xl font-bold text-white">StacksMint</span>
        </div>
        <nav className="hidden md:flex gap-6 text-gray-300">
          <a href="#mint" className="hover:text-purple-500">Mint</a>
          <a href="#collections" className="hover:text-purple-500">Collections</a>
          <a href="#marketplace" className="hover:text-purple-500">Marketplace</a>
        </nav>
        {isConnected ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">{address?.slice(0, 8)}...</span>
            <button 
              onClick={disconnect}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button 
            onClick={connect}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg"
          >
            Connect Wallet
          </button>
        )}
      </div>
    </header>
  );
}
