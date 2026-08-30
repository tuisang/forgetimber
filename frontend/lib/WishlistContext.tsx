"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface WishlistItem {
  id: number;
  name: string;
  price: number;
  img: string;
}

interface WishlistContextType {
  items: WishlistItem[];
  isWishlisted: (id: number) => boolean;
  toggleWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (id: number) => void;
  clearWishlist: () => void;
  totalItems: number;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("ft-wishlist");
      if (saved) setItems(JSON.parse(saved));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("ft-wishlist", JSON.stringify(items));
  }, [items, hydrated]);

  const isWishlisted = (id: number) => items.some((i) => i.id === id);

  const toggleWishlist = (item: WishlistItem) => {
    setItems((prev) =>
      prev.some((i) => i.id === item.id)
        ? prev.filter((i) => i.id !== item.id)
        : [...prev, item]
    );
  };

  const removeFromWishlist = (id: number) =>
    setItems((prev) => prev.filter((i) => i.id !== id));

  const clearWishlist = () => setItems([]);
  const totalItems = items.length;

  return (
    <WishlistContext.Provider
      value={{ items, isWishlisted, toggleWishlist, removeFromWishlist, clearWishlist, totalItems }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
