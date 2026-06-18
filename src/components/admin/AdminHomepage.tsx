'use client';

import { useState, useEffect } from 'react';
import {
  getAllHomepageSections, addHomepageSection,
  updateHomepageSection, deleteHomepageSection, getProducts
} from '@/lib/supabaseServices';
import type { HomepageSection } from '@/types';
import toast from 'react-hot-toast';

export default function AdminHomepage() {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', type: 'custom', alignment: 'left', productIds: [] as string[], active: true });

  useEffect(() => {
    load();
    getProducts().then(setProducts);
  }, []);

  const load = async () => {
    setLoading(true);
    const data = await getAllHomepageSections();
    setSections(data);
    setLoading(false);
  };

  const openNew = () => {
    setEditing(null);
    setShowForm(true);
    setForm({ title: '', type: 'custom', alignment: 'left', productIds: [], active: true });
  };

  const openEdit = (s: HomepageSection) => {
    setEditing(s.id);
    setShowForm(true);
    setForm({ title: s.title, type: s.type, alignment: s.alignment, productIds: s.productIds || [], active: s.active });
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditing(null);
  };

  const handleSave = async () => {
    if (!form.title) { toast.error('Title is required'); return; }
    try {
      if (editing) {
        await updateHomepageSection(editing, form);
        toast.success('Section updated');
      } else {
        await addHomepageSection({ ...form, displayOrder: sections.length + 1 });
        toast.success('Section created');
      }
      cancelForm();
      load();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this section?')) return;
    await deleteHomepageSection(id);
    toast.success('Section deleted');
    load();
  };

  const moveUp = async (idx: number) => {
    if (idx === 0) return;
    const a = sections[idx], b = sections[idx - 1];
    await updateHomepageSection(a.id, { displayOrder: a.displayOrder - 1 } as any);
    await updateHomepageSection(b.id, { displayOrder: b.displayOrder + 1 } as any);
    load();
  };

  const moveDown = async (idx: number) => {
    if (idx === sections.length - 1) return;
    const a = sections[idx], b = sections[idx + 1];
    await updateHomepageSection(a.id, { displayOrder: a.displayOrder + 1 } as any);
    await updateHomepageSection(b.id, { displayOrder: b.displayOrder - 1 } as any);
    load();
  };

  const toggleProduct = (pid: string) => {
    setForm((prev) => ({
      ...prev,
      productIds: prev.productIds.includes(pid)
        ? prev.productIds.filter((id) => id !== pid)
        : [...prev.productIds, pid],
    }));
  };

  return (
    <div className="bg-white border border-[#DDDDDD] p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xs uppercase tracking-[0.2em]">Homepage Sections</h2>
        {!showForm && <button onClick={openNew} className="btn btn-primary text-[10px]">Add Section</button>}
      </div>

      {!showForm && (
        <div className="space-y-2 mb-6">
          {sections.map((s, i) => (
            <div key={s.id} className="flex items-center gap-3 p-3 border border-[#DDDDDD]">
              <div className="flex flex-col gap-0.5">
                <button onClick={() => moveUp(i)} className="text-[9px] opacity-40 hover:opacity-100">&uarr;</button>
                <button onClick={() => moveDown(i)} className="text-[9px] opacity-40 hover:opacity-100">&darr;</button>
              </div>
              <div className="flex-1">
                <p className="text-xs uppercase tracking-[0.1em]">{s.title}</p>
                <p className="text-[10px] opacity-40">{s.type} &middot; {s.productIds?.length || 0} products &middot; {s.alignment}</p>
              </div>
              <span className={`text-[9px] px-1.5 py-0.5 ${s.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-400'}`}>{s.active ? 'Active' : 'Hidden'}</span>
              <button onClick={() => openEdit(s)} className="underline text-[10px]">Edit</button>
              <button onClick={() => handleDelete(s.id)} className="underline text-[10px] text-red-500">Delete</button>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="mb-6 p-4 bg-[#F9F9F9] space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Section Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field text-xs" />
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input-field text-xs">
              <option value="custom">Custom Selection</option>
              <option value="new-arrivals">New Arrivals (auto)</option>
              <option value="best-sellers">Best Sellers (auto)</option>
              <option value="trending">Trending (auto)</option>
              <option value="sale">Sale (auto)</option>
              <option value="testimonials">Testimonials</option>
            </select>
            <select value={form.alignment} onChange={(e) => setForm({ ...form, alignment: e.target.value })} className="input-field text-xs">
              <option value="left">Left Aligned</option>
              <option value="center">Center Aligned</option>
            </select>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="w-3.5 h-3.5 accent-black" />
              <span className="text-[10px] uppercase tracking-[0.1em]">Active</span>
            </label>
          </div>

          {form.type === 'custom' && (
            <div>
              <p className="text-[10px] uppercase tracking-[0.1em] opacity-60 mb-2">Select Products</p>
              <div className="max-h-40 overflow-y-auto border border-[#DDDDDD] p-2 space-y-1">
                {products.map((p) => (
                  <label key={p.id} className="flex items-center gap-2 cursor-pointer text-xs">
                    <input type="checkbox" checked={form.productIds.includes(p.id)} onChange={() => toggleProduct(p.id)} className="w-3 h-3 accent-black" />
                    {p.name}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={handleSave} className="btn btn-primary text-[10px]">Save</button>
            <button onClick={cancelForm} className="text-[10px] underline opacity-60">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
