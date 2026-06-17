'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { HiEye, HiEyeOff } from 'react-icons/hi';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

export default function AuthPage() {
  const router = useRouter();
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const update = (f: string, v: string) => setForm((p) => ({ ...p, [f]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
        toast.success('Welcome back!');
      } else {
        await register(form.email, form.password, form.name);
        toast.success('Account created!');
      }
      router.push('/account');
    } catch (err: any) {
      toast.error(err.message?.replace('Firebase: ', '') || 'An error occurred');
    }
    setLoading(false);
  };

  return (
    <div className="pt-16 md:pt-20 min-h-screen bg-[#F9F9F9] flex items-center">
      <div className="container-site max-w-md mx-auto">
        <div className="border border-[#DDDDDD] bg-white p-8">
          <div className="text-center mb-8">
            <h1 className="text-sm uppercase tracking-[0.2em]">{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] opacity-40 mt-2">
              {mode === 'login' ? 'Sign in to your account' : 'Join the community'}
            </p>
          </div>

          <div className="flex mb-8 bg-[#F9F9F9] p-0.5">
            {(['login', 'register'] as const).map((m) => (
              <button key={m} onClick={() => { setMode(m); setForm({ name: '', email: '', phone: '', password: '' }); }}
                className={`flex-1 py-2.5 text-[10px] uppercase tracking-[0.2em] transition-all ${
                  mode === m ? 'bg-white border border-[#DDDDDD]' : 'opacity-40 hover:opacity-70'
                }`}
              >{m === 'login' ? 'Sign In' : 'Register'}</button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.form key={mode} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && <input placeholder="Full Name" value={form.name} onChange={(e) => update('name', e.target.value)} required className="input-field text-xs" />}
              <input placeholder="Email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required className="input-field text-xs" />
              {mode === 'register' && <input placeholder="Phone" value={form.phone} onChange={(e) => update('phone', e.target.value)} className="input-field text-xs" />}
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} placeholder="Password" value={form.password} onChange={(e) => update('password', e.target.value)} required className="input-field text-xs pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40">
                  {showPassword ? <HiEyeOff className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
                </button>
              </div>
              <Button type="submit" size="lg" className="w-full text-[10px]" loading={loading}>
                {mode === 'login' ? 'Sign In' : 'Create Account'}
              </Button>
            </motion.form>
          </AnimatePresence>

          <p className="mt-6 text-center text-[10px] uppercase tracking-[0.1em] opacity-40">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="underline hover:opacity-100">
              {mode === 'login' ? 'Register' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
