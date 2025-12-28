'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useWallet } from '@/hooks/useWallet';
import WalletConnectQRModal from './WalletConnectQRModal';

export default function Header() {
  const { address, connect, connectWalletConnect, disconnect, isConnected, connecting, wcUri, showQRModal, closeQRModal } = useWallet();
  const [showWalletMenu, setShowWalletMenu] = useState(false);
  
  const handleConnect = (type: 'stacks' | 'walletconnect') => {
    setShowWalletMenu(false);
    if (type === 'walletconnect') {
      connectWalletConnect();
    } else {
      connect('stacks');
    }
  };

  return (
    <>
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
            <div className="relative">
              <button 
                onClick={() => setShowWalletMenu(!showWalletMenu)}
                disabled={connecting}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white px-6 py-2 rounded-lg flex items-center gap-2"
              >
                {connecting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Connecting...
                  </>
                ) : (
                  'Connect Wallet'
                )}
              </button>
              
              {showWalletMenu && !connecting && (
                <div className="absolute right-0 mt-2 w-64 bg-gray-900 rounded-xl border border-purple-500/30 shadow-xl overflow-hidden">
                  <div className="p-2">
                    <button
                      onClick={() => handleConnect('stacks')}
                      className="w-full flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg transition-colors text-left"
                    >
                      <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-xl">🔗</span>
                      </div>
                      <div>
                        <p className="text-white font-medium">Hiro / Leather</p>
                        <p className="text-gray-400 text-sm">Browser extension</p>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => handleConnect('walletconnect')}
                      className="w-full flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg transition-colors text-left"
                    >
                      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M6.09 10.89c3.26-3.19 8.55-3.19 11.82 0l.39.38c.16.16.16.42 0 .58l-1.34 1.31c-.08.08-.21.08-.29 0l-.54-.53c-2.27-2.22-5.96-2.22-8.24 0l-.58.57c-.08.08-.21.08-.29 0L5.68 11.9c-.16-.16-.16-.42 0-.58l.41-.43zm14.6 2.71l1.19 1.17c.16.16.16.42 0 .58l-5.38 5.27c-.16.16-.43.16-.59 0l-3.82-3.74c-.04-.04-.11-.04-.15 0l-3.82 3.74c-.16.16-.43.16-.59 0L2.15 15.35c-.16-.16-.16-.42 0-.58l1.19-1.17c.16-.16.43-.16.59 0l3.82 3.74c.04.04.11.04.15 0l3.82-3.74c.16-.16.43-.16.59 0l3.82 3.74c.04.04.11.04.15 0l3.82-3.74c.16-.16.43-.16.59 0z"/>
                        </svg>
                      </div>
                      <div>
                        <p className="text-white font-medium">WalletConnect</p>
                        <p className="text-gray-400 text-sm">Xverse, Leather mobile</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </header>
      
      {/* WalletConnect QR Modal */}
      {showQRModal && wcUri && (
        <WalletConnectQRModal uri={wcUri} onClose={closeQRModal} />
      )}
    </>
  );
}
