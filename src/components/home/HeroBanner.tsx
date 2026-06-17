'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { getBanners } from '@/lib/supabaseServices';
import type { Banner } from '@/types';

export default function HeroBanner() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    getBanners().then(setBanners);
  }, []);

  const next = useCallback(() => {
    if (banners.length === 0) return;
    setCurrent((p) => (p + 1) % banners.length);
  }, [banners.length]);

  useEffect(() => {
    if (banners.length === 0) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next, banners.length]);

  if (banners.length === 0) return null;

  const slide = banners[current];

  return (
    <section className="relative h-[80vh] min-h-[500px] max-h-[900px] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 bg-[#1C1C1C] flex items-center"
        >
          {slide.image && (
            <div className="absolute inset-0">
              <img src={slide.image} alt={slide.title} className="w-full h-full object-cover opacity-50" />
            </div>
          )}
          <div className="container-site w-full relative z-10">
            <div className="max-w-xl">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-xs uppercase tracking-[0.3em] text-white/60 mb-4"
              >
                SIGNIFY BY AHON
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="text-4xl md:text-6xl lg:text-7xl font-light text-white mb-4 leading-tight"
                style={{ textTransform: 'uppercase', letterSpacing: '0.15em' }}
              >
                {slide.title}
              </motion.h2>
              {slide.subtitle && (
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                  className="text-sm md:text-base text-white/70 mb-8 max-w-md leading-relaxed"
                >
                  {slide.subtitle}
                </motion.p>
              )}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.6 }}
              >
                <Link
                  href={slide.link || '/shop'}
                  className="btn btn-outline text-white border-white hover:bg-white hover:text-[#1C1C1C]"
                >
                  Shop Now
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-12 h-[2px] transition-all duration-300 ${
              i === current ? 'bg-white' : 'bg-white/30'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
