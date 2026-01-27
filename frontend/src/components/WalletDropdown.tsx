'use client';

/**
 * WalletDropdown Component
 * Dropdown menu for wallet actions and account management
 * @module components/WalletDropdown
 * @version 1.0.0
 */

import { useState, useRef, useEffect, useCallback } from 'react';

/** Dropdown animation duration in ms */
const ANIMATION_DURATION = 150;

/** Menu item types */
type MenuItemType = 'link' | 'action' | 'divider';

interface WalletInfo {
  address: string;
  balance: number;
  network: 'mainnet' | 'testnet';
}

interface MenuItem {
  type: MenuItemType;
  label?: string;
  icon?: string;
  onClick?: () => void;
  href?: string;
  danger?: boolean;
}

interface WalletDropdownProps {
  /** Wallet information */
  wallet: WalletInfo;
  /** Callback when disconnecting wallet */
  onDisconnect: () => void;
  /** Callback when copying address */
  onCopyAddress?: () => void;
  /** Custom className */
  className?: string;
  /** Show balance in dropdown trigger */
  showBalance?: boolean;
  /** Avatar image URL */
  avatarUrl?: string;
}

export default function WalletDropdown({
  wallet,
  onDisconnect,
  onCopyAddress,
  className = '',
  showBalance = true,
  avatarUrl,
}: WalletDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Truncate address for display
  const truncatedAddress = `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`;

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleCopyAddress = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      onCopyAddress?.();
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  }, [wallet.address, onCopyAddress]);

  const menuItems: MenuItem[] = [
    {
      type: 'action',
      label: copied ? 'Copied!' : 'Copy Address',
      icon: copied ? '✓' : '📋',
      onClick: handleCopyAddress,
    },
    {
      type: 'link',
      label: 'View on Explorer',
      icon: '🔍',
      href: `https://explorer.hiro.so/address/${wallet.address}?chain=mainnet`,
    },
    { type: 'divider' },
    {
      type: 'link',
      label: 'My Profile',
      icon: '👤',
      href: '/profile',
    },
    {
      type: 'link',
      label: 'My NFTs',
      icon: '🖼️',
      href: '/profile?tab=nfts',
    },
    {
      type: 'link',
      label: 'Activity',
      icon: '📋',
      href: '/profile?tab=activity',
    },
    { type: 'divider' },
    {
      type: 'link',
      label: 'Settings',
      icon: '⚙️',
      href: '/profile?tab=settings',
    },
    { type: 'divider' },
    {
      type: 'action',
      label: 'Disconnect',
      icon: '🔌',
      onClick: onDisconnect,
      danger: true,
    },
  ];

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-3 py-2 
          bg-gray-800 hover:bg-gray-700 
          border border-gray-700 hover:border-gray-600
          rounded-xl transition-all duration-200
          ${isOpen ? 'ring-2 ring-purple-500/50' : ''}
        `}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* Avatar */}
        <div className="relative">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
              {wallet.address.slice(2, 4).toUpperCase()}
            </div>
          )}
          {/* Online indicator */}
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-gray-800 rounded-full" />
        </div>

        {/* Address & Balance */}
        <div className="hidden sm:flex flex-col items-start">
          <span className="text-sm font-medium text-white">{truncatedAddress}</span>
          {showBalance && (
            <span className="text-xs text-gray-400">{wallet.balance.toFixed(2)} STX</span>
          )}
        </div>

        {/* Chevron */}
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-64 bg-gray-900 border border-gray-700 rounded-xl shadow-xl overflow-hidden z-50 animate-fade-in"
          role="menu"
          aria-orientation="vertical"
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center gap-3">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-lg font-bold">
                  {wallet.address.slice(2, 4).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">{truncatedAddress}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-500/10 text-green-400 text-xs rounded-full">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                    {wallet.network}
                  </span>
                </div>
              </div>
            </div>

            {/* Balance */}
            <div className="mt-3 p-3 bg-gray-800/50 rounded-lg">
              <div className="text-xs text-gray-400 mb-1">Balance</div>
              <div className="text-xl font-bold text-white">{wallet.balance.toFixed(4)} STX</div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {menuItems.map((item, index) => {
              if (item.type === 'divider') {
                return <div key={index} className="my-2 border-t border-gray-800" />;
              }

              const Component = item.href ? 'a' : 'button';
              const props = item.href ? { href: item.href } : { onClick: item.onClick };

              return (
                <Component
                  key={index}
                  {...props}
                  className={`
                    w-full flex items-center gap-3 px-4 py-2.5 text-left
                    transition-colors duration-150
                    ${item.danger 
                      ? 'text-red-400 hover:bg-red-500/10' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }
                  `}
                  role="menuitem"
                  onClick={() => {
                    item.onClick?.();
                    if (!item.onClick) setIsOpen(false);
                  }}
                >
                  <span className="text-base w-5 text-center">{item.icon}</span>
                  <span className="text-sm font-medium">{item.label}</span>
                </Component>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
