'use client';

import { useState, useEffect, useMemo } from 'react';
import { getOrders, updateOrderStatus } from '@/lib/supabaseServices';
import { formatPrice, generateInvoiceHTML } from '@/utils/helpers';
import { HiArrowLeft, HiPrinter, HiTrash } from 'react-icons/hi';
import toast from 'react-hot-toast';

const statuses = ['received', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];
const paymentStatuses = ['pending', 'paid', 'failed', 'refunded'];
const unfulfilledStatuses = ['received', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery'];

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
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => { loadOrders(); }, []);

  const loadOrders = async () => {
    setLoading(true);
    const res = await fetch('/api/db', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ table: 'orders', action: 'select', order: { column: 'created_at', ascending: false } }) });
    const json = await res.json();
    if (!json.error && json.data) setOrders(json.data);
    setLoading(false);
  };

  const handleOrderStatusUpdate = async (id: string, status: string) => {
    await updateOrderStatus(id, status);
    toast.success(`Order ${status.replace(/_/g, ' ')}`);
    loadOrders();
    if (selectedOrder?.id === id) setSelectedOrder({ ...selectedOrder, order_status: status });
  };

  const handlePaymentStatusUpdate = async (id: string, paymentStatus: string) => {
    const res = await fetch('/api/db', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ table: 'orders', action: 'update', data: { payment_status: paymentStatus, updated_at: new Date().toISOString() }, filters: { id } }) });
    const json = await res.json();
    if (!res.ok) { toast.error(json.error); return; }
    toast.success(`Payment ${paymentStatus}`);
    loadOrders();
    if (selectedOrder?.id === id) setSelectedOrder({ ...selectedOrder, payment_status: paymentStatus });
  };

  const handleDeleteOrder = async (id: string) => {
    const res = await fetch('/api/db', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ table: 'orders', action: 'delete', filters: { id } }) });
    const json = await res.json();
    if (!res.ok) { toast.error(json.error); return; }
    toast.success('Order deleted');
    setDeleteConfirm(null);
    setSelectedOrder(null);
    loadOrders();
  };

  const filteredOrders = orders.filter((o) => {
    if (filterStatus === 'unfulfilled') {
      if (!unfulfilledStatuses.includes(o.order_status)) return false;
    } else if (filterStatus !== 'all') {
      if (o.order_status !== filterStatus) return false;
    }
    if (dateFrom && new Date(o.created_at) < new Date(dateFrom)) return false;
    if (dateTo) {
      const endOfDay = new Date(dateTo);
      endOfDay.setHours(23, 59, 59, 999);
      if (new Date(o.created_at) > endOfDay) return false;
    }
    return true;
  });

  const ordersByDay = filteredOrders.reduce((acc: Record<string, { orders: number; revenue: number }>, o: any) => {
    const day = new Date(o.created_at).toLocaleDateString();
    if (!acc[day]) acc[day] = { orders: 0, revenue: 0 };
    acc[day].orders += 1;
    acc[day].revenue += o.total_amount || 0;
    return acc;
  }, {});

  const totalRevenue = filteredOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

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

        <div className="flex items-center justify-between">
          <button onClick={() => { const w = window.open('', '_blank'); if (w) { w.document.write(generateInvoiceHTML(o)); w.document.close(); } }} className="btn btn-outline text-[10px] flex items-center gap-1">
            <HiPrinter className="w-3 h-3" /> Print Invoice
          </button>
          {deleteConfirm === o.id ? (
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-red-600">Delete this order?</span>
              <button onClick={() => handleDeleteOrder(o.id)} className="text-[10px] uppercase bg-red-600 text-white px-3 py-1 tracking-[0.1em]">Yes</button>
              <button onClick={() => setDeleteConfirm(null)} className="text-[10px] uppercase border border-[#DDDDDD] px-3 py-1 tracking-[0.1em]">No</button>
            </div>
          ) : (
            <button onClick={() => setDeleteConfirm(o.id)} className="text-[10px] flex items-center gap-1 text-red-600 hover:opacity-70 transition-opacity">
              <HiTrash className="w-3 h-3" /> Delete Order
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#DDDDDD] p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xs uppercase tracking-[0.2em]">Orders ({filteredOrders.length})</h2>
        <div className="flex items-center gap-2">
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="text-[10px] uppercase border border-[#DDDDDD] p-1.5" />
          <span className="text-[10px] opacity-40">—</span>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="text-[10px] uppercase border border-[#DDDDDD] p-1.5" />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="text-[10px] uppercase border border-[#DDDDDD] p-1.5">
            <option value="all">All Orders</option>
            <option value="unfulfilled">Unfulfilled</option>
            {statuses.map((s) => (<option key={s} value={s}>{s.replace(/_/g, ' ')}</option>))}
          </select>
        </div>
      </div>

      {filteredOrders.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="border border-[#DDDDDD] p-4 text-center">
            <p className="text-lg font-medium">{filteredOrders.length}</p>
            <p className="text-[10px] uppercase tracking-[0.1em] opacity-40">Orders</p>
          </div>
          <div className="border border-[#DDDDDD] p-4 text-center">
            <p className="text-lg font-medium">{formatPrice(totalRevenue)}</p>
            <p className="text-[10px] uppercase tracking-[0.1em] opacity-40">Revenue</p>
          </div>
          <div className="border border-[#DDDDDD] p-4 text-center">
            <p className="text-lg font-medium">{Object.keys(ordersByDay).length}</p>
            <p className="text-[10px] uppercase tracking-[0.1em] opacity-40">Days</p>
          </div>
        </div>
      )}

      {Object.keys(ordersByDay).length > 0 && (
        <>
          <div className="border border-[#DDDDDD] mb-6 overflow-hidden">
            <div className="bg-[#F9F9F9] px-4 py-2 border-b border-[#DDDDDD] flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.2em] opacity-60">Daily Breakdown</span>
            </div>
            <div className="divide-y divide-[#DDDDDD] max-h-48 overflow-y-auto">
              {Object.entries(ordersByDay).sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime()).map(([day, data]) => (
                <div key={day} className="flex items-center justify-between px-4 py-2 text-xs">
                  <span className="uppercase tracking-[0.1em] opacity-60">{day}</span>
                  <div className="flex items-center gap-4">
                    <span>{data.orders} order{data.orders !== 1 ? 's' : ''}</span>
                    <span className="font-medium">{formatPrice(data.revenue)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <OrderCalendar orders={filteredOrders} ordersByDay={ordersByDay} onSelectDay={(d) => { setDateFrom(d); setDateTo(d); }} />
        </>
      )}

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

function OrderCalendar({ orders, ordersByDay, onSelectDay }: {
  orders: any[];
  ordersByDay: Record<string, { orders: number; revenue: number }>;
  onSelectDay: (dateStr: string) => void;
}) {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const monthLabel = new Date(viewYear, viewMonth).toLocaleString('default', { month: 'long', year: 'numeric' });

  const dayTotals = useMemo(() => {
    const totals: Record<string, { orders: number; revenue: number }> = {};
    orders.forEach((o) => {
      const d = new Date(o.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (!totals[key]) totals[key] = { orders: 0, revenue: 0 };
      totals[key].orders += 1;
      totals[key].revenue += o.total_amount || 0;
    });
    return totals;
  }, [orders]);

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); } else { setViewMonth(viewMonth - 1); } };
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); } else { setViewMonth(viewMonth + 1); } };

  const getDayKey = (day: number) => `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const padClass = (day: number) => {
    const key = getDayKey(day);
    const data = dayTotals[key];
    if (!data) return 'text-[#DDDDDD]';
    if (data.orders >= 5) return 'text-green-700 font-semibold';
    if (data.orders >= 2) return 'text-[#1C1C1C] font-medium';
    return 'text-[#1C1C1C]';
  };

  return (
    <div className="border border-[#DDDDDD] mb-6">
      <div className="bg-[#F9F9F9] px-4 py-2 border-b border-[#DDDDDD] flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.2em] opacity-60">Order Calendar</span>
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="text-[10px] uppercase opacity-40 hover:opacity-100">&lt;</button>
          <span className="text-[10px] uppercase tracking-[0.1em]">{monthLabel}</span>
          <button onClick={nextMonth} className="text-[10px] uppercase opacity-40 hover:opacity-100">&gt;</button>
        </div>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] uppercase tracking-[0.1em] opacity-40 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (<div key={d} className="py-1">{d}</div>))}
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (<div key={`empty-${i}`} />))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const key = getDayKey(day);
            const data = dayTotals[key];
            const isToday = day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
            return (
              <button key={day} onClick={() => onSelectDay(key)}
                className={`py-2 rounded text-xs transition-colors hover:bg-[#F5F5F5] relative ${padClass(day)} ${isToday ? 'ring-1 ring-[#1C1C1C]' : ''}`}
              >
                <span>{day}</span>
                {data && <div className="text-[8px] opacity-60 mt-0.5">{data.orders}</div>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
