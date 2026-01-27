'use client';

/**
 * useFavorites Hook
 * Manages user's favorite NFTs with localStorage persistence
 * @module hooks/useFavorites
 * @version 1.0.0
 */

import { useState, useCallback, useEffect } from 'react';

/** Storage key for favorites */
const STORAGE_KEY = 'stacksmint-favorites';

interface FavoriteItem {
  id: string;
  name: string;
  collection: string;
  image?: string;
  addedAt: Date;
}

interface UseFavoritesReturn {
  /** List of favorite items */
  favorites: FavoriteItem[];
  /** Check if item is favorited */
  isFavorite: (id: string) => boolean;
  /** Add item to favorites */
  addFavorite: (item: Omit<FavoriteItem, 'addedAt'>) => void;
  /** Remove item from favorites */
  removeFavorite: (id: string) => void;
  /** Toggle favorite status */
  toggleFavorite: (item: Omit<FavoriteItem, 'addedAt'>) => boolean;
  /** Clear all favorites */
  clearFavorites: () => void;
  /** Number of favorites */
  count: number;
}

export function useFavorites(): UseFavoritesReturn {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          // Convert date strings back to Date objects
          const withDates = parsed.map((item: any) => ({
            ...item,
            addedAt: new Date(item.addedAt),
          }));
          setFavorites(withDates);
        }
      } catch (error) {
        console.error('Failed to load favorites:', error);
      }
      setIsLoaded(true);
    }
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
      } catch (error) {
        console.error('Failed to save favorites:', error);
      }
    }
  }, [favorites, isLoaded]);

  // Check if item is favorited
  const isFavorite = useCallback((id: string): boolean => {
    return favorites.some((fav) => fav.id === id);
  }, [favorites]);

  // Add to favorites
  const addFavorite = useCallback((item: Omit<FavoriteItem, 'addedAt'>) => {
    setFavorites((prev) => {
      // Don't add if already exists
      if (prev.some((fav) => fav.id === item.id)) {
        return prev;
      }
      return [{ ...item, addedAt: new Date() }, ...prev];
    });
  }, []);

  // Remove from favorites
  const removeFavorite = useCallback((id: string) => {
    setFavorites((prev) => prev.filter((fav) => fav.id !== id));
  }, []);

  // Toggle favorite
  const toggleFavorite = useCallback((item: Omit<FavoriteItem, 'addedAt'>): boolean => {
    const isCurrentlyFavorite = favorites.some((fav) => fav.id === item.id);
    
    if (isCurrentlyFavorite) {
      removeFavorite(item.id);
      return false;
    } else {
      addFavorite(item);
      return true;
    }
  }, [favorites, addFavorite, removeFavorite]);

  // Clear all favorites
  const clearFavorites = useCallback(() => {
    setFavorites([]);
  }, []);

  return {
    favorites,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    clearFavorites,
    count: favorites.length,
  };
}

export default useFavorites;
