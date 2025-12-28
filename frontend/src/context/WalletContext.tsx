'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { connectWallet as stacksConnect, disconnectWallet as stacksDisconnect, isConnected as stacksIsConnected, getUserAddress } from '@/lib/stacks';
import { wcConnect, wcDisconnect, isWCConnected, getWCSession } from '@/lib/walletconnect';

type WalletType = 'stacks' | 'walletconnect' | null;

interface WalletContextType {
  address: string | null;
  isConnected: boolean;
  loading: boolean;
  connecting: boolean;
  walletType: WalletType;
  wcUri: string | null;
  showQRModal: boolean;
  connect: (type?: WalletType) => void;
  connectWalletConnect: () => Promise<void>;
  disconnect: () => void;
  closeQRModal: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [walletType, setWalletType] = useState<WalletType>(null);
  const [wcUri, setWcUri] = useState<string | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);

  useEffect(() => {
    // Check for existing Stacks connection
    if (stacksIsConnected()) {
      setAddress(getUserAddress());
      setWalletType('stacks');
    }
    // Check for existing WalletConnect session
    else if (isWCConnected()) {
      const session = getWCSession();
      if (session?.namespaces?.stacks?.accounts?.[0]) {
        const parts = session.namespaces.stacks.accounts[0].split(':');
        setAddress(parts[2] || null);
        setWalletType('walletconnect');
      }
    }
    setLoading(false);
  }, []);

  const connect = (type: WalletType = 'stacks') => {
    if (type === 'walletconnect') {
      connectWalletConnect();
    } else {
      stacksConnect(() => {
        setAddress(getUserAddress());
        setWalletType('stacks');
      });
    }
  };

  const connectWalletConnect = async () => {
    setConnecting(true);
    setWcUri(null);
    
    try {
      const result = await wcConnect((uri) => {
        setWcUri(uri);
        setShowQRModal(true);
      });
      
      setAddress(result.address);
      setWalletType('walletconnect');
      setShowQRModal(false);
      setWcUri(null);
    } catch (error) {
      console.error('WalletConnect error:', error);
      setShowQRModal(false);
      setWcUri(null);
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = async () => {
    if (walletType === 'walletconnect') {
      await wcDisconnect();
    } else {
      stacksDisconnect();
    }
    setAddress(null);
    setWalletType(null);
  };

  const closeQRModal = () => {
    setShowQRModal(false);
    setConnecting(false);
  };

  return (
    <WalletContext.Provider value={{ 
      address, 
      isConnected: !!address, 
      loading, 
      connecting,
      walletType,
      wcUri,
      showQRModal,
      connect, 
      connectWalletConnect,
      disconnect,
      closeQRModal
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWalletContext() {
  const context = useContext(WalletContext);
  if (!context) throw new Error('useWalletContext must be used within WalletProvider');
  return context;
}
