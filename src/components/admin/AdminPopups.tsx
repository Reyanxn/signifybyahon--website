'use client';

import { useState, useEffect } from 'react';
import { uploadFile } from '@/lib/supabaseServices';
import ImageCropper from '@/components/ui/ImageCropper';
import toast from 'react-hot-toast';

export default function AdminPopups() {
  const [popups, setPopups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [link, setLink] = useState('');
  const [active, setActive] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { loadPopups(); }, []);

  const loadPopups = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/popups');
      const json = await res.json();
      setPopups(json.data || []);
    } catch { /* table may not exist yet */ }
    setLoading(false);
  };

  const openNew = () => {
    setEditingId(null);
    setRawFile(null);
    setCropFile(null);
    setLink('');
    setActive(true);
    setShowForm(true);
  };

  const openEdit = (p: any) => {
    setEditingId(p.id);
    setRawFile(null);
    setCropFile(null);
    setLink(p.link || '');
    setActive(p.active);
    setShowForm(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setRawFile(file);
      setCropFile(null);
      setShowCropper(true);
    }
  };

  const handleCropDone = (cropped: File) => {
    setCropFile(cropped);
    setShowCropper(false);
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setRawFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cropFile && !editingId) { toast.error('Select an image'); return; }
    setUploading(true);
    try {
      let imageUrl = '';
      if (cropFile) {
        imageUrl = await uploadFile(cropFile, `popups/${Date.now()}`);
      }

      if (editingId) {
        const body: any = { id: editingId, link: link || null, active };
        if (imageUrl) body.image = imageUrl;
        const res = await fetch('/api/popups', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error);
        toast.success('Popup updated!');
      } else {
        const res = await fetch('/api/popups', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image: imageUrl, link: link || null, active, order: popups.length }) });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error);
        toast.success('Popup created!');
      }
      setShowForm(false);
      loadPopups();
    } catch (err: any) {
      toast.error(err.message);
    }
    setUploading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this popup?')) return;
    try {
      const res = await fetch(`/api/popups?id=${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success('Popup deleted');
      loadPopups();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const reorder = async (arr: any[]) => {
    for (let i = 0; i < arr.length; i++) {
      await fetch('/api/popups', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: arr[i].id, order: i }) });
    }
    loadPopups();
  };

  const moveUp = async (index: number) => {
    if (index === 0) return;
    const arr = [...popups];
    [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
    reorder(arr);
  };

  const moveDown = async (index: number) => {
    if (index >= popups.length - 1) return;
    const arr = [...popups];
    [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
    reorder(arr);
  };

  return (
    <div className="bg-white border border-[#DDDDDD] p-6">
      {showCropper && rawFile && (
        <ImageCropper file={rawFile} onCrop={handleCropDone} onCancel={handleCropCancel} />
      )}

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xs uppercase tracking-[0.2em]">Popups ({popups.length})</h2>
        <button onClick={openNew} className="btn btn-primary text-[10px]">{showForm ? 'Cancel' : 'Add Popup'}</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-[#F9F9F9] space-y-3">
          <div>
            <label className="text-[10px] uppercase tracking-[0.1em] opacity-60 block mb-1">Popup Image (square)</label>
            <input type="file" accept="image/*" onChange={handleFileSelect} className="text-xs w-full" />
            {cropFile && <p className="text-[10px] mt-1 text-green-600">Image cropped to square ✓</p>}
            {!rawFile && editingId && <p className="text-[10px] mt-1 opacity-40">Leave empty to keep existing image</p>}
          </div>
          <input placeholder="Link (optional)" value={link} onChange={(e) => setLink(e.target.value)} className="input-field text-xs" />
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="w-3.5 h-3.5 accent-black" />
            <span className="text-[10px] uppercase tracking-[0.1em]">Active</span>
          </label>
          <button type="submit" disabled={uploading || !cropFile && !editingId} className="btn btn-primary text-[10px]">{uploading ? 'Uploading...' : editingId ? 'Update' : 'Create'}</button>
        </form>
      )}

      {loading ? (
        <p className="text-xs opacity-40 text-center py-8">Loading...</p>
      ) : popups.length === 0 ? (
        <p className="text-xs opacity-40 text-center py-8">No popups yet. Add your first popup image!</p>
      ) : (
        <div className="space-y-3">
          {popups.map((p, i) => (
            <div key={p.id} className="flex items-center gap-4 border border-[#DDDDDD] p-3">
              <div className="w-16 h-16 bg-[#F5F5F5] flex-shrink-0 overflow-hidden">
                <img src={p.image} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] opacity-60 truncate">{p.link || 'No link'}</p>
                <span className={`text-[9px] uppercase ${p.active ? 'text-green-600' : 'text-red-600'}`}>{p.active ? 'Active' : 'Inactive'}</span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => moveUp(i)} disabled={i === 0} className="text-[10px] px-1 opacity-40 hover:opacity-100 disabled:opacity-20">&#9650;</button>
                <button onClick={() => moveDown(i)} disabled={i >= popups.length - 1} className="text-[10px] px-1 opacity-40 hover:opacity-100 disabled:opacity-20">&#9660;</button>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(p)} className="text-[10px] underline">Edit</button>
                <button onClick={() => handleDelete(p.id)} className="text-[10px] underline text-red-500">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
