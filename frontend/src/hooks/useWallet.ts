'use client';

/**
 * useWallet Hook
 * Provides wallet connection and management functionality
 * @module useWallet
 * @version 2.1.0
 */

import { useMemo, useCallback } from 'react';
import { useWalletContext } from '@/context/WalletContext';

// Wallet type definitions
type WalletType = 'stacks' | 'walletconnect' | null;
type NetworkType = 'mainnet' | 'testnet' | 'devnet';

// Status constants
const STATUS_CONNECTED = 'connected';
const STATUS_CONNECTING = 'connecting';
const STATUS_DISCONNECTED = 'disconnected';

interface UseWalletReturn {
  // Connection state
  address: string | null;
  shortAddress: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  connecting: boolean; // Alias for isConnecting
  isLoading: boolean;
  walletType: WalletType;
  error: string | null;
  
  // Network
  network: string;
  isMainnet: boolean;
  isTestnet: boolean;
  
  // Actions
  connect: (type?: WalletType) => void;
  connectWalletConnect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: (network: 'mainnet' | 'testnet' | 'devnet') => void;
  
  // Modal controls
  showQRModal: boolean;
  wcUri: string | null;
  closeQRModal: () => void;
  
  // Utilities
  explorerUrl: string | null;
  copyAddress: () => Promise<boolean>;
  openExplorer: () => void;
  
  // Status helpers
  status: string;
  isReady: boolean;
}

/**
 * Custom hook for wallet integration
 * Provides a simplified interface for wallet connection and management
 * 
 * @example
 * ```tsx
 * const { address, isConnected, connect, disconnect } = useWallet();
 * 
 * if (!isConnected) {
 *   return <button onClick={() => connect()}>Connect Wallet</button>;
 * }
 * 
 * return <p>Connected: {address}</p>;
 * ```
 */
export function useWallet(): UseWalletReturn {
  const context = useWalletContext();
  
  // Derived state
  const isMainnet = context.network === 'mainnet';
  const isTestnet = context.network === 'testnet';
  const isReady = !context.loading && context.isConnected;
  
  // Format short address
  const shortAddress = useMemo(() => {
    if (!context.address) return null;
    const PREFIX_LENGTH = 6;
    const SUFFIX_LENGTH = 4;
    return `${context.address.slice(0, PREFIX_LENGTH)}...${context.address.slice(-SUFFIX_LENGTH)}`;
  }, [context.address]);
  
  // Generate explorer URL
  const explorerUrl = useMemo(() => {
    if (!context.address) return null;
    const baseUrl = isMainnet 
      ? 'https://explorer.stacks.co' 
      : 'https://explorer.stacks.co/?chain=testnet';
    return `${baseUrl}/address/${context.address}`;
  }, [context.address, isMainnet]);
  
  // Copy address to clipboard
  const copyAddress = useCallback(async (): Promise<boolean> => {
    if (!context.address) return false;
    
    try {
      await navigator.clipboard.writeText(context.address);
      return true;
    } catch (error) {
      console.error('Failed to copy address:', error);
      return false;
    }
  }, [context.address]);
  
  // Open explorer in new tab
  const openExplorer = useCallback(() => {
    if (explorerUrl) {
      window.open(explorerUrl, '_blank', 'noopener,noreferrer');
    }
  }, [explorerUrl]);
  
  return {
    // Connection state
    address: context.address,
    shortAddress,
    isConnected: context.isConnected,
    isConnecting: context.connecting,
    connecting: context.connecting, // Alias
    isLoading: context.loading,
    walletType: context.walletType,
    error: context.error,
    
    // Network
    network: context.network,
    isMainnet,
    isTestnet,
    
    // Actions
    connect: context.connect,
    connectWalletConnect: context.connectWalletConnect,
    disconnect: context.disconnect,
    switchNetwork: context.switchNetwork,
    
    // Modal controls
    showQRModal: context.showQRModal,
    wcUri: context.wcUri,
    closeQRModal: context.closeQRModal,
    
    // Utilities
    explorerUrl,
    copyAddress,
    openExplorer,
    
    // Status helpers
    status: context.status,
    isReady,
  };
}

/**
 * Hook to check if wallet is connected
 * Useful for conditional rendering
 */
export function useIsConnected(): boolean {
  const { isConnected } = useWallet();
  return isConnected;
}

/**
 * Hook to get the connected wallet address
 * Returns null if not connected
 */
export function useWalletAddress(): string | null {
  const { address } = useWallet();
  return address;
}

/**
 * Hook to get the current network
 */
export function useNetwork(): { network: string; isMainnet: boolean; isTestnet: boolean } {
  const { network, isMainnet, isTestnet } = useWallet();
  return { network, isMainnet, isTestnet };
}
