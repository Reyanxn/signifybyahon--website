'use client';

import { useState, useEffect } from 'react';
import { getBanners, deleteBanner, uploadFile } from '@/lib/supabaseServices';
import type { Banner } from '@/types';
import toast from 'react-hot-toast';

export default function AdminBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', subtitle: '', link: '', order: '1' });
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => { loadBanners(); }, []);

  const loadBanners = async () => {
    setLoading(true);
    const data = await getBanners();
    setBanners(data);
    setLoading(false);
  };

  const openNew = () => {
    setEditing(null);
    setForm({ title: '', subtitle: '', link: '', order: '1' });
    setImageFile(null);
    setShowForm(true);
  };

  const openEdit = (b: Banner) => {
    setEditing(b.id);
    setForm({ title: b.title, subtitle: b.subtitle || '', link: b.link || '', order: String(b.order) });
    setImageFile(null);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let imageUrl = editing ? '' : '';
      if (imageFile) imageUrl = await uploadFile(imageFile, `banners/${Date.now()}_${imageFile.name}`);

      const data: any = { title: form.title, subtitle: form.subtitle, link: form.link, active: true, order: Number(form.order) };
      if (imageUrl) data.image = imageUrl;

      if (editing) {
        const res = await fetch('/api/db', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ table: 'banners', action: 'update', data, filters: { id: editing } }) });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error);
        toast.success('Banner updated!');
      } else {
        const res = await fetch('/api/db', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ table: 'banners', action: 'insert', data }) });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error);
        toast.success('Banner created!');
      }
      setShowForm(false);
      setEditing(null);
      loadBanners();
    } catch (err: any) { toast.error(err.message); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this banner?')) return;
    await deleteBanner(id);
    toast.success('Banner deleted');
    loadBanners();
  };

  return (
    <div className="bg-white border border-[#DDDDDD] p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xs uppercase tracking-[0.2em]">Banners ({banners.length})</h2>
        <button onClick={openNew} className="btn btn-primary text-[10px]">{showForm ? 'Cancel' : 'Add Banner'}</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-[#F9F9F9] space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="input-field text-xs" />
            <input placeholder="Subtitle" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} className="input-field text-xs" />
            <input placeholder="Link URL (e.g. /shop?category=sale)" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} className="input-field text-xs" />
            <input placeholder="Order (1, 2, 3...)" type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} className="input-field text-xs" />
            <div>
              <label className="text-[10px] uppercase tracking-[0.1em] opacity-60 block mb-1">Banner Image</label>
              <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="text-xs" />
            </div>
          </div>
          <button type="submit" className="btn btn-primary text-[10px]">{editing ? 'Update Banner' : 'Create Banner'}</button>
        </form>
      )}

      {loading ? <p className="text-xs opacity-40 text-center py-8">Loading...</p> : (
        <div className="space-y-3">
          {banners.map((b) => (
            <div key={b.id} className="flex items-center justify-between p-4 border border-[#DDDDDD]">
              <div className="flex items-center gap-4">
                {b.image ? <img src={b.image} alt="" className="w-20 h-14 object-cover flex-shrink-0" /> : <div className="w-20 h-14 bg-gray-100 flex-shrink-0" />}
                <div><p className="text-xs uppercase tracking-[0.1em]">{b.title}</p><p className="text-[10px] opacity-40">Order: {b.order}</p></div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-[10px] uppercase px-2 py-1 ${b.active ? 'bg-green-100' : 'bg-red-100'}`}>{b.active ? 'Active' : 'Inactive'}</span>
                <button type="button" onClick={() => openEdit(b)} className="underline text-[10px]">Edit</button>
                <button type="button" onClick={() => handleDelete(b.id)} className="underline text-[10px] text-red-500">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
