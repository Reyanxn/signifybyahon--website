'use client';

import { useState, useEffect } from 'react';
import { getAllReviews, updateReview, deleteReview } from '@/lib/supabaseServices';
import type { Review } from '@/types';
import toast from 'react-hot-toast';

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const data = await getAllReviews();
    setReviews(data);
    setLoading(false);
  };

  const handleToggleApprove = async (r: Review) => {
    await updateReview(r.id, { approved: !r.approved });
    toast.success(r.approved ? 'Unapproved' : 'Approved');
    load();
  };

  const handleToggleFeature = async (r: Review) => {
    await updateReview(r.id, { featured: !r.featured });
    toast.success(r.featured ? 'Removed from testimonials' : 'Featured as testimonial');
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this review?')) return;
    await deleteReview(id);
    toast.success('Review deleted');
    load();
  };

  const filtered = reviews.filter((r) => {
    if (filter === 'pending') return !r.approved;
    if (filter === 'approved') return r.approved;
    return true;
  });

  return (
    <div className="bg-white border border-[#DDDDDD] p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xs uppercase tracking-[0.2em]">Reviews ({reviews.length})</h2>
        <div className="flex gap-2">
          {(['all', 'pending', 'approved'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`text-[10px] uppercase tracking-[0.1em] px-3 py-1.5 border ${filter === f ? 'bg-[#1C1C1C] text-white border-[#1C1C1C]' : 'border-[#DDDDDD] hover:border-[#1C1C1C]'}`}>{f}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-xs opacity-40 text-center py-8">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-xs opacity-40 text-center py-8">No reviews found</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div key={r.id} className="border border-[#DDDDDD] p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs font-medium uppercase tracking-[0.1em]">{r.userName}</span>
                    <span className="text-[10px] opacity-40">{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-0.5 mb-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span key={s} className={`text-[10px] ${s <= r.rating ? 'text-yellow-500' : 'text-gray-300'}`}>&#9733;</span>
                    ))}
                  </div>
                  <p className="text-xs opacity-80">{r.comment}</p>
                </div>
                <div className="flex flex-col gap-1.5 flex-shrink-0">
                  <button onClick={() => handleToggleApprove(r)}
                    className={`text-[9px] uppercase tracking-[0.1em] px-2 py-1 border ${r.approved ? 'bg-green-100 text-green-800 border-green-300' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                    {r.approved ? 'Approved' : 'Pending'}
                  </button>
                  <button onClick={() => handleToggleFeature(r)}
                    className={`text-[9px] uppercase tracking-[0.1em] px-2 py-1 border ${r.featured ? 'bg-purple-100 text-purple-800 border-purple-300' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                    {r.featured ? 'Featured' : 'Feature'}
                  </button>
                  <button onClick={() => handleDelete(r.id)} className="text-[9px] uppercase tracking-[0.1em] px-2 py-1 border border-red-200 text-red-500 hover:bg-red-50">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
