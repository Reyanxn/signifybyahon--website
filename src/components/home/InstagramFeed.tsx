'use client';

import { motion } from 'framer-motion';

const posts = Array.from({ length: 6 }, (_, i) => ({ id: i + 1 }));

export default function InstagramFeed() {
  return (
    <section className="section-spacing">
      <div className="container-site text-center mb-8">
        <p className="text-[10px] uppercase tracking-[0.3em] opacity-40 mb-2">Follow Us</p>
        <p className="text-xs uppercase tracking-[0.2em]">@signifybyahon</p>
      </div>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-0">
        {posts.map((post, i) => (
          <motion.a
            key={post.id}
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="aspect-square bg-[#F5F5F5] block"
          />
        ))}
      </div>
    </section>
  );
}
