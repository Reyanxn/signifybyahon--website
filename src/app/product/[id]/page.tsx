'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { HiHeart, HiShare, HiMinus, HiPlus, HiTruck, HiRefresh, HiShieldCheck } from 'react-icons/hi';
import Button from '@/components/ui/Button';
import StarRating from '@/components/ui/StarRating';
import ProductCard from '@/components/product/ProductCard';
import { formatPrice, getVisibleSizes, getSizeStockByName, getTotalStock } from '@/utils/helpers';
import { useCartStore } from '@/store/cartStore';
import { getProduct, getProductReviews } from '@/lib/supabaseServices';
import { trackEvent } from '@/components/layout/MetaPixel';
import type { Product, Review } from '@/types';
import toast from 'react-hot-toast';

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewForm, setReviewForm] = useState({ userName: '', rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    if (params.id) {
      setLoading(true);
      getProduct(params.id as string).then((data) => {
        setProduct(data as Product);
        if (data) trackEvent('ViewContent', { content_ids: [data.id], content_type: 'product', value: data.salePrice || data.price, currency: 'BDT' });
        setLoading(false);
      });
      getProductReviews(params.id as string).then(setReviews).catch(() => {});
    }
  }, [params.id]);

  if (loading) return <div className="pt-16 md:pt-20 min-h-screen flex items-center justify-center"><p className="text-xs opacity-40">Loading...</p></div>;
  if (!product) return <div className="pt-16 md:pt-20 min-h-screen flex items-center justify-center"><p className="text-xs opacity-40">Product not found</p></div>;

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) { toast.error('Please select size and color'); return; }
    const sizeStock = getSizeStockByName(product, selectedSize);
    if (sizeStock === 0) { toast.error('This size is out of stock'); return; }
    addItem({ productId: product.id, name: product.name, image: product.images?.[0] || '', price: product.salePrice || product.price, quantity, size: selectedSize, color: selectedColor });
    trackEvent('AddToCart', { content_ids: [product.id], content_type: 'product', value: product.salePrice || product.price, currency: 'BDT' });
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
                <StarRating rating={reviews.length > 0 ? Math.round(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) : 0} size="sm" />
                <span className="text-[10px] uppercase tracking-[0.1em] opacity-40">({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})</span>
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
                {getVisibleSizes(product).map(({ name: size, stock: sizeStock }) => {
                  const isOut = sizeStock === 0;
                  return (
                    <button key={size} onClick={() => !isOut && setSelectedSize(size)}
                      disabled={isOut}
                      className={`relative w-12 h-12 text-[10px] uppercase border transition-colors ${selectedSize === size && !isOut ? 'bg-[#1C1C1C] text-white border-[#1C1C1C]' : isOut ? 'border-[#EEEEEE] text-gray-300 cursor-not-allowed' : 'border-[#DDDDDD] hover:border-[#1C1C1C]'}`}>
                      {size}
                      {isOut && <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[7px] text-gray-300 uppercase tracking-[0.1em] whitespace-nowrap">Out</span>}
                    </button>
                  );
                })}
              </div>
              {showSizeGuide && (() => {
                const sc = (product as any).sizeChart;
                if (sc?.columns && sc?.rows) {
                  return (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 p-4 bg-[#F9F9F9] text-[10px] uppercase tracking-[0.1em]">
                      <table className="w-full text-left">
                        <thead><tr className="border-b">{sc.columns.map((c: string, i: number) => <th key={i} className="py-1">{c || 'Size'}</th>)}</tr></thead>
                        <tbody>{sc.rows.map((row: any, ri: number) => (
                          <tr key={ri} className="border-b"><td className="py-1 font-medium">{row.label}</td>{row.values.map((v: string, vi: number) => <td key={vi} className="py-1">{v}</td>)}</tr>
                        ))}</tbody>
                      </table>
                    </motion.div>
                  );
                }
                return (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 p-4 bg-[#F9F9F9] text-[10px] uppercase tracking-[0.1em]">
                    <p className="opacity-60">No size chart available for this product.</p>
                  </motion.div>
                );
              })()}
            </div>

            <div className="mt-6">
              <span className="text-[10px] uppercase tracking-[0.2em] block mb-3">Quantity</span>
              <div className="flex items-center border border-[#DDDDDD] w-fit">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:bg-[#F9F9F9]"><HiMinus className="w-3 h-3" /></button>
                <span className="w-10 text-center text-xs">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="p-3 hover:bg-[#F9F9F9]"><HiPlus className="w-3 h-3" /></button>
              </div>
            </div>

            {getTotalStock(product) === 0 && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 text-xs text-red-700 uppercase tracking-[0.1em] text-center">Stock Out — This product is currently unavailable</div>
            )}
            {getTotalStock(product) > 0 && getTotalStock(product) <= 5 && (
              <div className="mt-4 text-[10px] uppercase tracking-[0.1em] opacity-60">Only {getTotalStock(product)} left in stock</div>
            )}
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button size="lg" className="flex-1" onClick={handleAddToCart} disabled={getTotalStock(product) === 0}>Add to Cart</Button>
              <Button size="lg" variant="outline" className="flex-1" onClick={() => { if (!selectedSize || !selectedColor) { toast.error('Please select size and color'); return; } if (getSizeStockByName(product, selectedSize) === 0) { toast.error('This size is out of stock'); return; } addItem({ productId: product.id, name: product.name, image: product.images?.[0] || '', price: product.salePrice || product.price, quantity, size: selectedSize, color: selectedColor }); trackEvent('AddToCart', { content_ids: [product.id], content_type: 'product', value: product.salePrice || product.price, currency: 'BDT' }); router.push('/checkout'); }} disabled={getTotalStock(product) === 0}>Buy Now</Button>
            </div>

            <div className="mt-4 flex items-center gap-6">
              <button className="flex items-center gap-2 text-[10px] uppercase tracking-[0.1em] opacity-50 hover:opacity-100 transition-opacity"><HiHeart className="w-4 h-4" /> Wishlist</button>
              <button className="flex items-center gap-2 text-[10px] uppercase tracking-[0.1em] opacity-50 hover:opacity-100 transition-opacity"><HiShare className="w-4 h-4" /> Share</button>
            </div>

            <div className="mt-8 border-t pt-6">
              <h3 className="text-xs uppercase tracking-[0.2em] mb-4">Reviews ({reviews.length})</h3>

              <div className="space-y-4 mb-6">
                {reviews.slice(0, 5).map((r) => (
                  <div key={r.id} className="border-b border-[#DDDDDD] pb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-medium uppercase tracking-[0.1em]">{r.userName}</span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <span key={s} className={`text-[9px] ${s <= r.rating ? 'text-yellow-500' : 'text-gray-300'}`}>&#9733;</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-[11px] opacity-70">{r.comment}</p>
                  </div>
                ))}
                {reviews.length === 0 && <p className="text-[10px] opacity-40">No reviews yet. Be the first to review!</p>}
              </div>

              <div className="border border-[#DDDDDD] p-4">
                <h4 className="text-[10px] uppercase tracking-[0.1em] mb-3">Write a Review</h4>
                <div className="space-y-3">
                  <input placeholder="Your Name *" value={reviewForm.userName} onChange={(e) => setReviewForm({ ...reviewForm, userName: e.target.value })} className="input-field text-xs w-full" />
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-[0.1em] opacity-60">Rating:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button key={s} type="button" onClick={() => setReviewForm({ ...reviewForm, rating: s })} className={`text-sm ${s <= reviewForm.rating ? 'text-yellow-500' : 'text-gray-300'}`}>&#9733;</button>
                      ))}
                    </div>
                  </div>
                  <textarea placeholder="Write your review..." value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} rows={3} className="input-field text-xs w-full resize-none" />
                  <button type="button" disabled={submittingReview || !reviewForm.userName || !reviewForm.comment}
                    onClick={async () => {
                      setSubmittingReview(true);
                      try {
                        const res = await fetch('/api/reviews', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ productId: product.id, userId: 'guest', userName: reviewForm.userName, rating: reviewForm.rating, comment: reviewForm.comment }),
                        });
                        if (!res.ok) throw new Error('Failed');
                        toast.success('Review submitted! Awaiting approval.');
                        setReviewForm({ userName: '', rating: 5, comment: '' });
                        getProductReviews(product.id).then(setReviews);
                      } catch { toast.error('Failed to submit review'); }
                      setSubmittingReview(false);
                    }}
                    className="btn btn-primary text-[10px]">{submittingReview ? 'Submitting...' : 'Submit Review'}</button>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-3">
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
