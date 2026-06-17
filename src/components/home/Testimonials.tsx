'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiStar } from 'react-icons/hi';

const testimonials = [
  { id: 1, name: 'Sadia Rahman', location: 'Dhaka', rating: 5, text: 'Absolutely love the quality! The fabric is so soft and the stitching is perfect.' },
  { id: 2, name: 'Taslima Begum', location: 'Chittagong', rating: 5, text: 'The outfit exceeded my expectations. The color is exactly as shown.' },
  { id: 3, name: 'Nusrat Jahan', location: 'Sylhet', rating: 4, text: 'Beautiful collection with great attention to detail. Highly recommend!' },
];

export default function Testimonials() {
  const [current, setCurrent] = useState(0);

  return (
    <section className="section-spacing bg-[#F9F9F9]">
      <div className="container-site text-center max-w-2xl mx-auto">
        <p className="text-[10px] uppercase tracking-[0.3em] opacity-40 mb-4">Testimonials</p>
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="flex justify-center mb-6">
              {Array.from({ length: testimonials[current].rating }).map((_, i) => (
                <HiStar key={i} className="w-4 h-4" />
              ))}
            </div>
            <blockquote className="text-sm md:text-base opacity-70 leading-relaxed mb-6 italic">
              &ldquo;{testimonials[current].text}&rdquo;
            </blockquote>
            <p className="text-xs uppercase tracking-[0.2em]">{testimonials[current].name}</p>
            <p className="text-[10px] uppercase tracking-[0.2em] opacity-40 mt-1">{testimonials[current].location}</p>
          </motion.div>
        </AnimatePresence>
        <div className="flex items-center justify-center gap-2 mt-8">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-8 h-[2px] transition-all ${i === current ? 'bg-[#1C1C1C]' : 'bg-[#DDDDDD]'}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
