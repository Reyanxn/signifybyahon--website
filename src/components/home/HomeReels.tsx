'use client';

import { useState, useEffect } from 'react';
import { getReelProducts } from '@/lib/supabaseServices';

export default function HomeReels() {
  const [reels, setReels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    getReelProducts().then((data) => {
      setReels(data);
      setLoading(false);
    });
  }, []);

  if (loading || reels.length === 0) return null;

  return (
    <section className="section-spacing bg-[#F9F9F9]">
      <div className="container-site">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-lg md:text-xl tracking-[0.2em] font-normal">Reels</h2>
          <div className="flex gap-2">
            <button onClick={() => setActiveIndex(Math.max(0, activeIndex - 1))} disabled={activeIndex === 0} className="w-8 h-8 border border-[#DDDDDD] flex items-center justify-center text-xs disabled:opacity-30">&lt;</button>
            <button onClick={() => setActiveIndex(Math.min(reels.length - 1, activeIndex + 1))} disabled={activeIndex >= reels.length - 3} className="w-8 h-8 border border-[#DDDDDD] flex items-center justify-center text-xs disabled:opacity-30">&gt;</button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {reels.slice(activeIndex, activeIndex + 4).map((r: any) => (
            <div key={r.id} className="aspect-[9/16] bg-[#1C1C1C] relative group overflow-hidden">
              {r.video?.includes('youtube') || r.video?.includes('youtu.be') ? (
                <iframe src={r.video.replace('watch?v=', 'embed/')} className="w-full h-full" allowFullScreen />
              ) : (
                <video src={r.video} className="w-full h-full object-cover" muted loop playsInline />
              )}
              <div className="absolute inset-0 flex items-end p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white text-[10px] uppercase tracking-[0.1em]">{r.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
