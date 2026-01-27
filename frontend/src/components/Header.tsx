'use client';

/**
 * Header Component
 * Main navigation header with wallet connection and mobile menu
 * @module Header
 * @version 3.0.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWallet } from '@/hooks/useWallet';
import WalletConnectQRModal from './WalletConnectQRModal';

// Scroll detection threshold
const SCROLL_THRESHOLD = 20;

/** Header height in pixels */
const HEADER_HEIGHT = 80;

/** Mobile menu breakpoint */
const MOBILE_BREAKPOINT = 768;

/** Animation duration for menu transitions */
const MENU_ANIMATION_DURATION = 200;

// Wallet connection types
type WalletConnectionType = 'stacks' | 'walletconnect';

/**
 * Navigation link configuration
 */
interface NavLinkConfig {
  href: string;
  label: string;
  icon: string;
  ariaLabel: string;
}

export default function Header() {
  const { address, connect, connectWalletConnect, disconnect, isConnected, connecting, wcUri, showQRModal, closeQRModal } = useWallet();
  const [showWalletMenu, setShowWalletMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const walletMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setShowWalletMenu(false);
  }, [pathname]);

  // Close wallet menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (walletMenuRef.current && !walletMenuRef.current.contains(event.target as Node)) {
        setShowWalletMenu(false);
      }
    };

    if (showWalletMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showWalletMenu]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);
  
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

  const handleMobileMenuToggle = useCallback(() => {
    setMobileMenuOpen(prev => !prev);
  }, []);

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled 
            ? 'bg-gray-900/95 backdrop-blur-xl border-b border-purple-500/20 py-3 shadow-lg shadow-black/10' 
            : 'bg-transparent py-4'
        }`}
        role="banner"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center gap-2.5 group"
            aria-label="StacksMint Home"
          >
            <span className="text-2xl group-hover:scale-110 transition-transform duration-300">💎</span>
            <span className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">
              StacksMint
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav 
            className="hidden md:flex gap-1 bg-gray-900/50 backdrop-blur-sm rounded-full px-2 py-1.5 border border-gray-700/50"
            role="navigation"
            aria-label="Main navigation"
          >
            {navLinks.map((link) => (
              <Link 
                key={link.href}
                href={link.href} 
                aria-label={link.ariaLabel}
                aria-current={isActive(link.href) ? 'page' : undefined}
                className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  isActive(link.href)
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800/70'
                }`}
              >
                <span className="relative z-10">{link.label}</span>
                {isActive(link.href) && (
                  <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full animate-pulse-glow" />
                )}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={handleMobileMenuToggle}
            className="md:hidden relative p-2.5 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl transition-all duration-200"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
          >
            <span className="sr-only">{mobileMenuOpen ? 'Close menu' : 'Open menu'}</span>
            <div className="w-5 h-5 relative">
              <span 
                className={`absolute left-0 block w-5 h-0.5 bg-current transform transition-all duration-300 ${
                  mobileMenuOpen ? 'top-2 rotate-45' : 'top-1'
                }`}
              />
              <span 
                className={`absolute left-0 top-2 block w-5 h-0.5 bg-current transition-all duration-200 ${
                  mobileMenuOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
                }`}
              />
              <span 
                className={`absolute left-0 block w-5 h-0.5 bg-current transform transition-all duration-300 ${
                  mobileMenuOpen ? 'top-2 -rotate-45' : 'top-3'
                }`}
              />
            </div>
          </button>

          {/* Wallet Connection */}
          <div className="hidden md:block" ref={walletMenuRef}>
            {isConnected ? (
              <div className="flex items-center gap-3">
                <Link 
                  href="/profile" 
                  className="flex items-center gap-2.5 bg-gray-800/80 hover:bg-gray-700/80 px-4 py-2.5 rounded-full transition-all duration-200 border border-gray-700/50 hover:border-gray-600/50 group"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 ring-2 ring-purple-500/20 group-hover:ring-purple-500/40 transition-all" />
                  <span className="text-sm text-gray-300 font-medium group-hover:text-white transition-colors">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </span>
                </Link>
                <button 
                  onClick={disconnect}
                  className="p-2.5 bg-gray-800/80 hover:bg-red-600/20 text-gray-400 hover:text-red-400 rounded-full transition-all duration-200 border border-gray-700/50 hover:border-red-500/30"
                  aria-label="Disconnect wallet"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
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
        <div
          id="mobile-menu"
          className={`md:hidden fixed inset-x-0 top-[72px] bottom-0 bg-gray-950/98 backdrop-blur-xl transform transition-all duration-300 ease-out ${
            mobileMenuOpen 
              ? 'translate-y-0 opacity-100 pointer-events-auto' 
              : '-translate-y-4 opacity-0 pointer-events-none'
          }`}
          aria-hidden={!mobileMenuOpen}
        >
          <div className="h-full overflow-y-auto pb-safe">
            <nav className="p-4 space-y-2" role="navigation" aria-label="Mobile navigation">
              {navLinks.map((link, index) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-4 rounded-2xl transition-all duration-300 ${
                    isActive(link.href)
                      ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/20'
                      : 'text-gray-300 hover:bg-gray-800/70 hover:text-white'
                  }`}
                  style={{ 
                    transitionDelay: mobileMenuOpen ? `${index * 50}ms` : '0ms',
                    opacity: mobileMenuOpen ? 1 : 0,
                    transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-20px)'
                  }}
                >
                  <span className="text-xl">{link.icon}</span>
                  <span className="font-medium">{link.label}</span>
                  {isActive(link.href) && (
                    <span className="ml-auto">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  )}
                </Link>
              ))}
              
              {/* Wallet Section */}
              <div className="pt-6 mt-4 border-t border-gray-800">
                <p className="px-4 pb-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Wallet
                </p>
                {isConnected ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 px-4 py-3 bg-gray-800/50 rounded-xl">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {address?.slice(0, 8)}...{address?.slice(-6)}
                        </p>
                        <p className="text-xs text-gray-400">Connected</p>
                      </div>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    </div>
                    <button
                      onClick={disconnect}
                      className="w-full py-3.5 text-red-400 hover:bg-red-600/10 rounded-xl transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Disconnect Wallet
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleConnect('stacks');
                      }}
                      className="w-full py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20"
                    >
                      <span className="text-lg">🔗</span>
                      Connect with Hiro/Leather
                    </button>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleConnect('walletconnect');
                      }}
                      className="w-full py-4 bg-gray-800 text-white rounded-xl font-medium flex items-center justify-center gap-2 border border-gray-700"
                    >
                      <span className="text-lg">📱</span>
                      Connect with WalletConnect
                    </button>
                  </div>
                )}
              </div>
            </nav>
          </div>
        </div>
      </header>
      
      {/* WalletConnect QR Modal */}
      {showQRModal && wcUri && (
        <WalletConnectQRModal uri={wcUri} onClose={closeQRModal} />
      )}
    </>
  );
}
