'use client';

/**
 * useNFT Hook
 * NFT-specific hooks for fetching and managing NFT data
 * @module hooks/useNFT
 * @version 1.0.0
 */

import { useState, useEffect, useCallback, useMemo } from 'react';

// Types
interface NFTMetadata {
  name: string;
  description?: string;
  image: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
    display_type?: string;
  }>;
  properties?: Record<string, unknown>;
}

interface NFT {
  tokenId: string;
  contractAddress: string;
  owner: string;
  metadata: NFTMetadata;
  price?: number;
  isListed: boolean;
  listingId?: string;
  createdAt: Date;
  lastTransferAt?: Date;
}

interface Collection {
  contractAddress: string;
  name: string;
  description?: string;
  image?: string;
  bannerImage?: string;
  creator: string;
  totalSupply: number;
  maxSupply?: number;
  royaltyPercentage: number;
  floorPrice?: number;
  totalVolume?: number;
  isVerified: boolean;
}

/**
 * Hook for fetching single NFT data
 */
export function useNFT(contractAddress: string, tokenId: string) {
  const [nft, setNFT] = useState<NFT | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchNFT = useCallback(async () => {
    if (!contractAddress || !tokenId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Simulated API call - replace with actual API
      const response = await fetch(`/api/nfts/${contractAddress}/${tokenId}`);
      if (!response.ok) throw new Error('Failed to fetch NFT');
      
      const data = await response.json();
      setNFT(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [contractAddress, tokenId]);

  useEffect(() => {
    fetchNFT();
  }, [fetchNFT]);

  return {
    nft,
    isLoading,
    error,
    refetch: fetchNFT,
  };
}

/**
 * Hook for fetching NFTs by owner
 */
export function useNFTsByOwner(ownerAddress: string, options?: {
  limit?: number;
  offset?: number;
}) {
  const [nfts, setNFTs] = useState<NFT[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  const { limit = 20, offset = 0 } = options || {};

  const fetchNFTs = useCallback(async (page = 0) => {
    if (!ownerAddress) return;

    setIsLoading(true);
    setError(null);

    try {
      // Simulated API call
      const response = await fetch(
        `/api/nfts/owner/${ownerAddress}?limit=${limit}&offset=${page * limit}`
      );
      if (!response.ok) throw new Error('Failed to fetch NFTs');
      
      const data = await response.json();
      
      if (page === 0) {
        setNFTs(data.items);
      } else {
        setNFTs((prev) => [...prev, ...data.items]);
      }
      
      setTotal(data.total);
      setHasMore(data.items.length === limit);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [ownerAddress, limit]);

  useEffect(() => {
    fetchNFTs(0);
  }, [ownerAddress]);

  const loadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      const nextPage = Math.floor(nfts.length / limit);
      fetchNFTs(nextPage);
    }
  }, [hasMore, isLoading, nfts.length, limit, fetchNFTs]);

  return {
    nfts,
    isLoading,
    error,
    hasMore,
    total,
    loadMore,
    refetch: () => fetchNFTs(0),
  };
}

/**
 * Hook for fetching collection data
 */
export function useCollection(contractAddress: string) {
  const [collection, setCollection] = useState<Collection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCollection = useCallback(async () => {
    if (!contractAddress) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/collections/${contractAddress}`);
      if (!response.ok) throw new Error('Failed to fetch collection');
      
      const data = await response.json();
      setCollection(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [contractAddress]);

  useEffect(() => {
    fetchCollection();
  }, [fetchCollection]);

  return {
    collection,
    isLoading,
    error,
    refetch: fetchCollection,
  };
}

/**
 * Hook for NFT search and filtering
 */
interface NFTFilters {
  collections?: string[];
  priceMin?: number;
  priceMax?: number;
  traits?: Record<string, string[]>;
  sortBy?: 'price_asc' | 'price_desc' | 'recent' | 'oldest';
  status?: 'all' | 'listed' | 'unlisted';
}

export function useNFTSearch(searchQuery: string, filters: NFTFilters = {}) {
  const [results, setResults] = useState<NFT[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [total, setTotal] = useState(0);

  const search = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('q', searchQuery);
      if (filters.collections?.length) params.set('collections', filters.collections.join(','));
      if (filters.priceMin !== undefined) params.set('priceMin', String(filters.priceMin));
      if (filters.priceMax !== undefined) params.set('priceMax', String(filters.priceMax));
      if (filters.sortBy) params.set('sortBy', filters.sortBy);
      if (filters.status) params.set('status', filters.status);

      const response = await fetch(`/api/nfts/search?${params.toString()}`);
      if (!response.ok) throw new Error('Search failed');
      
      const data = await response.json();
      setResults(data.items);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, filters]);

  useEffect(() => {
    const debounce = setTimeout(search, 300);
    return () => clearTimeout(debounce);
  }, [search]);

  return {
    results,
    isLoading,
    error,
    total,
    search,
  };
}

/**
 * Hook for NFT metadata parsing
 */
export function useNFTMetadata(metadataUri: string) {
  const [metadata, setMetadata] = useState<NFTMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!metadataUri) {
      setIsLoading(false);
      return;
    }

    const fetchMetadata = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Handle IPFS URIs
        let uri = metadataUri;
        if (uri.startsWith('ipfs://')) {
          uri = `https://ipfs.io/ipfs/${uri.slice(7)}`;
        }

        const response = await fetch(uri);
        if (!response.ok) throw new Error('Failed to fetch metadata');
        
        const data = await response.json();
        
        // Normalize image URI
        if (data.image?.startsWith('ipfs://')) {
          data.image = `https://ipfs.io/ipfs/${data.image.slice(7)}`;
        }

        setMetadata(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetadata();
  }, [metadataUri]);

  return { metadata, isLoading, error };
}

/**
 * Hook for getting trait rarity info
 */
export function useTraitRarity(
  collectionAddress: string,
  traits: Array<{ trait_type: string; value: string }>
) {
  const [rarities, setRarities] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!collectionAddress || !traits.length) {
      setIsLoading(false);
      return;
    }

    const fetchRarities = async () => {
      try {
        const response = await fetch(`/api/collections/${collectionAddress}/traits`);
        if (!response.ok) return;
        
        const traitStats = await response.json();
        
        const newRarities: Record<string, number> = {};
        for (const trait of traits) {
          const key = `${trait.trait_type}:${trait.value}`;
          const stat = traitStats[trait.trait_type]?.[trait.value];
          if (stat) {
            newRarities[key] = stat.percentage;
          }
        }
        
        setRarities(newRarities);
      } catch {
        // Silently fail for rarity data
      } finally {
        setIsLoading(false);
      }
    };

    fetchRarities();
  }, [collectionAddress, traits]);

  return { rarities, isLoading };
}

export default useNFT;
