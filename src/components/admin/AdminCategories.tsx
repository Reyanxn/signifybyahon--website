'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { HiChevronUp, HiChevronDown } from 'react-icons/hi';
import toast from 'react-hot-toast';

interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  order: number;
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', image: '' });

  useEffect(() => { loadCategories(); }, []);

  const loadCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('categories').select('*').order('created_at', { ascending: true });
    if (!error && data) setCategories(data);
    setLoading(false);
  };

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', slug: '', image: '' });
    setShowForm(true);
  };

  const openEdit = (c: Category) => {
    setEditing(c.id);
    setForm({ name: c.name, slug: c.slug, image: c.image || '' });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = form.slug || form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const maxOrder = categories.length > 0 ? Math.max(...categories.map((c) => c.order || 0)) : 0;

    if (editing) {
      const { error } = await supabase.from('categories').update({ name: form.name, slug, image: form.image }).eq('id', editing);
      if (error) { toast.error(error.message); return; }
      toast.success('Category updated!');
    } else {
      const { error } = await supabase.from('categories').insert({ name: form.name, slug, image: form.image, order: maxOrder + 1 });
      if (error) { toast.error(error.message); return; }
      toast.success('Category created!');
    }
    setShowForm(false);
    loadCategories();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success('Category deleted');
    loadCategories();
  };

  const moveItem = async (id: string, direction: 'up' | 'down') => {
    const items = [...categories];
    const idx = items.findIndex((c) => c.id === id);
    if (idx === -1) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= items.length) return;
    const currentOrder = items[idx].order || idx;
    const swapOrder = items[swapIdx].order || swapIdx;
    const { error: e1 } = await supabase.from('categories').update({ order: swapOrder }).eq('id', id);
    const { error: e2 } = await supabase.from('categories').update({ order: currentOrder }).eq('id', items[swapIdx].id);
    if (e1 || e2) { toast.error('Failed to reorder'); return; }
    loadCategories();
  };

  return (
    <div className="bg-white border border-[#DDDDDD] p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xs uppercase tracking-[0.2em]">Categories ({categories.length})</h2>
        <button onClick={openNew} className="btn btn-primary text-[10px]">{showForm ? 'Cancel' : 'Add Category'}</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-[#F9F9F9] space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input placeholder="Category Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="input-field text-xs" />
            <input placeholder="Slug (auto)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="input-field text-xs" />
            <input placeholder="Image URL" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="input-field text-xs" />
          </div>
          <button type="submit" className="btn btn-primary text-[10px]">{editing ? 'Update Category' : 'Create Category'}</button>
        </form>
      )}

      {loading ? (
        <p className="text-xs opacity-40 text-center py-8">Loading...</p>
      ) : categories.length === 0 ? (
        <p className="text-xs opacity-40 text-center py-8">No categories yet.</p>
      ) : (
        <div className="space-y-1">
          {categories.map((c, i) => (
            <div key={c.id} className="flex items-center justify-between p-3 border border-[#DDDDDD]">
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-0.5">
                  <button onClick={() => moveItem(c.id, 'up')} disabled={i === 0} className={`${i === 0 ? 'opacity-20 cursor-not-allowed' : 'hover:opacity-60'}`}>
                    <HiChevronUp className="w-3 h-3" />
                  </button>
                  <button onClick={() => moveItem(c.id, 'down')} disabled={i === categories.length - 1} className={`${i === categories.length - 1 ? 'opacity-20 cursor-not-allowed' : 'hover:opacity-60'}`}>
                    <HiChevronDown className="w-3 h-3" />
                  </button>
                </div>
                <span className="text-xs uppercase tracking-[0.1em]">{c.name}</span>
                <span className="text-[10px] opacity-40">{c.slug}</span>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => openEdit(c)} className="underline text-[10px]">Edit</button>
                <button type="button" onClick={() => handleDelete(c.id)} className="underline text-[10px] text-red-500">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
