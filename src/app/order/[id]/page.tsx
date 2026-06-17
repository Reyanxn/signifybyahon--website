'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { HiCheck } from 'react-icons/hi';
import { formatPrice, getOrderStatusColor, generateInvoiceHTML } from '@/utils/helpers';
import { getOrder } from '@/lib/supabaseServices';
import type { Order } from '@/types';
import Button from '@/components/ui/Button';

const allStatuses = [
  { key: 'received', label: 'Order Received' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'processing', label: 'Processing' },
  { key: 'packed', label: 'Packed' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'out_for_delivery', label: 'Out For Delivery' },
  { key: 'delivered', label: 'Delivered' },
];

export default function OrderTrackingPage() {
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      getOrder(params.id as string).then((data) => {
        setOrder(data as Order);
        setLoading(false);
      });
    }
  }, [params.id]);

  if (loading) return <div className="pt-16 md:pt-20 min-h-screen flex items-center justify-center"><p className="text-xs opacity-40">Loading...</p></div>;
  if (!order) return <div className="pt-16 md:pt-20 min-h-screen flex items-center justify-center"><p className="text-xs opacity-40">Order not found</p></div>;

  const currentIndex = allStatuses.findIndex((s) => s.key === order.orderStatus);
  const isCancelled = order.orderStatus === 'cancelled';

  return (
    <div className="pt-16 md:pt-20 min-h-screen bg-[#F9F9F9]">
      <div className="container-site py-8 max-w-3xl mx-auto">
        <Link href="/account?tab=orders" className="text-[10px] uppercase tracking-[0.2em] opacity-40 hover:opacity-100 inline-block mb-6">← Back to Orders</Link>

        <div className="border border-[#DDDDDD] bg-white p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-sm uppercase tracking-[0.2em]">Order {order.id}</h1>
              <p className="text-[10px] opacity-40 mt-1">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <span className={`text-[10px] uppercase tracking-[0.1em] px-2 py-1 ${getOrderStatusColor(order.orderStatus)}`}>{order.orderStatus?.replace(/_/g, ' ')}</span>
              {order.trackingNumber && <p className="text-[10px] opacity-40 mt-1">Tracking: {order.trackingNumber}</p>}
            </div>
          </div>

          <div className="relative">
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-[#DDDDDD]" />
            <div className="space-y-6 relative">
              {allStatuses.map((status, i) => {
                const completed = !isCancelled && i <= currentIndex;
                return (
                  <div key={status.key} className="flex items-start gap-4">
                    <div className={`relative z-10 w-[15px] h-[15px] rounded-full flex items-center justify-center flex-shrink-0 ${completed ? 'bg-[#1C1C1C]' : 'bg-[#DDDDDD]'}`}>
                      {completed ? <HiCheck className="w-2.5 h-2.5 text-white" /> : null}
                    </div>
                    <div className="pt-0.5">
                      <p className={`text-xs uppercase tracking-[0.1em] ${completed ? '' : 'opacity-30'}`}>{status.label}</p>
                    </div>
                  </div>
                );
              })}
              {isCancelled && (
                <div className="flex items-start gap-4">
                  <div className="relative z-10 w-[15px] h-[15px] rounded-full flex items-center justify-center flex-shrink-0 bg-red-500"><HiCheck className="w-2.5 h-2.5 text-white" /></div>
                  <div className="pt-0.5"><p className="text-xs uppercase tracking-[0.1em] text-red-500">Cancelled</p></div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="border border-[#DDDDDD] bg-white p-6 mb-6">
          <h2 className="text-xs uppercase tracking-[0.2em] mb-4">Items</h2>
          <div className="space-y-3">
            {order.items?.map((item, i) => (
              <div key={i} className="flex items-center gap-4 pb-3 border-b border-[#DDDDDD] last:border-0 last:pb-0">
                <div className="w-14 h-18 bg-gray-100 flex-shrink-0 overflow-hidden">
                  {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs uppercase tracking-[0.1em]">{item.name}</p>
                  <p className="text-[10px] opacity-40">{item.size} / {item.color} x {item.quantity}</p>
                  <p className="text-xs mt-1">{formatPrice(item.price)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-1 text-xs border-t pt-4">
            <div className="flex justify-between"><span className="opacity-60">Subtotal</span><span>{formatPrice(order.totalAmount - order.shippingCharge)}</span></div>
            <div className="flex justify-between"><span className="opacity-60">Shipping</span><span>{order.shippingCharge === 0 ? 'Free' : formatPrice(order.shippingCharge)}</span></div>
            {order.discount > 0 && <div className="flex justify-between"><span className="opacity-60">Discount</span><span>-{formatPrice(order.discount)}</span></div>}
            <div className="flex justify-between font-medium border-t pt-2 mt-2"><span>Total</span><span>{formatPrice(order.totalAmount)}</span></div>
          </div>
        </div>

        {order.customerInfo && (
          <div className="border border-[#DDDDDD] bg-white p-6 mb-6">
            <h2 className="text-xs uppercase tracking-[0.2em] mb-4">Shipping Details</h2>
            <div className="space-y-1 text-xs">
              <p><span className="opacity-60">Name:</span> {order.customerInfo.name}</p>
              <p><span className="opacity-60">Phone:</span> {order.customerInfo.phone}</p>
              <p><span className="opacity-60">Address:</span> {order.shippingAddress?.address}, {order.shippingAddress?.city}</p>
              <p><span className="opacity-60">Payment:</span> {order.paymentMethod}</p>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 text-[10px]" onClick={() => {
            const w = window.open('', '_blank');
            if (w) { w.document.write(generateInvoiceHTML(order)); w.document.close(); }
          }}>Print Invoice</Button>
          <Button variant="outline" className="flex-1 text-[10px]" onClick={() => {
            const html = generateInvoiceHTML(order).replace('<script>window.print();</script>', '');
            const blob = new Blob([html], { type: 'text/html' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `invoice-${order.id}.html`;
            a.click();
          }}>Download Invoice</Button>
        </div>
      </div>
    </div>
  );
}
