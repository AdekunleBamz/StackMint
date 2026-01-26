'use client';

/**
 * WalletContext
 * Global context for wallet state management
 * @module WalletContext
 * @version 2.1.0
 */

import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { connectWallet as stacksConnect, disconnectWallet as stacksDisconnect, isConnected as stacksIsConnected, getUserAddress } from '@/lib/stacks';
import { wcConnect, wcDisconnect, isWCConnected, getWCSession } from '@/lib/walletconnect';

// Wallet and network type definitions
type WalletType = 'stacks' | 'walletconnect' | null;
type NetworkType = 'mainnet' | 'testnet' | 'devnet';
type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

// Storage configuration
const STORAGE_KEY = 'stacksmint_wallet_preference';
const CONNECTION_RETRY_DELAY_MS = 1000;

interface WalletState {
  address: string | null;
  walletType: WalletType;
  status: ConnectionStatus;
  network: NetworkType;
  balance: string | null;
  error: string | null;
}

interface WalletContextType {
  // State
  address: string | null;
  isConnected: boolean;
  loading: boolean;
  connecting: boolean;
  walletType: WalletType;
  wcUri: string | null;
  showQRModal: boolean;
  network: NetworkType;
  status: ConnectionStatus;
  error: string | null;
  
  // Computed
  shortAddress: string | null;
  explorerUrl: string | null;
  
  // Actions
  connect: (type?: WalletType) => void;
  connectWalletConnect: () => Promise<void>;
  disconnect: () => void;
  closeQRModal: () => void;
  switchNetwork: (network: NetworkType) => void;
  clearError: () => void;
  refreshConnection: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const STORAGE_KEY = 'stacksmint_wallet_preference';

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>({
    address: null,
    walletType: null,
    status: 'disconnected',
    network: 'mainnet',
    balance: null,
    error: null,
  });
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [wcUri, setWcUri] = useState<string | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);

  // Compute short address
  const shortAddress = useMemo(() => {
    if (!state.address) return null;
    return `${state.address.slice(0, 6)}...${state.address.slice(-4)}`;
  }, [state.address]);

  // Compute explorer URL
  const explorerUrl = useMemo(() => {
    if (!state.address) return null;
    const baseUrl = state.network === 'mainnet' 
      ? 'https://explorer.stacks.co' 
      : 'https://explorer.stacks.co/?chain=testnet';
    return `${baseUrl}/address/${state.address}`;
  }, [state.address, state.network]);

  // Initialize connection on mount
  useEffect(() => {
    const initializeConnection = async () => {
      try {
        // Check saved preference
        const savedPreference = localStorage.getItem(STORAGE_KEY);
        
        // Check for existing Stacks connection
        if (stacksIsConnected()) {
          const address = getUserAddress();
          setState(prev => ({
            ...prev,
            address,
            walletType: 'stacks',
            status: 'connected',
          }));
        }
        // Check for existing WalletConnect session
        else if (isWCConnected()) {
          const session = getWCSession();
          if (session?.namespaces?.stacks?.accounts?.[0]) {
            const parts = session.namespaces.stacks.accounts[0].split(':');
            setState(prev => ({
              ...prev,
              address: parts[2] || null,
              walletType: 'walletconnect',
              status: 'connected',
            }));
          }
        }
        // Auto-reconnect based on preference
        else if (savedPreference) {
          // Could implement auto-reconnect logic here
        }
      } catch (error) {
        console.error('Failed to initialize wallet connection:', error);
        setState(prev => ({
          ...prev,
          status: 'error',
          error: 'Failed to restore wallet connection',
        }));
      } finally {
        setLoading(false);
      }
    };

    initializeConnection();
  }, []);

  // Persist wallet preference
  useEffect(() => {
    if (state.walletType) {
      localStorage.setItem(STORAGE_KEY, state.walletType);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [state.walletType]);

  const connect = useCallback((type: WalletType = 'stacks') => {
    setState(prev => ({ ...prev, status: 'connecting', error: null }));
    
    if (type === 'walletconnect') {
      connectWalletConnect();
    } else {
      stacksConnect(() => {
        const address = getUserAddress();
        setState(prev => ({
          ...prev,
          address,
          walletType: 'stacks',
          status: 'connected',
        }));
      });
    }
  }, []);

  const connectWalletConnect = useCallback(async () => {
    setConnecting(true);
    setState(prev => ({ ...prev, status: 'connecting', error: null }));
    setWcUri(null);
    
    try {
      const result = await wcConnect((uri) => {
        setWcUri(uri);
        setShowQRModal(true);
      });
      
      setState(prev => ({
        ...prev,
        address: result.address,
        walletType: 'walletconnect',
        status: 'connected',
      }));
      setShowQRModal(false);
      setWcUri(null);
    } catch (error) {
      console.error('WalletConnect error:', error);
      setState(prev => ({
        ...prev,
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to connect via WalletConnect',
      }));
      setShowQRModal(false);
      setWcUri(null);
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      if (state.walletType === 'walletconnect') {
        await wcDisconnect();
      } else {
        stacksDisconnect();
      }
      
      setState({
        address: null,
        walletType: null,
        status: 'disconnected',
        network: state.network,
        balance: null,
        error: null,
      });
    } catch (error) {
      console.error('Disconnect error:', error);
      setState(prev => ({
        ...prev,
        status: 'error',
        error: 'Failed to disconnect wallet',
      }));
    }
  }, [state.walletType, state.network]);

  const closeQRModal = useCallback(() => {
    setShowQRModal(false);
    setConnecting(false);
    if (state.status === 'connecting') {
      setState(prev => ({ ...prev, status: 'disconnected' }));
    }
  }, [state.status]);

  const switchNetwork = useCallback((network: NetworkType) => {
    setState(prev => ({ ...prev, network }));
    // In a real app, you'd reconnect with the new network
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const refreshConnection = useCallback(async () => {
    if (!state.walletType) return;
    
    setState(prev => ({ ...prev, status: 'connecting' }));
    
    try {
      if (state.walletType === 'stacks' && stacksIsConnected()) {
        const address = getUserAddress();
        setState(prev => ({ ...prev, address, status: 'connected' }));
      } else if (state.walletType === 'walletconnect' && isWCConnected()) {
        const session = getWCSession();
        if (session?.namespaces?.stacks?.accounts?.[0]) {
          const parts = session.namespaces.stacks.accounts[0].split(':');
          setState(prev => ({ ...prev, address: parts[2] || null, status: 'connected' }));
        }
      } else {
        // Connection lost, reset state
        setState(prev => ({
          ...prev,
          address: null,
          walletType: null,
          status: 'disconnected',
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        status: 'error',
        error: 'Failed to refresh connection',
      }));
    }
  }, [state.walletType]);

  const contextValue = useMemo(() => ({
    address: state.address,
    isConnected: !!state.address,
    loading,
    connecting,
    walletType: state.walletType,
    wcUri,
    showQRModal,
    network: state.network,
    status: state.status,
    error: state.error,
    shortAddress,
    explorerUrl,
    connect,
    connectWalletConnect,
    disconnect,
    closeQRModal,
    switchNetwork,
    clearError,
    refreshConnection,
  }), [
    state,
    loading,
    connecting,
    wcUri,
    showQRModal,
    shortAddress,
    explorerUrl,
    connect,
    connectWalletConnect,
    disconnect,
    closeQRModal,
    switchNetwork,
    clearError,
    refreshConnection,
  ]);

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWalletContext() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWalletContext must be used within a WalletProvider');
  }
  return context;
}
