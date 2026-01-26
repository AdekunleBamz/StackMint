/**
 * StacksMint Utility Functions
 * Common helper functions used throughout the application
 * @module utils
 * @version 2.1.0
 */

// Type definitions for utility functions
export type NetworkType = 'mainnet' | 'testnet';
export type AddressPrefix = 'SP' | 'ST';

// Address formatting constants
const DEFAULT_PREFIX_CHARS = 6;
const DEFAULT_SUFFIX_CHARS = 4;
const MIN_ADDRESS_LENGTH = 38;

// ============================================================================
// Address Formatting
// ============================================================================

/**
 * Format a blockchain address to a shorter display format
 * @example formatAddress('SP3FKN...Z5F') => 'SP3FKN...5F'
 */
export function formatAddress(address: string, prefixChars = 6, suffixChars = 4): string {
  if (!address) return '';
  if (address.length <= prefixChars + suffixChars + 3) return address;
  return `${address.slice(0, prefixChars)}...${address.slice(-suffixChars)}`;
}

/**
 * Validate if a string is a valid Stacks address
 */
export function isValidStacksAddress(address: string): boolean {
  if (!address) return false;
  // Stacks addresses start with SP (mainnet) or ST (testnet)
  const addressRegex = /^(SP|ST)[A-Z0-9]{38,40}$/;
  return addressRegex.test(address);
}

/**
 * Get network from address prefix
 */
export function getNetworkFromAddress(address: string): 'mainnet' | 'testnet' | null {
  if (address.startsWith('SP')) return 'mainnet';
  if (address.startsWith('ST')) return 'testnet';
  return null;
}

// ============================================================================
// STX Formatting
// ============================================================================

const MICROSTX_PER_STX = 1_000_000;

/**
 * Convert microSTX to STX
 */
export function microSTXToSTX(microSTX: number | string): number {
  return Number(microSTX) / MICROSTX_PER_STX;
}

/**
 * Convert STX to microSTX
 */
export function stxToMicroSTX(stx: number): number {
  return Math.floor(stx * MICROSTX_PER_STX);
}

/**
 * Format microSTX amount to human-readable STX string
 */
export function formatSTX(
  microSTX: number | string, 
  options?: { 
    minDecimals?: number; 
    maxDecimals?: number;
    showSymbol?: boolean;
  }
): string {
  const { minDecimals = 2, maxDecimals = 6, showSymbol = false } = options || {};
  const stx = microSTXToSTX(microSTX);
  const formatted = stx.toLocaleString('en-US', { 
    minimumFractionDigits: minDecimals, 
    maximumFractionDigits: maxDecimals 
  });
  return showSymbol ? `${formatted} STX` : formatted;
}

/**
 * Format STX with compact notation for large numbers
 */
export function formatSTXCompact(microSTX: number | string): string {
  const stx = microSTXToSTX(microSTX);
  
  if (stx >= 1_000_000) {
    return `${(stx / 1_000_000).toFixed(2)}M STX`;
  }
  if (stx >= 1_000) {
    return `${(stx / 1_000).toFixed(2)}K STX`;
  }
  return `${stx.toFixed(2)} STX`;
}

// ============================================================================
// Date/Time Formatting
// ============================================================================

// Date format options
const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
};

const TIME_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
};

/**
 * Format a timestamp to a readable date string
 */
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', DATE_FORMAT_OPTIONS);
}

/**
 * Format a timestamp to include time
 */
export function formatDateTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Get relative time string (e.g., "2 hours ago")
 */
export function getRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 7) return formatDate(timestamp);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}

// ============================================================================
// Text Formatting
// ============================================================================

// Truncation configuration
const DEFAULT_TRUNCATE_SUFFIX = '...';
const DEFAULT_MAX_WORDS = 20;

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number, suffix = DEFAULT_TRUNCATE_SUFFIX): string {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + suffix;
}

/**
 * Convert string to title case
 */
export function toTitleCase(text: string): string {
  return text.replace(
    /\w\S*/g,
    txt => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase()
  );
}

/**
 * Slugify a string (for URLs)
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ============================================================================
// IPFS Utilities
// ============================================================================

// IPFS gateway configuration
const IPFS_GATEWAYS = [
  'https://ipfs.io/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  'https://gateway.pinata.cloud/ipfs/',
] as const;

const IPFS_PROTOCOL_PREFIX = 'ipfs://';
const DEFAULT_GATEWAY_INDEX = 0;

type IPFSGateway = typeof IPFS_GATEWAYS[number];

/**
 * Check if URL is an IPFS URL
 */
export function isIPFSUrl(url: string): boolean {
  return url.startsWith(IPFS_PROTOCOL_PREFIX) || 
         url.includes('/ipfs/') ||
         url.includes('ipfs.io');
}

/**
 * Check if URL is a valid IPFS URL format
 */
export function isValidIPFSUrl(url: string): boolean {
  return url.startsWith('ipfs://') || url.startsWith('https://ipfs.io/');
}

/**
 * Convert IPFS URL to HTTP gateway URL
 */
export function convertIPFSUrl(url: string, gateway = IPFS_GATEWAYS[0]): string {
  if (!url) return '';
  
  if (url.startsWith('ipfs://')) {
    return url.replace('ipfs://', gateway);
  }
  
  // Handle ipfs:// protocol
  const ipfsMatch = url.match(/ipfs:\/\/(.+)/);
  if (ipfsMatch) {
    return `${gateway}${ipfsMatch[1]}`;
  }
  
  return url;
}

/**
 * Extract CID from IPFS URL
 */
export function extractIPFSCID(url: string): string | null {
  const patterns = [
    /ipfs:\/\/([a-zA-Z0-9]+)/,
    /\/ipfs\/([a-zA-Z0-9]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}

// ============================================================================
// Validation Utilities
// ============================================================================

/**
 * Check if string is a valid URL
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
 * Check if string is a valid email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ============================================================================
// Number Utilities
// ============================================================================

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

/**
 * Format number in compact notation
 */
export function formatCompactNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

/**
 * Clamp a number between min and max
 */
export function clamp(num: number, min: number, max: number): number {
  return Math.min(Math.max(num, min), max);
}

// ============================================================================
// Async Utilities
// ============================================================================

// Default debounce delay
const DEFAULT_DEBOUNCE_MS = 300;
const DEFAULT_THROTTLE_MS = 100;

/**
 * Sleep for a specified number of milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Debounce a function
 * @param fn - Function to debounce
 * @param delay - Delay in milliseconds (default: 300ms)
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number = DEFAULT_DEBOUNCE_MS
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// ============================================================================
// Class Name Utilities
// ============================================================================

/**
 * Conditionally join class names
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
