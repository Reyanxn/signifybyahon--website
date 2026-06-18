'use client';

import { useState, useEffect, useCallback } from 'react';
import { HiUsers, HiEye, HiCurrencyDollar, HiShoppingBag, HiTrendingUp, HiLink } from 'react-icons/hi';
import { formatPrice } from '@/utils/helpers';

export default function AdminAnalytics() {
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics?date=${selectedDate}`);
      const json = await res.json();
      setData(json);
    } catch {
      setData({ visits: [], orders: [], activeCount: 0, totalVisits: 0, totalOrders: 0, totalRevenue: 0, referrerStats: [], pageStats: [] });
    }
    setLoading(false);
  }, [selectedDate]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [loadData]);

  if (!data) return null;

  const { visits, orders, activeCount, totalVisits, totalOrders, totalRevenue, referrerStats, pageStats } = data;
  const convRate = totalVisits > 0 ? ((totalOrders / totalVisits) * 100).toFixed(2) : '0.00';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="text-[10px] uppercase border border-[#DDDDDD] p-2" />
          <span className="text-[10px] opacity-40">{totalVisits} visits, {totalOrders} orders on this day</span>
        </div>
        {selectedDate === today && <span className="text-[10px] opacity-40">Live — refresh every 10s</span>}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white border border-[#DDDDDD] p-4">
          <HiUsers className="w-4 h-4 opacity-40 mb-2" />
          <p className="text-lg font-medium">{activeCount}</p>
          <p className="text-[9px] uppercase tracking-[0.1em] opacity-40">Active Now</p>
        </div>
        <div className="bg-white border border-[#DDDDDD] p-4">
          <HiEye className="w-4 h-4 opacity-40 mb-2" />
          <p className="text-lg font-medium">{totalVisits}</p>
          <p className="text-[9px] uppercase tracking-[0.1em] opacity-40">Visits</p>
        </div>
        <div className="bg-white border border-[#DDDDDD] p-4">
          <HiShoppingBag className="w-4 h-4 opacity-40 mb-2" />
          <p className="text-lg font-medium">{totalOrders}</p>
          <p className="text-[9px] uppercase tracking-[0.1em] opacity-40">Orders</p>
        </div>
        <div className="bg-white border border-[#DDDDDD] p-4">
          <HiCurrencyDollar className="w-4 h-4 opacity-40 mb-2" />
          <p className="text-lg font-medium">{formatPrice(totalRevenue)}</p>
          <p className="text-[9px] uppercase tracking-[0.1em] opacity-40">Revenue</p>
        </div>
        <div className="bg-white border border-[#DDDDDD] p-4">
          <HiTrendingUp className="w-4 h-4 opacity-40 mb-2" />
          <p className="text-lg font-medium">{convRate}%</p>
          <p className="text-[9px] uppercase tracking-[0.1em] opacity-40">Conversion</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-[#DDDDDD] p-6">
          <div className="flex items-center gap-2 mb-4"><HiLink className="w-3.5 h-3.5 opacity-40" /><h3 className="text-xs uppercase tracking-[0.2em]">Traffic Source</h3></div>
          {loading ? <p className="text-xs opacity-40 text-center py-8">Loading...</p> : referrerStats.length === 0 ? <p className="text-xs opacity-40 text-center py-8">No data yet</p> : (
            <div className="space-y-1.5">
              {referrerStats.map((r: any) => {
                const max = referrerStats[0].count;
                const pct = Math.round((r.count / max) * 100);
                const c: Record<string, string> = { Facebook: '#1877F2', WhatsApp: '#25D366', Instagram: '#E4405F', Direct: '#1C1C1C', Google: '#4285F4' };
                return (
                  <div key={r.source} className="text-xs">
                    <div className="flex justify-between mb-0.5"><span className="uppercase tracking-[0.1em]">{r.source}</span><span className="font-medium">{r.count}</span></div>
                    <div className="w-full h-1.5 bg-[#F5F5F5]"><div className="h-full" style={{ width: `${pct}%`, backgroundColor: c[r.source] || '#1C1C1C' }} /></div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="bg-white border border-[#DDDDDD] p-6">
          <h3 className="text-xs uppercase tracking-[0.2em] mb-4">Pages Viewed</h3>
          {loading ? <p className="text-xs opacity-40 text-center py-8">Loading...</p> : pageStats.length === 0 ? <p className="text-xs opacity-40 text-center py-8">No data yet</p> : (
            <div className="space-y-1.5">
              {pageStats.map((p: any) => {
                const max = pageStats[0].count;
                const pct = Math.round((p.count / max) * 100);
                return (
                  <div key={p.label} className="text-xs">
                    <div className="flex justify-between mb-0.5"><span className="tracking-[0.1em]">{p.label}</span><span className="font-medium">{p.count}</span></div>
                    <div className="w-full h-1.5 bg-[#F5F5F5]"><div className="h-full bg-[#1C1C1C]" style={{ width: `${pct}%` }} /></div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border border-[#DDDDDD] p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs uppercase tracking-[0.2em]">Realtime Visitor Log</h3>
          <span className="text-[10px] opacity-40">{totalVisits} entries</span>
        </div>
        {loading ? <p className="text-xs opacity-40 text-center py-8">Loading...</p> : visits.length === 0 ? <p className="text-xs opacity-40 text-center py-8">No visitors on this day</p> : (
          <div className="overflow-x-auto max-h-72 overflow-y-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b text-left">
                <th className="pb-2 font-normal uppercase tracking-[0.1em] opacity-40 pr-3">Time</th>
                <th className="pb-2 font-normal uppercase tracking-[0.1em] opacity-40 pr-3">Page</th>
                <th className="pb-2 font-normal uppercase tracking-[0.1em] opacity-40">Source</th>
              </tr></thead>
              <tbody>
                {visits.slice(0, 100).map((v: any) => (
                  <tr key={v.id} className="border-b last:border-0">
                    <td className="py-2 opacity-40 pr-3 whitespace-nowrap">{new Date(v.created_at).toLocaleTimeString()}</td>
                    <td className="py-2 pr-3">{v.page === '/' ? 'Home' : v.page}</td>
                    <td className="py-2 uppercase tracking-[0.1em]">{v.referrer || 'Direct'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
