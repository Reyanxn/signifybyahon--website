'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';

export default function BlogPreview() {
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    supabase.from('blogs').select('*').eq('published', true).order('created_at', { ascending: false }).limit(3).then(({ data }) => {
      if (data) setPosts(data);
    });
  }, []);

  if (posts.length === 0) return null;

  return (
    <section className="section-spacing">
      <div className="container-site">
        <div className="text-center mb-10">
          <p className="text-[10px] uppercase tracking-[0.3em] opacity-40 mb-2">Our Blog</p>
          <h2 className="text-lg md:text-xl tracking-[0.2em] font-normal">Latest from the Journal</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((post, i) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={`/blog/${post.slug}`} className="group block">
                <div className="aspect-[4/3] bg-[#F5F5F5] mb-4 overflow-hidden">
                  {post.image ? <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : null}
                </div>
                <p className="text-[10px] uppercase tracking-[0.2em] opacity-40 mb-2">
                  {new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
                <h3 className="text-xs uppercase tracking-[0.2em] group-hover:opacity-60 transition-opacity">{post.title}</h3>
                {post.excerpt && <p className="text-xs opacity-60 mt-2 line-clamp-2">{post.excerpt}</p>}
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
