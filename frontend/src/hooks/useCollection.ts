'use client';

/**
 * useCollection Hook
 * Hook for fetching and managing collection data
 * @module hooks/useCollection
 * @version 1.0.0
 */

import { useState, useEffect, useCallback } from 'react';

/** Collection data interface */
export interface Collection {
  id: string;
  name: string;
  description: string;
  image: string | null;
  bannerImage: string | null;
  creator: string;
  creatorName?: string;
  contractAddress: string;
  totalSupply: number;
  totalVolume: number;
  floorPrice: number;
  owners: number;
  listed: number;
  verified: boolean;
  createdAt: Date;
  socials?: {
    website?: string;
    twitter?: string;
    discord?: string;
  };
  stats?: {
    volume24h: number;
    volumeChange24h: number;
    sales24h: number;
    avgPrice24h: number;
  };
}

/** NFT item in collection */
export interface CollectionNFT {
  id: string;
  tokenId: number;
  name: string;
  image: string | null;
  owner: string;
  price?: number;
  rarity?: string;
  attributes?: Array<{ trait_type: string; value: string }>;
  isListed: boolean;
}

/** Hook options */
interface UseCollectionOptions {
  /** Collection ID or contract address */
  collectionId: string;
  /** Enable auto-refresh */
  autoRefresh?: boolean;
  /** Refresh interval in ms */
  refreshInterval?: number;
}

/** Hook return type */
interface UseCollectionReturn {
  /** Collection data */
  collection: Collection | null;
  /** NFTs in collection */
  nfts: CollectionNFT[];
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
  /** Total NFT count */
  totalCount: number;
  /** Current page */
  page: number;
  /** Has more NFTs to load */
  hasMore: boolean;
  /** Fetch next page */
  fetchMore: () => Promise<void>;
  /** Refresh collection data */
  refresh: () => Promise<void>;
  /** Set current page */
  setPage: (page: number) => void;
}

/** Items per page */
const PAGE_SIZE = 24;

/**
 * Mock collection data - would be API call in production
 */
const mockCollection: Collection = {
  id: 'stacks-punks',
  name: 'Stacks Punks',
  description: 'A collection of 10,000 unique digital punks on the Stacks blockchain, secured by Bitcoin.',
  image: null,
  bannerImage: null,
  creator: 'SP1ABC...XYZ',
  creatorName: 'StacksPunkLabs',
  contractAddress: 'SP1ABC...XYZ.stacks-punks',
  totalSupply: 10000,
  totalVolume: 125000,
  floorPrice: 15.5,
  owners: 4521,
  listed: 342,
  verified: true,
  createdAt: new Date('2023-06-15'),
  socials: {
    website: 'https://stackspunks.com',
    twitter: 'https://twitter.com/stackspunks',
    discord: 'https://discord.gg/stackspunks',
  },
  stats: {
    volume24h: 1250,
    volumeChange24h: 12.5,
    sales24h: 45,
    avgPrice24h: 27.8,
  },
};

/**
 * Generate mock NFTs
 */
const generateMockNFTs = (count: number, offset: number): CollectionNFT[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `nft-${offset + i}`,
    tokenId: offset + i + 1,
    name: `Stacks Punk #${offset + i + 1}`,
    image: null,
    owner: `SP${Math.random().toString(36).substring(2, 8).toUpperCase()}...`,
    price: Math.random() > 0.5 ? Math.round(Math.random() * 100 * 10) / 10 : undefined,
    rarity: ['Common', 'Uncommon', 'Rare', 'Legendary'][Math.floor(Math.random() * 4)],
    isListed: Math.random() > 0.5,
    attributes: [
      { trait_type: 'Background', value: ['Blue', 'Red', 'Green', 'Purple'][Math.floor(Math.random() * 4)] },
      { trait_type: 'Eyes', value: ['Normal', 'Laser', 'Alien'][Math.floor(Math.random() * 3)] },
      { trait_type: 'Hat', value: ['Cap', 'Beanie', 'Crown', 'None'][Math.floor(Math.random() * 4)] },
    ],
  }));
};

/**
 * useCollection - Hook for collection data management
 */
export function useCollection({
  collectionId,
  autoRefresh = false,
  refreshInterval = 60000,
}: UseCollectionOptions): UseCollectionReturn {
  const [collection, setCollection] = useState<Collection | null>(null);
  const [nfts, setNfts] = useState<CollectionNFT[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Fetch collection data
  const fetchCollection = useCallback(async () => {
    try {
      // In production, this would be an API call
      // const response = await fetch(`/api/collections/${collectionId}`);
      // const data = await response.json();
      
      await new Promise(resolve => setTimeout(resolve, 500));
      setCollection(mockCollection);
      setTotalCount(mockCollection.totalSupply);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch collection'));
    }
  }, [collectionId]);

  // Fetch NFTs
  const fetchNFTs = useCallback(async (pageNum: number, append = false) => {
    try {
      setIsLoading(true);
      
      // In production, this would be an API call
      // const response = await fetch(`/api/collections/${collectionId}/nfts?page=${pageNum}&limit=${PAGE_SIZE}`);
      // const data = await response.json();
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const offset = (pageNum - 1) * PAGE_SIZE;
      const remainingItems = Math.max(0, totalCount - offset);
      const itemsToFetch = Math.min(PAGE_SIZE, remainingItems);
      
      const newNfts = generateMockNFTs(itemsToFetch, offset);
      
      if (append) {
        setNfts(prev => [...prev, ...newNfts]);
      } else {
        setNfts(newNfts);
      }
      
      setHasMore(offset + itemsToFetch < totalCount);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch NFTs'));
    } finally {
      setIsLoading(false);
    }
  }, [collectionId, totalCount]);

  // Initial fetch
  useEffect(() => {
    fetchCollection();
  }, [fetchCollection]);

  // Fetch NFTs when page changes or collection loads
  useEffect(() => {
    if (totalCount > 0) {
      fetchNFTs(page, page > 1);
    }
  }, [page, totalCount, fetchNFTs]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchCollection();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchCollection]);

  // Fetch more (next page)
  const fetchMore = useCallback(async () => {
    if (!hasMore || isLoading) return;
    setPage(prev => prev + 1);
  }, [hasMore, isLoading]);

  // Refresh all data
  const refresh = useCallback(async () => {
    setPage(1);
    setNfts([]);
    await fetchCollection();
    await fetchNFTs(1, false);
  }, [fetchCollection, fetchNFTs]);

  return {
    collection,
    nfts,
    isLoading,
    error,
    totalCount,
    page,
    hasMore,
    fetchMore,
    refresh,
    setPage,
  };
}

export default useCollection;
