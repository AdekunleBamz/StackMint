'use client';

/**
 * MobileMenu Component
 * Responsive mobile navigation menu with animations
 * @module MobileMenu
 * @version 2.2.0
 */

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Icon size configuration
const ICON_SIZE_CLASS = 'w-5 h-5';
const STROKE_WIDTH = 2;

/** Menu slide animation duration */
const MENU_ANIMATION_DURATION = 300;

/** Menu backdrop opacity */
const BACKDROP_OPACITY = 0.5;

/**
 * Menu state for animations
 */
type MenuState = 'closed' | 'opening' | 'open' | 'closing';

/**
 * Navigation link configuration
 */
interface NavLink {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const navLinks = [
  { href: '/mint', label: 'Mint', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  )},
  { href: '/collections', label: 'Collections', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  )},
  { href: '/marketplace', label: 'Marketplace', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  )},
  { href: '/profile', label: 'Profile', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )},
];

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <div className="md:hidden">
      {/* Hamburger Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-10 h-10 flex items-center justify-center text-white focus:outline-none"
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
      >
        <div className="relative w-6 h-5">
          <span className={`absolute left-0 w-6 h-0.5 bg-white rounded-full transition-all duration-300 ${
            isOpen ? 'top-2 rotate-45' : 'top-0'
          }`} />
          <span className={`absolute left-0 top-2 w-6 h-0.5 bg-white rounded-full transition-all duration-300 ${
            isOpen ? 'opacity-0 scale-0' : 'opacity-100'
          }`} />
          <span className={`absolute left-0 w-6 h-0.5 bg-white rounded-full transition-all duration-300 ${
            isOpen ? 'top-2 -rotate-45' : 'top-4'
          }`} />
        </div>
      </button>

      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Slide-in Menu */}
      <div className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-gray-900 z-50 transform transition-transform duration-300 ease-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Menu Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-white font-bold">StacksMint</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-2">
          {navLinks.map((link, index) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <span className={isActive ? 'text-white' : 'text-gray-500'}>{link.icon}</span>
                <span className="font-medium">{link.label}</span>
                {isActive && (
                  <svg className="w-5 h-5 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="mx-4 my-4 border-t border-gray-800" />

        {/* Quick Stats */}
        <div className="px-4 space-y-3">
          <div className="flex items-center gap-3 px-4 py-3 bg-gray-800/50 rounded-xl">
            <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </div>
            <div>
              <p className="text-white font-medium text-sm">Mainnet</p>
              <p className="text-gray-500 text-xs">Connected to Stacks</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
          <div className="flex items-center justify-between text-gray-500 text-xs">
            <span>© 2024 StacksMint</span>
            <div className="flex gap-4">
              <a href="#" className="hover:text-purple-400 transition-colors">Terms</a>
              <a href="#" className="hover:text-purple-400 transition-colors">Privacy</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
