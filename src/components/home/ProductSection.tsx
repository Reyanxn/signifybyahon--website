'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import ProductCard from '@/components/product/ProductCard';
import { getProducts } from '@/lib/supabaseServices';
import type { Product } from '@/types';

export type SectionFilter = 'new-arrivals' | 'best-sellers' | 'trending' | 'summer' | 'sale' | 'custom';

interface ProductSectionProps {
  title: string;
  link?: string;
  filterType?: SectionFilter;
  productIds?: string[];
  alignment?: 'left' | 'center';
}

const filterMap: Record<string, Record<string, any>> = {
  'new-arrivals': { limitCount: 8 },
  'best-sellers': { bestSeller: true, limitCount: 8 },
  'trending': { trending: true, limitCount: 8 },
  'summer': { category: 'summer', limitCount: 8 },
  'sale': { onSale: true, limitCount: 8 },
};

export default function ProductSection({ title, link, filterType, productIds, alignment }: ProductSectionProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (filterType === 'custom' && productIds && productIds.length > 0) {
      Promise.all(productIds.map((id) =>
        fetch(`/api/products?id=${id}`).then((r) => r.json()).catch(() => null)
      )).then((results) => {
        setProducts(results.filter(Boolean));
        setLoading(false);
      });
    } else {
      const opts = filterMap[filterType || ''] || { limitCount: 8 };
      getProducts(opts).then((data) => { setProducts(data); setLoading(false); });
    }
  }, [filterType, productIds?.join(',')]);

  if (!loading && products.length === 0) return null;

  return (
    <section className="section-spacing">
      <div className="container-site">
        <div className={`flex items-end justify-between mb-8 ${alignment === 'center' ? 'flex-col items-center text-center' : ''}`}>
          <h2 className="text-lg md:text-xl tracking-[0.2em] font-normal">{title}</h2>
          {link && (
            <Link
              href={link}
              className="text-[10px] uppercase tracking-[0.2em] border-b border-[#1C1C1C] pb-0.5 hover:opacity-60 transition-opacity"
            >
              View All
            </Link>
          )}
        </div>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-[#F5F5F5] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className={`product-grid ${alignment === 'center' ? 'justify-center' : ''}`}>
            {products.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
