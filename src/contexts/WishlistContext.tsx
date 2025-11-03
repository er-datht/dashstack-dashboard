/**
 * WishlistContext
 * Provides global wishlist state management with localStorage persistence
 */

import { createContext, useContext, useCallback } from "react";
import type { ReactNode } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

type WishlistContextType = {
  wishlist: Set<string>;
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  wishlistIds: string[];
  clearWishlist: () => void;
};

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined
);

type WishlistProviderProps = {
  children: ReactNode;
};

export function WishlistProvider({ children }: WishlistProviderProps) {
  // Store wishlist as array in localStorage, convert to Set for performance
  const [wishlistArray, setWishlistArray] = useLocalStorage<string[]>(
    "dashstack-wishlist",
    []
  );

  // Convert array to Set for O(1) lookups
  const wishlist = new Set(wishlistArray);

  const toggleWishlist = useCallback(
    (productId: string) => {
      setWishlistArray((prev) => {
        const newWishlist = new Set(prev);
        if (newWishlist.has(productId)) {
          newWishlist.delete(productId);
        } else {
          newWishlist.add(productId);
        }
        return Array.from(newWishlist);
      });
    },
    [setWishlistArray]
  );

  const isWishlisted = useCallback(
    (productId: string) => {
      return wishlist.has(productId);
    },
    [wishlist]
  );

  const clearWishlist = useCallback(() => {
    setWishlistArray([]);
  }, [setWishlistArray]);

  const value: WishlistContextType = {
    wishlist,
    toggleWishlist,
    isWishlisted,
    wishlistIds: wishlistArray,
    clearWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

/**
 * Custom hook to use wishlist context
 * Throws error if used outside WishlistProvider
 */
export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
