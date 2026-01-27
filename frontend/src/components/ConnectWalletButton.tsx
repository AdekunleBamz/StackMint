'use client';

/**
 * ConnectWalletButton Component
 * Unified wallet connection button with multiple wallet options
 * @module components/ConnectWalletButton
 * @version 1.0.0
 */

import { useState, useRef, useEffect, memo } from 'react';
import { useWallet } from '@/hooks/useWallet';

type WalletProvider = 'stacks' | 'walletconnect' | 'xverse' | 'leather';

interface WalletOption {
  id: WalletProvider;
  name: string;
  icon: string;
  description: string;
  recommended?: boolean;
}

const walletOptions: WalletOption[] = [
  {
    id: 'leather',
    name: 'Leather',
    icon: '👛',
    description: 'Popular Stacks wallet',
    recommended: true,
  },
  {
    id: 'xverse',
    name: 'Xverse',
    icon: '🔐',
    description: 'Bitcoin & Stacks wallet',
  },
  {
    id: 'stacks',
    name: 'Hiro Wallet',
    icon: '🌐',
    description: 'Browser extension',
  },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    icon: '📱',
    description: 'Mobile wallets via QR',
  },
];

interface ConnectWalletButtonProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'gradient' | 'outline';
  showBalance?: boolean;
  className?: string;
}

function ConnectWalletButtonComponent({
  size = 'md',
  variant = 'gradient',
  showBalance = true,
  className = '',
}: ConnectWalletButtonProps) {
  const { address, isConnected, connecting, connect, disconnect, shortAddress } = useWallet();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showWalletSelect, setShowWalletSelect] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [balance, setBalance] = useState<number | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        setShowWalletSelect(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Simulate fetching balance
  useEffect(() => {
    if (isConnected) {
      // In production, fetch actual balance
      setBalance(Math.random() * 1000);
    }
  }, [isConnected]);

  const handleConnect = async (provider: WalletProvider) => {
    setShowWalletSelect(false);
    if (provider === 'walletconnect') {
      // Handle WalletConnect separately
      connect('walletconnect');
    } else {
      connect('stacks');
    }
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const variantClasses = {
    default: 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700',
    gradient: 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white shadow-lg shadow-purple-500/25',
    outline: 'bg-transparent border-2 border-purple-500/50 text-purple-400 hover:bg-purple-500/10 hover:border-purple-400',
  };

  if (isConnected && address) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className={`
            flex items-center gap-3 rounded-xl transition-all
            ${sizeClasses[size]}
            bg-gray-800/80 hover:bg-gray-700 border border-gray-700
            ${className}
          `}
        >
          {/* Avatar */}
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
            {shortAddress?.charAt(0) || '?'}
          </div>
          
          {/* Address & Balance */}
          <div className="text-left">
            <p className="font-medium text-white">{shortAddress}</p>
            {showBalance && balance !== null && (
              <p className="text-xs text-gray-400">{balance.toFixed(2)} STX</p>
            )}
          </div>
          
          {/* Dropdown arrow */}
          <svg 
            className={`w-4 h-4 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Connected Dropdown */}
        {showDropdown && (
          <div className="absolute right-0 top-full mt-2 w-64 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in-down">
            {/* Balance Card */}
            <div className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-b border-gray-800">
              <p className="text-xs text-gray-400 mb-1">Total Balance</p>
              <p className="text-2xl font-bold text-white">{balance?.toFixed(2)} STX</p>
              <p className="text-sm text-gray-400">${((balance || 0) * 0.5).toFixed(2)} USD</p>
            </div>
            
            {/* Actions */}
            <div className="p-2">
              <a
                href={`https://explorer.stacks.co/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2.5 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                <span>🔍</span>
                <span>View on Explorer</span>
              </a>
              <button
                onClick={() => navigator.clipboard.writeText(address)}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                <span>📋</span>
                <span>Copy Address</span>
              </button>
              <button
                onClick={() => setShowDropdown(false)}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                <span>👤</span>
                <span>My Profile</span>
              </button>
              <hr className="my-2 border-gray-800" />
              <button
                onClick={() => {
                  disconnect();
                  setShowDropdown(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <span>🚪</span>
                <span>Disconnect</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowWalletSelect(!showWalletSelect)}
        disabled={connecting}
        className={`
          inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
      >
        {connecting ? (
          <>
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Connecting...
          </>
        ) : (
          <>
            <span>🔗</span>
            Connect Wallet
          </>
        )}
      </button>

      {/* Wallet Selection Dropdown */}
      {showWalletSelect && !connecting && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in-down">
          <div className="p-4 border-b border-gray-800">
            <h3 className="font-semibold text-white">Connect Wallet</h3>
            <p className="text-sm text-gray-400 mt-1">Choose your preferred wallet</p>
          </div>
          
          <div className="p-2">
            {walletOptions.map((wallet) => (
              <button
                key={wallet.id}
                onClick={() => handleConnect(wallet.id)}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors group"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">{wallet.icon}</span>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{wallet.name}</span>
                    {wallet.recommended && (
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{wallet.description}</p>
                </div>
                <svg className="w-5 h-5 text-gray-600 group-hover:text-purple-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
          
          <div className="p-4 bg-gray-800/50 border-t border-gray-800">
            <p className="text-xs text-gray-500 text-center">
              By connecting, you agree to our Terms of Service
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(ConnectWalletButtonComponent);
