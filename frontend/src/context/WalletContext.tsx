'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { connectWallet, disconnectWallet, isConnected, getUserAddress } from '@/lib/stacks';

interface WalletContextType {
  address: string | null;
  isConnected: boolean;
  loading: boolean;
  connect: () => void;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isConnected()) {
      setAddress(getUserAddress());
    }
    setLoading(false);
  }, []);

  const connect = () => {
    connectWallet(() => {
      setAddress(getUserAddress());
    });
  };

  const disconnect = () => {
    disconnectWallet();
    setAddress(null);
  };

  return (
    <WalletContext.Provider value={{ address, isConnected: !!address, loading, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWalletContext() {
  const context = useContext(WalletContext);
  if (!context) throw new Error('useWalletContext must be used within WalletProvider');
  return context;
}
