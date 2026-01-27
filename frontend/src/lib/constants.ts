/**
 * StacksMint Application Constants
 * Centralized configuration values used throughout the application
 * @module constants
 * @version 1.0.0
 */

// ============================================================================
// Application Metadata
// ============================================================================

export const APP_NAME = 'StacksMint';
export const APP_DESCRIPTION = 'The premier NFT minting platform on Stacks blockchain';
export const APP_VERSION = '1.0.0';
export const APP_URL = 'https://stacksmint.io';

// ============================================================================
// Network Configuration
// ============================================================================

export const NETWORKS = {
  mainnet: {
    name: 'Mainnet',
    url: 'https://api.mainnet.hiro.so',
    explorerUrl: 'https://explorer.stacks.co',
    chainId: 1,
  },
  testnet: {
    name: 'Testnet',
    url: 'https://api.testnet.hiro.so',
    explorerUrl: 'https://explorer.stacks.co/?chain=testnet',
    chainId: 2147483648,
  },
  devnet: {
    name: 'Devnet',
    url: 'http://localhost:3999',
    explorerUrl: 'http://localhost:8000',
    chainId: 2147483648,
  },
} as const;

export const DEFAULT_NETWORK = 'mainnet';

// ============================================================================
// Contract Addresses
// ============================================================================

export const CONTRACTS = {
  mainnet: {
    nft: 'SP2KAF9RF86PVX3NEE27DFV1CQX0T4WGR41X3S45C.stacksmint-nft',
    marketplace: 'SP2KAF9RF86PVX3NEE27DFV1CQX0T4WGR41X3S45C.stacksmint-marketplace',
    collection: 'SP2KAF9RF86PVX3NEE27DFV1CQX0T4WGR41X3S45C.stacksmint-collection',
    treasury: 'SP2KAF9RF86PVX3NEE27DFV1CQX0T4WGR41X3S45C.stacksmint-treasury',
  },
  testnet: {
    nft: 'ST2KAF9RF86PVX3NEE27DFV1CQX0T4WGR41X3S45C.stacksmint-nft',
    marketplace: 'ST2KAF9RF86PVX3NEE27DFV1CQX0T4WGR41X3S45C.stacksmint-marketplace',
    collection: 'ST2KAF9RF86PVX3NEE27DFV1CQX0T4WGR41X3S45C.stacksmint-collection',
    treasury: 'ST2KAF9RF86PVX3NEE27DFV1CQX0T4WGR41X3S45C.stacksmint-treasury',
  },
} as const;

// ============================================================================
// Blockchain Parameters
// ============================================================================

export const MICROSTX_PER_STX = 1_000_000;
export const DEFAULT_FEE = 2000; // in microSTX
export const MAX_MEMO_LENGTH = 34;
export const MIN_TX_FEE = 180;
export const BLOCK_TIME_SECONDS = 600; // ~10 minutes

// ============================================================================
// Minting Configuration
// ============================================================================

export const MINTING = {
  minPrice: 0.01,
  maxPrice: 10000,
  defaultPrice: 1,
  maxNameLength: 100,
  maxDescriptionLength: 500,
  maxUriLength: 2000,
  maxSupplyPerCollection: 10000,
  platformFeePercent: 2.5,
} as const;

// ============================================================================
// Marketplace Configuration
// ============================================================================

export const MARKETPLACE = {
  listingFee: 0,
  minListingPrice: 0.001,
  maxListingPrice: 1_000_000,
  royaltyMaxPercent: 10,
  defaultPageSize: 20,
  maxPageSize: 100,
  sortOptions: ['price_asc', 'price_desc', 'date_asc', 'date_desc', 'name_asc', 'name_desc'] as const,
} as const;

// ============================================================================
// UI Configuration
// ============================================================================

export const UI = {
  toastDuration: 5000,
  animationDuration: 300,
  debounceDelay: 300,
  throttleDelay: 100,
  skeletonCount: {
    nftGrid: 8,
    collectionGrid: 6,
    marketplace: 12,
  },
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  },
} as const;

// ============================================================================
// IPFS Configuration
// ============================================================================

export const IPFS = {
  gateways: [
    'https://ipfs.io/ipfs/',
    'https://cloudflare-ipfs.com/ipfs/',
    'https://gateway.pinata.cloud/ipfs/',
    'https://dweb.link/ipfs/',
  ] as const,
  defaultGateway: 'https://ipfs.io/ipfs/',
  pinataApiUrl: 'https://api.pinata.cloud',
} as const;

// ============================================================================
// Social Links
// ============================================================================

export const SOCIAL_LINKS = {
  twitter: 'https://twitter.com/stacksmint',
  discord: 'https://discord.gg/stacksmint',
  github: 'https://github.com/stacksmint',
  telegram: 'https://t.me/stacksmint',
} as const;

// ============================================================================
// NFT Rarity Tiers
// ============================================================================

export const RARITY_TIERS = {
  common: { name: 'Common', color: 'gray', threshold: 0.5 },
  uncommon: { name: 'Uncommon', color: 'green', threshold: 0.3 },
  rare: { name: 'Rare', color: 'blue', threshold: 0.15 },
  epic: { name: 'Epic', color: 'purple', threshold: 0.04 },
  legendary: { name: 'Legendary', color: 'orange', threshold: 0.01 },
} as const;

// ============================================================================
// Error Messages
// ============================================================================

export const ERRORS = {
  walletNotConnected: 'Please connect your wallet to continue',
  insufficientFunds: 'Insufficient STX balance for this transaction',
  transactionFailed: 'Transaction failed. Please try again',
  networkError: 'Network error. Please check your connection',
  invalidInput: 'Invalid input. Please check your data',
  unauthorized: 'You are not authorized to perform this action',
  notFound: 'The requested resource was not found',
} as const;

// ============================================================================
// Success Messages  
// ============================================================================

export const MESSAGES = {
  mintSuccess: 'NFT minted successfully!',
  listingSuccess: 'NFT listed for sale successfully!',
  purchaseSuccess: 'NFT purchased successfully!',
  transferSuccess: 'NFT transferred successfully!',
  collectionCreated: 'Collection created successfully!',
  settingsSaved: 'Settings saved successfully!',
} as const;