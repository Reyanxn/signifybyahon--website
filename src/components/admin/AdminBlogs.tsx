'use client';

import { useState, useEffect } from 'react';
import { getBlogPosts, deleteBlogPost, uploadFile } from '@/lib/supabaseServices';
import { supabase } from '@/lib/supabase';
import type { BlogPost } from '@/types';
import toast from 'react-hot-toast';

export default function AdminBlogs() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', excerpt: '', tags: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [existingImage, setExistingImage] = useState('');

  useEffect(() => { loadPosts(); }, []);

  const loadPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('blogs').select('*').order('created_at', { ascending: false });
    if (!error && data) setPosts(data as any);
    setLoading(false);
  };

  const openNew = () => {
    setEditing(null);
    setForm({ title: '', content: '', excerpt: '', tags: '' });
    setImageFile(null);
    setExistingImage('');
    setShowForm(true);
  };

  const openEdit = (p: any) => {
    setEditing(p.id);
    setForm({ title: p.title, content: p.content, excerpt: p.excerpt || '', tags: (p.tags || []).join(', ') });
    setExistingImage(p.image || '');
    setImageFile(null);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      let imageUrl = existingImage;
      if (imageFile) imageUrl = await uploadFile(imageFile, `blogs/${Date.now()}_${imageFile.name}`, 'product-images');

      const slug = form.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

      if (editing) {
        const { error } = await supabase.from('blogs').update({
          title: form.title, slug, content: form.content, excerpt: form.excerpt,
          tags: form.tags.split(',').map((t) => t.trim()), image: imageUrl,
        }).eq('id', editing);
        if (error) throw error;
        toast.success('Blog updated!');
      } else {
        const { error } = await supabase.from('blogs').insert({
          title: form.title, slug, content: form.content, excerpt: form.excerpt,
          tags: form.tags.split(',').map((t) => t.trim()), image: imageUrl,
          author: 'Admin', published: true,
        });
        if (error) throw error;
        toast.success('Blog post created!');
      }
      setShowForm(false);
      setForm({ title: '', content: '', excerpt: '', tags: '' });
      setImageFile(null);
      loadPosts();
    } catch (err: any) { toast.error(err.message); }
    setUploading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this post?')) return;
    await deleteBlogPost(id);
    toast.success('Post deleted');
    loadPosts();
  };

  return (
    <div className="bg-white border border-[#DDDDDD] p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xs uppercase tracking-[0.2em]">Blog Posts ({posts.length})</h2>
        <button onClick={openNew} className="btn btn-primary text-[10px]">{showForm ? 'Cancel' : 'New Post'}</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-[#F9F9F9] space-y-3">
          <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="input-field text-xs w-full" />
          <input placeholder="Tags (comma separated)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="input-field text-xs w-full" />
          <textarea placeholder="Excerpt" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} rows={2} className="input-field text-xs w-full" />
          <textarea placeholder="Content (HTML supported)" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={6} className="input-field text-xs w-full" />
          <div>
            <label className="text-[10px] uppercase tracking-[0.1em] opacity-60 block mb-1">Featured Image</label>
            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="text-xs" />
            {imageFile && <p className="text-[10px] mt-1 opacity-60">{imageFile.name}</p>}
            {existingImage && !imageFile && <p className="text-[10px] mt-1 opacity-60">Current image: {existingImage.slice(-20)}</p>}
          </div>
          <button type="submit" disabled={uploading} className="btn btn-primary text-[10px]">{uploading ? 'Uploading...' : editing ? 'Update Post' : 'Publish'}</button>
        </form>
      )}

      {loading ? <p className="text-xs opacity-40 text-center py-8">Loading...</p> : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b text-left">
              <th className="pb-3 font-normal uppercase tracking-[0.1em] opacity-40">Image</th>
              <th className="pb-3 font-normal uppercase tracking-[0.1em] opacity-40">Title</th>
              <th className="pb-3 font-normal uppercase tracking-[0.1em] opacity-40">Date</th>
              <th className="pb-3 font-normal uppercase tracking-[0.1em] opacity-40">Actions</th>
            </tr></thead>
            <tbody>
              {posts.map((p: any) => (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="py-3">
                    {p.image ? <img src={p.image} alt="" className="w-12 h-10 object-cover" /> : <div className="w-12 h-10 bg-gray-100" />}
                  </td>
                  <td className="py-3 uppercase tracking-[0.1em]">{p.title}</td>
                  <td className="py-3 opacity-60">{new Date(p.created_at).toLocaleDateString()}</td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)} className="underline text-[10px]">Edit</button>
                      <button onClick={() => handleDelete(p.id)} className="underline text-[10px] text-red-500">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
