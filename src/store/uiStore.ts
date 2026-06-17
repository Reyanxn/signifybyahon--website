'use client';

import { create } from 'zustand';

interface UIState {
  isMobileMenuOpen: boolean;
  isCartOpen: boolean;
  isSearchOpen: boolean;
  isWishlistOpen: boolean;
  toggleMobileMenu: () => void;
  toggleCart: () => void;
  toggleSearch: () => void;
  toggleWishlist: () => void;
  closeAll: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isMobileMenuOpen: false,
  isCartOpen: false,
  isSearchOpen: false,
  isWishlistOpen: false,
  toggleMobileMenu: () => set((s) => ({ isMobileMenuOpen: !s.isMobileMenuOpen })),
  toggleCart: () => set((s) => ({ isCartOpen: !s.isCartOpen })),
  toggleSearch: () => set((s) => ({ isSearchOpen: !s.isSearchOpen })),
  toggleWishlist: () => set((s) => ({ isWishlistOpen: !s.isWishlistOpen })),
  closeAll: () =>
    set({
      isMobileMenuOpen: false,
      isCartOpen: false,
      isSearchOpen: false,
      isWishlistOpen: false,
    }),
}));
