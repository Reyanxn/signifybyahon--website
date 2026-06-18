'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFeaturedReviews } from '@/lib/supabaseServices';
import type { Review } from '@/types';

export default function Testimonials() {
  const [reviews, setReviews] = useState<(Review & { products?: { name: string } })[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    getFeaturedReviews().then((data) => setReviews(data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (reviews.length < 2) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % reviews.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [reviews.length]);

  if (reviews.length === 0) return null;

  const r = reviews[current];

  return (
    <section className="section-spacing bg-[#F9F9F9]">
      <div className="container-site text-center max-w-2xl mx-auto">
        <h2 className="text-lg md:text-xl tracking-[0.2em] font-normal mb-8">What Our Customers Say</h2>
        <div className="relative min-h-[160px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex justify-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <span key={s} className={`text-lg ${s <= r.rating ? 'text-yellow-500' : 'text-gray-300'}`}>&#9733;</span>
                ))}
              </div>
              <p className="text-sm italic leading-relaxed opacity-80 mb-6">&ldquo;{r.comment}&rdquo;</p>
              <p className="text-xs uppercase tracking-[0.2em] font-medium">{r.userName}</p>
              {r.products?.name && <p className="text-[10px] uppercase tracking-[0.1em] opacity-40 mt-1">on {r.products.name}</p>}
            </motion.div>
          </AnimatePresence>
        </div>
        {reviews.length > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {reviews.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full transition-colors ${i === current ? 'bg-[#1C1C1C]' : 'bg-[#DDDDDD]'}`} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
