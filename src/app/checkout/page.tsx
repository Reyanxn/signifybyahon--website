'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { useCartStore } from '@/store/cartStore';
import { formatPrice, generateOrderId } from '@/utils/helpers';
import { SHIPPING, PAYMENT_METHODS } from '@/utils/constants';
import { addOrder } from '@/lib/supabaseServices';
import toast from 'react-hot-toast';

const cities = ['Dhaka', 'Chittagong', 'Sylhet', 'Khulna', 'Rajshahi', 'Barisal', 'Rangpur', 'Mymensingh'];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, clearCart } = useCartStore();
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', altPhone: '', email: '', address: '', city: '', area: '', notes: '' });
  const update = (f: string, v: string) => setForm((p) => ({ ...p, [f]: v }));
  const subtotal = getSubtotal();
  const shipping = subtotal >= SHIPPING.freeDeliveryThreshold ? 0 : SHIPPING.insideDhaka;
  const total = subtotal + shipping;

  if (items.length === 0) { router.push('/cart'); return null; }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.address || !form.city) { toast.error('Fill required fields'); return; }
    setLoading(true);
    try {
      const orderId = generateOrderId();
      await addOrder({
        id: orderId,
        items: items.map((i) => ({ ...i, image: i.image || '' })),
        totalAmount: total,
        discount: 0,
        shippingCharge: shipping,
        paymentMethod: paymentMethod as any,
        paymentStatus: 'pending',
        orderStatus: 'received',
        customerInfo: { name: form.name, phone: form.phone, altPhone: form.altPhone, email: form.email },
        shippingAddress: { address: form.address, city: form.city, area: form.area },
        notes: form.notes,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      clearCart();
      toast.success('Order placed successfully!');
      router.push(`/order/${orderId}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to place order');
    }
    setLoading(false);
  };

  return (
    <div className="pt-16 md:pt-20">
      <div className="container-site py-8 max-w-4xl mx-auto">
        <h1 className="text-lg md:text-xl tracking-[0.2em] font-normal mb-8">Checkout</h1>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div className="border border-[#DDDDDD] p-6">
                <h2 className="text-xs uppercase tracking-[0.2em] mb-6">Shipping Information</h2>
                <div className="space-y-4">
                  <input placeholder="Full Name *" value={form.name} onChange={(e) => update('name', e.target.value)} required className="input-field text-xs" />
                  <input placeholder="Phone *" value={form.phone} onChange={(e) => update('phone', e.target.value)} required className="input-field text-xs" />
                  <input placeholder="Alternative Phone" value={form.altPhone} onChange={(e) => update('altPhone', e.target.value)} className="input-field text-xs" />
                  <input placeholder="Email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className="input-field text-xs" />
                  <input placeholder="Address *" value={form.address} onChange={(e) => update('address', e.target.value)} required className="input-field text-xs" />
                  <select value={form.city} onChange={(e) => update('city', e.target.value)} className="input-field text-xs">
                    <option value="">Select City</option>
                    {cities.map((c) => (<option key={c} value={c}>{c}</option>))}
                  </select>
                  <input placeholder="Area" value={form.area} onChange={(e) => update('area', e.target.value)} className="input-field text-xs" />
                  <textarea placeholder="Order Notes" value={form.notes} onChange={(e) => update('notes', e.target.value)} rows={3} className="input-field text-xs resize-none" />
                </div>
              </div>

              <div className="border border-[#DDDDDD] p-6">
                <h2 className="text-xs uppercase tracking-[0.2em] mb-6">Payment Method</h2>
                <div className="space-y-2">
                  {PAYMENT_METHODS.map((method) => (
                    <label key={method.value} className={`flex items-center gap-3 p-3 border cursor-pointer ${paymentMethod === method.value ? 'border-[#1C1C1C] bg-[#F9F9F9]' : 'border-[#DDDDDD]'}`}>
                      <input type="radio" name="payment" value={method.value} checked={paymentMethod === method.value} onChange={(e) => setPaymentMethod(e.target.value)} className="accent-[#1C1C1C]" />
                      <span className="text-xs uppercase tracking-[0.1em]">{method.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="border border-[#DDDDDD] p-6 lg:sticky lg:top-24 space-y-4">
                <h2 className="text-xs uppercase tracking-[0.2em]">Order Summary</h2>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={`${item.productId}-${item.size}`} className="flex items-center gap-3">
                      <div className="w-12 h-16 bg-gray-100 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs uppercase tracking-[0.1em] truncate">{item.name}</p>
                        <p className="text-[10px] opacity-40">{item.size} / {item.color} x {item.quantity}</p>
                        <p className="text-xs mt-1">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4 space-y-2 text-xs">
                  <div className="flex justify-between"><span className="opacity-60">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                  <div className="flex justify-between"><span className="opacity-60">Shipping</span><span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span></div>
                  <div className="flex justify-between font-medium border-t pt-2"><span>Total</span><span>{formatPrice(total)}</span></div>
                </div>
                <Button type="submit" size="lg" className="w-full text-[10px]" loading={loading}>Place Order</Button>
                <p className="text-[10px] opacity-40 text-center">By placing this order, you agree to our Terms & Conditions</p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
