'use client';

import { useWalletContext } from '@/context/WalletContext';

export function useWallet() {
  const context = useWalletContext();
  return context;
}
