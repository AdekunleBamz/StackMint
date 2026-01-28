'use client';

/**
 * useMarketplace Hooks
 * Marketplace interaction and data hooks
 * @module hooks/useMarketplace
 * @version 1.0.0
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useWallet } from '@/hooks/useWallet';

// Types
export interface Listing {
  id: string;
  tokenId: number;
  contractAddress: string;
  seller: string;
  price: number;
  currency: 'STX' | 'SIP010';
  status: 'active' | 'sold' | 'cancelled';
  listedAt: Date;
  expiresAt?: Date;
  metadata?: {
    name: string;
    image: string;
    attributes?: Record<string, string>;
  };
}

export interface MarketStats {
  totalVolume: number;
  dailyVolume: number;
  weeklyVolume: number;
  totalListings: number;
  activeListings: number;
  totalSales: number;
  avgPrice: number;
  floorPrice: number;
}

export interface Offer {
  id: string;
  tokenId: number;
  contractAddress: string;
  offerer: string;
  amount: number;
  expiresAt: Date;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
}

interface SortOption {
  field: 'price' | 'listedAt' | 'name';
  order: 'asc' | 'desc';
}

interface FilterOptions {
  minPrice?: number;
  maxPrice?: number;
  collection?: string;
  seller?: string;
  status?: Listing['status'];
  traits?: Record<string, string[]>;
}

/**
 * Hook for fetching marketplace listings
 */
export function useListings(options?: {
  filters?: FilterOptions;
  sort?: SortOption;
  limit?: number;
}) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const { filters, sort, limit = 20 } = options || {};

  // Memoize filter key for dependency tracking
  const filterKey = useMemo(() => JSON.stringify({ filters, sort }), [filters, sort]);

  const fetchListings = useCallback(async (page = 0) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulated API call - replace with actual marketplace API
      const queryParams = new URLSearchParams({
        limit: limit.toString(),
        offset: (page * limit).toString(),
        ...(filters?.minPrice && { minPrice: filters.minPrice.toString() }),
        ...(filters?.maxPrice && { maxPrice: filters.maxPrice.toString() }),
        ...(filters?.collection && { collection: filters.collection }),
        ...(filters?.seller && { seller: filters.seller }),
        ...(filters?.status && { status: filters.status }),
        ...(sort && { sortField: sort.field, sortOrder: sort.order }),
      });

      const response = await fetch(`/api/marketplace/listings?${queryParams}`);
      
      if (!response.ok) {
        // Return mock data for development
        const mockListings: Listing[] = Array.from({ length: limit }, (_, i) => ({
          id: `listing-${page * limit + i}`,
          tokenId: page * limit + i + 1,
          contractAddress: 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.stacksmint-nft',
          seller: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
          price: Math.floor(Math.random() * 1000) + 50,
          currency: 'STX' as const,
          status: 'active' as const,
          listedAt: new Date(Date.now() - Math.random() * 86400000 * 30),
          metadata: {
            name: `StacksMint NFT #${page * limit + i + 1}`,
            image: `/nft-placeholder-${(i % 5) + 1}.png`,
          },
        }));

        if (page === 0) {
          setListings(mockListings);
        } else {
          setListings((prev) => [...prev, ...mockListings]);
        }
        
        setHasMore(mockListings.length === limit);
        return;
      }

      const data = await response.json();
      
      if (page === 0) {
        setListings(data.listings);
      } else {
        setListings((prev) => [...prev, ...data.listings]);
      }
      
      setHasMore(data.listings.length === limit);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch listings'));
    } finally {
      setIsLoading(false);
    }
  }, [limit, filterKey]);

  useEffect(() => {
    fetchListings(0);
  }, [filterKey]);

  const loadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      const nextPage = Math.floor(listings.length / limit);
      fetchListings(nextPage);
    }
  }, [hasMore, isLoading, listings.length, limit, fetchListings]);

  return {
    listings,
    isLoading,
    error,
    hasMore,
    loadMore,
    refetch: () => fetchListings(0),
  };
}

/**
 * Hook for marketplace statistics
 */
