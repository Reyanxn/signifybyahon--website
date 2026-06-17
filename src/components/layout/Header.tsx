'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { HiMenu, HiX, HiSearch, HiHeart, HiShoppingBag, HiUser } from 'react-icons/hi';
import { useCartStore } from '@/store/cartStore';
import { useUIStore } from '@/store/uiStore';
import { NAV_LINKS } from '@/utils/constants';

function CartBadge({ count }: { count: number }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted || count <= 0) return null;
  return (
    <span className="absolute -top-0.5 -right-0.5 bg-[#1C1C1C] text-white text-[10px] w-4 h-4 flex items-center justify-center font-medium">
      {count > 9 ? '9+' : count}
    </span>
  );
}
import SearchDrawer from './SearchDrawer';
import CartDrawer from './CartDrawer';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const itemCount = useCartStore((s) => s.getItemCount());
  const { isMobileMenuOpen, toggleMobileMenu, toggleCart, toggleSearch, closeAll } = useUIStore();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    closeAll();
  }, [pathname, closeAll]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled ? 'bg-white shadow-sm' : 'bg-transparent'
        }`}
      >
        <div className="container-site">
          <div className="flex items-center justify-between h-16 md:h-20">
            <button
              className="lg:hidden p-2 -ml-2"
              onClick={toggleMobileMenu}
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <HiX className="w-5 h-5" /> : <HiMenu className="w-5 h-5" />}
            </button>

            <nav className="hidden lg:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-xs uppercase tracking-[0.2em] transition-colors ${
                    pathname === link.href ? 'opacity-100' : 'opacity-60 hover:opacity-100'
                  } ${scrolled || pathname !== '/' ? 'text-[#1C1C1C]' : 'text-white'}`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <Link href="/" className={`absolute left-1/2 -translate-x-1/2 font-medium text-sm uppercase tracking-[0.3em] transition-colors ${scrolled || pathname !== '/' ? 'text-[#1C1C1C]' : 'text-white'}`}>
              SIGNIFY BY AHON
            </Link>

            <div className="flex items-center gap-1">
              <button onClick={toggleSearch} className="p-2" aria-label="Search">
                <HiSearch className={`w-4 h-4 ${scrolled || pathname !== '/' ? 'text-[#1C1C1C]' : 'text-white'}`} />
              </button>
              <Link href="/account" className="p-2 hidden sm:block" aria-label="Account">
                <HiUser className={`w-4 h-4 ${scrolled || pathname !== '/' ? 'text-[#1C1C1C]' : 'text-white'}`} />
              </Link>
              <Link href="/account?tab=wishlist" className="p-2 hidden sm:block" aria-label="Wishlist">
                <HiHeart className={`w-4 h-4 ${scrolled || pathname !== '/' ? 'text-[#1C1C1C]' : 'text-white'}`} />
              </Link>
              <button onClick={toggleCart} className="p-2 relative" aria-label="Cart">
                <HiShoppingBag className={`w-4 h-4 ${scrolled || pathname !== '/' ? 'text-[#1C1C1C]' : 'text-white'}`} />
                <CartBadge count={itemCount} />
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden bg-white border-t border-[#DDDDDD]"
            >
              <div className="container-site py-4 space-y-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block py-3 text-xs uppercase tracking-[0.2em] border-b border-[#DDDDDD]"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  href="/account?tab=wishlist"
                  className="block py-3 text-xs uppercase tracking-[0.2em] sm:hidden"
                >
                  Wishlist
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      <SearchDrawer />
      <CartDrawer />
    </>
  );
}
