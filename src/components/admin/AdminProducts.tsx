'use client';

import { useState, useEffect } from 'react';
import { getProducts, addProduct, updateProduct, deleteProduct, uploadProductImage, getCategories } from '@/lib/supabaseServices';
import { formatPrice, getSizeStock } from '@/utils/helpers';
import type { Product } from '@/types';
import toast from 'react-hot-toast';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id?: string; name: string; slug: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', price: '', salePrice: '',
    categoryId: '', collectionId: '', colors: '', stock: '',
    featured: false, bestSeller: false, trending: false, tags: '', video: '',
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [sizeChart, setSizeChart] = useState<{ columns: string[]; rows: { label: string; values: string[] }[] } | null>(null);
  const [sizeStockList, setSizeStockList] = useState<{ name: string; stock: number; visible: boolean }[]>([]);

  useEffect(() => {
    loadProducts();
    getCategories().then((data) => {
      if (data) setCategories(data);
    });
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    const data = await getProducts();
    setProducts(data);
    setLoading(false);
  };

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', description: '', price: '', salePrice: '', categoryId: '', collectionId: '', colors: '', stock: '', featured: false, bestSeller: false, trending: false, tags: '', video: '' });
    setImageFiles([]);
    setExistingImages([]);
    setSizeChart(null);
    setSizeStockList([]);
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p.id);
    setForm({
      name: p.name, description: p.description,
      price: String(p.price), salePrice: p.salePrice ? String(p.salePrice) : '',
      categoryId: p.categoryId, collectionId: p.collectionId || '',
      colors: p.colors.join(', '), stock: String(p.stock),
      featured: p.featured || false, bestSeller: p.bestSeller || false, trending: p.trending || false,
      tags: (p.tags || []).join(', '), video: (p as any).video || '',
    });
    setExistingImages(p.images || []);
    setImageFiles([]);
    setSizeChart((p as any).sizeChart || null);
    setSizeStockList(getSizeStock(p));
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      let images = [...existingImages];
      for (let i = 0; i < imageFiles.length; i++) {
        const url = await uploadProductImage(imageFiles[i], editing || 'new', Date.now() + i);
        images.push(url);
      }

      const totalStock = sizeStockList.reduce((sum, s) => sum + s.stock, 0);
      const sizeNames = sizeStockList.filter((s) => s.visible).map((s) => s.name);

      const productData = {
        name: form.name,
        slug: form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        description: form.description,
        fabricDetails: '',
        price: Number(form.price),
        salePrice: form.salePrice ? Number(form.salePrice) : undefined,
        categoryId: form.categoryId,
        collectionId: form.collectionId,
        images,
        sizes: sizeNames,
        colors: form.colors.split(',').map((c) => c.trim()).filter(Boolean),
        stock: totalStock,
        featured: form.featured,
        bestSeller: form.bestSeller,
        trending: form.trending,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        video: form.video || null,
        size_chart: sizeChart || null,
        size_stock: sizeStockList,
      };

      if (editing) {
        await updateProduct(editing, { ...productData, video: form.video || null });
        toast.success('Product updated!');
      } else {
        await addProduct(productData);
        toast.success('Product created!');
      }
      setShowForm(false);
      loadProducts();
    } catch (err: any) {
      toast.error(err.message);
    }
    setUploading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await deleteProduct(id);
    toast.success('Product deleted');
    loadProducts();
  };

  const toggle = (key: 'featured' | 'bestSeller' | 'trending') =>
    setForm((prev) => ({ ...prev, [key]: !prev[key] }));

  const updateSize = (index: number, field: 'name' | 'stock' | 'visible', value: any) => {
    const list = [...sizeStockList];
    (list[index] as any)[field] = value;
    setSizeStockList(list);
  };

  const addSize = () => {
    setSizeStockList([...sizeStockList, { name: '', stock: 0, visible: true }]);
  };

  const removeSize = (index: number) => {
    setSizeStockList(sizeStockList.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white border border-[#DDDDDD] p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xs uppercase tracking-[0.2em]">Products ({products.length})</h2>
        <button onClick={openNew} className="btn btn-primary text-[10px]">{showForm ? 'Cancel' : 'Add Product'}</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-[#F9F9F9] space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input placeholder="Product Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="input-field text-xs" />
            <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="input-field text-xs">
              <option value="">Category</option>
              {categories.map((c) => <option key={c.id} value={c.slug || c.id}>{c.name}</option>)}
            </select>
            <input placeholder="Collection ID (e.g. summer)" value={form.collectionId} onChange={(e) => setForm({ ...form, collectionId: e.target.value })} className="input-field text-xs" />
            <input placeholder="Price *" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required className="input-field text-xs" />
            <input placeholder="Sale Price" type="number" value={form.salePrice} onChange={(e) => setForm({ ...form, salePrice: e.target.value })} className="input-field text-xs" />
            <input placeholder="Colors (Black, Red, etc.)" value={form.colors} onChange={(e) => setForm({ ...form, colors: e.target.value })} className="input-field text-xs" />
            <input placeholder="Video URL (optional)" value={form.video} onChange={(e) => setForm({ ...form, video: e.target.value })} className="input-field text-xs" />
            <input placeholder="Tags (new, exclusive, etc.)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="input-field text-xs" />
            <div className="flex items-end gap-4 pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.featured} onChange={() => toggle('featured')} className="w-3.5 h-3.5 accent-black" />
                <span className="text-[10px] uppercase tracking-[0.1em]">Featured</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.bestSeller} onChange={() => toggle('bestSeller')} className="w-3.5 h-3.5 accent-black" />
                <span className="text-[10px] uppercase tracking-[0.1em]">Best Seller</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.trending} onChange={() => toggle('trending')} className="w-3.5 h-3.5 accent-black" />
                <span className="text-[10px] uppercase tracking-[0.1em]">Trending</span>
              </label>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.1em] opacity-60 block mb-1">Images (select multiple)</label>
              <input type="file" multiple accept="image/*" onChange={(e) => setImageFiles(Array.from(e.target.files || []))} className="text-xs w-full" />
              {imageFiles.length > 0 && <p className="text-[10px] mt-1 opacity-60">{imageFiles.length} new file(s) selected</p>}
              {existingImages.length > 0 && <p className="text-[10px] mt-1 opacity-60">{existingImages.length} existing image(s)</p>}
            </div>
          </div>

          <div className="border border-[#DDDDDD] p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase tracking-[0.2em] opacity-60">Size & Stock</span>
            </div>
            {sizeStockList.length > 0 && (
              <div className="overflow-x-auto mb-2">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-1 pr-2 text-[10px] uppercase tracking-[0.1em] opacity-60">Size Name</th>
                      <th className="pb-1 pr-2 text-[10px] uppercase tracking-[0.1em] opacity-60">Stock</th>
                      <th className="pb-1 pr-2 text-[10px] uppercase tracking-[0.1em] opacity-60">Visible</th>
                      <th className="pb-1 w-6" />
                    </tr>
                  </thead>
                  <tbody>
                    {sizeStockList.map((s, i) => (
                      <tr key={i}>
                        <td className="py-1 pr-2">
                          <input value={s.name} onChange={(e) => updateSize(i, 'name', e.target.value)} placeholder="e.g. S, M, Free Size" className="w-24 bg-transparent border-b border-dotted border-[#DDDDDD] outline-none text-[10px] uppercase tracking-[0.1em]" />
                        </td>
                        <td className="py-1 pr-2">
                          <input value={s.stock} type="number" min={0} onChange={(e) => updateSize(i, 'stock', Math.max(0, Number(e.target.value)))} className="w-16 bg-transparent border-b border-dotted border-[#DDDDDD] outline-none text-[10px]" />
                        </td>
                        <td className="py-1 pr-2">
                          <input type="checkbox" checked={s.visible} onChange={(e) => updateSize(i, 'visible', e.target.checked)} className="w-3.5 h-3.5 accent-black" />
                        </td>
                        <td className="py-1">
                          <button type="button" onClick={() => removeSize(i)} className="text-red-500 text-[9px]">x</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <button type="button" onClick={addSize} className="text-[10px] underline opacity-60 hover:opacity-100">+ Add Size</button>
          </div>

          <div className="border border-[#DDDDDD] p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase tracking-[0.2em] opacity-60">Size Chart</span>
              {!sizeChart ? (
                <button type="button" onClick={() => setSizeChart({ columns: ['S', 'M', 'L', 'XL'], rows: [{ label: 'Bust', values: ['34"', '36"', '38"', '40"'] }, { label: 'Waist', values: ['28"', '30"', '32"', '34"'] }, { label: 'Hips', values: ['36"', '38"', '40"', '42"'] }] })} className="text-[10px] underline">Add Size Chart</button>
              ) : (
                <button type="button" onClick={() => setSizeChart(null)} className="text-[10px] underline text-red-500">Remove</button>
              )}
            </div>
            {sizeChart && (
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr>
                      <th className="border border-[#DDDDDD] p-1.5 text-left font-normal text-[10px] uppercase tracking-[0.1em]">
                        Measurement
                        <button type="button" onClick={() => setSizeChart({ ...sizeChart, rows: [...sizeChart.rows, { label: '', values: Array(sizeChart.columns.length).fill('') }] })} className="ml-2 text-[9px] underline opacity-60">+row</button>
                      </th>
                      {sizeChart.columns.map((col, ci) => (
                        <th key={ci} className="border border-[#DDDDDD] p-1.5 text-center font-normal text-[10px] uppercase tracking-[0.1em]">
                          <input value={col} onChange={(e) => { const c = [...sizeChart.columns]; c[ci] = e.target.value; setSizeChart({ ...sizeChart, columns: c }); }} className="w-10 text-center bg-transparent border-b border-dotted border-[#DDDDDD] outline-none" />
                          {sizeChart.columns.length > 1 && <button type="button" onClick={() => { const c = sizeChart.columns.filter((_, j) => j !== ci); const r = sizeChart.rows.map((row) => ({ ...row, values: row.values.filter((_, j) => j !== ci) })); setSizeChart({ columns: c, rows: r }); }} className="ml-1 text-red-500 text-[9px]">x</button>}
                        </th>
                      ))}
                      <th className="border border-[#DDDDDD] p-1.5 w-6">
                        <button type="button" onClick={() => setSizeChart({ ...sizeChart, columns: [...sizeChart.columns, ''], rows: sizeChart.rows.map((r) => ({ ...r, values: [...r.values, ''] })) })} className="text-[9px] underline opacity-60">+col</button>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sizeChart.rows.map((row, ri) => (
                      <tr key={ri}>
                        <td className="border border-[#DDDDDD] p-1.5">
                          <input value={row.label} onChange={(e) => { const r = [...sizeChart.rows]; r[ri] = { ...r[ri], label: e.target.value }; setSizeChart({ ...sizeChart, rows: r }); }} className="w-20 bg-transparent border-b border-dotted border-[#DDDDDD] outline-none text-[10px] uppercase tracking-[0.1em]" />
                          <button type="button" onClick={() => setSizeChart({ ...sizeChart, rows: sizeChart.rows.filter((_, j) => j !== ri) })} className="ml-1 text-red-500 text-[9px]">x</button>
                        </td>
                        {row.values.map((val, ci) => (
                          <td key={ci} className="border border-[#DDDDDD] p-1.5 text-center">
                            <input value={val} onChange={(e) => { const r = [...sizeChart.rows]; r[ri] = { ...r[ri], values: [...r[ri].values] }; r[ri].values[ci] = e.target.value; setSizeChart({ ...sizeChart, rows: r }); }} className="w-12 text-center bg-transparent border-b border-dotted border-[#DDDDDD] outline-none" />
                          </td>
                        ))}
                        <td className="border border-[#DDDDDD] p-1.5" />
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="input-field text-xs w-full" />
          <button type="submit" disabled={uploading} className="btn btn-primary text-[10px]">{uploading ? 'Uploading...' : editing ? 'Update Product' : 'Create Product'}</button>
        </form>
      )}

      {loading ? (
        <p className="text-xs opacity-40 text-center py-8">Loading...</p>
      ) : products.length === 0 ? (
        <p className="text-xs opacity-40 text-center py-8">No products yet. Add your first product!</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b text-left">
              <th className="pb-3 font-normal uppercase tracking-[0.1em] opacity-40">Product</th>
              <th className="pb-3 font-normal uppercase tracking-[0.1em] opacity-40">Price</th>
              <th className="pb-3 font-normal uppercase tracking-[0.1em] opacity-40">Stock</th>
              <th className="pb-3 font-normal uppercase tracking-[0.1em] opacity-40">Tags</th>
              <th className="pb-3 font-normal uppercase tracking-[0.1em] opacity-40">Actions</th>
            </tr></thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="py-3 uppercase tracking-[0.1em]">{p.name}</td>
                  <td className="py-3">{p.salePrice ? <>{formatPrice(p.salePrice)} <span className="line-through opacity-40">{formatPrice(p.price)}</span></> : formatPrice(p.price)}</td>
                  <td className="py-3">{p.stock}</td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-1">
                      {p.featured && <span className="text-[9px] uppercase tracking-[0.1em] px-1.5 py-0.5 bg-black text-white">Featured</span>}
                      {p.bestSeller && <span className="text-[9px] uppercase tracking-[0.1em] px-1.5 py-0.5 bg-green-800 text-white">Best Seller</span>}
                      {p.trending && <span className="text-[9px] uppercase tracking-[0.1em] px-1.5 py-0.5 bg-blue-800 text-white">Trending</span>}
                      {p.salePrice && <span className="text-[9px] uppercase tracking-[0.1em] px-1.5 py-0.5 bg-red-700 text-white">Sale</span>}
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <button type="button" onClick={() => openEdit(p)} className="underline text-[10px]">Edit</button>
                      <button type="button" onClick={() => handleDelete(p.id)} className="underline text-[10px] text-red-500">Delete</button>
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
