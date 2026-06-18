'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getBlogPost } from '@/lib/supabaseServices';

export default function BlogPostPage() {
  const params = useParams();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.slug) {
      getBlogPost(params.slug as string).then((data) => {
        if (data) setPost(data);
        setLoading(false);
      });
    }
  }, [params.slug]);

  if (loading) return <div className="pt-16 md:pt-20 min-h-screen flex items-center justify-center"><p className="text-xs opacity-40">Loading...</p></div>;
  if (!post) return <div className="pt-16 md:pt-20 min-h-screen flex items-center justify-center"><p className="text-xs opacity-40">Post not found</p></div>;

  return (
    <div className="pt-16 md:pt-20 min-h-screen bg-[#F9F9F9]">
      <div className="container-site py-8 max-w-3xl mx-auto">
        <Link href="/blog" className="text-[10px] uppercase tracking-[0.2em] opacity-40 hover:opacity-100 inline-block mb-6">← Back to Blog</Link>

        <article className="bg-white border border-[#DDDDDD]">
          {post.image && (
            <div className="aspect-[2/1] overflow-hidden">
              <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="p-6 md:p-10">
            <div className="flex flex-wrap gap-2 mb-4">
              {(post.tags || []).map((tag: string) => (
                <span key={tag} className="text-[10px] uppercase tracking-[0.1em] px-2 py-1 bg-[#F5F5F5]">{tag}</span>
              ))}
            </div>
            <p className="text-[10px] uppercase tracking-[0.2em] opacity-40 mb-3">
              {new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
            <h1 className="text-lg md:text-2xl tracking-[0.2em] font-normal mb-6">{post.title}</h1>
            {post.excerpt && <p className="text-xs opacity-60 mb-6">{post.excerpt}</p>}
            <div className="text-xs leading-relaxed space-y-4" dangerouslySetInnerHTML={{ __html: post.content }} />
          </div>
        </article>
      </div>
    </div>
  );
}
