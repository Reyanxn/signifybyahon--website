'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { HiHeart, HiShare, HiMinus, HiPlus, HiTruck, HiRefresh, HiShieldCheck } from 'react-icons/hi';
import Button from '@/components/ui/Button';
import StarRating from '@/components/ui/StarRating';
import ProductCard from '@/components/product/ProductCard';
import { formatPrice } from '@/utils/helpers';
import { useCartStore } from '@/store/cartStore';
import { getProduct } from '@/lib/supabaseServices';
import type { Product } from '@/types';
import toast from 'react-hot-toast';

export default function ProductPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    if (params.id) {
      setLoading(true);
      getProduct(params.id as string).then((data) => {
        setProduct(data as Product);
        setLoading(false);
      });
    }
  }, [params.id]);

  if (loading) return <div className="pt-16 md:pt-20 min-h-screen flex items-center justify-center"><p className="text-xs opacity-40">Loading...</p></div>;
  if (!product) return <div className="pt-16 md:pt-20 min-h-screen flex items-center justify-center"><p className="text-xs opacity-40">Product not found</p></div>;

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) { toast.error('Please select size and color'); return; }
    addItem({ productId: product.id, name: product.name, image: product.images?.[0] || '', price: product.salePrice || product.price, quantity, size: selectedSize, color: selectedColor });
    toast.success('Added to cart!');
  };

  return (
    <div className="pt-16 md:pt-20">
      <div className="container-site py-8">
        <nav className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] opacity-40 mb-8">
          <Link href="/" className="hover:opacity-100">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:opacity-100">Shop</Link>
          <span>/</span>
          <span className="opacity-100">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <div className="aspect-[4/5] bg-[#F5F5F5] mb-3 relative group">
              {product.images?.[selectedImage] ? (
                <img src={product.images[selectedImage]} alt={product.name} className="w-full h-full object-cover" />
              ) : <div className="w-full h-full" />}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {(product.images?.length ? product.images : ['', '', '', '']).map((img, i) => (
                <button key={i} onClick={() => setSelectedImage(i)}
                  className={`aspect-[4/5] bg-[#F5F5F5] border ${i === selectedImage ? 'border-[#1C1C1C]' : 'border-transparent hover:border-[#DDDDDD]'}`}
                >{img ? <img src={img} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full" />}</button>
              ))}
            </div>
            {(product as any).video && (
              <div className="mt-3 aspect-video bg-[#F5F5F5]">
                {(product as any).video.includes('youtube') || (product as any).video.includes('youtu.be') ? (
                  <iframe src={(product as any).video.replace('watch?v=', 'embed/')} className="w-full h-full" allowFullScreen />
                ) : (
                  <video src={(product as any).video} className="w-full h-full object-cover" controls />
                )}
              </div>
            )}
          </div>

          <div>
            <h1 className="text-lg md:text-xl tracking-[0.2em] font-normal">{product.name}</h1>
            <div className="flex items-center gap-3 mt-3">
              <StarRating rating={4.5} size="sm" />
              <span className="text-[10px] uppercase tracking-[0.1em] opacity-40">(0 reviews)</span>
            </div>

            <div className="mt-6 flex items-baseline gap-3">
              {product.salePrice ? (
                <><span className="text-lg text-[#E40100]">{formatPrice(product.salePrice)}</span><span className="text-sm opacity-40 line-through">{formatPrice(product.price)}</span></>
              ) : (<span className="text-lg">{formatPrice(product.price)}</span>)}
            </div>

            <p className="mt-6 text-sm opacity-70 leading-relaxed">{product.description}</p>
            {product.fabricDetails && <div className="mt-6 p-4 bg-[#F9F9F9] text-xs opacity-70"><span className="font-medium">Fabric:</span> {product.fabricDetails}</div>}

            <div className="mt-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] uppercase tracking-[0.2em]">Color: {selectedColor}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.colors?.map((color) => (
                  <button key={color} onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 text-[10px] uppercase tracking-[0.1em] border transition-colors ${selectedColor === color ? 'bg-[#1C1C1C] text-white border-[#1C1C1C]' : 'border-[#DDDDDD] hover:border-[#1C1C1C]'}`}>{color}</button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] uppercase tracking-[0.2em]">Size: {selectedSize}</span>
                <button onClick={() => setShowSizeGuide(!showSizeGuide)} className="text-[10px] uppercase tracking-[0.1em] underline opacity-60 hover:opacity-100">Size Guide</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes?.map((size) => (
                  <button key={size} onClick={() => setSelectedSize(size)}
                    className={`w-10 h-10 text-[10px] uppercase border transition-colors ${selectedSize === size ? 'bg-[#1C1C1C] text-white border-[#1C1C1C]' : 'border-[#DDDDDD] hover:border-[#1C1C1C]'}`}>{size}</button>
                ))}
              </div>
              {showSizeGuide && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 p-4 bg-[#F9F9F9] text-[10px] uppercase tracking-[0.1em]">
                  <table className="w-full text-left">
                    <thead><tr className="border-b"><th className="py-1">Size</th><th className="py-1">Bust</th><th className="py-1">Waist</th><th className="py-1">Hips</th></tr></thead>
                    <tbody>{[{ s: 'S', b: '34"', w: '28"', h: '36"' }, { s: 'M', b: '36"', w: '30"', h: '38"' }, { s: 'L', b: '38"', w: '32"', h: '40"' }, { s: 'XL', b: '40"', w: '34"', h: '42"' }].map((row) => (
                      <tr key={row.s} className="border-b"><td className="py-1">{row.s}</td><td className="py-1">{row.b}</td><td className="py-1">{row.w}</td><td className="py-1">{row.h}</td></tr>
                    ))}</tbody>
                  </table>
                </motion.div>
              )}
            </div>

            <div className="mt-6">
              <span className="text-[10px] uppercase tracking-[0.2em] block mb-3">Quantity</span>
              <div className="flex items-center border border-[#DDDDDD] w-fit">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:bg-[#F9F9F9]"><HiMinus className="w-3 h-3" /></button>
                <span className="w-10 text-center text-xs">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="p-3 hover:bg-[#F9F9F9]"><HiPlus className="w-3 h-3" /></button>
              </div>
            </div>

            {product.stock === 0 && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 text-xs text-red-700 uppercase tracking-[0.1em] text-center">Stock Out — This product is currently unavailable</div>
            )}
            {product.stock > 0 && product.stock <= 5 && (
              <div className="mt-4 text-[10px] uppercase tracking-[0.1em] opacity-60">Only {product.stock} left in stock</div>
            )}
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button size="lg" className="flex-1" onClick={handleAddToCart} disabled={product.stock === 0}>Add to Cart</Button>
              <Button size="lg" variant="outline" className="flex-1" onClick={handleAddToCart} disabled={product.stock === 0}>Buy Now</Button>
            </div>

            <div className="mt-4 flex items-center gap-6">
              <button className="flex items-center gap-2 text-[10px] uppercase tracking-[0.1em] opacity-50 hover:opacity-100 transition-opacity"><HiHeart className="w-4 h-4" /> Wishlist</button>
              <button className="flex items-center gap-2 text-[10px] uppercase tracking-[0.1em] opacity-50 hover:opacity-100 transition-opacity"><HiShare className="w-4 h-4" /> Share</button>
            </div>

            <div className="mt-8 border-t pt-6 space-y-3">
              <div className="flex items-start gap-3 text-xs opacity-60"><HiTruck className="w-4 h-4 mt-0.5" /> Free shipping on orders over ৳2,000</div>
              <div className="flex items-start gap-3 text-xs opacity-60"><HiRefresh className="w-4 h-4 mt-0.5" /> 7 days easy returns</div>
              <div className="flex items-start gap-3 text-xs opacity-60"><HiShieldCheck className="w-4 h-4 mt-0.5" /> Secure checkout</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
