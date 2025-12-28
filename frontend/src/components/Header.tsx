'use client';

import Link from 'next/link';
import { useWallet } from '@/hooks/useWallet';

export default function Header() {
  const { address, connect, disconnect, isConnected } = useWallet();
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-purple-500/20">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">💎</span>
          <span className="text-xl font-bold text-white">StacksMint</span>
        </Link>
        <nav className="hidden md:flex gap-6 text-gray-300">
          <Link href="/mint" className="hover:text-purple-500 transition-colors">Mint</Link>
          <Link href="/collections" className="hover:text-purple-500 transition-colors">Collections</Link>
          <Link href="/marketplace" className="hover:text-purple-500 transition-colors">Marketplace</Link>
          <Link href="/profile" className="hover:text-purple-500 transition-colors">Profile</Link>
        </nav>
        {isConnected ? (
          <div className="flex items-center gap-3">
            <Link href="/profile" className="text-sm text-gray-400 hover:text-purple-500">
              {address?.slice(0, 8)}...
            </Link>
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
