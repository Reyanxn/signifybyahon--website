'use client';

import { useState, useEffect } from 'react';
import { getOrders, updateOrderStatus } from '@/lib/supabaseServices';
import { formatPrice, generateInvoiceHTML } from '@/utils/helpers';
import { supabase } from '@/lib/supabase';
import type { Order } from '@/types';
import { HiArrowLeft, HiPrinter, HiCheck, HiX } from 'react-icons/hi';
import toast from 'react-hot-toast';

const statuses = ['received', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];
const paymentStatuses = ['pending', 'paid', 'failed', 'refunded'];

const statusColors: Record<string, string> = {
  received: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-indigo-100 text-indigo-800',
  packed: 'bg-purple-100 text-purple-800',
  shipped: 'bg-orange-100 text-orange-800',
  out_for_delivery: 'bg-cyan-100 text-cyan-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => { loadOrders(); }, []);

  const loadOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (!error && data) setOrders(data);
    setLoading(false);
  };

  const handleOrderStatusUpdate = async (id: string, status: string) => {
    await updateOrderStatus(id, status);
    toast.success(`Order ${status.replace(/_/g, ' ')}`);
    loadOrders();
    if (selectedOrder?.id === id) setSelectedOrder({ ...selectedOrder, order_status: status });
  };

  const handlePaymentStatusUpdate = async (id: string, paymentStatus: string) => {
    const { error } = await supabase.from('orders').update({ payment_status: paymentStatus, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success(`Payment ${paymentStatus}`);
    loadOrders();
    if (selectedOrder?.id === id) setSelectedOrder({ ...selectedOrder, payment_status: paymentStatus });
  };

  const filteredOrders = filterStatus === 'all' ? orders : orders.filter((o) => o.order_status === filterStatus);

  if (selectedOrder) {
    const o = selectedOrder;
    return (
      <div className="bg-white border border-[#DDDDDD] p-6">
        <button onClick={() => setSelectedOrder(null)} className="flex items-center gap-1 text-[10px] uppercase tracking-[0.1em] opacity-40 hover:opacity-100 mb-6">
          <HiArrowLeft className="w-3 h-3" /> Back to Orders
        </button>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xs uppercase tracking-[0.2em]">Order {o.id}</h2>
            <p className="text-[10px] opacity-40 mt-1">Placed {new Date(o.created_at).toLocaleString()}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] uppercase tracking-[0.1em] px-2 py-1 ${statusColors[o.order_status] || 'bg-gray-100'}`}>{o.order_status?.replace(/_/g, ' ')}</span>
            {o.tracking_number && <span className="text-[10px] opacity-40">Track: {o.tracking_number}</span>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="border border-[#DDDDDD] p-4">
            <h3 className="text-[10px] uppercase tracking-[0.2em] opacity-60 mb-3">Customer Details</h3>
            <div className="space-y-1 text-xs">
              <p><span className="opacity-40">Name:</span> {o.customer_info?.name || '—'}</p>
              <p><span className="opacity-40">Phone:</span> {o.customer_info?.phone || '—'}</p>
              <p><span className="opacity-40">Alt Phone:</span> {o.customer_info?.altPhone || o.customer_info?.alt_phone || '—'}</p>
              <p><span className="opacity-40">Email:</span> {o.customer_info?.email || '—'}</p>
            </div>
          </div>
          <div className="border border-[#DDDDDD] p-4">
            <h3 className="text-[10px] uppercase tracking-[0.2em] opacity-60 mb-3">Shipping Address</h3>
            <div className="space-y-1 text-xs">
              <p>{o.shipping_address?.address || '—'}</p>
              <p>{o.shipping_address?.city}{o.shipping_address?.area ? `, ${o.shipping_address.area}` : ''}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="border border-[#DDDDDD] p-4">
            <h3 className="text-[10px] uppercase tracking-[0.2em] opacity-60 mb-3">Payment</h3>
            <div className="space-y-2 text-xs">
              <p><span className="opacity-40">Method:</span> <span className="uppercase">{o.payment_method}</span></p>
              <div className="flex items-center gap-2">
                <span className="opacity-40">Status:</span>
                <select value={o.payment_status} onChange={(e) => handlePaymentStatusUpdate(o.id, e.target.value)} className="text-[10px] uppercase border border-[#DDDDDD] p-1">
                  {paymentStatuses.map((s) => (<option key={s} value={s}>{s}</option>))}
                </select>
              </div>
            </div>
          </div>
          <div className="border border-[#DDDDDD] p-4">
            <h3 className="text-[10px] uppercase tracking-[0.2em] opacity-60 mb-3">Order Status</h3>
            <div className="flex items-center gap-2">
              <span className="opacity-40 text-xs">Status:</span>
              <select value={o.order_status} onChange={(e) => handleOrderStatusUpdate(o.id, e.target.value)} className="text-[10px] uppercase border border-[#DDDDDD] p-1">
                {statuses.map((s) => (<option key={s} value={s}>{s.replace(/_/g, ' ')}</option>))}
              </select>
            </div>
          </div>
        </div>

        {o.notes && (
          <div className="border border-[#DDDDDD] p-4 mb-6">
            <h3 className="text-[10px] uppercase tracking-[0.2em] opacity-60 mb-2">Order Notes</h3>
            <p className="text-xs">{o.notes}</p>
          </div>
        )}

        <div className="border border-[#DDDDDD] mb-6">
          <div className="border-b border-[#DDDDDD] p-4">
            <h3 className="text-[10px] uppercase tracking-[0.2em] opacity-60">Items ({o.items?.length || 0})</h3>
          </div>
          <div className="divide-y divide-[#DDDDDD]">
            {(o.items || []).map((item: any, i: number) => (
              <div key={i} className="flex items-center gap-3 p-4">
                <div className="w-12 h-16 bg-gray-100 flex-shrink-0 overflow-hidden">
                  {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs uppercase tracking-[0.1em]">{item.name}</p>
                  <p className="text-[10px] opacity-40">{item.size} / {item.color} x {item.quantity}</p>
                  <p className="text-xs mt-1">{formatPrice(item.price * item.quantity)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-[#DDDDDD] p-4 space-y-1 text-xs">
            <div className="flex justify-between"><span className="opacity-60">Subtotal</span><span>{formatPrice(o.total_amount - (o.shipping_charge || 0))}</span></div>
            <div className="flex justify-between"><span className="opacity-60">Shipping</span><span>{o.shipping_charge === 0 ? 'Free' : formatPrice(o.shipping_charge)}</span></div>
            {o.discount > 0 && <div className="flex justify-between"><span className="opacity-60">Discount</span><span>-{formatPrice(o.discount)}</span></div>}
            <div className="flex justify-between font-medium border-t pt-2 mt-2"><span>Total</span><span>{formatPrice(o.total_amount)}</span></div>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={() => { const w = window.open('', '_blank'); if (w) { w.document.write(generateInvoiceHTML(o)); w.document.close(); } }} className="btn btn-outline text-[10px] flex items-center gap-1">
            <HiPrinter className="w-3 h-3" /> Print Invoice
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#DDDDDD] p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xs uppercase tracking-[0.2em]">Orders ({orders.length})</h2>
        <div className="flex items-center gap-2">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="text-[10px] uppercase border border-[#DDDDDD] p-1.5">
            <option value="all">All Orders</option>
            {statuses.map((s) => (<option key={s} value={s}>{s.replace(/_/g, ' ')}</option>))}
          </select>
        </div>
      </div>
      {loading ? (
        <p className="text-xs opacity-40 text-center py-8">Loading...</p>
      ) : filteredOrders.length === 0 ? (
        <p className="text-xs opacity-40 text-center py-8">No orders found</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b text-left">
              <th className="pb-3 font-normal uppercase tracking-[0.1em] opacity-40">Order</th>
              <th className="pb-3 font-normal uppercase tracking-[0.1em] opacity-40">Customer</th>
              <th className="pb-3 font-normal uppercase tracking-[0.1em] opacity-40">Items</th>
              <th className="pb-3 font-normal uppercase tracking-[0.1em] opacity-40">Total</th>
              <th className="pb-3 font-normal uppercase tracking-[0.1em] opacity-40">Payment</th>
              <th className="pb-3 font-normal uppercase tracking-[0.1em] opacity-40">Status</th>
              <th className="pb-3 font-normal uppercase tracking-[0.1em] opacity-40">Date</th>
            </tr></thead>
            <tbody>
              {filteredOrders.map((o) => (
                <tr key={o.id} className="border-b last:border-0 cursor-pointer hover:bg-[#F9F9F9]" onClick={() => setSelectedOrder(o)}>
                  <td className="py-3 uppercase tracking-[0.1em]">{o.id?.slice(-8)}</td>
                  <td className="py-3">{o.customer_info?.name || 'Guest'}</td>
                  <td className="py-3">{o.items?.length || 0}</td>
                  <td className="py-3">{formatPrice(o.total_amount)}</td>
                  <td className="py-3 uppercase tracking-[0.1em]">{o.payment_method} / <span className={o.payment_status === 'paid' ? 'text-green-600' : ''}>{o.payment_status}</span></td>
                  <td className="py-3"><span className={`text-[9px] uppercase tracking-[0.1em] px-1.5 py-0.5 ${statusColors[o.order_status] || 'bg-gray-100'}`}>{o.order_status?.replace(/_/g, ' ')}</span></td>
                  <td className="py-3 opacity-40">{new Date(o.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
