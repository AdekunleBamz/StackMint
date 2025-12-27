'use client';

import { useState, useEffect, useCallback } from 'react';
import { connectWallet, disconnectWallet, isConnected, getUserAddress, userSession } from '@/lib/stacks';

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isConnected()) {
      setAddress(getUserAddress());
    }
    setLoading(false);
  }, []);

  const connect = useCallback(() => {
    connectWallet(() => {
      setAddress(getUserAddress());
    });
  }, []);

  const disconnect = useCallback(() => {
    disconnectWallet();
    setAddress(null);
  }, []);

  return { address, loading, connect, disconnect, isConnected: !!address };
}
