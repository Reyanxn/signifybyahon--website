'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiX, HiChevronLeft, HiChevronRight } from 'react-icons/hi';

export default function PopupModal() {
  const [popups, setPopups] = useState<any[]>([]);
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    fetch('/api/popups?active=true').then(r => r.json()).then(json => {
      const data = json.data || [];
      if (data.length > 0) {
        setPopups(data);
        const dismissed = sessionStorage.getItem('popup_dismissed');
        if (!dismissed) {
          setTimeout(() => setVisible(true), 1200);
        }
      }
    });
  }, []);

  const dismiss = useCallback(() => {
    setVisible(false);
    sessionStorage.setItem('popup_dismissed', 'true');
  }, []);

  const next = () => setCurrent((p) => (p + 1) % popups.length);
  const prev = () => setCurrent((p) => (p - 1 + popups.length) % popups.length);

  if (popups.length === 0) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4"
          onClick={dismiss}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ type: 'spring', damping: 25, stiffness: 260 }}
            className="relative max-w-sm w-full bg-white shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={dismiss} className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/90 flex items-center justify-center hover:bg-white transition-colors">
              <HiX className="w-4 h-4" />
            </button>

            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -60 }}
                transition={{ duration: 0.25 }}
                className="aspect-square bg-[#F5F5F5]"
              >
                {popups[current].link ? (
                  <a href={popups[current].link} target="_blank" rel="noopener noreferrer">
                    <img src={popups[current].image} alt="" className="w-full h-full object-cover cursor-pointer" />
                  </a>
                ) : (
                  <img src={popups[current].image} alt="" className="w-full h-full object-cover" />
                )}
              </motion.div>
            </AnimatePresence>

            {popups.length > 1 && (
              <>
                <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 flex items-center justify-center hover:bg-white transition-colors">
                  <HiChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 flex items-center justify-center hover:bg-white transition-colors">
                  <HiChevronRight className="w-4 h-4" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {popups.map((_, i) => (
                    <button key={i} onClick={(e) => { e.stopPropagation(); setCurrent(i); }} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === current ? 'bg-white' : 'bg-white/40'}`} />
                  ))}
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
