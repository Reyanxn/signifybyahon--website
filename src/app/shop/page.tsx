'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { HiAdjustments, HiX } from 'react-icons/hi';
import ProductCard from '@/components/product/ProductCard';
import { SORT_OPTIONS } from '@/utils/constants';
import { getProducts } from '@/lib/supabaseServices';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/types';

const filterTypes = [
  { value: 'all', label: 'All' },
  { value: 'new-arrivals', label: 'New Arrivals' },
  { value: 'best-sellers', label: 'Best Sellers' },
  { value: 'trending', label: 'Trending' },
  { value: 'sale', label: 'Sale' },
];

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const colors = ['Black', 'White', 'Red', 'Blue', 'Green', 'Pink', 'Gold'];

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [dbCategories, setDbCategories] = useState<{ slug: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('latest');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 99999999]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    getProducts().then((prods) => {
      setProducts(prods);
      setLoading(false);
    });
    supabase.from('categories').select('slug, name').order('created_at', { ascending: true }).then(({ data }) => {
      if (data) setDbCategories(data);
    });
  }, []);

  const allFilters = useMemo(() => {
    const cats = dbCategories.map((c) => ({ value: c.slug, label: c.name }));
    return [...filterTypes, ...cats];
  }, [dbCategories]);

  const filteredProducts = useMemo(() => {
    let filtered = [...products];
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'sale') filtered = filtered.filter((p) => p.salePrice);
      else if (selectedCategory === 'best-sellers') filtered = filtered.filter((p) => p.bestSeller);
      else if (selectedCategory === 'trending') filtered = filtered.filter((p) => p.trending);
      else if (selectedCategory === 'new-arrivals') filtered = filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      else filtered = filtered.filter((p) => p.categoryId === selectedCategory);
    }
    if (selectedSizes.length > 0) filtered = filtered.filter((p) => p.sizes?.some((s) => selectedSizes.includes(s)));
    if (selectedColors.length > 0) filtered = filtered.filter((p) => p.colors?.some((c) => selectedColors.includes(c)));
    filtered = filtered.filter((p) => {
      const price = p.salePrice || p.price;
      return price >= priceRange[0] && price <= priceRange[1];
    });
    switch (sortBy) {
      case 'price-low': filtered.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price)); break;
      case 'price-high': filtered.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price)); break;
      case 'name': filtered.sort((a, b) => a.name.localeCompare(b.name)); break;
    }
    return filtered;
  }, [products, selectedCategory, selectedSizes, selectedColors, priceRange, sortBy]);

  const toggleSize = (size: string) => setSelectedSizes((p) => p.includes(size) ? p.filter((s) => s !== size) : [...p, size]);
  const toggleColor = (color: string) => setSelectedColors((p) => p.includes(color) ? p.filter((c) => c !== color) : [...p, color]);

  return (
    <div className="pt-16 md:pt-20">
      <div className="section-spacing bg-[#F9F9F9]">
        <div className="container-site">
          <p className="text-[10px] uppercase tracking-[0.3em] opacity-40 mb-2">Our Collection</p>
          <h1 className="text-2xl md:text-3xl tracking-[0.2em] font-normal">Shop</h1>
        </div>
      </div>

      <div className="container-site py-8">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => setShowFilters(!showFilters)} className="lg:hidden flex items-center gap-2 text-[10px] uppercase tracking-[0.2em]">
            <HiAdjustments className="w-4 h-4" /> Filters
          </button>
          <div className="hidden lg:flex items-center gap-6 flex-wrap">
            {allFilters.map((cat) => (
              <button key={cat.value} onClick={() => setSelectedCategory(cat.value)}
                className={`text-[10px] uppercase tracking-[0.2em] transition-opacity whitespace-nowrap ${selectedCategory === cat.value ? 'opacity-100' : 'opacity-40 hover:opacity-70'}`}
              >{cat.label}</button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[10px] uppercase tracking-[0.2em] opacity-40">Sort:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
              className="text-[10px] uppercase tracking-[0.2em] border border-[#DDDDDD] px-3 py-2 focus:outline-none focus:border-[#1C1C1C] bg-white"
            >{SORT_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}</select>
          </div>
        </div>

        <div className="flex gap-10">
          <aside className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-56 flex-shrink-0`}>
            <div className="lg:sticky lg:top-24 space-y-8">
              <div className="flex items-center justify-between lg:hidden">
                <span className="text-[10px] uppercase tracking-[0.2em]">Filters</span>
                <button onClick={() => setShowFilters(false)}><HiX className="w-4 h-4" /></button>
              </div>
              <div>
                <h4 className="text-[10px] uppercase tracking-[0.2em] mb-4 pb-2 border-b border-[#DDDDDD]">Price</h4>
                <div className="flex items-center gap-2">
                  <input type="number" value={priceRange[0]} onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])} className="input-field text-[10px] p-2 w-full" placeholder="Min" />
                  <span className="text-[10px] opacity-40">-</span>
                  <input type="number" value={priceRange[1]} onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])} className="input-field text-[10px] p-2 w-full" placeholder="Max" />
                </div>
              </div>
              <div>
                <h4 className="text-[10px] uppercase tracking-[0.2em] mb-4 pb-2 border-b border-[#DDDDDD]">Size</h4>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <button key={size} onClick={() => toggleSize(size)}
                      className={`px-3 py-1.5 text-[10px] uppercase tracking-[0.1em] border transition-colors ${selectedSizes.includes(size) ? 'bg-[#1C1C1C] text-white border-[#1C1C1C]' : 'border-[#DDDDDD] hover:border-[#1C1C1C]'}`}
                    >{size}</button>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-[10px] uppercase tracking-[0.2em] mb-4 pb-2 border-b border-[#DDDDDD]">Color</h4>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => (
                    <button key={color} onClick={() => toggleColor(color)}
                      className={`px-3 py-1.5 text-[10px] uppercase tracking-[0.1em] border transition-colors ${selectedColors.includes(color) ? 'bg-[#1C1C1C] text-white border-[#1C1C1C]' : 'border-[#DDDDDD] hover:border-[#1C1C1C]'}`}
                    >{color}</button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <div className="flex-1">
            {loading ? (
              <p className="text-xs opacity-40 text-center py-20">Loading products...</p>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-xs opacity-40 uppercase tracking-[0.2em]">No products found</p>
                <button className="btn btn-outline mt-4" onClick={() => { setSelectedCategory('all'); setSelectedSizes([]); setSelectedColors([]); setPriceRange([0, 100000]); }}>
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="product-grid">
                {filteredProducts.map((product, i) => (
                  <motion.div key={product.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}>
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
