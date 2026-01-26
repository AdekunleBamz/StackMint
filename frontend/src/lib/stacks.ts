/**
 * Stacks Wallet Integration
 * Handles wallet connections and blockchain interactions
 * @module stacks
 * @version 2.0.0
 */

import { 
  AppConfig, 
  showConnect, 
  UserSession,
  openSignatureRequestPopup,
  openContractCall,
  openSTXTransfer,
  type FinishedAuthData,
  type SignatureData,
} from '@stacks/connect';
import { StacksMainnet, StacksTestnet, type StacksNetwork } from '@stacks/network';
import type { ContractCallOptions, STXTransferOptions } from '@stacks/connect';

// ============================================================================
// Configuration
// ============================================================================

// App permissions required for wallet connection
const APP_PERMISSIONS = ['store_write', 'publish_data'] as const;
type AppPermission = typeof APP_PERMISSIONS[number];

const appConfig = new AppConfig([...APP_PERMISSIONS]);
export const userSession = new UserSession({ appConfig });

export const appDetails = {
  name: 'StacksMint',
  icon: typeof window !== 'undefined' 
    ? `${window.location.origin}/logo.png` 
    : 'https://stacksmint.io/logo.png',
};

// Network instances
export const MAINNET = new StacksMainnet();
export const TESTNET = new StacksTestnet();

// Get network based on environment
export function getNetwork(): StacksNetwork {
  const env = process.env.NEXT_PUBLIC_NETWORK;
  return env === 'testnet' ? TESTNET : MAINNET;
}

export function isMainnet(): boolean {
  return getNetwork() instanceof StacksMainnet;
}

// ============================================================================
// Types
// ============================================================================

// Connection status type
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface WalletConnectionOptions {
  onSuccess?: (data: FinishedAuthData) => void;
  onCancel?: () => void;
}

export interface SignMessageOptions {
  message: string;
  onSuccess?: (signature: SignatureData) => void;
  onCancel?: () => void;
}

export interface STXTransferParams {
  recipient: string;
  amount: number; // in microSTX
  memo?: string;
  onSuccess?: (txId: string) => void;
  onError?: (error: Error) => void;
  onCancel?: () => void;
}

// Transfer memo configuration
const MAX_MEMO_LENGTH = 34;
const DEFAULT_MEMO = '';

export interface UserProfile {
  stxAddress: {
    mainnet: string;
    testnet: string;
  };
  btcAddress?: {
    p2wpkh?: {
      mainnet: string;
      testnet: string;
    };
    p2tr?: {
      mainnet: string;
      testnet: string;
    };
  };
  identityAddress?: string;
  appPrivateKey?: string;
  hubUrl?: string;
  gaiaAssociationToken?: string;
}

// ============================================================================
// Connection Functions
// ============================================================================

/**
 * Connect wallet with enhanced options
 */
export function connectWallet(options: WalletConnectionOptions | (() => void) = {}) {
  // Support legacy callback syntax
  const opts = typeof options === 'function' 
    ? { onSuccess: options } 
    : options;

  showConnect({
    appDetails,
    onFinish: (data) => {
      // Store connection timestamp
      if (typeof window !== 'undefined') {
        localStorage.setItem('stacksmint_connected_at', Date.now().toString());
      }
      opts.onSuccess?.(data);
    },
    onCancel: opts.onCancel,
    userSession,
  });
}

/**
 * Disconnect wallet and clear session
 */
export function disconnectWallet() {
  userSession.signUserOut();
  
  // Clear local storage items
  if (typeof window !== 'undefined') {
    localStorage.removeItem('stacksmint_connected_at');
    localStorage.removeItem('stacksmint_last_address');
  }
}

/**
 * Check if user is connected
 */
export function isConnected(): boolean {
  return userSession.isUserSignedIn();
}

/**
 * Check if session is expired (optional 24 hour timeout)
 */
export function isSessionExpired(maxAgeHours = 24): boolean {
  if (typeof window === 'undefined') return false;
  
  const connectedAt = localStorage.getItem('stacksmint_connected_at');
  if (!connectedAt) return false;
  
  const connectedTime = parseInt(connectedAt, 10);
  const now = Date.now();
  const maxAge = maxAgeHours * 60 * 60 * 1000;
  
  return now - connectedTime > maxAge;
}

// ============================================================================
// User Data Functions
// ============================================================================

/**
 * Get user address for current network
 */
export function getUserAddress(): string | null {
  if (!isConnected()) return null;
  
  try {
    const userData = userSession.loadUserData();
    const network = isMainnet() ? 'mainnet' : 'testnet';
    return userData.profile.stxAddress?.[network] || null;
  } catch (error) {
    console.error('Error getting user address:', error);
    return null;
  }
}

/**
 * Get user address for specific network
 */
export function getUserAddressForNetwork(network: 'mainnet' | 'testnet'): string | null {
  if (!isConnected()) return null;
  
  try {
    const userData = userSession.loadUserData();
    return userData.profile.stxAddress?.[network] || null;
  } catch (error) {
    console.error('Error getting user address:', error);
    return null;
  }
}

/**
 * Get full user profile
 */
