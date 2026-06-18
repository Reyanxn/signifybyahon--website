'use client';

import { useState } from 'react';
import Link from 'next/link';
import { HiX, HiMinus, HiPlus, HiShoppingBag, HiArrowLeft } from 'react-icons/hi';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/utils/helpers';
import { SHIPPING, SHIPPING_RATES } from '@/utils/constants';

export default function CartPage() {
  const { items, removeItem, updateQuantity, getSubtotal } = useCartStore();
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const subtotal = getSubtotal();
  const [estimatedZone, setEstimatedZone] = useState('inside-dhaka');
  const zoneRate = SHIPPING_RATES.find((r) => r.id === estimatedZone);
  const shipping = subtotal >= SHIPPING.freeDeliveryThreshold ? 0 : (zoneRate?.price || 70);
  const discount = couponApplied ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal + shipping - discount;

  if (items.length === 0) {
    return (
      <div className="pt-16 md:pt-20 min-h-[60vh] flex flex-col items-center justify-center">
        <HiShoppingBag className="w-12 h-12 opacity-20 mb-4" />
        <h1 className="text-sm uppercase tracking-[0.2em] mb-2">Your Cart is Empty</h1>
        <Link href="/shop" className="btn btn-outline mt-4 text-[10px]">
          <HiArrowLeft className="w-3 h-3 mr-2" />
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-16 md:pt-20">
      <div className="container-site py-8">
        <h1 className="text-lg md:text-xl tracking-[0.2em] font-normal mb-8">Shopping Cart</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={`${item.productId}-${item.size}-${item.color}`} className="flex gap-4 p-4 bg-[#F9F9F9]">
                <div className="w-20 h-24 bg-gray-200 flex-shrink-0 overflow-hidden">{item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between">
                    <div>
                      <Link href={`/product/${item.productId}`} className="text-xs uppercase tracking-[0.2em] hover:opacity-60">{item.name}</Link>
                      <p className="text-[10px] uppercase tracking-[0.1em] opacity-40 mt-1">Size: {item.size} / {item.color}</p>
                      <p className="text-xs mt-2">{formatPrice(item.price)}</p>
                    </div>
                    <button onClick={() => removeItem(item.productId, item.size, item.color)} className="p-1"><HiX className="w-4 h-4 opacity-40" /></button>
                  </div>
                  <div className="flex items-center border border-[#DDDDDD] w-fit mt-3 bg-white">
                    <button onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity - 1)} className="p-2 hover:bg-[#F9F9F9]"><HiMinus className="w-3 h-3" /></button>
                    <span className="w-8 text-center text-[10px]">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity + 1)} className="p-2 hover:bg-[#F9F9F9]"><HiPlus className="w-3 h-3" /></button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs">{formatPrice(item.price * item.quantity)}</p>
                </div>
              </div>
            ))}
          </div>

          <div>
            <div className="bg-[#F9F9F9] p-6 space-y-4">
              <h2 className="text-xs uppercase tracking-[0.2em]">Order Summary</h2>
              <div className="flex justify-between text-xs"><span className="opacity-60">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
              <div className="flex justify-between text-xs"><span className="opacity-60">Shipping</span><span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span></div>
              <select value={estimatedZone} onChange={(e) => setEstimatedZone(e.target.value)} className="text-[10px] uppercase border border-[#DDDDDD] p-1.5 w-full">
                {SHIPPING_RATES.map((z) => <option key={z.id} value={z.id}>{z.label} — ৳{z.price}</option>)}
              </select>
              {discount > 0 && <div className="flex justify-between text-xs text-[#E40100]"><span>Discount</span><span>-{formatPrice(discount)}</span></div>}
              <div className="border-t pt-4 flex justify-between font-medium"><span>Total</span><span>{formatPrice(total)}</span></div>

              <div className="pt-2">
                {!couponApplied ? (
                  <div className="flex border border-[#DDDDDD]">
                    <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="Coupon code" className="flex-1 px-3 py-2 text-[10px] uppercase tracking-[0.1em] focus:outline-none bg-white" />
                    <button onClick={() => couponCode.toLowerCase() === 'save10' && setCouponApplied(true)} className="px-4 py-2 bg-[#1C1C1C] text-white text-[10px] uppercase tracking-[0.2em] hover:opacity-90">Apply</button>
                  </div>
                ) : (
                  <p className="text-[10px] uppercase tracking-[0.1em] opacity-60">Coupon applied! (SAVE10)</p>
                )}
              </div>

              <Link href="/checkout" className="btn btn-primary w-full text-center text-[10px]">Proceed to Checkout</Link>
              <Link href="/shop" className="block text-center text-[10px] uppercase tracking-[0.1em] opacity-50 hover:opacity-100 py-2">Continue Shopping</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
