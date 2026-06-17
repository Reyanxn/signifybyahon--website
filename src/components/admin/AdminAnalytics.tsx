'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/utils/helpers';
import { HiUsers, HiEye, HiGlobe, HiChartBar } from 'react-icons/hi';

export default function AdminAnalytics() {
  const [activeCount, setActiveCount] = useState(0);
  const [todayCount, setTodayCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [visitors, setVisitors] = useState<any[]>([]);
  const [pageStats, setPageStats] = useState<{ page: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const now = new Date();
    const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000).toISOString();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

    const [{ count: active }, { count: today }, { count: total }, { data: recent }] = await Promise.all([
      supabase.from('visits').select('*', { count: 'exact', head: true }).gte('created_at', fiveMinAgo),
      supabase.from('visits').select('*', { count: 'exact', head: true }).gte('created_at', todayStart),
      supabase.from('visits').select('*', { count: 'exact', head: true }),
      supabase.from('visits').select('*').gte('created_at', todayStart).order('created_at', { ascending: false }).limit(100),
    ]);

    setActiveCount(active || 0);
    setTodayCount(today || 0);
    setTotalCount(total || 0);

    if (recent) {
      setVisitors(recent);

      const pageMap: Record<string, number> = {};
      recent.forEach((v: any) => {
        const p = v.page || '/';
        pageMap[p] = (pageMap[p] || 0) + 1;
      });
      setPageStats(Object.entries(pageMap).sort((a, b) => b[1] - a[1]).map(([page, count]) => ({ page, count })));
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [loadData]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#DDDDDD] p-5">
          <HiUsers className="w-4 h-4 opacity-40 mb-3" />
          <p className="text-lg font-medium">{activeCount}</p>
          <p className="text-[10px] uppercase tracking-[0.1em] opacity-40">Active Now (5 min)</p>
        </div>
        <div className="bg-white border border-[#DDDDDD] p-5">
          <HiEye className="w-4 h-4 opacity-40 mb-3" />
          <p className="text-lg font-medium">{todayCount}</p>
          <p className="text-[10px] uppercase tracking-[0.1em] opacity-40">Today&apos;s Visitors</p>
        </div>
        <div className="bg-white border border-[#DDDDDD] p-5">
          <HiGlobe className="w-4 h-4 opacity-40 mb-3" />
          <p className="text-lg font-medium">{totalCount}</p>
          <p className="text-[10px] uppercase tracking-[0.1em] opacity-40">Total All Time</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-[#DDDDDD] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs uppercase tracking-[0.2em]">Today&apos;s Visitors</h3>
            <span className="text-[10px] opacity-40">Auto-refresh every 10s</span>
          </div>
          {loading ? (
            <p className="text-xs opacity-40 text-center py-8">Loading...</p>
          ) : visitors.length === 0 ? (
            <p className="text-xs opacity-40 text-center py-8">No visitors yet today</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {visitors.map((v: any) => (
                <div key={v.id} className="flex items-center justify-between text-xs border-b border-[#DDDDDD] pb-2">
                  <div>
                    <p className="uppercase tracking-[0.1em]">
                      {[v.city, v.region, v.country].filter(Boolean).join(', ') || 'Unknown location'}
                    </p>
                    <p className="text-[10px] opacity-40">{v.page}</p>
                  </div>
                  <span className="text-[10px] opacity-40">{new Date(v.created_at).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border border-[#DDDDDD] p-6">
          <h3 className="text-xs uppercase tracking-[0.2em] mb-4">Pages Viewed Today</h3>
          {loading ? (
            <p className="text-xs opacity-40 text-center py-8">Loading...</p>
          ) : pageStats.length === 0 ? (
            <p className="text-xs opacity-40 text-center py-8">No data yet</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {pageStats.map((p) => (
                <div key={p.page} className="flex items-center justify-between text-xs border-b border-[#DDDDDD] pb-2">
                  <span className="uppercase tracking-[0.1em]">{p.page === '/' ? 'Home' : p.page}</span>
                  <span className="font-medium">{p.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
