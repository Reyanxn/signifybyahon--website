'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { HiUsers, HiEye, HiGlobe, HiLocationMarker, HiLink } from 'react-icons/hi';

export default function AdminAnalytics() {
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [activeCount, setActiveCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [visitors, setVisitors] = useState<any[]>([]);
  const [regionStats, setRegionStats] = useState<{ region: string; count: number }[]>([]);
  const [referrerStats, setReferrerStats] = useState<{ source: string; count: number }[]>([]);
  const [pageStats, setPageStats] = useState<{ page: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const now = new Date();
    const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000).toISOString();
    const dayStart = new Date(selectedDate + 'T00:00:00').toISOString();
    const dayEnd = new Date(selectedDate + 'T23:59:59').toISOString();

    const isToday = selectedDate === today;

    const [{ count: active }, { count: total }, { data: dayData }] = await Promise.all([
      isToday ? supabase.from('visits').select('*', { count: 'exact', head: true }).gte('created_at', fiveMinAgo) : Promise.resolve({ count: 0 }),
      supabase.from('visits').select('*', { count: 'exact', head: true }).gte('created_at', dayStart).lte('created_at', dayEnd),
      supabase.from('visits').select('*').gte('created_at', dayStart).lte('created_at', dayEnd).order('created_at', { ascending: false }).limit(500),
    ]);

    setActiveCount(active || 0);
    setTotalCount(total || 0);

    if (dayData) {
      setVisitors(dayData);

      // Region stats
      const regionMap: Record<string, number> = {};
      dayData.forEach((v: any) => {
        const r = [v.city, v.region].filter(Boolean).join(', ') || 'Unknown';
        regionMap[r] = (regionMap[r] || 0) + 1;
      });
      setRegionStats(Object.entries(regionMap).sort((a, b) => b[1] - a[1]).map(([region, count]) => ({ region, count })));

      // Referrer stats
      const refMap: Record<string, number> = {};
      dayData.forEach((v: any) => {
        const s = v.referrer || 'Direct';
        refMap[s] = (refMap[s] || 0) + 1;
      });
      setReferrerStats(Object.entries(refMap).sort((a, b) => b[1] - a[1]).map(([source, count]) => ({ source, count })));

      // Page stats
      const pageMap: Record<string, number> = {};
      dayData.forEach((v: any) => {
        const p = v.page || '/';
        pageMap[p] = (pageMap[p] || 0) + 1;
      });
      setPageStats(Object.entries(pageMap).sort((a, b) => b[1] - a[1]).map(([page, count]) => ({ page, count })));
    }

    setLoading(false);
  }, [selectedDate, today]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, [loadData]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="text-[10px] uppercase border border-[#DDDDDD] p-2" />
          <span className="text-[10px] opacity-40">{visitors.length} visits on this day</span>
        </div>
        {selectedDate === today && <span className="text-[10px] opacity-40">Auto-refresh every 15s</span>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#DDDDDD] p-5">
          <HiUsers className="w-4 h-4 opacity-40 mb-3" />
          <p className="text-lg font-medium">{activeCount}</p>
          <p className="text-[10px] uppercase tracking-[0.1em] opacity-40">Active Now</p>
        </div>
        <div className="bg-white border border-[#DDDDDD] p-5">
          <HiEye className="w-4 h-4 opacity-40 mb-3" />
          <p className="text-lg font-medium">{totalCount}</p>
          <p className="text-[10px] uppercase tracking-[0.1em] opacity-40">{selectedDate === today ? "Today's" : 'Day'} Visitors</p>
        </div>
        <div className="bg-white border border-[#DDDDDD] p-5">
          <HiGlobe className="w-4 h-4 opacity-40 mb-3" />
          <p className="text-lg font-medium">{visitors.length ? Math.round(visitors.filter((v, i, a) => a.findIndex((x) => x.ip === v.ip) === i).length / visitors.length * 100) : 0}%</p>
          <p className="text-[10px] uppercase tracking-[0.1em] opacity-40">New vs Repeat</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-[#DDDDDD] p-6">
          <div className="flex items-center gap-2 mb-4">
            <HiLocationMarker className="w-3.5 h-3.5 opacity-40" />
            <h3 className="text-xs uppercase tracking-[0.2em]">By Region</h3>
          </div>
          {loading ? (
            <p className="text-xs opacity-40 text-center py-8">Loading...</p>
          ) : regionStats.length === 0 ? (
            <p className="text-xs opacity-40 text-center py-8">No data</p>
          ) : (
            <div className="space-y-1.5 max-h-72 overflow-y-auto">
              {regionStats.map((r) => {
                const max = regionStats[0].count;
                const pct = Math.round((r.count / max) * 100);
                return (
                  <div key={r.region} className="text-xs">
                    <div className="flex justify-between mb-0.5">
                      <span className="uppercase tracking-[0.1em]">{r.region}</span>
                      <span className="font-medium">{r.count}</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#F5F5F5]">
                      <div className="h-full bg-[#1C1C1C] transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white border border-[#DDDDDD] p-6">
          <div className="flex items-center gap-2 mb-4">
            <HiLink className="w-3.5 h-3.5 opacity-40" />
            <h3 className="text-xs uppercase tracking-[0.2em]">Traffic Source</h3>
          </div>
          {loading ? (
            <p className="text-xs opacity-40 text-center py-8">Loading...</p>
          ) : referrerStats.length === 0 ? (
            <p className="text-xs opacity-40 text-center py-8">No data</p>
          ) : (
            <div className="space-y-1.5 max-h-72 overflow-y-auto">
              {referrerStats.map((r) => {
                const max = referrerStats[0].count;
                const pct = Math.round((r.count / max) * 100);
                const colors: Record<string, string> = {
                  Facebook: '#1877F2',
                  WhatsApp: '#25D366',
                  Instagram: '#E4405F',
                  Direct: '#1C1C1C',
                  Google: '#4285F4',
                  Messenger: '#0084FF',
                  YouTube: '#FF0000',
                };
                return (
                  <div key={r.source} className="text-xs">
                    <div className="flex justify-between mb-0.5">
                      <span className="uppercase tracking-[0.1em]">{r.source}</span>
                      <span className="font-medium">{r.count}</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#F5F5F5]">
                      <div className="h-full transition-all" style={{ width: `${pct}%`, backgroundColor: colors[r.source] || '#1C1C1C' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white border border-[#DDDDDD] p-6">
          <h3 className="text-xs uppercase tracking-[0.2em] mb-4">Pages</h3>
          {loading ? (
            <p className="text-xs opacity-40 text-center py-8">Loading...</p>
          ) : pageStats.length === 0 ? (
            <p className="text-xs opacity-40 text-center py-8">No data</p>
          ) : (
            <div className="space-y-1.5 max-h-72 overflow-y-auto">
              {pageStats.map((p) => {
                const max = pageStats[0].count;
                const pct = Math.round((p.count / max) * 100);
                return (
                  <div key={p.page} className="text-xs">
                    <div className="flex justify-between mb-0.5">
                      <span className="uppercase tracking-[0.1em]">{p.page === '/' ? 'Home' : p.page}</span>
                      <span className="font-medium">{p.count}</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#F5F5F5]">
                      <div className="h-full bg-[#1C1C1C] transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border border-[#DDDDDD] p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs uppercase tracking-[0.2em]">Visitor List</h3>
          <span className="text-[10px] opacity-40">{visitors.length} entries</span>
        </div>
        {loading ? (
          <p className="text-xs opacity-40 text-center py-8">Loading...</p>
        ) : visitors.length === 0 ? (
          <p className="text-xs opacity-40 text-center py-8">No visitors on this day</p>
        ) : (
          <div className="overflow-x-auto max-h-72 overflow-y-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b text-left">
                <th className="pb-2 font-normal uppercase tracking-[0.1em] opacity-40">Time</th>
                <th className="pb-2 font-normal uppercase tracking-[0.1em] opacity-40">Location</th>
                <th className="pb-2 font-normal uppercase tracking-[0.1em] opacity-40">Page</th>
                <th className="pb-2 font-normal uppercase tracking-[0.1em] opacity-40">Source</th>
              </tr></thead>
              <tbody>
                {visitors.slice(0, 50).map((v: any) => (
                  <tr key={v.id} className="border-b last:border-0">
                    <td className="py-2 opacity-40">{new Date(v.created_at).toLocaleTimeString()}</td>
                    <td className="py-2 uppercase tracking-[0.1em]">{[v.city, v.region].filter(Boolean).join(', ') || '—'}</td>
                    <td className="py-2 opacity-60">{v.page}</td>
                    <td className="py-2">{v.referrer || 'Direct'}</td>
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
