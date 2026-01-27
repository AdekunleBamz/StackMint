/**
 * StacksMint UI Utilities
 * Common helper functions for UI components
 * @module lib/ui-utils
 * @version 1.0.0
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ============================================================================
// Class Name Utilities
// ============================================================================

/**
 * Merge Tailwind CSS classes with proper conflict resolution
 * Uses clsx for conditional classes and tailwind-merge for deduplication
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ============================================================================
// Address Formatting
// ============================================================================

/**
 * Format a blockchain address for display
 * @param address - Full address string
 * @param startChars - Number of characters to show at start (default: 6)
 * @param endChars - Number of characters to show at end (default: 4)
 */
export function formatAddress(
  address: string,
  startChars: number = 6,
  endChars: number = 4
): string {
  if (!address) return '';
  if (address.length <= startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Check if an address is valid Stacks address
 */
export function isValidStacksAddress(address: string): boolean {
  if (!address) return false;
  // Stacks addresses start with SP (mainnet) or ST (testnet)
  return /^S[PT][A-Z0-9]{38,}$/i.test(address);
}

// ============================================================================
// Number Formatting
// ============================================================================

/**
 * Format a number with locale-aware separators
 */
export function formatNumber(
  value: number,
  options: Intl.NumberFormatOptions = {}
): string {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
    ...options,
  }).format(value);
}

/**
 * Format a number as currency (STX)
 */
export function formatSTX(
  value: number,
  showSymbol: boolean = true
): string {
  const formatted = formatNumber(value, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6,
  });
  return showSymbol ? `${formatted} STX` : formatted;
}

/**
 * Format a number as compact notation (1K, 1M, etc.)
 */
export function formatCompact(value: number): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1,
  }).format(value);
}

/**
 * Format a number as percentage
 */
export function formatPercent(
  value: number,
  decimals: number = 1
): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

// ============================================================================
// Date Formatting
// ============================================================================

/**
 * Format a date relative to now (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return then.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: diffDays > 365 ? 'numeric' : undefined,
  });
}

/**
 * Format a date for display
 */
export function formatDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {}
): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options,
  });
}

// ============================================================================
// String Utilities
// ============================================================================

/**
 * Truncate a string to a maximum length
 */
export function truncate(
  str: string,
  maxLength: number,
  suffix: string = '...'
): string {
  if (!str || str.length <= maxLength) return str;
  return str.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * Capitalize the first letter of a string
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Convert a string to title case
 */
export function toTitleCase(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Generate a slug from a string
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ============================================================================
// Rarity Utilities
// ============================================================================

type RarityLevel = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';

/**
 * Get color classes for a rarity level
 */
export function getRarityColors(rarity: RarityLevel | string): {
  text: string;
  bg: string;
  border: string;
  glow: string;
} {
  const colors: Record<string, { text: string; bg: string; border: string; glow: string }> = {
    Common: {
      text: 'text-gray-400',
      bg: 'bg-gray-500/20',
      border: 'border-gray-500/30',
      glow: '',
    },
    Uncommon: {
      text: 'text-green-400',
      bg: 'bg-green-500/20',
      border: 'border-green-500/30',
      glow: 'shadow-green-500/20',
    },
    Rare: {
      text: 'text-blue-400',
      bg: 'bg-blue-500/20',
      border: 'border-blue-500/30',
      glow: 'shadow-blue-500/20',
    },
    Epic: {
      text: 'text-purple-400',
      bg: 'bg-purple-500/20',
      border: 'border-purple-500/30',
      glow: 'shadow-purple-500/20',
    },
    Legendary: {
      text: 'text-orange-400',
      bg: 'bg-orange-500/20',
      border: 'border-orange-500/30',
      glow: 'shadow-orange-500/30',
    },
    Mythic: {
      text: 'text-pink-400',
      bg: 'bg-gradient-to-r from-pink-500/20 to-purple-500/20',
      border: 'border-pink-500/30',
      glow: 'shadow-pink-500/30',
    },
  };

  return colors[rarity] || colors.Common;
}

/**
 * Get the numeric value for sorting by rarity
 */
export function getRarityValue(rarity: RarityLevel | string): number {
  const values: Record<string, number> = {
    Common: 1,
    Uncommon: 2,
    Rare: 3,
    Epic: 4,
    Legendary: 5,
    Mythic: 6,
  };
  return values[rarity] || 0;
}

// ============================================================================
// Validation Utilities
// ============================================================================

/**
 * Check if a value is a valid URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if a value is a valid IPFS URI
 */
export function isValidIpfsUri(uri: string): boolean {
  return /^ipfs:\/\/[a-zA-Z0-9]+/.test(uri) || 
         /^https?:\/\/(ipfs\.io|gateway\.pinata\.cloud|cloudflare-ipfs\.com)\/ipfs\//.test(uri);
}

/**
 * Convert IPFS URI to HTTP gateway URL
 */
export function ipfsToHttp(uri: string, gateway: string = 'https://ipfs.io'): string {
  if (!uri) return '';
  if (uri.startsWith('ipfs://')) {
    return `${gateway}/ipfs/${uri.slice(7)}`;
  }
  return uri;
}

// ============================================================================
// Async Utilities
// ============================================================================

/**
 * Sleep for a specified duration
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    initialDelay?: number;
    maxDelay?: number;
    factor?: number;
  } = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    factor = 2,
  } = options;

  let lastError: Error | undefined;
  let delay = initialDelay;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt === maxAttempts) break;
      await sleep(delay);
      delay = Math.min(delay * factor, maxDelay);
    }
  }

  throw lastError;
}

// ============================================================================
// DOM Utilities
// ============================================================================

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      return true;
    } catch {
      return false;
    } finally {
      document.body.removeChild(textArea);
    }
  }
}

/**
 * Get scrollbar width for layout calculations
 */
export function getScrollbarWidth(): number {
  if (typeof window === 'undefined') return 0;
  return window.innerWidth - document.documentElement.clientWidth;
}

/**
 * Check if element is in viewport
 */
export function isInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// ============================================================================
// Color Utilities
// ============================================================================

/**
 * Generate a consistent color from a string (for avatars, etc.)
 */
export function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const colors = [
    'from-purple-500 to-pink-500',
    'from-blue-500 to-cyan-500',
    'from-green-500 to-emerald-500',
    'from-orange-500 to-red-500',
    'from-pink-500 to-rose-500',
    'from-indigo-500 to-purple-500',
    'from-teal-500 to-green-500',
    'from-yellow-500 to-orange-500',
  ];
  
  return colors[Math.abs(hash) % colors.length];
}

/**
 * Convert hex color to RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}
