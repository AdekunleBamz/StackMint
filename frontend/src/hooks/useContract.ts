'use client';

import { useState } from 'react';
import { openContractCall } from '@stacks/connect';
import { mintNFT, createCollection } from '@/lib/contracts';

export function useContract() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mint = async (uri: string) => {
    setLoading(true);
    setError(null);
    try {
      const txOptions = await mintNFT(uri);
      await openContractCall(txOptions);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const create = async (name: string, maxSupply: number) => {
    setLoading(true);
    setError(null);
    try {
      const txOptions = await createCollection(name, maxSupply);
      await openContractCall(txOptions);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return { mint, create, loading, error };
}
