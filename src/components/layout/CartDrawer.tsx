'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { HiX, HiMinus, HiPlus, HiShoppingBag } from 'react-icons/hi';
import { useCartStore } from '@/store/cartStore';
import { useUIStore } from '@/store/uiStore';
import { formatPrice } from '@/utils/helpers';
import { SHIPPING } from '@/utils/constants';

export default function CartDrawer() {
  const { isCartOpen, toggleCart } = useUIStore();
  const { items, removeItem, updateQuantity, getSubtotal } = useCartStore();
  const subtotal = getSubtotal();
  const shipping = subtotal >= SHIPPING.freeDeliveryThreshold ? 0 : SHIPPING.insideDhaka;

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/30 z-40" onClick={toggleCart} />
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 250 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-5 border-b border-[#DDDDDD]">
              <div className="flex items-center gap-2">
                <HiShoppingBag className="w-4 h-4" />
                <span className="text-xs uppercase tracking-[0.2em]">Cart ({items.length})</span>
              </div>
              <button onClick={toggleCart}><HiX className="w-4 h-4" /></button>
            </div>

            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6">
                <HiShoppingBag className="w-10 h-10 opacity-20 mb-4" />
                <p className="text-xs uppercase tracking-[0.2em] mb-4">Your cart is empty</p>
                <button onClick={toggleCart} className="btn btn-outline text-[10px]">
                  <Link href="/shop">Continue Shopping</Link>
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-5 space-y-3">
                  {items.map((item) => (
                    <div key={`${item.productId}-${item.size}-${item.color}`} className="flex gap-3 bg-[#F9F9F9] p-3">
                      <div className="w-16 h-20 bg-gray-200 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs uppercase tracking-[0.1em] truncate">{item.name}</p>
                        <p className="text-[10px] opacity-40 mt-0.5">{item.size} / {item.color}</p>
                        <p className="text-xs mt-1">{formatPrice(item.price)}</p>
                        <div className="flex items-center border border-[#DDDDDD] w-fit mt-2 bg-white">
                          <button onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity - 1)} className="p-1.5"><HiMinus className="w-2.5 h-2.5" /></button>
                          <span className="w-6 text-center text-[10px]">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity + 1)} className="p-1.5"><HiPlus className="w-2.5 h-2.5" /></button>
                        </div>
                      </div>
                      <button onClick={() => removeItem(item.productId, item.size, item.color)}><HiX className="w-3.5 h-3.5 opacity-40" /></button>
                    </div>
                  ))}
                </div>

                <div className="border-t border-[#DDDDDD] p-5 space-y-3">
                  <div className="flex justify-between text-xs"><span className="opacity-60">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                  <div className="flex justify-between text-xs"><span className="opacity-60">Shipping</span><span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span></div>
                  {subtotal < SHIPPING.freeDeliveryThreshold && <p className="text-[10px] opacity-40">Add {formatPrice(SHIPPING.freeDeliveryThreshold - subtotal)} more for free shipping</p>}
                  <Link href="/checkout" onClick={toggleCart} className="btn btn-primary w-full text-center text-[10px]">Checkout</Link>
                  <button onClick={toggleCart} className="block w-full text-center text-[10px] uppercase tracking-[0.1em] opacity-50 hover:opacity-100">Continue Shopping</button>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
