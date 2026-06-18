'use client';

import { useState, useEffect } from 'react';
import { getCoupons } from '@/lib/supabaseServices';
import { formatPrice } from '@/utils/helpers';
import type { Coupon } from '@/types';
import toast from 'react-hot-toast';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: '', type: 'percentage', value: '', minOrder: '', maxUses: '' });

  useEffect(() => { loadCoupons(); }, []);

  const loadCoupons = async () => {
    setLoading(true);
    const data = await getCoupons();
    setCoupons(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/db', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ table: 'coupons', action: 'insert', data: { code: form.code.toUpperCase(), type: form.type, value: Number(form.value), min_order: Number(form.minOrder), max_uses: Number(form.maxUses), used_count: 0, active: true, start_date: new Date().toISOString(), end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() } }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success('Coupon created!');
      setShowForm(false);
      setForm({ code: '', type: 'percentage', value: '', minOrder: '', maxUses: '' });
      loadCoupons();
    } catch (err: any) { toast.error(err.message); }
  };

  return (
    <div className="bg-white border border-[#DDDDDD] p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xs uppercase tracking-[0.2em]">Coupons ({coupons.length})</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary text-[10px]">{showForm ? 'Cancel' : 'Add Coupon'}</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-[#F9F9F9] grid grid-cols-1 md:grid-cols-3 gap-3">
          <input placeholder="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required className="input-field text-xs" />
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input-field text-xs">
            <option value="percentage">Percentage</option><option value="fixed">Fixed</option>
          </select>
          <input placeholder="Value" type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} required className="input-field text-xs" />
          <input placeholder="Min Order" type="number" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: e.target.value })} className="input-field text-xs" />
          <input placeholder="Max Uses" type="number" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} className="input-field text-xs" />
          <button type="submit" className="btn btn-primary text-[10px]">Create</button>
        </form>
      )}

      {loading ? <p className="text-xs opacity-40 text-center py-8">Loading...</p> : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b text-left">
              <th className="pb-3 font-normal uppercase tracking-[0.1em] opacity-40">Code</th>
              <th className="pb-3 font-normal uppercase tracking-[0.1em] opacity-40">Value</th>
              <th className="pb-3 font-normal uppercase tracking-[0.1em] opacity-40">Uses</th>
              <th className="pb-3 font-normal uppercase tracking-[0.1em] opacity-40">Status</th>
            </tr></thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.id} className="border-b last:border-0">
                  <td className="py-3 uppercase">{c.code}</td>
                  <td className="py-3">{c.type === 'percentage' ? `${c.value}%` : formatPrice(c.value)}</td>
                  <td className="py-3">{c.usedCount}/{c.maxUses}</td>
                  <td className="py-3"><span className={`text-[10px] uppercase px-2 py-1 ${c.active ? 'bg-green-100' : 'bg-red-100'}`}>{c.active ? 'Active' : 'Inactive'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
