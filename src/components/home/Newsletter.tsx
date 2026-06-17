'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

export default function Newsletter() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success('Subscribed successfully!');
    setEmail('');
  };

  return (
    <section className="section-spacing bg-[#1C1C1C] text-white">
      <div className="container-site text-center max-w-md mx-auto">
        <p className="text-[10px] uppercase tracking-[0.3em] opacity-60 mb-4">Stay Updated</p>
        <p className="text-sm uppercase tracking-[0.2em] mb-6">Join Our Newsletter</p>
        <form onSubmit={handleSubmit} className="flex border border-white/20">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="flex-1 px-4 py-3 bg-transparent text-white text-xs placeholder-white/40 focus:outline-none"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-white text-[#1C1C1C] text-[10px] uppercase tracking-[0.2em] hover:opacity-90 transition-opacity"
          >
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}
