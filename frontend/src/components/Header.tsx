'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWallet } from '@/hooks/useWallet';
import WalletConnectQRModal from './WalletConnectQRModal';

export default function Header() {
  const { address, connect, connectWalletConnect, disconnect, isConnected, connecting, wcUri, showQRModal, closeQRModal } = useWallet();
  const [showWalletMenu, setShowWalletMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);
  
  const handleConnect = (type: 'stacks' | 'walletconnect') => {
    setShowWalletMenu(false);
    if (type === 'walletconnect') {
      connectWalletConnect();
    } else {
      connect('stacks');
    }
  };

  const navLinks = [
    { href: '/mint', label: 'Mint', icon: '✨', ariaLabel: 'Go to NFT minting page' },
    { href: '/collections', label: 'Collections', icon: '📦', ariaLabel: 'Browse NFT collections' },
    { href: '/marketplace', label: 'Marketplace', icon: '🏪', ariaLabel: 'Visit the NFT marketplace' },
    { href: '/profile', label: 'Profile', icon: '👤', ariaLabel: 'View your profile' },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-black/90 backdrop-blur-xl border-b border-purple-500/20 py-3' 
          : 'bg-transparent py-4'
      }`}>
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl group-hover:scale-110 transition-transform">💎</span>
            <span className="text-xl font-bold text-white">StacksMint</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-1 bg-gray-900/50 rounded-full px-2 py-1 border border-gray-700/50">
            {navLinks.map((link) => (
              <Link 
                key={link.href}
                href={link.href} 
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  isActive(link.href)
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-400 hover:text-white"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Wallet Connection */}
          <div className="hidden md:block">
            {isConnected ? (
              <div className="flex items-center gap-3">
                <Link 
                  href="/profile" 
                  className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-full transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
                  <span className="text-sm text-gray-300">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
                </Link>
                <button 
                  onClick={disconnect}
                  className="bg-gray-800 hover:bg-red-600/20 hover:text-red-400 text-gray-400 px-4 py-2 rounded-full text-sm transition-all"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <div className="relative">
                <button 
                  onClick={() => setShowWalletMenu(!showWalletMenu)}
                  disabled={connecting}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 disabled:from-purple-800 disabled:to-purple-900 text-white px-6 py-2.5 rounded-full flex items-center gap-2 font-medium shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all"
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
                  <div className="absolute right-0 mt-3 w-72 bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-purple-500/30 shadow-2xl overflow-hidden animate-fade-in">
                    <div className="p-3 border-b border-gray-700/50">
                      <p className="text-xs text-gray-400 uppercase tracking-wider">Connect your wallet</p>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={() => handleConnect('stacks')}
                        className="w-full flex items-center gap-3 p-3 hover:bg-purple-600/20 rounded-xl transition-colors text-left group"
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                          <span className="text-2xl">🔗</span>
                        </div>
                        <div>
                          <p className="text-white font-medium">Hiro / Leather</p>
                          <p className="text-gray-400 text-sm">Browser extension</p>
                        </div>
                      </button>
                      
                      <button
                        onClick={() => handleConnect('walletconnect')}
                        className="w-full flex items-center gap-3 p-3 hover:bg-blue-600/20 rounded-xl transition-colors text-left group"
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                          <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
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
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-gray-900/95 backdrop-blur-xl border-b border-purple-500/20 animate-fade-in">
            <nav className="p-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive(link.href)
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <span>{link.icon}</span>
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 border-t border-gray-700">
                {isConnected ? (
                  <button
                    onClick={disconnect}
                    className="w-full py-3 text-red-400 hover:bg-red-600/10 rounded-xl transition-colors"
                  >
                    Disconnect Wallet
                  </button>
                ) : (
                  <button
                    onClick={() => setShowWalletMenu(!showWalletMenu)}
                    className="w-full py-3 bg-purple-600 text-white rounded-xl font-medium"
                  >
                    Connect Wallet
                  </button>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>
      
      {/* WalletConnect QR Modal */}
      {showQRModal && wcUri && (
        <WalletConnectQRModal uri={wcUri} onClose={closeQRModal} />
      )}
    </>
  );
}
