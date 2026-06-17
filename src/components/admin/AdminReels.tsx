'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

export default function AdminReels() {
  const [products, setProducts] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const { data: all } = await supabase.from('products').select('id, name, images, video').order('created_at', { ascending: false });
    if (all) setAllProducts(all);
    setProducts((all || []).filter((p: any) => p.video));
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!selectedProduct || !videoUrl) { toast.error('Select product and enter video URL'); return; }
    const { error } = await supabase.from('products').update({ video: videoUrl, updated_at: new Date().toISOString() }).eq('id', selectedProduct);
    if (error) { toast.error(error.message); return; }
    toast.success('Reel added!');
    setShowAdd(false);
    setSelectedProduct('');
    setVideoUrl('');
    loadData();
  };

  const handleRemove = async (id: string) => {
    if (!confirm('Remove video from this product?')) return;
    const { error } = await supabase.from('products').update({ video: null, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success('Reel removed');
    loadData();
  };

  return (
    <div className="bg-white border border-[#DDDDDD] p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xs uppercase tracking-[0.2em]">Reels ({products.length})</h2>
        <button onClick={() => setShowAdd(!showAdd)} className="btn btn-primary text-[10px]">{showAdd ? 'Cancel' : 'Add Reel'}</button>
      </div>

      {showAdd && (
        <div className="mb-6 p-4 bg-[#F9F9F9] space-y-3">
          <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} className="input-field text-xs w-full">
            <option value="">Select a product</option>
            {allProducts.filter((p: any) => !p.video).map((p: any) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <input placeholder="Video URL (YouTube / MP4 link)" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} className="input-field text-xs w-full" />
          <button onClick={handleAdd} className="btn btn-primary text-[10px]">Add Reel</button>
        </div>
      )}

      {loading ? (
        <p className="text-xs opacity-40 text-center py-8">Loading...</p>
      ) : products.length === 0 ? (
        <p className="text-xs opacity-40 text-center py-8">No reels yet. Add videos to your products!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p: any) => (
            <div key={p.id} className="border border-[#DDDDDD] overflow-hidden">
              <div className="aspect-video bg-[#F5F5F5] flex items-center justify-center">
                {p.video?.includes('youtube') || p.video?.includes('youtu.be') ? (
                  <iframe src={p.video.replace('watch?v=', 'embed/')} className="w-full h-full" allowFullScreen />
                ) : (
                  <video src={p.video} className="w-full h-full object-cover" controls />
                )}
              </div>
              <div className="p-3">
                <p className="text-xs uppercase tracking-[0.1em]">{p.name}</p>
                <button onClick={() => handleRemove(p.id)} className="text-[10px] text-red-500 underline mt-2">Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
