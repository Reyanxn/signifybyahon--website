'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { HiSearch, HiX } from 'react-icons/hi';
import { useUIStore } from '@/store/uiStore';
import { getProducts } from '@/lib/supabaseServices';
import type { Product } from '@/types';

function SearchContent({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    getProducts().then(setProducts);
  }, []);

  const results = useMemo(() => {
    if (query.length <= 1) return [];
    const q = query.toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [query, products]);

  return (
    <motion.div initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -80, opacity: 0 }} className="fixed top-0 left-0 right-0 bg-white z-50 border-b border-[#DDDDDD]">
      <div className="container-site py-4">
        <div className="flex items-center gap-4">
          <HiSearch className="w-4 h-4 opacity-40" />
          <input ref={inputRef} type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products..." className="flex-1 text-sm outline-none placeholder:opacity-30" />
          <button onClick={onClose}><HiX className="w-4 h-4 opacity-40 hover:opacity-100" /></button>
        </div>
        {results.length > 0 && (
          <div className="mt-4 space-y-2 max-h-80 overflow-y-auto">
            {results.map((product) => (
              <Link key={product.id} href={`/product/${product.id}`} onClick={onClose} className="flex items-center gap-3 p-2 hover:bg-[#F9F9F9]">
                <div className="w-12 h-16 bg-gray-100 flex-shrink-0 overflow-hidden">
                  {product.images?.[0] && <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.1em]">{product.name}</p>
                  <p className="text-xs mt-0.5">৳{(product.salePrice || product.price).toLocaleString()}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
        {query.length > 1 && results.length === 0 && <p className="mt-4 text-xs opacity-40 text-center py-4">No products found</p>}
      </div>
    </motion.div>
  );
}

export default function SearchDrawer() {
  const { isSearchOpen, toggleSearch } = useUIStore();

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/20 z-40" onClick={toggleSearch} />
          <SearchContent key={String(isSearchOpen)} onClose={toggleSearch} />
        </>
      )}
    </AnimatePresence>
  );
}