export function useMarketStats(collectionAddress?: string) {
  const [stats, setStats] = useState<MarketStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      
      try {
        const url = collectionAddress
          ? `/api/marketplace/stats/${collectionAddress}`
          : '/api/marketplace/stats';
          
        const response = await fetch(url);
        
        if (!response.ok) {
          // Return mock stats for development
          setStats({
            totalVolume: 125000,
            dailyVolume: 5000,
            weeklyVolume: 35000,
            totalListings: 1500,
            activeListings: 450,
            totalSales: 3200,
            avgPrice: 150,
            floorPrice: 25,
          });
          return;
        }
        
        const data = await response.json();
        setStats(data);
      } catch {
        // Set mock data on error
        setStats({
          totalVolume: 125000,
          dailyVolume: 5000,
          weeklyVolume: 35000,
          totalListings: 1500,
          activeListings: 450,
          totalSales: 3200,
          avgPrice: 150,
          floorPrice: 25,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [collectionAddress]);

  return { stats, isLoading };
}

/**
 * Hook for user's listings
 */
export function useMyListings() {
  const { address, isConnected } = useWallet();
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!isConnected || !address) {
      setListings([]);
      setIsLoading(false);
      return;
    }

    const fetchMyListings = async () => {
      setIsLoading(true);
      
      try {
        const response = await fetch(`/api/marketplace/listings?seller=${address}`);
        
        if (!response.ok) {
          // Mock data for development
          setListings([
            {
              id: 'my-listing-1',
              tokenId: 42,
              contractAddress: 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.stacksmint-nft',
              seller: address,
              price: 250,
              currency: 'STX',
              status: 'active',
              listedAt: new Date(),
              metadata: {
                name: 'My NFT #42',
                image: '/nft-placeholder-1.png',
              },
            },
          ]);
          return;
        }
        
        const data = await response.json();
        setListings(data.listings);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch listings'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyListings();
  }, [address, isConnected]);

  return { listings, isLoading, error };
}

/**
 * Hook for offers management
 */
export function useOffers(tokenId?: number, contractAddress?: string) {
  const { address } = useWallet();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [myOffers, setMyOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!tokenId || !contractAddress) {
      setOffers([]);
      setIsLoading(false);
      return;
    }

    const fetchOffers = async () => {
      setIsLoading(true);
      
      try {
        const response = await fetch(
          `/api/marketplace/offers?tokenId=${tokenId}&contract=${contractAddress}`
        );
        
        if (!response.ok) {
          // Mock data
          const mockOffers: Offer[] = [
            {
              id: 'offer-1',
              tokenId,
              contractAddress,
              offerer: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
              amount: 200,
              expiresAt: new Date(Date.now() + 86400000 * 3),
              status: 'pending',
            },
            {
              id: 'offer-2',
              tokenId,
              contractAddress,
              offerer: 'SP3FGQ8Z7JY9BWYZ5WM53E0M9NK7WHJF0691NZ159',
              amount: 180,
              expiresAt: new Date(Date.now() + 86400000 * 2),
              status: 'pending',
            },
          ];
          
          setOffers(mockOffers);
          setMyOffers(mockOffers.filter((o) => o.offerer === address));
          return;
        }
        
        const data = await response.json();
        setOffers(data.offers);
        setMyOffers(data.offers.filter((o: Offer) => o.offerer === address));
      } catch {
        setOffers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOffers();
  }, [tokenId, contractAddress, address]);

  return { offers, myOffers, isLoading };
}

/**
 * Hook for listing actions
 */
export function useListingActions() {
  const { address, isConnected } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createListing = useCallback(async (params: {
    tokenId: number;
    contractAddress: string;
    price: number;
    expiresAt?: Date;
  }) => {
    if (!isConnected) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      // In real implementation, this would call the smart contract
      console.log('Creating listing:', params);
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      return {
        success: true,
        listingId: `listing-${Date.now()}`,
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create listing');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected]);

  const cancelListing = useCallback(async (listingId: string) => {
    if (!isConnected) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Cancelling listing:', listingId);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      return { success: true };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to cancel listing');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected]);

  const updatePrice = useCallback(async (listingId: string, newPrice: number) => {
    if (!isConnected) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Updating price:', listingId, newPrice);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      return { success: true };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update price');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected]);

  const buyNow = useCallback(async (listingId: string) => {
    if (!isConnected) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Buying NFT:', listingId);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      return {
        success: true,
        txId: `0x${Math.random().toString(16).slice(2)}`,
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to buy NFT');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected]);

  return {
    createListing,
    cancelListing,
    updatePrice,
    buyNow,
    isLoading,
    error,
  };
}

export default useListings;
