'use client';

import { useState } from 'react';
import Link from 'next/link';
import { HiHeart, HiShoppingBag } from 'react-icons/hi';
import { formatPrice, getTotalStock } from '@/utils/helpers';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    salePrice?: number;
    stock?: number;
    image?: string;
    images?: string[];
    category?: string;
    sizeStock?: { name: string; stock: number; visible: boolean }[];
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const hasSecondImage = (product.images?.length || 0) >= 2;
  const isOutOfStock = getTotalStock(product) === 0;

  return (
    <div className="group" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <Link href={`/product/${product.id}`}>
        <div className="aspect-[3/4] bg-[#F5F5F5] relative overflow-hidden">
          {product.images?.[0] ? (
            <div className="relative w-full h-full">
              <img
                src={product.images[0]}
                alt={product.name}
                className={`w-full h-full object-cover transition-all duration-700 ${hovered ? (hasSecondImage ? 'opacity-0' : 'scale-110') : ''}`}
              />
              {hasSecondImage && (
                <img
                  src={product.images[1]}
                  alt={product.name}
                  className="absolute inset-0 w-full h-full object-cover transition-all duration-700 scale-105 hover:scale-110"
                  style={{ opacity: hovered ? 1 : 0 }}
                />
              )}
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[10px] uppercase tracking-[0.2em] text-gray-400">
              {product.name}
            </div>
          )}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {product.salePrice && (
              <span className="text-[10px] uppercase tracking-[0.1em] text-[#E40100] bg-white/90 px-2 py-0.5">Sale</span>
            )}
            {isOutOfStock && (
              <span className="text-[10px] uppercase tracking-[0.1em] text-white bg-[#1C1C1C] px-2 py-0.5">Stock Out</span>
            )}
          </div>
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="w-8 h-8 bg-white flex items-center justify-center hover:bg-[#F5F5F5]" aria-label="Add to wishlist">
              <HiHeart className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-white py-3 px-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button disabled={isOutOfStock} className={`w-full flex items-center justify-center gap-2 py-2.5 text-[10px] uppercase tracking-[0.2em] transition-opacity ${
              isOutOfStock ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#1C1C1C] text-white hover:opacity-90'
            }`}>
              <HiShoppingBag className="w-3.5 h-3.5" />
              {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </Link>
      <div className="mt-3 text-center">
        <Link href={`/product/${product.id}`}>
          <h3 className="text-xs uppercase tracking-[0.2em] hover:opacity-60 transition-opacity">{product.name}</h3>
        </Link>
        <div className="mt-1">
          {product.salePrice ? (
            <div className="flex items-center justify-center gap-2 text-xs">
              <span className="text-[#E40100]">{formatPrice(product.salePrice)}</span>
              <span className="text-gray-400 line-through">{formatPrice(product.price)}</span>
            </div>
          ) : (
            <span className="text-xs">{formatPrice(product.price)}</span>
          )}
        </div>
      </div>
    </div>
  );
}