export function getUserProfile(): UserProfile | null {
  if (!isConnected()) return null;
  
  try {
    const userData = userSession.loadUserData();
    return userData.profile as UserProfile;
  } catch (error) {
    console.error('Error loading user profile:', error);
    return null;
  }
}

/**
 * Get shortened address for display
 */
export function getShortAddress(address?: string | null): string {
  const addr = address || getUserAddress();
  if (!addr) return '';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

/**
 * Check if address belongs to current user
 */
export function isOwnAddress(address: string): boolean {
  const mainnet = getUserAddressForNetwork('mainnet');
  const testnet = getUserAddressForNetwork('testnet');
  return address === mainnet || address === testnet;
}

// ============================================================================
// Transaction Functions
// ============================================================================

/**
 * Open contract call popup
 */
export async function callContract(
  options: ContractCallOptions,
  callbacks?: {
    onFinish?: (data: { txId: string }) => void;
    onCancel?: () => void;
  }
): Promise<void> {
  return new Promise((resolve, reject) => {
    openContractCall({
      ...options,
      network: getNetwork(),
      appDetails,
      onFinish: (data) => {
        callbacks?.onFinish?.(data);
        resolve();
      },
      onCancel: () => {
        callbacks?.onCancel?.();
        reject(new Error('Transaction cancelled'));
      },
    });
  });
}

/**
 * Send STX transfer
 */
export async function sendSTX(params: STXTransferParams): Promise<void> {
  if (!isConnected()) {
    throw new Error('Wallet not connected');
  }

  // Validate recipient
  if (!params.recipient.startsWith('SP') && !params.recipient.startsWith('ST')) {
    throw new Error('Invalid recipient address');
  }

  // Validate amount
  if (params.amount <= 0) {
    throw new Error('Amount must be greater than 0');
  }

  const options: STXTransferOptions = {
    recipient: params.recipient,
    amount: params.amount.toString(),
    memo: params.memo,
    network: getNetwork(),
    appDetails,
    onFinish: (data) => {
      params.onSuccess?.(data.txId);
    },
    onCancel: params.onCancel,
  };

  try {
    openSTXTransfer(options);
  } catch (error) {
    params.onError?.(error as Error);
  }
}

/**
 * Sign a message
 */
export async function signMessage(options: SignMessageOptions): Promise<void> {
  if (!isConnected()) {
    throw new Error('Wallet not connected');
  }

  openSignatureRequestPopup({
    message: options.message,
    network: getNetwork(),
    appDetails,
    onFinish: options.onSuccess,
    onCancel: options.onCancel,
  });
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get explorer URL for address
 */
export function getAddressExplorerUrl(address?: string): string {
  const addr = address || getUserAddress();
  if (!addr) return '';
  
  const baseUrl = isMainnet() 
    ? 'https://explorer.stacks.co' 
    : 'https://explorer.stacks.co/?chain=testnet';
  
  return `${baseUrl}/address/${addr}`;
}

/**
 * Get explorer URL for transaction
 */
export function getTxExplorerUrl(txId: string): string {
  const cleanTxId = txId.startsWith('0x') ? txId : `0x${txId}`;
  const baseUrl = isMainnet()
    ? 'https://explorer.stacks.co'
    : 'https://explorer.stacks.co/?chain=testnet';
  
  return `${baseUrl}/txid/${cleanTxId}`;
}

/**
 * Copy address to clipboard
 */
export async function copyAddressToClipboard(address?: string): Promise<boolean> {
  const addr = address || getUserAddress();
  if (!addr) return false;
  
  try {
    await navigator.clipboard.writeText(addr);
    return true;
  } catch (error) {
    console.error('Failed to copy address:', error);
    return false;
  }
}

/**
 * Validate STX address format
 */
export function isValidAddress(address: string): boolean {
  // Basic validation - mainnet addresses start with SP, testnet with ST
  const validPrefix = address.startsWith('SP') || address.startsWith('ST');
  const validLength = address.length >= 39 && address.length <= 41;
  const validChars = /^[SP|ST][0-9A-Z]+$/i.test(address);
  
  return validPrefix && validLength && validChars;
}

/**
 * Format STX balance for display
 */
export function formatSTXBalance(microSTX: number | string, decimals = 6): string {
  const amount = typeof microSTX === 'string' ? parseInt(microSTX, 10) : microSTX;
  const stx = amount / 1_000_000;
  
  return stx.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

/**
 * Parse STX amount to microSTX
 */
export function parseSTXAmount(stx: number | string): number {
  const amount = typeof stx === 'string' ? parseFloat(stx) : stx;
  return Math.floor(amount * 1_000_000);
}

// ============================================================================
// Session Persistence Helpers
// ============================================================================

/**
 * Check and restore session on app load
 */
export function restoreSession(): boolean {
  if (!isConnected()) return false;
  
  // Check if session expired
  if (isSessionExpired()) {
    disconnectWallet();
    return false;
  }
  
  return true;
}

/**
 * Get connection duration in human readable format
 */
export function getConnectionDuration(): string | null {
  if (typeof window === 'undefined') return null;
  
  const connectedAt = localStorage.getItem('stacksmint_connected_at');
  if (!connectedAt) return null;
  
  const duration = Date.now() - parseInt(connectedAt, 10);
  const hours = Math.floor(duration / (1000 * 60 * 60));
  const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}
