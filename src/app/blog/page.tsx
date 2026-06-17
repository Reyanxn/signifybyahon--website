'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';

export default function BlogPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('blogs').select('*').eq('published', true).order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setPosts(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="pt-16 md:pt-20">
      <div className="section-spacing bg-[#F9F9F9] text-center">
        <div className="container-site">
          <p className="text-[10px] uppercase tracking-[0.3em] opacity-40 mb-2">Our Journal</p>
          <h1 className="text-2xl md:text-3xl tracking-[0.2em] font-normal">Blog</h1>
        </div>
      </div>
      <div className="container-site py-12">
        {loading ? (
          <p className="text-xs opacity-40 text-center py-20">Loading posts...</p>
        ) : posts.length === 0 ? (
          <p className="text-xs opacity-40 text-center py-20 uppercase tracking-[0.2em]">No posts yet</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, i) => (
              <motion.article key={post.id} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.03 }}>
                <Link href={`/blog/${post.slug}`} className="group block">
                  <div className="aspect-[4/3] bg-[#F5F5F5] mb-4 overflow-hidden">
                    {post.image ? <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : null}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {(post.tags || []).slice(0, 3).map((tag: string) => (<span key={tag} className="text-[10px] uppercase tracking-[0.1em] px-2 py-1 bg-[#F5F5F5]">{tag}</span>))}
                  </div>
                  <p className="text-[10px] uppercase tracking-[0.2em] opacity-40 mb-2">
                    {new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                  <h2 className="text-xs uppercase tracking-[0.2em] group-hover:opacity-60 transition-opacity">{post.title}</h2>
                  {post.excerpt && <p className="text-xs opacity-60 mt-2 line-clamp-2">{post.excerpt}</p>}
                </Link>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
