import { useState, useEffect, ReactNode } from 'react';
import { Product } from '../types';

interface WishlistContextValue {
  wishlist: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: number) => void;
  isInWishlist: (productId: number) => boolean;
  wishlistCount: number;
}

// Create a simple context-like pattern using localStorage
const WISHLIST_KEY = 'baby_only_wishlist';

export function useWishlist(): WishlistContextValue {
  const [wishlist, setWishlist] = useState<Product[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(WISHLIST_KEY);
    if (saved) {
      setWishlist(JSON.parse(saved));
    }
  }, []);

  const addToWishlist = (product: Product) => {
    setWishlist(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) return prev;
      
      const updated = [...prev, product];
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const removeFromWishlist = (productId: number) => {
    setWishlist(prev => {
      const updated = prev.filter(p => p.id !== productId);
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const isInWishlist = (productId: number) => {
    return wishlist.some(p => p.id === productId);
  };

  return {
    wishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    wishlistCount: wishlist.length,
  };
}
