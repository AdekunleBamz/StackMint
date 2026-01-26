/**
 * StacksMint Constants
 * Centralized configuration for the application
 * @module constants
 * @version 2.1.0
 */

// ============================================================================
// Application Metadata
// ============================================================================

export const APP_NAME = 'StacksMint';
export const APP_VERSION = '2.1.0';
export const APP_DESCRIPTION = 'Decentralized NFT minting platform on Stacks blockchain';

// ============================================================================
// Contract Configuration
// ============================================================================

export const CONTRACT_ADDRESS = 'SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N';

export const CONTRACTS = {
  NFT: 'stacksmint-nft',
  TREASURY: 'stacksmint-treasury',
  COLLECTION: 'stacksmint-collection',
  MARKETPLACE: 'stacksmint-marketplace',
} as const;

export type ContractName = typeof CONTRACTS[keyof typeof CONTRACTS];

// Full contract identifiers
export const CONTRACT_IDENTIFIERS = {
  NFT: `${CONTRACT_ADDRESS}.${CONTRACTS.NFT}`,
  TREASURY: `${CONTRACT_ADDRESS}.${CONTRACTS.TREASURY}`,
  COLLECTION: `${CONTRACT_ADDRESS}.${CONTRACTS.COLLECTION}`,
  MARKETPLACE: `${CONTRACT_ADDRESS}.${CONTRACTS.MARKETPLACE}`,
} as const;

// ============================================================================
// Fee Configuration
// ============================================================================

export const FEES = {
  CREATOR_FEE_MICROSTX: 10000, // 0.01 STX in microSTX
  CREATOR_FEE_STX: 0.01,
  MARKETPLACE_FEE_PERCENT: 2.5, // 2.5% marketplace fee
  MIN_LISTING_PRICE_MICROSTX: 1000, // 0.001 STX
  MAX_ROYALTY_PERCENT: 25,
} as const;

// Legacy exports for backwards compatibility
export const CREATOR_FEE = FEES.CREATOR_FEE_MICROSTX;
export const CREATOR_FEE_STX = FEES.CREATOR_FEE_STX;

// ============================================================================
// Network Configuration
// ============================================================================

export type NetworkType = 'mainnet' | 'testnet' | 'devnet';

export const NETWORKS = {
  mainnet: {
    name: 'Mainnet',
    apiBase: 'https://api.mainnet.hiro.so',
    explorerBase: 'https://explorer.stacks.co',
    chainId: 1,
    isProduction: true,
  },
  testnet: {
    name: 'Testnet',
    apiBase: 'https://api.testnet.hiro.so',
    explorerBase: 'https://explorer.stacks.co',
    chainId: 2147483648,
    isProduction: false,
  },
  devnet: {
    name: 'Devnet',
    apiBase: 'http://localhost:3999',
    explorerBase: 'http://localhost:8000',
    chainId: 2147483648,
    isProduction: false,
  },
} as const;

// Default network - can be overridden by environment variable
export const NETWORK: NetworkType = (process.env.NEXT_PUBLIC_NETWORK as NetworkType) || 'mainnet';

export const API_BASE = NETWORKS[NETWORK].apiBase;
export const EXPLORER_BASE = NETWORKS[NETWORK].explorerBase;

// ============================================================================
// URL Builders
// ============================================================================

export function getExplorerUrl(txId: string, network: NetworkType = NETWORK): string {
  const { explorerBase } = NETWORKS[network];
  const chainParam = network === 'mainnet' ? '' : `?chain=${network}`;
  return `${explorerBase}/txid/${txId}${chainParam}`;
}

export function getAddressExplorerUrl(address: string, network: NetworkType = NETWORK): string {
  const { explorerBase } = NETWORKS[network];
  const chainParam = network === 'mainnet' ? '' : `?chain=${network}`;
  return `${explorerBase}/address/${address}${chainParam}`;
}

export function getContractExplorerUrl(
  contractId: string, 
  network: NetworkType = NETWORK
): string {
  const { explorerBase } = NETWORKS[network];
  const chainParam = network === 'mainnet' ? '' : `?chain=${network}`;
  return `${explorerBase}/txid/${contractId}${chainParam}`;
}

export function getApiUrl(endpoint: string, network: NetworkType = NETWORK): string {
  const { apiBase } = NETWORKS[network];
  return `${apiBase}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
}

// ============================================================================
// App Configuration
// ============================================================================

export const APP_CONFIG = {
  name: 'StacksMint',
  description: 'Create and trade NFTs on the Stacks blockchain',
  version: '1.0.0',
  author: 'StacksMint Team',
  
  // Social links
  twitter: 'https://twitter.com/stacksmint',
  discord: 'https://discord.gg/stacksmint',
  github: 'https://github.com/stacksmint',
  
  // Contact
  supportEmail: 'support@stacksmint.com',
} as const;

// ============================================================================
// UI Constants
// ============================================================================

export const UI = {
  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  
  // Animations
  ANIMATION_DURATION_MS: 300,
  TOAST_DURATION_MS: 4000,
  
  // Limits
  MAX_COLLECTION_NAME_LENGTH: 50,
  MAX_DESCRIPTION_LENGTH: 500,
  MAX_SUPPLY: 100000,
  
  // Breakpoints (matching Tailwind)
  BREAKPOINTS: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  },
} as const;

// ============================================================================
// Error Messages
// ============================================================================

export type ErrorKey = keyof typeof ERRORS;

export const ERRORS = {
  WALLET_NOT_CONNECTED: 'Please connect your wallet to continue',
  INSUFFICIENT_BALANCE: 'Insufficient STX balance',
  INVALID_URI: 'Invalid metadata URI format',
  TRANSACTION_FAILED: 'Transaction failed. Please try again.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  COLLECTION_NAME_REQUIRED: 'Collection name is required',
  MAX_SUPPLY_REQUIRED: 'Max supply must be greater than 0',
  SESSION_EXPIRED: 'Session expired. Please reconnect your wallet.',
  RATE_LIMITED: 'Too many requests. Please try again later.',
} as const;

// ============================================================================
// Success Messages
// ============================================================================

export type SuccessKey = keyof typeof SUCCESS;

export const SUCCESS = {
  NFT_MINTED: 'NFT minted successfully!',
  COLLECTION_CREATED: 'Collection created successfully!',
  NFT_LISTED: 'NFT listed for sale successfully!',
  NFT_PURCHASED: 'NFT purchased successfully!',
  WALLET_CONNECTED: 'Wallet connected successfully!',
  WALLET_DISCONNECTED: 'Wallet disconnected successfully!',
  ADDRESS_COPIED: 'Address copied to clipboard!',
} as const;
